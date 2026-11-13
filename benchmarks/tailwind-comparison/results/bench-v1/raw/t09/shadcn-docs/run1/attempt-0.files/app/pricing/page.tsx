import type { Metadata } from "next";

import { SiteShell } from "@/components/site-shell";
import { PricingView } from "@/components/pricing-view";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple per-seat pricing for Lumen. Free for one seat, Team and Business for growing teams. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingView />
    </SiteShell>
  );
}
