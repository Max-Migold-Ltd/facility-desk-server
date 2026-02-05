import { Router } from "express";
import { PermissionsController } from "./permissions.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "./permission.validation";

const router = Router({ mergeParams: true });
const permissionsController = new PermissionsController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       required:
 *         - resource
 *         - accessLevel
 *       properties:
 *         id:
 *           type: string
 *         roleId:
 *           type: string
 *         resource:
 *           type: string
 *         accessLevel:
 *           type: string
 *           enum: [NONE, READ, WRITE]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: string
 *         description: Filter by Role ID
 *     responses:
 *       200:
 *         description: List of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authenticated
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - accessLevel
 *             properties:
 *               roleId:
 *                 type: string
 *               resource:
 *                 type: string
 *               accessLevel:
 *                 type: string
 *                 enum: [NONE, READ, WRITE]
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router
  .route("/")
  .get(requirePermission("Permission", "READ"), permissionsController.getAll)
  .post(
    requirePermission("Permission", "WRITE"),
    validate(createPermissionSchema),
    permissionsController.create,
  );

/**
 * @swagger
 * /api/v1/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Permission not found
 *   patch:
 *     summary: Update permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resource:
 *                 type: string
 *               accessLevel:
 *                 type: string
 *                 enum: [NONE, READ, WRITE]
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Permission not found
 *   delete:
 *     summary: Delete permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       204:
 *         description: Permission deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Permission not found
 */
router
  .route("/:id")
  .get(requirePermission("Permission", "READ"), permissionsController.getById)
  .patch(
    requirePermission("Permission", "WRITE"),
    validate(updatePermissionSchema),
    permissionsController.update,
  )
  .delete(
    requirePermission("Permission", "WRITE"),
    permissionsController.delete,
  );

export default router;
