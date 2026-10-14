```tsx
"use client";

import {
  AccordionGroup,
  Background,
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  RevealFx,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
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
      "30-day data retention",
      "Community support",
    ],
    cta: "Start with Starter",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing product teams that need speed, depth and automation.",
    price: { monthly: 49, yearly: 39 },
    features: [
      "Unlimited projects",
      "25 team members",
      "1M monthly events",
      "12-month data retention",
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
      "Custom data retention",
      "99.99% uptime SLA",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
  },
];

type CellValue = string | boolean;

interface ComparisonRow {
  feature: string;
  starter: CellValue;
  pro: CellValue;
  enterprise: CellValue;
}

const comparison: ComparisonRow[] = [
  { feature: "Active projects", starter: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Team members", starter: "5", pro: "25", enterprise: "Unlimited" },
  { feature: "Monthly events", starter: "10,000", pro: "1,000,000", enterprise: "Custom" },
  { feature: "Data retention", starter: "30 days", pro: "12 months", enterprise: "Custom" },
  { feature: "Core analytics", starter: true, pro: true, enterprise: true },
  { feature: "Custom dashboards", starter: false, pro: true, enterprise: true },
  { feature: "API access and webhooks", starter: false, pro: true, enterprise: true },
  { feature: "Role-based permissions", starter: false, pro: true, enterprise: true },
  { feature: "SSO / SAML and SCIM", starter: false, pro: false, enterprise: true },
  { feature: "Audit logs", starter: false, pro: false, enterprise: true },
  { feature: "Support", starter: "Community", pro: "Priority email", enterprise: "Dedicated manager" },
  { feature: "Uptime SLA", starter: false, pro: "99.9%", enterprise: "99.99%" },
];

const faqs = [
  {
    title: "Can I switch plans later?",
    content:
      "Yes. Upgrade or downgrade at any time from your billing settings. Upgrades apply immediately and we prorate the difference; downgrades take effect at the end of your current billing period.",
  },
  {
    title: "How does the free trial work?",
    content:
      "Every Pro workspace starts with a 14-day trial with all features unlocked. No credit card is required to begin, and we send a reminder three days before the trial ends.",
  },
  {
    title: "What counts as a monthly event?",
    content:
      "An event is any tracked action sent from your app, such as a page view, a button click or a custom event. Events over your plan limit are never dropped; we notify you and you can upgrade when it suits you.",
  },
  {
    title: "Do you offer discounts for startups or nonprofits?",
    content:
      "We offer 50% off the first year for early-stage startups and registered nonprofits. Email the billing team with a short description of your organization and we will reply within one business day.",
  },
  {
    title: "How does yearly billing work?",
    content:
      "Yearly plans are billed once per year at a 20% discount compared with paying monthly. If you cancel, you keep access until the end of the paid year and can request a prorated refund within 30 days.",
  },
  {
    title: "Is my data secure?",
    content:
      "All data is encrypted in transit and at rest, and we run annual third-party penetration tests. Enterprise customers also get SSO, audit logs and a signed data processing agreement.",
  },
];

function renderCell(value: CellValue, label: string) {
  if (value === true) {
    return (
      <Row center>
        <Icon name="check" size="s" onBackground="brand-medium" decorative />
        <VisuallyHidden>Included in {label}</VisuallyHidden>
      </Row>
    );
  }
  if (value === false) {
    return (
      <Row center>
        <Icon name="minus" size="s" onBackground="neutral-weak" decorative />
        <VisuallyHidden>Not included in {label}</VisuallyHidden>
      </Row>
    );
  }
  return (
    <Text variant="body-default-s" align="center" as="span">
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
      <Column fillWidth horizontal="center" paddingTop="80" paddingX="24">
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
            width: 150,
            height: 80,
            opacity: 60,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />
        <Column zIndex={1} horizontal="center" gap="24" maxWidth={48}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-l" align="center">
            Pay for momentum, not for seats
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days, then pick the plan that fits your team. Every plan includes
            unlimited viewers, SOC 2 reporting and a 30-day money-back guarantee.
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
            s={{ direction: "column", horizontal: "start", vertical: "start" }}
          >
            <Column gap="8">
              <Heading as="h2" variant="display-strong-xs">
                Three plans, one clear choice
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Switch billing period at any time. Yearly saves 20%.
              </Text>
            </Column>
            <Row maxWidth={20} s={{ maxWidth: 40 }} fillWidth>
              <SegmentedControl
                value={billing}
                onChange={(value) => setBilling(value === "yearly" ? "yearly" : "monthly")}
                buttons={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly −20%" },
                ]}
              />
            </Row>
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
                        <Row vertical="end" gap="4">
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
                            / month
                          </Text>
                        </Row>
                        <VisuallyHidden>
                          {`$${tier.price[billing]} per month, billed ${billing}`}
                        </VisuallyHidden>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {billing === "yearly"
                            ? `Billed yearly at $${tier.price.yearly * 12}`
                            : "Billed monthly"}
                        </Text>
                      </Column>
                    ) : (
                      <Column gap="4">
                        <Text variant="display-strong-s">Custom</Text>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          Volume pricing and annual contracts
                        </Text>
                      </Column>
                    )}

                    <Column as="ul" flex={1} gap="12" margin="0" padding="0">
                      {tier.features.map((feature) => (
                        <Row as="li" key={feature} gap="12" vertical="start">
                          <Icon
                            name="check"
                            size="xs"
                            onBackground="brand-medium"
                            marginTop="4"
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
                      href="#plans"
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

      {/* Comparison table */}
      <Column
        id="plans"
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
              A full breakdown of what is included in each plan.
            </Text>
          </Column>
          <Column
            fillWidth
            background="surface"
            border
            radius="l"
            overflowX="auto"
            tabIndex={0}
            role="region"
            aria-label="Plan feature comparison, scrollable"
          >
            <Column minWidth={40}>
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
                    <Text key="f" variant="body-strong-s" as="span">
                      {row.feature}
                    </Text>,
                    renderCell(row.starter, "Starter"),
                    renderCell(row.pro, "Pro"),
                    renderCell(row.enterprise, "Enterprise"),
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
              Can't find what you need? Our team replies within one business day.
            </Text>
          </Column>
          <AccordionGroup items={faqs} />
        </Column>
      </Column>

      {/* Closing CTA */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column
          maxWidth="l"
          background="surface"
          border
          radius="xl"
          padding="64"
          s={{ padding: "32" }}
          center
          gap="24"
        >
          <Column maxWidth={40} center gap="24">
            <Heading as="h2" variant="display-strong-s" align="center">
              Ship your next launch on Pro
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" align="center">
              Join more than 4,000 product teams measuring what matters. Try every feature free for
              14 days.
            </Text>
          </Column>
          <Row gap="12" center wrap>
            <Button arrowIcon href="#plans">
              Start free trial
            </Button>
            <Button variant="secondary" href="#plans">
              Talk to sales
            </Button>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
```