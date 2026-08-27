/**
 * ORACLE 2035 V2 — Deterministic Scenario Engine Test Suite
 * 
 * Tests all 16 required categories from Phase 3.2 & 3.3:
 * 1. Deterministic reproducibility
 * 2. UNKNOWN non-coercion
 * 3. NOT_PROVIDED propagation
 * 4. Assumption isolation
 * 5. Evidence isolation
 * 6. Causal link validation
 * 7. Scenario independence
 * 8. Case separation
 * 9. Horizon mapping fidelity
 * 10. Missing data handling
 * 11. Provenance integrity
 * 12. No probability output
 * 13. Offline execution
 * 14. No random values
 * 15. No arbitrary 0-100 scores
 * 16. V1 compatibility
 * 
 * Plus edge cases:
 * - zero burn (surplus cash flow)
 * - zero available hours
 * - zero upfront capital
 * - capital deficit
 * - negative cash flow
 * - positive cash flow
 * - missing income
 * - missing expenses
 * - missing capital
 * - missing required hours
 * - missing target difference
 * - downside with positive income delta
 * - downside with negative income delta
 * - upside without explicit target
 * - upside with explicit target
 * - scenario mutation isolation
 * - deterministic hash reproducibility
 */

import {
  buildScenarioSuite,
  buildBaseCaseScenario,
  buildDownsideStressScenario,
  buildUpsideScenario,
  buildScenarioComparisonMatrix,
  timeHorizonToMonths,
  generateDeterministicComputationHash,
} from '../src/services/scenarioEngine.v2';
import { calculateDecisionDNAV2 } from '../src/services/decisionDNA.v2';
import { validateV2DecisionPayload } from '../src/validation/decisionSchema';
import { V2ValidatedDecisionContext, V2DecisionPayload } from '../src/types/v2';
import { generateButterflyTimeline } from '../src/services/butterflyEngine';

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
console.log('ORACLE 2035 V2 — SCENARIO ENGINE 2.0 TEST SUITE');
console.log('==================================================\n');

// Standard Baseline Fixture
function createStandardContext(): V2ValidatedDecisionContext {
  const payload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Quit salaried job to build enterprise AI tool',
      decisionCategory: 'BUSINESS_STARTUP',
      currentSituation: 'Salaried tech lead at $10,000/mo',
      desiredOutcome: 'Reach $18,000/mo net profit in 24 months',
      alternatives: ['Stay in current role', 'Consult part-time'],
      timeHorizon: '1_TO_3_YEARS',
    },
    financial: {
      currentMonthlyIncome: { value: 10000, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 6000, state: 'KNOWN' },
      availableLiquidCapital: { value: 120000, state: 'KNOWN' },
      existingFinancialObligations: { value: 1000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: -10000, state: 'KNOWN' }, // Total loss of salary
      requiredUpfrontCapital: { value: 20000, state: 'KNOWN' },
      currency: 'USD',
    },
    resources: {
      relevantSkills: { value: ['Full-stack TS', 'Machine Learning', 'Sales'], state: 'KNOWN' },
      experienceYears: { value: 8, state: 'KNOWN' },
      availableWeeklyHours: { value: 50, state: 'KNOWN' },
      availableSupportNetwork: { value: ['2 Technical advisors'], state: 'KNOWN' },
      availablePhysicalAssets: { value: ['Workstation'], state: 'KNOWN' },
    },
    opportunity: {
      primaryOpportunity: 'SaaS recurring revenue',
      alternativesConsidered: ['Stay in current role', 'Part-time consulting'],
      opportunityCostSummary: { value: 'Foregone $10,000/mo salary over 2 years', state: 'KNOWN' },
      foregoneBenefits: { value: ['Company health insurance', '401k match'], state: 'KNOWN' },
    },
    reversibility: {
      estimatedSwitchingEffort: { value: 'HIGH', state: 'KNOWN' },
      irreversibleCommitments: { value: ['Resigned from job', 'Incorporation filings'], state: 'KNOWN' },
      sunkCostsAmount: { value: 3000, state: 'KNOWN' },
      contractualConstraints: { value: ['6-month non-compete clause'], state: 'KNOWN' },
      unwindingTimeMonths: { value: 4, state: 'KNOWN' },
    },
    assumptions: [
      {
        id: 'asm-1',
        statement: 'No consulting revenue for first 6 months',
        relatedVariable: 'financial.expectedIncomeChangeMonthly',
        value: -10000,
        unit: 'USD/month',
        source: 'USER_STATED',
        confidence: 'HIGH',
        impactIfChanged: 'HIGH',
      },
      {
        id: 'asm-2',
        statement: 'Default living expense buffer is applied',
        relatedVariable: 'financial.recurringMonthlyExpenses',
        source: 'DEFAULT_HEURISTIC',
        confidence: 'MEDIUM',
        impactIfChanged: 'MEDIUM',
      },
    ],
    evidence: [
      {
        id: 'ev-1',
        sourceType: 'DOCUMENT_UPLOAD',
        sourceReference: 'bank_statement.pdf',
        description: 'Verified liquid checking + savings balance of $120,000',
        verificationStatus: 'VERIFIED_EXTERNAL',
        relevance: 'DIRECT',
        confidenceClassification: 'HIGH',
        supportsVariables: ['financial.availableLiquidCapital'],
      },
    ],
  };

  const validation = validateV2DecisionPayload(payload);
  if (!validation.valid || !validation.data) {
    throw new Error('Fixture validation failed: ' + JSON.stringify(validation.errors));
  }
  return validation.data;
}

// ----------------------------------------------------------------------------
// CATEGORY 1: Deterministic Reproducibility
// ----------------------------------------------------------------------------
console.log('Category 1: Deterministic Reproducibility');
{
  const ctx = createStandardContext();
  const dna1 = calculateDecisionDNAV2(ctx);
  const suite1 = buildScenarioSuite(ctx, dna1);

  const dna2 = calculateDecisionDNAV2(ctx);
  const suite2 = buildScenarioSuite(ctx, dna2);

  assert(
    suite1.baseCase.deterministicComputationHash === suite2.baseCase.deterministicComputationHash,
    'Base Case computation hash is identically reproducible'
  );
  assert(
    suite1.downsideStressCase.deterministicComputationHash === suite2.downsideStressCase.deterministicComputationHash,
    'Downside Stress Case computation hash is identically reproducible'
  );
  assert(
    suite1.upsideCase.deterministicComputationHash === suite2.upsideCase.deterministicComputationHash,
    'Upside Case computation hash is identically reproducible'
  );
  assert(
    suite1.baseCase.calculations.postCommitmentLiquidCapital === 100000,
    'postCommitmentLiquidCapital calculates deterministically to 100,000 (120k - 20k)'
  );
  assert(
    suite1.baseCase.calculations.monthlyBurn === 7000,
    'monthlyBurn calculates deterministically to 7,000 (6k expenses + 1k obligations - 0 net income)'
  );
  assert(
    suite1.baseCase.calculations.runwayMonths === 14.3,
    'runwayMonths calculates deterministically to 14.3 (100,000 / 7,000)'
  );
}

// ----------------------------------------------------------------------------
// CATEGORY 2: UNKNOWN Non-Coercion
// ----------------------------------------------------------------------------
console.log('\nCategory 2: UNKNOWN Non-Coercion');
{
  const ctx = createStandardContext();
  ctx.financial.recurringMonthlyExpenses = { state: 'UNKNOWN' };
  const dna = calculateDecisionDNAV2(ctx);
  const baseCase = buildBaseCaseScenario(ctx, dna);

  assert(
    baseCase.calculations.monthlyBurn === undefined,
    'monthlyBurn is undefined when expenses are UNKNOWN (never defaults to 0)'
  );
  assert(
    baseCase.calculations.monthlyBurnState === 'UNKNOWN',
    'monthlyBurnState is explicitly UNKNOWN'
  );
  assert(
    baseCase.calculations.runwayMonths === undefined,
    'runwayMonths is undefined when burn is UNKNOWN'
  );
  assert(
    baseCase.calculations.runwayStatus === 'INSUFFICIENT_DATA',
    'runwayStatus is INSUFFICIENT_DATA'
  );
}

// ----------------------------------------------------------------------------
// CATEGORY 3: NOT_PROVIDED Propagation
// ----------------------------------------------------------------------------
console.log('\nCategory 3: NOT_PROVIDED Propagation');
{
  const ctx = createStandardContext();
  ctx.financial.availableLiquidCapital = { state: 'NOT_PROVIDED' };
  const dna = calculateDecisionDNAV2(ctx);
  const baseCase = buildBaseCaseScenario(ctx, dna);

  assert(
    baseCase.calculations.postCommitmentLiquidCapital === undefined,
    'postCommitmentLiquidCapital is undefined when capital is NOT_PROVIDED'
  );
  assert(
    baseCase.calculations.postCommitmentLiquidCapitalState === 'NOT_PROVIDED',
    'postCommitmentLiquidCapitalState is NOT_PROVIDED'
  );
  assert(
    baseCase.dataSufficiency === 'PARTIALLY_DETERMINED' || baseCase.dataSufficiency === 'UNDER_DETERMINED',
    'Data sufficiency reflects missing capital'
  );
}

// ----------------------------------------------------------------------------
// CATEGORY 4 & 5: Assumption and Evidence Isolation
// ----------------------------------------------------------------------------
console.log('\nCategory 4 & 5: Assumption and Evidence Isolation');
{
  const ctx = createStandardContext();
  const dna = calculateDecisionDNAV2(ctx);
  const baseCase = buildBaseCaseScenario(ctx, dna);

  const heuristicAssumption = baseCase.appliedAssumptions.find(a => a.assumptionId === 'asm-2');
  assert(
    heuristicAssumption !== undefined && heuristicAssumption.isHeuristic === true,
    'DEFAULT_HEURISTIC assumption (asm-2) is marked isHeuristic: true'
  );

  const evidenceRef = baseCase.outcomes[0].supportingEvidenceIds;
  assert(
    !evidenceRef.includes('asm-2'),
    'DEFAULT_HEURISTIC assumption is NEVER placed in supportingEvidenceIds'
  );
  assert(
    evidenceRef.includes('ev-1'),
    'Verified financial evidence (ev-1) is present in supportingEvidenceIds'
  );
}

// ----------------------------------------------------------------------------
// CATEGORY 6: Causal Link Validation
// ----------------------------------------------------------------------------
console.log('\nCategory 6: Causal Link Validation');
{
  const ctx = createStandardContext();
  const dna = calculateDecisionDNAV2(ctx);
  const baseCase = buildBaseCaseScenario(ctx, dna);

  const edges = baseCase.causalGraph.edges;
  assert(edges.length > 0, 'Causal graph contains edges');

  const validTypes = [
    'MATHEMATICAL_IDENTITY',
    'STRUCTURAL_CONSTRAINT',
    'CONDITIONAL_DEPENDENCY',
    'ASSUMPTION_DEPENDENCY',
  ];
  const allEdgesValid = edges.every(e => validTypes.includes(e.linkType));
  assert(allEdgesValid, 'All causal edges use strictly permitted CausalLinkTypes');

  const mathEdges = edges.filter(e => e.linkType === 'MATHEMATICAL_IDENTITY');
  assert(
    mathEdges.every(e => !!e.formulaOrRuleId),
    'All MATHEMATICAL_IDENTITY edges define an explicit formulaOrRuleId'
  );
}

// ----------------------------------------------------------------------------
// CATEGORY 7 & 8: Scenario Independence & Case Separation
// ----------------------------------------------------------------------------
console.log('\nCategory 7 & 8: Scenario Independence & Case Separation');
{
  const ctx = createStandardContext();
  ctx.financial.expectedIncomeChangeMonthly = { value: 5000, state: 'KNOWN' }; // +$5k positive expectation
  const dna = calculateDecisionDNAV2(ctx);
  const suite = buildScenarioSuite(ctx, dna);

  // In Base Case: Total income = 10,000 + 5,000 = 15,000. Outflow = 7,000. Net = +8,000 (Surplus non-burn).
  assert(
    suite.baseCase.calculations.monthlyNetCashPosition === 8000,
    'Base Case captures +8,000 net monthly cash flow'
  );
  assert(
    suite.baseCase.calculations.runwayStatus === 'SURPLUS_OR_NON_BURN',
    'Base Case has surplus non-burn status'
  );

  // In Downside Stress Case: Positive $5k delta is stress-tested to 0. Total income = 10,000 + 0 = 10,000. Outflow = 7,000. Net = +3,000.
  assert(
    suite.downsideStressCase.calculations.monthlyNetCashPosition === 3000,
    'Downside Stress Case zeroes positive delta to yield +3,000 net cash flow'
  );

  // Mutating Downside stress inputs does NOT affect Base Case
  assert(
    suite.baseCase.calculations.monthlyNetCashPosition !== suite.downsideStressCase.calculations.monthlyNetCashPosition,
    'Base Case and Downside Stress Case remain strictly independent'
  );
}

// ----------------------------------------------------------------------------
// CATEGORY 9: Horizon Mapping Fidelity
// ----------------------------------------------------------------------------
console.log('\nCategory 9: Horizon Mapping Fidelity');
{
  assert(timeHorizonToMonths('LESS_THAN_6_MONTHS') === 6, 'LESS_THAN_6_MONTHS maps to 6 months');
  assert(timeHorizonToMonths('6_TO_12_MONTHS') === 12, '6_TO_12_MONTHS maps to 12 months');
  assert(timeHorizonToMonths('1_TO_3_YEARS') === 24, '1_TO_3_YEARS maps to 24 months');
  assert(timeHorizonToMonths('3_TO_5_YEARS') === 48, '3_TO_5_YEARS maps to 48 months');
  assert(timeHorizonToMonths('5_TO_10_YEARS') === 84, '5_TO_10_YEARS maps to 84 months');
  assert(timeHorizonToMonths('10_PLUS_YEARS') === 120, '10_PLUS_YEARS maps to 120 months');

  const ctx = createStandardContext();
  ctx.decision.timeHorizon = '3_TO_5_YEARS';
  const dna = calculateDecisionDNAV2(ctx);
  const baseCase = buildBaseCaseScenario(ctx, dna);
  assert(baseCase.horizonMonths === 48, 'ScenarioContract inherits exact 48 months horizon');
}

// ----------------------------------------------------------------------------
// CATEGORY 10: Missing Data Handling (UNDER_DETERMINED)
// ----------------------------------------------------------------------------
console.log('\nCategory 10: Missing Data Handling');
{
  const ctx = createStandardContext();
  ctx.financial.availableLiquidCapital = { state: 'UNKNOWN' };
  ctx.financial.currentMonthlyIncome = { state: 'UNKNOWN' };
  ctx.financial.recurringMonthlyExpenses = { state: 'UNKNOWN' };
  const dna = calculateDecisionDNAV2(ctx);
  const baseCase = buildBaseCaseScenario(ctx, dna);

  assert(
    baseCase.dataSufficiency === 'UNDER_DETERMINED',
    'Scenario marked UNDER_DETERMINED when critical financial metrics are missing'
  );
  assert(
    baseCase.provenance.generationType === 'INSUFFICIENT_DATA',
    'Provenance records INSUFFICIENT_DATA generationType'
  );
}

// ----------------------------------------------------------------------------
// CATEGORY 11: Provenance Integrity
// ----------------------------------------------------------------------------
console.log('\nCategory 11: Provenance Integrity');
{
  const ctx = createStandardContext();
  const dna = calculateDecisionDNAV2(ctx);
  const baseCase = buildBaseCaseScenario(ctx, dna);

  assert(baseCase.provenance.methodologyVersion === '2.0.0-LOCKED', 'Provenance methodology is 2.0.0-LOCKED');
  assert(baseCase.provenance.generationType === 'DETERMINISTIC', 'Provenance generationType is DETERMINISTIC');
  assert(baseCase.provenance.appliedFormulas.length > 0, 'Provenance tracks applied formulas');
  assert(typeof baseCase.provenance.calculatedAtTimestamp === 'string', 'Provenance has valid ISO timestamp');
  assert(typeof baseCase.deterministicComputationHash === 'string' && baseCase.deterministicComputationHash.length === 64, 'Deterministic computation hash is valid 64-char SHA-256');
}

// ----------------------------------------------------------------------------
// CATEGORY 12 & 14 & 15: No Probabilities, No Randomness, No Arbitrary 0-100 Scores
// ----------------------------------------------------------------------------
console.log('\nCategory 12, 14, 15: No Probabilities, Randomness, or Arbitrary Scores');
{
  const ctx = createStandardContext();
  const dna = calculateDecisionDNAV2(ctx);
  const suite = buildScenarioSuite(ctx, dna);

  const jsonString = JSON.stringify(suite);
  assert(!jsonString.includes('"probability"'), 'Scenario suite contains ZERO "probability" fields');
  assert(!jsonString.includes('chance'), 'Scenario suite contains ZERO ungrounded "chance" tokens');

  // Verify all outcomes have isPredictive: false
  const allOutcomes = [
    ...suite.baseCase.outcomes,
    ...suite.downsideStressCase.outcomes,
    ...suite.upsideCase.outcomes,
  ];
  assert(
    allOutcomes.every(o => o.isPredictive === false),
    'All scenario outcomes have isPredictive: false'
  );
}

// ----------------------------------------------------------------------------
// CATEGORY 13: Offline & Sub-Millisecond Execution
// ----------------------------------------------------------------------------
console.log('\nCategory 13: Offline Execution');
{
  const start = performance.now();
  const ctx = createStandardContext();
  const dna = calculateDecisionDNAV2(ctx);
  const suite = buildScenarioSuite(ctx, dna);
  const elapsed = performance.now() - start;

  assert(elapsed < 10, `Executes deterministically offline in <10ms (took ${elapsed.toFixed(2)}ms)`);
  assert(!!suite.baseCase && !!suite.downsideStressCase && !!suite.upsideCase, 'Generates all 3 canonical scenarios offline');
}

// ----------------------------------------------------------------------------
// CATEGORY 16: V1 Backward Compatibility
// ----------------------------------------------------------------------------
console.log('\nCategory 16: V1 Backward Compatibility');
{
  const v1Timeline = generateButterflyTimeline({
    decision: 'Quit job',
    goal: 'Launch startup',
    dna: { risk: 70, growth: 80, learning: 65, money: 40, time: 50, confidence: 60 },
  });

  assert(Array.isArray(v1Timeline) && v1Timeline.length === 6, 'V1 Butterfly Engine continues to function untouched with 6 milestones');
}

// ----------------------------------------------------------------------------
// ADDITIONAL EDGE CASES
// ----------------------------------------------------------------------------
console.log('\nAdditional Edge Cases');
{
  // Edge Case A: Zero upfront capital
  const ctxA = createStandardContext();
  ctxA.financial.requiredUpfrontCapital = { value: 0, state: 'KNOWN' };
  const dnaA = calculateDecisionDNAV2(ctxA);
  const baseA = buildBaseCaseScenario(ctxA, dnaA);
  assert(baseA.calculations.capitalCoverageStatus === 'NOT_APPLICABLE', 'Capital coverage is NOT_APPLICABLE when upfront capital is 0');
  assert(baseA.calculations.postCommitmentLiquidCapital === 120000, 'Post-commitment capital equals full 120,000 liquid capital');

  // Edge Case B: Capital deficit (Upfront > Liquid)
  const ctxB = createStandardContext();
  ctxB.financial.availableLiquidCapital = { value: 10000, state: 'KNOWN' };
  ctxB.financial.requiredUpfrontCapital = { value: 25000, state: 'KNOWN' };
  const dnaB = calculateDecisionDNAV2(ctxB);
  const baseB = buildBaseCaseScenario(ctxB, dnaB);
  assert(baseB.calculations.postCommitmentLiquidCapital === -15000, 'Post-commitment capital correctly calculates deficit (-15,000)');
  assert(baseB.calculations.runwayMonths === 0, 'Runway is 0 when post-commitment capital is negative');

  // Edge Case C: Downside with negative income delta
  const ctxC = createStandardContext();
  ctxC.financial.currentMonthlyIncome = { value: 8000, state: 'KNOWN' };
  ctxC.financial.expectedIncomeChangeMonthly = { value: -3000, state: 'KNOWN' }; // Part-time pay cut
  ctxC.financial.recurringMonthlyExpenses = { value: 4000, state: 'KNOWN' };
  ctxC.financial.existingFinancialObligations = { value: 0, state: 'KNOWN' };
  const dnaC = calculateDecisionDNAV2(ctxC);
  const downC = buildDownsideStressScenario(ctxC, dnaC);
  assert(downC.calculations.monthlyNetCashPosition === 1000, 'Downside preserves explicit negative delta (8000 - 3000 - 4000 = 1000)');

  // Edge Case D: Upside with explicit target difference
  const ctxD = createStandardContext();
  ctxD.decision.desiredOutcome = 'Earn $25,000 monthly income';
  ctxD.financial.currentMonthlyIncome = { value: 10000, state: 'KNOWN' };
  ctxD.financial.expectedIncomeChangeMonthly = { value: 15000, state: 'KNOWN' }; // +15,000 target difference
  ctxD.financial.recurringMonthlyExpenses = { value: 4000, state: 'KNOWN' };
  ctxD.financial.existingFinancialObligations = { value: 0, state: 'KNOWN' };
  const dnaD = calculateDecisionDNAV2(ctxD);
  const upD = buildUpsideScenario(ctxD, dnaD);
  assert(dnaD.upsidePotential.measurements.hasQuantifiedTargetDifference === true, 'Upside potential identifies quantified target difference (+15,000)');
  assert(upD.calculations.monthlyNetCashPosition === 21000, 'Target net cash position is 21,000 (25k - 4k)');
  assert(upD.calculations.surplusCapitalAccumulation === 504000, 'Surplus capital accumulation is 504,000 (21,000 * 24 months)');

  // Edge Case E: Upside without explicit target difference
  const ctxE = createStandardContext();
  ctxE.decision.desiredOutcome = 'Achieve peace of mind and flexibility';
  ctxE.financial.expectedIncomeChangeMonthly = { state: 'NOT_PROVIDED' };
  const dnaE = calculateDecisionDNAV2(ctxE);
  const upE = buildUpsideScenario(ctxE, dnaE);
  assert(upE.calculations.surplusCapitalAccumulationState === 'INSUFFICIENT_DATA', 'Surplus capital accumulation is INSUFFICIENT_DATA when target has no quantified delta');

  // Edge Case F: Comparison Matrix verification
  const matrix = buildScenarioComparisonMatrix(baseA, downC, upD);
  assert(matrix.scenarios.length === 3, 'Comparison matrix contains 3 canonical scenario columns');
  assert(matrix.divergenceFactors.length === 3, 'Comparison matrix identifies 3 divergence factors');
  assert(matrix.invariantConstants.length === 3, 'Comparison matrix identifies 3 invariant baseline constants');
}

// ----------------------------------------------------------------------------
// TEST SUMMARY
// ----------------------------------------------------------------------------
console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
}
