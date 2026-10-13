"use client";

import { useId, useState } from "react";
import { Check, ChevronDown, Minus } from "lucide-react";

type Tier = {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  cta: string;
  highlighted: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo developers and side projects getting off the ground.",
    monthly: 0,
    annual: 0,
    cta: "Start for free",
    highlighted: false,
    features: [
      "3 active projects",
      "5 GB storage",
      "Community support",
      "7-day activity history",
      "Basic analytics",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For growing teams that ship every week and need to move together.",
    monthly: 24,
    annual: 19,
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250 GB storage",
      "Priority email support",
      "90-day activity history",
      "Advanced analytics and exports",
      "Role-based permissions",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with security, compliance and scale requirements.",
    monthly: 79,
    annual: 65,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Team",
      "Unlimited storage",
      "24/7 phone and chat support",
      "Unlimited activity history",
      "SAML single sign-on and SCIM",
      "Dedicated success manager",
    ],
  },
];

type Cell = boolean | string;

type ComparisonGroup = {
  group: string;
  rows: { feature: string; values: [Cell, Cell, Cell] }[];
};

const comparison: ComparisonGroup[] = [
  {
    group: "Core platform",
    rows: [
      { feature: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Storage", values: ["5 GB", "250 GB", "Unlimited"] },
      { feature: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { feature: "Activity history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared workspaces", values: [false, true, true] },
      { feature: "Role-based permissions", values: [false, true, true] },
      { feature: "Guest access", values: [false, "10 guests", "Unlimited"] },
      { feature: "Audit log", values: [false, false, true] },
    ],
  },
  {
    group: "Security and support",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SAML single sign-on", values: [false, false, true] },
      { feature: "Support channel", values: ["Community", "Email", "Phone and chat"] },
      { feature: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and we prorate the difference. Downgrades apply at the start of your next billing cycle.",
  },
  {
    q: "What happens when my trial ends?",
    a: "Your 14-day Team trial does not require a credit card. When it ends, your workspace moves to the Starter plan automatically, and nothing is deleted. You can upgrade whenever you are ready.",
  },
  {
    q: "Do you offer discounts for annual billing?",
    a: "Paying annually saves roughly 20% compared to monthly billing. Nonprofits, students and open source maintainers can also apply for an additional discount through our support team.",
  },
  {
    q: "How does seat-based pricing work?",
    a: "Prices shown are per member, per month. You only pay for active members, and you can add or remove people at any time. Removed seats are credited on your next invoice.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with net-30 terms or by bank transfer.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted in transit and at rest, and we run independent security audits every year. Enterprise plans add single sign-on, audit logs and data residency options.",
  },
];

function formatPrice(n: number): string {
  return n === 0 ? "$0" : `$${n}`;
}

function ComparisonCell({ value, tier }: { value: Cell; tier: string }) {
  if (value === true) {
    return (
      <>
        <Check className="mx-auto size-5 text-emerald-600" aria-hidden="true" />
        <span className="sr-only">Included in {tier}</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus className="mx-auto size-5 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Not included in {tier}</span>
      </>
    );
  }
  return <span className="text-sm font-medium text-slate-800">{value}</span>;
}

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
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
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 rounded-md px-1 py-5 text-left text-base font-semibold text-slate-900 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <span>{question}</span>
          <ChevronDown
            className={`size-5 shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
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
        className="px-1 pb-5 text-base leading-relaxed text-slate-600"
      >
        {answer}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState<boolean>(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">
            Pricing
          </p>
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            Start free, upgrade when you need more. No setup fees, no hidden
            charges, and you can cancel at any time.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${annual ? "text-slate-500" : "text-slate-900"}`}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Bill annually"
              onClick={() => setAnnual((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                annual ? "bg-indigo-600" : "bg-slate-400"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
                  annual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${annual ? "text-slate-900" : "text-slate-500"}`}
            >
              Annual{" "}
              <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Save 20%
              </span>
            </span>
          </div>
        </header>

        {/* Tiers */}
        <section
          aria-label="Pricing plans"
          className="mx-auto mt-14 grid max-w-md gap-8 lg:max-w-none lg:grid-cols-3 lg:items-stretch"
        >
          {tiers.map((tier) => {
            const price = annual ? tier.annual : tier.monthly;
            const headingId = `tier-${tier.id}`;
            return (
              <article
                key={tier.id}
                aria-labelledby={headingId}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  tier.highlighted
                    ? "bg-indigo-700 text-white shadow-xl ring-2 ring-indigo-700 lg:-my-4 lg:py-12"
                    : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                }`}
              >
                {tier.highlighted && (
                  <p className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
                    Most popular
                  </p>
                )}
                <h2 id={headingId} className="text-xl font-semibold">
                  {tier.name}
                </h2>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    tier.highlighted ? "text-indigo-100" : "text-slate-600"
                  }`}
                >
                  {tier.tagline}
                </p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">
                    {formatPrice(price)}
                  </span>
                  <span
                    className={`text-sm ${tier.highlighted ? "text-indigo-100" : "text-slate-600"}`}
                  >
                    {price === 0 ? "forever" : "/ member / month"}
                  </span>
                </p>
                <p
                  className={`mt-1 min-h-5 text-xs ${
                    tier.highlighted ? "text-indigo-100" : "text-slate-600"
                  }`}
                >
                  {price === 0
                    ? "No credit card required"
                    : annual
                      ? `Billed annually at $${price * 12} per member`
                      : "Billed monthly"}
                </p>

                <a
                  href={`#${tier.id}`}
                  aria-label={`${tier.cta}, ${tier.name} plan`}
                  className={`mt-6 block rounded-lg px-4 py-3 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    tier.highlighted
                      ? "bg-white text-indigo-800 hover:bg-indigo-50 focus-visible:outline-white"
                      : "bg-indigo-700 text-white hover:bg-indigo-800 focus-visible:outline-indigo-600"
                  }`}
                >
                  {tier.cta}
                </a>

                <ul className="mt-8 space-y-3 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check
                        className={`mt-0.5 size-5 shrink-0 ${
                          tier.highlighted ? "text-amber-300" : "text-emerald-600"
                        }`}
                        aria-hidden="true"
                      />
                      <span>{f}</span>
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
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Every feature across every plan, so you can pick with confidence.
          </p>

          <div
            role="region"
            tabIndex={0}
            aria-label="Feature comparison table, scrollable"
            className="mt-10 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">
                Feature comparison of the Starter, Team and Enterprise plans
              </caption>
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="w-2/5 px-4 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                    Features
                  </th>
                  {tiers.map((t) => (
                    <th
                      key={t.id}
                      scope="col"
                      className={`px-4 py-4 text-center text-sm font-semibold sm:px-6 ${
                        t.highlighted ? "bg-indigo-50 text-indigo-800" : "text-slate-900"
                      }`}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {comparison.map((g) => (
                <tbody key={g.group} className="border-b border-slate-200 last:border-b-0">
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="bg-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700 sm:px-6"
                    >
                      {g.group}
                    </th>
                  </tr>
                  {g.rows.map((row) => (
                    <tr key={row.feature} className="border-t border-slate-100">
                      <th
                        scope="row"
                        className="px-4 py-3.5 text-sm font-normal text-slate-700 sm:px-6"
                      >
                        {row.feature}
                      </th>
                      {row.values.map((v, i) => (
                        <td
                          key={tiers[i].id}
                          className={`px-4 py-3.5 text-center sm:px-6 ${
                            tiers[i].highlighted ? "bg-indigo-50/60" : ""
                          }`}
                        >
                          <ComparisonCell value={v} tier={tiers[i].name} />
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
          <div className="mt-10 rounded-2xl bg-white px-5 shadow-sm ring-1 ring-slate-200 sm:px-8">
            {faqs.map((item, i) => (
              <FaqItem
                key={item.q}
                question={item.q}
                answer={item.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-600">
            Still have questions?{" "}
            <a
              href="#contact"
              className="font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Talk to our team
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
