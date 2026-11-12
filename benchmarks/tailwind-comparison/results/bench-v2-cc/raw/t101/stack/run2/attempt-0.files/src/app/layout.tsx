import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import type { Metadata } from "next";
import { dataStyle } from "@/resources";
import { themeProps } from "@/resources/theme";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { AppFrame, LocaleProvider, Providers } from "@/components";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex suppressHydrationWarning data-scroll-behavior="smooth" as="html" lang={locale} fillWidth>
      <head>
        <ThemeInit
          config={{
            ...themeProps,
            "solid-style": themeProps.solidStyle,
            "viz-style": dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <AppFrame>{children}</AppFrame>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
