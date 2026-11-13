import type { Metadata } from "next";
import { PricingView } from "../../components/PricingView";
import { SiteShell } from "../../components/SiteShell";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Lumen plans: Free, Team and Business. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingView />
    </SiteShell>
  );
}
