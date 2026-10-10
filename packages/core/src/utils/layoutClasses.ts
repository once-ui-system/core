/**
 * Class-name helpers shared by the layout primitives (`Flex`, `Grid` and their
 * server components). Each one maps a prop value onto a utility class that
 * `@once-ui-system/foundations` generates, so the two components cannot drift
 * apart on what a value means, or on when a value needs the client.
 */

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
 * Numbers still go to the inline path, since `gap: 0.25` is a rem value with no
 * class behind it; `Flex` and `Grid` keep those on the client component.
 */
export function spacingClasses(
  breakpoint: string,
  props: Record<string, unknown> | undefined,
): (string | false)[] {
  if (!props) return [];
  return Object.entries(SPACING_PREFIX).map(([prop, prefix]) => {
    const value = props[prop];
    return typeof value === "string" && value !== "" && `${breakpoint}-${prefix}-${value}`;
  });
}

/**
 * Props whose breakpoint value cannot become a utility class.
 *
 * `width`, `height` and their min/max siblings accept arbitrary rems and CSS
 * units, `aspectRatio` is a free-form ratio, and `style` is the escape hatch.
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

/**
 * True when every value in a breakpoint object maps to a generated class, so
 * the component can stay on the server.
 *
 * Numbers are the subtle case: `padding: 16` means 16rem and has no class,
 * while `padding: "16"` is the token and does. The two look alike in JSX and
 * behave differently, so this reads the value's type rather than trusting the
 * prop name. `Flex` and `Grid` share it, so a breakpoint object that keeps one
 * on the server keeps the other there too.
 */
export function isClassExpressible(breakpointProps: Record<string, unknown>): boolean {
  return Object.entries(breakpointProps).every(([prop, value]) => {
    if (value === undefined) return true;
    if (INLINE_ONLY.has(prop)) return false;
    return typeof value !== "number" || NUMERIC_CLASS_PROPS.has(prop);
  });
}
