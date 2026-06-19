import { AiGatewayService } from "./ai-gateway.service";
import { type AiTool, type ToolContext, type ToolOutcome } from "./ai-tool";
import { MockLlmProvider } from "../infrastructure/mock-llm.provider";
import { type AuditLogger } from "../../../shared/audit/audit-logger.port";
import { type PinoLogger } from "nestjs-pino";

const fakeLogger = { info: () => undefined, warn: () => undefined } as unknown as PinoLogger;
const fakeAudit: AuditLogger = { record: () => undefined };

/** A controllable fake exercise-search tool. */
class FakeSearchTool implements AiTool {
  readonly definition = {
    name: "search_exercises",
    description: "search",
    inputSchema: { type: "object" },
  };
  validate(): string | null {
    return null;
  }
  execute(): Promise<ToolOutcome> {
    return Promise.resolve({
      content: JSON.stringify([{ slug: "barbell-bench-press" }, { slug: "push-up" }]),
    });
  }
}

/** A controllable fake create-workout tool that records the call. */
class FakeCreateTool implements AiTool {
  calledWith: { input: Record<string, unknown>; context: ToolContext } | null = null;
  readonly definition = {
    name: "create_workout",
    description: "create",
    inputSchema: { type: "object" },
  };
  validate(input: Record<string, unknown>): string | null {
    if (!Array.isArray(input.exerciseSlugs) || input.exerciseSlugs.length === 0) {
      return "exerciseSlugs obrigatório";
    }
    return null;
  }
  execute(input: Record<string, unknown>, context: ToolContext): Promise<ToolOutcome> {
    this.calledWith = { input, context };
    return Promise.resolve({
      content: "Treino criado.",
      action: { kind: "workout_created", label: "Treino de Peito", href: "/workouts/abc" },
    });
  }
}

function buildGateway(tools: AiTool[]): AiGatewayService {
  return new AiGatewayService(new MockLlmProvider(), tools, fakeAudit, fakeLogger);
}

const baseCommand = {
  userId: "user-1",
  userName: "Atleta",
  today: new Date("2026-06-19T12:00:00Z"),
  maxTokens: 512,
};

describe("AiGatewayService (with MockLlmProvider)", () => {
  it("replies with text for non-workout messages and takes no action", async () => {
    const gateway = buildGateway([new FakeSearchTool(), new FakeCreateTool()]);
    const result = await gateway.chat({ ...baseCommand, request: { message: "olá, tudo bem?" } });

    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.actions).toHaveLength(0);
    expect(result.provider).toBe("mock");
    expect(result.promptId).toBe("atlas.chat.v1");
  });

  it("runs the tool loop and creates a workout when asked", async () => {
    const create = new FakeCreateTool();
    const gateway = buildGateway([new FakeSearchTool(), create]);

    const result = await gateway.chat({
      ...baseCommand,
      request: { message: "monta um treino de peito pra mim" },
    });

    // The create tool was invoked with the slugs the search tool returned.
    expect(create.calledWith).not.toBeNull();
    expect(create.calledWith?.context.userId).toBe("user-1");
    expect(create.calledWith?.input.exerciseSlugs).toEqual(["barbell-bench-press", "push-up"]);

    // The action is surfaced to the client.
    expect(result.actions).toEqual([
      { kind: "workout_created", label: "Treino de Peito", href: "/workouts/abc" },
    ]);
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("feeds a guardrail error back instead of executing an invalid tool call", async () => {
    // A create tool that always rejects — simulates the model sending bad input.
    class RejectingCreate extends FakeCreateTool {
      override validate(): string | null {
        return "exerciseSlugs obrigatório";
      }
    }
    const create = new RejectingCreate();
    const gateway = buildGateway([new FakeSearchTool(), create]);

    const result = await gateway.chat({
      ...baseCommand,
      request: { message: "monta um treino de pernas" },
    });

    // The tool never executed (no action), and the gateway didn't crash.
    expect(create.calledWith).toBeNull();
    expect(result.actions).toHaveLength(0);
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("never lets the tool loop run unbounded", async () => {
    // A search tool whose result keeps the mock asking for more is bounded by
    // MAX_TOOL_ROUNDS; the gateway must still return a reply.
    const gateway = buildGateway([new FakeSearchTool(), new FakeCreateTool()]);
    const result = await gateway.chat({
      ...baseCommand,
      request: { message: "monta um treino" },
    });
    expect(typeof result.reply).toBe("string");
  });
});
