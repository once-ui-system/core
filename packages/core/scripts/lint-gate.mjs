/**
 * Lint no-regression gate: Biome may report no more errors than the count
 * recorded in `lint-baseline.json`.
 *
 * The package still carries lint errors from before the gate existed, so
 * `biome check .` cannot be a pass/fail step yet. The gate holds the line
 * instead: the count may only go down, and whoever lowers it records the new
 * number so it cannot creep back up.
 *
 * Run:  pnpm lint:gate            compare with the baseline (CI does this)
 *       pnpm lint:gate --update   record a lower count after fixing errors
 *
 * `--update` refuses to raise the baseline. Accepting more errors is a
 * decision for review, so it has to be a visible hand edit of the JSON file.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const PACKAGE_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASELINE_FILE = path.join(PACKAGE_ROOT, "lint-baseline.json");
const update = process.argv.includes("--update");

/** Every error Biome reports for the package, counted in total and per rule. */
function measure() {
  const biome = path.join(
    path.dirname(require.resolve("@biomejs/biome/package.json")),
    "bin/biome",
  );
  const result = spawnSync(
    process.execPath,
    [biome, "check", ".", "--reporter=json", "--diagnostic-level=error", "--max-diagnostics=none"],
    { cwd: PACKAGE_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  // Biome exits 1 whenever it finds errors, which is expected here; only
  // output that is not a report means the check itself failed.
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    console.error("lint-gate: Biome did not produce a JSON report.");
    console.error(result.stderr || result.stdout);
    process.exit(2);
  }

  const rules = {};
  for (const diagnostic of report.diagnostics) {
    if (diagnostic.severity !== "error") continue;
    rules[diagnostic.category] = (rules[diagnostic.category] ?? 0) + 1;
  }
  const sorted = Object.fromEntries(Object.entries(rules).sort(([a], [b]) => a.localeCompare(b)));
  return { errors: report.summary.errors, rules: sorted };
}

function readBaseline() {
  try {
    return JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function writeBaseline(current) {
  const content = {
    $comment:
      "Biome error count for packages/core. CI fails if it rises. After fixing errors, run `pnpm lint:gate --update` to record the lower count.",
    ...current,
  };
  fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(content, null, 2)}\n`);
}

const current = measure();
const baseline = readBaseline();

if (update) {
  if (baseline && current.errors > baseline.errors) {
    console.error(
      `lint-gate: refusing to raise the baseline from ${baseline.errors} to ${current.errors} errors. ` +
        "Fix the new errors, or edit lint-baseline.json by hand so the increase is reviewed.",
    );
    process.exit(1);
  }
  writeBaseline(current);
  console.log(`lint-gate: baseline recorded at ${current.errors} errors.`);
  process.exit(0);
}

if (!baseline) {
  console.error("lint-gate: no lint-baseline.json; run `pnpm lint:gate --update` to create it.");
  process.exit(2);
}

if (current.errors > baseline.errors) {
  console.error(
    `lint-gate: ${current.errors} Biome errors, above the baseline of ${baseline.errors}. ` +
      "This change adds lint errors; run `pnpm lint` in packages/core to see them.",
  );
  // The per-rule counts point at what got worse, even when another rule's
  // count fell in the same change.
  const rules = new Set([...Object.keys(current.rules), ...Object.keys(baseline.rules ?? {})]);
  for (const rule of [...rules].sort()) {
    const now = current.rules[rule] ?? 0;
    const before = baseline.rules?.[rule] ?? 0;
    if (now > before) console.error(`  ${rule}: ${before} -> ${now}`);
  }
  process.exit(1);
}

if (current.errors < baseline.errors) {
  console.log(
    `lint-gate: ${current.errors} Biome errors, below the baseline of ${baseline.errors}. ` +
      "Run `pnpm lint:gate --update` and commit lint-baseline.json to lock in the improvement.",
  );
} else {
  console.log(`lint-gate: ${current.errors} Biome errors, at the baseline.`);
}
