import { Button, Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { brand, plans, seo } from "../../resources/config";
import { SupabaseNotice } from "../../components/SupabaseNotice";

export const metadata: Metadata = {
  title: { absolute: seo.defaultTitle },
  description: brand.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: seo.defaultTitle,
    description: brand.description,
    url: brand.url,
    type: "website",
    siteName: brand.name,
    images: [seo.ogImage],
  },
  twitter: { card: "summary_large_image", title: seo.defaultTitle, description: brand.description },
};

const features = [
  {
    title: "Shared notebooks",
    text: "Keep every team's notes in notebooks everyone can open, edit and trust.",
  },
  {
    title: "Instant search",
    text: "Find any note in a moment, across every notebook you can access.",
  },
  {
    title: "Roles and permissions",
    text: "Owners, admins and members: decide who can invite, edit and manage.",
  },
];

export default function Home() {
  return (
    <Column fillWidth maxWidth="l" gap="104">
      <SupabaseNotice />
      <Column as="section" fillWidth horizontal="center" align="center" gap="24" paddingY="40">
        <Tag scheme="brand" label="Notes for teams" />
        <Heading as="h1" variant="display-strong-l" wrap="balance">
          {brand.name}
        </Heading>
        <Text variant="heading-default-l" onBackground="neutral-weak">
          {brand.tagline}
        </Text>
        <Button href="/auth" size="l" label="Get started" arrowIcon />
      </Column>

      <Column as="section" id="features" fillWidth gap="32">
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

      <Column as="section" id="pricing" fillWidth gap="32">
        <Heading as="h2" variant="display-strong-xs">
          Pricing
        </Heading>
        <Grid columns="2" s={{ columns: 1 }} gap="16">
          {plans.map((p) => (
            <Column key={p.id} background="surface" border radius="l" padding="24" gap="16">
              <Heading as="h3" variant="heading-strong-l">
                {p.name}
              </Heading>
              <Row gap="8" vertical="end">
                <Text variant="display-strong-s">{p.price}</Text>
                <Text onBackground="neutral-weak">{p.per}</Text>
              </Row>
              <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
                {p.features.map((f) => (
                  <Text as="li" key={f} onBackground="neutral-weak">
                    {f}
                  </Text>
                ))}
              </Column>
              <Button href="/auth" variant={p.id === "team" ? "primary" : "secondary"} label="Get started" />
            </Column>
          ))}
        </Grid>
      </Column>
    </Column>
  );
}
