import type { Metadata } from "next"
import { Provider } from "@/components/ui/provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Lumen — product analytics and issue tracking for small teams",
  description:
    "Product analytics and issue tracking that small teams actually read.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}
