import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../i18n/translations.js';
import {
  HeartPulse,
  Activity,
  FileText,
  Scan,
  Pill,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const LandingPage: React.FC = () => {
  const { user, language } = useAuth();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Evidence-Backed Medical Guidance • Powered by Dual RAG</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          Empowering Your Health Journey with{' '}
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Clinical AI Precision
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          {t.tagline}. Assess symptoms, summarize complex laboratory reports, explore medical images, and access authoritative clinical knowledge.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
            >
              <span>Go to Your Clinical Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
              >
                <span>Get Started (Free Consultation)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                <span>Sign In to Account</span>
              </Link>
            </>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <MedicalDisclaimer compact />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Comprehensive Clinical Intelligence Modules
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Engineered with deterministic safety protocols and patient privacy protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: AI Health Chat */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Conversational Health Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Streaming conversational guidance with citation cards from trusted authorities (WHO, CDC, MedlinePlus). Remembers personalized context without storing sensitive secrets.
            </p>
            <div className="text-xs font-semibold text-teal-600 flex items-center gap-1">
              <span>Streaming SSE & Multi-turn Context</span>
            </div>
          </div>

          {/* Card 2: Symptom Checker & Triage */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Symptom Checker & Emergency Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Multi-factor assessment evaluates severity, duration, and clinical history. Deterministic emergency rule engine immediately flags red-flag emergencies.
            </p>
            <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <span>Deterministic Red Flag Override</span>
            </div>
          </div>

          {/* Card 3: Medical Report Analyzer */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Medical Report Analyzer & Private RAG</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Upload blood tests, pathology, and diagnostic PDFs. Extracts laboratory measurements, flags abnormal values against reference ranges, and answers report questions.
            </p>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>Private Tenant-Isolated RAG</span>
            </div>
          </div>

          {/* Card 4: Multimodal Medical Vision */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Medical Image Vision Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Examine X-rays, MRI scans, CT slices, and dermatological photos with computer vision. Provides educational findings, uncertainty scores, and radiological disclaimers.
            </p>
            <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
              <span>Multimodal Vision with Uncertainty Bounds</span>
            </div>
          </div>

          {/* Card 5: Medicine Pharmacopeia */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Pharmacopeia Guide</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Search authoritative medicine monographs. Understand mechanisms of action, adverse reactions, drug-drug interactions, and administration precautions.
            </p>
            <div className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <span>Authoritative Drug Monographs</span>
            </div>
          </div>

          {/* Card 6: Privacy & Control */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Privacy & Right to Erasure</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Full user control over personal health memory and records. Delete individual recalled memories, delete uploaded files, or wipe all health records in one click.
            </p>
            <div className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>GDPR / HIPAA Erasure Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Callout Banner */}
      <section className="bg-teal-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Patient Safety is Our Foundational Commitment</h2>
          <p className="text-teal-100 max-w-2xl mx-auto text-sm mb-8 leading-relaxed">
            Our multi-layered safety architecture prevents prompt injections in uploaded documents, enforces strict tenant isolation, and prioritizes emergency warning indicators above all AI outputs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-teal-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Zero Hallucinated Citations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Deterministic Triage Override</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Multilingual (EN, HI, MR)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
