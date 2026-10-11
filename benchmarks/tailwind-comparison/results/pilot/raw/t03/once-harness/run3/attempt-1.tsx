"use client";

import {
  AccordionGroup,
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

type Billing = "monthly" | "yearly";

interface Tier {
  name: string;
  description: string;
  price: { monthly: number; yearly: number } | null;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Starter",
    description: "For solo builders shipping their first product.",
    price: { monthly: 19, yearly: 15 },
    features: ["3 projects", "5 team members", "Core analytics", "Community support"],
    cta: "Start with Starter",
  },
  {
    name: "Pro",
    description: "For growing teams that need speed and depth.",
    price: { monthly: 49, yearly: 39 },
    features: [
      "Unlimited projects",
      "25 team members",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For organizations with security and scale requirements.",
    price: null,
    features: [
      "Unlimited everything",
      "SSO / SAML",
      "Audit logs",
      "Dedicated success manager",
      "99.99% uptime SLA",
    ],
    cta: "Talk to sales",
  },
];

const comparisonRows: string[][] = [
  ["Projects", "3", "Unlimited", "Unlimited"],
  ["Team members", "5", "25", "Unlimited"],
  ["Analytics", "Core", "Advanced", "Advanced + export"],
  ["API access", "No", "Yes", "Yes"],
  ["Custom domains", "1", "10", "Unlimited"],
  ["SSO / SAML", "No", "No", "Yes"],
  ["Audit logs", "No", "No", "Yes"],
  ["Support", "Community", "Priority email", "Dedicated manager"],
  ["Uptime SLA", "No", "99.9%", "99.99%"],
];

const faqs = [
  {
    title: "Can I change plans later?",
    content:
      "Yes. Upgrade or downgrade at any time from your billing settings. Upgrades apply immediately and we prorate the difference; downgrades take effect at the end of your billing period.",
  },
  {
    title: "Is there a free trial on the Pro plan?",
    content:
      "Every Pro workspace starts with a 14-day free trial. No credit card is required, and you can invite your whole team while you evaluate it.",
  },
  {
    title: "How does yearly billing work?",
    content:
      "Yearly plans are billed once per year at a 20% discount compared with paying monthly. You can switch between monthly and yearly billing whenever you renew.",
  },
  {
    title: "What payment methods do you accept?",
    content:
      "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with net-30 terms and bank transfer.",
  },
  {
    title: "What happens if I go over my plan limits?",
    content:
      "We never cut off your projects without warning. You will get an email when you reach 80% of a limit, and you can upgrade in one click or archive unused items.",
  },
  {
    title: "Do you offer discounts for nonprofits or students?",
    content:
      "Yes. Verified nonprofits, open source maintainers and students get 50% off Pro. Contact our support team with proof of status and we will apply the discount.",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <Column as="main" fillWidth horizontal="center" gap="104" paddingBottom="104">
      <Column as="header" fillWidth center overflow="hidden" paddingY="80" paddingX="24">
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            colorStart: "brand-alpha-medium",
            colorEnd: "static-transparent",
            x: 50,
            y: 0,
            width: 200,
            height: 100,
            opacity: 50,
          }}
        />
        <Column zIndex={1} center gap="24" maxWidth={40}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-l" align="center">
            Pay for momentum, not seats
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free, scale when you are ready. Every plan includes unlimited viewers and a
            14-day trial of everything in Pro.
          </Text>
        </Column>
      </Column>

      <Column as="section" fillWidth horizontal="center" paddingX="24" aria-labelledby="plans-title">
        <Column maxWidth="l" gap="40">
          <Row
            fillWidth
            horizontal="between"
            vertical="end"
            gap="24"
            s={{ direction: "column", horizontal: "start" }}
          >
            <Heading as="h2" id="plans-title" variant="display-strong-xs">
              Three plans, one decision
            </Heading>
            <SegmentedControl
              value={billing}
              onChange={(value) => setBilling(value as Billing)}
              buttons={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly (save 20%)" },
              ]}
            />
          </Row>

          <Grid columns="3" gap="24" s={{ columns: 1 }}>
            {tiers.map((tier) => (
              <Column
                key={tier.name}
                as="article"
                background="surface"
                border={tier.highlighted ? "brand-alpha-medium" : true}
                radius="l"
                padding="32"
                overflow="hidden"
                aria-label={`${tier.name} plan`}
              >
                {tier.highlighted && (
                  <Background
                    position="absolute"
                    top="0"
                    left="0"
                    fill
                    pointerEvents="none"
                    gradient={{
                      display: true,
                      colorStart: "brand-alpha-medium",
                      colorEnd: "static-transparent",
                      x: 50,
                      y: 0,
                      width: 200,
                      height: 60,
                      opacity: 50,
                    }}
                  />
                )}
                <Column zIndex={1} fill gap="24">
                  <Row fillWidth horizontal="between" vertical="center">
                    <Heading as="h3" variant="heading-strong-m">
                      {tier.name}
                    </Heading>
                    {tier.highlighted && <Tag scheme="brand" size="s" label="Most popular" />}
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {tier.description}
                  </Text>
                  {tier.price ? (
                    <Row vertical="end" gap="4">
                      <Text variant="display-strong-s">${tier.price[billing]}</Text>
                      <Text
                        variant="label-default-s"
                        onBackground="neutral-weak"
                        paddingBottom="4"
                      >
                        per month{billing === "yearly" ? ", billed yearly" : ""}
                      </Text>
                    </Row>
                  ) : (
                    <Text variant="display-strong-s">Custom</Text>
                  )}
                  <Column as="ul" flex={1} gap="12" margin="0" padding="0">
                    {tier.features.map((feature) => (
                      <Row as="li" key={feature} gap="12" vertical="center">
                        <Icon name="checkbox" size="xs" onBackground="brand-medium" />
                        <Text variant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Button fillWidth variant={tier.highlighted ? "primary" : "secondary"}>
                    {tier.cta}
                  </Button>
                </Column>
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>

      <Column
        as="section"
        fillWidth
        horizontal="center"
        background="neutral-alpha-weak"
        paddingY="80"
        paddingX="24"
        aria-labelledby="compare-title"
      >
        <Column maxWidth="l" gap="40">
          <Heading as="h2" id="compare-title" variant="display-strong-xs">
            Every feature, side by side
          </Heading>
          <Column fillWidth overflowX="auto">
            <Column minWidth={40}>
              <Table
                fillWidth
                data={{
                  headers: [
                    { content: "Feature", key: "feature" },
                    { content: "Starter", key: "starter" },
                    { content: "Pro", key: "pro" },
                    { content: "Enterprise", key: "enterprise" },
                  ],
                  rows: comparisonRows,
                }}
              />
            </Column>
          </Column>
        </Column>
      </Column>

      <Column as="section" fillWidth horizontal="center" paddingX="24" aria-labelledby="faq-title">
        <Column maxWidth="m" gap="40">
          <Column gap="12">
            <Heading as="h2" id="faq-title" variant="display-strong-xs">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Can't find what you need? Email billing@example.com and a human will reply within one
              business day.
            </Text>
          </Column>
          <AccordionGroup items={faqs} />
        </Column>
      </Column>
    </Column>
  );
}
