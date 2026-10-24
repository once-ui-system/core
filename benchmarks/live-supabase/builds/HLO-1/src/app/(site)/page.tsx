import { Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { site } from "../../resources/once-ui.config";
import { pageMetadata } from "../../lib/seo";

const meta = pageMetadata({
  title: site.name,
  description: site.description,
  path: "/",
});

export const metadata: Metadata = {
  ...meta,
  title: { absolute: `${site.name}: ${site.tagline}` },
};

const features = [
  {
    title: "Shared notebooks",
    text: "Every notebook belongs to your organization. Your team writes in one place, and new members see the notes they need.",
  },
  {
    title: "Instant search",
    text: "Search runs as you type across every notebook you can open, so the note you need is one query away.",
  },
  {
    title: "Roles and permissions",
    text: "Owners, admins and members each get the access they need. Admins invite people by link, and nobody sees another team's notes.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    points: ["Up to 3 members", "Shared notebooks and search"],
  },
  {
    name: "Team",
    price: "$8",
    period: "per member per month",
    points: ["Everything in Free", "Billed per member, per month"],
  },
];

export default function Home() {
  return (
    <Column horizontal="center" fillWidth paddingX="16">
      <Column maxWidth="l" gap="104">
        <Column as="section" fillWidth gap="24" paddingY="80" align="center" horizontal="center">
          <Text variant="label-default-s" onBackground="brand-medium">
            Team notes
          </Text>
          <Heading as="h1" variant="display-strong-l" align="center">
            {site.name}
          </Heading>
          <Text as="p" variant="heading-default-xl" onBackground="neutral-medium" align="center" wrap="balance">
            {site.tagline}
          </Text>
          <Button href="/auth" size="l" label="Get started" suffixIcon="arrowRight" />
        </Column>

        <Column as="section" fillWidth gap="24">
          <Grid columns="3" s={{ columns: "1" }} gap="16" fillWidth>
            {features.map((feature) => (
              <Column key={feature.title} background="surface" border radius="l" padding="24" gap="12">
                <Heading as="h2" variant="heading-strong-s">
                  {feature.title}
                </Heading>
                <Text as="p" variant="body-default-m" onBackground="neutral-medium">
                  {feature.text}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>

        <Column as="section" fillWidth gap="24" paddingBottom="40">
          <Column gap="8" align="center" horizontal="center">
            <Heading as="h2" variant="display-strong-xs" align="center">
              Pricing
            </Heading>
            <Text as="p" variant="body-default-m" onBackground="neutral-medium" align="center">
              Start free. Upgrade when your team grows.
            </Text>
          </Column>
          <Grid columns="2" s={{ columns: "1" }} gap="16" fillWidth>
            {plans.map((plan) => (
              <Column key={plan.name} background="surface" border radius="l" padding="24" gap="16">
                <Heading as="h3" variant="heading-strong-m">
                  {plan.name}
                </Heading>
                <Row gap="8" vertical="end">
                  <Text variant="display-strong-s">{plan.price}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {plan.period}
                  </Text>
                </Row>
                <Column as="ul" gap="8" paddingLeft="20" margin="0">
                  {plan.points.map((point) => (
                    <Text as="li" key={point} variant="body-default-m" onBackground="neutral-medium">
                      {point}
                    </Text>
                  ))}
                </Column>
                <Button href="/auth" variant="secondary" label={plan.name === "Free" ? "Start free" : "Get started"} />
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>
    </Column>
  );
}
