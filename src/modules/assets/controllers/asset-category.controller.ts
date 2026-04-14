import { Request, Response, NextFunction } from "express";
import { AssetCategoryService } from "../services/asset-category.service";

const assetCategoryService = new AssetCategoryService();

export class AssetCategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await assetCategoryService.findAll(req.query);
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await assetCategoryService.findById(req.params.id);
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await assetCategoryService.create(req.body);
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await assetCategoryService.update(req.params.id, {
        description: req.body.description,
        name: req.body.name,
        type: req.body.type,
      });
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await assetCategoryService.delete(req.params.id);
      res.status(204).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
