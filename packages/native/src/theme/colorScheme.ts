/**
 * Core's `utils/colorScheme.ts`: a 12-step Once UI colour ramp from one seed
 * colour, anchored to contrast against black. The maths is the same; the
 * output is hex, because React Native does not parse `oklch()`. See core's
 * file for how the ramp was measured against the built-in schemes.
 */

export type SchemeRampWeight =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 1000
  | 1100
  | 1200;

export type SchemeRamp = Record<SchemeRampWeight, string>;

/** Contrast against black for each step, matching the built-in schemes. */
export const defaultContrastRatios: [SchemeRampWeight, number][] = [
  [100, 1.05],
  [200, 1.15],
  [300, 2],
  [400, 3],
  [500, 4.5],
  [600, 7],
  [700, 10],
  [800, 14],
  [900, 16],
  [1000, 18],
  [1100, 19],
  [1200, 20],
];

type Lch = { l: number; c: number; h: number };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function parseSeed(input: string): Lch | null {
  const value = input.trim();

  const oklch = value.match(
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)$/i,
  );
  if (oklch) {
    const l = oklch[1].endsWith("%") ? parseFloat(oklch[1]) / 100 : parseFloat(oklch[1]);
    return { l, c: parseFloat(oklch[2]), h: parseFloat(oklch[3]) };
  }

  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const parts = rgb[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(parseFloat);
    if (parts.length >= 3) return srgbToOklch(parts[0] / 255, parts[1] / 255, parts[2] / 255);
  }

  let hex = value.replace(/^#/, "");
  if (hex.length === 3 || hex.length === 4)
    hex = hex
      .split("")
      .map((d) => d + d)
      .join("");
  if (hex.length === 6 || hex.length === 8) {
    const n = Number.parseInt(hex.slice(0, 6), 16);
    if (!Number.isNaN(n)) {
      return srgbToOklch(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
    }
  }
  return null;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function srgbToOklch(r: number, g: number, b: number): Lch {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
}

/** Linear sRGB, which may fall outside 0–1 when the colour is out of gamut. */
function oklchToLinearSrgb({ l: L, c, h }: Lch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (lch: Lch) =>
  oklchToLinearSrgb(lch).every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

/** The most chroma this hue and lightness can carry inside sRGB. */
function fitChroma(lch: Lch): Lch {
  if (inGamut(lch)) return lch;
  let low = 0;
  let high = lch.c;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (inGamut({ ...lch, c: mid })) low = mid;
    else high = mid;
  }
  return { ...lch, c: low };
}

/** WCAG relative luminance, which is what a contrast ratio is built from. */
function luminance(lch: Lch): number {
  const [r, g, b] = oklchToLinearSrgb(lch).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrastAgainstBlack = (lch: Lch) => (luminance(lch) + 0.05) / 0.05;

/** The lightness whose contrast against black is closest to `ratio`. */
function lightnessForContrast(ratio: number, c: number, h: number): number {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (contrastAgainstBlack(fitChroma({ l: mid, c, h })) < ratio) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const hex2 = (n: number) =>
  Math.round(clamp01(n) * 255)
    .toString(16)
    .padStart(2, "0");

// Hex rather than core's oklch(): React Native's colour parser has no oklch().
const format = (lch: Lch, alpha?: number) =>
  `#${oklchToLinearSrgb(lch)
    .map((channel) => hex2(toGamma(clamp01(channel))))
    .join("")}${alpha === undefined ? "" : hex2(alpha)}`;

/**
 * Build a scheme from a seed colour. Accepts hex, `rgb()`/`rgba()` or
 * `oklch()` — which covers what `ColorInput` produces with and without
 * `supportAlpha`. Returns `null` if the seed cannot be parsed, so a caller
 * can leave the current scheme in place rather than apply something wrong.
 */
export function generateColorScheme(
  seed: string,
  ratios: [SchemeRampWeight, number][] = defaultContrastRatios,
): SchemeRamp | null {
  const base = parseSeed(seed);
  if (!base) return null;

  const scheme = {} as SchemeRamp;
  for (const [weight, ratio] of ratios) {
    const l = lightnessForContrast(ratio, base.c, base.h);
    scheme[weight] = format(fitChroma({ l, c: base.c, h: base.h }));
  }
  return scheme;
}

/** The three translucent variants of step 600 that the token set expects. */
export function schemeAlphaVariants(scheme: SchemeRamp): Record<string, string> {
  const base = parseSeed(scheme[600]);
  if (!base) return {};
  return {
    "600-15": format(base, 0.15),
    "600-30": format(base, 0.3),
    "600-50": format(base, 0.5),
  };
}

/** Any colour `parseSeed` reads, as hex; anything else unchanged. */
export function toHex(value: string): string {
  if (value.startsWith("#")) return value;
  const lch = parseSeed(value);
  return lch ? format(lch) : value;
}

/** The schemes an app can supply with `brand`, `accent` or `neutral` set to `"custom"`. */
export type CustomScheme = "brand" | "accent" | "neutral";

/** A scheme given step by step: `100`…`1200`, plus the optional `600-15`/`-30`/`-50` alphas. */
export type SchemeScale = Partial<
  Record<SchemeRampWeight | "600-15" | "600-30" | "600-50", string>
>;

/**
 * The `scheme-<name>-<step>` tokens the token set reads for `"custom"`, from a
 * seed colour or a scale per scheme. A scale wins over a seed; a missing
 * alpha is made from step 600, as core does. A seed that cannot be parsed
 * contributes nothing.
 */
export function customSchemeTokens(
  seeds: Partial<Record<CustomScheme, string | undefined>>,
  scales: Partial<Record<CustomScheme, SchemeScale | undefined>> = {},
): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const name of ["brand", "accent", "neutral"] as const) {
    const seed = seeds[name];
    const scale: SchemeScale | null = scales[name] ?? (seed ? generateColorScheme(seed) : null);
    if (!scale) continue;
    for (const [step, value] of Object.entries(scale)) {
      if (value) tokens[`scheme-${name}-${step}`] = toHex(value);
    }
    if (scale[600]) {
      for (const [suffix, value] of Object.entries(schemeAlphaVariants(scale as SchemeRamp))) {
        if (!scale[suffix as "600-15"]) tokens[`scheme-${name}-${suffix}`] = value;
      }
    }
  }
  return tokens;
}

/**
 * CSS `color-mix(in srgb, a weight, b)`: `weight` of `a`, the rest `b`. Either
 * may carry alpha, and `"transparent"` mixes as clear black. Returns hex.
 */
export function mixColors(a: string, b: string, weight: number): string {
  const channels = (value: string) => {
    if (value === "transparent") return [0, 0, 0, 0];
    const hex = toHex(value).replace(/^#/, "");
    const n = Number.parseInt(hex.slice(0, 6), 16);
    const alpha = hex.length === 8 ? Number.parseInt(hex.slice(6), 16) / 255 : 1;
    return Number.isNaN(n) ? [0, 0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
  };
  const w = clamp01(weight);
  const [r1, g1, b1, a1] = channels(a);
  const [r2, g2, b2, a2] = channels(b);
  const alpha = a1 * w + a2 * (1 - w);
  // Premultiplied, as color-mix() does, so a clear side doesn't darken the other.
  const mix = (c1: number, c2: number) =>
    alpha === 0 ? 0 : (c1 * a1 * w + c2 * a2 * (1 - w)) / alpha / 255;
  return `#${hex2(mix(r1, r2))}${hex2(mix(g1, g2))}${hex2(mix(b1, b2))}${alpha < 1 ? hex2(alpha) : ""}`;
}
