import {
  SimulationScenario,
  TimeStepMetric,
  MultiFutureScenarioOutcome,
  RadarMetric,
  SimulationStrategy,
} from '../types/simulation';

export class SimulationEngine {
  /**
   * Runs multi-year simulation across intervals [2026, 2030, 2035, 2040, 2050]
   * Takes scenario and active variable overrides
   */
  public static simulateTimeline(
    scenario: SimulationScenario,
    variableOverrides: Record<string, number> = {},
    growthMultiplier = 1.0,
    stressBias = 0
  ): TimeStepMetric[] {
    const intervals = scenario.timeHorizon.intervals;
    const baseYear = scenario.timeHorizon.startYear;

    // Merge baseline and overrides
    const currentVars: Record<string, number> = {};
    for (const v of scenario.variables) {
      currentVars[v.id] = variableOverrides[v.id] !== undefined ? variableOverrides[v.id] : v.value;
    }

    return intervals.map((year, index) => {
      const yearDiff = year - baseYear;
      const progress = yearDiff / (scenario.timeHorizon.endYear - baseYear);

      // Compute dynamic variable values for this year
      const yearValues: Record<string, number> = {};

      // 1. Population growth compounding
      const popBase = currentVars['var-pop'] || 1.0;
      const popGrowthRate = 0.024 * growthMultiplier;
      const projectedPop = Number((popBase * Math.pow(1 + popGrowthRate, yearDiff)).toFixed(3));
      yearValues['var-pop'] = projectedPop;

      // 2. Vehicle density depends on population & highway expansion & transit capacity
      const vehBase = currentVars['var-veh-density'] || 520;
      const transitCap = currentVars['var-transit-cap'] || 320;
      const highwayAdd = currentVars['var-highway-expansion'] || 15;
      const transitDampener = (transitCap - 320) / 600; // positive if transit is high
      const highwayInducer = (highwayAdd - 15) * 2.2; // positive if highway expanded

      const projectedVehDensity = Math.max(
        150,
        Math.min(950, Math.round(vehBase + yearDiff * 6.5 + highwayInducer - transitDampener * 120))
      );
      yearValues['var-veh-density'] = projectedVehDensity;

      // 3. Transit capacity evolution
      const transitBase = currentVars['var-transit-cap'] || 320;
      const projectedTransit = Math.round(transitBase * (1 + 0.035 * growthMultiplier * yearDiff));
      yearValues['var-transit-cap'] = projectedTransit;

      // 4. Clean EV adoption curve (S-curve adoption)
      const evBase = currentVars['var-ev-adoption'] || 14;
      const sCurve = 1 / (1 + Math.exp(-0.22 * (yearDiff - 8)));
      const projectedEV = Math.min(95, Math.round(evBase + (92 - evBase) * sCurve * growthMultiplier));
      yearValues['var-ev-adoption'] = projectedEV;

      // 5. Highway lane additions
      yearValues['var-highway-expansion'] = highwayAdd;

      // 6. Commute delay (function of vehicle density vs transit capacity)
      const delayBase = currentVars['var-commute-delay'] || 46;
      const volumePressure = (projectedVehDensity - 500) * 0.085;
      const transitRelief = (projectedTransit - 320) * 0.045;
      const computedDelay = Math.max(
        14,
        Math.min(125, Math.round(delayBase + volumePressure - transitRelief + stressBias * 8))
      );
      yearValues['var-commute-delay'] = computedDelay;

      // 7. Urban Air Quality Index (AQI) (combines delay/congestion and EV adoption)
      const evSmogDiscount = (projectedEV / 100) * 0.72;
      const congestionSmog = (computedDelay / 46) * 120;
      const computedAQI = Math.max(
        22,
        Math.min(320, Math.round((congestionSmog * (1 - evSmogDiscount) + 25) * (1 + stressBias * 0.12)))
      );
      yearValues['var-aqi'] = computedAQI;

      // 8. Respiratory Healthcare Burden ($M/yr)
      const healthBase = currentVars['var-health-cost'] || 410;
      const aqiMultiplier = computedAQI / 138;
      const popScaling = projectedPop / 1.0;
      const computedHealthCost = Math.round(healthBase * aqiMultiplier * popScaling);
      yearValues['var-health-cost'] = computedHealthCost;

      // Fill any remaining variables in scenario
      for (const v of scenario.variables) {
        if (yearValues[v.id] === undefined) {
          yearValues[v.id] = currentVars[v.id] || v.value;
        }
      }

      // System stress, risk level & resource demand calculations
      const systemStress = Math.min(
        100,
        Math.max(10, Math.round((computedDelay / 90) * 45 + (computedAQI / 220) * 40 + stressBias * 15))
      );

      const riskLevel = Math.min(
        100,
        Math.max(5, Math.round((computedAQI > 175 ? 40 : 15) + (computedDelay > 60 ? 35 : 10) + stressBias * 20))
      );

      const resourceDemand = Math.min(
        100,
        Math.max(15, Math.round(35 + (projectedPop - 1.0) * 32 + (highwayAdd / 80) * 25))
      );

      const economicIndex = Math.max(
        20,
        Math.min(100, Math.round(92 - (computedDelay - 20) * 0.65 - (computedHealthCost / 1200) * 20))
      );

      const environmentalQuality = Math.max(10, Math.min(100, Math.round(100 - (computedAQI / 300) * 85)));

      const socialWellbeing = Math.max(
        15,
        Math.min(100, Math.round(88 - (computedDelay / 80) * 35 - (computedAQI / 200) * 35))
      );

      const infrastructureHealth = Math.max(
        20,
        Math.min(100, Math.round(75 + (projectedTransit / 1000) * 25 - (projectedVehDensity / 900) * 30))
      );

      const operationalLoad = Math.min(100, Math.max(10, Math.round(systemStress * 0.95)));

      // Confidence level decreases naturally into further decades (2026=96%, 2050=64%)
      const confidenceLevel = Math.max(55, Math.round(96 - progress * 32));

      return {
        year,
        values: yearValues,
        systemStress,
        riskLevel,
        resourceDemand,
        economicIndex,
        environmentalQuality,
        socialWellbeing,
        infrastructureHealth,
        operationalLoad,
        confidenceLevel,
      };
    });
  }

  /**
   * Generates all 4 futures side-by-side:
   * 1. Optimistic
   * 2. Realistic
   * 3. High-Risk
   * 4. User-Defined
   */
  public static generateMultiFutures(
    scenario: SimulationScenario,
    userOverrides: Record<string, number> = {}
  ): MultiFutureScenarioOutcome[] {
    // 1. Optimistic: +80% transit, +100% EV adoption, low highway expansion
    const optimisticOverrides: Record<string, number> = {
      'var-transit-cap': 780,
      'var-ev-adoption': 38,
      'var-highway-expansion': 5,
    };
    const optimisticTimeline = this.simulateTimeline(scenario, optimisticOverrides, 1.15, -0.25);

    // 2. Realistic: baseline variables with historical baseline progress
    const realisticTimeline = this.simulateTimeline(scenario, {}, 1.0, 0);

    // 3. High-Risk: stalled transit, heavy car reliance, delayed clean energy
    const highRiskOverrides: Record<string, number> = {
      'var-transit-cap': 210,
      'var-ev-adoption': 8,
      'var-highway-expansion': 38,
    };
    const highRiskTimeline = this.simulateTimeline(scenario, highRiskOverrides, 0.85, 0.45);

    // 4. User Defined: exact customized user variables
    const userDefinedTimeline = this.simulateTimeline(scenario, userOverrides, 1.0, 0);

    return [
      {
        mode: 'OPTIMISTIC',
        name: 'Optimistic Horizon',
        nameTa: 'நம்பிக்கையான எதிர்காலம்',
        description: 'Accelerated transit electrification, zero-emission core, congestion mitigated.',
        descriptionTa: 'துரிதப்படுத்தப்பட்ட மின்சார போக்குவரத்து, மாசு இல்லாத நகர மையம்.',
        color: '#10b981',
        timeline: optimisticTimeline,
        highlightMetric: {
          label: 'Commute Delay',
          labelTa: 'பயண தாமதம்',
          val2026: 46,
          val2050: optimisticTimeline[optimisticTimeline.length - 1].values['var-commute-delay'],
          unit: 'min',
          direction: 'down',
        },
        compositeRiskScore: 18,
        goalAchievementRate: 94,
      },
      {
        mode: 'REALISTIC',
        name: 'Realistic Trajectory',
        nameTa: 'யதார்த்த பாதை',
        description: 'Gradual infrastructure updates pacing demographic growth with moderate friction.',
        descriptionTa: 'மக்கள்தொகை பெருக்கத்திற்கு ஏற்ப மிதமான உள்கட்டமைப்பு வளர்ச்சி.',
        color: '#38bdf8',
        timeline: realisticTimeline,
        highlightMetric: {
          label: 'Commute Delay',
          labelTa: 'பயண தாமதம்',
          val2026: 46,
          val2050: realisticTimeline[realisticTimeline.length - 1].values['var-commute-delay'],
          unit: 'min',
          direction: 'up',
        },
        compositeRiskScore: 48,
        goalAchievementRate: 62,
      },
      {
        mode: 'HIGH_RISK',
        name: 'High-Risk Gridlock',
        nameTa: 'அதி-ஆபத்து முடக்கம்',
        description: 'Induced demand paralysis, high smog alerts, municipal health budget exhaustion.',
        descriptionTa: 'தீவிர வாகன நெரிசல், அதிக காற்று மாசுபாடு மற்றும் மருத்துவ நிதி பற்றாக்குறை.',
        color: '#f43f5e',
        timeline: highRiskTimeline,
        highlightMetric: {
          label: 'Commute Delay',
          labelTa: 'பயண தாமதம்',
          val2026: 46,
          val2050: highRiskTimeline[highRiskTimeline.length - 1].values['var-commute-delay'],
          unit: 'min',
          direction: 'up',
        },
        compositeRiskScore: 86,
        goalAchievementRate: 24,
      },
      {
        mode: 'USER_DEFINED',
        name: 'Active Custom Model',
        nameTa: 'பயனர் நேரடி மாதிரி',
        description: 'Live feedback synthesized from your active What-If variable parameter adjustments.',
        descriptionTa: 'நீங்கள் அமைத்த மாறிகளின் அடிப்படையில் நிகழ்நேரத்தில் உருவகப்படுத்தப்பட்ட மாதிரி.',
        color: '#a855f7',
        timeline: userDefinedTimeline,
        highlightMetric: {
          label: 'Commute Delay',
          labelTa: 'பயண தாமதம்',
          val2026: 46,
          val2050: userDefinedTimeline[userDefinedTimeline.length - 1].values['var-commute-delay'],
          unit: 'min',
          direction:
            userDefinedTimeline[userDefinedTimeline.length - 1].values['var-commute-delay'] <= 46 ? 'down' : 'up',
        },
        compositeRiskScore: userDefinedTimeline[userDefinedTimeline.length - 1].riskLevel,
        goalAchievementRate: Math.max(
          10,
          Math.min(
            99,
            Math.round(
              100 -
                userDefinedTimeline[userDefinedTimeline.length - 1].riskLevel * 0.6 +
                (userDefinedTimeline[userDefinedTimeline.length - 1].values['var-transit-cap'] / 1000) * 30
            )
          )
        ),
      },
    ];
  }

  /**
   * Evaluates Strategy A vs Strategy B Head-to-Head
   */
  public static battleStrategies(
    scenario: SimulationScenario,
    stratA: SimulationStrategy,
    stratB: SimulationStrategy
  ) {
    // Generate overrides for Strategy A
    const overridesA: Record<string, number> = {};
    for (const a of stratA.actions) {
      const v = scenario.variables.find((x) => x.id === a.variableId);
      if (v) {
        overridesA[a.variableId] = v.value * (1 + a.deltaPercent / 100);
      }
    }
    const timelineA = this.simulateTimeline(scenario, overridesA, 1.0, 0.15);

    // Generate overrides for Strategy B
    const overridesB: Record<string, number> = {};
    for (const b of stratB.actions) {
      const v = scenario.variables.find((x) => x.id === b.variableId);
      if (v) {
        overridesB[b.variableId] = v.value * (1 + b.deltaPercent / 100);
      }
    }
    const timelineB = this.simulateTimeline(scenario, overridesB, 1.15, -0.2);

    const endA = timelineA[timelineA.length - 1];
    const endB = timelineB[timelineB.length - 1];

    const delayA = endA.values['var-commute-delay'];
    const delayB = endB.values['var-commute-delay'];
    const aqiA = endA.values['var-aqi'];
    const aqiB = endB.values['var-aqi'];
    const healthA = endA.values['var-health-cost'];
    const healthB = endB.values['var-health-cost'];

    return {
      timelineA,
      timelineB,
      stratATimeline: timelineA,
      stratBTimeline: timelineB,
      delta: {
        costDiff: stratA.costBillions - stratB.costBillions,
        delayDiff: delayA - delayB, // positive means B is faster
        aqiDiff: aqiA - aqiB, // positive means B has cleaner air
        healthSavingsWithB: healthA - healthB, // $M saved
      },
    };
  }

  /**
   * Computes Impact Radar data across 7 dimensions
   */
  public static computeImpactRadar(
    multiFutures: MultiFutureScenarioOutcome[],
    selectedYear = 2040
  ): RadarMetric[] {
    const getMetricAtYear = (mode: string) => {
      const future = multiFutures.find((f) => f.mode === mode);
      if (!future) return null;
      return future.timeline.find((t) => t.year === selectedYear) || future.timeline[future.timeline.length - 1];
    };

    const opt = getMetricAtYear('OPTIMISTIC');
    const real = getMetricAtYear('REALISTIC');
    const high = getMetricAtYear('HIGH_RISK');
    const user = getMetricAtYear('USER_DEFINED');

    return [
      {
        dimension: 'Economic Vitality',
        dimensionTa: 'பொருளாதார வளம்',
        optimistic: opt?.economicIndex || 85,
        realistic: real?.economicIndex || 68,
        highRisk: high?.economicIndex || 38,
        userDefined: user?.economicIndex || 72,
      },
      {
        dimension: 'Environmental Quality',
        dimensionTa: 'சுற்றுச்சூழல் தரம்',
        optimistic: opt?.environmentalQuality || 92,
        realistic: real?.environmentalQuality || 58,
        highRisk: high?.environmentalQuality || 26,
        userDefined: user?.environmentalQuality || 65,
      },
      {
        dimension: 'Social Wellbeing',
        dimensionTa: 'சமூக நல்வாழ்வு',
        optimistic: opt?.socialWellbeing || 88,
        realistic: real?.socialWellbeing || 64,
        highRisk: high?.socialWellbeing || 32,
        userDefined: user?.socialWellbeing || 68,
      },
      {
        dimension: 'Infrastructure Health',
        dimensionTa: 'கட்டமைப்பு தரம்',
        optimistic: opt?.infrastructureHealth || 90,
        realistic: real?.infrastructureHealth || 70,
        highRisk: high?.infrastructureHealth || 45,
        userDefined: user?.infrastructureHealth || 74,
      },
      {
        dimension: 'Operational Load',
        dimensionTa: 'செயல்பாட்டு சுமை',
        optimistic: 100 - (opt?.operationalLoad || 30),
        realistic: 100 - (real?.operationalLoad || 55),
        highRisk: 100 - (high?.operationalLoad || 88),
        userDefined: 100 - (user?.operationalLoad || 52),
      },
      {
        dimension: 'Resilience (Inverse Risk)',
        dimensionTa: 'தாங்கும் திறன் (ஆபத்தின் எதிர்மறை)',
        optimistic: 100 - (opt?.riskLevel || 20),
        realistic: 100 - (real?.riskLevel || 50),
        highRisk: 100 - (high?.riskLevel || 85),
        userDefined: 100 - (user?.riskLevel || 48),
      },
      {
        dimension: 'Resource Efficiency',
        dimensionTa: 'வள பயன்பாட்டு திறன்',
        optimistic: 100 - (opt?.resourceDemand || 40),
        realistic: 100 - (real?.resourceDemand || 65),
        highRisk: 100 - (high?.resourceDemand || 90),
        userDefined: 100 - (user?.resourceDemand || 60),
      },
    ];
  }

  /**
   * Sensitivity Analysis: determines which variable creates greatest change in objectives
   */
  public static analyzeSensitivity(scenario: SimulationScenario) {
    const baseTimeline = this.simulateTimeline(scenario, {});
    const baseFinalDelay = baseTimeline[baseTimeline.length - 1].values['var-commute-delay'];
    const baseFinalAQI = baseTimeline[baseTimeline.length - 1].values['var-aqi'];

    const rankings = scenario.variables.map((v) => {
      // Perturb by +20%
      const perturbedOverrides = { [v.id]: v.value * 1.2 };
      const perturbedTimeline = this.simulateTimeline(scenario, perturbedOverrides);
      const perturbedDelay = perturbedTimeline[perturbedTimeline.length - 1].values['var-commute-delay'];
      const perturbedAQI = perturbedTimeline[perturbedTimeline.length - 1].values['var-aqi'];

      const delayDelta = Math.abs(perturbedDelay - baseFinalDelay);
      const aqiDelta = Math.abs(perturbedAQI - baseFinalAQI);
      const impactScore = Number((delayDelta * 1.5 + aqiDelta * 0.8).toFixed(1));

      return {
        variableId: v.id,
        name: v.name,
        nameTa: v.nameTa,
        impactScore,
        elasticity: v.elasticity,
        primaryOutcomeAffected: delayDelta > aqiDelta ? 'Commute Delay' : 'Air Quality',
      };
    });

    return rankings.sort((a, b) => b.impactScore - a.impactScore);
  }

  /**
   * Anomaly Detection
   */
  public static detectAnomalies(timeline: TimeStepMetric[]) {
    const anomalies: Array<{
      year: number;
      type: 'critical' | 'warning' | 'positive';
      title: string;
      titleTa: string;
      message: string;
      messageTa: string;
    }> = [];

    for (const step of timeline) {
      if (step.values['var-aqi'] > 180) {
        anomalies.push({
          year: step.year,
          type: 'critical',
          title: `Severe AQI Spike (${step.values['var-aqi']} AQI)`,
          titleTa: `கடும் காற்று மாசு உயர்வு (${step.values['var-aqi']} AQI)`,
          message: `At year ${step.year}, particulate smog breaches toxic thresholds, causing sudden exponential healthcare claims.`,
          messageTa: `${step.year} ஆம் ஆண்டில் நச்சுப் புகை அபாயகரமான அளவைத் தாண்டுகிறது. மருத்துவ செலவு பலமடங்கு உயரும்.`,
        });
      }

      if (step.values['var-commute-delay'] > 65) {
        anomalies.push({
          year: step.year,
          type: 'warning',
          title: `Hyper-Congestion Threshold (${step.values['var-commute-delay']} min)`,
          titleTa: `அதிதீவிர நெரிசல் வரம்பு (${step.values['var-commute-delay']} நிமிடம்)`,
          message: `Commuters lose over 65 minutes per trip, precipitating corporate relocation and talent flight.`,
          messageTa: `பயணிகள் ஒரு பயணத்திற்கு 65 நிமிடங்களுக்கு மேல் இழக்கின்றனர், இது வணிக இடப்பெயர்ச்சியை ஏற்படுத்தும்.`,
        });
      }

      if (step.values['var-ev-adoption'] > 75) {
        anomalies.push({
          year: step.year,
          type: 'positive',
          title: `Fleet Decarbonization Tipping Point (${step.values['var-ev-adoption']}%)`,
          titleTa: `தூய மின்சார வாகன திருப்புமுனை (${step.values['var-ev-adoption']}%)`,
          message: `Over 75% of vehicles run on clean zero-emission tech, triggering steep AQI recovery.`,
          messageTa: `75% க்கும் மேற்பட்ட வாகனங்கள் மின்சாரத்திற்கு மாறுவதால் காற்றுத் தரம் வியத்தகு முறையில் மேம்படுகிறது.`,
        });
      }
    }

    return anomalies;
  }

  /**
   * Calculates dynamic 7-dimension Radar scores for active scenario and overrides
   */
  public static calculateRadarMetrics(
    scenario: SimulationScenario,
    variableOverrides: Record<string, number> = {}
  ): Array<{ dimension: string; dimensionTa: string; score: number }> {
    const timeline = this.simulateTimeline(scenario, variableOverrides);
    const endStep = timeline[timeline.length - 1];

    return [
      {
        dimension: 'Economic Impact',
        dimensionTa: 'பொருளாதார தாக்கம்',
        score: Math.min(100, Math.max(10, Math.round(endStep.economicIndex))),
      },
      {
        dimension: 'Environmental Quality',
        dimensionTa: 'சுற்றுச்சூழல் தரம்',
        score: Math.min(100, Math.max(10, Math.round(endStep.environmentalQuality))),
      },
      {
        dimension: 'Social Equity',
        dimensionTa: 'சமூக சமத்துவம்',
        score: Math.min(100, Math.max(10, Math.round(endStep.socialWellbeing))),
      },
      {
        dimension: 'Infrastructure Health',
        dimensionTa: 'உள்கட்டமைப்பு வளம்',
        score: Math.min(100, Math.max(10, Math.round(endStep.infrastructureHealth))),
      },
      {
        dimension: 'Operational Feasibility',
        dimensionTa: 'செயல்பாட்டு சாத்தியம்',
        score: Math.min(100, Math.max(10, Math.round(100 - endStep.operationalLoad * 0.7))),
      },
      {
        dimension: 'Risk Immunity',
        dimensionTa: 'அபாய தடுப்பு',
        score: Math.min(100, Math.max(10, Math.round(100 - endStep.riskLevel))),
      },
      {
        dimension: 'Resource Efficiency',
        dimensionTa: 'வளப் பயன்பாட்டு திறன்',
        score: Math.min(100, Math.max(10, Math.round(100 - endStep.resourceDemand * 0.75))),
      },
    ];
  }

  /**
   * Alias for strategy comparison battle
   */
  public static compareStrategies(
    scenario: SimulationScenario,
    stratA: SimulationStrategy,
    stratB: SimulationStrategy
  ) {
    return this.battleStrategies(scenario, stratA, stratB);
  }
}

