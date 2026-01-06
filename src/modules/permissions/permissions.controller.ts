import { Request, Response, NextFunction } from "express";
import { PermissionsService } from "./permissions.service";
import { NotFoundError } from "../../errors";

const permissionsService = new PermissionsService();

export class PermissionsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      let roleId =
        (req.params.roleId as string) || (req.query.roleId as string);

      const permissions = await permissionsService.getAll(roleId);

      res.status(200).json({
        success: true,
        data: { length: permissions.length, permissions },
      });
    } catch (error) {
      next(error);
    }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const permission = await permissionsService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: { permission },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const permission = await permissionsService.create(req.body);
      res.status(201).json({
        success: true,
        data: { permission },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const permission = await permissionsService.update(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        data: { permission },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await permissionsService.delete(req.params.id);
      res.status(204).json({
        success: true,
        data: null,
        message: "Permission deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
