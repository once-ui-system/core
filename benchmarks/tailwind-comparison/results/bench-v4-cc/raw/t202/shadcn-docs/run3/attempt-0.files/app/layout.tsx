import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PlanProvider } from "@/components/plan-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Seatwise: seating planner",
  description: "Seating plans for wedding and event planners.",
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
