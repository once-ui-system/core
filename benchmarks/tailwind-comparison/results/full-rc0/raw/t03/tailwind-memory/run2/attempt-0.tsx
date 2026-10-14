"use client";

import { useId, useState } from "react";
import { Check, Minus, ChevronDown, Sparkles } from "lucide-react";

type BillingCycle = "monthly" | "yearly";

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
    tagline: "For solo builders shipping their first project.",
    monthly: 12,
    yearly: 9,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "3 active projects",
      "5 GB asset storage",
      "Community support",
      "7-day deploy history",
      "Basic analytics",
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
      "100 GB asset storage",
      "Priority email support",
      "90-day deploy history",
      "Advanced analytics & alerts",
      "Role-based permissions",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with security and scale requirements.",
    monthly: 129,
    yearly: 105,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Unlimited everything",
      "1 TB asset storage",
      "Dedicated success manager",
      "Unlimited deploy history",
      "SAML single sign-on",
      "Audit logs & 99.99% SLA",
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
      { feature: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { feature: "Asset storage", values: ["5 GB", "100 GB", "1 TB"] },
      { feature: "Monthly build minutes", values: ["500", "5,000", "50,000"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared workspaces", values: [false, true, true] },
      { feature: "Role-based permissions", values: [false, true, true] },
      { feature: "Review comments", values: [true, true, true] },
      { feature: "Deploy history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Security & support",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SAML single sign-on", values: [false, false, true] },
      { feature: "Audit logs", values: [false, false, true] },
      { feature: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
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
    q: "Can I try Northwind before I pay?",
    a: "Yes. Every paid plan includes a 14-day free trial with full access to its features. You don't need a credit card to start, and we'll remind you three days before the trial ends.",
  },
  {
    q: "How does yearly billing work?",
    a: "Yearly plans are billed once a year at a discounted monthly rate, saving roughly 20% compared with paying month to month. You can switch between monthly and yearly at any time from your billing settings.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "We never shut off your projects without warning. If you approach a limit we'll email you, and you can upgrade in one click. Brief overages on storage and build minutes are billed at a small per-unit rate.",
  },
  {
    q: "Can I change or cancel my plan later?",
    a: "Absolutely. Upgrades take effect immediately and are prorated. Downgrades and cancellations apply at the end of your current billing period, and you keep access until then.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off for verified nonprofits, open-source maintainers and students. Reach out to our support team with a short description of your organization and we'll set it up within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with bank transfer on net-30 terms.",
  },
];

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
}) {
  const options: { id: BillingCycle; label: string }[] = [
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Billing cycle"
      className="inline-flex items-center rounded-full bg-slate-100 p-1 ring-1 ring-slate-200"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {opt.label}
            {opt.id === "yearly" && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Save 20%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TierCard({ tier, cycle }: { tier: Tier; cycle: BillingCycle }) {
  const price = cycle === "monthly" ? tier.monthly : tier.yearly;
  const headingId = `tier-${tier.id}`;
  return (
    <article
      aria-labelledby={headingId}
      className={`relative flex flex-col rounded-3xl p-8 ${
        tier.highlighted
          ? "bg-slate-900 text-white shadow-2xl ring-2 ring-indigo-500 lg:-my-4 lg:py-12"
          : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
      }`}
    >
      {tier.highlighted && (
        <p className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Most popular
        </p>
      )}
      <h3 id={headingId} className="text-lg font-semibold">
        {tier.name}
      </h3>
      <p className={`mt-2 text-sm ${tier.highlighted ? "text-slate-300" : "text-slate-600"}`}>
        {tier.tagline}
      </p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight">${price}</span>
        <span className={`text-sm ${tier.highlighted ? "text-slate-300" : "text-slate-600"}`}>
          /month
        </span>
      </p>
      <p
        className={`mt-1 min-h-5 text-xs ${tier.highlighted ? "text-slate-300" : "text-slate-600"}`}
      >
        {cycle === "yearly"
          ? `Billed annually ($${tier.yearly * 12}/year)`
          : "Billed monthly, cancel anytime"}
      </p>
      <a
        href={`#get-${tier.id}`}
        className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
          tier.highlighted
            ? "bg-indigo-500 text-white hover:bg-indigo-400"
            : "bg-slate-900 text-white hover:bg-slate-700"
        }`}
      >
        {tier.cta}
        <span className="sr-only"> for the {tier.name} plan</span>
      </a>
      <ul className="mt-8 space-y-3 text-sm">
        {tier.features.map((f) => (
          <li key={f} className="flex gap-3">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${
                tier.highlighted ? "text-indigo-300" : "text-indigo-600"
              }`}
              aria-hidden="true"
            />
            <span className={tier.highlighted ? "text-slate-100" : "text-slate-700"}>{f}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Cell({ value, tierName }: { value: CellValue; tierName: string }) {
  if (typeof value === "boolean") {
    return value ? (
      <>
        <Check className="mx-auto size-5 text-indigo-600" aria-hidden="true" />
        <span className="sr-only">Included in {tierName}</span>
      </>
    ) : (
      <>
        <Minus className="mx-auto size-5 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Not included in {tierName}</span>
      </>
    );
  }
  return <span className="text-slate-700">{value}</span>;
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
      <table className="w-full min-w-[40rem] border-collapse bg-white text-left text-sm">
        <caption className="sr-only">Feature comparison across Starter, Team and Enterprise plans</caption>
        <thead>
          <tr className="border-b border-slate-200">
            <th scope="col" className="w-2/5 px-4 py-4 font-semibold text-slate-900 sm:px-6">
              Features
            </th>
            {TIERS.map((t) => (
              <th
                key={t.id}
                scope="col"
                className={`px-4 py-4 text-center font-semibold sm:px-6 ${
                  t.highlighted ? "bg-indigo-50 text-indigo-900" : "text-slate-900"
                }`}
              >
                {t.name}
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
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-600 sm:px-6"
              >
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.feature} className="border-t border-slate-100">
                <th scope="row" className="px-4 py-3.5 font-medium text-slate-800 sm:px-6">
                  {row.feature}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={TIERS[i].id}
                    className={`px-4 py-3.5 text-center sm:px-6 ${
                      TIERS[i].highlighted ? "bg-indigo-50/60" : ""
                    }`}
                  >
                    <Cell value={v} tierName={TIERS[i].name} />
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

function FaqAccordion() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:px-6"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`size-5 shrink-0 text-slate-500 transition-transform duration-200 ${
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
  const [cycle, setCycle] = useState<BillingCycle>("yearly");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section
        aria-labelledby="pricing-heading"
        className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Pricing</p>
          <h1
            id="pricing-heading"
            className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          >
            Simple pricing that scales with your team
          </h1>
          <p className="mt-5 text-lg text-slate-600 text-pretty">
            Start with a 14-day free trial on any plan. No credit card required, no hidden fees,
            and you can change plans whenever you like.
          </p>
          <div className="mt-8 flex justify-center">
            <BillingToggle value={cycle} onChange={setCycle} />
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-md gap-8 lg:max-w-none lg:grid-cols-3 lg:items-center lg:gap-6">
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} cycle={cycle} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="compare-heading"
        className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <h2
          id="compare-heading"
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Compare plans in detail
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
          Every plan includes unlimited deploys, custom domains and automatic HTTPS.
        </p>
        <div className="mt-10">
          <ComparisonTable />
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6 lg:px-8"
      >
        <h2 id="faq-heading" className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
          Can&apos;t find what you&apos;re looking for? Email us at support@northwind.example and
          we&apos;ll reply within one business day.
        </p>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </section>
    </main>
  );
}
