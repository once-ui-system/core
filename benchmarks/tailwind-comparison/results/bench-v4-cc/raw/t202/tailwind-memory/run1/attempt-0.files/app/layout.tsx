import "./globals.css";

import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import { PlanProvider } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Seatwise",
  description: "A seating planner for wedding and event planners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
        <PlanProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <AppHeader />
          <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6">
            {children}
          </main>
        </PlanProvider>
      </body>
    </html>
  );
}
