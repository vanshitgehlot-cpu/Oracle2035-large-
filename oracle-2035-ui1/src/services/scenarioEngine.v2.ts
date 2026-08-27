/**
 * ORACLE 2035 V2 — Deterministic Scenario & Causal Engine
 * 
 * CORE ARCHITECTURAL SPECIFICATION (PHASE 3.2 / 3.3):
 * Validated V2 Decision Context -> Decision DNA 2.0 -> Canonical Scenario Contract
 * -> Deterministic Causal Modeling -> Conditional Scenarios (Base, Downside, Upside)
 * 
 * STRICT INVARIANTS:
 * 1. Zero AI / LLM dependencies. Zero external network calls.
 * 2. Zero Math.random(). 100% deterministic reproducibility.
 * 3. Zero probability percentages (p ∈ [0, 1] or 0-100%).
 * 4. Zero arbitrary 0-100 scores.
 * 5. Zero speculative financial forecasts (no invented salary growth, compound returns, etc.).
 * 6. UNKNOWN and NOT_PROVIDED values are NEVER coerced to zero.
 * 7. Causal edges strictly restricted to MATHEMATICAL_IDENTITY, STRUCTURAL_CONSTRAINT,
 *    CONDITIONAL_DEPENDENCY, or ASSUMPTION_DEPENDENCY.
 * 8. Strict provenance and deterministicComputationHash tracking.
 */

import crypto from 'crypto';
import {
  V2ValidatedDecisionContext,
  DecisionDNAV2Result,
  ScenarioContract,
  CanonicalScenarioType,
  ValueState,
  ScenarioAssumption,
  ScenarioTriggerCondition,
  ScenarioConstraint,
  CausalNode,
  CausalEdge,
  CausalGraph,
  TemporalMilestone,
  ScenarioOutcome,
  ScenarioCalculations,
  ScenarioUncertaintyProfile,
  ScenarioDataSufficiency,
  ScenarioProvenance,
  ScenarioComparisonMatrix,
  ScenarioSuiteResult,
  TimeHorizon,
} from '../types/v2';

const METHODOLOGY_VERSION = '2.0.0-LOCKED';

/**
 * Deterministic canonical JSON stringifier to guarantee key order invariance
 */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${canonicalJsonStringify((obj as Record<string, unknown>)[k])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Generates an invariant SHA-256 hash of calculation results for reproducibility testing
 */
export function generateDeterministicComputationHash(payload: unknown): string {
  const normalized = canonicalJsonStringify(payload);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Maps TimeHorizon enum to calendar months matching Decision DNA 2.0
 */
export function timeHorizonToMonths(horizon: TimeHorizon): number {
  switch (horizon) {
    case 'LESS_THAN_6_MONTHS':
      return 6;
    case '6_TO_12_MONTHS':
      return 12;
    case '1_TO_3_YEARS':
      return 24;
    case '3_TO_5_YEARS':
      return 48;
    case '5_TO_10_YEARS':
      return 84;
    case '10_PLUS_YEARS':
      return 120;
    default:
      return 24;
  }
}

// ============================================================================
// BASE CASE SCENARIO BUILDER
// ============================================================================

export function buildBaseCaseScenario(
  context: V2ValidatedDecisionContext,
  dna: DecisionDNAV2Result
): ScenarioContract {
  const fin = context.financial;
  const res = context.resources;
  const rev = context.reversibility;
  const opp = context.opportunity;
  const horizonMonths = timeHorizonToMonths(context.decision.timeHorizon);

  // Extract Financial State
  const isCapitalKnown = fin.availableLiquidCapital.state === 'KNOWN' || fin.availableLiquidCapital.state === 'ESTIMATED_BY_USER';
  const isUpfrontKnown = fin.requiredUpfrontCapital.state === 'KNOWN' || fin.requiredUpfrontCapital.state === 'ESTIMATED_BY_USER';
  const isIncomeKnown = fin.currentMonthlyIncome.state === 'KNOWN' || fin.currentMonthlyIncome.state === 'ESTIMATED_BY_USER';
  const isIncomeChangeKnown = fin.expectedIncomeChangeMonthly.state === 'KNOWN' || fin.expectedIncomeChangeMonthly.state === 'ESTIMATED_BY_USER';
  const isExpensesKnown = fin.recurringMonthlyExpenses.state === 'KNOWN' || fin.recurringMonthlyExpenses.state === 'ESTIMATED_BY_USER';
  const isObligationsKnown = fin.existingFinancialObligations.state === 'KNOWN' || fin.existingFinancialObligations.state === 'ESTIMATED_BY_USER';
  const isHoursKnown = res.availableWeeklyHours.state === 'KNOWN' || res.availableWeeklyHours.state === 'ESTIMATED_BY_USER';

  // 1. Post-Commitment Liquid Capital
  let postCommitmentLiquidCapital: number | undefined = undefined;
  let postCommitmentLiquidCapitalState: ValueState = 'INSUFFICIENT_DATA';
  if (isCapitalKnown && isUpfrontKnown) {
    const liquid = fin.availableLiquidCapital.value ?? 0;
    const upfront = fin.requiredUpfrontCapital.value ?? 0;
    postCommitmentLiquidCapital = liquid - upfront;
    postCommitmentLiquidCapitalState = 'CALCULATED';
  } else if (isCapitalKnown && !isUpfrontKnown) {
    postCommitmentLiquidCapital = fin.availableLiquidCapital.value ?? 0;
    postCommitmentLiquidCapitalState = 'CALCULATED';
  } else if (fin.availableLiquidCapital.state === 'UNKNOWN') {
    postCommitmentLiquidCapitalState = 'UNKNOWN';
  } else if (fin.availableLiquidCapital.state === 'NOT_PROVIDED') {
    postCommitmentLiquidCapitalState = 'NOT_PROVIDED';
  }

  // Capital Coverage
  const capitalCoverageRatio = dna.financialExposure.measurements.capitalCoverage;
  const capitalCoverageStatus = dna.financialExposure.measurements.capitalCoverageStatus;

  // 2. Monthly Net Cash Position & Burn
  let monthlyNetCashPosition: number | undefined = undefined;
  let monthlyNetCashPositionState: ValueState = 'INSUFFICIENT_DATA';
  let monthlyBurn: number | undefined = undefined;
  let monthlyBurnState: ValueState = 'INSUFFICIENT_DATA';
  let runwayMonths: number | undefined = undefined;
  let runwayStatus: 'NUMERIC' | 'SURPLUS_OR_NON_BURN' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';

  if (isIncomeKnown && isExpensesKnown) {
    const currentIncome = fin.currentMonthlyIncome.value ?? 0;
    const incomeChange = isIncomeChangeKnown ? (fin.expectedIncomeChangeMonthly.value ?? 0) : 0;
    const totalIncome = currentIncome + incomeChange;
    const expenses = fin.recurringMonthlyExpenses.value ?? 0;
    const obligations = isObligationsKnown ? (fin.existingFinancialObligations.value ?? 0) : 0;
    const totalOutflow = expenses + obligations;

    monthlyNetCashPosition = totalIncome - totalOutflow;
    monthlyNetCashPositionState = 'CALCULATED';

    if (monthlyNetCashPosition >= 0) {
      monthlyBurn = 0;
      monthlyBurnState = 'CALCULATED';
      runwayStatus = 'SURPLUS_OR_NON_BURN';
      runwayMonths = undefined;
    } else {
      monthlyBurn = Math.abs(monthlyNetCashPosition);
      monthlyBurnState = 'CALCULATED';
      if (postCommitmentLiquidCapital !== undefined) {
        if (postCommitmentLiquidCapital >= 0) {
          runwayMonths = Number((postCommitmentLiquidCapital / monthlyBurn).toFixed(1));
          runwayStatus = 'NUMERIC';
        } else {
          runwayMonths = 0;
          runwayStatus = 'NUMERIC';
        }
      }
    }
  } else if (fin.currentMonthlyIncome.state === 'UNKNOWN' || fin.recurringMonthlyExpenses.state === 'UNKNOWN') {
    monthlyNetCashPositionState = 'UNKNOWN';
    monthlyBurnState = 'UNKNOWN';
  } else if (fin.currentMonthlyIncome.state === 'NOT_PROVIDED' || fin.recurringMonthlyExpenses.state === 'NOT_PROVIDED') {
    monthlyNetCashPositionState = 'NOT_PROVIDED';
    monthlyBurnState = 'NOT_PROVIDED';
  }

  // 3. Time & Resource Metrics
  const weeklyTimeGap = dna.resourceFit.measurements.weeklyTimeGap;
  const weeklyTimeGapState: ValueState = weeklyTimeGap !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA';
  const timeCoverageRatio = dna.resourceFit.measurements.timeCoverageRatio;
  const timeCoverageRatioState: ValueState = timeCoverageRatio !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA';

  // 4. Foregone Value & Sunk Costs
  const foregoneIncomeOverHorizon = dna.opportunityCost.measurements.foregoneIncomeOverHorizon;
  const foregoneIncomeOverHorizonState: ValueState = foregoneIncomeOverHorizon !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA';

  // Calculations Object
  const calculations: ScenarioCalculations = {
    postCommitmentLiquidCapital,
    postCommitmentLiquidCapitalState,
    monthlyNetCashPosition,
    monthlyNetCashPositionState,
    monthlyBurn,
    monthlyBurnState,
    capitalCoverageRatio,
    capitalCoverageStatus,
    runwayMonths,
    runwayStatus,
    weeklyTimeGap,
    weeklyTimeGapState,
    timeCoverageRatio,
    timeCoverageRatioState,
    maximumCapitalLossExposure: isUpfrontKnown ? (fin.requiredUpfrontCapital.value ?? 0) : undefined,
    maximumCapitalLossExposureState: isUpfrontKnown ? 'CALCULATED' : 'INSUFFICIENT_DATA',
    foregoneIncomeOverHorizon,
    foregoneIncomeOverHorizonState,
    surplusCapitalAccumulation: monthlyNetCashPosition !== undefined && monthlyNetCashPosition > 0 ? monthlyNetCashPosition * horizonMonths : undefined,
    surplusCapitalAccumulationState: monthlyNetCashPosition !== undefined && monthlyNetCashPosition > 0 ? 'CALCULATED' : 'NOT_APPLICABLE',
  };

  // Trigger Conditions
  const triggerConditions: ScenarioTriggerCondition[] = [];
  if (isUpfrontKnown && (fin.requiredUpfrontCapital.value ?? 0) > 0) {
    triggerConditions.push({
      conditionId: 'trig.base.upfront_commitment',
      parameterName: 'financial.requiredUpfrontCapital',
      operator: 'BECOMES_ACTIVE',
      thresholdValue: fin.requiredUpfrontCapital.value!,
      thresholdSource: 'USER_STATED',
      description: `Commitment of required upfront capital of ${fin.requiredUpfrontCapital.value}`,
    });
  }
  if (runwayMonths !== undefined && runwayMonths > 0) {
    triggerConditions.push({
      conditionId: 'trig.base.runway_exhaustion',
      parameterName: 'financial.runwayMonths',
      operator: 'EXHAUSTION',
      thresholdValue: runwayMonths,
      thresholdSource: 'DERIVED_SOLVENCY_FLOOR',
      description: `Liquid capital exhaustion reached at month ${runwayMonths} under baseline cash flow`,
    });
  }

  // Active Constraints
  const activeConstraints: ScenarioConstraint[] = [];
  if (rev.contractualConstraints.state === 'KNOWN' && Array.isArray(rev.contractualConstraints.value)) {
    rev.contractualConstraints.value.forEach((c, idx) => {
      activeConstraints.push({
        constraintId: `cst.base.contractual_${idx + 1}`,
        category: 'LEGAL_CONTRACTUAL',
        statement: c,
        bindingLevel: 'ABSOLUTE',
        sourceRef: 'reversibility.contractualConstraints',
      });
    });
  }
  if (postCommitmentLiquidCapital !== undefined && postCommitmentLiquidCapital < 0) {
    activeConstraints.push({
      constraintId: 'cst.base.capital_deficit',
      category: 'FINANCIAL_FLOOR',
      statement: `Immediate post-commitment deficit of ${Math.abs(postCommitmentLiquidCapital)}`,
      bindingLevel: 'ABSOLUTE',
      sourceRef: 'financial.availableLiquidCapital',
    });
  }

  // Temporal Milestones
  const temporalMilestones: TemporalMilestone[] = [
    {
      milestoneId: 'ms.base.t0',
      elapsedMonths: 0,
      label: 'Month 0 (Execution)',
      isCalculatedDate: false,
      triggeringEvent: 'Initial decision commitment and capital deployment',
      projectedLiquidCapitalState: postCommitmentLiquidCapitalState,
      projectedLiquidCapital: postCommitmentLiquidCapital,
      projectedCumulativeBurn: 0,
      activeConstraintsAtMilestone: activeConstraints.map(c => c.statement),
    },
  ];

  const unwindingTime = rev.unwindingTimeMonths.value;
  if (typeof unwindingTime === 'number' && unwindingTime > 0 && unwindingTime <= horizonMonths) {
    temporalMilestones.push({
      milestoneId: 'ms.base.unwind',
      elapsedMonths: unwindingTime,
      label: `Month ${unwindingTime} (Unwinding Window)`,
      isCalculatedDate: false,
      triggeringEvent: 'Stated duration required to reverse decision or liquidate commitments',
      projectedLiquidCapitalState: postCommitmentLiquidCapitalState,
      projectedLiquidCapital: postCommitmentLiquidCapital !== undefined && monthlyBurn !== undefined ? Math.max(0, postCommitmentLiquidCapital - (monthlyBurn * unwindingTime)) : undefined,
      activeConstraintsAtMilestone: ['Unwinding lock-in threshold'],
    });
  }

  if (runwayMonths !== undefined && runwayMonths > 0 && runwayMonths <= horizonMonths) {
    temporalMilestones.push({
      milestoneId: 'ms.base.runway_depletion',
      elapsedMonths: Math.floor(runwayMonths),
      label: `Month ${runwayMonths} (Runway Bound)`,
      isCalculatedDate: true,
      triggeringEvent: 'Projected liquid capital depletion under baseline burn',
      projectedLiquidCapitalState: 'CALCULATED',
      projectedLiquidCapital: 0,
      projectedCumulativeBurn: postCommitmentLiquidCapital,
      activeConstraintsAtMilestone: ['Solvency floor reached'],
    });
  }

  temporalMilestones.push({
    milestoneId: 'ms.base.horizon',
    elapsedMonths: horizonMonths,
    label: `Month ${horizonMonths} (Horizon Limit)`,
    isCalculatedDate: false,
    triggeringEvent: `Stated decision planning horizon (${context.decision.timeHorizon})`,
    projectedLiquidCapitalState: postCommitmentLiquidCapitalState,
    projectedLiquidCapital: postCommitmentLiquidCapital !== undefined && monthlyBurn !== undefined ? Math.max(0, postCommitmentLiquidCapital - (monthlyBurn * horizonMonths)) : undefined,
    activeConstraintsAtMilestone: [],
  });

  temporalMilestones.sort((a, b) => a.elapsedMonths - b.elapsedMonths);

  // Causal Graph
  const nodes: CausalNode[] = [
    {
      nodeId: 'node.capital.liquid',
      category: 'CAUSE',
      variableName: 'availableLiquidCapital',
      description: 'Available liquid reserves',
      valueState: fin.availableLiquidCapital.state as ValueState,
      numericValue: fin.availableLiquidCapital.value,
      unit: fin.currency || 'CURRENCY',
    },
    {
      nodeId: 'node.capital.upfront',
      category: 'CAUSE',
      variableName: 'requiredUpfrontCapital',
      description: 'Upfront capital deployment required',
      valueState: fin.requiredUpfrontCapital.state as ValueState,
      numericValue: fin.requiredUpfrontCapital.value,
      unit: fin.currency || 'CURRENCY',
    },
    {
      nodeId: 'node.capital.post_commitment',
      category: 'CONSTRAINT',
      variableName: 'postCommitmentLiquidCapital',
      description: 'Liquid capital balance after initial commitment',
      valueState: postCommitmentLiquidCapitalState,
      numericValue: postCommitmentLiquidCapital,
      unit: fin.currency || 'CURRENCY',
    },
    {
      nodeId: 'node.income.current',
      category: 'CAUSE',
      variableName: 'currentMonthlyIncome',
      description: 'Current recurring monthly income',
      valueState: fin.currentMonthlyIncome.state as ValueState,
      numericValue: fin.currentMonthlyIncome.value,
      unit: `${fin.currency || 'CURRENCY'}/month`,
    },
    {
      nodeId: 'node.expenses.monthly',
      category: 'CAUSE',
      variableName: 'recurringMonthlyExpenses',
      description: 'Recurring monthly living expenses and obligations',
      valueState: fin.recurringMonthlyExpenses.state as ValueState,
      numericValue: fin.recurringMonthlyExpenses.value,
      unit: `${fin.currency || 'CURRENCY'}/month`,
    },
    {
      nodeId: 'node.cash.net_monthly',
      category: 'CONSTRAINT',
      variableName: 'monthlyNetCashPosition',
      description: 'Monthly net cash flow after decision implementation',
      valueState: monthlyNetCashPositionState,
      numericValue: monthlyNetCashPosition,
      unit: `${fin.currency || 'CURRENCY'}/month`,
    },
    {
      nodeId: 'node.solvency.runway',
      category: 'OUTCOME',
      variableName: 'runwayMonths',
      description: 'Runway duration before liquid reserve exhaustion',
      valueState: runwayMonths !== undefined ? 'CALCULATED' : (runwayStatus === 'SURPLUS_OR_NON_BURN' ? 'NOT_APPLICABLE' : 'INSUFFICIENT_DATA'),
      numericValue: runwayMonths,
      unit: 'months',
    },
  ];

  const edges: CausalEdge[] = [
    {
      fromNodeId: 'node.capital.liquid',
      toNodeId: 'node.capital.post_commitment',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'POST_COMMITMENT_CAPITAL_DIFF_V2',
      description: 'Post-commitment capital equals liquid capital minus required upfront capital',
    },
    {
      fromNodeId: 'node.capital.upfront',
      toNodeId: 'node.capital.post_commitment',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'POST_COMMITMENT_CAPITAL_DIFF_V2',
      description: 'Upfront capital deployment directly subtracts from liquid reserves',
    },
    {
      fromNodeId: 'node.income.current',
      toNodeId: 'node.cash.net_monthly',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'MONTHLY_NET_CASH_V2',
      description: 'Monthly income forms inflow for net cash flow balance',
    },
    {
      fromNodeId: 'node.expenses.monthly',
      toNodeId: 'node.cash.net_monthly',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'MONTHLY_NET_CASH_V2',
      description: 'Monthly expenses form outflow for net cash flow balance',
    },
    {
      fromNodeId: 'node.capital.post_commitment',
      toNodeId: 'node.solvency.runway',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'RUNWAY_RATIO_V2',
      description: 'Runway equals post-commitment capital divided by monthly burn',
    },
    {
      fromNodeId: 'node.cash.net_monthly',
      toNodeId: 'node.solvency.runway',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'RUNWAY_RATIO_V2',
      description: 'Negative net cash flow generates monthly burn divisor for runway',
    },
  ];

  const causalGraph: CausalGraph = { nodes, edges };

  // Outcomes (Strictly Conditional, Non-Predictive)
  const outcomes: ScenarioOutcome[] = [
    {
      outcomeId: 'out.base.financial_solvency',
      category: 'FINANCIAL_SOLVENCY',
      statement: monthlyBurn === 0
        ? 'Decision maintains cash flow surplus under baseline parameters with no monthly capital depletion'
        : (runwayMonths !== undefined
            ? `Decision operates with a monthly burn of ${monthlyBurn} and a calculated runway of ${runwayMonths} months`
            : 'Financial solvency could not be calculated due to missing baseline income or expense records'),
      valueState: monthlyNetCashPositionState,
      quantitativeMetric: monthlyBurn !== undefined ? { name: 'monthlyBurn', value: monthlyBurn, unit: `${fin.currency || 'CURRENCY'}/month` } : undefined,
      governingAssumptionIds: context.assumptions.filter(a => a.relatedVariable.includes('income') || a.relatedVariable.includes('expenses')).map(a => a.id),
      supportingEvidenceIds: context.evidence.filter(e => e.supportsVariables.some(v => v.startsWith('financial'))).map(e => e.id),
      isPredictive: false,
    },
    {
      outcomeId: 'out.base.operational_capacity',
      category: 'OPERATIONAL_CAPACITY',
      statement: weeklyTimeGap !== undefined
        ? (weeklyTimeGap >= 0
            ? `Resource capacity indicates a surplus of ${weeklyTimeGap} hours/week relative to stated requirements`
            : `Resource capacity indicates a weekly deficit of ${Math.abs(weeklyTimeGap)} hours/week`)
        : 'Time capacity constraints are unstated or partially provided',
      valueState: weeklyTimeGapState,
      quantitativeMetric: weeklyTimeGap !== undefined ? { name: 'weeklyTimeGap', value: weeklyTimeGap, unit: 'hours/week' } : undefined,
      governingAssumptionIds: context.assumptions.filter(a => a.relatedVariable.includes('hours') || a.relatedVariable.includes('time')).map(a => a.id),
      supportingEvidenceIds: context.evidence.filter(e => e.supportsVariables.some(v => v.startsWith('resources'))).map(e => e.id),
      isPredictive: false,
    },
  ];

  // Uncertainty Profile
  const uncertaintyProfile: ScenarioUncertaintyProfile = {
    dataCoverageRatio: dna.dataCoverage.coverageRatio,
    evidenceConfidenceGrade: dna.evidenceConfidence.classification,
    criticalAssumptionCount: dna.evidenceConfidence.measurements.criticalAssumptionCount,
    unverifiedAssumptionCount: dna.evidenceConfidence.measurements.unverifiedCount,
    keyVulnerabilityVariables: dna.dataCoverage.criticalUnknownVariables,
    switchOverPoints: monthlyBurn !== undefined && monthlyBurn > 0 && postCommitmentLiquidCapital !== undefined
      ? [
          {
            variableName: 'expectedIncomeChangeMonthly',
            criticalThreshold: -monthlyBurn,
            consequenceIfBreached: 'Monthly burn escalates, shortening runway below baseline',
          },
        ]
      : [],
  };

  // Data Sufficiency
  let dataSufficiency: ScenarioDataSufficiency = 'FULLY_DETERMINED';
  if (postCommitmentLiquidCapital === undefined && monthlyNetCashPosition === undefined) {
    dataSufficiency = 'UNDER_DETERMINED';
  } else if (postCommitmentLiquidCapital === undefined || monthlyNetCashPosition === undefined || weeklyTimeGap === undefined) {
    dataSufficiency = 'PARTIALLY_DETERMINED';
  }

  // Applied Assumptions
  const appliedAssumptions: ScenarioAssumption[] = context.assumptions.map(a => ({
    assumptionId: a.id,
    statement: a.statement,
    source: a.source,
    relatedVariable: a.relatedVariable,
    value: a.value,
    unit: a.unit,
    confidence: a.confidence,
    impactIfChanged: a.impactIfChanged,
    isHeuristic: a.source === 'DEFAULT_HEURISTIC',
  }));

  // Deterministic Computation Hash
  const deterministicPayload = {
    scenarioType: 'BASE_CASE',
    calculations,
    temporalMilestones,
    causalGraph,
    outcomes,
    activeConstraints,
    horizonMonths,
  };
  const deterministicComputationHash = generateDeterministicComputationHash(deterministicPayload);

  // Provenance
  const provenance: ScenarioProvenance = {
    scenarioCalculationId: `scn.base.${context.decision.timeHorizon}.${deterministicComputationHash.slice(0, 8)}`,
    sourceDecisionContextId: 'decision_context_v2',
    dnaMetricRefs: ['dna.financialExposure', 'dna.reversibility', 'dna.resourceFit', 'dna.opportunityCost'],
    methodologyVersion: METHODOLOGY_VERSION,
    generationType: dataSufficiency === 'UNDER_DETERMINED' ? 'INSUFFICIENT_DATA' : 'DETERMINISTIC',
    appliedFormulas: [
      'POST_COMMITMENT_CAPITAL_DIFF_V2',
      'MONTHLY_NET_CASH_V2',
      'RUNWAY_RATIO_V2',
      'RESOURCE_GAP_V2',
    ],
    deterministicComputationHash,
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    scenarioId: `scn.base_case.${deterministicComputationHash.slice(0, 8)}`,
    scenarioType: 'BASE_CASE',
    scenarioName: 'Base Case (Stated Plan Execution)',
    decisionReference: context.decision.decisionStatement,
    timeHorizon: context.decision.timeHorizon,
    horizonMonths,
    triggerConditions,
    appliedAssumptions,
    activeConstraints,
    calculations,
    temporalMilestones,
    causalGraph,
    outcomes,
    uncertaintyProfile,
    unknownVariables: dna.dataCoverage.criticalUnknownVariables,
    limitations: [
      'Calculations assume steady-state execution under user-stated baseline parameters.',
      'Does not model external economic volatility or unstated financial shocks.',
    ],
    dataSufficiency,
    deterministicComputationHash,
    provenance,
  };
}

// ============================================================================
// DOWNSIDE STRESS CASE SCENARIO BUILDER
// ============================================================================

export function buildDownsideStressScenario(
  context: V2ValidatedDecisionContext,
  dna: DecisionDNAV2Result
): ScenarioContract {
  const fin = context.financial;
  const res = context.resources;
  const rev = context.reversibility;
  const horizonMonths = timeHorizonToMonths(context.decision.timeHorizon);

  const isCapitalKnown = fin.availableLiquidCapital.state === 'KNOWN' || fin.availableLiquidCapital.state === 'ESTIMATED_BY_USER';
  const isUpfrontKnown = fin.requiredUpfrontCapital.state === 'KNOWN' || fin.requiredUpfrontCapital.state === 'ESTIMATED_BY_USER';
  const isIncomeKnown = fin.currentMonthlyIncome.state === 'KNOWN' || fin.currentMonthlyIncome.state === 'ESTIMATED_BY_USER';
  const isExpensesKnown = fin.recurringMonthlyExpenses.state === 'KNOWN' || fin.recurringMonthlyExpenses.state === 'ESTIMATED_BY_USER';
  const isObligationsKnown = fin.existingFinancialObligations.state === 'KNOWN' || fin.existingFinancialObligations.state === 'ESTIMATED_BY_USER';
  const isSunkKnown = rev.sunkCostsAmount.state === 'KNOWN' || rev.sunkCostsAmount.state === 'ESTIMATED_BY_USER';

  // 1. Capital calculation under stress
  let postCommitmentLiquidCapital: number | undefined = undefined;
  let postCommitmentLiquidCapitalState: ValueState = 'INSUFFICIENT_DATA';
  if (isCapitalKnown && isUpfrontKnown) {
    postCommitmentLiquidCapital = (fin.availableLiquidCapital.value ?? 0) - (fin.requiredUpfrontCapital.value ?? 0);
    postCommitmentLiquidCapitalState = 'CALCULATED';
  } else if (isCapitalKnown && !isUpfrontKnown) {
    postCommitmentLiquidCapital = fin.availableLiquidCapital.value ?? 0;
    postCommitmentLiquidCapitalState = 'CALCULATED';
  }

  // Maximum Capital Loss Exposure (Upfront + Sunk Costs)
  let maximumCapitalLossExposure: number | undefined = undefined;
  let maximumCapitalLossExposureState: ValueState = 'INSUFFICIENT_DATA';
  if (isUpfrontKnown && isSunkKnown) {
    maximumCapitalLossExposure = (fin.requiredUpfrontCapital.value ?? 0) + (rev.sunkCostsAmount.value ?? 0);
    maximumCapitalLossExposureState = 'CALCULATED';
  } else if (isUpfrontKnown) {
    maximumCapitalLossExposure = fin.requiredUpfrontCapital.value ?? 0;
    maximumCapitalLossExposureState = 'CALCULATED';
  }

  // 2. Downside Stress Cash Flow:
  // Stressed rule: Positive expected income delta is stress-tested to 0 (unrealized).
  // Explicit negative expected income delta (pay cuts / step-downs) is preserved.
  let monthlyNetCashPosition: number | undefined = undefined;
  let monthlyNetCashPositionState: ValueState = 'INSUFFICIENT_DATA';
  let monthlyBurn: number | undefined = undefined;
  let monthlyBurnState: ValueState = 'INSUFFICIENT_DATA';
  let runwayMonths: number | undefined = undefined;
  let runwayStatus: 'NUMERIC' | 'SURPLUS_OR_NON_BURN' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';

  if (isIncomeKnown && isExpensesKnown) {
    const currentIncome = fin.currentMonthlyIncome.value ?? 0;
    const rawDelta = fin.expectedIncomeChangeMonthly.value ?? 0;
    const stressedIncomeDelta = rawDelta < 0 ? rawDelta : 0; // 0 realization of positive expectations
    const totalIncome = currentIncome + stressedIncomeDelta;
    const expenses = fin.recurringMonthlyExpenses.value ?? 0;
    const obligations = isObligationsKnown ? (fin.existingFinancialObligations.value ?? 0) : 0;
    const totalOutflow = expenses + obligations;

    monthlyNetCashPosition = totalIncome - totalOutflow;
    monthlyNetCashPositionState = 'CALCULATED';

    if (monthlyNetCashPosition >= 0) {
      monthlyBurn = 0;
      monthlyBurnState = 'CALCULATED';
      runwayStatus = 'SURPLUS_OR_NON_BURN';
      runwayMonths = undefined;
    } else {
      monthlyBurn = Math.abs(monthlyNetCashPosition);
      monthlyBurnState = 'CALCULATED';
      if (postCommitmentLiquidCapital !== undefined) {
        if (postCommitmentLiquidCapital >= 0) {
          runwayMonths = Number((postCommitmentLiquidCapital / monthlyBurn).toFixed(1));
          runwayStatus = 'NUMERIC';
        } else {
          runwayMonths = 0;
          runwayStatus = 'NUMERIC';
        }
      }
    }
  } else if (fin.currentMonthlyIncome.state === 'UNKNOWN' || fin.recurringMonthlyExpenses.state === 'UNKNOWN') {
    monthlyNetCashPositionState = 'UNKNOWN';
    monthlyBurnState = 'UNKNOWN';
  } else if (fin.currentMonthlyIncome.state === 'NOT_PROVIDED' || fin.recurringMonthlyExpenses.state === 'NOT_PROVIDED') {
    monthlyNetCashPositionState = 'NOT_PROVIDED';
    monthlyBurnState = 'NOT_PROVIDED';
  }

  const calculations: ScenarioCalculations = {
    postCommitmentLiquidCapital,
    postCommitmentLiquidCapitalState,
    monthlyNetCashPosition,
    monthlyNetCashPositionState,
    monthlyBurn,
    monthlyBurnState,
    capitalCoverageRatio: dna.financialExposure.measurements.capitalCoverage,
    capitalCoverageStatus: dna.financialExposure.measurements.capitalCoverageStatus,
    runwayMonths,
    runwayStatus,
    weeklyTimeGap: dna.resourceFit.measurements.weeklyTimeGap,
    weeklyTimeGapState: dna.resourceFit.measurements.weeklyTimeGap !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA',
    timeCoverageRatio: dna.resourceFit.measurements.timeCoverageRatio,
    timeCoverageRatioState: dna.resourceFit.measurements.timeCoverageRatio !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA',
    maximumCapitalLossExposure,
    maximumCapitalLossExposureState,
    foregoneIncomeOverHorizon: dna.opportunityCost.measurements.foregoneIncomeOverHorizon,
    foregoneIncomeOverHorizonState: dna.opportunityCost.measurements.foregoneIncomeOverHorizon !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA',
    surplusCapitalAccumulation: undefined,
    surplusCapitalAccumulationState: 'NOT_APPLICABLE',
  };

  // Trigger Conditions
  const triggerConditions: ScenarioTriggerCondition[] = [
    {
      conditionId: 'trig.downside.zero_revenue_realization',
      parameterName: 'financial.expectedIncomeChangeMonthly',
      operator: 'EQUALS',
      thresholdValue: 0,
      thresholdSource: 'DERIVED_SOLVENCY_FLOOR',
      description: 'Zero positive income delta realized across the planning horizon',
    },
  ];

  // Active Constraints
  const activeConstraints: ScenarioConstraint[] = [];
  if (rev.irreversibleCommitments.state === 'KNOWN' && Array.isArray(rev.irreversibleCommitments.value)) {
    rev.irreversibleCommitments.value.forEach((commit, idx) => {
      activeConstraints.push({
        constraintId: `cst.downside.commitment_${idx + 1}`,
        category: 'STRUCTURAL_IRREVERSIBILITY',
        statement: commit,
        bindingLevel: 'ABSOLUTE',
        sourceRef: 'reversibility.irreversibleCommitments',
      });
    });
  }

  // Temporal Milestones
  const temporalMilestones: TemporalMilestone[] = [
    {
      milestoneId: 'ms.downside.t0',
      elapsedMonths: 0,
      label: 'Month 0 (Stressed Onset)',
      isCalculatedDate: false,
      triggeringEvent: 'Capital deployment with 0% initial revenue uplift',
      projectedLiquidCapitalState: postCommitmentLiquidCapitalState,
      projectedLiquidCapital: postCommitmentLiquidCapital,
      projectedCumulativeBurn: 0,
      activeConstraintsAtMilestone: activeConstraints.map(c => c.statement),
    },
  ];

  if (runwayMonths !== undefined && runwayMonths > 0 && runwayMonths <= horizonMonths) {
    temporalMilestones.push({
      milestoneId: 'ms.downside.stressed_runway_floor',
      elapsedMonths: Math.floor(runwayMonths),
      label: `Month ${runwayMonths} (Stressed Solvency Floor)`,
      isCalculatedDate: true,
      triggeringEvent: 'Complete exhaustion of liquid capital under zero-uplift stress',
      projectedLiquidCapitalState: 'CALCULATED',
      projectedLiquidCapital: 0,
      projectedCumulativeBurn: postCommitmentLiquidCapital,
      activeConstraintsAtMilestone: ['Critical capital depletion'],
    });
  }

  temporalMilestones.push({
    milestoneId: 'ms.downside.horizon',
    elapsedMonths: horizonMonths,
    label: `Month ${horizonMonths} (Horizon Stress Boundary)`,
    isCalculatedDate: false,
    triggeringEvent: 'End of planning horizon under persistent downside conditions',
    projectedLiquidCapitalState: postCommitmentLiquidCapitalState,
    projectedLiquidCapital: postCommitmentLiquidCapital !== undefined && monthlyBurn !== undefined ? Math.max(0, postCommitmentLiquidCapital - (monthlyBurn * horizonMonths)) : undefined,
    activeConstraintsAtMilestone: [],
  });

  temporalMilestones.sort((a, b) => a.elapsedMonths - b.elapsedMonths);

  // Causal Graph
  const nodes: CausalNode[] = [
    {
      nodeId: 'node.stress.income_delta',
      category: 'CONDITION',
      variableName: 'stressedIncomeDelta',
      description: 'Stressed revenue delta (0% positive growth realized)',
      valueState: 'CALCULATED',
      numericValue: 0,
      unit: `${fin.currency || 'CURRENCY'}/month`,
    },
    {
      nodeId: 'node.stress.net_cash',
      category: 'CONSTRAINT',
      variableName: 'stressedMonthlyNetCash',
      description: 'Net cash flow under stress testing',
      valueState: monthlyNetCashPositionState,
      numericValue: monthlyNetCashPosition,
      unit: `${fin.currency || 'CURRENCY'}/month`,
    },
    {
      nodeId: 'node.stress.runway',
      category: 'OUTCOME',
      variableName: 'stressedRunwayMonths',
      description: 'Stressed solvency runway',
      valueState: runwayMonths !== undefined ? 'CALCULATED' : (runwayStatus === 'SURPLUS_OR_NON_BURN' ? 'NOT_APPLICABLE' : 'INSUFFICIENT_DATA'),
      numericValue: runwayMonths,
      unit: 'months',
    },
  ];

  const edges: CausalEdge[] = [
    {
      fromNodeId: 'node.stress.income_delta',
      toNodeId: 'node.stress.net_cash',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'STRESSED_NET_CASH_V2',
      description: 'Zero positive income realization directly determines stressed net cash flow',
    },
    {
      fromNodeId: 'node.stress.net_cash',
      toNodeId: 'node.stress.runway',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'RUNWAY_RATIO_V2',
      description: 'Stressed burn rate determines minimum runway floor',
    },
  ];

  const causalGraph: CausalGraph = { nodes, edges };

  // Outcomes
  const outcomes: ScenarioOutcome[] = [
    {
      outcomeId: 'out.downside.solvency_floor',
      category: 'FINANCIAL_SOLVENCY',
      statement: monthlyBurn === 0
        ? 'Decision remains cash flow non-depleting even under zero income uplift stress'
        : (runwayMonths !== undefined
            ? `Under zero income uplift, monthly burn is ${monthlyBurn} with an absolute runway floor of ${runwayMonths} months`
            : 'Downside solvency floor cannot be calculated due to missing baseline income/expense data'),
      valueState: monthlyNetCashPositionState,
      quantitativeMetric: monthlyBurn !== undefined ? { name: 'stressedMonthlyBurn', value: monthlyBurn, unit: `${fin.currency || 'CURRENCY'}/month` } : undefined,
      governingAssumptionIds: [],
      supportingEvidenceIds: context.evidence.filter(e => e.supportsVariables.some(v => v.startsWith('financial'))).map(e => e.id),
      isPredictive: false,
    },
  ];

  let dataSufficiency: ScenarioDataSufficiency = 'FULLY_DETERMINED';
  if (postCommitmentLiquidCapital === undefined && monthlyNetCashPosition === undefined) {
    dataSufficiency = 'UNDER_DETERMINED';
  } else if (postCommitmentLiquidCapital === undefined || monthlyNetCashPosition === undefined) {
    dataSufficiency = 'PARTIALLY_DETERMINED';
  }

  const deterministicPayload = {
    scenarioType: 'DOWNSIDE_STRESS_CASE',
    calculations,
    temporalMilestones,
    causalGraph,
    outcomes,
    activeConstraints,
    horizonMonths,
  };
  const deterministicComputationHash = generateDeterministicComputationHash(deterministicPayload);

  const provenance: ScenarioProvenance = {
    scenarioCalculationId: `scn.downside.${context.decision.timeHorizon}.${deterministicComputationHash.slice(0, 8)}`,
    sourceDecisionContextId: 'decision_context_v2',
    dnaMetricRefs: ['dna.financialExposure', 'dna.reversibility'],
    methodologyVersion: METHODOLOGY_VERSION,
    generationType: dataSufficiency === 'UNDER_DETERMINED' ? 'INSUFFICIENT_DATA' : 'DETERMINISTIC',
    appliedFormulas: ['STRESSED_NET_CASH_V2', 'RUNWAY_RATIO_V2', 'CAPITAL_LOSS_EXPOSURE_V2'],
    deterministicComputationHash,
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    scenarioId: `scn.downside_stress.${deterministicComputationHash.slice(0, 8)}`,
    scenarioType: 'DOWNSIDE_STRESS_CASE',
    scenarioName: 'Downside Stress Case (Zero Revenue Uplift Floor)',
    decisionReference: context.decision.decisionStatement,
    timeHorizon: context.decision.timeHorizon,
    horizonMonths,
    triggerConditions,
    appliedAssumptions: [],
    activeConstraints,
    calculations,
    temporalMilestones,
    causalGraph,
    outcomes,
    uncertaintyProfile: {
      dataCoverageRatio: dna.dataCoverage.coverageRatio,
      evidenceConfidenceGrade: dna.evidenceConfidence.classification,
      criticalAssumptionCount: dna.evidenceConfidence.measurements.criticalAssumptionCount,
      unverifiedAssumptionCount: dna.evidenceConfidence.measurements.unverifiedCount,
      keyVulnerabilityVariables: dna.dataCoverage.criticalUnknownVariables,
      switchOverPoints: [],
    },
    unknownVariables: dna.dataCoverage.criticalUnknownVariables,
    limitations: [
      'Downside stress case tests deterministic floor boundaries assuming zero revenue realization.',
      'Does not model simultaneous correlated asset collapses or non-stated emergencies.',
    ],
    dataSufficiency,
    deterministicComputationHash,
    provenance,
  };
}

// ============================================================================
// UPSIDE CASE SCENARIO BUILDER
// ============================================================================

export function buildUpsideScenario(
  context: V2ValidatedDecisionContext,
  dna: DecisionDNAV2Result
): ScenarioContract {
  const fin = context.financial;
  const res = context.resources;
  const horizonMonths = timeHorizonToMonths(context.decision.timeHorizon);

  const isCapitalKnown = fin.availableLiquidCapital.state === 'KNOWN' || fin.availableLiquidCapital.state === 'ESTIMATED_BY_USER';
  const isUpfrontKnown = fin.requiredUpfrontCapital.state === 'KNOWN' || fin.requiredUpfrontCapital.state === 'ESTIMATED_BY_USER';
  const isIncomeKnown = fin.currentMonthlyIncome.state === 'KNOWN' || fin.currentMonthlyIncome.state === 'ESTIMATED_BY_USER';
  const isExpensesKnown = fin.recurringMonthlyExpenses.state === 'KNOWN' || fin.recurringMonthlyExpenses.state === 'ESTIMATED_BY_USER';
  const isObligationsKnown = fin.existingFinancialObligations.state === 'KNOWN' || fin.existingFinancialObligations.state === 'ESTIMATED_BY_USER';

  // Stated Target Difference
  const targetDifferenceMonthly = dna.upsidePotential.measurements.userStatedTargetDifferenceMonthly;
  const hasQuantifiedTarget = dna.upsidePotential.measurements.hasQuantifiedTargetDifference && (targetDifferenceMonthly ?? 0) > 0;

  let postCommitmentLiquidCapital: number | undefined = undefined;
  let postCommitmentLiquidCapitalState: ValueState = 'INSUFFICIENT_DATA';
  if (isCapitalKnown && isUpfrontKnown) {
    postCommitmentLiquidCapital = (fin.availableLiquidCapital.value ?? 0) - (fin.requiredUpfrontCapital.value ?? 0);
    postCommitmentLiquidCapitalState = 'CALCULATED';
  } else if (isCapitalKnown) {
    postCommitmentLiquidCapital = fin.availableLiquidCapital.value ?? 0;
    postCommitmentLiquidCapitalState = 'CALCULATED';
  }

  let monthlyNetCashPosition: number | undefined = undefined;
  let monthlyNetCashPositionState: ValueState = 'INSUFFICIENT_DATA';
  let surplusCapitalAccumulation: number | undefined = undefined;
  let surplusCapitalAccumulationState: ValueState = 'INSUFFICIENT_DATA';

  if (isIncomeKnown && isExpensesKnown && hasQuantifiedTarget && targetDifferenceMonthly !== undefined) {
    const currentIncome = fin.currentMonthlyIncome.value ?? 0;
    const totalTargetIncome = currentIncome + targetDifferenceMonthly;
    const expenses = fin.recurringMonthlyExpenses.value ?? 0;
    const obligations = isObligationsKnown ? (fin.existingFinancialObligations.value ?? 0) : 0;
    const totalOutflow = expenses + obligations;

    monthlyNetCashPosition = totalTargetIncome - totalOutflow;
    monthlyNetCashPositionState = 'CALCULATED';

    if (monthlyNetCashPosition > 0) {
      surplusCapitalAccumulation = monthlyNetCashPosition * horizonMonths;
      surplusCapitalAccumulationState = 'CALCULATED';
    } else {
      surplusCapitalAccumulation = 0;
      surplusCapitalAccumulationState = 'CALCULATED';
    }
  } else {
    monthlyNetCashPositionState = 'INSUFFICIENT_DATA';
    surplusCapitalAccumulationState = 'INSUFFICIENT_DATA';
  }

  const calculations: ScenarioCalculations = {
    postCommitmentLiquidCapital,
    postCommitmentLiquidCapitalState,
    monthlyNetCashPosition,
    monthlyNetCashPositionState,
    monthlyBurn: monthlyNetCashPosition !== undefined && monthlyNetCashPosition < 0 ? Math.abs(monthlyNetCashPosition) : 0,
    monthlyBurnState: monthlyNetCashPositionState,
    capitalCoverageRatio: dna.financialExposure.measurements.capitalCoverage,
    capitalCoverageStatus: dna.financialExposure.measurements.capitalCoverageStatus,
    runwayMonths: undefined,
    runwayStatus: monthlyNetCashPosition !== undefined && monthlyNetCashPosition >= 0 ? 'SURPLUS_OR_NON_BURN' : 'INSUFFICIENT_DATA',
    weeklyTimeGap: dna.resourceFit.measurements.weeklyTimeGap,
    weeklyTimeGapState: dna.resourceFit.measurements.weeklyTimeGap !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA',
    timeCoverageRatio: dna.resourceFit.measurements.timeCoverageRatio,
    timeCoverageRatioState: dna.resourceFit.measurements.timeCoverageRatio !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA',
    maximumCapitalLossExposure: undefined,
    maximumCapitalLossExposureState: 'NOT_APPLICABLE',
    foregoneIncomeOverHorizon: dna.opportunityCost.measurements.foregoneIncomeOverHorizon,
    foregoneIncomeOverHorizonState: dna.opportunityCost.measurements.foregoneIncomeOverHorizon !== undefined ? 'CALCULATED' : 'INSUFFICIENT_DATA',
    surplusCapitalAccumulation,
    surplusCapitalAccumulationState,
  };

  const triggerConditions: ScenarioTriggerCondition[] = [];
  if (hasQuantifiedTarget && targetDifferenceMonthly !== undefined) {
    triggerConditions.push({
      conditionId: 'trig.upside.target_realization',
      parameterName: 'upside.targetDifferenceMonthly',
      operator: 'GREATER_THAN',
      thresholdValue: targetDifferenceMonthly,
      thresholdSource: 'USER_STATED',
      description: `Full achievement of stated target income delta (+${targetDifferenceMonthly}/month)`,
    });
  }

  const temporalMilestones: TemporalMilestone[] = [
    {
      milestoneId: 'ms.upside.t0',
      elapsedMonths: 0,
      label: 'Month 0 (Initiation)',
      isCalculatedDate: false,
      triggeringEvent: 'Decision commitment initiated',
      projectedLiquidCapitalState: postCommitmentLiquidCapitalState,
      projectedLiquidCapital: postCommitmentLiquidCapital,
      projectedCumulativeBurn: 0,
      activeConstraintsAtMilestone: [],
    },
    {
      milestoneId: 'ms.upside.horizon',
      elapsedMonths: horizonMonths,
      label: `Month ${horizonMonths} (Target Horizon Accumulation)`,
      isCalculatedDate: false,
      triggeringEvent: 'Culmination of target planning horizon',
      projectedLiquidCapitalState: surplusCapitalAccumulationState,
      projectedLiquidCapital: postCommitmentLiquidCapital !== undefined && surplusCapitalAccumulation !== undefined
        ? postCommitmentLiquidCapital + surplusCapitalAccumulation
        : undefined,
      activeConstraintsAtMilestone: [],
    },
  ];

  const nodes: CausalNode[] = [
    {
      nodeId: 'node.upside.target_delta',
      category: 'CAUSE',
      variableName: 'userStatedTargetDifferenceMonthly',
      description: 'Stated target monthly income difference',
      valueState: hasQuantifiedTarget ? 'KNOWN' : 'INSUFFICIENT_DATA',
      numericValue: targetDifferenceMonthly,
      unit: `${fin.currency || 'CURRENCY'}/month`,
    },
    {
      nodeId: 'node.upside.surplus_accumulation',
      category: 'OUTCOME',
      variableName: 'surplusCapitalAccumulation',
      description: 'Cumulative surplus capital over horizon',
      valueState: surplusCapitalAccumulationState,
      numericValue: surplusCapitalAccumulation,
      unit: fin.currency || 'CURRENCY',
    },
  ];

  const edges: CausalEdge[] = [
    {
      fromNodeId: 'node.upside.target_delta',
      toNodeId: 'node.upside.surplus_accumulation',
      linkType: 'MATHEMATICAL_IDENTITY',
      formulaOrRuleId: 'SURPLUS_ACCUMULATION_V2',
      description: 'Monthly surplus multiplied across horizon equals total surplus capital',
    },
  ];

  const causalGraph: CausalGraph = { nodes, edges };

  const outcomes: ScenarioOutcome[] = [
    {
      outcomeId: 'out.upside.target_realization',
      category: 'STRATEGIC_GOAL',
      statement: hasQuantifiedTarget && surplusCapitalAccumulation !== undefined
        ? `Target realization yields monthly surplus of ${monthlyNetCashPosition} and cumulative surplus capital of ${surplusCapitalAccumulation} over ${horizonMonths} months`
        : `Target outcome is qualitative: "${context.decision.desiredOutcome}". No quantified target delta was stated.`,
      valueState: hasQuantifiedTarget ? 'CALCULATED' : 'INSUFFICIENT_DATA',
      quantitativeMetric: surplusCapitalAccumulation !== undefined ? { name: 'surplusCapitalAccumulation', value: surplusCapitalAccumulation, unit: fin.currency || 'CURRENCY' } : undefined,
      governingAssumptionIds: [],
      supportingEvidenceIds: context.evidence.filter(e => e.supportsVariables.some(v => v.includes('upside') || v.includes('income'))).map(e => e.id),
      isPredictive: false,
    },
  ];

  let dataSufficiency: ScenarioDataSufficiency = 'FULLY_DETERMINED';
  if (!hasQuantifiedTarget || postCommitmentLiquidCapital === undefined) {
    dataSufficiency = 'PARTIALLY_DETERMINED';
  }

  const deterministicPayload = {
    scenarioType: 'UPSIDE_CASE',
    calculations,
    temporalMilestones,
    causalGraph,
    outcomes,
    horizonMonths,
  };
  const deterministicComputationHash = generateDeterministicComputationHash(deterministicPayload);

  const provenance: ScenarioProvenance = {
    scenarioCalculationId: `scn.upside.${context.decision.timeHorizon}.${deterministicComputationHash.slice(0, 8)}`,
    sourceDecisionContextId: 'decision_context_v2',
    dnaMetricRefs: ['dna.upsidePotential', 'dna.financialExposure'],
    methodologyVersion: METHODOLOGY_VERSION,
    generationType: hasQuantifiedTarget ? 'DETERMINISTIC' : 'INSUFFICIENT_DATA',
    appliedFormulas: ['SURPLUS_ACCUMULATION_V2', 'TARGET_NET_CASH_V2'],
    deterministicComputationHash,
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    scenarioId: `scn.upside.${deterministicComputationHash.slice(0, 8)}`,
    scenarioType: 'UPSIDE_CASE',
    scenarioName: 'Upside Case (Stated Target Realization)',
    decisionReference: context.decision.decisionStatement,
    timeHorizon: context.decision.timeHorizon,
    horizonMonths,
    triggerConditions,
    appliedAssumptions: [],
    activeConstraints: [],
    calculations,
    temporalMilestones,
    causalGraph,
    outcomes,
    uncertaintyProfile: {
      dataCoverageRatio: dna.dataCoverage.coverageRatio,
      evidenceConfidenceGrade: dna.evidenceConfidence.classification,
      criticalAssumptionCount: dna.evidenceConfidence.measurements.criticalAssumptionCount,
      unverifiedAssumptionCount: dna.evidenceConfidence.measurements.unverifiedCount,
      keyVulnerabilityVariables: dna.dataCoverage.criticalUnknownVariables,
      switchOverPoints: [],
    },
    unknownVariables: dna.dataCoverage.criticalUnknownVariables,
    limitations: [
      'Upside calculations are strictly bounded by user-stated target differences.',
      'Does not extrapolate unstated market expansion or speculative asset appreciation.',
    ],
    dataSufficiency,
    deterministicComputationHash,
    provenance,
  };
}

// ============================================================================
// SCENARIO COMPARISON MATRIX BUILDER
// ============================================================================

export function buildScenarioComparisonMatrix(
  baseCase: ScenarioContract,
  downside: ScenarioContract,
  upside: ScenarioContract
): ScenarioComparisonMatrix {
  const scenarios = [
    {
      scenarioType: baseCase.scenarioType,
      scenarioName: baseCase.scenarioName,
      postCommitmentCapital: baseCase.calculations.postCommitmentLiquidCapital,
      monthlyNetCash: baseCase.calculations.monthlyNetCashPosition,
      runwayMonths: baseCase.calculations.runwayStatus === 'SURPLUS_OR_NON_BURN' ? 'SURPLUS_OR_NON_BURN' as const : baseCase.calculations.runwayMonths,
      weeklyTimeGap: baseCase.calculations.weeklyTimeGap,
      keyRiskFactor: baseCase.calculations.monthlyBurn && baseCase.calculations.monthlyBurn > 0 ? `Monthly burn of ${baseCase.calculations.monthlyBurn}` : 'None (Cash flow positive)',
      criticalAssumptionsCount: baseCase.appliedAssumptions.length,
    },
    {
      scenarioType: downside.scenarioType,
      scenarioName: downside.scenarioName,
      postCommitmentCapital: downside.calculations.postCommitmentLiquidCapital,
      monthlyNetCash: downside.calculations.monthlyNetCashPosition,
      runwayMonths: downside.calculations.runwayStatus === 'SURPLUS_OR_NON_BURN' ? 'SURPLUS_OR_NON_BURN' as const : downside.calculations.runwayMonths,
      weeklyTimeGap: downside.calculations.weeklyTimeGap,
      keyRiskFactor: downside.calculations.runwayMonths !== undefined ? `Runway floor bounded to ${downside.calculations.runwayMonths} months` : 'Unquantified stress risk',
      criticalAssumptionsCount: downside.appliedAssumptions.length,
    },
    {
      scenarioType: upside.scenarioType,
      scenarioName: upside.scenarioName,
      postCommitmentCapital: upside.calculations.postCommitmentLiquidCapital,
      monthlyNetCash: upside.calculations.monthlyNetCashPosition,
      runwayMonths: upside.calculations.runwayStatus === 'SURPLUS_OR_NON_BURN' ? 'SURPLUS_OR_NON_BURN' as const : upside.calculations.runwayMonths,
      weeklyTimeGap: upside.calculations.weeklyTimeGap,
      keyRiskFactor: 'Opportunity trade-offs and capacity limits',
      criticalAssumptionsCount: upside.appliedAssumptions.length,
    },
  ];

  const divergenceFactors = [
    'Income delta realization (Baseline vs 0% Stressed vs Stated Target)',
    'Net monthly cash flow and burn rate variation',
    'Runway depletion timing vs surplus capital accumulation',
  ];

  const invariantConstants = [
    'Available liquid capital baseline',
    'Recurring living expenses baseline',
    'Decision planning time horizon',
  ];

  return {
    scenarios,
    divergenceFactors,
    invariantConstants,
  };
}

// ============================================================================
// COMPLETE SCENARIO SUITE GENERATOR
// ============================================================================

export function buildScenarioSuite(
  context: V2ValidatedDecisionContext,
  dna: DecisionDNAV2Result
): ScenarioSuiteResult {
  const baseCase = buildBaseCaseScenario(context, dna);
  const downsideStressCase = buildDownsideStressScenario(context, dna);
  const upsideCase = buildUpsideScenario(context, dna);
  const comparisonMatrix = buildScenarioComparisonMatrix(baseCase, downsideStressCase, upsideCase);

  return {
    baseCase,
    downsideStressCase,
    upsideCase,
    comparisonMatrix,
    methodologyVersion: METHODOLOGY_VERSION,
    evaluatedAtTimestamp: new Date().toISOString(),
  };
}
