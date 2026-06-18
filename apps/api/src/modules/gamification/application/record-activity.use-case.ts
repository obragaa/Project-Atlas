import { Inject, Injectable } from "@nestjs/common";
import { type ActivityKind } from "../domain/activity.js";
import {
  ACHIEVEMENT_UNLOCK_REPOSITORY,
  ACTIVITY_REPOSITORY,
  type AchievementUnlockRepository,
  type ActivityRepository,
} from "../domain/gamification.repository.js";
import { ACHIEVEMENT_DEFINITIONS } from "../domain/achievement-definitions.js";
import { computeStreak } from "../domain/streak.js";

export interface RecordActivityCommand {
  readonly userId: string;
  readonly kind: ActivityKind;
  /** When the action happened (the event's occurredAt). */
  readonly occurredAt: Date;
}

/**
 * Records a relevant activity and unlocks any newly-earned achievements
 * (blueprint/09, ADR-0006). Invoked by the event handlers when WorkoutCompleted
 * / MeasurementRecorded fire. Appending is idempotent; unlocking is idempotent.
 * Failures here never break the originating flow (the dispatcher isolates them).
 */
@Injectable()
export class RecordActivityUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY) private readonly activities: ActivityRepository,
    @Inject(ACHIEVEMENT_UNLOCK_REPOSITORY)
    private readonly unlocks: AchievementUnlockRepository,
  ) {}

  async execute(command: RecordActivityCommand): Promise<void> {
    const activityDate = command.occurredAt.toISOString().slice(0, 10);
    await this.activities.append({
      userId: command.userId,
      activityDate,
      kind: command.kind,
    });

    await this.evaluateAchievements(command.userId, activityDate);
  }

  private async evaluateAchievements(userId: string, todayIso: string): Promise<void> {
    const [counts, dates, alreadyUnlocked] = await Promise.all([
      this.activities.counts(userId),
      this.activities.activeDates(userId),
      this.unlocks.listForUser(userId),
    ]);

    const longestStreak = computeStreak(dates, todayIso).longest;
    const unlockedKeys = new Set(alreadyUnlocked.map((u) => u.achievementKey));
    const now = new Date();

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (unlockedKeys.has(def.key)) {
        continue;
      }
      const value =
        def.metric === "workouts"
          ? counts.workouts
          : def.metric === "measurements"
            ? counts.measurements
            : longestStreak;
      if (value >= def.threshold) {
        await this.unlocks.unlock(userId, def.key, now);
      }
    }
  }
}
