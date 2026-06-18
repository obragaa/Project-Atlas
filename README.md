# Atlas

> More than a fitness platform. An intelligent ecosystem for human evolution.

Atlas is a premium SaaS for physical evolution, where engineering, experience,
and artificial intelligence work together to guide people through their fitness
journey.

This repository is built **exclusively** from the architectural contract in
[`/blueprint`](./blueprint). The Blueprint is the single source of truth; every
implementation decision derives from it. Start at
[`blueprint/main.md`](./blueprint/main.md).

## Repository structure

```text
apps/
  web/        Next.js 15 — the Atlas experience (App Router, RSC)
  api/        NestJS — layered DDD backend, organized by domain module
packages/
  ui/         Design System: tokens, primitives, motion, a11y
  contracts/  OpenAPI contract + shared types (contract-first)
  config/     Shared TypeScript, ESLint, Prettier configuration
docs/
  adr/        Architecture Decision Records
blueprint/    The architectural source of truth (read-only contract)
```

## Architecture at a glance

| Concern | Decision | Blueprint |
|---|---|---|
| Stack | pnpm + turborepo monorepo, TS end-to-end | ADR-0001 |
| Backend | Layered DDD by domain module, domain framework-agnostic | doc 12 |
| Data | PostgreSQL, domain-owned, aggregate roots, cursor pagination | doc 13 |
| API | Contract-first (OpenAPI), REST, RFC 7807 errors | doc 14 |
| Auth | Opaque identity, access + rotating refresh tokens, RBAC + policy | doc 15 |
| AI | Provider-agnostic gateway, context-first, tools before hallucination | docs 10, 22 |
| Frontend | Token-driven, accessible-by-default, motion as a first-class concern | docs 04–06, 11 |
| Quality | Testing pyramid, security & performance gates, observability | docs 16–21 |

## Getting started

Requires Node ≥ 20 and pnpm ≥ 9 (`corepack enable`).

```bash
pnpm install        # install all workspace dependencies
pnpm dev            # run web + api in development
pnpm lint           # lint all packages
pnpm typecheck      # type-check all packages
pnpm test           # run all tests
pnpm build          # build all packages
```

Copy [`.env.example`](./.env.example) to `.env` before running. Secrets never
live in the repository (see `blueprint/16 - Security.md`).

## Engineering governance

Structural decisions are recorded as ADRs under [`docs/adr`](./docs/adr).
Documentation evolves with the code; stale documentation is treated as a defect
(`blueprint/23 - Engineering Governance.md`).
