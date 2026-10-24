import type { Metadata } from "next";
import { Column, Heading } from "@once-ui-system/core";
import { Hero, Features, Pricing } from "./components";
import { baseURL, landing } from "@/resources";

const seo = landing.home;

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: seo.path },
  openGraph: { title: seo.title, description: seo.description, url: seo.path, images: [seo.image] },
};

export default function Home() {
  return (
    <Column fillWidth horizontal="center" gap="64">
      <Hero />
      <Features />
      <Column id="pricing" fillWidth horizontal="center" gap="24">
        <Heading as="h2" variant="heading-strong-l">
          Pricing
        </Heading>
        <Pricing />
      </Column>
    </Column>
  );
}
