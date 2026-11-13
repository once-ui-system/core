import type { Metadata } from "next"
import { Provider } from "@/components/ui/provider"

export const metadata: Metadata = {
  title: "Lumen — product analytics and issue tracking for small teams",
  description:
    "Product analytics and issue tracking that small teams actually read.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
