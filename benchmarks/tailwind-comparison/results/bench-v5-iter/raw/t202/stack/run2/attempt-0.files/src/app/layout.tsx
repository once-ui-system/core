import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'
import '@/resources/seatwise.css'

import classNames from "classnames";

import { baseURL, fonts, style, dataStyle } from "@/resources";
import { Meta, Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { SeatProvider } from '@/components/SeatProvider';
import { Shell } from '@/components/Shell';
import { getLocale } from '@/lib/i18n/server';

const title = "Seatwise: seating plan for Ines & Mateo's wedding dinner";
const description =
  "Build the seating plan, check the couple's rules and hand the guest list and meal counts to the venue and the caterer.";

export async function generateMetadata() {
  return Meta.generate({
    title,
    description,
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
          <SeatProvider>
            <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
              <Column fillWidth horizontal="center" flex={1}>
                <Shell>{children}</Shell>
              </Column>
            </Column>
          </SeatProvider>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
