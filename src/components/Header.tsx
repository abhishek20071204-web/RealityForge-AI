import React from 'react';
import {
  Globe,
  Sliders,
  Cpu,
  GitFork,
  Swords,
  Network,
  Bot,
  Radar,
  History,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Settings as SettingsIcon,
  Compass,
} from 'lucide-react';
import { Language } from '../types/simulation';
import { translations } from '../i18n/translations';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onReset: () => void;
  openSettings: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  currentYear,
  setCurrentYear,
  isPlaying,
  setIsPlaying,
  onReset,
  openSettings,
  hasApiKey,
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'home', label: t.navHome, icon: Compass },
    { id: 'studio', label: t.navStudio, icon: Cpu },
    { id: 'builder', label: t.navBuilder, icon: Sparkles },
    { id: 'worldModel', label: t.navWorldModel, icon: Globe },
    { id: 'whatIf', label: t.navWhatIf, icon: Sliders },
    { id: 'multiFuture', label: t.navMultiFuture, icon: GitFork },
    { id: 'strategyBattle', label: t.navStrategyBattle, icon: Swords },
    { id: 'causalGraph', label: t.navCausalGraph, icon: Network },
    { id: 'futureFork', label: t.navFutureFork, icon: GitFork },
    { id: 'timeMachine', label: t.navTimeMachine, icon: Play },
    { id: 'radar', label: t.navImpactRadar, icon: Radar },
    { id: 'copilot', label: t.navCopilot, icon: Bot },
    { id: 'history', label: t.navHistory, icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-950/60 bg-[#060a17]/90 backdrop-blur-xl">
      {/* Top Utility Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('home')}
            className="group flex items-center gap-2 text-left transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-950/30 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <Cpu className="h-4 w-4 text-cyan-400 transition-transform group-hover:scale-110" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black tracking-widest text-white">
                  REALITYFORGE <span className="text-cyan-400">AI</span>
                </span>
                <span className="rounded border border-cyan-500/30 bg-cyan-950/40 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-cyan-300">
                  v2.6 OS
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-400">{t.tagline}</p>
            </div>
          </button>
        </div>

        {/* Center Live Year Scrubbing Pill */}
        <div className="hidden items-center gap-2 rounded-full border border-cyan-500/20 bg-slate-900/80 px-3 py-1 md:flex">
          <span className="font-mono text-[11px] font-bold text-slate-400">HORIZON:</span>
          <span className="font-mono text-xs font-black text-cyan-300 shadow-sm">{currentYear}</span>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-5 w-5 items-center justify-center rounded bg-cyan-950/80 text-cyan-300 hover:bg-cyan-800 hover:text-white"
              title={isPlaying ? 'Pause simulation timeline' : 'Auto-play timeline'}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
            </button>
            <button
              onClick={onReset}
              className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              title={t.resetVariables}
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right Tools: Status, Language & Settings */}
        <div className="flex items-center gap-3">
          {/* AI Status Badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] sm:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                hasApiKey ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
              }`}
            ></span>
            <span className="font-mono text-slate-300">
              {hasApiKey ? 'GEMINI 3.8 LIVE' : 'SIMULATION ENGINE'}
            </span>
          </div>

          {/* Bilingual Language Selector */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900/80 p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`rounded px-2 py-0.5 font-mono text-[11px] font-medium transition-colors ${
                language === 'en'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                language === 'ta'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={openSettings}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
            title={t.navSettings}
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Tab Ribbon */}
      <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
                isActive
                  ? 'border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
