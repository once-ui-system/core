import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import { LocaleProvider, Providers } from "@/components";
import { getLocale } from "@/lib/i18n/server";
import { baseURL, dataStyle, landing, style } from "@/resources";
import { Column, Flex, Meta, Schema, ThemeInit } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
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
    >
      <head>
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        {/* Paints data-theme, the brand and neutral scales and the border
            style before first paint, so the dark default never flashes. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
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
