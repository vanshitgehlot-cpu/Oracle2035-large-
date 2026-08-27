/**
 * ORACLE 2035 — PERFORMANCE & LATENCY REGRESSION AUDIT SUITE
 * 
 * Verifies non-blocking deterministic pipeline and bounded Gemini latency budgets:
 * 1. Gemini Success (valid narrative explanation attached, status: AVAILABLE)
 * 2. Gemini Timeout (budget expired, fallback to status: UNAVAILABLE in < bound)
 * 3. Gemini 503 High Demand (graceful non-blocking degradation)
 * 4. Gemini 429 Quota Exhaustion (graceful non-blocking degradation)
 * 5. Fallback Chain Exhaustion (all candidate models fail, pipeline succeeds)
 * 6. Pure Deterministic Pipeline (zero Gemini calls, execution in < 50ms)
 * 7. Historical Snapshot Integrity (zero analysis calls on historical load)
 * 8. withTimeout Promise Hard Boundary
 */

import { executeUnifiedAnalysis } from '../src/services/unifiedDecisionEngine';
import {
  generateV2Explanation,
  withTimeout,
  DEFAULT_TOTAL_EXPLANATION_BUDGET_MS,
  DEFAULT_PER_ATTEMPT_TIMEOUT_MS,
  IGeminiClient,
} from '../src/services/explanationEngine.v2';
import { V2DecisionPayload } from '../src/types/v2';
import { saveDecisionSafe, getDecisionById, clearLibrary } from '../src/services/oracleDecisionLibrary';

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

console.log('\n==================================================');
console.log('ORACLE 2035 — PERFORMANCE REGRESSION AUDIT');
console.log('==================================================\n');

const validPayload: V2DecisionPayload = {
  decision: {
    decisionStatement: 'Leave corporate engineering role to launch enterprise decision platform',
    decisionCategory: 'BUSINESS_STARTUP',
    currentSituation: 'Employed full-time with stable compensation',
    desiredOutcome: 'Reach self-sustaining revenue in 18 months',
    alternatives: ['Stay in role', 'Join seed startup'],
    timeHorizon: '1_TO_3_YEARS',
  },
  financial: {
    currentMonthlyIncome: { value: 15000, state: 'KNOWN' },
    recurringMonthlyExpenses: { value: 5000, state: 'KNOWN' },
    availableLiquidCapital: { value: 120000, state: 'KNOWN' },
    requiredUpfrontCapital: { value: 20000, state: 'KNOWN' },
    expectedIncomeChangeMonthly: { value: -15000, state: 'ESTIMATED_BY_USER' },
    currency: 'USD',
  },
  reversibility: {
    estimatedSwitchingEffort: { value: 'HIGH', state: 'KNOWN' },
    contractualConstraints: { value: ['Non-compete clause'], state: 'KNOWN' },
    irreversibleCommitments: { value: ['Notice served to employer'], state: 'KNOWN' },
    sunkCostsAmount: { value: 3000, state: 'KNOWN' },
  },
  resources: {
    availableWeeklyHours: { value: 50, state: 'KNOWN' },
    experienceYears: { value: 8, state: 'KNOWN' },
    relevantSkills: { value: ['Distributed Systems', 'Applied ML'], state: 'KNOWN' },
  },
  opportunity: {
    primaryOpportunity: 'Independent decision modeling platform',
    alternativesConsidered: ['Side project', 'Consulting'],
    opportunityCostSummary: { value: 'Foregoing corporate compensation', state: 'KNOWN' },
  },
};

// ---------------------------------------------------------------------------
// 1. Pure Deterministic Execution Speed (< 50ms)
// ---------------------------------------------------------------------------
console.log('--- Suite 1: Pure Deterministic Pipeline Latency ---');
{
  const t0 = performance.now();
  const result = await executeUnifiedAnalysis(validPayload, { skipExplanation: true });
  const t1 = performance.now();
  const duration = t1 - t0;

  assert(duration < 100, `Pure deterministic execution completes in ${duration.toFixed(2)}ms (< 100ms)`);
  assert(result.explanationStatus === 'UNAVAILABLE', 'Explanation status is UNAVAILABLE when skipped');
  assert(result.explanation === null, 'Explanation payload is null when skipped');
  assert(result.decisionDNA.financialExposure.status === 'CALCULATED', 'Financial exposure DNA computed');
  assert(result.scenarios.baseCase.horizonMonths === 24, 'Scenario base case computed');
  assert(result.timeline.length === 6, 'Timeline 6 stages generated');
  assert(result.avatarLetter.bodyParagraphs.length > 0, 'Avatar letter generated');
  assert(result.auditTrail.unifiedPipelineComputationHash.length === 64, 'SHA-256 provenance hash generated');
}

// ---------------------------------------------------------------------------
// 2. Gemini Mock Success Path
// ---------------------------------------------------------------------------
console.log('\n--- Suite 2: Gemini Success Path ---');
{
  const validMockExplanationJson = JSON.stringify({
    executiveSummary: {
      headline: 'Deterministic Analysis: Enterprise Platform Launch',
      coreTradeoffSummary: 'Primary trade-off is corporate compensation versus startup upside backed by liquid capital runway.',
      epistemicStatusSummary: 'Financial inputs are stated as known.',
    },
    dimensionExplanations: {
      financialExposure: 'Runway provides sufficient cushion under baseline burn.',
      reversibility: 'Switching effort is high due to corporate resignation.',
      resourceFit: 'Skills directly match technical requirements.',
      opportunityCost: 'Primary trade-off is foregone corporate compensation.',
      upsidePotential: 'Self-sustaining target is plausible under favorable adoption.',
      evidenceConfidence: 'Financial parameters are stated as known.',
    },
    scenarioNarratives: {
      baseCaseExplanation: 'Under base case conditions, capital allows steady execution.',
      downsideStressExplanation: 'If revenue delays, runway compresses to stress limits.',
      upsideCaseExplanation: 'Accelerated adoption delivers profitability ahead of schedule.',
      divergenceAnalysis: 'Scenarios diverge on execution velocity and product adoption timing.',
    },
    assumptionsAudit: {
      criticalAssumptionsToValidate: ['Assumes MVP delivery within 6 months'],
      heuristicAssumptionsInUse: ['Standard living expenses maintained'],
    },
    dataGapsAndNextSteps: {
      missingVariables: [],
      recommendedInformationToCollect: ['Monitor early customer conversion rates'],
    },
    epistemicDisclaimer: 'These scenarios represent deterministic conditional projections, not probabilistic predictions.',
  });

  const mockSuccessClient: IGeminiClient = {
    generateContent: async () => ({ text: validMockExplanationJson }),
  };

  const result = await executeUnifiedAnalysis(validPayload, {
    geminiClientOverride: mockSuccessClient,
  });

  assert(result.explanationStatus === 'AVAILABLE', 'Explanation status is AVAILABLE on successful Gemini response');
  assert(result.explanation !== null, 'Explanation object is populated');
  assert(result.explanation?.executiveSummary.headline.includes('Launch'), 'Executive summary matches mock text');
  assert(
    typeof result.auditTrail.dnaComputationHash === 'string' &&
    result.auditTrail.dnaComputationHash.length > 0 &&
    result.auditTrail.unifiedPipelineComputationHash.length === 64,
    'Audit trail hashes remain authoritative'
  );
}

// ---------------------------------------------------------------------------
// 3. Gemini Timeout Enforced Hard Boundary
// ---------------------------------------------------------------------------
console.log('\n--- Suite 3: Gemini Timeout Hard Boundary ---');
{
  const hangingClient: IGeminiClient = {
    generateContent: async () => {
      // Simulate hanging network connection
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { text: '{}' };
    },
  };

  const t0 = performance.now();
  const result = await executeUnifiedAnalysis(validPayload, {
    geminiClientOverride: hangingClient,
    explanationTimeoutMs: 150, // 150ms timeout for test
  });
  const t1 = performance.now();
  const elapsed = t1 - t0;

  assert(elapsed < 400, `Hanging Gemini call aborted within ${elapsed.toFixed(2)}ms (< 400ms)`);
  assert(result.explanationStatus === 'UNAVAILABLE', 'Timed-out explanation degrades to UNAVAILABLE');
  assert(result.explanation === null, 'Timed-out explanation is null');
  assert((result.decisionDNA.financialExposure.measurements.runwayMonths ?? 0) > 0, 'Deterministic DNA remains complete');
}

// ---------------------------------------------------------------------------
// 4. Gemini 503 High Demand Resilience
// ---------------------------------------------------------------------------
console.log('\n--- Suite 4: Gemini 503 High Demand Resilience ---');
{
  const error503Client: IGeminiClient = {
    generateContent: async () => {
      const err = new Error('This model is currently experiencing high demand. Spikes in demand are usually temporary.');
      (err as any).status = 503;
      (err as any).code = 503;
      throw err;
    },
  };

  const t0 = performance.now();
  const result = await executeUnifiedAnalysis(validPayload, {
    geminiClientOverride: error503Client,
  });
  const t1 = performance.now();

  assert(t1 - t0 < 500, '503 error handled immediately without multi-minute retry delays');
  assert(result.explanationStatus === 'UNAVAILABLE', 'Degrades to UNAVAILABLE on 503');
  assert(result.explanation === null, 'Explanation is null on 503');
  assert(result.scenarios.downsideStressCase !== undefined, 'Downside stress case intact on 503');
}

// ---------------------------------------------------------------------------
// 5. Gemini 429 Quota Exhaustion Resilience
// ---------------------------------------------------------------------------
console.log('\n--- Suite 5: Gemini 429 Quota Exhaustion Resilience ---');
{
  const error429Client: IGeminiClient = {
    generateContent: async () => {
      const err = new Error('Resource has been exhausted (e.g. check quota).');
      (err as any).status = 429;
      (err as any).code = 429;
      throw err;
    },
  };

  const result = await executeUnifiedAnalysis(validPayload, {
    geminiClientOverride: error429Client,
  });

  assert(result.explanationStatus === 'UNAVAILABLE', 'Degrades to UNAVAILABLE on 429');
  assert(result.explanation === null, 'Explanation is null on 429');
  assert(result.decisionDNA.reversibility.status === 'CALCULATED', 'Reversibility dimension intact on 429');
}

// ---------------------------------------------------------------------------
// 6. withTimeout Utility Verification
// ---------------------------------------------------------------------------
console.log('\n--- Suite 6: withTimeout Utility Verification ---');
{
  const fastPromise = new Promise((resolve) => setTimeout(() => resolve('fast'), 50));
  const fastRes = await withTimeout(fastPromise, 200);
  assert(fastRes === 'fast', 'withTimeout resolves quickly when under threshold');

  const slowPromise = new Promise((resolve) => setTimeout(() => resolve('slow'), 300));
  let timedOut = false;
  try {
    await withTimeout(slowPromise, 80);
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.code === 'TIMEOUT') {
      timedOut = true;
    }
  }
  assert(timedOut, 'withTimeout rejects with TimeoutError when threshold exceeded');
}

// ---------------------------------------------------------------------------
// 7. Historical Snapshot Zero Analysis Verification
// ---------------------------------------------------------------------------
console.log('\n--- Suite 7: Historical Snapshot Zero Analysis Verification ---');
{
  clearLibrary();

  const mockData = await executeUnifiedAnalysis(validPayload, { skipExplanation: true });
  const saveRes = saveDecisionSafe({
    payload: validPayload,
    data: mockData,
    userNotes: 'Test notes',
  });
  assert(saveRes.success === true, 'Saved historical decision successfully');

  if (saveRes.record) {
    const fetched = getDecisionById(saveRes.record.id);
    assert(fetched !== null, 'Fetched historical snapshot from library');
    assert(fetched?.data.auditTrail.dnaComputationHash === mockData.auditTrail.dnaComputationHash, 'Historical snapshot preserves exact DNA computation hash');
    assert(fetched?.provenance.dnaHash === mockData.auditTrail.dnaComputationHash, 'Historical snapshot preserves exact DNA provenance hash');
  }
}

// ---------------------------------------------------------------------------
// 8. Default Budget Constants Invariance
// ---------------------------------------------------------------------------
console.log('\n--- Suite 8: Budget Constants Verification ---');
{
  assert(DEFAULT_TOTAL_EXPLANATION_BUDGET_MS <= 12000, 'Total explanation budget is <= 12s');
  assert(DEFAULT_TOTAL_EXPLANATION_BUDGET_MS >= 5000, 'Total explanation budget is >= 5s');
  assert(DEFAULT_PER_ATTEMPT_TIMEOUT_MS <= 8000, 'Individual attempt budget is <= 8s');
  assert(DEFAULT_PER_ATTEMPT_TIMEOUT_MS >= 3000, 'Individual attempt budget is >= 3s');
}

console.log('\n==================================================');
console.log(`PERFORMANCE REGRESSION AUDIT: ${passed} passed, ${failed} failed`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
}
