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
    cta: "Start free trial",
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

type Cell = string | boolean;

const comparison: { feature: string; values: [Cell, Cell, Cell] }[] = [
  { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
  { feature: "Team members", values: ["5", "25", "Unlimited"] },
  { feature: "Core analytics", values: [true, true, true] },
  { feature: "Advanced analytics", values: [false, true, true] },
  { feature: "API access", values: [false, true, true] },
  { feature: "Custom domains", values: [false, true, true] },
  { feature: "Priority support", values: [false, true, true] },
  { feature: "SSO / SAML", values: [false, false, true] },
  { feature: "Audit logs", values: [false, false, true] },
  { feature: "Uptime SLA", values: ["—", "99.9%", "99.99%"] },
];

const faqs = [
  {
    title: "Can I switch plans later?",
    content:
      "Yes. Upgrades apply immediately and are prorated for the rest of your billing period. Downgrades take effect at the start of your next cycle.",
  },
  {
    title: "What happens when my free trial ends?",
    content:
      "The Pro trial lasts 14 days and needs no credit card. If you do not add payment details, your workspace moves to read-only mode and nothing is deleted.",
  },
  {
    title: "How does yearly billing work?",
    content:
      "Yearly plans are billed once per year at a 20% discount compared with paying monthly. You can cancel at any time and keep access until the period ends.",
  },
  {
    title: "Do you offer discounts for non-profits or students?",
    content:
      "We offer 50% off Starter and Pro for registered non-profits, open-source maintainers and students. Contact support with proof of status.",
  },
  {
    title: "Which payment methods do you accept?",
    content:
      "All major credit and debit cards, plus invoicing with bank transfer on Enterprise contracts.",
  },
];

function renderCell(value: Cell) {
  if (value === true) {
    return (
      <>
        <Icon name="check" size="s" onBackground="brand-medium" decorative />
        <VisuallyHidden>Included</VisuallyHidden>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Icon name="minus" size="s" onBackground="neutral-weak" decorative />
        <VisuallyHidden>Not included</VisuallyHidden>
      </>
    );
  }
  return value;
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
            height: 100,
            opacity: 50,
          }}
        />
        <Column zIndex={1} center gap="24" maxWidth={48}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-l" align="center">
            Pay for momentum, not seats
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days, then pick the plan that fits your team. Change or cancel
            whenever you like.
          </Text>
        </Column>
      </Column>

      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="l" gap="40">
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
                { value: "yearly", label: "Yearly −20%" },
              ]}
            />
          </Row>

          <Grid columns="3" gap="24" s={{ columns: 1 }} m={{ columns: 1 }} as="ul" margin="0" padding="0">
            {tiers.map((tier) => (
              <Column
                as="li"
                key={tier.name}
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
                    {tier.highlighted && <Tag size="s" label="Most popular" />}
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
                        / user / month
                        {billing === "yearly" ? ", billed yearly" : ""}
                      </Text>
                    </Row>
                  ) : (
                    <Text variant="display-strong-s">Custom</Text>
                  )}
                  <Column as="ul" flex={1} gap="12" margin="0" padding="0">
                    {tier.features.map((feature) => (
                      <Row as="li" key={feature} gap="12" vertical="center">
                        <Icon name="check" size="xs" onBackground="brand-medium" decorative />
                        <Text variant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Button
                    fillWidth
                    variant={tier.highlighted ? "primary" : "secondary"}
                    arrowIcon={tier.highlighted}
                    aria-label={`${tier.cta} — ${tier.name} plan`}
                  >
                    {tier.cta}
                  </Button>
                </Column>
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>

      <Column fillWidth horizontal="center" background="neutral-alpha-weak" paddingY="80" paddingX="24">
        <Column maxWidth="l" gap="40">
          <Heading as="h2" variant="display-strong-xs">
            Every feature, side by side
          </Heading>
          <Column
            fillWidth
            overflowX="auto"
            tabIndex={0}
            role="region"
            aria-label="Plan feature comparison, scrollable"
          >
            <Table
              fillWidth
              minWidth={40}
              data={{
                headers: [
                  { content: "Feature", key: "feature" },
                  { content: "Starter", key: "starter" },
                  { content: "Pro", key: "pro" },
                  { content: "Enterprise", key: "enterprise" },
                ],
                rows: comparison.map((row) => [
                  row.feature,
                  renderCell(row.values[0]),
                  renderCell(row.values[1]),
                  renderCell(row.values[2]),
                ]),
              }}
            />
          </Column>
        </Column>
      </Column>

      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="m" gap="40">
          <Heading as="h2" variant="display-strong-xs">
            Frequently asked questions
          </Heading>
          <AccordionGroup fillWidth items={faqs} />
        </Column>
      </Column>
    </Column>
  );
}
