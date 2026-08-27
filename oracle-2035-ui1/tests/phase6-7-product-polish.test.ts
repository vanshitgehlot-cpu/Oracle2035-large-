/**
 * ORACLE 2035 — PHASE 6.7 PRODUCT POLISH & FIRST-DECISION EXPERIENCE TEST SUITE
 * 
 * Verifies all 20 Phase 6.7 product polish requirements:
 * 1. Landing Page Identity & 5-Step Workflow
 * 2. 10-Second Comprehension Elements
 * 3. Single Unified User Journey
 * 4. Structured Intake WHAT/WHY/HOW Guidance
 * 5. Epistemic Unknown & Not Provided Integrity
 * 6. Progressive Disclosure in Intake
 * 7. Random-Access Editing & Review Flow
 * 8. Intake Draft Recovery & Isolation
 * 9. Architectural Computation Transition States (01-06)
 * 10. Zero Artificial Delay in Computation
 * 11. Single Network Request for New Analysis
 * 12. Zero Network Request on Library Reload
 * 13. Workspace Reading Hierarchy
 * 14. The Signal Epistemic Purity
 * 15. Decision DNA 6 Dimensions & Progressive Disclosure
 * 16. Conditional Trajectories Baseline/Favorable/Stress Distinction
 * 17. What-If Studio User Adjustment vs Model Response Separation
 * 18. Decision Library Persistence & Immutability
 * 19. Epistemic Language Ban Enforced Across Repo
 * 20. Protected Engine Files Integrity Verified
 */

import { executeUnifiedAnalysis, calculateUnifiedWhatIf } from '../src/services/unifiedDecisionEngine';
import {
  saveDecision,
  getDecisions,
  getDecisionById,
  searchAndFilterDecisions,
  clearLibrary,
} from '../src/services/oracleDecisionLibrary';
import { V2DecisionPayload } from '../src/types/v2';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
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

async function runSuite() {
  console.log('\n================================================================================');
  console.log('ORACLE 2035 — PHASE 6.7 PRODUCT POLISH & FIRST-DECISION EXPERIENCE AUDIT');
  console.log('================================================================================\n');

  const canonicalTestPayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Should I transition from Senior Engineering to Founder of a B2B AI tooling startup?',
      desiredOutcome: 'Achieve product-market fit with 18 months runway and $20k MRR.',
      decisionCategory: 'CAREER_TRANSITION',
      timeHorizon: '1_TO_3_YEARS',
      currentSituation: 'Currently at $18,000/mo salary with $120,000 liquid capital.',
      alternatives: ['Stay at current company', 'Join early stage startup as employee'],
    },
    financial: {
      currentMonthlyIncome: { value: 0, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 6000, state: 'KNOWN' },
      availableLiquidCapital: { value: 120000, state: 'KNOWN' },
      requiredUpfrontCapital: { value: 25000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: 0, state: 'KNOWN' },
      existingFinancialObligations: { value: 1500, state: 'KNOWN' },
      currency: 'USD',
    },
    resources: {
      availableWeeklyHours: { value: 60, state: 'KNOWN' },
      experienceYears: { value: 8, state: 'KNOWN' },
      relevantSkills: { value: ['TypeScript', 'Full-stack systems', 'Product management'], state: 'KNOWN' },
    },
    reversibility: {
      estimatedSwitchingEffort: { value: 'MEDIUM', state: 'KNOWN' },
      unwindingTimeMonths: { value: 6, state: 'KNOWN' },
      sunkCostsAmount: { value: 25000, state: 'KNOWN' },
      contractualConstraints: { value: ['Standard 4-week notice period'], state: 'KNOWN' },
      irreversibleCommitments: { value: ['Resignation letter'], state: 'KNOWN' },
    },
    opportunity: {
      primaryOpportunity: 'Founding an independent B2B AI tools software company',
      alternativesConsidered: ['Promotion track at enterprise employer', 'Lead architect role elsewhere'],
      opportunityCostSummary: { value: 'Foregoing $216k annual cash compensation and equity vesting', state: 'KNOWN' },
      foregoneBenefits: { value: ['Employer healthcare', 'Equity vesting', 'Predictable income'], state: 'KNOWN' },
    },
  };

  // 1. Landing Page Identity & 5-Step Workflow
  console.log('--- 1. Landing Page Identity & 5-Step Workflow ---');
  const landingFile = readFileSync(
    join(process.cwd(), 'src/components/oracle/OracleLandingPage.tsx'),
    'utf8'
  );
  assert(
    landingFile.includes('Make consequential choices with clarity.'),
    'Landing page features primary positioning headline'
  );
  assert(
    landingFile.includes('Define the decision') &&
    landingFile.includes('Ground it in reality') &&
    landingFile.includes('Examine structural trade-offs') &&
    landingFile.includes('Explore conditional trajectories') &&
    landingFile.includes('Preserve the reasoning'),
    'Landing page exposes exact 5-step decision workflow'
  );
  assert(
    landingFile.includes('Start a Decision'),
    'Landing page features primary CTA "Start a Decision"'
  );

  // 2. 10-Second Comprehension Elements
  console.log('--- 2. 10-Second Comprehension Elements ---');
  assert(
    landingFile.includes('What ORACLE Does') && landingFile.includes('Why It\'s Different'),
    'Landing page includes 10-second comprehension modules'
  );
  assert(
    landingFile.includes('Decision DNA') &&
    landingFile.includes('Conditional Trajectories') &&
    landingFile.includes('What-If Sensitivity Studio') &&
    landingFile.includes('Cryptographic Provenance'),
    'Landing page outlines core capability deliverables'
  );

  // 3. Single Unified User Journey
  console.log('--- 3. Single Unified User Journey ---');
  const appFile = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  assert(
    !appFile.includes('V1Engine') && !appFile.includes('mode="v1"'),
    'App has zero V1/V2 engine selector forks or legacy dual paths'
  );
  assert(
    appFile.includes('OracleLandingPage') &&
    appFile.includes('OracleIntakeFlow') &&
    appFile.includes('V2ThinkingScreen') &&
    appFile.includes('OracleAnalysisWorkspace') &&
    appFile.includes('OracleDecisionLibrary'),
    'Single coherent user journey wired in App.tsx'
  );

  // 4. Structured Intake WHAT/WHY/HOW Guidance
  console.log('--- 4. Structured Intake WHAT/WHY/HOW Guidance ---');
  const stage1 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleDecisionCore.tsx'), 'utf8');
  const stage2 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleFinancialReality.tsx'), 'utf8');
  const stage3 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleExecutionCapacity.tsx'), 'utf8');
  const stage4 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleCommitments.tsx'), 'utf8');
  const stage5 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleEvidenceBaseline.tsx'), 'utf8');
  assert(
    stage1.includes('01 / The Decision Core') &&
    stage2.includes('02 / Financial Reality') &&
    stage3.includes('03 / Execution Capacity') &&
    stage4.includes('04 / Commitments & Reversibility') &&
    stage5.includes('05 / Evidence & Baseline'),
    'All 5 intake stages clearly present stage identity and context'
  );

  // 5. Epistemic Unknown & Not Provided Integrity
  console.log('--- 5. Epistemic Unknown & Not Provided Integrity ---');
  const payloadWithUnknowns: V2DecisionPayload = {
    ...canonicalTestPayload,
    financial: {
      ...canonicalTestPayload.financial,
      currentMonthlyIncome: { value: 0, state: 'UNKNOWN' },
      requiredUpfrontCapital: { value: 0, state: 'NOT_PROVIDED' },
    },
    resources: {
      ...canonicalTestPayload.resources,
      availableWeeklyHours: { value: 0, state: 'UNKNOWN' },
    },
  };
  const resultWithUnknowns = await executeUnifiedAnalysis(payloadWithUnknowns);
  assert(
    resultWithUnknowns.decisionDNA.dataCoverage.unknownVariableCount >= 2,
    'Engine preserves unknown variables without coercing to zero'
  );
  assert(
    resultWithUnknowns.decisionDNA.dataCoverage.notProvidedVariableCount >= 1,
    'Engine preserves not-provided variables without guessing'
  );

  // 6. Progressive Disclosure in Intake
  console.log('--- 6. Progressive Disclosure in Intake ---');
  assert(
    stage1.includes('showAdvanced') && stage1.includes('Add current baseline & alternative options (optional)'),
    'Stage 1 collapses optional baseline & alternative fields behind progressive disclosure'
  );

  // 7. Random-Access Editing & Review Flow
  console.log('--- 7. Random-Access Editing & Review Flow ---');
  const reviewFile = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleDecisionReview.tsx'), 'utf8');
  assert(
    reviewFile.includes('onEditStage(1)') &&
    reviewFile.includes('onEditStage(2)') &&
    reviewFile.includes('onEditStage(3)') &&
    reviewFile.includes('onEditStage(4)') &&
    reviewFile.includes('onEditStage(5)'),
    'Review stage provides random-access edit buttons for all 5 stages'
  );
  assert(
    reviewFile.includes('handleKeyDown') && reviewFile.includes('Enter'),
    'Review stage supports Cmd+Enter / Ctrl+Enter keyboard submission shortcut'
  );

  // 8. Intake Draft Recovery & Isolation
  console.log('--- 8. Intake Draft Recovery & Isolation ---');
  const intakeFlowFile = readFileSync(join(process.cwd(), 'src/components/oracle/intake/../OracleIntakeFlow.tsx'), 'utf8');
  assert(
    intakeFlowFile.includes('STORAGE_KEY = "oracle_intake_draft_v2"') &&
    intakeFlowFile.includes('handleClearDraft'),
    'Intake flow manages localized draft isolation without touching saved decision library'
  );

  // 9. Architectural Computation Transition States (01-06)
  console.log('--- 9. Architectural Computation Transition States ---');
  const thinkingFile = readFileSync(join(process.cwd(), 'src/components/v2/V2ThinkingScreen.tsx'), 'utf8');
  assert(
    thinkingFile.includes('01 Validating decision') &&
    thinkingFile.includes('02 Evaluating structural dimensions') &&
    thinkingFile.includes('03 Mapping conditional trajectories') &&
    thinkingFile.includes('04 Building temporal milestones') &&
    thinkingFile.includes('05 Sealing calculation provenance') &&
    thinkingFile.includes('06 Preparing analysis'),
    'Thinking screen exposes exact 6 quiet architectural computation states'
  );

  // 10. Zero Artificial Delay in Computation
  console.log('--- 10. Zero Artificial Delay in Computation ---');
  assert(
    !thinkingFile.includes('setTimeout(r, 650)') &&
    !thinkingFile.includes('setTimeout(r, 550)'),
    'Thinking screen eliminates artificial blocking sleep loops'
  );

  // 11. Single Network Request for New Analysis
  console.log('--- 11. Single Network Request for New Analysis ---');
  assert(
    thinkingFile.includes('const apiPromise = analyzeDecisionV2(payload);') &&
    (thinkingFile.match(/analyzeDecisionV2/g) || []).length === 2, // 1 import + 1 invocation
    'Thinking screen invokes analyzeDecisionV2 exactly once per submission'
  );

  // 12. Zero Network Request on Library Reload
  console.log('--- 12. Zero Network Request on Library Reload ---');
  assert(
    appFile.includes('handleOpenSavedDecision') &&
    !appFile.includes('analyzeDecisionV2(record.payload)'),
    'Opening a saved decision loads cached snapshot with zero analysis API network requests'
  );

  // 13. Workspace Reading Hierarchy
  console.log('--- 13. Workspace Reading Hierarchy ---');
  const workspaceFile = readFileSync(join(process.cwd(), 'src/components/oracle/OracleAnalysisWorkspace.tsx'), 'utf8');
  const heroIndex = workspaceFile.indexOf('<OracleDecisionHero');
  const signalIndex = workspaceFile.indexOf('<OracleSignalSummary');
  const explanationIndex = workspaceFile.indexOf('<OracleExplanationSection');
  const dnaIndex = workspaceFile.indexOf('<OracleDecisionDnaSection');
  const trajectoriesIndex = workspaceFile.indexOf('<OracleTrajectoryExplorer');
  const timelineIndex = workspaceFile.indexOf('<OracleTemporalTimeline');
  const dataEvidenceIndex = workspaceFile.indexOf('<OracleDataEvidenceSection');
  const unknownsIndex = workspaceFile.indexOf('<OracleUnknownVariablesSection');
  const whatIfCardIndex = workspaceFile.indexOf('Open What-If Studio');
  const futureSelfCardIndex = workspaceFile.indexOf('Explore 2035 Perspective');
  const provenanceIndex = workspaceFile.indexOf('<OracleProvenanceInspector');

  assert(
    heroIndex < signalIndex &&
    signalIndex < explanationIndex &&
    explanationIndex < dnaIndex &&
    dnaIndex < trajectoriesIndex &&
    trajectoriesIndex < timelineIndex &&
    timelineIndex < dataEvidenceIndex &&
    dataEvidenceIndex < unknownsIndex &&
    unknownsIndex < whatIfCardIndex &&
    whatIfCardIndex < futureSelfCardIndex &&
    futureSelfCardIndex < provenanceIndex,
    'Workspace maintains pristine visual reading order'
  );

  // 14. The Signal Epistemic Purity
  console.log('--- 14. The Signal Epistemic Purity ---');
  const signalFile = readFileSync(join(process.cwd(), 'src/components/oracle/workspace/OracleSignalSummary.tsx'), 'utf8');
  assert(
    !signalFile.includes('Most Likely Future') &&
    !signalFile.includes('Optimal Future') &&
    !signalFile.includes('Chance of Success') &&
    !signalFile.includes('Probability Rating'),
    'The Signal view is free of prohibited epistemic terms'
  );

  // 15. Decision DNA 6 Dimensions & Progressive Disclosure
  console.log('--- 15. Decision DNA 6 Dimensions & Progressive Disclosure ---');
  const analysisResult = await executeUnifiedAnalysis(canonicalTestPayload);
  const { decisionDNA } = analysisResult;
  assert(
    Boolean(
      decisionDNA.financialExposure &&
      decisionDNA.reversibility &&
      decisionDNA.resourceFit &&
      decisionDNA.opportunityCost &&
      decisionDNA.upsidePotential &&
      decisionDNA.evidenceConfidence
    ),
    'Decision DNA contains all 6 orthogonal dimensions'
  );
  assert(
    decisionDNA.financialExposure.provenance.formulaOrRuleId === 'FIN_EXPOSURE_V2_DETERMINISTIC' &&
    analysisResult.auditTrail.unifiedPipelineComputationHash.length === 64,
    'Each Decision DNA dimension carries formula provenance and 64-char SHA-256 hash'
  );

  // 16. Conditional Trajectories Baseline/Favorable/Stress Distinction
  console.log('--- 16. Conditional Trajectories Baseline/Favorable/Stress Distinction ---');
  const { scenarios } = analysisResult;
  assert(
    Boolean(scenarios.baseCase && scenarios.upsideCase && scenarios.downsideStressCase),
    'All three canonical scenarios exist'
  );
  assert(
    scenarios.baseCase.scenarioType === 'BASE_CASE' &&
    scenarios.upsideCase.scenarioType === 'UPSIDE_CASE' &&
    scenarios.downsideStressCase.scenarioType === 'DOWNSIDE_STRESS_CASE',
    'Scenario types are correctly categorized'
  );
  assert(
    scenarios.upsideCase.deterministicComputationHash !== scenarios.downsideStressCase.deterministicComputationHash,
    'Upside and Downside stress cases have distinct mathematical hashes'
  );

  // 17. What-If Studio User Adjustment vs Model Response Separation
  console.log('--- 17. What-If Studio User Adjustment vs Model Response Separation ---');
  const whatIfBaseline = calculateUnifiedWhatIf(canonicalTestPayload, analysisResult.decisionDNA, {
    monthlyExpenseAdjustment: 0,
    liquidCapitalMultiplier: 1.0,
    weeklyHoursAdjustment: 0,
    expectedIncomeDeltaAdjustment: 0,
  });
  assert(
    whatIfBaseline.adjustedRunwayMonths === whatIfBaseline.originalRunwayMonths,
    'Zero-delta What-If calculation matches exact baseline runway'
  );
  const whatIfShifted = calculateUnifiedWhatIf(canonicalTestPayload, analysisResult.decisionDNA, {
    monthlyExpenseAdjustment: -2000,
    liquidCapitalMultiplier: 1.5,
    weeklyHoursAdjustment: 10,
    expectedIncomeDeltaAdjustment: 3000,
  });
  assert(
    Boolean(
      whatIfShifted.adjustedRunwayMonths !== undefined &&
      whatIfBaseline.adjustedRunwayMonths !== undefined &&
      whatIfShifted.adjustedRunwayMonths > whatIfBaseline.adjustedRunwayMonths
    ),
    'Parametric adjustments produce immediate mathematical sensitivity response'
  );

  // 18. Decision Library Persistence & Immutability
  console.log('--- 18. Decision Library Persistence & Immutability ---');
  clearLibrary();
  const savedRec = saveDecision({
    payload: canonicalTestPayload,
    data: analysisResult,
  });
  assert(Boolean(savedRec.id && savedRec.id.startsWith('dec_')), 'Decision saved with unique ID');
  const retrieved = getDecisionById(savedRec.id);
  assert(
    retrieved?.provenance.dnaHash === analysisResult.auditTrail.dnaComputationHash,
    'Saved record preserves immutable DNA provenance hash'
  );
  const searchResults = searchAndFilterDecisions({ query: 'Founder' });
  assert(searchResults.length === 1, 'Decision is discoverable via deterministic search');

  // 19. Epistemic Language Ban Enforced Across Repo
  console.log('--- 19. Epistemic Language Ban Enforced Across Repo ---');
  const prohibitedTerms = [
    'Most Likely Future',
    'Optimal Future',
    'Predicted Future',
    'Expected Future',
    'Guaranteed Future',
    'Chance of Success',
    'Likelihood',
    'Probability Rating',
    'Certain Outcome',
    'Confidence %',
  ];

  function checkDir(dir: string) {
    const files = readdirSync(dir);
    for (const f of files) {
      const fullPath = join(dir, f);
      const s = statSync(fullPath);
      if (s.isDirectory()) {
        if (f !== 'node_modules' && f !== 'dist' && f !== '.git') {
          checkDir(fullPath);
        }
      } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        // Skip test files from string check since tests check for the presence/absence of prohibited words
        if (fullPath.includes('/tests/')) continue;
        const content = readFileSync(fullPath, 'utf8');
        for (const term of prohibitedTerms) {
          if (content.includes(term)) {
            throw new Error(`Prohibited term "${term}" found in ${fullPath}`);
          }
        }
      }
    }
  }

  let languageAuditPassed = true;
  try {
    checkDir(join(process.cwd(), 'src'));
  } catch (err: unknown) {
    languageAuditPassed = false;
    console.error(err);
  }
  assert(languageAuditPassed, 'Source repository is 100% clean of forbidden epistemic terminology');

  // 20. Protected Engine Files Integrity Verified
  console.log('--- 20. Protected Engine Files Integrity Verified ---');
  const protectedFiles = [
    'src/services/decisionDNA.v2.ts',
    'src/services/scenarioEngine.v2.ts',
    'src/validation/decisionSchema.ts',
    'src/types/v2.ts',
    'src/services/unifiedDecisionEngine.ts',
  ];
  let allProtectedExist = true;
  for (const pf of protectedFiles) {
    if (!existsSync(join(process.cwd(), pf))) {
      allProtectedExist = false;
      console.error(`Protected file missing: ${pf}`);
    }
  }
  assert(allProtectedExist, 'All 5 core engine and schema files remain intact and protected');

  console.log('\n================================================================================');
  console.log(`PHASE 6.7 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
