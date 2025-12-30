import prisma from "../../lib/prisma";
import { NotFoundError } from "../../errors";
import {
  UserStatus,
  EmployeeType,
  ServiceStatus,
} from "../../generated/prisma";

export class UsersService {
  async findAll(options: {
    page?: number;
    limit?: number;
    status?: UserStatus;
    role?: string;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.role) where.role = { name: options.role };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: true, permissions: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    // Remove passwords
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return {
      users: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true, permissions: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      status?: UserStatus;
      roleId?: string; // Role ID
      permissions?: { resource: string; accessLevel: string }[];
      // Employee Fields
      employeeCode?: string;
      employeeType?: EmployeeType;
      companyId?: string;
      serviceStatus?: ServiceStatus;
    }
  ) {
    const { roleId, permissions, ...userData } = data;

    // Prepare update data
    const updateData: any = { ...userData };

    if (roleId) {
      updateData.roleId = roleId;
    }

    // TODO: Handle permissions update separately or here?
    // For now, let's assume direct permissions are handled via a specialized method
    // or we can add nested create/update here if complex.
    // Simplifying to just update fields for now.
    if (permissions) {
      // Need Logic to update permissions
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true, permissions: true, company: true },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async delete(id: string) {
    await prisma.user.delete({
      where: { id },
    });
  }
}
