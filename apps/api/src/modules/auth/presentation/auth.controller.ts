import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import { type AuthSession, type AuthenticatedUser, type TokenPair } from "@atlas/contracts";
import { type Request } from "express";
import { RegisterUserUseCase } from "../application/register-user.use-case.js";
import { LoginUserUseCase } from "../application/login-user.use-case.js";
import { RefreshSessionUseCase } from "../application/refresh-session.use-case.js";
import { LogoutUseCase } from "../application/logout.use-case.js";
import { GetCurrentUserUseCase } from "../application/get-current-user.use-case.js";
import { LoginRequestDto, LogoutRequestDto, RefreshRequestDto, RegisterRequestDto } from "./dto.js";
import { CurrentUser } from "./current-user.decorator.js";
import { Public } from "./public.decorator.js";
import { type RequestPrincipal } from "./authenticated-request.js";
import { sessionContextFromRequest } from "./session-context.js";

/**
 * Auth controller (Presentation layer). It only validates input, derives request
 * context (device/session), delegates to a use case, and shapes the response —
 * never business logic (blueprint/12 "Controllers"). Errors propagate as domain
 * errors and are rendered as RFC 7807 by the global filter.
 */
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logoutUser: LogoutUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
  ) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: RegisterRequestDto, @Req() req: Request): Promise<AuthSession> {
    return this.registerUser.execute({ ...body, session: sessionContextFromRequest(req) });
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginRequestDto, @Req() req: Request): Promise<AuthSession> {
    return this.loginUser.execute({ ...body, session: sessionContextFromRequest(req) });
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: RefreshRequestDto): Promise<TokenPair> {
    return this.refreshSession.execute(body);
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() body: LogoutRequestDto): Promise<void> {
    await this.logoutUser.execute(body);
  }

  @Get("me")
  me(@CurrentUser() principal: RequestPrincipal): Promise<AuthenticatedUser> {
    return this.getCurrentUser.execute(principal.id);
  }
}
