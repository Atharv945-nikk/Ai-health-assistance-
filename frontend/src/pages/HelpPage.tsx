import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Brain,
  FileText,
  Activity,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'Safety & AI',
      question: 'Is this platform a replacement for a licensed medical doctor?',
      answer:
        'No. AI Healthcare Assistant is strictly an educational, informational, and clinical triage support system. It is designed to synthesize medical literature, parse lab documents, and provide evidence-grounded insights. It does not issue official medical diagnoses, prescribe controlled substances, or replace direct clinical evaluation by a board-certified physician.'
    },
    {
      id: 'faq-2',
      category: 'Safety & AI',
      question: 'What are the 5 Clinical Urgency Triage Levels?',
      answer:
        'Our symptom assessment assigns one of five clinical levels: Level 1 (Self-Care / Routine Monitoring) for mild self-limiting symptoms; Level 2 (Non-Urgent Clinic Visit) for symptoms requiring physician evaluation within days; Level 3 (Urgent Same-Day Clinic) for moderate acute issues needing prompt same-day care; Level 4 (Immediate Urgent Care / ER) for high-risk warning signs; and Level 5 (Emergency Red-Flag Override) for life-threatening emergencies requiring immediate dispatch of 911 / 112 services.'
    },
    {
      id: 'faq-3',
      category: 'Safety & AI',
      question: 'How do deterministic emergency red-flag overrides work?',
      answer:
        'To prevent LLM hallucinations during acute emergencies, our safety engine analyzes patient inputs using strict regular-expression and keyword-rule heuristics BEFORE the prompt reaches any generative model. If symptoms match red flags (e.g. crushing chest pain, anaphylaxis, acute stroke FAST signs, respiratory stridor, suicidal ideation), the system deterministically triggers a Level 5 emergency override with explicit instructions to contact emergency services.'
    },
    {
      id: 'faq-4',
      category: 'RAG & Reports',
      question: 'How does the Medical Report Analyzer extract lab results?',
      answer:
        'When you upload a clinical report (PDF or TXT), our parser extracts the raw text and automatically scans for recognized laboratory biomarkers (e.g., Fasting Glucose, HbA1c, Total Cholesterol, HDL, LDL, Triglycerides, Hemoglobin, Creatinine). It compares your numerical values against reference ranges, tags them as Low, Normal, or High, and provides evidence citations explaining the clinical context.'
    },
    {
      id: 'faq-5',
      category: 'RAG & Reports',
      question: 'Are my uploaded reports and scans private?',
      answer:
        'Yes, strictly private. We implement multi-tenant tenant isolation. Every document, chunk, vector embedding, and image is strictly associated with your authenticated user ID. In our private RAG queries, SQL filter predicates (`WHERE user_id = ?`) ensure that other users can never view, query, or search your private medical records.'
    },
    {
      id: 'faq-6',
      category: 'Images & Vision',
      question: 'What imaging modalities does the vision system support?',
      answer:
        'The vision pipeline supports Chest & Bone X-Rays, Brain & Spine MRIs, CT Scans, Dermatology lesion photographs, and Ultrasound scans. It outlines visible anatomical observations, potential abnormalities, radiological limitations, and an explicit confidence estimate.'
    },
    {
      id: 'faq-7',
      category: 'Privacy & Data',
      question: 'Can I delete my medical records and health memory?',
      answer:
        'Yes. In full compliance with GDPR and HIPAA right-to-erasure guidelines, you can selectively delete individual memories on the Health Memory page, delete uploaded reports and images individually, or perform a full account purge on the Settings page which triggers a cascading deletion of all your profile data, records, messages, and vector chunks.'
    },
    {
      id: 'faq-8',
      category: 'Languages',
      question: 'What languages are supported?',
      answer:
        'The platform natively supports English, Hindi (हिन्दी), and Marathi (मराठी). You can toggle languages at any time from the navigation bar or in your Profile settings.'
    }
  ];

  const categories = ['ALL', 'Safety & AI', 'RAG & Reports', 'Images & Vision', 'Privacy & Data', 'Languages'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'ALL' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-teal-100">
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Base & Support
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Clinical Guidelines & Frequently Asked Questions
          </h1>
          <p className="text-teal-100 text-sm max-w-2xl leading-relaxed">
            Learn about our deterministic safety architecture, multimodal analysis capabilities,
            authoritative clinical RAG corpus, and patient privacy commitments.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/emergency"
          className="p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100/80 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-red-900">Emergency Protocol</p>
              <p className="text-xs text-red-700">Dial 911 / 112 / 988</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/symptoms"
          className="p-4 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100/80 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-teal-900">Symptom Assessment</p>
              <p className="text-xs text-teal-700">5-level triage engine</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/privacy"
          className="p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100/80 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-blue-900">Privacy & Consent</p>
              <p className="text-xs text-blue-700">GDPR / HIPAA compliance</p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clinical topics, safety rules, or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-500">
              No matching questions found for "{searchTerm}".
            </p>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-xl border transition-all ${
                    isOpen ? 'border-teal-300 bg-teal-50/20 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-semibold text-slate-900 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                      <span>{faq.question}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-teal-100/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
