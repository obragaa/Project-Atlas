import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { type CursorPage, type MeasurementView, type ProgressSummary } from "@atlas/contracts";
import { CurrentUser } from "../../auth/presentation/current-user.decorator.js";
import { type RequestPrincipal } from "../../auth/presentation/authenticated-request.js";
import { RecordMeasurementUseCase } from "../application/record-measurement.use-case.js";
import { ListMeasurementsUseCase } from "../application/list-measurements.use-case.js";
import { DeleteMeasurementUseCase } from "../application/delete-measurement.use-case.js";
import { GetProgressSummaryUseCase } from "../application/get-progress-summary.use-case.js";
import { ListMeasurementsQueryDto, RecordMeasurementRequestDto } from "./dto.js";

/**
 * Progress controller (Presentation layer). Validates input, derives the owner
 * from the authenticated principal, delegates to a use case, shapes the
 * response — never business logic (blueprint/12). Guarded by the global
 * JwtAuthGuard; ownership enforced in the use cases.
 */
@Controller({ path: "progress", version: "1" })
export class ProgressController {
  constructor(
    private readonly recordMeasurement: RecordMeasurementUseCase,
    private readonly listMeasurements: ListMeasurementsUseCase,
    private readonly deleteMeasurement: DeleteMeasurementUseCase,
    private readonly getSummary: GetProgressSummaryUseCase,
  ) {}

  @Get("measurements")
  list(
    @CurrentUser() user: RequestPrincipal,
    @Query() query: ListMeasurementsQueryDto,
  ): Promise<CursorPage<MeasurementView>> {
    return this.listMeasurements.execute({
      userId: user.id,
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  @Post("measurements")
  @HttpCode(HttpStatus.CREATED)
  record(
    @CurrentUser() user: RequestPrincipal,
    @Body() body: RecordMeasurementRequestDto,
  ): Promise<MeasurementView> {
    return this.recordMeasurement.execute({
      userId: user.id,
      request: body,
      today: new Date(),
    });
  }

  @Delete("measurements/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: RequestPrincipal, @Param("id") id: string): Promise<void> {
    await this.deleteMeasurement.execute({ userId: user.id, measurementId: id });
  }

  @Get("summary")
  summary(@CurrentUser() user: RequestPrincipal): Promise<ProgressSummary> {
    return this.getSummary.execute({ userId: user.id });
  }
}
