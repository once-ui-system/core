import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { baseURL, landing, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, Text, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { getLocale } from '@/lib/i18n/server';
import { isSupabaseConfigured } from '@/lib/sb/config';

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    path: landing.home.path,
    canonical: landing.home.canonical,
    image: landing.home.image,
    robots: landing.home.robots,
    alternates: landing.home.alternates,
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
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        <ThemeInit
          config={{
            theme: style.theme,
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
            {!isSupabaseConfigured() && (
              <Column fillWidth horizontal="center" paddingY="4" background="neutral-alpha-weak">
                <Text variant="label-default-xs" onBackground="neutral-medium">
                  Demo mode: Supabase is not configured.
                </Text>
              </Column>
            )}
            <Column fillWidth horizontal="center" flex={1}>
              {children}
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}