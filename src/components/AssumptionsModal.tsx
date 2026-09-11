import React from 'react';
import { X, HelpCircle, ShieldAlert, CheckCircle2, FileText, Lock } from 'lucide-react';
import { Language, SimulationScenario } from '../types/simulation';
import { translations } from '../i18n/translations';

interface AssumptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: SimulationScenario;
  language: Language;
}

export const AssumptionsModal: React.FC<AssumptionsModalProps> = ({
  isOpen,
  onClose,
  scenario,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-[#060a19] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase">
              METHODOLOGICAL TRANSPARENCY
            </span>
            <h2 className="font-mono text-lg font-bold text-white">
              {t.assumptionsUncertainty}
            </h2>
          </div>
        </div>

        <div className="mt-6 max-h-[440px] space-y-6 overflow-y-auto pr-2 text-xs">
          {/* Core Assumptions */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              Underlying Model Assumptions
            </h3>
            <div className="mt-3 space-y-2.5">
              {scenario.assumptions.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-cyan-400 font-bold">Assumption #{a.id}</span>
                    <span className="text-slate-400">Confidence: {a.confidence}%</span>
                  </div>
                  <p className="mt-1 text-slate-200 font-sans">
                    {language === 'ta' ? a.statementTa : a.statement}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Uncertainty Envelopes */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              Uncertainty Envelopes & Margin of Variance
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-center">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500">2026-2030</span>
                <p className="mt-1 text-base font-bold text-emerald-400">± 4.8%</p>
                <span className="text-[10px] text-slate-400">High Confidence</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500">2031-2040</span>
                <p className="mt-1 text-base font-bold text-amber-400">± 12.5%</p>
                <span className="text-[10px] text-slate-400">Moderate Variance</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-500">2041-2050</span>
                <p className="mt-1 text-base font-bold text-rose-400">± 22.0%</p>
                <span className="text-[10px] text-slate-400">Broad Uncertainty</span>
              </div>
            </div>
          </div>

          {/* Data Provenance Standards */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              Data Provenance Taxonomy
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-800">
                  REAL DATA
                </span>
                <span className="text-slate-400">Empirically recorded census or IoT municipal benchmarks.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-800">
                  SIMULATED DATA
                </span>
                <span className="text-slate-400">Calculated via deterministic differential elasticity functions.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-purple-950 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300 border border-purple-800">
                  USER INPUT
                </span>
                <span className="text-slate-400">Direct parameter overrides from What-If sliders and scenario builder.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-950 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 border border-amber-800">
                  AI-GENERATED ASSUMPTION
                </span>
                <span className="text-slate-400">Synthesized by Gemini language models during natural prompt extraction.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-cyan-600 px-5 py-2 font-mono text-xs font-bold text-slate-950 hover:bg-cyan-500"
          >
            Acknowledge Disclosures
          </button>
        </div>
      </div>
    </div>
  );
};
