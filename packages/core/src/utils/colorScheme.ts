/**
 * Generate a 12-step Once UI colour ramp from one seed colour.
 *
 * Steps are anchored to a contrast ratio against black rather than to fixed
 * lightness values, so a generated ramp keeps the same contrast relationships
 * as the built-in schemes no matter which hue it is built from.
 *
 * Hue and chroma are taken from the seed and held constant; only lightness
 * moves. That was measured against the 19 hand-tuned schemes rather than
 * assumed: their hue drift averages to nothing across the set (each scheme
 * drifts its own way, so there is no house curve to copy), and reproducing
 * their chroma arc made the match worse, not better.
 *
 * What does matter is staying inside the gamut. A chroma that exists at the
 * seed's lightness usually does not exist at 0.98, and clamping the red,
 * green and blue channels separately — which is what converting an
 * out-of-range colour to hex does — shifts the hue as it clips. Reducing
 * chroma until the colour fits instead cuts the worst error across the
 * built-in schemes from 0.168 to 0.110 in OKLab ΔE, and roughly five-fold on
 * the lightest steps, where clipping is worst.
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

const format = ({ l, c, h }: Lch, alpha?: number) =>
  `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${c < 0.0005 ? 0 : h.toFixed(2)}${
    alpha === undefined ? "" : ` / ${alpha}`
  })`;

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

/** The schemes tokens.css lets an app supply with `data-<scheme>="custom"`. */
export type CustomScheme = "brand" | "accent" | "neutral";

/** One seed colour per custom scheme; hex, `rgb()` or `oklch()`. */
export type CustomSchemeSeeds = Partial<Record<CustomScheme, string | undefined>>;

/**
 * A scheme written out step by step, `{ 100: "#…", …, 1200: "#…" }`, for a
 * brand whose exact colours are fixed. Same shape as the native package's
 * `SchemeScale`. Steps left out come from the seed when there is one; the
 * `600-*` alphas are made from step 600 unless given.
 */
export type SchemeScale = Partial<
  Record<SchemeRampWeight | "600-15" | "600-30" | "600-50", string>
>;

/** One scale per custom scheme. */
export type CustomSchemeScales = Partial<Record<CustomScheme, SchemeScale | undefined>>;

/**
 * The custom properties `data-<scheme>="custom"` reads — `--scheme-brand-100`
 * through `-1200` and the three `-600-*` alphas — generated from each seed.
 *
 * Pure, with no DOM access, so the same values come out on the server (where
 * `ThemeInit` renders them into a `<style>`) and on the client (where
 * `ThemeProvider` writes them onto `<html>` when a seed changes). A seed that
 * cannot be parsed contributes nothing rather than something wrong.
 *
 * ```ts
 * for (const [property, value] of Object.entries(customSchemeProperties({ brand: "#5A93FC" }))) {
 *   document.documentElement.style.setProperty(property, value);
 * }
 * document.documentElement.setAttribute("data-brand", "custom");
 * ```
 */
export function customSchemeProperties(
  seeds: CustomSchemeSeeds,
  scales: CustomSchemeScales = {},
): Record<string, string> {
  const properties: Record<string, string> = {};
  for (const name of ["brand", "accent", "neutral"] as const) {
    const seed = seeds[name];
    const generated = seed ? generateColorScheme(seed) : null;
    // A scale's steps win over the seed's, so a seed can fill the ramp while
    // the scale pins the steps the brand book fixes.
    const scale: SchemeScale = { ...generated, ...scales[name] };
    if (!scale[600]) continue;
    for (const [step, value] of Object.entries(scale)) {
      if (value) properties[`--scheme-${name}-${step}`] = value;
    }
    for (const [suffix, value] of Object.entries(schemeAlphaVariants(scale as SchemeRamp))) {
      if (!scale[suffix as "600-15"]) properties[`--scheme-${name}-${suffix}`] = value;
    }
  }
  return properties;
}

/**
 * A scale for each theme, `{ light: { … }, dark: { … } }`: a ramp tuned for a
 * light page often reads wrong on a dark one. A theme left out uses the other
 * theme's scale, and a seed fills the steps either one leaves out.
 */
export type SchemeScaleByTheme = { light?: SchemeScale; dark?: SchemeScale };

/** One scale for both themes, or one per theme. */
export type ThemedSchemeScale = SchemeScale | SchemeScaleByTheme;

/** One scale per custom scheme, flat or per theme. */
export type CustomSchemeThemedScales = Partial<Record<CustomScheme, ThemedSchemeScale | undefined>>;

/** Whether a scale is written per theme rather than once for both. */
export const isSchemeScaleByTheme = (scale: ThemedSchemeScale): scale is SchemeScaleByTheme =>
  "light" in scale || "dark" in scale;

/**
 * {@link customSchemeProperties}, with per-theme scales. A scheme with one
 * scale lands in `root`, exactly as `customSchemeProperties` returns it; a
 * scheme with a scale per theme lands in `light` and `dark` instead, for a
 * stylesheet to key off `data-theme`. `byTheme` names those schemes.
 */
export function customSchemeThemeProperties(
  seeds: CustomSchemeSeeds,
  scales: CustomSchemeThemedScales = {},
): {
  root: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
  byTheme: CustomScheme[];
} {
  const flatSeeds: CustomSchemeSeeds = {};
  const flatScales: CustomSchemeScales = {};
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  const byTheme: CustomScheme[] = [];
  for (const name of ["brand", "accent", "neutral"] as const) {
    const scale = scales[name];
    if (!scale || !isSchemeScaleByTheme(scale)) {
      flatSeeds[name] = seeds[name];
      flatScales[name] = scale;
      continue;
    }
    const seed = { [name]: seeds[name] };
    const step600 = `--scheme-${name}-600`;
    let lightProperties = customSchemeProperties(seed, { [name]: scale.light ?? scale.dark });
    let darkProperties = customSchemeProperties(seed, { [name]: scale.dark ?? scale.light });
    // A theme whose scale has no step 600, and no seed to fill it, would
    // point at nothing: it takes the other theme's ramp instead.
    if (!lightProperties[step600]) lightProperties = darkProperties;
    if (!darkProperties[step600]) darkProperties = lightProperties;
    if (!lightProperties[step600]) continue;
    Object.assign(light, lightProperties);
    Object.assign(dark, darkProperties);
    byTheme.push(name);
  }
  return { root: customSchemeProperties(flatSeeds, flatScales), light, dark, byTheme };
}
