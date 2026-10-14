```tsx
"use client";

import { useId, useState } from "react";
import { Column, Row, Heading, Text, Button, Badge, Icon } from "@once-ui-system/core";

type Billing = "monthly" | "annual";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number; // per month, billed annually
  cta: string;
  highlighted: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo builders shipping their first product.",
    monthly: 12,
    annual: 9,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "Up to 3 projects",
      "5,000 monthly events",
      "7-day data retention",
      "Community support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For small teams that need to move fast together.",
    monthly: 39,
    annual: 31,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250,000 monthly events",
      "90-day data retention",
      "Custom dashboards & alerts",
      "Priority email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For organizations with security and compliance needs.",
    monthly: 129,
    annual: 105,
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Unlimited projects",
      "5M monthly events",
      "1-year data retention",
      "SSO / SAML & audit logs",
      "Dedicated success manager",
    ],
  },
];

type Cell = boolean | string;

interface CompareRow {
  feature: string;
  values: [Cell, Cell, Cell];
}

interface CompareGroup {
  group: string;
  rows: CompareRow[];
}

const COMPARISON: CompareGroup[] = [
  {
    group: "Usage",
    rows: [
      { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Monthly events", values: ["5,000", "250,000", "5,000,000"] },
      { feature: "Team members", values: ["1", "10", "Unlimited"] },
      { feature: "Data retention", values: ["7 days", "90 days", "1 year"] },
    ],
  },
  {
    group: "Analytics",
    rows: [
      { feature: "Custom dashboards", values: [false, true, true] },
      { feature: "Scheduled reports", values: [false, true, true] },
      { feature: "Anomaly alerts", values: [false, true, true] },
      { feature: "SQL query editor", values: [false, false, true] },
    ],
  },
  {
    group: "Security & support",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SSO / SAML", values: [false, false, true] },
      { feature: "Audit logs", values: [false, false, true] },
      { feature: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
      { feature: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "Can I try Growth before paying?",
    a: "Yes. Every paid plan includes a 14-day free trial with full access to its features. You don't need a credit card to start, and we'll remind you three days before the trial ends.",
  },
  {
    q: "What happens if I go over my monthly event limit?",
    a: "We never drop your data. If you pass your limit, we keep collecting events and send you an email so you can upgrade. Overage is billed at $0.40 per additional 10,000 events on Growth and Scale.",
  },
  {
    q: "Can I switch plans or cancel at any time?",
    a: "Absolutely. Upgrades take effect immediately and are prorated. Downgrades and cancellations apply at the end of your current billing period, and you can export all of your data before you leave.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual plans are billed once per year at a discount of roughly 20% compared to paying monthly. If you cancel within the first 30 days, we'll refund the full amount.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We do. Verified nonprofits, open-source maintainers and students get 50% off any plan. Contact our team with proof of status and we'll apply the discount within one business day.",
  },
];

const styles = `
.pricing-wrap { width: 100%; max-width: 72rem; margin: 0 auto; padding: 4rem 1.25rem 5rem; box-sizing: border-box; }
.pricing-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; align-items: stretch; }
@media (min-width: 52rem) { .pricing-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; } }
.pricing-card {
  position: relative; display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem 1.75rem;
  border-radius: 1.25rem; border: 1px solid var(--neutral-alpha-medium);
  background: var(--surface-background, transparent); box-sizing: border-box;
}
.pricing-card[data-highlighted="true"] {
  border: 2px solid var(--brand-solid-strong, var(--brand-on-background-strong));
  background: var(--brand-alpha-weak, var(--neutral-alpha-weak));
  box-shadow: 0 1.5rem 3rem -1.5rem var(--brand-alpha-strong, rgba(0,0,0,0.3));
}
@media (min-width: 52rem) { .pricing-card[data-highlighted="true"] { transform: translateY(-0.75rem); padding-block: 2.5rem; } }
.pricing-popular {
  position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%);
  white-space: nowrap; padding: 0.25rem 0.875rem; border-radius: 999px; font-size: 0.8125rem; font-weight: 600;
  background: var(--brand-solid-strong, var(--brand-on-background-strong)); color: var(--brand-on-solid-strong, #fff);
}
.pricing-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.pricing-list li { display: flex; gap: 0.625rem; align-items: flex-start; }
.pricing-list svg, .pricing-check { flex-shrink: 0; margin-top: 0.15rem; }

.billing-toggle {
  display: inline-flex; padding: 0.25rem; gap: 0.25rem; border-radius: 999px;
  border: 1px solid var(--neutral-alpha-medium); background: var(--neutral-alpha-weak);
}
.billing-toggle button {
  appearance: none; border: 0; cursor: pointer; font: inherit; font-size: 0.9375rem; font-weight: 500;
  padding: 0.5rem 1.125rem; border-radius: 999px; background: transparent; color: var(--neutral-on-background-weak);
  min-height: 2.5rem;
}
.billing-toggle button[aria-pressed="true"] {
  background: var(--brand-solid-strong, var(--neutral-solid-strong)); color: var(--brand-on-solid-strong, var(--neutral-on-solid-strong));
}
.billing-toggle button:focus-visible, .faq-trigger:focus-visible {
  outline: 2px solid var(--brand-solid-strong, currentColor); outline-offset: 2px;
}

.compare-scroll { width: 100%; overflow-x: auto; border: 1px solid var(--neutral-alpha-medium); border-radius: 1rem; }
.compare-table { width: 100%; min-width: 40rem; border-collapse: collapse; font-size: 0.9375rem; }
.compare-table caption { text-align: left; padding: 1rem 1.25rem; font-weight: 600; }
.compare-table th, .compare-table td { padding: 0.875rem 1.25rem; text-align: center; border-top: 1px solid var(--neutral-alpha-medium); }
.compare-table thead th { border-top: 0; font-weight: 600; }
.compare-table th[scope="row"] { text-align: left; font-weight: 400; }
.compare-table thead th:first-child { text-align: left; }
.compare-table .group-row th { text-align: left; background: var(--neutral-alpha-weak); font-size: 0.8125rem; letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.compare-table .hl { background: var(--brand-alpha-weak, var(--neutral-alpha-weak)); }
.compare-table .group-row th.hl { background: var(--brand-alpha-weak, var(--neutral-alpha-weak)); }

.faq-list { display: flex; flex-direction: column; border: 1px solid var(--neutral-alpha-medium); border-radius: 1rem; overflow: hidden; }
.faq-item + .faq-item { border-top: 1px solid var(--neutral-alpha-medium); }
.faq-heading { margin: 0; }
.faq-trigger {
  appearance: none; width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  padding: 1.125rem 1.25rem; background: transparent; border: 0; cursor: pointer; text-align: left;
  font: inherit; font-size: 1.0625rem; font-weight: 600; color: inherit; min-height: 3rem;
}
.faq-trigger:hover { background: var(--neutral-alpha-weak); }
.faq-chevron { flex-shrink: 0; transition: transform 0.2s ease; }
.faq-trigger[aria-expanded="true"] .faq-chevron { transform: rotate(180deg); }
.faq-panel { padding: 0 1.25rem 1.25rem; }
@media (prefers-reduced-motion: reduce) { .faq-chevron { transition: none; } }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
`;

function CheckIcon() {
  return (
    <svg
      className="pricing-check"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="faq-chevron"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CompareCell({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <CheckIcon />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <>{value}</>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const baseId = useId();

  return (
    <main className="pricing-wrap">
      <style>{styles}</style>

      {/* Header */}
      <Column as="header" horizontal="center" gap="16" align="center" paddingBottom="40">
        <Badge
          textVariant="label-default-s"
          onBackground="brand-strong"
          background="brand-alpha-weak"
          paddingX="12"
          paddingY="4"
        >
          Pricing
        </Badge>
        <Heading as="h1" variant="display-strong-m" wrap="balance">
          Simple pricing that scales with you
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance" style={{ maxWidth: "38rem" }}>
          Start with a 14-day free trial on any plan. No credit card required, and you can change or cancel whenever
          you like.
        </Text>

        <div className="billing-toggle" role="group" aria-label="Billing period" style={{ marginTop: "0.75rem" }}>
          <button type="button" aria-pressed={billing === "monthly"} onClick={() => setBilling("monthly")}>
            Monthly
          </button>
          <button type="button" aria-pressed={billing === "annual"} onClick={() => setBilling("annual")}>
            Annual <span style={{ fontSize: "0.8125rem", opacity: 0.85 }}>(save 20%)</span>
          </button>
        </div>
      </Column>

      {/* Tiers */}
      <section aria-labelledby={`${baseId}-plans`}>
        <h2 id={`${baseId}-plans`} className="sr-only">
          Plans
        </h2>
        <div className="pricing-grid">
          {TIERS.map((tier) => {
            const price = billing === "annual" ? tier.annual : tier.monthly;
            const nameId = `${baseId}-tier-${tier.id}`;
            return (
              <article
                key={tier.id}
                className="pricing-card"
                data-highlighted={tier.highlighted}
                aria-labelledby={nameId}
              >
                {tier.highlighted && <span className="pricing-popular">Most popular</span>}
                <Column gap="8">
                  <Heading as="h3" id={nameId} variant="heading-strong-xl">
                    {tier.name}
                  </Heading>
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    {tier.tagline}
                  </Text>
                </Column>

                <Column gap="4">
                  <Row vertical="end" gap="8">
                    <Text variant="display-strong-l" as="span">
                      ${price}
                    </Text>
                    <Text variant="body-default-m" onBackground="neutral-weak" as="span">
                      / month
                    </Text>
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
                    {billing === "annual"
                      ? `Billed annually ($${tier.annual * 12}/year)`
                      : "Billed monthly"}
                  </Text>
                </Column>

                <Button
                  fillWidth
                  size="l"
                  variant={tier.highlighted ? "primary" : "secondary"}
                  aria-label={`${tier.cta} — ${tier.name} plan`}
                >
                  {tier.cta}
                </Button>

                <ul className="pricing-list" aria-label={`${tier.name} plan features`}>
                  {tier.features.map((feature) => (
                    <li key={feature}>
                      <CheckIcon />
                      <Text variant="body-default-m" as="span">
                        {feature}
                      </Text>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section aria-labelledby={`${baseId}-compare`} style={{ marginTop: "5rem" }}>
        <Column gap="8" paddingBottom="24">
          <Heading as="h2" id={`${baseId}-compare`} variant="heading-strong-xl">
            Compare plans
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Everything included in each plan, side by side.
          </Text>
        </Column>

        <div className="compare-scroll" role="region" aria-label="Plan comparison table" tabIndex={0}>
          <table className="compare-table">
            <caption className="sr-only">Feature comparison across Starter, Growth and Scale plans</caption>
            <thead>
              <tr>
                <th scope="col">Features</th>
                {TIERS.map((tier) => (
                  <th key={tier.id} scope="col" className={tier.highlighted ? "hl" : undefined}>
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            {COMPARISON.map((group) => (
              <tbody key={group.group}>
                <tr className="group-row">
                  <th scope="colgroup" colSpan={4}>
                    {group.group}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.feature}>
                    <th scope="row">{row.feature}</th>
                    {row.values.map((value, i) => (
                      <td key={TIERS[i].id} className={TIERS[i].highlighted ? "hl" : undefined}>
                        <CompareCell value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby={`${baseId}-faq`} style={{ marginTop: "5rem", maxWidth: "48rem", marginInline: "auto" }}>
        <Column gap="8" paddingBottom="24" horizontal="center" align="center">
          <Heading as="h2" id={`${baseId}-faq`} variant="heading-strong-xl">
            Frequently asked questions
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Can't find what you're looking for? Email support@example.com and we'll get back to you within a day.
          </Text>
        </Column>

        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const open = openFaq === index;
            const triggerId = `${baseId}-faq-trigger-${index}`;
            const panelId = `${baseId}-faq-panel-${index}`;
            return (
              <div key={faq.q} className="faq-item">
                <h3 className="faq-heading">
                  <button
                    type="button"
                    id={triggerId}
                    className="faq-trigger"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(open ? null : index)}
                  >
                    <span>{faq.q}</span>
                    <ChevronIcon />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!open} className="faq-panel">
                  <Text variant="body-default-m" onBackground="neutral-weak">
                    {faq.a}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
```