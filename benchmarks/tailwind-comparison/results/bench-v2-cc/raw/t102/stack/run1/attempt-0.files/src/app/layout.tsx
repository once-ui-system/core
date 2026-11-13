import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import { baseURL, landing, style } from "@/resources";
import { Meta, Schema, Column, Flex, ThemeInit, type OnceUIStyleConfig } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { LumenFrame } from '@/components/LumenFrame';
import { getLocale } from '@/lib/i18n/server';

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    // The site-wide defaults. No canonical here: each page names its own, and
    // a default would point every page that doesn't at the landing page.
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
        {/* A sync <script> is only allowed inside the document head; React 19.2
            refuses one rendered as a bare child of <html>. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        <ThemeInit config={style as unknown as OnceUIStyleConfig} />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <LumenFrame>{children}</LumenFrame>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
