import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import * as MeterController from "./meter.controller";
import * as ReadingController from "./reading.controller";
import { createMeterDto, updateMeterDto } from "./meter.dto";
import { validate } from "../../middleware/validate.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/metering:
 *   get:
 *     summary: Get all meters
 *     tags: [Metering]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meters
 *   post:
 *     summary: Create meter
 *     tags: [Metering]
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
 *               - unitOfMeasure
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               unitOfMeasure:
 *                 type: string
 *               locationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Meter created
 *       400:
 *         description: Validation error
 */
router
  .route("/")
  .get(MeterController.getMeters)
  .post(validate(createMeterDto), MeterController.createMeter);

/**
 * @swagger
 * /api/v1/metering/{id}:
 *   get:
 *     summary: Get meter by ID
 *     tags: [Metering]
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
 *         description: Meter details
 *       404:
 *         description: Not found
 *   patch:
 *     summary: Update meter
 *     tags: [Metering]
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
 *               locationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Meter updated
 *   delete:
 *     summary: Delete meter
 *     tags: [Metering]
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
 *         description: Meter deleted
 */
router
  .route("/:id")
  .get(MeterController.getMeterById)
  .patch(validate(updateMeterDto), MeterController.updateMeter)
  .delete(MeterController.deleteMeter);

// Readings

/**
 * @swagger
 * /api/v1/metering/readings:
 *   post:
 *     summary: Record meter reading
 *     tags: [Metering]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meterId
 *               - value
 *               - readingDate
 *             properties:
 *               meterId:
 *                 type: string
 *               value:
 *                 type: number
 *               readingDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Reading recorded
 *       400:
 *         description: Validation error
 */
router.post("/readings", ReadingController.recordReading);

export default router;
