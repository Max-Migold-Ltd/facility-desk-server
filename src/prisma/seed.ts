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
        where: {
          roleId_resource_accessLevel: {
            roleId,
            resource,
            accessLevel: AccessLevel.WRITE,
          },
        },
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

  // ============================================================================
  // 2. COMPANY & ADDRESS
  // ============================================================================
  console.log("\n🏢 Seeding Companies...");

  const mainAddress = await prisma.address.create({
    data: {
      street: "123 Facility Lane",
      city: "Lagos",
      state: "Lagos", // Fixed: Used valid Enum value
      zipCode: "10001",
      latitude: 6.5244,
      longitude: 3.3792,
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

  const customerCompany = await prisma.company.upsert({
    where: { code: "CUST-001" },
    update: {},
    create: {
      code: "CUST-001",
      name: "Tech Solutions Ltd",
      type: CompanyType.CUSTOMER,
      description: "IT Services Client",
      addressId: mainAddress.id, // Simplifying by using same address for seed
    },
  });
  console.log(`   - Company: ${customerCompany.name}`);

  const supplierCompany = await prisma.company.upsert({
    where: { code: "SUP-001" },
    update: {},
    create: {
      code: "SUP-001",
      name: "Cooling Experts Inc",
      type: CompanyType.SUPPLIER,
      description: "HVAC Maintenance Provider",
      addressId: mainAddress.id,
    },
  });
  console.log(`   - Company: ${supplierCompany.name}`);

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
    {
      email: "client@techsolutions.com",
      firstName: "Alice",
      lastName: "Client",
      roleKey: "USER",
      employeeCode: "CUST-EMP-01",
      employeeType: EmployeeType.CUSTOMER_EMPLOYEE,
      companyId: customerCompany.id,
    },
    {
      email: "contractor@coolingexperts.com",
      firstName: "Bob",
      lastName: "Contractor",
      roleKey: "TECHNICIAN",
      employeeCode: "SUP-EMP-01",
      employeeType: EmployeeType.SUPPLIER_EMPLOYEE,
      companyId: supplierCompany.id,
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

      companyId: u.companyId || mainCompany.id,
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

  // Site Address
  const siteAddress = await prisma.address.create({
    data: {
      street: "1 Main St",
      city: "Lagos",
      state: "Lagos",
      zipCode: "10001",
    },
  });

  // Site
  // Since we cannot verify if Site exists by unique name easily without unique constraint,
  // we will just Create (or findFirst if we wanted to be safe, but create is fine for seed reset)
  // Note: Site name isn't unique in schema, but addressId is.
  // Ideally we check if address is used. For simplicity in seed, we'll assume fresh db or unique address.
  const site = await prisma.site.upsert({
    where: { addressId: siteAddress.id },
    update: {},
    create: {
      name: "Downtown Campus",
      addressId: siteAddress.id, // Fixed: Relation to Address
      description: "Main business campus",
      climateZone: "Tropical",
    },
  });

  // Complex
  const complex = await prisma.complex.upsert({
    where: { code: "CX-001" },
    update: {},
    create: {
      code: "CX-001",
      name: "Innovation Hub",
      siteId: site.id,
      availability: Availability.IN_USE,
      status: ServiceStatus.ACTIVE,
      // Fixed: Removed invalid address fields
    },
  });

  // Building
  const building = await prisma.building.upsert({
    where: { code: "BLD-A" }, // Fixed: Use unique code
    update: {},
    create: {
      name: "Building Alpha",
      code: "BLD-A",
      complexId: complex.id,
      mainUse: MainUse.OFFICE,
      totalFloors: 5,
      // Fixed: Removed addressId
    },
  });

  // Floor
  const floor = await prisma.floor.upsert({
    where: { code: "FL-01" }, // Fixed: Use unique code
    update: {},
    create: {
      name: "First Floor",
      code: "FL-01",
      level: 1,
      type: "office",
      buildingId: building.id,
      // Fixed: Removed complexId (it's inferred from Building)
    },
  });

  // Zone (NEW LAYER)
  const zone = await prisma.zone.upsert({
    where: { code: "ZN-01" },
    update: {},
    create: {
      name: "Zone Alpha",
      code: "ZN-01",
      type: "Wing A",
      floorId: floor.id,
    },
  });

  // Space
  const space = await prisma.space.upsert({
    where: { code: "RM-101" }, // Fixed: Use unique code
    update: {},
    create: {
      name: "Server Room",
      code: "RM-101",
      use: RoomUse.TECHNICAL_ROOM,
      zoneId: zone.id, // Fixed: Linked to Zone
      condition: Condition.GOOD,
      criticality: Priority.HIGH,
    },
  });
  console.log(
    `   - Location Path: ${site.name} -> ${complex.name} -> ${building.name} -> ${floor.name} -> ${zone.name} -> ${space.name}`,
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
      siteId: complex.id, // Fixed: ensure this maps to Complex as defined in Schema relation
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
    console.log(`   - Maintenance Request: ${maintenance.code}`);

    // In Progress Maintenance
    const inProgressMaint = await prisma.maintenance.upsert({
      where: { code: "WO-2023-002" },
      update: {},
      create: {
        code: "WO-2023-002",
        type: MaintenanceType.CORRECTIVE,
        description: "Leak reported in server room ceiling",
        priority: Priority.HIGH,
        siteId: complex.id,
        buildingId: building.id,
        floorId: floor.id,
        spaceId: space.id,
        requesterId: managerId,
        assigneeId: techId,
        processStatus: Status.IN_PROGRESS,
        execStart: new Date(),
        activityStartTime: new Date(),
      },
    });
    console.log(`   - Maintenance (In Progress): ${inProgressMaint.code}`);

    // Completed Maintenance with Metadata
    const completedMaint = await prisma.maintenance.upsert({
      where: { code: "WO-2023-003" },
      update: {},
      create: {
        code: "WO-2023-003",
        type: MaintenanceType.SMALL_PROJECT,
        description: "Install new shelving unit",
        priority: Priority.MEDIUM,
        siteId: complex.id,
        floorId: floor.id,
        spaceId: space.id,
        requesterId: managerId,
        assigneeId: techId,
        processStatus: Status.COMPLETED,
        execStart: new Date(Date.now() - 86400000), // Yesterday
        execEndDate: new Date(),
        outcome: "SATISFACTORY",
        processNotes: "Installation completed successfully. Client signed off.",
      },
    });
    console.log(`   - Maintenance (Completed): ${completedMaint.code}`);
  }

  // Client Request
  const clientUser = await prisma.user.findUnique({
    where: { email: "client@techsolutions.com" },
  });

  if (clientUser) {
    const clientReq = await prisma.maintenance.upsert({
      where: { code: "WO-2023-004" },
      update: {},
      create: {
        code: "WO-2023-004",
        type: MaintenanceType.SOFT_SERVICE,
        description: "Office cleaning request",
        priority: Priority.LOW,
        siteId: complex.id,
        buildingId: building.id,
        floorId: floor.id,
        requesterId: clientUser.id,
        processStatus: Status.PENDING,
      },
    });
    console.log(`   - Client Request: ${clientReq.code}`);
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
