import { Workout } from "../workout.js";
import { WorkoutItem } from "../workout-item.js";
import { ExerciseSet } from "../exercise-set.js";
import { WorkoutName } from "../value-objects/workout-name.js";
import { Load } from "../value-objects/load.js";
import { WorkoutSession } from "./workout-session.js";
import { SessionExercise } from "./session-exercise.js";
import { PerformedSet } from "./performed-set.js";
import { SessionDate } from "./value-objects/session-date.js";
import { Rpe } from "./value-objects/rpe.js";

const USER = "11111111-1111-4111-8111-111111111111";
const TODAY = "2026-07-14";

const template = () =>
  Workout.create({
    userId: USER,
    name: WorkoutName.create("Push Day"),
    items: [
      WorkoutItem.create({
        exerciseName: "Supino reto",
        order: 0,
        sets: [ExerciseSet.create({ reps: 10, load: Load.create(60, "kg"), notes: null })],
      }),
    ],
  });

describe("WorkoutSession — startFromTemplate", () => {
  it("snapshots the template name and copies planned exercises as unchecked sets", () => {
    const session = WorkoutSession.startFromTemplate({
      workout: template(),
      performedOn: SessionDate.today(new Date(`${TODAY}T12:00:00Z`)),
    });

    expect(session.status).toBe("in_progress");
    expect(session.title.value).toBe("Push Day");
    expect(session.userId).toBe(USER);
    expect(session.exercises).toHaveLength(1);
    const set = session.exercises[0]?.sets[0];
    expect(set?.reps).toBe(10);
    expect(set?.load?.weight).toBe(60);
    // Planned sets start unchecked — the user confirms what they actually did.
    expect(set?.completed).toBe(false);
    expect(session.completedSetCount).toBe(0);
  });
});

describe("WorkoutSession — complete", () => {
  const sessionWithCompletedSet = () => {
    const session = WorkoutSession.startFromTemplate({
      workout: template(),
      performedOn: SessionDate.create(TODAY, TODAY),
    });
    session.updateExecution({
      title: WorkoutName.create("Push Day"),
      performedOn: SessionDate.create(TODAY, TODAY),
      exercises: [
        SessionExercise.create({
          exerciseName: "Supino reto",
          order: 0,
          sets: [
            PerformedSet.create({ reps: 10, load: Load.create(60, "kg"), completed: true }),
            PerformedSet.create({ reps: 8, load: Load.create(60, "kg"), completed: false }),
          ],
        }),
      ],
      notes: null,
    });
    return session;
  };

  it("refuses to finalize with no completed set", () => {
    const session = WorkoutSession.startFromTemplate({
      workout: template(),
      performedOn: SessionDate.create(TODAY, TODAY),
    });
    expect(() => session.complete()).toThrow(/série/i);
  });

  it("finalizes and emits WorkoutSessionCompleted with day and volume (completed sets only)", () => {
    const session = sessionWithCompletedSet();
    session.complete();

    expect(session.status).toBe("completed");
    expect(session.completedAt).not.toBeNull();
    const events = session.pullDomainEvents();
    expect(events).toHaveLength(1);
    const event = events[0] as {
      name: string;
      performedOn: string;
      totalVolume: number;
    };
    expect(event.name).toBe("WorkoutSessionCompleted");
    expect(event.performedOn).toBe(TODAY);
    // Only the completed set counts: 10 reps × 60 kg = 600 (the skipped set is ignored).
    expect(event.totalVolume).toBe(600);
  });

  it("rejects a second completion", () => {
    const session = sessionWithCompletedSet();
    session.complete();
    expect(() => session.complete()).toThrow(/concluída/i);
  });
});

describe("SessionDate", () => {
  it("defaults to today in the app timezone (BRT, not UTC)", () => {
    // 2026-07-15 00:30 UTC is still 2026-07-14 21:30 in São Paulo (UTC-3).
    const lateNightBrt = new Date("2026-07-15T00:30:00Z");
    expect(SessionDate.today(lateNightBrt).value).toBe("2026-07-14");
  });

  it("accepts a past date but rejects a future one", () => {
    expect(SessionDate.create("2026-07-10", TODAY).value).toBe("2026-07-10");
    expect(() => SessionDate.create("2026-07-20", TODAY)).toThrow(/futuro/i);
  });

  it("rejects malformed dates", () => {
    expect(() => SessionDate.create("14/07/2026", TODAY)).toThrow(/inválida/i);
  });
});

describe("Rpe", () => {
  it("accepts 1..10 and rejects out-of-range or non-integer", () => {
    expect(Rpe.create(7).value).toBe(7);
    expect(() => Rpe.create(0)).toThrow();
    expect(() => Rpe.create(11)).toThrow();
    expect(() => Rpe.create(7.5)).toThrow();
  });
});
