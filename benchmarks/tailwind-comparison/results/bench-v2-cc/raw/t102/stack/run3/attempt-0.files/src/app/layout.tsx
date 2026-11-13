import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import { baseURL, landing, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { LumenShell } from '@/components/LumenShell';
import { getLocale } from '@/lib/i18n/server';

export async function generateMetadata() {
  return Meta.generate({
    title: "Lumen",
    description: "Product analytics and issue tracking for small software teams.",
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
          title="Lumen"
          description="Product analytics and issue tracking for small software teams."
          path="/"
        />
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <LumenShell>{children}</LumenShell>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
