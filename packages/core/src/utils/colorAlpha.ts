/**
 * Any colour token at any opacity.
 *
 * A colour prop (`background`, `solid`, `border` and its sides) takes an
 * opacity after a slash, 0 to 100:
 *
 * - `"brand/12"` is the tone itself at 12%: the colour its alpha scale is
 *   drawn from, `--brand-alpha`. `brand-alpha-weak`, `-medium` and `-strong`
 *   are the same colour at 15, 30 and 50%, so `"brand/15"` is
 *   `"brand-alpha-weak"`.
 * - `"brand-strong/40"` is the token the prop already reads for
 *   `"brand-strong"` (`--brand-background-strong` for `background`,
 *   `--brand-solid-strong` for `solid`, `--brand-border-strong` for a border)
 *   at 40%.
 * - `"gradient/16"` is the brand-to-accent gradient at 16% (`background`
 *   only).
 *
 * The opacity is a `color-mix()` with `transparent`, the way the alpha
 * tokens themselves are made, so it follows the theme, the scheme and any
 * `StyleScope` around the element. There is no class per step: the server
 * writes the value inline, so the element stays a server component.
 */

import { splitAlpha, withAlpha } from "../internal/alpha.js";
import type { ColorScheme } from "../types.js";

export { hasAlpha, splitAlpha, withAlpha } from "../internal/alpha.js";

const TONES = new Set<ColorScheme>([
  "neutral",
  "brand",
  "accent",
  "info",
  "danger",
  "warning",
  "success",
]);

type Role = "background" | "solid" | "border";

/**
 * The variable a role prop reads for a value with no opacity: the same
 * mapping the utility classes make (`.brand-background-strong`,
 * `.brand-solid-alpha-weak`, `.brand-border-medium`).
 */
function roleVariable(role: Role, base: string): string | undefined {
  if (TONES.has(base as ColorScheme)) return `var(--${base}-alpha)`;
  if (base === "surface")
    return role === "border" ? "var(--surface-border)" : "var(--surface-background)";
  if (base === "page") return "var(--page-background)";
  const parts = base.split("-");
  if (!TONES.has(parts[0] as ColorScheme)) return undefined;
  if (parts[1] === "alpha" && parts[2]) return `var(--${parts[0]}-alpha-${parts[2]})`;
  if (parts.length === 2) return `var(--${parts[0]}-${role}-${parts[1]})`;
  return undefined;
}

/**
 * A role prop's value with an opacity, as the CSS it writes; `undefined` for
 * a value without one (that is a class) or one it can't read.
 */
export function roleColorAlpha(role: Role, value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const [base, alpha] = splitAlpha(value);
  if (alpha === undefined) return undefined;
  const color = roleVariable(role, base);
  return color ? withAlpha(color, alpha) : undefined;
}

/** The brand-to-accent gradient, at an opacity when one is given. */
export function gradientValue(alpha = 100): string {
  const from = withAlpha("var(--brand-color-strong)", alpha);
  const to = withAlpha("var(--accent-color-strong)", alpha);
  return `linear-gradient(var(--gradient-angle, 135deg), ${from}, ${to})`;
}

/**
 * The inline style a layout box needs for its colour props with an opacity.
 * Values without one return nothing here: their class does the work.
 */
export function alphaColorStyle(props: {
  background?: unknown;
  solid?: unknown;
  border?: unknown;
  borderTop?: unknown;
  borderRight?: unknown;
  borderBottom?: unknown;
  borderLeft?: unknown;
  borderX?: unknown;
  borderY?: unknown;
}): Record<string, string> {
  const style: Record<string, string> = {};
  const { background, solid } = props;

  if (typeof background === "string") {
    const [base, alpha] = splitAlpha(background);
    if (base === "gradient" && alpha !== undefined) style.backgroundImage = gradientValue(alpha);
    else {
      const color = roleColorAlpha("background", background);
      if (color) style.backgroundColor = color;
    }
  }
  if (!style.backgroundColor) {
    const color = roleColorAlpha("solid", solid);
    if (color) style.backgroundColor = color;
  }

  // A border colour is one value for every side drawn, as the class is.
  for (const key of [
    "border",
    "borderTop",
    "borderRight",
    "borderBottom",
    "borderLeft",
    "borderX",
    "borderY",
  ] as const) {
    const color = roleColorAlpha("border", props[key]);
    if (color) {
      style.borderColor = color;
      break;
    }
  }
  return style;
}
