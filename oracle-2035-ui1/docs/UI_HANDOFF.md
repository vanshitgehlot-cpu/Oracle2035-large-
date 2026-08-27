# ORACLE 2035 — Headless UI Handoff Contract (For Lovable / Manus)

## Purpose

This document provides the definitive, frozen engineering contract for rebuilding the ORACLE 2035 visual layer in dedicated UI tools (such as Lovable or Manus).

**The deterministic intelligence backend, types, persistence layer, and API contracts are 100% complete and locked.** The future UI redesign can replace the visual interface without modifying any business logic or backend endpoints.

---

## 1. Application Entry Points & User Flows

```
[ FLOW A: NEW DECISION INTAKE ]
  OracleLandingPage → "Start Analysis"
    → OracleIntakeFlow Stage 1: Decision Core (decisionStatement, decisionCategory, currentSituation, desiredOutcome, alternatives, timeHorizon)
    → OracleIntakeFlow Stage 2: Financial Reality (currentMonthlyIncome, recurringMonthlyExpenses, availableLiquidCapital, existingFinancialObligations, expectedIncomeChangeMonthly, requiredUpfrontCapital, currency)
    → OracleIntakeFlow Stage 3: Execution Capacity (relevantSkills, experienceYears, availableWeeklyHours, availableSupportNetwork, availablePhysicalAssets)
    → OracleIntakeFlow Stage 4: Commitments & Reversibility (estimatedSwitchingEffort, irreversibleCommitments, sunkCostsAmount, contractualConstraints, unwindingTimeMonths)
    → OracleIntakeFlow Stage 5: Evidence & Baseline (primaryOpportunity, alternativesConsidered, opportunityCostSummary, foregoneBenefits, evidence, assumptions)
    → OracleIntakeFlow Stage 6: Review & Submit → POST /api/analyze-decision
    → V2ThinkingScreen (Calculation status)
    → OracleAnalysisWorkspace (Decision DNA, Scenarios, What-If, Future Self, Provenance, Export)

[ FLOW B: SAVED DECISION LIBRARY ]
  OracleLandingPage → "Decision Library"
    → OracleDecisionLibrary
    → Select Saved Snapshot
    → Opens OracleAnalysisWorkspace SYNCHRONOUSLY with zero network calls (loaded from oracle_decision_library_v2)
    → Interactive What-If, Notes, Bookmarks, HTML/JSON Export

[ FLOW C: WHAT-IF STUDIO ]
  OracleAnalysisWorkspace → OracleWhatIfStudio
    → Adjust parameters
    → Real-time recalculation using pure local functions (zero network calls)
    → Delta comparison vs. original baseCase
```

---

## 2. ValueState Data Contracts

All numerical, array, and string contextual inputs MUST use the `DataField<T>` structure with explicit `DataAvailability` semantics:

```typescript
type DataAvailability = "KNOWN" | "UNKNOWN" | "NOT_PROVIDED" | "NOT_APPLICABLE" | "ESTIMATED_BY_USER";

interface DataField<T> {
  value?: T;
  state: DataAvailability;
  source?: string;
  notes?: string;
}
```

**Critical Invariant**: Never default `UNKNOWN` or `NOT_PROVIDED` to `0` or `$0`. The UI must display them with explicit badges (e.g. `[Unknown]`, `[Unspecified]`).

Internally, calculation engines use `ValueState` which extends data availability with computation states:
```typescript
type ValueState = "KNOWN" | "CALCULATED" | "ASSUMED" | "UNKNOWN" | "NOT_PROVIDED" | "NOT_APPLICABLE" | "INSUFFICIENT_DATA";
```

---

## 3. Decision DNA Dimensions (6 Dimensions)

The server computes 6 core dimensions, exposing explicit measurements and a qualitative classification (NOT arbitrary 0-100 scores).

| Dimension | Description | Classifications (Examples) |
| :--- | :--- | :--- |
| `financialExposure` | Capital risk & runway drain | `MINIMAL_EXPOSURE`, `MODERATE_EXPOSURE`, `SIGNIFICANT_EXPOSURE`, `ACUTE_EXPOSURE` |
| `reversibility` | Ease and speed of unwinding | `HIGHLY_REVERSIBLE`, `MODERATELY_REVERSIBLE`, `LOW_REVERSIBILITY`, `SUBSTANTIALLY_IRREVERSIBLE` |
| `resourceFit` | Skills, time, and physical assets | `STRONG_FIT`, `MODERATE_FIT`, `RESOURCE_CONSTRAINED` |
| `opportunityCost` | Foregone benefits and alternatives | `LOW_FOREGONE_VALUE`, `MODERATE_FOREGONE_VALUE`, `HIGH_FOREGONE_VALUE` |
| `upsidePotential` | Upside targets and financial growth | `DEFINED_ASYMMETRIC_UPSIDE`, `DEFINED_LINEAR_UPSIDE`, `QUALITATIVE_TARGET_STATED` |
| `evidenceConfidence` | Empirical basis & verified data | `STRONGLY_EVIDENCED`, `MODERATELY_EVIDENCED`, `ASSUMPTION_HEAVY`, `UNVERIFIED_ASSERTION` |

---

## 4. Conditional Scenarios (3 Trajectories)

The analysis outputs 3 conditional scenarios under explicit assumptions:

1. `baseCase`: Standard trajectory under expected conditions.
2. `downsideStressCase`: Downside trajectory under resource constraints or risk materialization.
3. `upsideCase`: Upside trajectory under strong execution and tailwinds.

Each scenario provides:
- `scenarioName`
- `calculations`: Post-commitment capital, monthly net cash, runway months, etc.
- `temporalMilestones`: Elapsed months, events, and projected capital states.
- `outcomes`: Categorized outcomes based on assumptions.
- `uncertaintyProfile`: Confidence grade, switch-over points, and data coverage.

---

## 5. Storage & Persistence Keys

- **Draft Storage**: `localStorage.getItem("oracle_intake_draft_v2")`
- **Library Storage**: `localStorage.getItem("oracle_decision_library_v2")`

The library service (`oracleDecisionLibrary.ts`) exposes high-level helpers:
- `getDecisions()`
- `getDecisionById(id)`
- `saveDecision(input)`
- `updateDecision(id, updates)`
- `updateDecisionNotes(id, userNotes)`
- `saveDecisionSafe(input)`
- `toggleBookmark(id)`
- `deleteDecision(id)`
- `clearLibrary()`
- `searchAndFilterDecisions(options)`

---

## 6. Export Functions

Imported from `oracleExportService.ts`:
- `buildDecisionJsonSnapshot(target)`: Returns JSON object for a decision context.
- `exportDecisionAsJson(target)`: Triggers download of structured JSON snapshot.
- `generateDecisionReportHtml(target)`: Returns HTML string for preview.
- `exportDecisionAsHtmlReport(target)`: Triggers download of self-contained, XSS-escaped standalone HTML report.

---

## 7. Cryptographic Provenance Hash Contracts

The `OracleProvenanceInspector` and library systems rely on 5 generated hashes found in the `auditTrail`:
- `dnaComputationHash`
- `scenarioComputationHashes.baseCase`
- `scenarioComputationHashes.downsideStressCase`
- `scenarioComputationHashes.upsideCase`
- `unifiedPipelineComputationHash`

---

## 8. Mandatory Epistemic Banner

Any workspace or report view MUST include the epistemic boundary notice:

> *"Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct."*
