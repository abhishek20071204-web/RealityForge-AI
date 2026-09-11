import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  demoTransportationScenario,
  demoStrategies,
  demoForkNodes,
} from './services/demoScenario';
import {
  SimulationScenario,
  Language,
  TimeStepMetric,
  FutureOutcomeType,
  FutureForkNode,
  SavedSimulationCheckpoint,
} from './types/simulation';
import { SimulationEngine } from './services/simulationEngine';
import { AIService } from './services/aiService';

// Component imports
import { Header } from './components/Header';
import { MissionControlBar } from './components/MissionControlBar';
import { HeroSection } from './components/HeroSection';
import { SimulationStudio } from './components/SimulationStudio';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { DigitalWorldModel } from './components/DigitalWorldModel';
import { WhatIfLab } from './components/WhatIfLab';
import { MultiFutureGenerator } from './components/MultiFutureGenerator';
import { StrategyBattle } from './components/StrategyBattle';
import { CausalGraph } from './components/CausalGraph';
import { FutureForkTree } from './components/FutureForkTree';
import { FutureTimeMachine } from './components/FutureTimeMachine';
import { ImpactRadar } from './components/ImpactRadar';
import { AICopilot } from './components/AICopilot';
import { SimulationHistory } from './components/SimulationHistory';
import { AIExplanationModal } from './components/AIExplanationModal';
import { AssumptionsModal } from './components/AssumptionsModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Main simulation state
  const [scenario, setScenario] = useState<SimulationScenario>(demoTransportationScenario);
  const [userOverrides, setUserOverrides] = useState<Record<string, number>>({});
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Future Fork Tree state
  const [forkNodes, setForkNodes] = useState<FutureForkNode[]>(demoForkNodes);
  const [activeForkNodeId, setActiveForkNodeId] = useState<string>('fork-root');

  // Checkpoint History
  const [checkpoints, setCheckpoints] = useState<SavedSimulationCheckpoint[]>([
    {
      id: 'cp-init',
      name: 'Initial 2026 Calibration State',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      scenarioTitle: demoTransportationScenario.title,
      year: 2026,
      overrides: {},
      metrics: {
        delay: 46,
        aqi: 138,
        cost: 410,
        stress: 48,
      },
    },
  ]);

  // Modal States
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [explanationData, setExplanationData] = useState<{
    name: string;
    val: number;
    base: number;
  }>({ name: '', val: 0, base: 0 });

  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Verify backend health & Gemini connectivity
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setHasApiKey(data.geminiConfigured);
        }
      })
      .catch((err) => {
        console.warn('Backend check:', err);
      });
  }, []);

  // Compute active simulation timeline based on scenario and current overrides
  const activeTimeline: TimeStepMetric[] = SimulationEngine.simulateTimeline(
    scenario,
    userOverrides
  );

  const currentStepData: TimeStepMetric =
    activeTimeline.find((s) => s.year === currentYear) || activeTimeline[0];

  // Auto-play temporal simulation timer (2.2s per epoch step)
  useEffect(() => {
    if (!isPlaying) return;

    const intervals = scenario.timeHorizon.intervals;
    const timer = setInterval(() => {
      setCurrentYear((prevYear) => {
        const idx = intervals.indexOf(prevYear);
        if (idx === -1 || idx >= intervals.length - 1) {
          return intervals[0];
        }
        return intervals[idx + 1];
      });
    }, 2200);

    return () => clearInterval(timer);
  }, [isPlaying, scenario.timeHorizon.intervals]);

  // Prompt scenario extraction handler
  const handleSelectPrompt = async (promptText: string) => {
    setIsSynthesizing(true);
    try {
      const result = await AIService.parseNaturalLanguageScenario(promptText, language);
      if (result.scenario) {
        const merged: SimulationScenario = {
          ...scenario,
          id: result.scenario.id || `scenario-${Date.now()}`,
          title: result.scenario.title || promptText.slice(0, 40),
          titleTa: result.scenario.titleTa || promptText.slice(0, 40),
          description: result.scenario.description || promptText,
          descriptionTa: result.scenario.descriptionTa || promptText,
          entities: (result.scenario.entities as any) || scenario.entities,
          variables: (result.scenario.variables as any) || scenario.variables,
          dependencies: (result.scenario.dependencies as any) || scenario.dependencies,
          constraints: (result.scenario.constraints as any) || scenario.constraints,
          objectives: (result.scenario.objectives as any) || scenario.objectives,
          risks: (result.scenario.risks as any) || scenario.risks,
          assumptions: (result.scenario.assumptions as any) || scenario.assumptions,
          updatedAt: new Date().toISOString(),
        };
        setScenario(merged);
        setUserOverrides({});
        setCurrentYear(merged.timeHorizon.startYear || 2026);
        setCurrentTab('studio');

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#a855f7', '#10b981'],
        });
      }
    } catch (e) {
      console.error('Scenario parse error:', e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Launch pre-configured crisis demo
  const handleLaunchDemo = () => {
    setScenario(demoTransportationScenario);
    setUserOverrides({});
    setCurrentYear(2026);
    setCurrentTab('studio');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#38bdf8', '#a855f7', '#10b981'],
    });
  };

  // Reset variables overrides
  const handleResetOverrides = () => {
    setUserOverrides({});
  };

  // Update specific variable
  const handleUpdateVariable = (id: string, newVal: number) => {
    setUserOverrides((prev) => ({
      ...prev,
      [id]: newVal,
    }));
  };

  // Adopt parameters from multi-future generator
  const handleApplyFutureAsUserDefined = (futureType: FutureOutcomeType) => {
    const updated = { ...userOverrides };
    if (futureType === 'optimistic') {
      updated['var-transit-cap'] = 380;
      updated['var-ev-pct'] = 45;
      updated['var-highway-lanes'] = 320;
    } else if (futureType === 'high-risk') {
      updated['var-veh-density'] = 680;
      updated['var-transit-cap'] = 140;
      updated['var-ev-pct'] = 12;
    }
    setUserOverrides(updated);
    setCurrentTab('whatIf');
  };

  // Open explanation modal
  const handleOpenExplain = (metricName: string, metricVal: number, baselineVal: number) => {
    setExplanationData({
      name: metricName,
      val: metricVal,
      base: baselineVal,
    });
    setIsExplanationOpen(true);
  };

  // Save current checkpoint
  const handleSaveCurrentCheckpoint = (name: string) => {
    const newCp: SavedSimulationCheckpoint = {
      id: `cp-${Date.now()}`,
      name,
      timestamp: new Date().toISOString(),
      scenarioTitle: scenario.title,
      year: currentYear,
      overrides: { ...userOverrides },
      metrics: {
        delay: currentStepData?.values['var-commute-delay'] || 46,
        aqi: currentStepData?.values['var-aqi'] || 138,
        cost: currentStepData?.values['var-health-cost'] || 410,
        stress: currentStepData?.systemStress || 45,
      },
    };

    setCheckpoints((prev) => [newCp, ...prev]);
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#10b981'],
    });
  };

  // Restore saved checkpoint
  const handleRestoreCheckpoint = (cp: SavedSimulationCheckpoint) => {
    setUserOverrides(cp.overrides);
    setCurrentYear(cp.year);
    setCurrentTab('studio');
  };

  // Delete saved checkpoint
  const handleDeleteCheckpoint = (id: string) => {
    setCheckpoints((prev) => prev.filter((c) => c.id !== id));
  };

  // Duplicate saved checkpoint
  const handleDuplicateCheckpoint = (cp: SavedSimulationCheckpoint) => {
    const dup: SavedSimulationCheckpoint = {
      ...cp,
      id: `cp-${Date.now()}`,
      name: `${cp.name} (Copy)`,
      timestamp: new Date().toISOString(),
    };
    setCheckpoints((prev) => [dup, ...prev]);
  };

  // Export JSON file
  const handleExportJSON = () => {
    const data = {
      scenario,
      userOverrides,
      checkpoints,
      forkNodes,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realityforge-simulation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.scenario) setScenario(json.scenario);
        if (json.userOverrides) setUserOverrides(json.userOverrides);
        if (json.checkpoints) setCheckpoints(json.checkpoints);
        if (json.forkNodes) setForkNodes(json.forkNodes);
        setCurrentTab('studio');
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Add custom fork node
  const handleAddCustomFork = (parentNodeId: string, title: string) => {
    const parent = forkNodes.find((n) => n.id === parentNodeId) || forkNodes[0];
    const newNode: FutureForkNode = {
      id: `fork-${Date.now()}`,
      parentId: parentNodeId,
      year: parent.year < 2050 ? parent.year + 5 : 2050,
      title,
      titleTa: title,
      branchName: title,
      branchNameTa: title,
      strategyName: 'Custom Divergent Policy',
      status: 'active',
      summary: `Custom alternative branch spawned from "${parent.title}".`,
      summaryTa: `"${parent.titleTa}" இலிருந்து உருவாக்கப்பட்ட மாற்று கிளை.`,
      description: `Custom alternative branch spawned from "${parent.title}".`,
      descriptionTa: `"${parent.titleTa}" இலிருந்து உருவாக்கப்பட்ட மாற்று கிளை.`,
      divergencePercent: 25,
      kpis: {
        trafficCongestion: Math.max(15, Math.round((parent.kpis?.trafficCongestion || 50) * 0.85)),
        pollutionAQI: Math.max(40, Math.round((parent.kpis?.pollutionAQI || 120) * 0.82)),
        budgetHealth: Math.min(95, Math.round((parent.kpis?.budgetHealth || 70) * 1.1)),
        socialAcceptance: Math.min(98, Math.round((parent.kpis?.socialAcceptance || 75) * 1.1)),
      },
      metrics: {
        delay: Math.max(20, Math.round((parent.metrics?.delay || 46) * 0.85)),
        aqi: Math.max(50, Math.round((parent.metrics?.aqi || 138) * 0.82)),
        cost: Math.round((parent.metrics?.cost || 410) * 0.88),
        risk: Math.round((parent.metrics?.risk || 45) * 0.75),
        stress: Math.round((parent.metrics?.stress || 50) * 0.8),
      },
      variableOverrides: {},
      children: [],
    };

    setForkNodes((prev) => [...prev, newNode]);
    setActiveForkNodeId(newNode.id);
  };

  return (
    <div className="min-h-screen bg-[#050813] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Main Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        currentYear={currentYear}
        setCurrentYear={setCurrentYear}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onReset={handleResetOverrides}
        openSettings={() => setIsSettingsOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Mission Control Ribbon (Present across deep simulation modules) */}
      {currentTab !== 'home' && (
        <MissionControlBar
          scenario={scenario}
          currentYear={currentYear}
          setCurrentYear={setCurrentYear}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          language={language}
          currentStepData={currentStepData}
          onReset={handleResetOverrides}
          onSaveCheckpoint={() =>
            handleSaveCurrentCheckpoint(`Checkpoint Year ${currentYear}`)
          }
          onForkBranch={() => setCurrentTab('futureFork')}
          onOpenAssumptions={() => setIsAssumptionsOpen(true)}
        />
      )}

      {/* Main Tab Routing */}
      <main className="pb-24">
        {currentTab === 'home' && (
          <div>
            <HeroSection
              language={language}
              onSelectPrompt={handleSelectPrompt}
              onLaunchDemo={handleLaunchDemo}
              onGoToStudio={() => setCurrentTab('studio')}
              isSynthesizing={isSynthesizing}
            />

            {/* Quick Teaser Grid on Home */}
            <div className="mx-auto max-w-7xl px-4 py-12">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase">
                    PLATFORM CAPABILITIES
                  </span>
                  <h2 className="mt-1 font-mono text-xl font-bold text-white">
                    Simulate Before You Build.
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentTab('studio')}
                  className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-2 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950"
                >
                  Enter Simulation Studio →
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div
                  onClick={() => setCurrentTab('whatIf')}
                  className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md transition-all hover:border-purple-500 hover:bg-purple-950/20"
                >
                  <span className="rounded bg-purple-950 px-2 py-0.5 font-mono text-[10px] text-purple-300 border border-purple-800">
                    WHAT-IF LAB
                  </span>
                  <h3 className="mt-3 font-mono text-base font-bold text-white">
                    Non-Linear Causal Sensitivity
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Shift population +20%, decrease budget -15%, or accelerate EV transition to observe feedback cascades across the entire system.
                  </p>
                </div>

                <div
                  onClick={() => setCurrentTab('strategyBattle')}
                  className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md transition-all hover:border-sky-500 hover:bg-sky-950/20"
                >
                  <span className="rounded bg-sky-950 px-2 py-0.5 font-mono text-[10px] text-sky-300 border border-sky-800">
                    STRATEGY BATTLE
                  </span>
                  <h3 className="mt-3 font-mono text-base font-bold text-white">
                    Head-to-Head Policy Clash
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Pitch highway construction against mass transit infrastructure. Expose induced demand traps and evaluate 25-year return on capital.
                  </p>
                </div>

                <div
                  onClick={() => setCurrentTab('futureFork')}
                  className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md transition-all hover:border-emerald-500 hover:bg-emerald-950/20"
                >
                  <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] text-emerald-300 border border-emerald-800">
                    FUTURE FORK TREE
                  </span>
                  <h3 className="mt-3 font-mono text-base font-bold text-white">
                    Branch Parallel Realities
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Fork divergent timeline branches at any milestone year. Experiment with counterfactual decisions without losing prior scenario state.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'studio' && (
          <SimulationStudio
            scenario={scenario}
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            currentStepData={currentStepData}
            timeline={activeTimeline}
            userOverrides={userOverrides}
            onNavigateTab={setCurrentTab}
            language={language}
            onOpenExplain={handleOpenExplain}
          />
        )}

        {currentTab === 'builder' && (
          <ScenarioBuilder
            scenario={scenario}
            onUpdateScenario={setScenario}
            language={language}
          />
        )}

        {currentTab === 'worldModel' && (
          <DigitalWorldModel
            scenario={scenario}
            currentStepData={currentStepData}
            currentYear={currentYear}
            language={language}
            onUpdateVariable={handleUpdateVariable}
            onOpenExplain={handleOpenExplain}
          />
        )}

        {currentTab === 'whatIf' && (
          <WhatIfLab
            scenario={scenario}
            userOverrides={userOverrides}
            onUpdateVariable={handleUpdateVariable}
            onResetOverrides={handleResetOverrides}
            language={language}
            currentStepData={currentStepData}
            currentYear={currentYear}
          />
        )}

        {currentTab === 'multiFuture' && (
          <MultiFutureGenerator
            scenario={scenario}
            userOverrides={userOverrides}
            currentYear={currentYear}
            language={language}
            onApplyFutureAsUserDefined={handleApplyFutureAsUserDefined}
            onSelectYear={setCurrentYear}
          />
        )}

        {currentTab === 'strategyBattle' && (
          <StrategyBattle
            scenario={scenario}
            strategies={Array.isArray(demoStrategies) ? demoStrategies : [demoStrategies.strategyA, demoStrategies.strategyB]}
            language={language}
          />
        )}

        {currentTab === 'causalGraph' && (
          <CausalGraph
            scenario={scenario}
            language={language}
            onOpenExplain={handleOpenExplain}
          />
        )}

        {currentTab === 'futureFork' && (
          <FutureForkTree
            nodes={forkNodes}
            activeNodeId={activeForkNodeId}
            onSelectNode={setActiveForkNodeId}
            onAddCustomFork={handleAddCustomFork}
            language={language}
          />
        )}

        {currentTab === 'timeMachine' && (
          <FutureTimeMachine
            scenario={scenario}
            timeline={activeTimeline}
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            language={language}
            onOpenExplain={handleOpenExplain}
          />
        )}

        {currentTab === 'radar' && (
          <ImpactRadar
            scenario={scenario}
            userOverrides={userOverrides}
            language={language}
          />
        )}

        {currentTab === 'copilot' && (
          <AICopilot
            scenario={scenario}
            currentYear={currentYear}
            currentStepData={currentStepData}
            userOverrides={userOverrides}
            language={language}
          />
        )}

        {currentTab === 'history' && (
          <SimulationHistory
            checkpoints={checkpoints}
            onRestoreCheckpoint={handleRestoreCheckpoint}
            onDeleteCheckpoint={handleDeleteCheckpoint}
            onDuplicateCheckpoint={handleDuplicateCheckpoint}
            onSaveCurrentCheckpoint={handleSaveCurrentCheckpoint}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            language={language}
          />
        )}
      </main>

      {/* Global Modals */}
      <AIExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        metricName={explanationData.name}
        metricValue={explanationData.val}
        baselineValue={explanationData.base}
        year={currentYear}
        scenario={scenario}
        language={language}
      />

      <AssumptionsModal
        isOpen={isAssumptionsOpen}
        onClose={() => setIsAssumptionsOpen(false)}
        scenario={scenario}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        onResetAllData={handleLaunchDemo}
        hasApiKey={hasApiKey}
      />
    </div>
  );
}
