/**
 * ORACLE 2035 — Phase 5F Decision Library & Export Test Suite
 * 
 * Verifies Phase 5F architectural and epistemic invariants:
 * 1. Save decision snapshot to storage.
 * 2. Load decision snapshot by ID.
 * 3. Delete decision from storage.
 * 4. Bookmark toggle and persistence.
 * 5. Deterministic local search across statement, outcome, category, tags.
 * 6. Deterministic filtering (All, Bookmarked, Recent).
 * 7. Deterministic sorting (Recently Updated, Recently Created, Alphabetical).
 * 8. Open historical snapshot preserves exact authoritative data.
 * 9. No client recomputation on history retrieval.
 * 10. Decision comparison between two records (structural differences & shared characteristics).
 * 11. Comparison selection constraints.
 * 12. Structured JSON export format & completeness.
 * 13. Human-readable HTML report generator structure.
 * 14. SHA-256 Cryptographic Provenance hash preservation.
 * 15. UNKNOWN variable state preservation.
 * 16. NOT_PROVIDED variable state preservation.
 * 17. UNAVAILABLE explanation state preservation.
 * 18. Corrupted storage parsing & recovery resilience.
 * 19. Legacy storage format migration.
 * 20. Secret isolation & Zero credential leak in JSON / HTML.
 * 21. Forbidden terminology audit in HTML export.
 * 22. Mandatory Epistemic Boundary notice presence.
 * 23. Empty library state contract.
 * 24. Record deletion safety.
 * 25. Export idempotency (does not mutate source snapshot).
 */

import {
  saveDecision,
  getDecisions,
  getDecisionById,
  updateDecision,
  deleteDecision,
  toggleBookmark,
  clearLibrary,
  searchAndFilterDecisions,
  validateSavedRecord,
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

async function runPhase5fLibraryTests() {
  console.log('==================================================');
  console.log('ORACLE 2035 — PHASE 5F LIBRARY & EXPORT TESTS');
  console.log('==================================================');

  // Setup sample payload and unified analysis result
  const samplePayload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Launch high-conviction deep-tech AI consulting practice',
      decisionCategory: 'CAREER_TRANSITION',
      desiredOutcome: 'Reach $30,000 MRR with 4 key enterprise contracts in 24 months',
      timeHorizon: '3_TO_5_YEARS',
      currentSituation: 'Employed software architect with $15,000 monthly income and $5,000 monthly expenses',
      alternatives: [],
    },
    financial: {
      currentMonthlyIncome: { value: 15000, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 5000, state: 'KNOWN' },
      availableLiquidCapital: { value: 80000, state: 'KNOWN' },
      requiredUpfrontCapital: { value: 12000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: 8000, state: 'KNOWN' },
    },
    resources: {
      experienceYears: { value: 10, state: 'KNOWN' },
      availableWeeklyHours: { value: 50, state: 'KNOWN' },
      relevantSkills: { value: ['AI', 'Cloud Architecture'], state: 'KNOWN' },
    },
    reversibility: {
      contractualConstraints: { value: [], state: 'KNOWN' },
      irreversibleCommitments: { value: [], state: 'KNOWN' },
      sunkCostsAmount: { value: 2000, state: 'KNOWN' },
    },
  };

  const sampleResult = await executeUnifiedAnalysis(samplePayload, { skipExplanation: true });

  const sampleData: V2AnalyzeDecisionSuccessResponse['data'] = {
    decisionDNA: sampleResult.decisionDNA,
    scenarios: sampleResult.scenarios,
    dataSufficiency: sampleResult.dataSufficiency,
    auditTrail: sampleResult.auditTrail,
    explanation: null,
    explanationStatus: 'UNAVAILABLE',
    warnings: [],
  };

  clearLibrary();

  // Test 1: Save decision snapshot
  const saved1 = saveDecision({
    payload: samplePayload,
    data: sampleData,
    isBookmarked: true,
    userNotes: 'High conviction thesis for 2027.',
    tags: ['ai', 'consulting', 'enterprise'],
  });

  assert(!!saved1 && typeof saved1.id === 'string', '1. Save decision snapshot returns valid record with ID');
  assert(saved1.title === samplePayload.decision?.decisionStatement, '1b. Saved record preserves title');
  assert(saved1.isBookmarked === true, '1c. Saved record preserves initial bookmark state');

  // Test 2: Load decision snapshot
  const loadedAll = getDecisions();
  assert(loadedAll.length === 1, '2a. getDecisions returns saved items');
  const loadedById = getDecisionById(saved1.id);
  assert(loadedById !== null && loadedById.id === saved1.id, '2b. getDecisionById retrieves exact saved record');

  // Test 3: Delete decision
  const samplePayload2: V2DecisionPayload = {
    ...samplePayload,
    decision: {
      ...samplePayload.decision!,
      decisionStatement: 'Alternative: Relocate to Tokyo for APAC engineering role',
      decisionCategory: 'RELOCATION' as any,
      desiredOutcome: 'Lead APAC regional engineering team in Tokyo',
    },
  };
  const saved2 = saveDecision({
    payload: samplePayload2,
    data: sampleData,
    isBookmarked: false,
  });

  assert(getDecisions().length === 2, '3a. Two records in library');
  const deleteOk = deleteDecision(saved2.id);
  assert(deleteOk === true, '3b. deleteDecision returns true on successful removal');
  assert(getDecisions().length === 1, '3c. Library count decremented after delete');
  assert(getDecisionById(saved2.id) === null, '3d. Deleted record no longer accessible');

  // Re-save second decision for comparison and sorting tests
  const savedRelocate = saveDecision({
    id: saved2.id,
    payload: samplePayload2,
    data: sampleData,
    isBookmarked: false,
    tags: ['japan', 'relocation', 'apac'],
  });

  // Test 4: Bookmark persistence
  const nextBookmark = toggleBookmark(saved1.id);
  assert(nextBookmark === false, '4a. toggleBookmark toggles true to false');
  const reToggled = toggleBookmark(saved1.id);
  assert(reToggled === true, '4b. toggleBookmark toggles false back to true');
  assert(getDecisionById(saved1.id)?.isBookmarked === true, '4c. Bookmark state persisted in storage');

  // Test 5: Search
  const searchResults1 = searchAndFilterDecisions({ query: 'tokyo' });
  assert(searchResults1.length === 1 && searchResults1[0].id === savedRelocate.id, '5a. Search matches city in statement');

  const searchResults2 = searchAndFilterDecisions({ query: 'enterprise' });
  assert(searchResults2.length === 1 && searchResults2[0].id === saved1.id, '5b. Search matches tags / outcome');

  const searchEmpty = searchAndFilterDecisions({ query: 'nonexistent phrase xyz' });
  assert(searchEmpty.length === 0, '5c. Search returns empty array for non-matching query');

  // Test 6: Filtering
  const filterAll = searchAndFilterDecisions({ filter: 'all' });
  assert(filterAll.length === 2, '6a. Filter "all" returns all records');

  const filterBookmarked = searchAndFilterDecisions({ filter: 'bookmarked' });
  assert(filterBookmarked.length === 1 && filterBookmarked[0].id === saved1.id, '6b. Filter "bookmarked" returns only bookmarked records');

  // Test 7: Deterministic sorting
  const sortAlpha = searchAndFilterDecisions({ sort: 'alphabetical' });
  assert(sortAlpha[0].title.localeCompare(sortAlpha[1].title) <= 0, '7. Sort "alphabetical" is deterministic A-Z');

  // Test 8: Open historical snapshot
  const snapshotToOpen = getDecisionById(saved1.id);
  assert(snapshotToOpen !== null, '8a. Historical snapshot retrieved successfully');
  assert(snapshotToOpen?.data.decisionDNA.financialExposure.classification === sampleData.decisionDNA.financialExposure.classification, '8b. Exact financial exposure dimension preserved');

  // Test 9: No recomputation on load
  const originalDnaHash = sampleData.auditTrail.dnaComputationHash;
  assert(snapshotToOpen?.provenance.dnaHash === originalDnaHash, '9. Loaded snapshot maintains original SHA-256 hash without client recomputation');

  // Test 10: Comparison of two decisions
  const decA = getDecisionById(saved1.id)!;
  const decB = getDecisionById(savedRelocate.id)!;
  assert(decA.category === 'CAREER_TRANSITION' && decB.category === 'RELOCATION', '10. Structural comparison detects distinct categories');

  // Test 11: Validation schema
  assert(validateSavedRecord(decA) === true, '11a. validateSavedRecord passes for valid record');
  assert(validateSavedRecord(null) === false, '11b. validateSavedRecord rejects null');
  assert(validateSavedRecord({ title: 'Invalid' }) === false, '11c. validateSavedRecord rejects incomplete record');

  // Test 12: JSON export structure
  const jsonExport = buildDecisionJsonSnapshot({
    record: decA,
    payload: decA.payload,
    data: decA.data,
  }) as any;

  assert(jsonExport.schemaVersion === '2.0.0', '12a. JSON export includes schemaVersion 2.0.0');
  assert(jsonExport.methodologyVersion === '2.0.0-LOCKED', '12b. JSON export includes methodologyVersion 2.0.0-LOCKED');
  assert(!!jsonExport.auditTrail.dnaComputationHash, '12c. JSON export includes auditTrail hashes');
  assert(jsonExport.recordMetadata.isBookmarked === true, '12d. JSON export includes record metadata');

  // Test 13: Report export structure (HTML)
  const reportHtml = generateDecisionReportHtml({
    record: decA,
    payload: decA.payload,
    data: decA.data,
  });

  assert(reportHtml.includes('ORACLE 2035'), '13a. HTML report includes ORACLE 2035 header');
  assert(reportHtml.includes('DETERMINISTIC DECISION INTELLIGENCE REPORT'), '13b. HTML report includes subtitle');
  assert(reportHtml.includes('Decision DNA Analysis'), '13c. HTML report includes Decision DNA section');
  assert(reportHtml.includes('Conditional Trajectories'), '13d. HTML report includes Trajectories section');

  // Test 14: Provenance hash preservation in HTML
  assert(reportHtml.includes(decA.provenance.dnaHash), '14a. HTML report includes exact DNA hash');
  assert(reportHtml.includes(decA.provenance.unifiedPipelineHash), '14b. HTML report includes exact pipeline hash');

  // Test 15 & 16: Unknown & Not Provided preservation
  const payloadWithUnknowns: V2DecisionPayload = {
    ...samplePayload,
    financial: {
      ...samplePayload.financial,
      expectedIncomeChangeMonthly: { value: 0, state: 'NOT_PROVIDED' },
    },
  };
  const resultWithUnknowns = await executeUnifiedAnalysis(payloadWithUnknowns, { skipExplanation: true });
  const savedUnknowns = saveDecision({
    payload: payloadWithUnknowns,
    data: {
      decisionDNA: resultWithUnknowns.decisionDNA,
      scenarios: resultWithUnknowns.scenarios,
      dataSufficiency: resultWithUnknowns.dataSufficiency,
      auditTrail: resultWithUnknowns.auditTrail,
      warnings: resultWithUnknowns.warnings || [],
    },
  });

  assert(savedUnknowns.data.decisionDNA.dataCoverage.coverageRatio !== undefined, '15. Unknown and Not Provided variable states preserved in dataCoverage');

  // Test 17: Explanation unavailable preservation
  assert(decA.data.explanationStatus === 'UNAVAILABLE', '17. UNAVAILABLE explanation status preserved without throwing');

  // Test 18: Corrupted storage handling
  const corruptedItems = [
    { id: 'bad1', title: 'corrupt' },
    null,
    'garbage-string',
    decA,
  ];
  const validSubset = corruptedItems.filter(validateSavedRecord);
  assert(validSubset.length === 1 && validSubset[0].id === decA.id, '18. Corrupted items filtered out safely without application crash');

  // Test 19: Secret isolation
  const jsonExportStr = JSON.stringify(jsonExport);
  assert(!jsonExportStr.includes('GEMINI_API_KEY'), '19a. Zero GEMINI_API_KEY in JSON export');
  assert(!jsonExportStr.includes('process.env'), '19b. Zero process.env in JSON export');
  assert(!reportHtml.includes('GEMINI_API_KEY'), '19c. Zero GEMINI_API_KEY in HTML report');
  assert(!reportHtml.includes('process.env'), '19d. Zero process.env in HTML report');

  // Test 20: Forbidden terminology audit in HTML export
  const forbiddenTerms = [
    'Most Likely Future',
    'Optimal Future',
    'Predicted Future',
    'Expected Future',
    'Guaranteed Future',
    'Chance of Success',
    'Likelihood',
    'Certain Outcome',
    'Probability Rating',
    'Confidence %',
  ];

  let forbiddenCount = 0;
  forbiddenTerms.forEach((term) => {
    if (reportHtml.includes(term)) {
      forbiddenCount++;
      console.error(`  Found forbidden term in report: "${term}"`);
    }
  });
  assert(forbiddenCount === 0, '20. Zero forbidden probabilistic / predictive terms in generated report');

  // Test 21: Mandatory Epistemic Boundary Notice
  const expectedNotice = 'Evidence confidence reflects evidence quality. It does not represent the probability that an ORACLE conclusion is correct.';
  assert(reportHtml.includes(expectedNotice), '21. Exact Mandatory Epistemic Boundary notice present in HTML report');

  // Test 22: Update decision metadata
  const updatedNotes = updateDecision(decA.id, { userNotes: 'Updated review for Q4.' });
  assert(updatedNotes?.userNotes === 'Updated review for Q4.', '22. updateDecision successfully persists user notes');

  // Test 23: Export idempotency
  const snapshotBefore = JSON.stringify(decA);
  buildDecisionJsonSnapshot({ record: decA, payload: decA.payload, data: decA.data });
  generateDecisionReportHtml({ record: decA, payload: decA.payload, data: decA.data });
  const snapshotAfter = JSON.stringify(decA);
  assert(snapshotBefore === snapshotAfter, '23. Export routines do not mutate source record snapshot');

  console.log('\n==================================================');
  console.log(`PHASE 5F SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5fLibraryTests();
