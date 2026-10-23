import { Button, Column, Grid, Heading, Icon, Row, Tag, Text, type IconName } from "@once-ui-system/core";
import type { Metadata } from "next";
import { brand } from "@/resources/once-ui.config";

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

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "book",
    title: "Shared notebooks",
    text: "Keep every team's notes in one place, organized in notebooks everyone can open.",
  },
  {
    icon: "search",
    title: "Instant search",
    text: "Find any note as you type, across every notebook you have access to.",
  },
  {
    icon: "lock",
    title: "Roles and permissions",
    text: "Owners, admins and members: decide who can read, write and manage.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    unit: "",
    points: ["Up to 3 members", "Shared notebooks", "Instant search"],
    cta: "Start for free",
    highlight: false,
  },
  {
    name: "Team",
    price: "$8",
    unit: "per member per month",
    points: ["Unlimited members", "Roles and permissions", "Priority support"],
    cta: "Get Team",
    highlight: true,
  },
];

export default function Home() {
  return (
    <Column maxWidth="l" fillWidth gap="104" paddingY="64">
      <Column horizontal="center" gap="24" align="center" paddingTop="40">
        <Tag scheme="brand" label="Notes for teams" />
        <Heading variant="display-strong-l" as="h1" align="center">
          {brand.name}
        </Heading>
        <Text variant="heading-default-xl" onBackground="neutral-weak" align="center">
          {brand.tagline}
        </Text>
        <Button href="/auth" size="l" label="Get started" arrowIcon />
      </Column>

      <Column gap="32" id="features">
        <Heading variant="display-strong-xs" as="h2">
          Everything your team needs to remember
        </Heading>
        <Grid columns="3" gap="16" s={{ columns: 1 }} m={{ columns: 1 }}>
          {features.map((f) => (
            <Column key={f.title} background="surface" border radius="l" padding="24" gap="12">
              <Icon name={f.icon} onBackground="brand-medium" />
              <Heading variant="heading-strong-l" as="h3">
                {f.title}
              </Heading>
              <Text onBackground="neutral-weak">{f.text}</Text>
            </Column>
          ))}
        </Grid>
      </Column>

      <Column gap="32" id="pricing">
        <Heading variant="display-strong-xs" as="h2">
          Pricing
        </Heading>
        <Grid columns="2" gap="16" s={{ columns: 1 }}>
          {plans.map((p) => (
            <Column
              key={p.name}
              background="surface"
              border={p.highlight ? "brand-alpha-strong" : true}
              radius="l"
              padding="24"
              gap="16"
            >
              <Row vertical="center" gap="8">
                <Heading variant="heading-strong-xl" as="h3">
                  {p.name}
                </Heading>
                {p.highlight && <Tag scheme="brand" label="Popular" />}
              </Row>
              <Row vertical="end" gap="8" style={{ alignItems: "baseline" }}>
                <Heading variant="display-strong-s" as="p">
                  {p.price}
                </Heading>
                <Text onBackground="neutral-weak">{p.unit || "forever, up to 3 members"}</Text>
              </Row>
              <Column gap="8">
                {p.points.map((pt) => (
                  <Row key={pt} gap="8" vertical="center">
                    <Icon name="check" size="s" onBackground="brand-medium" />
                    <Text>{pt}</Text>
                  </Row>
                ))}
              </Column>
              <Button
                href="/auth"
                variant={p.highlight ? "primary" : "secondary"}
                label={p.cta}
                fillWidth
              />
            </Column>
          ))}
        </Grid>
      </Column>
    </Column>
  );
}
