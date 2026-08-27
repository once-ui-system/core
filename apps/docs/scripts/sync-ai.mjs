/**
 * Syncs the AI harness from @once-ui-system/core into public/ai so the docs
 * host serves the same artifacts the npm package ships. public/ai is
 * gitignored; this script is the sync step the ignore file promises. Runs
 * before dev and build (see package.json predev/prebuild).
 */
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "..", "..", "..", "packages", "core", "ai");
const target = join(here, "..", "public", "ai");

if (!existsSync(source)) {
  console.error(`sync-ai: source not found: ${source}`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log(`sync-ai: copied packages/core/ai -> public/ai`);
