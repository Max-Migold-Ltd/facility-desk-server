import prisma from "../../../lib/prisma";
import { Prisma, StockMovementType } from "../../../generated/prisma";
import {
  CreateStockMovementDto,
  StockFilterDto,
  StockMovementFilterDto,
} from "../dtos/stock.dto";
import { BadRequestError, NotFoundError } from "../../../errors";

export class StockService {

  async getStocks(filters: StockFilterDto & { page?: number; limit?: number }) {
    const { warehouseId, itemId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.StockWhereInput = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (itemId) where.itemId = itemId;

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              category: true,
              unitOfMeasure: true,
            },
          },
          warehouse: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { quantity: "desc" },
      }),
      prisma.stock.count({ where }),
    ]);

    return {
      stocks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get stock movements history
   */
  async getStockMovements(
    filters: StockMovementFilterDto & { page?: number; limit?: number }
  ) {
    const {
      warehouseId,
      itemId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};
    if (warehouseId) {
      // For movements, check both source and target warehouses
      where.OR = [
        { warehouseId: warehouseId },
        { targetWarehouseId: warehouseId },
      ];
    }

    const andConditions: Prisma.StockMovementWhereInput[] = [];

    if (itemId) andConditions.push({ itemId });
    if (type) andConditions.push({ type });
    if (startDate) andConditions.push({ createdAt: { gte: startDate } });
    if (endDate) andConditions.push({ createdAt: { lte: endDate } });

    if (warehouseId) {
      andConditions.push({
        OR: [{ warehouseId }, { targetWarehouseId: warehouseId }],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          item: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
          targetWarehouse: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new stock movement (Load, Unload, Transfer)
   */
  async createMovement(data: CreateStockMovementDto) {
    const {
      type,
      quantity,
      itemId,
      warehouseId,
      targetWarehouseId,
      referenceId,
      referenceType,
    } = data;

    // Verify Item and Warehouse exist
    const [item, warehouse] = await Promise.all([
      prisma.item.findUnique({ where: { id: itemId } }),
      prisma.warehouse.findUnique({ where: { id: warehouseId } }),
    ]);

    if (!item) throw new NotFoundError("Item");
    if (!warehouse) throw new NotFoundError("Warehouse");

    return await prisma.$transaction(async (tx) => {
      // 1. Create the movement record
      const movement = await tx.stockMovement.create({
        data: {
          type,
          quantity,
          itemId,
          warehouseId,
          targetWarehouseId,
          referenceId,
          referenceType,
        },
      });

      // 2. Update stock based on type
      if (type === StockMovementType.LOAD) {
        // Increase stock in warehouse
        await tx.stock.upsert({
          where: {
            itemId_warehouseId: {
              itemId,
              warehouseId,
            },
          },
          update: { quantity: { increment: quantity } },
          create: {
            itemId,
            warehouseId,
            quantity,
          },
        });
      } else if (type === StockMovementType.UNLOAD) {
        // Decrease stock in warehouse
        const currentStock = await tx.stock.findUnique({
          where: {
            itemId_warehouseId: { itemId, warehouseId },
          },
        });

        if (!currentStock || currentStock.quantity < quantity) {
          throw new BadRequestError("Insufficient stock for unload");
        }

        const updatedStock = await tx.stock.update({
          where: {
            itemId_warehouseId: { itemId, warehouseId },
          },
          data: { quantity: { decrement: quantity } },
        });

        // 3. Check for Low Stock (Alert Simulation)
        if (updatedStock.quantity <= updatedStock.minQuantity) {
          console.warn(
            `[LOW STOCK ALERT] Item ${itemId} in Warehouse ${warehouseId} is below minimum level (${updatedStock.quantity} <= ${updatedStock.minQuantity})`
          );
          // In a real system, trigger email/notification here
        }
      } else if (type === StockMovementType.TRANSFER) {
        if (!targetWarehouseId) {
          throw new BadRequestError("Target warehouse required for transfer");
        }

        // Verify target warehouse exists
        const targetWarehouse = await tx.warehouse.findUnique({
          where: { id: targetWarehouseId },
        });
        if (!targetWarehouse) throw new NotFoundError("Target Warehouse");

        // Decrease source
        const sourceStock = await tx.stock.findUnique({
          where: {
            itemId_warehouseId: { itemId, warehouseId },
          },
        });

        if (!sourceStock || sourceStock.quantity < quantity) {
          throw new BadRequestError("Insufficient source stock for transfer");
        }

        await tx.stock.update({
          where: {
            itemId_warehouseId: { itemId, warehouseId },
          },
          data: { quantity: { decrement: quantity } },
        });

        // Increase target
        await tx.stock.upsert({
          where: {
            itemId_warehouseId: {
              itemId,
              warehouseId: targetWarehouseId,
            },
          },
          update: { quantity: { increment: quantity } },
          create: {
            itemId,
            warehouseId: targetWarehouseId,
            quantity,
          },
        });
      }

      return movement;
    });
  }
}
