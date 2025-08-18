import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';

import classNames from "classnames";

import { Background, Column, Flex } from "@once-ui-system/core";
import { dataStyle, effects, style } from "../resources/once-ui.config";
import { Providers } from "../components/Providers";

import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const label = Geist({
  variable: "--font-label",
  subsets: ["latin"],
  display: "swap",
});

const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const fonts = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Flex
        as="html"
        lang="en"
        suppressHydrationWarning
        className={classNames(
          fonts.heading.variable,
          fonts.body.variable,
          fonts.label.variable,
          fonts.code.variable,
        )}
      >
        <head>
          <script
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <It's not dynamic nor a security issue.>
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const root = document.documentElement;
                    
                    // Set defaults from config
                    const config = ${JSON.stringify({
                      theme: style.theme,
                      brand: style.brand,
                      accent: style.accent,
                      neutral: style.neutral,
                      solid: style.solid,
                      'solid-style': style.solidStyle,
                      border: style.border,
                      surface: style.surface,
                      transition: style.transition,
                      scaling: style.scaling,
                      'viz-style': dataStyle.variant,
                    })};
                    
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
        </head>
        <Providers>
          <Column background="page" as="body" fillWidth margin="0" padding="0" style={{ minHeight: "100vh" }}>
          <Background
            position="absolute"
            top="0"
            left="0"
            mask={{
              cursor: effects.mask.cursor,
              x: effects.mask.x,
              y: effects.mask.y,
                radius: effects.mask.radius,
              }}
              gradient={{
                display: effects.gradient.display,
                x: effects.gradient.x,
                y: effects.gradient.y,
                width: effects.gradient.width,
                height: effects.gradient.height,
                tilt: effects.gradient.tilt,
                colorStart: effects.gradient.colorStart,
                colorEnd: effects.gradient.colorEnd,
                opacity: effects.gradient.opacity as
                  | 0
                  | 10
                  | 20
                  | 30
                  | 40
                  | 50
                  | 60
                  | 70
                  | 80
                  | 90
                  | 100,
              }}
              dots={{
                display: effects.dots.display,
                color: effects.dots.color,
                size: effects.dots.size as any,
                opacity: effects.dots.opacity as any,
              }}
              grid={{
                display: effects.grid.display,
                color: effects.grid.color,
                width: effects.grid.width as any,
                height: effects.grid.height as any,
                opacity: effects.grid.opacity as any,
              }}
              lines={{
                display: effects.lines.display,
                opacity: effects.lines.opacity as any,
              }}
            />
            <Flex
              fillWidth
              padding="l"
              horizontal="center"
              flex={1}
            >
              <Flex fillWidth horizontal="center">
                {children}
              </Flex>
            </Flex>
          </Column>
        </Providers>
      </Flex>
    </>
  );
}
