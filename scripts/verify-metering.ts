import prisma from "../src/lib/prisma";

async function main() {
  console.log("🚀 Starting Metering Verification...");

  // 1. Setup Data
  const asset = await prisma.asset.create({
    data: {
      name: `Test Generator ${Date.now()}`,
      category: {
        create: {
          name: `Test Gen Category ${Date.now()}`,
          type: "MACHINERIES",
        },
      },
    },
  });
  console.log("✅ Created Asset:", asset.id);

  const meter = await prisma.meter.create({
    data: {
      name: "Gen Run Hours",
      type: "CUMULATIVE",
      unit: "Hours",
      assetId: asset.id,
    },
  });
  console.log("✅ Created Meter:", meter.id);

  // 2. Setup Preventive & Trigger (Every 100 Hours)
  const preventive = await prisma.preventive.create({
    data: {
      code: `PREV-${Date.now()}`,
      name: "Oil Change",
      description: "Change oil every 100 hours",
      frequency: "CUSTOM",
      nextRun: new Date(),
      site: {
        create: {
          name: `Test Complex ${Date.now()}`,
          code: `CPX-TEST-${Date.now()}`,
          site: {
            create: {
              name: `Test Site ${Date.now()}`,
              address: {
                create: {
                  street: `T-${Date.now()}`,
                  city: "L",
                  state: "Lagos",
                },
              },
            },
          },
        },
      },
    },
  });

  const trigger = await prisma.meterMaintenanceTrigger.create({
    data: {
      meterId: meter.id,
      preventiveId: preventive.id,
      condition: "EVERY_X_UNITS",
      triggerValue: 100,
      lastTriggerReading: 0,
    },
  });
  console.log("✅ Created Trigger (Every 100 units)");

  // 3. Test: Low Reading (Should NOT trigger)
  // We need to use the Service logic, but here we can't easily import the Service class
  // if it's not exported for scripts. Ideally we test via API or import class.
  // Let's rely on importing the Service class since we are in same repo.

  const { ReadingService } = require("../src/modules/metering/reading.service");
  const service = new ReadingService();

  console.log("👉 Posting Reading: 50 (Expected: No Trigger)");
  await service.recordReading({
    meterId: meter.id,
    value: 50,
    source: "MANUAL",
  });

  let count = await prisma.maintenance.count({
    where: { description: { contains: "Oil Change" } },
  });
  if (count !== 0) throw new Error("❌ Maintenance created prematurely!");
  console.log("✅ Verification Passed: No maintenance created.");

  // 4. Test: High Reading (Should Trigger)
  console.log("👉 Posting Reading: 105 (Expected: Trigger!)");
  // Delta is 105 - 0 = 105 >= 100.
  await service.recordReading({
    meterId: meter.id,
    value: 105,
    source: "MANUAL",
  });

  count = await prisma.maintenance.count({
    where: { description: { contains: "Oil Change" } },
  });
  if (count !== 1) throw new Error(`❌ Expected 1 Maintenance, found ${count}`);

  console.log("✅ SUCCESS: Maintenance auto-created from Meter Reading!");

  // Cleanup
  await prisma.meter.delete({ where: { id: meter.id } });
  await prisma.asset.delete({ where: { id: asset.id } });
  await prisma.preventive.delete({ where: { id: preventive.id } });
}

main()
  .catch((e) => {
    console.error("❌ Verification Failed:");
    const fs = require("fs");
    fs.writeFileSync("error.log", JSON.stringify(e, null, 2));
    if (e.meta) console.error("Meta:", e.meta);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
