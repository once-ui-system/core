import type { Metadata, Viewport } from "next"
import { AppShell } from "@/components/AppShell"
import { PlanProvider } from "@/components/plan/store"
import { EmotionRegistry } from "@/components/ui/emotion-registry"
import { Provider } from "@/components/ui/provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo's wedding dinner",
  description:
    "Seatwise is a seating planner for wedding and event planners: build the room, seat guests, keep the couple's rules and hand the result to the venue and caterer.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

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
  )
}
