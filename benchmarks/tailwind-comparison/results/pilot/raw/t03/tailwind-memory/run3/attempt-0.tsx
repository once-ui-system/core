"use client";

import { useId, useState } from "react";
import { Check, ChevronDown, Minus } from "lucide-react";

type Tier = {
  id: string;
  name: string;
  blurb: string;
  monthly: number;
  yearly: number;
  cta: string;
  highlighted: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "For side projects and early experiments.",
    monthly: 0,
    yearly: 0,
    cta: "Start for free",
    highlighted: false,
    features: [
      "Up to 3 projects",
      "5,000 events per month",
      "7-day data retention",
      "Community support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    blurb: "For teams shipping to real customers.",
    monthly: 29,
    yearly: 24,
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250,000 events per month",
      "90-day data retention",
      "Custom dashboards and alerts",
      "Priority email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    blurb: "For organizations with security and compliance needs.",
    monthly: 99,
    yearly: 82,
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Everything in Growth",
      "5 million events per month",
      "1-year data retention",
      "SSO and audit logs",
      "Dedicated success manager",
    ],
  },
];

type Cell = boolean | string;

const comparison: { group: string; rows: { label: string; values: [Cell, Cell, Cell] }[] }[] = [
  {
    group: "Usage",
    rows: [
      { label: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Events per month", values: ["5,000", "250,000", "5,000,000"] },
      { label: "Data retention", values: ["7 days", "90 days", "1 year"] },
      { label: "Team members", values: ["1", "10", "Unlimited"] },
    ],
  },
  {
    group: "Features",
    rows: [
      { label: "Custom dashboards", values: [false, true, true] },
      { label: "Alerts and webhooks", values: [false, true, true] },
      { label: "CSV and API export", values: [true, true, true] },
      { label: "SSO (SAML)", values: [false, false, true] },
      { label: "Audit logs", values: [false, false, true] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Community forum", values: [true, true, true] },
      { label: "Email support", values: [false, "Priority", "Priority"] },
      { label: "Dedicated success manager", values: [false, false, true] },
      { label: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and are prorated; downgrades apply at the start of your next billing cycle.",
  },
  {
    q: "What happens if I go over my event limit?",
    a: "We never drop your data. If you exceed your monthly quota we keep collecting events and email you, so you can upgrade or trim usage. Overages are billed at $0.40 per additional 1,000 events on paid plans.",
  },
  {
    q: "Do you offer a free trial of paid plans?",
    a: "Growth includes a 14-day trial with no credit card required. If you need longer to evaluate Scale, contact our sales team and we will set up a tailored proof of concept.",
  },
  {
    q: "How does annual billing work?",
    a: "Paying yearly saves about 17 percent compared with monthly billing. You are charged once up front, and you can request a prorated refund within 30 days.",
  },
  {
    q: "Is there a discount for nonprofits or students?",
    a: "Verified nonprofits, open-source maintainers and students get 50 percent off Growth. Send us a short note from your organization email address and we will apply the discount.",
  },
];

function Price({ tier, yearly }: { tier: Tier; yearly: boolean }) {
  const amount = yearly ? tier.yearly : tier.monthly;
  return (
    <p className="mt-6 flex items-baseline gap-1">
      <span className="text-4xl font-bold tracking-tight">${amount}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {amount === 0 ? "forever" : "/ month"}
      </span>
    </p>
  );
}

function CellValue({ value }: { value: Cell }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium">{value}</span>;
  }
  if (value) {
    return (
      <>
        <Check aria-hidden="true" className="mx-auto size-5 text-indigo-600 dark:text-indigo-400" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  return (
    <>
      <Minus aria-hidden="true" className="mx-auto size-5 text-slate-400" />
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
    <div className="border-b border-slate-200 dark:border-slate-800">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:text-indigo-400"
        >
          <span>{q}</span>
          <ChevronDown
            aria-hidden="true"
            className={`size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
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
        className="pb-5 pr-8 text-slate-600 dark:text-slate-300"
      >
        {a}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Pricing
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that grows with you
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Start free, upgrade when your product takes off. No hidden fees, cancel anytime.
          </p>

          <div className="mt-8 inline-flex items-center gap-3">
            <span
              id="billing-monthly"
              className={`text-sm font-medium ${yearly ? "text-slate-500" : ""}`}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={yearly}
              aria-label="Bill yearly"
              onClick={() => setYearly((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                yearly ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
                  yearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              id="billing-yearly"
              className={`text-sm font-medium ${yearly ? "" : "text-slate-500"}`}
            >
              Yearly{" "}
              <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Save 17%
              </span>
            </span>
          </div>
        </header>

        <section aria-label="Plans" className="mt-14 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {tiers.map((tier) => (
            <article
              key={tier.id}
              aria-labelledby={`tier-${tier.id}`}
              className={`relative flex flex-col rounded-2xl p-8 ${
                tier.highlighted
                  ? "border-2 border-indigo-600 bg-indigo-50/60 shadow-xl lg:-my-4 lg:py-12 dark:bg-indigo-950/30"
                  : "border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              {tier.highlighted && (
                <p className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </p>
              )}
              <h2 id={`tier-${tier.id}`} className="text-xl font-semibold">
                {tier.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tier.blurb}</p>
              <Price tier={tier} yearly={yearly} />
              <p className="mt-1 min-h-5 text-xs text-slate-500 dark:text-slate-400">
                {tier.monthly === 0
                  ? "No credit card required"
                  : yearly
                    ? `Billed $${tier.yearly * 12} per year`
                    : "Billed monthly"}
              </p>
              <a
                href={`#signup-${tier.id}`}
                aria-label={`${tier.cta}, ${tier.name} plan`}
                className={`mt-6 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  tier.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "border border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                {tier.cta}
              </a>
              <ul className="mt-8 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-indigo-600 dark:text-indigo-400"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section aria-labelledby="compare-heading" className="mt-24">
          <h2 id="compare-heading" className="text-center text-3xl font-bold tracking-tight">
            Compare plans
          </h2>
          <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <caption className="sr-only">Feature comparison across Starter, Growth and Scale plans</caption>
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th scope="col" className="px-4 py-4 text-sm font-semibold">
                    <span className="sr-only">Feature</span>
                  </th>
                  {tiers.map((t) => (
                    <th
                      key={t.id}
                      scope="col"
                      className={`px-4 py-4 text-center text-sm font-semibold ${
                        t.highlighted ? "text-indigo-700 dark:text-indigo-300" : ""
                      }`}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {comparison.map((g) => (
                <tbody key={g.group} className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="border-t border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60">
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      {g.group}
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row" className="px-4 py-3 text-sm font-medium">
                        {r.label}
                      </th>
                      {r.values.map((v, i) => (
                        <td
                          key={tiers[i].id}
                          className={`px-4 py-3 text-center ${
                            tiers[i].highlighted ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""
                          }`}
                        >
                          <CellValue value={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="mx-auto mt-24 max-w-3xl">
          <h2 id="faq-heading" className="text-center text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-10 border-t border-slate-200 dark:border-slate-800">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-300">
            Still have questions?{" "}
            <a
              href="#contact"
              className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
            >
              Contact our team
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
