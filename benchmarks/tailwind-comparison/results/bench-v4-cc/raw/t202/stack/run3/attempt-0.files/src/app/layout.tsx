import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";
import type { Metadata } from "next";

import { fonts, style, dataStyle } from "@/resources";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { PlannerProvider } from '@/components/seatwise/PlannerProvider';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s · Seatwise" },
  description: "Seatwise, a seating planner for wedding and event planners.",
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
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <PlannerProvider>{children}</PlannerProvider>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
