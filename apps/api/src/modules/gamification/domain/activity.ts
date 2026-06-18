/**
 * The relevant actions gamification rewards (blueprint/09: rewards must reflect
 * real actions). The activity log is this module's own source of truth, appended
 * by event handlers; streak/missions derive from it (ADR-0006).
 */
export const ACTIVITY_KINDS = ["workout_completed", "measurement_recorded"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

/** One recorded activity: a user did something relevant on a calendar date. */
export interface ActivityEntry {
  readonly userId: string;
  /** ISO calendar date (YYYY-MM-DD) the action happened. */
  readonly activityDate: string;
  readonly kind: ActivityKind;
}
