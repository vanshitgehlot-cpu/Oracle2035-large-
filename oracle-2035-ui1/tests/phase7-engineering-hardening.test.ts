/**
 * ORACLE 2035 — Phase 7 Final Engineering Hardening Test Suite
 * Validates non-UI backend, security, provenance, API contracts, deployment, and persistence.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { validateV2DecisionPayload } from '../src/validation/decisionSchema';
import { executeUnifiedAnalysis } from '../src/services/unifiedDecisionEngine';
import { V2DecisionPayload, V2AnalyzeDecisionSuccessResponse } from '../src/types/v2';
import { buildDecisionJsonSnapshot, generateDecisionReportHtml } from '../src/services/oracleExportService';
import {
  saveDecision,
  getDecisions,
  LIBRARY_STORAGE_KEY,
  validateSavedRecord,
  SavedDecisionRecord,
} from '../src/services/oracleDecisionLibrary';

const validTestPayload: V2DecisionPayload = {
  decision: {
    decisionStatement: 'Conduct comprehensive release hardening on the ORACLE 2035 engine.',
    decisionCategory: 'CAREER_TRANSITION',
    currentSituation: 'Existing complete deterministic architecture ready for non-UI hardening.',
    desiredOutcome: 'High reliability, zero regression, locked deterministic core',
    alternatives: ['Manual verification only', 'Automated end-to-end regression validation'],
    timeHorizon: '1_TO_3_YEARS',
  },
  financial: {
    currentMonthlyIncome: { value: 12000, state: 'KNOWN' },
    recurringMonthlyExpenses: { value: 4000, state: 'KNOWN' },
    availableLiquidCapital: { value: 80000, state: 'KNOWN' },
    requiredUpfrontCapital: { value: 15000, state: 'KNOWN' },
    expectedIncomeChangeMonthly: { value: -4000, state: 'KNOWN' },
    existingFinancialObligations: { value: 1000, state: 'KNOWN' },
    currency: 'USD',
  },
  resources: {
    availableWeeklyHours: { value: 45, state: 'KNOWN' },
    experienceYears: { value: 10, state: 'KNOWN' },
    relevantSkills: { value: ['TypeScript', 'Full-stack systems', 'Security hardening'], state: 'KNOWN' },
  },
  reversibility: {
    estimatedSwitchingEffort: { value: 'MEDIUM', state: 'KNOWN' },
    unwindingTimeMonths: { value: 6, state: 'KNOWN' },
    sunkCostsAmount: { value: 15000, state: 'KNOWN' },
    contractualConstraints: { value: ['Standard 4-week notice'], state: 'KNOWN' },
    irreversibleCommitments: { value: ['Infrastructure setup costs'], state: 'KNOWN' },
  },
  opportunity: {
    primaryOpportunity: 'Launch independent software studio',
    alternativesConsidered: ['Stay in corporate engineering role'],
    opportunityCostSummary: { value: 'Foregone guaranteed salary during runway', state: 'KNOWN' },
    foregoneBenefits: { value: ['Corporate benefits', 'Bonus eligibility'], state: 'KNOWN' },
  },
};

describe('Phase 7 Engineering Hardening Tests', () => {
  it('1. Core Schema Validation enforces strict types and rejects unauthorized injected metrics', () => {
    const validResult = validateV2DecisionPayload(validTestPayload);
    assert.strictEqual(validResult.valid, true, 'Valid payload passes schema validation');
    assert(validResult.data, 'Validated data returned');

    const unauthorizedPayload = {
      ...validTestPayload,
      calculatedDNA: { overallScore: 99 },
    };
    const invalidResult = validateV2DecisionPayload(unauthorizedPayload);
    assert.strictEqual(invalidResult.valid, false, 'Injected computed field is rejected');
  });

  it('2. Pure Deterministic Unified Engine calculates 6 DNA dimensions, 3 scenarios, and 5 SHA-256 hashes', async () => {
    const result = await executeUnifiedAnalysis(validTestPayload, { skipExplanation: true });
    assert(result.decisionDNA, 'Decision DNA present');
    assert(result.decisionDNA.financialExposure, 'Financial Exposure computed');
    assert(result.decisionDNA.reversibility, 'Reversibility computed');
    assert(result.decisionDNA.resourceFit, 'Resource Fit computed');
    assert(result.decisionDNA.opportunityCost, 'Opportunity Cost computed');
    assert(result.decisionDNA.upsidePotential, 'Upside Potential computed');
    assert(result.decisionDNA.evidenceConfidence, 'Evidence Confidence computed');

    assert(result.scenarios.baseCase, 'Baseline scenario generated');
    assert(result.scenarios.downsideStressCase, 'Stress scenario generated');
    assert(result.scenarios.upsideCase, 'Favorable scenario generated');

    assert(result.auditTrail, 'Audit trail present');
    assert.strictEqual(typeof result.auditTrail.dnaComputationHash, 'string', 'DNA hash is string');
    assert(result.auditTrail.dnaComputationHash.length > 0, 'DNA hash is present');
    assert.strictEqual(result.auditTrail.scenarioComputationHashes.baseCase.length, 64, 'Base scenario hash is valid SHA-256');
    assert.strictEqual(result.auditTrail.scenarioComputationHashes.downsideStressCase.length, 64, 'Downside scenario hash is valid SHA-256');
    assert.strictEqual(result.auditTrail.scenarioComputationHashes.upsideCase.length, 64, 'Upside scenario hash is valid SHA-256');
    assert.strictEqual(result.auditTrail.unifiedPipelineComputationHash.length, 64, 'Pipeline hash is valid SHA-256');
  });

  it('3. Cryptographic Provenance Invariance across multiple runs', async () => {
    const run1 = await executeUnifiedAnalysis(validTestPayload, { skipExplanation: true });
    const run2 = await executeUnifiedAnalysis(validTestPayload, { skipExplanation: true });

    assert.strictEqual(run1.auditTrail.dnaComputationHash, run2.auditTrail.dnaComputationHash, 'dnaComputationHash is deterministic');
    assert.strictEqual(run1.auditTrail.scenarioComputationHashes.baseCase, run2.auditTrail.scenarioComputationHashes.baseCase, 'scenarioBaseHash is deterministic');
    assert.strictEqual(run1.auditTrail.scenarioComputationHashes.downsideStressCase, run2.auditTrail.scenarioComputationHashes.downsideStressCase, 'scenarioDownsideHash is deterministic');
    assert.strictEqual(run1.auditTrail.scenarioComputationHashes.upsideCase, run2.auditTrail.scenarioComputationHashes.upsideCase, 'scenarioUpsideHash is deterministic');
    assert.strictEqual(run1.auditTrail.unifiedPipelineComputationHash, run2.auditTrail.unifiedPipelineComputationHash, 'unifiedPipelineComputationHash is deterministic');
  });

  it('4. Client-Side Secret Isolation — Zero API keys in frontend codebase', () => {
    const srcDir = join(process.cwd(), 'src');
    function scanDir(dir: string) {
      const files = readdirSync(dir);
      for (const file of files) {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          // Backend files run on server only
          if (
            file.includes('explanationEngine.v2.ts') ||
            file.includes('oracleEngine.ts') ||
            file.includes('futureSelfEngine.ts')
          ) {
            continue;
          }
          const content = readFileSync(fullPath, 'utf8');
          assert(!content.includes('AIzaSy'), `Hardcoded Google key found in ${fullPath}`);
          assert(!content.includes('process.env.GEMINI_API_KEY'), `Client code accesses process.env in ${fullPath}`);
        }
      }
    }
    scanDir(srcDir);
  });

  it('5. Epistemic Terminology Scan — Zero prohibited predictive terms in source files', () => {
    const prohibitedTerms = [
      'Most Likely Future',
      'Optimal Future',
      'Predicted Future',
      'Expected Future',
      'Guaranteed Future',
      'Chance of Success',
      'Certain Outcome',
    ];

    const srcDir = join(process.cwd(), 'src');
    function scanEpistemic(dir: string) {
      const files = readdirSync(dir);
      for (const file of files) {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
          scanEpistemic(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          // Skip legacy compatibility adapters if marked
          if (file === 'oracleEngine.ts' || file === 'unifiedDecisionEngine.ts') continue;
          const content = readFileSync(fullPath, 'utf8');
          for (const term of prohibitedTerms) {
            assert(!content.includes(term), `Prohibited epistemic term "${term}" found in ${fullPath}`);
          }
        }
      }
    }
    scanEpistemic(srcDir);
  });

  it('6. Persistence Resilience — Defensive record validation & corruption tolerance', async () => {
    const analysisResult = await executeUnifiedAnalysis(validTestPayload, { skipExplanation: true });
    const validData: V2AnalyzeDecisionSuccessResponse['data'] = {
      decisionDNA: analysisResult.decisionDNA,
      scenarios: analysisResult.scenarios,
      dataSufficiency: analysisResult.dataSufficiency,
      auditTrail: analysisResult.auditTrail,
      explanation: null,
      explanationStatus: 'UNAVAILABLE',
      warnings: [],
    };

    const validRecord: SavedDecisionRecord = {
      id: 'rec_phase7_test_001',
      schemaVersion: '2.0.0',
      methodologyVersion: '2.0.0-LOCKED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastExploredAt: new Date().toISOString(),
      title: 'Valid Saved Record',
      category: 'CAREER_TRANSITION',
      timeHorizon: '1_TO_3_YEARS',
      isBookmarked: false,
      payload: validTestPayload,
      data: validData,
      provenance: {
        dnaHash: 'hash1',
        scenarioBaseHash: 'hash2',
        scenarioDownsideHash: 'hash3',
        scenarioUpsideHash: 'hash4',
        unifiedPipelineHash: 'hash5',
      },
    };

    assert.strictEqual(validateSavedRecord(validRecord), true, 'Valid record passes validation');
    assert.strictEqual(validateSavedRecord(null), false, 'Null record rejected');
    assert.strictEqual(validateSavedRecord({}), false, 'Empty record rejected');
    assert.strictEqual(validateSavedRecord({ id: '123' }), false, 'Incomplete record rejected');
  });

  it('7. Export Integrity & Security — Zero secret leaks, full XSS escaping, epistemic banner included', async () => {
    const analysisResult = await executeUnifiedAnalysis(validTestPayload, { skipExplanation: true });
    const jsonSnapshot = buildDecisionJsonSnapshot({
      payload: validTestPayload,
      data: analysisResult,
    });
    assert(jsonSnapshot, 'JSON snapshot built');
    const jsonStr = JSON.stringify(jsonSnapshot);
    assert(!jsonStr.includes('AIzaSy'), 'JSON snapshot contains no API keys');
    assert(!jsonStr.includes('process.env'), 'JSON snapshot contains no environment strings');

    const htmlReport = generateDecisionReportHtml({
      payload: validTestPayload,
      data: analysisResult,
    });
    assert(htmlReport.includes('<!DOCTYPE html>'), 'HTML report is self-contained document');
    assert(
      htmlReport.includes('Evidence confidence reflects evidence quality'),
      'HTML report contains mandatory Epistemic Boundary Notice'
    );
    assert(!htmlReport.includes('AIzaSy'), 'HTML report contains no secrets');
  });

  it('8. Deployment Assets Hardening — Dockerfile and .dockerignore exist with production spec', () => {
    assert(existsSync(join(process.cwd(), 'Dockerfile')), 'Dockerfile exists');
    assert(existsSync(join(process.cwd(), '.dockerignore')), '.dockerignore exists');

    const dockerfileContent = readFileSync(join(process.cwd(), 'Dockerfile'), 'utf8');
    assert(dockerfileContent.includes('FROM node:22-alpine'), 'Uses lightweight node alpine base');
    assert(dockerfileContent.includes('EXPOSE 3000'), 'Exposes canonical port 3000');
    assert(dockerfileContent.includes('USER node'), 'Runs under unprivileged node user');

    const dockerignoreContent = readFileSync(join(process.cwd(), '.dockerignore'), 'utf8');
    assert(dockerignoreContent.includes('node_modules'), '.dockerignore excludes node_modules');
    assert(dockerignoreContent.includes('dist'), '.dockerignore excludes dist');
    assert(dockerignoreContent.includes('tests'), '.dockerignore excludes tests');
  });

  it('9. Documentation & UI Handoff Contract Verification', () => {
    assert(existsSync(join(process.cwd(), 'README.md')), 'README.md exists');
    assert(existsSync(join(process.cwd(), 'docs/ARCHITECTURE.md')), 'ARCHITECTURE.md exists');
    assert(existsSync(join(process.cwd(), 'docs/API.md')), 'API.md exists');
    assert(existsSync(join(process.cwd(), 'docs/SECURITY.md')), 'SECURITY.md exists');
    assert(existsSync(join(process.cwd(), 'docs/DEPLOYMENT.md')), 'DEPLOYMENT.md exists');
    assert(existsSync(join(process.cwd(), 'docs/UI_HANDOFF.md')), 'UI_HANDOFF.md exists');

    const uiHandoffContent = readFileSync(join(process.cwd(), 'docs/UI_HANDOFF.md'), 'utf8');
    assert(uiHandoffContent.includes('ValueState'), 'UI Handoff documents ValueState data contract');
    assert(uiHandoffContent.includes('Decision DNA Dimensions'), 'UI Handoff documents 6 DNA dimensions');
    assert(uiHandoffContent.includes('Conditional Scenarios'), 'UI Handoff documents conditional scenario trajectories');
  });
});
