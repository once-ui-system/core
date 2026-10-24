import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";
import type { Metadata } from "next";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { Providers } from "@/components/Providers";
import { baseURL, fonts, landing, schema, style } from "@/resources";

// Each page sets its own title and description; this is the fallback.
export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: landing.home.title,
  description: landing.home.description,
  openGraph: {
    title: landing.home.title,
    description: landing.home.description,
    url: "/",
    siteName: schema.name,
    images: [landing.home.image],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang="en"
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        {/* A sync <script> is only allowed inside the document head. */}
        <ThemeInit
          config={{
            theme: style.theme,
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            solid: style.solid,
            "solid-style": style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            "viz-style": "gradient",
          }}
        />
      </head>
      <Providers>
        <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
          <Column fillWidth horizontal="center" flex={1}>
            {children}
          </Column>
        </Column>
      </Providers>
    </Flex>
  );
}
