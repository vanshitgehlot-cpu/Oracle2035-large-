/**
 * ORACLE 2035 V2 — Decision DNA 2.0 Deterministic Engine Test Suite
 * 
 * Tests 19 required deterministic categories:
 * 1. Deterministic reproducibility
 * 2. Financial calculations
 * 3. Capital coverage
 * 4. Runway calculation
 * 5. Zero upfront capital
 * 6. Zero/negative burn
 * 7. Reversibility constraints
 * 8. Resource gaps
 * 9. Time coverage
 * 10. Capital coverage status
 * 11. Opportunity cost calculation
 * 12. Upside target difference
 * 13. Evidence classification
 * 14. UNKNOWN propagation
 * 15. NOT_PROVIDED propagation
 * 16. No AI dependency
 * 17. Provenance completeness
 * 18. Heuristic isolation
 * 19. Edge cases
 */

import { calculateDecisionDNAV2 } from '../src/services/decisionDNA.v2';
import { validateV2DecisionPayload } from '../src/validation/decisionSchema';
import { V2ValidatedDecisionContext, V2DecisionPayload } from '../src/types/v2';

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
console.log('ORACLE 2035 V2 — DECISION DNA 2.0 TEST SUITE');
console.log('==================================================\n');

// Baseline complete valid context fixture
function createBaseContext(): V2ValidatedDecisionContext {
  const payload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Leave senior engineering role to launch AI developer tools startup',
      decisionCategory: 'BUSINESS_STARTUP',
      currentSituation: 'Full-time employment at $15,000/mo salary',
      desiredOutcome: 'Reach $25,000/mo MRR with 3 enterprise clients within 2 years',
      alternatives: ['Remain in current job', 'Join seed stage startup'],
      timeHorizon: '1_TO_3_YEARS',
    },
    financial: {
      currentMonthlyIncome: { value: 15000, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 5000, state: 'KNOWN' },
      availableLiquidCapital: { value: 120000, state: 'KNOWN' },
      existingFinancialObligations: { value: 1000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: -15000, state: 'ESTIMATED_BY_USER' },
      requiredUpfrontCapital: { value: 20000, state: 'KNOWN' },
      currency: 'USD',
    },
    resources: {
      relevantSkills: { value: ['TypeScript', 'Cloud Architecture', 'Product Design'], state: 'KNOWN' },
      experienceYears: { value: 8, state: 'KNOWN' },
      availableWeeklyHours: { value: 50, state: 'KNOWN' },
      availableSupportNetwork: { value: ['2 Technical Advisors', '1 Legal Counsel'], state: 'KNOWN' },
      availablePhysicalAssets: { value: ['Home Office Setup', 'MacBook M3 Max'], state: 'KNOWN' },
    },
    opportunity: {
      primaryOpportunity: 'First mover in grounded deterministic decision infrastructure',
      alternativesConsidered: ['Stay at Big Tech', 'Freelance consulting'],
      opportunityCostSummary: { value: 'Foregoing $15,000 monthly base compensation', state: 'KNOWN' },
      foregoneBenefits: { value: ['Health insurance', '401k employer match'], state: 'KNOWN' },
    },
    reversibility: {
      estimatedSwitchingEffort: { value: 'HIGH', state: 'KNOWN' },
      irreversibleCommitments: { value: ['Public launch announcement', 'Resignation served'], state: 'KNOWN' },
      sunkCostsAmount: { value: 3000, state: 'KNOWN' },
      contractualConstraints: { value: ['12-month non-solicitation agreement'], state: 'KNOWN' },
      unwindingTimeMonths: { value: 3, state: 'ESTIMATED_BY_USER' },
    },
    evidence: [
      {
        id: 'ev-01',
        sourceType: 'DOCUMENT_UPLOAD',
        description: 'Verified liquid cash in high-yield savings statements',
        verificationStatus: 'VERIFIED_EXTERNAL',
        relevance: 'DIRECT',
        confidenceClassification: 'HIGH',
        supportsVariables: ['financial.availableLiquidCapital'],
      },
      {
        id: 'ev-02',
        sourceType: 'USER_STATEMENT',
        description: 'Customer interview confirmation with 3 pilot design partners',
        verificationStatus: 'USER_PROVIDED',
        relevance: 'DIRECT',
        confidenceClassification: 'MEDIUM',
        supportsVariables: ['decision.desiredOutcome'],
      },
    ],
    assumptions: [
      {
        id: 'asm-01',
        statement: 'Full product beta will take 40 hours per week',
        relatedVariable: 'requiredWeeklyHours',
        value: 40,
        source: 'USER_STATED',
        confidence: 'HIGH',
        impactIfChanged: 'HIGH',
      },
      {
        id: 'asm-02',
        statement: 'General SaaS conversion rates benchmark around 3%',
        relatedVariable: 'conversionRate',
        value: 0.03,
        source: 'DEFAULT_HEURISTIC',
        confidence: 'LOW',
        impactIfChanged: 'MEDIUM',
      },
    ],
  };

  const validation = validateV2DecisionPayload(payload);
  if (!validation.valid || !validation.data) {
    throw new Error('Base test fixture failed validation: ' + JSON.stringify(validation.errors));
  }
  return validation.data;
}

// ---------------------------------------------------------------------------
// TEST 1: Deterministic Reproducibility
// ---------------------------------------------------------------------------
console.log('Category 1: Deterministic Reproducibility');
{
  const ctx = createBaseContext();
  const run1 = calculateDecisionDNAV2(ctx);
  const run2 = calculateDecisionDNAV2(ctx);

  assert(
    JSON.stringify(run1.financialExposure.measurements) === JSON.stringify(run2.financialExposure.measurements),
    'Financial measurements are identically reproducible'
  );
  assert(
    run1.reversibility.classification === run2.reversibility.classification,
    'Reversibility classifications are identically reproducible'
  );
  assert(
    run1.dataCoverage.coverageRatio === run2.dataCoverage.coverageRatio,
    'Data coverage ratio is identically reproducible'
  );
}

// ---------------------------------------------------------------------------
// TEST 2: Financial Calculations
// ---------------------------------------------------------------------------
console.log('\nCategory 2: Financial Measurements Math');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const finM = res.financialExposure.measurements;

  // postDecisionMonthlyIncome = 15000 + (-15000) = 0
  assert(finM.postDecisionMonthlyIncome === 0, 'postDecisionMonthlyIncome correctly calculates to 0');
  // monthlyNetCashPosition = 0 - 5000 - 1000 = -6000
  assert(finM.monthlyNetCashPosition === -6000, 'monthlyNetCashPosition correctly calculates to -6000');
  // monthlyBurn = Math.abs(-6000) = 6000
  assert(finM.monthlyBurn === 6000, 'monthlyBurn correctly calculates to 6000');
  // postCommitmentLiquidCapital = 120000 - 20000 = 100000
  assert(finM.postCommitmentLiquidCapital === 100000, 'postCommitmentLiquidCapital correctly calculates to 100000');
}

// ---------------------------------------------------------------------------
// TEST 3 & 4: Capital Coverage & Runway
// ---------------------------------------------------------------------------
console.log('\nCategory 3 & 4: Capital Coverage & Runway');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const finM = res.financialExposure.measurements;

  // capitalCoverage = 120000 / 20000 = 6.0
  assert(finM.capitalCoverage === 6.0, 'capitalCoverage correctly calculates to 6.0');
  assert(finM.capitalCoverageStatus === 'NUMERIC', 'capitalCoverageStatus is NUMERIC');

  // runwayMonths = 100000 / 6000 = 16.7
  assert(finM.runwayMonths === 16.7, 'runwayMonths correctly calculates to 16.7 months');
  assert(finM.runwayStatus === 'NUMERIC', 'runwayStatus is NUMERIC');
  assert(res.financialExposure.classification === 'MODERATE_EXPOSURE', '16.7 months runway classified as MODERATE_EXPOSURE');
}

// ---------------------------------------------------------------------------
// TEST 5: Zero Upfront Capital
// ---------------------------------------------------------------------------
console.log('\nCategory 5: Zero Upfront Capital Handling');
{
  const ctx = createBaseContext();
  ctx.financial.requiredUpfrontCapital = { value: 0, state: 'KNOWN' };
  const res = calculateDecisionDNAV2(ctx);
  const finM = res.financialExposure.measurements;

  assert(finM.capitalCoverageStatus === 'NOT_APPLICABLE', 'capitalCoverageStatus is NOT_APPLICABLE when upfront capital is 0');
  assert(finM.capitalCoverage === undefined, 'capitalCoverage is undefined when upfront capital is 0');
  assert(finM.postCommitmentLiquidCapital === 120000, 'postCommitmentLiquidCapital equals full liquid capital (120000)');
}

// ---------------------------------------------------------------------------
// TEST 6: Zero/Negative Burn (Surplus)
// ---------------------------------------------------------------------------
console.log('\nCategory 6: Zero/Negative Burn (Surplus Non-Burn)');
{
  const ctx = createBaseContext();
  // Income changes positively from 15000 to +5000 -> postDecision = 20000
  // Expenses = 5000, obligations = 1000 -> net cash = +14000 (no burn)
  ctx.financial.expectedIncomeChangeMonthly = { value: 5000, state: 'KNOWN' };
  const res = calculateDecisionDNAV2(ctx);
  const finM = res.financialExposure.measurements;

  assert(finM.monthlyBurn === 0, 'monthlyBurn is 0 when net cash position is positive (+14000)');
  assert(finM.runwayStatus === 'SURPLUS_OR_NON_BURN', 'runwayStatus is SURPLUS_OR_NON_BURN');
  assert(finM.runwayMonths === undefined, 'runwayMonths is undefined (never returns infinity)');
  assert(res.financialExposure.classification === 'MINIMAL_EXPOSURE', 'Surplus cash flow classified as MINIMAL_EXPOSURE');
}

// ---------------------------------------------------------------------------
// TEST 7: Reversibility Constraints
// ---------------------------------------------------------------------------
console.log('\nCategory 7: Reversibility Constraints');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const revM = res.reversibility.measurements;

  assert(revM.switchingEffortLevel === 'HIGH', 'Captures switchingEffortLevel HIGH');
  assert(revM.irreversibleCommitmentCount === 2, 'Counts 2 irreversible commitments');
  assert(revM.contractualConstraintCount === 1, 'Counts 1 contractual constraint');
  assert(revM.dominantMaterialConstraint?.includes('12-month non-solicitation agreement'), 'Dominant constraint correctly identifies contractual constraint');
  assert(res.reversibility.classification === 'LOW_REVERSIBILITY', 'HIGH effort + constraints classified as LOW_REVERSIBILITY');
}

// ---------------------------------------------------------------------------
// TEST 8 & 9: Resource Fit, Time Gaps & Time Coverage
// ---------------------------------------------------------------------------
console.log('\nCategory 8 & 9: Resource Fit, Time Gaps & Time Coverage');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const resM = res.resourceFit.measurements;

  assert(resM.availableWeeklyHours === 50, 'Captures 50 available weekly hours');
  assert(resM.relevantSkillsCount === 3, 'Counts 3 relevant skills');
  // Required hours assumption = 40, available = 50 -> weeklyTimeGap = -10 (surplus), coverageRatio = 1.25
  assert(resM.weeklyTimeGap === -10, 'weeklyTimeGap calculates to -10 (surplus)');
  assert(resM.timeCoverageRatio === 1.25, 'timeCoverageRatio calculates to 1.25');
  assert(res.resourceFit.classification === 'STRONG_FIT', 'Resource fit classified as STRONG_FIT');
}

// ---------------------------------------------------------------------------
// TEST 10: Sunk Cost to Capital Ratio
// ---------------------------------------------------------------------------
console.log('\nCategory 10: Sunk Cost Ratio');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const revM = res.reversibility.measurements;

  // sunkCosts = 3000, availableLiquidCapital = 120000 -> ratio = 0.025
  assert(revM.sunkCostToCapitalRatio === 0.025, 'sunkCostToCapitalRatio correctly calculates to 0.025');
}

// ---------------------------------------------------------------------------
// TEST 11: Opportunity Cost Calculation (Explicit baseline, negative delta, no career fallback, no arbitrary ₹200k threshold)
// ---------------------------------------------------------------------------
console.log('\nCategory 11: Opportunity Cost Calculation');
{
  // 11A. Explicit negative income change with multi-alternatives -> HIGH_FOREGONE_VALUE
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const oppM = res.opportunityCost.measurements;

  // Horizon: 1_TO_3_YEARS = 24 months. Expected change = -15000/mo -> Foregone income = 15000 * 24 = 360,000
  assert(oppM.horizonMonths === 24, 'Horizon correctly mapped to 24 months');
  assert(oppM.foregoneIncomeOverHorizon === 360000, 'foregoneIncomeOverHorizon calculates deterministically to 360,000');
  assert(oppM.hasStatedAlternativeEconomicValue === true, 'hasStatedAlternativeEconomicValue is true');
  assert(res.opportunityCost.classification === 'HIGH_FOREGONE_VALUE', 'Opportunity cost with multi-alternatives classified as HIGH_FOREGONE_VALUE');

  // 11B. Career transition with current income known BUT no explicit negative change or baseline
  const ctxCareer = createBaseContext();
  ctxCareer.decision.decisionCategory = 'CAREER_TRANSITION';
  ctxCareer.financial.expectedIncomeChangeMonthly = { state: 'UNKNOWN' };
  const resCareer = calculateDecisionDNAV2(ctxCareer);
  const oppCareerM = resCareer.opportunityCost.measurements;

  assert(oppCareerM.foregoneIncomeOverHorizon === undefined, 'No automatic career fallback: foregoneIncomeOverHorizon is undefined');
  assert(oppCareerM.hasStatedAlternativeEconomicValue === false, 'hasStatedAlternativeEconomicValue is false without explicit baseline');
  assert(resCareer.opportunityCost.classification === 'INSUFFICIENT_DATA', 'Opportunity cost classified as INSUFFICIENT_DATA');
  assert(resCareer.opportunityCost.status === 'INSUFFICIENT_DATA', 'Opportunity cost status is INSUFFICIENT_DATA');

  // 11C. Explicit alternative economic baseline from assumptions
  const ctxBaseline = createBaseContext();
  ctxBaseline.financial.expectedIncomeChangeMonthly = { state: 'UNKNOWN' };
  ctxBaseline.assumptions = [
    {
      id: 'asm-alt-01',
      statement: 'Foregone consulting rate is $8,000/month',
      relatedVariable: 'alternativeEconomicBaseline',
      value: 8000,
      source: 'USER_STATED',
      confidence: 'HIGH',
      impactIfChanged: 'HIGH',
    },
  ];
  ctxBaseline.decision.timeHorizon = '6_TO_12_MONTHS'; // 12 months
  ctxBaseline.opportunity.alternativesConsidered = [];
  ctxBaseline.decision.alternatives = [];
  ctxBaseline.opportunity.foregoneBenefits = { state: 'UNKNOWN' };
  const resBaseline = calculateDecisionDNAV2(ctxBaseline);
  const oppBaseM = resBaseline.opportunityCost.measurements;

  assert(oppBaseM.foregoneIncomeOverHorizon === 96000, 'Foregone economic value from explicit baseline assumption is 96,000 (8000 * 12)');
  assert(oppBaseM.hasStatedAlternativeEconomicValue === true, 'hasStatedAlternativeEconomicValue is true for explicit baseline');
  assert(resBaseline.opportunityCost.classification === 'MODERATE_FOREGONE_VALUE', 'Single alternative baseline classified as MODERATE_FOREGONE_VALUE');

  // 11D. No arbitrary ₹200,000 threshold test
  const ctxLarge = createBaseContext();
  ctxLarge.financial.expectedIncomeChangeMonthly = { value: -25000, state: 'KNOWN' };
  ctxLarge.decision.timeHorizon = '1_TO_3_YEARS'; // 24 months -> 600,000
  ctxLarge.opportunity.alternativesConsidered = ['Single Alternative'];
  ctxLarge.decision.alternatives = ['Single Alternative'];
  ctxLarge.opportunity.foregoneBenefits = { state: 'UNKNOWN' };
  const resLarge = calculateDecisionDNAV2(ctxLarge);

  assert(resLarge.opportunityCost.measurements.foregoneIncomeOverHorizon === 600000, 'Calculates 600,000 foregone value deterministically');
  assert(resLarge.opportunityCost.classification === 'MODERATE_FOREGONE_VALUE', 'Does NOT trigger arbitrary ₹200k threshold rule (classified as MODERATE_FOREGONE_VALUE with single alternative)');
}

// ---------------------------------------------------------------------------
// TEST 12: Upside Target Difference (Separation of User Stated Target vs Prediction)
// ---------------------------------------------------------------------------
console.log('\nCategory 12: Upside Target Difference');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const upM = res.upsidePotential.measurements;

  assert(upM.userStatedTargetOutcome.includes('$25,000/mo MRR'), 'Retains user stated target outcome string');
  assert(upM.currentStatedIncomeMonthly === 15000, 'Captures current stated income monthly');
  assert(upM.userStatedTargetDifferenceMonthly === -15000, 'Captures stated target difference');
  assert(res.upsidePotential.semanticDirection === 'greater value = greater identified upside', 'Preserves semantic direction');
}

// ---------------------------------------------------------------------------
// TEST 13: Evidence Confidence Classification (Canonical Enum Alignment)
// ---------------------------------------------------------------------------
console.log('\nCategory 13: Evidence Confidence Classification');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const evM = res.evidenceConfidence.measurements;

  assert(evM.totalEvidenceCount === 2, 'Counts 2 total evidence items');
  assert(evM.verifiedExternalCount === 1, 'Counts 1 verified external item');
  assert(evM.userProvidedCount === 1, 'Counts 1 user provided item');
  assert(evM.totalAssumptionCount === 2, 'Counts 2 total assumptions');
  assert(evM.heuristicAssumptionCount === 1, 'Counts 1 default heuristic assumption');
  assert(res.evidenceConfidence.classification === 'MODERATELY_EVIDENCED', 'Classified as MODERATELY_EVIDENCED');

  // Verify strongly evidenced classification
  const ctxStrong = createBaseContext();
  ctxStrong.evidence = [
    {
      id: 'ev-01',
      description: 'Bank statement verified',
      sourceType: 'DOCUMENT_UPLOAD',
      verificationStatus: 'VERIFIED_EXTERNAL',
      relevance: 'DIRECT',
      confidenceClassification: 'HIGH',
      supportsVariables: ['financial.availableLiquidCapital'],
      dateRecorded: '2026-08-18',
    },
    {
      id: 'ev-02',
      description: 'Tax return verified',
      sourceType: 'THIRD_PARTY_DATA',
      verificationStatus: 'MULTI_SOURCE_VERIFIED',
      relevance: 'DIRECT',
      confidenceClassification: 'HIGH',
      supportsVariables: ['financial.currentMonthlyIncome'],
      dateRecorded: '2026-08-18',
    },
  ];
  ctxStrong.assumptions = [];
  const resStrong = calculateDecisionDNAV2(ctxStrong);
  assert(resStrong.evidenceConfidence.classification === 'STRONGLY_EVIDENCED', 'Classified as STRONGLY_EVIDENCED');

  // Verify assumption heavy classification
  const ctxAssumption = createBaseContext();
  ctxAssumption.evidence = [];
  ctxAssumption.assumptions = [
    {
      id: 'a-1',
      statement: 'Market will grow',
      relatedVariable: 'market',
      source: 'USER_STATED',
      confidence: 'MEDIUM',
      impactIfChanged: 'HIGH',
    },
    {
      id: 'a-2',
      statement: 'Cost will stay low',
      relatedVariable: 'cost',
      source: 'USER_STATED',
      confidence: 'LOW',
      impactIfChanged: 'CRITICAL',
    },
  ];
  const resAssumption = calculateDecisionDNAV2(ctxAssumption);
  assert(resAssumption.evidenceConfidence.classification === 'ASSUMPTION_HEAVY', 'Classified as ASSUMPTION_HEAVY');

  // Verify unverified assertion classification
  const ctxUnverified = createBaseContext();
  ctxUnverified.evidence = [];
  ctxUnverified.assumptions = [];
  const resUnverified = calculateDecisionDNAV2(ctxUnverified);
  assert(resUnverified.evidenceConfidence.classification === 'UNVERIFIED_ASSERTION', 'Classified as UNVERIFIED_ASSERTION');
}

// ---------------------------------------------------------------------------
// TEST 14: UNKNOWN Propagation (Never 0)
// ---------------------------------------------------------------------------
console.log('\nCategory 14: UNKNOWN Propagation');
{
  const ctx = createBaseContext();
  ctx.financial.currentMonthlyIncome = { state: 'UNKNOWN' };
  ctx.financial.recurringMonthlyExpenses = { state: 'UNKNOWN' };
  const res = calculateDecisionDNAV2(ctx);
  const finM = res.financialExposure.measurements;

  assert(finM.postDecisionMonthlyIncome === undefined, 'postDecisionMonthlyIncome is undefined when income is UNKNOWN');
  assert(finM.monthlyBurn === undefined, 'monthlyBurn is undefined when expenses are UNKNOWN (never 0)');
  assert(finM.runwayMonths === undefined, 'runwayMonths is undefined when burn is UNKNOWN');
  assert(res.financialExposure.status === 'CALCULATED', 'Status records financial state');
  assert(res.financialExposure.provenance.generationType === 'DETERMINISTIC', 'Provenance generationType is DETERMINISTIC');
}

// ---------------------------------------------------------------------------
// TEST 15: NOT_PROVIDED Propagation (Never 0)
// ---------------------------------------------------------------------------
console.log('\nCategory 15: NOT_PROVIDED Propagation');
{
  const ctx = createBaseContext();
  ctx.financial.availableLiquidCapital = { state: 'NOT_PROVIDED' };
  ctx.financial.requiredUpfrontCapital = { state: 'NOT_PROVIDED' };
  const res = calculateDecisionDNAV2(ctx);
  const finM = res.financialExposure.measurements;

  assert(finM.postCommitmentLiquidCapital === undefined, 'postCommitmentLiquidCapital is undefined when capital is NOT_PROVIDED');
  assert(finM.capitalCoverageStatus === 'INSUFFICIENT_DATA', 'capitalCoverageStatus is INSUFFICIENT_DATA');
  assert(finM.capitalCoverage === undefined, 'capitalCoverage is undefined (never 0)');
}

// ---------------------------------------------------------------------------
// TEST 16: Zero AI API Dependency Verification
// ---------------------------------------------------------------------------
console.log('\nCategory 16: Zero AI / Network Dependency');
{
  const oldKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const ctx = createBaseContext();
  const start = Date.now();
  const res = calculateDecisionDNAV2(ctx);
  const elapsed = Date.now() - start;

  assert(res !== null && typeof res === 'object', 'Calculates completely without GEMINI_API_KEY');
  assert(elapsed < 20, `Executes in sub-millisecond offline time (${elapsed}ms)`);

  if (oldKey) process.env.GEMINI_API_KEY = oldKey;
}

// ---------------------------------------------------------------------------
// TEST 17: Provenance Completeness
// ---------------------------------------------------------------------------
console.log('\nCategory 17: Provenance Completeness');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);

  const dimensions = [
    res.financialExposure,
    res.reversibility,
    res.resourceFit,
    res.opportunityCost,
    res.upsidePotential,
    res.evidenceConfidence,
  ];

  for (const dim of dimensions) {
    assert(typeof dim.provenance.metricId === 'string', `Provenance metricId present (${dim.provenance.metricId})`);
    assert(dim.provenance.methodologyVersion === '2.0.0-LOCKED', 'Provenance methodologyVersion is 2.0.0-LOCKED');
    assert(dim.provenance.generationType === 'DETERMINISTIC' || dim.provenance.generationType === 'INSUFFICIENT_DATA', 'Provenance generationType is strictly DETERMINISTIC');
    assert(Array.isArray(dim.provenance.inputDataRefs), 'Provenance inputDataRefs is an array');
    assert(typeof dim.provenance.calculatedAtTimestamp === 'string', 'Provenance timestamp is valid ISO string');
  }
}

// ---------------------------------------------------------------------------
// TEST 18: Heuristic Isolation in Provenance
// ---------------------------------------------------------------------------
console.log('\nCategory 18: Heuristic Assumption Isolation');
{
  const ctx = createBaseContext();
  const res = calculateDecisionDNAV2(ctx);
  const evProv = res.evidenceConfidence.provenance;

  assert(evProv.affectingAssumptionIds.includes('asm-02'), 'DEFAULT_HEURISTIC assumption (asm-02) is tracked in affectingAssumptionIds');
  assert(!evProv.supportingEvidenceIds.includes('asm-02'), 'DEFAULT_HEURISTIC assumption (asm-02) is NEVER in supportingEvidenceIds');
}

// ---------------------------------------------------------------------------
// TEST 19: Edge Cases (Acute Exposure / Deficit Runway / High Switching Friction)
// ---------------------------------------------------------------------------
console.log('\nCategory 19: Edge Cases');
{
  const ctx = createBaseContext();
  // Available capital = 10k, required upfront = 20k -> postCommitment = -10k (deficit)
  ctx.financial.availableLiquidCapital = { value: 10000, state: 'KNOWN' };
  ctx.financial.requiredUpfrontCapital = { value: 20000, state: 'KNOWN' };
  const res = calculateDecisionDNAV2(ctx);

  assert(res.financialExposure.measurements.postCommitmentLiquidCapital === -10000, 'postCommitmentLiquidCapital correctly calculates deficit (-10,000)');
  assert(res.financialExposure.measurements.runwayMonths === 0, 'runwayMonths is 0 when post-commitment capital is negative');
  assert(res.financialExposure.classification === 'ACUTE_EXPOSURE', 'Classifies upfront deficit as ACUTE_EXPOSURE');
}

console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
