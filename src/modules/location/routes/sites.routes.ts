import { Router } from "express";
import { SitesController } from "../controllers/sites.controller";
import { requirePermission } from "../../../middleware/permission.middleware";

const router = Router();
const controller = new SitesController();

router.post("/bulk", requirePermission("Site", "WRITE"), controller.bulkSite);

router
  .route("/")
  .post(requirePermission("Site", "WRITE"), controller.create)
  .get(controller.findAll);

router
  .route("/:id")
  .get(requirePermission("Site", "READ"), controller.findOne)
  .patch(requirePermission("Site", "WRITE"), controller.update)
  .delete(requirePermission("Site", "WRITE"), controller.remove);

export default router;
