import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";

import { fonts, style } from "@/resources";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import type { OnceUIStyleConfig } from "@once-ui-system/core";
import { LocaleProvider, Providers } from "@/components";
import { AppShell } from "@/components/AppShell";
import { getLocale } from "@/lib/i18n/server";

export const metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

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
        <ThemeInit config={style as OnceUIStyleConfig} />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <AppShell>{children}</AppShell>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
