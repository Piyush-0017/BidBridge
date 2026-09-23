const { execSync } = require("child_process");

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

console.log("--> Running Prisma Generate in postinstall...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (e) {
  console.warn("Prisma postinstall generate warning:", e.message);
}
