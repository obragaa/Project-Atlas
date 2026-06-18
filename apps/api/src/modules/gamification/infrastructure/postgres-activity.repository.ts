import { Inject, Injectable } from "@nestjs/common";
import { and, between, eq, sql } from "drizzle-orm";
import { type DrizzleDatabase } from "../../../shared/database/database-connection.js";
import { DRIZZLE } from "../../../shared/database/database.tokens.js";
import { activityLog } from "../../../shared/database/schema/index.js";
import { type ActivityEntry, type ActivityKind } from "../domain/activity.js";
import { type ActivityCounts, type ActivityRepository } from "../domain/gamification.repository.js";

/**
 * PostgreSQL activity log (blueprint/12, 13). Drizzle is confined here. Appends
 * are idempotent on (user, date, kind) via `onConflictDoNothing`, so replaying a
 * domain event never inflates the log. Streak/mission/achievement logic derives
 * from these queries.
 */
@Injectable()
export class PostgresActivityRepository implements ActivityRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async append(entry: ActivityEntry): Promise<void> {
    await this.db
      .insert(activityLog)
      .values({ userId: entry.userId, activityDate: entry.activityDate, kind: entry.kind })
      .onConflictDoNothing({
        target: [activityLog.userId, activityLog.activityDate, activityLog.kind],
      });
  }

  async activeDates(userId: string): Promise<readonly string[]> {
    const rows = await this.db
      .selectDistinct({ activityDate: activityLog.activityDate })
      .from(activityLog)
      .where(eq(activityLog.userId, userId));
    return rows.map((r) => r.activityDate);
  }

  async counts(userId: string): Promise<ActivityCounts> {
    const rows = await this.db
      .select({ kind: activityLog.kind, count: sql<number>`count(*)::int` })
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .groupBy(activityLog.kind);

    let workouts = 0;
    let measurements = 0;
    for (const row of rows) {
      if (row.kind === "workout_completed") workouts = row.count;
      else if (row.kind === "measurement_recorded") measurements = row.count;
    }
    return { workouts, measurements };
  }

  async countInRange(
    userId: string,
    kind: ActivityKind,
    fromIso: string,
    toIso: string,
  ): Promise<number> {
    const rows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLog)
      .where(
        and(
          eq(activityLog.userId, userId),
          eq(activityLog.kind, kind),
          between(activityLog.activityDate, fromIso, toIso),
        ),
      );
    return rows.at(0)?.count ?? 0;
  }
}
