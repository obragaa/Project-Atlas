import { z } from "zod";

/**
 * Validated environment configuration (blueprint/19 - DevOps.md: configuration
 * is external to the build; 16 - Security.md: secrets never in code). The app
 * fails fast at boot if configuration is invalid (fail-secure).
 *
 * Naming follows a single canonical family per concern (ADR/critique): the
 * `DATABASE_*` family for Postgres, `REDIS_*` for Redis. No duplicate knobs.
 */
const environmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    API_PORT: z.coerce.number().int().positive().default(3333),
    API_HOST: z.string().default("0.0.0.0"),
    API_CORS_ORIGINS: z.string().default("http://localhost:3000"),

    // ── Database (blueprint/13, 17) ──
    // Driver selection is explicit so tests/local can force the in-process
    // PGlite engine without NODE_ENV side effects.
    DATABASE_DRIVER: z.enum(["postgres", "pglite"]).default("postgres"),
    DATABASE_URL: z.string().url().optional(),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
    DATABASE_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
    DATABASE_IDLE_TIMEOUT_MS: z.coerce.number().int().nonnegative().default(30_000),
    DATABASE_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
    DATABASE_SSL: z.coerce.boolean().default(false),
    // Run migrations automatically at boot — only safe in dev/test (a dedicated
    // advisory-locked deploy step owns prod migrations to avoid multi-instance
    // races, doc 12). Default off.
    DATABASE_AUTO_MIGRATE: z.coerce.boolean().default(false),

    // ── Redis (blueprint/17) — cache, sessions, rate limiting ──
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
    REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
    REDIS_COMMAND_TIMEOUT_MS: z.coerce.number().int().positive().default(2_000),
    // Driver for the session store: redis (real) or memory (tests/local without
    // a Redis instance), mirroring DATABASE_DRIVER.
    SESSION_DRIVER: z.enum(["redis", "memory"]).default("redis"),

    // ── Health / lifecycle (blueprint/20, 21) ──
    READINESS_CHECK_TIMEOUT_MS: z.coerce.number().int().positive().default(1_000),
    SHUTDOWN_DRAIN_MS: z.coerce.number().int().nonnegative().default(10_000),

    // ── Authentication (blueprint/15) ──
    AUTH_ACCESS_TOKEN_SECRET: z.string().min(16),
    AUTH_REFRESH_TOKEN_SECRET: z.string().min(16),
    AUTH_ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(900),
    AUTH_REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(2_592_000),
    // Optional server-side pepper mixed into the refresh-token at-rest hash, so
    // a Redis dump alone cannot forge a match (doc 16 Secrets).
    AUTH_REFRESH_HASH_PEPPER: z.string().min(16).optional(),
    // Namespace prefix for session/cache Redis keys (multi-env safety).
    AUTH_SESSION_KEY_PREFIX: z.string().default("atlas"),
    // Cap on concurrent active sessions per user; 0 = unlimited (doc 15).
    AUTH_MAX_SESSIONS_PER_USER: z.coerce.number().int().nonnegative().default(0),

    // ── Atlas AI (blueprint/22 - AI Engineering.md, ADR-0002/0007) ──
    // Provider-agnostic gateway. `mock` runs with no key (default); `anthropic`
    // uses Claude via the AI_ANTHROPIC_API_KEY. Tiers/models are config, not code.
    AI_PROVIDER: z.enum(["mock", "anthropic"]).default("mock"),
    AI_ANTHROPIC_API_KEY: z.string().optional(),
    AI_DEFAULT_MODEL: z.string().default("claude-haiku-4-5"),
    /** Output-token ceiling per AI turn (cost/safety, doc 22). */
    AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(1024),

    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
    OTEL_SERVICE_NAME: z.string().default("atlas-api"),
  })
  // Fail-secure: selecting the Anthropic provider requires a key (doc 16).
  .refine((env) => env.AI_PROVIDER !== "anthropic" || Boolean(env.AI_ANTHROPIC_API_KEY), {
    message: "AI_ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic",
    path: ["AI_ANTHROPIC_API_KEY"],
  })
  // Fail-secure: in postgres mode a real DATABASE_URL is mandatory (doc 16).
  .refine((env) => env.DATABASE_DRIVER !== "postgres" || Boolean(env.DATABASE_URL), {
    message: "DATABASE_URL is required when DATABASE_DRIVER=postgres",
    path: ["DATABASE_URL"],
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
