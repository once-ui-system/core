import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { baseURL, landing, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { AppFrame } from '@/components/AppFrame';
import { PlanProvider } from '@/lib/plan';
import { getLocale } from '@/lib/i18n/server';

const title = "Seatwise: seating plan for Ines & Mateo's wedding dinner";
const description = "Build the seating plan for the wedding dinner at The Orangery, check the couple's rules and hand the guest list to the venue and caterer.";

export async function generateMetadata() {
  return Meta.generate({
    title,
    description,
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
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
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
          config={{
            theme: 'system',
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
      <LocaleProvider locale={locale}>
        <Providers>
          <PlanProvider>
            <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
              <AppFrame>{children}</AppFrame>
            </Column>
          </PlanProvider>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
