import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { baseURL, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { DeskProvider } from '@/components/desk/DeskProvider';
import { getLocale } from '@/lib/i18n/server';

const title = "Pawpoint: front desk for Hillside Veterinary Clinic";
const description = "Today's schedule, check-in, waiting room and patient records for Hillside Veterinary Clinic.";

export async function generateMetadata() {
  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
    image: "/images/og/home.jpg",
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
          <DeskProvider>
            <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
              <Column fillWidth horizontal="center" flex={1}>
                {children}
              </Column>
            </Column>
          </DeskProvider>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
