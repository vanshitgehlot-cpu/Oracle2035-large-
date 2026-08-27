# ORACLE 2035 — Decision Intelligence & Scenario Simulation Engine

ORACLE 2035 is a deterministic decision intelligence system built on pure TypeScript mathematical foundations, rigorous epistemic boundaries, cryptographic provenance tracking, and bounded temporal modeling.

---

## Key Architectural Principles

1. **Pure Deterministic Computation**: All Decision DNA dimensions, scenario bounds, conditional trajectories, timeline milestones, and data coverage metrics are calculated deterministically on the server without probabilistic guessing or stochastic drift.
2. **Epistemic Invariance & Non-Coercion**: ORACLE strictly differentiates between `KNOWN`, `UNKNOWN`, `NOT_PROVIDED`, `ESTIMATED_BY_USER`, and `INSUFFICIENT_DATA`. Missing values are **never coerced to 0, $0, or false assumptions**.
3. **Cryptographic Provenance**: Every analysis produces 5 authoritative SHA-256 computation fingerprints (`dnaHash`, `scenarioBaseHash`, `scenarioDownsideHash`, `scenarioUpsideHash`, `unifiedPipelineHash`) that remain invariant across storage, bookmarking, note-taking, and export.
4. **Resilient & Optional AI Synthesis**: Gemini AI integration is strictly optional and bounded. If Gemini is offline, rate-limited, or unconfigured, the deterministic intelligence engine operates with 100% functionality and returns `explanationStatus: "UNAVAILABLE"`.
5. **Zero-Network Historical Snapshots**: Saved decision snapshots from the Decision Library open with zero network requests, zero server recalculation, and zero hash mutations.

---

## Repository Structure

```
├── server.ts                       # Production Express + Vite server entry point
├── Dockerfile                      # Production multi-stage container build
├── .dockerignore                   # Docker build context exclusions
├── metadata.json                   # AI Studio platform configuration
├── package.json                    # Dependencies and scripts
├── src/
│   ├── types/
│   │   └── v2.ts                   # LOCKED — Canonical V2 TypeScript interfaces & enums
│   ├── validation/
│   │   └── decisionSchema.ts       # LOCKED — Canonical payload schema validator
│   ├── services/
│   │   ├── decisionDNA.v2.ts       # LOCKED — Pure mathematical Decision DNA engine
│   │   ├── scenarioEngine.v2.ts    # LOCKED — Pure mathematical Scenario trajectory engine
│   │   ├── unifiedDecisionEngine.ts# LOCKED — Deterministic coordinator & hash pipeline
│   │   ├── explanationEngine.v2.ts # Bounded server-side Gemini explanation engine
│   │   ├── oracleDecisionLibrary.ts# Resilient local persistence & snapshot manager
│   │   ├── oracleExportService.ts  # HTML report & JSON snapshot export generator
│   │   └── v2ApiClient.ts          # Client-side API caller
│   ├── components/                 # Reference functional UI implementation
│   ├── App.tsx                     # Reference client application container
│   ├── main.tsx                    # Client entry point
│   └── index.css                   # Tailwind CSS styling & responsive tokens
├── tests/                          # 22+ comprehensive test suites (1000+ assertions)
└── docs/                           # Engineering & architecture specifications
    ├── ARCHITECTURE.md             # Detailed system architecture & dataflow
    ├── API.md                      # Canonical API contract specification
    ├── SECURITY.md                 # Security architecture & boundaries
    ├── DEPLOYMENT.md               # Container & Cloud Run deployment guide
    └── UI_HANDOFF.md               # Headless frontend handoff contract
```

---

## Canonical API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Container health probe (`status: "ok"`) |
| `/api/ready` | `GET` | Container readiness probe (`status: "ready"`) |
| `/api/v2/analyze-decision` | `POST` | Primary canonical decision analysis endpoint |
| `/api/analyze-decision` | `POST` | Canonical endpoint alias |
| `/api/v2/validate-decision` | `POST` | Pre-flight payload validation route |
| `/api/simulate` | `POST` | Legacy simulation adapter route |
| `/api/avatar-ask` | `POST` | Future Self query endpoint |
| `/api/chat-future-self` | `POST` | Future Self chat alias |

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Run type checking & linting
npm run lint

# Run all test suites
npm test

# Build production bundle
npm run build

# Start production server
npm start
```

---

## Environment Variables

Defined in `.env.example`:

- `GEMINI_API_KEY`: *(Optional)* API key for server-side AI explanations. Never exposed to the browser.
- `APP_URL`: *(Optional)* Hosted application URL for self-referential links.

---

## Epistemic Boundary Notice

> *"Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct."*
