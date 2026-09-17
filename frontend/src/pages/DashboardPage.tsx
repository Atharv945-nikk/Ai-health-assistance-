import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../i18n/translations.js';
import { chatApi, reportApi } from '../api/client.js';
import {
  HeartPulse,
  Activity,
  FileText,
  Scan,
  Pill,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';
import { Conversation, MedicalReport } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const { user, profile, healthProfile, language } = useAuth();
  const t = translations[language];
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [quickQuery, setQuickQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [convs, reps] = await Promise.all([
          chatApi.getConversations().catch(() => []),
          reportApi.getReports().catch(() => []),
        ]);
        setConversations(convs.slice(0, 4));
        setReports(reps.slice(0, 4));
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleQuickConsult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    navigate('/chat', { state: { initialPrompt: quickQuery.trim() } });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-teal-200 text-xs font-semibold uppercase tracking-wider">
            Clinical Health Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
            {greeting}, {profile?.fullName?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="mt-2 text-teal-100 text-sm leading-relaxed">
            How can your AI clinical assistant support your well-being today? Ask a health question, check acute symptoms, or review recent diagnostic reports.
          </p>

          {/* Quick Assistant Entry Point */}
          <form onSubmit={handleQuickConsult} className="mt-6 flex items-center gap-2">
            <div className="relative flex-1">
              <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask about symptoms, lab values, or medications..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 font-semibold text-white text-sm shadow transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>{t.actions.askAssistant}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 pointer-events-none">
          <HeartPulse className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Quick Action Clinical Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Clinical Actions</h2>
          <span className="text-xs text-slate-500">Multimodal health modules</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/symptoms"
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{t.actions.checkSymptoms}</h3>
            <p className="text-xs text-slate-500">Triage urgency and differential explanations.</p>
          </Link>

          <Link
            to="/reports"
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{t.actions.uploadReport}</h3>
            <p className="text-xs text-slate-500">Extract lab values and summarize findings.</p>
          </Link>

          <Link
            to="/images"
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Scan className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{t.actions.analyzeImage}</h3>
            <p className="text-xs text-slate-500">Educational vision review of X-rays and scans.</p>
          </Link>

          <Link
            to="/medicines"
            className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{t.nav.medicines}</h3>
            <p className="text-xs text-slate-500">Uses, mechanisms, interactions, and precautions.</p>
          </Link>
        </div>
      </div>

      {/* Grid: Health Profile Card + Recent Reports + Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Consultations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Consultations</h3>
              </div>
              <Link to="/chat" className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No past consultations yet.</p>
                <Link to="/chat" className="mt-2 inline-block font-semibold text-teal-600 hover:underline">
                  Start your first health consultation →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    to={`/chat?id=${conv.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800">{conv.title}</span>
                    </div>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Medical Reports */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Diagnostic Reports</h3>
              </div>
              <Link to="/reports" className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
                <span>View All Vault</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No medical reports uploaded yet.</p>
                <Link to="/reports" className="mt-2 inline-block font-semibold text-teal-600 hover:underline">
                  Upload laboratory PDF or scan →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((rep) => {
                  const abnormalCount = rep.summary?.abnormalFindings?.length || 0;
                  return (
                    <Link
                      key={rep.id}
                      to={`/reports?id=${rep.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">{rep.filename}</span>
                          <span className="text-[11px] text-slate-600">{rep.summary?.testName || 'Diagnostic Report'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {abnormalCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px] border border-amber-200">
                            {abnormalCount} Outside Range
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                            Normal Limits
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Health Profile Snapshot */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Health Profile Summary</h3>
              <Link to="/profile" className="text-xs font-semibold text-teal-600 hover:underline">
                Edit
              </Link>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Blood Type</span>
                <span className="font-semibold text-slate-800">{healthProfile?.bloodType || 'Not recorded'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Height / Weight</span>
                <span className="font-semibold text-slate-800">
                  {healthProfile?.heightCm ? `${healthProfile.heightCm} cm` : '—'} /{' '}
                  {healthProfile?.weightKg ? `${healthProfile.weightKg} kg` : '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-medium">Recorded Allergies ({healthProfile?.allergies.length || 0})</span>
                {healthProfile?.allergies && healthProfile.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {healthProfile.allergies.map((a) => (
                      <span key={a.id} className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-medium text-[11px] border border-red-100">
                        {a.allergen}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No allergies recorded</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-medium">Active Conditions ({healthProfile?.conditions.length || 0})</span>
                {healthProfile?.conditions && healthProfile.conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {healthProfile.conditions.map((c) => (
                      <span key={c.id} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-100">
                        {c.conditionName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No conditions recorded</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 block mb-1 font-medium">Current Medications ({healthProfile?.medications.length || 0})</span>
                {healthProfile?.medications && healthProfile.medications.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {healthProfile.medications.map((m) => (
                      <span key={m.id} className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-medium text-[11px] border border-teal-100">
                        {m.medicineName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No medications recorded</span>
                )}
              </div>
            </div>

            <Link
              to="/profile"
              className="w-full mt-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Complete Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
};
