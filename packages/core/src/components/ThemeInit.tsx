import type React from "react";
import { safeScriptJson } from "../utils/safe-html";

export interface ThemeConfig {
  theme?: string;
  brand?: string;
  accent?: string;
  neutral?: string;
  solid?: string;
  "solid-style"?: string;
  solidStyle?: string;
  border?: string;
  surface?: string;
  transition?: string;
  scaling?: string;
  "viz-style"?: string;
  vizStyle?: string;
  [key: string]: string | undefined;
}

export interface ThemeInitProps extends React.HTMLAttributes<HTMLScriptElement> {
  config: ThemeConfig;
  nonce?: string;
}

export const ThemeInit: React.FC<ThemeInitProps> = ({
  config,
  id = "theme-init",
  nonce,
  ...rest
}) => {
  return (
    <script
      id={id}
      nonce={nonce}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: inline script required for early theme initialization before hydration
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const root = document.documentElement;
              const rawConfig = ${safeScriptJson(config)};
              if (!rawConfig || typeof rawConfig !== 'object') return;

              // Normalize config keys (support both camelCase and kebab-case)
              const config = {};
              Object.entries(rawConfig).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                  const kebabKey = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
                  config[kebabKey] = value;
                }
              });

              // Apply config defaults FIRST (prevents FOUC)
              Object.entries(config).forEach(([key, value]) => {
                root.setAttribute('data-' + key, String(value));
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
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `,
      }}
      {...rest}
    />
  );
};

ThemeInit.displayName = "ThemeInit";
