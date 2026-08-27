/**
 * ORACLE 2035 — Phase 5F Export Service
 * Provides canonical JSON serialization and human-readable HTML Decision Intelligence Reports.
 * Epistemic Invariants:
 * - Zero client recalculation
 * - Zero probabilistic/forecasting language
 * - Mandatory Epistemic Boundary Notice included
 * - Full SHA-256 cryptographic provenance preservation
 * - Strict escaping to prevent XSS injection
 */

import { SavedDecisionRecord } from "./oracleDecisionLibrary";
import {
  V2AnalyzeDecisionSuccessResponse,
  V2DecisionPayload,
} from "../types/v2";

export interface ExportTargetData {
  record?: SavedDecisionRecord;
  payload?: V2DecisionPayload | null;
  data: V2AnalyzeDecisionSuccessResponse["data"];
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * Builds the canonical structured JSON snapshot for export.
 */
export function buildDecisionJsonSnapshot(target: ExportTargetData): object {
  const { record, payload, data } = target;

  return {
    schemaVersion: "2.0.0",
    methodologyVersion: data.auditTrail.dnaMethodologyVersion || "2.0.0-LOCKED",
    exportedAt: new Date().toISOString(),
    recordMetadata: record
      ? {
          id: record.id,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          isBookmarked: record.isBookmarked,
          userNotes: record.userNotes || null,
          tags: record.tags || [],
        }
      : null,
    decisionContext: {
      statement:
        payload?.decision?.decisionStatement ||
        (payload as any)?.decisionContext?.decisionStatement ||
        record?.title ||
        data?.scenarios?.baseCase?.decisionReference,
      desiredOutcome:
        payload?.decision?.desiredOutcome ||
        (payload as any)?.decisionContext?.desiredOutcome ||
        data?.decisionDNA?.upsidePotential?.measurements?.userStatedTargetOutcome ||
        null,
      timeHorizon:
        payload?.decision?.timeHorizon ||
        (payload as any)?.decisionContext?.timeHorizon ||
        data?.scenarios?.baseCase?.timeHorizon ||
        "10_YEARS",
      category:
        payload?.decision?.decisionCategory ||
        (payload as any)?.decisionContext?.decisionCategory ||
        record?.category ||
        "GENERAL",
      currentSituation:
        payload?.decision?.currentSituation ||
        (payload as any)?.decisionContext?.currentSituation ||
        null,
    },
    decisionDNA: data.decisionDNA,
    scenarios: data.scenarios,
    dataSufficiency: data.dataSufficiency,
    auditTrail: data.auditTrail,
    explanation: data.explanation || null,
    explanationStatus: data.explanationStatus || "UNAVAILABLE",
    warnings: data.warnings || [],
  };
}

/**
 * Exports canonical decision JSON via browser download.
 */
export function exportDecisionAsJson(target: ExportTargetData): void {
  const snapshot = buildDecisionJsonSnapshot(target);
  const title =
    target.payload?.decision?.decisionStatement ||
    (target.payload as any)?.decisionContext?.decisionStatement ||
    target.record?.title ||
    "decision-analysis";
  const safeId = sanitizeFilename(title) || "analysis";
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `decision-${safeId}-${dateStr}.json`;

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  triggerBrowserDownload(blob, filename);
}

/**
 * Generates the complete, self-contained HTML Decision Intelligence Report.
 */
export function generateDecisionReportHtml(target: ExportTargetData): string {
  const { record, payload, data } = target;
  const dna = data.decisionDNA;
  const scenarios = data.scenarios;
  const audit = data.auditTrail;

  const statement =
    payload?.decision?.decisionStatement ||
    (payload as any)?.decisionContext?.decisionStatement ||
    record?.title ||
    scenarios.baseCase.decisionReference ||
    "Strategic Decision Analysis";

  const desiredOutcome =
    payload?.decision?.desiredOutcome ||
    (payload as any)?.decisionContext?.desiredOutcome ||
    dna.upsidePotential.measurements.userStatedTargetOutcome ||
    "Unspecified outcome";

  const timeHorizon =
    payload?.decision?.timeHorizon ||
    (payload as any)?.decisionContext?.timeHorizon ||
    scenarios.baseCase.timeHorizon ||
    "10_YEARS";

  const category =
    payload?.decision?.decisionCategory ||
    (payload as any)?.decisionContext?.decisionCategory ||
    record?.category ||
    "GENERAL";
  const evalDate = new Date(audit.serverEvaluatedAt || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null) return "Data Not Provided";
    return `$${val.toLocaleString()}`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ORACLE 2035 — Decision Report: ${escapeHtml(statement)}</title>
  <style>
    :root {
      --bg: #0A0C10;
      --card-bg: #11141A;
      --card-alt: #171B24;
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(56, 189, 248, 0.25);
      --text: #F1F5F9;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      --cyan: #38BDF8;
      --amber: #FBBF24;
      --emerald: #34D399;
      --rose: #FB7185;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: var(--bg);
    }
    .header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .wordmark {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text);
    }
    .submark {
      font-size: 11px;
      letter-spacing: 0.05em;
      color: var(--text-dim);
    }
    .meta-tag {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--cyan);
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid var(--border-accent);
      padding: 4px 10px;
      border-radius: 9999px;
    }
    .hero {
      margin-bottom: 40px;
    }
    .hero-title {
      font-size: 28px;
      font-weight: 300;
      color: var(--text);
      line-height: 1.3;
      margin-bottom: 16px;
      letter-spacing: -0.01em;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
    }
    .hero-prop label {
      display: block;
      font-size: 10px;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      margin-bottom: 4px;
    }
    .hero-prop span {
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
    }
    .section {
      margin-bottom: 40px;
    }
    .section-header {
      font-size: 12px;
      font-family: var(--font-mono);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    .dna-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
    .dna-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
    }
    .dna-card-title {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--text-dim);
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .dna-classification {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }
    .dna-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .scenario-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
    .scenario-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
    }
    .scenario-type {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--cyan);
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .scenario-headline {
      font-size: 14px;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 10px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 6px 0;
      border-top: 1px solid var(--border);
    }
    .stat-label { color: var(--text-dim); }
    .stat-value { font-family: var(--font-mono); color: var(--text); }
    .epistemic-box {
      background: rgba(56, 189, 248, 0.04);
      border: 1px solid var(--border-accent);
      border-radius: 10px;
      padding: 16px 20px;
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-top: 24px;
    }
    .epistemic-box strong {
      color: var(--cyan);
      font-weight: 600;
    }
    .provenance-table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-mono);
      font-size: 11px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }
    .provenance-table th, .provenance-table td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .provenance-table th {
      color: var(--text-dim);
      background: var(--card-alt);
      font-weight: 500;
    }
    .hash {
      color: #93C5FD;
      word-break: break-all;
    }
    .footer {
      border-top: 1px solid var(--border);
      padding-top: 24px;
      margin-top: 48px;
      font-size: 11px;
      color: var(--text-dim);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { background: #FFFFFF; color: #000000; padding: 0; }
      .container { max-width: 100%; }
      .dna-card, .scenario-card, .hero-grid, .provenance-table { border-color: #DDD; background: #FFF; color: #000; }
      .hero-title, .dna-classification, .scenario-headline { color: #000; }
      .dna-desc, .stat-label, .epistemic-box { color: #444; }
      .hash { color: #222; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div>
        <div class="wordmark">ORACLE 2035</div>
        <div class="submark">DETERMINISTIC DECISION INTELLIGENCE REPORT</div>
      </div>
      <div class="meta-tag">Methodology: 2.0.0-LOCKED</div>
    </header>

    <main>
      <!-- Hero Decision -->
      <section class="hero">
        <h1 class="hero-title">${escapeHtml(statement)}</h1>
        <div class="hero-grid">
          <div class="hero-prop">
            <label>Strategic Domain</label>
            <span>${escapeHtml(category)}</span>
          </div>
          <div class="hero-prop">
            <label>Target Outcome</label>
            <span>${escapeHtml(desiredOutcome)}</span>
          </div>
          <div class="hero-prop">
            <label>Decision Horizon</label>
            <span>${escapeHtml(timeHorizon.replace(/_/g, " "))}</span>
          </div>
          <div class="hero-prop">
            <label>Evaluated On</label>
            <span>${escapeHtml(evalDate)}</span>
          </div>
        </div>
      </section>

      <!-- Decision DNA Section -->
      <section class="section">
        <div class="section-header">Decision DNA Analysis</div>
        <div class="dna-grid">
          <div class="dna-card">
            <div class="dna-card-title">Financial Exposure</div>
            <div class="dna-classification">${escapeHtml(dna.financialExposure.classification.replace(/_/g, " "))}</div>
            <div class="dna-desc">
              Net Monthly Burn: ${formatCurrency(dna.financialExposure.measurements.monthlyBurn)}<br>
              Capital Coverage: ${dna.financialExposure.measurements.capitalCoverage !== undefined ? dna.financialExposure.measurements.capitalCoverage + 'x' : 'N/A'}<br>
              Financial Runway: ${dna.financialExposure.measurements.runwayMonths !== undefined ? dna.financialExposure.measurements.runwayMonths + ' months' : 'Surplus / Non-Burn'}
            </div>
          </div>

          <div class="dna-card">
            <div class="dna-card-title">Reversibility</div>
            <div class="dna-classification">${escapeHtml(dna.reversibility.classification.replace(/_/g, " "))}</div>
            <div class="dna-desc">
              Switching Effort: ${escapeHtml(dna.reversibility.measurements.switchingEffortLevel || 'MODERATE')}<br>
              Irreversible Commitments: ${dna.reversibility.measurements.irreversibleCommitmentCount}<br>
              Contractual Constraints: ${dna.reversibility.measurements.contractualConstraintCount}
            </div>
          </div>

          <div class="dna-card">
            <div class="dna-card-title">Resource Fit</div>
            <div class="dna-classification">${escapeHtml(dna.resourceFit.classification.replace(/_/g, " "))}</div>
            <div class="dna-desc">
              Weekly Allocation: ${dna.resourceFit.measurements.availableWeeklyHours || 0} hrs available<br>
              Relevant Skills: ${dna.resourceFit.measurements.relevantSkillsCount} documented
            </div>
          </div>

          <div class="dna-card">
            <div class="dna-card-title">Opportunity Cost</div>
            <div class="dna-classification">${escapeHtml(dna.opportunityCost.classification.replace(/_/g, " "))}</div>
            <div class="dna-desc">
              Opportunity Cost Type: ${escapeHtml(dna.opportunityCost.classification)}<br>
              Foregone Economic Value: ${dna.opportunityCost.measurements.foregoneIncomeOverHorizon !== undefined ? formatCurrency(dna.opportunityCost.measurements.foregoneIncomeOverHorizon) : 'Insufficient baseline data'}
            </div>
          </div>

          <div class="dna-card">
            <div class="dna-card-title">Upside Potential</div>
            <div class="dna-classification">${escapeHtml(dna.upsidePotential.classification.replace(/_/g, " "))}</div>
            <div class="dna-desc">
              Target Outcome: ${escapeHtml(dna.upsidePotential.measurements.userStatedTargetOutcome || 'Unspecified')}<br>
              Semantic Direction: ${escapeHtml(dna.upsidePotential.semanticDirection || 'NEUTRAL')}
            </div>
          </div>

          <div class="dna-card">
            <div class="dna-card-title">Evidence Confidence</div>
            <div class="dna-classification">${escapeHtml(dna.evidenceConfidence.classification.replace(/_/g, " "))}</div>
            <div class="dna-desc">
              Verified External Records: ${dna.evidenceConfidence.measurements.verifiedExternalCount}<br>
              User Reported Assertions: ${dna.evidenceConfidence.measurements.userProvidedCount}<br>
              Active Model Assumptions: ${dna.evidenceConfidence.measurements.totalAssumptionCount}
            </div>
          </div>
        </div>
      </section>

      <!-- Conditional Trajectories -->
      <section class="section">
        <div class="section-header">Conditional Trajectories</div>
        <div class="scenario-grid">
          <div class="scenario-card">
            <div class="scenario-type">Baseline Scenario</div>
            <div class="scenario-headline">${escapeHtml((scenarios.baseCase as any).description || scenarios.baseCase.scenarioType)}</div>
            <div class="stat-row">
              <span class="stat-label">Net Monthly Cash Flow</span>
              <span class="stat-value">${formatCurrency((scenarios.baseCase as any).calculations?.monthlyNetCashPosition || (scenarios.baseCase as any).financialProjections?.monthlyNetCashPosition)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Runway Duration</span>
              <span class="stat-value">${(scenarios.baseCase as any).calculations?.runwayMonths !== undefined ? (scenarios.baseCase as any).calculations.runwayMonths + ' mo' : 'Surplus'}</span>
            </div>
          </div>

          <div class="scenario-card">
            <div class="scenario-type">Favorable Scenario</div>
            <div class="scenario-headline">${escapeHtml((scenarios.upsideCase as any).description || scenarios.upsideCase.scenarioType)}</div>
            <div class="stat-row">
              <span class="stat-label">Net Monthly Cash Flow</span>
              <span class="stat-value">${formatCurrency((scenarios.upsideCase as any).calculations?.monthlyNetCashPosition || (scenarios.upsideCase as any).financialProjections?.monthlyNetCashPosition)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Post-Commitment Capital</span>
              <span class="stat-value">${formatCurrency((scenarios.upsideCase as any).calculations?.postCommitmentLiquidCapital || (scenarios.upsideCase as any).financialProjections?.accumulatedSurplusAtHorizon)}</span>
            </div>
          </div>

          <div class="scenario-card">
            <div class="scenario-type">Stress Scenario</div>
            <div class="scenario-headline">${escapeHtml((scenarios.downsideStressCase as any).description || scenarios.downsideStressCase.scenarioType)}</div>
            <div class="stat-row">
              <span class="stat-label">Net Monthly Burn</span>
              <span class="stat-value">${formatCurrency((scenarios.downsideStressCase as any).calculations?.monthlyBurn || (scenarios.downsideStressCase as any).financialProjections?.monthlyBurn)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Stressed Runway</span>
              <span class="stat-value">${(scenarios.downsideStressCase as any).calculations?.runwayMonths !== undefined ? (scenarios.downsideStressCase as any).calculations.runwayMonths + ' mo' : 'Zero Burn'}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Coverage & Epistemic Boundaries -->
      <section class="section">
        <div class="section-header">Data Completeness &amp; Epistemic Boundaries</div>
        <div class="dna-card" style="margin-bottom: 16px;">
          <div class="dna-card-title">Data Coverage Ratio</div>
          <div class="dna-classification">${Math.round(dna.dataCoverage.coverageRatio * 100)}% Data Completeness</div>
          <div class="dna-desc">
            Known Variables: ${dna.dataCoverage.knownVariableCount} of ${dna.dataCoverage.requiredVariableCount} required fields provided.
            ${(dna.dataCoverage.criticalUnknownVariables || []).length > 0 ? '<br>Critical Unknowns: ' + escapeHtml((dna.dataCoverage.criticalUnknownVariables || []).join(', ')) : ''}
          </div>
        </div>

        <div class="epistemic-box">
          <strong>Epistemic Boundary:</strong> Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct.
        </div>
      </section>

      <!-- Cryptographic Provenance -->
      <section class="section">
        <div class="section-header">Deterministic Audit Trail</div>
        <table class="provenance-table">
          <thead>
            <tr>
              <th>Computation Fingerprint</th>
              <th>SHA-256 Hash</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Decision DNA Hash</td>
              <td class="hash">${escapeHtml(audit.dnaComputationHash)}</td>
            </tr>
            <tr>
              <td>Base Case Scenario Hash</td>
              <td class="hash">${escapeHtml(audit.scenarioComputationHashes.baseCase)}</td>
            </tr>
            <tr>
              <td>Stress Case Scenario Hash</td>
              <td class="hash">${escapeHtml(audit.scenarioComputationHashes.downsideStressCase)}</td>
            </tr>
            <tr>
              <td>Favorable Case Scenario Hash</td>
              <td class="hash">${escapeHtml(audit.scenarioComputationHashes.upsideCase)}</td>
            </tr>
            <tr>
              <td>Unified Pipeline Hash</td>
              <td class="hash">${escapeHtml((audit as any).unifiedPipelineComputationHash || audit.dnaComputationHash)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

    <footer class="footer">
      <div>ORACLE 2035 · Deterministic Decision Intelligence</div>
      <div>Methodology Version: ${escapeHtml(audit.dnaMethodologyVersion || '2.0.0-LOCKED')}</div>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Exports human-readable HTML Decision Intelligence Report via browser download.
 */
export function exportDecisionAsHtmlReport(target: ExportTargetData): void {
  const html = generateDecisionReportHtml(target);
  const title =
    target.payload?.decision?.decisionStatement ||
    (target.payload as any)?.decisionContext?.decisionStatement ||
    target.record?.title ||
    "decision-report";
  const safeId = sanitizeFilename(title) || "report";
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `oracle-decision-report-${safeId}-${dateStr}.html`;

  const blob = new Blob([html], {
    type: "text/html;charset=utf-8",
  });

  triggerBrowserDownload(blob, filename);
}

/**
 * Utility helper to trigger browser download for a Blob.
 */
function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
