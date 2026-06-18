/**
 * Core transport contract (blueprint/07 - Features.md "Core" and 03 - Experience
 * Blueprint.md "O Core"). The Core answers, at a glance: How am I? What should I
 * do now? How much have I evolved? What is my next goal?
 */

/** A single actionable suggestion surfaced on the Core. */
export interface CoreNextAction {
  readonly id: string;
  readonly label: string;
  /** Stable kind so the client can route/iconify without parsing text. */
  readonly kind: "workout" | "mission" | "progress" | "ai" | "nutrition";
  readonly href: string;
}

/** The user's current streak of consistent days (doc 09 "Sistema de Streak"). */
export interface StreakSummary {
  readonly current: number;
  readonly best: number;
}

/** Aggregated snapshot rendered by the Core dashboard. */
export interface CoreSummary {
  readonly greeting: string;
  readonly streak: StreakSummary;
  readonly nextActions: readonly CoreNextAction[];
  readonly activeMissionCount: number;
}
