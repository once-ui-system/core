```tsx
"use client";

import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { Column, Row, Heading, Text } from "@once-ui-system/core";

type Billing = "monthly" | "yearly";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number; // per month, billed annually
  cta: string;
  highlighted: boolean;
  perks: string[];
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For individuals shipping their first side project.",
    monthly: 12,
    yearly: 9,
    cta: "Start free trial",
    highlighted: false,
    perks: [
      "Up to 3 active projects",
      "5 GB asset storage",
      "Community support",
      "7-day activity history",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For growing teams that need to move fast together.",
    monthly: 36,
    yearly: 29,
    cta: "Start free trial",
    highlighted: true,
    perks: [
      "Unlimited projects",
      "100 GB asset storage",
      "Priority email support",
      "90-day activity history",
      "Roles and granular permissions",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with advanced security needs.",
    monthly: 89,
    yearly: 74,
    cta: "Contact sales",
    highlighted: false,
    perks: [
      "Everything in Team",
      "1 TB asset storage",
      "Dedicated success manager",
      "Unlimited activity history",
      "SAML single sign-on and audit logs",
    ],
  },
];

type CellValue = boolean | string;

interface FeatureRow {
  label: string;
  values: [CellValue, CellValue, CellValue];
}

interface FeatureGroup {
  group: string;
  rows: FeatureRow[];
}

const COMPARISON: FeatureGroup[] = [
  {
    group: "Workspace",
    rows: [
      { label: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { label: "Asset storage", values: ["5 GB", "100 GB", "1 TB"] },
      { label: "Custom domains", values: [false, true, true] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { label: "Shared comments", values: [true, true, true] },
      { label: "Roles and permissions", values: [false, true, true] },
      { label: "Activity history", values: ["7 days", "90 days", "Unlimited"] },
      { label: "Guest reviewers", values: [false, "10 seats", "Unlimited"] },
    ],
  },
  {
    group: "Security",
    rows: [
      { label: "Two-factor authentication", values: [true, true, true] },
      { label: "SAML single sign-on", values: [false, false, true] },
      { label: "Audit logs", values: [false, false, true] },
      { label: "Data residency options", values: [false, false, true] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Community forum", values: [true, true, true] },
      { label: "Priority email support", values: [false, true, true] },
      { label: "Dedicated success manager", values: [false, false, true] },
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
    q: "How does the free trial work?",
    a: "Every paid plan includes a 14-day free trial with full access to its features. You don't need to enter a credit card to start, and we'll remind you three days before the trial ends.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and are prorated, while downgrades apply at the start of your next billing cycle.",
  },
  {
    q: "What happens if I go over my storage limit?",
    a: "We never delete your files. If you pass your plan's storage limit, uploads pause and we'll email your workspace owners so you can free up space or move to a larger plan.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off any plan for registered nonprofits, open-source maintainers and verified students. Send us a short note from your organization email and we'll apply the discount within one business day.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual plans are billed once per year at a discounted monthly rate, which saves roughly 20% compared to paying month to month. You can cancel renewal at any time and keep access until the period ends.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with net-30 terms and bank transfer.",
  },
];

const colors = {
  border: "var(--neutral-alpha-medium)",
  borderStrong: "var(--neutral-alpha-strong)",
  surface: "var(--surface-background)",
  accent: "var(--brand-solid-strong)",
  accentWeak: "var(--brand-alpha-weak)",
  accentText: "var(--brand-on-background-strong)",
  onSolid: "var(--brand-on-solid-strong)",
  muted: "var(--neutral-on-background-weak)",
  text: "var(--neutral-on-background-strong)",
};

const focusRing: CSSProperties = {
  outline: "none",
};

function CheckIcon({ title }: { title: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      role="img"
      aria-label={title}
      focusable="false"
      style={{ color: colors.accent, flexShrink: 0 }}
    >
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DecorativeCheck() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      style={{ color: colors.accent, flexShrink: 0, marginTop: 2 }}
    >
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        fill="none"
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
      width="20"
      height="20"
      viewBox="0 0 20 20"
      role="img"
      aria-label="Not included"
      focusable="false"
      style={{ color: colors.muted, opacity: 0.6 }}
    >
      <path d="M6 10h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Cell({ value }: { value: CellValue }) {
  if (value === true) return <CheckIcon title="Included" />;
  if (value === false) return <DashIcon />;
  return (
    <Text variant="body-default-s" onBackground="neutral-strong">
      {value}
    </Text>
  );
}

function PricingCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const price = billing === "monthly" ? tier.monthly : tier.yearly;
  const headingId = `tier-${tier.id}`;

  const buttonStyle: CSSProperties = {
    width: "100%",
    minHeight: 44,
    padding: "0 20px",
    borderRadius: 12,
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    border: tier.highlighted ? "1px solid transparent" : `1px solid ${colors.borderStrong}`,
    background: tier.highlighted ? colors.accent : "transparent",
    color: tier.highlighted ? colors.onSolid : colors.text,
  };

  return (
    <article
      aria-labelledby={headingId}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: 28,
        borderRadius: 20,
        background: colors.surface,
        border: tier.highlighted ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
        boxShadow: tier.highlighted ? "0 12px 40px -12px var(--brand-alpha-strong)" : "none",
      }}
    >
      {tier.highlighted && (
        <span
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "4px 14px",
            borderRadius: 999,
            background: colors.accent,
            color: colors.onSolid,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.4,
            whiteSpace: "nowrap",
          }}
        >
          Most popular
        </span>
      )}

      <Column gap="8">
        <Heading as="h3" id={headingId} variant="heading-strong-l">
          {tier.name}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {tier.tagline}
        </Text>
      </Column>

      <Column gap="4">
        <Row vertical="end" gap="8">
          <Text variant="display-strong-s" onBackground="neutral-strong">
            ${price}
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak" style={{ paddingBottom: 6 }}>
            per user / month
          </Text>
        </Row>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {billing === "yearly"
            ? `Billed annually ($${price * 12} per user)`
            : "Billed monthly, cancel anytime"}
        </Text>
      </Column>

      <button type="button" style={buttonStyle} aria-label={`${tier.cta} – ${tier.name} plan`}>
        {tier.cta}
      </button>

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
        {tier.perks.map((perk) => (
          <li key={perk} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <DecorativeCheck />
            <Text variant="body-default-s" onBackground="neutral-strong">
              {perk}
            </Text>
          </li>
        ))}
      </ul>
    </article>
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
    { value: "yearly", label: "Yearly" },
  ];

  return (
    <div
      role="group"
      aria-label="Billing period"
      style={{
        display: "inline-flex",
        padding: 4,
        gap: 4,
        borderRadius: 999,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
      }}
    >
      {options.map((opt) => {
        const active = billing === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            style={{
              minHeight: 40,
              padding: "0 18px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              background: active ? colors.accent : "transparent",
              color: active ? colors.onSolid : colors.text,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {opt.label}
            {opt.value === "yearly" && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: active ? "rgba(255,255,255,0.22)" : colors.accentWeak,
                  color: active ? colors.onSolid : colors.accentText,
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

function ComparisonTable() {
  const captionId = useId();
  const tierNames = TIERS.map((t) => t.name);

  const thStyle: CSSProperties = {
    padding: "16px 16px",
    textAlign: "center",
    fontSize: 15,
    fontWeight: 700,
    color: colors.text,
    borderBottom: `1px solid ${colors.borderStrong}`,
    background: colors.surface,
  };

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      style={{
        overflowX: "auto",
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: 640,
          borderCollapse: "collapse",
        }}
      >
        <caption
          id={captionId}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          Feature comparison across Starter, Team and Enterprise plans
        </caption>
        <thead>
          <tr>
            <th scope="col" style={{ ...thStyle, textAlign: "left", width: "34%" }}>
              <span style={{ position: "absolute", left: -9999 }}>Feature</span>
            </th>
            {tierNames.map((name, i) => (
              <th
                key={name}
                scope="col"
                style={{
                  ...thStyle,
                  background: i === 1 ? colors.accentWeak : colors.surface,
                  color: i === 1 ? colors.accentText : colors.text,
                }}
              >
                {name}
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
                  padding: "20px 16px 8px",
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: colors.muted,
                }}
              >
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 500,
                    color: colors.text,
                    borderTop: `1px solid ${colors.border}`,
                  }}
                >
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={`${row.label}-${i}`}
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      borderTop: `1px solid ${colors.border}`,
                      background: i === 1 ? colors.accentWeak : "transparent",
                    }}
                  >
                    <span style={{ display: "inline-flex", justifyContent: "center" }}>
                      <Cell value={value} />
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
  baseId,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
  baseId: string;
}) {
  const buttonId = `${baseId}-button`;
  const panelId = `${baseId}-panel`;

  return (
    <div style={{ borderBottom: `1px solid ${colors.border}` }}>
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            minHeight: 56,
            padding: "16px 4px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
            ...focusRing,
          }}
        >
          <span>{faq.q}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
            style={{
              flexShrink: 0,
              transition: "transform 150ms ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <path
              d="M5 8l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        style={{ padding: "0 4px 20px" }}
      >
        <Text variant="body-default-m" onBackground="neutral-weak">
          {faq.a}
        </Text>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqBase = useId();

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="48" gap="64">
      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          width: 100%;
        }
        @media (min-width: 900px) {
          .pricing-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            align-items: stretch;
          }
          .pricing-grid > .is-highlighted {
            transform: translateY(-12px);
          }
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
        gap="64"
        horizontal="center"
        style={{ maxWidth: 1120 }}
      >
        <Column as="header" horizontal="center" gap="16" align="center" style={{ maxWidth: 680 }}>
          <Text variant="label-default-s" onBackground="brand-weak">
            Pricing
          </Text>
          <Heading as="h1" variant="display-strong-m" align="center" wrap="balance">
            Simple pricing that scales with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" align="center">
            Start with a 14-day free trial on any plan. No credit card required, and you can change
            or cancel whenever you like.
          </Text>
          <BillingToggle billing={billing} onChange={setBilling} />
        </Column>

        <section aria-labelledby="plans-heading" style={{ width: "100%" }}>
          <h2
            id="plans-heading"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
            }}
          >
            Plans
          </h2>
          <div className="pricing-grid">
            {TIERS.map((tier) => (
              <div key={tier.id} className={tier.highlighted ? "is-highlighted" : undefined}>
                <PricingCard tier={tier} billing={billing} />
              </div>
            ))}
          </div>
          <p aria-live="polite" style={{ position: "absolute", left: -9999 }}>
            Showing {billing} billing prices.
          </p>
        </section>

        <Column as="section" fillWidth gap="24" aria-labelledby="compare-heading">
          <Column gap="8">
            <Heading as="h2" id="compare-heading" variant="heading-strong-xl">
              Compare plans
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              A closer look at what is included in each plan.
            </Text>
          </Column>
          <ComparisonTable />
        </Column>

        <Column
          as="section"
          fillWidth
          gap="24"
          aria-labelledby="faq-heading"
          style={{ maxWidth: 800 }}
        >
          <Column gap="8">
            <Heading as="h2" id="faq-heading" variant="heading-strong-xl">
              Frequently asked questions
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Can't find what you're looking for? Reach out to our team at support@example.com.
            </Text>
          </Column>
          <div style={{ borderTop: `1px solid ${colors.border}` }}>
            {FAQS.map((faq, i) => (
              <FaqItem
                key={faq.q}
                faq={faq}
                baseId={`${faqBase}-${i}`}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </Column>
      </Column>
    </Column>
  );
}
```