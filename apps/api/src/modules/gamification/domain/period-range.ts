/**
 * Calendar-period helpers for mission progress (blueprint/09). Pure and
 * deterministic given a reference date — the day range is that day; the week
 * range is the ISO week (Monday–Sunday) containing it. Returns inclusive
 * `YYYY-MM-DD` bounds; the implicit reset of missions is "a new period recounts"
 * (ADR-0006), so no stored state expires.
 */
export interface DateRange {
  readonly fromIso: string;
  readonly toIso: string;
}

const DAY_MS = 86_400_000;

function iso(dayMs: number): string {
  return new Date(dayMs).toISOString().slice(0, 10);
}

/** The single-day range for the reference date. */
export function dayRange(todayIso: string): DateRange {
  return { fromIso: todayIso, toIso: todayIso };
}

/** The ISO-week (Mon–Sun) range containing the reference date. */
export function weekRange(todayIso: string): DateRange {
  const [y, m, d] = todayIso.split("-").map(Number) as [number, number, number];
  const utc = Date.UTC(y, m - 1, d);
  // getUTCDay: 0=Sun..6=Sat. Shift so Monday is the start of the week.
  const weekday = new Date(utc).getUTCDay();
  const sinceMonday = (weekday + 6) % 7;
  const monday = utc - sinceMonday * DAY_MS;
  const sunday = monday + 6 * DAY_MS;
  return { fromIso: iso(monday), toIso: iso(sunday) };
}
