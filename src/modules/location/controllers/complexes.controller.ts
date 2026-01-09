import { Request, Response, NextFunction } from "express";
import { ComplexesService } from "../services/complexes.service";
import { NotFoundError } from "../../../errors";
import bulkUploadQueue from "../../jobs/queues/bulkUpload.queue";

const complexesService = new ComplexesService();

export class ComplexesController {
  async bulkComplexes (req:Request, res:Response, next: NextFunction) {
    if(!req.file) {
      return next(new NotFoundError("File"))
    }

    await bulkUploadQueue.add("process-complexes", {
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
      const complexes = await complexesService.findAll(req.query);
      res.status(200).json({
        success: true,
        data: complexes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const complex = await complexesService.findById(req.params.id);
      res.status(200).json({
        success: true,
        data: complex,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const complex = await complexesService.create(req.body);
      res.status(201).json({
        success: true,
        data: complex,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const complex = await complexesService.update(req.params.id, {
        name: req.body.name,
        availability: req.body.availability,
        calenderEntityId: req.body.calenderEntityId,
        totalBuildings: req.body.totalBuildings,
        totalFloors: req.body.totalFloors,
        totalUnits: req.body.totalUnits,
        totalRooms: req.body.totalRooms,
        glazedArea: req.body.glazedArea,
        cleanableArea: req.body.cleanableArea,
        coveredArea: req.body.coveredArea,
        totalNetArea: req.body.totalNetArea,
        totalGrossArea: req.body.totalGrossArea,
        totalHeatedVolume: req.body.totalHeatedVolume,
        totalVolume: req.body.totalVolume,
        status: req.body.status,
        condition: req.body.condition,
        criticality: req.body.criticality,
      });
      res.status(200).json({
        success: true,
        data: complex,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await complexesService.delete(req.params.id);
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
