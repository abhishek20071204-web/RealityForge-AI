import React from 'react';
import {
  Cpu,
  Sliders,
  GitFork,
  Swords,
  Network,
  Radar,
  Bot,
  Sparkles,
  TrendingUp,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SimulationScenario, Language, TimeStepMetric } from '../types/simulation';
import { translations } from '../i18n/translations';

interface SimulationStudioProps {
  scenario: SimulationScenario;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  currentStepData: TimeStepMetric;
  timeline: TimeStepMetric[];
  userOverrides: Record<string, number>;
  onNavigateTab: (tab: string) => void;
  language: Language;
  onOpenExplain: (name: string, val: number, base: number) => void;
}

export const SimulationStudio: React.FC<SimulationStudioProps> = ({
  scenario,
  currentYear,
  setCurrentYear,
  currentStepData,
  timeline,
  userOverrides,
  onNavigateTab,
  language,
  onOpenExplain,
}) => {
  const t = translations[language];

  const years = scenario.timeHorizon.intervals;
  const currentCommute = currentStepData?.values['var-commute-delay'] || 46;
  const currentAQI = currentStepData?.values['var-aqi'] || 138;
  const currentHealth = currentStepData?.values['var-health-cost'] || 410;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Top Welcome & KPI HUD Ribbon */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Commute Bottleneck */}
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span>PEAK COMMUTE DELAY</span>
            <button
              onClick={() => onOpenExplain('Peak Commute Delay', currentCommute, 46)}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Explain
            </button>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-black text-white">{currentCommute} min</span>
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
              Year {currentYear}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Baseline 46 min/trip in 2026</p>
        </div>

        {/* KPI 2: Air Quality Index */}
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span>AIR QUALITY INDEX (AQI)</span>
            <button
              onClick={() => onOpenExplain('Air Quality Index', currentAQI, 138)}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Explain
            </button>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-black text-cyan-300">{currentAQI}</span>
            <span
              className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                currentAQI < 100
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {currentAQI < 100 ? 'ACCEPTABLE' : 'UNHEALTHY'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">PM2.5 particulate dispersion index</p>
        </div>

        {/* KPI 3: Civic Health Cost */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span>RESPIRATORY HEALTHCARE</span>
            <button
              onClick={() => onOpenExplain('Healthcare Burden', currentHealth, 410)}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Explain
            </button>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-3xl font-black text-rose-300">${currentHealth}M</span>
            <span className="font-mono text-[10px] text-rose-400">Annual liability</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Direct civic expenditure</p>
        </div>

        {/* KPI 4: System Stress Level */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <span>SYSTEM STRESS LEVEL</span>
            <span className="font-mono font-bold text-amber-400">
              {currentStepData?.systemStress || 45} / 100
            </span>
          </div>
          <div className="mt-3 h-3 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${
                currentStepData?.systemStress < 50
                  ? 'bg-emerald-400'
                  : currentStepData?.systemStress < 75
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${currentStepData?.systemStress || 45}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
            <span>Overhead Headroom</span>
            <span>{100 - (currentStepData?.systemStress || 45)}% remaining</span>
          </div>
        </div>
      </div>

      {/* Main Studio Middle Section: Timeline Trajectory & Quick Levers */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Trajectory Forecast Chart (2026-2050) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-8 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-cyan-400">
                TEMPORAL PROJECTION CURVE (2026 → 2050)
              </span>
              <h3 className="mt-1 font-mono text-base font-bold text-white">
                Multi-Year Commute Delay vs. Air Quality
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                <span>Delay (min)</span>
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                <span>AQI Index</span>
              </span>
            </div>
          </div>

          {/* SVG Multi-Line Chart */}
          <div className="relative mt-6 h-64 w-full">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 700 200">
              {/* Grid Lines */}
              {[0, 50, 100, 150, 200].map((yVal, i) => (
                <line
                  key={i}
                  x1="40"
                  y1={yVal}
                  x2="680"
                  y2={yVal}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Delay Path */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                points={timeline
                  .map((step, idx) => {
                    const x = 50 + idx * 150;
                    const val = step.values['var-commute-delay'] || 46;
                    const y = 180 - (val / 100) * 160;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* AQI Path */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                points={timeline
                  .map((step, idx) => {
                    const x = 50 + idx * 150;
                    const val = step.values['var-aqi'] || 138;
                    const y = 180 - (val / 220) * 160;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Data points & Year markers */}
              {timeline.map((step, idx) => {
                const x = 50 + idx * 150;
                const dVal = step.values['var-commute-delay'] || 46;
                const dy = 180 - (dVal / 100) * 160;
                const isSelected = step.year === currentYear;

                return (
                  <g key={step.year}>
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1="10"
                      x2={x}
                      y2="185"
                      stroke={isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}
                      strokeWidth={isSelected ? '2' : '1'}
                      strokeDasharray={isSelected ? 'none' : '2 2'}
                    />

                    {/* Delay Dot */}
                    <circle
                      cx={x}
                      cy={dy}
                      r={isSelected ? '6' : '4'}
                      fill="#38bdf8"
                      className="cursor-pointer"
                      onClick={() => setCurrentYear(step.year)}
                    />

                    {/* Year Label */}
                    <text
                      x={x}
                      y="200"
                      textAnchor="middle"
                      className={`font-mono text-[10px] ${
                        isSelected ? 'fill-cyan-300 font-bold' : 'fill-slate-500'
                      }`}
                    >
                      {step.year}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>2026 Baseline Inception</span>
            <span className="text-cyan-400">Click any year node to scrub the simulation</span>
            <span>2050 Structural Equilibrium</span>
          </div>
        </div>

        {/* Quick Decision Modules Jump Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-4 backdrop-blur-md">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-300 mb-4">
            Intelligence Modules
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('whatIf')}
              className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs transition-all hover:border-cyan-500 hover:bg-cyan-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-950 p-2 text-purple-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-white">{t.navWhatIf}</p>
                  <p className="text-[11px] text-slate-400">Tune levers & test anomalies</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
            </button>

            <button
              onClick={() => onNavigateTab('strategyBattle')}
              className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs transition-all hover:border-cyan-500 hover:bg-cyan-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-sky-950 p-2 text-sky-400">
                  <Swords className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-white">{t.navStrategyBattle}</p>
                  <p className="text-[11px] text-slate-400">Highways vs. Clean Mass Transit</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
            </button>

            <button
              onClick={() => onNavigateTab('futureFork')}
              className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs transition-all hover:border-purple-500 hover:bg-purple-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-950 p-2 text-purple-400">
                  <GitFork className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-white">{t.navFutureFork}</p>
                  <p className="text-[11px] text-slate-400">Branch parallel realities</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-purple-400" />
            </button>

            <button
              onClick={() => onNavigateTab('causalGraph')}
              className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs transition-all hover:border-cyan-500 hover:bg-cyan-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-950 p-2 text-emerald-400">
                  <Network className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-white">{t.navCausalGraph}</p>
                  <p className="text-[11px] text-slate-400">DAG cause-and-effect network</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
            </button>

            <button
              onClick={() => onNavigateTab('radar')}
              className="group flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs transition-all hover:border-cyan-500 hover:bg-cyan-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-950 p-2 text-cyan-400">
                  <Radar className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-white">{t.navImpactRadar}</p>
                  <p className="text-[11px] text-slate-400">7-dimension resilience polygon</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
