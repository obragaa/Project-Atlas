import { AggregateRoot } from "../../../../shared/domain/aggregate-root.js";
import { ConflictError, ValidationError } from "../../../../shared/domain/errors.js";
import type { Workout } from "../workout.js";
import { type WorkoutName } from "../value-objects/workout-name.js";
import { WorkoutSessionId } from "./session-id.js";
import { type SessionDate } from "./value-objects/session-date.js";
import { SessionExercise } from "./session-exercise.js";
import { PerformedSet } from "./performed-set.js";
import { WorkoutSessionCompleted } from "./events.js";

/** Lifecycle of a session: being recorded, or finalized (blueprint/13). */
export type SessionStatus = "in_progress" | "completed";

interface WorkoutSessionProps {
  readonly userId: string;
  readonly sourceWorkoutId: string | null;
  title: WorkoutName;
  status: SessionStatus;
  performedOn: SessionDate;
  exercises: SessionExercise[];
  notes: string | null;
  readonly createdAt: Date;
  completedAt: Date | null;
}

const MAX_NOTES = 280;

/**
 * WorkoutSession aggregate root (blueprint/07 "Histórico de treinos", 13
 * "Aggregate Roots"). The record of a workout the user actually performed —
 * distinct from the reusable Workout template. It owns its exercises and their
 * performed sets; every mutation flows through the root so ordering and lifecycle
 * stay consistent. Belongs to one user (ownership, doc 13); authorization is
 * enforced by the use cases that load it.
 */
export class WorkoutSession extends AggregateRoot<WorkoutSessionId> {
  private readonly props: WorkoutSessionProps;

  private constructor(id: WorkoutSessionId, props: WorkoutSessionProps) {
    super(id);
    this.props = props;
  }

  /**
   * Start a session from a template ("Treinar agora"): snapshot the template's
   * name and copy its planned exercises/sets as the starting point, which the
   * user then edits with the real values. `performedOn` defaults to today
   * (blueprint/02 — never force the date).
   */
  static startFromTemplate(input: {
    workout: Workout;
    performedOn: SessionDate;
  }): WorkoutSession {
    const { workout, performedOn } = input;
    const exercises = workout.items.map((item, index) =>
      SessionExercise.create({
        exerciseName: item.exerciseName,
        order: index,
        sets: item.sets.map((set) =>
          PerformedSet.create({
            reps: set.reps,
            load: set.load,
            // Planned sets start unchecked; the user confirms what they did.
            completed: false,
            notes: set.notes,
          }),
        ),
      }),
    );
    const now = new Date();
    return new WorkoutSession(WorkoutSessionId.generate(), {
      userId: workout.userId,
      sourceWorkoutId: workout.id.toString(),
      title: workout.name,
      status: "in_progress",
      performedOn,
      exercises: WorkoutSession.normalizeOrder(exercises),
      notes: null,
      createdAt: now,
      completedAt: null,
    });
  }

  /** Rehydrate an existing session from persistence (no events). */
  static restore(id: WorkoutSessionId, props: WorkoutSessionProps): WorkoutSession {
    return new WorkoutSession(id, {
      ...props,
      exercises: WorkoutSession.normalizeOrder(props.exercises),
    });
  }

  /** Replace the recorded content — PUT semantics (doc 14). Only while in progress. */
  updateExecution(input: {
    title: WorkoutName;
    performedOn: SessionDate;
    exercises: SessionExercise[];
    notes: string | null;
  }): void {
    this.ensureEditable();
    this.props.title = input.title;
    this.props.performedOn = input.performedOn;
    this.props.exercises = WorkoutSession.normalizeOrder(input.exercises);
    this.props.notes = WorkoutSession.normalizeNotes(input.notes);
  }

  /**
   * Finalize the session and emit the fact. A session must have at least one
   * completed set to count as a real workout (blueprint/09 — no empty streaks).
   */
  complete(): void {
    if (this.props.status === "completed") {
      throw new ConflictError("Esta sessão já foi concluída.", "session.already_completed");
    }
    if (this.completedSetCount === 0) {
      throw new ValidationError(
        "Marque ao menos uma série como concluída para finalizar o treino.",
        [{ field: "exercises", message: "Nenhuma série concluída.", code: "session.empty" }],
        "session.empty",
      );
    }
    this.props.status = "completed";
    this.props.completedAt = new Date();
    this.addDomainEvent(
      new WorkoutSessionCompleted(
        this.id.toString(),
        this.props.userId,
        this.props.performedOn.value,
        this.totalVolume,
      ),
    );
  }

  private ensureEditable(): void {
    if (this.props.status === "completed") {
      throw new ConflictError(
        "Uma sessão concluída não pode ser editada.",
        "session.already_completed",
      );
    }
  }

  private static normalizeOrder(exercises: SessionExercise[]): SessionExercise[] {
    exercises.forEach((exercise, index) => exercise.reorder(index));
    return exercises;
  }

  private static normalizeNotes(raw: string | null): string | null {
    const notes = raw?.trim() ?? null;
    if (notes !== null && notes.length > MAX_NOTES) {
      throw new ValidationError(
        `As observações devem ter até ${MAX_NOTES} caracteres.`,
        [{ field: "notes", message: "Observação muito longa.", code: "session.notes_too_long" }],
        "session.notes_too_long",
      );
    }
    return notes && notes.length > 0 ? notes : null;
  }

  get userId(): string {
    return this.props.userId;
  }

  /** Ownership guard (doc 13 "Ownership", doc 15 "Least Privilege"). */
  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  get sourceWorkoutId(): string | null {
    return this.props.sourceWorkoutId;
  }

  get title(): WorkoutName {
    return this.props.title;
  }

  get status(): SessionStatus {
    return this.props.status;
  }

  get performedOn(): SessionDate {
    return this.props.performedOn;
  }

  get exercises(): readonly SessionExercise[] {
    return this.props.exercises;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  /** Total sets marked completed across all exercises. */
  get completedSetCount(): number {
    return this.props.exercises.reduce((sum, exercise) => sum + exercise.completedSetCount, 0);
  }

  /**
   * Training volume: Σ reps × weight over completed sets. Bodyweight sets have no
   * load, so they contribute their reps (weight factor 1) — a coarse but useful
   * proxy so a bodyweight session still registers volume.
   */
  get totalVolume(): number {
    let volume = 0;
    for (const exercise of this.props.exercises) {
      for (const set of exercise.sets) {
        if (!set.completed) continue;
        volume += set.reps * (set.load ? set.load.weight : 1);
      }
    }
    return Math.round(volume);
  }
}
