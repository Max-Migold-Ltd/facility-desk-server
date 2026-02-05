import { Router } from "express";
import { MaintenanceController } from "./maintenance.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import maintenanceItemRouter from "./routes/maintenance-item.routes";
import {
  createMaintenanceSchema,
  assignMaintenanceSchema,
  updateMaintenanceStatusSchema,
  createPreventiveMaintenanceSchema,
  updateMaintenanceSchema,
} from "./maintenance.validation";
import { body } from "express-validator";

const router = Router();

router.use("/:maintenanceId/items", maintenanceItemRouter);
const maintenanceController = new MaintenanceController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/maintenance/preventive:
 *   post:
 *     summary: Create a preventive maintenance configuration
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, siteId]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               siteId: { type: string, format: uuid }
 *               frequency:
 *                 type: string
 *                 enum: [DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               duration: { type: integer, description: "Duration in minutes" }
 *               assetId: { type: string, format: uuid }
 *               buildingId: { type: string, format: uuid }
 *               floorId: { type: string, format: uuid }
 *               spaceId: { type: string, format: uuid }
 *               zoneId: { type: string, format: uuid }
 *               teamId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
router.post(
  "/preventive",
  validate(createPreventiveMaintenanceSchema),
  maintenanceController.createPreventive,
);

/**
 * @swagger
 * /api/v1/maintenance:
 *   post:
 *     summary: Create a maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, description, siteId, requesterId]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [CORRECTIVE, PREDICTIVE, EMERGENCY, INSPECTION, CALIBRATION, SMALL_PROJECT, SOFT_SERVICE]
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
 *       400:
 *         description: Validation error
 */

router
  .route("/")
  .get(maintenanceController.getAll)
  .post(validate(createMaintenanceSchema), maintenanceController.create);

router
  .route("/:id")
  .get(maintenanceController.getById)
  .patch(validate(updateMaintenanceSchema), maintenanceController.update)
  .delete(maintenanceController.delete);

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
  validate(assignMaintenanceSchema),
  maintenanceController.assign,
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
  validate(updateMaintenanceStatusSchema),
  maintenanceController.updateStatus,
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
  maintenanceController.attachPhoto,
);

/**
 * @swagger
 * /api/v1/maintenance/{id}/log-work:
 *   get:
 *     summary: Get work logs for a maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of work logs
 */
router.get("/:id/log-work", maintenanceController.getLogWork);

/**
 * @swagger
 * /api/v1/maintenance/{id}/financial-summary:
 *   get:
 *     summary: Get financial summary of a maintenance request
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Financial summary including labor and material costs
 */
router.get("/:id/financial-summary", maintenanceController.getFinancialSummary);

/**
 * @swagger
 * /api/v1/maintenance/{id}/labor-cost:
 *   get:
 *     summary: Get labor cost details
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Labor cost breakdown
 */
router.get("/:id/labor-cost", maintenanceController.getLaborCost);

/**
 * @swagger
 * /api/v1/maintenance/{id}/material-cost:
 *   get:
 *     summary: Get material cost details
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Material cost breakdown
 */
router.get("/:id/material-cost", maintenanceController.getMaterialCost);

export default router;
