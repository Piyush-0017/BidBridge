const { execSync } = require("child_process");

// Fallback environment variables for build time validation
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  "fallback_secret_for_build_time_validation_32chars_long";

console.log("--> Running Prisma Generate...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (e) {
  console.warn("Prisma generate warning:", e.message);
}

console.log("--> Running Next.js Build...");
execSync("npx next build", { stdio: "inherit" });
