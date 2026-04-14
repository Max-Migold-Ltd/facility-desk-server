import { Request, Response, NextFunction } from "express";
import { AssetService } from "../services/asset.service";

const assetService = new AssetService();

export class AssetController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await assetService.findAll(req.query);
      res.status(200).json({
        success: true,
        length: assets.data.length,
        data: assets.data,
        pagination: assets.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.findById(req.params.id);
      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.create(req.body);
      res.status(201).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.update(req.params.id, {
        name: req.body.name,
        categoryId: req.body.categoryId,
        description: req.body.description,
      });
      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await assetService.delete(req.params.id);
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
