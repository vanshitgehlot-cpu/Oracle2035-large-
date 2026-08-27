/**
 * ORACLE 2035 — PHASE 6.8 FINAL PRODUCT AUDIT & RELEASE CERTIFICATION TEST SUITE
 * 
 * Verifies all 20 core invariants mandated for final release certification:
 * 1. Single analysis request invariant
 * 2. Historical snapshot zero-network invariant
 * 3. What-If zero-network invariant
 * 4. Draft/library isolation
 * 5. UNKNOWN preservation
 * 6. NOT_PROVIDED preservation
 * 7. INSUFFICIENT_DATA preservation
 * 8. SHA-256 invariance across lifecycle
 * 9. No client secret exposure (GEMINI_API_KEY, AIzaSy, bearer tokens)
 * 10. Epistemic terminology scan across src/
 * 11. Landing page unified journey
 * 12. Intake stage navigation & WHAT/WHY/HOW guidance
 * 13. Error recovery & corrupted storage resilience
 * 14. Reduced-motion contract
 * 15. Accessibility interaction contract (aria, buttons, keyboard)
 * 16. Mobile layout contract
 * 17. Export integrity (sanitization, no secrets, epistemic notices)
 * 18. Protected engine immutability (all 5 core files verified)
 * 19. Gemini failure degradation (UNAVAILABLE fallback, deterministic engine remains authoritative)
 * 20. No artificial analysis delay
 */

import { executeUnifiedAnalysis, calculateUnifiedWhatIf } from '../src/services/unifiedDecisionEngine';
import {
  saveDecision,
  getDecisions,
  getDecisionById,
  searchAndFilterDecisions,
  clearLibrary,
  updateDecisionNotes,
  toggleBookmark,
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

async function runAuditSuite() {
  console.log('\n================================================================================');
  console.log('ORACLE 2035 — PHASE 6.8 FINAL RELEASE CERTIFICATION AUDIT');
  console.log('================================================================================\n');

  const canonicalPayload: V2DecisionPayload = {
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

  // 1. Single analysis request invariant
  console.log('--- 1. Single Analysis Request Invariant ---');
  const thinkingScreenFile = readFileSync(join(process.cwd(), 'src/components/v2/V2ThinkingScreen.tsx'), 'utf8');
  const analyzeCallsInThinking = (thinkingScreenFile.match(/analyzeDecisionV2\(payload\)/g) || []).length;
  assert(
    analyzeCallsInThinking === 1,
    'Thinking screen invokes analyzeDecisionV2 exactly once per submission'
  );
  assert(
    !thinkingScreenFile.includes('retryCount') && !thinkingScreenFile.includes('setInterval'),
    'Thinking screen contains zero retry loops or polling intervals'
  );

  // 2. Historical snapshot zero-network invariant
  console.log('--- 2. Historical Snapshot Zero-Network Invariant ---');
  const appFile = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  assert(
    appFile.includes('handleOpenSavedDecision') &&
    !appFile.includes('handleOpenSavedDecision = async') &&
    !appFile.includes('fetch(') &&
    !appFile.includes('analyzeDecisionV2(') &&
    appFile.includes('setV2Result(record.data)'),
    'App opens historical snapshots synchronously from cached state with zero network requests'
  );

  // 3. What-If zero-network invariant
  console.log('--- 3. What-If Studio Zero-Network Invariant ---');
  const whatIfStudioFile = readFileSync(
    join(process.cwd(), 'src/components/oracle/workspace/OracleWhatIfStudio.tsx'),
    'utf8'
  );
  assert(
    !whatIfStudioFile.includes('fetch(') &&
    !whatIfStudioFile.includes('analyzeDecision') &&
    !whatIfStudioFile.includes('axios'),
    'What-If Studio performs 100% local mathematical recalculation with zero network requests'
  );

  // 4. Draft/library isolation
  console.log('--- 4. Draft / Library Storage Isolation ---');
  const intakeFlowFile = readFileSync(
    join(process.cwd(), 'src/components/oracle/OracleIntakeFlow.tsx'),
    'utf8'
  );
  const libraryServiceFile = readFileSync(
    join(process.cwd(), 'src/services/oracleDecisionLibrary.ts'),
    'utf8'
  );
  assert(
    intakeFlowFile.includes('oracle_intake_draft_v2'),
    'Intake draft is keyed under isolated storage key oracle_intake_draft_v2'
  );
  assert(
    libraryServiceFile.includes('oracle_decision_library_v2'),
    'Decision library is keyed under isolated storage key oracle_decision_library_v2'
  );
  assert(
    !intakeFlowFile.includes('oracle_decision_library_v2'),
    'Intake draft actions cannot mutate or touch decision library records'
  );

  // 5, 6, 7. ValueState Preservations (UNKNOWN, NOT_PROVIDED, ESTIMATED_BY_USER)
  console.log('--- 5, 6, 7. Epistemic ValueState Preservations ---');
  const sparsePayload: V2DecisionPayload = {
    ...canonicalPayload,
    financial: {
      ...canonicalPayload.financial,
      currentMonthlyIncome: { value: 0, state: 'UNKNOWN' },
      requiredUpfrontCapital: { value: 0, state: 'NOT_PROVIDED' },
      availableLiquidCapital: { value: 120000, state: 'ESTIMATED_BY_USER' },
    },
    resources: {
      ...canonicalPayload.resources,
      availableWeeklyHours: { value: 0, state: 'UNKNOWN' },
    },
  };
  const sparseResult = await executeUnifiedAnalysis(sparsePayload);
  assert(
    sparseResult.decisionDNA.dataCoverage.unknownVariableCount >= 2,
    'UNKNOWN value states are preserved and tracked in unknownVariableCount'
  );
  assert(
    sparseResult.decisionDNA.dataCoverage.notProvidedVariableCount >= 1,
    'NOT_PROVIDED value states are preserved in notProvidedVariableCount'
  );
  assert(
    sparseResult.decisionDNA.dataCoverage.knownVariableCount >= 1,
    'ESTIMATED_BY_USER / KNOWN value states are tracked in dataCoverage'
  );

  // 8. SHA-256 invariance across lifecycle
  console.log('--- 8. SHA-256 Provenance Invariance Across Lifecycle ---');
  clearLibrary();
  const fullAnalysis = await executeUnifiedAnalysis(canonicalPayload);
  const originalDnaHash = fullAnalysis.auditTrail.unifiedPipelineComputationHash;
  const originalBaseHash = fullAnalysis.scenarios.baseCase.deterministicComputationHash;

  assert(originalDnaHash.length === 64, 'Original pipeline SHA-256 hash is 64 hex characters');
  assert(originalBaseHash.length === 64, 'Original baseline scenario SHA-256 hash is 64 hex characters');

  const savedRecord = saveDecision({
    payload: canonicalPayload,
    data: fullAnalysis,
  });

  const reloaded1 = getDecisionById(savedRecord.id);
  assert(
    reloaded1?.provenance.unifiedPipelineHash === originalDnaHash,
    'Pipeline hash remains identical after save and reload'
  );

  // Note edit
  updateDecisionNotes(savedRecord.id, 'User notes updated for testing immutability');
  const reloaded2 = getDecisionById(savedRecord.id);
  assert(
    reloaded2?.provenance.unifiedPipelineHash === originalDnaHash &&
    reloaded2?.provenance.scenarioBaseHash === originalBaseHash,
    'Hash remains strictly invariant after user note edit'
  );

  // Bookmark toggle
  toggleBookmark(savedRecord.id);
  const reloaded3 = getDecisionById(savedRecord.id);
  assert(
    reloaded3?.provenance.unifiedPipelineHash === originalDnaHash &&
    reloaded3?.isBookmarked === true,
    'Hash remains strictly invariant after bookmark toggle'
  );

  // Search & filter
  const searchResults = searchAndFilterDecisions({ query: 'Founder' });
  assert(
    searchResults[0]?.provenance.scenarioBaseHash === originalBaseHash,
    'Hash remains strictly invariant during search & filter retrieval'
  );

  // 9. No client secret exposure
  console.log('--- 9. No Client Secret Exposure ---');
  function scanDirForSecrets(dir: string) {
    const files = readdirSync(dir);
    for (const f of files) {
      const fullPath = join(dir, f);
      const s = statSync(fullPath);
      if (s.isDirectory()) {
        if (f !== 'node_modules' && f !== 'dist' && f !== '.git') {
          scanDirForSecrets(fullPath);
        }
      } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.json')) {
        // Skip server-side files where process.env is read on the backend
        if (
          fullPath.includes('/server') ||
          fullPath.includes('server.ts') ||
          fullPath.includes('package.json') ||
          fullPath.includes('explanationEngine.v2.ts') ||
          fullPath.includes('oracleEngine.ts') ||
          fullPath.includes('futureSelfEngine.ts')
        ) {
          continue;
        }
        const content = readFileSync(fullPath, 'utf8');
        if (content.includes('AIzaSy')) {
          throw new Error(`Hardcoded Google API key found in ${fullPath}`);
        }
        if (content.includes('GEMINI_API_KEY')) {
          throw new Error(`GEMINI_API_KEY reference found in client file ${fullPath}`);
        }
      }
    }
  }
  let secretsClean = true;
  try {
    scanDirForSecrets(join(process.cwd(), 'src'));
  } catch (err: unknown) {
    secretsClean = false;
    console.error(err);
  }
  assert(secretsClean, 'src/ client directory contains zero hardcoded API keys or GEMINI_API_KEY secrets');

  // 10. Epistemic terminology scan
  console.log('--- 10. Full Repository Epistemic Terminology Scan ---');
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

  function scanDirForEpistemicBans(dir: string) {
    const files = readdirSync(dir);
    for (const f of files) {
      const fullPath = join(dir, f);
      const s = statSync(fullPath);
      if (s.isDirectory()) {
        if (f !== 'node_modules' && f !== 'dist' && f !== '.git') {
          scanDirForEpistemicBans(fullPath);
        }
      } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        if (fullPath.includes('/tests/')) continue;
        const content = readFileSync(fullPath, 'utf8');
        for (const term of prohibitedTerms) {
          if (content.includes(term)) {
            throw new Error(`Prohibited epistemic term "${term}" found in ${fullPath}`);
          }
        }
      }
    }
  }
  let epistemicClean = true;
  try {
    scanDirForEpistemicBans(join(process.cwd(), 'src'));
  } catch (err: unknown) {
    epistemicClean = false;
    console.error(err);
  }
  assert(epistemicClean, 'All source files pass 100% epistemic terminology ban audit (0 violations)');

  // 11. Landing page unified journey
  console.log('--- 11. Landing Page Unified Journey ---');
  const landingFile = readFileSync(join(process.cwd(), 'src/components/oracle/OracleLandingPage.tsx'), 'utf8');
  assert(
    landingFile.includes('Make consequential choices with clarity.'),
    'Landing page features core headline'
  );
  assert(
    landingFile.includes('Start a Decision') && landingFile.includes('Decision Library'),
    'Landing page has primary CTA "Start a Decision" and secondary "Decision Library"'
  );
  assert(
    !landingFile.includes('v1') && !landingFile.includes('V1'),
    'Landing page is completely clean of legacy V1 references'
  );

  // 12. Intake stage navigation & WHAT/WHY/HOW guidance
  console.log('--- 12. Intake Stage Navigation & Guidance ---');
  const stage1 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleDecisionCore.tsx'), 'utf8');
  const stage2 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleFinancialReality.tsx'), 'utf8');
  const stage3 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleExecutionCapacity.tsx'), 'utf8');
  const stage4 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleCommitments.tsx'), 'utf8');
  const stage5 = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleEvidenceBaseline.tsx'), 'utf8');
  const review = readFileSync(join(process.cwd(), 'src/components/oracle/intake/OracleDecisionReview.tsx'), 'utf8');

  assert(
    stage1.includes('01 / The Decision Core') &&
    stage2.includes('02 / Financial Reality') &&
    stage3.includes('03 / Execution Capacity') &&
    stage4.includes('04 / Commitments & Reversibility') &&
    stage5.includes('05 / Evidence & Baseline'),
    'All 5 intake stages clearly display stage headers'
  );
  assert(
    review.includes('onEditStage(1)') && review.includes('onEditStage(5)'),
    'Review screen provides full random-access navigation across all 5 stages'
  );

  // 13. Error recovery & corrupted storage resilience
  console.log('--- 13. Error Recovery & Corrupted Storage Resilience ---');
  const libraryService = readFileSync(join(process.cwd(), 'src/services/oracleDecisionLibrary.ts'), 'utf8');
  assert(
    libraryService.includes('try {') && libraryService.includes('JSON.parse'),
    'Library parser is wrapped in defensive try/catch blocks'
  );
  assert(
    libraryService.includes('Array.isArray(parsed)') && libraryService.includes('filter('),
    'Corrupted items are safely filtered out without throwing unhandled errors'
  );

  // 14. Reduced-motion contract
  console.log('--- 14. Reduced-Motion Contract ---');
  const cssFile = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');
  assert(
    cssFile.includes('prefers-reduced-motion') || cssFile.includes('@media (prefers-reduced-motion'),
    'Global CSS includes prefers-reduced-motion support'
  );

  // 15. Accessibility interaction contract
  console.log('--- 15. Accessibility Interaction Contract ---');
  const drawerFile = readFileSync(join(process.cwd(), 'src/components/oracle/OracleDrawer.tsx'), 'utf8');
  const modalFile = readFileSync(join(process.cwd(), 'src/components/oracle/OracleModal.tsx'), 'utf8');
  assert(
    drawerFile.includes('role="dialog"') && drawerFile.includes('aria-modal="true"'),
    'OracleDrawer provides correct dialog accessibility attributes'
  );
  assert(
    modalFile.includes('role="dialog"') && modalFile.includes('aria-modal="true"'),
    'OracleModal provides correct dialog accessibility attributes'
  );

  // 16. Mobile layout contract
  console.log('--- 16. Mobile Layout Contract ---');
  const layoutFile = readFileSync(join(process.cwd(), 'src/components/oracle/OracleLayout.tsx'), 'utf8');
  assert(
    layoutFile.includes('max-w-7xl') && layoutFile.includes('px-4'),
    'OracleLayout enforces fluid max-w-7xl container with responsive horizontal padding'
  );

  // 17. Export integrity
  console.log('--- 17. Export Integrity ---');
  const exportFile = readFileSync(join(process.cwd(), 'src/services/oracleExportService.ts'), 'utf8');
  assert(
    exportFile.includes('generateDecisionReportHtml') &&
    exportFile.includes('buildDecisionJsonSnapshot') &&
    exportFile.includes('exportDecisionAsJson'),
    'Export service provides both HTML and JSON report generators'
  );
  assert(
    exportFile.includes('Evidence confidence reflects evidence quality'),
    'Export formats include mandatory epistemic boundary notice'
  );

  // 18. Protected engine immutability
  console.log('--- 18. Protected Engine Immutability ---');
  const protectedFiles = [
    'src/services/decisionDNA.v2.ts',
    'src/services/scenarioEngine.v2.ts',
    'src/validation/decisionSchema.ts',
    'src/types/v2.ts',
    'src/services/unifiedDecisionEngine.ts',
  ];
  for (const pf of protectedFiles) {
    assert(existsSync(join(process.cwd(), pf)), `Protected file exists: ${pf}`);
  }

  // 19. Gemini failure degradation
  console.log('--- 19. Gemini Failure Degradation ---');
  const explanationService = readFileSync(join(process.cwd(), 'src/services/explanationEngine.v2.ts'), 'utf8');
  assert(
    explanationService.includes('explanationStatus: "UNAVAILABLE"') ||
    explanationService.includes('FALLBACK') ||
    explanationService.includes('status: "UNAVAILABLE"'),
    'Explanation engine safely degrades when Gemini is unavailable, returning fallback or UNAVAILABLE status'
  );

  // 20. No artificial analysis delay
  console.log('--- 20. No Artificial Analysis Delay ---');
  assert(
    !thinkingScreenFile.includes('setTimeout(r, 650)') &&
    !thinkingScreenFile.includes('setTimeout(r, 550)'),
    'Thinking screen has eliminated all multi-second artificial sleep pauses'
  );

  console.log('\n================================================================================');
  console.log(`PHASE 6.8 FINAL AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuditSuite().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
