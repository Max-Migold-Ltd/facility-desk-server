import { NextFunction, Request, Response } from "express";
import prisma from "../../../lib/prisma";
import { StockService } from "../../logistics/services/stock.service";
import {
  StockMovementType,
  StockReferenceType,
} from "../../../generated/prisma";
import { BadRequestError, NotFoundError } from "../../../errors";

const stockService = new StockService();


export class MaintenanceItemController {
  /**
   * Add Item to Maintenance (Consumes stock)
   */
  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      // const { maintenanceId } = req.params;
      let maintenanceId = req.params.maintenanceId || req.body.maintenanceId;
      const { itemId, quantity, warehouseId } = req.body;

      if (!itemId || !quantity || !warehouseId) {
        throw new BadRequestError(
          "ItemId, Quantity, and WarehouseId are required",
        );
      }

      // 1. Verify Maintenance exists
      const maintenance = await prisma.maintenance.findUnique({
        where: { id: maintenanceId },
      });
      if (!maintenance) throw new NotFoundError("Maintenance");

      // 2. Consume Stock (Create UNLOAD movement)
      // This will throw error if stock is insufficient
      await stockService.createMovement({
        type: StockMovementType.UNLOAD,
        quantity,
        itemId,
        warehouseId,
        referenceId: maintenanceId,
        referenceType: StockReferenceType.MAINTENANCE,
        notes: `Used in Maintenance ${maintenance.code || maintenanceId}`,
      });

      // 3. Create MaintenanceItem link
      // Use upsert to handle case where item is already added (increment quantity)
      const maintenanceItem = await prisma.maintenanceItem.upsert({
        where: {
          maintenanceId_itemId: {
            maintenanceId,
            itemId,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          maintenanceId,
          itemId,
          quantity,
          // cost: item.cost * quantity,
        },
      });

      res.status(201).json(maintenanceItem);
    } catch (error) {
      next(error);
    }
  }


  /**
   * Get items for a maintenance request
   */
  async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { maintenanceId } = req.params;

      const items = await prisma.maintenanceItem.findMany({
        where: { maintenanceId },
        include: {
          item: true,
        },
      });

      res.json(items);
    } catch (error) {
      next(error);
    }
  }
}
