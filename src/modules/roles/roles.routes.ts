import { Router } from 'express';
import { RolesController } from './roles.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { RoleName } from '../../../generated/prisma';

const router = Router();
const rolesController = new RolesController();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/roles
router.get(
  '/',
  requireRole([RoleName.ADMIN]),
  requirePermission('Role', 'READ'),
  rolesController.getAll
);

// GET /api/v1/roles/:id
router.get(
  '/:id',
  requireRole([RoleName.ADMIN]),
  requirePermission('Role', 'READ'),
  rolesController.getById
);

export default router;
