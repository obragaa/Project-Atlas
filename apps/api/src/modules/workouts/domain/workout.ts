import { AggregateRoot } from "../../../shared/domain/aggregate-root.js";
import { WorkoutId } from "./workout-id.js";
import { WorkoutName } from "./value-objects/workout-name.js";
import { type WorkoutItem } from "./workout-item.js";
import { WorkoutCreated } from "./events.js";

/**
 * Lifecycle of a workout *template* (blueprint/13, ADR-0003, ADR-0008). A
 * template is `draft` (no items yet) or `active` (ready to train). There is no
 * terminal `completed` state anymore: a template is reusable forever, and the
 * record of actually performing it is a WorkoutSession (ADR-0008). This removes
 * the old freeze that forced users to duplicate a template to train it again.
 */
export type WorkoutStatus = "draft" | "active";

interface WorkoutProps {
  readonly userId: string;
  name: WorkoutName;
  status: WorkoutStatus;
  items: WorkoutItem[];
  readonly createdAt: Date;
  updatedAt: Date;
}

/**
 * Workout aggregate root (blueprint/13 "Aggregate Roots": Workout controls the
 * consistency of its items and sets). Every mutation flows through the root, so
 * item ordering and the lifecycle stay consistent. The workout belongs to one
 * user (ownership, doc 13); authorization is enforced by the use cases that load
 * it. Newly created/edited workouts are `active` once they have items, else
 * `draft`.
 */
export class Workout extends AggregateRoot<WorkoutId> {
  private readonly props: WorkoutProps;

  private constructor(id: WorkoutId, props: WorkoutProps) {
    super(id);
    this.props = props;
  }

  /** Create a brand-new workout owned by `userId`. */
  static create(input: { userId: string; name: WorkoutName; items?: WorkoutItem[] }): Workout {
    const items = input.items ?? [];
    const now = new Date();
    const workout = new Workout(WorkoutId.generate(), {
      userId: input.userId,
      name: input.name,
      status: items.length > 0 ? "active" : "draft",
      items: Workout.normalizeOrder(items),
      createdAt: now,
      updatedAt: now,
    });
    workout.addDomainEvent(new WorkoutCreated(workout.id.toString(), input.userId));
    return workout;
  }

  /** Rehydrate an existing workout from persistence (no events). */
  static restore(id: WorkoutId, props: WorkoutProps): Workout {
    return new Workout(id, { ...props, items: Workout.normalizeOrder(props.items) });
  }

  /** Replace the editable content (name + items) — PUT semantics (doc 14). */
  replaceContent(name: WorkoutName, items: WorkoutItem[]): void {
    this.props.name = name;
    this.props.items = Workout.normalizeOrder(items);
    this.props.status = items.length > 0 ? "active" : "draft";
    this.touch();
  }

  /** Clone into a fresh draft owned by the same user (new ids). */
  duplicate(cloneItem: (item: WorkoutItem) => WorkoutItem): Workout {
    const copies = this.props.items.map(cloneItem);
    const duplicated = Workout.create({
      userId: this.props.userId,
      name: WorkoutName.create(`${this.props.name.value} (cópia)`),
      items: copies,
    });
    return duplicated;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  private static normalizeOrder(items: WorkoutItem[]): WorkoutItem[] {
    items.forEach((item, index) => item.reorder(index));
    return items;
  }

  get userId(): string {
    return this.props.userId;
  }

  /** Ownership guard (doc 13 "Ownership", doc 15 "Least Privilege"). */
  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  get name(): WorkoutName {
    return this.props.name;
  }

  get status(): WorkoutStatus {
    return this.props.status;
  }

  get items(): readonly WorkoutItem[] {
    return this.props.items;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
