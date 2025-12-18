import { Request, Response, NextFunction } from "express";
import { BuildingsService } from "../services/buildings.service";
import { ComplexesService } from "../services/complexes.service";

const buildingsService = new BuildingsService();
const complexesService = new ComplexesService();

export class BuildingsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const buildings = await buildingsService.findAll(req.query);
      res.status(200).json({
        success: true,
        data: buildings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const building = await buildingsService.findById(req.params.id);
      res.status(200).json({
        success: true,
        data: building,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // check if complex exists
      const complex = await complexesService.findById(req.body.complexId);
      if (!complex) {
        return res.status(404).json({
          success: false,
          message: "Complex not found",
        });
      }
      const building = await buildingsService.create(req.body);
      res.status(201).json({
        success: true,
        data: building,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const building = await buildingsService.update(req.params.id, {
        name: req.body.name,
        mainUse: req.body.mainUse,
        availability: req.body.availability,
        status: req.body.status,
        address: req.body.address,
        condition: req.body.condition,
        criticality: req.body.criticality,
        calenderEntityId: req.body.calenderEntityId,
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
        complexId: req.body.complexId,
        photoIds: req.body.photoIds,
      });
      res.status(200).json({
        success: true,
        data: building,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await buildingsService.delete(req.params.id);
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
