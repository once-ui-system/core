import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';

import classNames from "classnames";

import { Footer, Header } from "@/product";
import { baseURL } from "@/resources";

import { Analytics } from "@vercel/analytics/react"

import { Background, Column, Flex, Meta } from "@once-ui-system/core";
import { dataStyle, effects, fonts, layout, schema, style } from "../resources/once-ui.config";
import { meta } from "@/resources";
import { RouteGuard } from "@/product/RouteGuard";
import { Providers } from '@/product/Providers';

export async function generateMetadata() {
  const baseMetadata = Meta.generate({
    title: meta.home.title,
    description: meta.home.description,
    baseURL: baseURL,
    path: meta.home.path,
    image: meta.home.image
  });

  return {
    ...baseMetadata,
    metadataBase: new URL(`${baseURL}`),
    openGraph: {
      ...baseMetadata.openGraph,
      siteName: meta.home.title,
      locale: schema.locale,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
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
          <Header />
          <Flex
            fillWidth
            padding="l"
            horizontal="center"
            flex={1}
          >
            <Flex horizontal="center" maxWidth={layout.body.width} minHeight="0">
              <RouteGuard>
                {children}
              </RouteGuard>
            </Flex>
          </Flex>
          <Footer />
        </Column>
        </Providers>
        <Analytics />
      </Flex>
    </>
  );
}
