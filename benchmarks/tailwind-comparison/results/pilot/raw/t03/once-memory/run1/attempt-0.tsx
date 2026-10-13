"use client";

import { useState } from "react";
import { Badge, Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";

type Tier = {
  id: string;
  name: string;
  monthly: number;
  yearly: number;
  blurb: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 0,
    yearly: 0,
    blurb: "For side projects and personal sites getting off the ground.",
    cta: "Start for free",
    features: ["Up to 3 projects", "1 GB storage", "Community support", "Basic analytics"],
  },
  {
    id: "team",
    name: "Team",
    monthly: 29,
    yearly: 24,
    blurb: "For growing teams that ship every week and need to collaborate.",
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "100 GB storage",
      "Priority email support",
      "Advanced analytics",
      "Role-based permissions",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: 99,
    yearly: 84,
    blurb: "For organizations with security, compliance and scale requirements.",
    cta: "Contact sales",
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
  { feature: "Team members", values: ["1", "Up to 25", "Unlimited"] },
  { feature: "Advanced analytics", values: [false, true, true] },
  { feature: "Role-based permissions", values: [false, true, true] },
  { feature: "Custom domains", values: [false, true, true] },
  { feature: "SSO and SAML", values: [false, false, true] },
  { feature: "Audit logs", values: [false, false, true] },
  { feature: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
  { feature: "Uptime SLA", values: ["None", "99.9%", "99.99%"] },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades apply immediately and we prorate the difference; downgrades take effect at the end of the current billing period.",
  },
  {
    q: "How does the free trial work?",
    a: "The Team plan includes a 14-day trial with every feature unlocked. No credit card is required to start, and we will remind you three days before the trial ends.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off the Team plan for registered nonprofits and verified students. Send us a message from your account and we will apply the discount within one business day.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards. Enterprise customers can also pay by invoice with bank transfer on net-30 terms.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your workspace stays available in read-only mode for 30 days so you can export everything. After that, your data is permanently deleted from our systems.",
  },
];

const cellStyle: React.CSSProperties = {
  padding: "14px 16px",
  textAlign: "center",
  borderBottom: "1px solid var(--neutral-alpha-weak)",
};

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <>
        <Icon name="check" size="s" onBackground="brand-strong" aria-hidden="true" />
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Included
        </span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <span aria-hidden="true">&mdash;</span>
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Not included
        </span>
      </>
    );
  }
  return <>{value}</>;
}

export default function Page() {
  const [yearly, setYearly] = useState(true);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="m" paddingY="xl" gap="xl">
      <Column maxWidth={72} fillWidth gap="xl">
        <Column horizontal="center" gap="m" align="center">
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            Simple pricing that scales with your team
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Start free, upgrade when you need more. Every plan includes unlimited viewers and a
            14-day money-back guarantee.
          </Text>
          <Row gap="8" vertical="center" horizontal="center" wrap>
            <Button
              size="s"
              variant={yearly ? "tertiary" : "primary"}
              label="Monthly"
              aria-pressed={!yearly}
              onClick={() => setYearly(false)}
            />
            <Button
              size="s"
              variant={yearly ? "primary" : "tertiary"}
              label="Yearly"
              aria-pressed={yearly}
              onClick={() => setYearly(true)}
            />
            <Text variant="label-default-s" onBackground="brand-weak">
              Save about 15% yearly
            </Text>
          </Row>
        </Column>

        <section aria-labelledby="plans-heading">
          <h2
            id="plans-heading"
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
          >
            Plans
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--static-space-24)",
              alignItems: "stretch",
            }}
          >
            {tiers.map((tier) => {
              const price = yearly ? tier.yearly : tier.monthly;
              return (
                <Column
                  key={tier.id}
                  as="article"
                  aria-labelledby={`tier-${tier.id}`}
                  background={tier.highlighted ? "brand-weak" : "surface"}
                  border={tier.highlighted ? "brand-strong" : "neutral-alpha-medium"}
                  radius="l"
                  padding="l"
                  gap="l"
                  style={tier.highlighted ? { boxShadow: "0 8px 32px var(--brand-alpha-weak)" } : undefined}
                >
                  <Column gap="8">
                    <Row horizontal="between" vertical="center" gap="8" wrap>
                      <Heading as="h3" variant="heading-strong-l" id={`tier-${tier.id}`}>
                        {tier.name}
                      </Heading>
                      {tier.highlighted && <Badge title="Most popular" arrow={false} />}
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {tier.blurb}
                    </Text>
                  </Column>
                  <Row vertical="end" gap="4">
                    <Heading as="p" variant="display-strong-m">
                      ${price}
                    </Heading>
                    <Text variant="body-default-s" onBackground="neutral-weak" paddingBottom="8">
                      per user / month
                    </Text>
                  </Row>
                  <Button
                    fillWidth
                    variant={tier.highlighted ? "primary" : "secondary"}
                    label={tier.cta}
                    href="#"
                    aria-label={`${tier.cta} on the ${tier.name} plan`}
                  />
                  <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                    {tier.features.map((f) => (
                      <Row as="li" key={f} gap="8" vertical="center">
                        <Icon name="check" size="s" onBackground="brand-strong" aria-hidden="true" />
                        <Text variant="body-default-s">{f}</Text>
                      </Row>
                    ))}
                  </Column>
                </Column>
              );
            })}
          </div>
        </section>

        <Column as="section" gap="m" aria-labelledby="compare-heading">
          <Heading as="h2" variant="display-strong-xs" id="compare-heading">
            Compare plans
          </Heading>
          <div
            role="region"
            aria-label="Feature comparison table, scrollable"
            tabIndex={0}
            style={{
              overflowX: "auto",
              border: "1px solid var(--neutral-alpha-medium)",
              borderRadius: "var(--radius-l)",
            }}
          >
            <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 14 }}>
              <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                Feature comparison across Starter, Team and Enterprise plans
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
                          position: "relative",
                          background: tiers[i].highlighted ? "var(--brand-alpha-weak)" : undefined,
                        }}
                      >
                        <Cell value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Column>

        <Column as="section" gap="m" aria-labelledby="faq-heading" maxWidth={48} style={{ alignSelf: "center", width: "100%" }}>
          <Heading as="h2" variant="display-strong-xs" id="faq-heading">
            Frequently asked questions
          </Heading>
          <Column gap="8">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <Column
                  key={item.q}
                  background="surface"
                  border="neutral-alpha-medium"
                  radius="m"
                  overflow="hidden"
                >
                  <h3 style={{ margin: 0 }}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      style={{
                        all: "unset",
                        boxSizing: "border-box",
                        width: "100%",
                        cursor: "pointer",
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        fontWeight: 600,
                        fontSize: 16,
                      }}
                    >
                      <span>{item.q}</span>
                      <Icon name={isOpen ? "chevronUp" : "chevronDown"} size="s" aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    hidden={!isOpen}
                    style={{ padding: isOpen ? "0 20px 16px" : 0 }}
                  >
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {item.a}
                    </Text>
                  </div>
                </Column>
              );
            })}
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
