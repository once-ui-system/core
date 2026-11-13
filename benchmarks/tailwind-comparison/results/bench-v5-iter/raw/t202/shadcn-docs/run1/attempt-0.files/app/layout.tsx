import "./globals.css"

import type { Metadata, Viewport } from "next"
import { AppHeader } from "@/components/seatwise/app-header"
import { PlanProvider } from "@/components/seatwise/plan-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s | Seatwise" },
  description: "Seating plans for wedding and event planners.",
}

export const viewport: Viewport = { width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <PlanProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Skip to content
          </a>
          <AppHeader />
          <main id="main">{children}</main>
        </PlanProvider>
        <Toaster />
      </body>
    </html>
  )
}
