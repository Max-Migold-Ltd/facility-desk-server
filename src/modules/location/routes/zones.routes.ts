import { Router } from "express";
import { ZonesController } from "../controllers/zones.controller";
import { requirePermission } from "../../../middleware/permission.middleware";
import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();
const controller = new ZonesController();

router.use(authenticate);

router.post("/bulk", requirePermission("Site", "WRITE"), controller.bulkZones);

router
  .route("/")
  .get(controller.findAll)
  .post(requirePermission("Site", "WRITE"), controller.create);

router
  .route("/:id")
  .get(controller.findOne)
  .patch(requirePermission("Site", "WRITE"), controller.update)
  .delete(requirePermission("Site", "WRITE"), controller.remove);

export default router;
