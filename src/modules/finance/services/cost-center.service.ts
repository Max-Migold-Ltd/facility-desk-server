import prisma from "../../../lib/prisma";
import { CreateCostCenterDto } from "../dto/cost-center";
import { Prisma } from "../../../generated/prisma";
import { BadRequestError, NotFoundError } from "../../../errors";

export class CostCenterService {
  async create(data: CreateCostCenterDto) {
    return prisma.costCenter.create({
      data: {
        ...data,
        budgetLimit: data.budgetLimit
          ? new Prisma.Decimal(data.budgetLimit)
          : new Prisma.Decimal(0),
      },
    });
  }

  async findAll() {
    return prisma.costCenter.findMany();
  }

  async findById(id: string) {
    const cc = await prisma.costCenter.findUnique({ where: { id } });
    if (!cc) throw new NotFoundError("Cost Center");
    return cc;
  }

  async reserveBudget(costCenterId: string, amount: number) {
    const cc = await this.findById(costCenterId);
    const currentSpent = Number(cc.budgetSpent);
    const limit = Number(cc.budgetLimit);
    const requested = Number(amount);

    if (currentSpent + requested > limit) {
      throw new BadRequestError("Budget exceeded");
    }

    return prisma.costCenter.update({
      where: { id: costCenterId },
      data: {
        budgetCommitted: new Prisma.Decimal(currentSpent + requested),
      },
    });
  }

  async updateBudgetSpent(costCenterId: string, amount: number) {
    const cc = await this.findById(costCenterId);
    const currentSpent = Number(cc.budgetSpent);
    const limit = Number(cc.budgetLimit);
    const requested = Number(amount);

    if (currentSpent + requested > limit) {
      throw new BadRequestError("Budget exceeded");
    }

    return prisma.costCenter.update({
      where: { id: costCenterId },
      data: {
        budgetSpent: new Prisma.Decimal(currentSpent + requested),
      },
    });
  }

  // Listen to webhook for payment.. paystack, flutterwave or mono
  async budgetPaid(costCenterId: string, amount: number) {
    const cc = await this.findById(costCenterId);
    const currentSpent = Number(cc.budgetSpent);
    const limit = Number(cc.budgetLimit);
    const requested = Number(amount);

    if (currentSpent + requested > limit) {
      throw new BadRequestError("Budget exceeded");
    }

    return prisma.costCenter.update({
      where: { id: costCenterId },
      data: {
        budgetSpent: new Prisma.Decimal(currentSpent + requested),
        budgetCommitted: new Prisma.Decimal(currentSpent - requested), // Since the money has been paid, it's no longer committed
      },
    }); // or use Upsert? Create Invoice?
  }

  /**
   * Checks if the Cost Center has enough budget.
   * Throws BadRequestError if budget exceeded.
   * @param costCenterId
   * @param amount Amount to be spent (default 0, just to check current status)
   */
  async checkBudgetAvailability(costCenterId: string, amount: number = 0) {
    const cc = await this.findById(costCenterId);

    // If budgetLimit is 0 (or infinite? let's assume 0 means NO budget, or unlimited? usually 0 means 0)
    // If we want unlimited, we might check a flag or null. But let's assume strict limit.

    const currentSpent = Number(cc.budgetSpent);
    const limit = Number(cc.budgetLimit);
    const requested = Number(amount);

    if (currentSpent + requested > limit) {
      throw new BadRequestError("Budget exceeded");
    }
  }

  /**
   * Determine Cost Center for a Maintenance request
   * Hierarchy:
   * 1. Explicitly provided costCenterId
   * 2. Asset's Cost Center
   * 3. Building's Cost Center
   * 4. User's (Requester) Cost Center
   */
  async resolveCostCenterForMaintenance(data: {
    costCenterId?: string;
    assetId?: string | null;
    buildingId?: string | null;
    requesterId?: string;
  }): Promise<string | null> {
    if (data.costCenterId) return data.costCenterId;

    if (data.assetId) {
      const asset = await prisma.asset.findUnique({
        where: { id: data.assetId },
        select: { costCenterId: true },
      });
      if (asset?.costCenterId) return asset.costCenterId;
    }

    if (data.buildingId) {
      const building = await prisma.building.findUnique({
        where: { id: data.buildingId },
        select: { costCenterId: true },
      });
      if (building?.costCenterId) return building.costCenterId;
    }

    if (data.requesterId) {
      const user = await prisma.user.findUnique({
        where: { id: data.requesterId },
        select: { costCenterId: true },
      });
      if (user?.costCenterId) return user.costCenterId;
    }

    return null;
  }
}
