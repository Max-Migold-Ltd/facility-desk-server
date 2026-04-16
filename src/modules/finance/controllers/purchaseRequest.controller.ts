import { Request, Response, NextFunction } from "express";
import prisma from "../../../lib/prisma";
import { PurchaseRequestService } from "../services/purchaseRequest.service";
import { tryCatch } from "bullmq";

const purchaseRequestService = new PurchaseRequestService();

export class PurchaseRequestController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await purchaseRequestService.getAll();
      res.status(200).json({
        status: true,
        length: pr.length,
        data: pr,
      });
    } catch (error) {
      next(error);
    }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await purchaseRequestService.getById(req.params.id);
      res.status(200).json({
        status: true,
        data: pr,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await purchaseRequestService.create({ ...req.body, requesterId: req.user?.id });
      res.status(201).json({
        status: true,
        data: pr,
      });
    } catch (error) {
      next(error);
    }
  }

  async approvePR(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await purchaseRequestService.approve(
        req.params.id,
        req.body,
      );
      res.status(200).json({
        status: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectPR(req: Request, res: Response, next: NextFunction) {
    try {
      await purchaseRequestService.reject(req.params.id);
      res.status(204).json({
        status: true,
        data: null,
      })
    } catch (error) {
      next(error);
    }
  }
}
