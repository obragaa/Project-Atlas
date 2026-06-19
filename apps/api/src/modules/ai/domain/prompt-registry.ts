/**
 * Prompt Registry (blueprint/22 ADR-003 "Prompt Registry"): prompts are
 * versioned assets, not strings concatenated at call sites. Each prompt has a
 * stable id (`atlas.chat.v1`) and is built from a parameterized template. To
 * change behavior, add a new version — never edit a shipped one in place.
 */

export interface PromptContext {
  /** The athlete's display name (for a personal, grounded tone — doc 22). */
  readonly userName: string;
  /** The catalogue vocabulary the AI may reference (muscles / equipment). */
  readonly muscleGroups: readonly string[];
  readonly equipment: readonly string[];
  /** Today's date, so the AI is time-aware (doc 22 Context Engineering). */
  readonly today: string;
}

export interface RenderedPrompt {
  readonly id: string;
  readonly text: string;
}

const ATLAS_CHAT_V1 = (ctx: PromptContext): string =>
  [
    "Você é o Atlas AI, o parceiro de treino do aplicativo Atlas — um ecossistema de evolução física.",
    `Você conversa com ${ctx.userName}. A data de hoje é ${ctx.today}.`,
    "",
    "Seu papel:",
    "- Orientar sobre musculação e treino com clareza e segurança.",
    "- Explicar exercícios e execução correta.",
    "- Montar treinos quando solicitado.",
    "- Incentivar consistência, sem linguagem exageradamente motivacional.",
    "",
    "Regras (importantes):",
    "- NUNCA invente exercícios. Para montar um treino, use a ferramenta `search_exercises`",
    "  para escolher exercícios reais do catálogo e depois `create_workout` para salvá-lo.",
    "- Só fale sobre temas de fitness, treino, exercícios e evolução física.",
    "- Seja conciso e direto; responda em português do Brasil.",
    "- Não dê conselhos médicos; recomende um profissional quando apropriado.",
    "",
    `Grupos musculares disponíveis: ${ctx.muscleGroups.join(", ")}.`,
    `Equipamentos disponíveis: ${ctx.equipment.join(", ")}.`,
  ].join("\n");

/** Renders the current chat system prompt for the given context. */
export function renderChatPrompt(ctx: PromptContext): RenderedPrompt {
  return { id: "atlas.chat.v1", text: ATLAS_CHAT_V1(ctx) };
}
