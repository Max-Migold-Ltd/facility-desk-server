import mqtt from "mqtt";
import prisma from "../../lib/prisma";

export class MQTTService {
  private client: mqtt.MqttClient;

  constructor() {
    this.client = mqtt.connect("mqtt://localhost:1883");
    this.client.on("connect", () => {
      console.log("✓ MQTT Client connected");
      // 2. Subscribe to all meters
      // Topic pattern: "meters/{meter_id}/telemetry"
      this.client.subscribe("meters/#", (err) => {
        if (!err) {
          console.log("✓ MQTT Client subscribed to all meters");
        }
      });
    });
  }

  async processTelemetry(deviceId: string, data: any) {
    // Data format: { kwh: 5001.5, volts: 220, amps: 5.5 }

    // 1. Find the Meter in DB
    const meter = await prisma.meter.findUnique({
      where: { deviceId }, // Ensure you added this field to schema
    });

    if (!meter) return;

    // 2. Calculate Usage & Cost (Server-Side Metering Logic)
    // We compare new kWh with the last recorded kWh to find usage since last ping
    const lastLog = await prisma.meterTelemetry.findFirst({
      where: { meterId: meter.id },
      orderBy: { timestamp: "desc" },
    });

    let costDeducted = 0;
    if (lastLog) {
      const kwhUsed = Number(data.kwh) - Number(lastLog.kwh);
      if (kwhUsed > 0) {
        costDeducted = kwhUsed * Number(meter.tariffRate);
      }
    }

    // 3. Update Meter State (Realtime Snapshot)
    await prisma.meter.update({
      where: { id: meter.id },
      data: {
        currentPower:
          data.power || (Number(data.volts) * Number(data.amps)) / 1000,
        currentVoltage: data.volts,
        // Deduct balance automatically
        currentBalance: { decrement: costDeducted },
      },
    });

    // 4. Log History (Telemetry)
    // Optimization: Only log every 15 mins or if value changes significantly
    await prisma.meterTelemetry.create({
      data: {
        meterId: meter.id,
        kwh: data.kwh,
        voltage: data.volts,
        current: data.amps,
        power: data.power,
      },
    });

    // 5. Trigger ALERTS
    this.checkAlerts(meter, costDeducted);
  }

  private async checkAlerts(meter: any, latestCost: number) {
    // Low Balance Check
    const newBalance = Number(meter.currentBalance) - latestCost;

    if (newBalance < Number(meter.lowBalanceLimit)) {
      // Send Notification: "Warning: You have NGN 400 left."
      console.log(`[ALERT] Meter ${meter.name} is Low Balance!`);
    }

    if (newBalance <= 0) {
      // Auto-Disconnect Logic
      this.client.publish(
        `meters/${meter.deviceId}/command`,
        JSON.stringify({ state: "OFF" }),
      );
      console.log(`[ACTION] Meter ${meter.name} Disconnected (Zero Balance)`);
    }
  }

  //   Listen for wehooks from paystack
  async topUpMeter(userId: string, meterId: string, amount: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Payment Record
      await tx.utilityPayment.create({
        data: {
          amount,
          meterId,
          paidByUserId: userId,
          transactionRef: `TX-${Date.now()}`, // Or real Ref from Paystack
        },
      });

      // 2. Update Meter Balance
      const updatedMeter = await tx.meter.update({
        where: { id: meterId },
        data: {
          currentBalance: { increment: amount },
        },
      });

      // 3. Check if we need to Reconnect
      // If balance was negative/zero and is now positive, send "ON" command
      if (updatedMeter.currentBalance.toNumber() > 0) {
        // mqttService.publish(`meters/${updatedMeter.deviceId}/command`, { state: "ON" })
      }

      return updatedMeter;
    });
  }
}
