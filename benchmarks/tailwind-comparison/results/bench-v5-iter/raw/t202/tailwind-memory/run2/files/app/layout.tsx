import "./globals.css";

import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import { PlanProvider } from "@/components/PlanProvider";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "A seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        <PlanProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
          >
            Skip to content
          </a>
          <AppHeader />
          <main id="main">{children}</main>
        </PlanProvider>
      </body>
    </html>
  );
}
