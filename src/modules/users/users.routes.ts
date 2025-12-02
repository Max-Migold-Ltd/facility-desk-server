import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { requirePermission } from '../../middleware/permission.middleware';
import { RoleName } from '../../generated/prisma';

const router = Router();
const usersController = new UsersController();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/users
router.get(
  '/',
  requireRole([RoleName.ADMIN]),
  requirePermission('User', 'READ'),
  usersController.getAll
);

// GET /api/v1/users/:id
router.get(
  '/:id',
  requirePermission('User', 'READ'),
  usersController.getById
);

// PUT /api/v1/users/:id
router.put(
  '/:id',
  requireRole([RoleName.ADMIN]),
  requirePermission('User', 'WRITE'),
  usersController.update
);

// DELETE /api/v1/users/:id
router.delete(
  '/:id',
  requireRole([RoleName.ADMIN]),
  requirePermission('User', 'WRITE'),
  usersController.delete
);

export default router;
