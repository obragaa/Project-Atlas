# ADR-0008 — Workout Sessions (performed workouts, template ≠ session)

- **Status:** Accepted
- **Date:** 2026-07-14
- **Author:** Engineering (Atlas)
- **Amends:** ADR-0003 (Workouts Domain) — retires the template-level completion
- **Related Blueprint docs:** `02 - Product Rules`, `07 - Features`, `09 - Gamification`, `12 - Backend Architecture`, `13 - Database`, `14 - API`, `18 - Testing`, `23 - Engineering Governance`

---

## Context

An end-to-end audit of the backend (2026-07) found that the product modelled a
workout **template** but not a workout **actually performed**. `Workout`
(ADR-0003) is an editable plan; `POST /workouts/:id/completion` merely flipped
`status → completed` and stamped `completedAt`, capturing **none** of what the
user did (real reps, real load, the day). Worse, a completed workout froze
(409 on edit), so a recurring routine forced the user to *duplicate* the template
to train it again — accumulating junk. Gamification counted **distinct active
days**, so the "10 workouts" achievement really meant "10 different days", and
every day boundary was computed in **UTC**, pushing a 21:00 BRT workout into the
next day and breaking streaks for the Brazil-first audience (doc 09).

The Blueprint already prescribes the missing pieces: doc 07 lists "Registrar
séries / repetições / carga / observações" and **"Histórico de treinos"**; doc 02
demands "Menos cliques".

## Problem

How do we model a *performed workout* so that it (a) records the real execution,
(b) is created from a template with one tap and defaults its date to today,
(c) leaves the template reusable forever, and (d) feeds history + progress +
gamification correctly, in the app's civil timezone?

## Decision

Introduce a new aggregate **`WorkoutSession`** in the workouts module, alongside
`Workout` (which becomes purely a *template*).

```text
WorkoutSession          (Aggregate Root)
  id               WorkoutSessionId (opaque UUID)
  userId           owner
  sourceWorkoutId  soft link to the template (nullable; NOT an FK, so deleting a
                   template never rewrites history)
  title            snapshot of the template name at start
  status           in_progress | completed
  performedOn      SessionDate — a civil day (AAAA-MM-DD), defaults to today,
                   accepts a past day, rejects the future
  exercises[]      ordered SessionExercise[]
  notes            optional, <= 280 chars
  createdAt / completedAt

SessionExercise         (Entity)  — exerciseName snapshot, order, sets[]
PerformedSet            (Entity)  — reps 1..1000, load (nullable = bodyweight),
                                    completed (bool), rpe (1..10 | null), notes
```

Rules, each grounded in the Blueprint:

- **Template ≠ session.** `Workout` loses its terminal `completed` state and its
  freeze; a template is `draft`/`active` and reusable forever. "Completing a
  workout" now means *recording a session*.
- **One tap to start** (doc 02): `POST /workouts/:id/sessions` derives the session
  from the template, pre-filling planned exercises/sets **unchecked** for the user
  to confirm the real values. `performedOn` defaults to today.
- **Civil timezone, one source of truth** (doc 09): `shared/domain/local-day.ts`
  resolves "today" and all day boundaries in `America/Sao_Paulo`. `SessionDate`,
  `MeasurementDate`, and gamification all use it — no `toISOString()` day math.
- **Gamification counts the session** (doc 09): `WorkoutSessionCompleted` carries
  `performedOn` + `totalVolume`; the handler records activity on the day the work
  happened. Streak/missions still derive from active *days* (two sessions the same
  day is one active day — correct for a streak), and volume is now available for
  future strength achievements.
- **Finalize needs real work**: `complete()` rejects a session with zero completed
  sets (no empty streaks), emits the event, and is terminal.
- **Ownership, opaque keys, cursor pagination, RFC 7807, contract-first, aggregate
  as the only consistency boundary** — unchanged from ADR-0003, applied to the new
  aggregate. History is ordered `performed_on desc, id desc`.

## REST surface

`POST /v1/workouts/:id/sessions` (start) · `GET /v1/sessions` (history) ·
`GET|PUT|DELETE /v1/sessions/:id` · `POST /v1/sessions/:id/completion` (finalize).
The old `POST /v1/workouts/:id/completion` is **removed** (the frontend migrates
to sessions).

## Migration

- Additive schema (migration 0005): `workout_sessions` → `session_exercises` →
  `performed_sets`, children cascade. No destructive change to `workouts`; its
  now-unused `completed_at` column and the `'completed'` CHECK value are left in
  place (removed in a later cleanup migration) so no data is lost.
- `POST /workouts/:id/completion` is removed now (backend-first; the frontend is a
  separate, later slice). Legacy `workouts` rows with `status = 'completed'`
  rehydrate as `active`.

## Consequences

**Gained:** the domain object the product actually needs — a real training log
with reps/load/RPE/notes per set, correct history, correct per-day streaks in BRT,
and volume data for future achievements; templates that no longer freeze.

**Lost / cost:** a second aggregate to maintain in the module; a temporary
dangling `completed_at` column on `workouts` pending a cleanup migration; the
frontend must migrate off the removed completion route before it works end-to-end
(tracked as the next slice).

## References

- Blueprint `02 - Product Rules` ("Menos cliques"), `07 - Features` ("Registrar
  séries/reps/carga/observações", "Histórico de treinos"), `09 - Gamification`
- Blueprint `12 - Backend Architecture`, `13 - Database`, `14 - API`, `18 - Testing`
- ADR-0003 — Workouts Domain (amended by this ADR)
