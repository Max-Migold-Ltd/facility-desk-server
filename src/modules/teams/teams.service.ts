import prisma from "../../lib/prisma";
import { NotFoundError, ConflictError } from "../../errors";
import { ServiceStatus, Prisma } from "../../generated/prisma";

export class TeamsService {
  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ServiceStatus;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.TeamWhereInput = {};
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { code: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
      ];
    }
    if (options.status) where.status = options.status;

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        include: {
          supervisor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.team.count({ where }),
    ]);

    return {
      teams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError("Team");
    }

    return team;
  }

  async create(data: {
    code: string;
    name: string;
    description?: string;
    supervisorId: string;
    status?: ServiceStatus;
  }) {
    // Check duplicate code
    const existingCode = await prisma.team.findUnique({
      where: { code: data.code },
    });
    if (existingCode) throw new ConflictError("Team code already exists");

    // Check supervisor existence
    const supervisor = await prisma.user.findUnique({
      where: { id: data.supervisorId },
    });
    if (!supervisor) throw new NotFoundError("Supervisor (User) not found");

    const team = await prisma.team.create({
      data,
      include: {
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return team;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      supervisorId?: string;
      status?: ServiceStatus;
    }
  ) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new NotFoundError("Team");

    if (data.supervisorId) {
      const supervisor = await prisma.user.findUnique({
        where: { id: data.supervisorId },
      });
      if (!supervisor) throw new NotFoundError("Supervisor (User) not found");
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data,
      include: {
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedTeam;
  }

  async delete(id: string) {
    await prisma.team.delete({
      where: { id },
    });
  }
}
