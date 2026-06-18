import { PostgresActivityRepository } from "./postgres-activity.repository";
import { PostgresAchievementUnlockRepository } from "./postgres-achievement-unlock.repository";
import { RecordActivityUseCase } from "../application/record-activity.use-case";
import { GetOverviewUseCase } from "../application/get-overview.use-case";
import { createTestDatabase } from "../../../shared/database/testing/pglite-database";
import { type DatabaseConnection } from "../../../shared/database/database-connection";

const USER = "11111111-1111-4111-8111-111111111111";

/**
 * Integration test (blueprint/18) against a real Postgres engine via PGlite.
 * Drives the full gamification flow through the real repositories: recording
 * activity, unlocking achievements, deriving streak + mission progress.
 */
describe("Gamification (PGlite integration)", () => {
  let connection: DatabaseConnection;
  let record: RecordActivityUseCase;
  let overview: GetOverviewUseCase;

  beforeAll(async () => {
    connection = await createTestDatabase();
    const activities = new PostgresActivityRepository(connection.db);
    const unlocks = new PostgresAchievementUnlockRepository(connection.db);
    record = new RecordActivityUseCase(activities, unlocks);
    overview = new GetOverviewUseCase(activities, unlocks);
  });

  afterAll(async () => {
    await connection.close();
  });

  const day = (iso: string) => new Date(`${iso}T12:00:00.000Z`);

  it("unlocks the first-workout achievement and reflects it in the overview", async () => {
    await record.execute({
      userId: USER,
      kind: "workout_completed",
      occurredAt: day("2026-06-18"),
    });

    const result = await overview.execute({ userId: USER, today: day("2026-06-18") });
    const first = result.achievements.find((a) => a.key === "first_workout");
    expect(first?.unlockedAt).not.toBeNull();
    expect(result.unlockedCount).toBeGreaterThanOrEqual(1);
  });

  it("is idempotent: completing two workouts the same day is one active day", async () => {
    const u = "22222222-2222-4222-8222-222222222222";
    await record.execute({ userId: u, kind: "workout_completed", occurredAt: day("2026-06-18") });
    await record.execute({ userId: u, kind: "workout_completed", occurredAt: day("2026-06-18") });

    const result = await overview.execute({ userId: u, today: day("2026-06-18") });
    expect(result.streak.current).toBe(1);
  });

  it("builds a 3-day streak from consecutive active days", async () => {
    const u = "33333333-3333-4333-8333-333333333333";
    for (const d of ["2026-06-16", "2026-06-17", "2026-06-18"]) {
      await record.execute({ userId: u, kind: "workout_completed", occurredAt: day(d) });
    }
    const result = await overview.execute({ userId: u, today: day("2026-06-18") });
    expect(result.streak.current).toBe(3);
    expect(result.streak.activeToday).toBe(true);
  });

  it("tracks daily and weekly mission progress", async () => {
    const u = "44444444-4444-4444-8444-444444444444";
    // 3 workouts in the same ISO week (Mon 15 – Sun 21), one of them today (18).
    for (const d of ["2026-06-16", "2026-06-17", "2026-06-18"]) {
      await record.execute({ userId: u, kind: "workout_completed", occurredAt: day(d) });
    }
    const result = await overview.execute({ userId: u, today: day("2026-06-18") });

    const dailyWorkout = result.missions.find((m) => m.key === "daily_workout");
    expect(dailyWorkout?.completed).toBe(true); // active today

    const weekly = result.missions.find((m) => m.key === "weekly_three_workouts");
    expect(weekly?.progress).toBe(3);
    expect(weekly?.completed).toBe(true);
  });

  it("does not unlock workout milestones from measurements alone", async () => {
    const u = "55555555-5555-4555-8555-555555555555";
    await record.execute({
      userId: u,
      kind: "measurement_recorded",
      occurredAt: day("2026-06-18"),
    });
    const result = await overview.execute({ userId: u, today: day("2026-06-18") });
    expect(result.achievements.find((a) => a.key === "first_workout")?.unlockedAt).toBeNull();
    expect(
      result.achievements.find((a) => a.key === "first_measurement")?.unlockedAt,
    ).not.toBeNull();
  });
});
