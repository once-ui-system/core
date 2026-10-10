import type React from "react";
import type { OnceUIDataStyleConfig } from "../contexts/DataThemeProvider";
import type { OnceUIStyleConfig } from "../contexts/ThemeProvider";
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
  dataStyle?: Pick<OnceUIDataStyleConfig, "mode">;
}

const toKebab = (key: string) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * The attributes the inline script writes, keyed without the `data-` prefix.
 * Resolved here, on the server, so the script stays a dumb copy loop.
 */
function themeInitAttributes(
  config: ThemeInitConfig,
  dataStyle?: ThemeInitProps["dataStyle"],
): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === null || value === "") continue;
    attributes[toKebab(key)] = String(value);
  }
  if (dataStyle?.mode) attributes["viz-style"] = dataStyle.mode;
  return attributes;
}

export const ThemeInit: React.FC<ThemeInitProps> = ({ config, dataStyle }) => {
  return (
    <script
      id="theme-init"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: a pre-paint theme script cannot be a React effect, and the payload is serialised with safeScriptJson
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const root = document.documentElement;
              const config = ${safeScriptJson(themeInitAttributes(config, dataStyle))};

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
              // 2. config.theme
              const savedTheme = localStorage.getItem('data-theme');
              const finalTheme = savedTheme ?? config.theme;

              root.setAttribute('data-theme', resolveTheme(finalTheme));

              // Apply overrides AFTER theme
              Object.keys(config).forEach(key => {
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
};

ThemeInit.displayName = "ThemeInit";
