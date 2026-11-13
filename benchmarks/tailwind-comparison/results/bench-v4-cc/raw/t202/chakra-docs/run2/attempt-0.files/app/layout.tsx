import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/app-shell";
import { PlanProvider } from "@/components/plan-provider";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s | Seatwise" },
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <PlanProvider>
              <AppShell>{children}</AppShell>
            </PlanProvider>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
