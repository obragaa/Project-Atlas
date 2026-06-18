import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { type CursorPageQuery } from "@atlas/contracts";

/** Query params for listing workouts (blueprint/14 Cursor Pagination). */
export class ListWorkoutsQueryDto implements CursorPageQuery {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
