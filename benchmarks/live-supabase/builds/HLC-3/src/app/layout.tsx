import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { CSSProperties } from "react";
import { site } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.seo.titleDefault,
    template: site.seo.titleTemplate,
  },
  description: site.description,
  keywords: [...site.seo.keywords],
  applicationName: site.name,
  openGraph: {
    siteName: site.name,
    locale: site.locale,
    type: site.seo.ogType,
    url: site.url,
    title: site.seo.titleDefault,
    description: site.description,
  },
  twitter: {
    card: "summary",
    title: site.seo.titleDefault,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: site.theme.mode === "dark" ? "#09090b" : "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const brandVars = {
    "--brand": site.theme.brandColor,
    "--brand-accent": site.theme.accentColor,
  } as CSSProperties;
  const mode = site.theme.mode;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${mode} h-full antialiased`}
      style={brandVars}
      data-theme={mode}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        {!isSupabaseConfigured() && (
          <div
            role="status"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-popover px-4 py-1.5 text-center text-xs text-muted-foreground"
          >
            Supabase is not configured. Running in demo mode: auth is off and data is sample data.
          </div>
        )}
      </body>
    </html>
  );
}
