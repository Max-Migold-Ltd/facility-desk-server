import { Router } from "express";
import { PermissionsController } from "./permissions.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/rbac.middleware";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router({ mergeParams: true });
const permissionsController = new PermissionsController();

// All routes require authentication
router.use(authenticate);

router
  .route("/")
  .get(requirePermission("Permission", "READ"), permissionsController.getAll)
  .post(requirePermission("Permission", "WRITE"), permissionsController.create);

router
  .route("/:id")
  .get(requirePermission("Permission", "READ"), permissionsController.getById)
  .patch(requirePermission("Permission", "WRITE"), permissionsController.update)
  .delete(
    requirePermission("Permission", "WRITE"),
    permissionsController.delete
  );

/**
 * @swagger
 * /api/v1/roles/{roleId}/permissions:
 *   get:
 *     summary: Get role permissions
 *     description: Retrieve all permissions assigned to a specific role (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: List of role permissions
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
 *                       resource:
 *                         type: string
 *                         example: User
 *                       action:
 *                         type: string
 *                         enum: [READ, WRITE, DELETE]
 *                       roleId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
router.get(
  "/:roleId/permissions",
  requireRole(["Super Admin", "Admin"]),
  requirePermission("Permission", "READ"),
  permissionsController.getAll
);

/**
 * @swagger
 * /api/v1/roles/{roleId}/permissions:
 *   put:
 *     summary: Update role permissions
 *     description: Update the permissions assigned to a specific role (Admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - resource
 *                     - action
 *                   properties:
 *                     resource:
 *                       type: string
 *                       example: User
 *                     action:
 *                       type: string
 *                       enum: [READ, WRITE, DELETE]
 *                       example: READ
 *     responses:
 *       200:
 *         description: Permissions successfully updated
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Role not found
 */
// router.put(
//   "/:roleId/permissions",
//   requireRole(["ADMIN"]),
//   requirePermission("Permission", "WRITE"),
//   permissionsController.updateRolePermissions
// );

export default router;
