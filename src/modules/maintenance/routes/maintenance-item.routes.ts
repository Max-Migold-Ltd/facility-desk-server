import { Router } from "express";
import { MaintenanceItemController } from "../controllers/maintenance-item.controller";
import { requirePermission } from "../../../middleware/permission.middleware";
import { authenticate } from "../../../middleware/auth.middleware";

const router = Router({ mergeParams: true });
const controller = new MaintenanceItemController();

/**
 * @swagger
 * /api/v1/maintenance/{maintenanceId}/items:
 *   get:
 *     summary: Get items used in a maintenance request
 *     tags: [Maintenance Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of items used
 *
 *   post:
 *     summary: Add an item to a maintenance request
 *     tags: [Maintenance Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, quantity]
 *             properties:
 *               itemId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item added to maintenance
 */
router
  .route("/")
  .get(authenticate, requirePermission("Items", "READ"), controller.getItems)
  .post(authenticate, requirePermission("Items", "WRITE"), controller.addItem);

// router
//   .route("/:id")
//   .get(authenticate, requirePermission("Items", "READ"), controller.getItem)
//   .patch(authenticate, requirePermission("Items", "WRITE"), controller.updateItem)
//   .delete(authenticate, requirePermission("Items", "WRITE"), controller.deleteItem);

export default router;
