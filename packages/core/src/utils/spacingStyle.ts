import type { CSSProperties } from "react";

/** The spacing props that take a number (rem) as well as a token. */
export interface NumericSpacingProps {
  padding?: unknown;
  paddingX?: unknown;
  paddingY?: unknown;
  paddingTop?: unknown;
  paddingRight?: unknown;
  paddingBottom?: unknown;
  paddingLeft?: unknown;
  margin?: unknown;
  marginX?: unknown;
  marginY?: unknown;
  marginTop?: unknown;
  marginRight?: unknown;
  marginBottom?: unknown;
  marginLeft?: unknown;
}

/** The first number, in rem. Tokens are classes and are not written inline. */
function rem(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "number") return `${value}rem`;
  }
  return undefined;
}

/**
 * Inline style for numeric spacing, always as the four sides.
 *
 * This used to emit `padding`/`margin` as the CSS shorthand next to the four
 * longhands, with every longhand that was not set left `undefined`. The server
 * skips undefined styles, so the shorthand rendered there. On the client React
 * writes an undefined longhand as `''`, after the shorthand, and that clears
 * it: `<Column padding={1}>` mounted on the client had `style=""` and no
 * padding, and a box that went from four numeric sides to one `padding`
 * collapsed on the update. Resolving side → axis → all here keeps the
 * precedence the shorthand-then-longhand order had, with nothing left for a
 * later key to clear.
 */
export function numericSpacingStyle(p: NumericSpacingProps): CSSProperties {
  return {
    paddingTop: rem(p.paddingTop, p.paddingY, p.padding),
    paddingRight: rem(p.paddingRight, p.paddingX, p.padding),
    paddingBottom: rem(p.paddingBottom, p.paddingY, p.padding),
    paddingLeft: rem(p.paddingLeft, p.paddingX, p.padding),
    marginTop: rem(p.marginTop, p.marginY, p.margin),
    marginRight: rem(p.marginRight, p.marginX, p.margin),
    marginBottom: rem(p.marginBottom, p.marginY, p.margin),
    marginLeft: rem(p.marginLeft, p.marginX, p.margin),
  };
}
