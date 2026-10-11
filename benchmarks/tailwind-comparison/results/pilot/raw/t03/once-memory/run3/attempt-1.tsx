"use client";

import { useState } from "react";
import { Badge, Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";

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
    blurb: "For side projects and trying things out.",
    cta: "Start for free",
    highlighted: false,
    features: ["Up to 3 projects", "1 GB storage", "Community support", "Basic analytics"],
  },
  {
    id: "team",
    name: "Team",
    price: "$24",
    blurb: "For growing teams that ship every week.",
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "100 GB storage",
      "Priority email support",
      "Advanced analytics",
      "Role-based access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$79",
    blurb: "For organizations with security and scale needs.",
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Team",
      "1 TB storage",
      "Dedicated success manager",
      "SSO and audit logs",
      "99.99% uptime SLA",
    ],
  },
];

type Row3 = { feature: string; values: [string | boolean, string | boolean, string | boolean] };

const comparison: Row3[] = [
  { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
  { feature: "Storage", values: ["1 GB", "100 GB", "1 TB"] },
  { feature: "Team members", values: ["1", "25", "Unlimited"] },
  { feature: "Advanced analytics", values: [false, true, true] },
  { feature: "Role-based access", values: [false, true, true] },
  { feature: "Priority support", values: [false, true, true] },
  { feature: "SSO and audit logs", values: [false, false, true] },
  { feature: "Uptime SLA", values: [false, false, true] },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades apply immediately and downgrades take effect at the end of the billing period.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "The Team plan includes a 14-day free trial with no credit card required. Enterprise trials are arranged with our sales team.",
  },
  {
    q: "How does billing work?",
    a: "Plans are billed per seat, monthly. Pay annually and get two months free. Invoices are emailed to your billing contact.",
  },
  {
    q: "What happens if I exceed my storage limit?",
    a: "We will notify you at 80% and 100% usage. Existing files stay safe, and you can upgrade or free up space whenever you like.",
  },
  {
    q: "Do you offer discounts for nonprofits?",
    a: "Registered nonprofits and open-source maintainers get 50% off the Team plan. Reach out to support with proof of status.",
  },
];

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
};

function Cell({ value, label }: { value: string | boolean; label: string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Row horizontal="center" vertical="center">
        <Icon name="check" size="s" onBackground="brand-medium" />
        <span style={srOnly}>Included in {label}</span>
      </Row>
    ) : (
      <Text onBackground="neutral-weak">
        <span aria-hidden="true">&mdash;</span>
        <span style={srOnly}>Not included in {label}</span>
      </Text>
    );
  }
  return <Text variant="body-default-s">{value}</Text>;
}

export default function PricingPage() {
  const [open, setOpen] = useState<number | null>(0);

  const thStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "center",
    borderBottom: "1px solid var(--neutral-alpha-medium)",
    whiteSpace: "nowrap",
  };
  const tdStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "center",
    borderBottom: "1px solid var(--neutral-alpha-weak)",
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="l" paddingY="xl" gap="xl">
      <Column maxWidth="l" fillWidth gap="m" horizontal="center" align="center">
        <Heading as="h1" variant="display-strong-m">
          Simple pricing that scales with you
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Pick a plan, change it any time. All prices in USD per seat, billed monthly.
        </Text>
      </Column>

      <section aria-labelledby="plans-heading" style={{ width: "100%", maxWidth: 1100 }}>
        <h2 id="plans-heading" style={srOnly}>
          Plans
        </h2>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            alignItems: "stretch",
          }}
        >
          {tiers.map((t) => (
            <li key={t.id} style={{ display: "flex" }}>
              <Column
                fillWidth
                padding="l"
                gap="l"
                radius="l"
                background={t.highlighted ? "brand-alpha-weak" : "surface"}
                border={t.highlighted ? "brand-strong" : "neutral-medium"}
                borderStyle="solid"
                shadow={t.highlighted ? "l" : undefined}
              >
                <Column gap="8">
                  <Row gap="12" vertical="center" wrap>
                    <Heading as="h3" variant="heading-strong-l">
                      {t.name}
                    </Heading>
                    {t.highlighted && <Badge title="Most popular" arrow={false} />}
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {t.blurb}
                  </Text>
                </Column>
                <Row vertical="end" gap="8">
                  <Heading as="p" variant="display-strong-l">
                    {t.price}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    / seat / month
                  </Text>
                </Row>
                <Button
                  fillWidth
                  variant={t.highlighted ? "primary" : "secondary"}
                  size="l"
                  href="#"
                  aria-label={`${t.cta} - ${t.name} plan`}
                >
                  {t.cta}
                </Button>
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
                  {t.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <Icon name="check" size="s" onBackground="brand-medium" />
                      <Text variant="body-default-s">{f}</Text>
                    </li>
                  ))}
                </ul>
              </Column>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="compare-heading" style={{ width: "100%", maxWidth: 1100 }}>
        <Column gap="m" fillWidth>
          <Heading as="h2" id="compare-heading" variant="heading-strong-xl">
            Compare plans
          </Heading>
          <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-labelledby="compare-heading">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <caption style={srOnly}>
                Feature comparison across Starter, Team and Enterprise plans
              </caption>
              <thead>
                <tr>
                  <th scope="col" style={{ ...thStyle, textAlign: "left" }}>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      Feature
                    </Text>
                  </th>
                  {tiers.map((t) => (
                    <th
                      key={t.id}
                      scope="col"
                      style={{
                        ...thStyle,
                        background: t.highlighted ? "var(--brand-alpha-weak)" : undefined,
                      }}
                    >
                      <Text variant="label-strong-m">{t.name}</Text>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((r) => (
                  <tr key={r.feature}>
                    <th scope="row" style={{ ...tdStyle, textAlign: "left", fontWeight: "normal" }}>
                      <Text variant="body-default-s">{r.feature}</Text>
                    </th>
                    {r.values.map((v, i) => (
                      <td
                        key={tiers[i].id}
                        style={{
                          ...tdStyle,
                          background: tiers[i].highlighted ? "var(--brand-alpha-weak)" : undefined,
                        }}
                      >
                        <Cell value={v} label={tiers[i].name} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Column>
      </section>

      <section aria-labelledby="faq-heading" style={{ width: "100%", maxWidth: 760 }}>
        <Column gap="m" fillWidth>
          <Heading as="h2" id="faq-heading" variant="heading-strong-xl">
            Frequently asked questions
          </Heading>
          <div>
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} style={{ borderBottom: "1px solid var(--neutral-alpha-medium)" }}>
                  <h3 style={{ margin: 0 }}>
                    <button
                      type="button"
                      id={`faq-btn-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      style={{
                        all: "unset",
                        boxSizing: "border-box",
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        padding: "16px 0",
                        cursor: "pointer",
                        color: "var(--neutral-on-background-strong)",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      <span>{f.q}</span>
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-flex",
                          transition: "transform 0.2s",
                          transform: isOpen ? "rotate(180deg)" : "none",
                        }}
                      >
                        <Icon name="chevronDown" size="s" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    hidden={!isOpen}
                    style={{ paddingBottom: 16 }}
                  >
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {f.a}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </Column>
      </section>
    </Column>
  );
}
