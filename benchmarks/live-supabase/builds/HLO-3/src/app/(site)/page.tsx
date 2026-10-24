import { Button, Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { brand, seo } from "@/resources/once-ui.config";

export const metadata: Metadata = {
  ...pageMetadata(seo.title, seo.description, "/"),
  title: { absolute: brand.name },
};

const features = [
  {
    title: "Shared notebooks",
    text: "Put notes in notebooks your team can open, edit and follow along in.",
  },
  {
    title: "Instant search",
    text: "Type a few words and find the note, even when it was written last year.",
  },
  {
    title: "Roles and permissions",
    text: "Owners and admins decide who can invite, rename and change the plan. Members write.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    points: ["Up to 3 members", "Shared notebooks", "Instant search"],
    cta: "Start free",
  },
  {
    name: "Team",
    price: "$8",
    per: "per member per month",
    points: ["Unlimited members", "Everything in Free", "Roles and permissions"],
    cta: "Choose Team",
  },
];

export default function LandingPage() {
  return (
    <>
      <Column as="section" gap="24" horizontal="center" align="center" paddingY="32">
        <Tag label="Acme Notes" scheme="brand" size="m" />
        <Heading as="h1" variant="display-strong-l" align="center">
          {brand.name}
        </Heading>
        <Text variant="heading-default-l" onBackground="neutral-weak" align="center">
          {brand.tagline}
        </Text>
        <Button href="/auth" size="l" label="Get started" suffixIcon="arrowRight" />
      </Column>

      <Column as="section" gap="16">
        <Row gap="16" wrap>
          {features.map((feature) => (
            <Column
              key={feature.title}
              flex={1}
              minWidth={16}
              background="surface"
              border
              radius="l"
              padding="24"
              gap="8"
            >
              <Heading as="h2" variant="heading-strong-m">
                {feature.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {feature.text}
              </Text>
            </Column>
          ))}
        </Row>
      </Column>

      <Column as="section" gap="16" id="pricing">
        <Heading as="h2" variant="display-strong-s">
          Pricing
        </Heading>
        <Row gap="16" wrap>
          {plans.map((plan) => (
            <Column
              key={plan.name}
              flex={1}
              minWidth={16}
              background="surface"
              border
              radius="l"
              padding="24"
              gap="16"
            >
              <Heading as="h3" variant="heading-strong-m">
                {plan.name}
              </Heading>
              <Row gap="4" vertical="end">
                <Heading as="p" variant="display-strong-s">
                  {plan.price}
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {plan.per}
                </Text>
              </Row>
              <Column as="ul" gap="8" paddingLeft="16">
                {plan.points.map((point) => (
                  <Text as="li" key={point} variant="body-default-m">
                    {point}
                  </Text>
                ))}
              </Column>
              <Button href="/auth" variant="secondary" label={plan.cta} />
            </Column>
          ))}
        </Row>
      </Column>
    </>
  );
}
