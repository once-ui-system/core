import "./globals.css"

import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: "Lumen",
    template: "%s · Lumen",
  },
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  )
}
