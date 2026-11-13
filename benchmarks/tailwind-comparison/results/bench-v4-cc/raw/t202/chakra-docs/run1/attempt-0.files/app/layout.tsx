import type { Metadata } from "next"
import { SeatingProvider } from "@/components/seatwise/seating-provider"
import { EmotionRegistry } from "@/components/ui/emotion-registry"
import { Provider } from "@/components/ui/provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Seatwise · Ines & Mateo's wedding dinner",
  description: "Seating plan for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <SeatingProvider>{children}</SeatingProvider>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  )
}
