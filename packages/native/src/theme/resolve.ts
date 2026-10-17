import tokenFile from "@once-ui-system/foundations/tokens.json";
import type {
  BodyLineHeight,
  BodySize,
  BorderStyle,
  DeviceFontSize,
  NeutralColor,
  ScalingSize,
  Schemes,
  SolidStyle,
  SolidType,
  SurfaceStyle,
} from "../types";

/** One shadow layer, as the token export writes it. */
export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export type TokenValue = string | number | ShadowLayer[];

/** One CSS rule of `scss/tokens/`, see `packages/foundations/tokens/README.md`. */
export interface TokenLayer {
  when: Record<string, string>;
  maxWidth?: number;
  tokens: Record<string, TokenValue>;
}

export interface TokenFile {
  format: string;
  version: number;
  breakpoints: Record<string, number>;
  layers: TokenLayer[];
}

/** The style options of core's `ThemeProvider`, with `theme` already resolved. */
export interface StyleSettings {
  theme: "light" | "dark";
  brand: Schemes;
  accent: Schemes;
  neutral: NeutralColor;
  solid: SolidType;
  solidStyle: SolidStyle;
  border: BorderStyle;
  surface: SurfaceStyle;
  scaling: ScalingSize;
  bodySize: BodySize;
  bodyLineHeight: BodyLineHeight;
  desktopSize?: DeviceFontSize;
  tabletSize?: DeviceFontSize;
  mobileSize?: DeviceFontSize;
}

/** Core's defaults (`defaultStyleOptions` in core's `ThemeProvider.tsx`). */
export const defaultSettings: Omit<StyleSettings, "theme"> = {
  brand: "blue",
  accent: "indigo",
  neutral: "gray",
  solid: "contrast",
  solidStyle: "flat",
  border: "playful",
  surface: "filled",
  scaling: "100",
  bodySize: "100",
  bodyLineHeight: "100",
};

export const tokens = tokenFile as unknown as TokenFile;

/**
 * Every token for these settings on a screen `width` points wide, with
 * references followed: what `getComputedStyle` would report for each custom
 * property on the web. Layers apply in CSS cascade order (fewest conditions
 * first, then file order), so the result matches the browser.
 */
export function resolveTokens(
  settings: StyleSettings,
  width: number,
  file: TokenFile = tokens,
): Record<string, TokenValue> {
  const options = settings as unknown as Record<string, string | undefined>;
  const matching = file.layers
    .map((layer, index) => ({ layer, index }))
    .filter(
      ({ layer }) =>
        (layer.maxWidth === undefined || width <= layer.maxWidth) &&
        Object.entries(layer.when).every(([key, value]) => options[key] === value),
    )
    .sort(
      (a, b) =>
        Math.max(1, Object.keys(a.layer.when).length) -
          Math.max(1, Object.keys(b.layer.when).length) || a.index - b.index,
    );

  const raw: Record<string, TokenValue> = {};
  for (const { layer } of matching) Object.assign(raw, layer.tokens);

  const resolved: Record<string, TokenValue> = {};
  const follow = (name: string, seen: string[]): TokenValue | undefined => {
    if (name in resolved) return resolved[name];
    let value = raw[name];
    if (typeof value === "string") {
      const ref = value.match(/^\{([\w-]+)\}$/);
      if (ref) {
        if (seen.includes(ref[1])) return undefined;
        value = follow(ref[1], [...seen, name]) as TokenValue;
      }
    }
    if (value !== undefined) resolved[name] = value;
    return value;
  };
  for (const name of Object.keys(raw)) follow(name, [name]);
  return resolved;
}

/** The root font size in px for a screen `width` points wide (`--font-scaling-*`). */
export function remFor(resolved: Record<string, TokenValue>, width: number, file = tokens): number {
  const { s, m } = file.breakpoints;
  const key =
    width <= s
      ? "font-scaling-mobile"
      : width <= m
        ? "font-scaling-tablet"
        : "font-scaling-desktop";
  return toPx(resolved[key], 16) ?? 16;
}

/** A length token ("1.5rem", "1px", 0) in points. */
export function toPx(value: TokenValue | undefined, rem: number): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  const m = value.match(/^(-?[\d.]+)(rem|px)?$/);
  if (!m) return undefined;
  const n = Number.parseFloat(m[1]);
  return m[2] === "rem" ? n * rem : n;
}
