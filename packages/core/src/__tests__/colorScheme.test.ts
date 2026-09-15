import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { generateColorScheme, schemeAlphaVariants } from "../utils/colorScheme";

/** Parse the shipped token file so the test measures against real schemes. */
function builtInSchemes() {
  const src = readFileSync(
    join(__dirname, "../../../foundations/scss/tokens/scheme.scss"),
    "utf8",
  );
  const out: Record<string, Record<number, [number, number, number]>> = {};
  const re = /--scheme-([a-z]+)-(\d+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)\s*;/g;
  for (const m of src.matchAll(re)) {
    (out[m[1]] ??= {})[Number(m[2])] = [Number(m[3]), Number(m[4]), Number(m[5])];
  }
  return out;
}

const toLab = ([l, c, h]: [number, number, number]) =>
  [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)] as const;

function deltaE(a: [number, number, number], b: [number, number, number]) {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

const parse = (s: string): [number, number, number] => {
  const m = s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)/);
  if (!m) throw new Error(`unparseable: ${s}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};

describe("generateColorScheme", () => {
  const schemes = builtInSchemes();
  const chromatic = Object.entries(schemes).filter(([, steps]) => steps[600]?.[1] > 0.05);

  it("reads the built-in schemes", () => {
    expect(Object.keys(schemes).length).toBeGreaterThan(15);
    expect(chromatic.length).toBeGreaterThan(10);
  });

  it.each(chromatic.map(([name]) => name))(
    "regenerates %s from its own step 600 within tolerance",
    (name) => {
      const steps = schemes[name];
      const [l, c, h] = steps[600];
      const generated = generateColorScheme(`oklch(${l} ${c} ${h})`);
      expect(generated).not.toBeNull();

      let worst = 0;
      for (const weight of Object.keys(steps).map(Number)) {
        worst = Math.max(worst, deltaE(parse(generated![weight as 600]), steps[weight]));
      }
      // Measured ceiling across every built-in scheme; blue and indigo are the
      // furthest off because their real ramps are more saturated at step 400
      // than at 600, which no single-seed generator reproduces.
      expect(worst).toBeLessThan(0.13);
    },
  );

  it("keeps every generated step inside sRGB", () => {
    const generated = generateColorScheme("#5A93FC");
    for (const value of Object.values(generated!)) {
      const [l, c, h] = parse(value);
      const a = c * Math.cos((h * Math.PI) / 180);
      const b = c * Math.sin((h * Math.PI) / 180);
      const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
      const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
      const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
      for (const channel of [
        4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
        -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
        -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
      ]) {
        expect(channel).toBeGreaterThan(-0.002);
        expect(channel).toBeLessThan(1.002);
      }
    }
  });

  it("accepts hex, rgb and oklch, and rejects nonsense", () => {
    expect(generateColorScheme("#5A93FC")).not.toBeNull();
    expect(generateColorScheme("rgba(90, 147, 252, 0.8)")).not.toBeNull();
    expect(generateColorScheme("oklch(0.674 0.167 261.5)")).not.toBeNull();
    expect(generateColorScheme("not a colour")).toBeNull();
  });

  it("derives the three translucent variants of step 600", () => {
    const scheme = generateColorScheme("#5A93FC")!;
    const alphas = schemeAlphaVariants(scheme);
    expect(Object.keys(alphas)).toEqual(["600-15", "600-30", "600-50"]);
    expect(alphas["600-15"]).toContain("/ 0.15)");
  });
});
