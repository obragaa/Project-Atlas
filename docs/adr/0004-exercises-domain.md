# ADR-0004 — Exercises Domain Model

- **Status:** Accepted
- **Date:** 2026-06-18
- **Author:** Engineering (Atlas)
- **Supersedes:** —
- **Related Blueprint docs:** `07 - Features`, `12 - Backend Architecture`, `13 - Database`, `14 - API`, `17 - Performance`, `18 - Testing`, `23 - Engineering Governance`

---

## Context

The second Phase 3 domain is **Exercises** — the exercise library (doc 07
"Exercícios": "Disponibilizar uma biblioteca completa de exercícios"). Its
features are search, filters, muscle grouping, detailed explanation, worked
muscles, variations, execution tips, and favourites.

Workouts (ADR-0003) currently stores each item's exercise as free text. The
Exercises catalogue is its natural complement: a curated reference users search
and browse. A later, **additive** change will let a `WorkoutItem` optionally
reference a catalogue entry (the free-text name remains the fallback).

## Problem

How do we model the catalogue so it (a) is a curated, read-mostly library rather
than per-user content, (b) ships without depending on any other new domain, (c)
supports search/filter efficiently (doc 17), and (d) follows every persistence/
API non-negotiable (opaque keys, cursor pagination, RFC 7807, contract-first)?

## Alternatives considered

1. **Global curated catalogue, seeded.** Exercises are system-owned reference
   data loaded by a migration/seed; users search, filter, and (later) favourite
   them, but do not create them. Matches doc 07's "biblioteca completa". The
   domain is read-mostly: no per-user aggregate, no ownership checks on reads.
2. **User-owned exercises (CRUD per owner).** Each user creates their own
   exercises, like Workouts. Simpler to seed (none needed) but does not deliver
   the curated, shared library the Blueprint describes; it duplicates exercise
   metadata across users and fragments search.
3. **External exercise API.** Rejected for this slice: adds a third-party
   dependency, network failure modes, and licensing concerns before the product
   even has its own data model. The catalogue is small enough to own (doc 13:
   "o domínio é proprietário dos dados").

## Decision

Adopt **Option 1 — a global, curated, seeded catalogue.**

```text
Exercise                (Entity — system-owned reference data, no per-user owner)
  id            ExerciseId (opaque UUID)
  slug          stable, URL-safe, unique (e.g. "barbell-bench-press") — a stable
                public handle distinct from the opaque id (doc 14 naming)
  name          display name
  primaryMuscle MuscleGroup (the main muscle group — drives default grouping)
  muscles       MuscleGroup[] (all worked muscles)
  equipment     Equipment (barbell | dumbbell | machine | bodyweight | cable | other)
  instructions  short execution description
  tips          string[] (execution cues)
  variations    string[] (named variations)
```

Key rules, each grounded in the Blueprint:

- **System-owned, read-mostly** (doc 13 Ownership): the catalogue has no per-user
  owner. There are no write endpoints in this slice; the data is loaded by a
  **seed migration** (immutable, forward-only — doc 13 Versionamento). Curation
  changes ship as new seed migrations, never edits to applied ones.
- **Opaque id + stable slug** (doc 13 Chaves, doc 14 Naming): the id is the
  opaque key; the `slug` is a human-stable handle for friendly URLs and client
  routing, unique and never a primary key.
- **Value objects** for `MuscleGroup` and `Equipment` — closed sets mirrored in
  `@atlas/contracts` (text + CHECK at the DB, like roles/statuses), avoiding enum
  migration churn (consistent with ADR-0003).
- **Search & filters are declarative** (doc 14 Filtering): `search` (name
  contains, case-insensitive), `muscle` (matches primary or worked), `equipment`.
  Combinable. Results are **cursor-paginated** (doc 13/14) ordered by
  `(name asc, id asc)` — a stable total order suited to an alphabetical library.
- **Performance** (doc 17): a case-insensitive index on `lower(name)` for search
  prefix/contains; the muscle filter uses the `muscles` array membership. No
  premature indexes beyond the queries the endpoints actually run.
- **No favourites in this slice.** Favourites are per-user state (doc 07) and a
  natural follow-up; deferring them keeps this slice a clean, read-only catalogue.
  Recorded as a tracked next step, not built now.

## Consequences

**Gained:** a curated, searchable library with zero cross-user coupling and no
write surface to secure; a second read-mostly domain proving the module pattern
generalizes beyond the mutable Workout aggregate; the data ready for Workouts to
reference additively later.

**Lost / cost:** the catalogue's breadth is bounded by the seed; growing it means
new seed migrations (acceptable — curation is deliberate, not user-generated).
Favourites and a Workout↔Exercise link are deferred to follow-up ADRs, each
additive and backward-compatible (doc 14).

## Trade-offs

We accept a fixed, seed-curated library now (rather than user-generated or
externally-sourced exercises) in exchange for a coherent, owned, searchable
domain that ships immediately and integrates additively. This honours doc 24
("pequenas mudanças são melhores", "o domínio vem primeiro").

## References

- Blueprint `07 - Features` ("Exercícios", "Treinos")
- Blueprint `13 - Database` (Ownership, Chaves Primárias, Versionamento, ADR-003 Cursor Pagination)
- Blueprint `14 - API` (Contract First, Filtering, Naming, RFC 7807)
- Blueprint `17 - Performance` (índices para consultas críticas)
- ADR-0003 — Workouts Domain Model
