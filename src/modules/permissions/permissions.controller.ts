import { Request, Response, NextFunction } from 'express';
import { PermissionsService } from './permissions.service';

const permissionsService = new PermissionsService();

export class PermissionsController {
  async getRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await permissionsService.findByRole(req.params.roleId);

      res.status(200).json({
        success: true,
        data: { permissions }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await permissionsService.updateRolePermissions(
        req.params.roleId,
        req.body.permissions
      );

      res.status(200).json({
        success: true,
        data: { permissions }
      });
    } catch (error) {
      next(error);
    }
  }
}
