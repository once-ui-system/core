import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BREAKPOINTS,
  BREAKPOINTS_CASCADE,
  OFFSET_SIDES,
  OFFSET_TOKENS,
  POSITION_VALUES,
  SPACING_FAMILIES,
  SPACING_TOKENS,
  offsetValue,
  spacingVar,
} from "../scripts/utilities.spec.mjs";

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
    // A tripwire, not a tautology: the numbers are the public class surface,
    // so growing or shrinking the matrix should be a deliberate, visible edit.
    expect(SPACING_FAMILIES.length).toBe(15);
    expect(SPACING_TOKENS.length).toBe(24);
    expect(SPACING_FAMILIES.length * SPACING_TOKENS.length).toBe(360);
  });

  it("carries every token the layout layer defines", () => {
    // `--static-space-72` shipped as a token with no utility class in any
    // family — the mirror of the `mx-48` drift, and just as invisible.
    const layout = readFileSync(join(ROOT, "scss/tokens/layout.scss"), "utf8");
    const defined = [...layout.matchAll(/--static-space-(\d+):/g)].map((m) => m[1]);
    const missing = defined.filter((t) => !SPACING_TOKENS.includes(t));
    expect(missing).toEqual([]);
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
    expect(index).toContain('@use "./position.generated.scss";');
    expect(index).not.toMatch(/@use "\.\/position\.scss"/);
  });

  /**
   * A generator cannot read a Sass variable, so the breakpoint widths are
   * stated twice — in the spec and in breakpoints.scss, which components still
   * `@include`. If they drift, generated utilities and component styles switch
   * at different widths and the layout tears mid-resize.
   */
  it("is the source breakpoints.scss is generated from", () => {
    const scss = readFileSync(join(ROOT, "scss/styles/breakpoints.scss"), "utf8");
    for (const { key, maxWidth } of BREAKPOINTS) {
      expect(scss, `$breakpoint-${key}`).toContain(`$breakpoint-${key}: ${maxWidth};`);
      // Ten call sites `@include` these by name, core components included.
      expect(scss, `mixin ${key}`).toContain(`@mixin ${key} {`);
    }
  });

  it("emits breakpoint rules widest first so the narrow one wins", () => {
    // Every step is a max-width query, so all of them match on a phone and the
    // last one in the file decides. Ascending order would let `.l-` overrule
    // `.xs-` — backwards, and only visible on a small screen.
    const css = readFileSync(join(ROOT, "scss/styles/position.generated.scss"), "utf8");
    const order = [...css.matchAll(/@media \(max-width: (\d+)px\)/g)].map((m) => Number(m[1]));
    expect(order).toEqual([...order].sort((a, b) => b - a));
    expect(BREAKPOINTS_CASCADE.map((b) => b.key)).toEqual(["l", "m", "s", "xs"]);
  });

  it("repeats every position rule at every breakpoint", () => {
    const css = readFileSync(join(ROOT, "scss/styles/position.generated.scss"), "utf8");
    const expected = POSITION_VALUES.length + OFFSET_SIDES.length * OFFSET_TOKENS.length;
    for (const { key } of BREAKPOINTS) {
      const found = (css.match(new RegExp(`\\.${key}-(position|top|left|bottom|right)-`, "g")) || []).length;
      expect(found, `breakpoint ${key}`).toBe(expected);
    }
  });

  it("writes a bare 0 for offsets and a token for spacing", () => {
    // position.scss wrote `top: 0`, spacing.scss wrote `var(--static-space-0)`.
    // Identical in the browser, but reproducing each exactly is what made the
    // switch to generated output provable rather than merely plausible.
    expect(offsetValue("0")).toBe("0");
    expect(offsetValue("16")).toBe("var(--static-space-16)");
    expect(spacingVar("0")).toBe("var(--static-space-0)");
  });

  it("gives offsets the numeric steps only", () => {
    // A t-shirt size scales with the viewport; an offset that moved when the
    // viewport did would fight the breakpoint variants around it.
    expect(OFFSET_TOKENS).not.toContain("m");
    expect(OFFSET_TOKENS.every((t) => /^\d+$/.test(t))).toBe(true);
    expect(SPACING_TOKENS).toContain("m");
  });
});
