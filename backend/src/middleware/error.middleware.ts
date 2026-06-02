import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.message;
  } else if ((err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format.';
  }

  if (process.env.NODE_ENV === 'development') {
    logger.error(`${statusCode} - ${message}`, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
};
