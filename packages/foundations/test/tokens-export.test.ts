import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { oklchToHex } from "../scripts/export-tokens.mjs";

const ROOT = join(__dirname, "..");

type Layer = { when: Record<string, string>; maxWidth?: number; tokens: Record<string, unknown> };
const doc = JSON.parse(readFileSync(join(ROOT, "tokens/once-ui.tokens.json"), "utf8")) as {
  format: string;
  layers: Layer[];
};

const layer = (when: Record<string, string>) =>
  doc.layers.find((l) => JSON.stringify(l.when) === JSON.stringify(when) && !l.maxWidth);

describe("token export", () => {
  it("matches the SCSS — a stale checked-in file fails CI", () => {
    expect(() =>
      execFileSync("node", ["scripts/export-tokens.mjs", "--check"], { cwd: ROOT }),
    ).not.toThrow();
  });

  it("converts OKLCH to sRGB hex", () => {
    expect(oklchToHex(1, 0, 0)).toBe("#ffffff");
    expect(oklchToHex(0, 0, 0)).toBe("#000000");
    // oklch(0.6279 0.2577 29.23) is CSS red #ff0000.
    expect(oklchToHex(0.6279554, 0.2576833, 29.2338851)).toBe("#ff0000");
    expect(oklchToHex(1, 0, 0, 0.5)).toBe("#ffffff80");
  });

  it("keeps the cascade the web reads", () => {
    expect(doc.format).toBe("once-ui-tokens");
    // A scheme step, as a colour.
    expect(doc.layers[0].tokens["scheme-blue-500"]).toMatch(/^#[0-9a-f]{6}$/);
    // A brand picks its scheme, a theme points semantic tokens at function steps.
    expect(layer({ brand: "blue" })?.tokens["function-brand-500"]).toBe("{scheme-blue-500}");
    expect(layer({ theme: "dark" })?.tokens["brand-background-strong"]).toBe(
      "{function-brand-300}",
    );
    expect(layer({ theme: "light", solid: "color" })?.tokens["brand-solid-strong"]).toBe(
      "{function-brand-600}",
    );
    // Lengths keep their unit, since rem follows the device font size.
    expect(layer({ border: "playful" })?.tokens["radius-m"]).toBe("0.75rem");
    // Phones get the `s` breakpoint's responsive spacing.
    const s = doc.layers.find((l) => l.maxWidth === 768 && "responsive-space-m" in l.tokens);
    expect(s?.tokens["responsive-space-m"]).toBe("{static-space-12}");
  });

  it("drops rules that style elements rather than set tokens", () => {
    for (const l of doc.layers) {
      for (const key of Object.keys(l.when)) expect(key).toMatch(/^[a-zA-Z]+$/);
    }
  });
});
