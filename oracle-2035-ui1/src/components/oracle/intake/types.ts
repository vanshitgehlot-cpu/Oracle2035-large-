import {
  DecisionCategory,
  TimeHorizon,
  SwitchingEffortLevel,
  DataAvailability,
  EvidenceItem,
  AssumptionItem,
  V2DecisionPayload,
} from "../../../types/v2";

export type IntakeStageId = 1 | 2 | 3 | 4 | 5 | "review";

export interface EpistemicNumberInput {
  value: string;
  state: DataAvailability;
}

export interface IntakeFormData {
  // Stage 1: Decision Core
  decisionStatement: string;
  decisionCategory: DecisionCategory;
  desiredOutcome: string;
  currentSituation: string;
  timeHorizon: TimeHorizon;
  alternatives: string;

  // Stage 2: Financial Reality
  currency: string;
  currentMonthlyIncome: EpistemicNumberInput;
  recurringMonthlyExpenses: EpistemicNumberInput;
  availableLiquidCapital: EpistemicNumberInput;
  requiredUpfrontCapital: EpistemicNumberInput;
  existingFinancialObligations: EpistemicNumberInput;
  expectedIncomeChangeMonthly: EpistemicNumberInput;

  // Stage 3: Execution Capacity
  availableWeeklyHours: EpistemicNumberInput;
  experienceYears: EpistemicNumberInput;
  relevantSkills: string;
  availableSupportNetwork: string;
  availablePhysicalAssets: string;

  // Stage 4: Commitments & Reversibility
  estimatedSwitchingEffort: SwitchingEffortLevel;
  unwindingTimeMonths: EpistemicNumberInput;
  sunkCostsAmount: EpistemicNumberInput;
  irreversibleCommitments: string;
  contractualConstraints: string;

  // Stage 5: Evidence & Baseline
  primaryOpportunity: string;
  opportunityCostSummary: string;
  foregoneBenefits: string;
  evidenceItems: EvidenceItem[];
  assumptionItems: AssumptionItem[];
}

export const INITIAL_INTAKE_STATE: IntakeFormData = {
  // Stage 1
  decisionStatement: "Resign from Lead Data Engineer role to bootstrap B2B Decision Intelligence SaaS",
  decisionCategory: "CAREER_TRANSITION",
  desiredOutcome: "Achieve $15k/mo ARR and financial independence within 24 months",
  currentSituation: "Currently employed as Lead Data Engineer with 8 years of distributed systems experience",
  timeHorizon: "1_TO_3_YEARS",
  alternatives: "Stay at current high-paying role, Transition to part-time consulting",

  // Stage 2
  currency: "USD",
  currentMonthlyIncome: { value: "8500", state: "KNOWN" },
  recurringMonthlyExpenses: { value: "3200", state: "KNOWN" },
  availableLiquidCapital: { value: "45000", state: "KNOWN" },
  requiredUpfrontCapital: { value: "12000", state: "KNOWN" },
  existingFinancialObligations: { value: "500", state: "KNOWN" },
  expectedIncomeChangeMonthly: { value: "-8500", state: "KNOWN" },

  // Stage 3
  availableWeeklyHours: { value: "50", state: "KNOWN" },
  experienceYears: { value: "8", state: "KNOWN" },
  relevantSkills: "Full-Stack TypeScript, Distributed Systems, ML Engineering, SaaS Architecture",
  availableSupportNetwork: "3 SaaS Founder Mentors, 2 Angel Investors, Technical Community",
  availablePhysicalAssets: "Home Office Setup, Dedicated Compute Servers",

  // Stage 4
  estimatedSwitchingEffort: "MEDIUM",
  unwindingTimeMonths: { value: "3", state: "KNOWN" },
  sunkCostsAmount: { value: "12000", state: "KNOWN" },
  irreversibleCommitments: "Public resignation announcement, Brand formation legal filings",
  contractualConstraints: "6-month non-solicitation clause for existing client list",

  // Stage 5
  primaryOpportunity: "B2B Enterprise Decision Simulation Software SaaS",
  opportunityCostSummary: "Foregoing approximately $102k in base salary annually plus career stability",
  foregoneBenefits: "Corporate healthcare matching, Annual equity vesting, Predictable bonus",
  evidenceItems: [
    {
      id: "ev_bank_verified_capital",
      sourceType: "DOCUMENT_UPLOAD",
      description: "Liquid savings verified in primary checking and treasury accounts",
      verificationStatus: "VERIFIED_EXTERNAL",
      relevance: "DIRECT",
      confidenceClassification: "HIGH",
      supportsVariables: ["financial.availableLiquidCapital"],
    },
  ],
  assumptionItems: [
    {
      id: "asm_fin_runway_baseline",
      statement: "Living expenses remain capped at $3,200/mo without inflation spike",
      relatedVariable: "financial.recurringMonthlyExpenses",
      value: 3200,
      unit: "USD/mo",
      source: "USER_STATED",
      confidence: "HIGH",
      impactIfChanged: "HIGH",
    },
    {
      id: "asm_saas_mvp_timeline",
      statement: "MVP development requires 6 months before initial revenue traction",
      relatedVariable: "decision.timeHorizon",
      value: 6,
      unit: "months",
      source: "DEFAULT_HEURISTIC",
      confidence: "MEDIUM",
      impactIfChanged: "HIGH",
    },
  ],
};

/**
 * Builds the canonical V2 Decision Payload from intake form state.
 */
export function buildCanonicalPayload(formData: IntakeFormData): V2DecisionPayload {
  const parseNum = (input: EpistemicNumberInput) => {
    if (input.state === "UNKNOWN") return { state: "UNKNOWN" as const };
    if (input.state === "NOT_PROVIDED" || !input.value.trim()) return { state: "NOT_PROVIDED" as const };
    const num = parseFloat(input.value);
    if (isNaN(num)) return { state: "NOT_PROVIDED" as const };
    return { value: num, state: "KNOWN" as const };
  };

  const splitList = (str: string) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const altList = splitList(formData.alternatives);

  return {
    decision: {
      decisionStatement: formData.decisionStatement.trim(),
      decisionCategory: formData.decisionCategory,
      currentSituation: formData.currentSituation.trim() || formData.decisionStatement.trim(),
      desiredOutcome: formData.desiredOutcome.trim() || formData.decisionStatement.trim(),
      alternatives: altList.length > 0 ? altList : ["Maintain baseline status quo"],
      timeHorizon: formData.timeHorizon,
    },
    financial: {
      currency: formData.currency,
      currentMonthlyIncome: parseNum(formData.currentMonthlyIncome),
      recurringMonthlyExpenses: parseNum(formData.recurringMonthlyExpenses),
      availableLiquidCapital: parseNum(formData.availableLiquidCapital),
      existingFinancialObligations: parseNum(formData.existingFinancialObligations),
      requiredUpfrontCapital: parseNum(formData.requiredUpfrontCapital),
      expectedIncomeChangeMonthly: parseNum(formData.expectedIncomeChangeMonthly),
    },
    resources: {
      availableWeeklyHours: parseNum(formData.availableWeeklyHours),
      experienceYears: parseNum(formData.experienceYears),
      relevantSkills: {
        value: splitList(formData.relevantSkills),
        state: formData.relevantSkills.trim() ? "KNOWN" : "NOT_PROVIDED",
      },
      availableSupportNetwork: {
        value: splitList(formData.availableSupportNetwork),
        state: formData.availableSupportNetwork.trim() ? "KNOWN" : "NOT_PROVIDED",
      },
      availablePhysicalAssets: {
        value: splitList(formData.availablePhysicalAssets),
        state: formData.availablePhysicalAssets.trim() ? "KNOWN" : "NOT_PROVIDED",
      },
    },
    reversibility: {
      estimatedSwitchingEffort: { value: formData.estimatedSwitchingEffort, state: "KNOWN" },
      unwindingTimeMonths: parseNum(formData.unwindingTimeMonths),
      sunkCostsAmount: parseNum(formData.sunkCostsAmount),
      irreversibleCommitments: {
        value: splitList(formData.irreversibleCommitments),
        state: formData.irreversibleCommitments.trim() ? "KNOWN" : "NOT_PROVIDED",
      },
      contractualConstraints: {
        value: splitList(formData.contractualConstraints),
        state: formData.contractualConstraints.trim() ? "KNOWN" : "NOT_PROVIDED",
      },
    },
    opportunity: {
      primaryOpportunity: formData.primaryOpportunity.trim() || formData.decisionStatement.trim(),
      alternativesConsidered: altList.length > 0 ? altList : ["Maintain baseline status quo"],
      opportunityCostSummary: {
        value: formData.opportunityCostSummary.trim() || "Implicit trade-off against alternatives",
        state: "KNOWN",
      },
      foregoneBenefits: {
        value: splitList(formData.foregoneBenefits),
        state: formData.foregoneBenefits.trim() ? "KNOWN" : "NOT_PROVIDED",
      },
    },
    evidence: formData.evidenceItems,
    assumptions: formData.assumptionItems,
    metadata: {
      clientVersion: "2.0.0-PROD",
      submittedAt: new Date().toISOString(),
    },
  };
}
