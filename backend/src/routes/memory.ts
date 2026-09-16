import { Router, Request, Response } from 'express';
import { memoryService } from '../services/memoryService.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req: Request, res: Response) => {
  const memories = memoryService.getUserMemories(req.user!.id);
  res.status(200).json({
    success: true,
    data: memories,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  memoryService.deleteMemory(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: { message: 'Health memory deleted successfully' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.post('/clear', (req: Request, res: Response) => {
  memoryService.clearAllMemories(req.user!.id);
  res.status(200).json({
    success: true,
    data: { message: 'All health memories cleared successfully' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
