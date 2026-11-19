import type { StaticSpacingToken } from "@once-ui-system/core";

/**
 * RevealFx's `translateY` as a CSS length, read exactly as core's layout
 * props read `translateY` (`translateValue` in core's
 * `src/utils/layoutClasses.ts`, which is internal): a number is on the token
 * scale (`tokenLength`: n/16 rem times `--scaling`, as the token `"n"`,
 * read through a `--ou-n-*` property core's Flex declares), a static
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
  if (typeof value === "number") {
    if (value === 0) return "0px";
    if (STATIC_SPACING.has(String(value))) return `var(--static-space-${value})`;
    // Core's `--ou-n-*` property, named the same way: every effect writes its
    // style through core's Flex, whose `withTokenLengths` declares it on the
    // element (the scaled `calc()` stays out of the length itself, which
    // jsdom cannot compute).
    const text = String(value);
    return /^-?\d+(\.\d+)?$/.test(text)
      ? `var(--ou-n-${text.replace(".", "_")})`
      : `${value / 16}rem`;
  }
  if (typeof value !== "string") return undefined;
  if (CSS_LENGTH.test(value) || CSS_FUNCTION.test(value)) return value;
  if (STATIC_SPACING.has(value)) return `var(--static-space-${value})`;
  if (RESPONSIVE_SIZES.has(value)) return `var(--responsive-space-${value})`;
  return undefined;
}

/**
 * `translateX` and `translateY` as the one `transform` core's layout props
 * write, the unset axis `0` (core's `translateTransform`).
 */
export function translateTransform(x: unknown, y: unknown): string | undefined {
  const tx = translateValue(x);
  const ty = translateValue(y);
  return tx || ty ? `translate(${tx || "0"}, ${ty || "0"})` : undefined;
}

/**
 * Transform functions joined in order, skipping the empty ones; `undefined`
 * when none is left (core's `composeTransform`). An effect that writes its own
 * `transform` (a flip, a tilt) composes it with the `translate()` its
 * `translateX`/`translateY` props resolve to, rather than replacing it.
 */
export function composeTransform(...parts: (string | undefined | false)[]): string | undefined {
  const transform = parts.filter(Boolean).join(" ");
  return transform || undefined;
}
