import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { config } from '../config/env.js';
import { queryOne, queryAll, execute, runInTransaction } from '../database/connection.js';
import { AppError } from '../middlewares/errorHandler.js';
import { auditService } from './auditService.js';
import { User, UserProfile } from '../types/shared.js';

export class AuthService {
  async register(params: {
    email: string;
    password: string;
    fullName: string;
    preferredLanguage?: 'en' | 'hi' | 'mr';
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ user: User; profile: UserProfile; token: string }> {
    const emailNormalized = params.email.toLowerCase().trim();

    if (!params.password || params.password.length < 8) {
      throw new AppError('Password must be at least 8 characters long.', 400, 'WEAK_PASSWORD');
    }

    const existingUser = queryOne('SELECT id FROM users WHERE email = ?', [emailNormalized]);
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409, 'EMAIL_EXISTS');
    }

    const userId = uuidv4();
    const profileId = uuidv4();
    const healthProfileId = uuidv4();
    const passwordHash = await bcrypt.hash(params.password, 10);
    const now = new Date().toISOString();
    const language = params.preferredLanguage || 'en';

    runInTransaction(() => {
      // 1. Create User
      execute(
        `INSERT INTO users (id, email, password_hash, role, is_verified, created_at, updated_at)
         VALUES (?, ?, ?, 'patient', 1, ?, ?)`,
        [userId, emailNormalized, passwordHash, now, now]
      );

      // 2. Create User Profile
      execute(
        `INSERT INTO user_profiles (id, user_id, full_name, preferred_language, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [profileId, userId, params.fullName.trim(), language, now, now]
      );

      // 3. Create Empty Health Profile
      execute(
        `INSERT INTO health_profiles (id, user_id, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        [healthProfileId, userId, now, now]
      );
    });

    const token = this.generateToken(userId, emailNormalized, 'patient');

    auditService.log({
      userId,
      action: 'AUTH_REGISTER',
      resourceType: 'user',
      resourceId: userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const user: User = {
      id: userId,
      email: emailNormalized,
      role: 'patient',
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    };

    const profile: UserProfile = {
      id: profileId,
      userId,
      fullName: params.fullName.trim(),
      preferredLanguage: language,
      createdAt: now,
      updatedAt: now,
    };

    return { user, profile, token };
  }

  async login(params: {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ user: User; profile: UserProfile; token: string }> {
    const emailNormalized = params.email.toLowerCase().trim();

    const row = queryOne<any>(
      `SELECT u.id, u.email, u.password_hash, u.role, u.is_verified, u.created_at, u.updated_at,
              p.id as profile_id, p.full_name, p.date_of_birth, p.gender, p.phone, p.preferred_language,
              p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relation,
              p.created_at as profile_created_at, p.updated_at as profile_updated_at
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.email = ?`,
      [emailNormalized]
    );

    if (!row) {
      auditService.log({
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'user',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        details: { email: emailNormalized, reason: 'user_not_found' },
      });
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(params.password, row.password_hash);
    if (!passwordMatch) {
      auditService.log({
        userId: row.id,
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'user',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        details: { reason: 'invalid_password' },
      });
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.generateToken(row.id, row.email, row.role);

    auditService.log({
      userId: row.id,
      action: 'AUTH_LOGIN_SUCCESS',
      resourceType: 'user',
      resourceId: row.id,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const user: User = {
      id: row.id,
      email: row.email,
      role: row.role,
      isVerified: Boolean(row.is_verified),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    const profile: UserProfile = {
      id: row.profile_id || uuidv4(),
      userId: row.id,
      fullName: row.full_name || 'Patient',
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      phone: row.phone,
      preferredLanguage: row.preferred_language || 'en',
      emergencyContactName: row.emergency_contact_name,
      emergencyContactPhone: row.emergency_contact_phone,
      emergencyContactRelation: row.emergency_contact_relation,
      createdAt: row.profile_created_at || row.created_at,
      updatedAt: row.profile_updated_at || row.updated_at,
    };

    return { user, profile, token };
  }

  generateToken(id: string, email: string, role: string): string {
    return jwt.sign({ id, email, role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    // 1. Locate and remove all files belonging to user from disk
    const reports = queryAll<{ storage_path: string }>(
      'SELECT storage_path FROM medical_reports WHERE user_id = ?',
      [userId]
    );
    for (const r of reports) {
      if (fs.existsSync(r.storage_path)) {
        try {
          fs.unlinkSync(r.storage_path);
        } catch {
          // ignore unlink error
        }
      }
    }

    const images = queryAll<{ storage_path: string }>(
      'SELECT storage_path FROM medical_images WHERE user_id = ?',
      [userId]
    );
    for (const img of images) {
      if (fs.existsSync(img.storage_path)) {
        try {
          fs.unlinkSync(img.storage_path);
        } catch {
          // ignore unlink error
        }
      }
    }

    // 2. Cascade delete database entities
    runInTransaction(() => {
      execute('DELETE FROM users WHERE id = ?', [userId]);
      // Anonymize audit logs
      execute('UPDATE audit_logs SET user_id = NULL WHERE user_id = ?', [userId]);
    });

    auditService.log({
      action: 'DATA_RIGHT_TO_ERASURE_COMPLETED',
      resourceType: 'user',
      resourceId: userId,
      details: { deletedUserId: userId },
    });
  }
}

export const authService = new AuthService();
