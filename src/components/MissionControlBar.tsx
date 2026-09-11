import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  GitFork,
  Save,
  Activity,
  Zap,
  Gauge,
} from 'lucide-react';
import { SimulationScenario, Language, TimeStepMetric } from '../types/simulation';
import { translations } from '../i18n/translations';

interface MissionControlBarProps {
  scenario: SimulationScenario;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  language: Language;
  currentStepData: TimeStepMetric;
  onReset: () => void;
  onSaveCheckpoint: () => void;
  onForkBranch: () => void;
  onOpenAssumptions: () => void;
}

export const MissionControlBar: React.FC<MissionControlBarProps> = ({
  scenario,
  currentYear,
  setCurrentYear,
  isPlaying,
  setIsPlaying,
  language,
  currentStepData,
  onReset,
  onSaveCheckpoint,
  onForkBranch,
  onOpenAssumptions,
}) => {
  const t = translations[language];
  const years = scenario.timeHorizon.intervals;

  // Determine stress indicator color
  const getStressColor = (stress: number) => {
    if (stress < 40) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (stress < 70) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  return (
    <div className="border-b border-cyan-950/60 bg-[#070b19]/90 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        {/* Scenario Header Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm font-bold text-white sm:text-base">
                {language === 'ta' ? scenario.titleTa : scenario.title}
              </h2>
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300 border border-cyan-800/40">
                {scenario.category}
              </span>
            </div>
            <p className="line-clamp-1 max-w-lg text-xs text-slate-400">
              {language === 'ta' ? scenario.taglineTa : scenario.tagline}
            </p>
          </div>
        </div>

        {/* Center: Interactive Timeline Scrubber */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 transition-colors hover:bg-cyan-500 hover:text-slate-950"
            title={isPlaying ? 'Pause' : 'Play timeline'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          </button>

          <div className="flex items-center gap-1.5">
            {years.map((year) => {
              const isSelected = currentYear === year;
              return (
                <button
                  key={year}
                  onClick={() => setCurrentYear(year)}
                  className={`rounded-md px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                    isSelected
                      ? 'border border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>

          <button
            onClick={onReset}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
            title={t.resetVariables}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right: Real-Time HUD Metrics & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* System Stress Meter */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono font-bold ${getStressColor(
              currentStepData?.systemStress || 45
            )}`}
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>STRESS: {currentStepData?.systemStress || 45}%</span>
          </div>

          {/* Risk Level */}
          <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/30 px-2.5 py-1 font-mono font-bold text-rose-300">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>RISK: {currentStepData?.riskLevel || 50}%</span>
          </div>

          {/* Confidence */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-2.5 py-1 font-mono text-cyan-300 sm:flex">
            <Zap className="h-3.5 w-3.5" />
            <span>CONF: {currentStepData?.confidenceLevel || 85}%</span>
          </div>

          {/* Action triggers: Assumptions disclosure */}
          <button
            onClick={onOpenAssumptions}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-slate-500 hover:text-white"
            title={t.assumptionsUncertainty}
          >
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">{t.assumptionsUncertainty.split(' ')[0]}</span>
          </button>

          {/* Save checkpoint */}
          <button
            onClick={onSaveCheckpoint}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-cyan-500 hover:text-cyan-300"
            title={t.saveCheckpoint}
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t.saveCheckpoint}</span>
          </button>

          {/* Fork branch */}
          <button
            onClick={onForkBranch}
            className="flex items-center gap-1 rounded-lg border border-purple-500/40 bg-purple-950/40 px-2.5 py-1 font-mono font-bold text-purple-300 hover:bg-purple-900/50"
            title={t.forkFuture}
          >
            <GitFork className="h-3.5 w-3.5" />
            <span>{t.forkFuture}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
