import React from 'react';
import { X, Settings, Globe, Cpu, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { Language } from '../types/simulation';
import { translations } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onResetAllData: () => void;
  hasApiKey: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  onResetAllData,
  hasApiKey,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/40 bg-[#060a19] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase">
              SIMULATION OS PREFERENCES
            </span>
            <h2 className="font-mono text-lg font-bold text-white">{t.navSettings}</h2>
          </div>
        </div>

        <div className="mt-6 space-y-5 text-xs">
          {/* Language Switcher */}
          <div>
            <label className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>Language / மொழி</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`rounded-xl border p-3 text-center font-mono font-bold transition-all ${
                  language === 'en'
                    ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                English (US)
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`rounded-xl border p-3 text-center font-bold transition-all ${
                  language === 'ta'
                    ? 'border-cyan-400 bg-cyan-950/80 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>

          {/* AI Backend Status */}
          <div>
            <label className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              <span>AI Engine Architecture</span>
            </label>
            <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`flex items-center gap-1 font-bold ${
                    hasApiKey ? 'text-emerald-400' : 'text-cyan-400'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      hasApiKey ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                  ></span>
                  <span>{hasApiKey ? 'Gemini 3.8 Flash (Active)' : 'High-Fidelity Offline Engine'}</span>
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 font-sans">
                Full-stack server proxies calls securely. Local high-order heuristic simulation guarantees zero disruption.
              </p>
            </div>
          </div>

          {/* Reset All Data */}
          <div>
            <label className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
              <span>Reset State & Cache</span>
            </label>
            <div className="mt-2">
              <button
                onClick={() => {
                  onResetAllData();
                  onClose();
                }}
                className="w-full rounded-xl border border-rose-500/40 bg-rose-950/30 p-2.5 font-mono text-xs font-bold text-rose-300 hover:bg-rose-900/50"
              >
                Restore Transportation Crisis Demo Scenario
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-cyan-600 px-5 py-2 font-mono text-xs font-bold text-slate-950 hover:bg-cyan-500"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
