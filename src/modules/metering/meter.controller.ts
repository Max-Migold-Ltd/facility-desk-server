import { Request, Response, NextFunction } from "express";
import { MeterService } from "./meter.service";

const meterService = new MeterService();

export const createMeter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meter = await meterService.create(req.body);
    res.status(201).json(meter);
  } catch (error) {
    next(error);
  }
};

export const getMeters = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meters = await meterService.findAll();
    res.json(meters);
  } catch (error) {
    next(error);
  }
};

export const getMeterById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meter = await meterService.findOne(req.params.id);
    if (!meter) {
      return res.status(404).json({ message: "Meter not found" });
    }
    res.json(meter);
  } catch (error) {
    next(error);
  }
};

export const updateMeter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const meter = await meterService.update(req.params.id, req.body);
    res.json(meter);
  } catch (error) {
    next(error);
  }
};

export const deleteMeter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await meterService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
