import { Router } from "express";
import { ItemController } from "../controllers/item.controller";
// import { requireAuth, requirePermission } from "../../../middleware/auth"; // Uncomment when auth is ready

const router = Router();
const controller = new ItemController();

// Add middleware as needed, e.g. router.use(requireAuth);

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
