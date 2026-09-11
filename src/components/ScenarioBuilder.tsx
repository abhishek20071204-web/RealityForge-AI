import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Layers,
  Sliders,
  Network,
  ShieldAlert,
  Target,
  FileCode,
} from 'lucide-react';
import { SimulationScenario, SimulationVariable, Language, VariableCategory } from '../types/simulation';
import { translations } from '../i18n/translations';
import { AIService } from '../services/aiService';

interface ScenarioBuilderProps {
  scenario: SimulationScenario;
  onUpdateScenario: (newScenario: SimulationScenario) => void;
  language: Language;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  scenario,
  onUpdateScenario,
  language,
}) => {
  const t = translations[language];
  const [nlPrompt, setNlPrompt] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'variables' | 'entities' | 'dependencies' | 'constraints' | 'risks'>('variables');

  // New variable draft form
  const [newVarName, setNewVarName] = useState('');
  const [newVarVal, setNewVarVal] = useState<number>(50);
  const [newVarUnit, setNewVarUnit] = useState('units');
  const [newVarMin, setNewVarMin] = useState<number>(0);
  const [newVarMax, setNewVarMax] = useState<number>(100);
  const [newVarCategory, setNewVarCategory] = useState<VariableCategory>('Infrastructure');

  const handleExtractAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlPrompt.trim()) return;

    setIsExtracting(true);
    try {
      const result = await AIService.parseNaturalLanguageScenario(nlPrompt, language);
      if (result.scenario) {
        const merged: SimulationScenario = {
          ...scenario,
          id: result.scenario.id || `custom-${Date.now()}`,
          title: result.scenario.title || scenario.title,
          titleTa: result.scenario.titleTa || scenario.titleTa,
          description: result.scenario.description || nlPrompt,
          descriptionTa: result.scenario.descriptionTa || nlPrompt,
          entities: (result.scenario.entities as any) || scenario.entities,
          variables: (result.scenario.variables as any) || scenario.variables,
          dependencies: (result.scenario.dependencies as any) || scenario.dependencies,
          constraints: (result.scenario.constraints as any) || scenario.constraints,
          objectives: (result.scenario.objectives as any) || scenario.objectives,
          risks: (result.scenario.risks as any) || scenario.risks,
          assumptions: (result.scenario.assumptions as any) || scenario.assumptions,
          updatedAt: new Date().toISOString(),
        };
        onUpdateScenario(merged);
        setNlPrompt('');
      }
    } catch (err) {
      console.error('Failed to extract scenario:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleVariableChange = (id: string, field: keyof SimulationVariable, value: any) => {
    const updatedVars = scenario.variables.map((v) => (v.id === id ? { ...v, [field]: value } : v));
    onUpdateScenario({ ...scenario, variables: updatedVars });
  };

  const handleDeleteVariable = (id: string) => {
    const updatedVars = scenario.variables.filter((v) => v.id !== id);
    onUpdateScenario({ ...scenario, variables: updatedVars });
  };

  const handleAddVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarName.trim()) return;

    const newVar: SimulationVariable = {
      id: `var-custom-${Date.now()}`,
      entityId: scenario.entities[0]?.id || 'ent-custom',
      name: newVarName,
      nameTa: newVarName,
      category: newVarCategory,
      value: newVarVal,
      baselineValue: newVarVal,
      unit: newVarUnit,
      min: newVarMin,
      max: newVarMax,
      step: 1,
      elasticity: 0.75,
      description: 'Custom user defined simulation variable.',
      descriptionTa: 'பயனர் வரையறுத்த புதிய மாதிரி மாறி.',
      provenance: 'USER INPUT',
    };

    onUpdateScenario({ ...scenario, variables: [...scenario.variables, newVar] });
    setNewVarName('');
    setNewVarVal(50);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header Info */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-0.5 text-xs text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-mono">MODULE 01: NATURAL LANGUAGE SCENARIO BUILDER</span>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {language === 'ta' ? 'காட்சி உருவாக்குநர் & AI பிரித்தெடுப்பு' : 'AI Scenario Extraction & Model Architecture'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {language === 'ta'
              ? 'இயற்கை மொழியில் உங்கள் சிக்கலை விவரியுங்கள். AI தானாகவே மாறிகள், தடைகள் மற்றும் காரண-காரிய பிணைப்புகளை உருவாக்கும்.'
              : 'Translate unstructured natural language inquiries into an interconnected, multi-dimensional simulation model.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300">
            {scenario.variables.length} VARIABLES
          </span>
          <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300">
            {scenario.entities.length} ENTITIES
          </span>
          <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300">
            {scenario.dependencies.length} CAUSAL EDGES
          </span>
        </div>
      </div>

      {/* AI Extraction Prompt Form */}
      <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 backdrop-blur-md">
        <form onSubmit={handleExtractAI}>
          <label className="block font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            {language === 'ta' ? 'இயற்கை மொழி கட்டளை உள்ளீடு:' : 'Natural-Language Scenario Directive:'}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={nlPrompt}
              onChange={(e) => setNlPrompt(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'எ.கா: ஒரு உற்பத்தி ஆலையில் 40% சோலார் மின்சாரமும் 20% தானியங்கி அமைப்பும் கொண்டு வந்தால்...'
                  : 'e.g. Model an industrial port with 5,000 container ships/yr converting 40% of berths to shore-power...'
              }
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              disabled={isExtracting}
            />
            <button
              type="submit"
              disabled={isExtracting || !nlPrompt.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  <span>EXTRACTING...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>EXTRACT WITH AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sub-navigation tabs */}
      <div className="mt-8 flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('variables')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold transition-colors ${
            activeSubTab === 'variables' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>VARIABLES ({scenario.variables.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('entities')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold transition-colors ${
            activeSubTab === 'entities' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>ENTITIES ({scenario.entities.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('dependencies')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold transition-colors ${
            activeSubTab === 'dependencies' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network className="h-4 w-4" />
          <span>DEPENDENCIES ({scenario.dependencies.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('constraints')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold transition-colors ${
            activeSubTab === 'constraints' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>CONSTRAINTS & OBJECTIVES</span>
        </button>
        <button
          onClick={() => setActiveSubTab('risks')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-mono font-bold transition-colors ${
            activeSubTab === 'risks' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>RISKS ({scenario.risks.length})</span>
        </button>
      </div>

      {/* Tab Contents: Variables Table & Add Form */}
      {activeSubTab === 'variables' && (
        <div className="mt-6 space-y-6">
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 font-mono uppercase text-slate-400">
                <tr>
                  <th className="p-3">Variable Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Current Value</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Min / Max Range</th>
                  <th className="p-3">Data Provenance</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {scenario.variables.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">
                      <div>
                        {language === 'ta' ? v.nameTa : v.name}
                        <p className="text-[10px] text-slate-400 font-sans">{v.description}</p>
                      </div>
                    </td>
                    <td className="p-3 text-cyan-400">{v.category}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={v.value}
                        onChange={(e) => handleVariableChange(v.id, 'value', Number(e.target.value))}
                        className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </td>
                    <td className="p-3 text-slate-300">{v.unit}</td>
                    <td className="p-3 text-slate-400">
                      {v.min} → {v.max}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          v.provenance === 'REAL DATA'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : v.provenance === 'SIMULATED DATA'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : v.provenance === 'USER INPUT'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {v.provenance}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteVariable(v.id)}
                        className="rounded p-1 text-slate-500 hover:bg-rose-950 hover:text-rose-400"
                        title="Delete variable"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Variable Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Custom Variable to Scenario</span>
            </h3>
            <form onSubmit={handleAddVariable} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-mono text-slate-400">Variable Name</label>
                <input
                  type="text"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="e.g. Micro-Transit Fleet Size"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400">Category</label>
                <select
                  value={newVarCategory}
                  onChange={(e) => setNewVarCategory(e.target.value as VariableCategory)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Demographics">Demographics</option>
                  <option value="Environment">Environment</option>
                  <option value="Economy">Economy</option>
                  <option value="Technology">Technology</option>
                  <option value="Public Health">Public Health</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400">Baseline Value</label>
                <input
                  type="number"
                  value={newVarVal}
                  onChange={(e) => setNewVarVal(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400">Unit</label>
                <input
                  type="text"
                  value={newVarUnit}
                  onChange={(e) => setNewVarUnit(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-cyan-500"
                >
                  Insert Variable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Contents: Entities */}
      {activeSubTab === 'entities' && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenario.entities.map((e) => (
            <div key={e.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: e.color || '#38bdf8' }}
                ></div>
                <h4 className="font-mono text-sm font-bold text-white">
                  {language === 'ta' ? e.nameTa : e.name}
                </h4>
              </div>
              <span className="mt-2 inline-block rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                {e.category}
              </span>
              <p className="mt-3 text-xs text-slate-400">
                {language === 'ta' ? e.descriptionTa : e.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Contents: Dependencies */}
      {activeSubTab === 'dependencies' && (
        <div className="mt-6 space-y-3">
          {scenario.dependencies.map((d, idx) => {
            const srcVar = scenario.variables.find((v) => v.id === d.source);
            const tgtVar = scenario.variables.find((v) => v.id === d.target);
            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs"
              >
                <div className="flex items-center gap-3 font-mono">
                  <span className="font-bold text-cyan-400">{srcVar?.name || d.source}</span>
                  <span className="text-slate-500">→</span>
                  <span className="font-bold text-purple-400">{tgtVar?.name || d.target}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold ${
                      d.strength > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Strength: {d.strength > 0 ? `+${d.strength}` : d.strength}
                  </span>
                  <p className="max-w-md text-slate-400 font-sans hidden sm:block">
                    {language === 'ta' ? d.descriptionTa : d.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Contents: Constraints & Objectives */}
      {activeSubTab === 'constraints' && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Constraints */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Boundary Constraints</span>
            </h3>
            <div className="mt-4 space-y-3">
              {scenario.constraints.map((c) => (
                <div key={c.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-300">{language === 'ta' ? c.textTa : c.text}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        c.status === 'satisfied'
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : 'text-amber-400 bg-amber-950/60'
                      }`}
                    >
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Target Objectives</span>
            </h3>
            <div className="mt-4 space-y-3">
              {scenario.objectives.map((o) => (
                <div key={o.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-300">{language === 'ta' ? o.targetMetricTa : o.targetMetric}</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {o.direction.toUpperCase()} {o.targetValue} {o.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: Risks */}
      {activeSubTab === 'risks' && (
        <div className="mt-6 space-y-4">
          {scenario.risks.map((r) => (
            <div key={r.id} className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <h4 className="font-mono text-sm font-bold text-white">
                    {language === 'ta' ? r.nameTa : r.name}
                  </h4>
                </div>
                <span className="rounded bg-rose-950 px-2 py-0.5 font-mono font-bold uppercase text-rose-300 border border-rose-800">
                  {r.severity} SEVERITY
                </span>
              </div>
              <p className="mt-2 text-slate-300">
                <strong className="text-amber-400">Trigger Threshold: </strong>
                {language === 'ta' ? r.thresholdTriggerTa : r.thresholdTrigger}
              </p>
              <p className="mt-1 text-slate-300">
                <strong className="text-emerald-400">Mitigation Strategy: </strong>
                {language === 'ta' ? r.mitigationTa : r.mitigation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
