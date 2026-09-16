import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';
import { AppError } from './errorHandler.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function createRateLimiter(options: {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const windowMs = options.windowMs || config.rateLimitWindowMs;
  const max = options.max || config.rateLimitMax;
  const message = options.message || 'Too many requests. Please try again later.';
  const keyGenerator = options.keyGenerator || ((req: Request) => req.ip || req.socket.remoteAddress || 'anonymous');

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      return next(new AppError(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfterSeconds }));
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    next();
  };
}

// Global API rate limiter
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: config.rateLimitMax,
});

// Stricter limiter for authentication attempts
export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: config.authRateLimitMax,
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.'
});

// Stricter limiter for expensive AI endpoints
export const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'AI request limit reached. Please wait a moment before sending more queries.'
});
