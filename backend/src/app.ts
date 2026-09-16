import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler, AppError } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

// Route imports
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import chatRoutes from './routes/chat.js';
import symptomRoutes from './routes/symptoms.js';
import reportRoutes from './routes/reports.js';
import imageRoutes from './routes/images.js';
import medicineRoutes from './routes/medicines.js';
import memoryRoutes from './routes/memory.js';
import ragRoutes from './routes/rag.js';
import adminRoutes from './routes/admin.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible API usage / SSE
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. CORS
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Accept'],
    })
  );

  // 3. Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Request Logging & Correlation ID
  app.use(requestLogger);

  // 5. Global Rate Limiter
  app.use('/api', apiLimiter);

  // 6. Public Health Check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'AI Healthcare Assistant API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 7. Mount Domain API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profile', profileRoutes);
  app.use('/api/v1/chat', chatRoutes);
  app.use('/api/v1/symptoms', symptomRoutes);
  app.use('/api/v1/reports', reportRoutes);
  app.use('/api/v1/images', imageRoutes);
  app.use('/api/v1/medicines', medicineRoutes);
  app.use('/api/v1/memory', memoryRoutes);
  app.use('/api/v1/rag', ragRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 8. 404 Catch-All
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Route '${req.method} ${req.originalUrl}' not found.`, 404, 'NOT_FOUND'));
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
}
