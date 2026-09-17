import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../i18n/translations.js';

export const MedicalDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language } = useAuth();
  const t = translations[language];

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 leading-snug">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{t.disclaimerText}</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 my-4 shadow-sm">
      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-amber-950 mb-1">Important Clinical & Educational Notice</h4>
        <p className="leading-relaxed text-amber-900/90">{t.disclaimerText}</p>
        <p className="mt-1.5 text-[11px] text-amber-800">
          For acute, severe, or worsening symptoms, please contact your primary healthcare provider or local emergency room immediately.
        </p>
      </div>
    </div>
  );
};
