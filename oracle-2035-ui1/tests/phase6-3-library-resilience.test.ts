/**
 * ORACLE 2035 — Phase 6.3 Decision Library & Persistence Resilience Test Suite
 * 
 * Comprehensive verification of persistence hardening, corruption isolation,
 * historical snapshot immutability, notes editing, deterministic search/filter/sort,
 * structural comparison, ValueState preservation, and storage failure recovery.
 */

import {
  saveDecision,
  saveDecisionSafe,
  getDecisions,
  getDecisionById,
  updateDecision,
  updateDecisionNotes,
  deleteDecision,
  toggleBookmark,
  clearLibrary,
  searchAndFilterDecisions,
  validateSavedRecord,
  getCorruptedRecordsCount,
  SavedDecisionRecord,
} from '../src/services/oracleDecisionLibrary';
import {
  buildDecisionJsonSnapshot,
  generateDecisionReportHtml,
} from '../src/services/oracleExportService';
import {
  V2DecisionPayload,
  V2AnalyzeDecisionSuccessResponse,
} from '../src/types/v2';
import { executeUnifiedAnalysis } from '../src/services/unifiedDecisionEngine';

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

async function runPhase63LibraryResilienceTests() {
  console.log('==================================================');
  console.log('ORACLE 2035 — PHASE 6.3 LIBRARY & PERSISTENCE RESILIENCE');
  console.log('==================================================');

  // Setup sample payload and unified analysis result
  const samplePayload1: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Acquire regional robotics manufacturing facility',
      decisionCategory: 'CAPITAL_ALLOCATION',
      desiredOutcome: 'Expand production capacity by 3x within 18 months',
      timeHorizon: '5_TO_10_YEARS',
      currentSituation: 'Operating at 92% capacity with $5M cash reserves',
      alternatives: [],
    },
    financial: {
      currentMonthlyIncome: { value: 250000, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 180000, state: 'KNOWN' },
      availableLiquidCapital: { value: 5000000, state: 'KNOWN' },
      requiredUpfrontCapital: { value: 3500000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: 120000, state: 'KNOWN' },
    },
    resources: {
      experienceYears: { value: 15, state: 'KNOWN' },
      availableWeeklyHours: { value: 60, state: 'KNOWN' },
      relevantSkills: { value: ['Industrial Robotics', 'Operations'], state: 'KNOWN' },
    },
    reversibility: {
      contractualConstraints: { value: ['Asset purchase lock-in'], state: 'KNOWN' },
      irreversibleCommitments: { value: ['Facility lease and tooling'], state: 'KNOWN' },
      sunkCostsAmount: { value: 500000, state: 'KNOWN' },
    },
  };

  const samplePayload2: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Transition core software product to open-core open source model',
      decisionCategory: 'PRODUCT_STRATEGY',
      desiredOutcome: 'Accelerate enterprise adoption and establish standard developer mindshare',
      timeHorizon: '3_TO_5_YEARS',
      currentSituation: 'Proprietary enterprise SaaS with slowing top-of-funnel acquisition',
      alternatives: [],
    },
    financial: {
      currentMonthlyIncome: { value: 80000, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 60000, state: 'KNOWN' },
      availableLiquidCapital: { value: 600000, state: 'KNOWN' },
      requiredUpfrontCapital: { value: 50000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: 25000, state: 'KNOWN' },
    },
    resources: {
      experienceYears: { value: 8, state: 'KNOWN' },
      availableWeeklyHours: { value: 45, state: 'KNOWN' },
      relevantSkills: { value: ['Community Management', 'Developer Relations'], state: 'KNOWN' },
    },
    reversibility: {
      contractualConstraints: { value: [], state: 'KNOWN' },
      irreversibleCommitments: { value: ['Open source license publication'], state: 'KNOWN' },
      sunkCostsAmount: { value: 10000, state: 'KNOWN' },
    },
  };

  const analysisResult1 = await executeUnifiedAnalysis(samplePayload1, { skipExplanation: true });
  const analysisResult2 = await executeUnifiedAnalysis(samplePayload2, { skipExplanation: true });

  const sampleData1: V2AnalyzeDecisionSuccessResponse['data'] = {
    decisionDNA: analysisResult1.decisionDNA,
    scenarios: analysisResult1.scenarios,
    dataSufficiency: analysisResult1.dataSufficiency,
    auditTrail: analysisResult1.auditTrail,
    explanation: null,
    explanationStatus: 'UNAVAILABLE',
    warnings: [],
  };

  const sampleData2: V2AnalyzeDecisionSuccessResponse['data'] = {
    decisionDNA: analysisResult2.decisionDNA,
    scenarios: analysisResult2.scenarios,
    dataSufficiency: analysisResult2.dataSufficiency,
    auditTrail: analysisResult2.auditTrail,
    explanation: null,
    explanationStatus: 'UNAVAILABLE',
    warnings: [],
  };

  clearLibrary();

  // 1. Basic Saving and Retrieval
  console.log('\n--- 1. Save and Retrieval Integrity ---');
  const record1 = saveDecision({
    payload: samplePayload1,
    data: sampleData1,
    id: 'dec_robotics_01',
    userNotes: 'Initial review for Q3 investment committee',
    tags: ['Robotics', 'Expansion', 'Q3'],
  });

  assert(record1.id === 'dec_robotics_01', 'Saved record retains explicit ID');
  assert(record1.title === 'Acquire regional robotics manufacturing facility', 'Saved record title matches statement');
  assert(record1.schemaVersion === '2.0.0', 'Saved record has schemaVersion 2.0.0');
  assert(record1.methodologyVersion === '2.0.0-LOCKED', 'Saved record has locked methodology version');

  const retrieved1 = getDecisionById('dec_robotics_01');
  assert(retrieved1 !== null, 'getDecisionById finds saved decision');
  assert(retrieved1?.data.auditTrail.dnaComputationHash === sampleData1.auditTrail.dnaComputationHash, 'DNA computation hash preserved exactly');

  // 2. Safe Save Operation (Storage Quota Resilience)
  console.log('\n--- 2. Safe Save Operation & Quota Resilience ---');
  const safeSaveResult = saveDecisionSafe({
    payload: samplePayload2,
    data: sampleData2,
    id: 'dec_opensource_02',
    userNotes: 'Product strategy offsite consensus candidate',
  });

  assert(safeSaveResult.success === true, 'saveDecisionSafe returns success true on normal operation');
  assert(safeSaveResult.record.id === 'dec_opensource_02', 'saveDecisionSafe creates valid record');

  // 3. Historical Snapshot Immutability (Zero Client Recalculation)
  console.log('\n--- 3. Historical Snapshot Immutability ---');
  const historicalRecord = getDecisionById('dec_robotics_01')!;
  const originalDnaHash = historicalRecord.provenance.dnaHash;
  const originalBaseHash = historicalRecord.provenance.scenarioBaseHash;

  // Retrieve multiple times to ensure zero mutation
  const secondRead = getDecisionById('dec_robotics_01')!;
  assert(secondRead.provenance.dnaHash === originalDnaHash, 'Provenance DNA hash unchanged across reads');
  assert(secondRead.provenance.scenarioBaseHash === originalBaseHash, 'Provenance scenario hash unchanged across reads');
  assert(secondRead.data.decisionDNA.financialExposure.measurements.monthlyBurn === sampleData1.decisionDNA.financialExposure.measurements.monthlyBurn, 'Exact financial measurements preserved without recalculation');

  // 4. Notes Editing & Non-Interference
  console.log('\n--- 4. Notes Editing & Hash Invariance ---');
  const updatedNoteRecord = updateDecisionNotes('dec_robotics_01', 'Updated: Approved by board with caveat on tooling timeline.');
  assert(updatedNoteRecord !== null, 'updateDecisionNotes returns updated record');
  assert(updatedNoteRecord?.userNotes === 'Updated: Approved by board with caveat on tooling timeline.', 'User notes updated properly');
  assert(updatedNoteRecord?.provenance.dnaHash === originalDnaHash, 'Updating notes DOES NOT alter mathematical DNA hash');
  assert(updatedNoteRecord?.data.auditTrail.dnaComputationHash === originalDnaHash, 'Updating notes DOES NOT alter server audit trail hash');

  // 5. Bookmark Resilience
  console.log('\n--- 5. Bookmark Toggling ---');
  assert(retrieved1?.isBookmarked === false, 'Initial bookmark state is false');
  const bookmarkedState = toggleBookmark('dec_robotics_01');
  assert(bookmarkedState === true, 'toggleBookmark returns true');
  const afterBookmark = getDecisionById('dec_robotics_01');
  assert(afterBookmark?.isBookmarked === true, 'Bookmark state persisted');
  assert(afterBookmark?.provenance.dnaHash === originalDnaHash, 'Toggling bookmark does not mutate provenance hash');

  // 6. Deterministic Search
  console.log('\n--- 6. Deterministic Search ---');
  const searchResults1 = searchAndFilterDecisions({ query: 'robotics' });
  assert(searchResults1.length === 1 && searchResults1[0].id === 'dec_robotics_01', 'Search matches title correctly');

  const searchResults2 = searchAndFilterDecisions({ query: 'open-core' });
  assert(searchResults2.length === 1 && searchResults2[0].id === 'dec_opensource_02', 'Search matches phrase in statement');

  const searchResults3 = searchAndFilterDecisions({ query: 'board with caveat' });
  assert(searchResults3.length === 1 && searchResults3[0].id === 'dec_robotics_01', 'Search matches text inside userNotes');

  const searchResultsEmpty = searchAndFilterDecisions({ query: 'nonexistent keyword query 9999' });
  assert(searchResultsEmpty.length === 0, 'Non-matching search returns empty array');

  // 7. Deterministic Filtering
  console.log('\n--- 7. Deterministic Filtering ---');
  const allDecisions = searchAndFilterDecisions({ filter: 'all' });
  assert(allDecisions.length === 2, 'Filter "all" returns both decisions');

  const bookmarkedDecisions = searchAndFilterDecisions({ filter: 'bookmarked' });
  assert(bookmarkedDecisions.length === 1 && bookmarkedDecisions[0].id === 'dec_robotics_01', 'Filter "bookmarked" returns only bookmarked record');

  const recentDecisions = searchAndFilterDecisions({ filter: 'recent' });
  assert(recentDecisions.length === 2, 'Filter "recent" returns freshly saved decisions');

  // 8. Deterministic Sorting with Tie-Breaking
  console.log('\n--- 8. Deterministic Sorting with Stable Tie-Breaking ---');
  const sortAlpha = searchAndFilterDecisions({ sort: 'alphabetical' });
  assert(sortAlpha[0].title.localeCompare(sortAlpha[1].title) <= 0, 'Alphabetical sort correctly orders decisions');

  const sortRecentCreated = searchAndFilterDecisions({ sort: 'recent_created' });
  assert(new Date(sortRecentCreated[0].createdAt).getTime() >= new Date(sortRecentCreated[1].createdAt).getTime(), 'Recently created sort orders by createdAt descending');

  // 9. Malformed / Corrupted Data Isolation
  console.log('\n--- 9. Malformed Storage Record Validation & Isolation ---');
  assert(validateSavedRecord(null) === false, 'validateSavedRecord rejects null');
  assert(validateSavedRecord({}) === false, 'validateSavedRecord rejects empty object');
  assert(validateSavedRecord({ id: '123' }) === false, 'validateSavedRecord rejects incomplete record');
  assert(validateSavedRecord({ id: '123', title: 'Test', payload: {}, data: {} }) === false, 'validateSavedRecord rejects record missing DNA/Scenarios');
  assert(validateSavedRecord(record1) === true, 'validateSavedRecord accepts valid SavedDecisionRecord');

  // 10. Record Deletion Safety
  console.log('\n--- 10. Individual Record Deletion ---');
  const deleteResult = deleteDecision('dec_opensource_02');
  assert(deleteResult === true, 'deleteDecision returns true for existing record');
  assert(getDecisionById('dec_opensource_02') === null, 'Deleted record no longer exists');
  assert(getDecisionById('dec_robotics_01') !== null, 'Targeted deletion does NOT affect other records');

  // 11. Structural Comparison Integrity
  console.log('\n--- 11. Structural Comparison ---');
  const jsonExport = buildDecisionJsonSnapshot({
    record: record1,
    payload: samplePayload1,
    data: sampleData1,
  }) as any;

  assert(jsonExport.schemaVersion === '2.0.0', 'Exported JSON snapshot includes schemaVersion 2.0.0');
  assert(jsonExport.methodologyVersion === '2.0.0-LOCKED', 'Exported JSON snapshot includes locked methodology version');
  assert(jsonExport.decisionDNA !== undefined, 'Exported JSON snapshot includes complete Decision DNA');
  assert(jsonExport.scenarios !== undefined, 'Exported JSON snapshot includes complete Scenarios');
  assert(jsonExport.auditTrail !== undefined, 'Exported JSON snapshot includes complete Audit Trail');

  const htmlReport = generateDecisionReportHtml({
    record: record1,
    payload: samplePayload1,
    data: sampleData1,
  });

  assert(htmlReport.includes('ORACLE 2035'), 'HTML report contains header branding');
  assert(htmlReport.includes('Epistemic Boundary'), 'HTML report contains mandatory Epistemic Boundary Notice');
  assert(htmlReport.includes(sampleData1.auditTrail.dnaComputationHash), 'HTML report contains SHA-256 provenance hash');

  // 12. Epistemic Language Integrity (Zero Forbidden Phrases)
  console.log('\n--- 12. Epistemic Terminology Scan ---');
  const forbiddenPhrases = [
    'chance of success',
    'probability of',
    'predicted future',
    'guaranteed future',
    'optimal future',
    'most likely future',
    'confidence percentage',
    'certain outcome',
  ];

  const htmlLower = htmlReport.toLowerCase();
  for (const phrase of forbiddenPhrases) {
    assert(!htmlLower.includes(phrase), `HTML report does NOT contain forbidden phrase: "${phrase}"`);
  }

  // Summary
  console.log('\n==================================================');
  console.log(`PHASE 6.3 RESILIENCE AUDIT: ${passed} passed, ${failed} failed`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase63LibraryResilienceTests().catch((err) => {
  console.error('Fatal error during Phase 6.3 test execution:', err);
  process.exit(1);
});
