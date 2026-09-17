import React, { useState, useEffect } from 'react';
import { memoryApi } from '../api/client.js';
import {
  Brain,
  Trash2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { HealthMemory } from '../types/index.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const HealthMemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<HealthMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMemories = async () => {
    try {
      const list = await memoryApi.getMemories();
      setMemories(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleDeleteMemory = async (id: string) => {
    try {
      await memoryApi.deleteMemory(id);
      setMemories(memories.filter(m => m.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to permanently clear all learned health memories?')) return;
    try {
      await memoryApi.clearAll();
      setMemories([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Explainable Clinical Context Memory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Health Memory Manager</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review and manage context the AI assistant has retained across your consultations. Every memory is user-scoped, explainable, and can be deleted at any time.
          </p>
        </div>

        {memories.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs border border-red-200 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Memories</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transparency Architecture Callout */}
      <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs text-teal-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-1">Privacy & Scoping Invariant</h4>
          <p className="leading-relaxed">
            The assistant separates <strong>temporary chat history</strong> from <strong>long-term clinical memory</strong>. Only clinically relevant observations (such as self-reported diagnoses or lifestyle changes) are retained to prevent redundant questioning in future consultations.
          </p>
        </div>
      </div>

      {/* Memories List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Active Retained Memories ({memories.length})</h3>
          <span className="text-xs text-slate-400">Isolated to your user ID</span>
        </div>

        {memories.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Brain className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p>No health memories have been retained yet.</p>
            <span className="text-[11px] text-slate-400 block mt-1">
              As you chat with the assistant, notable health updates will appear here for your review and audit.
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-teal-100 text-teal-800">
                      {mem.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Source: {mem.sourceReference || 'Chat Consultation'} • {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800 leading-relaxed">{mem.memoryText}</p>
                </div>

                <button
                  onClick={() => handleDeleteMemory(mem.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  title="Delete memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
