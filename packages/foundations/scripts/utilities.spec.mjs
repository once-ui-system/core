/**
 * The utility class surface, as data.
 *
 * `scss/styles/` was 5,789 lines of hand-written classes with not one loop in
 * it — every `.p-16`, `.mt-24` and `.g-8` typed out in full. The cost is not
 * the typing, it is that a hand-maintained matrix drifts: `.mx-48` and
 * `.mx-56` were simply missing while every sibling family had all 23 tokens,
 * and no reader of 1,504 lines was ever going to notice. A matrix belongs in
 * a loop, and the values belong in one place both the loop and the docs can
 * read.
 *
 * Generated CSS is emitted to `scss/styles/<name>.generated.scss`, which the
 * entrypoint imports. The generator is idempotent and CI fails if the checked-in
 * output does not match a fresh run, so the file on disk is always the file the
 * spec describes.
 */

/** Static spacing steps, then the five viewport-responsive ones. */
export const SPACING_TOKENS = [
  "0", "1", "2", "4", "8", "12", "16", "20", "24", "32",
  "40", "48", "56", "64", "72", "80", "104", "128", "160",
  "xs", "s", "m", "l", "xl",
];

/** A t-shirt size scales with the viewport; a numeric step never does. */
export const spacingVar = (token) =>
  /^\d+$/.test(token) ? `var(--static-space-${token})` : `var(--responsive-space-${token})`;

/**
 * Prefix → the properties it sets. `x`/`y` expand to the two physical sides
 * rather than to `inline`/`block` logical properties, matching what the
 * hand-written file shipped; changing that is a separate, visible decision.
 */
export const SPACING_FAMILIES = [
  { prefix: "m", props: ["margin"] },
  { prefix: "mx", props: ["margin-left", "margin-right"] },
  { prefix: "my", props: ["margin-top", "margin-bottom"] },
  { prefix: "mt", props: ["margin-top"] },
  { prefix: "mr", props: ["margin-right"] },
  { prefix: "mb", props: ["margin-bottom"] },
  { prefix: "ml", props: ["margin-left"] },
  { prefix: "p", props: ["padding"] },
  { prefix: "px", props: ["padding-left", "padding-right"] },
  { prefix: "py", props: ["padding-top", "padding-bottom"] },
  { prefix: "pt", props: ["padding-top"] },
  { prefix: "pr", props: ["padding-right"] },
  { prefix: "pb", props: ["padding-bottom"] },
  { prefix: "pl", props: ["padding-left"] },
  { prefix: "g", props: ["gap"] },
];

/**
 * Not part of the token matrix: a negative one-pixel gap that laps adjacent
 * borders onto each other so a row of bordered children reads as one hairline
 * instead of two. It takes a child selector, so it stays a hand-written pair
 * rather than being bent into the loop above.
 */
export const SPACING_EXTRAS = [
  { selector: ".g-horizontal--1 > *:not(:first-child)", decls: ["margin-left: -1px;"] },
  { selector: ".g-vertical--1 > *:not(:first-child)", decls: ["margin-top: -1px;"] },
];

/**
 * The viewport steps, narrowest first. This is the single source: `breakpoints.scss`
 * is generated from it, so the widths cannot be stated twice and drift — which
 * would have generated utilities and component styles switching at different
 * widths, tearing the layout mid-resize.
 */
export const BREAKPOINTS = [
  { key: "xs", maxWidth: "480px" },
  { key: "s", maxWidth: "768px" },
  { key: "m", maxWidth: "1024px" },
  { key: "l", maxWidth: "1440px" },
];

/**
 * Widest first — the order rules must be *emitted* in.
 *
 * Every step is a `max-width` query, so they all match on a narrow viewport and
 * the last one in the file wins. Emit ascending and `.xs-` would be overruled
 * by `.l-` on a phone, which is exactly backwards. Reversed here once, with a
 * name, rather than left as a literal ordering nobody can see the reason for.
 */
export const BREAKPOINTS_CASCADE = [...BREAKPOINTS].reverse();

export const POSITION_VALUES = ["relative", "fixed", "absolute", "sticky", "static"];

/** Offsets take the numeric steps only — no t-shirt sizes, unlike spacing. */
export const OFFSET_TOKENS = SPACING_TOKENS.filter((t) => /^\d+$/.test(t));

export const OFFSET_SIDES = ["top", "left", "bottom", "right"];

/**
 * `0` is emitted bare rather than as `var(--static-space-0)`.
 *
 * The token resolves to `0` either way, so this changes nothing in the
 * browser — but spacing.scss wrote the var and position.scss wrote the
 * literal, and reproducing each file exactly is what makes the switch to
 * generated output provable instead of merely plausible.
 */
export const offsetValue = (token) => (token === "0" ? "0" : `var(--static-space-${token})`);

/* ---------------------------------------------------------------- flex --- */

export const FLEX_DIRECTIONS = ["column", "row", "column-reverse", "row-reverse"];

export const FLEX_WRAP = [
  { suffix: "flex-wrap", value: "wrap" },
  { suffix: "flex-nowrap", value: "nowrap" },
  { suffix: "flex-wrap-reverse", value: "wrap-reverse" },
];

/** `flex: 0` through `flex: 12`. */
export const FLEX_VALUES = Array.from({ length: 13 }, (_, i) => String(i));

/** `justify-content` takes the distribution values as well as the positional ones. */
export const JUSTIFY_ALIGNMENTS = [
  { suffix: "start", value: "flex-start" },
  { suffix: "center", value: "center" },
  { suffix: "end", value: "flex-end" },
  { suffix: "between", value: "space-between" },
  { suffix: "around", value: "space-around" },
  { suffix: "even", value: "space-evenly" },
  { suffix: "stretch", value: "stretch" },
];

/**
 * `align-items` takes only the positional values.
 *
 * `space-between` and its siblings belong to `align-content`, so the browser
 * dropped `align-items: space-between` and computed `normal` — `.align-between`,
 * `.align-around` and `.align-even` were fifteen classes, counting breakpoints,
 * that did nothing at all.
 *
 * They are not emitted. Nothing renders differently: an element that used to
 * get a class doing nothing now gets no class. `horizontal` and `vertical` keep
 * their full unions, because which of the two properties a value reaches
 * depends on `direction` — on a row `horizontal` is `justify-content`, on a
 * column it is `align-items` — so the same value is meaningful on one axis and
 * meaningless on the other.
 */
export const ALIGN_ALIGNMENTS = JUSTIFY_ALIGNMENTS.filter(
  ({ suffix }) => !["between", "around", "even"].includes(suffix),
);
