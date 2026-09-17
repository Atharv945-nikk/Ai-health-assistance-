import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { reportApi } from '../api/client.js';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  MessageSquare,
  HelpCircle,
  Eye,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { MedicalReport, LabValue } from '../types/index.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const MedicalReportsPage: React.FC = () => {
  const location = useLocation();

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Q&A state
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReports = async () => {
    try {
      const list = await reportApi.getReports();
      setReports(list);

      const params = new URLSearchParams(location.search);
      const queryId = params.get('id');

      if (queryId) {
        const found = list.find(r => r.id === queryId);
        if (found) setSelectedReport(found);
      } else if (list.length > 0 && !selectedReport) {
        setSelectedReport(list[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [location.search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const uploaded = await reportApi.upload(file);
      setReports([uploaded, ...reports]);
      setSelectedReport(uploaded);
      setQaHistory([]);
    } catch (err: any) {
      setError(err.message || 'File upload and analysis failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selectedReport || asking) return;

    const currentQ = question.trim();
    setQuestion('');
    setAsking(true);

    try {
      const result = await reportApi.askQuestion(selectedReport.id, currentQ);
      setQaHistory(prev => [...prev, { q: currentQ, a: result.answer }]);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze question.');
    } finally {
      setAsking(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to permanently delete this report and its vectorized data?')) return;
    try {
      await reportApi.deleteReport(reportId);
      const remaining = reports.filter(r => r.id !== reportId);
      setReports(remaining);
      if (selectedReport?.id === reportId) {
        setSelectedReport(remaining.length > 0 ? remaining[0] : null);
        setQaHistory([]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Private Health Records Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medical Report Summarizer & Q&A</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Upload blood work, pathology panels, and diagnostic reports (PDF, images, text). Measurements are extracted, reference ranges compared, and an interactive private Q&A assistant is enabled.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Processing & Extracting...' : 'Upload Medical Report'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Report List (Left) & Report Detail/Q&A (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Reports List Column */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Uploaded Documents ({reports.length})
          </h3>

          {reports.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-xs text-slate-400">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No documents uploaded yet.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-teal-600 font-semibold hover:underline"
              >
                Upload your first report →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => {
                const isSelected = selectedReport?.id === r.id;
                const abnormalCount = r.summary?.abnormalFindings?.length || 0;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedReport(r);
                      setQaHistory([]);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-teal-600 shadow-md ring-2 ring-teal-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 text-xs truncate">{r.filename}</h4>
                          <span className="text-[11px] text-slate-500 block truncate">{r.summary?.testName || 'Laboratory Report'}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReport(r.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                      {abnormalCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[10px]">
                          {abnormalCount} Outside Normal Range
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                          Normal Limits
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Report Inspection & Q&A Column */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Header & File Link */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-teal-600">
                    {selectedReport.summary?.testName || 'Diagnostic Report Summary'}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedReport.filename}</h2>
                  <span className="text-xs text-slate-400">
                    Uploaded {new Date(selectedReport.createdAt).toLocaleString()} • Size: {(selectedReport.fileSizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/v1/reports/${selectedReport.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View Original File</span>
                  </a>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs leading-relaxed text-teal-950">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] mb-1 text-teal-900">Clinical Overview</h4>
                  <p>{selectedReport.summary?.detailedSummary}</p>
                </div>

                {/* Structured Lab Values Table */}
                {selectedReport.summary?.labValues && selectedReport.summary.labValues.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Extracted Laboratory Measurements
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Test Parameter</th>
                            <th className="p-3">Measured Result</th>
                            <th className="p-3">Reference Range</th>
                            <th className="p-3">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedReport.summary.labValues.map((val, idx) => (
                            <tr key={idx} className={val.isAbnormal ? 'bg-amber-50/50 font-medium' : ''}>
                              <td className="p-3 text-slate-900">{val.name}</td>
                              <td className="p-3 font-mono font-bold text-slate-900">{val.value}</td>
                              <td className="p-3 text-slate-500">{val.referenceRange || 'Standard'}</td>
                              <td className="p-3">
                                {val.isAbnormal ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-semibold">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    <span>{val.interpretation}</span>
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-medium">{val.interpretation || 'Normal'}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Questions for Doctor */}
                {selectedReport.summary?.questionsForDoctor && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-teal-600" />
                      <span>Recommended Questions to Ask Your Physician</span>
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                      {selectedReport.summary.questionsForDoctor.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Medical Terms Explained */}
                {selectedReport.summary?.explainedMedicalTerms && selectedReport.summary.explainedMedicalTerms.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs">
                    <h4 className="font-bold text-blue-950 mb-2">Medical Terminology Explained in Simple Terms</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedReport.summary.explainedMedicalTerms.map((t, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-blue-100">
                          <span className="font-bold text-blue-900 block">{t.term}</span>
                          <span className="text-slate-600 text-[11px] leading-snug">{t.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Report Q&A Section */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Ask Questions About This Report</h3>
                </div>

                {/* Q&A Chat History for this report */}
                {qaHistory.length > 0 && (
                  <div className="space-y-3">
                    {qaHistory.map((item, idx) => (
                      <div key={idx} className="space-y-2 text-xs">
                        <div className="p-3 rounded-2xl bg-teal-600 text-white max-w-lg ml-auto font-medium shadow-sm">
                          {item.q}
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 max-w-xl whitespace-pre-wrap leading-relaxed">
                          {item.a}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Q&A Input Form */}
                <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What does fasting glucose 138 mg/dL mean for me?"
                    className="flex-1 p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="submit"
                    disabled={asking || !question.trim()}
                    className="px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{asking ? 'Analyzing...' : 'Ask'}</span>
                  </button>
                </form>
              </div>

              <MedicalDisclaimer />
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 text-slate-400 p-8">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">No Report Selected</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Select a document from the left vault or upload a new laboratory panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
