import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./globals.css";

import { Column, Row, ThemeInit } from "@once-ui-system/core";
import type { Metadata } from "next";
import { Providers } from "../components/Providers";
import { brand, dataStyle, seo, style } from "../resources/once-ui.config";

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: seo.defaultTitle, template: seo.titleTemplate },
  description: seo.description,
  applicationName: brand.name,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Row as="html" lang="en" suppressHydrationWarning>
      <head>
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Providers>
        <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
          {children}
        </Column>
      </Providers>
    </Row>
  );
}
