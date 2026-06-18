# Atlas — working context for AI agents

## The Blueprint is the source of truth

Everything in this repo derives from [`/blueprint`](./blueprint). Before any
change, consult `blueprint/main.md` to find the governing documents, then the
specific docs for the task. The Blueprint outranks code in every conflict; the
hierarchy is Engineering Principles (24) → Governance (23) → Vision (00) →
Experience/Product → Architecture → Technical → Implementation.

Never introduce a parallel pattern, duplicate a rule, or contradict a document.
When an implementation changes architecture, contracts, flows, rules, or
patterns, update the relevant Blueprint doc in the same change (docs evolve with
code — doc 23).

## Decisions are recorded

Structural decisions live in [`docs/adr`](./docs/adr). The foundational stack is
ADR-0001; the LLM provider strategy is ADR-0002. Add an ADR for any new
structural decision.

## Stack & layout

Monorepo: pnpm workspaces + turborepo, TypeScript end-to-end (`strict`).

- `apps/web` — Next.js 15 (App Router, RSC). Layered: layouts/pages/features/
  components/hooks/services/utils. Consumes `@atlas/ui` and `@atlas/contracts`.
- `apps/api` — NestJS, **layered DDD organized by domain module**
  (`modules/<domain>/{domain,application,infrastructure,presentation}`).
  The Domain layer imports no framework, no ORM, no DB. Use Cases hold business
  rules; controllers only validate/delegate/respond.
- `packages/ui` — Design System: tokens first, every component ships all states.
- `packages/contracts` — OpenAPI (contract-first) + shared types.
- `packages/config` — shared TS/ESLint/Prettier.

## Toolchain

Node and pnpm were installed via winget under `%LOCALAPPDATA%`. A fresh shell
may need that directory prepended to PATH. The package manager is pinned via
`packageManager` in the root `package.json`; use `corepack enable` then pnpm.

## Non-negotiables (from the Blueprint)

- Domain layer is framework/DB-agnostic (doc 12).
- Domain owns its data; aggregate roots; opaque keys; cursor pagination (doc 13).
- Contract-first API; RFC 7807 errors; correlation IDs (doc 14).
- Secrets never in code; secure by default; input validated at every layer (doc 16).
- Every feature is observable (structured logs, metrics, traces) (doc 21).
- Every UI component is accessible and uses design tokens (docs 05, 06).
- AI goes through the provider-agnostic gateway; prompts are versioned (doc 22).
