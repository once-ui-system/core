import '@once-ui-system/foundations/css/styles.css';
import '@once-ui-system/foundations/css/tokens.css';

import classNames from "clsx";

import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { dataStyle, style } from "@/resources/once-ui.config";
import { Providers } from "@/components/Providers";

import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";

const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const label = Geist({
  variable: "--font-label",
  subsets: ["latin"],
  display: "swap",
});

const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

const fonts = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Flex
        as="html"
        lang="en"
        suppressHydrationWarning
        className={classNames(
          fonts.heading.variable,
          fonts.body.variable,
          fonts.label.variable,
          fonts.code.variable,
        )}
      >
        {/* The current shape: `style` as written, and `dataStyle` for the chart
            mode. The 2.0 shape passed `dataStyle.variant` as `viz-style`, the
            wrong setting, so charts fell back to categorical. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
        <Providers>
          <Column background="page" as="body" fillWidth margin="0" padding="0" minHeight="100vh">
            <Flex
              fillWidth
              padding="l"
              horizontal="center"
              flex={1}
            >
              <Flex fillWidth horizontal="center">
                {children}
              </Flex>
            </Flex>
          </Column>
        </Providers>
      </Flex>
    </>
  );
}
