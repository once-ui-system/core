#!/usr/bin/env node
// Checks that arm A's sandbox holds the 2.1.0 harness fix found by the pilot
// (icon names out of spec.json), before any paid run. Run after setup.mjs.
//
//   node runner/check-harness.mjs              → exit 0 if every check passes, 1 otherwise
//   node runner/check-harness.mjs --ai <dir>   → check another ai/ folder (e.g. a built package)

import fs from "node:fs";
import path from "node:path";
import { WORK } from "./lib.mjs";

const i = process.argv.indexOf("--ai");
const ai = i > 0 ? path.resolve(process.argv[i + 1]) : path.join(WORK, "sandbox/once-harness/docs/ai");
const read = (f) => fs.readFileSync(path.join(ai, f), "utf8");
const catalog = JSON.parse(read("catalog.json"));
const spec = JSON.parse(read("spec.json"));
const gotchas = JSON.parse(read("gotchas.json"));
const compact = read("rules.compact.md");
const rules = read("rules.md");

const same = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);
const checks = [
  ["catalog.json has a top-level iconNames array", Array.isArray(catalog.iconNames) && catalog.iconNames.length > 0],
  ["catalog.json iconNames equals spec.json iconNames", same(catalog.iconNames, spec.iconNames)],
  ["rules.compact.md sends icon names to `iconNames` in `catalog.json`", /`iconNames` in `catalog\.json`/.test(compact)],
  ["rules.compact.md no longer says take names from `spec.json`", !/take names from `spec\.json`/.test(compact)],
  ["rules.md rule 14b points at catalog.json", /14b\.[^\n]*iconNames[^\n]*catalog\.json/.test(rules)],
  ["rules.md rule 31 points at catalog.json", /\n31\.[\s\S]{0,400}catalog\.json/.test(rules)],
  ["gotchas Icon.names points at catalog.json", /iconNames in catalog\.json/.test(gotchas["Icon.names"]?.rule ?? "")],
];
let ok = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? "ok  " : "FAIL"} ${name}`);
  ok &&= pass;
}
console.log(`iconNames: ${catalog.iconNames?.length ?? 0}`);
process.exit(ok ? 0 : 1);
