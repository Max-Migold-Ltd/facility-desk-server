import { body, query } from "express-validator";
import {
  StockMovementType,
  StockReferenceType,
} from "../../../generated/prisma";

export const createStockMovementValidation = [
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type is required")
    .isIn(Object.values(StockMovementType))
    .withMessage("Invalid movement type"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("itemId")
    .trim()
    .notEmpty()
    .withMessage("Item ID is required")
    .isUUID()
    .withMessage("Invalid Item ID"),
  body("warehouseId")
    .trim()
    .notEmpty()
    .withMessage("Warehouse ID is required")
    .isUUID()
    .withMessage("Invalid Warehouse ID"),
  body("targetWarehouseId")
    .optional()
    .trim()
    .isUUID()
    .withMessage("Invalid Target Warehouse ID")
    .custom((value, { req }) => {
      if (req.body.type === StockMovementType.TRANSFER && !value) {
        throw new Error("Target Warehouse ID is required for TRANSFER");
      }
      if (
        req.body.type === StockMovementType.TRANSFER &&
        value === req.body.warehouseId
      ) {
        throw new Error(
          "Target Warehouse cannot be the same as Source Warehouse"
        );
      }
      return true;
    }),
  body("referenceId").optional().trim().notEmpty(),
  body("referenceType")
    .optional()
    .isIn(Object.values(StockReferenceType))
    .withMessage("Invalid reference type"),
];

export const stockFilterValidation = [
  query("warehouseId").optional().isUUID().withMessage("Invalid Warehouse ID"),
  query("itemId").optional().isUUID().withMessage("Invalid Item ID"),
];

export const stockMovementFilterValidation = [
  query("warehouseId").optional().isUUID().withMessage("Invalid Warehouse ID"),
  query("itemId").optional().isUUID().withMessage("Invalid Item ID"),
  query("type")
    .optional()
    .isIn(Object.values(StockMovementType))
    .withMessage("Invalid movement type"),
  query("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid start date"),
  query("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid end date"),
];
