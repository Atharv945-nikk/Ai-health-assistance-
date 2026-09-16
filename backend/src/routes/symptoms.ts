import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { symptomService } from '../services/symptomService.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(requireAuth);

const analyzeSchema = z.object({
  symptoms: z.string().min(2, 'Please provide symptom details'),
  duration: z.string().optional(),
  severityScale: z.number().min(1).max(10).optional(),
  age: z.number().int().positive().optional(),
  knownConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  additionalContext: z.string().optional(),
});

router.post('/analyze', aiLimiter, validate(analyzeSchema), (req: Request, res: Response) => {
  const result = symptomService.analyzeSymptoms(req.user!.id, req.body);
  res.status(200).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const whyConditionSchema = z.object({
  conditionName: z.string().min(2, 'Condition name is required'),
  symptoms: z.string().optional(),
});

router.post('/why-condition', aiLimiter, validate(whyConditionSchema), (req: Request, res: Response) => {
  const result = symptomService.explainWhyCondition(req.body.conditionName, req.body.symptoms);
  res.status(200).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/history', (req: Request, res: Response) => {
  const assessments = symptomService.getPastAssessments(req.user!.id);
  res.status(200).json({
    success: true,
    data: assessments,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
