import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import {
  type LlmCompletion,
  type LlmCompletionRequest,
  type LlmMessage,
  type LlmProvider,
  type LlmToolCall,
} from "../domain/llm-provider.port.js";
import { type Environment } from "../../../config/environment.js";

/**
 * Anthropic (Claude) LLM provider (ADR-0002, ADR-0007). This is the ONLY place
 * `@anthropic-ai/sdk` is imported — the vendor stays inside Infrastructure
 * (blueprint/12, 22 Provider Independence). Selected when AI_PROVIDER=anthropic
 * and a key is configured. Translates the provider-agnostic request/response to
 * the Messages API and back; the multi-step tool loop is owned by the gateway.
 */
@Injectable()
export class AnthropicLlmProvider implements LlmProvider {
  readonly name = "anthropic" as const;
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: ConfigService<Environment, true>) {
    this.client = new Anthropic({
      apiKey: config.get("AI_ANTHROPIC_API_KEY", { infer: true }),
    });
    this.model = config.get("AI_DEFAULT_MODEL", { infer: true });
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletion> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxTokens,
      system: request.system,
      tools: request.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
      })),
      messages: request.messages.map(toAnthropicMessage),
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const toolCalls: LlmToolCall[] = response.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
      .map((b) => ({
        id: b.id,
        name: b.name,
        input: (b.input ?? {}) as Record<string, unknown>,
      }));

    return {
      text,
      toolCalls,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      stoppedForTools: response.stop_reason === "tool_use",
    };
  }
}

/** Maps a provider-agnostic message to the Anthropic Messages API shape. */
function toAnthropicMessage(message: LlmMessage): Anthropic.MessageParam {
  if (message.role === "user") {
    return { role: "user", content: message.content };
  }
  if (message.role === "assistant") {
    const blocks: Anthropic.ContentBlockParam[] = [];
    if (message.content) {
      blocks.push({ type: "text", text: message.content });
    }
    for (const call of message.toolCalls ?? []) {
      blocks.push({ type: "tool_use", id: call.id, name: call.name, input: call.input });
    }
    return { role: "assistant", content: blocks };
  }
  // Tool results are delivered as a user turn carrying tool_result blocks.
  return {
    role: "user",
    content: message.results.map((r) => ({
      type: "tool_result" as const,
      tool_use_id: r.toolCallId,
      content: r.content,
      is_error: r.isError ?? false,
    })),
  };
}
