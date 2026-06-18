import { Workout } from "./workout";
import { WorkoutItem } from "./workout-item";
import { ExerciseSet } from "./exercise-set";
import { WorkoutName } from "./value-objects/workout-name";
import { Load } from "./value-objects/load";

const USER = "11111111-1111-4111-8111-111111111111";

const name = (raw = "Push Day") => WorkoutName.create(raw);

const item = (exerciseName: string, sets: ExerciseSet[] = []) =>
  WorkoutItem.create({ exerciseName, order: 0, sets });

const set = (reps: number, load: Load | null = null) =>
  ExerciseSet.create({ reps, load, notes: null });

describe("Workout aggregate", () => {
  it("creates a draft when there are no items and emits WorkoutCreated", () => {
    const workout = Workout.create({ userId: USER, name: name() });

    expect(workout.status).toBe("draft");
    expect(workout.userId).toBe(USER);
    expect(workout.completedAt).toBeNull();
    const events = workout.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.name).toBe("WorkoutCreated");
  });

  it("creates an active workout when it has items, and normalizes item order", () => {
    const workout = Workout.create({
      userId: USER,
      name: name(),
      items: [item("Bench"), item("Squat"), item("Row")],
    });

    expect(workout.status).toBe("active");
    expect(workout.items.map((i) => i.order)).toEqual([0, 1, 2]);
  });

  it("is owned only by its creator (ownership guard)", () => {
    const workout = Workout.create({ userId: USER, name: name() });
    expect(workout.isOwnedBy(USER)).toBe(true);
    expect(workout.isOwnedBy("22222222-2222-4222-8222-222222222222")).toBe(false);
  });

  it("replaces content and re-derives status/order", () => {
    const workout = Workout.create({ userId: USER, name: name() });
    workout.pullDomainEvents();

    workout.replaceContent(name("Leg Day"), [
      item("Squat", [set(5, Load.create(100, "kg"))]),
      item("Lunge"),
    ]);

    expect(workout.name.value).toBe("Leg Day");
    expect(workout.status).toBe("active");
    expect(workout.items).toHaveLength(2);
    expect(workout.items.map((i) => i.order)).toEqual([0, 1]);
    expect(workout.items[0]?.sets[0]?.load?.weight).toBe(100);
  });

  it("completes an active workout, stamps completedAt, and emits WorkoutCompleted", () => {
    const workout = Workout.create({ userId: USER, name: name(), items: [item("Bench")] });
    workout.pullDomainEvents();

    workout.complete();

    expect(workout.status).toBe("completed");
    expect(workout.completedAt).toBeInstanceOf(Date);
    const events = workout.pullDomainEvents();
    expect(events.map((e) => e.name)).toEqual(["WorkoutCompleted"]);
  });

  it("rejects completing an already-completed workout (conflict)", () => {
    const workout = Workout.create({ userId: USER, name: name(), items: [item("Bench")] });
    workout.complete();
    expect(() => workout.complete()).toThrowError(/já foi concluído/i);
  });

  it("rejects editing a completed workout (conflict)", () => {
    const workout = Workout.create({ userId: USER, name: name(), items: [item("Bench")] });
    workout.complete();
    expect(() => workout.replaceContent(name("nope"), [])).toThrowError(/concluído/i);
  });

  it("duplicates into a fresh draft with new ids and no completion", () => {
    const original = Workout.create({
      userId: USER,
      name: name("Original"),
      items: [item("Bench", [set(8), set(8)])],
    });
    original.complete();
    original.pullDomainEvents();

    const copy = original.duplicate((i) =>
      WorkoutItem.create({
        exerciseName: i.exerciseName,
        order: i.order,
        sets: i.sets.map((s) => ExerciseSet.create({ reps: s.reps, load: s.load, notes: s.notes })),
      }),
    );

    expect(copy.id.equals(original.id)).toBe(false);
    expect(copy.status).toBe("active"); // has items, not completed
    expect(copy.completedAt).toBeNull();
    expect(copy.name.value).toBe("Original (cópia)");
    expect(copy.items[0]?.id.equals(original.items[0]!.id)).toBe(false);
    expect(copy.items[0]?.sets).toHaveLength(2);
  });
});

describe("Workout value objects & entities", () => {
  it("rejects an empty workout name", () => {
    expect(() => WorkoutName.create("   ")).toThrowError(/nome do treino/i);
  });

  it("rejects reps below 1", () => {
    expect(() => ExerciseSet.create({ reps: 0 })).toThrowError(/repeti/i);
  });

  it("rejects an invalid load unit", () => {
    expect(() => Load.create(50, "ton" as never)).toThrowError(/unidade/i);
  });

  it("treats a set without load as bodyweight (null)", () => {
    const s = ExerciseSet.create({ reps: 12 });
    expect(s.load).toBeNull();
  });
});
