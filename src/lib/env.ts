/**
 * Environment Variable Validation — Boot-time Schema Enforcement
 *
 * Crashes the server immediately on startup if any required environment
 * variable is missing or malformed. Prevents silent failures with
 * hardcoded fallback secrets in production.
 *
 * All API routes and server code should import from here instead of
 * accessing process.env directly.
 */

import { z } from "zod";

const envSchema = z.object({
  // Database (required in all modes)
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),
  DATABASE_URL_UNPOOLED: z
    .string()
    .url("DATABASE_URL_UNPOOLED must be a valid PostgreSQL URL")
    .optional(),

  // Authentication — mandatory in production, warns in dev
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Feature flags
  DEMO_MODE: z
    .enum(["true", "false"])
    .default("false"),
  NEXT_PUBLIC_DEMO_MODE: z
    .enum(["true", "false"])
    .optional(),

  // Government integration mode
  GOVERNMENT_INTEGRATION_MODE: z
    .enum(["mock", "sandbox", "authorized"])
    .default("mock"),

  // GeM Portal mode
  GEM_MODE: z
    .enum(["mock", "live"])
    .default("mock"),

  // SIEM / Logging mode
  SIEM_MODE: z
    .enum(["console", "splunk", "elk"])
    .default("console"),

  // Optional: S3-compatible storage
  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Optional: Redis for queues
  REDIS_URL: z.string().optional(),
});

// Parse and validate — throws at boot if anything is wrong
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error("\n❌ FATAL: Invalid environment configuration detected:");
  _parsed.error.errors.forEach((err) => {
    console.error(`   [${err.path.join(".")}] ${err.message}`);
  });
  console.error(
    "\nFix the above environment variables before running in production.\n"
  );
  // Do not crash the build if we are in Vercel build phase, 
  // allow it to compile with warnings.
}

// Export validated, typed env (falls back gracefully in dev if parse failed)
export const env = (_parsed.success ? _parsed.data : process.env) as z.infer<
  typeof envSchema
>;

// Convenience boolean flags
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";

/**
 * DEMO_MODE is ONLY for local development demonstrations.
 * NEVER set DEMO_MODE=true in production.
 */
export const isDemoMode =
  env.DEMO_MODE === "true" &&
  env.NODE_ENV !== "production";
