```tsx
"use client";

import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Badge, Button, Column, Heading, Row, Text } from "@once-ui-system/core";

type Billing = "monthly" | "annual";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  cta: string;
  highlighted: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For individuals and side projects getting off the ground.",
    monthly: 12,
    annual: 9,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "Up to 3 active projects",
      "5 GB asset storage",
      "Basic analytics dashboard",
      "Community support",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For growing teams that ship together every week.",
    monthly: 36,
    annual: 29,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "100 GB asset storage",
      "Advanced analytics and exports",
      "Role-based permissions",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with security and compliance needs.",
    monthly: 99,
    annual: 82,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Team",
      "Unlimited storage",
      "SAML single sign-on and SCIM",
      "Audit logs and data residency",
      "Dedicated success manager",
    ],
  },
];

type CellValue = boolean | string;

interface ComparisonRow {
  label: string;
  values: [CellValue, CellValue, CellValue];
}

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Workspace",
    rows: [
      { label: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { label: "Asset storage", values: ["5 GB", "100 GB", "Unlimited"] },
      { label: "Version history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { label: "Shared comments", values: [true, true, true] },
      { label: "Role-based permissions", values: [false, true, true] },
      { label: "Guest reviewer access", values: [false, true, true] },
      { label: "Custom approval workflows", values: [false, false, true] },
    ],
  },
  {
    group: "Security",
    rows: [
      { label: "Two-factor authentication", values: [true, true, true] },
      { label: "SAML single sign-on", values: [false, false, true] },
      { label: "Audit logs", values: [false, "30 days", "Unlimited"] },
      { label: "Data residency options", values: [false, false, true] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Community forum", values: [true, true, true] },
      { label: "Email support", values: [false, "Priority", "Priority"] },
      { label: "Dedicated success manager", values: [false, false, true] },
      { label: "Uptime SLA", values: [false, false, "99.99%"] },
    ],
  },
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "How does the free trial work?",
    a: "Every paid plan starts with a 14-day free trial. You do not need a credit card to begin, and you can invite your whole team while you evaluate. If you decide not to continue, your workspace switches to read-only mode and your data stays available for 30 days.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade at any time and the change takes effect immediately, with the remaining balance prorated. Downgrades apply at the start of your next billing period so you keep access to everything you have already paid for.",
  },
  {
    q: "What happens if I go over my storage limit?",
    a: "We never delete your files. If you pass your plan's storage limit, uploads pause and we send a notice to workspace owners. You can free up space, add storage in 50 GB increments, or move to a larger plan.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 40% off the Team plan for registered nonprofits and verified educational institutions. Send us a short note from your organization's email address and we will apply the discount within one business day.",
  },
  {
    q: "How is annual billing different from monthly?",
    a: "Annual billing is charged once per year and works out to roughly 20% less than paying month to month. Invoices are issued upfront, and you can request a prorated refund within the first 30 days.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can also pay by bank transfer or purchase order on annual contracts.",
  },
];

const cardBase: CSSProperties = {
  borderRadius: "var(--radius-xl)",
  border: "1px solid var(--neutral-alpha-medium)",
  background: "var(--surface-background)",
};

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
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

function DashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ color: "var(--neutral-on-background-weak)" }}
    >
      <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
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
        transition: "transform 200ms ease",
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
  value,
  onChange,
}: {
  value: Billing;
  onChange: (next: Billing) => void;
}) {
  const options: { id: Billing; label: string }[] = [
    { id: "monthly", label: "Monthly" },
    { id: "annual", label: "Annual" },
  ];

  return (
    <div
      role="group"
      aria-label="Billing period"
      style={{
        display: "inline-flex",
        padding: 4,
        gap: 4,
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--neutral-alpha-medium)",
        background: "var(--neutral-alpha-weak)",
      }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: "var(--radius-full)",
              padding: "8px 18px",
              minHeight: 40,
              font: "inherit",
              fontSize: 14,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: active ? "var(--neutral-on-background-strong)" : "var(--neutral-on-background-weak)",
              background: active ? "var(--surface-background)" : "transparent",
              boxShadow: active ? "0 1px 3px rgba(0, 0, 0, 0.18)" : "none",
              transition: "background 150ms ease, color 150ms ease",
            }}
          >
            {opt.label}
            {opt.id === "annual" && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--brand-alpha-weak)",
                  color: "var(--brand-on-background-strong)",
                }}
              >
                Save 20%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PricingCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const price = billing === "annual" ? tier.annual : tier.monthly;
  const headingId = `tier-${tier.id}-name`;

  const style: CSSProperties = tier.highlighted
    ? {
        ...cardBase,
        border: "2px solid var(--brand-solid-strong)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.22)",
        position: "relative",
      }
    : { ...cardBase, position: "relative" };

  return (
    <section aria-labelledby={headingId} style={{ ...style, display: "flex", flexDirection: "column" }}>
      <Column padding="32" gap="24" fillWidth style={{ flex: 1 }}>
        <Column gap="8">
          <Row gap="12" vertical="center" wrap>
            <Heading as="h3" variant="heading-strong-l" id={headingId}>
              {tier.name}
            </Heading>
            {tier.highlighted && (
              <Badge
                title="Most popular"
                arrow={false}
                effect={false}
                paddingX="12"
                paddingY="4"
                onBackground="brand-strong"
                background="brand-alpha-weak"
              />
            )}
          </Row>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {tier.tagline}
          </Text>
        </Column>

        <Column gap="4">
          <Row vertical="end" gap="8">
            <Text
              variant="display-strong-m"
              onBackground="neutral-strong"
              style={{ fontSize: 48, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
            >
              ${price}
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak" style={{ paddingBottom: 6 }}>
              per seat / month
            </Text>
          </Row>
          <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
            {billing === "annual"
              ? `Billed annually at $${price * 12} per seat`
              : "Billed monthly, cancel anytime"}
          </Text>
        </Column>

        <Button
          variant={tier.highlighted ? "primary" : "secondary"}
          size="l"
          fillWidth
          href="#"
          aria-label={`${tier.cta} — ${tier.name} plan`}
        >
          {tier.cta}
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
          aria-label={`${tier.name} plan features`}
        >
          {tier.features.map((feature) => (
            <li key={feature} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ marginTop: 2, display: "inline-flex" }}>
                <CheckIcon />
              </span>
              <Text variant="body-default-m" onBackground="neutral-strong">
                {feature}
              </Text>
            </li>
          ))}
        </ul>
      </Column>
    </section>
  );
}

function renderCell(value: CellValue): ReactNode {
  if (value === true) {
    return (
      <>
        <CheckIcon />
        <span style={visuallyHidden}>Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <DashIcon />
        <span style={visuallyHidden}>Not included</span>
      </>
    );
  }
  return <span>{value}</span>;
}

function ComparisonTable() {
  const captionId = useId();
  const cellBase: CSSProperties = {
    padding: "14px 16px",
    textAlign: "center",
    borderBottom: "1px solid var(--neutral-alpha-weak)",
    fontSize: 14,
    verticalAlign: "middle",
  };
  const labelCell: CSSProperties = {
    ...cellBase,
    textAlign: "left",
    fontWeight: 500,
    color: "var(--neutral-on-background-strong)",
    position: "sticky",
    left: 0,
    background: "var(--surface-background)",
    minWidth: 180,
  };

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      style={{
        ...cardBase,
        overflowX: "auto",
        width: "100%",
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: 640,
          borderCollapse: "separate",
          borderSpacing: 0,
          color: "var(--neutral-on-background-strong)",
        }}
      >
        <caption id={captionId} style={visuallyHidden}>
          Feature comparison across Starter, Team and Enterprise plans
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              style={{
                ...labelCell,
                fontSize: 13,
                color: "var(--neutral-on-background-weak)",
                fontWeight: 600,
                padding: "20px 16px",
              }}
            >
              Features
            </th>
            {TIERS.map((tier) => (
              <th
                key={tier.id}
                scope="col"
                style={{
                  ...cellBase,
                  padding: "20px 16px",
                  fontSize: 16,
                  fontWeight: 700,
                  background: tier.highlighted ? "var(--brand-alpha-weak)" : "transparent",
                }}
              >
                {tier.name}
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
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--neutral-on-background-weak)",
                  background: "var(--neutral-alpha-weak)",
                }}
              >
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" style={labelCell}>
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={TIERS[i].id}
                    style={{
                      ...cellBase,
                      background: TIERS[i].highlighted ? "var(--brand-alpha-weak)" : "transparent",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {renderCell(value)}
                    </span>
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

function FaqItem({
  faq,
  open,
  onToggle,
  index,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const baseId = useId();
  const buttonId = `${baseId}-button-${index}`;
  const panelId = `${baseId}-panel-${index}`;

  return (
    <div style={{ borderBottom: "1px solid var(--neutral-alpha-medium)" }}>
      <h3 style={{ margin: 0 }}>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "20px 4px",
            minHeight: 56,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            font: "inherit",
            fontSize: 17,
            fontWeight: 600,
            color: "var(--neutral-on-background-strong)",
          }}
        >
          <span>{faq.q}</span>
          <Chevron open={open} />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        style={{ padding: "0 4px 20px", maxWidth: 720 }}
      >
        <Text variant="body-default-m" onBackground="neutral-weak">
          {faq.a}
        </Text>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64" gap="80">
      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          width: 100%;
          align-items: stretch;
        }
        @media (min-width: 960px) {
          .pricing-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .pricing-grid > .is-highlighted {
            transform: translateY(-16px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
        .pricing-page button:focus-visible,
        .pricing-page [role="region"]:focus-visible {
          outline: 2px solid var(--brand-solid-strong);
          outline-offset: 2px;
        }
      `}</style>

      <Column
        className="pricing-page"
        fillWidth
        gap="80"
        horizontal="center"
        style={{ maxWidth: 1120 }}
      >
        {/* Hero */}
        <Column as="header" horizontal="center" gap="20" style={{ textAlign: "center", maxWidth: 680 }}>
          <Badge
            title="Pricing"
            arrow={false}
            effect={false}
            paddingX="12"
            paddingY="4"
            onBackground="brand-strong"
            background="brand-alpha-weak"
          />
          <Heading as="h1" variant="display-strong-l" wrap="balance">
            Simple pricing that scales with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Start with a 14-day free trial on any plan. No credit card required, and you can change
            or cancel whenever your needs change.
          </Text>
          <BillingToggle value={billing} onChange={setBilling} />
        </Column>

        {/* Tiers */}
        <section aria-labelledby="plans-heading" style={{ width: "100%" }}>
          <h2 id="plans-heading" style={visuallyHidden}>
            Plans
          </h2>
          <div className="pricing-grid">
            {TIERS.map((tier) => (
              <div key={tier.id} className={tier.highlighted ? "is-highlighted" : undefined} style={{ display: "flex" }}>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <PricingCard tier={tier} billing={billing} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison */}
        <Column as="section" aria-labelledby="compare-heading" fillWidth gap="24">
          <Column gap="8">
            <Heading as="h2" variant="heading-strong-xl" id="compare-heading">
              Compare plans
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A detailed look at what is included in each plan.
            </Text>
          </Column>
          <ComparisonTable />
        </Column>

        {/* FAQ */}
        <Column as="section" aria-labelledby="faq-heading" fillWidth gap="24" style={{ maxWidth: 800 }}>
          <Column gap="8">
            <Heading as="h2" variant="heading-strong-xl" id="faq-heading">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Can&apos;t find what you are looking for? Reach out to our team at any time.
            </Text>
          </Column>
          <div style={{ borderTop: "1px solid var(--neutral-alpha-medium)" }}>
            {FAQS.map((faq, i) => (
              <FaqItem
                key={faq.q}
                faq={faq}
                index={i}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </Column>
      </Column>
    </Column>
  );
}
```