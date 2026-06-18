import { Controller, Get } from "@nestjs/common";
import { type GamificationOverview } from "@atlas/contracts";
import { CurrentUser } from "../../auth/presentation/current-user.decorator.js";
import { type RequestPrincipal } from "../../auth/presentation/authenticated-request.js";
import { GetOverviewUseCase } from "../application/get-overview.use-case.js";

/**
 * Gamification controller (Presentation layer). Read-only: the combined streak +
 * missions + achievements snapshot for the authenticated user (blueprint/09).
 * Guarded by the global JwtAuthGuard.
 */
@Controller({ path: "gamification", version: "1" })
export class GamificationController {
  constructor(private readonly getOverview: GetOverviewUseCase) {}

  @Get("overview")
  overview(@CurrentUser() user: RequestPrincipal): Promise<GamificationOverview> {
    return this.getOverview.execute({ userId: user.id, today: new Date() });
  }
}
