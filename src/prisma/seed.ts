import {
  AccessLevel,
  UserStatus,
  ServiceStatus,
  Availability,
  Condition,
  MainUse,
  MaintenanceType,
  Priority,
  CompanyType,
  EmployeeType,
  Status,
  AssetCategoryType,
  Frequency,
  RoomUse,
} from "../generated/prisma";
import { hashPassword } from "../utils/password.util";
import prisma from "../lib/prisma";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const ROLES = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
  TECHNICIAN: "Technician",
  SITE_MANAGER: "Site Manager",
};

const RESOURCES = [
  "User",
  "Role",
  "Permission",
  "Company",
  "Employee",
  "Site",
  "Building",
  "Asset",
  "Maintenance",
  "Report",
];

const DEFAULT_PASSWORD = "Password@123";

async function main() {
  console.log("🌱 Starting database seed...");

  // ============================================================================
  // 1. ROLES & PERMISSIONS
  // ============================================================================
  console.log("\n🔐 Seeding Roles & Permissions...");
  const rolesMap = new Map<string, string>();

  for (const [key, roleName] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `Default role for ${roleName}`,
        isSystem: ["SUPER_ADMIN", "ADMIN"].includes(key),
      },
    });
    rolesMap.set(key, role.id);
    console.log(`   - Role: ${roleName}`);
  }

  // Assign full access to SUPER_ADMIN and ADMIN
  const adminRoleIds = [rolesMap.get("SUPER_ADMIN"), rolesMap.get("ADMIN")];
  for (const roleId of adminRoleIds) {
    if (!roleId) continue;
    for (const resource of RESOURCES) {
      await prisma.permission.upsert({
        where: { roleId_resource_accessLevel: { roleId, resource, accessLevel: AccessLevel.WRITE } },
        update: { accessLevel: AccessLevel.WRITE },
        create: { roleId, resource, accessLevel: AccessLevel.WRITE },
      });
    }
  }
  console.log("   - Assigned full permissions to Admins");

  // ============================================================================
  // 2. COMPANY & ADDRESS
  // ============================================================================
  console.log("\n🏢 Seeding Companies...");

  const mainAddress = await prisma.address.create({
    data: {
      street: "123 Facility Lane",
      city: "Tech City",
      state: "Innovation State",
      zipCode: "10001",
      latitude: 40.7128,
      longitude: -74.006,
    },
  });

  const mainCompany = await prisma.company.upsert({
    where: { code: "COMP-001" },
    update: {},
    create: {
      code: "COMP-001",
      name: "Facility Desk HQ",
      type: CompanyType.CORPORATE_GROUP,
      description: "Main Headquarters for Facility Desk Operations",
      addressId: mainAddress.id,
      email: "contact@facilitydesk.com",
      phone: "+1-555-0100",
      website: "https://facilitydesk.com",
    },
  });
  console.log(`   - Company: ${mainCompany.name}`);

  // ============================================================================
  // 3. USERS (Merged with Employee)
  // ============================================================================
  console.log("\n👥 Seeding Users & Employees...");
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  const usersData = [
    {
      email: "admin@facilitydesk.com",
      firstName: "Super",
      lastName: "Admin",
      roleKey: "SUPER_ADMIN",
      employeeCode: "EMP-001",
      employeeType: EmployeeType.INTERNAL_EMPLOYEE,
    },
    {
      email: "manager@facilitydesk.com",
      firstName: "Site",
      lastName: "Manager",
      roleKey: "SITE_MANAGER",
      employeeCode: "EMP-002",
      employeeType: EmployeeType.INTERNAL_EMPLOYEE,
    },
    {
      email: "tech@facilitydesk.com",
      firstName: "John",
      lastName: "Technician",
      roleKey: "TECHNICIAN",
      employeeCode: "EMP-003",
      employeeType: EmployeeType.INTERNAL_EMPLOYEE,
    },
  ];

  const usersMap = new Map<string, string>(); // Email -> Id

  for (const u of usersData) {
    const roleId = rolesMap.get(u.roleKey);
    if (!roleId) continue;

    const userData = {
      email: u.email,
      password: hashedPassword,
      firstName: u.firstName,
      lastName: u.lastName,
      roleId: roleId,
      status: UserStatus.ACTIVE,
      employeeCode: u.employeeCode,
      employeeType: u.employeeType,
      companyId: mainCompany.id,
      serviceStatus: ServiceStatus.ACTIVE,
    };

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: userData,
      create: userData,
    });

    usersMap.set(u.email, user.id);
    console.log(`   - User: ${u.email} (${u.roleKey})`);
  }

  // ============================================================================
  // 4. TEAMS
  // ============================================================================
  console.log("\n🛠️ Seeding Teams...");
  const techId = usersMap.get("tech@facilitydesk.com");
  const managerId = usersMap.get("manager@facilitydesk.com");

  if (techId && managerId) {
    await prisma.team.upsert({
      where: { code: "TEAM-HVAC" },
      update: {},
      create: {
        code: "TEAM-HVAC",
        name: "HVAC Specialists",
        description: "Handling all heating and cooling requests",
        supervisorId: managerId, // Now referencing User
        status: ServiceStatus.ACTIVE,
      },
    });
    console.log("   - Team: HVAC Specialists");
  }

  // ============================================================================
  // 5. SITES & LOCATIONS (The Hierarchy)
  // ============================================================================
  console.log("\n📍 Seeding Sites & Hierarchy...");

  // Site
  const site = await prisma.site.create({
    data: {
      name: "Downtown Campus",
      address: "Downtown Area",
      description: "Main business campus",
      climateZone: "Temperate",
    },
  });

  // Complex
  const complexAddress = await prisma.address.create({
    data: {
      street: "100 Tech Blvd",
      city: "Tech City",
      state: "IS",
      zipCode: "10002",
    },
  });

  const complex = await prisma.complex.upsert({
    where: { code: "CX-001" },
    update: {},
    create: {
      code: "CX-001",
      name: "Innovation Hub",
      siteId: site.id,
      availability: Availability.IN_USE,
      status: ServiceStatus.ACTIVE,
      address: "100 Tech Blvd",
      city: "Tech City",
      zipCode: "10002",
    },
  });

  // Building
  const buildingAddress = await prisma.address.create({
    data: {
      street: "100 Tech Blvd",
      city: "Tech City",
      state: "IS",
      zipCode: "10002",
    },
  });

  const building = await prisma.building.upsert({
    where: {
      complexId_code: {
        complexId: complex.id,
        code: "BLD-A",
      },
    },
    update: {},
    create: {
      name: "Building Alpha",
      code: "BLD-A",
      complexId: complex.id,
      addressId: buildingAddress.id,
      mainUse: MainUse.OFFICE,
      totalFloors: 5,
    },
  });

  // Floor
  const floor = await prisma.floor.upsert({
    where: {
      buildingId_code: {
        buildingId: building.id,
        code: "FL-01",
      },
    },
    update: {},
    create: {
      name: "First Floor",
      code: "FL-01",
      level: 1,
      type: "office",
      buildingId: building.id,
      complexId: complex.id,
    },
  });

  // Space
  const space = await prisma.space.upsert({
    where: {
      floorId_buildingId_code: {
        floorId: floor.id,
        buildingId: building.id,
        code: "RM-101",
      },
    },
    update: {},
    create: {
      name: "Server Room",
      code: "RM-101",
      use: RoomUse.TECHNICAL_ROOM,
      floorId: floor.id,
      buildingId: building.id,
      complexId: complex.id,
      condition: Condition.GOOD,
      criticality: Priority.HIGH,
    },
  });
  console.log(
    `   - Location Path: ${site.name} -> ${complex.name} -> ${building.name} -> ${floor.name} -> ${space.name}`
  );

  // ============================================================================
  // 6. ASSETS
  // ============================================================================
  console.log("\n📦 Seeding Assets...");

  // Asset Categories
  const hvacCat = await prisma.assetCategory.upsert({
    where: { name: "HVAC Systems" },
    update: {},
    create: {
      name: "HVAC Systems",
      type: AssetCategoryType.MACHINERIES,
      description: "Heating, Ventilation, and Air Conditioning",
    },
  });

  // Asset
  const asset = await prisma.asset.upsert({
    where: { tag: "AST-CHILLER-01" },
    update: {},
    create: {
      name: "Main Chiller Unit",
      tag: "AST-CHILLER-01",
      description: "Primary cooling unit for server room",
      categoryId: hvacCat.id,
      spaceId: space.id,
    },
  });
  console.log(`   - Asset: ${asset.name} (${asset.tag})`);

  // ============================================================================
  // 7. MAINTENANCE
  // ============================================================================
  console.log("\n🔧 Seeding Maintenance...");

  // Preventive Plan
  const preventive = await prisma.preventive.upsert({
    where: { code: "PM-HVAC-001" },
    update: {},
    create: {
      code: "PM-HVAC-001",
      name: "Monthly Chiller Inspection",
      description: "Check refrigerant levels and clean filters",
      frequency: Frequency.MONTHLY,
      nextRun: new Date(),
      priority: Priority.HIGH,
      siteId: complex.id,
      buildingId: building.id,
      floorId: floor.id,
      spaceId: space.id,
      assetId: asset.id,
      duration: 60,
    },
  });
  console.log(`   - Preventive Plan: ${preventive.name}`);

  // Corrective Maintenance Request
  if (techId && managerId) {
    const maintenance = await prisma.maintenance.upsert({
      where: { code: "WO-2023-001" },
      update: {},
      create: {
        code: "WO-2023-001",
        type: MaintenanceType.CORRECTIVE,
        description: "AC is making a loud rattling noise",
        priority: Priority.HIGH,
        siteId: complex.id,
        floorId: floor.id,
        spaceId: space.id,
        assetId: asset.id,
        requesterId: managerId, // User requested
        assigneeId: techId, // User assignee
        processStatus: Status.PENDING,
      },
    });
    console.log(`   - Maintenance Request: ${maintenance.code}`);
  }

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
