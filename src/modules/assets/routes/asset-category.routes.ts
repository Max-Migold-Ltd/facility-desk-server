import { Router } from "express";
import { AssetCategoryController } from "../controllers/asset-category.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { requirePermission } from "../../../middleware/permission.middleware";

const router = Router();
const assetCategoryController = new AssetCategoryController();

/**
 * @swagger
 * /api/v1/asset-categories:
 *   get:
 *     summary: Get all asset categories
 *     description: Retrieve a paginated list of all asset categories with optional filtering
 *     tags: [AssetCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DEVICES, FINISHINGS, ITEMS, MACHINERIES]
 *         description: Filter by category type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, type, createdAt]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of asset categories
 *       401:
 *         description: Not authenticated
 *   post:
 *     summary: Create a new asset category
 *     description: Create a new asset category
 *     tags: [AssetCategories]
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
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Devices
 *               type:
 *                 type: string
 *                 enum: [DEVICES, FINISHINGS, ITEMS, MACHINERIES]
 *                 example: DEVICES
 *               description:
 *                 type: string
 *                 example: Electronic devices and equipment
 *     responses:
 *       201:
 *         description: Asset category successfully created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router
  .route("/")
  .get(assetCategoryController.getAll)
  .post(authenticate, requirePermission("Asset", "WRITE"), assetCategoryController.create);

/**
 * @swagger
 * /api/v1/asset-categories/{id}:
 *   get:
 *     summary: Get asset category by ID
 *     description: Retrieve a specific asset category by its ID
 *     tags: [AssetCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset category ID
 *     responses:
 *       200:
 *         description: Asset category details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Asset category not found
 *   patch:
 *     summary: Update asset category
 *     description: Update an existing asset category
 *     tags: [AssetCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [DEVICES, FINISHINGS, ITEMS, MACHINERIES]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset category successfully updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Asset category not found
 *   delete:
 *     summary: Delete asset category
 *     description: Delete an asset category from the system
 *     tags: [AssetCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset category ID
 *     responses:
 *       200:
 *         description: Asset category successfully deleted
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Asset category not found
 */
router
  .route("/:id")
  .get(assetCategoryController.getById)
  .patch(authenticate, requirePermission("Asset", "WRITE"), assetCategoryController.update)
  .delete(authenticate, requirePermission("Asset", "WRITE"), assetCategoryController.delete);

export default router;

