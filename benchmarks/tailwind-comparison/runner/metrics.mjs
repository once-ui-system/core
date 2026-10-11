#!/usr/bin/env node
// Code-size metrics (METHODOLOGY.md §4.3) for every accepted run in a results folder.
//
//   node runner/metrics.mjs --results results/pilot
//
// Normalisation: strip comments (TypeScript printer), then Prettier defaults.
// Tokens here are PROXY counts (lib.mjs). The full run replaces them with
// count_tokens results when ANTHROPIC_API_KEY is set (--exact).

import fs from "node:fs";
import path from "node:path";
import * as prettier from "prettier";
import ts from "typescript";
import { ROOT, armById, listFiles, proxyTokens } from "./lib.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};

export async function normalise(code, file = "page.tsx") {
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const stripped = ts.createPrinter({ removeComments: true }).printFile(sf);
  return prettier.format(stripped, { parser: "typescript" });
}

export function sizes(code) {
  return {
    lines: code.split("\n").filter((l) => l.trim()).length,
    chars: [...code].length,
    bytes: Buffer.byteLength(code),
    ...Object.fromEntries(Object.entries(proxyTokens(code)).map(([k, v]) => [`tokens_${k}`, v])),
  };
}

// shadcn: transitive closure of project-local imports from the page.
export function vendoredClosure(code, projectRoot) {
  const seen = new Set();
  const queue = [code];
  while (queue.length) {
    const src = queue.pop();
    for (const m of src.matchAll(/from\s+["']@\/([^"']+)["']/g)) {
      const base = path.join(projectRoot, m[1]);
      const file = [".tsx", ".ts", "/index.tsx", "/index.ts"].map((e) => base + e).find((f) => fs.existsSync(f));
      if (!file || seen.has(file)) continue;
      seen.add(file);
      queue.push(fs.readFileSync(file, "utf8"));
    }
  }
  return [...seen].sort();
}

const COMPONENT_IMPORT = {
  A: /from\s+["']@once-ui-system\/core(?:\/[\w-]+)?["']/,
  B: /from\s+["']@once-ui-system\/core(?:\/[\w-]+)?["']/,
  C: /from\s+["']@\/components\/ui\/[\w-]+["']/,
  D: null,
};

// Distinct library components/identifiers imported by the page (descriptive only).
function importedNames(code, letter) {
  const re = COMPONENT_IMPORT[letter];
  if (!re) return [];
  const names = new Set();
  for (const m of code.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']([^"']+)["']/g)) {
    if (!re.test(`from "${m[2]}"`)) continue;
    for (const n of m[1].split(",")) {
      const name = n.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0];
      if (name && /^[A-Z]/.test(name)) names.add(name);
    }
  }
  return [...names].sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const resultsDir = path.resolve(arg("results", "results/pilot"));
  const runs = listFiles(path.join(resultsDir, "raw"))
    .filter((f) => f.endsWith("run.json"))
    .map((f) => path.join(resultsDir, "raw", path.dirname(f)));
  for (const dir of runs) {
    const run = JSON.parse(fs.readFileSync(path.join(dir, "run.json"), "utf8"));
    if (run.status !== "accepted") continue;
    const { letter, scaffold } = armById(path.basename(path.dirname(dir)));
    const raw = fs.readFileSync(path.join(dir, `attempt-${run.accepted_attempt}.tsx`), "utf8");
    const norm = await normalise(raw);
    const out = {
      attempt: run.accepted_attempt,
      tokenizer: "proxy",
      normalised: sizes(norm),
      raw: sizes(raw),
      components: importedNames(raw, letter),
    };
    if (letter === "C") {
      const files = vendoredClosure(raw, path.join(ROOT, "arms", scaffold));
      const parts = await Promise.all(files.map((f) => normalise(fs.readFileSync(f, "utf8"), f)));
      out.vendored = {
        files: files.map((f) => path.relative(path.join(ROOT, "arms", scaffold), f)),
        ...sizes(parts.join("\n")),
      };
    }
    fs.writeFileSync(path.join(dir, "metrics.json"), JSON.stringify(out, null, 2));
    console.log(
      `${path.relative(resultsDir, dir).padEnd(34)} lines=${out.normalised.lines} tok=${out.normalised.tokens_o200k}${out.vendored ? ` vendored=${out.vendored.lines}L/${out.vendored.files.length}f` : ""}`,
    );
  }
}
