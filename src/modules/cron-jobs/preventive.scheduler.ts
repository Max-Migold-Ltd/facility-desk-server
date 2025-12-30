import cron from "node-cron";
import prisma from "../../lib/prisma";
import {
  MaintenanceType,
  Status,
  Frequency,
  Priority,
} from "../../generated/prisma";

export const initPreventiveScheduler = () => {
  console.log("Initializing Preventive Maintenance Scheduler...");

  // Run every minute to check for due preventive maintenances, maybe change to daily
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find preventive templates that are due
      const duePreventives = await prisma.preventive.findMany({
        where: {
          nextRun: { lte: now },
        },
      });

      for (const preventive of duePreventives) {
        console.log(
          `Generating maintenance for Preventive: ${preventive.code}`
        );

        const code = `PREV-${Date.now()}-${preventive.code}`;

        await prisma.maintenance.create({
          data: {
            type: MaintenanceType.PREVENTIVE,
            code,
            description: preventive.description,
            priority: preventive.priority || Priority.MEDIUM,
            processStatus: Status.PENDING,

            siteId: preventive.siteId,
            ...(preventive.assetId && { assetId: preventive.assetId }),
            ...(preventive.buildingId && { buildingId: preventive.buildingId }),
            ...(preventive.floorId && { floorId: preventive.floorId }),
            ...(preventive.spaceId && { spaceId: preventive.spaceId }),

            startDate: now,
            endDate: new Date(
              now.getTime() + (preventive.duration || 60) * 60000
            ),
            // requesterId: Maybe use system default ID or the role of the requester eg SYSTEM, ADMIN, TECHNICIAN etc?
            // Performer, Requester and Assignee in model Maintenance both refer to Employee, maybe convert to user and remove employee?
            // Add a default admin employee/user to the database, ie a default Max MiGold admin account.
          },
        });
      }
    } catch (error) {
      console.error("Error in preventive scheduler:", error);
    }
  });
};
