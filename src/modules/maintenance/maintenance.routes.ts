import { Router } from "express";
import { MaintenanceController } from "./maintenance.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { body } from "express-validator";
import { validate } from "../../middleware/validate.middleware";
import maintenanceItemRouter from "./routes/maintenance-item.routes";
// import { requirePermission } from "../../middleware/permission.middleware"; // Use if needed

const router = Router();

router.use("/:maintenanceId/items", maintenanceItemRouter);
const maintenanceController = new MaintenanceController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/maintenance:
 *   post:
 *     summary: Create a corrective maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, siteId, requesterId]
 *             properties:
 *               description:
 *                 type: string
 *               siteId:
 *                 type: string
 *                 format: uuid
 *               assetId:
 *                 type: string
 *                 format: uuid
 *               requesterId:
 *                 type: string
 *                 format: uuid
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  "/",
  validate([
    body("description").notEmpty().withMessage("Description is required"),
    body("siteId").isUUID().withMessage("Valid Site ID is required"),
    body("assetId")
      .optional()
      .isUUID()
      .withMessage("Valid Asset ID is required"),
    body("requesterId").isUUID().withMessage("Valid Requester ID is required"),
    body("priority")
      .optional()
      .isIn(["LOW", "MEDIUM", "HIGH"])
      .withMessage("Invalid priority"),
    body("startDate").optional().isISO8601().withMessage("Invalid start date"),
    body("endDate").optional().isISO8601().withMessage("Invalid end date"),
  ]),
  maintenanceController.create
);

/**
 * @swagger
 * /api/v1/maintenance:
 *   get:
 *     summary: Get all maintenance requests
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [PREVENTIVE, CORRECTIVE] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH] }
 *       - in: query
 *         name: processStatus
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *       - in: query
 *         name: minDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: maxDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: assetId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of maintenance requests
 */
router.get("/", maintenanceController.getAll);

/**
 * @swagger
 * /api/v1/maintenance/{id}:
 *   get:
 *     summary: Get maintenance by ID
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Details
 */
router.get("/:id", maintenanceController.getById);

/**
 * @swagger
 * /api/v1/maintenance/{id}:
 *   patch:
 *     summary: Update maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               processStatus: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *               outcome: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch("/:id", maintenanceController.update);

/**
 * @swagger
 * /api/v1/maintenance/{id}:
 *   delete:
 *     summary: Delete maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/:id", maintenanceController.delete);

/**
 * @swagger
 * /api/v1/maintenance/{id}/assign:
 *   patch:
 *     summary: Assign maintenance to user or team
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigneeId: { type: string, format: uuid }
 *               teamId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Assigned
 */
router.patch(
  "/:id/assign",
  validate([
    body("assigneeId")
      .optional()
      .isUUID()
      .withMessage("Valid Assignee ID is required"),
    body("teamId").optional().isUUID().withMessage("Valid Team ID is required"),
  ]),
  maintenanceController.assign
);

/**
 * @swagger
 * /api/v1/maintenance/{id}/status:
 *   patch:
 *     summary: Update maintenance status
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Status Updated
 */
router.patch(
  "/:id/status",
  validate([
    body("status")
      .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"])
      .withMessage("Invalid status"),
    body("notes").optional().isString(),
  ]),
  maintenanceController.updateStatus
);

/**
 * @swagger
 * /api/v1/maintenance/{id}/photos:
 *   post:
 *     summary: Attach a photo to maintenance request
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Photo attached
 */
router.post(
  "/:id/photos",
  validate([body("url").isURL().withMessage("Valid URL is required")]),
  maintenanceController.attachPhoto
);

export default router;
