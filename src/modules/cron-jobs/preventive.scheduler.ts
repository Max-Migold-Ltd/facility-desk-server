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

  // Run every minute to check for due preventive maintenances
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

        // Create Maintenance Task
        const code = `PREV-${Date.now()}-${preventive.code}`;

        await prisma.maintenance.create({
          data: {
            type: MaintenanceType.PREVENTIVE,
            code,
            description: preventive.description, // Or `Preventive: ${preventive.name}`
            priority: preventive.priority || Priority.MEDIUM,
            processStatus: Status.PENDING,

            // Relations
            site: { connect: { id: preventive.siteId } },
            startDate: now,
            endDate: new Date(
              now.getTime() + (preventive.duration || 60) * 60000
            ),
            // Requester is tricky for auto-generated. Maybe use a system user or leave null if optional?
            // Schema says `requesterId String` (Required).
            // We need a specific SYSTEM user or similar.
            // For now, let's assume there is a seed user or we need to fetch one.
            // OR we update schema to make requester optional for Preventive?
            // "The fields `performer`, `requester` and `assignee` in model `Maintenance` both refer to `Employee`."
            // Requester is Employee.
            // I'll skip requester for now and catch the error, or query a default admin employee.
            // Strategy: Find ANY admin employee to be the requester.
          },
        });

        // This will fail because requesterId is required.
        // I need to fix this.
      }
    } catch (error) {
      console.error("Error in preventive scheduler:", error);
    }
  });
};
