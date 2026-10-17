/**
 * Class-name helpers shared by the layout primitives (`Flex`, `Grid` and their
 * server components). Each one maps a prop value onto a utility class that
 * `@once-ui-system/foundations` generates, or onto the inline value a class
 * cannot hold, so the two components cannot drift apart on what a value
 * means, or on when a value needs the client.
 */

import type { CSSProperties } from "react";
import type { StaticSpacingToken } from "../types";

/**
 * The static spacing scale, as a value the size parsers can read.
 *
 * `ServerFlex`, `ClientFlex` and `ServerGrid` each carried their own copy of
 * this list, and all three had dropped `"72"`: `width="72"` type-checked and
 * then rendered no width at all. One list now, keyed by `StaticSpacingToken`
 * so the compiler rejects it the moment the type gains or loses a step, and
 * the type is pinned to the foundations generator by `spacing-token-parity`.
 */
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

/** Every static spacing token, smallest first. */
export const STATIC_SPACING_TOKENS = Object.keys(STATIC_SPACE) as StaticSpacingToken[];

const STATIC_SPACING = new Set<unknown>(STATIC_SPACING_TOKENS);
const RESPONSIVE_SIZES = new Set<unknown>(["xs", "s", "m", "l", "xl"]);

/**
 * A CSS length written as a string: a number with a unit (`"320px"`,
 * `"40rem"`, `"1.5em"`, `"50%"`, `"100vh"`, `"100dvh"`, `"50vw"`…) or a
 * function (`calc(…)`, `min(…)`, `max(…)`, `clamp(…)`, `var(…)`). A class
 * cannot hold it, so it is passed through inline as written.
 *
 * A bare digit string is not a CSS length: `"16"` is the static spacing token
 * `--static-space-16`, and `16` (the number) is 16px.
 */
const CSS_LENGTH =
  /^-?(\d+\.?\d*|\.\d+)(px|rem|em|ch|%|vh|vw|dvh|dvw|svh|svw|lvh|lvw|vmin|vmax|cqw|cqh)$/;
const CSS_FUNCTION = /^(calc|min|max|clamp|var)\(/;

export function isCSSUnit(value: unknown): value is string {
  return typeof value === "string" && (CSS_LENGTH.test(value) || CSS_FUNCTION.test(value));
}

/**
 * A number as a CSS length. Every size, spacing, offset and blur prop reads a
 * number as px, the convention of React's own `style={{ width: 320 }}`; write
 * `"40rem"` for a length that follows the root font size.
 */
export function px(value: number): string {
  return `${value}px`;
}

/**
 * A size prop (`width`, `minHeight`, `minColumnWidth`…) as a CSS value: a
 * number is px, a static token is its `--static-space-*` step, a t-shirt
 * size is the responsive width or height, and a CSS length passes through.
 * Anything else is no value at all, as before.
 */
export function sizeValue(value: unknown, type: "width" | "height"): string | undefined {
  if (typeof value === "number") return px(value);
  if (typeof value !== "string") return undefined;
  if (isCSSUnit(value)) return value;
  if (STATIC_SPACING.has(value)) return `var(--static-space-${value})`;
  if (RESPONSIVE_SIZES.has(value)) return `var(--responsive-${type}-${value})`;
  return undefined;
}

/**
 * A spacing value (`padding`, `margin`, `gap`) that a class cannot hold, as
 * its inline value: a number is px and a CSS length passes through. A token
 * is a class (`.p-16`) and is not written inline.
 */
export function spacingValue(value: unknown): string | undefined {
  if (typeof value === "number") return px(value);
  if (isCSSUnit(value)) return value;
  return undefined;
}

/** A spacing token's utility class (`p-16`), or nothing for a number or a CSS length. */
export function spacingClass(prefix: string, value: unknown): string | false {
  return typeof value === "string" && value !== "" && !isCSSUnit(value) && `${prefix}-${value}`;
}

/**
 * The size keyword for "the viewport below the app header". At the base it is
 * a class (`.height-below-header` and its min/max siblings); in a breakpoint
 * object, where every size is inline, it is the same value written out.
 */
export const BELOW_HEADER = "below-header";
export const BELOW_HEADER_VALUE = "calc(100dvh - var(--header-height))";

/**
 * Overflow values that never scroll. `clip` and `visible` joined `hidden` when
 * their classes were added: none of the three shows a scrollbar, so none needs
 * the scrollbar styling that `auto` and `scroll` get.
 */
const NON_SCROLLING_OVERFLOW = new Set<unknown>(["hidden", "clip", "visible"]);

/** True when an overflow value can show a scrollbar, so `scrollbar` applies. */
export function scrollsOn(value: unknown): boolean {
  return Boolean(value) && !NON_SCROLLING_OVERFLOW.has(value);
}

/**
 * Spacing prop to utility prefix. The class matrix behind these is generated
 * from `@once-ui-system/foundations`' spec, which emits every prefix at every
 * token for every breakpoint.
 */
const SPACING_PREFIX = {
  padding: "p",
  paddingLeft: "pl",
  paddingRight: "pr",
  paddingTop: "pt",
  paddingBottom: "pb",
  paddingX: "px",
  paddingY: "py",
  margin: "m",
  marginLeft: "ml",
  marginRight: "mr",
  marginTop: "mt",
  marginBottom: "mb",
  marginX: "mx",
  marginY: "my",
  gap: "g",
} as const;

/**
 * Breakpoint spacing, as classes.
 *
 * Nothing emitted these before, so a token in a breakpoint prop — `s={{ gap: "4" }}`,
 * which is what the docs and every example teach — resolved to nothing at all:
 * no class was written, and ClientFlex's inline path guards on
 * `typeof value === "number"`, so the string fell through both. Numbers worked,
 * tokens did not, and neither said so.
 *
 * Numbers (px) and CSS lengths still go to the inline path, since `gap: 4` or
 * `gap: "0.25rem"` has no class behind it; `Flex` and `Grid` keep those on the
 * client component.
 */
export function spacingClasses(
  breakpoint: string,
  props: Record<string, unknown> | undefined,
): (string | false)[] {
  if (!props) return [];
  return Object.entries(SPACING_PREFIX).map(([prop, prefix]) => {
    return spacingClass(`${breakpoint}-${prefix}`, props[prop]);
  });
}

const OFFSET_SIDES = ["top", "right", "bottom", "left"] as const;

/**
 * An offset with a class behind it. Foundations generates `top`, `right`,
 * `bottom` and `left` for the static steps only, at the base and at every
 * breakpoint (`.m-top-16`); a t-shirt size, a px number and a CSS length have
 * none.
 */
export function isOffsetToken(value: unknown): value is StaticSpacingToken {
  return STATIC_SPACING.has(value);
}

/**
 * An offset a class cannot hold, as its inline value: a number is px (`top: 2`
 * is 2px, while `top: "2"` is the 0.125rem `.top-2`), and a CSS length passes
 * through.
 */
export function offsetValue(value: unknown): string | undefined {
  if (typeof value === "number") return px(value);
  if (isCSSUnit(value)) return value;
  return undefined;
}

/**
 * A `translateX`/`translateY` value as a CSS length. A static step is its
 * `--static-space-*` and a t-shirt size its `--responsive-space-*`, the values
 * the spacing classes read; a number is px, and a CSS length passes through.
 *
 * Only the number and the CSS unit used to resolve, so `translateY="16"`, the
 * form the props' type and the harness teach, wrote no transform at all.
 */
export function translateValue(value: unknown): string | undefined {
  if (typeof value === "number") return px(value);
  if (typeof value !== "string") return undefined;
  if (isCSSUnit(value)) return value;
  if (STATIC_SPACING.has(value)) return `var(--static-space-${value})`;
  if (RESPONSIVE_SIZES.has(value)) return `var(--responsive-space-${value})`;
  return undefined;
}

/**
 * `translateX` and `translateY` as the one `transform` they write, the unset
 * axis `0`. It is the only transform `Flex`, `Grid`, `Text` and `Heading`
 * write; a `transform` in `style` replaces it, as `style` replaces any value
 * these components resolve.
 */
export function translateTransform(x: unknown, y: unknown): string | undefined {
  const tx = translateValue(x);
  const ty = translateValue(y);
  return tx || ty ? `translate(${tx || "0"}, ${ty || "0"})` : undefined;
}

/**
 * Breakpoint offsets, as classes: `m={{ top: "16" }}` is `.m-top-16`. The
 * classes were always generated; `ServerFlex` never wrote them, so a token
 * offset in a breakpoint object stayed on the server and did nothing.
 */
export function offsetClasses(
  breakpoint: string,
  props: Record<string, unknown> | undefined,
): (string | false)[] {
  if (!props) return [];
  return OFFSET_SIDES.map(
    (side) => isOffsetToken(props[side]) && `${breakpoint}-${side}-${props[side]}`,
  );
}

/**
 * Breakpoint offsets a class cannot hold, as inline style for the client
 * components to apply at the current breakpoint.
 */
export function offsetStyle(
  props: Record<string, unknown>,
): Partial<Record<(typeof OFFSET_SIDES)[number], string>> {
  const style: Partial<Record<(typeof OFFSET_SIDES)[number], string>> = {};
  for (const side of OFFSET_SIDES) {
    const value = offsetValue(props[side]);
    if (value !== undefined) style[side] = value;
  }
  return style;
}

/** The size props a breakpoint object writes inline, and the axis each reads. */
const BREAKPOINT_SIZES = [
  ["width", "width"],
  ["height", "height"],
  ["maxWidth", "width"],
  ["minWidth", "width"],
  ["minHeight", "height"],
  ["maxHeight", "height"],
] as const;

/**
 * The spacing props a breakpoint object writes inline when they are numbers,
 * and the properties each sets: the shorthand, then each side, then each axis
 * over its two sides, the order `ClientFlex` has always applied them in.
 */
const BREAKPOINT_SPACING: [prop: string, properties: string[]][] = [
  ["padding", ["padding"]],
  ["paddingLeft", ["paddingLeft"]],
  ["paddingRight", ["paddingRight"]],
  ["paddingTop", ["paddingTop"]],
  ["paddingBottom", ["paddingBottom"]],
  ["paddingX", ["paddingLeft", "paddingRight"]],
  ["paddingY", ["paddingTop", "paddingBottom"]],
  ["margin", ["margin"]],
  ["marginLeft", ["marginLeft"]],
  ["marginRight", ["marginRight"]],
  ["marginTop", ["marginTop"]],
  ["marginBottom", ["marginBottom"]],
  ["marginX", ["marginLeft", "marginRight"]],
  ["marginY", ["marginTop", "marginBottom"]],
  ["gap", ["gap"]],
];

/**
 * Everything one cascaded breakpoint object sets inline, as `[property,
 * value]` pairs in the order `ClientFlex` and `ClientGrid` apply them at the
 * current breakpoint: the values `isClassExpressible` sends to the client.
 *
 * The `style` escape hatch goes first, so a resolved value wins over it; then
 * `aspectRatio`, the sizes (a number is px, a token its step, `below-header`
 * written out), px or CSS-length spacing and px or CSS-length offsets. A token spacing
 * or offset is a class, written by the server component, and is not here.
 *
 * `ClientGrid` applied only `style`, `aspectRatio` and the offsets, so a
 * breakpoint `width` or numeric `padding` moved a Grid to the client and then
 * did nothing there. A t-shirt `maxWidth` did nothing on either: the base
 * writes it as `.max-width-<size>`, which has no breakpoint variant, and the
 * breakpoint path skipped it as though it did.
 */
export function breakpointStyle(props: Record<string, unknown>): [string, unknown][] {
  const entries: [string, unknown][] = [];
  const add = (property: string, value: unknown) => {
    if (value !== undefined) entries.push([property, value]);
  };
  if (props.style && typeof props.style === "object") {
    for (const [property, value] of Object.entries(props.style)) add(property, value);
  }
  add("aspectRatio", props.aspectRatio);
  for (const [prop, axis] of BREAKPOINT_SIZES) {
    const value = props[prop];
    add(prop, value === BELOW_HEADER ? BELOW_HEADER_VALUE : sizeValue(value, axis));
  }
  for (const [prop, properties] of BREAKPOINT_SPACING) {
    const value = spacingValue(props[prop]);
    if (value !== undefined) for (const property of properties) add(property, value);
  }
  for (const [side, value] of Object.entries(offsetStyle(props))) add(side, value);
  return entries;
}

/**
 * Props whose breakpoint value cannot become a utility class.
 *
 * `width`, `height` and their min/max siblings accept arbitrary px numbers and
 * CSS lengths, `aspectRatio` is a free-form ratio, and `style` is the escape hatch.
 * A class matrix cannot enumerate any of them.
 */
const INLINE_ONLY = new Set([
  "width",
  "height",
  "maxWidth",
  "minWidth",
  "maxHeight",
  "minHeight",
  "aspectRatio",
  "style",
]);

/** Props that take a real number and still resolve to a class. */
const NUMERIC_CLASS_PROPS = new Set(["opacity", "zIndex", "flex", "columns", "rows"]);

const OFFSET_PROPS = new Set<string>(OFFSET_SIDES);

/**
 * True when every value in a breakpoint object maps to a generated class, so
 * the component can stay on the server.
 *
 * Numbers are the subtle case: `padding: 16` means 16px and has no class,
 * while `padding: "16"` is the token and does. The two look alike in JSX and
 * behave differently, so this reads the value's type rather than trusting the
 * prop name. `Flex` and `Grid` share it, so a breakpoint object that keeps one
 * on the server keeps the other there too.
 */
export function isClassExpressible(breakpointProps: Record<string, unknown>): boolean {
  return Object.entries(breakpointProps).every(([prop, value]) => {
    if (value === undefined) return true;
    if (INLINE_ONLY.has(prop)) return false;
    // `top: "16"` is `.m-top-16`; `top: 2` (2px) and `top: "50%"` are inline.
    if (OFFSET_PROPS.has(prop)) return offsetValue(value) === undefined;
    if (isCSSUnit(value)) return false;
    return typeof value !== "number" || NUMERIC_CLASS_PROPS.has(prop);
  });
}

/**
 * The typed theme props as the `data-*` attributes the theme tokens key off.
 *
 * Only the props that are set are written, and they are spread after the
 * caller's own attributes, so a typed prop wins over a raw `data-theme` beside
 * it and an unset one leaves a raw attribute alone.
 */
export function themeAttributes({
  theme,
  themeBorder,
  themeSolid,
  themeSurface,
}: {
  theme?: string;
  themeBorder?: string;
  themeSolid?: string;
  themeSurface?: string;
}): Record<string, string> {
  const attributes: Record<string, string> = {};
  if (theme) attributes["data-theme"] = theme;
  if (themeBorder) attributes["data-border"] = themeBorder;
  if (themeSolid) attributes["data-solid"] = themeSolid;
  if (themeSurface) attributes["data-surface"] = themeSurface;
  return attributes;
}

/**
 * The display, position and spacing props `Text` and `Heading` take beyond
 * their own: the rest of `DisplayProps` and `SpacingProps`, both in their types.
 */
export interface TextLayoutProps {
  gap?: unknown;
  top?: unknown;
  right?: unknown;
  bottom?: unknown;
  left?: unknown;
  translateX?: unknown;
  translateY?: unknown;
  position?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  scrollbar?: string;
  pointerEvents?: string;
  transition?: string;
  zIndex?: number | string;
}

/**
 * `Text` and `Heading` resolve these the way `Flex` does: a class where
 * foundations generates one, an inline value where a class cannot hold it.
 *
 * Both accepted every one of these props in their types and read none of
 * them, so `pointerEvents`, `overflow`, `zIndex`, `top` and the rest reached
 * the DOM as attributes that did nothing.
 */
export function textLayout({
  gap,
  top,
  right,
  bottom,
  left,
  translateX,
  translateY,
  position,
  overflow,
  overflowX,
  overflowY,
  scrollbar = "minimal",
  pointerEvents,
  transition,
  zIndex,
}: TextLayoutProps): { classes: (string | false | undefined)[]; style: CSSProperties } {
  const offsets = { top, right, bottom, left };
  return {
    classes: [
      position && `position-${position}`,
      overflow && `overflow-${overflow}`,
      overflowX && `overflow-x-${overflowX}`,
      overflowY && `overflow-y-${overflowY}`,
      (scrollsOn(overflow) || scrollsOn(overflowX) || scrollsOn(overflowY)) &&
        `scrollbar-${scrollbar}`,
      pointerEvents && `pointer-events-${pointerEvents}`,
      transition && `transition-${transition}`,
      zIndex !== undefined && `z-index-${zIndex}`,
      // `-1` laps bordered children onto each other; with no direction, in a row.
      gap === "-1" ? "g-horizontal--1" : spacingClass("g", gap),
      ...OFFSET_SIDES.map((side) => isOffsetToken(offsets[side]) && `${side}-${offsets[side]}`),
    ],
    style: {
      gap: spacingValue(gap),
      ...offsetStyle(offsets),
      transform: translateTransform(translateX, translateY),
    },
  };
}

/**
 * The class for a `vertical` value: on a row it is `align-items`, on a column
 * `justify-content`. `"baseline"` is an `align-items` value only, so it stays
 * there whatever the direction (`justify-content: baseline` does not exist).
 */
export function crossAxisClass(
  prefix: string,
  value: string,
  direction: string | undefined,
): string {
  const row = direction === undefined || direction === "row" || direction === "row-reverse";
  return value === "baseline" || row ? `${prefix}align-${value}` : `${prefix}justify-${value}`;
}

const LIST_ELEMENTS = new Set<unknown>(["ul", "ol", "menu"]);

/**
 * The reset for an element a layout primitive renders that carries browser
 * chrome a layout box should not: a list's bullets and indent (`as="ul"`), a
 * button's background, border, padding and font (`as="button"`). The rules sit
 * in `:where()`, at zero specificity, so every utility class on the element
 * (`padding`, `background`, `border`, `textVariant`) still wins over them.
 */
export function elementReset(element: unknown): string | undefined {
  if (LIST_ELEMENTS.has(element)) return "reset-list";
  if (element === "button") return "reset-button";
  return undefined;
}

/** A text preset with its weight swapped: `("body-default-m", "strong")` is `body-strong-m`. */
export function withWeight<V extends string>(variant: V, weight: string | undefined): V {
  if (!weight) return variant;
  const parts = variant.split("-");
  parts[parts.length - 2] = weight;
  return parts.join("-") as V;
}
