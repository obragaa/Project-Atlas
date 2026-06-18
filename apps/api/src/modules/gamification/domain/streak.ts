/**
 * Streak computation (blueprint/09 "Sistema de Streak"). Pure and deterministic:
 * given the set of distinct calendar dates the user was active and today's date,
 * it returns the current run, the longest run ever, and whether today is active.
 *
 * Doc 09 ethics: a streak is never "lost for not opening the app" — it is based
 * on real actions. The current run counts consecutive days ending today OR
 * yesterday (so a streak isn't shown as broken until a full day with no action
 * has passed), never producing pressure copy.
 */
export interface StreakResult {
  readonly current: number;
  readonly longest: number;
  readonly activeToday: boolean;
}

const DAY_MS = 86_400_000;

/** Parse a YYYY-MM-DD date to a UTC day index (days since epoch). */
function dayIndex(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function computeStreak(activityDates: readonly string[], todayIso: string): StreakResult {
  const days = [...new Set(activityDates)].map(dayIndex).sort((a, b) => a - b);
  if (days.length === 0) {
    return { current: 0, longest: 0, activeToday: false };
  }

  const today = dayIndex(todayIso);
  const activeToday = days.includes(today);

  // Longest run of consecutive days anywhere in the history.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    run = days[i]! === days[i - 1]! + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // Current run: count back from the most recent active day, but only if that
  // day is today or yesterday (otherwise the streak has ended → 0).
  const last = days[days.length - 1]!;
  let current = 0;
  if (last === today || last === today - 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i -= 1) {
      if (days[i]! === days[i + 1]! - 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, longest, activeToday };
}
