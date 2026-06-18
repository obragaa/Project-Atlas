import "reflect-metadata";
import { config as loadDotenv } from "dotenv";
import { ValidationPipe } from "@nestjs/common";

// Load .env into process.env before any configuration is read. The monorepo's
// single .env lives at the repository root (blueprint/19 - DevOps.md:
// configuration is external to the build).
loadDotenv({ path: [".env", "../../.env"] });

import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module.js";
import { corsOrigins, loadEnvironment } from "./config/environment.js";
import { ProblemDetailsFilter } from "./shared/http/problem-details.filter.js";

/**
 * API bootstrap. Applies secure-by-default cross-cutting concerns: strict
 * validation (blueprint/16 input validation), RFC 7807 errors (doc 14), CORS
 * restricted to configured origins (no wildcards — doc 16), structured logging
 * (doc 21), and graceful shutdown (doc 20 "Graceful Shutdown").
 */
async function bootstrap(): Promise<void> {
  const env = loadEnvironment(process.env);

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new ProblemDetailsFilter());

  app.enableCors({
    origin: corsOrigins(env),
    credentials: true,
  });

  app.enableShutdownHooks();

  await app.listen(env.API_PORT, env.API_HOST);
}

void bootstrap();
