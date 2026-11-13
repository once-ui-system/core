import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import { baseURL, schema, style, dataStyle } from "@/resources";
import { Meta, Schema, Column, Flex, ThemeInit, type OnceUIStyleConfig } from "@once-ui-system/core";
import type { ChartMode } from "@once-ui-system/core/data";
import { LocaleProvider, Providers } from '@/components';
import { AppFrame } from '@/components/AppShell';
import { getLocale } from '@/lib/i18n/server';

const title = "Lumen: product analytics and issue tracking";
const description = schema.description;

export async function generateMetadata() {
  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
    image: "/api/og/generate?title=Lumen",
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
        {/* A sync <script> is only allowed inside the document head; React 19.2
            refuses one rendered as a bare child of <html>. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={title}
          description={description}
          path="/"
        />
        <ThemeInit
          config={style as OnceUIStyleConfig}
          dataStyle={{ mode: dataStyle.mode as ChartMode }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              {/* The Lumen shell frames /, /projects and /settings once; every
                  other route renders as it always did. */}
              <AppFrame>{children}</AppFrame>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
