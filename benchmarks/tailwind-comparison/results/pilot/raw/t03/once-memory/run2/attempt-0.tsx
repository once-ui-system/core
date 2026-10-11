"use client";

import { useState } from "react";
import { Badge, Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";

type Tier = {
  id: string;
  name: string;
  price: string;
  blurb: string;
  cta: string;
  highlighted: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    blurb: "For side projects and personal sites getting off the ground.",
    cta: "Start for free",
    highlighted: false,
    features: ["1 project", "5,000 monthly visitors", "Community support", "Basic analytics"],
  },
  {
    id: "team",
    name: "Team",
    price: "$29",
    blurb: "For growing teams that ship every week and need to collaborate.",
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250,000 monthly visitors",
      "Priority email support",
      "Advanced analytics",
      "Role-based access",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: "$99",
    blurb: "For organizations with compliance, security and uptime needs.",
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Unlimited projects",
      "Unlimited visitors",
      "24/7 phone and chat support",
      "Single sign-on (SSO)",
      "99.99% uptime SLA",
    ],
  },
];

type Cell = boolean | string;
type Row3 = { feature: string; values: [Cell, Cell, Cell] };

const comparison: Row3[] = [
  { feature: "Projects", values: ["1", "Unlimited", "Unlimited"] },
  { feature: "Monthly visitors", values: ["5,000", "250,000", "Unlimited"] },
  { feature: "Team members", values: ["1", "10", "Unlimited"] },
  { feature: "Custom domains", values: [false, true, true] },
  { feature: "Advanced analytics", values: [false, true, true] },
  { feature: "Role-based access", values: [false, true, true] },
  { feature: "Single sign-on (SSO)", values: [false, false, true] },
  { feature: "Audit logs", values: [false, false, true] },
  { feature: "Support", values: ["Community", "Priority email", "24/7 phone and chat"] },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and we prorate the difference; downgrades apply at the end of your billing cycle.",
  },
  {
    q: "How does the 14-day trial work?",
    a: "The Team trial gives you every feature with no credit card required. At the end of the trial your workspace moves to Starter unless you choose a paid plan.",
  },
  {
    q: "What happens if I go over my visitor limit?",
    a: "We never take your site offline. We will email you when you reach 80% and 100% of your limit, and you can upgrade or let traffic overage be billed at $2 per 10,000 visitors.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "Yes. Verified nonprofits, open source maintainers and students get 50% off the Team plan. Contact support with proof of status and we will apply it within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major credit and debit cards. Scale customers can also pay by invoice with net-30 terms and bank transfer.",
  },
];

function CheckIcon({ label }: { label: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      role="img"
      aria-label={label}
      style={{ color: "var(--brand-on-background-strong)", verticalAlign: "middle" }}
    >
      <path
        d="M4 10.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SmallCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, color: "var(--brand-on-background-strong)" }}
    >
      <path
        d="M4 10.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderCell(value: Cell) {
  if (value === true) return <CheckIcon label="Included" />;
  if (value === false) {
    return (
      <span aria-label="Not included" role="img" style={{ opacity: 0.5 }}>
        &mdash;
      </span>
    );
  }
  return <span>{value}</span>;
}

const cellStyle: React.CSSProperties = {
  padding: "14px 16px",
  textAlign: "center",
  borderBottom: "1px solid var(--neutral-alpha-medium)",
};

export default function PricingPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="l" paddingY="xl" gap="xl">
      <Column maxWidth={72} fillWidth gap="xl">
        {/* Header */}
        <Column horizontal="center" gap="16" align="center">
          <Badge title="Simple, transparent pricing" />
          <Heading as="h1" variant="display-strong-l" wrap="balance">
            Pick the plan that fits your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Start free, upgrade when you grow. Every plan includes unlimited deploys, free SSL and
            global CDN delivery. Prices are per workspace, billed monthly.
          </Text>
        </Column>

        {/* Tiers */}
        <Grid as="section" aria-label="Pricing plans" columns="3" m={{ columns: 1 }} gap="24">
          {tiers.map((tier) => (
            <Column
              key={tier.id}
              as="article"
              aria-labelledby={`tier-${tier.id}`}
              padding="32"
              gap="24"
              radius="xl"
              background={tier.highlighted ? "brand-alpha-weak" : "surface"}
              border={tier.highlighted ? "brand-strong" : "neutral-medium"}
              style={tier.highlighted ? { borderWidth: 2, borderStyle: "solid" } : undefined}
            >
              <Column gap="8">
                <Row gap="12" vertical="center" wrap>
                  <Heading as="h2" id={`tier-${tier.id}`} variant="heading-strong-xl">
                    {tier.name}
                  </Heading>
                  {tier.highlighted && <Badge title="Most popular" />}
                </Row>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {tier.blurb}
                </Text>
              </Column>

              <Row vertical="end" gap="8">
                <Heading as="p" variant="display-strong-m">
                  {tier.price}
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak" paddingBottom="8">
                  / month
                </Text>
              </Row>

              <Button
                fillWidth
                size="l"
                variant={tier.highlighted ? "primary" : "secondary"}
                label={tier.cta}
                aria-label={`${tier.cta} - ${tier.name} plan`}
                href="#"
              />

              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {tier.features.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <SmallCheck />
                    <Text variant="body-default-m">{f}</Text>
                  </li>
                ))}
              </ul>
            </Column>
          ))}
        </Grid>

        {/* Comparison table */}
        <Column as="section" aria-labelledby="compare-heading" gap="24">
          <Heading as="h2" id="compare-heading" variant="display-strong-xs">
            Compare all features
          </Heading>
          <div
            role="region"
            aria-label="Feature comparison table, scrollable"
            tabIndex={0}
            style={{
              overflowX: "auto",
              border: "1px solid var(--neutral-alpha-medium)",
              borderRadius: "var(--radius-l, 16px)",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: 560,
                borderCollapse: "collapse",
                fontSize: "var(--font-size-body-m, 16px)",
                color: "var(--neutral-on-background-strong)",
              }}
            >
              <caption style={{ position: "absolute", left: -9999 }}>
                Feature comparison across the Starter, Team and Scale plans
              </caption>
              <thead>
                <tr>
                  <th scope="col" style={{ ...cellStyle, textAlign: "left" }}>
                    Feature
                  </th>
                  {tiers.map((t) => (
                    <th
                      key={t.id}
                      scope="col"
                      style={{
                        ...cellStyle,
                        background: t.highlighted ? "var(--brand-alpha-weak)" : undefined,
                      }}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row" style={{ ...cellStyle, textAlign: "left", fontWeight: 500 }}>
                      {row.feature}
                    </th>
                    {row.values.map((v, i) => (
                      <td
                        key={tiers[i].id}
                        style={{
                          ...cellStyle,
                          background: tiers[i].highlighted ? "var(--brand-alpha-weak)" : undefined,
                        }}
                      >
                        {renderCell(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Column>

        {/* FAQ */}
        <Column as="section" aria-labelledby="faq-heading" gap="24" maxWidth={48} fillWidth>
          <Heading as="h2" id="faq-heading" variant="display-strong-xs">
            Frequently asked questions
          </Heading>
          <Column fillWidth>
            {faqs.map((item, i) => {
              const isOpen = open === i;
              const panelId = `faq-panel-${i}`;
              const buttonId = `faq-button-${i}`;
              return (
                <div
                  key={item.q}
                  style={{ borderBottom: "1px solid var(--neutral-alpha-medium)" }}
                >
                  <h3 style={{ margin: 0 }}>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      style={{
                        all: "unset",
                        boxSizing: "border-box",
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        padding: "20px 4px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "var(--font-size-body-l, 18px)",
                        color: "var(--neutral-on-background-strong)",
                      }}
                    >
                      <span>{item.q}</span>
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          fontSize: 24,
                          lineHeight: 1,
                          transform: isOpen ? "rotate(45deg)" : "none",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                    <Text
                      as="p"
                      variant="body-default-m"
                      onBackground="neutral-weak"
                      style={{ margin: 0, padding: "0 4px 20px" }}
                    >
                      {item.a}
                    </Text>
                  </div>
                </div>
              );
            })}
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
