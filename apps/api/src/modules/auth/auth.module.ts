import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY } from "./domain/ports.js";
import { RegisterUserUseCase } from "./application/register-user.use-case.js";
import { LoginUserUseCase } from "./application/login-user.use-case.js";
import { RefreshSessionUseCase } from "./application/refresh-session.use-case.js";
import { GetCurrentUserUseCase } from "./application/get-current-user.use-case.js";
import { Argon2PasswordHasher } from "./infrastructure/argon2-password.hasher.js";
import { JwtTokenService } from "./infrastructure/jwt-token.service.js";
import { InMemoryUserRepository } from "./infrastructure/in-memory-user.repository.js";
import { AuthController } from "./presentation/auth.controller.js";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard.js";
import { RolesGuard } from "./presentation/roles.guard.js";

/**
 * Auth module composition. Binds domain ports to their Infrastructure adapters
 * and registers the global authentication + RBAC guards (secure by default —
 * every route is protected unless marked `@Public()`).
 */
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshSessionUseCase,
    GetCurrentUserUseCase,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [TOKEN_SERVICE, USER_REPOSITORY],
})
export class AuthModule {}
