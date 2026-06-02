import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '../resources/custom.scss';

import classNames from "classnames";

import { Footer, Header, Sidebar } from "@/product";
import { baseURL } from "@/resources";

import { Analytics } from "@vercel/analytics/react"

import { Background, Column, Flex, Meta, Row, ThemeInit } from "@once-ui-system/core";
import { dataStyle, layout, schema, style } from "../resources/once-ui.config";
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
