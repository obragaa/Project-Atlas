# ADR-0005 — Progress Domain Model

- **Status:** Accepted
- **Date:** 2026-06-18
- **Author:** Engineering (Atlas)
- **Supersedes:** —
- **Related Blueprint docs:** `07 - Features`, `12 - Backend Architecture`, `13 - Database`, `14 - API`, `17 - Performance`, `18 - Testing`, `23 - Engineering Governance`

---

## Context

The third Phase 3 domain is **Progress** (doc 07 "Progresso"): body weight,
body measurements, history, charts, personal records, and statistics. It lets a
user see their evolution over time — the data the Core dashboard and (later)
Missions celebrate.

This slice covers **weight + measurements + chart + records** (per the product
decision); progress photos are deferred (they need object storage — a separate,
heavier concern).

## Problem

How do we model progress so it (a) is a per-user time series of measurements,
(b) renders a chart and personal records cheaply, (c) ships without new
infrastructure (no file storage), and (d) follows every persistence/API
non-negotiable (opaque keys, cursor pagination, RFC 7807, domain owns its data)?

## Alternatives considered

1. **Append-only measurement log, records derived on read.** Each entry is an
   immutable snapshot for a date: weight (optional) + a set of optional body
   measurements (waist, chest, arm, …). History is the list of entries; the
   chart is the weight series; personal records and stats (min/max/latest/delta)
   are **computed at read time** from the entries — never stored (doc 13 "Dados
   Derivados": calculate on read unless cost demands otherwise).
2. **A mutable "current measurements" row per user + history table.** Adds a
   denormalized current-state row to avoid recomputation. Rejected: premature —
   the series is small (a handful of entries per user), so deriving on read is
   cheap and avoids a second source of truth that can drift (doc 13).
3. **Per-metric tables (a weights table, a waist table, …).** Rejected:
   fragments a single conceptual snapshot across tables, complicating "what were
   my measurements on date X" and the chart join. One entry per date is simpler.

## Decision

Adopt **Option 1 — an append-only per-user measurement log, records derived.**

```text
MeasurementEntry        (Entity — owned by one user, immutable snapshot)
  id           MeasurementId (opaque UUID)
  userId       owner (a user from the auth domain; eventual consistency)
  recordedOn   the date the measurement is for (a calendar date, not a time)
  weightKg     number | null      (stored canonically in kilograms)
  measurements BodyMeasurements   (all optional, centimetres):
                 waist, chest, hips, arm, thigh, calf
  note         optional short text
  createdAt    when the entry was saved
```

Key rules, each grounded in the Blueprint:

- **Per-user ownership** (doc 13 Ownership, 15 Least Privilege): every operation
  is scoped to the authenticated user; an entry not owned by the caller is
  indistinguishable from a missing one (404, no enumeration).
- **Immutable snapshots, physical delete.** An entry records a moment; to fix a
  mistake you delete and re-add. No soft delete in this slice (doc 13 — only when
  a business need exists). At most one entry per (user, date): re-recording a
  date **replaces** that day's entry (an UPSERT on user+date), so the series has
  one point per day.
- **Canonical units.** Weight is stored in **kilograms**, measurements in
  **centimetres** (a single canonical unit avoids ambiguity; display conversion
  is a UI concern). Validated value objects guard ranges.
- **Derived records & stats** (doc 13 "Dados Derivados"): the summary endpoint
  computes latest weight, lowest/highest weight, total change vs. the first
  entry, and entry count — from the entries, at read time. Nothing derived is
  persisted.
- **Cursor pagination** for history (doc 13/14), ordered by `recordedOn desc,
id desc`. The chart endpoint returns a compact ascending weight series.
- **Index** on `(user_id, recorded_on)` unique — serves both the per-user
  ordering/chart and enforces one-entry-per-day (doc 17: index the real queries).
- **Domain event** `MeasurementRecorded` fires on a new/updated entry (doc 13
  "Eventos" — facts), audited like the other domains; future Missions/streaks can
  consume it.

## Consequences

**Gained:** a coherent, queryable progress series with a chart and personal
records, zero new infrastructure, and an event other domains can build on. The
same module pattern as Workouts/Exercises, proving it generalizes to a
time-series domain.

**Lost / cost:** progress photos and richer analytics (trends, projections) are
deferred. Records computed on read are fine at this scale; if a user ever
accumulates thousands of entries, a materialized summary becomes a future,
additive optimization (doc 13) — not needed now.

## Trade-offs

We accept recomputing records on read (rather than maintaining a denormalized
current-state row) in exchange for a single source of truth and less code. This
honours doc 24 ("o domínio vem primeiro", "pequenas mudanças são melhores") and
doc 13's guidance to derive rather than duplicate.

## References

- Blueprint `07 - Features` ("Progresso")
- Blueprint `13 - Database` (Ownership, Dados Derivados, ADR-003 Cursor Pagination, Eventos)
- Blueprint `14 - API` (Contract First, RFC 7807, Cursor Pagination)
- ADR-0003 — Workouts Domain Model · ADR-0004 — Exercises Domain Model
