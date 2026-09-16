import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { profileService } from '../services/profileService.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  preferredLanguage: z.enum(['en', 'hi', 'mr']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  const result = await authService.register({
    email: req.body.email,
    password: req.body.password,
    fullName: req.body.fullName,
    preferredLanguage: req.body.preferredLanguage,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  const result = await authService.login({
    email: req.body.email,
    password: req.body.password,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.post('/logout', requireAuth, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/me', requireAuth, (req: Request, res: Response) => {
  const { profile, healthProfile } = profileService.getFullProfile(req.user!.id);
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      profile,
      healthProfile,
    },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.delete('/account', requireAuth, async (req: Request, res: Response) => {
  await authService.deleteAccount(req.user!.id);
  res.status(200).json({
    success: true,
    data: { message: 'Account and all associated healthcare records permanently deleted.' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
