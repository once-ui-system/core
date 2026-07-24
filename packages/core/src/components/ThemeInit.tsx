import React from 'react';
import { safeScriptJson } from '../utils/safe-html';

interface ThemeConfig {
  theme: string;
  brand: string;
  accent: string;
  neutral: string;
  solid: string;
  'solid-style': string;
  border: string;
  surface: string;
  transition: string;
  scaling: string;
  'viz-style': string;
}

interface ThemeInitProps {
  config: ThemeConfig;
}

export const ThemeInit: React.FC<ThemeInitProps> = ({ config }) => {
  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const root = document.documentElement;
              const config = ${safeScriptJson(config)};

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
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `,
      }}
    />
  );
};
