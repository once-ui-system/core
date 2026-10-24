import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";

import { Column, Row, ThemeInit } from "@once-ui-system/core";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "../components/Providers";
import { dataStyle, seo, style } from "../resources/once-ui.config";

// Once UI reads these four variables; one family for heading, body and label.
const sans = Geist({ variable: "--font-heading", subsets: ["latin"], display: "swap" });
const body = Geist({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const label = Geist({ variable: "--font-label", subsets: ["latin"], display: "swap" });
const code = Geist_Mono({ variable: "--font-code", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: { default: seo.title, template: seo.titleTemplate },
  description: seo.description,
  openGraph: {
    siteName: seo.siteName,
    locale: seo.locale,
    type: "website",
    url: seo.url,
    title: seo.title,
    description: seo.description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Row
      as="html"
      lang="en"
      suppressHydrationWarning
      className={[sans.variable, body.variable, label.variable, code.variable].join(" ")}
    >
      <head>
        {/* Sets data-theme and the scheme before first paint. */}
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
