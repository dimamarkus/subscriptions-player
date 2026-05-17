#!/usr/bin/env node
// Runs `drizzle-kit migrate` unless we are inside a non-production Vercel build.
// Preview deploys on Vercel currently share the production DATABASE_URL, so we
// intentionally skip them to avoid mutating production from a PR branch.
import { spawnSync } from "node:child_process";

const vercelEnv = process.env.VERCEL_ENV;

if (vercelEnv && vercelEnv !== "production") {
  console.log(
    `[apply-pending-migrations] Skipping drizzle-kit migrate on Vercel env "${vercelEnv}".`,
  );
  process.exit(0);
}

const context = vercelEnv ? `vercel ${vercelEnv}` : "local";

console.log(
  `[apply-pending-migrations] Running drizzle-kit migrate (${context}).`,
);

const result = spawnSync("drizzle-kit", ["migrate"], {
  stdio: "inherit",
  shell: true,
});

if (result.error) {
  console.error(
    "[apply-pending-migrations] Failed to spawn drizzle-kit:",
    result.error,
  );
  process.exit(1);
}

process.exit(result.status ?? 1);
