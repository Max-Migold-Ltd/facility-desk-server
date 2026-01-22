import prisma from "../src/lib/prisma";

async function main() {
  console.log("🚀 Testing Maintenance Creation...");

  try {
    // 1. Create a dummy Complex
    const complex = await prisma.complex.create({
      data: {
        name: "Test Cpx Debug",
        code: `CPX-DBG-${Date.now()}`,
        site: {
          create: {
            name: "Test Site Debug",
            address: { create: { street: "X", city: "Y" } },
          },
        },
      },
    });
    console.log("✅ Created Complex:", complex.id);

    console.log("👉 Attempting Maintenance Create...");
    const m = await prisma.maintenance.create({
      data: {
        code: `M-DBG-${Date.now()}`,
        description: "Test Maintenance",
        siteId: complex.id,
        processStatus: "PENDING",
      },
    });
    console.log("✅ Created Maintenance:", m.id);
  } catch (e: any) {
    console.error("❌ Failed:");
    console.error(JSON.stringify(e, null, 2));
    process.exit(1);
  }
}

main().finally(() => prisma.$disconnect());
