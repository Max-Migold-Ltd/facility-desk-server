import prisma from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../errors";
import {
  MaintenanceType,
  Priority,
  Status,
  Prisma,
} from "../../generated/prisma";
import { CreateMaintenanceDto, LogworkDto } from "./dto/create-maintenance.dto";
import { UpdateMaintenanceDto } from "./dto/update-maintenance.dto";
import { MaintenanceQueryDto } from "./dto/maintenance-query.dto";
import { CostCenterService } from "../finance/services/cost-center.service";

const costCenterService = new CostCenterService();

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

  private getNextRunDate(frequency: string): Date {
    const now = new Date();
    const nextRunDate = new Date(now);
    switch (frequency) {
      case "DAILY":
        nextRunDate.setDate(nextRunDate.getDate() + 1);
        break;
      case "WEEKLY":
        nextRunDate.setDate(nextRunDate.getDate() + 7);
        break;
      case "MONTHLY":
        nextRunDate.setMonth(nextRunDate.getMonth() + 1);
        break;
      case "YEARLY":
        nextRunDate.setFullYear(nextRunDate.getFullYear() + 1);
        break;
    }
    return nextRunDate;
  }

  async getMaterialCost(maintenanceId: string) {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: maintenanceId },
      include: {
        maintenanceItems: true,
      },
    });

    if (!maintenance) throw new NotFoundError("Maintenance not found");

    const materialCost = maintenance.maintenanceItems.reduce(
      (sum, item) => sum + Number(item.cost),
      0,
    );

    return materialCost;
  }

  async logWork(userId: string, data: LogworkDto) {
    // Calculate duration in minutes
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const durationMinutes = Math.floor(
      (end.getTime() - start.getTime()) / 60000,
    );

    if (durationMinutes <= 0)
      throw new BadRequestError("End time must be greater than start time");

    return await prisma.$transaction(async (tx) => {
      const technician = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!technician) throw new NotFoundError("Technician not found");

      const hours = durationMinutes / 60;
      const rate = Number(technician.hourlyRate);
      const cost = hours * rate;

      // Create Work Log
      const workLog = await tx.workLog.create({
        data: {
          maintenanceId: data.maintenanceId,
          startTime: start,
          endTime: end,
          technicianId: userId,
          description: data.description,
          durationInMinutes: durationMinutes,
          currentRate: technician.hourlyRate,
          totalCost: cost,
        },
      });

      await tx.maintenance.update({
        where: { id: data.maintenanceId },
        data: {
          ttLaborCost: {
            increment: cost,
          },
        },
      });

      return workLog;
    });
  }

  async getLaborCost(maintenanceId: string): Promise<number> {
    const workLogs = await prisma.workLog.findMany({
      where: { maintenanceId },
    });

    const laborCost = workLogs.reduce(
      (sum, log) => sum + Number(log.totalCost),
      0,
    );

    return laborCost;
  }

  async getFinancialSummary(maintenanceId: string) {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: maintenanceId },
      include: {
        maintenanceItems: true,
        workLogs: true,
      },
    });

    if (!maintenance) throw new NotFoundError("Maintenance not found");

    const materialCost = maintenance.maintenanceItems.reduce(
      (sum, item) => sum + Number(item.cost),
      0,
    );

    const laborCost = maintenance.workLogs.reduce(
      (sum, log) => sum + Number(log.totalCost),
      0,
    );

    return {
      maintenanceId,
      currency: "NGN",
      breakdown: { materialCost, laborCost },
      total: materialCost + laborCost,
    };
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
      costCenterId,
      ...rest
    } = data;

    // Budget Check
    const resolvedCostCenterId =
      await costCenterService.resolveCostCenterForMaintenance({
        costCenterId,
        assetId,
        buildingId,
        requesterId,
      });

    if (resolvedCostCenterId) {
      // Check if budget is exceeded (blocking)
      await costCenterService.checkBudgetAvailability(resolvedCostCenterId, 0);
    }

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
      ...(resolvedCostCenterId && {
        costCenter: { connect: { id: resolvedCostCenterId } },
      }),

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

  async createPreventive(
    data: Prisma.PreventiveCreateInput & {
      siteId: string;
      requesterId: string;
      assetId?: string;
      buildingId?: string;
      floorId?: string;
      roomId?: string;
      spaceId?: string;
      zoneId?: string;
      teamId?: string;
    },
  ) {
    const preventive = await prisma.preventive.create({
      data: {
        code: this.generateCode(MaintenanceType.PREVENTIVE),
        description: data.description,
        priority: data.priority,
        duration: data.duration,

        asset: data.assetId ? { connect: { id: data.assetId } } : undefined,
        building: data.buildingId
          ? { connect: { id: data.buildingId } }
          : undefined,
        floor: data.floorId ? { connect: { id: data.floorId } } : undefined,
        space: data.spaceId ? { connect: { id: data.spaceId } } : undefined,
        site: { connect: { id: data.siteId } },
        zone: data.zoneId ? { connect: { id: data.zoneId } } : undefined,
        team: data.teamId ? { connect: { id: data.teamId } } : undefined,
        name: data.name,
        nextRun: this.getNextRunDate(data.frequency || "MONTHLY"),
      },
    });

    return preventive;
  }

  async createFromPreventive(preventiveId: string) {
    const preventive = await prisma.preventive.findUnique({
      where: { id: preventiveId },
    });

    if (!preventive) {
      throw new NotFoundError("Preventive Maintenance");
    }

    // Budget Check for Preventive
    const resolvedCostCenterId =
      await costCenterService.resolveCostCenterForMaintenance({
        assetId: preventive.assetId,
        buildingId: preventive.buildingId,
        // teamId: preventive.teamId // TODO: Add logic for team-based cost center?
      });

    if (resolvedCostCenterId) {
      await costCenterService.checkBudgetAvailability(resolvedCostCenterId, 0);
    }

    const maintenance = await prisma.maintenance.create({
      data: {
        code: this.generateCode(MaintenanceType.PREVENTIVE),
        type: MaintenanceType.PREVENTIVE,
        description: `Auto-Triggered: ${preventive.name}`,
        processStatus: Status.PENDING,
        priority: preventive.priority,
        site: { connect: { id: preventive.siteId } },
        building: preventive.buildingId
          ? { connect: { id: preventive.buildingId } }
          : undefined,
        asset: preventive.assetId
          ? { connect: { id: preventive.assetId } }
          : undefined,
        floor: preventive.floorId
          ? { connect: { id: preventive.floorId } }
          : undefined,
        zone: preventive.zoneId
          ? { connect: { id: preventive.zoneId } }
          : undefined,
        space: preventive.spaceId
          ? { connect: { id: preventive.spaceId } }
          : undefined,
        team: preventive.teamId
          ? { connect: { id: preventive.teamId } }
          : undefined,
        prevMaintenanceConfigId: preventive.id,
        costCenter: resolvedCostCenterId
          ? { connect: { id: resolvedCostCenterId } }
          : undefined,
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
    const maintenance = await prisma.maintenance.findUnique({ where: { id } }); // Ensure exists
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
