import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '../resources/custom.scss';

import classNames from "classnames";

import { Footer, Header, Sidebar } from "@/product";
import { baseURL } from "@/resources";

import { Analytics } from "@vercel/analytics/react"

import { Background, Column, Flex, Meta, Row, ThemeInit } from "@once-ui-system/core";
import { dataStyle, effects, layout, schema, style } from "../resources/once-ui.config";
import { meta } from "@/resources";
import { RouteGuard } from "@/product/RouteGuard";
import { Providers } from '@/product/Providers';

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
        data-scroll-behavior="smooth"
        className={classNames(
          fonts.heading.variable,
          fonts.body.variable,
          fonts.label.variable,
          fonts.code.variable,
        )}
      >
        <head>
          <ThemeInit
            config={{
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
            }}
          />
        </head>
        <Providers>
          <Column background="page" as="body" fillWidth margin="0" padding="0" style={{ minHeight: "100vh" }}
            scrollbar="default">
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
              flex={1}
            >
              <Flex horizontal="center" maxWidth={layout.body.width} minHeight="0">
                <RouteGuard>
                  <Sidebar m={{hide: true}} paddingRight="2" />
                  <Row fillWidth>
                    {children}
                  </Row>
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
