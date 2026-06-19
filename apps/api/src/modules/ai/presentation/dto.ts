import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from "class-validator";
import {
  AI_CHAT_ROLES,
  type AiChatMessage,
  type AiChatRequest,
  type AiChatRole,
} from "@atlas/contracts";

/** Edge validation (blueprint/16) for the AI chat turn. */
class AiChatMessageDto implements AiChatMessage {
  @IsIn(AI_CHAT_ROLES)
  role!: AiChatRole;

  @IsString()
  @MaxLength(4000)
  content!: string;
}

export class AiChatRequestDto implements AiChatRequest {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiChatMessageDto)
  history?: AiChatMessageDto[];

  @IsString()
  @Length(1, 2000)
  message!: string;
}
