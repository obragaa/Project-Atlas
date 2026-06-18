# Atlas API container (blueprint/19 - DevOps.md, 20 - Infrastructure.md):
# multi-stage, minimal image, non-root user, no embedded secrets.

# ── Stage 1: install + build ────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /repo

RUN corepack enable

# Copy workspace manifests first for better layer caching.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# Copy sources and build the API and its workspace deps.
COPY packages/config ./packages/config
COPY packages/contracts ./packages/contracts
COPY apps/api ./apps/api

RUN pnpm --filter @atlas/api build \
  && pnpm --filter @atlas/api deploy --prod /app

# ── Stage 2: runtime ────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Run as the built-in non-root user (blueprint/20: "Usuário não-root").
USER node

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /repo/apps/api/dist ./dist
COPY --chown=node:node --from=builder /repo/apps/api/package.json ./package.json

EXPOSE 3333

# Liveness probe target (blueprint/19 health checks).
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
