import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { imageService } from '../services/imageService.js';
import { requireAuth } from '../middlewares/auth.js';
import { AppError } from '../middlewares/errorHandler.js';
import { config } from '../config/env.js';
import { aiLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.use(requireAuth);

const uploadDir = path.resolve(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `img-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Please upload a valid medical image (PNG, JPG, JPEG, WEBP).', 400, 'INVALID_IMAGE_TYPE'));
    }
  },
});

router.post('/upload-and-analyze', aiLimiter, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Medical image file is required.', 400, 'IMAGE_REQUIRED');
  }

  const result = await imageService.uploadAndAnalyzeImage(
    req.user!.id,
    {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    },
    req.body.notes
  );

  res.status(201).json({
    success: true,
    data: result,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/', (req: Request, res: Response) => {
  const images = imageService.getImages(req.user!.id);
  res.status(200).json({
    success: true,
    data: images,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const image = imageService.getImageById(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: image,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  imageService.deleteImage(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: { message: 'Medical image record deleted' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
