import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../i18n/translations.js';
import { symptomApi } from '../api/client.js';
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { SymptomAssessmentResult, WhyConditionResult, UrgencyLevel } from '../types/index.js';
import { EmergencyBanner } from '../components/EmergencyBanner.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const SymptomCheckerPage: React.FC = () => {
  const { healthProfile, language } = useAuth();
  const t = translations[language];

  // Intake state
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('2-3 days');
  const [severityScale, setSeverityScale] = useState(4);
  const [age, setAge] = useState(30);
  const [additionalContext, setAdditionalContext] = useState('');
  const [includeHealthProfile, setIncludeHealthProfile] = useState(true);

  // Result state
  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<SymptomAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // "Why This Disease?" State
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [whyLoading, setWhyLoading] = useState(false);
  const [whyResult, setWhyResult] = useState<WhyConditionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError(null);
    setAssessmentResult(null);

    try {
      const payload: any = {
        symptoms: symptoms.trim(),
        duration,
        severityScale,
        age,
        additionalContext: additionalContext.trim() || undefined,
      };

      if (includeHealthProfile && healthProfile) {
        payload.knownConditions = healthProfile.conditions.map(c => c.conditionName);
        payload.medications = healthProfile.medications.map(m => m.medicineName);
        payload.allergies = healthProfile.allergies.map(a => a.allergen);
      }

      const result = await symptomApi.analyze(payload);
      setAssessmentResult(result);
    } catch (err: any) {
      setError(err.message || 'Symptom analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhyCondition = async (conditionName: string) => {
    setSelectedCondition(conditionName);
    setWhyLoading(true);
    setWhyResult(null);
    try {
      const res = await symptomApi.whyCondition(conditionName, symptoms);
      setWhyResult(res);
    } catch (err: any) {
      console.error('Failed to get condition rationale:', err);
    } finally {
      setWhyLoading(false);
    }
  };

  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level) {
      case 'emergency':
        return { label: 'Level 5: Emergency Attention', bg: 'bg-red-600 text-white', icon: AlertOctagon };
      case 'urgent':
        return { label: 'Level 4: Urgent Care (Within Hours)', bg: 'bg-orange-500 text-white', icon: AlertTriangle };
      case 'prompt':
        return { label: 'Level 3: Prompt Evaluation (24-48h)', bg: 'bg-amber-500 text-white', icon: Clock };
      case 'routine':
        return { label: 'Level 2: Routine Primary Care', bg: 'bg-blue-600 text-white', icon: CheckCircle2 };
      default:
        return { label: 'Level 1: General Self-Care & Support', bg: 'bg-teal-600 text-white', icon: ShieldCheck };
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>Clinical Triage & Differential Guidance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Symptom Checker & Urgency Assessment</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Enter your current symptoms and clinical context. Deterministic safety rules evaluate red flags before structured educational explanations are generated.
        </p>
      </div>

      {/* Intake Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              What symptoms are you experiencing? <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Dry cough, sore throat, mild body aches, slight headache..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Duration of Symptoms</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Less than 24 hours">Less than 24 hours</option>
                <option value="1 to 2 days">1 to 2 days</option>
                <option value="3 to 7 days">3 to 7 days</option>
                <option value="1 to 2 weeks">1 to 2 weeks</option>
                <option value="Over a month (Chronic)">Over a month (Chronic)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Severity Rating (1 to 10): <span className="text-teal-600 font-extrabold">{severityScale}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={severityScale}
                onChange={(e) => setSeverityScale(parseInt(e.target.value, 10))}
                className="w-full accent-teal-600 cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>Mild (1-3)</span>
                <span>Moderate (4-6)</span>
                <span>Severe (7-10)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Patient Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Health Profile Integration Toggle */}
          {healthProfile && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-900 block">Incorporate My Health Profile Context</span>
                <span className="text-slate-500">
                  Includes {healthProfile.conditions.length} condition(s), {healthProfile.allergies.length} allergy(ies), and {healthProfile.medications.length} medication(s).
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeHealthProfile}
                onChange={(e) => setIncludeHealthProfile(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer accent-teal-600"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Additional Context (Triggers, Recent Travel, Exertion) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="e.g. Symptoms started after outdoor hiking, worsened in evening..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Evaluating clinical criteria...' : 'Run Symptom & Urgency Analysis'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Assessment Output Display */}
      {assessmentResult && (
        <div className="space-y-6">
          {/* Emergency Warning if triggered */}
          {assessmentResult.isEmergency && (
            <EmergencyBanner actions={assessmentResult.emergencyWarningSigns} />
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Triage Urgency Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Assessed Triage Urgency</span>
                {(() => {
                  const badge = getUrgencyBadge(assessmentResult.urgencyLevel);
                  const BadgeIcon = badge.icon;
                  return (
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg}`}>
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">When to Seek Care</span>
                <span className="text-xs font-bold text-slate-900">{assessmentResult.whenToSeekCare}</span>
              </div>
            </div>

            {/* 1. Symptoms Understood */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">1. Symptoms Analyzed</h3>
              <div className="flex flex-wrap gap-2">
                {assessmentResult.symptomsUnderstood.map((s, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Possible Explanations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Possible Educational Explanations</h3>
                <span className="text-[11px] text-slate-400 italic">Click "Why this condition?" for clinical rationale</span>
              </div>

              <div className="space-y-3">
                {assessmentResult.possibleExplanations.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{exp.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-teal-100 text-teal-800">
                            {exp.likelihood} likelihood
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleWhyCondition(exp.name)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs border border-teal-200 flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Why this condition?</span>
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">Supporting factors:</span>
                      {exp.supportingFactors.map((f, i) => (
                        <span key={i} className="text-slate-600">• {f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Factors Requiring Attention & Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <h4 className="font-bold text-blue-950 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Factors Requiring Clinical Attention</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-900/90">
                  {assessmentResult.factorsRequiringAttention.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>General Recommended Next Steps</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-900/90">
                  {assessmentResult.generalNextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Missing Information */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                What information is missing from this virtual assessment:
              </h4>
              <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-500">
                {assessmentResult.missingInformation.map((info, i) => (
                  <li key={i}>{info}</li>
                ))}
              </ul>
            </div>

            <MedicalDisclaimer />
          </div>
        </div>
      )}

      {/* "Why This Disease?" Modal / Drawer */}
      {selectedCondition && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinical Mechanism</span>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedCondition}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCondition(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {whyLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mx-auto mb-2" />
                <span>Synthesizing biological rationale...</span>
              </div>
            ) : whyResult ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Overview & Simple Explanation</h4>
                  <p className="text-slate-600 leading-relaxed">{whyResult.simpleExplanation}</p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                  <h4 className="font-bold text-teal-950 mb-1">Biological Pathophysiology Mechanism</h4>
                  <p className="text-teal-900/90 leading-relaxed">{whyResult.biologicalMechanism}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Contributing Factors & Triggers</h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {whyResult.contributingFactors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Known Risk Factors</h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {whyResult.riskFactors.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900">
                  <strong>What cannot be concluded:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {whyResult.cannotBeConcluded.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCondition(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
