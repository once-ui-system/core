import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';

import { Column, Flex, Meta, Schema } from "@once-ui-system/core";
import { Providers } from '../../components/Providers';
import classNames from "classnames";
import { font } from "../resources/once-ui.config.js";

export async function generateMetadata() {
  return Meta.generate({
    title: "Once UI",
    description: "Once UI is a collection of components and modules that can be used to build a website or application.",
    baseURL: "https://once-ui.com",
    path: "/",
    canonical: "https://once-ui.com",
    image: "https://once-ui.com/og-image.png",
    robots: "index, follow",
    alternates: [],
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang="en"
      className={classNames(
        font.primary.variable,
        font.secondary.variable,
        font.tertiary.variable,
        font.code.variable,
      )}
    >
      <Schema
        as="webPage"
        baseURL="https://once-ui.com"
        title="Once UI"
        description="Once UI is a collection of components and modules that can be used to build a website or application."
        path="/"
      />
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <It's not dynamic nor a security issue.>
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                console.log('=== LAYOUT SCRIPT START ===');
                console.log('Initial theme from localStorage:', localStorage.getItem('data-theme'));
                console.log('Initial data-theme attribute:', document.documentElement.getAttribute('data-theme'));
                try {
                  const root = document.documentElement;
                  
                  // Set default values first
                  const defaultTheme = 'system';
                  root.setAttribute('data-neutral', 'gray');
                  root.setAttribute('data-brand', 'blue');
                  root.setAttribute('data-accent', 'indigo');
                  root.setAttribute('data-solid', 'contrast');
                  root.setAttribute('data-solid-style', 'flat');
                  root.setAttribute('data-border', 'playful');
                  root.setAttribute('data-surface', 'filled');
                  root.setAttribute('data-transition', 'all');
                  root.setAttribute('data-scaling', '100');
                  root.setAttribute('data-viz-style', 'categorical');
                  
                  // CRITICAL: Ensure we NEVER set 'system' as a data-theme attribute
                  // Always resolve system to light/dark before setting the attribute
                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };
                  
                  // Handle theme preference
                  const theme = localStorage.getItem('data-theme');
                  
                  // Always set a valid theme attribute (never 'system')
                  const resolvedTheme = resolveTheme(theme);
                  root.setAttribute('data-theme', resolvedTheme);
                  
                  // If no theme preference, save system as default
                  if (!theme) {
                    localStorage.setItem('data-theme', 'system');
                    console.log('Layout script: saved system as default theme, DOM set to', resolvedTheme);
                  } else {
                    console.log('Layout script: theme preference is', theme, ', DOM set to', resolvedTheme);
                  }
                  
                  const styleKeys = ['neutral', 'brand', 'accent', 'solid', 'solid-style', 'border', 'surface', 'transition', 'scaling'];
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                  
                  const dataViz = localStorage.getItem('data-viz-style');
                  if (dataViz) {
                    root.setAttribute('data-viz-style', dataViz);
                  }
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <Providers>
        <Column as="body" background="page" fillWidth margin="0" padding="0">
            {children}
        </Column>
      </Providers>
    </Flex>
  );
}
