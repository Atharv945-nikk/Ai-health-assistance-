import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { queryOne } from '../database/connection.js';
import { auditService } from '../services/auditService.js';
import { config } from '../config/env.js';
import { SystemMetrics } from '../types/shared.js';

const router = Router();

// Only administrators can access these operational endpoints
router.use(requireAuth, requireRole('admin'));

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      database: 'connected (SQLite WAL)',
      aiProvider: config.aiProvider,
      timestamp: new Date().toISOString(),
    },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/metrics', (req: Request, res: Response) => {
  const usersCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users')?.count || 0;
  const reportsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM medical_reports')?.count || 0;
  const imagesCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM medical_images')?.count || 0;
  const convsCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM conversations')?.count || 0;
  const emergencyCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM symptom_assessments WHERE is_emergency_override = 1')?.count || 0;

  const metrics: SystemMetrics = {
    uptimeSeconds: Math.floor(process.uptime()),
    totalUsers: usersCount,
    totalReports: reportsCount,
    totalImages: imagesCount,
    totalConversations: convsCount,
    totalEmergenciesDetected: emergencyCount,
    aiProviderActive: config.aiProvider,
    databaseStatus: 'connected',
    vectorStoreStatus: 'connected',
  };

  res.status(200).json({
    success: true,
    data: metrics,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/audit-logs', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '100', 10);
  const logs = auditService.getLogs(limit);
  res.status(200).json({
    success: true,
    data: logs,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
