import { Router } from "express";
import { requirePermission } from "../../../middleware/permission.middleware";
import { SpacesController } from "../controllers/spaces.controller";

const router = Router();
const spacesController = new SpacesController();

/**
 * @swagger
 * /api/v1/spaces/bulk:
 *   post:
 *     summary: Bulk upload spaces (rooms)
 *     description: Upload a file to create multiple spaces at once.
 *     tags: [Spaces]
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
  spacesController.bulkSpaces,
);

/**
 * @swagger
 * /api/v1/spaces:
 *   get:
 *     summary: Get all spaces
 *     description: Retrieve a paginated list of all spaces with optional filtering
 *     tags: [Spaces]
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
 *         name: zoneId
 *         schema:
 *           type: string
 *         description: Filter by zone ID
 *       - in: query
 *         name: use
 *         schema:
 *           type: string
 *           enum: [OFFICE, CONFERENCE, STORAGE, RESTROOM, KITCHEN, LOBBY, WORKSPACE, UTILITY, OTHER]
 *         description: Filter by room use
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, code, createdAt, use]
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
 *         description: Paginated list of rooms
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
 *                           use:
 *                             type: string
 *                           floorId:
 *                             type: string
 *                           unitId:
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
 *     summary: Create a new room
 *     description: Create a new room on a floor or within a unit
 *     tags: [Rooms]
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
 *                 example: Conference Room A
 *               code:
 *                 type: string
 *                 example: RM-101-A
 *               use:
 *                 type: string
 *                 enum: [OFFICE, CONFERENCE, STORAGE, RESTROOM, KITCHEN, LOBBY, WORKSPACE, UTILITY, OTHER]
 *                 default: OFFICE
 *               floorId:
 *                 type: string
 *               unitId:
 *                 type: string
 *                 description: Optional - if room belongs to a specific unit
 *               photoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Room successfully created
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
router.route("/").get(spacesController.getAll).post(spacesController.create);

/**
 * @swagger
 * /api/v1/spaces/{id}:
 *   get:
 *     summary: Get space by ID
 *     description: Retrieve a specific space by its ID
 *     tags: [Spaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room details
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
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                     use:
 *                       type: string
 *                     floorId:
 *                       type: string
 *                     zoneId:
 *                       type: string
 *                     floor:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         code:
 *                           type: string
 *                         name:
 *                           type: string
 *                         level:
 *                           type: number
 *                     zone:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         code:
 *                           type: string
 *                         name:
 *                           type: string
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
 *         description: Room not found
 *   patch:
 *     summary: Update room
 *     description: Update an existing room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               use:
 *                 type: string
 *                 enum: [OFFICE, CONFERENCE, STORAGE, RESTROOM, KITCHEN, LOBBY, WORKSPACE, UTILITY, OTHER]
 *               floorId:
 *                 type: string
 *               unitId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room successfully updated
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
 *         description: Room not found
 *   delete:
 *     summary: Delete room
 *     description: Delete a room from the system
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room successfully deleted
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
 *                   example: Room deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Room not found
 */
router
  .route("/:id")
  .get(spacesController.getById)
  .patch(spacesController.update)
  .delete(spacesController.delete);

export default router;
