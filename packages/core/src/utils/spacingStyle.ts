import type { CSSProperties } from "react";
import { spacingValue, withTokenLengths } from "./layoutClasses.js";

/** The spacing props that take a number (on the token scale) or a CSS length as well as a token. */
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

/**
 * The first value that is written inline: a number on the token scale, or a CSS length as
 * written. Tokens are classes and are not written inline.
 */
function inline(...values: unknown[]): string | undefined {
  for (const value of values) {
    const resolved = spacingValue(value);
    if (resolved !== undefined) return resolved;
  }
  return undefined;
}

/**
 * Inline style for px and CSS-length spacing, always as the four sides.
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
  return withTokenLengths({
    paddingTop: inline(p.paddingTop, p.paddingY, p.padding),
    paddingRight: inline(p.paddingRight, p.paddingX, p.padding),
    paddingBottom: inline(p.paddingBottom, p.paddingY, p.padding),
    paddingLeft: inline(p.paddingLeft, p.paddingX, p.padding),
    marginTop: inline(p.marginTop, p.marginY, p.margin),
    marginRight: inline(p.marginRight, p.marginX, p.margin),
    marginBottom: inline(p.marginBottom, p.marginY, p.margin),
    marginLeft: inline(p.marginLeft, p.marginX, p.margin),
  });
}
