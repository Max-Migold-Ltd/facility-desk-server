import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { formatErrorResponse } from '../utils/error-response.util';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error('Error:', err);

  // Handle known AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      formatErrorResponse(err.message, err.code, err.details)
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      formatErrorResponse('Invalid token', 'INVALID_TOKEN')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      formatErrorResponse('Token expired', 'TOKEN_EXPIRED')
    );
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json(
      formatErrorResponse('Database operation failed', 'DATABASE_ERROR')
    );
  }

  // Default to 500 server error
  res.status(500).json(
    formatErrorResponse(
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      'INTERNAL_ERROR'
    )
  );
};
