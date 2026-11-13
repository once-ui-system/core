import type { Metadata } from "next"
import { PricingView } from "@/components/pricing/pricing-view"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Pricing — Lumen",
  description:
    "Free, Team and Business plans for product analytics and issue tracking. Yearly billing includes two months free.",
}

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingView />
    </SiteShell>
  )
}
