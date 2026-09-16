import dotenv from 'dotenv';
import path from 'path';

// Load environment configuration from .env in backend directory or workspace root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'fallback_healthcare_dev_secret_never_use_in_prod_12345',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || './data/healthcare.db',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10),
  aiProvider: (process.env.AI_PROVIDER || 'heuristic').toLowerCase(),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  chatModel: process.env.CHAT_MODEL || 'gemini-1.5-flash',
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-004',
  visionModel: process.env.VISION_MODEL || 'gemini-1.5-flash',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
};
