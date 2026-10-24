import { Column, Meta, Schema } from "@once-ui-system/core";
import { baseURL, landing, schema } from "@/resources";
import { Features, Hero, Pricing } from "@/app/(landing)/components";

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
        description={schema.description}
        path={landing.home.path}
      />
      <Hero />
      <Features />
      <Pricing id="pricing" />
    </Column>
  );
}
