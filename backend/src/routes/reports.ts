import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { reportService } from '../services/reportService.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { AppError } from '../middlewares/errorHandler.js';
import { config } from '../config/env.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(requireAuth);

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const safeName = `${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMime = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'text/plain',
    ];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Unsupported file type. Please upload a PDF, image, or text document.', 400, 'INVALID_FILE_TYPE'));
    }
  },
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file provided for upload.', 400, 'FILE_REQUIRED');
  }

  const result = await reportService.processUploadedReport(req.user!.id, {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
  });

  res.status(201).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/', (req: Request, res: Response) => {
  const reports = reportService.getReports(req.user!.id);
  res.status(200).json({
    success: true,
    data: reports,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const report = reportService.getReportById(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: report,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/:id/file', (req: Request, res: Response) => {
  const fileInfo = reportService.getReportFile(req.user!.id, req.params.id as string);
  res.setHeader('Content-Type', fileInfo.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileInfo.filename)}"`);
  res.sendFile(fileInfo.path);
});

const askQuestionSchema = z.object({
  question: z.string().min(2, 'Question must be at least 2 characters long'),
});

router.post('/:id/ask', aiLimiter, validate(askQuestionSchema), (req: Request, res: Response) => {
  const result = reportService.askQuestionAboutReport(req.user!.id, req.params.id as string, req.body.question);
  res.status(200).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  reportService.deleteReport(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: { message: 'Medical report and vector chunks deleted successfully' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
