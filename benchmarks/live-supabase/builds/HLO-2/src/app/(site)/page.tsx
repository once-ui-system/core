import { Button, Column, Grid, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { brand, seo } from "@/resources/once-ui.config";

const title = `${brand.name}: ${brand.tagline}`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: brand.description,
  openGraph: {
    title,
    description: brand.description,
    url: seo.url,
    siteName: seo.siteName,
    locale: seo.locale,
    type: "website",
  },
};

const features = [
  {
    title: "Shared notebooks",
    body: "Group notes into notebooks the whole team can open, edit and link to.",
  },
  {
    title: "Instant search",
    body: "Search every notebook you can see and get results as you type.",
  },
  {
    title: "Roles and permissions",
    body: "Owners, admins and members each see and change what their role allows.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "for small teams",
    detail: "Up to 3 members",
  },
  {
    name: "Team",
    price: "$8",
    period: "per member per month",
    detail: "Invite the whole team, billed per member",
  },
];

export default function Home() {
  return (
    <Column maxWidth="l" paddingX="24" paddingY="64" gap="104">
      <Column as="section" align="center" horizontal="center" gap="24">
        <Heading as="h1" variant="display-strong-xl" align="center">
          {brand.name}
        </Heading>
        <Text as="p" variant="heading-default-xl" onBackground="neutral-medium" align="center">
          {brand.tagline}
        </Text>
        <Button href="/auth" label="Get started" size="l" arrowIcon />
      </Column>

      <Column as="section" gap="24">
        <Heading as="h2" variant="display-strong-s">
          Built for writing together
        </Heading>
        <Grid columns="3" s={{ columns: "1" }} gap="16">
          {features.map((feature) => (
            <Column key={feature.title} background="surface" border radius="l" padding="24" gap="8">
              <Heading as="h3" variant="heading-strong-m">
                {feature.title}
              </Heading>
              <Text as="p" onBackground="neutral-medium">
                {feature.body}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>

      <Column as="section" gap="24">
        <Heading as="h2" variant="display-strong-s">
          Pricing
        </Heading>
        <Grid columns="2" s={{ columns: "1" }} gap="16">
          {plans.map((plan) => (
            <Column key={plan.name} background="surface" border radius="l" padding="32" gap="16">
              <Text variant="label-strong-m" onBackground="brand-medium">
                {plan.name}
              </Text>
              <Column gap="4">
                <Heading as="h3" variant="display-strong-m">
                  {plan.price}
                </Heading>
                <Text onBackground="neutral-weak">{plan.period}</Text>
              </Column>
              <Text onBackground="neutral-medium">{plan.detail}</Text>
              <Button href="/auth" label={plan.name === "Free" ? "Start free" : "Get started"} variant="secondary" />
            </Column>
          ))}
        </Grid>
      </Column>
    </Column>
  );
}
