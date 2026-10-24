import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/config/site";
import { rootMetadata } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const mode = site.theme.defaultMode;
  return (
    <html
      lang={site.locale}
      className={`${geistSans.variable} ${geistMono.variable} ${mode} h-full antialiased`}
      style={{ colorScheme: mode }}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {!isSupabaseConfigured() && (
          <div
            role="status"
            className="border-b border-border bg-muted px-4 py-1.5 text-center text-xs text-muted-foreground"
          >
            Supabase is not configured: running in demo mode. Auth gating is off and the sample data is shown.
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
