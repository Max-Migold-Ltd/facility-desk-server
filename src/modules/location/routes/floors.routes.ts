import { Router } from "express";
import { FloorsController } from "../controllers/floors.controller";
import { requirePermission } from "../../../middleware/permission.middleware";

const router = Router();
const floorsController = new FloorsController();

/**
 * @swagger
 * /api/v1/floors/bulk:
 *   post:
 *     summary: Bulk upload floors
 *     description: Upload a file to create multiple floors at once.
 *     tags: [Floors]
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
router.post(
  "/bulk",
  requirePermission("Site", "WRITE"),
  floorsController.bulkfloors,
);

/**
 * @swagger
 * /api/v1/floors:
 *   get:
 *     summary: Get all floors
 *     description: Retrieve a paginated list of all floors with optional filtering
 *     tags: [Floors]
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
 *         name: buildingId
 *         schema:
 *           type: string
 *         description: Filter by building ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_SERVICE, OUT_OF_SERVICE, UNDER_MAINTENANCE]
 *         description: Filter by status
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [EXCELLENT, GOOD, FAIR, POOR, CRITICAL]
 *         description: Filter by condition
 *       - in: query
 *         name: criticality
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         description: Filter by criticality
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, code, createdAt, level, condition, criticality]
 *           default: level
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of floors
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
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           code:
 *                             type: string
 *                           name:
 *                             type: string
 *                           level:
 *                             type: number
 *                           grossArea:
 *                             type: number
 *                           status:
 *                             type: string
 *                           condition:
 *                             type: string
 *                           criticality:
 *                             type: string
 *                           buildingId:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Not authenticated
 *   post:
 *     summary: Create a new floor
 *     description: Create a new floor in a building
 *     tags: [Floors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - level
 *               - buildingId
 *             properties:
 *               code:
 *                 type: string
 *                 example: FLR-001
 *               name:
 *                 type: string
 *                 example: Ground Floor
 *               level:
 *                 type: number
 *                 example: 0
 *                 description: Floor level (e.g., 0 for ground, 1 for first floor, -1 for basement)
 *               grossArea:
 *                 type: number
 *                 example: 1200.5
 *                 description: Floor area in square meters
 *               status:
 *                 type: string
 *                 enum: [IN_SERVICE, OUT_OF_SERVICE, UNDER_MAINTENANCE]
 *                 default: IN_SERVICE
 *               condition:
 *                 type: string
 *                 enum: [EXCELLENT, GOOD, FAIR, POOR, CRITICAL]
 *                 default: GOOD
 *               criticality:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 default: MEDIUM
 *               buildingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Floor successfully created
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
router.route("/").get(floorsController.getAll).post(floorsController.create);

/**
 * @swagger
 * /api/v1/floors/{id}:
 *   get:
 *     summary: Get floor by ID
 *     description: Retrieve a specific floor by its ID
 *     tags: [Floors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Floor ID
 *     responses:
 *       200:
 *         description: Floor details
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
 *                     code:
 *                       type: string
 *                     name:
 *                       type: string
 *                     level:
 *                       type: number
 *                     grossArea:
 *                       type: number
 *                     status:
 *                       type: string
 *                     condition:
 *                       type: string
 *                     criticality:
 *                       type: string
 *                     buildingId:
 *                       type: string
 *                     building:
 *                       type: object
 *                     rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                     units:
 *                       type: array
 *                       items:
 *                         type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Floor not found
 *   patch:
 *     summary: Update floor
 *     description: Update an existing floor
 *     tags: [Floors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Floor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: number
 *               grossArea:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [IN_SERVICE, OUT_OF_SERVICE, UNDER_MAINTENANCE]
 *               condition:
 *                 type: string
 *                 enum: [EXCELLENT, GOOD, FAIR, POOR, CRITICAL]
 *               criticality:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               buildingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Floor successfully updated
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
 *       404:
 *         description: Floor not found
 *   delete:
 *     summary: Delete floor
 *     description: Delete a floor from the system
 *     tags: [Floors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Floor ID
 *     responses:
 *       200:
 *         description: Floor successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Floor deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Floor not found
 */
router
  .route("/:id")
  .get(floorsController.getById)
  .patch(floorsController.update)
  .delete(floorsController.delete);

export default router;
