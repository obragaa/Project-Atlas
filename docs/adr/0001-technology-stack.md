# ADR-0001 — Technology Stack

- **Status:** Accepted
- **Date:** 2026-06-18
- **Author:** Engineering (Atlas)
- **Supersedes:** —
- **Related Blueprint docs:** `11 - Frontend Architecture`, `12 - Backend Architecture`, `13 - Database`, `14 - API`, `22 - AI Engineering`, `24 - Engineering Principles`

---

## Context

The Atlas Blueprint is intentionally technology-agnostic (see the "Não Escopo"
sections of docs 12, 13, 14, 18 and the _Provider Independence_ principle in
doc 22). It defines **architecture and principles**, not tools. Before any
implementation, a foundational stack must be chosen and recorded, because every
downstream decision depends on it.

The governing constraints from the Blueprint are:

- **Layered DDD backend** (doc 12): Presentation → Application → Domain →
  Infrastructure, dependencies pointing inward, Domain independent of any
  framework, ORM, or database. Organized **by domain module**.
- **Domain-owned persistence** (doc 13): aggregate roots, opaque keys, cursor
  pagination, reversible migrations, referential integrity at the database
  level.
- **Contract-first API** (doc 14): OpenAPI is the source of truth, REST,
  resource-oriented, RFC 7807 errors.
- **Provider-agnostic AI** (doc 22): no module is coupled to a specific LLM
  vendor; everything goes through abstract interfaces and an AI Gateway.
- **Premium frontend** (docs 04, 05, 06, 11): design-token-driven, fully
  accessible, motion as a first-class concern, layered and composable.

## Problem

Which concrete technologies let us honor these contracts with the least
friction, while keeping the Domain layer pure and the architecture portable?

## Alternatives considered

1. **Next.js (web) + NestJS (api) + PostgreSQL, in a pnpm/turborepo monorepo.**
   NestJS maps cleanly onto layered DDD organized by module; Next.js App Router
   delivers the RSC-driven, premium frontend; a shared `contracts` package
   enforces contract-first; shared `ui` package enforces one design system.
2. **Next.js full-stack** (Route Handlers as the API).
   Lower infra cost, but the Domain layer must be defended from the framework
   by convention alone, and the backend/frontend separation the Blueprint
   implies (doc 12: "A UI deve poder ser completamente substituída") becomes a
   discipline problem rather than a structural one.
3. **Separate, non-monorepo repos.** Rejected: fragments the single design
   system and the shared API contract, and complicates atomic, blueprint-driven
   evolution ("código e documentação evoluem juntos", doc 23).

## Decision

Adopt **Option 1**: a single monorepo managed with **pnpm workspaces +
turborepo**, structured as:

```text
apps/
  web/        Next.js 15 (App Router, React Server Components, Tailwind CSS)
  api/        NestJS (layered DDD, organized by domain module)
packages/
  ui/         Design System: tokens, primitives, motion, a11y helpers
  contracts/  OpenAPI spec + generated/shared types (contract-first)
  config/     Shared ESLint, TypeScript, Prettier, Tailwind preset
docs/
  adr/        Architecture Decision Records
blueprint/    The architectural source of truth (read-only contract)
```

Supporting choices (each revisable via its own ADR if needed):

- **Language:** TypeScript end-to-end, `strict` everywhere (doc 24: strong typing).
- **Database:** PostgreSQL.
- **Persistence access:** Drizzle ORM, confined to the Infrastructure layer
  behind repository interfaces — the Domain never imports it (doc 12/13).
- **Cache / sessions / rate-limit store:** Redis (doc 17 multi-layer cache).
- **Object storage:** an abstract `StoragePort`; uploads never touch the app
  filesystem (doc 20 ADR-004).
- **AI:** a provider-agnostic gateway; default provider chosen in ADR-0002.
- **Observability:** OpenTelemetry (doc 21 ADR-001).

## Consequences

**Gained:** structural enforcement of the layered architecture; one design
system and one API contract shared across apps; portable Domain; reproducible
builds; clear ownership boundaries per package.

**Lost / cost:** monorepo tooling overhead; two runtimes to operate (web + api)
versus a single Next.js process; the team must keep Drizzle strictly inside
Infrastructure.

## Trade-offs

We accept higher initial setup complexity in exchange for long-term
architectural integrity, which doc 24 ("o domínio vem primeiro", "pequenas
mudanças são melhores") and doc 12 ("o domínio permanecerá") explicitly
prioritize over short-term convenience.

## References

- Blueprint `12 - Backend Architecture` (ADR-001, ADR-002)
- Blueprint `20 - Infrastructure` (ADR-003 Cloud Agnostic, ADR-004 Object Storage)
- The Twelve-Factor App
