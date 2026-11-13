import type { Metadata } from "next"

import { Wizard } from "@/components/onboarding/wizard"

export const metadata: Metadata = {
  title: "Set up your workspace · Lumen",
  description:
    "Create your Lumen account, name your workspace, invite teammates and choose your preferences.",
}

export default function Page() {
  return (
    <main className="min-h-screen bg-muted/30">
      <Wizard />
    </main>
  )
}
