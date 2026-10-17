/**
 * A colour prop as a CSS value. Tokens become their custom property
 * (`brand-on-background-weak` → `var(--brand-on-background-weak)`, or with the
 * charts' `data-` prefix, `blue` → `var(--data-blue)`); a raw CSS colour passes
 * through as written.
 *
 * `ColorValue` has always advertised `#fff`, `rgb(...)` and `var(...)`, but
 * Background, ParticleFx and the charts wrapped every value, so `#fff` became
 * `var(--#fff)` and painted nothing.
 */
const RAW_COLOR =
  /^(#|(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|var)\()|^(transparent|currentcolor|inherit|white|black)$/i;

export function isRawColor(value: string): boolean {
  return RAW_COLOR.test(value.trim());
}

export function cssColor(value: string, prefix = ""): string {
  return isRawColor(value) ? value : `var(--${prefix}${value})`;
}
