import { body } from "express-validator";

export const createCostCenterValidation = [
  body("code").notEmpty().withMessage("Code is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("description").optional().isString(),
  body("budgetLimit")
    .optional()
    .isNumeric()
    .withMessage("Budget Limit must be a number"),
  body("fiscalYear").isInt().withMessage("Fiscal Year must be an integer"),
  body("validFrom")
    .optional()
    .isISO8601()
    .withMessage("Valid From must be a valid date"),
  body("validTo")
    .optional()
    .isISO8601()
    .withMessage("Valid To must be a valid date"),
];

export const createPurchaseRequestValidation = [
  body("description").notEmpty().withMessage("Description is required"),
  body("costCenterId")
    .isUUID()
    .withMessage("Valid Cost Center ID is required"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items must be an array with at least one item"),
  body("items.*.itemId").isUUID().withMessage("Valid Item ID is required"),
  body("items.*.quantity").isNumeric().withMessage("Quantity must be a number"),
];

export const approvePurchaseRequestValidation = [
  body("costCenterId")
    .isUUID()
    .withMessage("Valid Cost Center ID is required"),
  body("supplierId").isUUID().withMessage("Valid Supplier ID is required"),
  body("totalAmount").isNumeric().withMessage("Total Amount must be a number"),
  body("purchaseRequestId")
    .isUUID()
    .withMessage("Valid Purchase Request ID is required"),
  body("items").optional().isArray().withMessage("Items must be an array"),
  body("items.*.itemId")
    .optional()
    .isMongoId()
    .withMessage("Valid Item ID is required"),
  body("items.*.quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity must be a number"),
  body("items.*.unitPrice")
    .optional()
    .isNumeric()
    .withMessage("Unit Price must be a number"),
];

export const receivePurchaseOrderValidation = [
  body("warehouseId").isUUID().withMessage("Valid Warehouse ID is required"),
  body("companyId").isUUID().withMessage("Valid Company ID is required"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items must be an array with at least one item"),
  body("items.*.itemId").isUUID().withMessage("Valid Item ID is required"),
  body("items.*.quantity").isNumeric().withMessage("Quantity must be a number"),
];
