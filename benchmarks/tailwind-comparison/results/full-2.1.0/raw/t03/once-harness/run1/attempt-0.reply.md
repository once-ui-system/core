Now I'll write the page.

```tsx
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
      "Core analytics dashboard",
      "Community support",
      "7-day audit history",
    ],
    cta: "Start with Starter",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need speed, depth and room to automate.",
    price: { monthly: 49, yearly: 39 },
    features: [
      "Unlimited projects",
      "25 team members",
      "Advanced analytics and exports",
      "API and webhook access",
      "Priority support, 4-hour response",
      "90-day audit history",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with strict security and scale requirements.",
    price: null,
    features: [
      "Unlimited everything",
      "SSO / SAML and SCIM provisioning",
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
  values: [CellValue, CellValue, CellValue];
}

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const comparison: ComparisonGroup[] = [
  {
    group: "Workspace",
    rows: [
      { feature: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Team members", values: ["5", "25", "Unlimited"] },
      { feature: "Storage", values: ["10 GB", "250 GB", "Custom"] },
      { feature: "Custom domains", values: [false, true, true] },
    ],
  },
  {
    group: "Analytics",
    rows: [
      { feature: "Core dashboard", values: [true, true, true] },
      { feature: "Advanced reports and CSV export", values: [false, true, true] },
      { feature: "Audit history", values: ["7 days", "90 days", "Custom"] },
    ],
  },
  {
    group: "Developer tools",
    rows: [
      { feature: "REST API", values: [false, true, true] },
      { feature: "Webhooks", values: [false, true, true] },
      { feature: "Sandbox environments", values: [false, "3", "Unlimited"] },
    ],
  },
  {
    group: "Security and support",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SSO / SAML", values: [false, false, true] },
      { feature: "Uptime SLA", values: [false, false, "99.99%"] },
      { feature: "Support", values: ["Community", "Priority, 4h", "Dedicated manager"] },
    ],
  },
];

const faqs: { title: string; content: string }[] = [
  {
    title: "Can I switch plans at any time?",
    content:
      "Yes. Upgrades take effect immediately and you are only charged the prorated difference for the rest of the billing period. Downgrades apply at the start of your next cycle, so you keep everything you have paid for.",
  },
  {
    title: "How does the 14-day free trial work?",
    content:
      "The Pro trial unlocks every Pro feature without a credit card. If you do nothing, your workspace moves to Starter limits when the trial ends. Nothing is deleted, but projects above the limit become read-only.",
  },
  {
    title: "What counts as a team member?",
    content:
      "Anyone who can edit projects counts as a member. Viewers and stakeholders you invite with read-only access are always free, on every plan.",
  },
  {
    title: "Do you offer discounts for startups or nonprofits?",
    content:
      "We offer 50% off Pro for the first year to verified nonprofits, open-source maintainers and startups under two years old. Contact our team with a link to your organization and we will set it up within one business day.",
  },
  {
    title: "Which payment methods do you accept?",
    content:
      "All major credit and debit cards are accepted on every plan. Enterprise customers can also pay by invoice with net-30 terms, or by bank transfer in USD, EUR and GBP.",
  },
  {
    title: "Is my data secure?",
    content:
      "Data is encrypted in transit and at rest, backed up every hour and stored in SOC 2 Type II audited facilities. Enterprise plans add SSO, custom retention policies and a signed data processing agreement.",
  },
];

function renderCell(value: CellValue, tierName: string) {
  if (value === true) {
    return (
      <Row vertical="center" gap="8">
        <Icon name="check" size="s" onBackground="brand-medium" />
        <VisuallyHidden>Included in {tierName}</VisuallyHidden>
      </Row>
    );
  }
  if (value === false) {
    return (
      <Row vertical="center" gap="8">
        <Icon name="minus" size="s" onBackground="neutral-weak" />
        <VisuallyHidden>Not included in {tierName}</VisuallyHidden>
      </Row>
    );
  }
  return <Text variant="body-default-s">{value}</Text>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const tableRows = comparison.flatMap((section) => [
    [
      <Text
        key={`${section.group}-label`}
        variant="label-strong-s"
        onBackground="brand-medium"
      >
        {section.group}
      </Text>,
      "",
      "",
      "",
    ],
    ...section.rows.map((row) => [
      <Text key={row.feature} variant="body-default-s">
        {row.feature}
      </Text>,
      renderCell(row.values[0], "Starter"),
      renderCell(row.values[1], "Pro"),
      renderCell(row.values[2], "Enterprise"),
    ]),
  ]);

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
            Simple pricing that scales with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days. No credit card, no setup fees, and you can change or
            cancel your plan whenever you like.
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
              Choose the plan that fits
            </Heading>
            <Column fit s={{ fillWidth: true }}>
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

          <Grid columns="3" gap="24" m={{ columns: 1 }} s={{ columns: 1 }}>
            {tiers.map((tier) => (
              <Column
                key={tier.id}
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
                        <Text variant="display-strong-l">{tier.price[billing]}</Text>
                        <Text
                          variant="label-default-s"
                          onBackground="neutral-weak"
                          paddingBottom="8"
                          paddingLeft="4"
                        >
                          per member / month
                        </Text>
                      </Row>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {billing === "yearly"
                          ? `Billed annually at $${tier.price.yearly * 12} per member`
                          : "Billed monthly, cancel anytime"}
                      </Text>
                    </Column>
                  ) : (
                    <Column gap="4">
                      <Text variant="display-strong-l">Custom</Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        Volume pricing and annual contracts
                      </Text>
                    </Column>
                  )}
                  <Column as="ul" flex={1} gap="12" margin="0" padding="0">
                    {tier.features.map((feature) => (
                      <Row as="li" key={feature} gap="12" vertical="center">
                        <Icon name="check" size="xs" onBackground="brand-medium" />
                        <Text variant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Button
                    fillWidth
                    href="#"
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

      {/* Comparison */}
      <Column
        fillWidth
        horizontal="center"
        background="neutral-alpha-weak"
        paddingY="80"
        paddingX="24"
      >
        <Column maxWidth="l" gap="40">
          <Column gap="12">
            <Heading as="h2" variant="display-strong-xs">
              Every feature, side by side
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A full breakdown of what is included in each plan.
            </Text>
          </Column>
          <Column
            fillWidth
            overflowX="auto"
            background="surface"
            border
            radius="l"
            role="region"
            aria-label="Plan comparison table, scrolls horizontally on small screens"
            tabIndex={0}
          >
            <Column minWidth={40}>
              <Table
                fillWidth
                hoverable={false}
                data={{
                  headers: [
                    { content: "Feature", key: "feature" },
                    { content: "Starter", key: "starter" },
                    { content: "Pro", key: "pro" },
                    { content: "Enterprise", key: "enterprise" },
                  ],
                  rows: tableRows,
                }}
              />
            </Column>
          </Column>
        </Column>
      </Column>

      {/* FAQ */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="m" gap="40">
          <Column gap="12">
            <Heading as="h2" variant="display-strong-xs">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Can&apos;t find what you need? Our team replies to every message within one
              business day.
            </Text>
          </Column>
          <AccordionGroup
            fillWidth
            items={faqs.map((faq) => ({
              title: faq.title,
              content: (
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {faq.content}
                </Text>
              ),
            }))}
          />
        </Column>
      </Column>

      {/* Closing CTA */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column
          maxWidth="l"
          fillWidth
          background="surface"
          radius="xl"
          border="brand-alpha-medium"
          padding="64"
          s={{ padding: "32" }}
          center
          gap="24"
        >
          <Heading as="h2" variant="display-strong-s" align="center">
            Ready to ship faster?
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Join more than 4,000 teams already building on our platform.
          </Text>
          <Row gap="12" horizontal="center" wrap>
            <Button href="#" arrowIcon>
              Start 14-day free trial
            </Button>
            <Button href="#" variant="secondary">
              Talk to sales
            </Button>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
```