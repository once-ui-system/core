import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";

import { baseURL, fonts, style, dataStyle } from "@/resources";
import { Meta, Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from "@/components";
import { AppShell } from "@/components/shell/AppShell";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  return Meta.generate({
    title: "Lumen",
    description: "Product analytics and issue tracking for small software teams.",
    baseURL: baseURL,
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
            theme: "dark",
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
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
              {/* The signed-in shell is mounted once here and frames Lumen's
                  three screens; any other route renders as it is. */}
              <AppShell>{children}</AppShell>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
