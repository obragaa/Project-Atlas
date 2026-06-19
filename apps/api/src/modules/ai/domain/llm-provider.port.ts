/**
 * Provider-agnostic LLM port (blueprint/22 Provider Independence, ADR-0002,
 * ADR-0007). The Application layer depends only on this; concrete providers
 * (mock, Anthropic) live in Infrastructure and are selected by configuration.
 * No vendor type leaks across this boundary.
 */
export const LLM_PROVIDER = Symbol("LLM_PROVIDER");

/** A tool the model may call (doc 22 "Tool Calling"). Schema is JSON Schema. */
export interface LlmToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
}

/** A tool call the model requested. `input` is validated before execution. */
export interface LlmToolCall {
  readonly id: string;
  readonly name: string;
  readonly input: Record<string, unknown>;
}

/** The result of executing a tool, fed back to the model. */
export interface LlmToolResult {
  readonly toolCallId: string;
  readonly content: string;
  readonly isError?: boolean;
}

/** Conversation messages exchanged with the provider (provider-agnostic shape). */
export type LlmMessage =
  | { readonly role: "user"; readonly content: string }
  | {
      readonly role: "assistant";
      readonly content: string;
      readonly toolCalls?: readonly LlmToolCall[];
    }
  | { readonly role: "tool"; readonly results: readonly LlmToolResult[] };

/** Token usage for observability / cost (doc 22, doc 21). */
export interface LlmUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface LlmCompletionRequest {
  /** The versioned, rendered system prompt (built by the PromptRegistry). */
  readonly system: string;
  readonly messages: readonly LlmMessage[];
  readonly tools: readonly LlmToolDefinition[];
  /** Hard ceiling on output tokens (cost/safety). */
  readonly maxTokens: number;
}

/** One assistant turn: free text and/or tool calls, plus usage. */
export interface LlmCompletion {
  readonly text: string;
  readonly toolCalls: readonly LlmToolCall[];
  readonly usage: LlmUsage;
  /** True when the model stopped to call tools (the loop should continue). */
  readonly stoppedForTools: boolean;
}

export interface LlmProvider {
  /** A label for observability/transparency ("mock" | "anthropic"). */
  readonly name: "mock" | "anthropic";
  /** One model round trip. The gateway owns the multi-step tool loop. */
  complete(request: LlmCompletionRequest): Promise<LlmCompletion>;
}
