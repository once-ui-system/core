import type { Metadata } from "next";
import ComparisonTable from "@/components/ComparisonTable";
import FaqAccordion from "@/components/FaqAccordion";
import PricingPlans from "@/components/PricingPlans";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Lumen pricing: Free, Team and Business plans. Pay yearly and get two months free.",
};

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingPlans />
      <ComparisonTable />
      <FaqAccordion />
    </SiteShell>
  );
}
