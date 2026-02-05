import { Request, Response, NextFunction } from "express";
import { MaintenanceService } from "./maintenance.service";
import { MaintenanceQueryDto } from "./dto/maintenance-query.dto";

const maintenanceService = new MaintenanceService();

export class MaintenanceController {
  async getFinancialSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const maintenance = await maintenanceService.getFinancialSummary(req.params.id);
      res.status(200).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLaborCost(req: Request, res: Response, next: NextFunction) {
    try {
      const maintenance = await maintenanceService.getLaborCost(req.params.id);
      res.status(200).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMaterialCost(req: Request, res: Response, next: NextFunction) {
    try {
      const maintenance = await maintenanceService.getMaterialCost(req.params.id);
      res.status(200).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLogWork(req: Request, res: Response, next: NextFunction) {
    try {
      const maintenance = await maintenanceService.logWork(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const maintenance = await maintenanceService.create(req.body);
      res.status(201).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPreventive(req: Request, res: Response, next: NextFunction) {
    try {
      const maintenance = await maintenanceService.createPreventive(req.body);
      res.status(201).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await maintenanceService.findAll(
        req.query as unknown as MaintenanceQueryDto,
      );
      res.status(200).json({
        success: true,
        data: result.maintenances,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const maintenance = await maintenanceService.findById(req.params.id);
      res.status(200).json({
        success: true,
        data: { maintenance },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const maintenance = await maintenanceService.update(
        req.params.id,
        req.body,
      );
      res.status(200).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await maintenanceService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: "Maintenance deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const { assigneeId, teamId } = req.body;
      const maintenance = await maintenanceService.assign(
        req.params.id,
        assigneeId,
        teamId,
      );
      res.status(200).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      const maintenance = await maintenanceService.updateStatus(
        req.params.id,
        status,
        notes,
      );
      res.status(200).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }

  async attachPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;
      const maintenance = await maintenanceService.addPhoto(req.params.id, url);
      res.status(200).json({
        success: true,
        data: maintenance,
      });
    } catch (error) {
      next(error);
    }
  }
}
