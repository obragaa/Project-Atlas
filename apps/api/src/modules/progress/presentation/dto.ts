import { Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { type BodyMeasurements, type RecordMeasurementRequest } from "@atlas/contracts";

/** Edge validation (blueprint/16). Domain value objects validate again. */
class BodyMeasurementsDto implements BodyMeasurements {
  @IsOptional() @IsNumber() @Min(1) @Max(400) waist?: number | null;
  @IsOptional() @IsNumber() @Min(1) @Max(400) chest?: number | null;
  @IsOptional() @IsNumber() @Min(1) @Max(400) hips?: number | null;
  @IsOptional() @IsNumber() @Min(1) @Max(400) arm?: number | null;
  @IsOptional() @IsNumber() @Min(1) @Max(400) thigh?: number | null;
  @IsOptional() @IsNumber() @Min(1) @Max(400) calf?: number | null;
}

export class RecordMeasurementRequestDto implements RecordMeasurementRequest {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Use o formato AAAA-MM-DD." })
  recordedOn?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  weightKg?: number | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => BodyMeasurementsDto)
  measurements?: BodyMeasurementsDto;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string | null;
}

/** Query params for measurement history (cursor pagination). */
export class ListMeasurementsQueryDto {
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
