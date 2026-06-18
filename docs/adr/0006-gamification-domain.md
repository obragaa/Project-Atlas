# ADR-0006 — Gamification Domain Model

- **Status:** Accepted
- **Date:** 2026-06-18
- **Author:** Engineering (Atlas)
- **Supersedes:** —
- **Related Blueprint docs:** `09 - Gamification`, `07 - Features`, `12 - Backend Architecture`, `13 - Database`, `14 - API`, `21 - Observability`, `23 - Engineering Governance`, `24 - Engineering Principles`

---

## Context

The fourth Phase 3 domain is **Gamification** (doc 09): missions
(daily/weekly/special), streaks, and milestones/achievements. Its philosophy is
strict — **consistency over intensity, progress over competition, rewards with
meaning, never anxiety, no public ranking** (doc 09). Rewards must reflect real
actions, never just opening the app.

The actions gamification rewards already exist as **domain events**:
`WorkoutCompleted` (workouts) and `MeasurementRecorded` (progress). The
gamification module reacts to these.

## Problem

How do we model gamification so it (a) derives from real actions without
reaching into other modules' data (doc 13 Ownership), (b) computes streaks,
mission progress, and achievements deterministically, (c) resets daily/weekly
missions correctly, and (d) honors doc 09's ethics (no anxiety, no manipulation)?

## Alternatives considered

1. **Own `activity_log`, everything derived from it.** Gamification keeps its
   own per-user log of relevant activities (`userId`, `activityDate`, `kind`),
   appended by event handlers when `WorkoutCompleted` / `MeasurementRecorded`
   fire. Streak, mission progress, and achievements are **computed from this log
   on read** (doc 13 "Dados Derivados"); only achievement _unlocks_ are
   persisted (a fact worth keeping). The module never queries workouts/progress
   tables — it owns its data (doc 13 Ownership).
2. **Query the other modules' repositories directly.** The streak/mission engine
   reads the workouts and measurements tables. Rejected: couples gamification to
   other domains' schemas, violating ownership and the dependency rule (doc 12,
   13); a schema change elsewhere would break gamification.
3. **Persist a denormalized "gamification state" row, mutated in place.** A row
   per user holding current streak, mission progress, etc., updated on each
   event. Rejected for the derived parts: a second source of truth that can
   drift; deriving from the log is cheap at this scale and always correct.

## Decision

Adopt **Option 1 — an own activity log; streak/missions derived, achievements
unlocked-and-persisted.**

```text
ActivityLog                 (this module's source of truth — owned)
  userId        owner
  activityDate  the calendar date the action happened (one row per kind/day)
  kind          "workout_completed" | "measurement_recorded"
  (unique on (userId, activityDate, kind) — idempotent on replay)

Streak                      (DERIVED on read from the activity log)
  current       consecutive days up to today (or yesterday) with any activity
  longest       the longest run ever
  Doc 09: never lost merely for not opening the app — based on relevant actions.

Mission                     (static DEFINITIONS + DERIVED progress per period)
  daily   e.g. "register a workout today", "update your weight today"
  weekly  e.g. "complete 3 workouts this week", "record progress this week"
  Progress is computed from the activity log within the current day/ISO-week.
  Resets are implicit: a new period simply recounts — no stored state to expire.

Achievement                 (static DEFINITIONS + persisted UNLOCKS)
  milestones: first workout, 10/50/100 workouts, first measurement, 7-day streak…
  When its condition is met (checked after each relevant event), an unlock row
  (userId, achievementKey, unlockedAt) is written once. Unlocks are persisted
  because they are meaningful, dated facts of the journey (doc 09 "Histórico de
  conquistas") and must not silently disappear if definitions change.
```

Key rules, each grounded in the Blueprint:

- **Per-user ownership** (doc 13): all state is keyed by the authenticated user;
  gamification owns `activity_log` and `achievement_unlocks` and reads nothing
  from other modules' tables.
- **Event-driven, idempotent** (doc 13 Eventos, Idempotência): handlers append to
  the activity log on `WorkoutCompleted` / `MeasurementRecorded`. The unique
  (user, date, kind) index makes replays harmless (completing two workouts the
  same day is still "one active day").
- **Derived, not stored** (doc 13 Dados Derivados): streak and mission progress
  are recomputed on read. Only achievement unlocks are persisted.
- **Ethics enforced by design** (doc 09): no ranking, no comparison, no
  penalties. A broken streak is simply `current = 0`; the copy is encouraging,
  never guilt-based. No "streak about to break" pressure mechanics.
- **Static definitions in code** (doc 23): mission and achievement definitions
  live in the domain as data, versioned with the code; changing them is a code
  change (and, for achievements, additive — past unlocks remain valid).
- **Auditable** (doc 21): unlocking an achievement is an auditable fact.

## Consequences

**Gained:** a motivating layer (streak, missions, milestones) that derives from
real actions, with zero coupling to other modules and a single owned source of
truth; the Dashboard and a dedicated `/conquistas` screen can surface it.

**Lost / cost:** mission _personalization_ by profile (doc 09 "Personalização"),
the Atlas-AI tie-in (doc 09/10), and push notifications are deferred — they need
the profile/AI/notification subsystems, which don't exist yet. Recomputing on
read is fine at this scale; a materialized streak is a future, additive
optimization if ever needed.

## Trade-offs

We accept recomputing streak/missions on read and an own activity log (rather
than querying other modules) in exchange for correctness, ownership, and
decoupling — exactly what doc 12/13 prioritize, and what lets doc 09's ethics be
enforced structurally (no stored "pressure" state to exploit).

## References

- Blueprint `09 - Gamification` (Missões, Streak, Marcos, ética)
- Blueprint `13 - Database` (Ownership, Dados Derivados, Eventos, Idempotência)
- Blueprint `12 - Backend Architecture` (Dependency Rule)
- ADR-0003/0004/0005 — Workouts / Exercises / Progress
