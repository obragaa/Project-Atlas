import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import {
  type Load,
  LOAD_UNITS,
  type LoadUnit,
  type PerformedSetInput,
  RPE_MAX,
  RPE_MIN,
  type SessionExerciseInput,
  type StartSessionRequest,
  type UpdateSessionRequest,
} from "@atlas/contracts";

/**
 * Session request DTOs — the edge validation layer (blueprint/16: validated at
 * the edge AND in the domain). They implement the transport contracts from
 * @atlas/contracts so the wire shape never drifts. Domain value objects validate
 * again (defense in depth).
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

class LoadDto implements Load {
  @IsNumber()
  @Min(0)
  @Max(10_000)
  weight!: number;

  @IsIn(LOAD_UNITS)
  unit!: LoadUnit;
}

class PerformedSetInputDto implements PerformedSetInput {
  @IsInt()
  @Min(1)
  @Max(1000)
  reps!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => LoadDto)
  load?: LoadDto | null;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsInt()
  @Min(RPE_MIN)
  @Max(RPE_MAX)
  rpe?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string | null;
}

class SessionExerciseInputDto implements SessionExerciseInput {
  @IsString()
  @Length(1, 120)
  exerciseName!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformedSetInputDto)
  sets?: PerformedSetInputDto[];
}

export class StartSessionRequestDto implements StartSessionRequest {
  @IsOptional()
  @IsString()
  @Matches(ISO_DATE, { message: "performedOn deve estar no formato AAAA-MM-DD." })
  performedOn?: string;
}

export class UpdateSessionRequestDto implements UpdateSessionRequest {
  @IsString()
  @Length(1, 120)
  title!: string;

  @IsString()
  @Matches(ISO_DATE, { message: "performedOn deve estar no formato AAAA-MM-DD." })
  performedOn!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionExerciseInputDto)
  exercises!: SessionExerciseInputDto[];

  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string | null;
}
