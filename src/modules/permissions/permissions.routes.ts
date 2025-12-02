import { Router } from 'express';
import { PermissionsController } from './permissions.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { RoleName } from '../../generated/prisma';

const router = Router();
const permissionsController = new PermissionsController();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/roles/:roleId/permissions
router.get(
  '/:roleId/permissions',
  requireRole([RoleName.ADMIN]),
  requirePermission('Permission', 'READ'),
  permissionsController.getRolePermissions
);

// PUT /api/v1/roles/:roleId/permissions
router.put(
  '/:roleId/permissions',
  requireRole([RoleName.ADMIN]),
  requirePermission('Permission', 'WRITE'),
  permissionsController.updateRolePermissions
);

export default router;
