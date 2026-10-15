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
  AccordionGroup,
  VisuallyHidden,
} from "@once-ui-system/core";
import { useState } from "react";

type Billing = "monthly" | "yearly";

interface Tier {
  id: string;
  name: string;
  description: string;
  price?: Record<Billing, number>;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo builders shipping their first product.",
    price: { monthly: 19, yearly: 15 },
    features: [
      "3 active projects",
      "5 team members",
      "Core analytics with 30-day history",
      "Community support",
    ],
    cta: "Start with Starter",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need speed, depth and automation.",
    price: { monthly: 49, yearly: 39 },
    features: [
      "Unlimited projects",
      "25 team members",
      "Advanced analytics with 1-year history",
      "API access and webhooks",
      "Priority support, 4-hour response",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with security, compliance and scale needs.",
    features: [
      "Unlimited everything",
      "SSO / SAML and SCIM provisioning",
      "Audit logs and custom data retention",
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
    group: "Usage",
    rows: [
      { feature: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Team members", values: ["5", "25", "Unlimited"] },
      { feature: "Storage", values: ["10 GB", "250 GB", "2 TB"] },
      { feature: "Analytics history", values: ["30 days", "1 year", "Unlimited"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared workspaces", values: [true, true, true] },
      { feature: "Roles and permissions", values: [false, true, true] },
      { feature: "Review workflows", values: [false, true, true] },
    ],
  },
  {
    group: "Developer tools",
    rows: [
      { feature: "REST API", values: [false, true, true] },
      { feature: "Webhooks", values: [false, true, true] },
      { feature: "Custom integrations", values: [false, false, true] },
    ],
  },
  {
    group: "Security and support",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SSO / SAML", values: [false, false, true] },
      { feature: "Audit logs", values: [false, false, true] },
      { feature: "Support response time", values: ["2 days", "4 hours", "1 hour"] },
    ],
  },
];

const faqItems = [
  {
    title: "Can I switch plans later?",
    content:
      "Yes. Upgrades apply immediately and you only pay the prorated difference for the rest of the billing period. Downgrades take effect at the start of your next cycle, so you keep everything you've paid for.",
  },
  {
    title: "How does the free trial work?",
    content:
      "Every Pro trial lasts 14 days with full access to all features. We don't ask for a credit card up front, and your workspace is kept for 30 days after the trial ends in case you decide to come back.",
  },
  {
    title: "What counts as a team member?",
    content:
      "Anyone who can edit projects counts as a member. Viewers and external reviewers are free on every plan, so you can share work with clients and stakeholders without paying for extra seats.",
  },
  {
    title: "Do you offer discounts for startups or nonprofits?",
    content:
      "We offer 50% off Pro for registered nonprofits and for startups under two years old with less than $1M in funding. Contact our team with a few details and we'll set it up within one business day.",
  },
  {
    title: "Which payment methods do you accept?",
    content:
      "We accept all major credit and debit cards. Yearly Pro and Enterprise customers can also pay by invoice with bank transfer, and every payment comes with a VAT-compliant receipt.",
  },
  {
    title: "What happens to my data if I cancel?",
    content:
      "You can export all projects and analytics as CSV or JSON at any time. After cancellation we keep your data for 30 days, then permanently delete it from our systems and backups.",
  },
];

const tableCellStyle: React.CSSProperties = {
  padding: "var(--static-space-16) var(--static-space-16)",
  textAlign: "center",
  verticalAlign: "middle",
};

function CellContent({ value }: { value: CellValue }) {
  if (typeof value === "string") {
    return <Text variant="body-default-s">{value}</Text>;
  }
  return value ? (
    <>
      <Icon name="check" size="s" onBackground="brand-medium" />
      <VisuallyHidden>Included</VisuallyHidden>
    </>
  ) : (
    <>
      <span aria-hidden="true">
        <Text variant="body-default-s" onBackground="neutral-weak">
          —
        </Text>
      </span>
      <VisuallyHidden>Not included</VisuallyHidden>
    </>
  );
}

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
            Simple plans that grow with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days, no credit card needed. Upgrade, downgrade or cancel whenever
            your needs change.
          </Text>
        </Column>
      </Column>

      {/* Tiers */}
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
              Choose your plan
            </Heading>
            <Column fitWidth s={{ fillWidth: true }}>
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

          <VisuallyHidden>
            <span role="status" aria-live="polite">
              Showing {billing} pricing
            </span>
          </VisuallyHidden>

          <Grid columns="3" gap="24" s={{ columns: 1 }} m={{ columns: 1 }}>
            {tiers.map((tier) => (
              <Column
                key={tier.id}
                as="section"
                aria-labelledby={`tier-${tier.id}`}
                fill
                background="surface"
                border={tier.highlighted ? "brand-alpha-medium" : true}
                borderWidth={tier.highlighted ? 2 : 1}
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
                  <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
                    <Heading as="h3" id={`tier-${tier.id}`} variant="heading-strong-l">
                      {tier.name}
                    </Heading>
                    {tier.highlighted && <Tag scheme="brand" size="s" label="Most popular" />}
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {tier.description}
                  </Text>
                  {tier.price ? (
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
                        per user / month
                      </Text>
                      <VisuallyHidden>
                        {`${tier.price[billing]} dollars per user per month, billed ${billing}`}
                      </VisuallyHidden>
                    </Row>
                  ) : (
                    <Row vertical="end" gap="8">
                      <Text variant="display-strong-s">Custom</Text>
                      <Text
                        variant="label-default-s"
                        onBackground="neutral-weak"
                        paddingBottom="4"
                      >
                        tailored to your org
                      </Text>
                    </Row>
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
                        <Column paddingTop="2">
                          <Icon name="check" size="xs" onBackground="brand-medium" />
                        </Column>
                        <Text variant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Button
                    fillWidth
                    href="#"
                    variant={tier.highlighted ? "primary" : "secondary"}
                    arrowIcon={tier.highlighted}
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
      <Column
        fillWidth
        horizontal="center"
        background="neutral-alpha-weak"
        paddingY="80"
        paddingX="24"
      >
        <Column fillWidth maxWidth="l" gap="40">
          <Column gap="12">
            <Heading as="h2" variant="display-strong-xs">
              Compare every feature
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A detailed look at what's included in each plan.
            </Text>
          </Column>

          <Column
            fillWidth
            background="surface"
            border
            radius="l"
            overflowX="auto"
            role="region"
            aria-label="Feature comparison table, scrollable"
            tabIndex={0}
          >
            <table
              style={{
                width: "100%",
                minWidth: "40rem",
                borderCollapse: "collapse",
                color: "var(--neutral-on-background-strong)",
              }}
            >
              <caption>
                <VisuallyHidden>Feature comparison across Starter, Pro and Enterprise plans</VisuallyHidden>
              </caption>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--neutral-alpha-medium)" }}>
                  <th
                    scope="col"
                    style={{ ...tableCellStyle, textAlign: "left", width: "40%" }}
                  >
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      Feature
                    </Text>
                  </th>
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      scope="col"
                      style={{
                        ...tableCellStyle,
                        background: tier.highlighted ? "var(--brand-alpha-weak)" : undefined,
                      }}
                    >
                      <Text variant="heading-strong-s">{tier.name}</Text>
                    </th>
                  ))}
                </tr>
              </thead>
              {comparison.map((group) => (
                <tbody key={group.group}>
                  <tr style={{ background: "var(--neutral-alpha-weak)" }}>
                    <th
                      scope="colgroup"
                      colSpan={4}
                      style={{ ...tableCellStyle, textAlign: "left", paddingBlock: "var(--static-space-8)" }}
                    >
                      <Text variant="label-strong-s" onBackground="neutral-weak">
                        {group.group}
                      </Text>
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr
                      key={row.feature}
                      style={{ borderBottom: "1px solid var(--neutral-alpha-weak)" }}
                    >
                      <th scope="row" style={{ ...tableCellStyle, textAlign: "left" }}>
                        <Text variant="body-default-s">{row.feature}</Text>
                      </th>
                      {row.values.map((value, index) => (
                        <td
                          key={tiers[index].id}
                          style={{
                            ...tableCellStyle,
                            background: tiers[index].highlighted
                              ? "var(--brand-alpha-weak)"
                              : undefined,
                          }}
                        >
                          <Row center>
                            <CellContent value={value} />
                          </Row>
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
        <Column fillWidth maxWidth="m" gap="40">
          <Column gap="12" horizontal="center">
            <Heading as="h2" variant="display-strong-xs" align="center">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Can't find what you're looking for? Our team replies within one business day.
            </Text>
          </Column>
          <AccordionGroup fillWidth items={faqItems} />
          <Row center gap="16" wrap>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Still have questions?
            </Text>
            <Button href="#" variant="secondary" size="s" suffixIcon="mail">
              Contact support
            </Button>
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
