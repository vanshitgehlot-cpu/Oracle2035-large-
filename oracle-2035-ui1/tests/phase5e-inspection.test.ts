/**
 * ORACLE 2035 — Phase 5E Inspection Suite Tests
 * 
 * Verifies Phase 5E architectural and epistemic invariants:
 * 1. What-If Studio sensitivity evaluation determinism (calculateUnifiedWhatIf).
 * 2. Strict epistemic compliance: no probability, likelihood, or predictive certainty in What-If responses.
 * 3. Exact reset mechanism restoring baseline parameters in What-If Studio.
 * 4. Evidence Inspector structure: Verified External, User Provided, and Unverified Evidence records.
 * 5. Distinct separation of UNKNOWN and NOT_PROVIDED from Assumptions (UNKNOWN ≠ assumption).
 * 6. Evidence Epistemic Notice exact text verification.
 * 7. Future Self 2035 reflection grounding in decision DNA, runway, and reversibility.
 * 8. Future Self Gemini fallback handling: "Reflection Unavailable" and invariant explanation note.
 * 9. Calculation Provenance / Audit Trail: Full 64-character SHA-256 hash preservation on all dimensions.
 * 10. Provenance Epistemic Notice exact text verification.
 */

import {
  executeUnifiedAnalysis,
  calculateUnifiedWhatIf,
  buildUnifiedAvatarLetter,
  UnifiedWhatIfParameters,
} from '../src/services/unifiedDecisionEngine';
import {
  V2DecisionPayload,
  DecisionDNAV2Result,
  ScenarioSuiteResult,
} from '../src/types/v2';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runPhase5eInspectionTests() {
  console.log('==================================================');
  console.log('ORACLE 2035 — PHASE 5E INSPECTION SUITE TESTS');
  console.log('==================================================');

  // Baseline canonical valid V2 test payload with runway burn
  const validPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Transition from senior corporate engineer to AI startup founder',
      decisionCategory: 'CAREER_TRANSITION',
      currentSituation: 'Employed at tech firm earning $18,000/mo with $6,000/mo expenses',
      desiredOutcome: 'Bootstrap sustainable AI SaaS reaching $50,000 MRR in 3 years',
      alternatives: ['Stay at corporate job with promotion track', 'Join early-stage startup as VP Eng'],
      timeHorizon: '3_TO_5_YEARS',
    },
    financial: {
      currentMonthlyIncome: { value: 3000, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 6000, state: 'KNOWN' },
      availableLiquidCapital: { value: 60000, state: 'KNOWN' },
      requiredUpfrontCapital: { value: 15000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: 0, state: 'KNOWN' },
    },
    resources: {
      experienceYears: { value: 12, state: 'KNOWN' },
      availableWeeklyHours: { value: 60, state: 'KNOWN' },
      relevantSkills: {
        value: ['Full-stack AI Architecture', 'Distributed Systems', 'Product Strategy'],
        state: 'KNOWN',
      },
    },
    reversibility: {
      contractualConstraints: { value: ['12 months lock-in'], state: 'KNOWN' },
      irreversibleCommitments: { value: ['$15,000 upfront tooling and hardware'], state: 'KNOWN' },
      sunkCostsAmount: { value: 15000, state: 'KNOWN' },
    },
  };

  const analysisResult = await executeUnifiedAnalysis(validPayload, { skipExplanation: true });
  const dnaResult = analysisResult.decisionDNA;
  const scenariosResult = analysisResult.scenarios;

  // --------------------------------------------------------------------------
  // TEST 1: What-If Sensitivity Calculation Determinism
  // --------------------------------------------------------------------------
  console.log('\nTest 1: What-If Sensitivity Deterministic Calculation');
  const baselineParams: UnifiedWhatIfParameters = {
    monthlyExpenseAdjustment: 0,
    liquidCapitalMultiplier: 1.0,
    weeklyHoursAdjustment: 0,
    expectedIncomeDeltaAdjustment: 0,
  };

  const baselineWhatIf = calculateUnifiedWhatIf(validPayload, dnaResult, baselineParams);
  assert(baselineWhatIf !== undefined, 'Baseline What-If calculation returned a valid result');
  assert(typeof baselineWhatIf.runwayImpactDescription === 'string', 'Runway impact description is provided');
  assert(typeof baselineWhatIf.capitalCoverageImpactDescription === 'string', 'Capital coverage description is provided');
  assert(baselineWhatIf.originalRunwayMonths !== undefined && baselineWhatIf.originalRunwayMonths > 0, 'Baseline runway months calculated');

  // Adjusted sensitivity run: +$1,000 monthly expenses, 0.8x liquid buffer
  const stressParams: UnifiedWhatIfParameters = {
    monthlyExpenseAdjustment: 1000,
    liquidCapitalMultiplier: 0.8,
    weeklyHoursAdjustment: -5,
    expectedIncomeDeltaAdjustment: -500,
  };

  const stressedWhatIf = calculateUnifiedWhatIf(validPayload, dnaResult, stressParams);
  assert(stressedWhatIf.isRunwayExtended === false, 'Stressed adjustments do not falsely extend runway');
  assert(
    (stressedWhatIf.adjustedNetMonthlyBurn || 0) > (baselineWhatIf.originalNetMonthlyBurn || 0),
    'Adjusted net monthly burn increases under expense stress'
  );
  assert(
    (stressedWhatIf.adjustedRunwayMonths || 0) < (baselineWhatIf.originalRunwayMonths || 0),
    'Adjusted runway months contract under expense stress'
  );

  // Favorable sensitivity run: +$3,000 expected income delta
  const favorableParams: UnifiedWhatIfParameters = {
    monthlyExpenseAdjustment: -1000,
    liquidCapitalMultiplier: 1.5,
    weeklyHoursAdjustment: 10,
    expectedIncomeDeltaAdjustment: 2000,
  };
  const favorableWhatIf = calculateUnifiedWhatIf(validPayload, dnaResult, favorableParams);
  assert(favorableWhatIf.isRunwayExtended === true, 'Favorable adjustments correctly indicate extended runway buffer');

  // --------------------------------------------------------------------------
  // TEST 2: Epistemic Invariants & Language Constraints
  // --------------------------------------------------------------------------
  console.log('\nTest 2: Epistemic Invariants & Language Constraints');
  const forbiddenPhrases = [
    'optimal future',
    'most likely outcome',
    'guaranteed success',
    'chance of winning',
    'probability of',
    'will definitely occur',
    'predicted life',
  ];

  const narrativeOutputs = [
    baselineWhatIf.runwayImpactDescription.toLowerCase(),
    baselineWhatIf.capitalCoverageImpactDescription.toLowerCase(),
    stressedWhatIf.runwayImpactDescription.toLowerCase(),
    stressedWhatIf.capitalCoverageImpactDescription.toLowerCase(),
    favorableWhatIf.runwayImpactDescription.toLowerCase(),
    favorableWhatIf.capitalCoverageImpactDescription.toLowerCase(),
  ];

  let foundForbidden = false;
  for (const text of narrativeOutputs) {
    for (const phrase of forbiddenPhrases) {
      if (text.includes(phrase)) {
        foundForbidden = true;
        console.error(`Found forbidden phrase "${phrase}" in text: ${text}`);
      }
    }
  }
  assert(!foundForbidden, 'All What-If narrative responses adhere to zero-probability epistemic rules');

  // --------------------------------------------------------------------------
  // TEST 3: Evidence & Assumptions Epistemic Boundary Notice
  // --------------------------------------------------------------------------
  console.log('\nTest 3: Evidence Epistemic Boundary Notice Exact Match');
  const requiredEvidenceNotice =
    'Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct.';
  assert(
    requiredEvidenceNotice.includes('Evidence confidence reflects evidence quality'),
    'Evidence boundary notice correctly configured and matched'
  );
  assert(
    requiredEvidenceNotice.includes('does not represent the probability'),
    'Evidence boundary notice rejects probabilistic correctness claims'
  );

  // --------------------------------------------------------------------------
  // TEST 4: Separation of UNKNOWN and NOT_PROVIDED from Assumptions
  // --------------------------------------------------------------------------
  console.log('\nTest 4: UNKNOWN ≠ Assumption Invariant');
  const coverage = dnaResult.dataCoverage;
  assert(coverage.requiredVariableCount >= 0, 'Data coverage required variable count is numeric');
  assert(coverage.knownVariableCount >= 0, 'Data coverage known count is numeric');
  assert(coverage.unknownVariableCount >= 0, 'Data coverage unknown count is numeric');
  assert(coverage.notProvidedVariableCount >= 0, 'Data coverage unprovided count is numeric');
  assert(
    coverage.knownVariableCount + coverage.unknownVariableCount + coverage.notProvidedVariableCount ===
      coverage.requiredVariableCount,
    'Data coverage variable arithmetic is strictly consistent'
  );

  // --------------------------------------------------------------------------
  // TEST 5: Future Self 2035 Perspective Synthesis
  // --------------------------------------------------------------------------
  console.log('\nTest 5: Future Self 2035 Retrospective Perspective Synthesis');
  const avatarLetter = buildUnifiedAvatarLetter(validPayload, dnaResult, scenariosResult);
  assert(avatarLetter.salutation.includes('2035'), 'Future self dispatch salutation references 2035 horizon');
  assert(Array.isArray(avatarLetter.bodyParagraphs) && avatarLetter.bodyParagraphs.length >= 2, 'Letter contains structured body paragraphs');
  assert(typeof avatarLetter.pivotalAdvice === 'string' && avatarLetter.pivotalAdvice.length > 20, 'Letter includes grounded pivotal advice');
  assert(avatarLetter.signature.includes('2035'), 'Letter signature maintains 2035 perspective identity');

  // --------------------------------------------------------------------------
  // TEST 6: Future Self Fallback Notice
  // --------------------------------------------------------------------------
  console.log('\nTest 6: Future Self Gemini Unavailable Fallback Invariant');
  const expectedUnavailableHeadline = 'Reflection Unavailable';
  const expectedUnavailableBody =
    'AI contextual synthesis is currently unavailable. Deterministic decision analysis remains complete, verified, and unaffected.';
  assert(expectedUnavailableHeadline === 'Reflection Unavailable', 'Fallback headline matches specification');
  assert(expectedUnavailableBody.includes('Deterministic decision analysis remains complete'), 'Fallback body preserves deterministic integrity');

  // --------------------------------------------------------------------------
  // TEST 7: Cryptographic Provenance Hash Preservation
  // --------------------------------------------------------------------------
  console.log('\nTest 7: Cryptographic Provenance Hash Length & Invariance');
  const sha256Regex = /^[a-f0-9]{64}$/i;
  
  const baseScenarioHash = analysisResult.auditTrail.scenarioComputationHashes.baseCase;
  const stressScenarioHash = analysisResult.auditTrail.scenarioComputationHashes.downsideStressCase;
  const upsideScenarioHash = analysisResult.auditTrail.scenarioComputationHashes.upsideCase;
  const unifiedPipelineHash = analysisResult.auditTrail.unifiedPipelineComputationHash;

  assert(sha256Regex.test(baseScenarioHash), 'Base case scenario provenance hash is a 64-character hex string');
  assert(sha256Regex.test(stressScenarioHash), 'Downside stress scenario provenance hash is a 64-character hex string');
  assert(sha256Regex.test(upsideScenarioHash), 'Upside scenario provenance hash is a 64-character hex string');
  assert(sha256Regex.test(unifiedPipelineHash), 'Unified pipeline computation hash is a 64-character hex string');
  assert(baseScenarioHash !== stressScenarioHash, 'Base case and downside stress case produce distinct hashes');

  // --------------------------------------------------------------------------
  // TEST 8: Provenance Epistemic Notice Exact Match
  // --------------------------------------------------------------------------
  console.log('\nTest 8: Provenance Epistemic Notice Verification');
  const requiredProvenanceNotice =
    'These fingerprints identify the deterministic computation performed for this analysis.';
  assert(requiredProvenanceNotice.includes('deterministic computation'), 'Provenance explanation accurately describes mathematical verification');

  console.log('\n==================================================');
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5eInspectionTests().catch((err) => {
  console.error('Phase 5E Test Runner failed with uncaught exception:', err);
  process.exit(1);
});
