import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../i18n/translations.js';
import { authApi, profileApi } from '../api/client.js';
import {
  Settings,
  Globe,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  Shield,
} from 'lucide-react';
import { LanguageCode } from '../types/index.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const SettingsPage: React.FC = () => {
  const { user, profile, healthProfile, language, setLanguage, logout } = useAuth();
  const t = translations[language];
  const navigate = useNavigate();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    setSuccess('Language preferences updated.');
    setTimeout(() => setSuccess(null), 2500);
  };

  const handleExportData = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      user: { id: user?.id, email: user?.email, role: user?.role },
      profile,
      healthProfile,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthcare_data_export_${user?.id?.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      setError('Please type DELETE to confirm permanent account erasure.');
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      await authApi.deleteAccount();
      logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Application & Privacy Controls</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t.nav.settings}</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure localization preferences, export your personal health records, or exercise your legal right to complete data erasure.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Localization Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-600" />
          <span>Consultation & Interface Language</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Select your preferred language. The AI assistant will conduct conversations, triage explanations, and summaries in this language while preserving standard clinical terms.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { code: 'en', label: 'English (US/UK)', native: 'English' },
            { code: 'hi', label: 'हिन्दी (Hindi)', native: 'हिन्दी' },
            { code: 'mr', label: 'मराठी (Marathi)', native: 'मराठी' },
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => handleLanguageChange(item.code as LanguageCode)}
              className={`p-4 rounded-2xl border text-left text-xs transition-all ${
                language === item.code
                  ? 'border-teal-600 bg-teal-50/50 font-bold text-teal-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <span className="block font-semibold text-sm mb-0.5">{item.native}</span>
              <span className="text-slate-400 text-[11px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data Portability */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-600" />
          <span>Health Data Portability & Export</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Download a structured JSON archive of your personal health metrics, documented allergies, active medications, conditions, and consultation history.
        </p>

        <button
          onClick={handleExportData}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Health Data (JSON)</span>
        </button>
      </div>

      {/* Right to Erasure / Account Deletion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-red-950 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-600" />
          <span>Permanent Account Erasure (Right to be Forgotten)</span>
        </h3>
        <p className="text-xs text-red-900/80 leading-relaxed">
          This operation permanently deletes your account, personal health profile, all uploaded medical reports from disk, vector chunks, vision scans, and chat history. This action is irreversible.
        </p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Delete Account & Purge All Health Data
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300 space-y-3">
            <span className="text-xs font-bold text-red-900 block">
              Type <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-300 text-red-700">DELETE</span> to confirm permanent erasure:
            </span>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full p-2.5 rounded-xl border border-red-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteInput !== 'DELETE'}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-40 transition-colors"
              >
                {deleting ? 'Purging data...' : 'Confirm Permanent Erasure'}
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteInput('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
