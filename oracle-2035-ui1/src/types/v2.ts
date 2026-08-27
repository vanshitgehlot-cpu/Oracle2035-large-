/**
 * ORACLE 2035 V2 — Domain Types & Data Models
 * 
 * Core Architectural Principle:
 * REAL USER DATA -> VALIDATION -> DETERMINISTIC CALCULATIONS -> DECISION DNA
 * -> SCENARIO MODELING -> EVIDENCE + ASSUMPTIONS -> GEMINI REASONING -> EXPLANATION
 * 
 * Quantitative data must be explicit. Missing data is represented as UNKNOWN or NOT_PROVIDED,
 * never silently coerced into 0 or fake metrics.
 */

// ============================================================================
// DATA AVAILABILITY & EXPLICIT STATE MODEL
// ============================================================================

export type DataAvailability = 
  | 'KNOWN'
  | 'UNKNOWN'
  | 'NOT_PROVIDED'
  | 'NOT_APPLICABLE'
  | 'ESTIMATED_BY_USER';

/**
 * Encapsulates any variable with its explicit availability state.
 * Never conflate UNKNOWN with 0.
 */
export interface DataField<T> {
  value?: T;
  state: DataAvailability;
  source?: string;
  notes?: string;
}

// ============================================================================
// DECISION CONTEXT ENUMS & INTERFACES
// ============================================================================

export type DecisionCategory =
  | 'CAREER_TRANSITION'
  | 'BUSINESS_STARTUP'
  | 'CAPITAL_ALLOCATION'
  | 'RELOCATION_GEO'
  | 'HIGHER_EDUCATION'
  | 'PARTNERSHIP_COLLAB'
  | 'PRODUCT_STRATEGY'
  | 'PERSONAL_LIFESTYLE'
  | 'STRATEGIC_OTHER';

export type TimeHorizon =
  | 'LESS_THAN_6_MONTHS'
  | '6_TO_12_MONTHS'
  | '1_TO_3_YEARS'
  | '3_TO_5_YEARS'
  | '5_TO_10_YEARS'
  | '10_PLUS_YEARS';

export interface DecisionContext {
  decisionStatement: string;
  decisionCategory: DecisionCategory;
  currentSituation: string;
  desiredOutcome: string;
  alternatives: string[];
  timeHorizon: TimeHorizon;
}

// ============================================================================
// FINANCIAL CONTEXT MODEL
// ============================================================================

export interface FinancialContext {
  currentMonthlyIncome: DataField<number>;
  recurringMonthlyExpenses: DataField<number>;
  availableLiquidCapital: DataField<number>;
  existingFinancialObligations: DataField<number>;
  expectedIncomeChangeMonthly: DataField<number>;
  requiredUpfrontCapital: DataField<number>;
  currency?: string;
}

// ============================================================================
// RESOURCE CONTEXT MODEL
// ============================================================================

export interface ResourceContext {
  relevantSkills: DataField<string[]>;
  experienceYears: DataField<number>;
  availableWeeklyHours: DataField<number>;
  availableSupportNetwork: DataField<string[]>;
  availablePhysicalAssets: DataField<string[]>;
}

// ============================================================================
// OPPORTUNITY CONTEXT MODEL
// ============================================================================

export interface OpportunityContext {
  primaryOpportunity: string;
  alternativesConsidered: string[];
  opportunityCostSummary: DataField<string>;
  foregoneBenefits: DataField<string[]>;
}

// ============================================================================
// REVERSIBILITY CONTEXT MODEL
// ============================================================================

export type SwitchingEffortLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface ReversibilityContext {
  estimatedSwitchingEffort: DataField<SwitchingEffortLevel>;
  irreversibleCommitments: DataField<string[]>;
  sunkCostsAmount: DataField<number>;
  contractualConstraints: DataField<string[]>;
  unwindingTimeMonths: DataField<number>;
}

// ============================================================================
// EVIDENCE MODEL
// ============================================================================

export type EvidenceSourceType =
  | 'USER_STATEMENT'
  | 'DOCUMENT_UPLOAD'
  | 'THIRD_PARTY_DATA'
  | 'HISTORICAL_RECORD'
  | 'BENCHMARK_STUDY';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'USER_PROVIDED'
  | 'VERIFIED_EXTERNAL'
  | 'MULTI_SOURCE_VERIFIED';

export type EvidenceRelevance = 'DIRECT' | 'INDIRECT' | 'CONTEXTUAL';

export type ConfidenceClassification = 'LOW' | 'MEDIUM' | 'HIGH';

export interface EvidenceItem {
  id: string;
  sourceType: EvidenceSourceType;
  sourceReference?: string;
  description: string;
  dateRecorded?: string;
  verificationStatus: VerificationStatus;
  relevance: EvidenceRelevance;
  confidenceClassification: ConfidenceClassification;
  supportsVariables: string[];
}

// ============================================================================
// ASSUMPTION MODEL
// NOTE: Assumptions (including DEFAULT_HEURISTIC) are explicitly NOT factual data
// or verified evidence. They remain labeled as assumptions in provenance tracking.
// ============================================================================

export type AssumptionSource =
  | 'USER_STATED'
  | 'DEFAULT_HEURISTIC'
  | 'CALCULATED_INFERENCE'
  | 'EXTERNAL_REFERENCE';

export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AssumptionItem {
  id: string;
  statement: string;
  relatedVariable: string;
  value?: string | number | boolean;
  unit?: string;
  source: AssumptionSource;
  confidence: ConfidenceClassification;
  impactIfChanged: ImpactLevel;
}

// ============================================================================
// PROVENANCE & CALCULATION METADATA MODEL
// NOTE: Quantitative Decision DNA and simulation metrics must be strictly
// DETERMINISTIC or explicitly INSUFFICIENT_DATA. AI is NEVER the authoritative
// source of quantitative decision metrics.
// ============================================================================

export type MetricGenerationType = 'DETERMINISTIC' | 'INSUFFICIENT_DATA';

export interface MetricProvenance {
  metricId: string;
  inputDataRefs: string[];
  sourceAttribution: string[];
  formulaOrRuleId: string;
  methodologyVersion: string;
  affectingAssumptionIds: string[];
  supportingEvidenceIds: string[];
  generationType: MetricGenerationType;
  calculatedAtTimestamp: string;
}

// ============================================================================
// COMPLETE V2 DECISION PAYLOAD & VALIDATED REPOSITORY MODEL
// ============================================================================

export interface V2DecisionPayload {
  decision: DecisionContext;
  financial?: Partial<{
    currentMonthlyIncome: Partial<DataField<number>>;
    recurringMonthlyExpenses: Partial<DataField<number>>;
    availableLiquidCapital: Partial<DataField<number>>;
    existingFinancialObligations: Partial<DataField<number>>;
    expectedIncomeChangeMonthly: Partial<DataField<number>>;
    requiredUpfrontCapital: Partial<DataField<number>>;
    currency: string;
  }>;
  resources?: Partial<{
    relevantSkills: Partial<DataField<string[]>>;
    experienceYears: Partial<DataField<number>>;
    availableWeeklyHours: Partial<DataField<number>>;
    availableSupportNetwork: Partial<DataField<string[]>>;
    availablePhysicalAssets: Partial<DataField<string[]>>;
  }>;
  opportunity?: Partial<{
    primaryOpportunity: string;
    alternativesConsidered: string[];
    opportunityCostSummary: Partial<DataField<string>>;
    foregoneBenefits: Partial<DataField<string[]>>;
  }>;
  reversibility?: Partial<{
    estimatedSwitchingEffort: Partial<DataField<SwitchingEffortLevel>>;
    irreversibleCommitments: Partial<DataField<string[]>>;
    sunkCostsAmount: Partial<DataField<number>>;
    contractualConstraints: Partial<DataField<string[]>>;
    unwindingTimeMonths: Partial<DataField<number>>;
  }>;
  evidence?: EvidenceItem[];
  assumptions?: AssumptionItem[];
  metadata?: {
    clientVersion?: string;
    submittedAt?: string;
  };
}

export interface V2ValidatedDecisionContext {
  decision: DecisionContext;
  financial: FinancialContext;
  resources: ResourceContext;
  opportunity: OpportunityContext;
  reversibility: ReversibilityContext;
  evidence: EvidenceItem[];
  assumptions: AssumptionItem[];
  validatedAt: string;
  validationVersion: string;
}

// ============================================================================
// DECISION DNA 2.0 OUTPUT CONTRACTS & DIMENSION CONTAINERS
// ============================================================================

export type DimensionStatus = 'CALCULATED' | 'INSUFFICIENT_DATA';

export interface DimensionContainer<TMeasurements, TClassification> {
  measurements: TMeasurements;
  classification: TClassification | 'INSUFFICIENT_DATA';
  status: DimensionStatus;
  semanticDirection: string;
  contributingVariables: string[];
  activeAssumptions: string[];
  provenance: MetricProvenance;
}

// ----------------------------------------------------------------------------
// 1. FINANCIAL EXPOSURE
// ----------------------------------------------------------------------------
export type CapitalCoverageStatus = 'NUMERIC' | 'NOT_APPLICABLE' | 'INSUFFICIENT_DATA';
export type RunwayStatus = 'NUMERIC' | 'SURPLUS_OR_NON_BURN' | 'INSUFFICIENT_DATA';

export interface FinancialExposureMeasurements {
  postDecisionMonthlyIncome?: number;
  monthlyNetCashPosition?: number;
  monthlyBurn?: number;
  postCommitmentLiquidCapital?: number;
  capitalCoverage?: number;
  capitalCoverageStatus: CapitalCoverageStatus;
  runwayMonths?: number;
  runwayStatus: RunwayStatus;
}

export type FinancialExposureClassification =
  | 'MINIMAL_EXPOSURE'
  | 'MODERATE_EXPOSURE'
  | 'SIGNIFICANT_EXPOSURE'
  | 'ACUTE_EXPOSURE'
  | 'INSUFFICIENT_DATA';

// ----------------------------------------------------------------------------
// 2. REVERSIBILITY
// ----------------------------------------------------------------------------
export interface ReversibilityMeasurements {
  switchingEffortLevel?: SwitchingEffortLevel;
  unwindingTimeMonths?: number;
  sunkCostsAmount?: number;
  sunkCostToCapitalRatio?: number;
  irreversibleCommitmentCount: number;
  contractualConstraintCount: number;
  dominantMaterialConstraint?: string;
}

export type ReversibilityClassification =
  | 'HIGHLY_REVERSIBLE'
  | 'MODERATELY_REVERSIBLE'
  | 'LOW_REVERSIBILITY'
  | 'SUBSTANTIALLY_IRREVERSIBLE'
  | 'INSUFFICIENT_DATA';

// ----------------------------------------------------------------------------
// 3. RESOURCE FIT
// ----------------------------------------------------------------------------
export interface ResourceFitMeasurements {
  availableWeeklyHours?: number;
  experienceYears?: number;
  relevantSkills: string[];
  relevantSkillsCount: number;
  supportNetwork: string[];
  supportNetworkCount: number;
  physicalAssets: string[];
  physicalAssetsCount: number;
  weeklyTimeGap?: number; // if user stated required weekly hours
  timeCoverageRatio?: number;
  skillGapsIdentified: string[];
  supportGapsIdentified: string[];
  resourceGapsIdentified: string[];
}

export type ResourceFitClassification =
  | 'STRONG_FIT'
  | 'MODERATE_FIT'
  | 'RESOURCE_CONSTRAINED'
  | 'INSUFFICIENT_DATA';

// ----------------------------------------------------------------------------
// 4. OPPORTUNITY COST
// ----------------------------------------------------------------------------
export interface OpportunityCostMeasurements {
  alternativesConsideredCount: number;
  foregoneBenefitsCount: number;
  foregoneIncomeOverHorizon?: number; // currentMonthlyIncome * horizonMonths
  horizonMonths?: number;
  hasStatedAlternativeEconomicValue: boolean;
  qualitativeTradeOffsIdentified: string[];
}

export type OpportunityCostClassification =
  | 'LOW_FOREGONE_VALUE'
  | 'MODERATE_FOREGONE_VALUE'
  | 'HIGH_FOREGONE_VALUE'
  | 'INSUFFICIENT_DATA';

// ----------------------------------------------------------------------------
// 5. UPSIDE POTENTIAL
// ----------------------------------------------------------------------------
export interface UpsidePotentialMeasurements {
  userStatedTargetOutcome: string;
  currentStatedIncomeMonthly?: number;
  targetExpectedIncomeMonthly?: number;
  userStatedTargetDifferenceMonthly?: number;
  hasQuantifiedTargetDifference: boolean;
  timeHorizon: TimeHorizon;
  qualitativeBenefitsIdentified: string[];
}

export type UpsidePotentialClassification =
  | 'DEFINED_ASYMMETRIC_UPSIDE'
  | 'DEFINED_LINEAR_UPSIDE'
  | 'QUALITATIVE_TARGET_STATED'
  | 'INSUFFICIENT_DATA';

// ----------------------------------------------------------------------------
// 6. EVIDENCE CONFIDENCE
// ----------------------------------------------------------------------------
export interface EvidenceConfidenceMeasurements {
  totalEvidenceCount: number;
  verifiedExternalCount: number;
  userProvidedCount: number;
  unverifiedCount: number;
  totalAssumptionCount: number;
  heuristicAssumptionCount: number;
  criticalAssumptionCount: number;
  highConfidenceEvidenceCount: number;
}

export type EvidenceConfidenceClassification =
  | 'STRONGLY_EVIDENCED'
  | 'MODERATELY_EVIDENCED'
  | 'ASSUMPTION_HEAVY'
  | 'UNVERIFIED_ASSERTION'
  | 'INSUFFICIENT_DATA';

// ----------------------------------------------------------------------------
// DATA COVERAGE SUMMARY
// ----------------------------------------------------------------------------
export interface DataCoverageSummary {
  requiredVariableCount: number;
  knownVariableCount: number;
  unknownVariableCount: number;
  notProvidedVariableCount: number;
  criticalUnknownVariables: string[];
  coverageRatio: number; // knownVariableCount / requiredVariableCount
}

// ----------------------------------------------------------------------------
// COMPLETE DECISION DNA 2.0 RESULT
// ----------------------------------------------------------------------------
export interface DecisionDNAV2Result {
  financialExposure: DimensionContainer<FinancialExposureMeasurements, FinancialExposureClassification>;
  reversibility: DimensionContainer<ReversibilityMeasurements, ReversibilityClassification>;
  resourceFit: DimensionContainer<ResourceFitMeasurements, ResourceFitClassification>;
  opportunityCost: DimensionContainer<OpportunityCostMeasurements, OpportunityCostClassification>;
  upsidePotential: DimensionContainer<UpsidePotentialMeasurements, UpsidePotentialClassification>;
  evidenceConfidence: DimensionContainer<EvidenceConfidenceMeasurements, EvidenceConfidenceClassification>;
  dataCoverage: DataCoverageSummary;
  methodologyVersion: string;
  evaluatedAt: string;
}

// ============================================================================
// CANONICAL SCENARIO CONTRACT & CAUSAL MODEL (PHASE 3.2 / 3.3)
// ============================================================================

export type CanonicalScenarioType =
  | 'BASE_CASE'
  | 'DOWNSIDE_STRESS_CASE'
  | 'UPSIDE_CASE';

export type ValueState =
  | 'KNOWN'
  | 'CALCULATED'
  | 'ASSUMED'
  | 'UNKNOWN'
  | 'NOT_PROVIDED'
  | 'NOT_APPLICABLE'
  | 'INSUFFICIENT_DATA';

export interface ScenarioAssumption {
  assumptionId: string;
  statement: string;
  source: AssumptionSource;
  relatedVariable: string;
  value?: number | string | boolean;
  unit?: string;
  confidence: ConfidenceClassification;
  impactIfChanged: ImpactLevel;
  isHeuristic: boolean;
}

export interface ScenarioTriggerCondition {
  conditionId: string;
  parameterName: string;
  operator: 'LESS_THAN' | 'GREATER_THAN' | 'EQUALS' | 'BECOMES_ACTIVE' | 'EXHAUSTION';
  thresholdValue: number | string;
  thresholdSource: 'USER_STATED' | 'CONTRACTUAL_AGREEMENT' | 'DERIVED_SOLVENCY_FLOOR';
  description: string;
}

export interface ScenarioConstraint {
  constraintId: string;
  category: 'LEGAL_CONTRACTUAL' | 'FINANCIAL_FLOOR' | 'TIME_CAPACITY' | 'STRUCTURAL_IRREVERSIBILITY';
  statement: string;
  bindingLevel: 'ABSOLUTE' | 'FLEXIBLE' | 'CONDITIONAL';
  sourceRef: string;
}

export type CausalLinkType =
  | 'MATHEMATICAL_IDENTITY'
  | 'STRUCTURAL_CONSTRAINT'
  | 'CONDITIONAL_DEPENDENCY'
  | 'ASSUMPTION_DEPENDENCY';

export interface CausalNode {
  nodeId: string;
  category: 'CAUSE' | 'CONDITION' | 'CONSTRAINT' | 'OUTCOME';
  variableName: string;
  description: string;
  valueState: ValueState;
  numericValue?: number;
  unit?: string;
}

export interface CausalEdge {
  fromNodeId: string;
  toNodeId: string;
  linkType: CausalLinkType;
  formulaOrRuleId?: string;
  description: string;
}

export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

export interface TemporalMilestone {
  milestoneId: string;
  elapsedMonths: number;
  label: string;
  isCalculatedDate: boolean;
  triggeringEvent: string;
  projectedLiquidCapitalState: ValueState;
  projectedLiquidCapital?: number;
  projectedCumulativeBurn?: number;
  activeConstraintsAtMilestone: string[];
}

export interface ScenarioOutcome {
  outcomeId: string;
  category: 'FINANCIAL_SOLVENCY' | 'OPERATIONAL_CAPACITY' | 'REVERSIBILITY_POSTURE' | 'STRATEGIC_GOAL';
  statement: string;
  valueState: ValueState;
  quantitativeMetric?: {
    name: string;
    value?: number;
    unit?: string;
  };
  governingAssumptionIds: string[];
  supportingEvidenceIds: string[];
  isPredictive: false;
}

export interface ScenarioCalculations {
  postCommitmentLiquidCapital?: number;
  postCommitmentLiquidCapitalState: ValueState;
  monthlyNetCashPosition?: number;
  monthlyNetCashPositionState: ValueState;
  monthlyBurn?: number;
  monthlyBurnState: ValueState;
  capitalCoverageRatio?: number;
  capitalCoverageStatus: 'NUMERIC' | 'NOT_APPLICABLE' | 'INSUFFICIENT_DATA';
  runwayMonths?: number;
  runwayStatus: 'NUMERIC' | 'SURPLUS_OR_NON_BURN' | 'INSUFFICIENT_DATA';
  weeklyTimeGap?: number;
  weeklyTimeGapState: ValueState;
  timeCoverageRatio?: number;
  timeCoverageRatioState: ValueState;
  maximumCapitalLossExposure?: number;
  maximumCapitalLossExposureState: ValueState;
  foregoneIncomeOverHorizon?: number;
  foregoneIncomeOverHorizonState: ValueState;
  surplusCapitalAccumulation?: number;
  surplusCapitalAccumulationState: ValueState;
}

export interface ScenarioUncertaintyProfile {
  dataCoverageRatio: number;
  evidenceConfidenceGrade: EvidenceConfidenceClassification;
  criticalAssumptionCount: number;
  unverifiedAssumptionCount: number;
  keyVulnerabilityVariables: string[];
  switchOverPoints: Array<{
    variableName: string;
    criticalThreshold: number;
    consequenceIfBreached: string;
  }>;
}

export type ScenarioDataSufficiency =
  | 'FULLY_DETERMINED'
  | 'PARTIALLY_DETERMINED'
  | 'UNDER_DETERMINED';

export interface ScenarioProvenance {
  scenarioCalculationId: string;
  sourceDecisionContextId: string;
  dnaMetricRefs: string[];
  methodologyVersion: '2.0.0-LOCKED';
  generationType: MetricGenerationType;
  appliedFormulas: string[];
  deterministicComputationHash: string;
  calculatedAtTimestamp: string;
}

export interface ScenarioContract {
  scenarioId: string;
  scenarioType: CanonicalScenarioType;
  scenarioName: string;
  decisionReference: string;
  timeHorizon: TimeHorizon;
  horizonMonths: number;
  triggerConditions: ScenarioTriggerCondition[];
  appliedAssumptions: ScenarioAssumption[];
  activeConstraints: ScenarioConstraint[];
  calculations: ScenarioCalculations;
  temporalMilestones: TemporalMilestone[];
  causalGraph: CausalGraph;
  outcomes: ScenarioOutcome[];
  uncertaintyProfile: ScenarioUncertaintyProfile;
  unknownVariables: string[];
  limitations: string[];
  dataSufficiency: ScenarioDataSufficiency;
  deterministicComputationHash: string;
  provenance: ScenarioProvenance;
}

export interface ScenarioComparisonMatrix {
  scenarios: Array<{
    scenarioType: CanonicalScenarioType;
    scenarioName: string;
    postCommitmentCapital?: number;
    monthlyNetCash?: number;
    runwayMonths?: number | 'SURPLUS_OR_NON_BURN';
    weeklyTimeGap?: number;
    keyRiskFactor: string;
    criticalAssumptionsCount: number;
  }>;
  divergenceFactors: string[];
  invariantConstants: string[];
}

export interface ScenarioSuiteResult {
  baseCase: ScenarioContract;
  downsideStressCase: ScenarioContract;
  upsideCase: ScenarioContract;
  comparisonMatrix: ScenarioComparisonMatrix;
  methodologyVersion: string;
  evaluatedAtTimestamp: string;
}

// ============================================================================
// V2 SERVER PIPELINE REQUEST / RESPONSE ENVELOPES (PHASE 3.4 / 3.5)
// ============================================================================

export type V2AnalyzeDecisionRequest = V2DecisionPayload;

export type V2ApiErrorCode =
  | 'MALFORMED_JSON'
  | 'PAYLOAD_TOO_LARGE'
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED_COMPUTED_FIELD'
  | 'SERVER_CALCULATION_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'RATE_LIMIT_EXCEEDED';

export interface V2AnalyzeDecisionSuccessResponse {
  success: true;
  data: {
    decisionDNA: DecisionDNAV2Result;
    scenarios: ScenarioSuiteResult;
    dataSufficiency: {
      overallStatus: 'FULLY_DETERMINED' | 'PARTIALLY_DETERMINED' | 'UNDER_DETERMINED';
      coverageRatio: number;
      criticalUnknownVariables: string[];
      insufficientDataDimensions: string[];
    };
    auditTrail: {
      serverEvaluatedAt: string;
      dnaMethodologyVersion: '2.0.0-LOCKED';
      scenarioMethodologyVersion: '2.0.0-LOCKED';
      dnaComputationHash: string;
      scenarioComputationHashes: {
        baseCase: string;
        downsideStressCase: string;
        upsideCase: string;
      };
    };
    explanation?: V2NarrativeExplanation | null;
    explanationStatus?: 'AVAILABLE' | 'UNAVAILABLE';
    warnings: string[];
  };
}

export interface V2AnalyzeDecisionErrorResponse {
  success: false;
  error: {
    code: V2ApiErrorCode;
    message: string;
    details?: Array<{
      field: string;
      issue: string;
    }>;
  };
}

// ============================================================================
// V2 EXPLANATION ENGINE CONTRACTS (PHASE 3.6 / 3.7)
// ============================================================================

export interface V2ExplanationContext {
  // 1. Decision Identification & User Context (Canonical types)
  decisionStatement: string;
  decisionCategory: DecisionCategory;
  timeHorizon: TimeHorizon;
  horizonMonths: number;

  // 2. Authoritative Decision DNA Dimensions (Immutable Values + States)
  dimensions: {
    financialExposure: {
      status: DimensionStatus;
      classification: FinancialExposureClassification | 'INSUFFICIENT_DATA';
      monthlyNetCashPosition?: number;
      monthlyBurn?: number;
      runwayMonths?: number;
      runwayStatus: RunwayStatus;
      capitalCoverage?: number;
      capitalCoverageStatus: CapitalCoverageStatus;
      currency?: string;
    };
    reversibility: {
      status: DimensionStatus;
      classification: ReversibilityClassification | 'INSUFFICIENT_DATA';
      switchingEffortLevel: SwitchingEffortLevel;
      irreversibleCommitmentCount: number;
      contractualConstraintCount: number;
      dominantMaterialConstraint?: string;
      sunkCostToCapitalRatio?: number;
    };
    resourceFit: {
      status: DimensionStatus;
      classification: ResourceFitClassification | 'INSUFFICIENT_DATA';
      availableWeeklyHours: number;
      requiredWeeklyHours?: number;
      weeklyTimeGap?: number;
      timeCoverageRatio?: number;
      relevantSkillsCount: number;
      hasExperienceRecord: boolean;
    };
    opportunityCost: {
      status: DimensionStatus;
      classification: OpportunityCostClassification | 'INSUFFICIENT_DATA';
      foregoneIncomeOverHorizon?: number;
      hasStatedAlternativeEconomicValue: boolean;
      alternativesCount: number;
    };
    upsidePotential: {
      status: DimensionStatus;
      classification: UpsidePotentialClassification | 'INSUFFICIENT_DATA';
      userStatedTargetDifferenceMonthly?: number;
      hasQuantifiedTargetDifference: boolean;
      surplusAccumulationPotential?: number;
      statedTargetOutcome: string;
    };
    evidenceConfidence: {
      status: DimensionStatus;
      classification: EvidenceConfidenceClassification;
      totalEvidenceCount: number;
      verifiedExternalCount: number;
      totalAssumptionCount: number;
      heuristicAssumptionCount: number;
    };
  };

  // 3. Authoritative Conditional Scenarios
  scenarios: {
    baseCase: {
      netMonthlyCashFlow?: number;
      netCashFlowState: ValueState;
      runwayMonths?: number;
      runwayStatus: RunwayStatus;
      timeGapWeekly?: number;
      timeGapState: ValueState;
      keyStressAssumptions: string[];
    };
    downsideStressCase: {
      stressFactorDescription: string;
      netMonthlyCashFlow?: number;
      netCashFlowState: ValueState;
      runwayMonths?: number;
      runwayStatus: RunwayStatus;
      timeGapWeekly?: number;
      timeGapState: ValueState;
      keyStressAssumptions: string[];
    };
    upsideCase: {
      upsideFactorDescription: string;
      netMonthlyCashFlow?: number;
      netCashFlowState: ValueState;
      surplusCapitalAccumulation?: number;
      surplusState: ValueState;
      keyStressAssumptions: string[];
    };
    comparisonMatrix: {
      divergenceFactors: string[];
      invariantConstants: string[];
    };
  };

  // 4. Data Sufficiency & Completeness
  dataSufficiency: {
    overallStatus: 'FULLY_DETERMINED' | 'PARTIALLY_DETERMINED' | 'UNDER_DETERMINED';
    coverageRatio: number;
    criticalUnknownVariables: string[];
    insufficientDataDimensions: string[];
  };

  // 5. Explicit Assumptions & Evidence
  assumptions: Array<{
    id: string;
    statement: string;
    relatedVariable: string;
    source: AssumptionSource;
    confidence: ConfidenceClassification;
    impactIfChanged: ImpactLevel;
    isHeuristic: boolean;
  }>;
  evidence: Array<{
    id: string;
    sourceType: EvidenceSourceType;
    description: string;
    verificationStatus: VerificationStatus;
    relevance: EvidenceRelevance;
    confidenceClassification: ConfidenceClassification;
    supportsVariables: string[];
  }>;

  // 6. Quantitative Provenance Metadata & Computation Fingerprints
  auditTrail: {
    dnaMethodologyVersion: '2.0.0-LOCKED';
    scenarioMethodologyVersion: '2.0.0-LOCKED';
    computationHashRefs: {
      dna: string;
      baseCase: string;
      downsideStressCase: string;
      upsideCase: string;
    };
  };
}

export interface V2NarrativeExplanation {
  explanationId: string;
  evaluatedAt: string;
  computationHashRefs: {
    dna: string;
    baseCase: string;
    downsideStressCase: string;
    upsideCase: string;
  };
  
  executiveSummary: {
    headline: string;
    coreTradeoffSummary: string;
    epistemicStatusSummary: string;
  };

  dimensionExplanations: {
    financialExposure: string;
    reversibility: string;
    resourceFit: string;
    opportunityCost: string;
    upsidePotential: string;
    evidenceConfidence: string;
  };

  scenarioNarratives: {
    baseCaseExplanation: string;
    downsideStressExplanation: string;
    upsideCaseExplanation: string;
    divergenceAnalysis: string;
  };

  assumptionsAudit: {
    criticalAssumptionsToValidate: string[];
    heuristicAssumptionsInUse: string[];
  };

  dataGapsAndNextSteps: {
    missingVariables: string[];
    recommendedInformationToCollect: string[];
  };

  epistemicDisclaimer: string;
}
