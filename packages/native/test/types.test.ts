/// <reference types="node" />
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const CORE = join(__dirname, "../../core");
const NATIVE = readFileSync(join(__dirname, "../src/types.ts"), "utf8");

/** `export type Name = ...;` bodies from a TypeScript source, whitespace-normalised. */
function aliases(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of source.matchAll(/export type (\w+)\s*=\s*([^;]+);/g)) {
    out[m[1]] = m[2].replace(/\s+/g, " ").replace(/^\| /, "").trim();
  }
  return out;
}

const native = aliases(NATIVE);
const core = {
  ...aliases(readFileSync(join(CORE, "src/types.ts"), "utf8")),
  ...aliases(readFileSync(join(CORE, "src/contexts/ThemeProvider.tsx"), "utf8")),
  ...aliases(readFileSync(join(CORE, "src/utils/density.ts"), "utf8")),
};

describe("shared types", () => {
  it("declares every type the same way core does", () => {
    expect(Object.keys(native).length).toBeGreaterThan(20);
    for (const [name, body] of Object.entries(native)) {
      expect({ name, body: core[name] }).toEqual({ name, body });
    }
  });
});
