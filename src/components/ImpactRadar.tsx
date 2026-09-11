import React, { useState } from 'react';
import {
  Radar as RadarIcon,
  Sparkles,
  Layers,
  CheckCircle2,
  TrendingUp,
  Activity,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { SimulationScenario, Language, RadarDimension } from '../types/simulation';
import { translations } from '../i18n/translations';
import { SimulationEngine } from '../services/simulationEngine';

interface ImpactRadarProps {
  scenario: SimulationScenario;
  userOverrides: Record<string, number>;
  language: Language;
}

export const ImpactRadar: React.FC<ImpactRadarProps> = ({
  scenario,
  userOverrides,
  language,
}) => {
  const t = translations[language];
  const [showStrategyA, setShowStrategyA] = useState(true);
  const [showStrategyB, setShowStrategyB] = useState(true);

  // Active Radar Metrics from Simulation Engine
  const radarMetrics = SimulationEngine.calculateRadarMetrics(scenario, userOverrides);

  // Strategy Comparison radar scores
  const strategyAMetrics: RadarDimension[] = [
    { dimension: 'Economic Impact', dimensionTa: 'பொருளாதார தாக்கம்', score: 62 },
    { dimension: 'Environmental Quality', dimensionTa: 'சுற்றுச்சூழல் தரம்', score: 38 },
    { dimension: 'Social Equity', dimensionTa: 'சமூக சமத்துவம்', score: 48 },
    { dimension: 'Infrastructure Health', dimensionTa: 'உள்கட்டமைப்பு வளம்', score: 72 },
    { dimension: 'Operational Feasibility', dimensionTa: 'செயல்பாட்டு சாத்தியம்', score: 78 },
    { dimension: 'Risk Immunity', dimensionTa: 'அபாய தடுப்பு', score: 42 },
    { dimension: 'Resource Efficiency', dimensionTa: 'வளப் பயன்பாட்டு திறன்', score: 45 },
  ];

  const strategyBMetrics: RadarDimension[] = [
    { dimension: 'Economic Impact', dimensionTa: 'பொருளாதார தாக்கம்', score: 84 },
    { dimension: 'Environmental Quality', dimensionTa: 'சுற்றுச்சூழல் தரம்', score: 92 },
    { dimension: 'Social Equity', dimensionTa: 'சமூக சமத்துவம்', score: 86 },
    { dimension: 'Infrastructure Health', dimensionTa: 'உள்கட்டமைப்பு வளம்', score: 88 },
    { dimension: 'Operational Feasibility', dimensionTa: 'செயல்பாட்டு சாத்தியம்', score: 70 },
    { dimension: 'Risk Immunity', dimensionTa: 'அபாய தடுப்பு', score: 82 },
    { dimension: 'Resource Efficiency', dimensionTa: 'வளப் பயன்பாட்டு திறன்', score: 85 },
  ];

  // Radar geometry calculations
  const size = 420;
  const center = size / 2;
  const radius = size * 0.38;
  const totalAxes = radarMetrics.length;

  const getCoordinates = (index: number, valueScore: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (valueScore / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const generatePolygonPoints = (metrics: RadarDimension[]) => {
    return metrics
      .map((m, idx) => {
        const { x, y } = getCoordinates(idx, m.score);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const activePoints = generatePolygonPoints(radarMetrics);
  const stratAPoints = generatePolygonPoints(strategyAMetrics);
  const stratBPoints = generatePolygonPoints(strategyBMetrics);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <RadarIcon className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 09: 7-DIMENSION IMPACT RADAR</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? '7-பரிமாண தாக்க ரேடார் (Impact Radar)' : 'Multi-Dimensional Impact Radar Architecture'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'பொருளாதாரம், சுற்றுச்சூழல், சமூகம் மற்றும் உள்கட்டமைப்பு உள்ளிட்ட 7 முக்கிய பரிமாணங்களை விரிவாக ஆராயுங்கள்.'
              : 'Synthesizing 7 macro-dimensions into a composite polygonal resilience envelope.'}
          </p>
        </div>

        {/* Toggle Overlays */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowStrategyA(!showStrategyA)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
              showStrategyA
                ? 'border-sky-400 bg-sky-950/60 text-sky-300'
                : 'border-slate-800 bg-slate-900 text-slate-500'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-sky-400"></span>
            <span>Strategy A Overlay</span>
          </button>

          <button
            onClick={() => setShowStrategyB(!showStrategyB)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
              showStrategyB
                ? 'border-purple-400 bg-purple-950/60 text-purple-300'
                : 'border-slate-800 bg-slate-900 text-slate-500'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-purple-400"></span>
            <span>Strategy B Overlay</span>
          </button>
        </div>
      </div>

      {/* Main Radar Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
        {/* Radar SVG Visualizer */}
        <div className="relative flex justify-center rounded-2xl border border-cyan-500/30 bg-[#050816] p-6 lg:col-span-7 shadow-[0_0_40px_rgba(56,189,248,0.06)]">
          <svg width={size} height={size} className="overflow-visible">
            {/* Concentric rings (20%, 40%, 60%, 80%, 100%) */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
              <polygon
                key={i}
                points={Array.from({ length: totalAxes })
                  .map((_, idx) => {
                    const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
                    const r = level * radius;
                    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="rgba(56, 189, 248, 0.15)"
                strokeWidth="1"
              />
            ))}

            {/* Radial axis spokes */}
            {Array.from({ length: totalAxes }).map((_, idx) => {
              const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
              const x = center + radius * Math.cos(angle);
              const y = center + radius * Math.sin(angle);
              return (
                <line
                  key={idx}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(56, 189, 248, 0.2)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Strategy A polygon overlay */}
            {showStrategyA && (
              <polygon
                points={stratAPoints}
                fill="rgba(56, 189, 248, 0.12)"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            )}

            {/* Strategy B polygon overlay */}
            {showStrategyB && (
              <polygon
                points={stratBPoints}
                fill="rgba(168, 85, 247, 0.15)"
                stroke="#a855f7"
                strokeWidth="2"
              />
            )}

            {/* Active Simulation Primary polygon */}
            <polygon
              points={activePoints}
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10b981"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]"
            />

            {/* Points & Axis Labels */}
            {radarMetrics.map((m, idx) => {
              const { x, y } = getCoordinates(idx, m.score);
              const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
              const labelRadius = radius + 26;
              const lx = center + labelRadius * Math.cos(angle);
              const ly = center + labelRadius * Math.sin(angle);

              return (
                <g key={idx}>
                  {/* Vertex node */}
                  <circle cx={x} cy={y} r="4" fill="#10b981" />

                  {/* Label */}
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-300 font-mono text-[10px] font-bold"
                  >
                    {language === 'ta' ? m.dimensionTa : m.dimension}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dimension Breakdown Cards */}
        <div className="space-y-3 lg:col-span-5">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-300 mb-4">
            Dimension Scores & Impact Vector
          </h3>

          {radarMetrics.map((m) => (
            <div
              key={m.dimension}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-md"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-white">
                  {language === 'ta' ? m.dimensionTa : m.dimension}
                </span>
                <span className="font-extrabold text-emerald-400">{m.score} / 100</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${m.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
