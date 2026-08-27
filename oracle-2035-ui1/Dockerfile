# ============================================================================
# ORACLE 2035 — Production Multi-Stage Dockerfile (Phase 7 Hardened)
# ============================================================================

# Stage 1: Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests for deterministic dependency caching
COPY package.json package-lock.json* ./

RUN npm ci --ignore-scripts || npm install

# Copy application source code and configurations
COPY tsconfig.json vite.config.ts server.ts index.html metadata.json ./
COPY src/ ./src/

# Compile production client SPA (into dist/) and bundled server (into dist/server.cjs)
RUN npm run build

# Stage 2: Minimal Production Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts || npm install --production

# Copy compiled production artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/metadata.json ./metadata.json

# Run as non-root user for container security
USER node

EXPOSE 3000

# Start compiled CommonJS server
CMD ["node", "dist/server.cjs"]
