import { Router } from "express";
import { BuildingsController } from "../controllers/buildings.controller";
import { requirePermission } from "../../../middleware/permission.middleware";

const router = Router();
const buildingsController = new BuildingsController();

/**
 * @swagger
 * /api/v1/buildings/bulk:
 *   post:
 *     summary: Bulk upload buildings
 *     description: Upload a file to create multiple buildings at once.
 *     tags: [Buildings]
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
  buildingsController.bulkBuildings,
);

/**
 * @swagger
 * /api/v1/buildings:
 *   get:
 *     summary: Get all buildings
 *     description: Retrieve a paginated list of all buildings with optional filtering
 *     tags: [Buildings]
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
 *         name: complexId
 *         schema:
 *           type: string
 *         description: Filter by complex ID
 *       - in: query
 *         name: mainUse
 *         schema:
 *           type: string
 *           enum: [OFFICE, RESIDENTIAL, RETAIL, INDUSTRIAL, EDUCATIONAL, HEALTHCARE, MIXED_USE, OTHER]
 *         description: Filter by main use
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
 *           enum: [name, code, createdAt, mainUse, condition, criticality]
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
 *         description: Paginated list of buildings
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
 *                           mainUse:
 *                             type: string
 *                           totalFloors:
 *                             type: number
 *                           address:
 *                             type: string
 *                           latitude:
 *                             type: number
 *                           longitude:
 *                             type: number
 *                           status:
 *                             type: string
 *                           condition:
 *                             type: string
 *                           criticality:
 *                             type: string
 *                           complexId:
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
 *     summary: Create a new building
 *     description: Create a new building in the system
 *     tags: [Buildings]
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
 *                 example: Building A
 *               code:
 *                 type: string
 *                 example: BLD-A-001
 *               mainUse:
 *                 type: string
 *                 enum: [OFFICE, RESIDENTIAL, RETAIL, INDUSTRIAL, EDUCATIONAL, HEALTHCARE, MIXED_USE, OTHER]
 *                 default: OFFICE
 *               totalFloors:
 *                 type: number
 *                 default: 1
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
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
 *               complexId:
 *                 type: string
 *               calenderEntityId:
 *                 type: string
 *               photoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Building successfully created
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
  .get(buildingsController.getAll)
  .post(buildingsController.create);

/**
 * @swagger
 * /api/v1/buildings/{id}:
 *   get:
 *     summary: Get building by ID
 *     description: Retrieve a specific building by its ID
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building ID
 *     responses:
 *       200:
 *         description: Building details
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
 *                     mainUse:
 *                       type: string
 *                     totalFloors:
 *                       type: number
 *                     address:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     status:
 *                       type: string
 *                     condition:
 *                       type: string
 *                     criticality:
 *                       type: string
 *                     complexId:
 *                       type: string
 *                     complex:
 *                       type: object
 *                     floors:
 *                       type: array
 *                       items:
 *                         type: object
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Building not found
 *   patch:
 *     summary: Update building
 *     description: Update an existing building
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               mainUse:
 *                 type: string
 *                 enum: [OFFICE, RESIDENTIAL, RETAIL, INDUSTRIAL, EDUCATIONAL, HEALTHCARE, MIXED_USE, OTHER]
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
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
 *               calenderEntityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Building successfully updated
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
 *         description: Building not found
 *   delete:
 *     summary: Delete building
 *     description: Delete a building from the system
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Building ID
 *     responses:
 *       200:
 *         description: Building successfully deleted
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
 *                   example: Building deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Building not found
 */
router
  .route("/:id")
  .get(buildingsController.getById)
  .patch(buildingsController.update)
  .delete(buildingsController.delete);

export default router;
