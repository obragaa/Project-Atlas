import { Inject, Injectable } from "@nestjs/common";
import { InjectPinoLogger, type PinoLogger } from "nestjs-pino";
import {
  type AiAction,
  type AiChatRequest,
  type AiChatResponse,
  EQUIPMENT,
  MUSCLE_GROUPS,
} from "@atlas/contracts";
import { AUDIT_LOGGER, type AuditLogger } from "../../../shared/audit/audit-logger.port.js";
import {
  LLM_PROVIDER,
  type LlmMessage,
  type LlmProvider,
  type LlmToolResult,
} from "../domain/llm-provider.port.js";
import { renderChatPrompt } from "../domain/prompt-registry.js";
import { AI_TOOLS, type AiTool, type ToolContext } from "./ai-tool.js";

export interface ChatCommand {
  readonly userId: string;
  readonly userName: string;
  readonly request: AiChatRequest;
  readonly today: Date;
  readonly maxTokens: number;
}

/** Safety bound on the tool loop so a model can never spin forever (doc 22). */
const MAX_TOOL_ROUNDS = 4;

/**
 * The Atlas AI Gateway (blueprint/22 "AI Gateway", ADR-0007). EVERY model call
 * goes through here. It builds context, renders the versioned prompt, runs the
 * tool loop against the provider-agnostic LLM, validates tool inputs (guardrails),
 * executes tools against real domain use cases, records observability (model,
 * tokens, latency, tool calls), and emits an audit event. Clients never call a
 * provider directly.
 */
@Injectable()
export class AiGatewayService {
  private readonly toolsByName: Map<string, AiTool>;

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
    @Inject(AI_TOOLS) private readonly tools: readonly AiTool[],
    @Inject(AUDIT_LOGGER) private readonly audit: AuditLogger,
    @InjectPinoLogger(AiGatewayService.name) private readonly logger: PinoLogger,
  ) {
    this.toolsByName = new Map(tools.map((t) => [t.definition.name, t]));
  }

  async chat(command: ChatCommand): Promise<AiChatResponse> {
    const startedAt = Date.now();
    const prompt = renderChatPrompt({
      userName: command.userName,
      muscleGroups: [...MUSCLE_GROUPS],
      equipment: [...EQUIPMENT],
      today: command.today.toISOString().slice(0, 10),
    });

    const toolDefs = this.tools.map((t) => t.definition);
    const context: ToolContext = { userId: command.userId };

    // Short-term memory: prior transcript + the new user message.
    const messages: LlmMessage[] = [
      ...(command.request.history ?? []).map(
        (m): LlmMessage => ({ role: m.role, content: m.content }),
      ),
      { role: "user", content: command.request.message },
    ];

    const actions: AiAction[] = [];
    let totalInput = 0;
    let totalOutput = 0;
    let totalToolCalls = 0;
    let reply = "";

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const completion = await this.llm.complete({
        system: prompt.text,
        messages,
        tools: toolDefs,
        maxTokens: command.maxTokens,
      });
      totalInput += completion.usage.inputTokens;
      totalOutput += completion.usage.outputTokens;

      if (!completion.stoppedForTools || completion.toolCalls.length === 0) {
        reply = completion.text.trim();
        break;
      }

      // Record the assistant's tool-call turn so the provider sees the loop.
      messages.push({
        role: "assistant",
        content: completion.text,
        toolCalls: completion.toolCalls,
      });

      const results: LlmToolResult[] = [];
      for (const call of completion.toolCalls) {
        totalToolCalls += 1;
        const tool = this.toolsByName.get(call.name);
        if (!tool) {
          results.push({
            toolCallId: call.id,
            content: `[${call.name}] Ferramenta desconhecida.`,
            isError: true,
          });
          continue;
        }
        // Guardrail: validate the model's tool input before executing.
        const error = tool.validate(call.input);
        if (error) {
          results.push({
            toolCallId: call.id,
            content: `[${call.name}] ${error}`,
            isError: true,
          });
          continue;
        }
        try {
          const outcome = await tool.execute(call.input, context);
          if (outcome.action) {
            actions.push(outcome.action);
          }
          results.push({ toolCallId: call.id, content: `[${call.name}] ${outcome.content}` });
        } catch (err) {
          this.logger.warn({ tool: call.name, err }, "ai tool execution failed");
          results.push({
            toolCallId: call.id,
            content: `[${call.name}] Falha ao executar a ferramenta.`,
            isError: true,
          });
        }
      }
      messages.push({ role: "tool", results });
    }

    if (!reply) {
      // Loop exhausted without a final text reply — give a safe fallback.
      reply =
        actions.length > 0
          ? "Pronto! Veja os detalhes acima."
          : "Desculpe, não consegui concluir agora. Pode reformular?";
    }

    const latencyMs = Date.now() - startedAt;
    // Observability (doc 22 / 21): never logs the message content, only metadata.
    this.logger.info(
      {
        ai: {
          promptId: prompt.id,
          provider: this.llm.name,
          inputTokens: totalInput,
          outputTokens: totalOutput,
          toolCalls: totalToolCalls,
          actions: actions.length,
          latencyMs,
        },
      },
      "ai chat completed",
    );
    this.audit.record({ action: "ai.chat", outcome: "success", userId: command.userId });

    return {
      reply,
      actions,
      promptId: prompt.id,
      provider: this.llm.name,
    };
  }
}
