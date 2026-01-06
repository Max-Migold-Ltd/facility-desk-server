import prisma from "../../lib/prisma";
import { AccessLevel } from "../../generated/prisma";
import { NotFoundError } from "../../errors";
import {
  PermissionCreateInput,
  PermissionUpdateInput,
} from "./dto/permission.dto";

export class PermissionsService {
  // Method removed: findByRoles (M:N refactor reverted)

  async getAll(roleId?: string) {
    const permissions = await prisma.permission.findMany({
      where: { roleId },
      include: { role: { select: { id: true, name: true } } },
      orderBy: { resource: "asc" },
    });

    return permissions;
  }
  async getById(id: string) {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: { role: { select: { id: true, name: true } } },
    });
    if (!permission) return new NotFoundError("Permission");

    return permission;
  }

  async create(permissionData: PermissionCreateInput) {
    const permission = await prisma.permission.create({ data: permissionData });
    return permission;
  }

  async update(id: string, permissionData: PermissionUpdateInput) {
    const permission = await prisma.permission.update({
      where: { id },
      data: permissionData,
    });
    return permission;
  }

  async delete(id: string) {
    await prisma.permission.delete({ where: { id } });
    return null;
  }
}
