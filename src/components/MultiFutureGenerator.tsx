import React from 'react';
import {
  GitFork,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame,
  Activity,
} from 'lucide-react';
import { SimulationScenario, MultiFutureResult, Language, FutureOutcomeType } from '../types/simulation';
import { translations } from '../i18n/translations';
import { SimulationEngine } from '../services/simulationEngine';

interface MultiFutureGeneratorProps {
  scenario: SimulationScenario;
  userOverrides: Record<string, number>;
  currentYear: number;
  language: Language;
  onApplyFutureAsUserDefined: (future: FutureOutcomeType) => void;
  onSelectYear: (year: number) => void;
}

export const MultiFutureGenerator: React.FC<MultiFutureGeneratorProps> = ({
  scenario,
  userOverrides,
  currentYear,
  language,
  onApplyFutureAsUserDefined,
  onSelectYear,
}) => {
  const t = translations[language];
  const multiFutures = SimulationEngine.generateMultiFutures(scenario, userOverrides);

  const getFutureColorConfig = (type: FutureOutcomeType) => {
    switch (type) {
      case 'optimistic':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/20',
          accent: 'text-emerald-400',
          badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          shadow: 'shadow-[0_0_25px_rgba(16,185,129,0.12)]',
        };
      case 'realistic':
        return {
          border: 'border-cyan-500/40',
          bg: 'bg-cyan-950/20',
          accent: 'text-cyan-400',
          badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
          shadow: 'shadow-[0_0_25px_rgba(56,189,248,0.12)]',
        };
      case 'high-risk':
        return {
          border: 'border-rose-500/40',
          bg: 'bg-rose-950/20',
          accent: 'text-rose-400',
          badge: 'bg-rose-950 text-rose-300 border-rose-800',
          shadow: 'shadow-[0_0_25px_rgba(244,63,94,0.12)]',
        };
      case 'user-defined':
        return {
          border: 'border-purple-500/40',
          bg: 'bg-purple-950/20',
          accent: 'text-purple-400',
          badge: 'bg-purple-950 text-purple-300 border-purple-800',
          shadow: 'shadow-[0_0_25px_rgba(168,85,247,0.12)]',
        };
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <GitFork className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 05: MULTI-FUTURE PROJECTION ENGINE</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'பல்வேறு எதிர்காலங்கள் & கிளைப் பாதைகள்' : 'Multi-Future Comparative Matrix'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'ஒரே தொடக்க புள்ளியிலிருந்து நான்கு மாறுபட்ட எதிர்காலங்களை ஒரே பார்வையில் ஒப்பிடுங்கள்.'
              : 'Evaluate divergent trajectory envelopes simultaneously across Optimistic, Realistic, High-Risk, and User-Tuned states.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">HORIZON FOCUS:</span>
          <span className="rounded-lg border border-cyan-500/30 bg-cyan-950 px-2.5 py-1 text-cyan-300 font-bold">
            {currentYear}
          </span>
        </div>
      </div>

      {/* 4 Multi-Future Columns */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {multiFutures.map((future) => {
          const modeKey: FutureOutcomeType =
            future.mode === 'OPTIMISTIC'
              ? 'optimistic'
              : future.mode === 'REALISTIC'
              ? 'realistic'
              : future.mode === 'HIGH_RISK'
              ? 'high-risk'
              : 'user-defined';

          const cfg = getFutureColorConfig(modeKey);
          const currentStep = future.timeline.find((t) => t.year === currentYear) || future.timeline[0];
          const finalStep = future.timeline[future.timeline.length - 1];

          return (
            <div
              key={future.mode}
              className={`flex flex-col justify-between rounded-2xl border ${cfg.border} ${cfg.bg} p-5 ${cfg.shadow} backdrop-blur-md transition-all hover:scale-[1.01]`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${cfg.badge}`}
                  >
                    {modeKey.replace('-', ' ')}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {future.goalAchievementRate}% GOAL
                  </span>
                </div>

                <h3 className="mt-3 font-mono text-lg font-bold text-white">
                  {language === 'ta' ? future.nameTa : future.name}
                </h3>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {language === 'ta' ? future.descriptionTa : future.description}
                </p>

                {/* Key Metrics at Focus Year */}
                <div className="mt-6 space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Peak Delay ({currentYear})</span>
                    <span className="font-mono font-bold text-white">
                      {currentStep.values['var-commute-delay']} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Air Quality (AQI)</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {currentStep.values['var-aqi']}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Healthcare Burden</span>
                    <span className="font-mono font-bold text-rose-300">
                      ${currentStep.values['var-health-cost']}M/yr
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">System Stress</span>
                    <span className="font-mono font-bold text-amber-400">
                      {currentStep.systemStress} / 100
                    </span>
                  </div>
                </div>

                {/* Trajectory 2026 to 2050 Sparkline Bar */}
                <div className="mt-5">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>2026</span>
                    <span>2050 Endgame</span>
                  </div>
                  <div className="mt-2 flex items-end gap-1.5 h-12">
                    {future.timeline.map((step) => {
                      const heightPct = Math.min(100, Math.max(15, (step.values['var-commute-delay'] / 100) * 100));
                      const isCurrent = step.year === currentYear;

                      return (
                        <button
                          key={step.year}
                          onClick={() => onSelectYear(step.year)}
                          className="group relative flex-1 h-full flex flex-col justify-end items-center"
                          title={`Year ${step.year}: Delay ${step.values['var-commute-delay']}min`}
                        >
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t transition-all ${
                              isCurrent
                                ? 'bg-cyan-400 shadow-[0_0_10px_#38bdf8]'
                                : modeKey === 'optimistic'
                                ? 'bg-emerald-600/60 group-hover:bg-emerald-400'
                                : modeKey === 'high-risk'
                                ? 'bg-rose-600/60 group-hover:bg-rose-400'
                                : 'bg-cyan-700/60 group-hover:bg-cyan-400'
                            }`}
                          ></div>
                          <span className="font-mono text-[8px] text-slate-500 mt-1">{step.year}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Key Risk or Breakthrough */}
                <div className="mt-5 rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5 text-xs text-slate-400">
                  <span className="font-mono text-[10px] font-bold text-amber-400 uppercase">
                    {modeKey === 'optimistic' ? 'KEY CATALYST: ' : 'PRIMARY VULNERABILITY: '}
                  </span>
                  <span>
                    {modeKey === 'optimistic'
                      ? 'Modal shift dampens peak delay by 52%.'
                      : modeKey === 'high-risk'
                      ? 'Fossil vehicle surge triggers chronic choking gridlock.'
                      : 'Equilibrium depends on timely infrastructure delivery.'}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onApplyFutureAsUserDefined(modeKey)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-300 hover:border-cyan-500 hover:text-white"
                >
                  Adopt Parameters
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
