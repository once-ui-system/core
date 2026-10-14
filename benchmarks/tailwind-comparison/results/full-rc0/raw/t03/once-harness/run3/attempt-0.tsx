"use client";

import {
  AccordionGroup,
  Background,
  BlobFx,
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
    description: "For solo builders and small side projects getting their first release out.",
    price: { monthly: 19, yearly: 15 },
    features: [
      "Up to 3 active projects",
      "5 team members",
      "Core analytics, 30-day history",
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
      "Advanced analytics, 1-year history",
      "API access and webhooks",
      "Priority email support",
    ],
    cta: "Start 14-day free trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with strict security, compliance and scale requirements.",
    price: null,
    features: [
      "Unlimited everything",
      "SSO / SAML and SCIM provisioning",
      "Audit logs and custom retention",
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

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const comparison: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { feature: "Active projects", starter: "3", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Team members", starter: "5", pro: "25", enterprise: "Unlimited" },
      { feature: "Monthly events", starter: "100K", pro: "5M", enterprise: "Custom" },
      { feature: "Data history", starter: "30 days", pro: "1 year", enterprise: "Custom" },
    ],
  },
  {
    group: "Platform",
    rows: [
      { feature: "Core analytics", starter: true, pro: true, enterprise: true },
      { feature: "Custom dashboards", starter: false, pro: true, enterprise: true },
      { feature: "API access", starter: false, pro: true, enterprise: true },
      { feature: "Webhooks", starter: false, pro: true, enterprise: true },
    ],
  },
  {
    group: "Security and support",
    rows: [
      { feature: "SSO / SAML", starter: false, pro: false, enterprise: true },
      { feature: "Audit logs", starter: false, pro: false, enterprise: true },
      { feature: "Support", starter: "Community", pro: "Priority email", enterprise: "Dedicated manager" },
      { feature: "Uptime SLA", starter: false, pro: "99.9%", enterprise: "99.99%" },
    ],
  },
];

const faqs = [
  {
    title: "Can I switch plans at any time?",
    content:
      "Yes. Upgrades take effect immediately and you only pay the prorated difference for the rest of the billing period. Downgrades apply at the start of your next cycle, so you keep everything you've already paid for.",
  },
  {
    title: "How does the 14-day free trial work?",
    content:
      "Every Pro trial includes the full feature set and requires no credit card. Three days before it ends we send a reminder, and if you do nothing your workspace moves to a read-only state rather than being deleted.",
  },
  {
    title: "What counts as a team member?",
    content:
      "Anyone with an invited seat who can edit projects or dashboards. Viewers who only open shared reports are free and unlimited on every plan.",
  },
  {
    title: "Do you offer discounts for startups or non-profits?",
    content:
      "We do. Early-stage startups under two years old get 50% off Pro for the first year, and registered non-profits and open-source maintainers get 30% off. Contact us with a few details and we'll apply it within one business day.",
  },
  {
    title: "Which payment methods do you accept?",
    content:
      "All major credit and debit cards on monthly and yearly plans. Yearly Enterprise contracts can also be paid by invoice with bank transfer on net-30 terms.",
  },
  {
    title: "What happens if I go over my monthly event limit?",
    content:
      "We never drop your data. If you pass your limit we keep collecting, notify your account owners, and give you a seven-day grace window to upgrade or trim usage before overage billing starts.",
  },
];

function renderCell(value: CellValue, label: string) {
  if (typeof value === "string") {
    return <Text variant="body-default-s">{value}</Text>;
  }
  return value ? (
    <Row vertical="center">
      <Icon name="check" size="s" onBackground="brand-medium" decorative />
      <VisuallyHidden>{`Included in ${label}`}</VisuallyHidden>
    </Row>
  ) : (
    <Row vertical="center">
      <Icon name="minus" size="s" onBackground="neutral-weak" decorative />
      <VisuallyHidden>{`Not included in ${label}`}</VisuallyHidden>
    </Row>
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

  const planLabels = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" } as const;

  const tableRows = comparison.flatMap((group) => [
    [
      <Text key={`${group.group}-label`} variant="label-strong-s" onBackground="brand-medium">
        {group.group}
      </Text>,
      "",
      "",
      "",
    ],
    ...group.rows.map((row) => [
      <Text key={row.feature} variant="body-default-s">
        {row.feature}
      </Text>,
      renderCell(row.starter, planLabels.starter),
      renderCell(row.pro, planLabels.pro),
      renderCell(row.enterprise, planLabels.enterprise),
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
        <Column zIndex={1} center gap="24" maxWidth={48}>
          <Text variant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-l" align="center">
            Simple pricing that scales with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days, no credit card required. Switch plans or cancel whenever you
            like, and pay yearly to save 20%.
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
                Choose your plan
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Every plan includes unlimited free viewers and SOC 2 reporting.
              </Text>
            </Column>
            <Row maxWidth={20} s={{ maxWidth: 48 }} fillWidth>
              <SegmentedControl
                value={billing}
                onChange={(value) => setBilling(value as Billing)}
                buttons={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly (save 20%)" },
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
                            variant="display-strong-l"
                            value={tier.price[billing]}
                            effect="wheel"
                            speed={400}
                          />
                          <Text
                            variant="label-default-s"
                            onBackground="neutral-weak"
                            paddingBottom="8"
                            paddingLeft="4"
                          >
                            per user / month
                          </Text>
                        </Row>
                        <VisuallyHidden>
                          {`${tier.name} costs ${tier.price[billing]} dollars per user per month, billed ${billing}.`}
                        </VisuallyHidden>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {billing === "yearly"
                            ? `Billed yearly at $${tier.price.yearly * 12} per user`
                            : "Billed monthly, cancel anytime"}
                        </Text>
                      </Column>
                    ) : (
                      <Column gap="4">
                        <Row vertical="end" gap="4">
                          <Text variant="display-strong-l">Custom</Text>
                        </Row>
                        <Text variant="label-default-s" onBackground="neutral-weak">
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
                      aria-label={`${tier.name} features`}
                    >
                      {tier.features.map((feature) => (
                        <Row as="li" key={feature} gap="12" vertical="start">
                          <Icon name="check" size="xs" onBackground="brand-medium" marginTop="2" />
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
              </RevealFx>
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
        <Column maxWidth="l" gap="40">
          <Column gap="8">
            <Heading as="h2" variant="display-strong-xs">
              Every feature, side by side
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A full breakdown of what each plan includes.
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
            <Column minWidth={40} fillWidth>
              <Table
                fillWidth
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
          <Column gap="8" horizontal="center">
            <Heading as="h2" variant="display-strong-xs" align="center">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Can't find what you're looking for? Our team replies within one business day.
            </Text>
          </Column>
          <AccordionGroup fillWidth items={faqs} autoCollapse />
        </Column>
      </Column>

      {/* Closing CTA */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="l" radius="xl" border overflow="hidden" padding="64" s={{ padding: "32" }} center>
          <BlobFx position="absolute" top="0" left="0" fill opacity={60} seed={2} />
          <Column zIndex={1} center gap="24" maxWidth={40}>
            <Heading as="h2" variant="display-strong-s" align="center">
              Ship your next launch on Pro
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Join more than 4,000 product teams who track, learn and iterate faster. Try every
              Pro feature free for 14 days.
            </Text>
            <Row gap="12" wrap horizontal="center">
              <Button href="#" arrowIcon>
                Start free trial
              </Button>
              <Button href="#" variant="secondary">
                Talk to sales
              </Button>
            </Row>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
