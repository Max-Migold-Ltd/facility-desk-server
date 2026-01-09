import { Request, Response, NextFunction } from "express";
import { FloorsService } from "../services/floors.service";
import { NotFoundError } from "../../../errors";
import bulkUploadQueue from "../../jobs/queues/bulkUpload.queue";

const floorsService = new FloorsService();

export class FloorsController {
  async bulkBuuildings(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      return next(new NotFoundError("File"));
    }

    await bulkUploadQueue.add("process-floors", {
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    res.status(200).json({
      status: true,
      message: "File uploaded successfully. Processing Started",
    });
  }
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const floors = await floorsService.findAll(req.query);
      res.status(200).json({
        success: true,
        data: floors,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const floor = await floorsService.findById(req.params.id);
      res.status(200).json({
        success: true,
        data: floor,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const floor = await floorsService.create(req.body);
      res.status(201).json({
        success: true,
        data: floor,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const floor = await floorsService.update(req.params.id, {
        name: req.body.name,
        level: req.body.level,
        grossArea: req.body.grossArea,
        status: req.body.status,
        condition: req.body.condition,
        criticality: req.body.criticality,
        buildingId: req.body.buildingId,
        totalUnits: req.body.totalUnits,
        totalRooms: req.body.totalRooms,
        glazedArea: req.body.glazedArea,
        cleanableArea: req.body.cleanableArea,
        coveredArea: req.body.coveredArea,
        totalNetArea: req.body.totalNetArea,
        totalGrossArea: req.body.totalGrossArea,
        totalHeatedVolume: req.body.totalHeatedVolume,
        totalVolume: req.body.totalVolume,
        complexId: req.body.complexId,
        photoIds: req.body.photoIds,
      });
      res.status(200).json({
        success: true,
        data: floor,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await floorsService.delete(req.params.id);
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
