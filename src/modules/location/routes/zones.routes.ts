import { Router } from "express";
import { ZonesController } from "../controllers/zones.controller";
import { requirePermission } from "../../../middleware/permission.middleware";
import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();
const controller = new ZonesController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/zones/bulk:
 *   post:
 *     summary: Bulk upload zones
 *     description: Upload a file to create multiple zones at once.
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully, processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully. Processing Started
 *       400:
 *         description: Validation error or missing file
 *       401:
 *         description: Not authenticated
 */
router.post("/bulk", requirePermission("Site", "WRITE"), controller.bulkZones);

/**
 * @swagger
 * /api/v1/zones:
 *   get:
 *     summary: Get all zones
 *     description: Retrieve a paginated list of all zones with optional filtering
 *     tags: [Zones]
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
 *         description: Search by name or code
 *       - in: query
 *         name: floorId
 *         schema:
 *           type: string
 *         description: Filter by floor ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by zone type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_SERVICE, OUT_OF_SERVICE, UNDER_MAINTENANCE]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Paginated list of zones
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 *   post:
 *     summary: Create a new zone
 *     description: Create a new zone
 *     tags: [Zones]
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
 *               - floorId
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               floorId:
 *                 type: string
 *               type:
 *                 type: string
 *               availability:
 *                 type: string
 *                 default: IN_USE
 *               status:
 *                 type: string
 *                 default: ACTIVE
 *               photoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Zone successfully created
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router
  .route("/")
  .get(controller.findAll)
  .post(requirePermission("Site", "WRITE"), controller.create);

/**
 * @swagger
 * /api/v1/zones/{id}:
 *   get:
 *     summary: Get zone by ID
 *     description: Retrieve a specific zone by its ID
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone ID
 *     responses:
 *       200:
 *         description: Zone details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Zone not found
 *   patch:
 *     summary: Update zone
 *     description: Update an existing zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *               availability:
 *                 type: string
 *               floorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zone successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Zone not found
 *   delete:
 *     summary: Delete zone
 *     description: Delete a zone from the system
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone ID
 *     responses:
 *       204:
 *         description: Zone successfully deleted
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Zone not found
 */
router
  .route("/:id")
  .get(controller.findOne)
  .patch(requirePermission("Site", "WRITE"), controller.update)
  .delete(requirePermission("Site", "WRITE"), controller.remove);

export default router;
