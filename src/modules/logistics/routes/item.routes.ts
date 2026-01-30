import { Router } from "express";
import { ItemController } from "../controllers/item.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { requirePermission } from "../../../middleware/permission.middleware";

const router = Router();
const controller = new ItemController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/logistics/items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve all logistics items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 *   post:
 *     summary: Create item
 *     description: Create a new logistics item
 *     tags: [Items]
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
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               unitOfMeasure:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created
 *       400:
 *         description: Validation error
 */
router
  .route("/")
  .post(requirePermission("Items", "WRITE"), controller.create)
  .get(controller.getAll);

/**
 * @swagger
 * /api/v1/logistics/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieve a specific item
 *     tags: [Items]
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
 *         description: Item details
 *       404:
 *         description: Not found
 *   patch:
 *     summary: Update item
 *     description: Update an existing item
 *     tags: [Items]
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
 *         description: Item updated
 *   delete:
 *     summary: Delete item
 *     description: Delete an item
 *     tags: [Items]
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
 *         description: Item deleted
 */
router
  .route("/:id")
  .get(controller.getOne)
  .patch(requirePermission("Items", "WRITE"), controller.update)
  .delete(requirePermission("Items", "WRITE"), controller.delete);

export default router;
