import prisma from "../../lib/prisma";
import { AppError, NotFoundError } from "../../errors";
import { RoleCreateInput, RoleUpdateInput } from "./dto/roles.dto";

export class RolesService {
  async findAll() {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return roles;
  }

  async findById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: {
            id: true,
            resource: true,
            accessLevel: true,
          },
          orderBy: { resource: "asc" },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundError("Role");
    }

    return role;
  }

  async create(roleData: RoleCreateInput) {
    const role = await prisma.role.create({ data: roleData });
    return role;
  }

  async update(id: string, roleData: RoleUpdateInput) {
    const role = await prisma.role.update({
      where: { id },
      data: roleData,
    });
    return role;
  }

  async delete(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundError("Role");
    }
    if (role.isSystem)
      return new AppError(
        "System role cannot be deleted",
        400,
        "ROLE_DELETE_ERROR"
      );
    await prisma.role.delete({ where: { id } });
  }
}
