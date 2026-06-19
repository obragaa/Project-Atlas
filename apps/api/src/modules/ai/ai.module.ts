import { Module, type Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Environment } from "../../config/environment.js";
import { AuthModule } from "../auth/auth.module.js";
import { ExercisesModule } from "../exercises/exercises.module.js";
import { WorkoutsModule } from "../workouts/workouts.module.js";
import { LLM_PROVIDER } from "./domain/llm-provider.port.js";
import { MockLlmProvider } from "./infrastructure/mock-llm.provider.js";
import { AnthropicLlmProvider } from "./infrastructure/anthropic-llm.provider.js";
import { AI_TOOLS, type AiTool } from "./application/ai-tool.js";
import { SearchExercisesTool } from "./application/tools/search-exercises.tool.js";
import { CreateWorkoutTool } from "./application/tools/create-workout.tool.js";
import { AiGatewayService } from "./application/ai-gateway.service.js";
import { AiController } from "./presentation/ai.controller.js";

/**
 * Atlas AI module composition (blueprint/12, 22, ADR-0007). Selects the LLM
 * provider from `AI_PROVIDER` (mock by default — runs with no key — or anthropic
 * when configured). Registers the AI tools (each backed by a real use case from
 * Exercises/Workouts) and the gateway. The vendor SDK lives only inside the
 * Anthropic adapter.
 */
const llmProviderFactory: Provider = {
  provide: LLM_PROVIDER,
  inject: [ConfigService, MockLlmProvider, AnthropicLlmProvider],
  useFactory: (
    config: ConfigService<Environment, true>,
    mock: MockLlmProvider,
    anthropic: AnthropicLlmProvider,
  ) => (config.get("AI_PROVIDER", { infer: true }) === "anthropic" ? anthropic : mock),
};

/** The ordered tool surface available to the AI. */
const aiToolsProvider: Provider = {
  provide: AI_TOOLS,
  inject: [SearchExercisesTool, CreateWorkoutTool],
  useFactory: (search: SearchExercisesTool, create: CreateWorkoutTool): AiTool[] => [
    search,
    create,
  ],
};

@Module({
  imports: [AuthModule, ExercisesModule, WorkoutsModule],
  controllers: [AiController],
  providers: [
    MockLlmProvider,
    AnthropicLlmProvider,
    llmProviderFactory,
    SearchExercisesTool,
    CreateWorkoutTool,
    aiToolsProvider,
    AiGatewayService,
  ],
})
export class AiModule {}
