import { Router, Request, Response } from 'express';
import { medicineService } from '../services/medicineService.js';
import { optionalAuth } from '../middlewares/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = medicineService.searchMedicines(query);
  res.status(200).json({
    success: true,
    data: results,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/:name', (req: Request, res: Response) => {
  const medicine = medicineService.getMedicineByName(req.params.name as string);
  res.status(200).json({
    success: true,
    data: medicine,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
