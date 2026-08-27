/**
 * ORACLE 2035 V2 — Phase 1 Test Suite
 * Validation Engine, Data Availability, and Provenance Contracts
 */

import { validateV2DecisionPayload } from '../src/validation/decisionSchema';
import { V2DecisionPayload } from '../src/types/v2';

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
console.log('ORACLE 2035 V2 - PHASE 1 TEST SUITE');
console.log('==================================================\n');

// ---------------------------------------------------------------------------
// TEST 1: Valid Decision Payload with Complete Context
// ---------------------------------------------------------------------------
console.log('Suite 1: Valid Complete Payload');
{
  const fullPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Leave senior engineering role at tech firm to bootstrap AI decision platform',
      decisionCategory: 'BUSINESS_STARTUP',
      currentSituation: 'Employed full-time with $180k salary and stable benefits',
      desiredOutcome: 'Achieve $25k MRR within 18 months with full founder ownership',
      alternatives: [
        'Stay at current employer and build as side-project',
        'Join early-stage seed startup as founding engineer with equity'
      ],
      timeHorizon: '1_TO_3_YEARS',
    },
    financial: {
      currentMonthlyIncome: { value: 15000, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 6500, state: 'KNOWN' },
      availableLiquidCapital: { value: 120000, state: 'KNOWN' },
      existingFinancialObligations: { value: 1200, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: -15000, state: 'ESTIMATED_BY_USER' },
      requiredUpfrontCapital: { value: 25000, state: 'KNOWN' },
      currency: 'USD',
    },
    resources: {
      relevantSkills: { value: ['TypeScript', 'Distributed Systems', 'Applied ML'], state: 'KNOWN' },
      experienceYears: { value: 9, state: 'KNOWN' },
      availableWeeklyHours: { value: 60, state: 'KNOWN' },
      availableSupportNetwork: { value: ['2 Technical Advisors', '1 Angel Investor'], state: 'KNOWN' },
      availablePhysicalAssets: { value: ['Dedicated Workstation', 'High-speed Fiber'], state: 'KNOWN' },
    },
    opportunity: {
      primaryOpportunity: 'First-mover in grounded probabilistic decision simulations for leadership teams',
      alternativesConsidered: ['Side project bootstrap', 'Venture backed pre-seed'],
      opportunityCostSummary: { value: 'Foregoing $180k salary and annual refresher equity', state: 'KNOWN' },
      foregoneBenefits: { value: ['Corporate 401k match', 'Comprehensive health coverage'], state: 'KNOWN' },
    },
    reversibility: {
      estimatedSwitchingEffort: { value: 'HIGH', state: 'KNOWN' },
      irreversibleCommitments: { value: ['Notice period served to employer', 'Public venture launch'], state: 'KNOWN' },
      sunkCostsAmount: { value: 5000, state: 'KNOWN' },
      contractualConstraints: { value: ['12-month non-solicitation agreement'], state: 'KNOWN' },
      unwindingTimeMonths: { value: 4, state: 'ESTIMATED_BY_USER' },
    },
    evidence: [
      {
        id: 'ev-001',
        sourceType: 'USER_STATEMENT',
        description: 'Verified 18 months of personal runway in high-yield liquid savings',
        verificationStatus: 'USER_PROVIDED',
        relevance: 'DIRECT',
        confidenceClassification: 'HIGH',
        supportsVariables: ['financial.availableLiquidCapital'],
      },
    ],
    assumptions: [
      {
        id: 'asm-001',
        statement: 'Core MVP can be delivered to beta customers within 4 months',
        relatedVariable: 'timeHorizon',
        source: 'USER_STATED',
        confidence: 'MEDIUM',
        impactIfChanged: 'HIGH',
      },
    ],
  };

  const res = validateV2DecisionPayload(fullPayload);
  assert(res.valid === true, 'Accepts valid complete decision payload');
  assert(res.errors.length === 0, 'No validation errors on complete payload');
  assert(res.data !== undefined, 'Returns validated data context');
  assert(res.data?.decision.decisionCategory === 'BUSINESS_STARTUP', 'Retains typed category');
  assert(res.data?.financial.currentMonthlyIncome.value === 15000, 'Retains financial value');
  assert(res.data?.evidence.length === 1, 'Preserves evidence list');
  assert(res.data?.assumptions.length === 1, 'Preserves assumptions list');
}

// ---------------------------------------------------------------------------
// TEST 2: Missing Optional Fields & Explicit UNKNOWN / NOT_PROVIDED States
// ---------------------------------------------------------------------------
console.log('\nSuite 2: Missing Optional Fields & UNKNOWN States');
{
  const minimalPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Relocate to Tokyo office for 2-year assignment',
      decisionCategory: 'RELOCATION_GEO',
      currentSituation: 'Based in London HQ',
      desiredOutcome: 'Lead APAC regional engineering team',
      alternatives: ['Remain in London HQ'],
      timeHorizon: '1_TO_3_YEARS',
    },
    // financial context is omitted entirely
  };

  const res = validateV2DecisionPayload(minimalPayload);
  assert(res.valid === true, 'Accepts payload with omitted optional context blocks');
  assert(res.data?.financial.currentMonthlyIncome.state === 'NOT_PROVIDED', 'Omitted income defaults to NOT_PROVIDED');
  assert(res.data?.financial.currentMonthlyIncome.value === undefined, 'NOT_PROVIDED does NOT inject 0 for income');
  assert(res.data?.financial.availableLiquidCapital.state === 'NOT_PROVIDED', 'Omitted capital defaults to NOT_PROVIDED');
  assert(res.data?.financial.availableLiquidCapital.value === undefined, 'NOT_PROVIDED does NOT inject 0 for capital');
}

// ---------------------------------------------------------------------------
// TEST 3: Explicit UNKNOWN State Preservation (Never Coerced to 0)
// ---------------------------------------------------------------------------
console.log('\nSuite 3: Explicit UNKNOWN Non-Coercion');
{
  const payloadWithUnknown: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Invest $50k in early stage healthtech angel round',
      decisionCategory: 'CAPITAL_ALLOCATION',
      currentSituation: 'Evaluating term sheet from founder',
      desiredOutcome: '5-10x strategic liquidity in 7-10 years',
      alternatives: ['Index fund investment', 'Keep in treasury bills'],
      timeHorizon: '5_TO_10_YEARS',
    },
    financial: {
      requiredUpfrontCapital: { value: 50000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { state: 'UNKNOWN' }, // explicitly unknown
    },
    reversibility: {
      unwindingTimeMonths: { state: 'UNKNOWN' },
    },
  };

  const res = validateV2DecisionPayload(payloadWithUnknown);
  assert(res.valid === true, 'Accepts explicit UNKNOWN state fields');
  assert(res.data?.financial.expectedIncomeChangeMonthly.state === 'UNKNOWN', 'Preserves UNKNOWN state');
  assert(res.data?.financial.expectedIncomeChangeMonthly.value === undefined, 'UNKNOWN does not become 0 (must remain undefined)');
  assert(res.data?.reversibility.unwindingTimeMonths.state === 'UNKNOWN', 'Preserves UNKNOWN unwinding time');
  assert(res.data?.reversibility.unwindingTimeMonths.value === undefined, 'UNKNOWN unwinding time does not become 0');
}

// ---------------------------------------------------------------------------
// TEST 4: Invalid Numeric Values & Range Validation
// ---------------------------------------------------------------------------
console.log('\nSuite 4: Invalid Numeric Values & Range Constraints');
{
  const negativeNumbersPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Buy commercial property',
      decisionCategory: 'CAPITAL_ALLOCATION',
      currentSituation: 'Leasing space',
      desiredOutcome: 'Build equity',
      alternatives: ['Continue lease'],
      timeHorizon: '5_TO_10_YEARS',
    },
    financial: {
      currentMonthlyIncome: { value: -5000, state: 'KNOWN' }, // Invalid: negative income
      recurringMonthlyExpenses: { value: -1200, state: 'KNOWN' }, // Invalid: negative expenses
      availableLiquidCapital: { value: -50000, state: 'KNOWN' }, // Invalid: negative capital
    },
    resources: {
      experienceYears: { value: 150, state: 'KNOWN' }, // Invalid: > 100 years
      availableWeeklyHours: { value: 500, state: 'KNOWN' }, // Invalid: 500 hours > 168 hours/week (must NOT be silently clamped)
    },
  };

  const res = validateV2DecisionPayload(negativeNumbersPayload);
  assert(res.valid === false, 'Rejects payload with invalid negative numbers and out-of-range hours');
  assert(res.errors.some(e => e.path === 'financial.currentMonthlyIncome.value'), 'Flags negative currentMonthlyIncome');
  assert(res.errors.some(e => e.path === 'financial.recurringMonthlyExpenses.value'), 'Flags negative recurringMonthlyExpenses');
  assert(res.errors.some(e => e.path === 'financial.availableLiquidCapital.value'), 'Flags negative availableLiquidCapital');
  assert(res.errors.some(e => e.path === 'resources.availableWeeklyHours.value'), 'Flags weekly hours 500 > 168 without silent clamping');
  assert(res.errors.some(e => e.path === 'resources.experienceYears.value'), 'Flags experience years 150 > 100 without silent clamping');
}

// ---------------------------------------------------------------------------
// TEST 5: Invalid Enum Values
// ---------------------------------------------------------------------------
console.log('\nSuite 5: Invalid Enum Values');
{
  const invalidEnumsPayload = {
    decision: {
      decisionStatement: 'Pivot product direction',
      decisionCategory: 'INVALID_CATEGORY_NAME', // Invalid
      currentSituation: 'Current product plateaued',
      desiredOutcome: 'New growth vector',
      alternatives: [],
      timeHorizon: 'INVALID_TIME_HORIZON', // Invalid
    },
    reversibility: {
      estimatedSwitchingEffort: { value: 'IMPOSSIBLY_HARD', state: 'KNOWN' }, // Invalid
    },
  };

  const res = validateV2DecisionPayload(invalidEnumsPayload);
  assert(res.valid === false, 'Rejects invalid enum values');
  assert(res.errors.some(e => e.path === 'decision.decisionCategory'), 'Flags invalid decision category enum');
  assert(res.errors.some(e => e.path === 'decision.timeHorizon'), 'Flags invalid time horizon enum');
  assert(res.errors.some(e => e.path === 'reversibility.estimatedSwitchingEffort.value'), 'Flags invalid switching effort enum');
}

// ---------------------------------------------------------------------------
// TEST 6: Malformed Evidence Objects
// ---------------------------------------------------------------------------
console.log('\nSuite 6: Malformed Evidence Objects');
{
  const malformedEvidencePayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Open new regional distribution hub',
      decisionCategory: 'BUSINESS_STARTUP',
      currentSituation: 'Single hub operating at 95% capacity',
      desiredOutcome: 'Expand throughput by 150%',
      alternatives: ['Expand existing warehouse'],
      timeHorizon: '1_TO_3_YEARS',
    },
    evidence: [
      {
        id: '', // Invalid empty id
        sourceType: 'USER_STATEMENT',
        description: '', // Invalid empty description
        verificationStatus: 'INVALID_VERIFICATION_STATUS' as any,
        relevance: 'DIRECT',
        confidenceClassification: 'HIGH',
        supportsVariables: [],
      },
    ],
  };

  const res = validateV2DecisionPayload(malformedEvidencePayload);
  assert(res.valid === false, 'Rejects malformed evidence item');
  assert(res.errors.some(e => e.path === 'evidence[0].id'), 'Flags empty evidence id');
  assert(res.errors.some(e => e.path === 'evidence[0].description'), 'Flags empty evidence description');
  assert(res.errors.some(e => e.path === 'evidence[0].verificationStatus'), 'Flags invalid verification status');
}

// ---------------------------------------------------------------------------
// TEST 7: Malformed Assumption Objects
// ---------------------------------------------------------------------------
console.log('\nSuite 7: Malformed Assumption Objects');
{
  const malformedAssumptionPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Adopt new enterprise ERP system',
      decisionCategory: 'PRODUCT_STRATEGY',
      currentSituation: 'Legacy software slowing order fulfillment',
      desiredOutcome: 'Modern unified database across operations',
      alternatives: ['Patch existing system'],
      timeHorizon: '6_TO_12_MONTHS',
    },
    assumptions: [
      {
        id: 'asm-1',
        statement: '', // Invalid: empty statement
        relatedVariable: 'timeline',
        source: 'INVALID_SOURCE' as any,
        confidence: 'HIGH',
        impactIfChanged: 'EXTREME_CATASTROPHE' as any, // Invalid enum
      },
    ],
  };

  const res = validateV2DecisionPayload(malformedAssumptionPayload);
  assert(res.valid === false, 'Rejects malformed assumption item');
  assert(res.errors.some(e => e.path === 'assumptions[0].statement'), 'Flags empty assumption statement');
  assert(res.errors.some(e => e.path === 'assumptions[0].source'), 'Flags invalid assumption source');
  assert(res.errors.some(e => e.path === 'assumptions[0].impactIfChanged'), 'Flags invalid assumption impact level');
}

// ---------------------------------------------------------------------------
// TEST 8: Boundary Values
// ---------------------------------------------------------------------------
console.log('\nSuite 8: Boundary Values (0 expenses, exactly 168 hours/week, 0 years experience)');
{
  const boundaryPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Begin full-time open-source contribution sabbatical',
      decisionCategory: 'CAREER_TRANSITION',
      currentSituation: 'Debt-free with no living costs (family home)',
      desiredOutcome: 'Become core maintainer of major infrastructure library',
      alternatives: ['Part-time maintenance while consulting'],
      timeHorizon: '6_TO_12_MONTHS',
    },
    financial: {
      recurringMonthlyExpenses: { value: 0, state: 'KNOWN' }, // Exactly 0 (valid)
      availableLiquidCapital: { value: 0, state: 'KNOWN' }, // Exactly 0 (valid)
      currentMonthlyIncome: { value: 0, state: 'KNOWN' }, // Exactly 0 (valid)
    },
    resources: {
      experienceYears: { value: 0, state: 'KNOWN' }, // Exactly 0 (valid)
      availableWeeklyHours: { value: 168, state: 'KNOWN' }, // Exactly 168 (valid upper limit)
    },
  };

  const res = validateV2DecisionPayload(boundaryPayload);
  assert(res.valid === true, 'Accepts valid boundary numbers (0 expenses, 168 hours/week)');
  assert(res.data?.financial.recurringMonthlyExpenses.value === 0, 'Allows 0 as valid known quantity when stated');
  assert(res.data?.resources.availableWeeklyHours.value === 168, 'Allows 168 as maximum valid hours per week');
}

// ---------------------------------------------------------------------------
// TEST 9: Client-Supplied Calculated Metrics Rejection (Security Boundary)
// ---------------------------------------------------------------------------
console.log('\nSuite 9: Client-Supplied Calculated Metrics Rejection');
{
  const clientHackedPayload = {
    decision: {
      decisionStatement: 'Launch crypto trading bot',
      decisionCategory: 'BUSINESS_STARTUP',
      currentSituation: 'Testing prototype',
      desiredOutcome: 'Passive income',
      alternatives: [],
      timeHorizon: 'LESS_THAN_6_MONTHS',
    },
    // Client attempting to supply authoritative calculated scores
    calculatedDNA: { risk: 10, confidence: 99, verdict: 'GUARANTEED_SUCCESS' },
    simulationProbabilities: { best: 99, likely: 1, worst: 0 },
    confidenceScore: 99.9,
  };

  const res = validateV2DecisionPayload(clientHackedPayload);
  assert(res.valid === false, 'Rejects payload containing client-supplied calculated metrics');
  assert(res.errors.some(e => e.path === 'calculatedDNA' && e.code === 'UNAUTHORIZED_FIELD'), 'Flags unauthorized calculatedDNA');
  assert(res.errors.some(e => e.path === 'simulationProbabilities' && e.code === 'UNAUTHORIZED_FIELD'), 'Flags unauthorized simulationProbabilities');
  assert(res.errors.some(e => e.path === 'confidenceScore' && e.code === 'UNAUTHORIZED_FIELD'), 'Flags unauthorized confidenceScore');
}

// ---------------------------------------------------------------------------
// TEST 10: Payload Size & String Length Boundary Protection
// ---------------------------------------------------------------------------
console.log('\nSuite 10: Oversized String Payload Protection');
{
  const oversizedPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'A'.repeat(6000), // Exceeds 5000 character maximum
      decisionCategory: 'STRATEGIC_OTHER',
      currentSituation: 'Situation description',
      desiredOutcome: 'Outcome description',
      alternatives: [],
      timeHorizon: '1_TO_3_YEARS',
    },
  };

  const res = validateV2DecisionPayload(oversizedPayload);
  assert(res.valid === false, 'Rejects decision statement exceeding maximum allowed character length');
  assert(res.errors.some(e => e.code === 'PAYLOAD_TOO_LARGE'), 'Flags payload too large error');
}

// ---------------------------------------------------------------------------
// TEST 11: Heuristic Assumption Distinction & Provenance Verification
// ---------------------------------------------------------------------------
console.log('\nSuite 11: Heuristic Assumption Distinction & Provenance Verification');
{
  const heuristicPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Scale enterprise SaaS sales outreach',
      decisionCategory: 'BUSINESS_STARTUP',
      currentSituation: 'Product market fit validated on small accounts',
      desiredOutcome: 'Reach $100k ACV deals',
      alternatives: ['Continue SMB focus'],
      timeHorizon: '1_TO_3_YEARS',
    },
    assumptions: [
      {
        id: 'asm-heuristic-01',
        statement: 'Industry standard B2B sales cycle is ~90 days',
        relatedVariable: 'salesCycleDays',
        value: 90,
        source: 'DEFAULT_HEURISTIC', // Valid assumption source, but NOT evidence
        confidence: 'LOW',
        impactIfChanged: 'HIGH',
      },
    ],
    evidence: [
      {
        id: 'ev-invalid-heuristic',
        sourceType: 'DEFAULT_HEURISTIC' as any, // Invalid as evidence (heuristics are never verified evidence)
        description: 'Heuristic treated as evidence',
        verificationStatus: 'VERIFIED_EXTERNAL',
        relevance: 'DIRECT',
        confidenceClassification: 'HIGH',
        supportsVariables: ['salesCycleDays'],
      },
    ],
  };

  const res = validateV2DecisionPayload(heuristicPayload);
  assert(res.valid === false, 'Rejects payload where DEFAULT_HEURISTIC is masquerading as an evidence source');
  assert(res.errors.some(e => e.path === 'evidence[0].sourceType'), 'Enforces that DEFAULT_HEURISTIC cannot be an evidence source');
}

console.log('\n==================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
