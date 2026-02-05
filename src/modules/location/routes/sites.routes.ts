import { Router } from "express";
import { SitesController } from "../controllers/sites.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { requirePermission } from "../../../middleware/permission.middleware";

const router = Router();
const controller = new SitesController();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/sites/bulk:
 *   post:
 *     summary: Bulk upload sites
 *     description: Upload a file to create multiple sites at once (CSV/Excel).
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully, processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully. Processing Started
 *       400:
 *         description: Validation error or missing file
 *       401:
 *         description: Not authenticated
 */
router.post("/bulk", requirePermission("Site", "WRITE"), controller.bulkSite);

router
  .route("/")
  .get(controller.findAll)
  .post(requirePermission("Site", "WRITE"), controller.create);

router
  .route("/:id")
  .get(requirePermission("Site", "READ"), controller.findOne)
  .patch(requirePermission("Site", "WRITE"), controller.update)
  .delete(requirePermission("Site", "WRITE"), controller.remove);

export default router;
