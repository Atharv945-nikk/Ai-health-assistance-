import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AppError } from './errorHandler.js';
import { queryOne } from '../database/connection.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing or invalid Bearer token.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };

    const user = queryOne<{ id: string; email: string; role: 'patient' | 'doctor' | 'admin' }>(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return next(new AppError('The user associated with this token no longer exists.', 401, 'USER_NOT_FOUND'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Authentication session has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
  }
}

export function requireRole(...allowedRoles: Array<'patient' | 'doctor' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden. Insufficient permissions for this resource.', 403, 'FORBIDDEN'));
    }

    next();
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
    const user = queryOne<{ id: string; email: string; role: 'patient' | 'doctor' | 'admin' }>(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.id]
    );
    if (user) {
      req.user = { id: user.id, email: user.email, role: user.role };
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}
