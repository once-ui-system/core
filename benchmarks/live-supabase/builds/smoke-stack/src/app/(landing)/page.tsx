import {
  Hero,
  Features,
  Showcase,
  Steps,
  Testimonials,
  Pricing,
  Faq,
} from "@/app/(landing)/components";
import { faq, testimonials } from "@/content";
import { Column, Meta, Schema } from "@once-ui-system/core";
import { baseURL, landing } from "@/resources";

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
      <Features id="features" maxWidth="l" paddingX="l" paddingTop="xl" s={{ paddingX: "16" }} />
      <Showcase id="surfaces" maxWidth="l" paddingX="l" paddingTop="xl" s={{ paddingX: "16" }} />
      <Steps id="how-it-works" maxWidth="l" paddingX="l" paddingTop="xl" s={{ paddingX: "16" }} />
      <Testimonials id="testimonials" maxWidth="l" paddingX="l" paddingTop="xl" s={{ paddingX: "16" }} testimonials={testimonials} />
      <Pricing id="pricing" maxWidth="l" paddingX="l" paddingTop="xl" s={{ paddingX: "16" }} />
      <Faq id="faq" maxWidth="l" paddingX="l" s={{ paddingX: "16" }} items={faq} />
    </Column>
  );
}
