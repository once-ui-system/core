import { Background, Button, Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { brand } from "../../resources/config";

export const metadata: Metadata = {
  title: { absolute: `${brand.name}: ${brand.tagline}` },
  description: brand.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: brand.url,
    siteName: brand.name,
    title: `${brand.name}: ${brand.tagline}`,
    description: brand.description,
  },
  twitter: { card: "summary", title: brand.name, description: brand.tagline },
};

const features = [
  { title: "Shared notebooks", text: "Keep every team's notes in notebooks everyone can open, edit and build on together." },
  { title: "Instant search", text: "Find any note, in any notebook, the moment you start typing." },
  { title: "Roles and permissions", text: "Owners, admins and members: decide who can read, edit and invite." },
];

const plans = [
  { name: "Free", price: "$0", detail: "Up to 3 members", points: ["Shared notebooks", "Instant search", "Roles and permissions"] },
  { name: "Team", price: "$8", detail: "per member per month", points: ["Everything in Free", "Unlimited members", "Priority support"], highlight: true },
];

export default function Home() {
  return (
    <Column as="main" fillWidth horizontal="center" gap="104" paddingBottom="104">
      <Column fillWidth horizontal="center" paddingX="16" paddingTop="104" position="relative" overflow="hidden">
        <Background position="absolute" top="0" left="0" fill pointerEvents="none" gradient={{ display: true, opacity: 40, x: 50, y: 0, colorStart: "brand-background-strong", colorEnd: "static-transparent", width: 200, height: 100 }} />
        <Column maxWidth="m" horizontal="center" gap="24" align="center">
          <Tag size="m" label="Notes for teams" />
          <Heading as="h1" variant="display-strong-l" wrap="balance">
            {brand.name}
          </Heading>
          <Text variant="heading-default-xl" onBackground="neutral-weak">
            {brand.tagline}
          </Text>
          <Button href="/auth" size="l" arrowIcon label="Get started" />
        </Column>
      </Column>

      <Column maxWidth="l" fillWidth paddingX="16" gap="40" id="features">
        <Heading as="h2" variant="display-strong-xs">
          Everything your team needs
        </Heading>
        <Grid columns="3" s={{ columns: 1 }} gap="16">
          {features.map((f) => (
            <Column key={f.title} background="surface" border radius="l" padding="24" gap="12">
              <Heading as="h3" variant="heading-strong-l">
                {f.title}
              </Heading>
              <Text onBackground="neutral-weak">{f.text}</Text>
            </Column>
          ))}
        </Grid>
      </Column>

      <Column maxWidth="m" fillWidth paddingX="16" gap="40" id="pricing">
        <Heading as="h2" variant="display-strong-xs">
          Pricing
        </Heading>
        <Grid columns="2" s={{ columns: 1 }} gap="16">
          {plans.map((p) => (
            <Column
              key={p.name}
              background="surface"
              border={p.highlight ? "brand-alpha-strong" : undefined}
              radius="l"
              padding="24"
              gap="16"
            >
              <Heading as="h3" variant="heading-strong-l">
                {p.name}
              </Heading>
              <Row gap="8" vertical="end" wrap>
                <Heading as="p" variant="display-strong-s">
                  {p.price}
                </Heading>
                <Text onBackground="neutral-weak">{p.detail}</Text>
              </Row>
              <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
                {p.points.map((pt) => (
                  <Text as="li" key={pt} variant="body-default-m">
                    {pt}
                  </Text>
                ))}
              </Column>
              <Button href="/auth" variant={p.highlight ? "primary" : "secondary"} label="Get started" />
            </Column>
          ))}
        </Grid>
      </Column>
    </Column>
  );
}
