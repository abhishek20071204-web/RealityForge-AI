import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Play,
  FileJson,
  CheckCircle2,
  Clock,
  Edit2,
} from 'lucide-react';
import { Language, SavedSimulationCheckpoint, SimulationScenario } from '../types/simulation';
import { translations } from '../i18n/translations';

interface SimulationHistoryProps {
  checkpoints: SavedSimulationCheckpoint[];
  onRestoreCheckpoint: (cp: SavedSimulationCheckpoint) => void;
  onDeleteCheckpoint: (id: string) => void;
  onDuplicateCheckpoint: (cp: SavedSimulationCheckpoint) => void;
  onSaveCurrentCheckpoint: (name: string) => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  language: Language;
}

export const SimulationHistory: React.FC<SimulationHistoryProps> = ({
  checkpoints,
  onRestoreCheckpoint,
  onDeleteCheckpoint,
  onDuplicateCheckpoint,
  onSaveCurrentCheckpoint,
  onExportJSON,
  onImportJSON,
  language,
}) => {
  const t = translations[language];
  const [newCheckpointName, setNewCheckpointName] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckpointName.trim()) return;
    onSaveCurrentCheckpoint(newCheckpointName);
    setNewCheckpointName('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <HistoryIcon className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 11: SIMULATION HISTORY & CHECKPOINT ARCHIVE</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'உருவகப்படுத்துதல் வரலாறு & சேமிக்கப்பட்ட நிலைகள்' : 'Simulation History & State Checkpoints'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'உங்கள் உருவகப்படுத்துதல் நிலைகளை சேமிக்கவும், ஒப்பிடவும், மீண்டும் இயக்கவும் அல்லது JSON கோப்பாக ஏற்றுமதி செய்யவும்.'
              : 'Archive simulation runs, restore temporal states, clone parameters, and export/import full model schemas.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportJSON}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 font-mono text-xs text-slate-200 hover:border-cyan-500 hover:text-cyan-300"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 font-mono text-xs text-slate-200 hover:border-cyan-500 hover:text-cyan-300 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Save New Checkpoint Banner */}
      <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 backdrop-blur-md">
        <form onSubmit={handleSave} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={newCheckpointName}
            onChange={(e) => setNewCheckpointName(e.target.value)}
            placeholder="Name this state checkpoint (e.g. 2035 Clean Transit Benchmark)..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono"
            required
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-400 shrink-0"
          >
            <Save className="h-4 w-4" />
            <span>Save Checkpoint</span>
          </button>
        </form>
      </div>

      {/* Checkpoints Grid */}
      <div className="mt-8 space-y-4">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-300">
          Saved Checkpoints ({checkpoints.length})
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {checkpoints.map((cp) => (
            <div
              key={cp.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300">
                    YEAR {cp.year}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 text-[10px]">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(cp.timestamp).toLocaleDateString()}</span>
                  </span>
                </div>

                <h4 className="mt-3 font-mono text-base font-bold text-white">{cp.name}</h4>
                <p className="mt-1 font-mono text-xs text-slate-400">{cp.scenarioTitle}</p>

                {/* Metrics Readout */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-800/80 bg-slate-950 p-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">Commute Delay</span>
                    <p className="font-bold text-white">{cp.metrics.delay} min</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Air Quality</span>
                    <p className="font-bold text-cyan-300">{cp.metrics.aqi} AQI</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">System Stress</span>
                    <p className="font-bold text-amber-400">{cp.metrics.stress}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Overrides</span>
                    <p className="font-bold text-purple-400">
                      {Object.keys(cp.overrides).length} active
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <button
                  onClick={() => onRestoreCheckpoint(cp)}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-600/30 px-3 py-1.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Restore</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDuplicateCheckpoint(cp)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                    title="Duplicate Checkpoint"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCheckpoint(cp.id)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950 hover:text-rose-400"
                    title="Delete Checkpoint"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
