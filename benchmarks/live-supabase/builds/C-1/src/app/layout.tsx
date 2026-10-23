import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { DemoNotice } from "@/components/demo-notice";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name}: ${siteConfig.tagline}`, template: siteConfig.seo.titleTemplate },
  description: siteConfig.description,
  keywords: [...siteConfig.seo.keywords],
  applicationName: siteConfig.name,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { brand, accent, neutral, defaultMode } = siteConfig.theme;
  return (
    <html
      lang="en"
      data-brand={brand}
      data-accent={accent}
      data-neutral={neutral}
      className={`${geistSans.variable} ${geistMono.variable} ${defaultMode === "dark" ? "dark" : ""} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <DemoNotice />
      </body>
    </html>
  );
}
