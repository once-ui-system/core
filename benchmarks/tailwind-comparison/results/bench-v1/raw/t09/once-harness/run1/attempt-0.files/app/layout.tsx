import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { brand } from "../lib/data";
import { dataStyle, style } from "../lib/theme";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: `${brand.name}: ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Paints the dark default and the brand ramps before first render. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>{children}</Providers>
      </Column>
    </Flex>
  );
}
