import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  Zap,
} from 'lucide-react';
import { SimulationScenario, Language, TimeStepMetric } from '../types/simulation';
import { translations } from '../i18n/translations';

interface FutureTimeMachineProps {
  scenario: SimulationScenario;
  timeline: TimeStepMetric[];
  currentYear: number;
  setCurrentYear: (year: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  language: Language;
  onOpenExplain: (metricName: string, metricVal: number, baseVal: number) => void;
}

export const FutureTimeMachine: React.FC<FutureTimeMachineProps> = ({
  scenario,
  timeline,
  currentYear,
  setCurrentYear,
  isPlaying,
  setIsPlaying,
  language,
  onOpenExplain,
}) => {
  const t = translations[language];
  const years = scenario.timeHorizon.intervals;
  const currentStep = timeline.find((s) => s.year === currentYear) || timeline[0] || {
    year: currentYear,
    values: {},
    systemStress: 50,
    confidenceLevel: 85,
  };

  const getMetricVal = (vals: Record<string, number> | undefined, key: string, fallback: number) => {
    if (!vals) return fallback;
    if (vals[key] !== undefined) return vals[key];
    const match = Object.keys(vals).find((k) => k.toLowerCase().includes(key.replace('var-', '').toLowerCase()));
    if (match && vals[match] !== undefined) return vals[match];
    return fallback;
  };

  const commuteDelayVal = getMetricVal(currentStep.values, 'var-commute-delay', 46);
  const aqiVal = getMetricVal(currentStep.values, 'var-aqi', 138);
  const healthCostVal = getMetricVal(currentStep.values, 'var-health-cost', 410);

  const handleStepPrev = () => {
    const idx = years.indexOf(currentYear);
    if (idx > 0) setCurrentYear(years[idx - 1]);
  };

  const handleStepNext = () => {
    const idx = years.indexOf(currentYear);
    if (idx < years.length - 1) setCurrentYear(years[idx + 1]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 08: FUTURE TIME MACHINE & TEMPORAL ENGINE</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'எதிர்கால கால இயந்திரம் (Time Machine)' : 'Future Time Machine: Chronological Scrubbing'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? '2026 முதல் 2050 வரையிலான காலகட்டத்தை முன்னோக்கி அல்லது பின்னோக்கி இயக்கி கணினி நிலையை கவனியுங்கள்.'
              : 'Travel through temporal horizons from 2026 to 2050. Watch system stress, bottlenecks, and confidence envelopes evolve.'}
          </p>
        </div>

        {/* Big Time Scrubber Controller */}
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-3 shadow-lg">
          <button
            onClick={handleStepPrev}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Step Back"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:opacity-90"
            title={isPlaying ? 'Pause' : 'Play timeline'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
          </button>
          <button
            onClick={handleStepNext}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Step Next"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <div className="border-l border-slate-700 pl-3">
            <span className="block font-mono text-[10px] text-slate-400 uppercase">EPOCH YEAR</span>
            <span className="font-mono text-xl font-black text-cyan-300">{currentYear}</span>
          </div>
        </div>
      </div>

      {/* Main Epoch Card */}
      <div className="mt-8 rounded-2xl border border-cyan-500/30 bg-slate-900/70 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-4">
          <div>
            <span className="rounded bg-cyan-950 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-800">
              SIMULATED SNAPSHOT AT {currentYear}
            </span>
            <h3 className="mt-2 font-mono text-xl font-bold text-white">
              Epoch Milestone: {currentYear === 2026 ? 'Baseline Calibration' : currentYear <= 2035 ? 'Mid-Horizon Stress' : 'Endgame Structural Equilibrium'}
            </h3>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">Model Confidence:</span>
            <span className="rounded bg-slate-800 px-2.5 py-1 text-cyan-300 font-bold">
              {currentStep.confidenceLevel}% ± 8%
            </span>
          </div>
        </div>

        {/* 4 Large Metric Gauges for the Active Epoch */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>PEAK COMMUTE DELAY</span>
              <button
                onClick={() =>
                  onOpenExplain('Peak Commute Delay', commuteDelayVal, 46)
                }
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Explain
              </button>
            </div>
            <p className="mt-2 text-3xl font-black text-white">
              {commuteDelayVal} <span className="text-sm font-normal text-slate-400">min</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {commuteDelayVal > 46 ? '+ Delay Increase' : '- Reduced Congestion'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>AIR QUALITY (AQI)</span>
              <button
                onClick={() => onOpenExplain('Air Quality (AQI)', aqiVal, 138)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Explain
              </button>
            </div>
            <p className="mt-2 text-3xl font-black text-cyan-300">
              {aqiVal} <span className="text-sm font-normal text-slate-400">AQI</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {aqiVal < 100 ? 'Moderate Health Risk' : 'Unhealthy Tier'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>CIVIC HEALTHCARE COST</span>
              <button
                onClick={() =>
                  onOpenExplain('Healthcare Burden', healthCostVal, 410)
                }
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Explain
              </button>
            </div>
            <p className="mt-2 text-3xl font-black text-rose-300">
              ${healthCostVal}M{' '}
              <span className="text-sm font-normal text-slate-400">/yr</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Respiratory & smog liabilities</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>SYSTEM STRESS INDEX</span>
              <span className="font-bold text-amber-400">{currentStep.systemStress}/100</span>
            </div>
            <div className="mt-4 h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${
                  currentStep.systemStress < 50
                    ? 'bg-emerald-400'
                    : currentStep.systemStress < 75
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${currentStep.systemStress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">Infrastructure capacity headroom</p>
          </div>
        </div>

        {/* Interactive Scrubbing Slider */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex justify-between font-mono text-xs text-slate-400">
            <span>2026 INCEPTION</span>
            <span className="text-cyan-400 font-bold">TEMPORAL TIME-STEPS</span>
            <span>2050 HORIZON</span>
          </div>

          <input
            type="range"
            min={2026}
            max={2050}
            step={1}
            value={currentYear}
            onChange={(e) => {
              const val = Number(e.target.value);
              // Snap to nearest milestone or exact year
              const nearest = years.reduce((prev, curr) =>
                Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
              );
              setCurrentYear(nearest);
            }}
            className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
          />

          <div className="mt-3 flex justify-between font-mono text-xs">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setCurrentYear(y)}
                className={`rounded-lg px-2.5 py-1 font-bold transition-colors ${
                  y === currentYear
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_#38bdf8]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Year-by-Year Chronological Horizon Cards */}
      <div className="mt-8">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
          Chronological Epoch Timeline Cards
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {timeline.map((step) => {
            const isSelected = step.year === currentYear;

            return (
              <div
                key={step.year}
                onClick={() => setCurrentYear(step.year)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all backdrop-blur-md ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_25px_rgba(56,189,248,0.3)] scale-105'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black text-white">{step.year}</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                    Conf: {step.confidenceLevel}%
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Delay:</span>
                    <span className="font-bold text-white">
                      {getMetricVal(step.values, 'var-commute-delay', 46)} min
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>AQI:</span>
                    <span className="font-bold text-cyan-300">
                      {getMetricVal(step.values, 'var-aqi', 138)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Stress:</span>
                    <span className="font-bold text-amber-400">{step.systemStress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
