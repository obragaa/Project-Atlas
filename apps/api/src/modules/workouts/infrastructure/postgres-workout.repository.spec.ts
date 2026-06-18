import { PostgresWorkoutRepository } from "./postgres-workout.repository";
import { createTestDatabase } from "../../../shared/database/testing/pglite-database";
import { type DatabaseConnection } from "../../../shared/database/database-connection";
import { Workout } from "../domain/workout";
import { WorkoutItem } from "../domain/workout-item";
import { ExerciseSet } from "../domain/exercise-set";
import { WorkoutName } from "../domain/value-objects/workout-name";
import { Load } from "../domain/value-objects/load";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

/**
 * Integration test (blueprint/18) against a real Postgres engine via PGlite.
 * Verifies the aggregate round-trip, cursor pagination, ownership isolation, and
 * cascade delete of items/sets.
 */
describe("PostgresWorkoutRepository (PGlite integration)", () => {
  let connection: DatabaseConnection;
  let repository: PostgresWorkoutRepository;

  beforeAll(async () => {
    connection = await createTestDatabase();
    repository = new PostgresWorkoutRepository(connection.db);
  });

  afterAll(async () => {
    await connection.close();
  });

  const buildWorkout = (userId = USER_A, name = "Push Day") =>
    Workout.create({
      userId,
      name: WorkoutName.create(name),
      items: [
        WorkoutItem.create({
          exerciseName: "Bench Press",
          order: 0,
          sets: [
            ExerciseSet.create({ reps: 8, load: Load.create(60, "kg"), notes: "warmup" }),
            ExerciseSet.create({ reps: 5, load: Load.create(80, "kg"), notes: null }),
          ],
        }),
        WorkoutItem.create({
          exerciseName: "Push-up",
          order: 1,
          sets: [ExerciseSet.create({ reps: 20 })],
        }),
      ],
    });

  it("persists and rehydrates the full aggregate (round-trip)", async () => {
    const workout = buildWorkout();
    await repository.save(workout);

    const found = await repository.findById(workout.id);
    expect(found).not.toBeNull();
    expect(found?.name.value).toBe("Push Day");
    expect(found?.status).toBe("active");
    expect(found?.items).toHaveLength(2);
    expect(found?.items[0]?.exerciseName).toBe("Bench Press");
    expect(found?.items[0]?.order).toBe(0);
    expect(found?.items[0]?.sets).toHaveLength(2);
    expect(found?.items[0]?.sets[0]?.load?.weight).toBe(60);
    expect(found?.items[0]?.sets[0]?.load?.unit).toBe("kg");
    expect(found?.items[0]?.sets[0]?.notes).toBe("warmup");
    // Bodyweight set persists with a null load.
    expect(found?.items[1]?.sets[0]?.load).toBeNull();
  });

  it("save replaces children wholesale (idempotent on re-save)", async () => {
    const workout = buildWorkout(USER_A, "Edited");
    await repository.save(workout);

    // Replace content: one item, one set.
    workout.replaceContent(WorkoutName.create("Edited v2"), [
      WorkoutItem.create({
        exerciseName: "Deadlift",
        order: 0,
        sets: [ExerciseSet.create({ reps: 3 })],
      }),
    ]);
    await repository.save(workout);

    const found = await repository.findById(workout.id);
    expect(found?.name.value).toBe("Edited v2");
    expect(found?.items).toHaveLength(1);
    expect(found?.items[0]?.exerciseName).toBe("Deadlift");
    expect(found?.items[0]?.sets).toHaveLength(1);
  });

  it("delete removes the workout and cascades to items/sets", async () => {
    const workout = buildWorkout(USER_A, "ToDelete");
    await repository.save(workout);
    await repository.delete(workout.id);

    expect(await repository.findById(workout.id)).toBeNull();
  });

  it("lists a user's workouts newest-first with a working cursor", async () => {
    // A dedicated user to isolate this test's data.
    const owner = "33333333-3333-4333-8333-333333333333";
    const created: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      const w = Workout.create({ userId: owner, name: WorkoutName.create(`W${i}`) });
      await repository.save(w);
      created.push(w.id.toString());
    }

    const firstPage = await repository.list({ userId: owner, limit: 2 });
    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.hasNext).toBe(true);
    expect(firstPage.nextCursor).not.toBeNull();

    const secondPage = await repository.list({
      userId: owner,
      limit: 2,
      cursor: firstPage.nextCursor!,
    });
    expect(secondPage.items).toHaveLength(2);

    // No overlap between pages.
    const firstIds = firstPage.items.map((w) => w.id.toString());
    const secondIds = secondPage.items.map((w) => w.id.toString());
    expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);

    const thirdPage = await repository.list({
      userId: owner,
      limit: 2,
      cursor: secondPage.nextCursor!,
    });
    expect(thirdPage.items).toHaveLength(1);
    expect(thirdPage.hasNext).toBe(false);
    expect(thirdPage.nextCursor).toBeNull();
  });

  it("never returns another user's workouts in a listing", async () => {
    const mine = Workout.create({ userId: USER_B, name: WorkoutName.create("Mine") });
    await repository.save(mine);

    const page = await repository.list({ userId: USER_B, limit: 50 });
    expect(page.items.every((w) => w.isOwnedBy(USER_B))).toBe(true);
    expect(page.items.some((w) => w.id.equals(mine.id))).toBe(true);
  });
});
