import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { themeCss } from "@/lib/theme";
import { isSupabaseConfigured } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: { default: site.seo.defaultTitle, template: site.seo.titleTemplate },
  description: site.description,
  keywords: [...site.seo.keywords],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const mode = site.theme.defaultMode;
  return (
    <html lang={site.language} className={mode === "dark" ? "dark h-full antialiased" : "h-full antialiased"}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        {!isSupabaseConfigured() && (
          <div className="border-b border-border bg-muted px-4 py-1.5 text-center text-xs text-muted-foreground">
            Demo mode: Supabase is not configured, so sample data is shown and sign-in is off.
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
