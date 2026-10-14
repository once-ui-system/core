```tsx
"use client";

import {
  Background,
  BlobFx,
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  MatrixFx,
  RevealFx,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
  AccordionGroup,
  VisuallyHidden,
  useInViewport,
} from "@once-ui-system/core";
import { useEffect, useRef, useState } from "react";

type Billing = "monthly" | "yearly";

interface Tier {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number } | null;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo builders and side projects shipping their first release.",
    price: { monthly: 19, yearly: 15 },
    features: [
      "3 active projects",
      "5 team members",
      "10,000 monthly events",
      "Core analytics dashboards",
      "Community support",
    ],
    cta: "Start with Starter",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing product teams that need speed, depth and control.",
    price: { monthly: 49, yearly: 39 },
    features: [
      "Unlimited projects",
      "25 team members",
      "1M monthly events",
      "Custom dashboards and alerts",
      "API access and webhooks",
      "Priority email support",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with strict security, compliance and scale needs.",
    price: null,
    features: [
      "Unlimited everything",
      "SSO / SAML and SCIM",
      "Unlimited events with 24-month retention",
      "Audit logs and custom roles",
      "Dedicated success manager",
      "99.99% uptime SLA",
    ],
    cta: "Talk to sales",
  },
];

type Cell = string | boolean;

interface ComparisonRow {
  feature: string;
  values: [Cell, Cell, Cell];
}

const comparison: ComparisonRow[] = [
  { feature: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
  { feature: "Team members", values: ["5", "25", "Unlimited"] },
  { feature: "Monthly events", values: ["10,000", "1,000,000", "Unlimited"] },
  { feature: "Data retention", values: ["30 days", "12 months", "24 months"] },
  { feature: "Core analytics dashboards", values: [true, true, true] },
  { feature: "Custom dashboards and alerts", values: [false, true, true] },
  { feature: "API access and webhooks", values: [false, true, true] },
  { feature: "SSO / SAML and SCIM", values: [false, false, true] },
  { feature: "Audit logs and custom roles", values: [false, false, true] },
  { feature: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
  { feature: "Uptime SLA", values: ["—", "99.9%", "99.99%"] },
];

const faqItems = [
  {
    title: "Can I switch plans at any time?",
    content: (
      <Text variant="body-default-m" onBackground="neutral-weak">
        Yes. Upgrades take effect immediately and you are only charged the prorated difference for
        the rest of the billing period. Downgrades apply at the start of your next billing cycle, so
        you keep everything you have paid for.
      </Text>
    ),
  },
  {
    title: "How does the free trial work?",
    content: (
      <Text variant="body-default-m" onBackground="neutral-weak">
        Every Pro trial lasts 14 days and includes all Pro features. No credit card is required to
        start, and we will email you three days before the trial ends so there are no surprises.
      </Text>
    ),
  },
  {
    title: "What counts as a monthly event?",
    content: (
      <Text variant="body-default-m" onBackground="neutral-weak">
        An event is any single action your app sends to us, such as a page view, a button click or a
        custom event. If you go over your plan limit we will notify you first and never cut off
        data collection mid-month.
      </Text>
    ),
  },
  {
    title: "Do you offer discounts for startups or nonprofits?",
    content: (
      <Text variant="body-default-m" onBackground="neutral-weak">
        We offer 50% off the first year for early-stage startups and 30% off for registered
        nonprofits and open-source maintainers. Contact our team with a short description of your
        organization and we will set it up within a business day.
      </Text>
    ),
  },
  {
    title: "Which payment methods do you accept?",
    content: (
      <Text variant="body-default-m" onBackground="neutral-weak">
        We accept all major credit and debit cards. Yearly Pro plans and all Enterprise plans can
        also be paid by invoice with bank transfer.
      </Text>
    ),
  },
  {
    title: "Can I cancel and export my data?",
    content: (
      <Text variant="body-default-m" onBackground="neutral-weak">
        You can cancel from your billing settings whenever you like. Before you go, export all of
        your events and dashboards as CSV or JSON. We keep your workspace for 30 days in case you
        change your mind.
      </Text>
    ),
  },
];

function renderCell(value: Cell, tierName: string) {
  if (value === true) {
    return (
      <Row center>
        <Icon name="check" size="s" onBackground="brand-medium" decorative />
        <VisuallyHidden>Included in {tierName}</VisuallyHidden>
      </Row>
    );
  }
  if (value === false) {
    return (
      <Row center>
        <Icon name="minus" size="s" onBackground="neutral-weak" decorative />
        <VisuallyHidden>Not included in {tierName}</VisuallyHidden>
      </Row>
    );
  }
  return (
    <Text variant="body-default-s" align="center">
      {value}
    </Text>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const tiersRef = useRef<HTMLDivElement>(null);
  const tiersInViewport = useInViewport(tiersRef);
  const [tiersSeen, setTiersSeen] = useState(false);

  useEffect(() => {
    if (tiersInViewport) setTiersSeen(true);
  }, [tiersInViewport]);

  return (
    <Column as="main" fillWidth horizontal="center" gap="104" paddingBottom="104">
      {/* Hero */}
      <Column fillWidth center overflow="hidden" paddingY="80">
        <MatrixFx
          position="absolute"
          top="0"
          left="0"
          fill
          flicker
          size={1.5}
          spacing={8}
          colors={["brand-solid-strong"]}
          bulge={{ type: "wave", duration: 3, intensity: 20, repeat: true }}
        />
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            colorStart: "page-background",
            x: 0,
            y: 50,
            width: 150,
            height: 300,
          }}
        />
        <Column zIndex={1} center gap="24" paddingX="24" paddingY="48" maxWidth={48}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-l" align="center">
            Pay for momentum, not for seats
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days, then pick the plan that fits your team. Every plan includes
            unlimited dashboards viewers, encrypted storage and no setup fees.
          </Text>
        </Column>
      </Column>

      {/* Tiers */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="l" gap="40">
          <Row
            fillWidth
            horizontal="between"
            vertical="end"
            gap="24"
            s={{ direction: "column", horizontal: "start" }}
          >
            <Column gap="8">
              <Heading as="h2" variant="display-strong-xs">
                Three plans, one clear choice
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Switch billing period to see yearly savings.
              </Text>
            </Column>
            <Column maxWidth={20} s={{ maxWidth: 100 }} fillWidth>
              <SegmentedControl
                value={billing}
                onChange={(value) => setBilling(value === "yearly" ? "yearly" : "monthly")}
                buttons={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly (save 20%)" },
                ]}
              />
            </Column>
          </Row>

          <Grid ref={tiersRef} columns="3" gap="24" m={{ columns: 1 }} s={{ columns: 1 }}>
            {tiers.map((tier, index) => (
              <RevealFx
                key={tier.id}
                fill
                revealed={tiersSeen}
                translateY="8"
                delay={index * 100}
              >
                <Column
                  as="section"
                  aria-labelledby={`tier-${tier.id}`}
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
                    <Row fillWidth horizontal="between" vertical="center" gap="12">
                      <Heading as="h3" id={`tier-${tier.id}`} variant="heading-strong-l">
                        {tier.name}
                      </Heading>
                      {tier.highlighted && <Tag scheme="brand" size="s" label="Most popular" />}
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {tier.description}
                    </Text>
                    {tier.price ? (
                      <Column gap="4">
                        <Row vertical="end" gap="2">
                          <Text variant="display-strong-s">$</Text>
                          <CountFx
                            variant="display-strong-s"
                            value={tier.price[billing]}
                            effect="wheel"
                            speed={400}
                          />
                          <Text
                            variant="label-default-s"
                            onBackground="neutral-weak"
                            paddingBottom="4"
                            paddingLeft="4"
                          >
                            per user / month
                          </Text>
                        </Row>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          {billing === "yearly"
                            ? "Billed annually, 20% off"
                            : "Billed monthly, cancel anytime"}
                        </Text>
                      </Column>
                    ) : (
                      <Column gap="4">
                        <Text variant="display-strong-s">Custom</Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          Volume pricing and annual contracts
                        </Text>
                      </Column>
                    )}
                    <Column
                      as="ul"
                      flex={1}
                      gap="12"
                      margin="0"
                      padding="0"
                      style={{ listStyle: "none" }}
                    >
                      {tier.features.map((feature) => (
                        <Row as="li" key={feature} gap="12" vertical="start">
                          <Icon
                            name="check"
                            size="xs"
                            onBackground="brand-medium"
                            marginTop="2"
                            decorative
                          />
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
              </RevealFx>
            ))}
          </Grid>
        </Column>
      </Column>

      {/* Comparison */}
      <Column
        fillWidth
        horizontal="center"
        background="neutral-alpha-weak"
        paddingY="80"
        paddingX="24"
      >
        <Column maxWidth="l" gap="40">
          <Column gap="8">
            <Heading as="h2" variant="display-strong-xs">
              Every feature, side by side
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Compare limits, integrations and support across all plans.
            </Text>
          </Column>
          <Column fillWidth overflowX="auto" radius="l" border background="surface">
            <Column minWidth={40} fillWidth>
              <Table
                fillWidth
                data={{
                  headers: [
                    { content: "Feature", key: "feature", align: "left" },
                    { content: "Starter", key: "starter", align: "center" },
                    { content: "Pro", key: "pro", align: "center" },
                    { content: "Enterprise", key: "enterprise", align: "center" },
                  ],
                  rows: comparison.map((row) => [
                    <Text key={`${row.feature}-label`} variant="body-default-s">
                      {row.feature}
                    </Text>,
                    renderCell(row.values[0], "Starter"),
                    renderCell(row.values[1], "Pro"),
                    renderCell(row.values[2], "Enterprise"),
                  ]),
                }}
              />
            </Column>
          </Column>
        </Column>
      </Column>

      {/* FAQ */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="m" gap="40">
          <Column gap="8" horizontal="center">
            <Heading as="h2" variant="display-strong-xs" align="center">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Can't find what you need? Our team answers within one business day.
            </Text>
          </Column>
          <AccordionGroup items={faqItems} />
        </Column>
      </Column>

      {/* CTA */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="l" radius="xl" border overflow="hidden" padding="64" s={{ padding: "32" }} center>
          <BlobFx position="absolute" top="0" left="0" fill opacity={60} seed={2} />
          <Column zIndex={1} center gap="24" maxWidth={40}>
            <Heading as="h2" variant="display-strong-s" align="center">
              Ship your next launch on Pro
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Join more than 4,000 product teams measuring what matters. Start your 14-day trial
              today, no credit card needed.
            </Text>
            <Button arrowIcon>Start free trial</Button>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
```