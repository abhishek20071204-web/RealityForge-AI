import React, { useState } from 'react';
import {
  GitFork,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { FutureForkNode, Language, SimulationScenario } from '../types/simulation';
import { translations } from '../i18n/translations';

interface FutureForkTreeProps {
  nodes: FutureForkNode[];
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onAddCustomFork: (parentNodeId: string, title: string) => void;
  language: Language;
}

export const FutureForkTree: React.FC<FutureForkTreeProps> = ({
  nodes,
  activeNodeId,
  onSelectNode,
  onAddCustomFork,
  language,
}) => {
  const t = translations[language];
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>(activeNodeId);
  const [newBranchTitle, setNewBranchTitle] = useState('');

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  const getNodeMetrics = (node?: FutureForkNode) => {
    if (!node) return { delay: 42, aqi: 110, risk: 35, stress: 48, cost: 320 };
    return {
      delay: node.metrics?.delay ?? (node.kpis?.trafficCongestion ? Math.round(node.kpis.trafficCongestion * 0.85) : 42),
      aqi: node.metrics?.aqi ?? node.kpis?.pollutionAQI ?? 110,
      risk: node.metrics?.risk ?? (node.kpis ? Math.round(100 - node.kpis.budgetHealth) : 35),
      stress: node.metrics?.stress ?? node.kpis?.trafficCongestion ?? 48,
      cost: node.metrics?.cost ?? 320,
    };
  };

  const activeMetrics = getNodeMetrics(activeNode);

  const handleCreateFork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchTitle.trim()) return;

    onAddCustomFork(selectedParentId, newBranchTitle);
    setNewBranchTitle('');
    setIsForkModalOpen(false);
  };

  // Group nodes by generation or year
  const rootNode = nodes.find((n) => !n.parentId);
  const midNodes = nodes.filter((n) => n.parentId === rootNode?.id);
  const leafNodes = nodes.filter((n) => midNodes.some((m) => m.id === n.parentId));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-0.5 text-xs text-purple-300">
            <GitFork className="h-3.5 w-3.5" />
            <span className="font-mono">KILLER FEATURE: DIVERGENT FUTURE FORK TREE</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'எதிர்கால கிளை மரம் (Future Fork Tree)' : 'Multi-Timeline Branching Tree & Parallel Realities'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'முடிவு புள்ளிகளில் இருந்து வெவ்வேறு எதிர்கால பாதைகளை ஆராயுங்கள். எந்த கிளையையும் தேர்ந்தெடுத்து புதிய உலகத்தை உருவகப்படுத்துங்கள்.'
              : 'Branch, fork, and test alternative timelines at any decision milestone. Fork multiple parallel futures from 2026 to 2050.'}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedParentId(activeNodeId);
            setIsForkModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span>{t.forkFuture}</span>
        </button>
      </div>

      {/* Visual Timeline Tree Canvas */}
      <div className="mt-8 rounded-2xl border border-purple-500/30 bg-[#060918] p-6 shadow-[0_0_40px_rgba(168,85,247,0.06)] overflow-x-auto">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <span className="rounded bg-purple-950 px-2.5 py-0.5 font-mono text-[10px] font-bold text-purple-300 border border-purple-800">
              PARALLEL REALITY GRAPH
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Active Focus: <strong className="text-white">{activeNode.title}</strong> ({activeNode.year})
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Click any node to transition simulation state to that fork
          </span>
        </div>

        {/* Tree Representation */}
        <div className="mt-8 flex items-start gap-12 min-w-[900px] py-4">
          {/* Generation 0: 2026 Inception Point */}
          {rootNode && (
            <div className="flex flex-col items-center">
              <span className="font-mono text-xs font-bold text-slate-400 mb-2">YEAR 2026</span>
              <div
                onClick={() => onSelectNode(rootNode.id)}
                className={`relative w-64 cursor-pointer rounded-2xl border p-4 transition-all backdrop-blur-md ${
                  activeNodeId === rootNode.id
                    ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_25px_rgba(56,189,248,0.35)] scale-105'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase">
                    ORIGIN ROOT
                  </span>
                  <span className="font-mono text-xs font-bold text-white">{rootNode.year}</span>
                </div>
                <h4 className="mt-2 font-mono text-sm font-bold text-white">
                  {language === 'ta' ? rootNode.titleTa : rootNode.title}
                </h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  {language === 'ta' ? rootNode.descriptionTa : rootNode.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800 pt-2">
                  <div>
                    <span className="text-slate-500">Delay:</span>{' '}
                    <strong className="text-white">{getNodeMetrics(rootNode).delay} min</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">AQI:</span>{' '}
                    <strong className="text-cyan-300">{getNodeMetrics(rootNode).aqi}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connector Arrow */}
          <div className="pt-20 text-slate-600">
            <ArrowRight className="h-6 w-6" />
          </div>

          {/* Generation 1: 2035 Policy Divergence */}
          <div className="flex flex-col gap-6">
            <span className="font-mono text-xs font-bold text-slate-400 text-center">
              YEAR 2035 DIVERGENCE
            </span>
            {midNodes.map((node) => {
              const isSelected = activeNodeId === node.id;
              const isStratA = node.id.includes('strat-a');
              const m = getNodeMetrics(node);

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`relative w-72 cursor-pointer rounded-2xl border p-4 transition-all backdrop-blur-md ${
                    isSelected
                      ? isStratA
                        ? 'border-sky-400 bg-sky-950/80 shadow-[0_0_25px_rgba(56,189,248,0.35)] scale-105'
                        : 'border-purple-400 bg-purple-950/80 shadow-[0_0_25px_rgba(168,85,247,0.35)] scale-105'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        isStratA
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      BRANCH {node.year}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Risk: {m.risk}%
                    </span>
                  </div>

                  <h4 className="mt-2 font-mono text-sm font-bold text-white">
                    {language === 'ta' ? node.titleTa : node.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {language === 'ta' ? node.descriptionTa || node.summaryTa : node.description || node.summary}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-1 text-[10px] font-mono border-t border-slate-800 pt-2 text-center">
                    <div>
                      <p className="text-slate-500">Delay</p>
                      <p className="font-bold text-white">{m.delay}m</p>
                    </div>
                    <div>
                      <p className="text-slate-500">AQI</p>
                      <p className="font-bold text-cyan-300">{m.aqi}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Stress</p>
                      <p className="font-bold text-amber-400">{m.stress}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connector Arrow */}
          <div className="pt-20 text-slate-600">
            <ArrowRight className="h-6 w-6" />
          </div>

          {/* Generation 2: 2050 Endgame Realities */}
          <div className="flex flex-col gap-6">
            <span className="font-mono text-xs font-bold text-slate-400 text-center">
              YEAR 2050 OUTCOMES
            </span>
            {leafNodes.map((node) => {
              const isSelected = activeNodeId === node.id;
              const m = getNodeMetrics(node);
              const isClean = m.aqi < 100;

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`relative w-72 cursor-pointer rounded-2xl border p-4 transition-all backdrop-blur-md ${
                    isSelected
                      ? isClean
                        ? 'border-emerald-400 bg-emerald-950/80 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-105'
                        : 'border-rose-400 bg-rose-950/80 shadow-[0_0_25px_rgba(244,63,94,0.35)] scale-105'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        isClean
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {isClean ? 'HIGH RESILIENCE' : 'CHRONIC BOTTLENECK'}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{node.year}</span>
                  </div>

                  <h4 className="mt-2 font-mono text-sm font-bold text-white">
                    {language === 'ta' ? node.titleTa : node.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {language === 'ta' ? node.descriptionTa || node.summaryTa : node.description || node.summary}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-1 text-[10px] font-mono border-t border-slate-800 pt-2 text-center">
                    <div>
                      <p className="text-slate-500">Delay</p>
                      <p className="font-bold text-white">{m.delay}m</p>
                    </div>
                    <div>
                      <p className="text-slate-500">AQI</p>
                      <p className="font-bold text-cyan-300">{m.aqi}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Cost</p>
                      <p className="font-bold text-rose-300">${m.cost}M</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Fork Deep-Dive Inspector */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-4">
          <div>
            <span className="rounded bg-cyan-950 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-800">
              ACTIVE REALITY BRANCH INSPECTION
            </span>
            <h3 className="mt-2 font-mono text-xl font-bold text-white">
              {language === 'ta' ? activeNode.titleTa : activeNode.title} ({activeNode.year})
            </h3>
          </div>
          <button
            onClick={() => {
              setSelectedParentId(activeNode.id);
              setIsForkModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 px-4 py-2 font-mono text-xs font-bold text-purple-300 hover:bg-purple-900/50"
          >
            <GitFork className="h-4 w-4" />
            <span>Fork Sub-Branch From Here</span>
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-3xl">
          {language === 'ta' ? activeNode.descriptionTa || activeNode.summaryTa : activeNode.description || activeNode.summary}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono">
            <span className="text-[11px] text-slate-500">COMMUTE DELAY</span>
            <p className="mt-1 text-2xl font-bold text-white">{activeMetrics.delay} min</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono">
            <span className="text-[11px] text-slate-500">AIR QUALITY (AQI)</span>
            <p className="mt-1 text-2xl font-bold text-cyan-300">{activeMetrics.aqi}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono">
            <span className="text-[11px] text-slate-500">SYSTEM STRESS</span>
            <p className="mt-1 text-2xl font-bold text-amber-400">{activeMetrics.stress} / 100</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono">
            <span className="text-[11px] text-slate-500">HEALTH BURDEN</span>
            <p className="mt-1 text-2xl font-bold text-rose-300">${activeMetrics.cost}M/yr</p>
          </div>
        </div>
      </div>

      {/* Modal to spawn a new branch */}
      {isForkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#070b1b] p-6 shadow-2xl">
            <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
              <GitFork className="h-5 w-5 text-purple-400" />
              <span>Spawn New Parallel Reality Fork</span>
            </h3>
            <p className="mt-2 text-xs text-slate-400">
              Branching from:{' '}
              <strong className="text-cyan-300">
                {nodes.find((n) => n.id === selectedParentId)?.title || 'Current Node'}
              </strong>
            </p>

            <form onSubmit={handleCreateFork} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300">New Branch Title / Hypothesis:</label>
                <input
                  type="text"
                  value={newBranchTitle}
                  onChange={(e) => setNewBranchTitle(e.target.value)}
                  placeholder="e.g. Aggressive Hydrogen Tramway Expansion"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white focus:border-purple-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForkModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 font-mono text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 font-mono text-xs font-bold text-white hover:bg-purple-500"
                >
                  Initialize Fork
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
