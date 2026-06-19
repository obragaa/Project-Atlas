import { Injectable } from "@nestjs/common";
import { type WorkoutItemInput } from "@atlas/contracts";
import { GetExerciseUseCase } from "../../../exercises/application/get-exercise.use-case.js";
import { CreateWorkoutUseCase } from "../../../workouts/application/create-workout.use-case.js";
import { type AiTool, type ToolContext, type ToolOutcome } from "../ai-tool.js";

/**
 * `create_workout` tool (ADR-0007): the AI's grounded way to build a real
 * workout. Backed by `CreateWorkoutUseCase` — the actual Workout aggregate,
 * which validates and persists (the AI never writes to the DB, doc 22). Each
 * exercise slug is resolved against the real catalogue, so the AI cannot invent
 * exercises; an unknown slug is skipped and reported back to the model.
 */
@Injectable()
export class CreateWorkoutTool implements AiTool {
  constructor(
    private readonly getExercise: GetExerciseUseCase,
    private readonly createWorkout: CreateWorkoutUseCase,
  ) {}

  readonly definition = {
    name: "create_workout",
    description:
      "Cria e salva um treino real para o usuário a partir de exercícios do catálogo (use os slugs retornados por search_exercises). Defina nome, exercícios e séries/repetições.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nome do treino, ex.: 'Treino de Peito'." },
        exerciseSlugs: {
          type: "array",
          items: { type: "string" },
          description: "Slugs de exercícios do catálogo (de search_exercises).",
        },
        setsPerExercise: { type: "integer", minimum: 1, maximum: 10 },
        repsPerSet: { type: "integer", minimum: 1, maximum: 50 },
      },
      required: ["name", "exerciseSlugs"],
    },
  };

  validate(input: Record<string, unknown>): string | null {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      return "name é obrigatório.";
    }
    if (!Array.isArray(input.exerciseSlugs) || input.exerciseSlugs.length === 0) {
      return "exerciseSlugs deve ter ao menos um slug (use search_exercises primeiro).";
    }
    return null;
  }

  async execute(input: Record<string, unknown>, context: ToolContext): Promise<ToolOutcome> {
    const slugs = (input.exerciseSlugs as unknown[]).filter(
      (s): s is string => typeof s === "string",
    );
    const sets = clampInt(input.setsPerExercise, 3, 1, 10);
    const reps = clampInt(input.repsPerSet, 10, 1, 50);

    const items: WorkoutItemInput[] = [];
    const skipped: string[] = [];
    for (const slug of slugs) {
      try {
        const exercise = await this.getExercise.execute({ slug });
        items.push({
          exerciseName: exercise.name,
          sets: Array.from({ length: sets }, () => ({ reps })),
        });
      } catch {
        skipped.push(slug);
      }
    }

    if (items.length === 0) {
      return {
        content:
          "Nenhum dos slugs existe no catálogo. Use search_exercises para obter slugs válidos.",
        // no action — nothing was created
      };
    }

    const workout = await this.createWorkout.execute({
      userId: context.userId,
      request: { name: (input.name as string).trim(), items },
    });

    const note = skipped.length > 0 ? ` (ignorados slugs inexistentes: ${skipped.join(", ")})` : "";
    return {
      content: `Treino "${workout.name}" criado com ${workout.items.length} exercícios.${note}`,
      action: {
        kind: "workout_created",
        label: workout.name,
        href: `/workouts/${workout.id}`,
      },
    };
  }
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.floor(value), min), max);
}
