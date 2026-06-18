# ADR-0003 — Workouts Domain Model

- **Status:** Accepted
- **Date:** 2026-06-18
- **Author:** Engineering (Atlas)
- **Supersedes:** —
- **Related Blueprint docs:** `07 - Features`, `12 - Backend Architecture`, `13 - Database`, `14 - API`, `18 - Testing`, `23 - Engineering Governance`

---

## Context

Phase 3 (Core experience) begins with the **Workouts** module — the first
business domain after authentication. The Blueprint lists its capabilities in
doc 07 ("Treinos"): create, edit, duplicate, delete, organize exercises, record
sets/reps/load/notes, and workout history. Doc 13 ("Aggregate Roots") names the
exact shape: **`Workout` controls the consistency of `Exercises → Sets`**.

The Core dashboard (doc 07 "Core") only _aggregates_ — next workout, recent
evolution, missions — so it cannot be built before the domains that produce that
data. Workouts is the most self-contained of those domains and is a prerequisite
for Progress, Missions, and the Core dashboard. It is therefore the first
vertical slice.

## Problem

How do we model a workout so that it (a) matches the aggregate the Blueprint
already prescribes, (b) is self-contained enough to ship without first building
the Exercises catalogue, and (c) follows every persistence/API non-negotiable
(opaque keys, cursor pagination, RFC 7807, contract-first, domain owns its data)?

## Alternatives considered

1. **Self-contained workout.** Each `Workout` owns its items inline: a
   `WorkoutItem` carries the exercise _name_ (free text + display order); each
   item owns its `Set`s (reps, load, optional notes). No foreign key to any
   catalogue. Maps one-to-one onto the doc-13 aggregate and unblocks Workouts
   with zero cross-module coupling.
2. **Workout references an Exercises catalogue.** `WorkoutItem.exerciseId`
   points at a separate Exercises module (library). More faithful to the final
   product (shared exercise metadata, search, favourites — doc 07 "Exercícios"),
   but requires building a second domain in the same slice, widening scope and
   coupling two modules before either is proven.

## Decision

Adopt **Option 1 — the self-contained workout aggregate.**

```text
Workout                (Aggregate Root — owns all consistency)
  id            WorkoutId (opaque UUID)
  userId        owner (a user from the auth domain; consistency is eventual
                across aggregates — doc 13)
  name          1..120 chars
  status        draft | active | completed   (lifecycle — doc 13 "Entidades")
  items[]       ordered WorkoutItem[]
  createdAt / updatedAt / completedAt

WorkoutItem            (Entity inside the aggregate)
  id            WorkoutItemId
  exerciseName  1..120 chars (free text; no catalogue FK in this slice)
  order         0-based position
  sets[]        ordered ExerciseSet[]

ExerciseSet            (Entity inside the aggregate)
  id            SetId
  reps          1..1000
  load          Load value object (weight + unit: kg | lb) — nullable (bodyweight)
  notes         optional, <= 280 chars
```

Key rules, each grounded in the Blueprint:

- **The aggregate is the only consistency boundary** (doc 13 ADR-002):
  items and sets are mutated _through_ the `Workout` root; transactions never
  span aggregates. The repository persists/loads the whole `Workout`.
- **Opaque keys** for every entity (doc 13 "Chaves Primárias"); `userId` is a
  reference, never used as a key.
- **Value objects** for `Load` (weight + unit) and the small invariants
  (`WorkoutName`, `Reps`) — immutable, self-validating (doc 13 "Value Objects").
- **Completion is a domain transition**: `complete()` moves `active → completed`,
  stamps `completedAt`, and emits a **`WorkoutCompleted`** domain event
  (doc 13 "Eventos" — facts, not commands). The event flows through the existing
  in-process dispatcher and is recorded on the audit channel (ADR-0002 closeout,
  doc 15). This prepares Streak/Core without building them now.
- **Ownership & authorization**: every operation is scoped to the authenticated
  user; a workout belongs to exactly one user and is never visible cross-user
  (doc 13 "Ownership", doc 15 "Least Privilege"). A workout not owned by the
  caller is indistinguishable from a missing one (404, no enumeration).
- **No soft delete yet** (doc 13 "Soft Delete" — only when a business need
  exists): delete is physical; history is the set of non-deleted workouts.
- **Cursor pagination** for `GET /workouts` (doc 13/14 ADR Cursor Pagination),
  ordered by `createdAt desc, id desc` for a stable, total ordering.
- **Duplicate** clones a workout into a fresh `draft` (new ids throughout, no
  `completedAt`), so the user can iterate without touching history.

## Consequences

**Gained:** a shippable Workouts slice with no cross-module coupling; a faithful
realization of the doc-13 aggregate; a second domain proving the auth module's
layering, dispatcher, and audit channel generalize; the `WorkoutCompleted` event
ready for Streak/Core to consume later.

**Lost / cost:** exercise metadata (muscles, instructions, variations) lives only
as a free-text name for now; when the Exercises catalogue lands, a follow-up ADR
will introduce an optional `exerciseId` on `WorkoutItem` as a **backward-
compatible, additive** change (doc 14 "Backward Compatibility") — the free-text
name remains the fallback, so no migration breaks existing workouts.

## Trade-offs

We accept temporary duplication of the exercise _name_ across workouts (a
documented denormalization per doc 13) in exchange for shipping a coherent,
self-consistent domain now and integrating the catalogue additively later. This
honours doc 24 ("pequenas mudanças são melhores", "o domínio vem primeiro") over
building two coupled domains at once.

## References

- Blueprint `07 - Features` ("Treinos", "Exercícios", "Core")
- Blueprint `13 - Database` (Aggregate Roots, ADR-002 Aggregate Consistency, ADR-003 Cursor Pagination)
- Blueprint `14 - API` (Contract First, RFC 7807, Cursor Pagination, Backward Compatibility)
- ADR-0001 — Technology Stack
