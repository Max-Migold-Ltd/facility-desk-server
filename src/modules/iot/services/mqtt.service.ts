import mqtt from "mqtt";
import crypto from "crypto";
import prisma from "../../../lib/prisma";
import { NotFoundError } from "../../../errors";

// connect to a meter
// Disconnect from a meter when balance is low(0 or less)
// Dual tariff management(phcn and generator power)
// real time deduction

export class MQTTService {
  private client: mqtt.MqttClient;

  private globalConfig = {
    currentPowerSource: "GRID",
    gridTariff: 225.00,
    genTariff: 450.00,
  };

  constructor() {
    this.initGlobalConfig();

    // const brokerUrl = process.env.NODE_ENV === "production" ? "mqtts://localhost:8883" : "mqtts://143.105.173.29:8883";
    this.client = mqtt.connect("mqtts://143.105.173.29:8883", {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      clientId: process.env.MQTT_CLIENT_ID,
      clean: true,
      rejectUnauthorized: false
    });
    this.client.on("connect", () => {
      console.log("✓ MQTT Client connected");
      // 2. Subscribe to all meters
      // Topic pattern: "meters/{deviceId}/telemetry"
      this.client.subscribe("meters/+/telemetry", (err) => {
        if (!err) {
          console.log("✓ MQTT Client subscribed to all meters");
        }
      });
      this.client.subscribe("system/power_status");
    });

    this.client.on("message", (topic, payload) => {
      const data = JSON.parse(payload.toString());

      if (topic === "system/power_status") {
        this.processPowerSourceChange(data);
      } else if (topic.startsWith("meters/")) {
        const deviceId = topic.split("/")[1];
        this.processTelemetry(deviceId, data);
      }
    });
  }

  private async initGlobalConfig() {
    let config = await prisma.systemConfig.findUnique({
      where: { id: "GLOBAL_CONFIG" }
    });

    // Seed the database if it's the first time running
    if (!config) {
      config = await prisma.systemConfig.create({
        data: { id: "GLOBAL_CONFIG" }
      });
    }

    this.globalConfig = {
      currentPowerSource: config.currentPowerSource,
      gridTariff: Number(config.gridTariff),
      genTariff: Number(config.genTariff),
    };
    console.log("✓ Global Tariff Config Loaded:", this.globalConfig);
  }

  private async disconnectMeter(meterid: string) {
    this.client.publish(`meters/${meterid}/command`, JSON.stringify({ state: "OFF" }));
    console.log(`[ACTION] Meter ${meterid} Disconnected`);
  }

  private async connectMeter(meterid: string) {
    this.client.publish(`meters/${meterid}/command`, JSON.stringify({ state: "ON" }));
    console.log(`[ACTION] Meter ${meterid} Connected`);
  }
  async processPowerSourceChange(data: { source: "GRID" | "GENERATOR" }) {
    // 1. Update the Database
    await prisma.systemConfig.update({
      where: { id: "GLOBAL_CONFIG" },
      data: { currentPowerSource: data.source }
    });

    // 2. Update the Memory Cache instantly
    this.globalConfig.currentPowerSource = data.source;

    console.log(`[SYSTEM] Power source switched to ${data.source}`);
  }
  async processTelemetry(deviceId: string, data: any) {
    try {
      const meter = await prisma.meter.findUnique({
        where: { deviceId },
      });

      if (!meter) {
        console.warn(`⚠️  [DB] Meter with deviceId '${deviceId}' not found in database. Ignoring telemetry.`);
        return;
      }

      console.log(`✅ [DB] Meter found: ${meter.name}. Processing billing...`);

      const lastLog = await prisma.meterTelemetry.findFirst({
        where: { meterId: meter.id },
        orderBy: { timestamp: "desc" },
      });

      let costDeducted = 0;
      if (lastLog) {
        let kwhUsed = Number(data.kwh) - Number(lastLog.kwh);

        // Hardware Reset Protection
        if (kwhUsed < 0) kwhUsed = Number(data.kwh);

        if (kwhUsed > 0) {
          // Read directly from RAM, no database hit required for pricing
          const activeTariff = this.globalConfig.currentPowerSource === "GENERATOR"
            ? this.globalConfig.genTariff
            : this.globalConfig.gridTariff;

          costDeducted = kwhUsed * activeTariff;
          console.log(`💰 [BILLING] Used: ${kwhUsed}kWh | Tariff: ₦${activeTariff} | Deducting: ₦${costDeducted}`);
        }
      } else {
        console.log(`ℹ️  [BILLING] First telemetry log for this meter. No cost deducted yet.`);
      }

      // Update meter state & deduct balance
      await prisma.meter.update({
        where: { id: meter.id },
        data: {
          currentPower: data.power || (Number(data.volts) * Number(data.amps)) / 1000,
          currentVoltage: data.volts,
          currentBalance: { decrement: costDeducted },
        },
      });
      // Log History (Telemetry)
      await prisma.meterTelemetry.create({
        data: {
          meterId: meter.id,
          kwh: data.kwh,
          voltage: data.volts,
          current: data.amps,
          power: data.power,
        },
      });

      // Trigger ALERTS
      this.checkAlerts(meter, costDeducted);
    } catch (error) {
      console.error(`❌ [ERROR] processTelemetry failed for ${deviceId}:`, error);
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
      if (updatedMeter.currentBalance.toNumber() > 0) {
        await this.publishBalance(meterId, updatedMeter.currentBalance.toNumber());
      }

      return updatedMeter;
    });
  }

  async publishBalance(meterId: string, balance: number) {
    const meter = await prisma.meter.findUniqueOrThrow({
      where: { id: meterId },
    });
    // check if balance is zero or less
    if (balance <= 0) {
      this.client.publish(`meters/${meter.deviceId}/command`, JSON.stringify({ state: "OFF" }));
    }
    this.client.publish(`meters/${meter.deviceId}/balance`, JSON.stringify({ balance, state: "ON" }));
    // Send alwert that meter has been reconnected
    console.log(`[ACTION] Meter ${meter.name} Reconnected (Balance: ${balance})`);
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
}
