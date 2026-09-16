import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { profileService } from '../services/profileService.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req: Request, res: Response) => {
  const data = profileService.getFullProfile(req.user!.id);
  res.status(200).json({
    success: true,
    data,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  preferredLanguage: z.enum(['en', 'hi', 'mr']).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  bloodType: z.string().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  smokingStatus: z.string().optional(),
  alcoholStatus: z.string().optional(),
  dietaryPreferences: z.string().optional(),
});

router.put('/', validate(updateProfileSchema), (req: Request, res: Response) => {
  const updated = profileService.updateProfile(req.user!.id, req.body);
  res.status(200).json({
    success: true,
    data: updated,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const allergySchema = z.object({
  allergen: z.string().min(1, 'Allergen name is required'),
  reaction: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'anaphylactic']),
  diagnosedYear: z.number().int().optional(),
});

router.post('/allergies', validate(allergySchema), (req: Request, res: Response) => {
  const allergy = profileService.addAllergy(req.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: allergy,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.delete('/allergies/:id', (req: Request, res: Response) => {
  profileService.deleteAllergy(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: { message: 'Allergy entry deleted' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const conditionSchema = z.object({
  conditionName: z.string().min(1, 'Condition name is required'),
  status: z.enum(['active', 'managed', 'resolved']),
  diagnosedDate: z.string().optional(),
  notes: z.string().optional(),
});

router.post('/conditions', validate(conditionSchema), (req: Request, res: Response) => {
  const condition = profileService.addCondition(req.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: condition,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.delete('/conditions/:id', (req: Request, res: Response) => {
  profileService.deleteCondition(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: { message: 'Condition entry deleted' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

const medicationSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().optional(),
  isCurrent: z.boolean().default(true),
});

router.post('/medications', validate(medicationSchema), (req: Request, res: Response) => {
  const medication = profileService.addMedication(req.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: medication,
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

router.delete('/medications/:id', (req: Request, res: Response) => {
  profileService.deleteMedication(req.user!.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: { message: 'Medication entry deleted' },
    meta: { requestId: req.id, timestamp: new Date().toISOString() },
  });
});

export default router;
