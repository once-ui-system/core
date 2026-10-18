import type { TextStyle, ViewStyle } from "react-native";
import type { Length } from "../components/spacing";
import type {
  ColorScheme,
  Colors,
  ColorWeight,
  RadiusSize,
  ShadowSize,
  SpacingToken,
  TextVariant,
} from "../types";
import {
  remFor,
  resolveTokens,
  type ShadowLayer,
  type StyleSettings,
  type TokenValue,
  toPx,
} from "./resolve";

/** Font families per text type, as loaded in the app (expo-font or native assets). */
export interface FontFamilies {
  heading?: string;
  body?: string;
  label?: string;
  code?: string;
}

const LETTER_SPACING: Record<string, number> = { xl: -0.05, l: -0.04, m: -0.03, s: -0.02 };

/** Everything a component reads from the theme, in React Native units. */
export interface OnceTheme {
  settings: StyleSettings;
  /** px per rem for this screen: 15 on phones, 16 on tablets, as on the web. */
  rem: number;
  /** Every resolved token, by its CSS name without `--`. */
  tokens: Record<string, TokenValue>;
  /** A length token (`"radius-l-nest-4"`, `"solid-border-width"`) in points. */
  px: (name: string) => number;
  /** A colour token: `"brand-solid-strong"`, `"neutral-alpha-weak"`, `"page-background"`. */
  color: (name: string) => string;
  /** A `background`/`border` prop value (`"neutral-medium"`, `"surface"`) as a colour. */
  background: (value: Colors | "surface" | "page" | "overlay" | "transparent") => string;
  border: (value: Colors | "surface" | "transparent") => string;
  /** `on-background` / `on-solid` text colour for a `"brand-strong"`-style value. */
  onBackground: (value: `${ColorScheme}-${ColorWeight}`) => string;
  onSolid: (value: `${ColorScheme}-${ColorWeight}`) => string;
  /**
   * A spacing token (`"16"`, `"m"`), a number of points (px, as a number is
   * in core 3.0), or a `"24px"` / `"1.5rem"` string, in points.
   */
  space: (value: SpacingToken | number | Length) => number;
  radius: (size: RadiusSize) => number;
  shadow: (size: ShadowSize) => ViewStyle;
  text: (variant: TextVariant) => TextStyle;
}

export function createTheme(
  settings: StyleSettings,
  width: number,
  fonts: FontFamilies = {},
): OnceTheme {
  const tokens = resolveTokens(settings, width);
  const rem = remFor(tokens, width);
  const px = (name: string, fallback = 0) => toPx(tokens[name], rem) ?? fallback;

  const color = (name: string) => {
    const value = tokens[name];
    return typeof value === "string" && value.startsWith("#") ? value : "transparent";
  };

  const schemeColor = (value: string, kind: "background" | "border") => {
    if (value === "transparent") return "transparent";
    if (value === "surface")
      return color(kind === "border" ? "surface-border" : "surface-background");
    if (value === "page") return color("page-background");
    if (value === "overlay") return color("backdrop");
    const alpha = value.match(/^(\w+)-alpha-(\w+)$/);
    if (alpha) return color(`${alpha[1]}-alpha-${alpha[2]}`);
    const [scheme, weight] = value.split("-");
    return color(`${scheme}-${kind}-${weight}`);
  };

  const space = (value: SpacingToken | number | Length) => {
    // 3.0: a number is px (density-independent points here), never rem.
    if (typeof value === "number") return value;
    if (/^\d+$/.test(value)) return px(`static-space-${value}`);
    const length = toPx(value, rem);
    if (length !== undefined) return length;
    return px(`responsive-space-${value}`);
  };

  const radius = (size: RadiusSize) => {
    if (size === "none") return 0;
    if (size === "full") return 9999;
    return px(`radius-${size}`);
  };

  const shadow = (size: ShadowSize): ViewStyle => {
    const layers = tokens[`shadow-${size}`] as ShadowLayer[] | undefined;
    if (!Array.isArray(layers)) return {};
    // `boxShadow` takes every layer on the New Architecture (RN 0.76+); the
    // `shadow*` and `elevation` fallbacks carry the largest one elsewhere.
    const last = layers[layers.length - 1];
    return {
      boxShadow: layers
        .map((l) => `${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`)
        .join(", "),
      shadowColor: "#000000",
      shadowOffset: { width: last.x, height: last.y },
      shadowOpacity: 0.16,
      shadowRadius: last.blur / 2,
      elevation: Math.round(last.blur / 3),
    };
  };

  const text = (variant: TextVariant): TextStyle => {
    const parts = variant.split("-");
    const size = parts.pop() as string;
    const weight = parts.pop() as string;
    const type = parts.join("-");
    const sizeMultiplier = Number(tokens[`font-size-${type}-multiplier`] ?? 1);
    const lineMultiplier = Number(tokens[`line-height-${type}-multiplier`] ?? 1);
    const fontSize = px(`font-size-${type}-${size}`, 16) * sizeMultiplier;
    // Core's weight classes read the display weights for every type.
    const fontWeight = String(tokens[`font-weight-display-${weight}`] ?? 400);
    const family = type === "display" ? fonts.heading : fonts[type as keyof FontFamilies];
    return {
      fontSize,
      lineHeight: px(`line-height-${type}-${size}`, fontSize * 1.5) * lineMultiplier,
      fontWeight: fontWeight as TextStyle["fontWeight"],
      ...(family ? { fontFamily: family } : {}),
      ...(type === "display" && LETTER_SPACING[size]
        ? { letterSpacing: LETTER_SPACING[size] * fontSize }
        : {}),
    };
  };

  return {
    settings,
    rem,
    tokens,
    px: (name) => px(name),
    color,
    background: (value) => schemeColor(value, "background"),
    border: (value) => schemeColor(value, "border"),
    onBackground: (value) => {
      const [scheme, weight] = value.split("-");
      return color(`${scheme}-on-background-${weight}`);
    },
    onSolid: (value) => {
      const [scheme, weight] = value.split("-");
      return color(`${scheme}-on-solid-${weight}`);
    },
    space,
    radius,
    shadow,
    text,
  };
}
