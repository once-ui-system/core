import React from 'react';

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
              
              // Set defaults from config
              const config = ${JSON.stringify(config)};
              
              // Apply default values
              Object.entries(config).forEach(([key, value]) => {
                root.setAttribute('data-' + key, value);
              });
              
              // Resolve theme
              const resolveTheme = (themeValue) => {
                if (!themeValue || themeValue === 'system') {
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                return themeValue;
              };
              
              // Apply saved theme or use config default
              const savedTheme = localStorage.getItem('data-theme');
              // Only override with system preference if explicitly set to 'system'
              const resolvedTheme = savedTheme ? resolveTheme(savedTheme) : config.theme === 'system' ? resolveTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : config.theme;
              root.setAttribute('data-theme', resolvedTheme);
              
              // Apply any saved style overrides
              const styleKeys = Object.keys(config);
              styleKeys.forEach(key => {
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
