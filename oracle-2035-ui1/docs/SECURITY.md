# ORACLE 2035 — Security Architecture & Threat Model

## 1. Client/Server Boundary Enforcement

- **Zero Client Secrets**: `GEMINI_API_KEY`, server environment variables, and Node.js SDKs are strictly forbidden from the browser bundle.
- **Server-Only Execution**: The `@google/genai` library is imported and executed exclusively inside `server.ts` and backend services.
- **Client Bundle Verification**: Scans guarantee that no `process.env`, `AIzaSy`, or secret tokens are bundled into client-side JS.

---

## 2. HTTP Defense & Network Hardening

- **Headers**:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-XSS-Protection: 0` (Modern standard relying on CSP/framework sanitization)
- **Request Body Limit**: Strict 2MB ceiling enforced via `express.json({ limit: "2mb" })`.
- **Per-Instance Rate Limiting**: 60 requests/minute per IP window with sliding expiration and automated cleanup.
- **Readiness & Health Probes**: Dependency-free, unauthenticated probes for container health monitoring.

---

## 3. Input Sanitization & Injection Prevention

- **HTML & XSS Escaping**: All user-authored strings (`userNotes`, `decisionStatement`, `desiredOutcome`, `evidenceSources`) are strictly HTML-entity escaped in `oracleExportService.ts` before insertion into HTML reports.
- **Prototype Pollution Prevention**: Strict object validation avoids unsafe recursive merges of unverified objects.
- **Unauthorized Metric Injection**: The schema validator actively strips or rejects client-supplied computed metrics (such as `calculatedDNA`, `dnaScores`, `hashes`, `scenarios`), ensuring the server remains the sole calculation authority.

---

## 4. AI Prompt Isolation

- Bounded system prompts with strict JSON formatting schemas.
- Epistemic constraints injected directly into model parameters.
- Total execution timeout (12s) prevents upstream hangs.
- Unhandled AI errors fall back to deterministic outputs with `explanationStatus: "UNAVAILABLE"`.
