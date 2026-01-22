import prisma from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../errors";
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
  private generateCode(type: MaintenanceType): string {
    const prefixMap: Record<MaintenanceType, string> = {
      [MaintenanceType.PREVENTIVE]: "PM",
      [MaintenanceType.CORRECTIVE]: "COR",
      [MaintenanceType.PREDICTIVE]: "PDM",
      [MaintenanceType.EMERGENCY]: "EMG",
      [MaintenanceType.INSPECTION]: "INS",
      [MaintenanceType.CALIBRATION]: "CAL",
      [MaintenanceType.SMALL_PROJECT]: "PRJ",
      [MaintenanceType.SOFT_SERVICE]: "SFT",
    };

    const prefix = prefixMap[type] || "WO";
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async create(data: CreateMaintenanceDto) {
    const {
      type,
      roomId,
      startDate,
      endDate,
      priority,
      siteId,
      requesterId,
      buildingId,
      assetId,
      floorId,
      spaceId,
      assigneeId,
      teamId,
      metadata,
      ...rest
    } = data;

    const finalType = type || MaintenanceType.CORRECTIVE;
    const code = this.generateCode(finalType);
    const finalPriority = (priority as Priority) || Priority.LOW;

    // Use Prisma.MaintenanceCreateInput to ensure we strictly follow the relation-based input type
    // avoiding ambiguity with UncheckedCreateInput
    const createData: Prisma.MaintenanceCreateInput = {
      processStatus: Status.PENDING,
      ...rest,

      type: finalType,
      code,
      priority: finalPriority,

      site: { connect: { id: siteId } },
      requester: { connect: { id: requesterId } },

      // Optional relations
      ...(buildingId && { building: { connect: { id: buildingId } } }),
      ...(assetId && { asset: { connect: { id: assetId } } }),
      ...(floorId && { floor: { connect: { id: floorId } } }),
      ...((spaceId || roomId) && {
        space: { connect: { id: spaceId || roomId } },
      }),
      ...(assigneeId && { assignee: { connect: { id: assigneeId } } }),
      ...(teamId && { team: { connect: { id: teamId } } }),

      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,

      metadata: metadata ?? Prisma.JsonNull,
    };

    const maintenance = await prisma.maintenance.create({
      data: createData,
      include: {
        site: true,
        requester: true,
      },
    });

    return maintenance;
  }

  async findAll(
    options: MaintenanceQueryDto & { page?: number; limit?: number },
  ) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceWhereInput = {};

    if (options.type) where.type = options.type;

    // New Filters
    if (options.priority) where.priority = options.priority;
    if (options.processStatus) where.processStatus = options.processStatus;
    if (options.siteId) where.siteId = options.siteId;
    if (options.assetId) where.assetId = options.assetId;
    if (options.requesterId) where.requesterId = options.requesterId;
    if (options.assigneeId) where.assigneeId = options.assigneeId;

    // Date Range Filtering
    if (options.minDate || options.maxDate) {
      where.createdAt = {};
      if (options.minDate) where.createdAt.gte = new Date(options.minDate);
      if (options.maxDate) where.createdAt.lte = new Date(options.maxDate);
    }

    const [maintenances, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        include: {
          site: { select: { name: true, code: true } },
          requester: {
            select: {
              employeeCode: true,
              firstName: true,
              lastName: true,
            },
          },
          assignee: {
            select: {
              employeeCode: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.maintenance.count({ where }),
    ]);

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
        space: true,
        requester: true,
        assignee: true,
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
    if (!maintenance) {
      throw new NotFoundError("Maintenance");
    }

    // Prepare update data
    const updateData: Prisma.MaintenanceUpdateInput = {};
    if (data.description) updateData.description = data.description as string;
    if (data.processStatus) updateData.processStatus = data.processStatus;
    if (data.outcome) updateData.outcome = data.outcome;
    if (data.metadata) updateData.metadata = data.metadata;

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
