import { Router } from "express";
import { RolesController } from "./roles.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

import permissionRouter from "../permissions/permissions.routes";

const router = Router();
const rolesController = new RolesController();

// All routes require authentication
router.use(authenticate);

router.use("/:roleId/permissions", permissionRouter);

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieve a list of all roles in the system (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                         enum: [ADMIN, MANAGER, TECHNICIAN, VIEWER]
 *                       description:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router
  .route("/")
  .get(
    requireRole(["Super Admin", "Admin"]),
    // requirePermission("Role", "READ"),
    rolesController.getAll
  )
  .post(requirePermission("Role", "WRITE"), rolesController.create);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Retrieve a specific role by its ID (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       enum: [ADMIN, MANAGER, TECHNICIAN, VIEWER]
 *                     description:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.get(
  "/:id",
  requireRole(["Super Admin", "Admin"]),
  requirePermission("Role", "READ"),
  rolesController.getById
);

router
  .route("/:id")
  .get(
    // requireRole(["Super Admin", "Admin"]),
    requirePermission("Role", "READ"),
    rolesController.getById
  )
  .patch(requirePermission("Role", "WRITE"), rolesController.update)
  .delete(requirePermission("Role", "WRITE"), rolesController.delete);

export default router;
