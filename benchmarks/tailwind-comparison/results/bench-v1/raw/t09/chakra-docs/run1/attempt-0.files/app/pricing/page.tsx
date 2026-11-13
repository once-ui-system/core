import type { Metadata } from "next"
import { SiteShell } from "@/components/site-shell"
import { PricingView } from "@/components/pricing-view"

export const metadata: Metadata = {
  title: "Pricing | Lumen",
  description:
    "Lumen pricing: Free, Team and Business plans, with two months free on yearly billing.",
}

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingView />
    </SiteShell>
  )
}
