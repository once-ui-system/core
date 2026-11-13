import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/seatwise/app-header";
import { PlanProvider } from "@/components/seatwise/plan-provider";

export const metadata: Metadata = {
  title: "Seatwise | Ines & Mateo's wedding dinner",
  description: "Seating plan and guest list for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <PlanProvider>
          <div className="flex min-h-dvh flex-col">
            <AppHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
          </div>
        </PlanProvider>
        <Toaster />
      </body>
    </html>
  );
}
