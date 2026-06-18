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
│ design sys. │   │ OpenAPI + types│          │(Drizzle) │ │(sessions)│ │(planned) │
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

The shared kernel also owns two cross-cutting infrastructure seams used by every
domain module (`apps/api/src/shared`, wired by the global `SharedKernelModule`):

- **Domain-event dispatch** (`DOMAIN_EVENT_PUBLISHER`): use cases publish an
  aggregate's recorded events after persistence; an in-process synchronous
  dispatcher invokes handlers, isolating handler failures from the business
  flow (blueprint/12, 13). `UserRegistered` now actually fires.
- **Audit channel** (`AUDIT_LOGGER`): a dedicated, append-only structured-log
  channel (`channel: "audit"`) distinct from technical logs, recording
  security-relevant facts — register, login (success/failure), token refresh,
  logout, and session revocation on reuse detection (blueprint/15 "Audit Trail",
  21 fourth pillar). Entries carry stable ids only — never passwords or raw
  tokens.

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

## What is implemented (Phase 2 — Persistence & Sessions)

| Area                                                                      | Status                   |
| ------------------------------------------------------------------------- | ------------------------ |
| Persistence: Drizzle `users` schema + migration, `PostgresUserRepository` | ✅ (PGlite integ. tests) |
| Dual database driver (node-postgres runtime / PGlite tests) behind a port | ✅                       |
| Readiness probe checks dependencies; ordered graceful shutdown gate       | ✅ (probe-verified)      |
| Application cache port + in-memory adapter (Redis adapter to follow)      | ✅                       |
| Sessions (doc 15): refresh rotation, reuse→family revocation, real logout | ✅ (flow-verified)       |
| Refresh tokens hashed at rest (keyed SHA-256, optional pepper)            | ✅                       |
| Domain-event dispatch + audit channel (register/login/refresh/logout)     | ✅                       |

### Resolved (were Phase 1 tracked exceptions)

- **In-memory `UserRepository`** → resolved by `PostgresUserRepository`
  (PostgreSQL + Drizzle, doc 13); the in-memory `FakeUserRepository` is now a
  test-only fixture.
- **Stateless logout / no refresh-token store** → resolved by the Redis-backed
  `SessionStore` with current-hash refresh rotation, reuse detection, and
  family-wide revocation; logout revokes server-side immediately.

### Tracked exceptions (blueprint/23)

- **In-memory adapters for tests/local** — `InMemorySessionStore` and
  `InMemoryCache` mirror the Redis adapters' semantics so the app runs without
  Redis (`SESSION_DRIVER=memory`, PGlite database). Single-process only;
  production uses the Redis adapters. _Owner: backend._
- **In-process event dispatch (no durable outbox)** — domain events dispatch
  synchronously in-process; a crash between persistence and dispatch can drop an
  event. A transactional outbox is deferred until a module needs cross-service
  delivery guarantees (doc 13).
- **Audit channel is log-based (no tamper-evident store)** — audit entries flow
  to a dedicated structured-log channel, not yet to immutable, append-only
  storage with its own retention (doc 15 "auditoria imutável", 21 retention).
- **No circuit breakers** on backing-service calls (doc 17) — timeouts and
  bounded reconnect exist; breakers are deferred.
- **No MFA / account lockout** (doc 15) — the architecture is prepared (risk
  level on sessions, device ids) but TOTP/passkeys and progressive lockout are
  not implemented.
- **Risk scoring seeded as `low`** — the session risk-analysis engine
  (suspicious-activity detection, doc 15) is deferred; sessions record a risk
  level but it is not yet computed.
- **No backup / retention policy** wired for Postgres/Redis (docs 13, 20).

## Roadmap (derived from the Blueprint)

- **Phase 2 — Persistence & sessions:** ✅ delivered — PostgreSQL + Drizzle
  adapters, migrations (doc 13), Redis-backed sessions + refresh-token
  rotation/revocation (doc 15), readiness probe checks dependencies, audit
  channel and domain-event dispatch.
- **Phase 3 — Core experience:** the Core dashboard (docs 03/07), Workouts,
  Exercises, Progress, Missions/Gamification (doc 09) as domain modules.
- **Phase 4 — Atlas AI:** the AI Gateway, Context/Prompt/Tool engines, prompt
  registry, guardrails, observability (docs 10/22).
- **Phase 5 — Observability & delivery hardening:** OpenTelemetry traces/metrics
  (doc 21), dashboards, runbooks, progressive delivery (doc 19).

## Decision records

See [`docs/adr`](./adr). Every structural decision is recorded there.
