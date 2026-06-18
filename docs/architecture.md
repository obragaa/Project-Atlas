# Atlas — System Architecture

> This document is the consolidated, living model of the Atlas system. It is
> derived entirely from `/blueprint` (the source of truth) and records how the
> Blueprint is being realized. It evolves with the code (blueprint/23).

## System shape

Atlas is a monorepo (ADR-0001) with a clear separation between the experience
(web), the domain (api), and the shared contracts and design language.

```text
┌─────────────┐     HTTPS / REST (RFC 7807)      ┌──────────────────────────┐
│  apps/web   │ ───────────────────────────────▶ │        apps/api          │
│  Next.js 15 │   @atlas/contracts (typed wire)  │  NestJS · layered DDD    │
│  RSC + DS   │ ◀─────────────────────────────── │  by domain module        │
└─────────────┘                                  └────────────┬─────────────┘
      │ consumes                                               │ ports → adapters
      ▼                                                        ▼
┌─────────────┐   ┌──────────────┐            ┌──────────┐ ┌──────────┐ ┌──────────┐
│  @atlas/ui  │   │@atlas/contracts│          │ Postgres │ │  Redis   │ │ Atlas AI │
│ design sys. │   │ OpenAPI + types│          │ (planned)│ │(planned) │ │(planned) │
└─────────────┘   └──────────────┘            └──────────┘ └──────────┘ └──────────┘
```

## Backend layering (blueprint/12)

Each domain module under `apps/api/src/modules/<domain>` is internally layered;
dependencies point inward and the Domain layer is framework/DB-agnostic.

```text
presentation/   controllers, DTOs, guards, decorators  (knows HTTP)
application/    use cases — the business rules          (knows ports)
domain/         entities, value objects, events, ports  (knows nothing external)
infrastructure/ adapters implementing the ports         (knows the world)
```

The shared kernel (`apps/api/src/shared/domain`) provides framework-free
primitives: `Identifier`, `Entity`, `AggregateRoot`, `ValueObject`,
`DomainEvent`, and the `DomainError` hierarchy that maps to the API error
taxonomy.

Cross-cutting concerns (`apps/api/src/shared/http`, `config`): correlation IDs,
the RFC 7807 exception filter, validation→422 mapping, structured logging
(pino) with secret redaction, and validated environment config (zod, fail-fast).

## What is implemented (Phase 1 — Foundation)

| Area                                                                  | Status                    |
| --------------------------------------------------------------------- | ------------------------- |
| Governance: ADRs, fixed `main.md` index                               | ✅                        |
| Monorepo + shared config (TS/ESLint/Prettier)                         | ✅                        |
| Design System: tokens, motion, a11y, base components                  | ✅                        |
| API contract: OpenAPI + shared types (contract-first)                 | ✅                        |
| API skeleton: health, RFC 7807, correlation IDs, logging              | ✅ (boot-verified)        |
| Authentication (doc 15): register/login/refresh/me, argon2, JWT, RBAC | ✅ (flow-verified)        |
| Web: landing, auth flow, living background, design-system wiring      | ✅ (build+serve-verified) |
| CI quality gates, API Dockerfile, local infra compose                 | ✅                        |

### Tracked exceptions (blueprint/23)

- **In-memory `UserRepository`** — the persistence layer (PostgreSQL + Drizzle,
  doc 13) is not yet implemented. Because the domain depends only on the
  `UserRepository` port, this is a pure infrastructure swap. _Owner: backend.
  Remove when Phase 2 lands._
- **Stateless logout / no refresh-token store** — refresh rotation issues a new
  token but does not yet revoke the old one server-side; this requires the
  session store (Redis) from Phase 2.

## Roadmap (derived from the Blueprint)

- **Phase 2 — Persistence & sessions:** PostgreSQL + Drizzle adapters,
  migrations (doc 13), Redis-backed sessions + refresh-token rotation/revocation
  (doc 15), readiness probe checks dependencies.
- **Phase 3 — Core experience:** the Core dashboard (docs 03/07), Workouts,
  Exercises, Progress, Missions/Gamification (doc 09) as domain modules.
- **Phase 4 — Atlas AI:** the AI Gateway, Context/Prompt/Tool engines, prompt
  registry, guardrails, observability (docs 10/22).
- **Phase 5 — Observability & delivery hardening:** OpenTelemetry traces/metrics
  (doc 21), dashboards, runbooks, progressive delivery (doc 19).

## Decision records

See [`docs/adr`](./adr). Every structural decision is recorded there.
