import { type Equipment, EQUIPMENT, type MuscleGroup, MUSCLE_GROUPS } from "@atlas/contracts";
import { Entity } from "../../../shared/domain/entity.js";
import { ValidationError } from "../../../shared/domain/errors.js";
import { ExerciseId } from "./exercise-id.js";

interface ExerciseProps {
  readonly slug: string;
  readonly name: string;
  readonly primaryMuscle: MuscleGroup;
  readonly muscles: readonly MuscleGroup[];
  readonly equipment: Equipment;
  readonly instructions: string;
  readonly tips: readonly string[];
  readonly variations: readonly string[];
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A catalogue exercise (blueprint/07 "Exercícios", ADR-0004). System-owned
 * reference data: created by the seed and rehydrated for reads; there is no
 * per-user owner and no mutable lifecycle. The `slug` is a stable public handle
 * distinct from the opaque id (doc 14 Naming). `create` validates invariants so
 * the seed cannot introduce malformed data; `restore` trusts the DB (whose CHECK
 * constraints mirror the closed sets).
 */
export class Exercise extends Entity<ExerciseId> {
  private readonly props: ExerciseProps;

  private constructor(id: ExerciseId, props: ExerciseProps) {
    super(id);
    this.props = props;
  }

  static create(input: { id?: ExerciseId } & ExerciseProps): Exercise {
    const slug = input.slug.trim();
    if (!SLUG_PATTERN.test(slug)) {
      throw new ValidationError(
        "Slug de exercício inválido.",
        [{ field: "slug", message: "Slug inválido.", code: "exercise.slug_invalid" }],
        "exercise.slug_invalid",
      );
    }
    const name = input.name.trim();
    if (name.length < 1 || name.length > 120) {
      throw new ValidationError(
        "Nome de exercício inválido.",
        [{ field: "name", message: "Nome inválido.", code: "exercise.name_invalid" }],
        "exercise.name_invalid",
      );
    }
    if (!MUSCLE_GROUPS.includes(input.primaryMuscle)) {
      throw invalid("primaryMuscle", "exercise.muscle_invalid");
    }
    if (input.muscles.some((m) => !MUSCLE_GROUPS.includes(m))) {
      throw invalid("muscles", "exercise.muscle_invalid");
    }
    if (!EQUIPMENT.includes(input.equipment)) {
      throw invalid("equipment", "exercise.equipment_invalid");
    }

    // The primary muscle is always part of the worked set (deduped).
    const muscles = [...new Set<MuscleGroup>([input.primaryMuscle, ...input.muscles])];

    return new Exercise(input.id ?? ExerciseId.generate(), {
      slug,
      name,
      primaryMuscle: input.primaryMuscle,
      muscles,
      equipment: input.equipment,
      instructions: input.instructions.trim(),
      tips: input.tips,
      variations: input.variations,
    });
  }

  /** Rehydrate from persistence (DB CHECK constraints already enforce the sets). */
  static restore(id: ExerciseId, props: ExerciseProps): Exercise {
    return new Exercise(id, props);
  }

  get slug(): string {
    return this.props.slug;
  }

  get name(): string {
    return this.props.name;
  }

  get primaryMuscle(): MuscleGroup {
    return this.props.primaryMuscle;
  }

  get muscles(): readonly MuscleGroup[] {
    return this.props.muscles;
  }

  get equipment(): Equipment {
    return this.props.equipment;
  }

  get instructions(): string {
    return this.props.instructions;
  }

  get tips(): readonly string[] {
    return this.props.tips;
  }

  get variations(): readonly string[] {
    return this.props.variations;
  }
}

function invalid(field: string, code: string): ValidationError {
  return new ValidationError(
    "Dado de exercício inválido.",
    [{ field, message: "Valor inválido.", code }],
    code,
  );
}
