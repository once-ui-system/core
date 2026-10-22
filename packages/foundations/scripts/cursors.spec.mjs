/**
 * Cursor presets: named looks for the native cursor, drawn as SVG and set
 * through the `--cursor-*` properties, so the browser draws them itself (no
 * script, no lag) and every state a control asks for keeps working.
 *
 * Each preset draws four states, each with its hotspot in image pixels:
 *   default   the arrow over the page
 *   pointer   over anything clickable (`--cursor-interactive` follows it)
 *   text      over a text field
 *   disabled  over a disabled control
 *
 * A preset may draw a second set for dark mode; a preset without one is
 * drawn the same in both themes.
 */

const SIZE = 28;

const svg = (body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
  (defs ? `<defs>${defs}</defs>` : "") +
  body +
  "</svg>";

const shadow = (opacity) =>
  `<filter id="s" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity="${opacity}"/></filter>`;

/*
 * Shapes are drawn twice: once with a wide stroke in the rim colour (which
 * also carries the shadow), then filled on top. Overlapping parts merge into
 * one silhouette with one outline, which is how the hand is built from
 * rounded bars.
 */
const rimmed = (shapes, { fill, rim, rimWidth, shadowOpacity }, creases = "") =>
  svg(
    `<g filter="url(#s)" fill="${rim}" stroke="${rim}" stroke-width="${rimWidth}" stroke-linejoin="round" stroke-linecap="round">${shapes}</g>` +
      `<g fill="${fill}">${shapes}</g>` +
      (creases ? `<g stroke="${rim}" stroke-width=".9" stroke-linecap="round">${creases}</g>` : ""),
    shadow(shadowOpacity),
  );

// A wedge: tip at the top left, two wings, a notch between them.
const WEDGE =
  '<path d="M4.6 3.2 L23.4 10.2 Q25 10.8 23.5 11.9 L15.9 15.9 L11.9 23.5 Q10.8 25 10.2 23.4 L3.2 4.6 Q2.8 2.8 4.6 3.2 Z"/>';

// The classic arrow with a tail, every corner rounded.
const ARROW =
  '<path d="M6 3.4 Q4.8 2.6 4.8 4.1 L4.8 20.4 Q4.8 22 6.1 21 L9.9 17.8 L12.6 24 Q13.2 25.2 14.4 24.7 L16.1 23.9 Q17.2 23.3 16.7 22.2 L14.1 16.3 L19.2 16.1 Q20.8 15.9 19.6 14.9 Z"/>';

// A hand with the index finger raised, built from rounded bars.
const HAND = [
  '<rect x="10.2" y="2.6" width="4.4" height="13.4" rx="2.2"/>',
  '<rect x="14" y="8.4" width="4.2" height="8.6" rx="2.1"/>',
  '<rect x="17.6" y="9.4" width="4.1" height="8" rx="2.05"/>',
  '<rect x="21.1" y="11" width="3.8" height="7" rx="1.9"/>',
  '<rect x="8.4" y="12.6" width="16.5" height="12.4" rx="5"/>',
  '<rect x="4.4" y="11.6" width="4.2" height="9.4" rx="2.1" transform="rotate(-38 6.5 16.3)"/>',
].join("");

// The gaps between the fingers, drawn in the rim colour over the fill.
const HAND_CREASES = '<path d="M14.3 10.6 L14.3 14.2 M17.9 11.6 L17.9 14.6 M21.4 13 L21.4 15.4"/>';

// An I-beam with rounded serifs.
const BEAM =
  '<path d="M10 5.2 L12 5.2 Q14 5.2 14 7.2 Q14 5.2 16 5.2 L18 5.2 M14 7.2 L14 20.8 M10 22.8 L12 22.8 Q14 22.8 14 20.8 Q14 22.8 16 22.8 L18 22.8" fill="none"/>';

const beam = ({ ink, rim, shadowOpacity }) =>
  svg(
    `<g filter="url(#s)" fill="none" stroke="${rim}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">${BEAM}</g>` +
      `<g fill="none" stroke="${ink}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${BEAM}</g>`,
    shadow(shadowOpacity),
  );

// A ring with a bar through it.
const BLOCKED =
  '<circle cx="14" cy="14" r="7.6" fill="none"/><path d="M8.7 19.3 L19.3 8.7" fill="none"/>';

const blocked = ({ ink, rim, shadowOpacity }) =>
  svg(
    `<circle cx="14" cy="14" r="10.3" fill="${rim}" filter="url(#s)"/>` +
      `<g stroke="${ink}" stroke-width="2.4" stroke-linecap="round">${BLOCKED}</g>`,
    shadow(shadowOpacity),
  );

const dot = ({ fill, rim, r, shadowOpacity }) =>
  svg(
    `<circle cx="14" cy="14" r="${r}" fill="${fill}" stroke="${rim}" stroke-width="1.6" filter="url(#s)"/>`,
    shadow(shadowOpacity),
  );

const ring = ({ ink, rim, shadowOpacity }) =>
  svg(
    `<circle cx="14" cy="14" r="10.4" fill="none" stroke="${rim}" stroke-width="4.4" filter="url(#s)"/>` +
      `<circle cx="14" cy="14" r="10.4" fill="${ink}" fill-opacity=".12" stroke="${ink}" stroke-width="1.8"/>` +
      `<circle cx="14" cy="14" r="2.4" fill="${ink}" stroke="${rim}" stroke-width="1.2"/>`,
    shadow(shadowOpacity),
  );

/** A preset's four states for one theme. */
const arrowSet = (shape, { fill, rim, rimWidth, shadowOpacity }, hotspot) => ({
  default: {
    svg: rimmed(shape, { fill, rim, rimWidth, shadowOpacity }),
    hotspot,
    fallback: "default",
  },
  pointer: {
    svg: rimmed(HAND, { fill, rim, rimWidth: rimWidth + 0.4, shadowOpacity }, HAND_CREASES),
    hotspot: [12, 3],
    fallback: "pointer",
  },
  text: { svg: beam({ ink: fill, rim, shadowOpacity }), hotspot: [14, 14], fallback: "text" },
  disabled: {
    svg: blocked({ ink: fill, rim, shadowOpacity }),
    hotspot: [14, 14],
    fallback: "not-allowed",
  },
});

const dotSet = ({ fill, rim, shadowOpacity }) => ({
  default: {
    svg: dot({ fill, rim, r: 4.6, shadowOpacity }),
    hotspot: [14, 14],
    fallback: "default",
  },
  pointer: { svg: ring({ ink: fill, rim, shadowOpacity }), hotspot: [14, 14], fallback: "pointer" },
  text: { svg: beam({ ink: fill, rim, shadowOpacity }), hotspot: [14, 14], fallback: "text" },
  disabled: {
    svg: blocked({ ink: fill, rim, shadowOpacity }),
    hotspot: [14, 14],
    fallback: "not-allowed",
  },
});

/**
 * The presets, in the order the docs show them.
 *
 * soft     a dark wedge with a white rim and a soft shadow, the same in both
 *          themes: it reads on light and dark pages alike.
 * rounded  the classic arrow, rounded off, in warm ink that turns light in
 *          dark mode.
 * dot      a small dot that opens into a ring over anything clickable.
 */
export const CURSOR_PRESETS = [
  {
    name: "soft",
    light: arrowSet(
      WEDGE,
      { fill: "#121212", rim: "#ffffff", rimWidth: 2.4, shadowOpacity: 0.32 },
      [4, 4],
    ),
  },
  {
    name: "rounded",
    light: arrowSet(
      ARROW,
      { fill: "#2a2826", rim: "#ffffff", rimWidth: 2.4, shadowOpacity: 0.22 },
      [5, 3],
    ),
    dark: arrowSet(
      ARROW,
      { fill: "#f6f4ef", rim: "#1c1b19", rimWidth: 2.4, shadowOpacity: 0.4 },
      [5, 3],
    ),
  },
  {
    name: "dot",
    light: dotSet({ fill: "#1a1a1a", rim: "#ffffff", shadowOpacity: 0.25 }),
    dark: dotSet({ fill: "#f4f4f4", rim: "#161616", shadowOpacity: 0.45 }),
  },
];

/** `system` turns a preset off for a subtree: the browser's own cursors. */
export const CURSOR_SYSTEM = "system";

export const CURSOR_STATES = ["default", "pointer", "text", "disabled"];

/**
 * `url("data:…") x y, fallback`, for a `cursor` value. The SVG's quotes become
 * single quotes and only the characters a data URL cannot hold are escaped,
 * which keeps it well under the size `encodeURIComponent` gives.
 */
export const cursorImage = ({ svg: source, hotspot: [x, y], fallback }) => {
  // `.` is escaped too, so nothing in the URL reads as a class selector
  // (`www.w3.org`) to tools that scan the stylesheet.
  const data = source
    .replace(/"/g, "'")
    .replace(/[<>#%\n]/g, (c) => encodeURIComponent(c))
    .replace(/\./g, "%2E");
  return `url("data:image/svg+xml,${data}") ${x} ${y}, ${fallback}`;
};
