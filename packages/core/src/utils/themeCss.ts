import { cssColor } from "../internal/cssColor.js";
import {
  type CustomScheme,
  type CustomSchemeSeeds,
  type CustomSchemeThemedScales,
  customSchemeThemeProperties,
} from "./colorScheme.js";

/**
 * A colour for both themes, or one per theme: a token name
 * (`"neutral-background-weak"`, `"--my-page"`) or any CSS colour (`"#F7F5EF"`,
 * `"oklch(0.98 0.01 90)"`). A theme left out keeps the stylesheet's value.
 */
export type ThemeColor = string | { light?: string; dark?: string };

export interface ThemeStyleInput {
  seeds: CustomSchemeSeeds;
  scales: CustomSchemeThemedScales;
  pageBackground?: ThemeColor;
  surfaceBackground?: ThemeColor;
}

const THEMES = ["light", "dark"] as const;

/** The steps `data-<scheme>="custom"` maps, as foundations' function.scss does. */
const SCHEME_STEPS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "1000",
  "1100",
  "1200",
  "600-15",
  "600-30",
  "600-50",
];

/**
 * A config value as something safe to write into a declaration, or `null`.
 * Nothing that could close the declaration or the rule gets through, so a
 * value cannot add CSS of its own.
 */
export function themeCssValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || /[;{}<>\\\n\r]/.test(trimmed)) return null;
  return trimmed;
}

/** A {@link ThemeColor} entry as a CSS value: tokens become `var(--…)`. */
function colorValue(value: string | undefined): string | null {
  const safe = themeCssValue(value);
  if (!safe) return null;
  return cssColor(safe.replace(/^--/, ""));
}

const forTheme = (color: ThemeColor | undefined, theme: "light" | "dark") =>
  colorValue(typeof color === "string" ? color : color?.[theme]);

const block = (selector: string, properties: Record<string, string>) => {
  const body = Object.entries(properties)
    .map(([property, value]) => {
      const safe = themeCssValue(value);
      return safe ? `${property}:${safe};` : "";
    })
    .join("");
  return body ? `${selector}{${body}}` : "";
};

/**
 * The theme-dependent half of `ThemeInit`'s stylesheet: per-theme scheme
 * scales and the page and surface backgrounds. Each rule matches `<html>` in
 * that theme and any `data-theme` subtree, so a dark hero on a light page gets
 * the dark values too.
 *
 * `html:root` outranks foundations' `[data-theme]` and
 * `[data-surface][data-theme]` rules whatever order the stylesheets load in.
 *
 * Returns `root` (properties for both themes, as `customSchemeProperties`
 * gives them), `css` (the per-theme rules, empty when there are none) and
 * `schemes` (every custom scheme that produced steps, which implies
 * `"custom"`).
 */
export function themeStyle({ seeds, scales, pageBackground, surfaceBackground }: ThemeStyleInput): {
  root: Record<string, string>;
  css: string;
  schemes: CustomScheme[];
} {
  const { root, light, dark, byTheme } = customSchemeThemeProperties(seeds, scales);
  const byThemeProperties = { light, dark };
  const rules: string[] = [];

  for (const theme of THEMES) {
    const properties: Record<string, string> = { ...byThemeProperties[theme] };
    const page = forTheme(pageBackground, theme);
    if (page) properties["--page-background"] = page;
    rules.push(
      block(`html:root[data-theme="${theme}"],html:root [data-theme="${theme}"]`, properties),
    );
  }

  // The filled surface only: translucent is a different material (a tint and
  // a blur), and keeps its own.
  for (const theme of THEMES) {
    const surface = forTheme(surfaceBackground, theme);
    if (!surface) continue;
    rules.push(
      block(
        `html:root[data-surface="filled"][data-theme="${theme}"],html:root[data-surface="filled"] [data-theme="${theme}"]`,
        { "--surface-background": surface },
      ),
    );
  }

  // `--function-<scheme>-*` resolve on <html>, so a subtree that redeclares
  // the scheme's steps still inherits <html>'s ramp. Remapping them on the
  // subtree is what lets a dark hero read its own steps.
  for (const scheme of byTheme) {
    const remap: Record<string, string> = {};
    for (const step of SCHEME_STEPS) {
      remap[`--function-${scheme}-${step}`] = `var(--scheme-${scheme}-${step})`;
    }
    rules.push(block(`html:root[data-${scheme}="custom"] [data-theme]`, remap));
  }

  const schemes = (["brand", "accent", "neutral"] as const).filter(
    (scheme) => root[`--scheme-${scheme}-600`] || byTheme.includes(scheme),
  );
  return { root, css: rules.join(""), schemes };
}
