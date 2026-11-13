import type { Metadata } from "next";

import { PricingView } from "@/components/pricing-view";

export const metadata: Metadata = {
  title: "Pricing — Lumen",
  description: "Free, Team and Business plans. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return <PricingView />;
}
