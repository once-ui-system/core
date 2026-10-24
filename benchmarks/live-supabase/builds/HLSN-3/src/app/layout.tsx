import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";
import { Schema, ThemeInit } from "@once-ui-system/core";
import { Providers } from "@/components/Providers";
import { baseURL, fonts, landing, style } from "@/resources";
import { pageMetadata } from "@/lib/meta";

export async function generateMetadata() {
  return pageMetadata({
    title: landing.home.title,
    description: landing.home.description,
    path: landing.home.path,
    canonical: landing.home.canonical,
    image: landing.home.image,
    robots: landing.home.robots,
    alternates: landing.home.alternates,
  });
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        {/* A sync <script> is only allowed inside the document head. */}
        <Schema as="webPage" baseURL={baseURL} title={landing.home.title} description={landing.home.description} path={landing.home.path} />
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
      <body style={{ background: "var(--page-background, #0b0f0e)", margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
