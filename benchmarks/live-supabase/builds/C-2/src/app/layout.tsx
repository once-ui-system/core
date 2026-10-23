import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    siteName: siteConfig.name,
    locale: siteConfig.seo.locale,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { brand, accent, neutral, mode } = siteConfig.theme;
  return (
    <html
      lang="en"
      className={`${mode === "dark" ? "dark" : ""} h-full antialiased`}
      data-brand={brand}
      data-accent={accent}
      data-neutral={neutral}
      style={{ colorScheme: mode }}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
