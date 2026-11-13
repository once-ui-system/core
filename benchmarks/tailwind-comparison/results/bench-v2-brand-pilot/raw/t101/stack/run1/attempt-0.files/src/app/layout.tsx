import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import { Column, Flex, Meta, Schema, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from "@/components";
import { getLocale } from "@/lib/i18n/server";
import { baseURL, dataStyle, fonts, landing, style } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    // The site-wide defaults. No canonical here: each page names its own.
    image: landing.home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      as="html"
      lang={locale}
      fillWidth
      style={
        {
          [fonts.heading.variable]: fonts.heading.stack,
          [fonts.body.variable]: fonts.body.stack,
          [fonts.label.variable]: fonts.label.stack,
          [fonts.code.variable]: fonts.code.stack,
        } as React.CSSProperties
      }
    >
      <head>
        {/* A sync <script> is only allowed inside the document head. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        {/* Sets data-theme and the colour scheme before first paint. */}
        <ThemeInit
          config={{
            theme: style.theme,
            defaultTheme: style.defaultTheme,
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            brandScale: style.brandScale,
            accentScale: style.accentScale,
            neutralScale: style.neutralScale,
            solid: style.solid,
            "solid-style": style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            "viz-style": dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              {children}
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
