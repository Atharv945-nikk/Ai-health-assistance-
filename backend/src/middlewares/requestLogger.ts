import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
    }
  }
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId =
    (req.headers['x-request-id'] as string) || uuidv4();

  req.id = requestId;
  req.startTime = Date.now();

  // Set headers BEFORE the response is sent
  res.setHeader('X-Request-Id', requestId);

  const duration = () => {
    return req.startTime ? Date.now() - req.startTime : 0;
  };

  res.on('finish', () => {
    const requestDuration = duration();

    // ❌ Don't set headers here.
    // Response has already been sent.

    logger.info(
      `${req.method} ${req.originalUrl} [${res.statusCode}] - ${requestDuration}ms`,
      {
        requestId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    );
  });

  next();
}