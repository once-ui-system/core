"use client";

import {
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
  AccordionGroup,
  useInViewport,
} from "@once-ui-system/core";
import type { ReactNode } from "react";
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
    description: "For solo makers and small side projects getting their first release out.",
    price: { monthly: 19, yearly: 15 },
    features: [
      "3 active projects",
      "Up to 5 team members",
      "Core analytics dashboard",
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
      "Up to 25 team members",
      "Advanced analytics and exports",
      "API access and webhooks",
      "Priority support, 4-hour response",
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
      "Audit logs with 2-year retention",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
  },
];

type CellValue = boolean | string;

interface ComparisonRow {
  feature: string;
  starter: CellValue;
  pro: CellValue;
  enterprise: CellValue;
}

const comparisonRows: ComparisonRow[] = [
  { feature: "Active projects", starter: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Team members", starter: "5", pro: "25", enterprise: "Unlimited" },
  { feature: "Storage", starter: "10 GB", pro: "250 GB", enterprise: "2 TB+" },
  { feature: "Analytics dashboard", starter: "Core", pro: "Advanced", enterprise: "Advanced" },
  { feature: "Data exports (CSV, JSON)", starter: false, pro: true, enterprise: true },
  { feature: "API access", starter: false, pro: true, enterprise: true },
  { feature: "Webhooks and integrations", starter: false, pro: true, enterprise: true },
  { feature: "Custom domains", starter: false, pro: "5", enterprise: "Unlimited" },
  { feature: "SSO / SAML", starter: false, pro: false, enterprise: true },
  { feature: "Audit logs", starter: false, pro: "30 days", enterprise: "2 years" },
  { feature: "Support", starter: "Community", pro: "Priority, 4h", enterprise: "Dedicated manager" },
  { feature: "Uptime SLA", starter: false, pro: "99.9%", enterprise: "99.99%" },
];

const faqItems: { title: string; content: string }[] = [
  {
    title: "Can I switch plans at any time?",
    content:
      "Yes. Upgrades take effect immediately and you are charged the prorated difference for the rest of the billing period. Downgrades apply at the start of your next billing cycle, so you keep everything you paid for until then.",
  },
  {
    title: "How does the 14-day free trial work?",
    content:
      "You get full access to every Pro feature for 14 days without entering a credit card. If you do not upgrade, your workspace moves to a read-only state for 30 days before anything is archived, so you never lose your work by accident.",
  },
  {
    title: "What happens if I go over my team member limit?",
    content:
      "We will never lock you out mid-sprint. You will see a notice in the admin area and can either invite fewer people, upgrade to the next plan, or add extra seats to Pro for $6 per member each month.",
  },
  {
    title: "Do you offer discounts for startups and nonprofits?",
    content:
      "We do. Registered nonprofits and education programs receive 50% off any plan, and early-stage startups can apply for six months of Pro at half price. Contact our team with a short description of your organization.",
  },
  {
    title: "Which payment methods do you accept?",
    content:
      "All major credit and debit cards are supported on every plan. Yearly Pro and Enterprise customers can also pay by invoice with bank transfer, and we issue VAT-compliant receipts for every payment.",
  },
  {
    title: "Can I cancel and export my data?",
    content:
      "You can cancel from your billing settings in two clicks, with no call required. Before or after cancelling you can export all of your projects and analytics as CSV or JSON, and we delete remaining data within 30 days on request.",
  },
];

function renderCell(value: CellValue): ReactNode {
  if (value === true) {
    return (
      <Row center>
        <Icon name="check" size="s" onBackground="brand-medium" />
        <VisuallyHidden>Included</VisuallyHidden>
      </Row>
    );
  }
  if (value === false) {
    return (
      <Row center>
        <Icon name="minus" size="s" onBackground="neutral-weak" />
        <VisuallyHidden>Not included</VisuallyHidden>
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
            Simple pricing that scales with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start free for 14 days, no credit card needed. Pick a plan when you are ready and
            change it whenever your needs do.
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
            <Column maxWidth={20} s={{ maxWidth: 100 }} fillWidth>
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
                  s={{ padding: "24" }}
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
                      {tier.highlighted && (
                        <Tag scheme="brand" size="s" prefixIcon="sparkle" label="Most popular" />
                      )}
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
                            per member / month
                          </Text>
                        </Row>
                        <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
                          {billing === "yearly"
                            ? `Billed annually at $${tier.price.yearly * 12} per member`
                            : "Billed monthly, cancel anytime"}
                        </Text>
                      </Column>
                    ) : (
                      <Column gap="4">
                        <Text variant="display-strong-s">Custom</Text>
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                          Volume pricing with annual contracts
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
                          <Icon name="check" size="xs" onBackground="brand-medium" marginTop="2" />
                          <Text variant="body-default-s">{feature}</Text>
                        </Row>
                      ))}
                    </Column>

                    <Button
                      fillWidth
                      variant={tier.highlighted ? "primary" : "secondary"}
                      arrowIcon={tier.highlighted}
                      href={tier.price ? "#faq" : "#contact"}
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
          <Column gap="12">
            <Heading as="h2" variant="display-strong-xs">
              Every feature, side by side
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A complete breakdown of what is included in each plan.
            </Text>
          </Column>
          <Column
            fillWidth
            overflowX="auto"
            radius="l"
            border
            background="surface"
            role="region"
            aria-label="Plan comparison table, scrollable horizontally on small screens"
            tabIndex={0}
          >
            <Column minWidth={40} fillWidth>
              <Table
                fillWidth
                data={{
                  headers: [
                    { content: "Feature", key: "feature", width: "32%" },
                    { content: "Starter", key: "starter", align: "center" },
                    { content: "Pro", key: "pro", align: "center" },
                    { content: "Enterprise", key: "enterprise", align: "center" },
                  ],
                  rows: comparisonRows.map((row) => [
                    <Text key={`${row.feature}-label`} variant="label-default-s">
                      {row.feature}
                    </Text>,
                    renderCell(row.starter),
                    renderCell(row.pro),
                    renderCell(row.enterprise),
                  ]),
                }}
              />
            </Column>
          </Column>
        </Column>
      </Column>

      {/* FAQ */}
      <Column fillWidth horizontal="center" paddingX="24" id="faq">
        <Column maxWidth="m" gap="40">
          <Column gap="12" horizontal="center">
            <Heading as="h2" variant="display-strong-xs" align="center">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Cannot find what you are looking for? Our team replies within one business day.
            </Text>
          </Column>
          <AccordionGroup
            items={faqItems.map((item) => ({
              title: item.title,
              content: (
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {item.content}
                </Text>
              ),
            }))}
          />
        </Column>
      </Column>

      {/* Closing CTA */}
      <Column fillWidth horizontal="center" paddingX="24" id="contact">
        <Column
          maxWidth="l"
          background="surface"
          border="brand-alpha-medium"
          radius="xl"
          overflow="hidden"
          padding="64"
          s={{ padding: "32" }}
          center
        >
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
              y: 100,
              width: 200,
              height: 80,
              opacity: 40,
            }}
          />
          <Column zIndex={1} center gap="24" maxWidth={40}>
            <Heading as="h2" variant="display-strong-s" align="center">
              Ready to ship your next release faster?
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Join more than 4,000 teams already planning, building and measuring in one place.
            </Text>
            <Row gap="12" wrap horizontal="center">
              <Button href="#faq" arrowIcon>
                Start free trial
              </Button>
              <Button href="#contact" variant="secondary">
                Talk to sales
              </Button>
            </Row>
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
