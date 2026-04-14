import mqtt from "mqtt";
import crypto from "crypto";
import prisma from "../../../lib/prisma";
import { NotFoundError } from "../../../errors";

export class MQTTService {
  private client: mqtt.MqttClient;

  constructor() {
    const brokerUrl = process.env.NODE_ENV === "production" ? "mqtts://localhost:8883" : "mqtt://localhost:1883";
    this.client = mqtt.connect(brokerUrl, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      clientId: process.env.MQTT_CLIENT_ID,
      clean: true
    });
    this.client.on("connect", () => {
      console.log("✓ MQTT Client connected");
      // 2. Subscribe to all meters
      // Topic pattern: "meters/{deviceId}/telemetry"
      this.client.subscribe("meters/#", (err) => {
        if (!err) {
          console.log("✓ MQTT Client subscribed to all meters");
        }
      });
    });

    this.client.on("message", (topic, payload) => {
      const data = JSON.parse(payload.toString());
      const deviceId = topic.split("/")[1];
      this.processTelemetry(deviceId, data);
    })
  }

  async processTelemetry(deviceId: string, data: any) {
    // Data format: { kwh: 5001.5, volts: 220, amps: 5.5 }

    // 1. Find the Meter in DB
    const meter = await prisma.meter.findUnique({
      where: { deviceId },
    });

    if (!meter) return new NotFoundError(`Meter with ID: ${deviceId}`);

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
    // Optimization: Only log every 15 mins? or if value changes significantly
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

  //   Listen for wehooks from paystack or whatever payment gateway
  async topUpMeter(userId: string, meterId: string, amount: number, transactionRef: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Payment Record
      await tx.utilityPayment.create({
        data: {
          amount,
          meterId,
          paidByUserId: userId,
          transactionRef
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
        this.client.publish(`meters/${updatedMeter.deviceId}/command`, JSON.stringify({ state: "ON" }));
        // Send alwert that meter has been reconnected
        console.log(`[ACTION] Meter ${updatedMeter.name} Reconnected (Balance: ${updatedMeter.currentBalance})`);
      }

      return updatedMeter;
    });
  }

  async generatePrepaidToken(amount: number, meterId: string, transactionRef: string) {
    await prisma.meter.findUniqueOrThrow({
      where: { id: meterId },
    });

    const tobeEncrypted = {
      meterId,
      amount,
      transactionRef,
      timestamp: new Date().toISOString(),
    }

    // Create encryption token using meterId as key
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(meterId), Buffer.from(transactionRef));
    let encrypted = cipher.update(JSON.stringify(tobeEncrypted), "utf-8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
  }

  async useToken(token: string, meterId: string){
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(meterId), Buffer.from(token));
    let decrypted = decipher.update(token, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    const data = JSON.parse(decrypted);
    
  }
}
