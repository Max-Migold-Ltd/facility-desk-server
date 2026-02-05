import { body } from "express-validator";

export const createPermissionSchema = [
  body("resource").trim().notEmpty().withMessage("Resource is required"),
  body("accessLevel")
    .trim()
    .notEmpty()
    .withMessage("Access level is required")
    .isIn(["NONE", "READ", "WRITE"])
    .withMessage("Invalid access level"),
  body("roleId").optional().isUUID().withMessage("Invalid Role ID"),
];

export const updatePermissionSchema = [
  body("resource")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Resource cannot be empty"),
  body("accessLevel")
    .optional()
    .trim()
    .isIn(["NONE", "READ", "WRITE"])
    .withMessage("Invalid access level"),
];
