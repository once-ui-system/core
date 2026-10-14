"use client";

import {
  Background,
  Button,
  Column,
  CountFx,
  Grid,
  Heading,
  Icon,
  AccordionGroup,
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
      "10,000 tracked events / month",
      "30-day data retention",
      "Community support",
    ],
    cta: "Start with Starter",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need faster feedback loops and deeper insight.",
    price: { monthly: 49, yearly: 39 },
    features: [
      "Unlimited projects",
      "25 team members",
      "1M tracked events / month",
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
    description: "For organizations with strict security, compliance and scale requirements.",
    price: null,
    features: [
      "Unlimited everything",
      "SSO / SAML and SCIM",
      "Unlimited data retention",
      "Audit logs and custom roles",
      "99.99% uptime SLA",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
  },
];

type Cell = string | boolean;

interface ComparisonRow {
  feature: string;
  starter: Cell;
  pro: Cell;
  enterprise: Cell;
}

const comparison: ComparisonRow[] = [
  { feature: "Active projects", starter: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Team members", starter: "5", pro: "25", enterprise: "Unlimited" },
  { feature: "Tracked events / month", starter: "10K", pro: "1M", enterprise: "Custom" },
  { feature: "Data retention", starter: "30 days", pro: "12 months", enterprise: "Unlimited" },
  { feature: "Core analytics dashboards", starter: true, pro: true, enterprise: true },
  { feature: "Custom reports and exports", starter: false, pro: true, enterprise: true },
  { feature: "API access and webhooks", starter: false, pro: true, enterprise: true },
  { feature: "Slack and Linear integrations", starter: false, pro: true, enterprise: true },
  { feature: "SSO / SAML", starter: false, pro: false, enterprise: true },
  { feature: "Audit logs and custom roles", starter: false, pro: false, enterprise: true },
  { feature: "Uptime SLA", starter: "—", pro: "99.9%", enterprise: "99.99%" },
  { feature: "Support", starter: "Community", pro: "Priority email", enterprise: "Dedicated manager" },
];

const faqs = [
  {
    title: "Can I change plans later?",
    content:
      "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and we prorate the difference; downgrades apply at the start of your next billing cycle.",
  },
  {
    title: "How does the 14-day free trial work?",
    content:
      "The Pro trial gives you full access to every Pro feature with no credit card required. At the end of the trial you can pick a plan, or your workspace moves to a read-only state so nothing is lost.",
  },
  {
    title: "What counts as a tracked event?",
    content:
      "An event is any single action sent to Meridian: a page view, a button click or a custom event from the SDK. Duplicate events sent within one second from the same session are merged and only counted once.",
  },
  {
    title: "Do you offer discounts for startups and nonprofits?",
    content:
      "We do. Verified nonprofits receive 50% off any plan, and early-stage startups can apply for six months of Pro at no cost through our startup program. Contact us and we will get you set up within a day.",
  },
  {
    title: "How does yearly billing work?",
    content:
      "Yearly plans are billed once per year and save you 20% compared to paying monthly. If you cancel, you keep access until the end of the period you already paid for.",
  },
  {
    title: "Is my data secure?",
    content:
      "All data is encrypted in transit and at rest, and we run on SOC 2 Type II audited infrastructure. Enterprise customers can additionally choose EU or US data residency and bring their own encryption keys.",
  },
];

function renderCell(value: Cell, planName: string) {
  if (value === true) {
    return (
      <Row center>
        <Icon name="check" size="s" onBackground="brand-medium" />
        <VisuallyHidden>Included in {planName}</VisuallyHidden>
      </Row>
    );
  }
  if (value === false) {
    return (
      <Row center>
        <Icon name="minus" size="s" onBackground="neutral-weak" />
        <VisuallyHidden>Not included in {planName}</VisuallyHidden>
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
            Start free for 14 days. No credit card, no sales call. Switch plans or cancel whenever
            your needs change.
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
              Pick the plan that fits today
            </Heading>
            <Row fitWidth s={{ fillWidth: true }}>
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
                            / month
                          </Text>
                        </Row>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          {billing === "yearly"
                            ? `Billed annually at $${tier.price.yearly * 12}`
                            : "Billed monthly, cancel anytime"}
                        </Text>
                      </Column>
                    ) : (
                      <Column gap="4">
                        <Text variant="display-strong-s">Custom</Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          Tailored to your volume and requirements
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
                      variant={tier.highlighted ? "primary" : "secondary"}
                      arrowIcon={tier.highlighted}
                      href="#"
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
          <Column gap="12">
            <Heading as="h2" variant="display-strong-xs">
              Every feature, side by side
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A full breakdown of what is included in each plan.
            </Text>
          </Column>
          <Column fillWidth overflowX="auto" background="surface" border radius="l">
            <Table
              fillWidth
              minWidth={40}
              data={{
                headers: [
                  { content: "Feature", key: "feature" },
                  { content: "Starter", key: "starter", align: "center" },
                  { content: "Pro", key: "pro", align: "center" },
                  { content: "Enterprise", key: "enterprise", align: "center" },
                ],
                rows: comparison.map((row) => [
                  <Text key="feature" variant="body-default-s">
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

      {/* FAQ */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="m" gap="40">
          <Column gap="12" horizontal="center">
            <Heading as="h2" variant="display-strong-xs" align="center">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Cannot find what you are looking for? Email us at billing@meridian.example and a
              human will reply within one business day.
            </Text>
          </Column>
          <AccordionGroup
            fillWidth
            autoCollapse
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
    </Column>
  );
}
