import { Router } from "express";
import { WarehouseController } from "../controllers/warehouse.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { requirePermission } from "../../../middleware/permission.middleware";
import { validate } from "../../../middleware/validate.middleware";
import {
  createWarehouseValidation,
  updateWarehouseValidation,
} from "../validations/warehouse.validation";

const router = Router();
const warehouseController = new WarehouseController();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Warehouse management
 */

/**
 * @swagger
 * /api/v1/logistics/warehouses:
 *   get:
 *     summary: Get all warehouses
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of warehouses
 *   post:
 *     summary: Create warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - complexId
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               complexId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Warehouse created
 *       400:
 *         description: Validation error
 */
router
  .route("/")
  .get(warehouseController.getAll)
  .post(validate(createWarehouseValidation), warehouseController.create);

/**
 * @swagger
 * /api/v1/logistics/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse details
 *       404:
 *         description: Not found
 *   patch:
 *     summary: Update warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Warehouse updated
 *   delete:
 *     summary: Delete warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse deleted
 */
router
  .route("/:id")
  .get(warehouseController.getById)
  .patch(validate(updateWarehouseValidation), warehouseController.update)
  .delete(warehouseController.delete);

export default router;
