import React, { useState, useEffect } from 'react';
import { X, Sparkles, HelpCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Language, SimulationScenario } from '../types/simulation';
import { translations } from '../i18n/translations';
import { AIService } from '../services/aiService';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricName: string;
  metricValue: number;
  baselineValue: number;
  year: number;
  scenario: SimulationScenario;
  language: Language;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  metricName,
  metricValue,
  baselineValue,
  year,
  scenario,
  language,
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    AIService.explainMetric(
      metricName,
      metricValue,
      baselineValue,
      year,
      scenario.dependencies,
      language
    ).then((result) => {
      if (isMounted) {
        setExplanation(result);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, metricName, metricValue, baselineValue, year, language, scenario.dependencies]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-[#060a19] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase">
              AI EXPLANATION CENTER & CAUSAL PROVENANCE
            </span>
            <h2 className="font-mono text-lg font-bold text-white">
              Metric Investigation: {metricName}
            </h2>
          </div>
        </div>

        {/* Value Shift Bar */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
          <div>
            <span className="text-slate-500">Baseline Level:</span>{' '}
            <strong className="text-slate-300">{baselineValue}</strong>
          </div>
          <ArrowRight className="h-4 w-4 text-cyan-400" />
          <div>
            <span className="text-slate-500">Year {year} Value:</span>{' '}
            <strong className="text-cyan-300">{metricValue}</strong>
          </div>
          <div className="rounded bg-cyan-950 px-2 py-0.5 text-cyan-400 font-bold">
            {(((metricValue - baselineValue) / (baselineValue || 1)) * 100).toFixed(1)}% Shift
          </div>
        </div>

        {/* Explanation Body */}
        <div className="mt-5 max-h-[380px] overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 text-xs leading-relaxed text-slate-200">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-12">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span className="font-mono text-slate-400">Synthesizing causal explanation...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap font-sans">{explanation}</div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-cyan-600 px-5 py-2 font-mono text-xs font-bold text-slate-950 hover:bg-cyan-500"
          >
            Dismiss Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
