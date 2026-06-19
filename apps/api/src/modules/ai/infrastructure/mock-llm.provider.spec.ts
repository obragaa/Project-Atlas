import { MockLlmProvider } from "./mock-llm.provider";
import { type LlmCompletionRequest, type LlmMessage } from "../domain/llm-provider.port";

const provider = new MockLlmProvider();

function req(messages: LlmMessage[]): LlmCompletionRequest {
  return { system: "sys", messages, tools: [], maxTokens: 512 };
}

describe("MockLlmProvider", () => {
  it("replies with text (no tools) for small talk", async () => {
    const c = await provider.complete(req([{ role: "user", content: "Olá!" }]));
    expect(c.stoppedForTools).toBe(false);
    expect(c.toolCalls).toHaveLength(0);
    expect(c.text.length).toBeGreaterThan(0);
  });

  it("first asks to search the catalogue when a workout is requested", async () => {
    const c = await provider.complete(req([{ role: "user", content: "monta um treino de peito" }]));
    expect(c.stoppedForTools).toBe(true);
    expect(c.toolCalls[0]?.name).toBe("search_exercises");
    expect(c.toolCalls[0]?.input.muscle).toBe("chest");
  });

  it("then asks to create the workout once exercises were returned", async () => {
    const messages: LlmMessage[] = [
      { role: "user", content: "monta um treino de peito" },
      {
        role: "assistant",
        content: "",
        toolCalls: [{ id: "t1", name: "search_exercises", input: {} }],
      },
      {
        role: "tool",
        results: [
          {
            toolCallId: "t1",
            content: '[search_exercises] [{"slug":"barbell-bench-press"},{"slug":"push-up"}]',
          },
        ],
      },
    ];
    const c = await provider.complete(req(messages));
    expect(c.toolCalls[0]?.name).toBe("create_workout");
    expect(c.toolCalls[0]?.input.exerciseSlugs).toEqual(["barbell-bench-press", "push-up"]);
  });

  it("wraps up with text after the workout was created", async () => {
    const messages: LlmMessage[] = [
      { role: "user", content: "monta um treino de peito" },
      {
        role: "assistant",
        content: "",
        toolCalls: [{ id: "t1", name: "search_exercises", input: {} }],
      },
      { role: "tool", results: [{ toolCallId: "t1", content: "[search_exercises] []" }] },
      {
        role: "assistant",
        content: "",
        toolCalls: [{ id: "t2", name: "create_workout", input: {} }],
      },
      { role: "tool", results: [{ toolCallId: "t2", content: "[create_workout] Treino criado." }] },
    ];
    const c = await provider.complete(req(messages));
    expect(c.stoppedForTools).toBe(false);
    expect(c.text.length).toBeGreaterThan(0);
  });
});
