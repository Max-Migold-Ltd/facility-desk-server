import { NextFunction, Request, Response } from "express";
import { ItemService } from "../services/item.service";
import { createItemSchema, updateItemSchema } from "../dtos/item.dto";
import { AppError } from "../../../errors";

const itemService = new ItemService();

export class ItemController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createItemSchema.parse(req.body);
      const item = await itemService.create(data);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, page, limit } = req.query;
      const result = await itemService.getAll({
        category: category as string,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await itemService.getOne(id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateItemSchema.parse(req.body);
      const item = await itemService.update(id, data);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await itemService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
