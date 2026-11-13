import { FeatureSections } from "@/components/site/feature-sections"
import { Hero } from "@/components/site/hero"
import { LogoRow } from "@/components/site/logo-row"
import { SiteShell } from "@/components/site/site-shell"

export default function Page() {
  return (
    <SiteShell>
      <Hero />
      <LogoRow />
      <FeatureSections />
    </SiteShell>
  )
}
