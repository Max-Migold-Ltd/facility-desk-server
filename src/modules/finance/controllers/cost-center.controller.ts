import { NextFunction, Request, Response } from "express";
import { CostCenterService } from "../services/cost-center.service";
import { CreateCostCenterDto } from "../dto/cost-center";

const service = new CostCenterService();

export class CostCenterController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateCostCenterDto;
      const cc = await service.create(data);
      res.status(201).json({ status: true, data: cc });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response) {
    const list = await service.findAll();
    res.status(200).json({ status: true, length: list.length, data: list });
  }

  async getById(req: Request, res: Response) {
    try {
      const cc = await service.findById(req.params.id);
      res.status(200).json({ status: true, data: cc });
    } catch (e) {
      res.status(404).json({ error: "Not Found" });
    }
  }

  async budgetPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const cc = await service.budgetPaid(req.params.id, req.body.amount);
      res.status(200).json({ status: true, data: cc });
    } catch (error) {
      next(error);
    }
  }
}
