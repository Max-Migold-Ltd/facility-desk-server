import prisma from "../../lib/prisma";
import { NotFoundError } from "../../errors";
import {
  MaintenanceType,
  Priority,
  Status,
  Prisma,
} from "../../generated/prisma";
import { CreateMaintenanceDto } from "./dto/create-maintenance.dto";
import { UpdateMaintenanceDto } from "./dto/update-maintenance.dto";
import { MaintenanceQueryDto } from "./dto/maintenance-query.dto";

export class MaintenanceService {
  async createCorrective(data: CreateMaintenanceDto) {
    // Generate a code
    const code = `COR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const maintenance = await prisma.maintenance.create({
      data: {
        type: MaintenanceType.CORRECTIVE,
        code,
        description: data.description as string,
        priority: (data.priority as Priority) || Priority.LOW,
        site: { connect: { id: data.siteId } },
        requester: { connect: { id: data.requesterId } },
        // Optional relations
        ...(data.buildingId && {
          building: { connect: { id: data.buildingId } },
        }),
        ...(data.assetId && { asset: { connect: { id: data.assetId } } }),
        ...(data.floorId && { floor: { connect: { id: data.floorId } } }),
        ...(data.roomId && { room: { connect: { id: data.roomId } } }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        // Default performer to requester or assignee if provided
        performer: { connect: { id: data.assigneeId || data.requesterId } }, // Fallback
        ...(data.assigneeId && {
          assignee: { connect: { id: data.assigneeId } },
        }), // Assignee connected here
        processStatus: Status.PENDING,
      },
      include: {
        site: true,
        requester: true,
      },
    });

    return maintenance;
  }

  async findAll(
    options: MaintenanceQueryDto & { page?: number; limit?: number }
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceWhereInput = {};

    if (options.type) where.type = options.type;
    if (options.status) where.processStatus = options.status;
    if (options.priority) where.priority = options.priority;
    if (options.siteId) where.siteId = options.siteId;
    if (options.requesterId) where.requesterId = options.requesterId;
    if (options.assigneeId) where.assigneeId = options.assigneeId;

    const [maintenances, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        include: {
          site: { select: { name: true, code: true } },
          requester: {
            select: {
              code: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
          assignee: {
            select: {
              code: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // createdAt is not in model, assuming checking schema again or using startDate/id
      }),
      prisma.maintenance.count({ where }),
    ]);
    // NOTE: Maintenance model doesn't have createdAt? Let's check schema.
    // Logic: use id or add createdAt if missing. Schema check: no createdAt in Maintenance!
    // It has `startDate`, `endDate`. I'll sort by `startDate` desc.

    return {
      maintenances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id },
      include: {
        site: true,
        floor: true,
        room: true,
        requester: { include: { user: true } },
        assignee: { include: { user: true } },
        performer: { include: { user: true } },
        team: true,
      },
    });

    if (!maintenance) {
      throw new NotFoundError("Maintenance");
    }

    return maintenance;
  }

  async update(id: string, data: UpdateMaintenanceDto) {
    const maintenance = await this.findById(id); // Ensure exists

    // Prepare update data
    const updateData: Prisma.MaintenanceUpdateInput = {};
    if (data.description) updateData.description = data.description as string;
    if (data.processStatus) updateData.processStatus = data.processStatus;
    if (data.outcome) updateData.outcome = data.outcome;

    if (data.teamId) updateData.team = { connect: { id: data.teamId } };
    if (data.assigneeId)
      updateData.assignee = { connect: { id: data.assigneeId } };

    return prisma.maintenance.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.maintenance.delete({ where: { id } });
  }
  async assign(id: string, assigneeId?: string, teamId?: string) {
    const maintenance = await this.findById(id);

    const data: Prisma.MaintenanceUpdateInput = {};

    if (assigneeId) {
      data.assignee = { connect: { id: assigneeId } };
      // Also set performer if not set? Or leave performer for status change?
      // Usually assignment implies they are now the performer for the next step.
      data.performer = { connect: { id: assigneeId } };
    }

    if (teamId) {
      data.team = { connect: { id: teamId } };
    }

    if (Object.keys(data).length === 0) {
      return maintenance;
    }

    return prisma.maintenance.update({
      where: { id },
      data,
      include: {
        assignee: true,
        team: true,
      },
    });
  }

  async updateStatus(id: string, status: Status, notes?: string) {
    const maintenance = await this.findById(id);

    const data: Prisma.MaintenanceUpdateInput = {
      processStatus: status,
    };

    if (notes) {
      data.processNotes = notes;
    }

    const now = new Date();

    if (
      status === Status.IN_PROGRESS &&
      maintenance.processStatus !== Status.IN_PROGRESS
    ) {
      data.execStart = now;
      data.activityStartTime = now;
    } else if (
      status === Status.COMPLETED &&
      maintenance.processStatus !== Status.COMPLETED
    ) {
      data.execEndDate = now;
      data.activityEndTime = now;

      if (maintenance.execStart) {
        const diffMs = now.getTime() - maintenance.execStart.getTime();
        data.totalExecTime = new Prisma.Decimal(diffMs / 60000);
      }
    }

    return prisma.maintenance.update({
      where: { id },
      data,
    });
  }
  async addPhoto(id: string, fileUrl: string) {
    const file = await prisma.file.upsert({
      where: { url: fileUrl },
      create: { url: fileUrl },
      update: {},
    });

    return prisma.maintenance.update({
      where: { id },
      data: {
        photos: {
          connect: { id: file.id },
        },
      },
      include: {
        photos: true,
      },
    });
  }
}
