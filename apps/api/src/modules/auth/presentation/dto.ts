import { IsEmail, IsString, Length, MaxLength, MinLength } from "class-validator";
import { type LoginRequest, type RefreshRequest, type RegisterRequest } from "@atlas/contracts";

/**
 * Request DTOs — the first validation layer (blueprint/16 - Security.md: input
 * validated at the edge AND in the domain). They implement the transport
 * contract from `@atlas/contracts` so the wire shape never drifts.
 */
export class RegisterRequestDto implements RegisterRequest {
  @IsEmail({}, { message: "Informe um e-mail válido." })
  @MaxLength(254)
  email!: string;

  @IsString()
  @Length(12, 128, { message: "A senha deve ter entre 12 e 128 caracteres." })
  password!: string;

  @IsString()
  @Length(2, 60, { message: "O nome deve ter entre 2 e 60 caracteres." })
  displayName!: string;
}

export class LoginRequestDto implements LoginRequest {
  @IsEmail({}, { message: "Informe um e-mail válido." })
  email!: string;

  @IsString()
  @MinLength(1, { message: "Informe sua senha." })
  password!: string;
}

export class RefreshRequestDto implements RefreshRequest {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
