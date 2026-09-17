import React from 'react';
import {
  Shield,
  Lock,
  EyeOff,
  Trash2,
  FileCheck,
  Server,
  UserCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Patient Privacy & Security Policy
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Commitment to Healthcare Confidentiality
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Your medical history, diagnostic reports, and personal inquiries are protected by
            strict tenant isolation, zero-knowledge storage principles, and granular right-to-erasure controls.
          </p>
        </div>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Multi-Tenant Isolation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every clinical document, vector chunk, and vision scan is bound strictly to your authenticated user account.
            Cross-tenant data queries are cryptographically and logically prohibited at the database query level.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Model Retraining</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your personal health conversations, uploaded laboratory values, and radiological images are never used to
            train or fine-tune public foundation AI models. Private health data stays strictly inside your session boundaries.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Right to Erasure (GDPR)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            You maintain full sovereignty over your clinical footprint. You can selectively delete individual health memories
            or trigger an immediate complete erasure of your account, history, vector chunks, and files.
          </p>
        </div>
      </div>

      {/* Detailed Technical Compliance */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Technical Security Architecture</h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Cryptographic Credential Protection</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Passwords are authenticated using salted, one-way cryptographically secure hashing functions (PBKDF2/bcrypt)
                with zero plaintext retention. Session tokens use JSON Web Tokens (JWT) signed with 256-bit keys and expiration limits.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Indirect Prompt Injection Mitigation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When processing clinical reports or third-party laboratory files, user documents are sanitized and wrapped
                inside explicit non-executable data boundaries (`&lt;untrusted_report_data&gt;`). This prevents adversarial prompt
                injection attacks embedded in medical PDFs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">Granular Health Memory Explainability</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Any clinical preference, condition, or medication extracted by the AI during conversations is surfaced in your
                Health Memory console. You can inspect exact memory timestamps, categories, and remove them with one click.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Ready to manage your personal health data?</p>
            <p className="text-xs text-slate-500">Visit settings to export your records or delete your profile.</p>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all"
          >
            <span>Manage Privacy Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Mandatory Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
