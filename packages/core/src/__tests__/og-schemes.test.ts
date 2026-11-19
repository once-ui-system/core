import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { OG_SCHEMES } from "../next/ogSchemes";
import { oklchToRgb, toHex } from "../utils/colorMath";

/** The OG images' hex schemes stay in step with the foundations' oklch tokens. */
describe("OG_SCHEMES", () => {
  const scss = readFileSync(
    join(__dirname, "../../../foundations/scss/tokens/scheme.scss"),
    "utf8",
  );

  it("matches every scheme and step in foundations", () => {
    const names = [...new Set([...scss.matchAll(/--scheme-([a-z]+)-500:/g)].map((m) => m[1]))];
    expect(Object.keys(OG_SCHEMES).sort()).toEqual(names.sort());
    for (const [name, steps] of Object.entries(OG_SCHEMES)) {
      for (const [step, hex] of Object.entries(steps)) {
        const m = scss.match(
          new RegExp(`--scheme-${name}-${step}:\\s*oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`),
        );
        if (!m) throw new Error(`${name}-${step} is missing from scheme.scss`);
        const [l, c, h] = m.slice(1).map(Number);
        expect(toHex(oklchToRgb(l, c, h)), `${name}-${step}`).toBe(hex);
      }
    }
  });
});
