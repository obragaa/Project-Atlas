import { Body, Controller, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type AiChatResponse } from "@atlas/contracts";
import { type Environment } from "../../../config/environment.js";
import { CurrentUser } from "../../auth/presentation/current-user.decorator.js";
import { type RequestPrincipal } from "../../auth/presentation/authenticated-request.js";
import { GetCurrentUserUseCase } from "../../auth/application/get-current-user.use-case.js";
import { AiGatewayService } from "../application/ai-gateway.service.js";
import { AiChatRequestDto } from "./dto.js";

/**
 * Atlas AI controller (Presentation layer). Validates input, derives the user
 * context, and delegates to the AI Gateway — never business logic (blueprint/12).
 * Guarded by the global JwtAuthGuard; the AI sees only the caller's data.
 */
@Controller({ path: "ai", version: "1" })
export class AiController {
  private readonly maxTokens: number;

  constructor(
    private readonly gateway: AiGatewayService,
    private readonly getCurrentUser: GetCurrentUserUseCase,
    config: ConfigService<Environment, true>,
  ) {
    this.maxTokens = config.get("AI_MAX_OUTPUT_TOKENS", { infer: true });
  }

  @Post("chat")
  async chat(
    @CurrentUser() principal: RequestPrincipal,
    @Body() body: AiChatRequestDto,
  ): Promise<AiChatResponse> {
    const user = await this.getCurrentUser.execute(principal.id);
    return this.gateway.chat({
      userId: principal.id,
      userName: user.displayName,
      request: body,
      today: new Date(),
      maxTokens: this.maxTokens,
    });
  }
}
