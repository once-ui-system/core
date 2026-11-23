import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  customSchemeProperties,
  generateColorScheme,
  generateSeededScheme,
  schemeAlphaVariants,
} from "../utils/colorScheme";

/** Parse the shipped token file so the test measures against real schemes. */
function builtInSchemes() {
  const src = readFileSync(join(__dirname, "../../../foundations/scss/tokens/scheme.scss"), "utf8");
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

/** WCAG contrast of an `oklch()` or `#hex` colour against white. */
function contrastOnWhite(value: string) {
  let rgb: number[];
  if (value.startsWith("#")) {
    const n = Number.parseInt(value.slice(1, 7), 16);
    rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
    rgb = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  } else {
    const [l, c, h] = parse(value);
    const a = c * Math.cos((h * Math.PI) / 180);
    const b = c * Math.sin((h * Math.PI) / 180);
    const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    rgb = [
      4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
      -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
      -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
    ].map((ch) => Math.min(1, Math.max(0, ch)));
  }
  const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return 1.05 / (lum + 0.05);
}

describe("generateSeededScheme", () => {
  // Teal from the benchmark's brand pilot, a pale yellow, a near-black indigo, Once UI blue.
  const seeds = ["#0F766E", "#FACC15", "#1E1B4B", "#5A93FC", "#E11D48"];

  it.each(seeds)("puts %s itself at step 500, the step solids use", (seed) => {
    expect(generateSeededScheme(seed)?.[500]).toBe(seed);
  });

  it.each(seeds)("keeps the ramp dark to light around %s", (seed) => {
    const scheme = generateSeededScheme(seed)!;
    const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200] as const;
    const onWhite = steps.map((step) => contrastOnWhite(scheme[step]));
    for (let i = 1; i < onWhite.length; i++) expect(onWhite[i]).toBeLessThan(onWhite[i - 1] + 1e-6);
  });

  it.each(seeds)("keeps light-theme brand text (step 400) at AA on white for %s", (seed) => {
    expect(contrastOnWhite(generateSeededScheme(seed)![400])).toBeGreaterThanOrEqual(4.5);
  });

  it("writes a seed with alpha as an opaque step 500", () => {
    expect(generateSeededScheme("#0F766ECC")?.[500]).toMatch(/^oklch\([^/]+\)$/);
  });

  it("is what a brand seed produces", () => {
    expect(customSchemeProperties({ brand: "#0F766E" })["--scheme-brand-500"]).toBe("#0F766E");
  });

  it("warns once when a scale is written lightest first", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const tailwindOrder = { 100: "#F0FDFA", 600: "#0F766E", 1200: "#052120" };
    customSchemeProperties({}, { accent: tailwindOrder });
    customSchemeProperties({}, { accent: tailwindOrder });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("dark to light");
    warn.mockClear();
    customSchemeProperties({}, { neutral: { 100: "#052120", 600: "#0F766E", 1200: "#F0FDFA" } });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("customSchemeProperties on-solid text", () => {
  it("gives a light seed dark text and rests its solid on the seed", () => {
    const props = customSchemeProperties({ brand: "#d4f43c", accent: "#facc15" });
    // A pale cyan and a mint, too.
    for (const seed of ["#22d3ee", "#6ee7b7"]) {
      expect(customSchemeProperties({ brand: seed })["--scheme-brand-on-solid-strong"]).toBe(
        "var(--static-black)",
      );
    }
    for (const name of ["brand", "accent"]) {
      expect(props[`--scheme-${name}-on-solid-strong`]).toBe("var(--static-black)");
      expect(props[`--scheme-${name}-on-solid-medium`]).toBe(`var(--scheme-${name}-100)`);
      expect(props[`--scheme-${name}-on-solid-weak`]).toBe(`var(--scheme-${name}-200)`);
      expect(props[`--scheme-${name}-solid-medium`]).toBe(`var(--scheme-${name}-500)`);
      expect(props[`--scheme-${name}-solid-strong`]).toMatch(/^oklch\(/);
    }
  });

  it("leaves dark and mid-tone seeds on white text", () => {
    for (const seed of [
      "#2563eb",
      "#5a93fc",
      "#7c3aed",
      "#f97316",
      "#10b981",
      "#0ea5e9",
      "#dc2626",
    ]) {
      const props = customSchemeProperties({ brand: seed });
      expect(Object.keys(props).some((key) => key.includes("solid"))).toBe(false);
    }
  });

  it("never touches the neutral scheme", () => {
    const props = customSchemeProperties({ neutral: "#f5f5f4" });
    expect(Object.keys(props).some((key) => key.includes("solid"))).toBe(false);
  });

  it("keeps a pinned scale's own solids and only picks the text", () => {
    const props = customSchemeProperties(
      { brand: "#d4f43c" },
      { brand: { 400: "#d4f43c", 500: "#e2fb73" } },
    );
    expect(props["--scheme-brand-on-solid-strong"]).toBe("var(--static-black)");
    expect(props["--scheme-brand-solid-medium"]).toBeUndefined();
    expect(props["--scheme-brand-solid-strong"]).toBeUndefined();
  });

  it("writes keys foundations reads back, with white as the fallback", () => {
    const theme = readFileSync(
      join(__dirname, "../../../foundations/scss/tokens/theme.scss"),
      "utf8",
    );
    expect(theme).toContain("var(--function-brand-on-solid-strong, var(--static-white))");
    expect(theme).toContain("var(--function-brand-solid-medium, var(--function-brand-400))");
    const fn = readFileSync(
      join(__dirname, "../../../foundations/scss/tokens/function.scss"),
      "utf8",
    );
    expect(fn).toContain("--function-brand-on-solid-strong: var(--scheme-brand-on-solid-strong);");
  });
});
