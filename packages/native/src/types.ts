/**
 * The token types of `@once-ui-system/core` (`packages/core/src/types.ts` and
 * the theme options in `contexts/ThemeProvider.tsx`), so a prop written for the
 * web compiles here unchanged. `test/types.test.ts` fails if they drift from
 * core's.
 */

export type StaticSpacingToken =
  | "0"
  | "1"
  | "2"
  | "4"
  | "8"
  | "12"
  | "16"
  | "20"
  | "24"
  | "32"
  | "40"
  | "48"
  | "56"
  | "64"
  | "72"
  | "80"
  | "104"
  | "128"
  | "160";

export type CondensedTShirtSizes = "s" | "m" | "l";
export type TShirtSizes = CondensedTShirtSizes | "xs" | "xl";
export type ResponsiveSpacingToken = TShirtSizes;
export type ShadowSize = TShirtSizes;
export type SpacingToken = StaticSpacingToken | ResponsiveSpacingToken;

export type Opacity = 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;

export type ColorScheme =
  | "neutral"
  | "brand"
  | "accent"
  | "info"
  | "danger"
  | "warning"
  | "success";
/**
 * Which semantic palette a component draws in, as core 3.0's `tone` on Button,
 * IconButton, Tag, Feedback and Toast. `variant` says how it looks.
 */
export type Tone = ColorScheme;

export type ColorWeight = "weak" | "medium" | "strong";
export type Colors = `${ColorScheme}-${ColorWeight}` | `${ColorScheme}-alpha-${ColorWeight}`;

export type RadiusSize = TShirtSizes | "full" | "none";

export type TextType = "body" | "heading" | "display" | "label" | "code";
export type TextWeight = "default" | "normal" | "medium" | "strong";
export type TextSize = TShirtSizes;
export type TextVariant = `${TextType}-${TextWeight}-${TextSize}`;

export type Schemes =
  | "blue"
  | "indigo"
  | "violet"
  | "magenta"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "moss"
  | "green"
  | "emerald"
  | "aqua"
  | "cyan";

export type Theme = "dark" | "light" | "system";
export type NeutralColor = "sand" | "gray" | "slate" | "rose" | "mint" | "dusk";
export type SolidType = "color" | "contrast" | "inverse";
export type SolidStyle = "flat" | "plastic";
export type BorderStyle = "rounded" | "playful" | "conservative" | "sharp";
export type SurfaceStyle = "filled" | "translucent";
export type ScalingSize = "90" | "95" | "100" | "105" | "110";
/** As core's: how roomy the controls are. */
export type Density = "compact" | "normal" | "spacious";
export type BodySize = "90" | "95" | "100" | "105" | "110";
export type BodyLineHeight = "90" | "100" | "110" | "120";
export type DeviceFontSize = "13" | "14" | "15" | "16" | "17" | "18";
