import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { ThemeInit } from "@once-ui-system/core/components/ThemeInit";
import { AppShell } from "../components/AppShell";
import { dataStyle, style } from "../lib/theme";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme and the brand scheme before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          {/* Mounted once here so open groups and the collapsed state survive navigation. */}
          <AppShell>{children}</AppShell>
        </Providers>
      </Column>
    </Flex>
  );
}
