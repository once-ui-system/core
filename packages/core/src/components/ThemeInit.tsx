import type React from "react";
import type { OnceUIStyleConfig } from "../contexts/ThemeProvider";
import type { ChartMode } from "../modules/data/interfaces";
import {
  type CustomScheme,
  type CustomSchemeScales,
  type CustomSchemeSeeds,
  customSchemeProperties,
  type SchemeScale,
} from "../utils/colorScheme";
import { safeScriptJson } from "../utils/safe-html";

/**
 * The shape `ThemeInit` took in 2.0: attribute names rather than the config's
 * keys, every value a plain string. Still accepted, so a layout written
 * against 2.0 compiles unchanged.
 *
 * `"viz-style"` is the chart *mode* (`categorical | divergent | sequential`).
 * The 2.0 docs filled it from `dataStyle.variant`, which is a different
 * setting; pass `dataStyle` instead and the mode is read from it.
 */
export interface ThemeInitAttributeConfig {
  theme: string;
  brand: string;
  accent: string;
  neutral: string;
  solid: string;
  "solid-style": string;
  border: string;
  surface: string;
  transition: string;
  scaling: string;
  "viz-style": string;
}

/** `once-ui.config`'s `style` as written, or the 2.0 attribute-named shape. */
export type ThemeInitConfig = OnceUIStyleConfig | ThemeInitAttributeConfig;

export interface ThemeInitProps {
  /** The `style` section of `once-ui.config`, as written. */
  config: ThemeInitConfig;
  /** The `dataStyle` section; its `mode` becomes `data-viz-style`. */
  dataStyle?: { mode?: ChartMode };
}

const toKebab = (key: string) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** Style keys that seed a custom scheme rather than naming an attribute. */
const SEED_KEYS: Record<string, CustomScheme> = {
  brandSeed: "brand",
  accentSeed: "accent",
  neutralSeed: "neutral",
};

/** Style keys that pin a custom scheme's steps rather than naming an attribute. */
const SCALE_KEYS: Record<string, CustomScheme> = {
  brandScale: "brand",
  accentScale: "accent",
  neutralScale: "neutral",
};

/** Keys the script reads itself instead of copying onto `<html>`. */
const SCRIPT_KEYS = new Set(["defaultTheme"]);

/**
 * The attributes the inline script writes, keyed without the `data-` prefix.
 * Resolved here, on the server, so the script stays a dumb copy loop.
 */
function themeInitAttributes(
  config: ThemeInitConfig,
  dataStyle: ThemeInitProps["dataStyle"],
  schemeProperties: Record<string, string>,
): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === null || value === "") continue;
    if (key in SEED_KEYS || key in SCALE_KEYS || SCRIPT_KEYS.has(key)) continue;
    attributes[toKebab(key)] = String(value);
  }
  // A seed or scale implies "custom" when the scheme is not named, as on
  // ThemeProvider — and only one that produced a scheme.
  for (const scheme of Object.values(SEED_KEYS)) {
    if (!attributes[scheme] && schemeProperties[`--scheme-${scheme}-600`]) {
      attributes[scheme] = "custom";
    }
  }
  if (dataStyle?.mode) attributes["viz-style"] = dataStyle.mode;
  return attributes;
}

export const ThemeInit: React.FC<ThemeInitProps> = ({ config, dataStyle }) => {
  const seeds: CustomSchemeSeeds = {};
  for (const [key, scheme] of Object.entries(SEED_KEYS)) {
    const seed = (config as Record<string, unknown>)[key];
    if (typeof seed === "string") seeds[scheme] = seed;
  }
  // Generated here, on the server, so a custom scheme is in the document
  // before anything paints: no flash of a page with no brand colour.
  const scales: CustomSchemeScales = {};
  for (const [key, scheme] of Object.entries(SCALE_KEYS)) {
    const scale = (config as Record<string, unknown>)[key];
    if (scale && typeof scale === "object") scales[scheme] = scale as SchemeScale;
  }
  const schemeProperties = customSchemeProperties(seeds, scales);
  const defaultTheme = (config as Record<string, unknown>).defaultTheme;
  const schemeCss = Object.entries(schemeProperties)
    .map(([property, value]) => `${property}:${value};`)
    .join("");

  const script = (
    <script
      id="theme-init"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: a pre-paint theme script cannot be a React effect, and the payload is serialised with safeScriptJson
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const root = document.documentElement;
              const config = ${safeScriptJson(themeInitAttributes(config, dataStyle, schemeProperties))};
              const defaultTheme = ${safeScriptJson(typeof defaultTheme === "string" ? defaultTheme : null)};

              // Apply config defaults FIRST (prevents FOUC)
              Object.entries(config).forEach(([key, value]) => {
                root.setAttribute('data-' + key, value);
              });

              const resolveTheme = (themeValue) => {
                if (!themeValue || themeValue === 'system') {
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                return themeValue;
              };

              // Priority:
              // 1. localStorage
              // 2. config.defaultTheme
              // 3. config.theme
              const savedTheme = localStorage.getItem('data-theme');
              const finalTheme = savedTheme ?? defaultTheme ?? config.theme;

              root.setAttribute('data-theme', resolveTheme(finalTheme));

              // Apply overrides AFTER theme
              Object.keys(config).forEach(key => {
                // The saved theme can be "system", resolved above.
                if (key === 'theme') return;
                const value = localStorage.getItem('data-' + key);
                if (value) {
                  root.setAttribute('data-' + key, value);
                }
              });

            } catch (e) {
              console.error('Failed to initialize theme:', e);
              // Fall back to the system preference, not a hardcoded theme: forcing
              // dark on a light-mode visitor is a worse failure than doing nothing.
              var prefersDark = window.matchMedia
                && window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            }
          })();
        `,
      }}
    />
  );

  // Without a seed the output is the script alone, exactly as before.
  if (!schemeCss) return script;

  return (
    <>
      <style
        id="theme-init-schemes"
        // `html:root` rather than `:root`: a seed is the page's own choice, so
        // it outranks a static custom palette declared on a plain `:root`
        // (an app's own brand scheme) whatever order the stylesheets load in.
        // biome-ignore lint/security/noDangerouslySetInnerHtml: generated oklch() values only; the seed itself never reaches the CSS
        dangerouslySetInnerHTML={{ __html: `html:root{${schemeCss}}` }}
      />
      {script}
    </>
  );
};

ThemeInit.displayName = "ThemeInit";
