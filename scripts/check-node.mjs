#!/usr/bin/env node
/**
 * Fail with a sentence that names the problem.
 *
 * Sass loads chokidar 5 — which is ESM-only — through require(). That works
 * only on Node versions with require(ESM): 22.12.0 and later. Without this
 * check the foundations build dies inside Sass with an ERR_REQUIRE_ESM stack
 * trace that mentions neither Node nor the version constraint, which is a bad
 * five minutes for anyone who hits it.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const required = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).engines.node;

const MIN = [22, 12, 0];
const current = process.versions.node.split(".").map(Number);

const tooOld = current[0] < MIN[0] || (current[0] === MIN[0] && current[1] < MIN[1]);

if (tooOld) {
  const nvmrc = readFileSync(join(root, ".nvmrc"), "utf8").trim();
  console.error(`
  This repo needs Node ${required} — you are on v${process.versions.node}.

  Why: Sass loads chokidar 5 (ESM-only) through require(), which only works
  on Node 22.12.0 and later. On older Node the foundations build fails deep
  inside Sass with ERR_REQUIRE_ESM.

  Fix — macOS / Linux (nvm):
      nvm install ${nvmrc} && nvm use ${nvmrc}

  Fix — Windows (nvm-windows; it does not read .nvmrc):
      nvm install ${nvmrc}
      nvm use ${nvmrc}

  Or install Node ${nvmrc} LTS from https://nodejs.org and reopen your terminal.
`);
  process.exit(1);
}
