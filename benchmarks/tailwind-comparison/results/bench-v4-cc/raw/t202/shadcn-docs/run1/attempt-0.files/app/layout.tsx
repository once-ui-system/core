import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { PlanProvider } from "@/components/plan-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo's wedding dinner",
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <PlanProvider>
          <AppShell>{children}</AppShell>
        </PlanProvider>
        <Toaster />
      </body>
    </html>
  );
}
