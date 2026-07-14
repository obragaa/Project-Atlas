/**
 * Local calendar-day helpers (blueprint/13 — calendar dates are civil days, not
 * UTC instants). Atlas serves a Brazil-first audience, so "today" and streak/
 * mission day boundaries must be evaluated in the application's civil timezone,
 * not UTC. Evaluating in UTC pushes any activity after 21:00 BRT (UTC-3) into the
 * next calendar day, silently breaking streaks and daily missions — the bug this
 * module exists to prevent.
 *
 * `APP_TIME_ZONE` is the single source of truth; if Atlas ever needs per-user
 * timezones, this is the one place to thread that through.
 */
export const APP_TIME_ZONE = "America/Sao_Paulo" as const;

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * The civil calendar day (AAAA-MM-DD) that `instant` falls on in the app's
 * timezone. `en-CA` yields ISO-ordered `YYYY-MM-DD` parts, so the formatted
 * value is already the canonical shape.
 */
export function toLocalDay(instant: Date): string {
  return dayFormatter.format(instant);
}
