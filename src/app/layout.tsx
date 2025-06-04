"use client";

import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";

import classNames from "classnames";

import { Column, Flex, Icon } from "@/once-ui/components";
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@/once-ui/context";

import { opacity, SpacingToken } from "@/once-ui/types";
import { Schema } from "@/once-ui/modules";
import { PiHourglassMedium } from "react-icons/pi";

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
      fillHeight
      background="page"
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <It's not dynamic nor a security issue.>
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  
                  root.setAttribute('data-theme', 'dark');
                  
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
                  
                  const theme = localStorage.getItem('theme');
                  if (theme) {
                    if (theme === 'system') {
                      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
                    } else {
                      root.setAttribute('data-theme', theme);
                    }
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
      <ThemeProvider
        brand="green"
        accent="cyan"
      >
        <DataThemeProvider>
        <IconProvider icons={{ chevronRight: PiHourglassMedium }}>
          <ToastProvider>
            <Column as="body" fillWidth fillHeight margin="0" padding="0">
              {children}
              <Flex fillWidth vertical="center">
                <Icon marginBottom="160" onBackground="neutral-strong" name="chevronRight" />
                <Icon marginBottom="160" onBackground="neutral-strong" name="chevronRight" />
              </Flex>
            </Column>
          </ToastProvider>
        </IconProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </Flex>
  );
}
