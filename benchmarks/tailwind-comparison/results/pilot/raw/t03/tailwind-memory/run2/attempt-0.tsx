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

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For side projects and solo builders getting started.",
    monthly: 0,
    yearly: 0,
    cta: "Start for free",
    highlighted: false,
    features: [
      "3 active projects",
      "5 GB storage",
      "Community support",
      "7-day activity history",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For growing teams that ship together every week.",
    monthly: 24,
    yearly: 19,
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250 GB storage",
      "Priority email support",
      "1-year activity history",
      "Role-based permissions",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with security and compliance needs.",
    monthly: 79,
    yearly: 64,
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Everything in Team",
      "Unlimited storage",
      "SAML single sign-on",
      "Dedicated success manager",
      "99.99% uptime SLA",
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

const comparison: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { label: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { label: "Storage", values: ["5 GB", "250 GB", "Unlimited"] },
      { label: "Activity history", values: ["7 days", "1 year", "Unlimited"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { label: "Shared workspaces", values: [false, true, true] },
      { label: "Role-based permissions", values: [false, true, true] },
      { label: "Guest access", values: [false, "10 guests", "Unlimited"] },
    ],
  },
  {
    group: "Security",
    rows: [
      { label: "Two-factor authentication", values: [true, true, true] },
      { label: "SAML single sign-on", values: [false, false, true] },
      { label: "Audit logs", values: [false, "30 days", "Unlimited"] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Community forum", values: [true, true, true] },
      { label: "Priority email support", values: [false, true, true] },
      { label: "Dedicated success manager", values: [false, false, true] },
    ],
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and are prorated, while downgrades apply at the start of your next billing cycle.",
  },
  {
    q: "How does the free trial work?",
    a: "The Team plan includes a 14-day trial with every feature unlocked. You do not need a credit card to start, and we will remind you three days before the trial ends.",
  },
  {
    q: "What happens if I go over my storage limit?",
    a: "We will never delete your files. If you reach your limit, uploads pause and we email workspace owners so they can free up space or move to a larger plan.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off Team plans for verified nonprofits, schools and open-source maintainers. Contact our support team with proof of status and we will apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with net-30 terms and bank transfer.",
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (typeof value === "string") {
    return <span className="text-sm text-slate-700">{value}</span>;
  }
  if (value) {
    return (
      <>
        <Check aria-hidden="true" className="mx-auto size-5 text-indigo-600" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  return (
    <>
      <Minus aria-hidden="true" className="mx-auto size-5 text-slate-300" />
      <span className="sr-only">Not included</span>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const buttonId = `${uid}-button`;
  const panelId = `${uid}-panel`;

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 rounded-md px-1 py-5 text-left text-base font-medium text-slate-900 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span>{q}</span>
          <ChevronDown
            aria-hidden="true"
            className={`size-5 shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="px-1 pb-5 text-sm leading-6 text-slate-600"
      >
        {a}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("yearly");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-4 text-lg text-slate-600 text-pretty">
            Start free, upgrade when you need more room, and cancel whenever you
            like. No hidden fees, no surprise overages.
          </p>

          <div
            role="group"
            aria-label="Billing period"
            className="mt-8 inline-flex rounded-full bg-slate-200/70 p-1"
          >
            {(["monthly", "yearly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={billing === option}
                onClick={() => setBilling(option)}
                className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-reduce:transition-none ${
                  billing === option
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {option}
                {option === "yearly" && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Tiers */}
        <section
          aria-label="Plans"
          className="mt-14 grid gap-8 lg:grid-cols-3 lg:items-stretch"
        >
          {tiers.map((tier) => {
            const price = billing === "monthly" ? tier.monthly : tier.yearly;
            const headingId = `tier-${tier.id}`;
            return (
              <article
                key={tier.id}
                aria-labelledby={headingId}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  tier.highlighted
                    ? "bg-indigo-600 text-white shadow-xl ring-1 ring-indigo-600 lg:-my-4 lg:py-12"
                    : "bg-white text-slate-900 ring-1 ring-slate-200"
                }`}
              >
                {tier.highlighted && (
                  <p className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-amber-950">
                    Most popular
                  </p>
                )}
                <h2 id={headingId} className="text-lg font-semibold">
                  {tier.name}
                </h2>
                <p
                  className={`mt-2 text-sm ${
                    tier.highlighted ? "text-indigo-100" : "text-slate-600"
                  }`}
                >
                  {tier.tagline}
                </p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">
                    ${price}
                  </span>
                  <span
                    className={`text-sm ${
                      tier.highlighted ? "text-indigo-100" : "text-slate-500"
                    }`}
                  >
                    {price === 0 ? "forever" : "/ user / month"}
                  </span>
                </p>
                <p
                  className={`mt-1 min-h-5 text-xs ${
                    tier.highlighted ? "text-indigo-200" : "text-slate-500"
                  }`}
                >
                  {price === 0
                    ? "No credit card required"
                    : billing === "yearly"
                      ? `Billed annually ($${price * 12} per user)`
                      : "Billed monthly"}
                </p>

                <a
                  href={`#${tier.id}-signup`}
                  className={`mt-6 block rounded-lg px-4 py-3 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    tier.highlighted
                      ? "bg-white text-indigo-700 hover:bg-indigo-50 focus-visible:outline-white"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
                  }`}
                >
                  {tier.cta}
                  <span className="sr-only"> for the {tier.name} plan</span>
                </a>

                <ul className="mt-8 space-y-3 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check
                        aria-hidden="true"
                        className={`mt-0.5 size-5 shrink-0 ${
                          tier.highlighted ? "text-indigo-200" : "text-indigo-600"
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>

        {/* Comparison table */}
        <section aria-labelledby="compare-heading" className="mt-24">
          <h2
            id="compare-heading"
            className="text-center text-3xl font-bold tracking-tight"
          >
            Compare plans in detail
          </h2>
          <div className="mt-10 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">
                Feature comparison across the Starter, Team and Enterprise plans
              </caption>
              <thead>
                <tr className="border-b border-slate-200">
                  <th
                    scope="col"
                    className="px-4 py-4 text-sm font-semibold text-slate-900 sm:px-6"
                  >
                    Features
                  </th>
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      scope="col"
                      className={`px-4 py-4 text-center text-sm font-semibold sm:px-6 ${
                        tier.highlighted
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-900"
                      }`}
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {comparison.map((group) => (
                <tbody key={group.group}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:px-6"
                    >
                      {group.group}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
                      <th
                        scope="row"
                        className="px-4 py-3.5 text-sm font-normal text-slate-700 sm:px-6"
                      >
                        {row.label}
                      </th>
                      {row.values.map((value, i) => (
                        <td
                          key={tiers[i].id}
                          className={`px-4 py-3.5 text-center sm:px-6 ${
                            tiers[i].highlighted ? "bg-indigo-50/60" : ""
                          }`}
                        >
                          <CellContent value={value} />
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
        <section aria-labelledby="faq-heading" className="mx-auto mt-24 max-w-3xl">
          <h2
            id="faq-heading"
            className="text-center text-3xl font-bold tracking-tight"
          >
            Frequently asked questions
          </h2>
          <div className="mt-10 rounded-2xl bg-white px-5 ring-1 ring-slate-200 sm:px-8">
            {faqs.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-600">
            Still have questions?{" "}
            <a
              href="#contact"
              className="font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Contact our team
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
