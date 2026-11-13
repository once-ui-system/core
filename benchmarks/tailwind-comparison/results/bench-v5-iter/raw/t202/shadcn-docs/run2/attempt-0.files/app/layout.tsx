import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { PlanProvider } from "@/lib/plan-store";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "Seating planner for wedding and event planners.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <PlanProvider>{children}</PlanProvider>
        <Toaster />
      </body>
    </html>
  );
}
