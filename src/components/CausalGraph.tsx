import React, { useState } from 'react';
import {
  Network,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  Info,
  Sliders,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { SimulationScenario, SimulationVariable, Language, CausalDependency } from '../types/simulation';
import { translations } from '../i18n/translations';

interface CausalGraphProps {
  scenario: SimulationScenario;
  language: Language;
  onOpenExplain: (metricName: string, metricVal: number, baseVal: number) => void;
}

export const CausalGraph: React.FC<CausalGraphProps> = ({
  scenario,
  language,
  onOpenExplain,
}) => {
  const t = translations[language];
  const [selectedVarId, setSelectedVarId] = useState<string>(scenario.variables[0]?.id || '');

  const selectedVar = scenario.variables.find((v) => v.id === selectedVarId) || scenario.variables[0] || {
    id: 'default',
    entityId: '',
    name: 'Variable',
    nameTa: 'மாறி',
    value: 0,
    baselineValue: 0,
    unit: '',
    min: 0,
    max: 100,
    step: 1,
    elasticity: 0,
    category: 'General',
    description: 'System variable',
  };

  // Inflows: Dependencies where target === selectedVarId
  const inflows = scenario.dependencies ? scenario.dependencies.filter((d) => d.target === selectedVar.id) : [];
  // Outflows: Dependencies where source === selectedVarId
  const outflows = scenario.dependencies ? scenario.dependencies.filter((d) => d.source === selectedVar.id) : [];

  // Layout positions for variable nodes in SVG network
  const varPositions: Record<string, { x: number; y: number }> = {
    'var-population': { x: 120, y: 150 },
    'var-pop': { x: 120, y: 150 },
    'var-vehicle-density': { x: 340, y: 90 },
    'var-veh-density': { x: 340, y: 90 },
    'var-transit-capacity': { x: 340, y: 280 },
    'var-transit-cap': { x: 340, y: 280 },
    'var-highway-lanes': { x: 340, y: 430 },
    'var-commute-delay': { x: 580, y: 180 },
    'var-ev-adoption': { x: 580, y: 360 },
    'var-ev-pct': { x: 580, y: 360 },
    'var-aqi': { x: 820, y: 220 },
    'var-health-cost': { x: 1040, y: 220 },
  };

  const getNodePosition = (vId: string, idx: number) => {
    if (varPositions[vId]) return varPositions[vId];
    const cols = 4;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return {
      x: 120 + col * 260,
      y: 110 + row * 150,
    };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <Network className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 07: CAUSAL INTELLIGENCE & GRAPH TOPOLOGY</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'காரண-காரிய பிணையம் & நுண்ணறிவு' : 'Causal Graph & Elasticity Architecture'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'மாறிகளுக்கு இடையேயான நேர்மறை (+) மற்றும் எதிர்மறை (-) தாக்க பிணைப்புகளை ஊடாடும் முறையில் ஆராயுங்கள்.'
              : 'Interactive network mapping systemic feedback loops, directional vector strength, and causal chains.'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>+ Positive Reinforcing</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400"></span>
            <span>- Inverse Dampening</span>
          </span>
        </div>
      </div>

      {/* Main Network Visualizer & Inspector */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SVG Network Stage */}
        <div className="relative rounded-2xl border border-cyan-500/30 bg-[#050815] p-4 lg:col-span-8 shadow-[0_0_40px_rgba(56,189,248,0.06)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="font-mono text-xs font-bold text-cyan-300">
              CAUSAL DIRECTED ACYCLIC GRAPH (DAG)
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              Click node to trace inflows & outflows
            </span>
          </div>

          <div className="relative h-[480px] w-full overflow-x-auto">
            <svg className="h-full w-[1160px] min-w-full">
              <defs>
                <marker
                  id="arrow-positive"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
                <marker
                  id="arrow-negative"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                </marker>
              </defs>

              {/* Draw Edges */}
              {scenario.dependencies.map((dep, idx) => {
                const sIdx = scenario.variables.findIndex((v) => v.id === dep.source);
                const tIdx = scenario.variables.findIndex((v) => v.id === dep.target);
                const sPos = getNodePosition(dep.source, sIdx >= 0 ? sIdx : 0);
                const tPos = getNodePosition(dep.target, tIdx >= 0 ? tIdx : 1);
                const isPositive = dep.strength > 0;
                const isConnectedToSelected =
                  dep.source === selectedVar.id || dep.target === selectedVar.id;

                return (
                  <g key={idx}>
                    <line
                      x1={sPos.x}
                      y1={sPos.y}
                      x2={tPos.x}
                      y2={tPos.y}
                      stroke={isPositive ? '#10b981' : '#f43f5e'}
                      strokeWidth={isConnectedToSelected ? '3' : '1.5'}
                      strokeOpacity={isConnectedToSelected ? '0.9' : '0.4'}
                      strokeDasharray={isPositive ? 'none' : '4 4'}
                      markerEnd={isPositive ? 'url(#arrow-positive)' : 'url(#arrow-negative)'}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Overlaid Variable Node Cards */}
            {scenario.variables.map((v, idx) => {
              const pos = getNodePosition(v.id, idx);
              const isSelected = selectedVar.id === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVarId(v.id)}
                  style={{ left: `${pos.x - 65}px`, top: `${pos.y - 35}px` }}
                  className={`absolute z-10 w-36 cursor-pointer rounded-xl border p-2.5 transition-all backdrop-blur-md ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/90 shadow-[0_0_25px_rgba(56,189,248,0.4)] scale-110'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'
                  }`}
                >
                  <p className="truncate font-mono text-[11px] font-bold text-white">
                    {language === 'ta' ? v.nameTa : v.name}
                  </p>
                  <div className="mt-1 flex items-baseline justify-between text-[10px]">
                    <span className="font-mono font-bold text-cyan-300">
                      {v.value} {v.unit}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      e: {v.elasticity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Causal Intelligence Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-800">
                VARIABLE INSPECTOR
              </span>
              <h3 className="mt-2 font-mono text-lg font-bold text-white">
                {language === 'ta' ? selectedVar.nameTa : selectedVar.name}
              </h3>
            </div>
            <button
              onClick={() =>
                onOpenExplain(
                  language === 'ta' ? selectedVar.nameTa : selectedVar.name,
                  selectedVar.value,
                  selectedVar.baselineValue
                )
              }
              className="rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 font-mono text-xs text-cyan-300 hover:bg-cyan-900 flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Explain</span>
            </button>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Current Value:</span>
              <span className="font-bold text-white">
                {selectedVar.value} {selectedVar.unit}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Baseline Level:</span>
              <span className="font-bold text-slate-300">
                {selectedVar.baselineValue} {selectedVar.unit}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Elasticity Coefficient:</span>
              <span className="font-bold text-cyan-400">{selectedVar.elasticity}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Provenance:</span>
              <span className="text-[10px] rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                {selectedVar.provenance}
              </span>
            </div>
          </div>

          {/* Inflows Section */}
          <div className="mt-5">
            <h4 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Influenced By ({inflows.length})</span>
            </h4>
            <div className="mt-2 space-y-2">
              {inflows.length > 0 ? (
                inflows.map((inf, idx) => {
                  const src = scenario.variables.find((v) => v.id === inf.source);
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-cyan-300">{src?.name || inf.source}</span>
                        <span
                          className={`font-bold ${
                            inf.strength > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {inf.strength > 0 ? `+${inf.strength}` : inf.strength}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 font-sans">
                        {language === 'ta' ? inf.descriptionTa : inf.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">No incoming causal dependencies (root variable).</p>
              )}
            </div>
          </div>

          {/* Outflows Section */}
          <div className="mt-5">
            <h4 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Cascades Onto ({outflows.length})</span>
            </h4>
            <div className="mt-2 space-y-2">
              {outflows.length > 0 ? (
                outflows.map((out, idx) => {
                  const tgt = scenario.variables.find((v) => v.id === out.target);
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-purple-300">{tgt?.name || out.target}</span>
                        <span
                          className={`font-bold ${
                            out.strength > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {out.strength > 0 ? `+${out.strength}` : out.strength}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 font-sans">
                        {language === 'ta' ? out.descriptionTa : out.description}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">Terminal outcome node.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
