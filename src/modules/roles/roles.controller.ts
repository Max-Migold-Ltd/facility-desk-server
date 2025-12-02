import { Request, Response, NextFunction } from 'express';
import { RolesService } from './roles.service';

const rolesService = new RolesService();

export class RolesController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await rolesService.findAll();

      res.status(200).json({
        success: true,
        data: { roles }
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
        data: { role }
      });
    } catch (error) {
      next(error);
    }
  }
}
