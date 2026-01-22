import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware"; // path might vary
import * as MeterController from "./meter.controller";
import * as ReadingController from "./reading.controller";
import { createMeterDto, updateMeterDto } from "./meter.dto";
// import validate from "../../middleware/validate"; // Assume standard validator wrapper

// Mock validator wrapper if not imported
import { validationResult } from "express-validator";
const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const router = Router();

router.use(authenticate);

router.route("/").get(MeterController.getMeters).post(createMeterDto, validate, MeterController.createMeter);

router.route("/:id").get(MeterController.getMeterById).patch(updateMeterDto, validate, MeterController.updateMeter).delete(MeterController.deleteMeter);

// Readings
router.post("/readings", ReadingController.recordReading);

export default router;
