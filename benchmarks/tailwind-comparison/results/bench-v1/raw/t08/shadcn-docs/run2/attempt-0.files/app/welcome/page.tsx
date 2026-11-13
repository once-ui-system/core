import type { Metadata } from "next"

import { WelcomeContent } from "@/components/onboarding/welcome-content"

export const metadata: Metadata = {
  title: "Welcome to Lumen",
  description: "Your workspace is ready. Here is what to do next.",
}

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <WelcomeContent />
    </main>
  )
}
