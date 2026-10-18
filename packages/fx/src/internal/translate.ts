import type { StaticSpacingToken } from "@once-ui-system/core";

/**
 * RevealFx's `translateY` as a CSS length, read exactly as core's layout
 * props read `translateY` (`translateValue` in core's
 * `src/utils/layoutClasses.ts`, which is internal): a number is px, a static
 * step is its `--static-space-*`, a t-shirt size its `--responsive-space-*`,
 * and a CSS length passes through. `__tests__/internal-parity.test.ts` holds
 * the two to the same answers.
 */

// Keyed by the token type, so the compiler rejects this table the moment
// core's scale gains or loses a step.
const STATIC_SPACE: Record<StaticSpacingToken, true> = {
  "0": true,
  "1": true,
  "2": true,
  "4": true,
  "8": true,
  "12": true,
  "16": true,
  "20": true,
  "24": true,
  "32": true,
  "40": true,
  "48": true,
  "56": true,
  "64": true,
  "72": true,
  "80": true,
  "104": true,
  "128": true,
  "160": true,
};

const STATIC_SPACING = new Set<unknown>(Object.keys(STATIC_SPACE));
const RESPONSIVE_SIZES = new Set<unknown>(["xs", "s", "m", "l", "xl"]);

const CSS_LENGTH =
  /^-?(\d+\.?\d*|\.\d+)(px|rem|em|ch|%|vh|vw|dvh|dvw|svh|svw|lvh|lvw|vmin|vmax|cqw|cqh)$/;
const CSS_FUNCTION = /^(calc|min|max|clamp|var)\(/;

export function translateValue(value: unknown): string | undefined {
  if (typeof value === "number") return `${value}px`;
  if (typeof value !== "string") return undefined;
  if (CSS_LENGTH.test(value) || CSS_FUNCTION.test(value)) return value;
  if (STATIC_SPACING.has(value)) return `var(--static-space-${value})`;
  if (RESPONSIVE_SIZES.has(value)) return `var(--responsive-space-${value})`;
  return undefined;
}
