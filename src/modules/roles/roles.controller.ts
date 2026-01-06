import { Request, Response, NextFunction } from "express";
import { RolesService } from "./roles.service";

const rolesService = new RolesService();

export class RolesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await rolesService.findAll();

      res.status(200).json({
        success: true,
        data: { length: roles.length, roles },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await rolesService.findById(req.params.id);

      res.status(200).json({
        success: true,
        data: { role },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await rolesService.create(req.body);

      res.status(201).json({
        success: true,
        data: { role },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await rolesService.update(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: { role },
      });
    } catch (error) {
      next(error);
    }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await rolesService.delete(req.params.id);

      res.status(204).json({
        success: true,
        data: null,
        message: "Role deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
