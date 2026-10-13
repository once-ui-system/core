```tsx
"use client";

import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { Badge, Button, Column, Heading, Row, Text } from "@once-ui-system/core";

type Billing = "monthly" | "annual";

interface Tier {
  id: "starter" | "team" | "enterprise";
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
    monthly: 12,
    annual: 9,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "3 active projects",
      "10,000 monthly events",
      "7-day data retention",
      "Community support",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For growing teams that need to move together.",
    monthly: 39,
    annual: 31,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "500,000 monthly events",
      "90-day data retention",
      "Role-based access control",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organisations with advanced security needs.",
    monthly: null,
    annual: null,
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Unlimited events",
      "Custom data retention",
      "SAML single sign-on",
      "Audit logs and SLA",
      "Dedicated success manager",
    ],
  },
];

type CellValue = boolean | string;

interface ComparisonRow {
  feature: string;
  values: [CellValue, CellValue, CellValue];
}

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { feature: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Monthly events", values: ["10,000", "500,000", "Unlimited"] },
      { feature: "Data retention", values: ["7 days", "90 days", "Custom"] },
      { feature: "Team members", values: ["1", "15", "Unlimited"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared dashboards", values: [false, true, true] },
      { feature: "Role-based access control", values: [false, true, true] },
      { feature: "Comments and mentions", values: [false, true, true] },
    ],
  },
  {
    group: "Security",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SAML single sign-on", values: [false, false, true] },
      { feature: "Audit logs", values: [false, false, true] },
      { feature: "Uptime SLA", values: [false, false, "99.99%"] },
    ],
  },
  {
    group: "Support",
    rows: [
      { feature: "Community forum", values: [true, true, true] },
      { feature: "Priority email support", values: [false, true, true] },
      { feature: "Dedicated success manager", values: [false, false, true] },
    ],
  },
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrades take effect immediately and we prorate the difference on your next invoice. If you downgrade, the change applies at the start of your next billing cycle so you keep what you paid for.",
  },
  {
    q: "How does the free trial work?",
    a: "Every paid plan includes a 14-day trial with full access to its features. You don't need to enter a credit card to start, and we'll email you three days before the trial ends.",
  },
  {
    q: "What happens if I go over my monthly event limit?",
    a: "We never drop your data. If you exceed your limit we keep collecting events and send you a heads-up so you can upgrade or reduce volume. Sustained overages may be billed at $0.40 per additional 1,000 events.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off any plan for registered nonprofits, accredited educational institutions and open-source maintainers. Contact our team with proof of status and we'll apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Annual Enterprise contracts can also be paid by bank transfer against an invoice with net-30 terms.",
  },
];

const wrapStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1120,
  marginInline: "auto",
};

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, color: "var(--brand-on-background-strong, currentColor)" }}
    >
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ opacity: 0.4 }}
    >
      <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{
        flexShrink: 0,
        transition: "transform 0.2s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BillingToggle({
  billing,
  onChange,
}: {
  billing: Billing;
  onChange: (b: Billing) => void;
}) {
  const options: { value: Billing; label: string }[] = [
    { value: "monthly", label: "Monthly" },
    { value: "annual", label: "Annual" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Billing period"
      style={{
        display: "inline-flex",
        padding: 4,
        gap: 4,
        borderRadius: 999,
        border: "1px solid var(--neutral-alpha-medium)",
        background: "var(--surface-background, transparent)",
      }}
    >
      {options.map((o) => {
        const active = billing === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: 999,
              padding: "8px 18px",
              minHeight: 40,
              font: "inherit",
              fontWeight: 600,
              fontSize: 14,
              color: active ? "var(--page-background, #fff)" : "var(--neutral-on-background-strong)",
              background: active ? "var(--neutral-solid-strong, #111)" : "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {o.label}
            {o.value === "annual" ? (
              <span style={{ marginLeft: 6, fontWeight: 500, opacity: 0.8 }}>(save 20%)</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function TierCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const price = billing === "annual" ? tier.annual : tier.monthly;
  const headingId = `tier-${tier.id}`;

  return (
    <article
      aria-labelledby={headingId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: 28,
        borderRadius: 20,
        position: "relative",
        background: "var(--surface-background, transparent)",
        border: tier.highlighted
          ? "2px solid var(--brand-solid-strong, #4f46e5)"
          : "1px solid var(--neutral-alpha-medium)",
        boxShadow: tier.highlighted ? "0 12px 40px rgba(79, 70, 229, 0.18)" : "none",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <Column gap="8">
        <Row gap="12" vertical="center" wrap>
          <Heading as="h3" variant="heading-strong-l" id={headingId}>
            {tier.name}
          </Heading>
          {tier.highlighted ? <Badge title="Most popular" /> : null}
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {tier.tagline}
        </Text>
      </Column>

      <div aria-live="polite">
        {price === null ? (
          <Column gap="4">
            <Heading as="p" variant="display-strong-xs">
              Custom
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Tailored to your volume and security needs
            </Text>
          </Column>
        ) : (
          <Column gap="4">
            <Row vertical="end" gap="8">
              <Heading as="p" variant="display-strong-s">
                ${price}
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                per user / month
              </Text>
            </Row>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {billing === "annual" ? "Billed annually" : "Billed monthly"}
            </Text>
          </Column>
        )}
      </div>

      <Button
        href={tier.id === "enterprise" ? "#contact-sales" : "#start-trial"}
        variant={tier.highlighted ? "primary" : "secondary"}
        size="l"
        fillWidth
        arrowIcon
      >
        {tier.cta}
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {` for the ${tier.name} plan`}
        </span>
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
        {tier.features.map((f) => (
          <li key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <CheckIcon />
            <Text variant="body-default-m">{f}</Text>
          </li>
        ))}
      </ul>
    </article>
  );
}

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <span style={{ display: "inline-flex", justifyContent: "center" }}>
        <CheckIcon />
        <span style={visuallyHidden}>Included</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span style={{ display: "inline-flex", justifyContent: "center" }}>
        <DashIcon />
        <span style={visuallyHidden}>Not included</span>
      </span>
    );
  }
  return <Text variant="body-default-s">{value}</Text>;
}

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function ComparisonTable() {
  const cellBase: CSSProperties = {
    padding: "14px 16px",
    textAlign: "center",
    borderBottom: "1px solid var(--neutral-alpha-weak)",
    verticalAlign: "middle",
  };
  const highlightBg = "var(--brand-alpha-weak, rgba(79, 70, 229, 0.06))";

  return (
    <div
      role="region"
      aria-labelledby="comparison-heading"
      tabIndex={0}
      style={{
        overflowX: "auto",
        borderRadius: 16,
        border: "1px solid var(--neutral-alpha-medium)",
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: 640,
          borderCollapse: "collapse",
          fontFamily: "var(--font-body)",
          color: "var(--neutral-on-background-strong)",
        }}
      >
        <caption style={visuallyHidden}>
          Feature comparison across the Starter, Team and Enterprise plans
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              style={{ ...cellBase, textAlign: "left", fontSize: 14, fontWeight: 600 }}
            >
              Features
            </th>
            {TIERS.map((t) => (
              <th
                key={t.id}
                scope="col"
                style={{
                  ...cellBase,
                  fontSize: 15,
                  fontWeight: 700,
                  background: t.highlighted ? highlightBg : undefined,
                }}
              >
                {t.name}
                {t.highlighted ? (
                  <span style={{ display: "block", fontSize: 12, fontWeight: 500, opacity: 0.7 }}>
                    Most popular
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        {COMPARISON.map((group) => (
          <tbody key={group.group}>
            <tr>
              <th
                scope="colgroup"
                colSpan={4}
                style={{
                  ...cellBase,
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  opacity: 0.75,
                  background: "var(--neutral-alpha-weak)",
                }}
              >
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.feature}>
                <th
                  scope="row"
                  style={{ ...cellBase, textAlign: "left", fontSize: 14, fontWeight: 500 }}
                >
                  {row.feature}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={TIERS[i].id}
                    style={{
                      ...cellBase,
                      background: TIERS[i].highlighted ? highlightBg : undefined,
                    }}
                  >
                    <CellContent value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function Faq() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid var(--neutral-alpha-medium)",
        overflow: "hidden",
      }}
    >
      {FAQS.map((item, i) => {
        const open = openIndex === i;
        const buttonId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div
            key={item.q}
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--neutral-alpha-weak)",
            }}
          >
            <h3 style={{ margin: 0 }}>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "18px 20px",
                  minHeight: 56,
                  textAlign: "left",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  color: "var(--neutral-on-background-strong)",
                  font: "inherit",
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                }}
              >
                <span>{item.q}</span>
                <ChevronIcon open={open} />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              style={{ padding: "0 20px 20px" }}
            >
              <Text variant="body-default-m" onBackground="neutral-weak">
                {item.a}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="48" gap="64">
      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: stretch;
        }
        @media (min-width: 900px) {
          .pricing-grid { grid-template-columns: repeat(3, 1fr); }
          .pricing-grid > .is-highlighted { transform: translateY(-12px); }
        }
        .pricing-grid a:focus-visible,
        button:focus-visible,
        [role="region"][tabindex]:focus-visible {
          outline: 2px solid var(--brand-solid-strong, #4f46e5);
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>

      <section aria-labelledby="pricing-heading" style={wrapStyle}>
        <Column gap="32" horizontal="center">
          <Column gap="16" horizontal="center" style={{ textAlign: "center", maxWidth: 680 }}>
            <Heading as="h1" variant="display-strong-l" id="pricing-heading" wrap="balance">
              Simple pricing that scales with your team
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
              Start with a 14-day free trial on any paid plan. No credit card required, and you can
              change or cancel whenever you like.
            </Text>
          </Column>

          <BillingToggle billing={billing} onChange={setBilling} />

          <div className="pricing-grid" style={{ width: "100%", paddingTop: 12 }}>
            {TIERS.map((t) => (
              <div key={t.id} className={t.highlighted ? "is-highlighted" : undefined}>
                <TierCard tier={t} billing={billing} />
              </div>
            ))}
          </div>
        </Column>
      </section>

      <section aria-labelledby="comparison-heading" style={wrapStyle}>
        <Column gap="24">
          <Column gap="8">
            <Heading as="h2" variant="display-strong-xs" id="comparison-heading">
              Compare plans
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A detailed look at what is included in every plan.
            </Text>
          </Column>
          <ComparisonTable />
        </Column>
      </section>

      <section aria-labelledby="faq-heading" style={{ ...wrapStyle, maxWidth: 800 }}>
        <Column gap="24">
          <Column gap="8">
            <Heading as="h2" variant="display-strong-xs" id="faq-heading">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Can't find what you're looking for? Email support@example.com and we'll get back to
              you within one business day.
            </Text>
          </Column>
          <Faq />
        </Column>
      </section>
    </Column>
  );
}
```