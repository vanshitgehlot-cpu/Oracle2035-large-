# ORACLE 2035 — System Architecture Specification

## 1. System Overview

ORACLE 2035 is structured into strict architectural layers with unidirectional dataflow:

```
[ CLIENT LAYER (SPA) ]
  ├── OracleIntakeFlow (6 Stages: Core, Financial, Resources, Reversibility, Opportunity, Review)
  ├── OracleAnalysisWorkspace (Decision DNA, Scenarios, Provenance, Future Self)
  ├── OracleWhatIfStudio (Pure local deterministic scenario recalculation)
  ├── OracleDecisionLibrary (Local persistence with defensive parsing & corrupted isolation)
  └── OracleExportService (Self-contained HTML reports & deterministic JSON snapshots)
           │
           │ HTTP POST (application/json) via v2ApiClient
           ▼
[ API GATEWAY LAYER (server.ts) ]
  ├── Defensive HTTP Headers (X-Content-Type-Options, Referrer-Policy, X-XSS-Protection)
  ├── Request ID Tracking (X-Request-Id header & structured logging)
  ├── Rate Limiting (In-memory per-instance 60 req/min per IP)
  ├── Payload Size Validation (2MB limit via express.json)
  ├── Schema Validation (decisionSchema.ts)
  └── Error Serialization (Standardized error taxonomy)
           │
           ▼
[ DETERMINISTIC COMPUTATION ENGINE (LOCKED) ]
  ├── decisionDNA.v2.ts (Calculates 6 DNA dimensions + coverage metrics)
  ├── scenarioEngine.v2.ts (Calculates baseCase, downsideStressCase, upsideCase trajectories)
  ├── unifiedDecisionEngine.ts (Coordinates pipeline & computes 5 SHA-256 hashes)
           │
           ▼
[ OPTIONAL AI SYNTHESIS LAYER ]
  └── explanationEngine.v2.ts (Strictly bounded Gemini narrative synthesis)
       ├── Fallback chain (3.7-flash -> flash-latest -> 3.1-flash-lite)
       ├── 8000ms global budget, 5000ms per-attempt timeout
       └── Returns explanationStatus: "AVAILABLE" | "UNAVAILABLE"
```

---

## 2. Locked Core Engines

The mathematical core consists of 5 locked files:
- `src/types/v2.ts`: Canonical type declarations, DataAvailability semantics, and API contracts.
- `src/validation/decisionSchema.ts`: Strict input validator and unauthorized computed field stripper.
- `src/services/decisionDNA.v2.ts`: Computes `financialExposure`, `reversibility`, `resourceFit`, `opportunityCost`, `upsidePotential`, and `evidenceConfidence`.
- `src/services/scenarioEngine.v2.ts`: Computes `baseCase`, `downsideStressCase`, and `upsideCase` trajectories with milestone projections.
- `src/services/unifiedDecisionEngine.ts`: Unifies calculations and generates 5 authoritative SHA-256 provenance hashes.

---

## 3. Epistemic Integrity

1. **ValueState / DataAvailability Preservation**:
   - `KNOWN`: Explicit numerical or textual input provided with high certainty.
   - `UNKNOWN`: Variable explicitly acknowledged as unknown; **never coerced to zero**.
   - `NOT_PROVIDED`: Field omitted by user; preserved explicitly without assumed defaults.
   - `ESTIMATED_BY_USER`: Value provided as a personal estimate; factored into confidence metrics.
   - `INSUFFICIENT_DATA`: Assigned when critical dimensions lack sufficient input.

2. **Prohibited Predictive Terminology**:
   ORACLE rejects probabilistic forecasting clichés (`Most Likely Future`, `Optimal Future`, `Chance of Success`, `Likelihood`, `Certain Outcome`, `Probability Rating`, `Confidence %`, `Expected Future`, `Guaranteed Future`, `Predicted Future`).
   Instead, scenarios are presented as **conditional trajectories** under explicit assumptions.

3. **Deterministic Core vs. Qualitative Explanations**:
   The `DETERMINISTIC CORE` operates fully synchronously without any AI input. The `OPTIONAL QUALITATIVE AI EXPLANATION` synthesized by the explanation engine acts strictly as narrative wrapper that reads the deterministic metrics. It NEVER dictates numerical results, hashes, or DNA classifications.

---

## 4. Cryptographic Provenance Model

Every analysis yields 5 authoritative SHA-256 hashes:
- `dnaComputationHash`: Digest of canonical Decision DNA inputs and measurements.
- `scenarioComputationHashes.baseCase`: Digest of base case scenario assumptions and milestones.
- `scenarioComputationHashes.downsideStressCase`: Digest of downside stress scenario assumptions and impacts.
- `scenarioComputationHashes.upsideCase`: Digest of upside scenario assumptions and potential.
- `unifiedPipelineComputationHash`: Combined authoritative digest of the full decision context.

These hashes are generated server-side and remain invariant throughout the decision lifecycle. They act as deterministic provenance fingerprints, proving the mathematical output matched the exact input structure without tampering. They DO NOT represent prediction accuracy or confidence in a given outcome.

> *"Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct."*
