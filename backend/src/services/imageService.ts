import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute, runInTransaction } from '../database/connection.js';
import { AppError } from '../middlewares/errorHandler.js';
import { getVisionProvider } from '../ai/providers/index.js';
import { assertNoPromptInjection } from '../ai/promptInjectionGuard.js';
import { auditService } from './auditService.js';
import { MedicalImage, MedicalImageAnalysis } from '../types/shared.js';

export class ImageService {
  private visionProvider = getVisionProvider();

  async uploadAndAnalyzeImage(
    userId: string,
    file: { originalname: string; mimetype: string; size: number; path: string },
    userNotes?: string
  ): Promise<MedicalImage> {
    if (userNotes) {
      assertNoPromptInjection(userNotes);
    }

    const imageBuffer = fs.readFileSync(file.path);
    const analysisResult = await this.visionProvider.analyzeMedicalImage(imageBuffer, file.mimetype, userNotes);

    const imageId = uuidv4();
    const analysisId = uuidv4();
    const now = new Date().toISOString();

    const analysis: MedicalImageAnalysis = {
      id: analysisId,
      imageId,
      modality: analysisResult.modality,
      bodyPart: analysisResult.bodyPart,
      observations: analysisResult.observations,
      possibleAbnormalities: analysisResult.possibleAbnormalities,
      confidenceScore: analysisResult.confidenceScore,
      limitations: analysisResult.limitations,
      urgency: 'routine',
      recommendations: analysisResult.recommendations,
      disclaimer: 'CRITICAL CLINICAL NOTICE: AI vision analysis is purely educational and exploratory. It does not replace a calibrated clinical monitor or diagnosis by a licensed Radiologist.',
      createdAt: now,
    };

    runInTransaction(() => {
      execute(
        `INSERT INTO medical_images (id, user_id, filename, storage_path, file_type, file_size_bytes, modality, body_part, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          imageId,
          userId,
          file.originalname,
          file.path,
          file.mimetype,
          file.size,
          analysisResult.modality,
          analysisResult.bodyPart,
          now,
        ]
      );

      execute(
        `INSERT INTO image_analyses (id, image_id, findings_json, confidence_score, urgency, disclaimer_acknowledged, created_at)
         VALUES (?, ?, ?, ?, 'routine', 1, ?)`,
        [analysisId, imageId, JSON.stringify(analysis), analysisResult.confidenceScore, now]
      );
    });

    auditService.log({
      userId,
      action: 'MEDICAL_IMAGE_ANALYSIS',
      resourceType: 'medical_image',
      resourceId: imageId,
      details: { modality: analysisResult.modality, bodyPart: analysisResult.bodyPart },
    });

    return {
      id: imageId,
      userId,
      filename: file.originalname,
      fileType: file.mimetype,
      fileSizeBytes: file.size,
      modality: analysisResult.modality,
      bodyPart: analysisResult.bodyPart,
      analysis,
      createdAt: now,
    };
  }

  getImages(userId: string): MedicalImage[] {
    const rows = queryAll<any>(
      `SELECT mi.id, mi.user_id as userId, mi.filename, mi.file_type as fileType, mi.file_size_bytes as fileSizeBytes,
              mi.modality, mi.body_part as bodyPart, mi.created_at as createdAt,
              ia.findings_json as findingsJson
       FROM medical_images mi
       LEFT JOIN image_analyses ia ON mi.id = ia.image_id
       WHERE mi.user_id = ?
       ORDER BY mi.created_at DESC`,
      [userId]
    );

    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      filename: r.filename,
      fileType: r.fileType,
      fileSizeBytes: r.fileSizeBytes,
      modality: r.modality,
      bodyPart: r.bodyPart,
      analysis: r.findingsJson ? JSON.parse(r.findingsJson) : undefined,
      createdAt: r.createdAt,
    }));
  }

  getImageById(userId: string, imageId: string): MedicalImage {
    const r = queryOne<any>(
      `SELECT mi.id, mi.user_id as userId, mi.filename, mi.storage_path as storagePath,
              mi.file_type as fileType, mi.file_size_bytes as fileSizeBytes,
              mi.modality, mi.body_part as bodyPart, mi.created_at as createdAt,
              ia.findings_json as findingsJson
       FROM medical_images mi
       LEFT JOIN image_analyses ia ON mi.id = ia.image_id
       WHERE mi.id = ? AND mi.user_id = ?`,
      [imageId, userId]
    );

    if (!r) throw new AppError('Medical image not found or unauthorized.', 404, 'NOT_FOUND');

    return {
      id: r.id,
      userId: r.userId,
      filename: r.filename,
      fileType: r.fileType,
      fileSizeBytes: r.fileSizeBytes,
      modality: r.modality,
      bodyPart: r.bodyPart,
      analysis: r.findingsJson ? JSON.parse(r.findingsJson) : undefined,
      createdAt: r.createdAt,
    };
  }

  deleteImage(userId: string, imageId: string): void {
    const r = queryOne<{ storage_path: string }>(
      'SELECT storage_path FROM medical_images WHERE id = ? AND user_id = ?',
      [imageId, userId]
    );

    if (!r) throw new AppError('Medical image not found or access denied.', 404, 'NOT_FOUND');

    if (fs.existsSync(r.storage_path)) {
      try {
        fs.unlinkSync(r.storage_path);
      } catch (err) {
        console.warn('Failed to delete image file on disk:', err);
      }
    }

    execute('DELETE FROM medical_images WHERE id = ? AND user_id = ?', [imageId, userId]);

    auditService.log({
      userId,
      action: 'IMAGE_DELETED',
      resourceType: 'medical_image',
      resourceId: imageId,
    });
  }
}

export const imageService = new ImageService();
