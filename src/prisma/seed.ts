import { RoleName, AccessLevel } from '../generated/prisma/client';
import { hashPassword } from '../utils/password.util';
import prisma from '../lib/prisma';

// Resource list for permissions
const RESOURCES = [
  'Access control device',
  'Accessory',
  'Accounting movement',
  'Analytical accounting',
  'Article',
  'Asset',
  'Asset model',
  'Category',
  'Consumable',
  'Facility',
  'Location',
  'Maintenance',
  'Manufacturer',
  'Supplier',
  'User',
  'Role',
  'Permission',
  'Report'
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create roles
  console.log('\n📋 Creating roles...');

  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: {
      name: RoleName.ADMIN,
      description: 'Administrator with full system access'
    }
  });
  console.log('✓ Created ADMIN role');

  const technicianRole = await prisma.role.upsert({
    where: { name: RoleName.TECHNICIAN },
    update: {},
    create: {
      name: RoleName.TECHNICIAN,
      description: 'Technician with maintenance and repair access'
    }
  });
  console.log('✓ Created TECHNICIAN role');

  const userRole = await prisma.role.upsert({
    where: { name: RoleName.USER },
    update: {},
    create: {
      name: RoleName.USER,
      description: 'Regular user with limited access'
    }
  });
  console.log('✓ Created USER role');

  // 2. Create permissions for ADMIN (WRITE access to all)
  console.log('\n🔐 Creating ADMIN permissions...');
  for (const resource of RESOURCES) {
    await prisma.permission.upsert({
      where: {
        roleId_resource: {
          roleId: adminRole.id,
          resource
        }
      },
      update: { accessLevel: AccessLevel.WRITE },
      create: {
        roleId: adminRole.id,
        resource,
        accessLevel: AccessLevel.WRITE
      }
    });
  }
  console.log(`✓ Created ${RESOURCES.length} permissions for ADMIN`);

  // 3. Create permissions for TECHNICIAN
  console.log('\n🔧 Creating TECHNICIAN permissions...');
  const technicianPermissions: { resource: string; level: AccessLevel }[] = [
    { resource: 'Access control device', level: AccessLevel.READ },
    { resource: 'Accessory', level: AccessLevel.WRITE },
    { resource: 'Article', level: AccessLevel.READ },
    { resource: 'Asset', level: AccessLevel.WRITE },
    { resource: 'Asset model', level: AccessLevel.READ },
    { resource: 'Consumable', level: AccessLevel.WRITE },
    { resource: 'Facility', level: AccessLevel.READ },
    { resource: 'Location', level: AccessLevel.READ },
    { resource: 'Maintenance', level: AccessLevel.WRITE },
    { resource: 'Manufacturer', level: AccessLevel.READ },
    { resource: 'Supplier', level: AccessLevel.READ }
  ];

  for (const { resource, level } of technicianPermissions) {
    await prisma.permission.upsert({
      where: {
        roleId_resource: {
          roleId: technicianRole.id,
          resource
        }
      },
      update: { accessLevel: level },
      create: {
        roleId: technicianRole.id,
        resource,
        accessLevel: level
      }
    });
  }

  // All other resources default to NONE for technician
  const technicianResourcesWithPerms = technicianPermissions.map(p => p.resource);
  const remainingResources = RESOURCES.filter(r => !technicianResourcesWithPerms.includes(r));

  for (const resource of remainingResources) {
    await prisma.permission.upsert({
      where: {
        roleId_resource: {
          roleId: technicianRole.id,
          resource
        }
      },
      update: { accessLevel: AccessLevel.NONE },
      create: {
        roleId: technicianRole.id,
        resource,
        accessLevel: AccessLevel.NONE
      }
    });
  }
  console.log(`✓ Created ${RESOURCES.length} permissions for TECHNICIAN`);

  // 4. Create permissions for USER (READ access to limited resources)
  console.log('\n👤 Creating USER permissions...');
  const userPermissions: { resource: string; level: AccessLevel }[] = [
    { resource: 'Article', level: AccessLevel.READ },
    { resource: 'Asset', level: AccessLevel.READ },
    { resource: 'Facility', level: AccessLevel.READ },
    { resource: 'Location', level: AccessLevel.READ }
  ];

  for (const { resource, level } of userPermissions) {
    await prisma.permission.upsert({
      where: {
        roleId_resource: {
          roleId: userRole.id,
          resource
        }
      },
      update: { accessLevel: level },
      create: {
        roleId: userRole.id,
        resource,
        accessLevel: level
      }
    });
  }

  // All other resources default to NONE for user
  const userResourcesWithPerms = userPermissions.map(p => p.resource);
  const userRemainingResources = RESOURCES.filter(r => !userResourcesWithPerms.includes(r));

  for (const resource of userRemainingResources) {
    await prisma.permission.upsert({
      where: {
        roleId_resource: {
          roleId: userRole.id,
          resource
        }
      },
      update: { accessLevel: AccessLevel.NONE },
      create: {
        roleId: userRole.id,
        resource,
        accessLevel: AccessLevel.NONE
      }
    });
  }
  console.log(`✓ Created ${RESOURCES.length} permissions for USER`);

  // 5. Create default admin user
  console.log('\n👨‍💼 Creating default admin user...');
  const hashedPassword = await hashPassword('Admin@123');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@facilitydesk.com' },
    update: {},
    create: {
      email: 'admin@facilitydesk.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      status: 'ACTIVE',
      roleId: adminRole.id
    }
  });
  console.log('✓ Created default admin user');
  console.log('  📧 Email: admin@facilitydesk.com');
  console.log('  🔑 Password: Admin@123');

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  • ${3} roles created`);
  console.log(`  • ${RESOURCES.length * 3} permissions created`);
  console.log(`  • ${1} admin user created`);
}

main()
  .catch((e) => {
    console.error('\n❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
