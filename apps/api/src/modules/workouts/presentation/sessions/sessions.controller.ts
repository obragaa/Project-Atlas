import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  type CursorPage,
  type WorkoutSessionSummaryView,
  type WorkoutSessionView,
} from "@atlas/contracts";
import { toLocalDay } from "../../../../shared/domain/local-day.js";
import { CurrentUser } from "../../../auth/presentation/current-user.decorator.js";
import { type RequestPrincipal } from "../../../auth/presentation/authenticated-request.js";
import { StartSessionUseCase } from "../../application/sessions/start-session.use-case.js";
import { GetSessionUseCase } from "../../application/sessions/get-session.use-case.js";
import { ListSessionsUseCase } from "../../application/sessions/list-sessions.use-case.js";
import { UpdateSessionUseCase } from "../../application/sessions/update-session.use-case.js";
import { CompleteSessionUseCase } from "../../application/sessions/complete-session.use-case.js";
import { DeleteSessionUseCase } from "../../application/sessions/delete-session.use-case.js";
import { StartSessionRequestDto, UpdateSessionRequestDto } from "./dto.js";
import { ListSessionsQueryDto } from "./list-query.dto.js";

/**
 * Workout sessions controller (Presentation layer). Validates input, derives the
 * owner from the authenticated principal and "today" from the app timezone, then
 * delegates to a use case — never business logic (blueprint/12). Every route is
 * guarded by the global JwtAuthGuard; ownership is enforced in the use cases.
 *
 * Starting a session lives under the template it comes from (POST
 * /workouts/:id/sessions); the session lifecycle then lives under /sessions.
 */
@Controller({ version: "1" })
export class SessionsController {
  constructor(
    private readonly startSession: StartSessionUseCase,
    private readonly getSession: GetSessionUseCase,
    private readonly listSessions: ListSessionsUseCase,
    private readonly updateSession: UpdateSessionUseCase,
    private readonly completeSession: CompleteSessionUseCase,
    private readonly deleteSession: DeleteSessionUseCase,
  ) {}

  /** "Treinar agora": start a performed session from a template. */
  @Post("workouts/:id/sessions")
  @HttpCode(HttpStatus.CREATED)
  start(
    @CurrentUser() user: RequestPrincipal,
    @Param("id") workoutId: string,
    @Body() body: StartSessionRequestDto,
  ): Promise<WorkoutSessionView> {
    return this.startSession.execute({
      userId: user.id,
      workoutId,
      request: body,
      today: toLocalDay(new Date()),
    });
  }

  @Get("sessions")
  list(
    @CurrentUser() user: RequestPrincipal,
    @Query() query: ListSessionsQueryDto,
  ): Promise<CursorPage<WorkoutSessionSummaryView>> {
    return this.listSessions.execute({
      userId: user.id,
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  @Get("sessions/:id")
  get(
    @CurrentUser() user: RequestPrincipal,
    @Param("id") id: string,
  ): Promise<WorkoutSessionView> {
    return this.getSession.execute({ userId: user.id, sessionId: id });
  }

  @Put("sessions/:id")
  update(
    @CurrentUser() user: RequestPrincipal,
    @Param("id") id: string,
    @Body() body: UpdateSessionRequestDto,
  ): Promise<WorkoutSessionView> {
    return this.updateSession.execute({
      userId: user.id,
      sessionId: id,
      request: body,
      today: toLocalDay(new Date()),
    });
  }

  @Post("sessions/:id/completion")
  @HttpCode(HttpStatus.OK)
  complete(
    @CurrentUser() user: RequestPrincipal,
    @Param("id") id: string,
  ): Promise<WorkoutSessionView> {
    return this.completeSession.execute({ userId: user.id, sessionId: id });
  }

  @Delete("sessions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: RequestPrincipal, @Param("id") id: string): Promise<void> {
    await this.deleteSession.execute({ userId: user.id, sessionId: id });
  }
}
