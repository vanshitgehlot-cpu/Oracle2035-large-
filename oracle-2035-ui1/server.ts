import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

import { createFutureSelfProfile, generateFutureSelfResponse } from "./src/services/futureSelfEngine";
import { validateV2DecisionPayload } from "./src/validation/decisionSchema";
import {
  executeUnifiedAnalysis,
  adaptLegacyInputToV2Payload,
  adaptUnifiedResultToLegacySimulation,
} from "./src/services/unifiedDecisionEngine";
import {
  V2AnalyzeDecisionRequest,
  V2AnalyzeDecisionSuccessResponse,
  V2AnalyzeDecisionErrorResponse,
  V2ApiErrorCode,
} from "./src/types/v2";

export function createApp() {
  const app = express();

  // ============================================================================
  // 1. DEFENSIVE HTTP SECURITY HEADERS & REQUEST ID OBSERVABILITY (Phase 7)
  // ============================================================================
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Prevent MIME-type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Control referrer information sent in requests
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Cross-Origin Resource Policy
    res.setHeader("X-XSS-Protection", "0");

    // Traceable Request ID propagation
    const incomingReqId = req.headers["x-request-id"] as string;
    const reqId = incomingReqId && /^[a-zA-Z0-9_-]{1,64}$/.test(incomingReqId)
      ? incomingReqId
      : crypto.randomUUID();
    res.setHeader("X-Request-Id", reqId);
    (req as any).requestId = reqId;

    // Structured non-sensitive operational logging for API endpoints
    const startTime = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api/")) {
        const durationMs = Date.now() - startTime;
        console.log(`[ORACLE API] req_id=${reqId} method=${req.method} path=${req.path} status=${res.statusCode} duration=${durationMs}ms`);
      }
    });

    next();
  });

  // ============================================================================
  // CANONICAL HEALTH & READINESS PROBES (Phase 7)
  // Non-blocking, dependency-free probe for Cloud Run & container readiness
  // ============================================================================
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.0.0-LOCKED",
    });
  });

  app.get("/api/ready", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      version: "2.0.0-LOCKED",
    });
  });

  // ============================================================================
  // 2. PER-INSTANCE IN-MEMORY RATE LIMITING FOR API ENDPOINTS (Phase 7)
  // Explicitly scoped as per-instance protection (60 req/min per IP per container)
  // ============================================================================
  const v2RateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
  const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP per server instance

  // Periodic cleanup every 5 minutes to prevent map memory growth
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of v2RateLimitMap.entries()) {
      if (now > entry.resetTime) {
        v2RateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
  cleanupInterval.unref?.();

  const v2RateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown-client";
    const now = Date.now();
    const current = v2RateLimitMap.get(clientIp);

    if (!current || now > current.resetTime) {
      v2RateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      res.setHeader("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString());
      res.setHeader("X-RateLimit-Remaining", (MAX_REQUESTS_PER_WINDOW - 1).toString());
      return next();
    }

    if (current.count >= MAX_REQUESTS_PER_WINDOW) {
      const retryAfterSeconds = Math.ceil((current.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      res.setHeader("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString());
      res.setHeader("X-RateLimit-Remaining", "0");

      const rateLimitResponse: V2AnalyzeDecisionErrorResponse = {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many decision analysis requests. Rate limit of ${MAX_REQUESTS_PER_WINDOW} req/min exceeded. Please wait ${retryAfterSeconds} second(s) before retrying.`,
          details: [{ field: "clientIp", issue: "Per-instance request rate limit of 60 requests/min exceeded." }],
        },
      };
      return res.status(429).json(rateLimitResponse);
    }

    current.count += 1;
    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString());
    res.setHeader("X-RateLimit-Remaining", (MAX_REQUESTS_PER_WINDOW - current.count).toString());
    next();
  };

  // Canonical 2MB JSON body limit with strict malformed JSON parser error handling
  app.use(express.json({ limit: "2mb" }));

  // Custom JSON error middleware for malformed JSON and body size violations
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err && err.type === "entity.too.large") {
      const response: V2AnalyzeDecisionErrorResponse = {
        success: false,
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Request payload exceeds the canonical 2MB limit.",
        },
      };
      return res.status(413).json(response);
    }
    if (err instanceof SyntaxError && "body" in err) {
      const response: V2AnalyzeDecisionErrorResponse = {
        success: false,
        error: {
          code: "MALFORMED_JSON",
          message: "Request body contains malformed or unparseable JSON.",
        },
      };
      return res.status(400).json(response);
    }
    next(err);
  });

  // ============================================================================
  // CANONICAL UNIFIED DECISION ANALYSIS HANDLER (Serving /api/analyze-decision & /api/v2/analyze-decision)
  // ============================================================================
  const handleAnalyzeDecision = async (req: Request, res: Response) => {
    try {
      const rawPayload = req.body;

      // 1. Authoritative Schema & Security Validation
      const validationResult = validateV2DecisionPayload(rawPayload);

      if (!validationResult.valid || !validationResult.data) {
        // Distinguish unauthorized computed field injection from general schema errors
        const hasUnauthorizedMetric = validationResult.errors.some((e) => {
          const forbiddenCalculatedKeys = [
            "calculatedDNA",
            "dnaScores",
            "decisionDNA",
            "calculatedScores",
            "overallScore",
            "probabilities",
            "scenarioProbabilities",
            "simulationProbabilities",
            "futureProbabilities",
            "calculatedVerdict",
            "confidenceScore",
            "scenarioOutcomes",
            "scenarios",
            "deterministicComputationHash",
            "provenance",
            "serverEvaluatedAt",
          ];
          return forbiddenCalculatedKeys.includes(e.path);
        });

        const errorCode = hasUnauthorizedMetric ? "UNAUTHORIZED_COMPUTED_FIELD" : "VALIDATION_FAILED";

        const errorResponse: V2AnalyzeDecisionErrorResponse = {
          success: false,
          error: {
            code: errorCode,
            message: hasUnauthorizedMetric
              ? "Client-supplied calculated metric is unauthorized. The server is the sole authoritative calculation engine."
              : "Validation failed against the canonical V2 decision schema.",
            details: validationResult.errors.map((e) => ({
              field: e.path,
              issue: e.message,
            })),
          },
        };

        return res.status(400).json(errorResponse);
      }

      // Extract canonical decision payload at the server boundary (stripping server-side audit envelope)
      const { validatedAt, validationVersion, ...canonicalPayload } = validationResult.data;

      // 2. Authoritative Pure Deterministic Unified Engine Execution
      const unifiedResult = await executeUnifiedAnalysis(canonicalPayload, {
        apiKey: process.env.GEMINI_API_KEY,
      });

      // 3. Canonical Response Envelope
      const successResponse = {
        success: true,
        data: unifiedResult,
      };

      return res.status(200).json(successResponse);
    } catch (err: any) {
      console.error("Error in decision analysis handler:", err);
      const errorResponse: V2AnalyzeDecisionErrorResponse = {
        success: false,
        error: {
          code: "SERVER_CALCULATION_ERROR",
          message: "A deterministic calculation failure occurred while evaluating the decision context.",
        },
      };
      return res.status(500).json(errorResponse);
    }
  };

  // Primary Canonical Unified Decision Endpoint
  app.post("/api/analyze-decision", v2RateLimiter, handleAnalyzeDecision);

  // Backwards-Compatible Alias Endpoint
  app.post("/api/v2/analyze-decision", v2RateLimiter, handleAnalyzeDecision);

  // API Endpoint: V2 Decision Payload Validation (Legacy Validator Route)
  app.post("/api/v2/validate-decision", (req, res) => {
    try {
      const result = validateV2DecisionPayload(req.body);
      if (!result.valid) {
        return res.status(400).json({
          valid: false,
          errors: result.errors,
        });
      }
      return res.status(200).json({
        valid: true,
        data: result.data,
      });
    } catch (err: any) {
      console.error("Error during V2 validation:", err);
      return res.status(500).json({
        valid: false,
        errors: [{ path: "root", message: "Internal validation failure.", code: "MALFORMED_STRUCTURE" }],
      });
    }
  });

  // Initialize Gemini AI Client
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // ============================================================================
  // LEGACY V1 SIMULATE ADAPTER ENDPOINT: Delegated to Unified Decision Engine
  // ============================================================================
  app.post("/api/simulate", v2RateLimiter, async (req: Request, res: Response) => {
    try {
      const {
        goal,
        decision,
        deadline,
        resources,
        riskTolerance,
        context,
        precalculatedDNA: clientDNA,
        precalculatedButterfly: clientButterfly,
      } = req.body;

      if (!goal || !decision) {
        return res.status(400).json({ error: "Goal and Decision are required parameters." });
      }

      // Convert legacy input into canonical V2 decision payload
      const v2Payload = adaptLegacyInputToV2Payload({
        goal,
        decision,
        deadline: deadline || "",
        resources: resources || "",
        riskTolerance: riskTolerance || "Balanced",
        context: context || "",
      });

      // Execute authoritative Unified Decision Engine
      const unifiedResult = await executeUnifiedAnalysis(v2Payload, {
        apiKey: process.env.GEMINI_API_KEY,
      });

      // Adapt canonical unified result to legacy simulation result for backwards compatibility
      const legacySim = adaptUnifiedResultToLegacySimulation(unifiedResult, {
        goal,
        decision,
        deadline: deadline || "",
        resources: resources || "",
        context: context || "",
      });

      const oracleResult = {
        bestFuture: {
          title: legacySim.bestFuture.title,
          timeline: legacySim.bestFuture.turningPoint,
          probability: legacySim.bestFuture.probability,
          advantages: legacySim.bestFuture.advantages,
          risks: legacySim.bestFuture.risks,
        },
        mostLikelyFuture: {
          title: legacySim.mostLikelyFuture.title,
          timeline: legacySim.mostLikelyFuture.turningPoint,
          probability: legacySim.mostLikelyFuture.probability,
          advantages: legacySim.mostLikelyFuture.advantages,
          risks: legacySim.mostLikelyFuture.risks,
        },
        worstFuture: {
          title: legacySim.worstFuture.title,
          timeline: legacySim.worstFuture.turningPoint,
          probability: legacySim.worstFuture.probability,
          advantages: legacySim.worstFuture.advantages,
          risks: legacySim.worstFuture.risks,
        },
        decisionDNA: clientDNA || {
          risk: legacySim.dnaMetrics.risk,
          growth: legacySim.dnaMetrics.growth,
          learning: legacySim.dnaMetrics.learning,
          money: legacySim.dnaMetrics.money,
          time: legacySim.dnaMetrics.time,
          confidence: legacySim.dnaMetrics.confidence,
        },
        butterflyEffect: clientButterfly || unifiedResult.timeline,
        futureSelfLetter: unifiedResult.avatarLetter.bodyParagraphs.join("\n\n"),
        recommendation: unifiedResult.avatarLetter.pivotalAdvice,
      };

      return res.status(200).json({
        source: unifiedResult.explanationStatus === "AVAILABLE" ? "gemini-api" : "local-engine",
        oracleResult,
        unifiedAnalysis: unifiedResult,
      });
    } catch (error: any) {
      console.error("Error in /api/simulate handler:", error);
      return res.status(500).json({ error: error.message || "Simulation failed." });
    }
  });

  // ============================================================================
  // FUTURE AVATAR 2035 ENDPOINTS (Supporting /api/avatar-ask and /api/chat-future-self)
  // ============================================================================
  const handleAvatarAsk = async (req: Request, res: Response) => {
    try {
      const { question, userContext, simulation, profile: clientProfile } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Question is required." });
      }

      const profile = clientProfile || createFutureSelfProfile();
      const context = {
        goal: userContext?.goal,
        decision: userContext?.decision,
        dna: simulation?.dnaMetrics,
        bestFutureTitle: simulation?.bestFuture?.title,
        mostLikelyFutureTitle: simulation?.mostLikelyFuture?.title,
        worstFutureTitle: simulation?.worstFuture?.title,
      };

      const answer = await generateFutureSelfResponse({
        question,
        profile,
        context,
        apiKey: process.env.GEMINI_API_KEY,
      });

      return res.json({ answer, reply: answer });
    } catch (err: any) {
      console.error("Error asking future avatar:", err);
      return res.status(500).json({ error: "Failed to query avatar." });
    }
  };

  app.post("/api/avatar-ask", v2RateLimiter, handleAvatarAsk);
  app.post("/api/chat-future-self", v2RateLimiter, handleAvatarAsk);

  return app;
}

async function startServer() {
  const app = createApp();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`ORACLE 2035 server running on http://localhost:${PORT}`);
  });

  const activeSockets = new Set<any>();
  server.on("connection", (socket) => {
    activeSockets.add(socket);
    socket.on("close", () => {
      activeSockets.delete(socket);
    });
  });

  // Graceful shutdown handling for Cloud Run & container lifecycle
  let isShuttingDown = false;
  const gracefulShutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`[ORACLE 2035] Received ${signal}. Initiating graceful shutdown...`);

    for (const socket of activeSockets) {
      socket.destroy();
    }
    activeSockets.clear();

    if (typeof (server as any).closeAllConnections === "function") {
      (server as any).closeAllConnections();
    } else if (typeof (server as any).closeIdleConnections === "function") {
      (server as any).closeIdleConnections();
    }

    server.close((err) => {
      if (err) {
        console.error("[ORACLE 2035] Error during HTTP server close:", err);
        process.exit(1);
      }
      console.log("[ORACLE 2035] HTTP connections closed. Process terminating cleanly.");
      process.exit(0);
    });

    // Bounded shutdown fallback: force exit after 1.5 seconds if connections fail to drain
    const forceExitTimer = setTimeout(() => {
      console.warn("[ORACLE 2035] Forceful shutdown triggered after timeout.");
      process.exit(0);
    }, 1500);
    forceExitTimer.unref?.();
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

// Only start the server if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  startServer();
} else if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('server.ts')) {
  startServer();
}
