/**
 * E3: the one resolver for free colour props (Background, ParticleFx, the
 * charts and gauges). A value is read in this order:
 *
 * - a raw CSS colour passes through as written: `#fff`, `rgb(…)`, `hsl(…)`,
 *   `oklch(…)`, `color-mix(…)`, `var(…)` or any other function, a named
 *   colour (`white`, `rebeccapurple`) or a keyword (`transparent`,
 *   `currentColor`);
 * - a custom property name `--x` becomes `var(--x)`;
 * - a tone and weight, `brand-weak`, is the on-background colour of that tone
 *   (`var(--brand-on-background-weak)`), which is what the short form means on
 *   the role props too;
 * - anything else is a token name: `brand-on-background-weak` becomes
 *   `var(--brand-on-background-weak)`.
 *
 * With a `prefix` (the charts pass `data-`), a palette hue is that palette's
 * token first: `blue` is `var(--data-blue)`, not the CSS colour `blue`.
 *
 * 2.x wrapped every value in `var(--…)`, so `#fff` became `var(--#fff)` and
 * `brand-weak` became `var(--brand-weak)`, neither of which paints anything.
 */

const FUNCTION = /^[a-z-]+\(.*\)$/is;

const KEYWORDS = new Set(["transparent", "currentcolor", "inherit", "initial", "unset", "revert"]);

// CSS Color Module Level 4 named colours.
const NAMED = new Set(
  (
    "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue " +
    "blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk " +
    "crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki " +
    "darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen " +
    "darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue " +
    "dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite " +
    "gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki " +
    "lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan " +
    "lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen " +
    "lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen " +
    "magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen " +
    "mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream " +
    "mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid " +
    "palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum " +
    "powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown " +
    "seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen " +
    "steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen"
  ).split(" "),
);

/** The `--data-*` palette the charts and gauges draw from. */
const DATA_HUES = new Set(
  "blue indigo violet magenta pink red orange yellow moss green emerald aqua cyan gray contrast".split(
    " ",
  ),
);

const TONE_WEIGHT = /^(neutral|brand|accent|info|danger|warning|success)-(weak|medium|strong)$/;

/** A value CSS can paint as written, with no token lookup. */
export function isRawColor(value: string): boolean {
  const v = value.trim();
  if (v.startsWith("#") || FUNCTION.test(v)) return true;
  const word = v.toLowerCase();
  return KEYWORDS.has(word) || NAMED.has(word);
}

/** A colour prop as a CSS value; see the comment at the top of this file. */
export function cssColor(value: string, prefix = ""): string {
  const v = value.trim();
  if (prefix && DATA_HUES.has(v)) return `var(--${prefix}${v})`;
  if (isRawColor(v)) return v;
  if (v.startsWith("--")) return `var(${v})`;
  const short = TONE_WEIGHT.exec(v);
  if (short) return `var(--${short[1]}-on-background-${short[2]})`;
  if (prefix && /^[a-z]+$/.test(v)) return `var(--${prefix}${v})`;
  return `var(--${v})`;
}
