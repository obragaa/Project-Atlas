import { PostgresWorkoutSessionRepository } from "./postgres-workout-session.repository";
import { createTestDatabase } from "../../../../shared/database/testing/pglite-database";
import { type DatabaseConnection } from "../../../../shared/database/database-connection";
import { Workout } from "../../domain/workout";
import { WorkoutItem } from "../../domain/workout-item";
import { ExerciseSet } from "../../domain/exercise-set";
import { WorkoutName } from "../../domain/value-objects/workout-name";
import { Load } from "../../domain/value-objects/load";
import { WorkoutSession } from "../../domain/sessions/workout-session";
import { SessionExercise } from "../../domain/sessions/session-exercise";
import { PerformedSet } from "../../domain/sessions/performed-set";
import { SessionDate } from "../../domain/sessions/value-objects/session-date";
import { Rpe } from "../../domain/sessions/value-objects/rpe";
import { WorkoutSessionId } from "../../domain/sessions/session-id";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

/**
 * Integration test (blueprint/18) against a real Postgres engine via PGlite.
 * Verifies the session aggregate round-trip (incl. completed/rpe), history order
 * by performedOn, ownership isolation, and cascade delete.
 */
describe("PostgresWorkoutSessionRepository (PGlite integration)", () => {
  let connection: DatabaseConnection;
  let repository: PostgresWorkoutSessionRepository;

  beforeAll(async () => {
    connection = await createTestDatabase();
    repository = new PostgresWorkoutSessionRepository(connection.db);
  });

  afterAll(async () => {
    await connection.close();
  });

  const template = (userId = USER_A) =>
    Workout.create({
      userId,
      name: WorkoutName.create("Push Day"),
      items: [
        WorkoutItem.create({
          exerciseName: "Bench Press",
          order: 0,
          sets: [ExerciseSet.create({ reps: 8, load: Load.create(60, "kg"), notes: null })],
        }),
      ],
    });

  const performedSession = (userId = USER_A, day = "2026-07-14") => {
    const session = WorkoutSession.startFromTemplate({
      workout: template(userId),
      performedOn: SessionDate.create(day, "2026-12-31"),
    });
    session.updateExecution({
      title: WorkoutName.create("Push Day"),
      performedOn: SessionDate.create(day, "2026-12-31"),
      exercises: [
        SessionExercise.create({
          exerciseName: "Bench Press",
          order: 0,
          sets: [
            PerformedSet.create({
              reps: 8,
              load: Load.create(62.5, "kg"),
              completed: true,
              rpe: Rpe.create(9),
              notes: "pegou pesado",
            }),
          ],
        }),
      ],
      notes: "bom treino",
    });
    return session;
  };

  it("persists and rehydrates the full aggregate, including completed + rpe", async () => {
    const session = performedSession();
    await repository.save(session);

    const loaded = await repository.findById(WorkoutSessionId.create(session.id.toString()));
    expect(loaded).not.toBeNull();
    expect(loaded?.title.value).toBe("Push Day");
    expect(loaded?.performedOn.value).toBe("2026-07-14");
    expect(loaded?.notes).toBe("bom treino");
    const set = loaded?.exercises[0]?.sets[0];
    expect(set?.reps).toBe(8);
    expect(set?.load?.weight).toBe(62.5);
    expect(set?.completed).toBe(true);
    expect(set?.rpe?.value).toBe(9);
  });

  it("lists history newest-performed first and isolates by owner", async () => {
    await repository.save(performedSession(USER_A, "2026-07-01"));
    await repository.save(performedSession(USER_A, "2026-07-20"));
    await repository.save(performedSession(USER_B, "2026-07-15"));

    const page = await repository.list({ userId: USER_A, limit: 50 });
    const days = page.items.map((s) => s.performedOn.value);
    // USER_B's session must not appear; USER_A's are newest-performed first.
    expect(days).toContain("2026-07-20");
    expect(days).toContain("2026-07-01");
    expect(days.indexOf("2026-07-20")).toBeLessThan(days.indexOf("2026-07-01"));
    expect(page.items.every((s) => s.isOwnedBy(USER_A))).toBe(true);
  });

  it("cascade-deletes exercises and sets with the session", async () => {
    const session = performedSession();
    await repository.save(session);
    await repository.delete(WorkoutSessionId.create(session.id.toString()));
    const loaded = await repository.findById(WorkoutSessionId.create(session.id.toString()));
    expect(loaded).toBeNull();
  });
});
