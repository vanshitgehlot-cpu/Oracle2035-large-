import {
  DataAvailability,
  DecisionDNAV2Result,
  ScenarioComparisonMatrix,
  ScenarioSuiteResult,
  ValueState,
  V2AnalyzeDecisionSuccessResponse,
  V2DecisionPayload,
} from "../types/v2";

export type OracleRenderableState = DataAvailability | ValueState;
export type OracleDimensionKey = keyof Pick<
  DecisionDNAV2Result,
  | "financialExposure"
  | "reversibility"
  | "resourceFit"
  | "opportunityCost"
  | "upsidePotential"
  | "evidenceConfidence"
>;

export interface DecisionIdentityViewModel {
  statement: string;
  desiredOutcome?: string;
  category?: string;
  timeHorizon?: string;
  currentSituation?: string;
}

export interface DimensionSignalViewModel {
  key: OracleDimensionKey;
  label: string;
  classification: string;
  status: string;
  semanticDirection: string;
  contributingVariables: string[];
  activeAssumptions: string[];
}

export interface ScenarioComparisonViewModel {
  scenarios: ScenarioComparisonMatrix["scenarios"];
  divergenceFactors: string[];
  invariantConstants: string[];
}

export interface EvidenceStateViewModel {
  state: OracleRenderableState;
  label: string;
  explicitMeaning: string;
}

export interface ProvenanceLedgerViewModel {
  methodologyVersion: string;
  serverEvaluatedAt?: string;
  hashes: Array<{ label: string; value: string }>;
}

const humanize = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function selectDecisionIdentity(
  payload?: V2DecisionPayload | null,
  data?: V2AnalyzeDecisionSuccessResponse["data"] | null,
): DecisionIdentityViewModel {
  return {
    statement: payload?.decision?.decisionStatement || data?.scenarios?.baseCase?.decisionReference || "Decision analysis",
    desiredOutcome: payload?.decision?.desiredOutcome || data?.decisionDNA?.upsidePotential?.measurements?.userStatedTargetOutcome,
    category: payload?.decision?.decisionCategory,
    timeHorizon: payload?.decision?.timeHorizon || data?.scenarios?.baseCase?.timeHorizon,
    currentSituation: payload?.decision?.currentSituation,
  };
}

export function selectDimensionSignal(
  dna: DecisionDNAV2Result,
  key: OracleDimensionKey,
): DimensionSignalViewModel {
  const dimension = dna[key];
  return {
    key,
    label: humanize(key),
    classification: humanize(String(dimension.classification)),
    status: dimension.status,
    semanticDirection: dimension.semanticDirection,
    contributingVariables: dimension.contributingVariables,
    activeAssumptions: dimension.activeAssumptions,
  };
}

export function selectScenarioComparison(
  scenarios: ScenarioSuiteResult,
): ScenarioComparisonViewModel {
  return {
    scenarios: scenarios.comparisonMatrix.scenarios,
    divergenceFactors: scenarios.comparisonMatrix.divergenceFactors,
    invariantConstants: scenarios.comparisonMatrix.invariantConstants,
  };
}

export function selectEvidenceState(state: OracleRenderableState): EvidenceStateViewModel {
  const labels: Record<OracleRenderableState, { label: string; explicitMeaning: string }> = {
    KNOWN: { label: "Known", explicitMeaning: "A supplied input or verified record." },
    CALCULATED: { label: "Calculated", explicitMeaning: "Derived by the authoritative deterministic engine." },
    ASSUMED: { label: "Assumed", explicitMeaning: "An explicit assumption, not verified evidence." },
    ESTIMATED_BY_USER: { label: "Estimated by user", explicitMeaning: "A user estimate, not a verified measurement." },
    UNKNOWN: { label: "Unknown", explicitMeaning: "Information is unavailable; it is not zero." },
    NOT_PROVIDED: { label: "Not provided", explicitMeaning: "No value was supplied; it is not zero." },
    NOT_APPLICABLE: { label: "Not applicable", explicitMeaning: "This measure does not apply to the current context." },
    INSUFFICIENT_DATA: { label: "Insufficient data", explicitMeaning: "The authoritative engine could not determine this measure from the supplied context." },
  };
  const copy = labels[state];
  return { state, ...copy };
}

export function selectProvenanceLedger(
  data: V2AnalyzeDecisionSuccessResponse["data"],
): ProvenanceLedgerViewModel {
  return {
    methodologyVersion: data.auditTrail.dnaMethodologyVersion,
    serverEvaluatedAt: data.auditTrail.serverEvaluatedAt,
    hashes: [
      { label: "DNA SHA-256", value: data.auditTrail.dnaComputationHash },
      { label: "Base case SHA-256", value: data.auditTrail.scenarioComputationHashes.baseCase },
      { label: "Downside SHA-256", value: data.auditTrail.scenarioComputationHashes.downsideStressCase },
      { label: "Upside SHA-256", value: data.auditTrail.scenarioComputationHashes.upsideCase },
    ],
  };
}
