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
  VisuallyHidden,
} from "@once-ui-system/core";
import { useState } from "react";

type Billing = "monthly" | "yearly";

interface Tier {
  name: string;
  description: string;
  price?: { monthly: number; yearly: number };
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
    cta: "Start 14-day free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For organizations with security and scale requirements.",
    features: [
      "Unlimited everything",
      "SSO / SAML",
      "Audit logs",
      "99.99% uptime SLA",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
  },
];

type Cell = boolean | string;

const comparison: { feature: string; values: [Cell, Cell, Cell] }[] = [
  { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
  { feature: "Team members", values: ["5", "25", "Unlimited"] },
  { feature: "Monthly API requests", values: ["10,000", "1,000,000", "Custom"] },
  { feature: "Core analytics", values: [true, true, true] },
  { feature: "Advanced analytics", values: [false, true, true] },
  { feature: "API access", values: [false, true, true] },
  { feature: "Custom domains", values: [false, true, true] },
  { feature: "SSO / SAML", values: [false, false, true] },
  { feature: "Audit logs", values: [false, false, true] },
  { feature: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
];

const faqs = [
  {
    title: "Can I switch plans later?",
    content:
      "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and we prorate the difference; downgrades apply at the end of your current billing period.",
  },
  {
    title: "How does the free trial work?",
    content:
      "The Pro trial lasts 14 days and includes every Pro feature. You do not need a credit card to start, and we will remind you three days before it ends.",
  },
  {
    title: "What happens if I go over my limits?",
    content:
      "We never cut off your projects. If you pass a limit, we send a heads-up and give you 14 days to upgrade or trim usage before anything is restricted.",
  },
  {
    title: "Do you offer discounts for nonprofits or students?",
    content:
      "Yes. Verified nonprofits, open-source maintainers and students get 50% off any paid plan. Contact support with proof of status and we will apply the discount within one business day.",
  },
  {
    title: "Which payment methods do you accept?",
    content:
      "All major credit and debit cards. Enterprise customers can also pay by invoice with net-30 terms and bank transfer.",
  },
];

function renderCell(value: Cell, feature: string) {
  if (value === true) {
    return (
      <Row vertical="center">
        <Icon name="check" size="s" onBackground="brand-medium" aria-hidden="true" />
        <VisuallyHidden>Included: {feature}</VisuallyHidden>
      </Row>
    );
  }
  if (value === false) {
    return (
      <Row vertical="center">
        <Icon name="minus" size="s" onBackground="neutral-weak" aria-hidden="true" />
        <VisuallyHidden>Not included: {feature}</VisuallyHidden>
      </Row>
    );
  }
  return <Text variant="body-default-s">{value}</Text>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <Column as="main" fillWidth horizontal="center" gap="104" paddingBottom="104">
      <Column fillWidth center overflow="hidden" paddingY="80" paddingX="24">
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
            height: 80,
            opacity: 50,
          }}
        />
        <Column zIndex={1} center gap="24" maxWidth={48}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-l" align="center">
            Simple pricing that grows with you
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days. No credit card required, cancel anytime.
          </Text>
        </Column>
      </Column>

      <Column fillWidth horizontal="center" paddingX="24">
        <Column fillWidth maxWidth="l" gap="40">
          <Row
            fillWidth
            horizontal="between"
            vertical="end"
            gap="24"
            s={{ direction: "column", horizontal: "start" }}
          >
            <Heading as="h2" variant="display-strong-xs">
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

          <Grid as="ul" columns="3" gap="24" s={{ columns: 1 }} m={{ columns: 1 }} padding="0" margin="0">
            {tiers.map((tier) => (
              <Column
                as="li"
                key={tier.name}
                fill
                background="surface"
                border={tier.highlighted ? "brand-alpha-medium" : true}
                radius="l"
                padding="32"
                overflow="hidden"
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
                  <Row fillWidth horizontal="between" vertical="center" gap="8">
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
                        per user / month
                        {billing === "yearly" ? ", billed yearly" : ""}
                      </Text>
                    </Row>
                  ) : (
                    <Text variant="display-strong-s">Custom</Text>
                  )}
                  <Column as="ul" flex={1} gap="12" padding="0" margin="0">
                    {tier.features.map((feature) => (
                      <Row as="li" key={feature} gap="12" vertical="center">
                        <Icon name="check" size="xs" onBackground="brand-medium" aria-hidden="true" />
                        <Text variant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Button
                    fillWidth
                    variant={tier.highlighted ? "primary" : "secondary"}
                    arrowIcon={tier.highlighted}
                    href="#"
                  >
                    {tier.cta}
                  </Button>
                </Column>
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>

      <Column
        fillWidth
        horizontal="center"
        background="neutral-alpha-weak"
        paddingY="80"
        paddingX="24"
      >
        <Column fillWidth maxWidth="l" gap="40">
          <Heading as="h2" variant="display-strong-xs">
            Every feature, side by side
          </Heading>
          <Column fillWidth overflowX="auto" background="surface" border radius="l">
            <Table
              fillWidth
              data={{
                headers: [
                  { content: "Feature", key: "feature" },
                  { content: "Starter", key: "starter" },
                  { content: "Pro", key: "pro" },
                  { content: "Enterprise", key: "enterprise" },
                ],
                rows: comparison.map((row) => [
                  <Text key="f" variant="label-default-s">
                    {row.feature}
                  </Text>,
                  renderCell(row.values[0], row.feature),
                  renderCell(row.values[1], row.feature),
                  renderCell(row.values[2], row.feature),
                ]),
              }}
            />
          </Column>
        </Column>
      </Column>

      <Column fillWidth horizontal="center" paddingX="24">
        <Column fillWidth maxWidth="m" gap="40">
          <Column gap="8">
            <Heading as="h2" variant="display-strong-xs">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Can't find what you need? Our team replies within one business day.
            </Text>
          </Column>
          <AccordionGroup items={faqs} />
        </Column>
      </Column>
    </Column>
  );
}
