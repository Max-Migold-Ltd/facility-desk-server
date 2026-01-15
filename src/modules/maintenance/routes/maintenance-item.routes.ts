import { Router } from "express";
import { MaintenanceItemController } from "../controllers/maintenance-item.controller";
// import { requireAuth, requirePermission } from "../../../middleware/auth"; // Uncomment when auth is ready

const router = Router({ mergeParams: true }); // Enable access to :maintenanceId from parent router
const controller = new MaintenanceItemController();

router.post("/items", controller.addItem);
router.get("/items", controller.getItems);

export default router;
