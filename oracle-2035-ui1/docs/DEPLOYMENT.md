# ORACLE 2035 — Deployment & Operations Guide

## 1. Production Build & Execution

The production build compiles the frontend into static assets (`dist/`) and bundles the server into a single CommonJS artifact (`dist/server.cjs`):

```bash
# Production build command
npm run build

# Production start command
npm start
```

---

## 2. Containerized Deployment (Docker & Cloud Run)

### Multi-Stage Build
The multi-stage `Dockerfile` uses `node:22-alpine` to build the app and outputs a minimal runtime container image:

- Stage 1 (`builder`): Compiles client assets and bundles `dist/server.cjs`.
- Stage 2 (`runner`): Copies compiled `dist/`, installs production dependencies, sets `USER node`, and listens on port `3000`.

### Container Port & Networking
- Port `3000` is the single externally accessible port.
- Dev and production servers bind to `0.0.0.0:3000`.

---

## 3. Container Lifecycle & Graceful Shutdown

- Handles `SIGTERM` and `SIGINT` signals gracefully.
- Closes idle and active HTTP connections.
- Clean process termination within 1.5 seconds.
- Probes:
  - Liveness: `GET /api/health`
  - Readiness: `GET /api/ready`
