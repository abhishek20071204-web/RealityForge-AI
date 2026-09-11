import React, { useState } from 'react';
import {
  Globe,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Maximize2,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { SimulationScenario, SimulationVariable, Language, TimeStepMetric } from '../types/simulation';
import { translations } from '../i18n/translations';

interface DigitalWorldModelProps {
  scenario: SimulationScenario;
  currentStepData: TimeStepMetric;
  currentYear: number;
  language: Language;
  onUpdateVariable: (id: string, newVal: number) => void;
  onOpenExplain: (metricName: string, metricVal: number, baseVal: number) => void;
}

export const DigitalWorldModel: React.FC<DigitalWorldModelProps> = ({
  scenario,
  currentStepData,
  currentYear,
  language,
  onUpdateVariable,
  onOpenExplain,
}) => {
  const t = translations[language];
  const [selectedEntityId, setSelectedEntityId] = useState<string>(scenario.entities[0]?.id || '');
  const [selectedVar, setSelectedVar] = useState<SimulationVariable | null>(null);

  const selectedEntity = scenario.entities.find((e) => e.id === selectedEntityId);
  const entityVars = scenario.variables.filter((v) => v.entityId === selectedEntityId);

  // Layout node coordinates for interconnected entities graph
  const entityPositions: Record<string, { x: number; y: number }> = {
    'ent-population': { x: 120, y: 180 },
    'ent-mobility': { x: 380, y: 100 },
    'ent-transit': { x: 380, y: 280 },
    'ent-environment': { x: 640, y: 180 },
    'ent-health-budget': { x: 900, y: 180 },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <Globe className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 02: DIGITAL WORLD MODEL</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'டிஜிட்டல் உலக மாதிரி & காரண பிணையம்' : 'Digital World Model & System Dynamics'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'மக்கள்தொகை, போக்குவரத்து, காற்றுத் தரம் மற்றும் மருத்துவ சுமை ஆகியவற்றின் ஒன்றோடொன்று இணைக்கப்பட்ட தொடர்பு.'
              : 'Visualizing structural entities, live variable vectors, and feedback cascades at year ' + currentYear}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded-lg border border-cyan-500/30 bg-cyan-950/50 px-3 py-1.5 text-cyan-300">
            YEAR {currentYear} ACTIVE
          </span>
          <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-400">
            LIVE CAUSAL FLOWS
          </span>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Graph Stage */}
        <div className="relative rounded-2xl border border-cyan-500/30 bg-[#060a17] p-4 lg:col-span-8 shadow-[0_0_40px_rgba(56,189,248,0.06)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-mono text-xs font-bold tracking-wider text-cyan-300">
                INTERCONNECTED ENTITY GRAPH
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Click any node to inspect constituent variables & elasticities
            </p>
          </div>

          {/* SVG Vector Topology */}
          <div className="relative h-[380px] w-full overflow-x-auto">
            <svg className="h-full w-[1000px] min-w-full">
              <defs>
                <linearGradient id="cyanToPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="cyanToEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Edges with moving pulses */}
              {/* Population -> Mobility */}
              <line
                x1={170}
                y1={180}
                x2={330}
                y2={110}
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-60"
              />
              {/* Population -> Transit */}
              <line
                x1={170}
                y1={180}
                x2={330}
                y2={270}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-60"
              />
              {/* Mobility -> Environment */}
              <line
                x1={430}
                y1={110}
                x2={590}
                y2={170}
                stroke="#f59e0b"
                strokeWidth="2.5"
                className="opacity-70"
              />
              {/* Transit -> Environment */}
              <line
                x1={430}
                y1={270}
                x2={590}
                y2={190}
                stroke="#10b981"
                strokeWidth="2"
                className="opacity-60"
              />
              {/* Environment -> Health/Budget */}
              <line
                x1={690}
                y1={180}
                x2={850}
                y2={180}
                stroke="#ec4899"
                strokeWidth="3"
                className="opacity-80"
              />

              {/* Animated particle flow on Highway to Environment */}
              <circle r="4" fill="#38bdf8" filter="url(#glowEffect)">
                <animateMotion
                  path="M 170 180 L 330 110 L 430 110 L 590 170 L 690 180 L 850 180"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="4" fill="#10b981" filter="url(#glowEffect)">
                <animateMotion
                  path="M 170 180 L 330 270 L 430 270 L 590 190"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* Overlaid Entity Interactive Node Cards */}
            {scenario.entities.map((ent) => {
              const pos = entityPositions[ent.id] || { x: 300, y: 150 };
              const isSelected = selectedEntityId === ent.id;

              return (
                <div
                  key={ent.id}
                  onClick={() => setSelectedEntityId(ent.id)}
                  style={{ left: `${pos.x - 60}px`, top: `${pos.y - 45}px` }}
                  className={`absolute z-10 w-40 cursor-pointer rounded-xl border p-3 transition-all backdrop-blur-md ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/90 shadow-[0_0_25px_rgba(56,189,248,0.3)] scale-105'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: ent.color || '#38bdf8' }}
                    ></span>
                    <h4 className="truncate font-mono text-xs font-bold text-white">
                      {language === 'ta' ? ent.nameTa : ent.name}
                    </h4>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-cyan-300">
                    {scenario.variables.filter((v) => v.entityId === ent.id).length} variables
                  </p>
                </div>
              );
            })}
          </div>

          {/* Causal Narrative Strip */}
          <div className="mt-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs text-slate-300">
            <span className="font-mono font-bold text-cyan-400">ACTIVE CASCADE FLOW: </span>
            <span>
              Population Influx (1.0M) → Vehicle Density (520) → Peak Commute Delay (
              {currentStepData?.values['var-commute-delay'] || 46} min) → AQI (
              {currentStepData?.values['var-aqi'] || 138}) → Healthcare Burden ($
              {currentStepData?.values['var-health-cost'] || 410}M/yr)
            </span>
          </div>
        </div>

        {/* Right Entity & Variable Inspector Drawer */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-4 backdrop-blur-md">
          {selectedEntity ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-[10px] text-cyan-300 border border-cyan-800">
                    {selectedEntity.category}
                  </span>
                  <h3 className="mt-2 font-mono text-lg font-bold text-white">
                    {language === 'ta' ? selectedEntity.nameTa : selectedEntity.name}
                  </h3>
                </div>
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: selectedEntity.color }}
                ></div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {language === 'ta' ? selectedEntity.descriptionTa : selectedEntity.description}
              </p>

              {/* Constituent Variables for this Entity */}
              <div className="mt-5 space-y-4">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                  Sub-Variables ({entityVars.length})
                </h4>

                {entityVars.map((v) => {
                  const currentValue =
                    currentStepData?.values[v.id] !== undefined
                      ? currentStepData.values[v.id]
                      : v.value;

                  return (
                    <div
                      key={v.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">
                          {language === 'ta' ? v.nameTa : v.name}
                        </span>
                        <button
                          onClick={() =>
                            onOpenExplain(
                              language === 'ta' ? v.nameTa : v.name,
                              currentValue,
                              v.baselineValue
                            )
                          }
                          className="rounded px-2 py-0.5 font-mono text-[10px] text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950"
                        >
                          Explain
                        </button>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-mono text-lg font-extrabold text-cyan-300">
                          {currentValue} {v.unit}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Baseline: {v.baselineValue}
                        </span>
                      </div>

                      {/* Slider to adjust on the fly */}
                      <div className="mt-3">
                        <input
                          type="range"
                          min={v.min}
                          max={v.max}
                          step={v.step}
                          value={v.value}
                          onChange={(e) => onUpdateVariable(v.id, Number(e.target.value))}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-slate-500">
                          <span>{v.min}</span>
                          <span>What-If Input</span>
                          <span>{v.max}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Select an entity from the graph to inspect.</p>
          )}
        </div>
      </div>
    </div>
  );
};
