import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SimulationScenario, SimulationVariable, Language, TimeStepMetric } from '../types/simulation';
import { translations } from '../i18n/translations';
import { SimulationEngine } from '../services/simulationEngine';

interface WhatIfLabProps {
  scenario: SimulationScenario;
  userOverrides: Record<string, number>;
  onUpdateVariable: (id: string, newVal: number) => void;
  onResetOverrides: () => void;
  language: Language;
  currentStepData: TimeStepMetric;
  currentYear: number;
}

export const WhatIfLab: React.FC<WhatIfLabProps> = ({
  scenario,
  userOverrides,
  onUpdateVariable,
  onResetOverrides,
  language,
  currentStepData,
  currentYear,
}) => {
  const t = translations[language];
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);

  const sensitivityRankings = SimulationEngine.analyzeSensitivity(scenario);
  const baselineTimeline = SimulationEngine.simulateTimeline(scenario, {});
  const activeTimeline = SimulationEngine.simulateTimeline(scenario, userOverrides);
  const anomalies = SimulationEngine.detectAnomalies(activeTimeline);

  const baselineFinalDelay = baselineTimeline[baselineTimeline.length - 1].values['var-commute-delay'] || 46;
  const activeFinalDelay = activeTimeline[activeTimeline.length - 1].values['var-commute-delay'] || 46;
  const delayDelta = activeFinalDelay - baselineFinalDelay;

  const baselineFinalAQI = baselineTimeline[baselineTimeline.length - 1].values['var-aqi'] || 138;
  const activeFinalAQI = activeTimeline[activeTimeline.length - 1].values['var-aqi'] || 138;
  const aqiDelta = activeFinalAQI - baselineFinalAQI;

  const baselineHealth = baselineTimeline[baselineTimeline.length - 1].values['var-health-cost'] || 410;
  const activeHealth = activeTimeline[activeTimeline.length - 1].values['var-health-cost'] || 410;
  const healthDelta = activeHealth - baselineHealth;

  const applyDeltaPercent = (id: string, currentVal: number, pct: number) => {
    const updated = Number((currentVal * (1 + pct / 100)).toFixed(2));
    onUpdateVariable(id, updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-0.5 text-xs text-purple-300">
            <Sliders className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 04: WHAT-IF LAB & SENSITIVITY TESTING</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'என்ன-நடக்கும் பரிசோதனை கூடம்' : 'What-If Simulation Laboratory'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'மாறிகளை மாற்றி, காரண விளைவுகள் 2026 முதல் 2050 வரை எப்படி எதிரொலிக்கின்றன என்பதை நிகழ்நேரத்தில் பாருங்கள்.'
              : 'Tune critical levers dynamically. Watch non-linear feedback ripples propagate across the whole digital world.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSensitivity(!showSensitivity)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
              showSensitivity
                ? 'border-cyan-400 bg-cyan-950 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.sensitivityAnalysis}</span>
          </button>

          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
              showAnomalies
                ? 'border-amber-400 bg-amber-950 text-amber-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>{anomalies.length} Alerts</span>
          </button>

          <button
            onClick={onResetOverrides}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300 hover:border-rose-500 hover:text-rose-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.resetVariables}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Impact Delta Ribbon */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Commute Delay Delta */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="font-mono text-[11px] text-slate-400">2050 COMMUTE DELAY IMPACT</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-white">{activeFinalDelay} min</span>
            <span
              className={`flex items-center font-mono text-xs font-bold ${
                delayDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {delayDelta <= 0 ? <TrendingDown className="mr-1 h-3.5 w-3.5" /> : <TrendingUp className="mr-1 h-3.5 w-3.5" />}
              {delayDelta <= 0 ? `${delayDelta} min` : `+${delayDelta} min`}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">vs baseline {baselineFinalDelay} min/trip</p>
        </div>

        {/* Air Quality AQI Delta */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="font-mono text-[11px] text-slate-400">2050 AIR QUALITY INDEX (AQI)</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-white">{activeFinalAQI} AQI</span>
            <span
              className={`flex items-center font-mono text-xs font-bold ${
                aqiDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {aqiDelta <= 0 ? <TrendingDown className="mr-1 h-3.5 w-3.5" /> : <TrendingUp className="mr-1 h-3.5 w-3.5" />}
              {aqiDelta <= 0 ? `${aqiDelta} AQI` : `+${aqiDelta} AQI`}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">vs baseline {baselineFinalAQI} AQI</p>
        </div>

        {/* Healthcare Financial Burden Delta */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="font-mono text-[11px] text-slate-400">HEALTHCARE BURDEN 2050</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-white">${activeHealth}M/yr</span>
            <span
              className={`flex items-center font-mono text-xs font-bold ${
                healthDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {healthDelta <= 0 ? <TrendingDown className="mr-1 h-3.5 w-3.5" /> : <TrendingUp className="mr-1 h-3.5 w-3.5" />}
              {healthDelta <= 0 ? `-$${Math.abs(healthDelta)}M` : `+$${healthDelta}M`}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Annual municipal & civic impact</p>
        </div>

        {/* Composite System Stress */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="font-mono text-[11px] text-slate-400">ACTIVE SYSTEM STRESS</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-black text-amber-400">
              {currentStepData?.systemStress || 45} / 100
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
              {currentStepData?.systemStress < 50 ? 'STABLE' : 'STRESSED'}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full ${
                currentStepData?.systemStress < 50 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${currentStepData?.systemStress || 45}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Sensitivity Breakdown Overlay if toggled */}
      {showSensitivity && (
        <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-mono text-sm font-bold uppercase text-cyan-300 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Sensitivity Analysis: Variable Importance Ranking</span>
            </h3>
            <span className="text-xs text-slate-400">Elasticity on Core Objectives</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sensitivityRankings.slice(0, 4).map((item, idx) => (
              <div key={item.variableId} className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-400">#0{idx + 1} LEVER</span>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    Impact: {item.impactScore}
                  </span>
                </div>
                <h4 className="mt-1 font-mono text-xs font-bold text-white truncate">
                  {language === 'ta' ? item.nameTa : item.name}
                </h4>
                <p className="mt-1 text-[10px] text-slate-400">
                  Primary Vector: {item.primaryOutcomeAffected}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Alerts Overlay if toggled */}
      {showAnomalies && (
        <div className="mt-6 space-y-3">
          {anomalies.map((a, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between rounded-xl border p-4 text-xs ${
                a.type === 'critical'
                  ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                  : a.type === 'warning'
                  ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                  : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <span className="font-mono font-bold uppercase">
                    [{a.year}] {language === 'ta' ? a.titleTa : a.title}
                  </span>
                  <p className="mt-0.5 text-slate-300 font-sans">
                    {language === 'ta' ? a.messageTa : a.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variable Sliders Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scenario.variables.map((v) => {
          const val = userOverrides[v.id] !== undefined ? userOverrides[v.id] : v.value;
          const deltaPct = Number((((val - v.baselineValue) / (v.baselineValue || 1)) * 100).toFixed(0));

          return (
            <div
              key={v.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[9px] text-cyan-300 uppercase">
                    {v.category}
                  </span>
                  <h3 className="mt-1 font-mono text-sm font-bold text-white">
                    {language === 'ta' ? v.nameTa : v.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span
                    className={`font-mono text-xs font-bold ${
                      deltaPct === 0
                        ? 'text-slate-400'
                        : deltaPct > 0
                        ? 'text-cyan-400'
                        : 'text-purple-400'
                    }`}
                  >
                    {deltaPct > 0 ? `+${deltaPct}%` : deltaPct < 0 ? `${deltaPct}%` : 'BASELINE'}
                  </span>
                </div>
              </div>

              {/* Numerical readout */}
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-mono text-2xl font-extrabold text-cyan-300">
                  {val} <span className="text-xs font-normal text-slate-400">{v.unit}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  Base: {v.baselineValue} {v.unit}
                </span>
              </div>

              {/* Slider */}
              <div className="mt-4">
                <input
                  type="range"
                  min={v.min}
                  max={v.max}
                  step={v.step}
                  value={val}
                  onChange={(e) => onUpdateVariable(v.id, Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
                />
                <div className="flex justify-between font-mono text-[10px] text-slate-500 mt-1">
                  <span>{v.min}</span>
                  <span>{v.max}</span>
                </div>
              </div>

              {/* Quick Delta Adjustment Buttons */}
              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-800 pt-3">
                <button
                  onClick={() => applyDeltaPercent(v.id, val, -15)}
                  className="flex-1 rounded border border-slate-700 bg-slate-800/80 py-1 font-mono text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  -15%
                </button>
                <button
                  onClick={() => applyDeltaPercent(v.id, val, 15)}
                  className="flex-1 rounded border border-slate-700 bg-slate-800/80 py-1 font-mono text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  +15%
                </button>
                <button
                  onClick={() => applyDeltaPercent(v.id, val, 30)}
                  className="flex-1 rounded border border-slate-700 bg-slate-800/80 py-1 font-mono text-[10px] text-cyan-400 hover:bg-cyan-950"
                >
                  +30%
                </button>
                <button
                  onClick={() => onUpdateVariable(v.id, v.baselineValue)}
                  className="rounded border border-slate-700 bg-slate-800/80 px-2 py-1 font-mono text-[10px] text-slate-400 hover:text-white"
                  title="Reset this variable"
                >
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
