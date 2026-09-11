import React, { useState } from 'react';
import {
  Swords,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  TrendingUp,
  Scale,
  DollarSign,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import { SimulationScenario, Strategy, Language } from '../types/simulation';
import { translations } from '../i18n/translations';
import { AIService } from '../services/aiService';
import { SimulationEngine } from '../services/simulationEngine';

interface StrategyBattleProps {
  scenario: SimulationScenario;
  strategies: Strategy[] | { strategyA?: Strategy; strategyB?: Strategy } | Record<string, Strategy>;
  language: Language;
}

export const StrategyBattle: React.FC<StrategyBattleProps> = ({
  scenario,
  strategies,
  language,
}) => {
  const t = translations[language];

  const strategyList: Strategy[] = React.useMemo(() => {
    if (Array.isArray(strategies)) return strategies;
    if (strategies && typeof strategies === 'object') {
      return Object.values(strategies).filter(
        (s): s is Strategy => Boolean(s && typeof s === 'object' && 'id' in s)
      );
    }
    return [];
  }, [strategies]);

  const defaultStratA: Strategy = {
    id: 'strat-highways',
    name: 'Strategy A: Major Arterial & Expressway Expansion',
    nameTa: 'உத்தி A: பெருவழி மற்றும் அதிவேக நெடுஞ்சாலை விரிவாக்கம்',
    description: 'Construct 280km of elevated multi-tier expressways, widen arterial rings, and digitize toll gates.',
    descriptionTa: '280 கிமீ உயரமான மேம்பாலங்கள் அமைத்தல், சாலைகளை விரிவாக்குதல் மற்றும் டிஜிட்டல் சுங்கச்சாவடிகள்.',
    color: '#f59e0b',
    costBillions: 5.4,
    implementationYears: 6,
    actions: [],
    efficiencyScore: 54,
    riskLevel: 'High',
    longTermImpact: 'Marginal',
    resourceDemandScore: 78,
    goalAchievement: 42,
  };

  const defaultStratB: Strategy = {
    id: 'strat-transit-grid',
    name: 'Strategy B: Zero-Emission High-Capacity Transit & Micro-Mobility Grid',
    nameTa: 'உத்தி B: அதிவேக தூய பொதுப் போக்குவரத்து & மைக்ரோ-மொபிலிட்டி',
    description: 'Deploy 4 automated electric light-rail lines, dedicated Bus Rapid Transit (BRT) veins, and 180km protected active mobility lanes.',
    descriptionTa: '4 தானியங்கி மின்சார ரயில் பாதைகள், பிரத்யேக அதிவேக பேருந்து வழிகள் மற்றும் 180 கிமீ பாதுகாப்பான மிதிவண்டி பாதைகள்.',
    color: '#10b981',
    costBillions: 4.6,
    implementationYears: 5,
    actions: [],
    efficiencyScore: 91,
    riskLevel: 'Low',
    longTermImpact: 'Transformational',
    resourceDemandScore: 48,
    goalAchievement: 89,
  };

  const [strategyAId, setStrategyAId] = useState<string>(strategyList[0]?.id || defaultStratA.id);
  const [strategyBId, setStrategyBId] = useState<string>(strategyList[1]?.id || defaultStratB.id);
  const [isBattling, setIsBattling] = useState(false);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);

  const stratA = strategyList.find((s) => s.id === strategyAId) || strategyList[0] || defaultStratA;
  const stratB = strategyList.find((s) => s.id === strategyBId) || strategyList[1] || defaultStratB;

  const getCost = (s: any) => s?.costBillions ?? s?.costBillion ?? 5.0;
  const getEfficiency = (s: any) => s?.efficiencyScore ?? s?.efficiency ?? 60;
  const getRiskScore = (s: any) =>
    typeof s?.riskScore === 'number'
      ? s.riskScore
      : s?.riskLevel === 'High'
      ? 75
      : s?.riskLevel === 'Low'
      ? 25
      : 50;
  const getGoalRate = (s: any) => s?.goalAchievementRate ?? s?.goalAchievement ?? 50;
  const getLongTerm = (s: any) =>
    typeof s?.longTermImpact === 'number'
      ? s.longTermImpact
      : s?.longTermImpact === 'Transformational' || s?.longTermImpact === 'Transformative'
      ? 88
      : 55;

  const costA = getCost(stratA);
  const costB = getCost(stratB);
  const effA = getEfficiency(stratA);
  const effB = getEfficiency(stratB);
  const riskA = getRiskScore(stratA);
  const riskB = getRiskScore(stratB);
  const goalA = getGoalRate(stratA);
  const goalB = getGoalRate(stratB);
  const longA = getLongTerm(stratA);
  const longB = getLongTerm(stratB);

  const battleComparison = SimulationEngine.compareStrategies(scenario, stratA, stratB);

  const handleSimulateBattle = async () => {
    setIsBattling(true);
    setAiVerdict(null);

    // Call server Gemini verdict endpoint
    try {
      const verdict = await AIService.evaluateStrategyBattle(
        scenario.title,
        stratA,
        stratB,
        battleComparison,
        language
      );
      setAiVerdict(verdict);
    } catch (e) {
      console.error('Battle evaluation error:', e);
    } finally {
      setIsBattling(false);
    }
  };

  const getWinnerBadge = (metricA: number, metricB: number, lowerIsBetter = false) => {
    if (metricA === metricB) return 'TIE';
    if (lowerIsBetter) {
      return metricA < metricB ? 'STRATEGY A' : 'STRATEGY B';
    }
    return metricA > metricB ? 'STRATEGY A' : 'STRATEGY B';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <Swords className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 06: STRATEGY BATTLE & COMPARATIVE MATRIX</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'உத்திகள் போர் & ஒப்பீட்டு தேர்வு' : 'Strategy Battle: Head-to-Head Policy Evaluation'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'இரு மாறுபட்ட வளர்ச்சி உத்திகளை நேரடியாக மோதவிட்டு, நீண்டகால செலவு, திறன் மற்றும் அபாயங்களை ஒப்பிடுங்கள்.'
              : 'Pitch two policy architectures against each other to surface systemic trade-offs, induced demand, and ROI.'}
          </p>
        </div>

        <button
          onClick={handleSimulateBattle}
          disabled={isBattling}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:opacity-95 disabled:opacity-50"
        >
          {isBattling ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              <span>SIMULATING BATTLE CLASH...</span>
            </>
          ) : (
            <>
              <Swords className="h-4 w-4" />
              <span>{t.simulateBattle}</span>
            </>
          )}
        </button>
      </div>

      {/* Selectors and Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Strategy A Card */}
        <div className="rounded-2xl border border-sky-500/40 bg-sky-950/20 p-6 lg:col-span-5 shadow-[0_0_30px_rgba(56,189,248,0.08)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="rounded bg-sky-950 px-2.5 py-1 font-mono text-xs font-bold text-sky-300 border border-sky-800">
              STRATEGY A
            </span>
            <span className="font-mono text-xs font-bold text-white">${costA}B EST.</span>
          </div>

          <div className="mt-4">
            <label className="text-[11px] font-mono text-slate-400">Select Architecture A:</label>
            <select
              value={strategyAId}
              onChange={(e) => setStrategyAId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold text-white focus:border-sky-400 focus:outline-none"
            >
              {strategyList.map((s) => (
                <option key={s.id} value={s.id}>
                  {language === 'ta' ? s.nameTa : s.name} (${getCost(s)}B)
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs text-slate-300 leading-relaxed">
            {language === 'ta' ? stratA.descriptionTa : stratA.description}
          </p>

          {/* Metric Ratings */}
          <div className="mt-6 space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300">
                <span>EFFICIENCY SCORE</span>
                <span className="font-bold text-sky-300">{effA}/100</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-sky-400" style={{ width: `${effA}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300">
                <span>RISK LIABILITY SCORE</span>
                <span className="font-bold text-rose-400">{riskA}/100</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${riskA}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300">
                <span>LONG-TERM RESILIENCE</span>
                <span className="font-bold text-amber-300">{longA}/100</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${longA}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300">
                <span>GOAL ACHIEVEMENT</span>
                <span className="font-bold text-emerald-300">{goalA}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${goalA}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Clash Badge */}
        <div className="flex flex-col items-center justify-center lg:col-span-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/40 bg-slate-900 shadow-[0_0_30px_rgba(56,189,248,0.3)]">
            <Swords className="h-8 w-8 text-cyan-400 animate-pulse" />
          </div>
          <span className="mt-3 font-mono text-xs font-black tracking-widest text-slate-400">
            HEAD-TO-HEAD
          </span>
        </div>

        {/* Strategy B Card */}
        <div className="rounded-2xl border border-purple-500/40 bg-purple-950/20 p-6 lg:col-span-5 shadow-[0_0_30px_rgba(168,85,247,0.08)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="rounded bg-purple-950 px-2.5 py-1 font-mono text-xs font-bold text-purple-300 border border-purple-800">
              STRATEGY B
            </span>
            <span className="font-mono text-xs font-bold text-white">${costB}B EST.</span>
          </div>

          <div className="mt-4">
            <label className="text-[11px] font-mono text-slate-400">Select Architecture B:</label>
            <select
              value={strategyBId}
              onChange={(e) => setStrategyBId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold text-white focus:border-purple-400 focus:outline-none"
            >
              {strategyList.map((s) => (
                <option key={s.id} value={s.id}>
                  {language === 'ta' ? s.nameTa : s.name} (${getCost(s)}B)
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs text-slate-300 leading-relaxed">
            {language === 'ta' ? stratB.descriptionTa : stratB.description}
          </p>

          {/* Metric Ratings */}
          <div className="mt-6 space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300">
                <span>EFFICIENCY SCORE</span>
                <span className="font-bold text-purple-300">{effB}/100</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-400"
                  style={{ width: `${effB}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300">
                <span>RISK LIABILITY SCORE</span>
                <span className="font-bold text-rose-400">{riskB}/100</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${riskB}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300">
                <span>LONG-TERM RESILIENCE</span>
                <span className="font-bold text-emerald-300">{longB}/100</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${longB}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300">
                <span>GOAL ACHIEVEMENT</span>
                <span className="font-bold text-emerald-300">{goalB}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${goalB}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Trade-Off Matrix */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <Scale className="h-4 w-4" />
          <span>Multi-Dimensional Trade-Off Comparison Matrix</span>
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-slate-800 uppercase text-slate-400">
              <tr>
                <th className="p-3">Evaluation Vector</th>
                <th className="p-3 text-sky-400">Strategy A: {stratA.name}</th>
                <th className="p-3 text-purple-400">Strategy B: {stratB.name}</th>
                <th className="p-3 text-emerald-400">Advantage Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr>
                <td className="p-3 font-semibold">Capital Expenditure (Budget)</td>
                <td className="p-3">${costA} Billion</td>
                <td className="p-3">${costB} Billion</td>
                <td className="p-3 font-bold text-cyan-300">
                  {getWinnerBadge(costA, costB, true)}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">2050 Commute Bottleneck Delay</td>
                <td className="p-3">
                  {battleComparison.stratATimeline[battleComparison.stratATimeline.length - 1]
                    ?.values['var-commute-delay'] || 58}{' '}
                  min
                </td>
                <td className="p-3">
                  {battleComparison.stratBTimeline[battleComparison.stratBTimeline.length - 1]
                    ?.values['var-commute-delay'] || 34}{' '}
                  min
                </td>
                <td className="p-3 font-bold text-emerald-300">STRATEGY B (-41% delay)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">2050 Air Quality (AQI)</td>
                <td className="p-3">
                  {battleComparison.stratATimeline[battleComparison.stratATimeline.length - 1]
                    ?.values['var-aqi'] || 162}
                </td>
                <td className="p-3">
                  {battleComparison.stratBTimeline[battleComparison.stratBTimeline.length - 1]
                    ?.values['var-aqi'] || 78}
                </td>
                <td className="p-3 font-bold text-emerald-300">STRATEGY B (Clean Air)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Induced Demand Vulnerability</td>
                <td className="p-3 text-rose-400">High (+42% private car rebound)</td>
                <td className="p-3 text-emerald-400">Low (Structural modal diversion)</td>
                <td className="p-3 font-bold text-emerald-300">STRATEGY B</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Long-Term Goal Achievement Rate</td>
                <td className="p-3">{goalA}%</td>
                <td className="p-3">{goalB}%</td>
                <td className="p-3 font-bold text-purple-300">
                  {getWinnerBadge(goalA, goalB)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Verdict Section */}
      {aiVerdict && (
        <div className="mt-8 rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#080f26] to-[#040817] p-6 shadow-[0_0_35px_rgba(56,189,248,0.15)]">
          <div className="flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-mono text-base font-bold uppercase tracking-wider">
              {t.aiVerdict}
            </h3>
          </div>

          <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
            {aiVerdict}
          </div>
        </div>
      )}
    </div>
  );
};
