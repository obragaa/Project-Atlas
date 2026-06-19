import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  type LlmCompletion,
  type LlmCompletionRequest,
  type LlmMessage,
  type LlmProvider,
  type LlmToolResult,
} from "../domain/llm-provider.port.js";

/**
 * Deterministic, credential-free LLM provider (ADR-0007). It is a first-class
 * adapter — not a stub — that drives the SAME tool loop as the real provider:
 * when the user asks for a workout it calls `search_exercises`, then
 * `create_workout`, then replies. For other messages it returns a helpful canned
 * answer. This lets chat + workout generation work end-to-end with no API key;
 * swapping to Anthropic is a config change.
 *
 * It infers the loop step from the transcript (which tool results are already
 * present), since each `complete()` call is stateless.
 */
@Injectable()
export class MockLlmProvider implements LlmProvider {
  readonly name = "mock" as const;

  complete(request: LlmCompletionRequest): Promise<LlmCompletion> {
    const lastUser = lastUserText(request.messages);
    const wantsWorkout = mentionsWorkout(lastUser);
    const usage = { inputTokens: 0, outputTokens: 0 };

    if (!wantsWorkout) {
      return Promise.resolve({
        text: smalltalk(lastUser),
        toolCalls: [],
        usage,
        stoppedForTools: false,
      });
    }

    const searched = hasToolResult(request.messages, "search_exercises");
    const created = hasToolResult(request.messages, "create_workout");

    // Step 3: a workout was created → wrap up.
    if (created) {
      return Promise.resolve({
        text: "Pronto! Montei seu treino e salvei na sua lista. É só abrir, ajustar as cargas e começar. 💪",
        toolCalls: [],
        usage,
        stoppedForTools: false,
      });
    }

    // Step 2: we have exercises → build and create the workout.
    if (searched) {
      const slugs = pickSlugs(request.messages);
      const focus = workoutFocus(lastUser);
      return Promise.resolve({
        text: "",
        toolCalls: [
          {
            id: uuidv4(),
            name: "create_workout",
            input: {
              name: `Treino ${focus}`,
              exerciseSlugs: slugs,
              setsPerExercise: 3,
              repsPerSet: 10,
            },
          },
        ],
        usage,
        stoppedForTools: true,
      });
    }

    // Step 1: search the catalogue for the requested muscle group.
    const muscle = inferMuscle(lastUser);
    return Promise.resolve({
      text: "",
      toolCalls: [
        {
          id: uuidv4(),
          name: "search_exercises",
          input: muscle ? { muscle, limit: 4 } : { limit: 4 },
        },
      ],
      usage,
      stoppedForTools: true,
    });
  }
}

function lastUserText(messages: readonly LlmMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i]!;
    if (m.role === "user") return m.content.toLowerCase();
  }
  return "";
}

function mentionsWorkout(text: string): boolean {
  return /(treino|montar|monta|monte|criar treino|cria um treino|workout|rotina)/.test(text);
}

function hasToolResult(messages: readonly LlmMessage[], toolName: string): boolean {
  // The gateway labels tool results with the tool name in their content prefix.
  return messages.some((m) => m.role === "tool" && m.results.some((r) => resultIsFor(r, toolName)));
}

function resultIsFor(result: LlmToolResult, toolName: string): boolean {
  return result.content.startsWith(`[${toolName}]`);
}

function pickSlugs(messages: readonly LlmMessage[]): string[] {
  // Read the slugs the search tool returned (the gateway encodes them as JSON
  // after the `[search_exercises]` marker).
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i]!;
    if (m.role !== "tool") continue;
    for (const r of m.results) {
      if (!resultIsFor(r, "search_exercises")) continue;
      try {
        const json = r.content.slice(r.content.indexOf("]") + 1).trim();
        const parsed = JSON.parse(json) as { slug: string }[];
        return parsed.map((e) => e.slug).slice(0, 4);
      } catch {
        return [];
      }
    }
  }
  return [];
}

const MUSCLE_WORDS: { readonly pattern: RegExp; readonly muscle: string }[] = [
  { pattern: /(peito|peitoral)/, muscle: "chest" },
  { pattern: /(costas|dorsal)/, muscle: "back" },
  { pattern: /(perna|quadr|coxa)/, muscle: "legs" },
  { pattern: /(ombro|deltoid)/, muscle: "shoulders" },
  { pattern: /(b[íi]ceps|biceps)/, muscle: "biceps" },
  { pattern: /(tr[íi]ceps|triceps)/, muscle: "triceps" },
  { pattern: /(gl[úu]teo|bumbum)/, muscle: "glutes" },
  { pattern: /(abd[óo]m|core|barriga)/, muscle: "core" },
];

function inferMuscle(text: string): string | null {
  return MUSCLE_WORDS.find((m) => m.pattern.test(text))?.muscle ?? null;
}

function workoutFocus(text: string): string {
  const labels: Record<string, string> = {
    chest: "de Peito",
    back: "de Costas",
    legs: "de Pernas",
    shoulders: "de Ombros",
    biceps: "de Bíceps",
    triceps: "de Tríceps",
    glutes: "de Glúteos",
    core: "de Core",
  };
  const muscle = inferMuscle(text);
  return muscle ? labels[muscle]! : "do Atlas";
}

function smalltalk(text: string): string {
  if (/(ol[áa]|oi|bom dia|boa tarde|boa noite)/.test(text)) {
    return "Olá! Eu sou o Atlas AI. Posso montar um treino pra você, explicar exercícios ou tirar dúvidas de musculação. O que você quer treinar hoje?";
  }
  if (/(como|explica|o que é|pra que serve)/.test(text)) {
    return "Boa pergunta! Posso explicar a execução de qualquer exercício do catálogo. Me diga qual exercício, ou peça que eu monte um treino completo — é só falar o grupo muscular.";
  }
  return "Posso te ajudar a montar treinos e entender exercícios. Quer que eu monte um treino? Me diga o foco (ex.: peito, pernas, costas).";
}
