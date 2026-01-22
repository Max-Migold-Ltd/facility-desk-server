import { Request, Response, NextFunction } from "express";
import { ReadingService } from "./reading.service";

const readingService = new ReadingService();

export const recordReading = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reading = await readingService.recordReading(req.body);
    res.status(201).json(reading);
  } catch (error) {
    next(error);
  }
};
