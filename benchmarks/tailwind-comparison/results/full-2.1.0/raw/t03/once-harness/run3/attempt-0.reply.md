I have what I need. The Once UI `Table` doesn't give me per-column highlighting or visually hidden "included/not included" text, so I'll build the comparison table with a native semantic `<table>`, styled with Once UI tokens through CSS variables. The FAQ will use `AccordionGroup`.

```tsx
"use client";

import {
  Background,
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  Row,
  SegmentedControl,
  Tag,
  Text,
  VisuallyHidden,
  AccordionGroup,
} from "@once-ui-system/core";
import { useState } from "react";

type Billing = "monthly" | "yearly";

interface Tier {
  id: "starter" | "growth" | "scale";
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
    description: "For solo makers and small side projects getting their first users.",
    price: { monthly: 12, yearly: 10 },
    features: [
      "3 active projects",
      "2 team members",
      "10,000 events per month",
      "7-day data retention",
      "Community support",
    ],
    cta: "Start with Starter",
  },
  {
    id: "growth",
    name: "Growth",
    description: "For product teams that need deeper insight and faster collaboration.",
    price: { monthly: 39, yearly: 31 },
    features: [
      "Unlimited projects",
      "15 team members",
      "1M events per month",
      "12-month data retention",
      "Custom dashboards and alerts",
      "Priority email support",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    description: "For larger organizations with security, compliance and volume needs.",
    price: null,
    features: [
      "Unlimited team members",
      "Unlimited events",
      "Unlimited data retention",
      "SSO and SCIM provisioning",
      "99.99% uptime SLA",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
  },
];

type CellValue = boolean | string;

interface ComparisonRow {
  feature: string;
  values: [CellValue, CellValue, CellValue];
}

interface ComparisonGroup {
  title: string;
  rows: ComparisonRow[];
}

const comparison: ComparisonGroup[] = [
  {
    title: "Usage",
    rows: [
      { feature: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Team members", values: ["2", "15", "Unlimited"] },
      { feature: "Events per month", values: ["10,000", "1M", "Unlimited"] },
      { feature: "Data retention", values: ["7 days", "12 months", "Unlimited"] },
    ],
  },
  {
    title: "Analytics",
    rows: [
      { feature: "Core reports", values: [true, true, true] },
      { feature: "Custom dashboards", values: [false, true, true] },
      { feature: "Funnel and cohort analysis", values: [false, true, true] },
      { feature: "Scheduled exports", values: [false, true, true] },
    ],
  },
  {
    title: "Security and compliance",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "Audit log", values: [false, true, true] },
      { feature: "SSO and SCIM", values: [false, false, true] },
      { feature: "Data residency options", values: [false, false, true] },
    ],
  },
  {
    title: "Support",
    rows: [
      { feature: "Community forum", values: [true, true, true] },
      { feature: "Priority email support", values: [false, true, true] },
      { feature: "Uptime SLA", values: [false, false, "99.99%"] },
      { feature: "Dedicated success manager", values: [false, false, true] },
    ],
  },
];

const faqs = [
  {
    title: "Can I switch plans later?",
    content:
      "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades apply immediately and we prorate the difference. Downgrades take effect at the start of your next billing cycle.",
  },
  {
    title: "How does the 14-day free trial work?",
    content:
      "The Growth trial gives you full access with no credit card required. If you don't add a payment method by day 14, your workspace moves to a read-only state for 30 days so you can export your data or pick a plan.",
  },
  {
    title: "What counts as an event?",
    content:
      "An event is any single action you send to Beacon, such as a page view, a button click or a custom event from our SDK. Events from internal test environments are free and never count toward your monthly limit.",
  },
  {
    title: "Do you offer discounts for startups or nonprofits?",
    content:
      "We do. Early-stage startups with under $1M in funding receive 50% off Growth for the first year, and registered nonprofits and open-source projects get 30% off any plan. Contact us with a few details and we'll set it up.",
  },
  {
    title: "What happens if I go over my event limit?",
    content:
      "We never cut off data collection. If you exceed your limit we'll email you, and you can either upgrade or pay $2 per additional 10,000 events for that month. You are always in control of overage spend.",
  },
  {
    title: "Which payment methods do you accept?",
    content:
      "We accept all major credit and debit cards. Scale customers can also pay by invoice with bank transfer on annual terms.",
  },
];

function CellContent({ value, tierName }: { value: CellValue; tierName: string }) {
  if (typeof value === "string") {
    return (
      <Text variant="label-default-s">
        {value}
        <VisuallyHidden> in {tierName}</VisuallyHidden>
      </Text>
    );
  }
  if (value) {
    return (
      <Row center>
        <Icon name="check" size="s" onBackground="brand-medium" />
        <VisuallyHidden>Included in {tierName}</VisuallyHidden>
      </Row>
    );
  }
  return (
    <Row center>
      <Icon name="minus" size="s" onBackground="neutral-weak" />
      <VisuallyHidden>Not included in {tierName}</VisuallyHidden>
    </Row>
  );
}

const cellBase: React.CSSProperties = {
  padding: "var(--static-space-16) var(--static-space-16)",
  textAlign: "center",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
  verticalAlign: "middle",
};

const featureCell: React.CSSProperties = {
  ...cellBase,
  textAlign: "left",
  fontWeight: "normal",
};

const highlightCell: React.CSSProperties = {
  background: "var(--brand-alpha-weak)",
};

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

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
        <Column zIndex={1} center gap="24" maxWidth={48}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-l" align="center">
            Simple pricing that grows with your product
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days. No credit card, no sales call, and no surprise bills when your
            traffic takes off.
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
            <Heading as="h2" variant="display-strong-xs">
              Choose your plan
            </Heading>
            <Column fitWidth s={{ fillWidth: true }} gap="8">
              <SegmentedControl
                fillWidth={false}
                value={billing}
                onChange={(value) => setBilling(value as Billing)}
                buttons={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly (save 20%)" },
                ]}
              />
            </Column>
          </Row>

          <Grid as="ul" columns="3" gap="24" m={{ columns: 1 }} s={{ columns: 1 }} margin="0" padding="0" style={{ listStyle: "none" }}>
            {tiers.map((tier) => (
              <Column
                as="li"
                key={tier.id}
                fill
                background="surface"
                border={tier.highlighted ? "brand-alpha-medium" : true}
                radius="l"
                padding="32"
                overflow="hidden"
                shadow={tier.highlighted ? "l" : undefined}
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
                    <Heading as="h3" variant="heading-strong-l">
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
                        <Text variant="display-strong-s" aria-hidden="true">
                          $
                        </Text>
                        <CountFx
                          variant="display-strong-s"
                          value={tier.price[billing]}
                          effect="wheel"
                          speed={400}
                          aria-hidden="true"
                        />
                        <Text
                          variant="label-default-s"
                          onBackground="neutral-weak"
                          paddingBottom="4"
                          paddingLeft="4"
                        >
                          per month
                        </Text>
                      </Row>
                      <VisuallyHidden>
                        {`${tier.price[billing]} US dollars per month, billed ${billing === "yearly" ? "yearly" : "monthly"}`}
                      </VisuallyHidden>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {billing === "yearly"
                          ? `Billed yearly at $${tier.price.yearly * 12}`
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

                  <Column as="ul" flex={1} gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                    {tier.features.map((feature) => (
                      <Row as="li" key={feature} gap="12" vertical="start">
                        <Column paddingTop="2">
                          <Icon name="check" size="xs" onBackground="brand-medium" />
                        </Column>
                        <Text variant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>

                  <Button
                    fillWidth
                    variant={tier.highlighted ? "primary" : "secondary"}
                    arrowIcon={tier.highlighted}
                    href="#"
                    aria-label={`${tier.cta}: ${tier.name} plan`}
                  >
                    {tier.cta}
                  </Button>
                </Column>
              </Column>
            ))}
          </Grid>
        </Column>
      </Column>

      {/* Comparison table */}
      <Column fillWidth horizontal="center" background="neutral-alpha-weak" paddingY="80" paddingX="24">
        <Column maxWidth="l" gap="40">
          <Column gap="12">
            <Heading as="h2" variant="display-strong-xs">
              Compare every feature
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A full breakdown of what is included in each plan.
            </Text>
          </Column>

          <Column
            background="surface"
            border
            radius="l"
            overflowX="auto"
            fillWidth
          >
            <table
              style={{
                width: "100%",
                minWidth: 640,
                borderCollapse: "collapse",
                color: "var(--neutral-on-background-strong)",
              }}
            >
              <caption>
                <VisuallyHidden>
                  Feature comparison of the Starter, Growth and Scale plans
                </VisuallyHidden>
              </caption>
              <thead>
                <tr>
                  <th scope="col" style={{ ...featureCell, padding: "var(--static-space-24) var(--static-space-16)" }}>
                    <VisuallyHidden>Feature</VisuallyHidden>
                  </th>
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      scope="col"
                      style={{
                        ...cellBase,
                        padding: "var(--static-space-24) var(--static-space-16)",
                        ...(tier.highlighted ? highlightCell : {}),
                      }}
                    >
                      <Column center gap="8">
                        <Text variant="heading-strong-m">{tier.name}</Text>
                        {tier.highlighted && <Tag scheme="brand" size="s" label="Most popular" />}
                      </Column>
                    </th>
                  ))}
                </tr>
              </thead>
              {comparison.map((group) => (
                <tbody key={group.title}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={4}
                      style={{
                        ...featureCell,
                        background: "var(--neutral-alpha-weak)",
                        padding: "var(--static-space-12) var(--static-space-16)",
                      }}
                    >
                      <Text variant="label-strong-s" onBackground="neutral-weak">
                        {group.title}
                      </Text>
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.feature}>
                      <th scope="row" style={featureCell}>
                        <Text variant="body-default-s">{row.feature}</Text>
                      </th>
                      {row.values.map((value, index) => (
                        <td
                          key={tiers[index].id}
                          style={{
                            ...cellBase,
                            ...(tiers[index].highlighted ? highlightCell : {}),
                          }}
                        >
                          <CellContent value={value} tierName={tiers[index].name} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </Column>
        </Column>
      </Column>

      {/* FAQ */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Grid
          maxWidth="l"
          columns="2"
          gap="64"
          m={{ columns: 1, gap: "40" }}
          s={{ columns: 1, gap: "40" }}
        >
          <Column gap="16">
            <Heading as="h2" variant="display-strong-xs">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Can't find what you're looking for? Our team replies to every message within one
              business day.
            </Text>
            <Row>
              <Button variant="secondary" href="#" prefixIcon="mail">
                Contact support
              </Button>
            </Row>
          </Column>
          <AccordionGroup items={faqs} />
        </Grid>
      </Column>
    </Column>
  );
}
```