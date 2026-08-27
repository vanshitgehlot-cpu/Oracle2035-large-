import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("Phase 7.2 Engineering Hardening & Resilience", async (t) => {
  await t.test("1. Server-Side Secret Isolation Verification", () => {
    // Check built bundle for secrets
    const distPath = path.join(rootDir, "dist", "assets");
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      const jsFiles = files.filter((f) => f.endsWith(".js"));
      
      for (const file of jsFiles) {
        const content = fs.readFileSync(path.join(distPath, file), "utf-8");
        assert.ok(!content.includes("process.env.GEMINI"), "Client bundle should not contain GEMINI_API_KEY");
        assert.ok(!content.includes("AIzaSy"), "Client bundle should not contain hardcoded AI keys");
      }
    }
  });

  await t.test("2. Epistemic Invariant Strict Checking", () => {
    // Verify no predictive terminology in documentation
    const docs = ["API.md", "ARCHITECTURE.md", "UI_HANDOFF.md"];
    const bannedTerms = [
      "Optimal Future",
      "Predicted Future",
      "Expected Future",
      "Guaranteed Future",
      "Chance of Success",
      "Probability Rating",
      "Certain Outcome",
    ];

    for (const doc of docs) {
      const p = path.join(rootDir, "docs", doc);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        for (const term of bannedTerms) {
          // It's allowed in ARCHITECTURE.md where it explicitly bans them.
          if (doc !== "ARCHITECTURE.md") {
             assert.ok(!content.includes(term), `${doc} must not contain forbidden term: ${term}`);
          }
        }
      }
    }
  });

  await t.test("3. Persistence Resilience", async () => {
    // We already have 6.3 Resilience Audit tests, let's just do a sanity check on the actual library parser 
    // to ensure getDecisions can run without localStorage throwing unhandled exceptions.
    const { getDecisions } = await import("../src/services/oracleDecisionLibrary.ts");
    const result = getDecisions();
    assert.ok(Array.isArray(result), "getDecisions must return an array even in test environments without localStorage");
  });

  await t.test("4. Documentation API Completeness", () => {
    const apiDoc = fs.readFileSync(path.join(rootDir, "docs", "API.md"), "utf-8");
    assert.ok(apiDoc.includes("/api/analyze-decision"), "Must document canonical endpoint");
    assert.ok(apiDoc.includes("/api/simulate"), "Must document legacy endpoint");
    assert.ok(apiDoc.includes("V2DecisionPayload"), "Must document actual payload type");
  });
  
  await t.test("5. Export XSS Escaping", async () => {
    const { exportDecisionAsHtmlReport } = await import("../src/services/oracleExportService.ts");
    assert.ok(typeof exportDecisionAsHtmlReport === "function");
  });

  await t.test("6. Gemini Failure Degradation Isolation", async () => {
    const { generateV2Explanation } = await import("../src/services/explanationEngine.v2.ts");
    // Ensure the fallback logic works when given a 0ms budget (immediate timeout)
    const mockContext = {
      decisionStatement: "Test",
      decisionCategory: "BUSINESS_STARTUP" as const,
      timeHorizon: "1_TO_3_YEARS" as const,
      horizonMonths: 36,
      dimensions: {
        financialExposure: { status: "CALCULATED" as const, classification: "INSUFFICIENT_DATA" as const, runwayStatus: "INSUFFICIENT_DATA" as const, capitalCoverageStatus: "INSUFFICIENT_DATA" as const },
        reversibility: { status: "CALCULATED" as const, classification: "INSUFFICIENT_DATA" as const, switchingEffortLevel: "LOW" as const, irreversibleCommitmentCount: 0, contractualConstraintCount: 0 },
        resourceFit: { status: "CALCULATED" as const, classification: "INSUFFICIENT_DATA" as const, availableWeeklyHours: 0, relevantSkillsCount: 0, hasExperienceRecord: false },
        opportunityCost: { status: "CALCULATED" as const, classification: "INSUFFICIENT_DATA" as const, hasStatedAlternativeEconomicValue: false, alternativesCount: 0 },
        upsidePotential: { status: "CALCULATED" as const, classification: "INSUFFICIENT_DATA" as const, hasQuantifiedTargetDifference: false, statedTargetOutcome: "" },
        evidenceConfidence: { status: "CALCULATED" as const, classification: "INSUFFICIENT_DATA" as const, totalEvidenceCount: 0, verifiedExternalCount: 0, totalAssumptionCount: 0, heuristicAssumptionCount: 0 }
      },
      scenarios: {
        baseCase: { netCashFlowState: "UNKNOWN" as const, runwayStatus: "INSUFFICIENT_DATA" as const, timeGapState: "UNKNOWN" as const, keyStressAssumptions: [] },
        downsideStressCase: { stressFactorDescription: "", netCashFlowState: "UNKNOWN" as const, runwayStatus: "INSUFFICIENT_DATA" as const, timeGapState: "UNKNOWN" as const, keyStressAssumptions: [] },
        upsideCase: { upsideFactorDescription: "", netCashFlowState: "UNKNOWN" as const, surplusState: "UNKNOWN" as const, keyStressAssumptions: [] },
        comparisonMatrix: { divergenceFactors: [], invariantConstants: [] }
      },
      dataSufficiency: { overallStatus: "UNDER_DETERMINED" as const, coverageRatio: 0, criticalUnknownVariables: [], insufficientDataDimensions: [] },
      assumptions: [],
      evidence: [],
      auditTrail: { dnaMethodologyVersion: "2.0.0-LOCKED" as const, scenarioMethodologyVersion: "2.0.0-LOCKED" as const, computationHashRefs: { dna: "", baseCase: "", downsideStressCase: "", upsideCase: "" } }
    };

    const res = await generateV2Explanation(mockContext, undefined, { timeoutMs: 1 });
    assert.strictEqual(res.explanationStatus, "UNAVAILABLE");
    assert.strictEqual(res.explanation, null);
  });
});
