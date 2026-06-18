import { Module, type Provider } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import {
  PASSWORD_HASHER,
  REFRESH_TOKEN_HASHER,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from "./domain/ports.js";
import { SESSION_STORE } from "./domain/session-store.port.js";
import { RegisterUserUseCase } from "./application/register-user.use-case.js";
import { LoginUserUseCase } from "./application/login-user.use-case.js";
import { RefreshSessionUseCase } from "./application/refresh-session.use-case.js";
import { LogoutUseCase } from "./application/logout.use-case.js";
import { GetCurrentUserUseCase } from "./application/get-current-user.use-case.js";
import { SessionFactory } from "./application/session.factory.js";
import { Argon2PasswordHasher } from "./infrastructure/argon2-password.hasher.js";
import { JwtTokenService } from "./infrastructure/jwt-token.service.js";
import { Sha256RefreshTokenHasher } from "./infrastructure/sha256-refresh-token.hasher.js";
import { PostgresUserRepository } from "./infrastructure/postgres-user.repository.js";
import { RedisSessionStore } from "./infrastructure/redis-session.store.js";
import { InMemorySessionStore } from "./infrastructure/in-memory-session.store.js";
import { type Environment } from "../../config/environment.js";
import { REDIS_CLIENT, type RedisClient } from "../../infra/infra.tokens.js";
import { AuthController } from "./presentation/auth.controller.js";
import { JwtAuthGuard } from "./presentation/jwt-auth.guard.js";
import { RolesGuard } from "./presentation/roles.guard.js";

/**
 * The session store is Redis in production and in-memory for tests/local runs
 * without Redis (selected by SESSION_DRIVER), mirroring the persistence driver
 * switch. Both honor the same SessionStore port (Dependency Rule, blueprint/12).
 */
const sessionStoreProvider: Provider = {
  provide: SESSION_STORE,
  inject: [ConfigService, REDIS_CLIENT],
  useFactory: (config: ConfigService<Environment, true>, redis: RedisClient) =>
    config.get("SESSION_DRIVER", { infer: true }) === "memory"
      ? new InMemorySessionStore()
      : new RedisSessionStore(redis, config),
};

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
    LogoutUseCase,
    GetCurrentUserUseCase,
    SessionFactory,
    { provide: USER_REPOSITORY, useClass: PostgresUserRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: REFRESH_TOKEN_HASHER, useClass: Sha256RefreshTokenHasher },
    sessionStoreProvider,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [TOKEN_SERVICE, USER_REPOSITORY, SESSION_STORE],
})
export class AuthModule {}
