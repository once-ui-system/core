/**
 * Small color math for places without CSS: server-drawn SVG and Open Graph
 * images, where `color-mix()` and `oklch()` don't render. Reads hex, `rgb()`
 * and `oklch()`, mixes in sRGB like `color-mix(in srgb, …)`, writes hex.
 */

export type Rgb = { r: number; g: number; b: number; a: number };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function fromLinear(x: number) {
  const c = clamp01(x);
  return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
}

/** OKLCH (L from 0 to 1, chroma, hue in degrees) to sRGB from 0 to 255. */
export function oklchToRgb(l: number, c: number, h: number, alpha = 1): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: fromLinear(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    g: fromLinear(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    b: fromLinear(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
    a: alpha,
  };
}

function number(token: string, scale = 1) {
  return token.endsWith("%") ? (Number.parseFloat(token) / 100) * scale : Number.parseFloat(token);
}

/** A hex, `rgb()`/`rgba()` or `oklch()` color, or `undefined` for anything else. */
export function parseColor(input: string | undefined): Rgb | undefined {
  if (!input) return undefined;
  const value = input.trim().toLowerCase();
  const hex = value.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = [...digits].map((d) => d + d).join("");
    }
    if (digits.length !== 6 && digits.length !== 8) return undefined;
    const n = (i: number) => Number.parseInt(digits.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: digits.length === 8 ? n(6) / 255 : 1 };
  }
  const fn = value.match(/^(rgba?|oklch)\(([^)]+)\)$/);
  if (!fn) return undefined;
  const parts = fn[2].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.some((p) => Number.isNaN(Number.parseFloat(p)))) return undefined;
  const alpha = parts[3] !== undefined ? number(parts[3]) : 1;
  if (fn[1] === "oklch") {
    return oklchToRgb(number(parts[0]), number(parts[1], 0.4), Number.parseFloat(parts[2]), alpha);
  }
  return {
    r: number(parts[0], 255),
    g: number(parts[1], 255),
    b: number(parts[2], 255),
    a: alpha,
  };
}

const hex2 = (value: number) =>
  Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0");

/** `#rrggbb`, or `#rrggbbaa` when the color is not opaque. */
export function toHex(color: Rgb) {
  const base = `#${hex2(color.r)}${hex2(color.g)}${hex2(color.b)}`;
  return color.a < 1 ? `${base}${hex2(color.a * 255)}` : base;
}

/** Like `color-mix(in srgb, a weight%, b)`, with `weight` from 0 to 1. */
export function mixColors(a: string, b: string, weight: number): string {
  const x = parseColor(a);
  const y = parseColor(b);
  if (!x || !y) return weight >= 0.5 ? a : b;
  const t = clamp01(weight);
  return toHex({
    r: x.r * t + y.r * (1 - t),
    g: x.g * t + y.g * (1 - t),
    b: x.b * t + y.b * (1 - t),
    a: x.a * t + y.a * (1 - t),
  });
}

/** The color with its alpha set, as `#rrggbbaa`. */
export function withAlpha(color: string, alpha: number): string {
  const parsed = parseColor(color);
  return parsed ? toHex({ ...parsed, a: clamp01(alpha) }) : color;
}

/** Relative luminance from 0 (black) to 1 (white). */
export function luminance(color: string): number {
  const c = parseColor(color);
  if (!c) return 0;
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}
