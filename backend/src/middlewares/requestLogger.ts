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

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = requestId;
  req.startTime = Date.now();

  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    res.setHeader('X-Response-Time', `${duration}ms`);
    logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`, {
      requestId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  });

  next();
}
