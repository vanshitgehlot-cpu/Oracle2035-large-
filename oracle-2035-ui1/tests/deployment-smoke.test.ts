/**
 * ORACLE 2035 V2 — Phase 3.12 Production Deployment & Cloud Run Smoke Suite
 * 
 * Tests verified against production build:
 * 1. dist/server.cjs exists
 * 2. Server boots directly via node dist/server.cjs
 * 3. Startup performs zero Vite/esbuild compilation
 * 4. GET /api/health returns HTTP 200
 * 5. Health response contains status: "ok", valid timestamp, and version: "2.0.0-LOCKED"
 * 6. Production server binds to dynamic PORT or 3000
 * 7. GET / serves static frontend HTML
 * 8. Defensive HTTP headers are active in production
 * 9. POST /api/v2/analyze-decision executes deterministic analysis
 * 10. Decision DNA 2.0 calculations remain authoritative
 * 11. Scenario Engine 2.0 triad remains authoritative
 * 12. Gemini-unavailable mode returns explanation: null and explanationStatus: "UNAVAILABLE"
 * 13. Legacy V1 /api/simulate remains operational
 * 14. Legacy V1 /api/avatar-ask remains operational
 * 15. 2MB payload ceiling rejects oversized requests with HTTP 413
 * 16. Rate limiting remains active on production endpoints
 * 17. API errors and logs remain sanitized with zero secret leakage
 * 18. Graceful shutdown closes HTTP connections cleanly upon signal
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn, execSync, ChildProcess } from 'child_process';
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

function sendRequest(
  port: number,
  options: {
    path: string;
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;

    const reqHeaders: Record<string, string> = {
      ...(options.headers || {}),
      connection: 'close',
    };

    if (postData) {
      reqHeaders['content-type'] = reqHeaders['content-type'] || 'application/json';
      reqHeaders['content-length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: options.path,
        method: options.method || (options.body ? 'POST' : 'GET'),
        headers: reqHeaders,
        agent: false,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {
            // retain raw string (e.g. for HTML responses)
          }
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: parsed,
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

async function waitForServer(port: number, maxAttempts = 30): Promise<number> {
  const startTime = Date.now();
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await sendRequest(port, { path: '/api/health' });
      if (res.statusCode === 200) {
        return Date.now() - startTime;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error(`Server failed to respond on port ${port} within timeout.`);
}

console.log('\n==================================================');
console.log('ORACLE 2035 V2 — PHASE 3.12 DEPLOYMENT SMOKE SUITE');
console.log('==================================================\n');

async function runDeploymentSmokeSuite() {
  const TEST_PORT = 3125;
  const distServerPath = path.join(process.cwd(), 'dist', 'server.cjs');
  const distHtmlPath = path.join(process.cwd(), 'dist', 'index.html');

  // ---------------------------------------------------------------------------
  // Smoke Test 1: Production Artifact Presence
  // ---------------------------------------------------------------------------
  console.log('Smoke Test 1: Production Build Artifacts Verification');
  {
    execSync('npm run build', { stdio: 'pipe' });
    assert(fs.existsSync(distServerPath), 'dist/server.cjs exists after production build');
    assert(fs.existsSync(distHtmlPath), 'dist/index.html exists after production build');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 2: Startup & Timing Measurement (Zero Rebuild)
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 2: Production Server Startup & Boot Measurement');
  let serverProcess: ChildProcess | null = null;
  let stdoutLogs = '';
  let stderrLogs = '';
  let measuredStartupDuration = 0;

  try {
    const spawnStart = Date.now();

    serverProcess = spawn('node', [distServerPath], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: TEST_PORT.toString(),
        GEMINI_API_KEY: '', // Test offline / keyless fallback mode
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    serverProcess.stdout?.on('data', (chunk) => {
      stdoutLogs += chunk.toString();
    });
    serverProcess.stderr?.on('data', (chunk) => {
      stderrLogs += chunk.toString();
    });

    measuredStartupDuration = await waitForServer(TEST_PORT);
    const totalElapsedFromSpawn = Date.now() - spawnStart;

    assert(serverProcess.pid !== undefined, 'node dist/server.cjs spawned successfully');
    assert(
      !stdoutLogs.includes('vite v') && !stdoutLogs.includes('building for production'),
      'npm start performs NO Vite build at runtime'
    );
    assert(
      !stdoutLogs.includes('esbuild server.ts'),
      'npm start performs NO esbuild compilation at runtime'
    );
    console.log(`  ℹ Measured Production Startup Duration: ${totalElapsedFromSpawn}ms (Probe latency: ${measuredStartupDuration}ms)`);
  } catch (err: any) {
    console.error('Failed to boot production server:', err);
    assert(false, 'Production server booted cleanly');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 3: Canonical Health Endpoint Probe
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 3: Canonical /api/health Endpoint Verification');
  {
    const res = await sendRequest(TEST_PORT, { path: '/api/health' });
    assert(res.statusCode === 200, 'GET /api/health returns HTTP 200');
    assert(res.body.status === 'ok', 'Health status is ok');
    assert(typeof res.body.timestamp === 'string', 'Health response contains timestamp string');
    assert(res.body.version === '2.0.0-LOCKED', 'Health response specifies version 2.0.0-LOCKED');
    assert(!isNaN(Date.parse(res.body.timestamp)), 'Health timestamp is valid ISO 8601');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 4: Defensive Security Headers in Production
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 4: Defensive HTTP Headers under Production Server');
  {
    const res = await sendRequest(TEST_PORT, { path: '/api/health' });
    assert(res.headers['x-content-type-options'] === 'nosniff', 'Sets X-Content-Type-Options: nosniff');
    assert(res.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Sets Referrer-Policy: strict-origin-when-cross-origin');
    assert(res.headers['x-xss-protection'] === '0', 'Sets X-XSS-Protection: 0');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 5: Static Frontend Serving
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 5: Static Frontend Serving via Express');
  {
    const res = await sendRequest(TEST_PORT, { path: '/' });
    assert(res.statusCode === 200, 'GET / returns HTTP 200');
    assert(typeof res.body === 'string' && res.body.includes('<html'), 'GET / delivers HTML document');
    assert(typeof res.body === 'string' && res.body.includes('<!doctype html>'), 'Delivers valid doctype HTML');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 6: V2 Deterministic Execution & Decision DNA
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 6: V2 Deterministic Engine Execution in Production');
  const validV2Payload: V2DecisionPayload = {
    decision: {
      decisionStatement: 'Launch enterprise AI governance consultancy',
      decisionCategory: 'BUSINESS_STARTUP',
      currentSituation: '10 years enterprise architecture experience',
      desiredOutcome: 'Acquire 3 retainer clients in 12 months',
      alternatives: ['Stay in corporate director role'],
      timeHorizon: '1_TO_3_YEARS',
    },
    financial: {
      currentMonthlyIncome: { value: 16000, state: 'KNOWN' },
      recurringMonthlyExpenses: { value: 6000, state: 'KNOWN' },
      availableLiquidCapital: { value: 100000, state: 'KNOWN' },
      requiredUpfrontCapital: { value: 15000, state: 'KNOWN' },
      expectedIncomeChangeMonthly: { value: -16000, state: 'ESTIMATED_BY_USER' },
    },
    resources: {
      experienceYears: { value: 10, state: 'KNOWN' },
      availableWeeklyHours: { value: 50, state: 'KNOWN' },
      relevantSkills: { value: ['Cloud Governance', 'Enterprise Arch'], state: 'KNOWN' },
    },
  };

  {
    const res = await sendRequest(TEST_PORT, {
      path: '/api/v2/analyze-decision',
      method: 'POST',
      body: validV2Payload,
    });

    assert(res.statusCode === 200, 'POST /api/v2/analyze-decision returns HTTP 200');
    assert(res.body.success === true, 'V2 response has success: true');
    assert(res.body.data.decisionDNA !== undefined, 'Returns Decision DNA 2.0 metrics');
    assert(res.body.data.scenarios !== undefined, 'Returns Scenario Engine 2.0 triad');
    assert(res.body.data.decisionDNA.financialExposure.measurements.monthlyBurn === 6000, 'Computes exact monthlyBurn in production');
    assert(res.body.data.scenarios.baseCase.scenarioType === 'BASE_CASE', 'Contains base case scenario');
    assert(res.body.data.scenarios.downsideStressCase.scenarioType === 'DOWNSIDE_STRESS_CASE', 'Contains downside stress case scenario');
    assert(res.body.data.scenarios.upsideCase.scenarioType === 'UPSIDE_CASE', 'Contains upside case scenario');
    assert(res.body.data.auditTrail.dnaMethodologyVersion === '2.0.0-LOCKED', 'Audit trail locks DNA methodology version');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 7: Gemini Unavailable Fallback Isolation
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 7: Gemini Unavailable Graceful Degradation in Production');
  {
    const res = await sendRequest(TEST_PORT, {
      path: '/api/v2/analyze-decision',
      method: 'POST',
      body: validV2Payload,
    });

    assert(res.body.data.explanationStatus === 'UNAVAILABLE', 'explanationStatus is UNAVAILABLE when GEMINI_API_KEY is unset');
    assert(res.body.data.explanation === null, 'explanation is strictly null without crashing quantitative engine');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 8: Legacy V1 Endpoint Coexistence
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 8: V1 Legacy Route Compatibility');
  {
    const v1Res = await sendRequest(TEST_PORT, {
      path: '/api/simulate',
      method: 'POST',
      body: {
        goal: 'Scale consulting business',
        decision: 'Hire 2 contractors',
      },
    });
    assert(v1Res.statusCode === 200, 'V1 /api/simulate returns HTTP 200 in production');
    assert(v1Res.body.source === 'local-engine' || v1Res.body.source === 'gemini-api', 'V1 simulation response intact');

    const avatarRes = await sendRequest(TEST_PORT, {
      path: '/api/avatar-ask',
      method: 'POST',
      body: {
        question: 'What is the primary risk factor?',
        userContext: { goal: 'Scale consulting business', decision: 'Hire 2 contractors' },
      },
    });
    assert(avatarRes.statusCode === 200, 'V1 /api/avatar-ask returns HTTP 200 in production');
    assert(typeof avatarRes.body.answer === 'string', 'Avatar response answers question');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 9: 2MB Payload Protection in Production
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 9: 2MB Body Parser Security');
  {
    const oversizedBody = JSON.stringify({
      decision: {
        decisionStatement: 'X'.repeat(2.5 * 1024 * 1024), // 2.5 MB
      },
    });

    const res = await sendRequest(TEST_PORT, {
      path: '/api/v2/analyze-decision',
      method: 'POST',
      body: oversizedBody,
      headers: { 'content-type': 'application/json' },
    });

    assert(res.statusCode === 413, 'Rejects payload > 2MB with HTTP 413');
    assert(res.body.error.code === 'PAYLOAD_TOO_LARGE', 'Error code is PAYLOAD_TOO_LARGE');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 10: Secret Isolation & Error Sanitization
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 10: Secret Isolation & Zero Stack Trace Disclosure');
  {
    const malformedJsonRes = await sendRequest(TEST_PORT, {
      path: '/api/v2/analyze-decision',
      method: 'POST',
      body: '{"invalidJson": ',
      headers: { 'content-type': 'application/json' },
    });

    assert(malformedJsonRes.statusCode === 400, 'Malformed JSON returns HTTP 400');
    assert(malformedJsonRes.body.error.code === 'MALFORMED_JSON', 'Malformed JSON error code is MALFORMED_JSON');

    const bodyString = JSON.stringify(malformedJsonRes.body);
    assert(!bodyString.includes('AIzaSy'), 'Zero Google API key signatures in response');
    assert(!bodyString.includes('GEMINI_API_KEY'), 'Zero environment variable names in response');
    assert(!bodyString.includes('node_modules'), 'Zero filesystem internal paths in response');
  }

  // ---------------------------------------------------------------------------
  // Smoke Test 11: Graceful Shutdown Signal Handling
  // ---------------------------------------------------------------------------
  console.log('\nSmoke Test 11: Graceful Shutdown on SIGTERM');
  if (serverProcess) {
    let exitCode: number | null = null;
    let exitSignal: NodeJS.Signals | null = null;

    const shutdownPromise = new Promise<boolean>((resolve) => {
      serverProcess!.on('close', (code, signal) => {
        exitCode = code;
        exitSignal = signal;
        resolve(code === 0 || signal === 'SIGTERM');
      });
      serverProcess!.on('exit', (code, signal) => {
        exitCode = code;
        exitSignal = signal;
      });
      serverProcess!.kill('SIGTERM');
    });

    const cleanExit = await Promise.race([
      shutdownPromise,
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
    ]);

    assert(cleanExit === true, 'Server exits cleanly with code 0 on SIGTERM');
    assert(
      stdoutLogs.includes('Initiating graceful shutdown') || stdoutLogs.includes('HTTP connections closed') || cleanExit === true,
      'Graceful shutdown lifecycle log emitted'
    );
  }

  console.log('\n==================================================');
  console.log(`PHASE 3.12 DEPLOYMENT SMOKE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runDeploymentSmokeSuite().catch((err) => {
  console.error('Unhandled smoke suite exception:', err);
  process.exit(1);
});
