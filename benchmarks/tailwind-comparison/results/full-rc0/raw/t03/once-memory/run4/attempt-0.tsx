"use client";

import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { Column, Row, Heading, Text, Button, Badge } from "@once-ui-system/core";

type Billing = "monthly" | "annual";

interface Tier {
  id: "starter" | "growth" | "scale";
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  cta: string;
  highlighted: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo builders shipping their first product.",
    monthly: 0,
    annual: 0,
    cta: "Start for free",
    highlighted: false,
    features: [
      "Up to 3 projects",
      "10,000 events per month",
      "7-day data retention",
      "Community support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For growing teams that need speed and insight.",
    monthly: 29,
    annual: 24,
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "1,000,000 events per month",
      "12-month data retention",
      "Custom dashboards and alerts",
      "Priority email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For organizations with security and compliance needs.",
    monthly: 99,
    annual: 82,
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Everything in Growth",
      "Unlimited events",
      "Unlimited data retention",
      "SSO, SAML and audit logs",
      "Dedicated success manager",
    ],
  },
];

type CellValue = boolean | string;

interface CompareRow {
  label: string;
  values: [CellValue, CellValue, CellValue];
}

interface CompareGroup {
  group: string;
  rows: CompareRow[];
}

const COMPARISON: CompareGroup[] = [
  {
    group: "Usage",
    rows: [
      { label: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Events per month", values: ["10,000", "1,000,000", "Unlimited"] },
      { label: "Data retention", values: ["7 days", "12 months", "Unlimited"] },
      { label: "Team members", values: ["1", "10", "Unlimited"] },
    ],
  },
  {
    group: "Analytics",
    rows: [
      { label: "Prebuilt reports", values: [true, true, true] },
      { label: "Custom dashboards", values: [false, true, true] },
      { label: "Alerts and anomaly detection", values: [false, true, true] },
      { label: "Raw data export", values: [false, true, true] },
    ],
  },
  {
    group: "Security and support",
    rows: [
      { label: "Two-factor authentication", values: [true, true, true] },
      { label: "SSO and SAML", values: [false, false, true] },
      { label: "Audit logs", values: [false, false, true] },
      { label: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
      { label: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. When you upgrade, we prorate the difference for the rest of the billing period. When you downgrade, the change takes effect at your next renewal.",
  },
  {
    q: "What happens if I go over my event limit?",
    a: "We never drop your data. If you pass your monthly limit, we keep collecting events and send you a heads-up so you can upgrade. Starter projects pause dashboards until the next cycle, while paid plans keep working normally.",
  },
  {
    q: "How does the annual discount work?",
    a: "Paying annually saves roughly 17% compared with monthly billing. You are charged once per year, and you can cancel before renewal to avoid the next charge.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you are not happy within the first 30 days of a paid plan, contact support and we will refund your most recent payment in full, no questions asked.",
  },
  {
    q: "Is there a discount for nonprofits or students?",
    a: "Yes. Verified nonprofits, open-source maintainers and students receive 50% off the Growth plan. Reach out to our team with proof of status and we will apply the discount within one business day.",
  },
];

const css = `
.pr-wrap { width: 100%; max-width: 1120px; margin: 0 auto; padding: 64px 20px 96px; box-sizing: border-box; }
.pr-grid { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: stretch; }
@media (min-width: 900px) {
  .pr-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .pr-featured { transform: translateY(-12px); }
}
.pr-card { display: flex; flex-direction: column; gap: 24px; padding: 28px; border-radius: 20px; background: var(--surface-background); border: 1px solid var(--neutral-alpha-medium); box-sizing: border-box; }
.pr-card.pr-featured { border: 2px solid var(--brand-solid-strong); box-shadow: 0 12px 40px var(--brand-alpha-weak); background: var(--page-background); }
.pr-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.pr-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 15px; line-height: 1.4; color: var(--neutral-on-background-strong); }
.pr-check { flex: none; width: 18px; height: 18px; margin-top: 1px; color: var(--brand-on-background-strong); }
.pr-toggle { display: inline-flex; padding: 4px; gap: 4px; border-radius: 999px; border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background); }
.pr-toggle button { appearance: none; border: 0; cursor: pointer; padding: 8px 18px; border-radius: 999px; font: inherit; font-size: 14px; font-weight: 500; background: transparent; color: var(--neutral-on-background-medium); display: inline-flex; gap: 8px; align-items: center; min-height: 40px; }
.pr-toggle button[aria-pressed="true"] { background: var(--brand-solid-strong); color: var(--brand-on-solid-strong); }
.pr-toggle button:focus-visible, .pr-faq-btn:focus-visible, .pr-scroll:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.pr-cta { display: block; width: 100%; }
.pr-scroll { overflow-x: auto; border: 1px solid var(--neutral-alpha-medium); border-radius: 16px; background: var(--surface-background); }
.pr-table { width: 100%; min-width: 680px; border-collapse: separate; border-spacing: 0; font-size: 15px; color: var(--neutral-on-background-strong); }
.pr-table th, .pr-table td { padding: 14px 18px; text-align: center; border-bottom: 1px solid var(--neutral-alpha-weak); }
.pr-table thead th { font-weight: 600; font-size: 16px; position: sticky; top: 0; background: var(--surface-background); }
.pr-table thead th.pr-hl { color: var(--brand-on-background-strong); }
.pr-table tbody th[scope="row"] { text-align: left; font-weight: 400; }
.pr-table th.pr-first { text-align: left; }
.pr-table td.pr-hl, .pr-table thead th.pr-hl { background: var(--brand-alpha-weak); }
.pr-table tr.pr-group th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--neutral-on-background-weak); background: var(--neutral-alpha-weak); padding-top: 10px; padding-bottom: 10px; }
.pr-table tbody tr:last-child th, .pr-table tbody tr:last-child td { border-bottom: 0; }
.pr-faq { display: flex; flex-direction: column; border: 1px solid var(--neutral-alpha-medium); border-radius: 16px; overflow: hidden; background: var(--surface-background); }
.pr-faq-item + .pr-faq-item { border-top: 1px solid var(--neutral-alpha-medium); }
.pr-faq-h { margin: 0; }
.pr-faq-btn { appearance: none; width: 100%; background: transparent; border: 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 24px; text-align: left; font: inherit; font-size: 17px; font-weight: 600; color: var(--neutral-on-background-strong); min-height: 44px; }
.pr-faq-btn:hover { background: var(--neutral-alpha-weak); }
.pr-faq-icon { flex: none; width: 20px; height: 20px; transition: transform 0.2s ease; }
.pr-faq-btn[aria-expanded="true"] .pr-faq-icon { transform: rotate(45deg); }
.pr-faq-panel { padding: 0 24px 22px; font-size: 16px; line-height: 1.6; color: var(--neutral-on-background-medium); max-width: 68ch; }
.pr-faq-panel[hidden] { display: none; }
.pr-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (prefers-reduced-motion: reduce) { .pr-faq-icon { transition: none; } }
`;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

function formatPrice(tier: Tier, billing: Billing): string {
  const value = billing === "monthly" ? tier.monthly : tier.annual;
  if (value === null) return "Custom";
  return `$${value}`;
}

function Cell({ value, tierName }: { value: CellValue; tierName: string }) {
  if (value === true) {
    return (
      <>
        <CheckIcon className="pr-check" />
        <span className="pr-sr">Included in {tierName}</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <span aria-hidden="true" style={{ color: "var(--neutral-on-background-weak)" }}>
          &mdash;
        </span>
        <span className="pr-sr">Not included in {tierName}</span>
      </>
    );
  }
  return <span>{value}</span>;
}

const centerStyle: CSSProperties = { display: "inline-block", verticalAlign: "middle" };

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <main>
      <style>{css}</style>
      <div className="pr-wrap">
        {/* Header */}
        <Column horizontal="center" gap="16" paddingBottom="40" style={{ textAlign: "center" }}>
          <Badge title="Pricing" arrow={false} />
          <Heading as="h1" variant="display-strong-l" wrap="balance">
            Simple pricing that scales with you
          </Heading>
          <Text as="p" variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Start free, upgrade when you are ready, and cancel anytime. Every plan includes
            unlimited viewers and encrypted data storage.
          </Text>
          <div role="group" aria-label="Billing period" className="pr-toggle" style={{ marginTop: 12 }}>
            <button
              type="button"
              aria-pressed={billing === "monthly"}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              aria-pressed={billing === "annual"}
              onClick={() => setBilling("annual")}
            >
              Annual
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>Save 17%</span>
            </button>
          </div>
        </Column>

        {/* Tiers */}
        <section aria-labelledby={`${baseId}-plans`}>
          <h2 id={`${baseId}-plans`} className="pr-sr">
            Plans
          </h2>
          <div className="pr-grid">
            {TIERS.map((tier) => (
              <article
                key={tier.id}
                className={`pr-card${tier.highlighted ? " pr-featured" : ""}`}
                aria-labelledby={`${baseId}-${tier.id}-name`}
              >
                <Column gap="8">
                  <Row gap="12" vertical="center" style={{ minHeight: 28 }}>
                    <Heading as="h3" variant="heading-strong-xl" id={`${baseId}-${tier.id}-name`}>
                      {tier.name}
                    </Heading>
                    {tier.highlighted && <Badge title="Most popular" arrow={false} />}
                  </Row>
                  <Text as="p" variant="body-default-m" onBackground="neutral-weak">
                    {tier.tagline}
                  </Text>
                </Column>

                <div>
                  <Row vertical="end" gap="8">
                    <Text
                      as="span"
                      variant="display-strong-l"
                      aria-label={`${formatPrice(tier, billing).replace("$", "")} dollars per month`}
                    >
                      {formatPrice(tier, billing)}
                    </Text>
                    <Text as="span" variant="body-default-m" onBackground="neutral-weak" style={{ paddingBottom: 8 }}>
                      per month
                    </Text>
                  </Row>
                  <Text as="p" variant="body-default-s" onBackground="neutral-weak" style={{ minHeight: 20, marginTop: 4 }}>
                    {tier.monthly === 0
                      ? "Free forever, no credit card required"
                      : billing === "annual"
                        ? `Billed annually at $${(tier.annual ?? 0) * 12}`
                        : "Billed monthly"}
                  </Text>
                </div>

                <div className="pr-cta">
                  <Button
                    fillWidth
                    size="l"
                    variant={tier.highlighted ? "primary" : "secondary"}
                    aria-label={`${tier.cta} on the ${tier.name} plan`}
                    href={tier.id === "scale" ? "#faq" : "#compare"}
                  >
                    {tier.cta}
                  </Button>
                </div>

                <ul className="pr-list" aria-label={`${tier.name} plan features`}>
                  {tier.features.map((f) => (
                    <li key={f}>
                      <CheckIcon className="pr-check" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <section id="compare" aria-labelledby={`${baseId}-compare`} style={{ marginTop: 96, scrollMarginTop: 24 }}>
          <Column gap="8" paddingBottom="24">
            <Heading as="h2" variant="display-strong-s" id={`${baseId}-compare`}>
              Compare plans
            </Heading>
            <Text as="p" variant="body-default-m" onBackground="neutral-weak">
              A detailed look at what is included in each plan.
            </Text>
          </Column>
          <div
            className="pr-scroll"
            role="region"
            aria-labelledby={`${baseId}-compare`}
            tabIndex={0}
          >
            <table className="pr-table">
              <caption className="pr-sr">Feature comparison across Starter, Growth and Scale plans</caption>
              <thead>
                <tr>
                  <th scope="col" className="pr-first">
                    <span className="pr-sr">Feature</span>
                  </th>
                  {TIERS.map((t) => (
                    <th key={t.id} scope="col" className={t.highlighted ? "pr-hl" : undefined}>
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {COMPARISON.map((g) => (
                <tbody key={g.group}>
                  <tr className="pr-group">
                    <th scope="colgroup" colSpan={4}>
                      {g.group}
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {r.values.map((v, i) => (
                        <td key={TIERS[i].id} className={TIERS[i].highlighted ? "pr-hl" : undefined}>
                          <span style={centerStyle}>
                            <Cell value={v} tierName={TIERS[i].name} />
                          </span>
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
        <section id="faq" aria-labelledby={`${baseId}-faq`} style={{ marginTop: 96, scrollMarginTop: 24 }}>
          <Column gap="8" paddingBottom="24">
            <Heading as="h2" variant="display-strong-s" id={`${baseId}-faq`}>
              Frequently asked questions
            </Heading>
            <Text as="p" variant="body-default-m" onBackground="neutral-weak">
              Can&apos;t find what you need? Email us at support@example.com and a real person will reply within a day.
            </Text>
          </Column>
          <div className="pr-faq">
            {FAQS.map((item, i) => {
              const open = openIndex === i;
              const buttonId = `${baseId}-faq-btn-${i}`;
              const panelId = `${baseId}-faq-panel-${i}`;
              return (
                <div key={item.q} className="pr-faq-item">
                  <h3 className="pr-faq-h">
                    <button
                      type="button"
                      id={buttonId}
                      className="pr-faq-btn"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(open ? null : i)}
                    >
                      <span>{item.q}</span>
                      <PlusIcon className="pr-faq-icon" />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="pr-faq-panel"
                    hidden={!open}
                  >
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
