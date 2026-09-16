import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { queryAll } from '../database/connection.js';
import { ragService } from '../ai/ragService.js';
import { validate } from '../middlewares/validate.js';
import { optionalAuth } from '../middlewares/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/sources', (req: Request, res: Response) => {
  const sources = queryAll<any>(
    `SELECT id, title, source_organization as sourceOrganization, source_url as sourceUrl,
            publication_date as publicationDate, evidence_level as evidenceLevel, created_at as createdAt
     FROM rag_documents
     ORDER BY publication_date DESC`
  );

  res.status(200).json({
    success: true,
    data: sources,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const querySchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters long'),
  topK: z.number().int().min(1).max(10).optional(),
});

router.post('/query', validate(querySchema), async (req: Request, res: Response) => {
  const result = await ragService.retrieveRelevantContext(
    req.body.query,
    req.user?.id,
    {
      topK: req.body.topK || 4,
      includeUserReports: Boolean(req.user?.id),
    }
  );

  res.status(200).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
