export type Language = 'en' | 'ta';

export type VariableCategory =
  | 'Demographics'
  | 'Infrastructure'
  | 'Environment'
  | 'Economy'
  | 'Technology'
  | 'Public Health'
  | 'Policy';

export type DataProvenance = 'REAL DATA' | 'SIMULATED DATA' | 'USER INPUT' | 'AI-GENERATED ASSUMPTION';

export interface SimulationVariable {
  id: string;
  entityId: string;
  name: string;
  nameTa: string;
  category: VariableCategory;
  value: number;
  baselineValue: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  elasticity: number; // Sensitivity factor
  description: string;
  descriptionTa: string;
  provenance: DataProvenance;
}

export interface SimulationEntity {
  id: string;
  name: string;
  nameTa: string;
  category: string;
  description: string;
  descriptionTa: string;
  iconName: string;
  color: string;
}

export interface CausalDependency {
  source: string; // variable id
  target: string; // variable id
  strength: number; // -1.0 to 1.0
  latencyYears: number; // delay before full impact
  description: string;
  descriptionTa: string;
}

export interface SimulationRisk {
  id: string;
  name: string;
  nameTa: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  thresholdTrigger: string;
  thresholdTriggerTa: string;
  mitigation: string;
  mitigationTa: string;
  probability: number; // 0 to 100%
  impactScore: number; // 1 to 10
}

export interface SimulationScenario {
  id: string;
  title: string;
  titleTa: string;
  tagline: string;
  taglineTa: string;
  description: string;
  descriptionTa: string;
  category: string;
  timeHorizon: {
    startYear: number;
    endYear: number;
    intervals: number[]; // e.g. [2026, 2030, 2035, 2040, 2050]
  };
  entities: SimulationEntity[];
  variables: SimulationVariable[];
  dependencies: CausalDependency[];
  constraints: Array<{ id: string; text: string; textTa: string; status: 'satisfied' | 'violated' | 'warning' }>;
  objectives: Array<{ id: string; targetMetric: string; targetMetricTa: string; targetValue: number; direction: 'minimize' | 'maximize'; unit: string }>;
  risks: SimulationRisk[];
  assumptions: Array<{ id: string; statement: string; statementTa: string; confidence: number }>;
  createdAt: string;
  updatedAt: string;
}

export interface TimeStepMetric {
  year: number;
  values: Record<string, number>; // variableId -> computed value
  systemStress: number; // 0-100
  riskLevel: number; // 0-100
  resourceDemand: number; // 0-100
  economicIndex: number; // normalized
  environmentalQuality: number; // 0-100
  socialWellbeing: number; // 0-100
  infrastructureHealth: number; // 0-100
  operationalLoad: number; // 0-100
  confidenceLevel: number; // percentage confidence (drops in far future)
}

export type FutureMode = 'OPTIMISTIC' | 'REALISTIC' | 'HIGH_RISK' | 'USER_DEFINED';
export type FutureOutcomeType = 'optimistic' | 'realistic' | 'high-risk' | 'user-defined';

export type MultiFutureResult = MultiFutureScenarioOutcome[];

export interface MultiFutureScenarioOutcome {
  mode: FutureMode;
  name: string;
  nameTa: string;
  description: string;
  descriptionTa: string;
  color: string;
  timeline: TimeStepMetric[];
  highlightMetric: {
    label: string;
    labelTa: string;
    val2026: number;
    val2050: number;
    unit: string;
    direction: 'up' | 'down';
  };
  compositeRiskScore: number;
  goalAchievementRate: number; // 0-100%
}

export type Strategy = SimulationStrategy;

export interface StrategyAction {
  variableId: string;
  deltaPercent: number; // e.g. +30% or -15%
  description: string;
  descriptionTa: string;
}

export interface SimulationStrategy {
  id: string;
  name: string;
  nameTa: string;
  description: string;
  descriptionTa: string;
  color: string;
  costBillions: number;
  implementationYears: number;
  actions: StrategyAction[];
  efficiencyScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
  longTermImpact: 'Transformational' | 'Moderate' | 'Marginal' | 'Negative';
  resourceDemandScore: number; // 0-100
  goalAchievement: number; // 0-100%
}

export interface StrategyBattleResult {
  strategyA: SimulationStrategy;
  strategyB: SimulationStrategy;
  metricsComparison: {
    costDiff: number;
    efficiencyDiff: number;
    riskDiff: number;
    longTermDiff: number;
    sustainabilityDiff: number;
  };
  verdict: {
    title: string;
    titleTa: string;
    summary: string;
    summaryTa: string;
    strategicTakeaway: string;
    strategicTakeawayTa: string;
    tradeOffMatrix: Array<{
      dimension: string;
      dimensionTa: string;
      favoredStrategy: 'A' | 'B' | 'TIE';
      insight: string;
      insightTa: string;
    }>;
  };
}

export interface FutureForkNode {
  id: string;
  parentId: string | null;
  year: number;
  title: string;
  titleTa: string;
  branchName: string;
  branchNameTa: string;
  strategyName: string;
  status: 'active' | 'archived' | 'divergent';
  summary: string;
  summaryTa: string;
  description?: string;
  descriptionTa?: string;
  divergencePercent?: number;
  metrics?: {
    delay: number;
    aqi: number;
    cost: number;
    risk: number;
    stress: number;
  };
  kpis: {
    trafficCongestion: number;
    pollutionAQI: number;
    budgetHealth: number;
    socialAcceptance: number;
  };
  variableOverrides: Record<string, number>;
  children: string[];
}

export interface SimulationCheckpoint {
  id: string;
  scenarioId: string;
  name: string;
  timestamp: string;
  year: number;
  variables: Record<string, number>;
  note: string;
}

export interface SavedSimulationCheckpoint {
  id: string;
  name: string;
  timestamp: string;
  scenarioTitle: string;
  year: number;
  overrides: Record<string, number>;
  metrics: {
    delay: number;
    aqi: number;
    cost: number;
    stress: number;
  };
}

export interface RadarDimension {
  dimension: string;
  dimensionTa: string;
  score: number;
}

export interface RadarMetric {
  dimension: string;
  dimensionTa: string;
  realistic: number;
  optimistic: number;
  highRisk: number;
  userDefined: number;
  strategyA?: number;
  strategyB?: number;
}
