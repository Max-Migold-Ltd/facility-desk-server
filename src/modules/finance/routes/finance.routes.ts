import { Router } from "express";
import { CostCenterController } from "../controllers/cost-center.controller";
import { validate } from "../../../middleware/validate.middleware";
import { PurchaseRequestController } from "../controllers/purchaseRequest.controller";
import { PurchaseOrderController } from "../controllers/purchaseOrder.controller";
import {
  createCostCenterValidation,
  createPurchaseRequestValidation,
  approvePurchaseRequestValidation,
  receivePurchaseOrderValidation,
} from "../finance.validation";

const router = Router();
const costCenterController = new CostCenterController();
const purchaseRequestController = new PurchaseRequestController();
const purchaseOrderController = new PurchaseOrderController();

// Cost Center Routes

/**
 * @swagger
 * /api/v1/finance/cost-centers:
 *   get:
 *     summary: Get all cost centers
 *     description: Retrieve a list of all cost centers
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cost centers
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
 *   post:
 *     summary: Create cost center
 *     description: Create a new cost center
 *     tags: [Finance]
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
 *               - budget
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               budget:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cost center created
 *       400:
 *         description: Validation error
 */
router
  .route("/cost-centers")
  .post(validate(createCostCenterValidation), costCenterController.create)
  .get(costCenterController.getAll);

/**
 * @swagger
 * /api/v1/finance/cost-centers/{id}:
 *   get:
 *     summary: Get cost center by ID
 *     description: Retrieve a specific cost center
 *     tags: [Finance]
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
 *         description: Cost center details
 *       404:
 *         description: Cost center not found
 *   patch:
 *     summary: Update budget paid
 *     description: Update budget paid amount
 *     tags: [Finance]
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
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Budget updated
 */
router
  .route("/cost-centers/:id")
  .get(costCenterController.getById)
  // .put(costCenterController.update) // TODO: Implement update
  .patch(costCenterController.budgetPaid); // Using patch for specific updates like budget

// Purchase Request Routes

/**
 * @swagger
 * /api/v1/finance/purchase-requests:
 *   get:
 *     summary: Get all purchase requests
 *     description: Retrieve all purchase requests
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchase requests
 *   post:
 *     summary: Create purchase request
 *     description: Create a new purchase request
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - requesterId
 *             properties:
 *               requesterId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Purchase request created
 *       400:
 *         description: Validation error
 */
router
  .route("/purchase-requests")
  .get(purchaseRequestController.getAll)
  .post(
    validate(createPurchaseRequestValidation),
    purchaseRequestController.create,
  );

/**
 * @swagger
 * /api/v1/finance/purchase-requests/{id}:
 *   get:
 *     summary: Get purchase request by ID
 *     description: Retrieve details of a purchase request
 *     tags: [Finance]
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
 *         description: Purchase request details
 *       404:
 *         description: Not found
 */
router.route("/purchase-requests/:id").get(purchaseRequestController.getById);

/**
 * @swagger
 * /api/v1/finance/purchase-requests/{id}/approve:
 *   post:
 *     summary: Approve purchase request
 *     description: Approve or reject a purchase request
 *     tags: [Finance]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase request approved/rejected
 */
router.post(
  "/purchase-requests/:id/approve",
  validate(approvePurchaseRequestValidation),
  purchaseRequestController.approvePR,
);

// Purchase Order Routes

/**
 * @swagger
 * /api/v1/finance/purchase-orders:
 *   get:
 *     summary: Get all purchase orders
 *     description: Retrieve all purchase orders
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchase orders
 */
router.route("/purchase-orders").get(purchaseOrderController.getAll);

/**
 * @swagger
 * /api/v1/finance/purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     description: Retrieve details of a purchase order
 *     tags: [Finance]
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
 *         description: Purchase order details
 *       404:
 *         description: Not found
 */
router.route("/purchase-orders/:id").get(purchaseOrderController.getById);

/**
 * @swagger
 * /api/v1/finance/purchase-orders/{id}/receive:
 *   post:
 *     summary: Receive purchase order
 *     description: Receive goods against a purchase order
 *     tags: [Finance]
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
 *             required:
 *               - warehouseId
 *               - items
 *             properties:
 *               warehouseId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Goods received successfully
 */
router.post(
  "/purchase-orders/:id/receive",
  validate(receivePurchaseOrderValidation),
  purchaseOrderController.receive,
);

export default router;
