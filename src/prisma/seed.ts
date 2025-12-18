import { AccessLevel } from "../generated/prisma/client";
import { hashPassword } from "../utils/password.util";
import prisma from "../lib/prisma";

// Roles requested by User
const ROLES = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
  REQUESTER: "Requester",
  // Functional Roles
  FACILITY_MANAGER: "Facility Manager",
  ASSISTANT_FM: "Assistant Facility Manager",
  MAINTENANCE_SUPERVISOR: "Maintenance Supervisor",
  MAINTENANCE_TECHNICIAN_MECH: "Maintenance Technician (Mechanical)",
  MAINTENANCE_TECHNICIAN_ELEC: "Maintenance Technician (Electrical)",
  MAINTENANCE_TECHNICIAN_CIVIL: "Maintenance Technician (Civil)",
  ASSET_MANAGER: "Asset Manager",
  HSE_OFFICER: "HSE Officer",
  ENERGY_MANAGER: "Energy Manager",
  SECURITY_MANAGER: "Security Manager",
  CLEANING_MANAGER: "Cleaning Manager",
  FRONT_DESK: "Front Desk Agent",
  PROCUREMENT: "Procurement Officer",
  VENDOR: "Vendor",
};

// Resource list for permissions
const RESOURCES = [
  "Access control device",
  "Accessory",
  "Accounting movement",
  "Analytical accounting",
  "Article",
  "Asset",
  "Asset model",
  "Category",
  "Consumable",
  "Facility",
  "Location",
  "Maintenance",
  "Manufacturer",
  "Supplier",
  "User",
  "Role",
  "Permission",
  "Report",
];

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create all roles
  console.log("\n📋 Creating roles...");

  const rolesMap = new Map<string, string>(); // Name -> Id

  for (const [key, roleName] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName }, // Now referencing String name directly
      update: {},
      create: {
        name: roleName,
        description: `Role for ${roleName}`,
        isSystem: ["SUPER_ADMIN", "ADMIN", "USER", "REQUESTER"].includes(key),
      },
    });
    rolesMap.set(roleName, role.id);
    console.log(`✓ Created ${roleName}`);
  }

  // 2. Assign Permissions (Simplified Logic for now)
  // Super Admin / Admin -> ALL WRITE
  const adminRoleIds = [
    rolesMap.get(ROLES.SUPER_ADMIN),
    rolesMap.get(ROLES.ADMIN),
  ];

  for (const roleId of adminRoleIds) {
    if (!roleId) continue;
    for (const resource of RESOURCES) {
      await prisma.permission.upsert({
        where: { roleId_resource: { roleId, resource } },
        update: { accessLevel: AccessLevel.WRITE },
        create: { roleId, resource, accessLevel: AccessLevel.WRITE },
      });
    }
  }
  console.log("✓ Assigned Full Access to Admins");

  // Facility Manager -> ALL WRITE/READ
  // Technician -> Maintenance WRITE, Asset READ
  // Requester -> Maintenance READ/CREATE (handled by API logic mostly)

  // 3. Create default admin user with SUPER_ADMIN role
  console.log("\n👨‍💼 Creating default admin user...");
  const hashedPassword = await hashPassword("Admin@123");

  // Check if Admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@facilitydesk.com" },
  });

  if (existingAdmin) {
    // Ensure roles
    // For M:N, we connect if not present.
    // But upsert on m:n is tricky. simpler to update.
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        roleId: rolesMap.get(ROLES.SUPER_ADMIN),
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email: "admin@facilitydesk.com",
        password: hashedPassword,
        firstName: "System",
        lastName: "Administrator",
        status: "ACTIVE",
        roleId: rolesMap.get(ROLES.SUPER_ADMIN)!,
      },
    });
  }

  console.log("✓ Created/Updated default admin user");
  console.log("  📧 Email: admin@facilitydesk.com");
  console.log("  🔑 Password: Admin@123");

  console.log("\n✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("\n❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
