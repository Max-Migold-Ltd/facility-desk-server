import { body } from "express-validator";

export const permissionValidation = [
    body("resource").notEmpty().withMessage("Resource is required"),
    body("accessLevel").notEmpty().withMessage("Access level is required"),
];
