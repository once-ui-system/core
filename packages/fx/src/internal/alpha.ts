// A copy of core's internal `src/internal/alpha.ts` (cssColor reads it);
// `__tests__/internal-parity.test.ts` holds the two to the same answers.

/**
 * The opacity step of a colour value, `brand/12` or `brand-strong/40`, and
 * the `color-mix()` that draws a colour at one. Shared by the role props
 * (`utils/colorAlpha.ts`) and the free colour props (`cssColor`).
 */

/** A value and its opacity: `"brand-strong/40"` is `["brand-strong", 40]`. */
export function splitAlpha(value: string): [base: string, alpha: number | undefined] {
  const slash = value.lastIndexOf("/");
  if (slash < 0) return [value, undefined];
  const base = value.slice(0, slash).trim();
  const raw = value
    .slice(slash + 1)
    .trim()
    .replace(/%$/, "");
  const alpha = Number(raw);
  if (raw === "" || !Number.isFinite(alpha)) return [value, undefined];
  return [base, Math.min(100, Math.max(0, alpha))];
}

/** `true` for a value with an opacity after a slash. */
export function hasAlpha(value: unknown): value is string {
  return typeof value === "string" && splitAlpha(value)[1] !== undefined;
}

/** A CSS colour at an opacity, as the alpha tokens are made. */
export function withAlpha(color: string, alpha: number): string {
  if (alpha >= 100) return color;
  return `color-mix(in srgb, ${color} ${alpha}%, transparent)`;
}
