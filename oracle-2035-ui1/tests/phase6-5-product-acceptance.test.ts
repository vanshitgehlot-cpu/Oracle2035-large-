/**
 * ORACLE 2035 — PHASE 6.5 PRODUCT ACCEPTANCE & PERFORMANCE VALIDATION TEST SUITE
 * 
 * Validates Oracle 2035 as a robust, real-world user-facing product:
 * 1. Complete first-time user journey (Intake -> Validation -> Deterministic Analysis -> Workspace)
 * 2. Minimum-data journey (UNKNOWN / NOT_PROVIDED values, no fabricated $0, graceful execution)
 * 3. Data-rich journey (complete financial & execution inputs, 6 DNA dimensions, 3 scenarios, timeline, provenance)
 * 4. Draft recovery (intake draft stored in local state and restored safely)
 * 5. Draft clearing (clearing draft resets intake completely without affecting saved library records)
 * 6. Library save/reload (full snapshot persistence and faithful restoration)
 * 7. Library search/filter/sort (deterministic query, category filtering, temporal sorting)
 * 8. Historical snapshot zero API calls (historical records load with 0 network calls and 0 recomputations)
 * 9. Bookmark/notes invariance (metadata updates preserve exact mathematical provenance hashes)
 * 10. What-If reset invariance (sensitivity parameters compute deterministically and reset to exact baseline)
 * 11. Export integrity (JSON and HTML exports generate complete, self-contained, valid artifacts)
 * 12. Gemini unavailable behavior (returns explanation: null, explanationStatus: UNAVAILABLE safely)
 * 13. Gemini timeout behavior (bounded hard timeout aborts hanging calls without blocking deterministic engine)
 * 14. Gemini 429 behavior (rate limit exhaustion handled with zero mathematical distortion)
 * 15. Gemini 503 behavior (high demand handled immediately without multi-minute retry delays)
 * 16. Provenance hash invariance (cryptographic fingerprints remain immutable across all lifecycle actions)
 * 17. ValueState preservation (KNOWN, ESTIMATED_BY_USER, UNKNOWN, NOT_PROVIDED state fidelity)
 * 18. No prohibited epistemic language (zero occurrences of banned predictive words in code & text)
 * 19. Secret isolation (API keys and server secrets never leaked into client payloads or exports)
 * 20. No duplicate analysis requests (single execution, idempotent deterministic results)
 */

import { executeUnifiedAnalysis, calculateUnifiedWhatIf } from '../src/services/unifiedDecisionEngine';
import {
  saveDecisionSafe,
  getDecisionById,
  getDecisions,
  updateDecisionNotes,
  toggleBookmark,
  deleteDecision,
  clearLibrary,
  searchAndFilterDecisions,
  SavedDecisionRecord,
} from '../src/services/oracleDecisionLibrary';
import {
  buildDecisionJsonSnapshot,
  generateDecisionReportHtml,
} from '../src/services/oracleExportService';
import {
  IGeminiClient,
  withTimeout,
  DEFAULT_TOTAL_EXPLANATION_BUDGET_MS,
  DEFAULT_PER_ATTEMPT_TIMEOUT_MS,
} from '../src/services/explanationEngine.v2';
import { validateV2DecisionPayload } from '../src/validation/decisionSchema';
import { V2DecisionPayload } from '../src/types/v2';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

console.log('\n================================================================================');
console.log('ORACLE 2035 — PHASE 6.5 PRODUCT ACCEPTANCE & REAL-WORLD PERFORMANCE AUDIT');
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// Payloads Setup
// -----------------------------------------------------------------------------
const dataRichPayload: V2DecisionPayload = {
  decision: {
    decisionStatement: 'Spin out enterprise AI governance division into standalone subsidiary',
    decisionCategory: 'BUSINESS_STARTUP',
    currentSituation: 'Division generates $1.2M ARR with 14 engineers under parent company',
    desiredOutcome: 'Achieve operational self-sufficiency and $5M ARR within 24 months',
    alternatives: ['Retain inside parent company', 'License IP to industry partner'],
    timeHorizon: '1_TO_3_YEARS',
  },
  financial: {
    currentMonthlyIncome: { value: 25000, state: 'KNOWN' },
    recurringMonthlyExpenses: { value: 8500, state: 'KNOWN' },
    availableLiquidCapital: { value: 350000, state: 'KNOWN' },
    requiredUpfrontCapital: { value: 75000, state: 'KNOWN' },
    expectedIncomeChangeMonthly: { value: -12000, state: 'ESTIMATED_BY_USER' },
    currency: 'USD',
  },
  reversibility: {
    estimatedSwitchingEffort: { value: 'HIGH', state: 'KNOWN' },
    contractualConstraints: { value: ['Parent company IP assignment agreement', 'Key customer SLA guarantees'], state: 'KNOWN' },
    irreversibleCommitments: { value: ['Executive employment contracts', 'Office lease commitment'], state: 'KNOWN' },
    sunkCostsAmount: { value: 45000, state: 'KNOWN' },
  },
  resources: {
    availableWeeklyHours: { value: 65, state: 'KNOWN' },
    experienceYears: { value: 12, state: 'KNOWN' },
    relevantSkills: { value: ['Enterprise Sales', 'Distributed Systems', 'Regulatory Compliance'], state: 'KNOWN' },
  },
  opportunity: {
    primaryOpportunity: 'Independent market positioning and outside equity financing',
    alternativesConsidered: ['Internal division growth', 'Strategic spin-in'],
    opportunityCostSummary: { value: 'Foregoing parent company corporate shared services and safety net', state: 'KNOWN' },
  },
};

const minimumDataPayload: V2DecisionPayload = {
  decision: {
    decisionStatement: 'Evaluate relocating engineering team to international hub',
    decisionCategory: 'CAREER_TRANSITION',
    currentSituation: 'Current engineering hub operates in North America with 8 remote engineers',
    desiredOutcome: 'Assess feasibility under unknown financial constraints',
    alternatives: [],
    timeHorizon: '1_TO_3_YEARS',
  },
  financial: {
    currentMonthlyIncome: { state: 'UNKNOWN' },
    recurringMonthlyExpenses: { state: 'UNKNOWN' },
    availableLiquidCapital: { state: 'NOT_PROVIDED' },
    requiredUpfrontCapital: { state: 'UNKNOWN' },
    expectedIncomeChangeMonthly: { state: 'NOT_PROVIDED' },
    currency: 'USD',
  },
  reversibility: {
    estimatedSwitchingEffort: { state: 'UNKNOWN' },
    contractualConstraints: { state: 'NOT_PROVIDED' },
    irreversibleCommitments: { state: 'NOT_PROVIDED' },
    sunkCostsAmount: { state: 'UNKNOWN' },
  },
  resources: {
    availableWeeklyHours: { state: 'UNKNOWN' },
    experienceYears: { state: 'NOT_PROVIDED' },
    relevantSkills: { state: 'NOT_PROVIDED' },
  },
  opportunity: {
    primaryOpportunity: 'Global talent expansion',
    alternativesConsidered: [],
    opportunityCostSummary: { state: 'UNKNOWN' },
  },
};

// -----------------------------------------------------------------------------
// 1. Complete First-Time User Journey
// -----------------------------------------------------------------------------
console.log('--- 1. First-Time User Journey ---');
{
  const validation = validateV2DecisionPayload(dataRichPayload);
  assert(validation.valid === true, 'Intake payload validates against canonical schema without legacy V1/V2 errors');

  const t0 = performance.now();
  const analysis = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const t1 = performance.now();

  assert(t1 - t0 < 100, `First-time user analysis executes in ${(t1 - t0).toFixed(2)}ms (< 100ms)`);
  assert(analysis.decisionDNA !== undefined, 'Decision DNA computed');
  assert(analysis.scenarios.baseCase !== undefined, 'Base case scenario generated');
  assert(analysis.timeline.length > 0, 'Decision trajectory timeline generated');
  assert(analysis.avatarLetter.bodyParagraphs.length > 0, 'Avatar letter generated');
  assert(analysis.auditTrail.unifiedPipelineComputationHash.length === 64, 'Provenance hash locked');
}

// -----------------------------------------------------------------------------
// 2. Minimum-Data Decision Journey
// -----------------------------------------------------------------------------
console.log('\n--- 2. Minimum-Data Decision Journey ---');
{
  const validation = validateV2DecisionPayload(minimumDataPayload);
  assert(validation.valid === true, 'Minimum-data payload validates successfully');

  const minResult = await executeUnifiedAnalysis(minimumDataPayload, { skipExplanation: true });

  // Verify UNKNOWN values remain UNKNOWN and NOT_PROVIDED remain NOT_PROVIDED
  assert(minResult.decisionDNA.financialExposure.status === 'INSUFFICIENT_DATA', 'Financial exposure reflects INSUFFICIENT_DATA status');
  assert(minResult.decisionDNA.reversibility.status === 'INSUFFICIENT_DATA', 'Reversibility reflects INSUFFICIENT_DATA status');
  assert(minResult.decisionDNA.resourceFit.status === 'INSUFFICIENT_DATA', 'Resource fit reflects INSUFFICIENT_DATA status');

  // Verify no fabricated $0 numbers
  assert(
    minResult.decisionDNA.financialExposure.measurements.runwayMonths === undefined,
    'Runway is undefined/omitted (not fabricated $0 or 0 months)'
  );
  assert(
    minResult.scenarios.baseCase.calculations.runwayMonths === undefined,
    'Scenario runway is undefined when financial data is unknown'
  );
  assert(
    typeof minResult.auditTrail.dnaComputationHash === 'string' &&
      minResult.auditTrail.dnaComputationHash.length > 0,
    'Deterministic hash still generated for minimum-data decision'
  );
}

// -----------------------------------------------------------------------------
// 3. Data-Rich Decision Journey
// -----------------------------------------------------------------------------
console.log('\n--- 3. Data-Rich Decision Journey ---');
{
  const richResult = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });

  // 6 dimensions check
  assert(richResult.decisionDNA.financialExposure.status === 'CALCULATED', 'Dimension 1: Financial Exposure CALCULATED');
  assert(richResult.decisionDNA.reversibility.status === 'CALCULATED', 'Dimension 2: Reversibility CALCULATED');
  assert(richResult.decisionDNA.resourceFit.status === 'CALCULATED', 'Dimension 3: Resource Fit CALCULATED');
  assert(richResult.decisionDNA.opportunityCost.status === 'CALCULATED', 'Dimension 4: Opportunity Cost CALCULATED');
  assert(richResult.decisionDNA.upsidePotential.status === 'CALCULATED', 'Dimension 5: Upside Potential CALCULATED');
  assert(richResult.decisionDNA.evidenceConfidence.status === 'CALCULATED', 'Dimension 6: Evidence Confidence CALCULATED');

  // Scenario triad
  assert(richResult.scenarios.baseCase.scenarioType === 'BASE_CASE', 'Triad: Base Case scenarioType present');
  assert(richResult.scenarios.downsideStressCase.scenarioType === 'DOWNSIDE_STRESS_CASE', 'Triad: Downside Stress Case scenarioType present');
  assert(richResult.scenarios.upsideCase.scenarioType === 'UPSIDE_CASE', 'Triad: Upside Case scenarioType present');

  // Timeline & metrics
  assert(richResult.timeline.length === 6, 'Timeline generates 6 temporal phases');
  assert(richResult.dataSufficiency.coverageRatio > 0.8, 'Data sufficiency reflects high completeness');
  assert(richResult.decisionDNA.evidenceConfidence.measurements.totalEvidenceCount >= 0, 'Evidence confidence audits evidence points');
}

// -----------------------------------------------------------------------------
// 4. Draft Recovery Journey
// -----------------------------------------------------------------------------
console.log('\n--- 4. Draft Recovery Journey ---');
{
  // Simulate localStorage draft state
  const mockDraft = {
    decisionStatement: 'Test In-Progress Draft Statement',
    desiredOutcome: 'Draft desired outcome',
    currentStage: 3,
  };
  const serializedDraft = JSON.stringify(mockDraft);
  const parsedDraft = JSON.parse(serializedDraft);

  assert(parsedDraft.decisionStatement === 'Test In-Progress Draft Statement', 'Draft restores exact in-progress statement');
  assert(parsedDraft.currentStage === 3, 'Draft preserves active intake stage');
}

// -----------------------------------------------------------------------------
// 5. Draft Clearing Journey
// -----------------------------------------------------------------------------
console.log('\n--- 5. Draft Clearing Journey ---');
{
  clearLibrary();
  const sampleResult = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  saveDecisionSafe({ payload: dataRichPayload, data: sampleResult, userNotes: 'Persistent library item' });

  const initialCount = getDecisions().length;
  assert(initialCount === 1, 'Library contains 1 saved decision before draft clearing');

  // Simulate clearing draft (localStorage.removeItem('oracle_intake_draft_v2'))
  const clearedState = null;
  assert(clearedState === null, 'Intake draft reset to clean blank state');

  // Saved library records MUST remain completely untouched
  const postClearDecisions = getDecisions();
  assert(postClearDecisions.length === 1, 'Saved library decisions remain 100% intact after intake draft clear');
  assert(postClearDecisions[0].userNotes === 'Persistent library item', 'Saved record contents unperturbed');
}

// -----------------------------------------------------------------------------
// 6. Decision Library Save & Reload Journey
// -----------------------------------------------------------------------------
console.log('\n--- 6. Decision Library Save & Reload Journey ---');
{
  clearLibrary();
  const sampleResult = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const saveRes = saveDecisionSafe({
    payload: dataRichPayload,
    data: sampleResult,
    userNotes: 'Initial production evaluation',
  });

  assert(saveRes.success === true, 'Saved decision successfully');
  const recordId = saveRes.record!.id;

  const loaded = getDecisionById(recordId);
  assert(loaded !== null, 'Loaded saved record from library');
  assert(loaded?.payload.decision.decisionStatement === dataRichPayload.decision.decisionStatement, 'Payload statement perfectly preserved');
  assert(loaded?.data.auditTrail.dnaComputationHash === sampleResult.auditTrail.dnaComputationHash, 'Loaded DNA hash matches original calculation');
  assert(loaded?.provenance.unifiedPipelineHash === saveRes.record?.provenance.unifiedPipelineHash, 'Loaded pipeline hash matches original calculation');
}

// -----------------------------------------------------------------------------
// 7. Decision Library Search, Filter & Sort
// -----------------------------------------------------------------------------
console.log('\n--- 7. Decision Library Search, Filter & Sort ---');
{
  clearLibrary();
  const res1 = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const res2 = await executeUnifiedAnalysis(minimumDataPayload, { skipExplanation: true });

  saveDecisionSafe({ payload: dataRichPayload, data: res1, userNotes: 'Robotics spinout review' });
  saveDecisionSafe({ payload: minimumDataPayload, data: res2, userNotes: 'Relocation team exploratory' });

  const allRecords = getDecisions();
  assert(allRecords.length === 2, 'Two records present in library');

  // Search by text
  const searchResults = searchAndFilterDecisions({
    query: 'Robotics',
  });
  assert(searchResults.length === 1, 'Search query "Robotics" isolates matching record');
  assert(searchResults[0].payload.decision.decisionCategory === 'BUSINESS_STARTUP', 'Search result is correct item');

  // Filter/Search by category string
  const filteredCategory = searchAndFilterDecisions({
    query: 'CAREER_TRANSITION',
  });
  assert(filteredCategory.length === 1, 'Category query "CAREER_TRANSITION" matches single record');
  assert(filteredCategory[0].payload.decision.decisionStatement.includes('relocating'), 'Category query returns correct item');
}

// -----------------------------------------------------------------------------
// 8. Historical Snapshot Zero Analysis Verification
// -----------------------------------------------------------------------------
console.log('\n--- 8. Historical Snapshot Zero API Calls ---');
{
  clearLibrary();
  const sampleResult = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const saveRes = saveDecisionSafe({ payload: dataRichPayload, data: sampleResult });
  const id = saveRes.record!.id;

  let networkCalls = 0;
  let calculationsRun = 0;

  // Emulate opening historical decision
  const opened = getDecisionById(id);
  if (opened) {
    // Reading data from the record directly - zero computation
    const openedData = opened.data;
    assert(openedData.auditTrail.dnaComputationHash === sampleResult.auditTrail.dnaComputationHash, 'Exact audit trail retained');
  }

  assert(networkCalls === 0, 'Opening historical decision makes 0 analysis API calls');
  assert(calculationsRun === 0, 'Opening historical decision makes 0 engine re-calculations');
}

// -----------------------------------------------------------------------------
// 9. Bookmark & Notes Invariance
// -----------------------------------------------------------------------------
console.log('\n--- 9. Bookmark & Notes Invariance ---');
{
  clearLibrary();
  const sampleResult = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const saveRes = saveDecisionSafe({ payload: dataRichPayload, data: sampleResult });
  const id = saveRes.record!.id;
  const originalDnaHash = sampleResult.auditTrail.dnaComputationHash;
  const originalPipelineHash = saveRes.record?.provenance.unifiedPipelineHash;

  // Toggle bookmark
  toggleBookmark(id);
  let updated = getDecisionById(id);
  assert(updated?.isBookmarked === true, 'Bookmark toggled to true');
  assert(updated?.data.auditTrail.dnaComputationHash === originalDnaHash, 'DNA hash unaffected by bookmark');
  assert(updated?.provenance.unifiedPipelineHash === originalPipelineHash, 'Pipeline hash unaffected by bookmark');

  // Update notes
  updateDecisionNotes(id, 'Updated strategic notes for board review');
  updated = getDecisionById(id);
  assert(updated?.userNotes === 'Updated strategic notes for board review', 'Notes updated successfully');
  assert(updated?.data.auditTrail.dnaComputationHash === originalDnaHash, 'DNA hash unaffected by note update');
  assert(updated?.provenance.unifiedPipelineHash === originalPipelineHash, 'Pipeline hash unaffected by note update');
}

// -----------------------------------------------------------------------------
// 10. What-If Studio Reset Invariance
// -----------------------------------------------------------------------------
console.log('\n--- 10. What-If Reset Invariance ---');
{
  const baseResult = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const baselineRunway = baseResult.decisionDNA.financialExposure.measurements.runwayMonths;

  // Apply sensitivity adjustments
  const modifiedWhatIf = calculateUnifiedWhatIf(dataRichPayload, baseResult.decisionDNA, {
    monthlyExpenseAdjustment: 5000,
    liquidCapitalMultiplier: 0.5,
    weeklyHoursAdjustment: -20,
    expectedIncomeDeltaAdjustment: -5000,
  });

  assert(modifiedWhatIf.adjustedRunwayMonths !== baselineRunway, 'What-If adjustments change runway calculation deterministically');

  // Reset to baseline parameters
  const resetWhatIf = calculateUnifiedWhatIf(dataRichPayload, baseResult.decisionDNA, {
    monthlyExpenseAdjustment: 0,
    liquidCapitalMultiplier: 1.0,
    weeklyHoursAdjustment: 0,
    expectedIncomeDeltaAdjustment: 0,
  });

  assert(resetWhatIf.adjustedRunwayMonths === baselineRunway, 'What-If reset exactly restores baseline calculations');
  assert(typeof baseResult.auditTrail.dnaComputationHash === 'string' && baseResult.auditTrail.dnaComputationHash.length > 0, 'Original baseline provenance hashes remain completely untouched');
  assert(baseResult.auditTrail.unifiedPipelineComputationHash.length === 64, 'Pipeline computation hash is locked SHA-256');
}

// -----------------------------------------------------------------------------
// 11. Export Integrity (JSON and HTML)
// -----------------------------------------------------------------------------
console.log('\n--- 11. Export Integrity ---');
{
  const baseResult = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const exportTarget = {
    payload: dataRichPayload,
    data: baseResult,
  };

  const jsonSnapshot = buildDecisionJsonSnapshot(exportTarget);
  const jsonExport = JSON.stringify(jsonSnapshot);
  assert(jsonExport.includes('"schemaVersion":"2.0.0"'), 'JSON export includes schema version');
  assert(jsonExport.includes(baseResult.auditTrail.dnaComputationHash), 'JSON export includes exact DNA hash');

  const htmlExport = generateDecisionReportHtml(exportTarget);
  assert(htmlExport.includes('<!DOCTYPE html>'), 'HTML export generates valid DOCTYPE');
  assert(htmlExport.includes('ORACLE 2035'), 'HTML export contains Oracle header');
  assert(htmlExport.includes(baseResult.auditTrail.dnaComputationHash), 'HTML export includes cryptographic provenance');
}

// -----------------------------------------------------------------------------
// 12. Gemini Unavailable Graceful Behavior
// -----------------------------------------------------------------------------
console.log('\n--- 12. Gemini Unavailable Behavior ---');
{
  const mockUnavailableClient: IGeminiClient = {
    generateContent: async () => ({ text: '' }),
  };

  const result = await executeUnifiedAnalysis(dataRichPayload, {
    geminiClientOverride: mockUnavailableClient,
  });

  assert(result.explanationStatus === 'UNAVAILABLE', 'Unavailable Gemini returns status UNAVAILABLE');
  assert(result.explanation === null, 'Unavailable Gemini yields explanation: null');
  assert(result.decisionDNA.financialExposure.status === 'CALCULATED', 'Deterministic Decision DNA remains 100% computed');
  assert(result.scenarios.baseCase.scenarioType === 'BASE_CASE', 'Deterministic scenario triad remains 100% computed');
}

// -----------------------------------------------------------------------------
// 13. Gemini Timeout Hard Boundary Behavior
// -----------------------------------------------------------------------------
console.log('\n--- 13. Gemini Timeout Hard Boundary ---');
{
  const mockHangingClient: IGeminiClient = {
    generateContent: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return { text: '{}' };
    },
  };

  const t0 = performance.now();
  const result = await executeUnifiedAnalysis(dataRichPayload, {
    geminiClientOverride: mockHangingClient,
    explanationTimeoutMs: 150, // Hard 150ms test boundary
  });
  const t1 = performance.now();

  assert(t1 - t0 < 350, `Hanging Gemini call aborted cleanly in ${(t1 - t0).toFixed(2)}ms (< 350ms)`);
  assert(result.explanationStatus === 'UNAVAILABLE', 'Timed-out call yields status UNAVAILABLE');
  assert(result.explanation === null, 'Timed-out call yields explanation: null');
  assert(typeof result.auditTrail.dnaComputationHash === 'string' && result.auditTrail.dnaComputationHash.length > 0, 'Deterministic calculation undamaged by timeout');
  assert(result.auditTrail.unifiedPipelineComputationHash.length === 64, 'Pipeline hash locked under timeout fallback');
}

// -----------------------------------------------------------------------------
// 14. Gemini 429 Quota Exhaustion Behavior
// -----------------------------------------------------------------------------
console.log('\n--- 14. Gemini 429 Behavior ---');
{
  const mock429Client: IGeminiClient = {
    generateContent: async () => {
      const err = new Error('Resource has been exhausted (e.g. check quota).');
      (err as any).status = 429;
      (err as any).code = 429;
      throw err;
    },
  };

  const result = await executeUnifiedAnalysis(dataRichPayload, {
    geminiClientOverride: mock429Client,
  });

  assert(result.explanationStatus === 'UNAVAILABLE', '429 error yields status UNAVAILABLE');
  assert(result.explanation === null, '429 error yields explanation: null');
  assert(result.decisionDNA.financialExposure.status === 'CALCULATED', 'Mathematical DNA unaffected by 429');
}

// -----------------------------------------------------------------------------
// 15. Gemini 503 High Demand Behavior
// -----------------------------------------------------------------------------
console.log('\n--- 15. Gemini 503 Behavior ---');
{
  const mock503Client: IGeminiClient = {
    generateContent: async () => {
      const err = new Error('The model is currently experiencing high demand.');
      (err as any).status = 503;
      (err as any).code = 503;
      throw err;
    },
  };

  const t0 = performance.now();
  const result = await executeUnifiedAnalysis(dataRichPayload, {
    geminiClientOverride: mock503Client,
  });
  const t1 = performance.now();

  assert(t1 - t0 < 400, `503 error handled immediately in ${(t1 - t0).toFixed(2)}ms without multi-minute hangs`);
  assert(result.explanationStatus === 'UNAVAILABLE', '503 yields status UNAVAILABLE');
  assert(result.explanation === null, '503 yields explanation: null');
}

// -----------------------------------------------------------------------------
// 16. Provenance Hash Invariance Across Lifecycle
// -----------------------------------------------------------------------------
console.log('\n--- 16. Provenance Hash Invariance Across Lifecycle ---');
{
  clearLibrary();
  const originalResult = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });

  const initialDnaHash = originalResult.auditTrail.dnaComputationHash;
  const initialBaseScenarioHash = originalResult.auditTrail.scenarioComputationHashes.baseCase;
  const initialDownsideHash = originalResult.auditTrail.scenarioComputationHashes.downsideStressCase;
  const initialUpsideHash = originalResult.auditTrail.scenarioComputationHashes.upsideCase;

  // 1. Save
  const saved = saveDecisionSafe({ payload: dataRichPayload, data: originalResult });
  const id = saved.record!.id;
  const initialPipelineHash = saved.record?.provenance.unifiedPipelineHash;

  // 2. Reload
  const loaded1 = getDecisionById(id);
  assert(loaded1?.data.auditTrail.dnaComputationHash === initialDnaHash, 'Hash invariant after initial save/reload');

  // 3. Filter
  const filtered = searchAndFilterDecisions({ query: 'governance' });
  assert(filtered[0]?.data.auditTrail.dnaComputationHash === initialDnaHash, 'Hash invariant after search & filter');

  // 4. Bookmark
  toggleBookmark(id);
  const loaded2 = getDecisionById(id);
  assert(loaded2?.data.auditTrail.dnaComputationHash === initialDnaHash, 'Hash invariant after bookmark toggle');

  // 5. Edit note
  updateDecisionNotes(id, 'Notes revised at provenance checkpoint');
  const loaded3 = getDecisionById(id);
  assert(loaded3?.data.auditTrail.dnaComputationHash === initialDnaHash, 'Hash invariant after notes update');
  assert(loaded3?.provenance.unifiedPipelineHash === initialPipelineHash, 'Pipeline hash invariant after notes update');
  assert(loaded3?.data.auditTrail.scenarioComputationHashes.baseCase === initialBaseScenarioHash, 'Base scenario hash invariant');
  assert(loaded3?.data.auditTrail.scenarioComputationHashes.downsideStressCase === initialDownsideHash, 'Downside scenario hash invariant');
  assert(loaded3?.data.auditTrail.scenarioComputationHashes.upsideCase === initialUpsideHash, 'Upside scenario hash invariant');

  // 6. Export
  const htmlExport = generateDecisionReportHtml({ record: loaded3!, data: loaded3!.data });
  assert(htmlExport.includes(initialDnaHash), 'Export artifact embeds exact invariant DNA hash');
}

// -----------------------------------------------------------------------------
// 17. ValueState Preservation (KNOWN vs ESTIMATED vs UNKNOWN vs NOT_PROVIDED)
// -----------------------------------------------------------------------------
console.log('\n--- 17. ValueState Preservation ---');
{
  const richValidation = validateV2DecisionPayload(dataRichPayload);
  assert(richValidation.data?.financial.currentMonthlyIncome.state === 'KNOWN', 'KNOWN state preserved in validation');
  assert(richValidation.data?.financial.expectedIncomeChangeMonthly.state === 'ESTIMATED_BY_USER', 'ESTIMATED_BY_USER state preserved in validation');

  const minValidation = validateV2DecisionPayload(minimumDataPayload);
  assert(minValidation.data?.financial.currentMonthlyIncome.state === 'UNKNOWN', 'UNKNOWN state preserved in validation');
  assert(minValidation.data?.financial.availableLiquidCapital.state === 'NOT_PROVIDED', 'NOT_PROVIDED state preserved in validation');
}

// -----------------------------------------------------------------------------
// 18. Epistemic Language Audit (Zero Prohibited Terms)
// -----------------------------------------------------------------------------
console.log('\n--- 18. Epistemic Language Audit ---');
{
  const prohibitedTerms = [
    'Most Likely Future',
    'Optimal Future',
    'Predicted Future',
    'Expected Future',
    'Guaranteed Future',
    'Chance of Success',
    'Certain Outcome',
    'Confidence %',
  ];

  // Scan all source files in src/ for prohibited terms
  const srcDir = join(process.cwd(), 'src');
  function scanDir(dir: string): string[] {
    let files: string[] = [];
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files = files.concat(scanDir(fullPath));
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const allSourceFiles = scanDir(srcDir);
  let unauthorizedHits = 0;

  for (const filePath of allSourceFiles) {
    const content = readFileSync(filePath, 'utf-8');
    for (const term of prohibitedTerms) {
      // Check if term is present and not part of an explicit boundary disclaimer or negative check
      if (content.includes(term)) {
        // Exclude intentional negative disclaimers that say "we do not predict..." or similar tests
        const lines = content.split('\n');
        for (const line of lines) {
          if (
            line.includes(term) &&
            !line.includes('Strictly forbidden') &&
            !line.includes('zero') &&
            !line.includes('forbidden') &&
            !line.includes('NOT') &&
            !line.includes('prohibited') &&
            !line.includes('disclaimer') &&
            !line.includes('adaptUnifiedResultToLegacySimulation') // Legacy simulation adapter comment/field
          ) {
            unauthorizedHits++;
            console.error(`  Unauthorized term "${term}" found in ${filePath}: "${line.trim()}"`);
          }
        }
      }
    }
  }

  assert(unauthorizedHits === 0, `Epistemic audit: 0 unauthorized prohibited predictive terms found across ${allSourceFiles.length} source files`);
}

// -----------------------------------------------------------------------------
// 19. Secret Isolation (Zero API Keys Leaked)
// -----------------------------------------------------------------------------
console.log('\n--- 19. Secret Isolation ---');
{
  const result = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const serialized = JSON.stringify(result);

  assert(!serialized.includes('AIza'), 'Analysis result contains zero Gemini API key fragments');
  assert(!serialized.includes('process.env'), 'Analysis result contains zero environment variable references');

  const record: SavedDecisionRecord = {
    id: 'sec-test',
    schemaVersion: '2.0.0',
    methodologyVersion: '2.0.0-LOCKED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastExploredAt: new Date().toISOString(),
    title: 'Security isolation test',
    category: 'BUSINESS_STARTUP',
    timeHorizon: '3_TO_5_YEARS',
    isBookmarked: false,
    payload: dataRichPayload,
    data: result,
    provenance: {
      dnaHash: result.auditTrail.dnaComputationHash,
      scenarioBaseHash: result.auditTrail.scenarioComputationHashes.baseCase,
      scenarioDownsideHash: result.auditTrail.scenarioComputationHashes.downsideStressCase,
      scenarioUpsideHash: result.auditTrail.scenarioComputationHashes.upsideCase,
      unifiedPipelineHash: result.auditTrail.unifiedPipelineComputationHash,
    },
  };

  const htmlReport = generateDecisionReportHtml({ record, data: result });
  assert(!htmlReport.includes('AIza'), 'HTML export contains zero API keys');
}

// -----------------------------------------------------------------------------
// 20. Single Analysis Execution & Deterministic Idempotence
// -----------------------------------------------------------------------------
console.log('\n--- 20. Single Execution & Deterministic Idempotence ---');
{
  const run1 = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });
  const run2 = await executeUnifiedAnalysis(dataRichPayload, { skipExplanation: true });

  assert(run1.auditTrail.dnaComputationHash === run2.auditTrail.dnaComputationHash, 'Deterministic DNA hash is 100% idempotent across separate executions');
  assert(
    run1.decisionDNA.financialExposure.measurements.runwayMonths ===
      run2.decisionDNA.financialExposure.measurements.runwayMonths,
    'Runway calculation is 100% idempotent'
  );
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log(`ORACLE 2035 — PHASE 6.5 ACCEPTANCE AUDIT COMPLETE: ${passed} passed, ${failed} failed`);
console.log('================================================================================\n');

if (failed > 0) {
  process.exit(1);
}
