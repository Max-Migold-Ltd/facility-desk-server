import { BadRequestError, NotFoundError } from "../../../errors";
import prisma from "../../../lib/prisma";
import {
  StockMovementType,
  StockReferenceType,
} from "../../../generated/prisma";
import { StockService } from "../../logistics/services/stock.service";

const stockService = new StockService();

export class MaintenanceItemService {
  async addSparepart(data: {
    itemId: string;
    quantity: number;
    warehouseId: string;
    maintenanceId: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify Maintenance exists
      const maintenance = await tx.maintenance.findUnique({
        where: { id: data.maintenanceId },
      });

      if (!maintenance) throw new NotFoundError("Maintenance");

      if (maintenance.processStatus === "COMPLETED") {
        throw new BadRequestError(
          "Cannot add spare parts to a completed maintenance",
        );
      }

      const item = await tx.item.findUnique({
        where: { id: data.itemId },
      });

      if (!item) throw new NotFoundError("Item");

      await stockService.createMovement({
        type: StockMovementType.UNLOAD,
        quantity: data.quantity,
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        referenceId: data.maintenanceId,
        referenceType: StockReferenceType.MAINTENANCE,
        notes: `Used in Maintenance ${maintenance.code || data.maintenanceId}`,
      }, tx);

      const maintenanceItem = await tx.maintenanceItem.upsert({
        where: {
          maintenanceId_itemId: {
            maintenanceId: data.maintenanceId,
            itemId: data.itemId,
          },
        },
        update: {
          quantity: { increment: data.quantity },
        },
        create: {
          maintenanceId: data.maintenanceId,
          itemId: data.itemId,
          quantity: data.quantity,
          cost: data.quantity * Number(item.cost),
        },
      });
      return maintenanceItem;
    });
  }

  //
  async consumeSparePart(
    userId: string,
    data: {
      maintenanceId: string;
      itemId: string;
      quantity: number;
      warehouseId: string;
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // Check if maintenance exists and is active
      const maintenance = await tx.maintenance.findUnique({
        where: { id: data.maintenanceId },
      });

      if (!maintenance) throw new NotFoundError("Maintenance");
      if (maintenance.processStatus === "COMPLETED") {
        throw new BadRequestError(
          "Cannot add spare parts to a completed maintenance",
        );
      }

      const item = await tx.item.findUnique({
        where: { id: data.itemId },
      });

      if (!item) throw new NotFoundError("Item");

      await stockService.createMovement(
        {
          type: StockMovementType.UNLOAD,
          quantity: data.quantity,
          itemId: data.itemId,
          warehouseId: data.warehouseId,
          referenceId: data.maintenanceId,
          referenceType: StockReferenceType.MAINTENANCE,
          notes: `Used in Maintenance ${maintenance.code || data.maintenanceId}`,
        },
        tx,
      );

      const totalCost: number = Number(item.cost) * data.quantity;

      // Create maintenance item
      const maintenanceItem = await tx.maintenanceItem.create({
        data: {
          maintenanceId: data.maintenanceId,
          itemId: data.itemId,
          quantity: data.quantity,
          cost: totalCost,
        },
      });

      return maintenanceItem;
    });
  }
}
