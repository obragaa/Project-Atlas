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
import { type CursorPage, type WorkoutSummaryView, type WorkoutView } from "@atlas/contracts";
import { CurrentUser } from "../../auth/presentation/current-user.decorator.js";
import { type RequestPrincipal } from "../../auth/presentation/authenticated-request.js";
import { CreateWorkoutUseCase } from "../application/create-workout.use-case.js";
import { GetWorkoutUseCase } from "../application/get-workout.use-case.js";
import { ListWorkoutsUseCase } from "../application/list-workouts.use-case.js";
import { UpdateWorkoutUseCase } from "../application/update-workout.use-case.js";
import { DeleteWorkoutUseCase } from "../application/delete-workout.use-case.js";
import { CompleteWorkoutUseCase } from "../application/complete-workout.use-case.js";
import { DuplicateWorkoutUseCase } from "../application/duplicate-workout.use-case.js";
import { CreateWorkoutRequestDto, UpdateWorkoutRequestDto } from "./dto.js";
import { ListWorkoutsQueryDto } from "./list-query.dto.js";

/**
 * Workouts controller (Presentation layer). Validates input, derives the owner
 * from the authenticated principal, delegates to a use case, and shapes the
 * response — never business logic (blueprint/12). Every route is guarded by the
 * global JwtAuthGuard (secure by default); ownership is enforced in the use
 * cases (doc 13/15). Errors propagate as domain errors → RFC 7807.
 */
@Controller({ path: "workouts", version: "1" })
export class WorkoutsController {
  constructor(
    private readonly createWorkout: CreateWorkoutUseCase,
    private readonly getWorkout: GetWorkoutUseCase,
    private readonly listWorkouts: ListWorkoutsUseCase,
    private readonly updateWorkout: UpdateWorkoutUseCase,
    private readonly deleteWorkout: DeleteWorkoutUseCase,
    private readonly completeWorkout: CompleteWorkoutUseCase,
    private readonly duplicateWorkout: DuplicateWorkoutUseCase,
  ) {}

  @Get()
  list(
    @CurrentUser() user: RequestPrincipal,
    @Query() query: ListWorkoutsQueryDto,
  ): Promise<CursorPage<WorkoutSummaryView>> {
    return this.listWorkouts.execute({
      userId: user.id,
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: RequestPrincipal,
    @Body() body: CreateWorkoutRequestDto,
  ): Promise<WorkoutView> {
    return this.createWorkout.execute({ userId: user.id, request: body });
  }

  @Get(":id")
  get(@CurrentUser() user: RequestPrincipal, @Param("id") id: string): Promise<WorkoutView> {
    return this.getWorkout.execute({ userId: user.id, workoutId: id });
  }

  @Put(":id")
  update(
    @CurrentUser() user: RequestPrincipal,
    @Param("id") id: string,
    @Body() body: UpdateWorkoutRequestDto,
  ): Promise<WorkoutView> {
    return this.updateWorkout.execute({ userId: user.id, workoutId: id, request: body });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: RequestPrincipal, @Param("id") id: string): Promise<void> {
    await this.deleteWorkout.execute({ userId: user.id, workoutId: id });
  }

  @Post(":id/completion")
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUser() user: RequestPrincipal, @Param("id") id: string): Promise<WorkoutView> {
    return this.completeWorkout.execute({ userId: user.id, workoutId: id });
  }

  @Post(":id/duplication")
  @HttpCode(HttpStatus.CREATED)
  duplicate(@CurrentUser() user: RequestPrincipal, @Param("id") id: string): Promise<WorkoutView> {
    return this.duplicateWorkout.execute({ userId: user.id, workoutId: id });
  }
}
