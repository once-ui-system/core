import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic",
  description:
    "Pawpoint, front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppHeader />
        <main id="main" className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
