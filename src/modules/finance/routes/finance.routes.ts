import { Router } from "express";
import { CostCenterController } from "../controllers/cost-center.controller";
import { validate } from "../../../middleware/validate.middleware";
import { PurchaseRequestController } from "../controllers/purchaseRequest.controller";
import { PurchaseOrderController } from "../controllers/purchaseOrder.controller";
import {
  createCostCenterValidation,
  createPurchaseRequestValidation,
  approvePurchaseRequestValidation,
  receivePurchaseOrderValidation,
} from "../finance.validation";
import { authenticate } from "../../../middleware/auth.middleware";
import { requirePermission } from "../../../middleware/permission.middleware";

const router = Router();

const costCenterController = new CostCenterController();
const purchaseRequestController = new PurchaseRequestController();
const purchaseOrderController = new PurchaseOrderController();


// ================== COST CENTER ================== //
router
  .route("/cost-centers")
  .post(authenticate, validate(createCostCenterValidation), costCenterController.create)
  .get(costCenterController.getAll);

router
  .route("/cost-centers/:id")
  .get(costCenterController.getById)
  // .put(costCenterController.update) // TODO: Implement update
  .patch(costCenterController.budgetPaid); // Using patch for specific updates like budget


// ==================== PURCHASE REQUEST ==================== //
router
  .route("/purchase-requests")
  .get(purchaseRequestController.getAll)
  .post(
    authenticate,
    validate(createPurchaseRequestValidation),
    purchaseRequestController.create,
  );

router.patch(
  "/purchase-requests/:id/approve",
  validate(approvePurchaseRequestValidation),
  purchaseRequestController.approvePR,
);


// ==================== PURCHASE ORDER ==================== //

router.route("/purchase-orders")
  .get(purchaseOrderController.getAll)
  .post(
    // validate(createPurchaseOrderValidation),
    purchaseOrderController.createPO);

router.patch(
  "/purchase-orders/:id/approve",
  // validate(approvePurchaseOrderValidation),
  purchaseOrderController.approvePO
);

router.post(
  "/purchase-orders/:id/receive",
  validate(receivePurchaseOrderValidation),
  purchaseOrderController.receive,
);






router.route("/purchase-requests/:id").get(purchaseRequestController.getById);



router.route("/purchase-orders/:id").get(purchaseOrderController.getById);


export default router;
