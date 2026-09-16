import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute, runInTransaction } from '../database/connection.js';
import { AppError } from '../middlewares/errorHandler.js';
import { UserProfile, HealthProfile, Allergy, HealthCondition, Medication } from '../types/shared.js';

export class ProfileService {
  getFullProfile(userId: string): { profile: UserProfile; healthProfile: HealthProfile } {
    const userProfileRow = queryOne<any>(
      `SELECT * FROM user_profiles WHERE user_id = ?`,
      [userId]
    );

    if (!userProfileRow) {
      throw new AppError('User profile not found.', 404, 'PROFILE_NOT_FOUND');
    }

    let healthProfileRow = queryOne<any>(
      `SELECT * FROM health_profiles WHERE user_id = ?`,
      [userId]
    );

    if (!healthProfileRow) {
      const newId = uuidv4();
      const now = new Date().toISOString();
      execute(
        `INSERT INTO health_profiles (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)`,
        [newId, userId, now, now]
      );
      healthProfileRow = { id: newId, user_id: userId, created_at: now, updated_at: now };
    }

    const allergies = queryAll<any>(
      `SELECT * FROM allergies WHERE health_profile_id = ?`,
      [healthProfileRow.id]
    ).map(a => ({
      id: a.id,
      healthProfileId: a.health_profile_id,
      allergen: a.allergen,
      reaction: a.reaction,
      severity: a.severity,
      diagnosedYear: a.diagnosed_year,
    }));

    const conditions = queryAll<any>(
      `SELECT * FROM health_conditions WHERE health_profile_id = ?`,
      [healthProfileRow.id]
    ).map(c => ({
      id: c.id,
      healthProfileId: c.health_profile_id,
      conditionName: c.condition_name,
      status: c.status,
      diagnosedDate: c.diagnosed_date,
      notes: c.notes,
    }));

    const medications = queryAll<any>(
      `SELECT * FROM medications WHERE health_profile_id = ?`,
      [healthProfileRow.id]
    ).map(m => ({
      id: m.id,
      healthProfileId: m.health_profile_id,
      medicineName: m.medicine_name,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: m.start_date,
      isCurrent: Boolean(m.is_current),
    }));

    const profile: UserProfile = {
      id: userProfileRow.id,
      userId: userProfileRow.user_id,
      fullName: userProfileRow.full_name,
      dateOfBirth: userProfileRow.date_of_birth,
      gender: userProfileRow.gender,
      phone: userProfileRow.phone,
      preferredLanguage: userProfileRow.preferred_language || 'en',
      emergencyContactName: userProfileRow.emergency_contact_name,
      emergencyContactPhone: userProfileRow.emergency_contact_phone,
      emergencyContactRelation: userProfileRow.emergency_contact_relation,
      createdAt: userProfileRow.created_at,
      updatedAt: userProfileRow.updated_at,
    };

    const healthProfile: HealthProfile = {
      id: healthProfileRow.id,
      userId: healthProfileRow.user_id,
      bloodType: healthProfileRow.blood_type,
      heightCm: healthProfileRow.height_cm,
      weightKg: healthProfileRow.weight_kg,
      smokingStatus: healthProfileRow.smoking_status,
      alcoholStatus: healthProfileRow.alcohol_status,
      dietaryPreferences: healthProfileRow.dietary_preferences,
      allergies,
      conditions,
      medications,
      createdAt: healthProfileRow.created_at,
      updatedAt: healthProfileRow.updated_at,
    };

    return { profile, healthProfile };
  }

  updateProfile(userId: string, data: Partial<UserProfile> & Partial<HealthProfile>): { profile: UserProfile; healthProfile: HealthProfile } {
    const now = new Date().toISOString();

    runInTransaction(() => {
      // Update User Profile
      execute(
        `UPDATE user_profiles 
         SET full_name = COALESCE(?, full_name),
             date_of_birth = COALESCE(?, date_of_birth),
             gender = COALESCE(?, gender),
             phone = COALESCE(?, phone),
             preferred_language = COALESCE(?, preferred_language),
             emergency_contact_name = COALESCE(?, emergency_contact_name),
             emergency_contact_phone = COALESCE(?, emergency_contact_phone),
             emergency_contact_relation = COALESCE(?, emergency_contact_relation),
             updated_at = ?
         WHERE user_id = ?`,
        [
          data.fullName ?? null,
          data.dateOfBirth ?? null,
          data.gender ?? null,
          data.phone ?? null,
          data.preferredLanguage ?? null,
          data.emergencyContactName ?? null,
          data.emergencyContactPhone ?? null,
          data.emergencyContactRelation ?? null,
          now,
          userId,
        ]
      );

      // Update Health Profile
      execute(
        `UPDATE health_profiles
         SET blood_type = COALESCE(?, blood_type),
             height_cm = COALESCE(?, height_cm),
             weight_kg = COALESCE(?, weight_kg),
             smoking_status = COALESCE(?, smoking_status),
             alcohol_status = COALESCE(?, alcohol_status),
             dietary_preferences = COALESCE(?, dietary_preferences),
             updated_at = ?
         WHERE user_id = ?`,
        [
          data.bloodType ?? null,
          data.heightCm ?? null,
          data.weightKg ?? null,
          data.smokingStatus ?? null,
          data.alcoholStatus ?? null,
          data.dietaryPreferences ?? null,
          now,
          userId,
        ]
      );
    });

    return this.getFullProfile(userId);
  }

  addAllergy(userId: string, item: Omit<Allergy, 'id' | 'healthProfileId'>): Allergy {
    const hp = queryOne<{ id: string }>('SELECT id FROM health_profiles WHERE user_id = ?', [userId]);
    if (!hp) throw new AppError('Health profile not found.', 404, 'PROFILE_NOT_FOUND');

    const id = uuidv4();
    execute(
      `INSERT INTO allergies (id, health_profile_id, allergen, reaction, severity, diagnosed_year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, hp.id, item.allergen, item.reaction || null, item.severity, item.diagnosedYear || null]
    );

    return { id, healthProfileId: hp.id, ...item };
  }

  deleteAllergy(userId: string, allergyId: string): void {
    const hp = queryOne<{ id: string }>('SELECT id FROM health_profiles WHERE user_id = ?', [userId]);
    if (!hp) throw new AppError('Health profile not found.', 404, 'PROFILE_NOT_FOUND');

    const res = execute('DELETE FROM allergies WHERE id = ? AND health_profile_id = ?', [allergyId, hp.id]);
    if (res.changes === 0) throw new AppError('Allergy entry not found or unauthorized.', 404, 'NOT_FOUND');
  }

  addCondition(userId: string, item: Omit<HealthCondition, 'id' | 'healthProfileId'>): HealthCondition {
    const hp = queryOne<{ id: string }>('SELECT id FROM health_profiles WHERE user_id = ?', [userId]);
    if (!hp) throw new AppError('Health profile not found.', 404, 'PROFILE_NOT_FOUND');

    const id = uuidv4();
    execute(
      `INSERT INTO health_conditions (id, health_profile_id, condition_name, status, diagnosed_date, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, hp.id, item.conditionName, item.status, item.diagnosedDate || null, item.notes || null]
    );

    return { id, healthProfileId: hp.id, ...item };
  }

  deleteCondition(userId: string, conditionId: string): void {
    const hp = queryOne<{ id: string }>('SELECT id FROM health_profiles WHERE user_id = ?', [userId]);
    if (!hp) throw new AppError('Health profile not found.', 404, 'PROFILE_NOT_FOUND');

    const res = execute('DELETE FROM health_conditions WHERE id = ? AND health_profile_id = ?', [conditionId, hp.id]);
    if (res.changes === 0) throw new AppError('Condition entry not found or unauthorized.', 404, 'NOT_FOUND');
  }

  addMedication(userId: string, item: Omit<Medication, 'id' | 'healthProfileId'>): Medication {
    const hp = queryOne<{ id: string }>('SELECT id FROM health_profiles WHERE user_id = ?', [userId]);
    if (!hp) throw new AppError('Health profile not found.', 404, 'PROFILE_NOT_FOUND');

    const id = uuidv4();
    execute(
      `INSERT INTO medications (id, health_profile_id, medicine_name, dosage, frequency, start_date, is_current)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, hp.id, item.medicineName, item.dosage || null, item.frequency || null, item.startDate || null, item.isCurrent ? 1 : 0]
    );

    return { id, healthProfileId: hp.id, ...item };
  }

  deleteMedication(userId: string, medicationId: string): void {
    const hp = queryOne<{ id: string }>('SELECT id FROM health_profiles WHERE user_id = ?', [userId]);
    if (!hp) throw new AppError('Health profile not found.', 404, 'PROFILE_NOT_FOUND');

    const res = execute('DELETE FROM medications WHERE id = ? AND health_profile_id = ?', [medicationId, hp.id]);
    if (res.changes === 0) throw new AppError('Medication entry not found or unauthorized.', 404, 'NOT_FOUND');
  }
}

export const profileService = new ProfileService();
