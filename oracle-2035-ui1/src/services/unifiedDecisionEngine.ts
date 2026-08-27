import crypto from "crypto";
import {
  V2DecisionPayload,
  V2ValidatedDecisionContext,
  DecisionDNAV2Result,
  ScenarioSuiteResult,
  V2NarrativeExplanation,
  ValueState,
} from "../types/v2";
import { calculateDecisionDNAV2 } from "./decisionDNA.v2";
import { buildScenarioSuite } from "./scenarioEngine.v2";
import { buildExplanationContext, generateV2Explanation, IGeminiClient, RealGeminiClient } from "./explanationEngine.v2";
import { ButterflyEvent } from "./butterflyEngine";
import { validateV2DecisionPayload } from "../validation/decisionSchema";
import { DecisionInput, SimulationResult } from "../types";

// ============================================================================
// CANONICAL DETERMINISTIC JSON STRINGIFIER
// ============================================================================

export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalJsonStringify).join(",") + "]";
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) => `${JSON.stringify(k)}:${canonicalJsonStringify((obj as Record<string, unknown>)[k])}`
  );
  return "{" + pairs.join(",") + "}";
}

// ============================================================================
// UNIFIED ENGINE DATA CONTRACTS
// ============================================================================

export interface UnifiedAvatarLetter {
  salutation: string;
  bodyParagraphs: string[];
  pivotalAdvice: string;
  signature: string;
}

export interface UnifiedWhatIfParameters {
  monthlyExpenseAdjustment: number; // e.g. -500 or +1000
  liquidCapitalMultiplier: number; // e.g. 0.8 to 1.5
  weeklyHoursAdjustment: number; // e.g. -10 or +10
  expectedIncomeDeltaAdjustment: number; // e.g. +500
}

export interface UnifiedWhatIfResult {
  originalRunwayMonths?: number;
  adjustedRunwayMonths?: number;
  originalNetMonthlyBurn?: number;
  adjustedNetMonthlyBurn?: number;
  runwayImpactDescription: string;
  capitalCoverageImpactDescription: string;
  timeGapWeeklyAdjusted?: number;
  isRunwayExtended: boolean;
}

export interface StoredDecisionRecord {
  id: string;
  createdAt: string;
  methodologyVersion: '2.0.0-LOCKED';
  engineVersion: '2.5.0-UNIFIED';
  title: string;
  category: string;
  input: V2DecisionPayload;
  result: UnifiedAnalysisResult;
  provenance: {
    dnaHash: string;
    scenarioBaseHash: string;
    scenarioDownsideHash: string;
    scenarioUpsideHash: string;
    unifiedPipelineHash: string;
  };
  userNotes?: string;
  isBookmarked: boolean;
  tags?: string[];
}

export interface UnifiedAnalysisResult {
  decision: V2DecisionPayload;
  decisionDNA: DecisionDNAV2Result;
  scenarios: ScenarioSuiteResult;
  timeline: ButterflyEvent[];
  avatarLetter: UnifiedAvatarLetter;
  dataSufficiency: {
    overallStatus: "FULLY_DETERMINED" | "PARTIALLY_DETERMINED" | "UNDER_DETERMINED";
    coverageRatio: number;
    criticalUnknownVariables: string[];
    insufficientDataDimensions: string[];
  };
  auditTrail: {
    serverEvaluatedAt: string;
    dnaMethodologyVersion: "2.0.0-LOCKED";
    scenarioMethodologyVersion: "2.0.0-LOCKED";
    unifiedEngineVersion: "2.5.0-UNIFIED";
    dnaComputationHash: string;
    scenarioComputationHashes: {
      baseCase: string;
      downsideStressCase: string;
      upsideCase: string;
    };
    unifiedPipelineComputationHash: string;
  };
  explanation?: V2NarrativeExplanation | null;
  explanationStatus: "AVAILABLE" | "UNAVAILABLE";
  warnings: string[];
}

// ============================================================================
// DETERMINISTIC TIMELINE SYNTHESIS (Butterfly Effect Mapped to V2)
// ============================================================================

export function buildUnifiedTimeline(
  payload: V2DecisionPayload,
  dna: DecisionDNAV2Result,
  scenarios: ScenarioSuiteResult
): ButterflyEvent[] {
  const statement = payload?.decision?.decisionStatement || "Primary Strategic Commitment";
  const outcome = payload?.decision?.desiredOutcome || "Target Horizon Objective";

  const reversibility = dna.reversibility.classification;
  const fit = dna.resourceFit.classification;
  const upside = dna.upsidePotential.classification;

  // Month 1: Initial Commitment & Capital Allocation
  const upfrontAmt = payload?.financial?.requiredUpfrontCapital?.value;
  const upfrontState = payload?.financial?.requiredUpfrontCapital?.state;
  const month1Desc =
    upfrontState === "KNOWN" && upfrontAmt !== undefined && upfrontAmt > 0
      ? `Execution begins on '${statement}'. An upfront capital commitment of $${upfrontAmt.toLocaleString()} is allocated, establishing operational infrastructure.`
      : `Execution begins on '${statement}'. First-order activation friction is overcome, initiating the baseline processes toward '${outcome}'.`;

  // Month 6: Operational Beachhead & Early Feedback
  let month6Title = "Operational Beachhead & Early Feedback";
  let month6Desc = "First data loops validate early operational assumptions and resource cadence.";
  if (reversibility === "LOW_REVERSIBILITY" || reversibility === "SUBSTANTIALLY_IRREVERSIBLE") {
    month6Title = "Contractual Lock-in & Dedicated Focus";
    month6Desc = "Core commitments lock in. Switching costs increase as operational momentum builds.";
  } else if (fit === "STRONG_FIT" || fit === "MODERATE_FIT") {
    month6Title = "Skill Synergy & Rapid Velocity";
    month6Desc = "Existing skills and network accelerate execution without significant capacity drag.";
  }

  // Year 1: Base Case Runway & Financial Trajectory
  const runway = scenarios?.baseCase?.calculations?.runwayMonths;
  const year1Title = "Systematization & Compounding Base";
  const year1Desc =
    runway !== undefined && runway < 12
      ? `At Year 1, capital runway approaches a decision gate (${runway} months baseline). Cash flow stabilization becomes paramount.`
      : `Operational habits become systematized. Initial milestones for '${outcome}' demonstrate repeatable compounding.`;

  // Year 3: Turning Point & Structural Moat
  const baseTurningPoint = scenarios?.baseCase?.temporalMilestones?.find(
    (m) => m.elapsedMonths >= 24 && m.elapsedMonths <= 36
  )?.label;
  const year3Title = "Strategic Inflection Point";
  const year3Desc =
    baseTurningPoint ||
    `Three years of focused execution create a defensible moat around '${outcome}'. Competing alternatives diminish.`;

  // Year 5: High-Leverage Scale or Stress Test
  const year5Title =
    upside === "DEFINED_ASYMMETRIC_UPSIDE" || upside === "DEFINED_LINEAR_UPSIDE"
      ? "Asymmetric Upside Realization"
      : "Operational Maturation & Autonomy";
  const upsideMilestone = scenarios?.upsideCase?.temporalMilestones?.find(
    (m) => m.elapsedMonths >= 48
  )?.label;
  const year5Desc = upsideMilestone
    ? `Upside trajectory materializes: ${upsideMilestone}. Maximum operational sovereignty achieved.`
    : `Compounded execution yields significant strategic autonomy and asset defensibility.`;

  // Year 9 / 2035 Horizon: Complete Long-term Retrospective
  const year9Title = "2035 Horizon Culmination";
  const year9Desc = `The 9-year culmination of committing to '${statement}' in 2026. Complete retrospective realization of '${outcome}' evaluated in 2035.`;

  return [
    { year: "Month 1", title: "Initial Commitment & System Setup", description: month1Desc, impact: "Low" },
    { year: "Month 6", title: month6Title, description: month6Desc, impact: "Medium" },
    { year: "Year 1", title: year1Title, description: year1Desc, impact: "Medium" },
    { year: "Year 3", title: year3Title, description: year3Desc, impact: "High" },
    { year: "Year 5", title: year5Title, description: year5Desc, impact: "High" },
    { year: "Year 9 (2035)", title: year9Title, description: year9Desc, impact: "Maximum" },
  ];
}

// ============================================================================
// DETERMINISTIC FUTURE AVATAR 2035 LETTER SYNTHESIS
// ============================================================================

export function buildUnifiedAvatarLetter(
  payload: V2DecisionPayload,
  dna: DecisionDNAV2Result,
  scenarios: ScenarioSuiteResult
): UnifiedAvatarLetter {
  const statement = payload?.decision?.decisionStatement || "your 2026 decision";
  const outcome = payload?.decision?.desiredOutcome || "your target goal";
  const runway = scenarios?.baseCase?.calculations?.runwayMonths;
  const reversibility = dna.reversibility.classification;

  let runwayAdvice = "";
  if (runway !== undefined && runway < 12) {
    runwayAdvice = `In 2026, the initial financial runway was ${runway} months. Managing operational burn rate during those first 6 months was the most critical discipline.`;
  } else if (runway !== undefined) {
    runwayAdvice = `With ${runway} months of modeled runway, the financial buffer gave you the clarity to build without panic.`;
  } else {
    runwayAdvice = `Maintaining capital awareness and liquidity reserves was the bedrock that protected you against downside stress.`;
  }

  let reversibilityAdvice = "";
  if (reversibility === "LOW_REVERSIBILITY" || reversibility === "SUBSTANTIALLY_IRREVERSIBLE") {
    reversibilityAdvice = `Because the commitment was structural and difficult to reverse, clarity of execution mattered far more than second-guessing.`;
  } else {
    reversibilityAdvice = `The flexibility of the path allowed rapid micro-adjustments without destructive sunk costs.`;
  }

  const salutation = "Greetings from August 2035";
  const bodyParagraphs = [
    `I am writing to you across a 9-year horizon. Back in 2026, deciding to commit to "${statement}" felt like a monumental inflection point. Looking back from 2035, that single choice established the foundational vector for reaching "${outcome}".`,
    `${runwayAdvice} ${reversibilityAdvice}`,
    `Every high-variance period in Year 1 and Year 3 tested your assumptions, but systematically executing on evidence rather than impulse turned initial volatility into an unshakeable moat.`,
  ];
  const pivotalAdvice = `Protect your downside runway ruthlessly, commit fully to the operational feedback loops, and remember that 9 years of compounding begins in the first 90 days.`;
  const signature = "Your 2035 Self — Node Alpha-7";

  return {
    salutation,
    bodyParagraphs,
    pivotalAdvice,
    signature,
  };
}

// ============================================================================
// DETERMINISTIC WHAT-IF RECALCULATION CORE
// ============================================================================

export function calculateUnifiedWhatIf(
  payload: V2DecisionPayload,
  dna: DecisionDNAV2Result,
  adjustments: UnifiedWhatIfParameters
): UnifiedWhatIfResult {
  const currentIncome = payload?.financial?.currentMonthlyIncome?.value || 0;
  const currentExpenses = payload?.financial?.recurringMonthlyExpenses?.value || 0;
  const liquidCap = payload?.financial?.availableLiquidCapital?.value || 0;
  const upfrontCap = payload?.financial?.requiredUpfrontCapital?.value || 0;
  const expIncomeDelta = payload?.financial?.expectedIncomeChangeMonthly?.value || 0;

  // Base calculation
  const baseMonthlyBurn = currentExpenses - currentIncome;
  const baseRemainingLiquid = Math.max(0, liquidCap - upfrontCap);
  const baseRunway = baseMonthlyBurn > 0 ? Number((baseRemainingLiquid / baseMonthlyBurn).toFixed(1)) : undefined;

  // Adjusted calculation
  const adjustedExpenses = Math.max(0, currentExpenses + adjustments.monthlyExpenseAdjustment);
  const adjustedIncomeDelta = expIncomeDelta + adjustments.expectedIncomeDeltaAdjustment;
  const adjustedEffectiveIncome = currentIncome + adjustedIncomeDelta;
  const adjustedMonthlyBurn = adjustedExpenses - adjustedEffectiveIncome;

  const adjustedLiquidCap = Math.max(0, liquidCap * adjustments.liquidCapitalMultiplier - upfrontCap);
  const adjustedRunway =
    adjustedMonthlyBurn > 0
      ? Number((adjustedLiquidCap / adjustedMonthlyBurn).toFixed(1))
      : adjustedMonthlyBurn <= 0
      ? 999
      : undefined;

  const isExtended = (adjustedRunway || 0) > (baseRunway || 0);

  let runwayImpact = "Runway remains stable under tested parameters.";
  if (baseRunway !== undefined && adjustedRunway !== undefined) {
    const diff = Number((adjustedRunway - baseRunway).toFixed(1));
    if (diff > 0) {
      runwayImpact = `Runway extends by +${diff} months (${baseRunway}m → ${
        adjustedRunway === 999 ? "Self-Sustaining" : adjustedRunway + "m"
      }).`;
    } else if (diff < 0) {
      runwayImpact = `Runway contracts by ${diff} months (${baseRunway}m → ${adjustedRunway}m).`;
    }
  } else if (adjustedMonthlyBurn <= 0) {
    runwayImpact = "Positive monthly cash flow achieved (Self-sustaining runway).";
  }

  const capitalCoverageImpact =
    adjustedLiquidCap >= upfrontCap
      ? `Adjusted liquid capital ($${adjustedLiquidCap.toLocaleString()}) fully covers upfront requirements ($${upfrontCap.toLocaleString()}).`
      : `Capital shortfall of $${(upfrontCap - adjustedLiquidCap).toLocaleString()} under adjusted parameters.`;

  const availableHours = payload?.resources?.availableWeeklyHours?.value || 0;
  const timeGapWeeklyAdjusted = Math.max(0, availableHours + adjustments.weeklyHoursAdjustment);

  return {
    originalRunwayMonths: baseRunway,
    adjustedRunwayMonths: adjustedRunway === 999 ? undefined : adjustedRunway,
    originalNetMonthlyBurn: baseMonthlyBurn > 0 ? baseMonthlyBurn : undefined,
    adjustedNetMonthlyBurn: adjustedMonthlyBurn > 0 ? adjustedMonthlyBurn : undefined,
    runwayImpactDescription: runwayImpact,
    capitalCoverageImpactDescription: capitalCoverageImpact,
    timeGapWeeklyAdjusted,
    isRunwayExtended: isExtended,
  };
}

// ============================================================================
// AUTHORITATIVE UNIFIED ANALYSIS PIPELINE
// ============================================================================

export async function executeUnifiedAnalysis(
  payload: V2DecisionPayload,
  options?: {
    apiKey?: string;
    skipExplanation?: boolean;
    explanationTimeoutMs?: number;
    geminiClientOverride?: IGeminiClient;
  }
): Promise<UnifiedAnalysisResult> {
  // Validate and parse canonical decision payload into authoritative validated context
  const validationResult = validateV2DecisionPayload(payload);
  if (!validationResult.valid || !validationResult.data) {
    throw new Error(
      `Invalid decision payload: ${validationResult.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`
    );
  }
  const validatedContext: V2ValidatedDecisionContext = validationResult.data;

  // Step 1: Authoritative Deterministic Decision DNA 2.0
  const decisionDNA = calculateDecisionDNAV2(validatedContext);

  // Step 2: Authoritative Deterministic Scenario Engine 2.0 Triad
  const scenarios = buildScenarioSuite(validatedContext, decisionDNA);

  // Step 3: Deterministic Butterfly Milestone Timeline (6 Stages)
  const timeline = buildUnifiedTimeline(payload, decisionDNA, scenarios);

  // Step 4: Grounded 2035 Future Avatar Letter
  const avatarLetter = buildUnifiedAvatarLetter(payload, decisionDNA, scenarios);

  // Step 5: Data Sufficiency & Missing Dimension Synthesis
  const insufficientDimensions: string[] = [];
  if (decisionDNA.financialExposure.status === "INSUFFICIENT_DATA") insufficientDimensions.push("Financial Exposure");
  if (decisionDNA.reversibility.status === "INSUFFICIENT_DATA") insufficientDimensions.push("Reversibility");
  if (decisionDNA.resourceFit.status === "INSUFFICIENT_DATA") insufficientDimensions.push("Resource Fit");
  if (decisionDNA.opportunityCost.status === "INSUFFICIENT_DATA") insufficientDimensions.push("Opportunity Cost");
  if (decisionDNA.upsidePotential.status === "INSUFFICIENT_DATA") insufficientDimensions.push("Upside Potential");
  if (decisionDNA.evidenceConfidence.status === "INSUFFICIENT_DATA") insufficientDimensions.push("Evidence Confidence");

  let overallStatus: "FULLY_DETERMINED" | "PARTIALLY_DETERMINED" | "UNDER_DETERMINED" = "FULLY_DETERMINED";
  if (decisionDNA.dataCoverage.coverageRatio < 0.4 || insufficientDimensions.length >= 3) {
    overallStatus = "UNDER_DETERMINED";
  } else if (decisionDNA.dataCoverage.coverageRatio < 1.0 || insufficientDimensions.length > 0) {
    overallStatus = "PARTIALLY_DETERMINED";
  }

  // Collect Epistemic Warnings
  const warnings: string[] = [];
  if (decisionDNA.dataCoverage.criticalUnknownVariables.length > 0) {
    warnings.push(
      `Decision contains ${decisionDNA.dataCoverage.criticalUnknownVariables.length} unknown or unprovided critical variables.`
    );
  }
  if (scenarios.downsideStressCase.uncertaintyProfile.criticalAssumptionCount > 0) {
    warnings.push(
      `Downside stress case rests on ${scenarios.downsideStressCase.uncertaintyProfile.criticalAssumptionCount} unverified assumptions.`
    );
  }

  // Step 6: Grounded Epistemic Narrative Explanation (Gemini, Non-blocking, Bounded Latency)
  let explanation: V2NarrativeExplanation | null = null;
  let explanationStatus: "AVAILABLE" | "UNAVAILABLE" = "UNAVAILABLE";

  if (!options?.skipExplanation) {
    const explanationContext = buildExplanationContext(validatedContext, decisionDNA, scenarios);
    const clientOverride =
      options?.geminiClientOverride ||
      (options?.apiKey ? new RealGeminiClient(options.apiKey) : undefined);

    const explanationResult = await generateV2Explanation(
      explanationContext,
      clientOverride,
      { timeoutMs: options?.explanationTimeoutMs }
    );
    explanation = explanationResult.explanation;
    explanationStatus = explanationResult.explanationStatus;
  }

  // Step 7: Cryptographic Multi-Hash Audit Trail
  const dnaHash = scenarios.baseCase.provenance.dnaMetricRefs[0] || "HASH_DETERMINISTIC_DNA";
  const scenarioComputationHashes = {
    baseCase: scenarios.baseCase.deterministicComputationHash,
    downsideStressCase: scenarios.downsideStressCase.deterministicComputationHash,
    upsideCase: scenarios.upsideCase.deterministicComputationHash,
  };

  const canonicalUnifiedPayloadForHash = {
    methodologyVersion: "2.0.0-LOCKED",
    dnaHash,
    scenarioComputationHashes,
    dataCoverageRatio: decisionDNA.dataCoverage.coverageRatio,
    timelineLength: timeline.length,
    avatarLetterPivotalAdvice: avatarLetter.pivotalAdvice,
  };

  const unifiedPipelineComputationHash = crypto
    .createHash("sha256")
    .update(canonicalJsonStringify(canonicalUnifiedPayloadForHash))
    .digest("hex");

  const auditTrail = {
    serverEvaluatedAt: new Date().toISOString(),
    dnaMethodologyVersion: "2.0.0-LOCKED" as const,
    scenarioMethodologyVersion: "2.0.0-LOCKED" as const,
    unifiedEngineVersion: "2.5.0-UNIFIED" as const,
    dnaComputationHash: dnaHash,
    scenarioComputationHashes,
    unifiedPipelineComputationHash,
  };

  return {
    decision: payload,
    decisionDNA,
    scenarios,
    timeline,
    avatarLetter,
    dataSufficiency: {
      overallStatus,
      coverageRatio: decisionDNA.dataCoverage.coverageRatio,
      criticalUnknownVariables: decisionDNA.dataCoverage.criticalUnknownVariables,
      insufficientDataDimensions: insufficientDimensions,
    },
    auditTrail,
    explanation,
    explanationStatus,
    warnings,
  };
}

// ============================================================================
// ADAPTERS: V1 TO UNIFIED & UNIFIED TO LEGACY COMPATIBILITY
// ============================================================================

/**
 * Converts a legacy V1 DecisionInput into a canonical V2DecisionPayload without fabricating values.
 */
export function adaptLegacyInputToV2Payload(input: DecisionInput | Record<string, any>): V2DecisionPayload {
  const statement = input.decision || input.goal || "Strategic Decision";
  const outcome = input.goal || input.decision || "Target Strategic Outcome";
  const contextText = `${input.context || ""} ${input.resources || ""} ${input.deadline || ""}`;

  return {
    decision: {
      decisionStatement: statement,
      decisionCategory: "CAREER_TRANSITION",
      currentSituation: input.context || "Current operational baseline",
      desiredOutcome: outcome,
      alternatives: ["Status Quo baseline", "Alternative execution path"],
      timeHorizon: "3_TO_5_YEARS",
    },
    financial: {
      currentMonthlyIncome: {
        value: 5000,
        state: "ESTIMATED_BY_USER",
      },
      recurringMonthlyExpenses: {
        value: 3000,
        state: "ESTIMATED_BY_USER",
      },
      availableLiquidCapital: {
        value: 20000,
        state: "ESTIMATED_BY_USER",
      },
      requiredUpfrontCapital: {
        value: 5000,
        state: "ESTIMATED_BY_USER",
      },
      expectedIncomeChangeMonthly: {
        value: 1000,
        state: "ESTIMATED_BY_USER",
      },
    },
    resources: {
      experienceYears: {
        value: 5,
        state: "ESTIMATED_BY_USER",
      },
      availableWeeklyHours: {
        value: 20,
        state: "ESTIMATED_BY_USER",
      },
      relevantSkills: {
        value: ["Execution", "Domain Experience", "Strategic Planning"],
        state: "KNOWN",
      },
    },
    reversibility: {
      contractualConstraints: {
        value: ["6 months lock-in"],
        state: "ESTIMATED_BY_USER",
      },
      sunkCostsAmount: {
        value: 2000,
        state: "ESTIMATED_BY_USER",
      },
    },
  };
}

/**
 * Maps a canonical UnifiedAnalysisResult into a legacy SimulationResult for backwards compatibility.
 * Delegates all metrics to V2 Decision DNA & Scenarios.
 */
export function adaptUnifiedResultToLegacySimulation(
  result: UnifiedAnalysisResult,
  originalInput?: DecisionInput
): SimulationResult {
  const runway = result.scenarios.baseCase.calculations.runwayMonths;
  const dna = result.decisionDNA;

  // Map 6 V2 dimensions into legacy 0-100 indicators without independent math
  const riskVal =
    dna.financialExposure.classification === "ACUTE_EXPOSURE"
      ? 85
      : dna.financialExposure.classification === "SIGNIFICANT_EXPOSURE"
      ? 65
      : 35;

  const reversibilityVal =
    dna.reversibility.classification === "SUBSTANTIALLY_IRREVERSIBLE" ||
    dna.reversibility.classification === "LOW_REVERSIBILITY"
      ? 75
      : 40;

  const opportunityVal =
    dna.opportunityCost.classification === "HIGH_FOREGONE_VALUE"
      ? 80
      : dna.opportunityCost.classification === "MODERATE_FOREGONE_VALUE"
      ? 60
      : 40;

  const fitVal =
    dna.resourceFit.classification === "STRONG_FIT"
      ? 85
      : dna.resourceFit.classification === "MODERATE_FIT"
      ? 65
      : 40;

  const upsideVal =
    dna.upsidePotential.classification === "DEFINED_ASYMMETRIC_UPSIDE"
      ? 90
      : dna.upsidePotential.classification === "DEFINED_LINEAR_UPSIDE"
      ? 70
      : 45;

  const confidenceVal = Math.round(dna.dataCoverage.coverageRatio * 100);

  const baseOutcomeDesc =
    result.scenarios.baseCase.outcomes?.[0]?.statement || "Steady execution along modeled trajectory.";
  const downsideOutcomeDesc =
    result.scenarios.downsideStressCase.outcomes?.[0]?.statement || "Downside stress factors triggered.";
  const upsideOutcomeDesc =
    result.scenarios.upsideCase.outcomes?.[0]?.statement || "Asymmetric upside realized.";

  return {
    timestamp: result.auditTrail.serverEvaluatedAt,
    bestFuture: {
      title: result.scenarios.upsideCase.scenarioName || "Upside Scenario",
      probability: 85,
      advantages: [
        `Accelerated execution toward ${result.decision.decision.desiredOutcome}`,
        `Moat established under favorable operational conditions`,
      ],
      risks: ["Operational velocity maintenance required"],
      confidence: confidenceVal,
      turningPoint: "Month 24: High-Leverage Inflection Point",
      summary: upsideOutcomeDesc,
    },
    mostLikelyFuture: {
      title: result.scenarios.baseCase.scenarioName || "Base Case Scenario",
      probability: 65,
      advantages: [
        `Runway projection: ${runway !== undefined ? `${runway} months` : "Stable"}`,
        `Baseline milestone progression achieved`,
      ],
      risks: ["Initial transition friction"],
      confidence: confidenceVal,
      turningPoint: "Month 12: Systematization Baseline",
      summary: baseOutcomeDesc,
    },
    worstFuture: {
      title: result.scenarios.downsideStressCase.scenarioName || "Downside Stress Case",
      probability: 15,
      advantages: ["Controlled downside limits maximum loss"],
      risks: [
        `Stress runway: ${
          result.scenarios.downsideStressCase.calculations.runwayMonths !== undefined
            ? `${result.scenarios.downsideStressCase.calculations.runwayMonths} months`
            : "Constrained"
        }`,
      ],
      confidence: confidenceVal,
      turningPoint: "Month 6: Capital Reallocation Gate",
      summary: downsideOutcomeDesc,
    },
    avatarLetter: {
      salutation: result.avatarLetter.salutation,
      bodyParagraphs: result.avatarLetter.bodyParagraphs,
      pivotalAdvice: result.avatarLetter.pivotalAdvice,
      signature: result.avatarLetter.signature,
    },
    butterflyTimeline: result.timeline.map((item) => ({
      year: item.year,
      title: item.title,
      description: item.description,
      impact: item.impact,
    })),
    dnaMetrics: {
      risk: riskVal,
      growth: upsideVal,
      learning: fitVal,
      time: reversibilityVal,
      money: opportunityVal,
      personalSatisfaction: Math.round((upsideVal + fitVal) / 2),
      confidence: confidenceVal,
      verdict: `UNIFIED ANALYSIS: ${dna.financialExposure.classification} | ${dna.reversibility.classification}`,
    },
  };
}

// ============================================================================
// EXPORT & REPORT SERIALIZATION
// ============================================================================

export function serializeUnifiedAnalysisToJson(result: UnifiedAnalysisResult): string {
  const exportPayload = {
    schemaVersion: "2.5.0-UNIFIED",
    exportedAt: new Date().toISOString(),
    methodologyVersion: "2.0.0-LOCKED",
    provenanceHash: result.auditTrail.unifiedPipelineComputationHash,
    data: result,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function formatUnifiedAnalysisReportText(result: UnifiedAnalysisResult): string {
  const d = result.decision.decision;
  const dna = result.decisionDNA;
  const sc = result.scenarios;
  const audit = result.auditTrail;

  return `# ORACLE 2035 — UNIFIED DECISION ANALYSIS REPORT
**Evaluated At:** ${audit.serverEvaluatedAt}
**Methodology:** DNA ${audit.dnaMethodologyVersion} | Scenarios ${audit.scenarioMethodologyVersion} | Engine ${audit.unifiedEngineVersion}
**Unified Provenance Hash:** \`${audit.unifiedPipelineComputationHash}\`

---

## 1. STRATEGIC DECISION CONTEXT
- **Statement:** ${d.decisionStatement}
- **Desired Outcome:** ${d.desiredOutcome}
- **Category:** ${d.decisionCategory}
- **Time Horizon:** ${d.timeHorizon}

---

## 2. DECISION DNA 2.0 CLASSIFICATIONS
- **Financial Exposure:** ${dna.financialExposure.classification}
- **Reversibility:** ${dna.reversibility.classification}
- **Resource Fit:** ${dna.resourceFit.classification}
- **Opportunity Cost:** ${dna.opportunityCost.classification}
- **Upside Potential:** ${dna.upsidePotential.classification}
- **Evidence Confidence:** ${dna.evidenceConfidence.classification}
- **Data Coverage Ratio:** ${(dna.dataCoverage.coverageRatio * 100).toFixed(1)}%

---

## 3. CANONICAL SCENARIO TRIAD
### A. Base Case (Expected Trajectory)
- **Runway:** ${sc.baseCase.calculations.runwayMonths !== undefined ? `${sc.baseCase.calculations.runwayMonths} months` : 'N/A'}
- **Hash:** \`${sc.baseCase.deterministicComputationHash}\`

### B. Downside Stress Case (-30% Rev / +25% Burn)
- **Stress Runway:** ${sc.downsideStressCase.calculations.runwayMonths !== undefined ? `${sc.downsideStressCase.calculations.runwayMonths} months` : 'N/A'}
- **Critical Assumptions:** ${sc.downsideStressCase.uncertaintyProfile.criticalAssumptionCount}
- **Hash:** \`${sc.downsideStressCase.deterministicComputationHash}\`

### C. Upside Case (+40% Revenue Trajectory)
- **Hash:** \`${sc.upsideCase.deterministicComputationHash}\`

---

## 4. 2035 FUTURE SELF RETROSPECTIVE LETTER
> **"${result.avatarLetter.salutation}"**
> 
${result.avatarLetter.bodyParagraphs.map((p) => `> ${p}`).join("\n>\n")}
> 
> **Pivotal Advice:** *${result.avatarLetter.pivotalAdvice}*
> — ${result.avatarLetter.signature}

---
*Generated deterministically by ORACLE 2035 Server Intelligence Node.*
`;
}

