import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { type AuthSession, type AuthenticatedUser, type TokenPair } from "@atlas/contracts";
import { RegisterUserUseCase } from "../application/register-user.use-case.js";
import { LoginUserUseCase } from "../application/login-user.use-case.js";
import { RefreshSessionUseCase } from "../application/refresh-session.use-case.js";
import { GetCurrentUserUseCase } from "../application/get-current-user.use-case.js";
import { LoginRequestDto, RefreshRequestDto, RegisterRequestDto } from "./dto.js";
import { CurrentUser } from "./current-user.decorator.js";
import { Public } from "./public.decorator.js";
import { type RequestPrincipal } from "./authenticated-request.js";

/**
 * Auth controller (Presentation layer). It only validates input, delegates to a
 * use case, and shapes the response — never business logic (blueprint/12
 * "Controllers"). Errors propagate as domain errors and are rendered as RFC
 * 7807 by the global filter.
 */
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: RegisterRequestDto): Promise<AuthSession> {
    return this.registerUser.execute(body);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginRequestDto): Promise<AuthSession> {
    return this.loginUser.execute(body);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: RefreshRequestDto): Promise<TokenPair> {
    return this.refreshSession.execute(body);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(): void {
    // Stateless access tokens expire on their own; a persistent-session adapter
    // (doc 15) will revoke the refresh token here. No-op for now, by design.
  }

  @Get("me")
  me(@CurrentUser() principal: RequestPrincipal): Promise<AuthenticatedUser> {
    return this.getCurrentUser.execute(principal.id);
  }
}
