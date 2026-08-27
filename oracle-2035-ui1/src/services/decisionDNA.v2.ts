/**
 * ORACLE 2035 V2 — Deterministic Decision DNA 2.0 Calculation Engine
 * 
 * CORE ARCHITECTURAL SPECIFICATION:
 * Validated V2 Decision Data -> Deterministic Decision DNA Engine ->
 * Measurements -> Rule-Based Assessments -> Provenance -> DecisionDNAV2Result
 * 
 * STRICT MANDATES:
 * 1. Zero AI participation. Gemini/AI APIs are NEVER called by this engine.
 * 2. Deterministic execution with exact mathematical reproducibility.
 * 3. UNKNOWN and NOT_PROVIDED are never coerced to zero.
 * 4. Zero arbitrary 0-100 scores, zero composite scores, zero success probabilities.
 * 5. Full provenance tracking with generationType: 'DETERMINISTIC' | 'INSUFFICIENT_DATA'.
 */

import {
  V2ValidatedDecisionContext,
  DecisionDNAV2Result,
  FinancialExposureMeasurements,
  FinancialExposureClassification,
  ReversibilityMeasurements,
  ReversibilityClassification,
  ResourceFitMeasurements,
  ResourceFitClassification,
  OpportunityCostMeasurements,
  OpportunityCostClassification,
  UpsidePotentialMeasurements,
  UpsidePotentialClassification,
  EvidenceConfidenceMeasurements,
  EvidenceConfidenceClassification,
  DataCoverageSummary,
  DimensionContainer,
  MetricProvenance,
  TimeHorizon,
} from '../types/v2';

const METHODOLOGY_VERSION = '2.0.0-LOCKED';

/**
 * Maps TimeHorizon enum to an exact number of calendar months
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

/**
 * DIMENSION 1: Financial Exposure
 * Semantic Direction: higher exposure = greater financial vulnerability
 */
export function calculateFinancialExposure(
  context: V2ValidatedDecisionContext
): DimensionContainer<FinancialExposureMeasurements, FinancialExposureClassification> {
  const fin = context.financial;
  const inputDataRefs: string[] = [];
  const affectingAssumptionIds = context.assumptions
    .filter(a => a.relatedVariable.startsWith('financial') || a.relatedVariable.includes('income') || a.relatedVariable.includes('capital'))
    .map(a => a.id);
  const supportingEvidenceIds = context.evidence
    .filter(e => e.supportsVariables.some(v => v.startsWith('financial')))
    .map(e => e.id);

  const isIncomeKnown = fin.currentMonthlyIncome.state === 'KNOWN' || fin.currentMonthlyIncome.state === 'ESTIMATED_BY_USER';
  const isIncomeChangeKnown = fin.expectedIncomeChangeMonthly.state === 'KNOWN' || fin.expectedIncomeChangeMonthly.state === 'ESTIMATED_BY_USER';
  const isExpensesKnown = fin.recurringMonthlyExpenses.state === 'KNOWN' || fin.recurringMonthlyExpenses.state === 'ESTIMATED_BY_USER';
  const isObligationsKnown = fin.existingFinancialObligations.state === 'KNOWN' || fin.existingFinancialObligations.state === 'ESTIMATED_BY_USER';
  const isCapitalKnown = fin.availableLiquidCapital.state === 'KNOWN' || fin.availableLiquidCapital.state === 'ESTIMATED_BY_USER';
  const isUpfrontRequiredKnown = fin.requiredUpfrontCapital.state === 'KNOWN' || fin.requiredUpfrontCapital.state === 'ESTIMATED_BY_USER';

  if (isIncomeKnown) inputDataRefs.push('financial.currentMonthlyIncome');
  if (isIncomeChangeKnown) inputDataRefs.push('financial.expectedIncomeChangeMonthly');
  if (isExpensesKnown) inputDataRefs.push('financial.recurringMonthlyExpenses');
  if (isObligationsKnown) inputDataRefs.push('financial.existingFinancialObligations');
  if (isCapitalKnown) inputDataRefs.push('financial.availableLiquidCapital');
  if (isUpfrontRequiredKnown) inputDataRefs.push('financial.requiredUpfrontCapital');

  // Layer 1 — Measurements
  let postDecisionMonthlyIncome: number | undefined = undefined;
  if (isIncomeKnown) {
    const currentInc = fin.currentMonthlyIncome.value ?? 0;
    const deltaInc = isIncomeChangeKnown ? (fin.expectedIncomeChangeMonthly.value ?? 0) : 0;
    postDecisionMonthlyIncome = currentInc + deltaInc;
  }

  let monthlyNetCashPosition: number | undefined = undefined;
  let monthlyBurn: number | undefined = undefined;

  if (postDecisionMonthlyIncome !== undefined && isExpensesKnown) {
    const expenses = fin.recurringMonthlyExpenses.value ?? 0;
    const obligations = isObligationsKnown ? (fin.existingFinancialObligations.value ?? 0) : 0;
    monthlyNetCashPosition = postDecisionMonthlyIncome - expenses - obligations;
    monthlyBurn = monthlyNetCashPosition < 0 ? Math.abs(monthlyNetCashPosition) : 0;
  }

  let postCommitmentLiquidCapital: number | undefined = undefined;
  if (isCapitalKnown) {
    const capital = fin.availableLiquidCapital.value ?? 0;
    const upfront = isUpfrontRequiredKnown ? (fin.requiredUpfrontCapital.value ?? 0) : 0;
    postCommitmentLiquidCapital = capital - upfront;
  }

  // Capital coverage
  let capitalCoverage: number | undefined = undefined;
  let capitalCoverageStatus: 'NUMERIC' | 'NOT_APPLICABLE' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';

  if (isCapitalKnown && isUpfrontRequiredKnown) {
    const upfront = fin.requiredUpfrontCapital.value ?? 0;
    const capital = fin.availableLiquidCapital.value ?? 0;
    if (upfront === 0) {
      capitalCoverageStatus = 'NOT_APPLICABLE';
      capitalCoverage = undefined;
    } else {
      capitalCoverage = Number((capital / upfront).toFixed(2));
      capitalCoverageStatus = 'NUMERIC';
    }
  } else if (isUpfrontRequiredKnown && fin.requiredUpfrontCapital.value === 0) {
    capitalCoverageStatus = 'NOT_APPLICABLE';
  }

  // Runway months calculation
  let runwayMonths: number | undefined = undefined;
  let runwayStatus: 'NUMERIC' | 'SURPLUS_OR_NON_BURN' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';

  if (postCommitmentLiquidCapital !== undefined && monthlyBurn !== undefined) {
    if (monthlyBurn === 0) {
      runwayStatus = 'SURPLUS_OR_NON_BURN';
      runwayMonths = undefined;
    } else if (postCommitmentLiquidCapital >= 0 && monthlyBurn > 0) {
      runwayMonths = Number((postCommitmentLiquidCapital / monthlyBurn).toFixed(1));
      runwayStatus = 'NUMERIC';
    } else if (postCommitmentLiquidCapital < 0 && monthlyBurn > 0) {
      runwayMonths = 0;
      runwayStatus = 'NUMERIC';
    }
  }

  // Layer 2 — Assessment Classification
  let classification: FinancialExposureClassification = 'INSUFFICIENT_DATA';
  let status: 'CALCULATED' | 'INSUFFICIENT_DATA' = 'CALCULATED';

  if (postCommitmentLiquidCapital === undefined && monthlyNetCashPosition === undefined) {
    classification = 'INSUFFICIENT_DATA';
    status = 'INSUFFICIENT_DATA';
  } else if (postCommitmentLiquidCapital !== undefined && postCommitmentLiquidCapital < 0) {
    classification = 'ACUTE_EXPOSURE';
  } else if (runwayMonths !== undefined && runwayMonths < 3) {
    classification = 'ACUTE_EXPOSURE';
  } else if (runwayMonths !== undefined && runwayMonths < 9) {
    classification = 'SIGNIFICANT_EXPOSURE';
  } else if (runwayMonths !== undefined && runwayMonths < 24) {
    classification = 'MODERATE_EXPOSURE';
  } else if (runwayStatus === 'SURPLUS_OR_NON_BURN' || (runwayMonths !== undefined && runwayMonths >= 24)) {
    classification = 'MINIMAL_EXPOSURE';
  } else if (isCapitalKnown && (fin.availableLiquidCapital.value ?? 0) > 0 && monthlyBurn === undefined) {
    classification = 'MODERATE_EXPOSURE';
  }

  const measurements: FinancialExposureMeasurements = {
    postDecisionMonthlyIncome,
    monthlyNetCashPosition,
    monthlyBurn,
    postCommitmentLiquidCapital,
    capitalCoverage,
    capitalCoverageStatus,
    runwayMonths,
    runwayStatus,
  };

  const provenance: MetricProvenance = {
    metricId: 'dna.financialExposure',
    inputDataRefs,
    sourceAttribution: ['user_financial_profile'],
    formulaOrRuleId: 'FIN_EXPOSURE_V2_DETERMINISTIC',
    methodologyVersion: METHODOLOGY_VERSION,
    affectingAssumptionIds,
    supportingEvidenceIds,
    generationType: status === 'CALCULATED' ? 'DETERMINISTIC' : 'INSUFFICIENT_DATA',
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    measurements,
    classification,
    status,
    semanticDirection: 'higher exposure = greater financial vulnerability',
    contributingVariables: inputDataRefs,
    activeAssumptions: affectingAssumptionIds,
    provenance,
  };
}

/**
 * DIMENSION 2: Reversibility
 * Semantic Direction: greater reversibility = easier to change or undo
 */
export function calculateReversibility(
  context: V2ValidatedDecisionContext
): DimensionContainer<ReversibilityMeasurements, ReversibilityClassification> {
  const rev = context.reversibility;
  const inputDataRefs: string[] = [];
  const affectingAssumptionIds = context.assumptions
    .filter(a => a.relatedVariable.includes('reversibility') || a.relatedVariable.includes('commitment') || a.relatedVariable.includes('switching'))
    .map(a => a.id);
  const supportingEvidenceIds = context.evidence
    .filter(e => e.supportsVariables.some(v => v.startsWith('reversibility')))
    .map(e => e.id);

  const isSwitchingKnown = rev.estimatedSwitchingEffort.state === 'KNOWN' || rev.estimatedSwitchingEffort.state === 'ESTIMATED_BY_USER';
  const isUnwindingKnown = rev.unwindingTimeMonths.state === 'KNOWN' || rev.unwindingTimeMonths.state === 'ESTIMATED_BY_USER';
  const isSunkCostKnown = rev.sunkCostsAmount.state === 'KNOWN' || rev.sunkCostsAmount.state === 'ESTIMATED_BY_USER';
  const isCommitmentsKnown = rev.irreversibleCommitments.state === 'KNOWN' || rev.irreversibleCommitments.state === 'ESTIMATED_BY_USER';
  const isContractsKnown = rev.contractualConstraints.state === 'KNOWN' || rev.contractualConstraints.state === 'ESTIMATED_BY_USER';

  if (isSwitchingKnown) inputDataRefs.push('reversibility.estimatedSwitchingEffort');
  if (isUnwindingKnown) inputDataRefs.push('reversibility.unwindingTimeMonths');
  if (isSunkCostKnown) inputDataRefs.push('reversibility.sunkCostsAmount');
  if (isCommitmentsKnown) inputDataRefs.push('reversibility.irreversibleCommitments');
  if (isContractsKnown) inputDataRefs.push('reversibility.contractualConstraints');

  // Layer 1 — Measurements
  const switchingEffortLevel = isSwitchingKnown ? rev.estimatedSwitchingEffort.value : undefined;
  const unwindingTimeMonths = isUnwindingKnown ? rev.unwindingTimeMonths.value : undefined;
  const sunkCostsAmount = isSunkCostKnown ? rev.sunkCostsAmount.value : undefined;

  let sunkCostToCapitalRatio: number | undefined = undefined;
  if (sunkCostsAmount !== undefined && context.financial.availableLiquidCapital.value && context.financial.availableLiquidCapital.value > 0) {
    sunkCostToCapitalRatio = Number((sunkCostsAmount / context.financial.availableLiquidCapital.value).toFixed(3));
  }

  const irreversibleCommitmentCount = isCommitmentsKnown && Array.isArray(rev.irreversibleCommitments.value)
    ? rev.irreversibleCommitments.value.length
    : 0;

  const contractualConstraintCount = isContractsKnown && Array.isArray(rev.contractualConstraints.value)
    ? rev.contractualConstraints.value.length
    : 0;

  // Identify dominant material constraint
  let dominantMaterialConstraint: string | undefined = undefined;
  if (isContractsKnown && rev.contractualConstraints.value && rev.contractualConstraints.value.length > 0) {
    dominantMaterialConstraint = `Contractual constraint: ${rev.contractualConstraints.value[0]}`;
  } else if (isCommitmentsKnown && rev.irreversibleCommitments.value && rev.irreversibleCommitments.value.length > 0) {
    dominantMaterialConstraint = `Irreversible commitment: ${rev.irreversibleCommitments.value[0]}`;
  } else if (switchingEffortLevel === 'EXTREME') {
    dominantMaterialConstraint = 'Extreme operational switching friction';
  } else if (unwindingTimeMonths !== undefined && unwindingTimeMonths >= 12) {
    dominantMaterialConstraint = `Protracted unwinding duration (${unwindingTimeMonths} months)`;
  }

  // Layer 2 — Assessment Classification
  let classification: ReversibilityClassification = 'INSUFFICIENT_DATA';
  let status: 'CALCULATED' | 'INSUFFICIENT_DATA' = 'CALCULATED';

  if (!isSwitchingKnown && !isUnwindingKnown && !isCommitmentsKnown && !isContractsKnown) {
    classification = 'INSUFFICIENT_DATA';
    status = 'INSUFFICIENT_DATA';
  } else if (
    switchingEffortLevel === 'EXTREME' ||
    irreversibleCommitmentCount >= 3 ||
    contractualConstraintCount >= 3 ||
    (unwindingTimeMonths !== undefined && unwindingTimeMonths >= 18)
  ) {
    classification = 'SUBSTANTIALLY_IRREVERSIBLE';
  } else if (
    switchingEffortLevel === 'HIGH' ||
    irreversibleCommitmentCount >= 1 ||
    contractualConstraintCount >= 1 ||
    (unwindingTimeMonths !== undefined && unwindingTimeMonths >= 6)
  ) {
    classification = 'LOW_REVERSIBILITY';
  } else if (
    switchingEffortLevel === 'MEDIUM' ||
    (unwindingTimeMonths !== undefined && unwindingTimeMonths > 1)
  ) {
    classification = 'MODERATELY_REVERSIBLE';
  } else if (
    switchingEffortLevel === 'LOW' &&
    irreversibleCommitmentCount === 0 &&
    contractualConstraintCount === 0
  ) {
    classification = 'HIGHLY_REVERSIBLE';
  } else {
    classification = 'MODERATELY_REVERSIBLE';
  }

  const measurements: ReversibilityMeasurements = {
    switchingEffortLevel,
    unwindingTimeMonths,
    sunkCostsAmount,
    sunkCostToCapitalRatio,
    irreversibleCommitmentCount,
    contractualConstraintCount,
    dominantMaterialConstraint,
  };

  const provenance: MetricProvenance = {
    metricId: 'dna.reversibility',
    inputDataRefs,
    sourceAttribution: ['user_reversibility_profile'],
    formulaOrRuleId: 'REVERSIBILITY_V2_DETERMINISTIC',
    methodologyVersion: METHODOLOGY_VERSION,
    affectingAssumptionIds,
    supportingEvidenceIds,
    generationType: status === 'CALCULATED' ? 'DETERMINISTIC' : 'INSUFFICIENT_DATA',
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    measurements,
    classification,
    status,
    semanticDirection: 'greater reversibility = easier to change or undo',
    contributingVariables: inputDataRefs,
    activeAssumptions: affectingAssumptionIds,
    provenance,
  };
}

/**
 * DIMENSION 3: Resource Fit
 * Semantic Direction: greater fit = fewer / smaller resource gaps
 */
export function calculateResourceFit(
  context: V2ValidatedDecisionContext
): DimensionContainer<ResourceFitMeasurements, ResourceFitClassification> {
  const res = context.resources;
  const inputDataRefs: string[] = [];
  const affectingAssumptionIds = context.assumptions
    .filter(a => a.relatedVariable.includes('resource') || a.relatedVariable.includes('skill') || a.relatedVariable.includes('hours'))
    .map(a => a.id);
  const supportingEvidenceIds = context.evidence
    .filter(e => e.supportsVariables.some(v => v.startsWith('resources')))
    .map(e => e.id);

  const isSkillsKnown = res.relevantSkills.state === 'KNOWN' || res.relevantSkills.state === 'ESTIMATED_BY_USER';
  const isHoursKnown = res.availableWeeklyHours.state === 'KNOWN' || res.availableWeeklyHours.state === 'ESTIMATED_BY_USER';
  const isExperienceKnown = res.experienceYears.state === 'KNOWN' || res.experienceYears.state === 'ESTIMATED_BY_USER';
  const isSupportKnown = res.availableSupportNetwork.state === 'KNOWN' || res.availableSupportNetwork.state === 'ESTIMATED_BY_USER';
  const isAssetsKnown = res.availablePhysicalAssets.state === 'KNOWN' || res.availablePhysicalAssets.state === 'ESTIMATED_BY_USER';

  if (isSkillsKnown) inputDataRefs.push('resources.relevantSkills');
  if (isHoursKnown) inputDataRefs.push('resources.availableWeeklyHours');
  if (isExperienceKnown) inputDataRefs.push('resources.experienceYears');
  if (isSupportKnown) inputDataRefs.push('resources.availableSupportNetwork');
  if (isAssetsKnown) inputDataRefs.push('resources.availablePhysicalAssets');

  // Layer 1 — Measurements
  const relevantSkills = isSkillsKnown && Array.isArray(res.relevantSkills.value) ? res.relevantSkills.value : [];
  const supportNetwork = isSupportKnown && Array.isArray(res.availableSupportNetwork.value) ? res.availableSupportNetwork.value : [];
  const physicalAssets = isAssetsKnown && Array.isArray(res.availablePhysicalAssets.value) ? res.availablePhysicalAssets.value : [];
  const availableWeeklyHours = isHoursKnown ? res.availableWeeklyHours.value : undefined;
  const experienceYears = isExperienceKnown ? res.experienceYears.value : undefined;

  // Check for stated requirement gaps from explicit assumptions or context
  const skillGapsIdentified: string[] = [];
  const supportGapsIdentified: string[] = [];
  const resourceGapsIdentified: string[] = [];

  for (const assumption of context.assumptions) {
    if (assumption.relatedVariable.includes('skillGap') && assumption.statement) {
      skillGapsIdentified.push(assumption.statement);
    }
    if (assumption.relatedVariable.includes('supportGap') && assumption.statement) {
      supportGapsIdentified.push(assumption.statement);
    }
    if (assumption.relatedVariable.includes('resourceGap') && assumption.statement) {
      resourceGapsIdentified.push(assumption.statement);
    }
  }

  // Time gap calculation if user explicitly stated required weekly hours in an assumption
  let weeklyTimeGap: number | undefined = undefined;
  let timeCoverageRatio: number | undefined = undefined;

  const requiredHoursAssumption = context.assumptions.find(a => a.relatedVariable === 'requiredWeeklyHours' && typeof a.value === 'number');
  if (requiredHoursAssumption && typeof requiredHoursAssumption.value === 'number' && availableWeeklyHours !== undefined) {
    const reqHours = requiredHoursAssumption.value;
    weeklyTimeGap = Number((reqHours - availableWeeklyHours).toFixed(1));
    timeCoverageRatio = reqHours > 0 ? Number((availableWeeklyHours / reqHours).toFixed(2)) : 1.0;
  }

  // Layer 2 — Assessment Classification
  let classification: ResourceFitClassification = 'INSUFFICIENT_DATA';
  let status: 'CALCULATED' | 'INSUFFICIENT_DATA' = 'CALCULATED';

  if (!isSkillsKnown && !isHoursKnown && !isExperienceKnown && !isSupportKnown && !isAssetsKnown) {
    classification = 'INSUFFICIENT_DATA';
    status = 'INSUFFICIENT_DATA';
  } else if (
    (availableWeeklyHours !== undefined && availableWeeklyHours < 8 && context.decision.decisionCategory === 'BUSINESS_STARTUP') ||
    (timeCoverageRatio !== undefined && timeCoverageRatio < 0.5) ||
    skillGapsIdentified.length >= 3
  ) {
    classification = 'RESOURCE_CONSTRAINED';
  } else if (
    (availableWeeklyHours !== undefined && availableWeeklyHours >= 30) ||
    (relevantSkills.length >= 3 && (experienceYears === undefined || experienceYears >= 4)) ||
    (timeCoverageRatio !== undefined && timeCoverageRatio >= 1.0)
  ) {
    classification = 'STRONG_FIT';
  } else {
    classification = 'MODERATE_FIT';
  }

  const measurements: ResourceFitMeasurements = {
    availableWeeklyHours,
    experienceYears,
    relevantSkills,
    relevantSkillsCount: relevantSkills.length,
    supportNetwork,
    supportNetworkCount: supportNetwork.length,
    physicalAssets,
    physicalAssetsCount: physicalAssets.length,
    weeklyTimeGap,
    timeCoverageRatio,
    skillGapsIdentified,
    supportGapsIdentified,
    resourceGapsIdentified,
  };

  const provenance: MetricProvenance = {
    metricId: 'dna.resourceFit',
    inputDataRefs,
    sourceAttribution: ['user_resource_profile'],
    formulaOrRuleId: 'RESOURCE_FIT_V2_DETERMINISTIC',
    methodologyVersion: METHODOLOGY_VERSION,
    affectingAssumptionIds,
    supportingEvidenceIds,
    generationType: status === 'CALCULATED' ? 'DETERMINISTIC' : 'INSUFFICIENT_DATA',
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    measurements,
    classification,
    status,
    semanticDirection: 'greater fit = fewer / smaller resource gaps',
    contributingVariables: inputDataRefs,
    activeAssumptions: affectingAssumptionIds,
    provenance,
  };
}

/**
 * DIMENSION 4: Opportunity Cost
 * Semantic Direction: greater value = greater foregone alternative value
 */
export function calculateOpportunityCost(
  context: V2ValidatedDecisionContext
): DimensionContainer<OpportunityCostMeasurements, OpportunityCostClassification> {
  const opp = context.opportunity;
  const inputDataRefs: string[] = [];
  const affectingAssumptionIds = context.assumptions
    .filter(a => a.relatedVariable.includes('opportunity') || a.relatedVariable.includes('alternative') || a.relatedVariable.includes('foregone'))
    .map(a => a.id);
  const supportingEvidenceIds = context.evidence
    .filter(e => e.supportsVariables.some(v => v.startsWith('opportunity')))
    .map(e => e.id);

  if (opp.alternativesConsidered && opp.alternativesConsidered.length > 0) {
    inputDataRefs.push('opportunity.alternativesConsidered');
  }
  if (opp.foregoneBenefits.state === 'KNOWN' || opp.foregoneBenefits.state === 'ESTIMATED_BY_USER') {
    inputDataRefs.push('opportunity.foregoneBenefits');
  }
  if (context.financial.currentMonthlyIncome.state === 'KNOWN') {
    inputDataRefs.push('financial.currentMonthlyIncome');
  }
  inputDataRefs.push('decision.timeHorizon');

  // Layer 1 — Measurements
  const horizonMonths = timeHorizonToMonths(context.decision.timeHorizon);
  const alternativesConsideredCount = (opp.alternativesConsidered || context.decision.alternatives || []).length;
  const foregoneBenefits = (opp.foregoneBenefits.state === 'KNOWN' || opp.foregoneBenefits.state === 'ESTIMATED_BY_USER') && Array.isArray(opp.foregoneBenefits.value)
    ? opp.foregoneBenefits.value
    : [];

  // Foregone income calculation: ONLY when explicit alternative economic baseline or explicit negative income change exists
  let foregoneIncomeOverHorizon: number | undefined = undefined;
  let hasStatedAlternativeEconomicValue = false;

  // Check for explicit alternative economic baseline in assumptions
  const explicitBaselineAssumption = context.assumptions.find(
    a => (a.relatedVariable === 'alternativeEconomicBaseline' || a.relatedVariable === 'foregoneIncomeMonthly') && typeof a.value === 'number'
  );

  if (explicitBaselineAssumption && typeof explicitBaselineAssumption.value === 'number') {
    foregoneIncomeOverHorizon = explicitBaselineAssumption.value * horizonMonths;
    hasStatedAlternativeEconomicValue = true;
    inputDataRefs.push(`assumptions.${explicitBaselineAssumption.id}`);
  } else if (
    (context.financial.expectedIncomeChangeMonthly.state === 'KNOWN' || context.financial.expectedIncomeChangeMonthly.state === 'ESTIMATED_BY_USER') &&
    typeof context.financial.expectedIncomeChangeMonthly.value === 'number' &&
    context.financial.expectedIncomeChangeMonthly.value < 0
  ) {
    // Explicit negative expected income change directly attributable to decision
    foregoneIncomeOverHorizon = Math.abs(context.financial.expectedIncomeChangeMonthly.value) * horizonMonths;
    hasStatedAlternativeEconomicValue = true;
    inputDataRefs.push('financial.expectedIncomeChangeMonthly');
  }

  const qualitativeTradeOffsIdentified = [...foregoneBenefits];

  // Layer 2 — Assessment Classification
  let classification: OpportunityCostClassification = 'INSUFFICIENT_DATA';
  let status: 'CALCULATED' | 'INSUFFICIENT_DATA' = 'CALCULATED';

  if (!hasStatedAlternativeEconomicValue) {
    // When no explicit economic baseline is established, do not guess
    classification = 'INSUFFICIENT_DATA';
    status = 'INSUFFICIENT_DATA';
  } else if (foregoneIncomeOverHorizon !== undefined && foregoneIncomeOverHorizon > 0 && (alternativesConsideredCount >= 2 || foregoneBenefits.length >= 2)) {
    classification = 'HIGH_FOREGONE_VALUE';
  } else if (foregoneIncomeOverHorizon !== undefined && foregoneIncomeOverHorizon > 0) {
    classification = 'MODERATE_FOREGONE_VALUE';
  } else if (foregoneIncomeOverHorizon === 0) {
    classification = 'LOW_FOREGONE_VALUE';
  } else {
    classification = 'INSUFFICIENT_DATA';
    status = 'INSUFFICIENT_DATA';
  }

  const measurements: OpportunityCostMeasurements = {
    alternativesConsideredCount,
    foregoneBenefitsCount: foregoneBenefits.length,
    foregoneIncomeOverHorizon,
    horizonMonths,
    hasStatedAlternativeEconomicValue,
    qualitativeTradeOffsIdentified,
  };

  const provenance: MetricProvenance = {
    metricId: 'dna.opportunityCost',
    inputDataRefs,
    sourceAttribution: ['user_opportunity_profile'],
    formulaOrRuleId: 'OPPORTUNITY_COST_V2_DETERMINISTIC',
    methodologyVersion: METHODOLOGY_VERSION,
    affectingAssumptionIds,
    supportingEvidenceIds,
    generationType: status === 'CALCULATED' ? 'DETERMINISTIC' : 'INSUFFICIENT_DATA',
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    measurements,
    classification,
    status,
    semanticDirection: 'greater value = greater foregone alternative value',
    contributingVariables: inputDataRefs,
    activeAssumptions: affectingAssumptionIds,
    provenance,
  };
}

/**
 * DIMENSION 5: Upside Potential
 * Semantic Direction: greater value = greater identified upside
 */
export function calculateUpsidePotential(
  context: V2ValidatedDecisionContext
): DimensionContainer<UpsidePotentialMeasurements, UpsidePotentialClassification> {
  const inputDataRefs: string[] = ['decision.desiredOutcome', 'decision.timeHorizon'];
  const affectingAssumptionIds = context.assumptions
    .filter(a => a.relatedVariable.includes('upside') || a.relatedVariable.includes('target') || a.relatedVariable.includes('outcome'))
    .map(a => a.id);
  const supportingEvidenceIds = context.evidence
    .filter(e => e.supportsVariables.some(v => v.startsWith('decision.desiredOutcome') || v.includes('upside')))
    .map(e => e.id);

  // Layer 1 — Measurements (Strictly user-stated targets, NOT future predictions)
  const userStatedTargetOutcome = context.decision.desiredOutcome;
  const currentStatedIncomeMonthly = (context.financial.currentMonthlyIncome.state === 'KNOWN' || context.financial.currentMonthlyIncome.state === 'ESTIMATED_BY_USER')
    ? context.financial.currentMonthlyIncome.value
    : undefined;

  let targetExpectedIncomeMonthly: number | undefined = undefined;
  let userStatedTargetDifferenceMonthly: number | undefined = undefined;

  if (
    context.financial.expectedIncomeChangeMonthly.state === 'KNOWN' ||
    context.financial.expectedIncomeChangeMonthly.state === 'ESTIMATED_BY_USER'
  ) {
    userStatedTargetDifferenceMonthly = context.financial.expectedIncomeChangeMonthly.value;
    inputDataRefs.push('financial.expectedIncomeChangeMonthly');
    if (currentStatedIncomeMonthly !== undefined && userStatedTargetDifferenceMonthly !== undefined) {
      targetExpectedIncomeMonthly = currentStatedIncomeMonthly + userStatedTargetDifferenceMonthly;
    }
  }

  const hasQuantifiedTargetDifference = userStatedTargetDifferenceMonthly !== undefined;

  const qualitativeBenefitsIdentified: string[] = [];
  if (context.opportunity.primaryOpportunity) {
    qualitativeBenefitsIdentified.push(context.opportunity.primaryOpportunity);
  }

  // Layer 2 — Assessment Classification
  let classification: UpsidePotentialClassification = 'INSUFFICIENT_DATA';
  let status: 'CALCULATED' | 'INSUFFICIENT_DATA' = 'CALCULATED';

  if (!userStatedTargetOutcome || userStatedTargetOutcome.trim().length === 0) {
    classification = 'INSUFFICIENT_DATA';
    status = 'INSUFFICIENT_DATA';
  } else if (
    (context.decision.decisionCategory === 'BUSINESS_STARTUP' || context.decision.decisionCategory === 'CAPITAL_ALLOCATION') &&
    (hasQuantifiedTargetDifference && (userStatedTargetDifferenceMonthly ?? 0) > (currentStatedIncomeMonthly ?? 10000))
  ) {
    classification = 'DEFINED_ASYMMETRIC_UPSIDE';
  } else if (hasQuantifiedTargetDifference && (userStatedTargetDifferenceMonthly ?? 0) > 0) {
    classification = 'DEFINED_LINEAR_UPSIDE';
  } else {
    classification = 'QUALITATIVE_TARGET_STATED';
  }

  const measurements: UpsidePotentialMeasurements = {
    userStatedTargetOutcome,
    currentStatedIncomeMonthly,
    targetExpectedIncomeMonthly,
    userStatedTargetDifferenceMonthly,
    hasQuantifiedTargetDifference,
    timeHorizon: context.decision.timeHorizon,
    qualitativeBenefitsIdentified,
  };

  const provenance: MetricProvenance = {
    metricId: 'dna.upsidePotential',
    inputDataRefs,
    sourceAttribution: ['user_target_statements'],
    formulaOrRuleId: 'UPSIDE_POTENTIAL_V2_DETERMINISTIC',
    methodologyVersion: METHODOLOGY_VERSION,
    affectingAssumptionIds,
    supportingEvidenceIds,
    generationType: 'DETERMINISTIC',
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    measurements,
    classification,
    status,
    semanticDirection: 'greater value = greater identified upside',
    contributingVariables: inputDataRefs,
    activeAssumptions: affectingAssumptionIds,
    provenance,
  };
}

/**
 * DIMENSION 6: Evidence Confidence
 * Semantic Direction: greater strength = better-supported analysis
 */
export function calculateEvidenceConfidence(
  context: V2ValidatedDecisionContext
): DimensionContainer<EvidenceConfidenceMeasurements, EvidenceConfidenceClassification> {
  const inputDataRefs: string[] = ['evidence', 'assumptions'];
  const affectingAssumptionIds = context.assumptions.map(a => a.id);
  const supportingEvidenceIds = context.evidence.map(e => e.id);

  // Layer 1 — Measurements
  const totalEvidenceCount = context.evidence.length;
  const verifiedExternalCount = context.evidence.filter(
    e => e.verificationStatus === 'VERIFIED_EXTERNAL' || e.verificationStatus === 'MULTI_SOURCE_VERIFIED'
  ).length;
  const userProvidedCount = context.evidence.filter(e => e.verificationStatus === 'USER_PROVIDED').length;
  const unverifiedCount = context.evidence.filter(e => e.verificationStatus === 'UNVERIFIED').length;
  const highConfidenceEvidenceCount = context.evidence.filter(e => e.confidenceClassification === 'HIGH').length;

  const totalAssumptionCount = context.assumptions.length;
  const heuristicAssumptionCount = context.assumptions.filter(a => a.source === 'DEFAULT_HEURISTIC').length;
  const criticalAssumptionCount = context.assumptions.filter(
    a => a.impactIfChanged === 'CRITICAL' || a.impactIfChanged === 'HIGH'
  ).length;

  // Layer 2 — Assessment Classification
  let classification: EvidenceConfidenceClassification = 'INSUFFICIENT_DATA';
  let status: 'CALCULATED' | 'INSUFFICIENT_DATA' = 'CALCULATED';

  if (totalEvidenceCount === 0 && totalAssumptionCount === 0) {
    classification = 'UNVERIFIED_ASSERTION';
  } else if (verifiedExternalCount >= 2 && highConfidenceEvidenceCount >= 2 && criticalAssumptionCount === 0) {
    classification = 'STRONGLY_EVIDENCED';
  } else if (totalEvidenceCount > 0 && verifiedExternalCount + userProvidedCount >= totalAssumptionCount) {
    classification = 'MODERATELY_EVIDENCED';
  } else if (totalAssumptionCount > totalEvidenceCount) {
    classification = 'ASSUMPTION_HEAVY';
  } else {
    classification = 'MODERATELY_EVIDENCED';
  }

  const measurements: EvidenceConfidenceMeasurements = {
    totalEvidenceCount,
    verifiedExternalCount,
    userProvidedCount,
    unverifiedCount,
    totalAssumptionCount,
    heuristicAssumptionCount,
    criticalAssumptionCount,
    highConfidenceEvidenceCount,
  };

  const provenance: MetricProvenance = {
    metricId: 'dna.evidenceConfidence',
    inputDataRefs,
    sourceAttribution: ['user_evidence_repository', 'user_assumption_registry'],
    formulaOrRuleId: 'EVIDENCE_CONFIDENCE_V2_DETERMINISTIC',
    methodologyVersion: METHODOLOGY_VERSION,
    affectingAssumptionIds,
    supportingEvidenceIds,
    generationType: 'DETERMINISTIC',
    calculatedAtTimestamp: new Date().toISOString(),
  };

  return {
    measurements,
    classification,
    status,
    semanticDirection: 'greater strength = better-supported analysis',
    contributingVariables: inputDataRefs,
    activeAssumptions: affectingAssumptionIds,
    provenance,
  };
}

/**
 * Calculates Transparent Data Coverage
 */
export function calculateDataCoverage(context: V2ValidatedDecisionContext): DataCoverageSummary {
  const criticalFields: { path: string; isKnown: boolean; isUnknown: boolean; isNotProvided: boolean }[] = [
    {
      path: 'decision.decisionStatement',
      isKnown: Boolean(context.decision.decisionStatement && context.decision.decisionStatement.trim().length > 0),
      isUnknown: false,
      isNotProvided: !context.decision.decisionStatement,
    },
    {
      path: 'decision.decisionCategory',
      isKnown: Boolean(context.decision.decisionCategory),
      isUnknown: false,
      isNotProvided: !context.decision.decisionCategory,
    },
    {
      path: 'decision.timeHorizon',
      isKnown: Boolean(context.decision.timeHorizon),
      isUnknown: false,
      isNotProvided: !context.decision.timeHorizon,
    },
    {
      path: 'financial.currentMonthlyIncome',
      isKnown: context.financial.currentMonthlyIncome.state === 'KNOWN' || context.financial.currentMonthlyIncome.state === 'ESTIMATED_BY_USER',
      isUnknown: context.financial.currentMonthlyIncome.state === 'UNKNOWN',
      isNotProvided: context.financial.currentMonthlyIncome.state === 'NOT_PROVIDED',
    },
    {
      path: 'financial.recurringMonthlyExpenses',
      isKnown: context.financial.recurringMonthlyExpenses.state === 'KNOWN' || context.financial.recurringMonthlyExpenses.state === 'ESTIMATED_BY_USER',
      isUnknown: context.financial.recurringMonthlyExpenses.state === 'UNKNOWN',
      isNotProvided: context.financial.recurringMonthlyExpenses.state === 'NOT_PROVIDED',
    },
    {
      path: 'financial.availableLiquidCapital',
      isKnown: context.financial.availableLiquidCapital.state === 'KNOWN' || context.financial.availableLiquidCapital.state === 'ESTIMATED_BY_USER',
      isUnknown: context.financial.availableLiquidCapital.state === 'UNKNOWN',
      isNotProvided: context.financial.availableLiquidCapital.state === 'NOT_PROVIDED',
    },
    {
      path: 'financial.requiredUpfrontCapital',
      isKnown: context.financial.requiredUpfrontCapital.state === 'KNOWN' || context.financial.requiredUpfrontCapital.state === 'ESTIMATED_BY_USER',
      isUnknown: context.financial.requiredUpfrontCapital.state === 'UNKNOWN',
      isNotProvided: context.financial.requiredUpfrontCapital.state === 'NOT_PROVIDED',
    },
    {
      path: 'resources.availableWeeklyHours',
      isKnown: context.resources.availableWeeklyHours.state === 'KNOWN' || context.resources.availableWeeklyHours.state === 'ESTIMATED_BY_USER',
      isUnknown: context.resources.availableWeeklyHours.state === 'UNKNOWN',
      isNotProvided: context.resources.availableWeeklyHours.state === 'NOT_PROVIDED',
    },
    {
      path: 'resources.relevantSkills',
      isKnown: context.resources.relevantSkills.state === 'KNOWN' || context.resources.relevantSkills.state === 'ESTIMATED_BY_USER',
      isUnknown: context.resources.relevantSkills.state === 'UNKNOWN',
      isNotProvided: context.resources.relevantSkills.state === 'NOT_PROVIDED',
    },
    {
      path: 'reversibility.estimatedSwitchingEffort',
      isKnown: context.reversibility.estimatedSwitchingEffort.state === 'KNOWN' || context.reversibility.estimatedSwitchingEffort.state === 'ESTIMATED_BY_USER',
      isUnknown: context.reversibility.estimatedSwitchingEffort.state === 'UNKNOWN',
      isNotProvided: context.reversibility.estimatedSwitchingEffort.state === 'NOT_PROVIDED',
    },
  ];

  const requiredVariableCount = criticalFields.length;
  const knownVariableCount = criticalFields.filter(f => f.isKnown).length;
  const unknownVariableCount = criticalFields.filter(f => f.isUnknown).length;
  const notProvidedVariableCount = criticalFields.filter(f => f.isNotProvided).length;
  const criticalUnknownVariables = criticalFields.filter(f => f.isUnknown || f.isNotProvided).map(f => f.path);
  const coverageRatio = Number((knownVariableCount / requiredVariableCount).toFixed(2));

  return {
    requiredVariableCount,
    knownVariableCount,
    unknownVariableCount,
    notProvidedVariableCount,
    criticalUnknownVariables,
    coverageRatio,
  };
}

/**
 * Authoritative Pure Deterministic Entry Point: Calculates Decision DNA 2.0
 */
export function calculateDecisionDNAV2(context: V2ValidatedDecisionContext): DecisionDNAV2Result {
  const financialExposure = calculateFinancialExposure(context);
  const reversibility = calculateReversibility(context);
  const resourceFit = calculateResourceFit(context);
  const opportunityCost = calculateOpportunityCost(context);
  const upsidePotential = calculateUpsidePotential(context);
  const evidenceConfidence = calculateEvidenceConfidence(context);
  const dataCoverage = calculateDataCoverage(context);

  return {
    financialExposure,
    reversibility,
    resourceFit,
    opportunityCost,
    upsidePotential,
    evidenceConfidence,
    dataCoverage,
    methodologyVersion: METHODOLOGY_VERSION,
    evaluatedAt: new Date().toISOString(),
  };
}
