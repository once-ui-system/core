import "./globals.css";

import type { Metadata, Viewport } from "next";

import { AppShell } from "@/components/AppShell";
import { PlanProvider } from "@/components/PlanProvider";

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s · Seatwise" },
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        <PlanProvider>
          <AppShell>{children}</AppShell>
        </PlanProvider>
      </body>
    </html>
  );
}
