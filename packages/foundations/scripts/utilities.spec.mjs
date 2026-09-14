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

/* -------------------------------------------------------------- border --- */

/** The colour families every scheme-keyed utility repeats over. */
export const SCHEMES = ["neutral", "brand", "accent", "info", "danger", "warning", "success"];

export const WEIGHTS = ["weak", "medium", "strong"];

/** Radius steps, in the source order the hand-written file used. */
export const RADIUS_SIZES = ["xl", "l", "m", "s", "xs"];

/** Nesting radii: an inner corner inset by 4 or 8 from its parent. */
export const RADIUS_NESTS = ["4", "8"];

/**
 * Corner groups and the physical corners each one rounds. `full` joins the
 * sized steps here but has no nesting variants.
 */
export const RADIUS_CORNERS = [
  { suffix: "top", corners: ["top-right", "top-left"] },
  { suffix: "right", corners: ["bottom-right", "top-right"] },
  { suffix: "bottom", corners: ["bottom-right", "bottom-left"] },
  { suffix: "left", corners: ["bottom-left", "top-left"] },
  { suffix: "top-left", corners: ["top-left"] },
  { suffix: "top-right", corners: ["top-right"] },
  { suffix: "bottom-right", corners: ["bottom-right"] },
  { suffix: "bottom-left", corners: ["bottom-left"] },
];

export const BORDER_STYLES = ["solid", "dashed"];

export const BORDER_WIDTHS = ["1", "2", "4", "6", "8"];

/** Only 1px exists per side; the wider steps are whole-border only. */
export const BORDER_SIDES = [
  { suffix: "top", props: ["border-top-width"] },
  { suffix: "bottom", props: ["border-bottom-width"] },
  { suffix: "left", props: ["border-left-width"] },
  { suffix: "right", props: ["border-right-width"] },
  { suffix: "x", props: ["border-left-width", "border-right-width"] },
  { suffix: "y", props: ["border-top-width", "border-bottom-width"] },
];

/* ---------------------------------------------------------- background --- */

/**
 * The three background ramps a scheme offers. `background` and `solid` take
 * their own token of the same name; the alpha ramp is named
 * `--<scheme>-alpha-<weight>`, without the `background` in the middle.
 */
export const BACKGROUND_RAMPS = [
  { suffix: "background", token: (scheme, w) => `--${scheme}-background-${w}` },
  { suffix: "solid", token: (scheme, w) => `--${scheme}-solid-${w}` },
  { suffix: "background-alpha", token: (scheme, w) => `--${scheme}-alpha-${w}` },
];

/**
 * Text selection inside a tinted surface, so the highlight stays legible
 * against whatever the surface is rather than falling back to the browser's
 * blue. Both rules pin the pair to the scheme's `weak` step regardless of the
 * surface's own weight — a selection that changed colour with the surface
 * would be the thing that needs the contrast checking, not the thing that
 * provides it.
 */
export const SELECTION_GROUPS = [
  {
    // Every background and alpha step shares one selection treatment.
    ramps: ["background", "background-alpha"],
    decls: (scheme) => [
      `background-color: var(--${scheme}-on-background-weak);`,
      `color: var(--${scheme}-background-weak);`,
    ],
  },
  {
    // Solid surfaces invert it: the selection reads as the page behind them.
    ramps: ["solid"],
    decls: (scheme) => [
      `background-color: var(--${scheme}-background-weak);`,
      `color: var(--${scheme}-on-background-medium);`,
    ],
  },
];

/* ------------------------------------------------------------- display --- */

/** Overflow utilities, repeated at every breakpoint. */
export const OVERFLOW_RULES = [
  { suffix: "overflow-auto", prop: "overflow", value: "auto" },
  { suffix: "overflow-x-scroll", prop: "overflow-x", value: "scroll" },
  { suffix: "overflow-x-auto", prop: "overflow-x", value: "auto" },
  { suffix: "overflow-y-auto", prop: "overflow-y", value: "auto" },
  { suffix: "overflow-y-scroll", prop: "overflow-y", value: "scroll" },
  { suffix: "overflow-hidden", prop: "overflow", value: "hidden" },
  { suffix: "overflow-scroll", prop: "overflow", value: "scroll" },
  { suffix: "overflow-x-hidden", prop: "overflow-x", value: "hidden" },
  { suffix: "overflow-y-hidden", prop: "overflow-y", value: "hidden" },
];

/**
 * The minimal scrollbar, WebKit only — pseudo-elements with no matrix to them,
 * so they are stated rather than looped. They stay in this file because they
 * are what `scrollbar="minimal"` reaches for, alongside the overflow classes.
 */
export const SCROLLBAR_RULES = [
  {
    selector: ".scrollbar-minimal::-webkit-scrollbar",
    decls: [
      "background: var(--static-transparent);",
      "width: var(--static-space-4);",
      "height: var(--static-space-4);",
    ],
  },
  {
    selector: ".scrollbar-minimal::-webkit-scrollbar-track",
    decls: ["background: var(--static-transparent);"],
  },
  {
    selector: ".scrollbar-minimal::-webkit-scrollbar-thumb",
    decls: [
      "background: var(--neutral-alpha-medium);",
      "transition: var(--transition-micro-medium);",
      "border-radius: var(--radius-full);",
    ],
  },
  {
    selector: ".scrollbar-minimal::-webkit-scrollbar-thumb:hover",
    decls: ["background: var(--neutral-alpha-strong);"],
  },
  {
    selector: ".scrollbar-minimal::-webkit-scrollbar-corner",
    decls: ["background-color: var(--static-transparent);"],
  },
];

/** `opacity: 0` through `1`, in tenths, named by percentage. */
export const OPACITY_STEPS = Array.from({ length: 11 }, (_, i) => String(i * 10));

/** `-1` parks an element behind its siblings; the rest stack forward. */
export const Z_INDEX_STEPS = ["-1", ...Array.from({ length: 11 }, (_, i) => String(i))];

export const TRANSITIONS = ["micro", "macro"].flatMap((scale) =>
  ["short", "medium", "long"].map((length) => `${scale}-${length}`),
);

export const POINTER_EVENTS = ["none", "auto", "all"];

/**
 * `interactive` is the odd one out: it reads `--cursor-interactive`, which a
 * theme can point at a custom cursor. Every other value is the plain CSS
 * keyword of the same name.
 */
export const CURSORS = [
  "interactive", "pointer", "default", "text", "move", "not-allowed",
  "wait", "help", "grab", "grabbing", "zoom-in", "zoom-out",
];

export const cursorValue = (name) =>
  name === "interactive" ? "var(--cursor-interactive)" : name;

/* ---------------------------------------------------------------- grid --- */

/** A twelve-column grid; `columns-1` is a single `1fr` rather than a repeat. */
export const GRID_COLUMNS = Array.from({ length: 12 }, (_, i) => String(i + 1));

export const gridTemplate = (n) => (n === "1" ? "1fr" : `repeat(${n}, 1fr)`);

/* ------------------------------------------------- colour, shadow, size --- */

/** Foreground ramps: text on a tinted background, and text on a solid fill. */
export const ON_RAMPS = ["on-background", "on-solid"];

export const SHADOW_SIZES = ["xs", "s", "m", "l", "xl"];

/** Max-width steps track the viewport, so they read the responsive scale. */
export const MAX_WIDTH_SIZES = ["xs", "s", "m", "l", "xl"];

/**
 * Sizing rules with no matrix behind them — a handful of fixed pairs, stated
 * rather than looped, because inventing a family for six rules would obscure
 * more than it saves.
 */
export const SIZE_RULES = [
  { selector: ".fill-width", decls: ["width: 100%;"] },
  { selector: ".fill-height", decls: ["height: 100%;"] },
  { selector: ".fill", decls: ["width: 100%;", "height: 100%;"] },
  { selector: ".fit-width", decls: ["width: fit-content;"] },
  { selector: ".fit-height", decls: ["height: fit-content;"] },
  { selector: ".fit", decls: ["width: fit-content;", "height: fit-content;"] },
];

/* ---------------------------------------------------------- typography --- */

export const FONT_SIZES = ["xl", "l", "m", "s", "xs"];

export const FONT_WEIGHTS = ["default", "normal", "medium", "strong"];

/**
 * Optical tracking for display type: the larger the size, the tighter it sets.
 * Only `display` carries it — headings and body text keep their natural
 * spacing — and `xs` gets none, being small enough that tightening would start
 * closing up the counters.
 */
export const DISPLAY_TRACKING = {
  xl: "-0.05em",
  l: "-0.04em",
  m: "-0.03em",
  s: "-0.02em",
};

/**
 * The five type families.
 *
 * `family` is the font each one asks for; `scale` is the size ramp it measures
 * against, and the two part company for `code`, which uses its own monospace
 * face at the label scale so an inline snippet matches the label beside it
 * rather than setting its own rhythm.
 */
export const FONT_TYPES = [
  // `display` sets the heading face, not a face of its own: there is no
  // `--font-display` token anywhere in the token layer. `.font-display` already
  // read `--font-heading`; `.font-family-display` read the undefined
  // `--font-display` and so applied nothing at all, leaving the element on
  // whatever it inherited. Both read the same token here, which is what the
  // two classes sharing a name always implied.
  { name: "display", family: "heading", scale: "display", tracking: DISPLAY_TRACKING },
  { name: "heading", family: "heading", scale: "heading" },
  { name: "body", family: "body", scale: "body" },
  { name: "label", family: "label", scale: "label" },
  { name: "code", family: "code", scale: "label" },
];

/**
 * Root font-size per viewport. The three steps are deliberately two values:
 * `xs` repeats the mobile scaling rather than shrinking again, so the smallest
 * screens do not end up with text smaller than the phone the scale was tuned
 * for.
 */
export const FONT_SCALING = [
  { key: "m", value: "var(--font-scaling-tablet)" },
  { key: "s", value: "var(--font-scaling-mobile)" },
  { key: "xs", value: "var(--font-scaling-mobile)" },
];
