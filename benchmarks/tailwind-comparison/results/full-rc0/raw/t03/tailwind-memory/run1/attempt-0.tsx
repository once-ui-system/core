"use client";

import { useId, useState } from "react";
import { Check, Minus, ChevronDown, Sparkles } from "lucide-react";

type Billing = "monthly" | "yearly";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number; // per month, billed annually
  cta: string;
  highlighted?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo builders shipping their first side project.",
    monthly: 12,
    yearly: 9,
    cta: "Start free trial",
    features: [
      "3 active projects",
      "10,000 monthly events",
      "7-day data retention",
      "Email support",
      "Community Slack access",
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
      "Priority chat support",
      "Custom dashboards",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with advanced security and scale needs.",
    monthly: 129,
    yearly: 104,
    cta: "Talk to sales",
    features: [
      "Unlimited everything",
      "Unlimited data retention",
      "SAML single sign-on & SCIM",
      "Audit logs & SOC 2 report",
      "99.99% uptime SLA",
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
    group: "Usage",
    rows: [
      { label: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Monthly events", values: ["10,000", "500,000", "Custom"] },
      { label: "Data retention", values: ["7 days", "90 days", "Unlimited"] },
      { label: "Team members", values: ["1", "25", "Unlimited"] },
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
    group: "Security & compliance",
    rows: [
      { label: "Two-factor authentication", values: [true, true, true] },
      { label: "SAML single sign-on", values: [false, false, true] },
      { label: "Audit logs", values: [false, false, true] },
      { label: "SOC 2 Type II report", values: [false, false, true] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Support channel", values: ["Email", "Priority chat", "Dedicated manager"] },
      { label: "First response time", values: ["48 hours", "4 hours", "1 hour"] },
      { label: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Can I try Beacon before paying?",
    a: "Yes. Every paid plan starts with a 14-day free trial, no credit card required. You get full access to the features of the plan you pick, and you can switch tiers at any point during the trial.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual plans are billed once per year and save you about 20% compared with paying monthly. If you cancel mid-year, you keep access until the end of the period you've paid for.",
  },
  {
    q: "What happens if I go over my event limit?",
    a: "We never drop your data. If you exceed your monthly events we'll email you at 80% and 100% of your quota, and you can upgrade or buy an event pack. Overages are billed at $0.40 per additional 1,000 events.",
  },
  {
    q: "Can I change or cancel my plan later?",
    a: "Absolutely. Upgrades take effect immediately and are prorated. Downgrades and cancellations take effect at the end of your current billing period, and you can export all of your data at any time.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We do. Registered nonprofits and verified students get 50% off the Team plan. Contact our support team with proof of status and we'll apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit cards, and Enterprise customers can pay by invoice with net-30 terms or by bank transfer.",
  },
];

function Cell({ value, tierName }: { value: CellValue; tierName: string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-slate-800">{value}</span>;
  }
  if (value) {
    return (
      <>
        <Check aria-hidden="true" className="mx-auto h-5 w-5 text-indigo-600" />
        <span className="sr-only">Included in {tierName}</span>
      </>
    );
  }
  return (
    <>
      <Minus aria-hidden="true" className="mx-auto h-5 w-5 text-slate-300" />
      <span className="sr-only">Not included in {tierName}</span>
    </>
  );
}

function FaqEntry({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const uid = useId();
  const buttonId = `${uid}-button`;
  const panelId = `${uid}-panel`;
  return (
    <div className="border-b border-slate-200">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-slate-900 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span>{item.q}</span>
          <ChevronDown
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-5 pr-9 text-sm leading-6 text-slate-600"
      >
        {item.a}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Pricing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Simple pricing that scales with your product
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Beacon turns raw product events into answers. Pick a plan, start a 14-day trial, and
            only pay when you&apos;re sure it fits.
          </p>

          <div
            role="group"
            aria-label="Billing period"
            className="mt-10 inline-flex rounded-full bg-slate-200/70 p-1"
          >
            {(["monthly", "yearly"] as const).map((option) => {
              const active = billing === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setBilling(option)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {option === "monthly" ? "Monthly" : "Yearly"}
                  {option === "yearly" && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Save 20%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tiers */}
        <section aria-labelledby="plans-heading" className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:pt-16">
          <h2 id="plans-heading" className="sr-only">
            Plans
          </h2>
          <ul className="grid items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
            {TIERS.map((tier) => {
              const price = billing === "monthly" ? tier.monthly : tier.yearly;
              const hl = tier.highlighted === true;
              return (
                <li
                  key={tier.id}
                  className={`relative flex flex-col rounded-3xl p-8 ${
                    hl
                      ? "bg-slate-900 text-white shadow-2xl ring-2 ring-indigo-500 lg:-my-4 lg:py-12"
                      : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  }`}
                >
                  {hl && (
                    <p className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                      Most popular
                    </p>
                  )}
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className={`mt-2 text-sm leading-6 ${hl ? "text-slate-300" : "text-slate-600"}`}>
                    {tier.tagline}
                  </p>
                  <p className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">${price}</span>
                    <span className={`text-sm ${hl ? "text-slate-300" : "text-slate-600"}`}>
                      /month
                    </span>
                  </p>
                  <p
                    aria-live="polite"
                    className={`mt-1 min-h-5 text-xs ${hl ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {billing === "yearly"
                      ? `Billed annually ($${tier.yearly * 12}/year)`
                      : "Billed monthly, cancel anytime"}
                  </p>
                  <a
                    href={`#${tier.id}`}
                    aria-label={`${tier.cta} — ${tier.name} plan`}
                    className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                      hl
                        ? "bg-indigo-500 text-white hover:bg-indigo-400"
                        : "bg-slate-900 text-white hover:bg-slate-700"
                    }`}
                  >
                    {tier.cta}
                  </a>
                  <ul
                    className={`mt-8 space-y-3 border-t pt-8 text-sm ${
                      hl ? "border-slate-700 text-slate-200" : "border-slate-200 text-slate-700"
                    }`}
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          aria-hidden="true"
                          className={`mt-0.5 h-5 w-5 shrink-0 ${hl ? "text-indigo-300" : "text-indigo-600"}`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Comparison */}
        <section
          aria-labelledby="compare-heading"
          className="mx-auto max-w-6xl px-4 pt-24 sm:px-6"
        >
          <h2 id="compare-heading" className="text-center text-3xl font-bold tracking-tight">
            Compare plans in detail
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Every feature, limit and service level side by side.
          </p>

          <div className="mt-10 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">Feature comparison across Starter, Team and Enterprise plans</caption>
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="w-2/5 px-6 py-4 text-sm font-semibold text-slate-500">
                    Features
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier.id}
                      scope="col"
                      className={`px-4 py-4 text-center text-sm font-semibold ${
                        tier.highlighted ? "bg-indigo-50 text-indigo-700" : "text-slate-900"
                      }`}
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {COMPARISON.map((group) => (
                <tbody key={group.group}>
                  <tr className="bg-slate-50">
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {group.group}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-t border-slate-100">
                      <th scope="row" className="px-6 py-4 text-sm font-medium text-slate-700">
                        {row.label}
                      </th>
                      {row.values.map((value, i) => (
                        <td
                          key={TIERS[i].id}
                          className={`px-4 py-4 text-center ${TIERS[i].highlighted ? "bg-indigo-50/60" : ""}`}
                        >
                          <Cell value={value} tierName={TIERS[i].name} />
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
        <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <h2 id="faq-heading" className="text-center text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-center text-slate-600">
            Can&apos;t find what you need? Email us at support@beacon.example and a human will reply.
          </p>
          <div className="mt-10 border-t border-slate-200">
            {FAQS.map((item, index) => (
              <FaqEntry
                key={item.q}
                item={item}
                open={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        © 2025 Beacon Analytics, Inc. Prices in USD. Taxes may apply.
      </footer>
    </div>
  );
}
