import { Router } from "express";
import { StockController } from "../controllers/stock.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { requirePermission } from "../../../middleware/permission.middleware";
import { validate } from "../../../middleware/validate.middleware";
import {
  createStockMovementValidation,
  stockFilterValidation,
  stockMovementFilterValidation,
} from "../validations/stock.validation";

const router = Router();
const stockController = new StockController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/logistics/stocks:
 *   get:
 *     summary: Get current stocks
 *     description: Retrieve current stock levels with filtering
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of stocks
 */
router.get(
  "/stocks",
  requirePermission("Stock", "READ"),
  validate(stockFilterValidation),
  stockController.getStocks,
);

/**
 * @swagger
 * /api/v1/logistics/movements:
 *   get:
 *     summary: Get stock movements
 *     description: Retrieve stock movement history
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [LOAD, UNLOAD, TRANSFER]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of stock movements
 */
router.get(
  "/movements",
  requirePermission("Stock", "READ"),
  validate(stockMovementFilterValidation),
  stockController.getMovements,
);

/**
 * @swagger
 * /api/v1/logistics/movements:
 *   post:
 *     summary: Create stock movement
 *     description: Create a new stock movement (Load, Unload, Transfer)
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - quantity
 *               - itemId
 *               - warehouseId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [LOAD, UNLOAD, TRANSFER]
 *               quantity:
 *                 type: number
 *               itemId:
 *                 type: string
 *               warehouseId:
 *                 type: string
 *               targetWarehouseId:
 *                 type: string
 *                 description: Required for TRANSFER
 *     responses:
 *       201:
 *         description: Stock movement created
 *       400:
 *         description: Validation error
 */
router.post(
  "/movements",
  requirePermission("Stock", "WRITE"),
  validate(createStockMovementValidation),
  stockController.createMovement,
);

export default router;
