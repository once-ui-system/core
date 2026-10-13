```tsx
"use client";

import { useId, useState } from "react";
import { Check, ChevronDown, Minus, Sparkles } from "lucide-react";

type Billing = "monthly" | "yearly";

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number; // per month, billed annually
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
      "Email support",
      "Community access",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For growing teams that need speed and visibility.",
    monthly: 39,
    yearly: 31,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "500,000 monthly events",
      "90-day data retention",
      "Priority chat support",
      "Custom dashboards",
      "Role-based access control",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For organizations with advanced security needs.",
    monthly: 129,
    yearly: 103,
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Unlimited projects",
      "10M monthly events",
      "1-year data retention",
      "Dedicated success manager",
      "SSO & SAML",
      "99.99% uptime SLA",
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
      { feature: "Monthly events", values: ["10,000", "500,000", "10M"] },
      { feature: "Team members", values: ["1", "10", "Unlimited"] },
      { feature: "Data retention", values: ["7 days", "90 days", "1 year"] },
    ],
  },
  {
    group: "Features",
    rows: [
      { feature: "Custom dashboards", values: [false, true, true] },
      { feature: "Scheduled reports", values: [false, true, true] },
      { feature: "API access", values: [true, true, true] },
      { feature: "Audit log", values: [false, false, true] },
    ],
  },
  {
    group: "Security & support",
    rows: [
      { feature: "Role-based access control", values: [false, true, true] },
      { feature: "SSO & SAML", values: [false, false, true] },
      { feature: "Support channel", values: ["Email", "Priority chat", "Dedicated manager"] },
      { feature: "Uptime SLA", values: ["—", "99.9%", "99.99%"] },
    ],
  },
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access to the Growth plan for 14 days, no credit card required. When the trial ends, you can pick a plan or your workspace moves to a read-only state for 30 days so you never lose data.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. Upgrades take effect immediately and we prorate the difference. Downgrades apply at the start of your next billing cycle, and we'll let you know if your usage exceeds the new plan's limits.",
  },
  {
    q: "What happens if I go over my event limit?",
    a: "We never drop your data. If you exceed your monthly events, we'll notify you and give you a 7-day grace period to upgrade. After that, additional events are billed at a flat overage rate of $0.40 per 1,000.",
  },
  {
    q: "Do you offer discounts for startups or nonprofits?",
    a: "We do. Eligible startups get 50% off their first year, and registered nonprofits receive 30% off any plan. Contact our team with a few details about your organization and we'll set it up.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major credit and debit cards, plus invoicing with net-30 terms on annual Scale plans. Prices are in USD and exclude applicable taxes.",
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
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <div
        role="radiogroup"
        aria-label="Billing period"
        className="inline-flex rounded-full bg-slate-100 p-1"
      >
        {options.map((opt) => {
          const active = billing === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
        Save 20% with yearly billing
      </span>
    </div>
  );
}

function TierCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const price = billing === "monthly" ? tier.monthly : tier.yearly;
  const headingId = useId();
  const { highlighted } = tier;

  return (
    <section
      aria-labelledby={headingId}
      className={`relative flex flex-col rounded-3xl p-8 ${
        highlighted
          ? "bg-slate-900 text-white shadow-2xl ring-2 ring-indigo-500 lg:-my-4 lg:py-12"
          : "bg-white text-slate-900 ring-1 ring-slate-200"
      }`}
    >
      {highlighted && (
        <p className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-indigo-500 px-3.5 py-1 text-xs font-semibold text-white">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Most popular
        </p>
      )}
      <h3 id={headingId} className="text-lg font-semibold">
        {tier.name}
      </h3>
      <p className={`mt-2 text-sm ${highlighted ? "text-slate-300" : "text-slate-600"}`}>
        {tier.tagline}
      </p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight">${price}</span>
        <span className={`text-sm ${highlighted ? "text-slate-300" : "text-slate-600"}`}>
          /month
        </span>
      </p>
      <p
        className={`mt-1 min-h-5 text-xs ${highlighted ? "text-slate-400" : "text-slate-500"}`}
        aria-live="polite"
      >
        {billing === "yearly"
          ? `Billed annually at $${tier.yearly * 12}`
          : "Billed monthly, cancel anytime"}
      </p>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        aria-label={`${tier.cta} — ${tier.name} plan`}
        className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
          highlighted
            ? "bg-indigo-500 text-white hover:bg-indigo-400"
            : "bg-slate-900 text-white hover:bg-slate-700"
        }`}
      >
        {tier.cta}
      </a>
      <ul className="mt-8 space-y-3 text-sm">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-3">
            <Check
              className={`mt-0.5 size-5 shrink-0 ${highlighted ? "text-indigo-300" : "text-indigo-600"}`}
              aria-hidden="true"
            />
            <span className={highlighted ? "text-slate-100" : "text-slate-700"}>{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
      <table className="w-full min-w-[40rem] border-collapse bg-white text-left">
        <caption className="sr-only">Feature comparison across Starter, Growth and Scale plans</caption>
        <thead>
          <tr className="border-b border-slate-200">
            <th scope="col" className="w-2/5 px-4 py-4 text-sm font-semibold text-slate-900 sm:px-6">
              Features
            </th>
            {TIERS.map((t) => (
              <th
                key={t.id}
                scope="col"
                className={`px-4 py-4 text-center text-sm font-semibold sm:px-6 ${
                  t.highlighted ? "bg-indigo-50 text-indigo-700" : "text-slate-900"
                }`}
              >
                {t.name}
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
                className="bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-6"
              >
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.feature} className="border-t border-slate-100">
                <th
                  scope="row"
                  className="px-4 py-3.5 text-sm font-normal text-slate-700 sm:px-6"
                >
                  {row.feature}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={TIERS[i].id}
                    className={`px-4 py-3.5 text-center sm:px-6 ${
                      TIERS[i].highlighted ? "bg-indigo-50/60" : ""
                    }`}
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
      {FAQS.map((item, i) => {
        const open = openIndex === i;
        const buttonId = `${baseId}-button-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:px-6"
              >
                {item.q}
                <ChevronDown
                  className={`size-5 shrink-0 text-slate-500 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="px-5 pb-5 text-sm leading-6 text-slate-600 sm:px-6"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("yearly");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-5 text-lg text-slate-600 text-pretty">
            Start with a 14-day free trial on any plan. No credit card, no setup fees, and you can
            switch or cancel whenever you like.
          </p>
          <div className="mt-8">
            <BillingToggle billing={billing} onChange={setBilling} />
          </div>
        </header>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch lg:gap-6">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} billing={billing} />
          ))}
        </div>

        <section aria-labelledby="compare-heading" className="mt-28">
          <h2
            id="compare-heading"
            className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Compare plans in detail
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Every plan includes unlimited dashboards viewers, encrypted storage and a public API.
          </p>
          <div className="mt-10">
            <ComparisonTable />
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="mx-auto mt-28 max-w-3xl">
          <h2
            id="faq-heading"
            className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-3 text-center text-slate-600">
            Can&apos;t find what you&apos;re looking for? Email us at support@example.com.
          </p>
          <div className="mt-10">
            <Faq />
          </div>
        </section>
      </div>
    </main>
  );
}
```