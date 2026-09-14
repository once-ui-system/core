import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SPACING_FAMILIES, SPACING_TOKENS, spacingVar } from "../scripts/utilities.spec.mjs";

const ROOT = join(__dirname, "..");
const GENERATED = join(ROOT, "scss/styles/spacing.generated.scss");

/**
 * `scss/styles/` was 5,789 hand-written lines with no loop in it, and the
 * matrix had drifted: every spacing family carried all 23 tokens except `mx`,
 * which was missing 48 and 56. Nobody reading 1,504 lines was going to catch
 * that. These tests guard the generated file against the same drift.
 */
describe("generated utilities", () => {
  it("matches the spec — a stale checked-in file fails CI", () => {
    // The generator's own --check mode, so the test and CI agree by construction.
    expect(() =>
      execFileSync("node", ["scripts/generate-utilities.mjs", "--check"], { cwd: ROOT }),
    ).not.toThrow();
  });

  it("carries every family at every token", () => {
    const css = readFileSync(GENERATED, "utf8");
    const missing: string[] = [];
    for (const { prefix } of SPACING_FAMILIES) {
      for (const token of SPACING_TOKENS) {
        if (!css.includes(`.${prefix}-${token} {`)) missing.push(`.${prefix}-${token}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("gives the whole matrix its expected size", () => {
    expect(SPACING_FAMILIES.length * SPACING_TOKENS.length).toBe(345);
  });

  it("scales t-shirt sizes with the viewport and never a numeric step", () => {
    // `--responsive-space-*` tracks the viewport; `--static-space-*` does not.
    // Swapping them silently rescales every margin in every app.
    expect(spacingVar("16")).toBe("var(--static-space-16)");
    expect(spacingVar("160")).toBe("var(--static-space-160)");
    expect(spacingVar("m")).toBe("var(--responsive-space-m)");
    expect(spacingVar("xl")).toBe("var(--responsive-space-xl)");
  });

  it("is the only spacing source the entrypoint pulls in", () => {
    const index = readFileSync(join(ROOT, "scss/styles/index.scss"), "utf8");
    expect(index).toContain('@use "./spacing.generated.scss";');
    expect(index).not.toMatch(/@use "\.\/spacing\.scss"/);
  });
});
