import prisma from "../../lib/prisma";
import { Prisma } from "../../generated/prisma";

export class ReadingService {
  /**
   * Record a new reading and check for triggers
   */
  async recordReading(data: Prisma.MeterReadingCreateInput) {
    // 1. Create the reading
    const reading = await prisma.meterReading.create({
      data,
      include: { meter: true },
    });

    // 2. Check and process triggers (Async, don't block response?)
    // For now, let's await it to ensure consistency during dev
    await this.processTriggers(reading);

    return reading;
  }

  /**
   * Process Maintenance Triggers for a given reading
   */
  private async processTriggers(reading: any) {
    // Fetch active triggers for this meter
    const triggers = await prisma.meterMaintenanceTrigger.findMany({
      where: { meterId: reading.meterId },
      include: { preventive: true },
    });

    for (const trigger of triggers) {
      if (reading.meter.type === "CUMULATIVE") {
        await this.handleCumulativeTrigger(trigger, reading);
      } else if (reading.meter.type === "GAUGE") {
        await this.handleGaugeTrigger(trigger, reading);
      }
    }
  }

  private async handleCumulativeTrigger(trigger: any, reading: any) {
    if (trigger.condition !== "EVERY_X_UNITS") return;

    const last = Number(trigger.lastTriggerReading || 0);
    const current = Number(reading.value);
    const threshold = Number(trigger.triggerValue);

    // e.g. Last: 1000, Current: 2050, Threshold: 1000. Diff = 1050. Trigger!
    if (current - last >= threshold) {
      console.log(
        `[Trigger] Meter ${trigger.meterId} hit cumulative threshold. Spawning Maintenance.`,
      );

      await this.spawnMaintenance(trigger);

      // Update last trigger reading (Snap to the multiple or current?)
      // Usually, we just mark that we triggered at 'current'.
      await prisma.meterMaintenanceTrigger.update({
        where: { id: trigger.id },
        data: { lastTriggerReading: current },
      });
    }
  }

  private async handleGaugeTrigger(trigger: any, reading: any) {
    const current = Number(reading.value);
    const threshold = Number(trigger.triggerValue);
    let shouldTrigger = false;

    if (trigger.condition === "ABOVE_THRESHOLD" && current > threshold) {
      shouldTrigger = true;
    } else if (trigger.condition === "BELOW_THRESHOLD" && current < threshold) {
      shouldTrigger = true;
    }

    if (shouldTrigger) {
      // Debounce: Check if there is already a PENDING/IN_PROGRESS maintenance
      // generated from this preventive for this asset/meter?
      // For simplicity now, we just spawn. In prod, check active works.
      await this.spawnMaintenance(trigger);
    }
  }

  private async spawnMaintenance(trigger: any) {
    // Use the Preventive template to create a Maintenance
    // This logic mimics what the Scheduler would do.
    // Ideally, extract this to MaintenanceService.createFromPreventive(id)

    // For now, direct creation:
    const prev = trigger.preventive;

    await prisma.maintenance.create({
      data: {
        code: `M-AUTO-${Date.now()}`, // Simple Code Gen
        description: `Auto-Triggered: ${prev.name}`,
        type: "PREDICTIVE", // or PREVENTIVE
        processStatus: "PENDING",
        priority: prev.priority,
        siteId: prev.siteId,
        buildingId: prev.buildingId,
        floorId: prev.floorId,
        // zone: prev.zoneId ? { connect: { id: prev.zoneId } } : undefined,
        spaceId: prev.spaceId,
        assetId: prev.assetId,
        teamId: prev.teamId,
        // Link config
        prevMaintenanceConfigId: prev.id,
      },
    });
  }
}
