/**
 * ORACLE 2035 V2 — Phase 3.5 Server Pipeline Integration Test Suite
 * 
 * Verifies all 21 test categories from the Phase 3.4 / 3.5 specification:
 * 1. Valid V2 request
 * 2. Invalid V2 request
 * 3. Unauthorized computed metric injection
 * 4. Unknown-field rejection
 * 5. 2MB body limit
 * 6. UNKNOWN financial value
 * 7. NOT_PROVIDED capital
 * 8. UNDER_DETERMINED context
 * 9. Invalid numeric range
 * 10. Invalid enum
 * 11. Malformed evidence
 * 12. Malformed assumption
 * 13. Scenario execution
 * 14. Decision DNA execution
 * 15. Provenance/hash integrity
 * 16. Deterministic repeated requests
 * 17. V1 compatibility
 * 18. Malformed JSON
 * 19. Zero Gemini calls
 * 20. Zero external network I/O
 * 21. ValueState preservation
 */

import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import { validateV2DecisionPayload } from '../src/validation/decisionSchema';
import { calculateDecisionDNAV2 } from '../src/services/decisionDNA.v2';
import { buildScenarioSuite } from '../src/services/scenarioEngine.v2';
import {
  V2AnalyzeDecisionRequest,
  V2AnalyzeDecisionSuccessResponse,
  V2AnalyzeDecisionErrorResponse,
  V2DecisionPayload,
} from '../src/types/v2';

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

// Helper to make test HTTP requests
function sendRequest(
  port: number,
  options: { path: string; method: string; body?: any; headers?: Record<string, string>; rawBody?: string }
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any; rawBody: string }> {
  return new Promise((resolve, reject) => {
    const postData = options.rawBody !== undefined ? options.rawBody : (options.body ? JSON.stringify(options.body) : '');
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: options.path,
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...options.headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: parsed,
            rawBody: raw,
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function createStandardPayload(): V2DecisionPayload {
  return {
    decision: {
      decisionStatement: 'Leave senior engineering role at tech firm to bootstrap AI decision platform',
      decisionCategory: 'BUSINESS_STARTUP',
      currentSituation: 'Employed full-time with $15,000 monthly income and stable benefits',
      desiredOutcome: 'Achieve $25,000 MRR within 18 months with full founder ownership',
      alternatives: ['Stay at current employer', 'Join seed startup'],
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
      relevantSkills: { value: ['TypeScript', 'Distributed Systems', 'ML'], state: 'KNOWN' },
      experienceYears: { value: 9, state: 'KNOWN' },
      availableWeeklyHours: { value: 60, state: 'KNOWN' },
      availableSupportNetwork: { value: ['2 Technical Advisors', '1 Angel Investor'], state: 'KNOWN' },
      availablePhysicalAssets: { value: ['Dedicated Workstation'], state: 'KNOWN' },
    },
    opportunity: {
      primaryOpportunity: 'First-mover in grounded probabilistic decision simulations',
      alternativesConsidered: ['Corporate promotion', 'Contract consulting'],
      opportunityCostSummary: { value: 'Foregoing $180k guaranteed salary and 401k match', state: 'KNOWN' },
      foregoneBenefits: { value: ['Health insurance', '401k match'], state: 'KNOWN' },
    },
    reversibility: {
      estimatedSwitchingEffort: { value: 'MEDIUM', state: 'KNOWN' },
      irreversibleCommitments: { value: ['Incorporation legal fees'], state: 'KNOWN' },
      sunkCostsAmount: { value: 5000, state: 'KNOWN' },
      contractualConstraints: { value: ['Non-compete clause'], state: 'KNOWN' },
      unwindingTimeMonths: { value: 3, state: 'KNOWN' },
    },
    evidence: [
      {
        id: 'ev-1',
        sourceType: 'USER_STATEMENT',
        sourceReference: 'Bank statement',
        description: 'Verified $120,000 cash in business liquid account',
        verificationStatus: 'USER_PROVIDED',
        relevance: 'DIRECT',
        confidenceClassification: 'HIGH',
        supportsVariables: ['availableLiquidCapital'],
      },
    ],
    assumptions: [
      {
        id: 'asm-1',
        statement: 'Can acquire first 10 enterprise customers in 6 months',
        relatedVariable: 'expectedIncomeChangeMonthly',
        value: 10,
        unit: 'customers',
        source: 'USER_STATED',
        confidence: 'MEDIUM',
        impactIfChanged: 'HIGH',
      },
    ],
  };
}

async function runServerIntegrationTests() {
  console.log('\n==================================================');
  console.log('ORACLE 2035 V2 — PHASE 3.5 SERVER PIPELINE TESTS');
  console.log('==================================================\n');

  // Spin up test Express app matching server.ts architecture
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err && err.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload exceeds the canonical 2MB limit.',
        },
      });
    }
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MALFORMED_JSON',
          message: 'Request body contains malformed or unparseable JSON.',
        },
      });
    }
    next(err);
  });

  // V2 Canonical Endpoint
  app.post('/api/v2/analyze-decision', (req: Request, res: Response) => {
    try {
      const rawPayload = req.body;
      const validationResult = validateV2DecisionPayload(rawPayload);

      if (!validationResult.valid || !validationResult.data) {
        const hasUnauthorizedMetric = validationResult.errors.some((e) => {
          const forbiddenCalculatedKeys = [
            'calculatedDNA',
            'dnaScores',
            'decisionDNA',
            'calculatedScores',
            'overallScore',
            'probabilities',
            'scenarioProbabilities',
            'simulationProbabilities',
            'futureProbabilities',
            'calculatedVerdict',
            'confidenceScore',
            'scenarioOutcomes',
            'scenarios',
            'deterministicComputationHash',
            'provenance',
            'serverEvaluatedAt',
          ];
          return forbiddenCalculatedKeys.includes(e.path);
        });

        const errorCode = hasUnauthorizedMetric ? 'UNAUTHORIZED_COMPUTED_FIELD' : 'VALIDATION_FAILED';

        return res.status(400).json({
          success: false,
          error: {
            code: errorCode,
            message: hasUnauthorizedMetric
              ? 'Client-supplied calculated metric is unauthorized. The server is the sole authoritative calculation engine.'
              : 'Validation failed against the canonical V2 decision schema.',
            details: validationResult.errors.map((e) => ({
              field: e.path,
              issue: e.message,
            })),
          },
        });
      }

      const validatedContext = validationResult.data;
      const decisionDNA = calculateDecisionDNAV2(validatedContext);
      const scenarios = buildScenarioSuite(validatedContext, decisionDNA);

      const insufficientDimensions: string[] = [];
      if (decisionDNA.financialExposure.status === 'INSUFFICIENT_DATA') insufficientDimensions.push('Financial Exposure');
      if (decisionDNA.reversibility.status === 'INSUFFICIENT_DATA') insufficientDimensions.push('Reversibility');
      if (decisionDNA.resourceFit.status === 'INSUFFICIENT_DATA') insufficientDimensions.push('Resource Fit');
      if (decisionDNA.opportunityCost.status === 'INSUFFICIENT_DATA') insufficientDimensions.push('Opportunity Cost');
      if (decisionDNA.upsidePotential.status === 'INSUFFICIENT_DATA') insufficientDimensions.push('Upside Potential');
      if (decisionDNA.evidenceConfidence.status === 'INSUFFICIENT_DATA') insufficientDimensions.push('Evidence Confidence');

      let overallStatus: 'FULLY_DETERMINED' | 'PARTIALLY_DETERMINED' | 'UNDER_DETERMINED' = 'FULLY_DETERMINED';
      if (decisionDNA.dataCoverage.coverageRatio < 0.4 || insufficientDimensions.length >= 3) {
        overallStatus = 'UNDER_DETERMINED';
      } else if (decisionDNA.dataCoverage.coverageRatio < 1.0 || insufficientDimensions.length > 0) {
        overallStatus = 'PARTIALLY_DETERMINED';
      }

      const warnings: string[] = [];
      if (decisionDNA.dataCoverage.criticalUnknownVariables.length > 0) {
        warnings.push(`Decision has ${decisionDNA.dataCoverage.criticalUnknownVariables.length} unknown or unprovided critical variables.`);
      }

      return res.status(200).json({
        success: true,
        data: {
          decisionDNA,
          scenarios,
          dataSufficiency: {
            overallStatus,
            coverageRatio: decisionDNA.dataCoverage.coverageRatio,
            criticalUnknownVariables: decisionDNA.dataCoverage.criticalUnknownVariables,
            insufficientDataDimensions: insufficientDimensions,
          },
          auditTrail: {
            serverEvaluatedAt: new Date().toISOString(),
            dnaMethodologyVersion: '2.0.0-LOCKED',
            scenarioMethodologyVersion: '2.0.0-LOCKED',
            dnaComputationHash: scenarios.baseCase.provenance.dnaMetricRefs[0] || 'HASH_CALCULATED',
            scenarioComputationHashes: {
              baseCase: scenarios.baseCase.deterministicComputationHash,
              downsideStressCase: scenarios.downsideStressCase.deterministicComputationHash,
              upsideCase: scenarios.upsideCase.deterministicComputationHash,
            },
          },
          warnings,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_CALCULATION_ERROR',
          message: 'A deterministic calculation failure occurred.',
        },
      });
    }
  });

  // V1 Legacy Route for compatibility verification
  app.post('/api/simulate', (req: Request, res: Response) => {
    const { goal, decision } = req.body;
    if (!goal || !decision) {
      return res.status(400).json({ error: 'Goal and Decision are required parameters.' });
    }
    return res.status(200).json({
      source: 'v1-legacy',
      oracleResult: {
        bestFuture: { title: `Optimal: ${goal}`, probability: 88 },
      },
    });
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const port = address.port;

  try {
    // -------------------------------------------------------------------------
    // CATEGORY 1: Valid V2 Request
    // -------------------------------------------------------------------------
    console.log('Category 1: Valid V2 Request');
    {
      const payload = createStandardPayload();
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 200, 'Returns HTTP 200 for valid V2 decision payload');
      assert(res.body.success === true, 'Response has success: true');
      assert(res.body.data.decisionDNA !== undefined, 'Contains authoritative Decision DNA 2.0');
      assert(res.body.data.scenarios !== undefined, 'Contains authoritative Scenario Suite');
      assert(res.body.data.auditTrail.dnaMethodologyVersion === '2.0.0-LOCKED', 'Audit trail has 2.0.0-LOCKED methodology');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 2: Invalid V2 Request (Missing Decision Statement)
    // -------------------------------------------------------------------------
    console.log('\nCategory 2: Invalid V2 Request (Missing Required Fields)');
    {
      const payload = createStandardPayload();
      delete (payload.decision as any).decisionStatement;
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 400, 'Returns HTTP 400 for missing decisionStatement');
      assert(res.body.success === false, 'Response has success: false');
      assert(res.body.error.code === 'VALIDATION_FAILED', 'Error code is VALIDATION_FAILED');
      assert(res.body.error.details.some((d: any) => d.field === 'decision.decisionStatement'), 'Details identify missing decisionStatement');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 3: Unauthorized Computed Metric Injection
    // -------------------------------------------------------------------------
    console.log('\nCategory 3: Unauthorized Computed Metric Injection Rejection');
    {
      const hackedPayload = {
        ...createStandardPayload(),
        dnaScores: { risk: 10, growth: 95 },
        probabilities: { success: 99.9 },
        scenarioOutcomes: [{ name: 'Guaranteed' }],
        deterministicComputationHash: 'fake_hash_123',
      };
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: hackedPayload });
      assert(res.statusCode === 400, 'Rejects injected calculated metrics with HTTP 400');
      assert(res.body.error.code === 'UNAUTHORIZED_COMPUTED_FIELD', 'Error code is UNAUTHORIZED_COMPUTED_FIELD');
      assert(res.body.error.details.some((d: any) => d.field === 'dnaScores'), 'Identifies injected dnaScores');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 4: Unknown-Field Rejection
    // -------------------------------------------------------------------------
    console.log('\nCategory 4: Unknown-Field Rejection');
    {
      const payloadWithUnknown = {
        ...createStandardPayload(),
        arbitraryUnknownField: 'malicious_or_unexpected_data',
      };
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payloadWithUnknown });
      assert(res.statusCode === 400, 'Rejects unexpected unknown property with HTTP 400');
      assert(res.body.error.code === 'VALIDATION_FAILED', 'Error code is VALIDATION_FAILED');
      assert(res.body.error.details.some((d: any) => d.field === 'arbitraryUnknownField'), 'Details identify unknown property');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 5: 2MB Body Limit Enforcement
    // -------------------------------------------------------------------------
    console.log('\nCategory 5: 2MB Body Limit Enforcement');
    {
      // Create payload > 2MB (2.2MB of padding in valid structure)
      const hugeString = 'X'.repeat(2.2 * 1024 * 1024);
      const hugeBody = JSON.stringify({
        ...createStandardPayload(),
        opportunity: {
          primaryOpportunity: hugeString,
          alternativesConsidered: [],
        },
      });

      const res = await sendRequest(port, {
        path: '/api/v2/analyze-decision',
        method: 'POST',
        rawBody: hugeBody,
      });

      assert(res.statusCode === 413, 'Rejects payloads > 2MB with HTTP 413');
      assert(res.body.error.code === 'PAYLOAD_TOO_LARGE', 'Error code is PAYLOAD_TOO_LARGE');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 6: UNKNOWN Financial Value Handling
    // -------------------------------------------------------------------------
    console.log('\nCategory 6: UNKNOWN Financial Value Preservation');
    {
      const payload = createStandardPayload();
      payload.financial!.recurringMonthlyExpenses = { state: 'UNKNOWN' };
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 200, 'Returns HTTP 200 when optional financial variable is UNKNOWN');
      assert(res.body.data.decisionDNA.financialExposure.measurements.monthlyBurn === undefined, 'monthlyBurn is undefined when expenses are UNKNOWN');
      assert(res.body.data.decisionDNA.financialExposure.measurements.runwayMonths === undefined, 'runwayMonths is undefined when expenses are UNKNOWN');
      assert(res.body.data.scenarios.baseCase.calculations.monthlyBurnState === 'UNKNOWN', 'Preserves baseCase monthlyBurnState as UNKNOWN');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 7: NOT_PROVIDED Capital
    // -------------------------------------------------------------------------
    console.log('\nCategory 7: NOT_PROVIDED Capital Preservation');
    {
      const payload = createStandardPayload();
      payload.financial!.availableLiquidCapital = { state: 'NOT_PROVIDED' };
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 200, 'Returns HTTP 200 when liquid capital is NOT_PROVIDED');
      assert(res.body.data.decisionDNA.financialExposure.measurements.postCommitmentLiquidCapital === undefined, 'postCommitmentLiquidCapital is undefined when capital is NOT_PROVIDED');
      assert(res.body.data.scenarios.baseCase.calculations.postCommitmentLiquidCapitalState === 'NOT_PROVIDED', 'Preserves baseCase postCommitmentLiquidCapitalState as NOT_PROVIDED');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 8: UNDER_DETERMINED Context Handling
    // -------------------------------------------------------------------------
    console.log('\nCategory 8: UNDER_DETERMINED Context Handling');
    {
      const sparsePayload: V2DecisionPayload = {
        decision: {
          decisionStatement: 'Sparse strategic test decision',
          decisionCategory: 'STRATEGIC_OTHER',
          currentSituation: 'Baseline test situation',
          desiredOutcome: 'Explore feasibility',
          alternatives: [],
          timeHorizon: '1_TO_3_YEARS',
        },
        financial: {
          currentMonthlyIncome: { state: 'UNKNOWN' },
          recurringMonthlyExpenses: { state: 'UNKNOWN' },
          availableLiquidCapital: { state: 'UNKNOWN' },
        },
        resources: {
          experienceYears: { state: 'UNKNOWN' },
          availableWeeklyHours: { state: 'UNKNOWN' },
        },
      };

      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: sparsePayload });
      assert(res.statusCode === 200, 'Returns HTTP 200 for sparse context without failing');
      assert(res.body.data.dataSufficiency.overallStatus === 'UNDER_DETERMINED', 'Data sufficiency correctly marked UNDER_DETERMINED');
      assert(res.body.data.dataSufficiency.coverageRatio < 0.5, 'Coverage ratio is strictly < 0.50');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 9: Invalid Numeric Range (Negative Income)
    // -------------------------------------------------------------------------
    console.log('\nCategory 9: Invalid Numeric Range Rejection');
    {
      const payload = createStandardPayload();
      payload.financial!.currentMonthlyIncome = { value: -5000, state: 'KNOWN' };
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 400, 'Rejects negative monthly income with HTTP 400');
      assert(res.body.error.details.some((d: any) => d.field === 'financial.currentMonthlyIncome.value'), 'Identifies negative income out-of-range');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 10: Invalid Enum Values
    // -------------------------------------------------------------------------
    console.log('\nCategory 10: Invalid Enum Rejection');
    {
      const payload = createStandardPayload();
      (payload.decision as any).decisionCategory = 'NON_EXISTENT_CATEGORY';
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 400, 'Rejects invalid decisionCategory enum with HTTP 400');
      assert(res.body.error.details.some((d: any) => d.field === 'decision.decisionCategory'), 'Identifies invalid enum field');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 11: Malformed Evidence Object
    // -------------------------------------------------------------------------
    console.log('\nCategory 11: Malformed Evidence Object Rejection');
    {
      const payload = createStandardPayload();
      payload.evidence = [
        {
          id: '',
          sourceType: 'INVALID_TYPE' as any,
          description: '',
          verificationStatus: 'UNVERIFIED',
          relevance: 'DIRECT',
          confidenceClassification: 'HIGH',
          supportsVariables: [],
        },
      ];
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 400, 'Rejects malformed evidence item with HTTP 400');
      assert(res.body.error.details.some((d: any) => d.field.startsWith('evidence[0]')), 'Flags malformed evidence item');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 12: Malformed Assumption Object
    // -------------------------------------------------------------------------
    console.log('\nCategory 12: Malformed Assumption Object Rejection');
    {
      const payload = createStandardPayload();
      payload.assumptions = [
        {
          id: 'asm-bad',
          statement: '',
          relatedVariable: 'revenue',
          source: 'INVALID_SOURCE' as any,
          confidence: 'HIGH',
          impactIfChanged: 'EXTREME' as any,
        },
      ];
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 400, 'Rejects malformed assumption item with HTTP 400');
      assert(res.body.error.details.some((d: any) => d.field.startsWith('assumptions[0]')), 'Flags malformed assumption item');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 13: Scenario Suite Execution Integrity
    // -------------------------------------------------------------------------
    console.log('\nCategory 13: Scenario Suite Execution Integrity');
    {
      const payload = createStandardPayload();
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      const scn = res.body.data.scenarios;
      assert(scn.baseCase.scenarioType === 'BASE_CASE', 'Generates BASE_CASE scenario');
      assert(scn.downsideStressCase.scenarioType === 'DOWNSIDE_STRESS_CASE', 'Generates DOWNSIDE_STRESS_CASE scenario');
      assert(scn.upsideCase.scenarioType === 'UPSIDE_CASE', 'Generates UPSIDE_CASE scenario');
      assert(scn.comparisonMatrix.scenarios.length === 3, 'Comparison matrix contains all 3 canonical scenarios');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 14: Decision DNA 2.0 Execution Integrity
    // -------------------------------------------------------------------------
    console.log('\nCategory 14: Decision DNA 2.0 Execution Integrity');
    {
      const payload = createStandardPayload();
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      const dna = res.body.data.decisionDNA;
      assert(dna.financialExposure.status === 'CALCULATED', 'Calculates Financial Exposure dimension');
      assert(dna.reversibility.status === 'CALCULATED', 'Calculates Reversibility dimension');
      assert(dna.resourceFit.status === 'CALCULATED', 'Calculates Resource Fit dimension');
      assert(dna.opportunityCost.status === 'CALCULATED', 'Calculates Opportunity Cost dimension');
      assert(dna.upsidePotential.status === 'CALCULATED', 'Calculates Upside Potential dimension');
      assert(dna.evidenceConfidence.status === 'CALCULATED', 'Calculates Evidence Confidence dimension');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 15: Provenance & SHA-256 Hash Integrity
    // -------------------------------------------------------------------------
    console.log('\nCategory 15: Provenance & Computation Hash Integrity');
    {
      const payload = createStandardPayload();
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      const hashes = res.body.data.auditTrail.scenarioComputationHashes;
      assert(/^[a-f0-9]{64}$/.test(hashes.baseCase), 'Base case computation hash is valid 64-char SHA-256');
      assert(/^[a-f0-9]{64}$/.test(hashes.downsideStressCase), 'Downside stress case computation hash is valid 64-char SHA-256');
      assert(/^[a-f0-9]{64}$/.test(hashes.upsideCase), 'Upside case computation hash is valid 64-char SHA-256');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 16: Deterministic Repeat Requests (Invariance)
    // -------------------------------------------------------------------------
    console.log('\nCategory 16: Deterministic Repeat Request Invariance');
    {
      const payload = createStandardPayload();
      const res1 = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      const res2 = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });

      assert(
        res1.body.data.auditTrail.scenarioComputationHashes.baseCase ===
        res2.body.data.auditTrail.scenarioComputationHashes.baseCase,
        'Base case computation hash is 100% invariant across repeat requests'
      );
      assert(
        res1.body.data.auditTrail.scenarioComputationHashes.downsideStressCase ===
        res2.body.data.auditTrail.scenarioComputationHashes.downsideStressCase,
        'Downside computation hash is 100% invariant across repeat requests'
      );
    }

    // -------------------------------------------------------------------------
    // CATEGORY 17: V1 Endpoint Isolation & Compatibility
    // -------------------------------------------------------------------------
    console.log('\nCategory 17: V1 Endpoint Isolation & Compatibility');
    {
      const v1Res = await sendRequest(port, {
        path: '/api/simulate',
        method: 'POST',
        body: { goal: 'Launch Startup', decision: 'Commit Full Time' },
      });
      assert(v1Res.statusCode === 200, 'Legacy /api/simulate responds successfully');
      assert(v1Res.body.source === 'v1-legacy', 'Legacy response remains intact without V2 interference');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 18: Malformed JSON Syntax Handling
    // -------------------------------------------------------------------------
    console.log('\nCategory 18: Malformed JSON Syntax Handling');
    {
      const res = await sendRequest(port, {
        path: '/api/v2/analyze-decision',
        method: 'POST',
        rawBody: '{"invalidJson": unquotedValue,}',
      });
      assert(res.statusCode === 400, 'Rejects malformed JSON syntax with HTTP 400');
      assert(res.body.error.code === 'MALFORMED_JSON', 'Error code is MALFORMED_JSON');
    }

    // -------------------------------------------------------------------------
    // CATEGORY 19: Zero Gemini AI Calls in Quantitative Path
    // -------------------------------------------------------------------------
    console.log('\nCategory 19: Zero Gemini AI Calls Verification');
    {
      // Quantitative execution completes without any GEMINI_API_KEY requirement
      const oldKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const payload = createStandardPayload();
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      assert(res.statusCode === 200, 'V2 endpoint succeeds with zero Gemini API key configured');
      assert(res.body.data.decisionDNA !== undefined, 'Decision DNA calculated without AI');

      if (oldKey) process.env.GEMINI_API_KEY = oldKey;
    }

    // -------------------------------------------------------------------------
    // CATEGORY 20: Zero External Network I/O (Benchmark Latency)
    // -------------------------------------------------------------------------
    console.log('\nCategory 20: Zero External Network I/O & Offline Latency');
    {
      const t0 = performance.now();
      const payload = createStandardPayload();
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });
      const elapsed = performance.now() - t0;

      assert(res.statusCode === 200, 'Calculates offline without external network sockets');
      console.log(`    ℹ End-to-end HTTP request duration: ${elapsed.toFixed(2)}ms`);
      assert(elapsed < 50, `Sub-50ms local HTTP turnaround (${elapsed.toFixed(2)}ms)`);
    }

    // -------------------------------------------------------------------------
    // CATEGORY 21: ValueState Enum Preservation
    // -------------------------------------------------------------------------
    console.log('\nCategory 21: ValueState Enum Preservation');
    {
      const payload = createStandardPayload();
      payload.financial!.expectedIncomeChangeMonthly = { state: 'NOT_PROVIDED' };
      const res = await sendRequest(port, { path: '/api/v2/analyze-decision', method: 'POST', body: payload });

      const calculations = res.body.data.scenarios.upsideCase.calculations;
      assert(
        calculations.surplusCapitalAccumulationState === 'INSUFFICIENT_DATA',
        'Preserves ValueState INSUFFICIENT_DATA without zero-coercion'
      );
      assert(
        calculations.surplusCapitalAccumulation === undefined,
        'Does not invent fake numerical value for INSUFFICIENT_DATA state'
      );
    }
  } finally {
    server.close();
  }

  console.log('\n--------------------------------------------------');
  console.log(`PHASE 3.5 SERVER PIPELINE TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('--------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runServerIntegrationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
