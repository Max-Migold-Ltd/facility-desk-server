import { Request, Response, NextFunction } from "express";
import { StockService } from "../services/stock.service";
import { CreateStockMovementDto } from "../dtos/stock.dto";
import { StockMovementType } from "../../../generated/prisma";

const stockService = new StockService();

export class StockController {
  // Stock Endpoints
  async getStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, warehouseId, itemId } = req.query;

      const result = await stockService.getStocks({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        warehouseId: warehouseId as string,
        itemId: itemId as string,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Stock Movement Endpoints
  async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, warehouseId, itemId, type, startDate, endDate } =
        req.query;

      const result = await stockService.getStockMovements({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        warehouseId: warehouseId as string,
        itemId: itemId as string,
        type: type as StockMovementType,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateStockMovementDto = req.body;
      const movement = await stockService.createMovement(data);

      res.status(201).json({
        success: true,
        data: { movement },
      });
    } catch (error) {
      next(error);
    }
  }
}
