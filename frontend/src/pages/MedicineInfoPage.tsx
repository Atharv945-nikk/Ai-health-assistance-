import React, { useState, useEffect } from 'react';
import { medicineApi } from '../api/client.js';
import {
  Pill,
  Search,
  BookOpen,
  ExternalLink,
  AlertTriangle,
  Info,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { MedicineInfo } from '../types/index.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const MedicineInfoPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<MedicineInfo[]>([]);
  const [selectedMed, setSelectedMed] = useState<MedicineInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = async (query = '') => {
    try {
      const list = await medicineApi.search(query);
      setMedicines(list);
      if (list.length > 0 && !selectedMed) {
        setSelectedMed(list[0]);
      }
    } catch (err: any) {
      console.error('Failed to load medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines(searchQuery);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
          <Pill className="w-4 h-4" />
          <span>Authoritative Pharmacopeia & Drug Reference</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medicine Information Guide</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Search evidence-grounded pharmacological monographs. Review mechanisms, common side effects, interactions, and precautions sourced from FDA and WHO clinical databases.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-xl flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchMedicines(e.target.value);
            }}
            placeholder="Search by generic name, brand name (e.g. Tylenol, Amoxil, Metformin)..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Main Grid: Medicine Selector (Left) & Monograph Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Medications ({medicines.length})
          </h3>

          {medicines.map((m) => {
            const isSelected = selectedMed?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMed(m)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-amber-600 shadow-md ring-2 ring-amber-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">{m.genericName}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">v{m.updatedAt}</span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium block mt-1">
                  {m.brandNames.join(', ')}
                </span>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                  {m.commonUses[0]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Monograph Column */}
        <div className="lg:col-span-8">
          {selectedMed ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="pb-4 border-b border-slate-100 flex items-start justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    Pharmaceutical Monograph
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">{selectedMed.genericName}</h2>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500">Common Brands:</span>
                    {selectedMed.brandNames.map((b, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-mono">Last Reviewed</span>
                  <span className="text-xs font-bold text-slate-700">{selectedMed.updatedAt}</span>
                </div>
              </div>

              {/* Common Indications */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Common Indications & Uses</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  {selectedMed.commonUses.map((use, i) => (
                    <li key={i}>{use}</li>
                  ))}
                </ul>
              </div>

              {/* Mechanism of Action */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs">
                <h4 className="font-bold text-amber-950 uppercase tracking-wider text-[11px] mb-1">
                  Mechanism of Action
                </h4>
                <p className="text-amber-900/90 leading-relaxed">{selectedMed.mechanismOfAction}</p>
              </div>

              {/* Side Effects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">Common Side Effects</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {selectedMed.commonSideEffects.map((eff, i) => (
                      <li key={i}>{eff}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 text-xs">
                  <h4 className="font-bold text-red-950 mb-2">Serious Side Effects & Warnings</h4>
                  <ul className="list-disc pl-4 space-y-1 text-red-900/90">
                    {selectedMed.seriousSideEffects.map((eff, i) => (
                      <li key={i}>{eff}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Precautions and Common Interactions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs">
                  <h4 className="font-bold text-blue-950 mb-2">Important Precautions</h4>
                  <ul className="list-disc pl-4 space-y-1 text-blue-900/90">
                    {selectedMed.precautions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 text-xs">
                  <h4 className="font-bold text-purple-950 mb-2">Common Drug Interactions</h4>
                  <ul className="list-disc pl-4 space-y-1 text-purple-900/90">
                    {selectedMed.commonInteractions.map((int, i) => (
                      <li key={i}>{int}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Safe Storage & When to Contact Doctor */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-800">Storage Advice: </span>
                  <span className="text-slate-600">{selectedMed.storageAdvice}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">When to Contact a Healthcare Professional: </span>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-600">
                    {selectedMed.whenToContactDoctor.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Authoritative Sources */}
              {selectedMed.sources.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    <span>Official References & Citations</span>
                  </h4>
                  <div className="space-y-1.5">
                    {selectedMed.sources.map((src, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{src.title}</span>
                          <span className="text-[11px] text-slate-500">{src.organization}</span>
                        </div>
                        {src.sourceUrl && (
                          <a
                            href={src.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-600 hover:underline flex items-center gap-1 text-xs font-semibold shrink-0"
                          >
                            <span>FDA / WHO Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescription Caution */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Prescription Notice:</strong> Do NOT start, stop, or adjust prescription dosages without direct consultation with your prescribing physician. This guide is for educational reference only.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 text-slate-400 p-8">
              <Pill className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">No Medicine Selected</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Choose a medicine from the left list or search by name.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
