import "./globals.css";

import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Seatwise, seating plan for Ines & Mateo",
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
