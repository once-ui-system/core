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
  "40", "48", "56", "64", "80", "104", "128", "160",
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
 * The viewport steps, largest first, as `max-width` queries — the order the
 * hand-written files emitted them in, and the order a cascade needs: a narrower
 * query must come later to win.
 *
 * These live here rather than in `breakpoints.scss` because a generator cannot
 * read a Sass variable. The two must agree; `scss/styles/breakpoints.scss` is
 * the one a human edits by hand today, so a test pins them together.
 */
export const BREAKPOINTS = [
  { key: "l", maxWidth: "1440px" },
  { key: "m", maxWidth: "1024px" },
  { key: "s", maxWidth: "768px" },
  { key: "xs", maxWidth: "480px" },
];

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
