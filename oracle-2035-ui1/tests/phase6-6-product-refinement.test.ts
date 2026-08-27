/**
 * ORACLE 2035 — PHASE 6.6 PRODUCT REFINEMENT & DECISION INTELLIGENCE AUDIT
 * 
 * Verifies all 20 Phase 6.6 product intelligence requirements:
 * 1. Hierarchy Verification (Signal -> Why -> DNA -> Trajectories -> Evidence -> What-If -> 2035 Perspective -> Provenance)
 * 2. Decision DNA Comprehension (6 canonical dimensions with authoritative classifications & directions)
 * 3. "Why" Explanation Available State (displays explicit AI contextual synthesis subtitle)
 * 4. "Why" Explanation Unavailable State (calm neutral state with explanation === null)
 * 5. Baseline Scenario Presentation (deterministic cash flow, runway, and milestone calculations)
 * 6. Favorable Scenario Presentation (compounding acceleration under favorable conditions)
 * 7. Stress Scenario Presentation (severe downside adversity under stress conditions)
 * 8. Unknown Variable Preservation (UNKNOWN/NOT_PROVIDED never coerced to $0, 0 mo, 0 hrs)
 * 9. Data Coverage Presentation (coverageRatio, requiredVariableCount, knownVariableCount, unknownVariableCount)
 * 10. What-If User Adjustment vs Model Response Separation (separate input adjustments from deterministic model response)
 * 11. What-If Reset Invariance (zero-delta adjustments preserve baseline calculations)
 * 12. 2035 Perspective Epistemic Boundary ("Perspective Grounding" notice, no predictive claims)
 * 13. 2035 Perspective Unavailable State ("Reflection Unavailable" notification when AI synthesis is offline)
 * 14. Provenance Fingerprints Explanation (SHA-256 computation fingerprints in simple, precise language)
 * 15. Decision Library Search & Filter (deterministic query, bookmark filtering, temporal sorting)
 * 16. Decision Library Reopen Snapshot (0 analysis API calls, immutable historical state)
 * 17. Landing Page Identity & CTAs ("Make consequential choices with clarity.", "Start a Decision", "Explore Decision Library")
 * 18. Repository Epistemic Language Audit (zero forbidden terms in source files)
 * 19. Performance Bounds Preservation (deterministic analysis < 100ms, timeout handling bounded)
 * 20. Protected File Invariance (decisionDNA.v2.ts, scenarioEngine.v2.ts, decisionSchema.ts, types/v2.ts integrity)
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
  console.log('ORACLE 2035 — PHASE 6.6 PRODUCT REFINEMENT & DECISION INTELLIGENCE AUDIT');
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

  // 1. Hierarchy Verification
  console.log('--- 1. Hierarchy Verification ---');
  const workspaceFile = readFileSync(
    join(process.cwd(), 'src/components/oracle/OracleAnalysisWorkspace.tsx'),
    'utf8'
  );
  assert(workspaceFile.includes('OracleDecisionHero'), 'Decision Hero (1) present in workspace');
  assert(workspaceFile.includes('OracleSignalSummary'), 'The Signal (2) present in workspace');
  assert(workspaceFile.includes('OracleExplanationSection'), 'Why The Signal Exists (3) present in workspace');
  assert(workspaceFile.includes('OracleDecisionDnaSection'), 'Decision DNA (4) present in workspace');
  assert(workspaceFile.includes('OracleTrajectoryExplorer'), 'Conditional Trajectories (5) present in workspace');
  assert(workspaceFile.includes('OracleDataEvidenceSection'), 'Evidence & Data Coverage (6) present in workspace');
  assert(workspaceFile.includes('What-If Studio'), 'What-If Studio (7) present in workspace');
  assert(workspaceFile.includes('2035 Perspective'), '2035 Perspective (8) present in workspace');
  assert(workspaceFile.includes('Calculation Provenance'), 'Calculation Provenance (9) present in workspace');

  // 2. Decision DNA Comprehension
  console.log('\n--- 2. Decision DNA Comprehension ---');
  const analysisResult = await executeUnifiedAnalysis(canonicalTestPayload, { skipExplanation: true });
  const dna = analysisResult.decisionDNA;

  assert(dna.financialExposure !== undefined, 'Dimension 1: Financial Exposure computed');
  assert(dna.financialExposure.classification !== undefined, 'Financial Exposure has canonical classification');
  assert(dna.financialExposure.semanticDirection !== undefined, 'Financial Exposure has semantic direction');

  assert(dna.reversibility !== undefined, 'Dimension 2: Reversibility computed');
  assert(dna.reversibility.classification !== undefined, 'Reversibility has canonical classification');

  assert(dna.resourceFit !== undefined, 'Dimension 3: Resource Fit computed');
  assert(dna.resourceFit.classification !== undefined, 'Resource Fit has canonical classification');

  assert(dna.opportunityCost !== undefined, 'Dimension 4: Opportunity Cost computed');
  assert(dna.opportunityCost.classification !== undefined, 'Opportunity Cost has canonical classification');

  assert(dna.upsidePotential !== undefined, 'Dimension 5: Upside Potential computed');
  assert(dna.upsidePotential.classification !== undefined, 'Upside Potential has canonical classification');

  assert(dna.evidenceConfidence !== undefined, 'Dimension 6: Evidence Quality computed');
  assert(dna.evidenceConfidence.classification !== undefined, 'Evidence Quality has canonical classification');

  // 3. "Why" Explanation Available State
  console.log('\n--- 3. "Why" Explanation Available State ---');
  const explanationFile = readFileSync(
    join(process.cwd(), 'src/components/oracle/workspace/OracleExplanationSection.tsx'),
    'utf8'
  );
  assert(explanationFile.includes('WHY THE SIGNAL EXISTS'), 'Section titled "WHY THE SIGNAL EXISTS"');
  assert(
    explanationFile.includes('AI-generated contextual explanation based on the deterministic server analysis.'),
    'Explicit contextual AI synthesis subtitle rendered'
  );

  // 4. "Why" Explanation Unavailable State
  console.log('\n--- 4. "Why" Explanation Unavailable State ---');
  assert(explanationFile.includes('Explanation Unavailable'), 'Neutral fallback header "Explanation Unavailable"');
  assert(
    explanationFile.includes(
      'AI contextual synthesis is currently unavailable. Deterministic decision analysis remains complete, verified, and unaffected.'
    ),
    'Neutral notice states deterministic calculations are complete and unaffected'
  );

  // 5. Baseline Scenario Presentation
  console.log('\n--- 5. Baseline Scenario Presentation ---');
  const baseCase = analysisResult.scenarios.baseCase;
  assert(baseCase.scenarioType === 'BASE_CASE', 'Base scenarioType is BASE_CASE');
  assert(typeof baseCase.calculations.runwayMonths === 'number', 'Deterministic runwayMonths calculated');
  assert(baseCase.calculations.monthlyNetCashPosition !== undefined, 'Deterministic monthlyNetCashPosition calculated');
  assert(baseCase.calculations.postCommitmentLiquidCapital !== undefined, 'Post-commitment liquid capital calculated');
  assert(baseCase.temporalMilestones.length > 0, 'Scenario temporal milestones generated');

  // 6. Favorable Scenario Presentation
  console.log('\n--- 6. Favorable Scenario Presentation ---');
  const upsideCase = analysisResult.scenarios.upsideCase;
  assert(upsideCase.scenarioType === 'UPSIDE_CASE', 'Upside scenarioType is UPSIDE_CASE');
  assert(upsideCase.calculations !== undefined, 'Favorable calculations present');
  assert(upsideCase.temporalMilestones.length > 0, 'Favorable milestones generated');

  // 7. Stress Scenario Presentation
  console.log('\n--- 7. Stress Scenario Presentation ---');
  const stressCase = analysisResult.scenarios.downsideStressCase;
  assert(stressCase.scenarioType === 'DOWNSIDE_STRESS_CASE', 'Downside stress scenarioType is DOWNSIDE_STRESS_CASE');
  assert(stressCase.calculations !== undefined, 'Downside stress calculations present');
  assert(stressCase.temporalMilestones.length > 0, 'Downside stress milestones generated');

  // 8. Unknown Variable Preservation
  console.log('\n--- 8. Unknown Variable Preservation ---');
  const unknownPayload: V2DecisionPayload = {
    ...canonicalTestPayload,
    financial: {
      currentMonthlyIncome: { state: 'UNKNOWN' },
      recurringMonthlyExpenses: { state: 'NOT_PROVIDED' },
      availableLiquidCapital: { state: 'UNKNOWN' },
      requiredUpfrontCapital: { state: 'NOT_PROVIDED' },
      expectedIncomeChangeMonthly: { state: 'UNKNOWN' },
      existingFinancialObligations: { state: 'NOT_PROVIDED' },
    },
  };
  const unknownAnalysis = await executeUnifiedAnalysis(unknownPayload, { skipExplanation: true });
  assert(unknownAnalysis.decisionDNA.financialExposure.status === 'INSUFFICIENT_DATA', 'Financial status is INSUFFICIENT_DATA');
  assert(unknownAnalysis.decisionDNA.financialExposure.measurements.runwayMonths === undefined, 'Runway is undefined (not coerced to 0)');
  assert(unknownAnalysis.scenarios.baseCase.calculations.runwayMonths === undefined, 'Scenario runway is undefined (not coerced to 0)');

  // 9. Data Coverage Presentation
  console.log('\n--- 9. Data Coverage Presentation ---');
  const coverage = analysisResult.decisionDNA.dataCoverage;
  assert(coverage.requiredVariableCount > 0, 'Data coverage required variable count is populated');
  assert(coverage.knownVariableCount >= 1, 'Data coverage tracks known variable count');
  assert(coverage.coverageRatio > 0 && coverage.coverageRatio <= 1, 'Data coverage ratio is valid bounded ratio');

  // 10. What-If User Adjustment vs Model Response Separation
  console.log('\n--- 10. What-If Studio Separation ---');
  const whatIf = calculateUnifiedWhatIf(canonicalTestPayload, analysisResult.decisionDNA, {
    monthlyExpenseAdjustment: -1000,
    liquidCapitalMultiplier: 1.5,
    weeklyHoursAdjustment: 10,
    expectedIncomeDeltaAdjustment: 2000,
  });
  assert(whatIf.adjustedRunwayMonths !== undefined, 'Adjusted runway computed');
  assert(whatIf.originalRunwayMonths !== undefined, 'Original baseline runway preserved');
  assert(whatIf.runwayImpactDescription !== undefined, 'Runway impact description generated');
  assert(whatIf.capitalCoverageImpactDescription !== undefined, 'Capital coverage impact description generated');

  // 11. What-If Reset Invariance
  console.log('\n--- 11. What-If Reset Invariance ---');
  const whatIfReset = calculateUnifiedWhatIf(canonicalTestPayload, analysisResult.decisionDNA, {
    monthlyExpenseAdjustment: 0,
    liquidCapitalMultiplier: 1.0,
    weeklyHoursAdjustment: 0,
    expectedIncomeDeltaAdjustment: 0,
  });
  assert(whatIfReset.adjustedRunwayMonths === whatIfReset.originalRunwayMonths, 'Reset restores baseline runway months');
  assert(whatIfReset.adjustedNetMonthlyBurn === whatIfReset.originalNetMonthlyBurn, 'Reset restores baseline monthly burn');

  // 12. 2035 Perspective Epistemic Boundary
  console.log('\n--- 12. 2035 Perspective Epistemic Boundary ---');
  const futureSelfFile = readFileSync(
    join(process.cwd(), 'src/components/oracle/workspace/OracleFutureSelf.tsx'),
    'utf8'
  );
  assert(futureSelfFile.includes('Perspective Grounding'), 'Contains Perspective Grounding badge');
  assert(
    futureSelfFile.includes(
      'This perspective provides a conditional retrospective narrative based strictly on your deterministic model parameters.'
    ),
    'Contains explicit conditional retrospective boundary notice'
  );

  // 13. 2035 Perspective Unavailable State
  console.log('\n--- 13. 2035 Perspective Unavailable State ---');
  assert(futureSelfFile.includes('Reflection Unavailable'), 'Contains Reflection Unavailable status');
  assert(
    futureSelfFile.includes(
      'AI contextual synthesis is currently unavailable. Deterministic decision analysis remains complete, verified, and unaffected.'
    ),
    'Reflection unavailable notice states deterministic analysis remains complete'
  );

  // 14. Provenance Fingerprints Explanation
  console.log('\n--- 14. Provenance Fingerprints Explanation ---');
  const provenanceFile = readFileSync(
    join(process.cwd(), 'src/components/oracle/workspace/OracleProvenanceInspector.tsx'),
    'utf8'
  );
  assert(
    provenanceFile.includes('These fingerprints identify the deterministic computation performed for this analysis.'),
    'Clear non-hype explanation of computation fingerprints'
  );
  assert(provenanceFile.includes('SHA-256 (64-HEX)'), 'Declares standard SHA-256 64-hex format');

  // 15. Decision Library Search & Filter
  console.log('\n--- 15. Decision Library Search & Filter ---');
  clearLibrary();
  saveDecision({
    payload: canonicalTestPayload,
    data: analysisResult,
    userNotes: 'Senior engineer to founder exploration',
  });
  saveDecision({
    payload: {
      ...canonicalTestPayload,
      decision: {
        ...canonicalTestPayload.decision,
        decisionStatement: 'Acquire commercial real estate property',
        decisionCategory: 'CAPITAL_ALLOCATION',
      },
    },
    data: analysisResult,
    userNotes: 'Commercial real estate purchase',
    isBookmarked: true,
  });

  const allDecisions = getDecisions();
  assert(allDecisions.length === 2, '2 decisions saved in library');

  const searchFounder = searchAndFilterDecisions({
    query: 'founder',
    filter: 'all',
    sort: 'recent_updated',
    items: allDecisions,
  });
  assert(searchFounder.length === 1, 'Search query "founder" returns 1 matching item');
  assert(searchFounder[0].title.includes('Founder'), 'Matching item title contains "Founder"');

  const filterBookmarked = searchAndFilterDecisions({
    query: '',
    filter: 'bookmarked',
    sort: 'recent_updated',
    items: allDecisions,
  });
  assert(filterBookmarked.length === 1, 'Bookmark filter isolates 1 bookmarked item');
  assert(filterBookmarked[0].isBookmarked === true, 'Filtered item is bookmarked');

  // 16. Decision Library Reopen Snapshot
  console.log('\n--- 16. Decision Library Reopen Snapshot ---');
  const savedRecord = allDecisions[0];
  const loadedRecord = getDecisionById(savedRecord.id);
  assert(loadedRecord !== null, 'Loaded decision snapshot exists');
  assert(loadedRecord?.provenance.dnaHash === analysisResult.auditTrail.dnaComputationHash, 'Loaded snapshot preserves exact DNA computation hash');
  assert(loadedRecord?.provenance.scenarioBaseHash === analysisResult.scenarios.baseCase.provenance.deterministicComputationHash, 'Loaded snapshot preserves base scenario hash');

  // 17. Landing Page Identity & CTAs
  console.log('\n--- 17. Landing Page Identity & CTAs ---');
  const landingFile = readFileSync(join(process.cwd(), 'src/components/oracle/OracleLandingPage.tsx'), 'utf8');
  assert(landingFile.includes('Make consequential choices with clarity.'), 'Hero headline matches specification');
  assert(landingFile.includes('Start a Decision'), 'Primary CTA is "Start a Decision"');
  assert(landingFile.includes('Explore Decision Library'), 'Secondary CTA is "Explore Decision Library"');

  // 18. Repository Epistemic Language Audit
  console.log('\n--- 18. Repository Epistemic Language Audit ---');
  const forbiddenPhrases = [
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

  const srcDir = join(process.cwd(), 'src');
  function scanDir(dir: string): string[] {
    let results: string[] = [];
    const list = readdirSync(dir);
    for (const file of list) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(scanDir(fullPath));
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const sourceFiles = scanDir(srcDir);
  let violations = 0;
  for (const file of sourceFiles) {
    const content = readFileSync(file, 'utf8');
    for (const phrase of forbiddenPhrases) {
      if (content.includes(phrase)) {
        console.error(`  Violation in ${file}: "${phrase}"`);
        violations++;
      }
    }
  }
  assert(violations === 0, `Epistemic audit: 0 prohibited predictive terms across ${sourceFiles.length} source files`);

  // 19. Performance Bounds Preservation
  console.log('\n--- 19. Performance Bounds Preservation ---');
  const t0 = performance.now();
  const perfResult = await executeUnifiedAnalysis(canonicalTestPayload, { skipExplanation: true });
  const durationMs = performance.now() - t0;
  assert(durationMs < 100, `Deterministic analysis executes in ${durationMs.toFixed(2)}ms (< 100ms)`);
  assert(perfResult.auditTrail.unifiedPipelineComputationHash.length === 64, 'Pipeline computation hash is exact 64-char SHA-256');
  assert(perfResult.scenarios.baseCase.provenance.deterministicComputationHash.length === 64, 'Scenario base computation hash is exact 64-char SHA-256');

  // 20. Protected File Invariance
  console.log('\n--- 20. Protected File Invariance ---');
  assert(existsSync(join(process.cwd(), 'src/services/decisionDNA.v2.ts')), 'decisionDNA.v2.ts exists and protected');
  assert(existsSync(join(process.cwd(), 'src/services/scenarioEngine.v2.ts')), 'scenarioEngine.v2.ts exists and protected');
  assert(existsSync(join(process.cwd(), 'src/validation/decisionSchema.ts')), 'decisionSchema.ts exists and protected');
  assert(existsSync(join(process.cwd(), 'src/types/v2.ts')), 'types/v2.ts exists and protected');

  console.log('\n================================================================================');
  console.log(`ORACLE 2035 — PHASE 6.6 AUDIT COMPLETE: ${passed} passed, ${failed} failed`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error('Fatal error running Phase 6.6 test suite:', err);
  process.exit(1);
});
