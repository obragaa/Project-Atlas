import { type LlmToolDefinition } from "../domain/llm-provider.port.js";
import { type AiAction } from "@atlas/contracts";

/** The context a tool runs in — always scoped to the authenticated user. */
export interface ToolContext {
  readonly userId: string;
}

/** The outcome of running a tool: text fed back to the model + optional action. */
export interface ToolOutcome {
  /** Content returned to the model (the gateway prefixes it with `[toolName]`). */
  readonly content: string;
  /** A user-facing action to surface (e.g. a workout was created). */
  readonly action?: AiAction;
}

/**
 * An AI tool (blueprint/22 "Tool Calling"): the model's ONLY way to act. Each
 * tool is backed by a real domain use case, validates its input before
 * executing (guardrails — doc 22), and never touches the database directly
 * (ADR-0007). `validate` returns null on success or an error string the gateway
 * feeds back to the model so it can correct itself.
 */
export interface AiTool {
  readonly definition: LlmToolDefinition;
  /** Validate raw model input; return an error message or null if valid. */
  validate(input: Record<string, unknown>): string | null;
  /** Execute against the real domain, scoped to the user. */
  execute(input: Record<string, unknown>, context: ToolContext): Promise<ToolOutcome>;
}

export const AI_TOOLS = Symbol("AI_TOOLS");
