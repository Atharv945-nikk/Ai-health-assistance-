import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { profileApi } from '../api/client.js';
import {
  User,
  HeartPulse,
  Activity,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Check,
  Shield,
  Phone,
} from 'lucide-react';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const HealthProfilePage: React.FC = () => {
  const { profile, healthProfile, refreshProfile } = useAuth();

  // General profile state
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [emergencyName, setEmergencyName] = useState(profile?.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergencyContactPhone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(profile?.emergencyContactRelation || '');

  // Metrics
  const [bloodType, setBloodType] = useState(healthProfile?.bloodType || '');
  const [heightCm, setHeightCm] = useState(healthProfile?.heightCm || 170);
  const [weightKg, setWeightKg] = useState(healthProfile?.weightKg || 70);

  // Modals for adding items
  const [newAllergen, setNewAllergen] = useState('');
  const [newAllergySeverity, setNewAllergySeverity] = useState<'mild' | 'moderate' | 'severe' | 'anaphylactic'>('moderate');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // BMI Calculation
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '—';

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setError(null);

    try {
      await profileApi.updateProfile({
        fullName,
        dateOfBirth,
        gender,
        phone,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        emergencyContactRelation: emergencyRelation,
        bloodType,
        heightCm,
        weightKg,
      });
      await refreshProfile();
      setSuccessMsg('Profile information updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergen.trim()) return;
    try {
      await profileApi.addAllergy({ allergen: newAllergen.trim(), severity: newAllergySeverity });
      setNewAllergen('');
      await refreshProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    try {
      await profileApi.deleteAllergy(id);
      await refreshProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondition.trim()) return;
    try {
      await profileApi.addCondition({ conditionName: newCondition.trim(), status: 'managed' });
      setNewCondition('');
      await refreshProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCondition = async (id: string) => {
    try {
      await profileApi.deleteCondition(id);
      await refreshProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedication.trim()) return;
    try {
      await profileApi.addMedication({
        medicineName: newMedication.trim(),
        dosage: newMedDosage.trim() || undefined,
        isCurrent: true,
      });
      setNewMedication('');
      setNewMedDosage('');
      await refreshProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await profileApi.deleteMedication(id);
      await refreshProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
          <User className="w-4 h-4" />
          <span>Patient Identity & Health Record</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Personal Health Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your personal health factors. This information enables tailored conversational context and symptom triage checks with strict data minimization.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* General Information & Metrics Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Demographics & Physiological Metrics
        </h3>

        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender / Biological Sex</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other / Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Type</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Calculated BMI</label>
              <div className="p-2 rounded-lg bg-white border border-slate-200 font-mono font-bold text-xs text-teal-700">
                {bmi} kg/m²
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 rounded-2xl bg-red-50/40 border border-red-100 space-y-3">
            <h4 className="text-xs font-bold text-red-950 flex items-center gap-1.5 uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>Designated Emergency Contact</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Emergency Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 555-0188"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="e.g. Spouse / Sister"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Allergies Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Documented Allergies</h3>
          <span className="text-xs text-slate-400">{healthProfile?.allergies.length || 0} recorded</span>
        </div>

        <form onSubmit={handleAddAllergy} className="flex gap-2">
          <input
            type="text"
            value={newAllergen}
            onChange={(e) => setNewAllergen(e.target.value)}
            placeholder="Add allergen (e.g. Penicillin, Peanuts, Latex)..."
            className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <select
            value={newAllergySeverity}
            onChange={(e) => setNewAllergySeverity(e.target.value as any)}
            className="p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="anaphylactic">Anaphylactic</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shrink-0"
          >
            Add Allergy
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {healthProfile?.allergies.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800"
            >
              <span className="font-bold">{a.allergen}</span>
              <span className="text-[10px] uppercase font-mono px-1 rounded bg-red-100 text-red-700">
                {a.severity}
              </span>
              <button
                onClick={() => handleDeleteAllergy(a.id)}
                className="text-red-400 hover:text-red-700 ml-1"
                title="Remove allergy"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Conditions Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Known Clinical Conditions</h3>
          <span className="text-xs text-slate-400">{healthProfile?.conditions.length || 0} recorded</span>
        </div>

        <form onSubmit={handleAddCondition} className="flex gap-2">
          <input
            type="text"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            placeholder="Add condition (e.g. Hypertension, Mild Asthma, Migraines)..."
            className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shrink-0"
          >
            Add Condition
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {healthProfile?.conditions.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800"
            >
              <span className="font-bold">{c.conditionName}</span>
              <span className="text-[10px] uppercase font-mono px-1 rounded bg-blue-100 text-blue-700">
                {c.status}
              </span>
              <button
                onClick={() => handleDeleteCondition(c.id)}
                className="text-blue-400 hover:text-blue-700 ml-1"
                title="Remove condition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Medications Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Active Prescriptions & Over-the-Counter Medications</h3>
          <span className="text-xs text-slate-400">{healthProfile?.medications.length || 0} recorded</span>
        </div>

        <form onSubmit={handleAddMedication} className="flex gap-2 flex-wrap sm:flex-nowrap">
          <input
            type="text"
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
            placeholder="Medicine name (e.g. Albuterol, Metformin)..."
            className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <input
            type="text"
            value={newMedDosage}
            onChange={(e) => setNewMedDosage(e.target.value)}
            placeholder="Dosage (e.g. 500mg daily)"
            className="w-full sm:w-48 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shrink-0"
          >
            Add Medication
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {healthProfile?.medications.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800"
            >
              <span className="font-bold">{m.medicineName}</span>
              {m.dosage && <span className="text-[11px] text-teal-600 font-mono">({m.dosage})</span>}
              <button
                onClick={() => handleDeleteMedication(m.id)}
                className="text-teal-400 hover:text-teal-700 ml-1"
                title="Remove medication"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
