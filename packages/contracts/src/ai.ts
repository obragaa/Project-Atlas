/**
 * Atlas AI transport contract (blueprint/10 - Atlas AI.md, 22 - AI Engineering.md).
 * The chat goes through the AI Gateway; the AI may take grounded actions via
 * tools (e.g. build a workout from the real catalogue). Conversation is short-
 * term memory the client passes back each turn (doc 22 "AI Memory").
 */

export const AI_CHAT_ROLES = ["user", "assistant"] as const;
export type AiChatRole = (typeof AI_CHAT_ROLES)[number];

/** One message in the conversation transcript. */
export interface AiChatMessage {
  readonly role: AiChatRole;
  readonly content: string;
}

/** A chat turn: the prior transcript plus the new user message. */
export interface AiChatRequest {
  /** Prior turns (short-term memory). The new user message is `message`. */
  readonly history?: readonly AiChatMessage[];
  readonly message: string;
}

/** The kinds of grounded actions the AI can take via tools (doc 22 Tool Calling). */
export const AI_ACTION_KINDS = ["workout_created"] as const;
export type AiActionKind = (typeof AI_ACTION_KINDS)[number];

/** A concrete action the AI performed this turn, surfaced to the client. */
export interface AiAction {
  readonly kind: AiActionKind;
  /** Human label, e.g. the workout's name. */
  readonly label: string;
  /** A client route the action points at, e.g. `/workouts/{id}`. */
  readonly href: string;
}

/** The assistant's reply for one turn. */
export interface AiChatResponse {
  readonly reply: string;
  /** Any grounded actions taken (e.g. a workout was created). */
  readonly actions: readonly AiAction[];
  /** The prompt id+version that produced this reply (doc 22 observability). */
  readonly promptId: string;
  /** Whether this came from a real model or the mock provider (transparency). */
  readonly provider: "mock" | "anthropic";
}
