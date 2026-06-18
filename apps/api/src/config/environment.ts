import { z } from "zod";

/**
 * Validated environment configuration (blueprint/19 - DevOps.md: configuration
 * is external to the build; 16 - Security.md: secrets never in code). The app
 * fails fast at boot if configuration is invalid (fail-secure).
 */
const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  API_PORT: z.coerce.number().int().positive().default(3333),
  API_HOST: z.string().default("0.0.0.0"),
  API_CORS_ORIGINS: z.string().default("http://localhost:3000"),

  AUTH_ACCESS_TOKEN_SECRET: z.string().min(16),
  AUTH_REFRESH_TOKEN_SECRET: z.string().min(16),
  AUTH_ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(900),
  AUTH_REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(2_592_000),

  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  OTEL_SERVICE_NAME: z.string().default("atlas-api"),
});

export type Environment = z.infer<typeof environmentSchema>;

/**
 * Parses and validates `process.env`. Throws a readable error listing every
 * invalid/missing variable rather than failing later at runtime.
 */
export function loadEnvironment(source: NodeJS.ProcessEnv): Environment {
  const result = environmentSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

export const corsOrigins = (env: Environment): string[] =>
  env.API_CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
