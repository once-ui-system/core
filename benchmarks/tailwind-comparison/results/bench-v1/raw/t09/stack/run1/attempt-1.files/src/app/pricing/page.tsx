import { PricingContent } from "@/components/pricing/PricingContent";
import { SiteShell } from "@/components/site/SiteShell";
import { baseURL, landing } from "@/resources";
import { Meta } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.pricing.title,
    description: landing.pricing.description,
    baseURL,
    path: landing.pricing.path,
    image: landing.pricing.image,
  });
}

export default function Page() {
  return (
    <SiteShell>
      <PricingContent />
    </SiteShell>
  );
}
