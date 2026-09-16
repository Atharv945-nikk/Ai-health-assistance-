import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.id || 'unknown';

  logger.error(`Error processing request ${req.method} ${req.originalUrl}:`, err, { requestId });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input parameters',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'FILE_UPLOAD_ERROR',
        message: err.message,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  // Generic server error - never expose internal stack traces to client
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.'
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString()
    }
  });
}
