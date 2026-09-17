import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Lock, LifeBuoy } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-600 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">AI HealthCare Assistant</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              An intelligent, multimodal, evidence-grounded healthcare assistant platform designed for patient education and clinical support.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Clinical Modules</h4>
            <ul className="space-y-2">
              <li><Link to="/chat" className="hover:text-teal-600 transition-colors">AI Health Consultation</Link></li>
              <li><Link to="/symptoms" className="hover:text-teal-600 transition-colors">Symptom & Triage Checker</Link></li>
              <li><Link to="/reports" className="hover:text-teal-600 transition-colors">Medical Report Analyzer</Link></li>
              <li><Link to="/images" className="hover:text-teal-600 transition-colors">Multimodal Image Vision</Link></li>
              <li><Link to="/medicines" className="hover:text-teal-600 transition-colors">Pharmacopeia Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Safety & Evidence</h4>
            <ul className="space-y-2">
              <li><Link to="/emergency" className="hover:text-teal-600 transition-colors">Emergency Protocol (911 / 112)</Link></li>
              <li><Link to="/help" className="hover:text-teal-600 transition-colors">Evidence Grounding (WHO/CDC)</Link></li>
              <li><Link to="/settings" className="hover:text-teal-600 transition-colors">Right to Erasure (GDPR/HIPAA)</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy & Consent</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Security Badges</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100">
                <ShieldCheck className="w-4 h-4" />
                <span>Deterministic Emergency Triage</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Multi-Tenant Isolated RAG</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
                <LifeBuoy className="w-4 h-4" />
                <span>24/7 Crisis Hotline: Dial 988</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-[11px]">
          <p>© {new Date().getFullYear()} AI Healthcare Assistant Platform. All rights reserved.</p>
          <p className="max-w-xl text-center sm:text-right text-slate-500">
            <strong>Medical Disclaimer:</strong> This system is strictly an informational and educational aid. It does not provide medical diagnoses, treatment decisions, or replace consultation with a qualified medical professional.
          </p>
        </div>
      </div>
    </footer>
  );
};
