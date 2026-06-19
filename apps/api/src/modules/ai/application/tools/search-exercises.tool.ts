import { Injectable } from "@nestjs/common";
import { EQUIPMENT, MUSCLE_GROUPS, type Equipment, type MuscleGroup } from "@atlas/contracts";
import { ListExercisesUseCase } from "../../../exercises/application/list-exercises.use-case.js";
import { type AiTool, type ToolContext, type ToolOutcome } from "../ai-tool.js";

/**
 * `search_exercises` tool (ADR-0007): the AI's grounded window into the real
 * exercise catalogue. Backed by `ListExercisesUseCase` — read-only, never the DB
 * directly. The AI uses this to pick real exercises before building a workout
 * (doc 22 "Tools Before Hallucination").
 */
@Injectable()
export class SearchExercisesTool implements AiTool {
  constructor(private readonly listExercises: ListExercisesUseCase) {}

  readonly definition = {
    name: "search_exercises",
    description:
      "Busca exercícios reais no catálogo do Atlas. Use antes de montar um treino para escolher exercícios que existem. Filtre por grupo muscular e/ou equipamento.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Texto para buscar pelo nome do exercício." },
        muscle: {
          type: "string",
          enum: [...MUSCLE_GROUPS],
          description: "Filtra pelo grupo muscular.",
        },
        equipment: {
          type: "string",
          enum: [...EQUIPMENT],
          description: "Filtra pelo equipamento.",
        },
        limit: { type: "integer", minimum: 1, maximum: 10, description: "Máximo de resultados." },
      },
    },
  };

  validate(input: Record<string, unknown>): string | null {
    if (input.muscle !== undefined && !MUSCLE_GROUPS.includes(input.muscle as MuscleGroup)) {
      return `muscle inválido. Use um de: ${MUSCLE_GROUPS.join(", ")}.`;
    }
    if (input.equipment !== undefined && !EQUIPMENT.includes(input.equipment as Equipment)) {
      return `equipment inválido. Use um de: ${EQUIPMENT.join(", ")}.`;
    }
    return null;
  }

  async execute(input: Record<string, unknown>, _context: ToolContext): Promise<ToolOutcome> {
    const page = await this.listExercises.execute({
      search: typeof input.search === "string" ? input.search : undefined,
      muscle: input.muscle as MuscleGroup | undefined,
      equipment: input.equipment as Equipment | undefined,
      limit: typeof input.limit === "number" ? input.limit : 6,
    });

    const items = page.items.map((e) => ({
      slug: e.slug,
      name: e.name,
      primaryMuscle: e.primaryMuscle,
      equipment: e.equipment,
    }));

    return { content: JSON.stringify(items) };
  }
}
