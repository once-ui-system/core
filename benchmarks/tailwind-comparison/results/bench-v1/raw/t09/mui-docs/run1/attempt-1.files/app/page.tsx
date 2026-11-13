import CustomerLogos from "../components/CustomerLogos";
import FeatureSections from "../components/FeatureSections";
import Hero from "../components/Hero";
import SiteShell from "../components/SiteShell";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <CustomerLogos />
      <FeatureSections />
    </SiteShell>
  );
}
