import { Request, Response, NextFunction } from "express";
import { WarehouseService } from "../services/warehouse.service";
import { CreateWarehouseDto, UpdateWarehouseDto } from "../dtos/warehouse.dto";

const warehouseService = new WarehouseService();

export class WarehouseController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query;

      const result = await warehouseService.findAll({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: result.warehouses,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouse = await warehouseService.findById(req.params.id);

      res.status(200).json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateWarehouseDto = req.body;
      const warehouse = await warehouseService.create(data);

      res.status(201).json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data: UpdateWarehouseDto = req.body;
      const warehouse = await warehouseService.update(req.params.id, data);

      res.status(200).json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await warehouseService.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Warehouse deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
