import { Request, Response, NextFunction } from "express";
import { PurchaseOrderService } from "../services/purchaseOrder.service";

const purchaseOrderService = new PurchaseOrderService();

export class PurchaseOrderController {
  getAll() {}
  getById(id: string) {}
  async receive(req: Request, res: Response, next: NextFunction) {
    const poId = req.params.id;
    const receipt = await purchaseOrderService.receiveGoods({
      purchaseOrderId: poId,
      warehouseId: req.body.warehouseId,
      receiverId: req.user?.id!,
      companyId: req.body.companyId,
      items: req.body.items,
    });
    res.status(201).json({
      status: true,
      data: receipt,
    });
  }
}
