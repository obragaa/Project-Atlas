import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import {
  type CreateWorkoutRequest,
  type Load,
  LOAD_UNITS,
  type LoadUnit,
  type SetInput,
  type UpdateWorkoutRequest,
  type WorkoutItemInput,
} from "@atlas/contracts";

/**
 * Request DTOs — the edge validation layer (blueprint/16: validated at the edge
 * AND in the domain). They implement the transport contracts from
 * @atlas/contracts so the wire shape never drifts. Domain value objects validate
 * again (defense in depth).
 */

class LoadDto implements Load {
  @IsNumber()
  @Min(0)
  @Max(10_000)
  weight!: number;

  @IsIn(LOAD_UNITS)
  unit!: LoadUnit;
}

class SetInputDto implements SetInput {
  @IsInt()
  @Min(1)
  @Max(1000)
  reps!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => LoadDto)
  load?: LoadDto | null;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string | null;
}

class WorkoutItemInputDto implements WorkoutItemInput {
  @IsString()
  @Length(1, 120)
  exerciseName!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetInputDto)
  sets?: SetInputDto[];
}

export class CreateWorkoutRequestDto implements CreateWorkoutRequest {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutItemInputDto)
  items?: WorkoutItemInputDto[];
}

export class UpdateWorkoutRequestDto implements UpdateWorkoutRequest {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutItemInputDto)
  items!: WorkoutItemInputDto[];
}
