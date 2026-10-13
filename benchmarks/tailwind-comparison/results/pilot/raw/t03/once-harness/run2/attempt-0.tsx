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
import { type ReactNode, useState } from "react";

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
  { feature: "Storage", values: ["10 GB", "250 GB", "2 TB"] },
  { feature: "Core analytics", values: [true, true, true] },
  { feature: "Advanced analytics", values: [false, true, true] },
  { feature: "API access", values: [false, true, true] },
  { feature: "Custom domains", values: [false, true, true] },
  { feature: "SSO / SAML", values: [false, false, true] },
  { feature: "Audit logs", values: [false, false, true] },
  { feature: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
];

const faqs: { title: string; content: string }[] = [
  {
    title: "Can I switch plans later?",
    content:
      "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades apply immediately and we prorate the difference; downgrades take effect at the end of the current billing period.",
  },
  {
    title: "How does the free trial work?",
    content:
      "The Pro trial lasts 14 days and needs no credit card. At the end of the trial your workspace moves to Starter unless you choose to continue with Pro.",
  },
  {
    title: "What counts as a team member?",
    content:
      "Anyone who can sign in and edit a project counts as a member. Read-only viewers and invited guests with comment access are free on every plan.",
  },
  {
    title: "Do you offer discounts for nonprofits or students?",
    content:
      "We offer 30% off for registered nonprofits and free Pro access for verified students and educators. Contact our team with a short description of your organization.",
  },
  {
    title: "Which payment methods do you accept?",
    content:
      "All major credit cards are accepted on monthly and yearly plans. Enterprise customers can also pay by invoice with net-30 terms or by bank transfer.",
  },
  {
    title: "What happens to my data if I cancel?",
    content:
      "Your data stays available in read-only mode for 30 days after cancellation, and you can export everything as JSON or CSV at any time. After that it is permanently deleted.",
  },
];

function renderCell(value: Cell): ReactNode {
  if (value === true) {
    return (
      <Row vertical="center" gap="8">
        <Icon name="check" size="s" onBackground="brand-medium" />
        <VisuallyHidden>Included</VisuallyHidden>
      </Row>
    );
  }
  if (value === false) {
    return (
      <Row vertical="center" gap="8">
        <Text aria-hidden="true" onBackground="neutral-weak">
          —
        </Text>
        <VisuallyHidden>Not included</VisuallyHidden>
      </Row>
    );
  }
  return <Text variant="body-default-s">{value}</Text>;
}

export default function Page() {
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
            Simple pricing that grows with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days, upgrade when you are ready, and cancel whenever you like. No
            hidden fees, no per-seat surprises.
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
            <Column maxWidth={20} fillWidth>
              <SegmentedControl
                value={billing}
                onChange={(value) => setBilling(value as Billing)}
                buttons={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly (save 20%)" },
                ]}
              />
            </Column>
          </Row>

          <Grid columns="3" gap="24" m={{ columns: 1 }} s={{ columns: 1 }} as="ul" padding="0" margin="0">
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
                        per month{billing === "yearly" ? ", billed yearly" : ""}
                      </Text>
                    </Row>
                  ) : (
                    <Text variant="display-strong-s">Custom</Text>
                  )}
                  <Column as="ul" flex={1} gap="12" padding="0" margin="0">
                    {tier.features.map((feature) => (
                      <Row as="li" key={feature} gap="12" vertical="center">
                        <Icon name="check" size="xs" onBackground="brand-medium" />
                        <Text variant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Button
                    fillWidth
                    variant={tier.highlighted ? "primary" : "secondary"}
                    arrowIcon={tier.highlighted}
                    aria-label={`${tier.cta}, ${tier.name} plan`}
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
          <Column
            fillWidth
            overflowX="auto"
            role="region"
            aria-label="Feature comparison table"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard reachable
            tabIndex={0}
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
                  <Text key={`${row.feature}-label`} variant="label-default-s">
                    {row.feature}
                  </Text>,
                  ...row.values.map(renderCell),
                ]),
              }}
            />
          </Column>
        </Column>
      </Column>

      <Column fillWidth horizontal="center" paddingX="24">
        <Column fillWidth maxWidth="m" gap="40">
          <Column gap="16">
            <Heading as="h2" variant="display-strong-xs">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Can't find what you need? Email billing@example.com and we'll reply within one
              business day.
            </Text>
          </Column>
          <AccordionGroup items={faqs} />
        </Column>
      </Column>
    </Column>
  );
}
