import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";

import classNames from "classnames";

import { baseURL, meta, font, effects } from "@/app/resources/once-ui.config";
import { Background, Column, Flex, ToastProvider, ThemeProvider, DataThemeProvider } from "@/once-ui/components";

import { opacity, SpacingToken } from "@/once-ui/types";
import { Meta, Schema } from "@/once-ui/modules";

export async function generateMetadata() {
  return Meta.generate({
    title: meta.home.title,
    description: meta.home.description,
    baseURL: baseURL,
    path: meta.home.path,
    canonical: meta.home.canonical,
    image: meta.home.image,
    robots: meta.home.robots,
    alternates: meta.home.alternates,
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
      fillHeight
      background="page"
      className={classNames(
        font.primary.variable,
        font.secondary.variable,
        font.tertiary.variable,
        font.code.variable,
      )}
    >
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={meta.home.title}
        description={meta.home.description}
        path={meta.home.path}
      />
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <It's not dynamic nor a security issue.>
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  
                  // Set default values to prevent FOUC
                  // Default theme
                  root.setAttribute('data-theme', 'dark');
                  
                  // Default style values
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
                  
                  // Handle theme
                  const theme = localStorage.getItem('theme');
                  if (theme) {
                    if (theme === 'system') {
                      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
                    } else {
                      root.setAttribute('data-theme', theme);
                    }
                  }
                  
                  // Handle other style attributes from localStorage if available
                  const styleKeys = ['neutral', 'brand', 'accent', 'solid', 'solid-style', 'border', 'surface', 'transition', 'scaling'];
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                  
                  // Handle data visualization style
                  const dataViz = localStorage.getItem('data-viz-style');
                  if (dataViz) {
                    root.setAttribute('data-viz-style', dataViz);
                  }
                } catch (e) {
                  // Fallback to dark theme if there's an error
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
          <ToastProvider>
            <Column as="body" fillWidth fillHeight margin="0" padding="0">
              <Background
                position="absolute"
                mask={{
                  x: effects.mask.x,
                  y: effects.mask.y,
                  radius: effects.mask.radius,
                  cursor: effects.mask.cursor,
                }}
                gradient={{
                  display: effects.gradient.display,
                  opacity: effects.gradient.opacity as opacity,
                  x: effects.gradient.x,
                  y: effects.gradient.y,
                  width: effects.gradient.width,
                  height: effects.gradient.height,
                  tilt: effects.gradient.tilt,
                  colorStart: effects.gradient.colorStart,
                  colorEnd: effects.gradient.colorEnd,
                }}
                dots={{
                  display: effects.dots.display,
                  opacity: effects.dots.opacity as opacity,
                  size: effects.dots.size as SpacingToken,
                  color: effects.dots.color,
                }}
                grid={{
                  display: effects.grid.display,
                  opacity: effects.grid.opacity as opacity,
                  color: effects.grid.color,
                  width: effects.grid.width,
                  height: effects.grid.height,
                }}
                lines={{
                  display: effects.lines.display,
                  opacity: effects.lines.opacity as opacity,
                  size: effects.lines.size as SpacingToken,
                  thickness: effects.lines.thickness,
                  angle: effects.lines.angle,
                  color: effects.lines.color,
                }}
              />
              {children}
            </Column>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </Flex>
  );
}
