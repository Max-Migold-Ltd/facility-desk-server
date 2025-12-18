import prisma from "../../lib/prisma";
import { AccessLevel } from "../../generated/prisma";
import { NotFoundError } from "../../errors";

export class PermissionsService {
  // Method removed: findByRoles (M:N refactor reverted)

  // Previous `findByRole` (singular) kept for admin usage/single role editing
  async findByRole(roleId: string) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundError("Role");
    }

    const permissions = await prisma.permission.findMany({
      where: { roleId },
      orderBy: { resource: "asc" },
    });

    return permissions;
  }

  async updateRolePermissions(
    roleId: string,
    permissions: Array<{ resource: string; accessLevel: AccessLevel }>
  ) {
    // Unchanged - updating specific role permissions doesn't change with M:N
    // (a Role still owns its permissions)
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundError("Role");
    }

    // Use transaction to update all permissions atomically
    const updatedPermissions = await prisma.$transaction(
      permissions.map((perm) =>
        prisma.permission.upsert({
          where: {
            roleId_resource: {
              roleId,
              resource: perm.resource,
            },
          },
          update: {
            accessLevel: perm.accessLevel,
          },
          create: {
            roleId,
            resource: perm.resource,
            accessLevel: perm.accessLevel,
          },
        })
      )
    );

    return updatedPermissions;
  }
}
