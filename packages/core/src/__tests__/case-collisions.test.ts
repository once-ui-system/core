import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Fails when two source modules differ only by letter case once the extension
 * is dropped (e.g. `internal/Reveal.tsx` and `internal/reveal.ts`). Both resolve
 * on Linux and in CI, but on Windows and macOS the second import hits the first
 * file and `tsc` stops with TS1149/TS1261, which broke the 3.0 first publish.
 */
const SRC = join(__dirname, "..");

function modules(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) modules(path, out);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      out.push(relative(SRC, path).replace(/\.[^./\\]+$/, ""));
    }
  }
  return out;
}

describe("source module names", () => {
  it("never differ only by case", () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const name of new Set(modules(SRC))) {
      const key = name.toLowerCase();
      const other = seen.get(key);
      if (other) clashes.push(`${other} <-> ${name}`);
      else seen.set(key, name);
    }
    expect(clashes).toEqual([]);
  });
});
