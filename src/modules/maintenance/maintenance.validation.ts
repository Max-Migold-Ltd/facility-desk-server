import { body } from "express-validator";

export const createMaintenanceSchema = [
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Maintenance type is required")
    .isIn([
      "PREVENTIVE",
      "CORRECTIVE",
      "PREDICTIVE",
      "EMERGENCY",
      "INSPECTION",
      "CALIBRATION",
      "SMALL_PROJECT",
      "SOFT_SERVICE",
    ])
    .withMessage("Invalid maintenance type"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("siteId").isUUID().withMessage("Valid Site ID is required"),
  body("assetId").optional().isUUID().withMessage("Valid Asset ID is required"),
  body("requesterId").isUUID().withMessage("Valid Requester ID is required"),
  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Invalid priority"),
  body("startDate").optional().isISO8601().withMessage("Invalid start date"),
  body("endDate").optional().isISO8601().withMessage("Invalid end date"),
];

export const assignMaintenanceSchema = [
  body("assigneeId")
    .optional()
    .isUUID()
    .withMessage("Valid Assignee ID is required"),
  body("teamId").optional().isUUID().withMessage("Valid Team ID is required"),
];

export const updateMaintenanceStatusSchema = [
  body("status")
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .withMessage("Invalid status"),
  body("notes").optional().isString(),
];

export const createPreventiveMaintenanceSchema = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("siteId").isUUID().withMessage("Valid Site ID is required"),
  body("frequency")
    .optional()
    .isIn(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"])
    .withMessage("Invalid frequency"),
  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Invalid priority"),
  body("assetId").optional().isUUID().withMessage("Valid Asset ID is required"),
  body("buildingId")
    .optional()
    .isUUID()
    .withMessage("Valid Building ID is required"),
  body("floorId").optional().isUUID().withMessage("Valid Floor ID is required"),
  body("spaceId").optional().isUUID().withMessage("Valid Space ID is required"),
  body("zoneId").optional().isUUID().withMessage("Valid Zone ID is required"),
  body("teamId").optional().isUUID().withMessage("Valid Team ID is required"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),
];

export const updateMaintenanceSchema = [
  body("description").optional().trim().notEmpty(),
  body("processStatus")
    .optional()
    .isIn(["PENDING", "IN_PROGRESS", "COMPLETED"])
    .withMessage("Invalid process status"),
  body("outcome").optional().isString(),
  body("teamId").optional().isUUID().withMessage("Valid Team ID is required"),
  body("assigneeId")
    .optional()
    .isUUID()
    .withMessage("Valid Assignee ID is required"),
];
