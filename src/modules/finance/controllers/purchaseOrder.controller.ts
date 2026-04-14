import { Request, Response, NextFunction } from "express";
import { PurchaseOrderService } from "../services/purchaseOrder.service";

const purchaseOrderService = new PurchaseOrderService();

export class PurchaseOrderController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const pos = await purchaseOrderService.getAll();
    res.status(200).json({
      status: true,
      data: pos,
    });
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    const po = await purchaseOrderService.findById(req.params.id);
    res.status(200).json({
      status: true,
      data: po,
    });
  }


  async createPO(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await purchaseOrderService.createPO(
        req.body.quotationId,
        req.body.costCenterId,
      );
      res.status(201).json({
        status: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  async approvePO(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await purchaseOrderService.approvePO(
        req.params.id
      );
      res.status(200).json({
        status: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

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
