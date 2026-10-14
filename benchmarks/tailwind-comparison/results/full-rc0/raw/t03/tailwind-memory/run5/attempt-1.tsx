"use client";

import { useId, useState } from "react";
import { Check, ChevronDown, Minus } from "lucide-react";

type Billing = "monthly" | "yearly";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
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
    yearly: 9,
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
    tagline: "For growing teams that need to move fast together.",
    monthly: 39,
    yearly: 31,
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
    tagline: "For organizations with advanced security needs.",
    monthly: 129,
    yearly: 105,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Unlimited everything",
      "Custom data retention",
      "SAML single sign-on",
      "Audit logs & SLA",
      "Dedicated success manager",
    ],
  },
];

type CellValue = boolean | string;

interface ComparisonRow {
  label: string;
  values: CellValue[];
}

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { label: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Monthly events", values: ["10,000", "500,000", "10M+"] },
      { label: "Team members", values: ["1", "15", "Unlimited"] },
      { label: "Data retention", values: ["7 days", "90 days", "Custom"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { label: "Shared dashboards", values: [false, true, true] },
      { label: "Role-based access control", values: [false, true, true] },
      { label: "Comments & annotations", values: [true, true, true] },
    ],
  },
  {
    group: "Security & support",
    rows: [
      { label: "SAML single sign-on", values: [false, false, true] },
      { label: "Audit logs", values: [false, false, true] },
      { label: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
      { label: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
    ],
  },
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "Can I try Northwind before paying?",
    a: "Yes. Every paid plan includes a 14-day free trial with full access to its features. You don't need a credit card to start, and we'll remind you before the trial ends.",
  },
  {
    q: "How does yearly billing work?",
    a: "Choosing yearly billing gives you roughly 20% off compared with paying monthly. You're charged once per year, and you can switch back to monthly at the next renewal.",
  },
  {
    q: "What happens if I go over my event limit?",
    a: "We never drop your data. If you exceed your monthly events, we'll email you and keep collecting for a grace period so you can upgrade or trim usage without losing anything.",
  },
  {
    q: "Can I change or cancel my plan at any time?",
    a: "Absolutely. Upgrades take effect immediately and are prorated. Downgrades and cancellations apply at the end of your current billing period, and you can export your data whenever you like.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off the Team plan for registered nonprofits and verified students. Reach out to our support team with proof of status and we'll apply the discount within one business day.",
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <>
        <Check className="mx-auto size-5 text-indigo-600" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus className="mx-auto size-5 text-slate-300" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm font-medium text-slate-700">{value}</span>;
}

function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
}) {
  const uid = useId();
  const buttonId = `${uid}-button`;
  const panelId = `${uid}-panel`;
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-1 py-5 text-left text-base font-semibold text-slate-900 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-lg"
        >
          <span>{faq.q}</span>
          <ChevronDown
            aria-hidden="true"
            className={
              open
                ? "size-5 shrink-0 rotate-180 text-slate-500 transition-transform duration-200"
                : "size-5 shrink-0 text-slate-500 transition-transform duration-200"
            }
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="px-1 pb-5 pr-8 text-base leading-relaxed text-slate-600"
      >
        {faq.a}
      </div>
    </div>
  );
}

export default function Page() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleClass = (active: boolean): string =>
    active
      ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      : "rounded-full px-5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-indigo-50 to-transparent"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            14-day free trial on every plan
          </p>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-4 text-pretty text-lg text-slate-600">
            Northwind turns raw product events into answers. Pick the plan that fits today and
            upgrade whenever you outgrow it.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div
              role="group"
              aria-label="Billing period"
              className="inline-flex rounded-full bg-slate-100 p-1"
            >
              <button
                type="button"
                aria-pressed={billing === "monthly"}
                onClick={() => setBilling("monthly")}
                className={toggleClass(billing === "monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={billing === "yearly"}
                onClick={() => setBilling("yearly")}
                className={toggleClass(billing === "yearly")}
              >
                Yearly
              </button>
            </div>
            <p className="text-sm text-slate-500" aria-live="polite">
              {billing === "yearly"
                ? "Billed annually — you save about 20%."
                : "Billed monthly — switch to yearly and save about 20%."}
            </p>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section aria-labelledby="plans-heading" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 id="plans-heading" className="sr-only">
          Plans
        </h2>
        <ul className="grid items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
          {TIERS.map((tier) => {
            const price = billing === "yearly" ? tier.yearly : tier.monthly;
            const cardClass = tier.highlighted
              ? "relative flex flex-col rounded-2xl bg-slate-900 p-8 text-white shadow-2xl ring-2 ring-indigo-500 lg:-my-4 lg:py-12"
              : "relative flex flex-col rounded-2xl bg-white p-8 text-slate-900 shadow-sm ring-1 ring-slate-200";
            const taglineClass = tier.highlighted
              ? "mt-2 text-sm text-slate-300"
              : "mt-2 text-sm text-slate-600";
            const subtleClass = tier.highlighted
              ? "text-slate-300"
              : "text-slate-500";
            const ctaClass = tier.highlighted
              ? "mt-6 block rounded-lg bg-indigo-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
              : "mt-6 block rounded-lg bg-indigo-50 px-4 py-3 text-center text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
            return (
              <li key={tier.id} className={cardClass}>
                {tier.highlighted ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <p className={taglineClass}>{tier.tagline}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">${price}</span>
                  <span className={`text-sm ${subtleClass}`}>/month</span>
                </p>
                <p className={`mt-1 text-xs ${subtleClass}`}>
                  {billing === "yearly"
                    ? `Billed $${price * 12} per year`
                    : "Billed monthly, cancel anytime"}
                </p>
                <button type="button" className={ctaClass}>
                  {tier.cta}
                  <span className="sr-only">, {tier.name} plan</span>
                </button>
                <ul className="mt-8 space-y-3 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check
                        aria-hidden="true"
                        className={
                          tier.highlighted
                            ? "mt-0.5 size-5 shrink-0 text-indigo-400"
                            : "mt-0.5 size-5 shrink-0 text-indigo-600"
                        }
                      />
                      <span className={tier.highlighted ? "text-slate-200" : "text-slate-700"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Comparison table */}
      <section
        aria-labelledby="compare-heading"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
      >
        <h2 id="compare-heading" className="text-center text-3xl font-bold tracking-tight">
          Compare plans in detail
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
          Every feature, side by side, so there are no surprises at checkout.
        </p>

        <div
          className="mt-10 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
          tabIndex={0}
          role="region"
          aria-label="Feature comparison table, scrollable"
        >
          <table className="w-full min-w-160 border-collapse text-left">
            <caption className="sr-only">
              Feature comparison across the Starter, Team and Enterprise plans
            </caption>
            <thead>
              <tr className="border-b border-slate-200">
                <th
                  scope="col"
                  className="w-2/5 px-4 py-4 text-sm font-semibold text-slate-500 sm:px-6"
                >
                  Features
                </th>
                {TIERS.map((tier) => (
                  <th
                    key={tier.id}
                    scope="col"
                    className={
                      tier.highlighted
                        ? "bg-indigo-50 px-4 py-4 text-center text-sm font-semibold text-indigo-700 sm:px-6"
                        : "px-4 py-4 text-center text-sm font-semibold text-slate-900 sm:px-6"
                    }
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((group) => (
                <ComparisonGroupRows key={group.group} group={group} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16"
      >
        <h2 id="faq-heading" className="text-center text-3xl font-bold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="mt-10 rounded-2xl bg-white px-5 shadow-sm ring-1 ring-slate-200 sm:px-8">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={faq.q}
              faq={faq}
              open={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-600">
          Still have questions? Email us at{" "}
          <a
            href="mailto:hello@northwind.example"
            className="font-semibold text-indigo-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            hello@northwind.example
          </a>
          .
        </p>
      </section>
    </main>
  );
}

function ComparisonGroupRows({ group }: { group: ComparisonGroup }) {
  return (
    <>
      <tr>
        <th
          colSpan={4}
          scope="colgroup"
          className="bg-slate-50 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-6"
        >
          {group.group}
        </th>
      </tr>
      {group.rows.map((row) => (
        <tr key={row.label} className="border-t border-slate-100">
          <th scope="row" className="px-4 py-3.5 text-sm font-medium text-slate-700 sm:px-6">
            {row.label}
          </th>
          {TIERS.map((tier, i) => (
            <td
              key={tier.id}
              className={
                tier.highlighted
                  ? "bg-indigo-50/60 px-4 py-3.5 text-center sm:px-6"
                  : "px-4 py-3.5 text-center sm:px-6"
              }
            >
              <CellContent value={row.values[i] ?? false} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
