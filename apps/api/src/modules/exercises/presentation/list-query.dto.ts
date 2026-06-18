import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import {
  type Equipment,
  EQUIPMENT,
  type ExerciseFilter,
  type MuscleGroup,
  MUSCLE_GROUPS,
} from "@atlas/contracts";

/** Query params for the catalogue (blueprint/14 Filtering + Cursor Pagination). */
export class ListExercisesQueryDto implements ExerciseFilter {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn(MUSCLE_GROUPS)
  muscle?: MuscleGroup;

  @IsOptional()
  @IsIn(EQUIPMENT)
  equipment?: Equipment;

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
