import {
  CanonicalScenarioType,
  DecisionDNAV2Result,
  ScenarioContract,
  ScenarioSuiteResult,
  ValueState,
  V2AnalyzeDecisionSuccessResponse,
  V2DecisionPayload,
} from "../types/v2";

export type DossierData = V2AnalyzeDecisionSuccessResponse["data"];

export interface DossierMetricView {
  label: string;
  value?: string;
  state: ValueState;
  detail?: string;
}

export interface DossierDimensionView {
  id: string;
  label: string;
  classification: string;
  direction: string;
  status: string;
  metrics: DossierMetricView[];
  contributingVariables: string[];
  activeAssumptions: string[];
}

export interface DossierScenarioView {
  type: CanonicalScenarioType;
  label: string;
  contract: ScenarioContract;
  position: number;
  tone: "action" | "risk" | "provenance";
}

const calculatedState = (value: unknown): ValueState => value === undefined || value === null ? "INSUFFICIENT_DATA" : "CALCULATED";
const displayClassification = (value: string) => value.replace(/_/g, " ");
const displayNumber = (value: number | undefined, suffix = "") => value === undefined ? undefined : `${value.toLocaleString()}${suffix}`;
const displayMoney = (value: number | undefined, currency?: string) => value === undefined ? undefined : `${currency ? `${currency} ` : ""}${value.toLocaleString()}`;

export const selectDossierIdentity = (decisionStatement: string, desiredOutcome?: string, timeHorizon?: string, category?: string, currentSituation?: string) => ({
  decisionStatement,
  desiredOutcome,
  timeHorizon: timeHorizon ? timeHorizon.replace(/_/g, " ") : undefined,
  category: category ? category.replace(/_/g, " ") : undefined,
  currentSituation,
});

export const selectDossierDimensions = (dna: DecisionDNAV2Result, currency?: string): DossierDimensionView[] => {
  const fin = dna.financialExposure.measurements;
  const rev = dna.reversibility.measurements;
  const res = dna.resourceFit.measurements;
  const opp = dna.opportunityCost.measurements;
  const ups = dna.upsidePotential.measurements;
  const evi = dna.evidenceConfidence.measurements;
  return [
    {
      id: "financialExposure",
      label: "Financial Exposure",
      classification: displayClassification(dna.financialExposure.classification),
      direction: dna.financialExposure.semanticDirection,
      status: dna.financialExposure.status,
      metrics: [
        { label: "Runway", value: fin.runwayStatus === "SURPLUS_OR_NON_BURN" ? "Surplus / non-burn" : displayNumber(fin.runwayMonths, " months"), state: fin.runwayStatus === "SURPLUS_OR_NON_BURN" ? "CALCULATED" : calculatedState(fin.runwayMonths) },
        { label: "Monthly net cash", value: displayMoney(fin.monthlyNetCashPosition, currency) , state: calculatedState(fin.monthlyNetCashPosition) },
        { label: "Post-commitment capital", value: displayMoney(fin.postCommitmentLiquidCapital, currency), state: calculatedState(fin.postCommitmentLiquidCapital) },
      ],
      contributingVariables: dna.financialExposure.contributingVariables,
      activeAssumptions: dna.financialExposure.activeAssumptions,
    },
    {
      id: "reversibility",
      label: "Reversibility",
      classification: displayClassification(dna.reversibility.classification),
      direction: dna.reversibility.semanticDirection,
      status: dna.reversibility.status,
      metrics: [
        { label: "Switching effort", value: rev.switchingEffortLevel, state: calculatedState(rev.switchingEffortLevel) },
        { label: "Unwinding time", value: displayNumber(rev.unwindingTimeMonths, " months"), state: calculatedState(rev.unwindingTimeMonths) },
        { label: "Sunk costs", value: displayMoney(rev.sunkCostsAmount, currency), state: calculatedState(rev.sunkCostsAmount) },
      ],
      contributingVariables: dna.reversibility.contributingVariables,
      activeAssumptions: dna.reversibility.activeAssumptions,
    },
    {
      id: "resourceFit",
      label: "Resource Fit",
      classification: displayClassification(dna.resourceFit.classification),
      direction: dna.resourceFit.semanticDirection,
      status: dna.resourceFit.status,
      metrics: [
        { label: "Available hours", value: displayNumber(res.availableWeeklyHours, " hrs / week"), state: calculatedState(res.availableWeeklyHours) },
        { label: "Domain experience", value: displayNumber(res.experienceYears, " years"), state: calculatedState(res.experienceYears) },
        { label: "Resource gaps", value: res.resourceGapsIdentified.length ? `${res.resourceGapsIdentified.length} identified` : "None identified", state: "CALCULATED" },
      ],
      contributingVariables: dna.resourceFit.contributingVariables,
      activeAssumptions: dna.resourceFit.activeAssumptions,
    },
    {
      id: "opportunityCost",
      label: "Opportunity Cost",
      classification: displayClassification(dna.opportunityCost.classification),
      direction: dna.opportunityCost.semanticDirection,
      status: dna.opportunityCost.status,
      metrics: [
        { label: "Alternatives", value: `${opp.alternativesConsideredCount} identified`, state: "CALCULATED" },
        { label: "Foregone horizon income", value: displayMoney(opp.foregoneIncomeOverHorizon, currency), state: calculatedState(opp.foregoneIncomeOverHorizon) },
        { label: "Foregone benefits", value: `${opp.foregoneBenefitsCount} identified`, state: "CALCULATED" },
      ],
      contributingVariables: dna.opportunityCost.contributingVariables,
      activeAssumptions: dna.opportunityCost.activeAssumptions,
    },
    {
      id: "upsidePotential",
      label: "Upside Potential",
      classification: displayClassification(dna.upsidePotential.classification),
      direction: dna.upsidePotential.semanticDirection,
      status: dna.upsidePotential.status,
      metrics: [
        { label: "Stated target", value: ups.userStatedTargetOutcome || "Not provided", state: ups.userStatedTargetOutcome ? "KNOWN" : "NOT_PROVIDED" },
        { label: "Target monthly delta", value: displayMoney(ups.userStatedTargetDifferenceMonthly, currency), state: calculatedState(ups.userStatedTargetDifferenceMonthly) },
        { label: "Time horizon", value: ups.timeHorizon.replace(/_/g, " "), state: "KNOWN" },
      ],
      contributingVariables: dna.upsidePotential.contributingVariables,
      activeAssumptions: dna.upsidePotential.activeAssumptions,
    },
    {
      id: "evidenceConfidence",
      label: "Evidence Quality",
      classification: displayClassification(dna.evidenceConfidence.classification),
      direction: dna.evidenceConfidence.semanticDirection,
      status: dna.evidenceConfidence.status,
      metrics: [
        { label: "Evidence records", value: `${evi.totalEvidenceCount}`, state: "CALCULATED" },
        { label: "Verified external", value: `${evi.verifiedExternalCount}`, state: "CALCULATED" },
        { label: "Active assumptions", value: `${evi.totalAssumptionCount}`, state: "CALCULATED" },
      ],
      contributingVariables: dna.evidenceConfidence.contributingVariables,
      activeAssumptions: dna.evidenceConfidence.activeAssumptions,
    },
  ];
};

export const selectDossierScenarios = (scenarios: ScenarioSuiteResult): DossierScenarioView[] => [
  { type: "BASE_CASE", label: "Base", contract: scenarios.baseCase, position: 50, tone: "action" },
  { type: "UPSIDE_CASE", label: "Upside", contract: scenarios.upsideCase, position: 82, tone: "provenance" },
  { type: "DOWNSIDE_STRESS_CASE", label: "Downside stress", contract: scenarios.downsideStressCase, position: 18, tone: "risk" },
];

export const selectCausalGraphLayout = (contract: ScenarioContract) => {
  const laneByCategory = { CAUSE: 18, CONDITION: 40, CONSTRAINT: 62, OUTCOME: 84 } as const;
  const categoryCount: Record<string, number> = {};
  const nodes = contract.causalGraph.nodes.map((node) => {
    const index = categoryCount[node.category] || 0;
    categoryCount[node.category] = index + 1;
    return {
      id: node.nodeId,
      label: node.variableName,
      category: node.category.toLowerCase() as "cause" | "condition" | "constraint" | "outcome",
      x: laneByCategory[node.category],
      y: 18 + (index % 4) * 21,
    };
  });
  return {
    nodes,
    edges: contract.causalGraph.edges.map((edge) => ({ from: edge.fromNodeId, to: edge.toNodeId, label: edge.description })),
  };
};

export const selectMilestoneRail = (contract: ScenarioContract, selectedMilestoneId?: string | null) => contract.temporalMilestones.map((milestone) => ({
  id: milestone.milestoneId,
  label: milestone.label,
  meta: `+${milestone.elapsedMonths} months`,
  position: contract.horizonMonths > 0 ? (milestone.elapsedMonths / contract.horizonMonths) * 100 : 0,
  tone: milestone.projectedLiquidCapitalState === "UNKNOWN" || milestone.projectedLiquidCapitalState === "INSUFFICIENT_DATA" ? "risk" as const : "temporal" as const,
  active: milestone.milestoneId === selectedMilestoneId,
}));

export const selectEvidenceLedger = (payload: V2DecisionPayload | null | undefined) => ({
  evidence: payload?.evidence || [],
  assumptions: payload?.assumptions || [],
});
