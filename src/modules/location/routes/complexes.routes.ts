import { Router } from "express";
import { ComplexesController } from "../controllers/complexes.controller";
import { requirePermission } from "../../../middleware/permission.middleware";

const router = Router();
const complexesController = new ComplexesController();

/**
 * @swagger
 * /api/v1/complexes/bulk:
 *   post:
 *     summary: Bulk upload complexes
 *     description: Upload a file to create multiple complexes at once.
 *     tags: [Complexes]
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
  complexesController.bulkComplexes,
);

/**
 * @swagger
 * /api/v1/complexes:
 *   get:
 *     summary: Get all complexes
 *     description: Retrieve a paginated list of all complexes/sites with optional filtering
 *     tags: [Complexes]
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
 *           enum: [name, code, createdAt, condition, criticality]
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
 *         description: Paginated list of complexes
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
 *                           description:
 *                             type: string
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *                           state:
 *                             type: string
 *                           zip:
 *                             type: string
 *                           status:
 *                             type: string
 *                           condition:
 *                             type: string
 *                           criticality:
 *                             type: string
 *                           totalBuildings:
 *                             type: number
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
 *     summary: Create a new complex
 *     description: Create a new complex/site in the system
 *     tags: [Complexes]
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
 *             properties:
 *               code:
 *                 type: string
 *                 example: COMP-001
 *               name:
 *                 type: string
 *                 example: Main Campus Complex
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
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
 *               totalBuildings:
 *                 type: number
 *                 default: 0
 *               photoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Complex successfully created
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
  .get(complexesController.getAll)
  .post(complexesController.create);

/**
 * @swagger
 * /api/v1/complexes/{id}:
 *   get:
 *     summary: Get complex by ID
 *     description: Retrieve a specific complex by its ID
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Complex ID
 *     responses:
 *       200:
 *         description: Complex details
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
 *                     description:
 *                       type: string
 *                     address:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zip:
 *                       type: string
 *                     status:
 *                       type: string
 *                     condition:
 *                       type: string
 *                     criticality:
 *                       type: string
 *                     totalBuildings:
 *                       type: number
 *                     buildings:
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
 *         description: Complex not found
 *   patch:
 *     summary: Update complex
 *     description: Update an existing complex
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Complex ID
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
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [IN_SERVICE, OUT_OF_SERVICE, UNDER_MAINTENANCE]
 *               condition:
 *                 type: string
 *                 enum: [EXCELLENT, GOOD, FAIR, POOR, CRITICAL]
 *               criticality:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: Complex successfully updated
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
 *         description: Complex not found
 *   delete:
 *     summary: Delete complex
 *     description: Delete a complex from the system
 *     tags: [Complexes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Complex ID
 *     responses:
 *       200:
 *         description: Complex successfully deleted
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
 *                   example: Complex deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Complex not found
 */
router
  .route("/:id")
  .get(complexesController.getById)
  .patch(complexesController.update)
  .delete(complexesController.delete);

export default router;
