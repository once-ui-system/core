import type { Speed } from "../types.js";

/** The multiplier each speed keyword stands for. */
export const SPEED_KEYWORDS = { slow: 0.5, medium: 1, fast: 2 } as const;

/**
 * A `speed` prop as its multiplier: a keyword is its number, a positive
 * number is itself, and anything else (unset, zero, negative, NaN) is `1`, so
 * an effect never divides by zero or runs backwards.
 */
export function speedFactor(speed: Speed | undefined): number {
  if (typeof speed === "string") return SPEED_KEYWORDS[speed] ?? 1;
  return typeof speed === "number" && Number.isFinite(speed) && speed > 0 ? speed : 1;
}
