import { Features, Hero, Pricing } from "@/app/(landing)/components";
import { baseURL, landing } from "@/resources";
import { Column, Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    path: landing.home.path,
    canonical: landing.home.canonical,
    image: landing.home.image,
    robots: landing.home.robots,
    alternates: landing.home.alternates,
  });
}

export default function Home() {
  return (
    <Column fillWidth horizontal="center" gap="104">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.home.title}
        description={landing.home.description}
        path={landing.home.path}
      />
      <Hero paddingX="l" s={{ paddingX: "16" }} />
      <Features id="features" maxWidth="l" paddingX="l" s={{ paddingX: "16" }} />
      <Pricing id="pricing" maxWidth="l" paddingX="l" s={{ paddingX: "16" }} />
    </Column>
  );
}
