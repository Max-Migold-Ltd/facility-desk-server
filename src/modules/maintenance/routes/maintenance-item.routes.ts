import { Router } from "express";
import { MaintenanceItemController } from "../controllers/maintenance-item.controller";
import { requirePermission } from "../../../middleware/permission.middleware";
import { authenticate } from "../../../middleware/auth.middleware";

const router = Router({ mergeParams: true }); 
const controller = new MaintenanceItemController();

router
  .route("/")
  .get(authenticate, requirePermission("Items", "READ"), controller.getItems)
  .post(authenticate, requirePermission("Items", "WRITE"), controller.addItem);

// router
//   .route("/:id")
//   .get(authenticate, requirePermission("Items", "READ"), controller.getItem)
//   .patch(authenticate, requirePermission("Items", "WRITE"), controller.updateItem)
//   .delete(authenticate, requirePermission("Items", "WRITE"), controller.deleteItem);

export default router;
