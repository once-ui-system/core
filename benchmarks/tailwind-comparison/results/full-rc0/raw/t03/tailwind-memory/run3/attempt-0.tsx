"use client";

import { useState } from "react";
import { Check, Minus, ChevronDown, Sparkles } from "lucide-react";

type Billing = "monthly" | "yearly";

type Tier = {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number; // per month, billed annually
  cta: string;
  highlighted: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo makers shipping their first project.",
    monthly: 12,
    yearly: 10,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "3 active projects",
      "5 GB asset storage",
      "Basic analytics",
      "Community support",
      "Public share links",
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
    features: [
      "Unlimited projects",
      "100 GB asset storage",
      "Advanced analytics & exports",
      "Priority email support",
      "Roles and permissions",
      "Slack and GitHub integrations",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with security and scale needs.",
    monthly: 89,
    yearly: 74,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Team",
      "1 TB asset storage",
      "SSO and SCIM provisioning",
      "Audit logs, 2-year retention",
      "99.95% uptime SLA",
      "Dedicated success manager",
    ],
  },
];

type CellValue = boolean | string;

type ComparisonRow = {
  feature: string;
  values: [CellValue, CellValue, CellValue];
};

type ComparisonGroup = {
  group: string;
  rows: ComparisonRow[];
};

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Workspace",
    rows: [
      { feature: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Asset storage", values: ["5 GB", "100 GB", "1 TB"] },
      { feature: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { feature: "Version history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Public share links", values: [true, true, true] },
      { feature: "Roles and permissions", values: [false, true, true] },
      { feature: "Comments and mentions", values: [false, true, true] },
      { feature: "Slack and GitHub integrations", values: [false, true, true] },
    ],
  },
  {
    group: "Security and support",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SSO and SCIM", values: [false, false, true] },
      { feature: "Audit logs", values: [false, "30 days", "2 years"] },
      { feature: "Support", values: ["Community", "Priority email", "Dedicated manager"] },
      { feature: "Uptime SLA", values: [false, false, "99.95%"] },
    ],
  },
];

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "How does the free trial work?",
    a: "Every paid plan starts with a 14-day free trial. No credit card is required, and you can invite your team right away. At the end of the trial you choose a plan or your workspace switches to read-only mode.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade at any time and the change takes effect immediately, with the difference prorated. If you downgrade, the new plan starts at your next billing date.",
  },
  {
    q: "What happens if I go over my storage limit?",
    a: "We never delete your files. You will get a warning at 80% and 100% of your limit, and uploads pause until you free up space or upgrade. Existing assets stay available.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off any plan for registered nonprofits, accredited schools and students. Email our billing team with proof of status and we will apply the discount within one business day.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual billing is charged once per year and saves roughly 20% compared with monthly billing. You can cancel any time and keep access until the end of the paid period.",
  },
];

function formatPrice(n: number): string {
  return `$${n}`;
}

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
  return <span className="text-sm text-slate-700">{value}</span>;
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
        className="inline-flex rounded-full bg-slate-100 p-1 ring-1 ring-slate-200"
      >
        {options.map((o) => {
          const active = billing === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                active
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        Save about 20% with yearly billing
      </span>
    </div>
  );
}

function TierCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const price = billing === "monthly" ? tier.monthly : tier.yearly;
  const headingId = `tier-${tier.id}`;
  const h = tier.highlighted;

  return (
    <article
      aria-labelledby={headingId}
      className={`relative flex flex-col rounded-3xl p-8 ${
        h
          ? "bg-slate-900 text-white shadow-2xl shadow-indigo-900/20 ring-2 ring-indigo-500 lg:-my-4 lg:py-12"
          : "bg-white text-slate-900 ring-1 ring-slate-200"
      }`}
    >
      {h && (
        <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Most popular
        </span>
      )}
      <h3 id={headingId} className="text-lg font-semibold">
        {tier.name}
      </h3>
      <p className={`mt-2 text-sm ${h ? "text-slate-300" : "text-slate-600"}`}>
        {tier.tagline}
      </p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight">
          {formatPrice(price)}
        </span>
        <span className={`text-sm ${h ? "text-slate-300" : "text-slate-600"}`}>
          /month
        </span>
      </p>
      <p
        className={`mt-1 min-h-5 text-xs ${h ? "text-slate-400" : "text-slate-500"}`}
        aria-live="polite"
      >
        {billing === "yearly"
          ? `Billed annually at ${formatPrice(tier.yearly * 12)}`
          : "Billed monthly"}
      </p>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        aria-label={`${tier.cta} — ${tier.name} plan`}
        className={`mt-6 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
          h
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
              className={`mt-0.5 size-5 shrink-0 ${h ? "text-indigo-300" : "text-indigo-600"}`}
              aria-hidden="true"
            />
            <span className={h ? "text-slate-200" : "text-slate-700"}>{f}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
      <table className="w-full min-w-[40rem] border-collapse bg-white text-left">
        <caption className="sr-only">
          Feature comparison across Starter, Team and Enterprise plans
        </caption>
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
        {COMPARISON.map((g) => (
          <tbody key={g.group}>
            <tr>
              <th
                scope="colgroup"
                colSpan={4}
                className="bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-6"
              >
                {g.group}
              </th>
            </tr>
            {g.rows.map((r) => (
              <tr key={r.feature} className="border-t border-slate-100">
                <th
                  scope="row"
                  className="px-4 py-3.5 text-sm font-medium text-slate-700 sm:px-6"
                >
                  {r.feature}
                </th>
                {r.values.map((v, i) => (
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

function FaqItem({
  faq,
  index,
  open,
  onToggle,
}: {
  faq: Faq;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const buttonId = `faq-button-${index}`;
  const panelId = `faq-panel-${index}`;
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-slate-900 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {faq.q}
          <ChevronDown
            aria-hidden="true"
            className={`size-5 shrink-0 text-slate-500 transition-transform duration-200 ${
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
        className="pb-5 pr-9 text-sm leading-6 text-slate-600"
      >
        {faq.a}
      </div>
    </div>
  );
}

export default function Page() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section
        aria-labelledby="pricing-heading"
        className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Pricing
          </p>
          <h1
            id="pricing-heading"
            className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          >
            Simple plans that grow with your team
          </h1>
          <p className="mt-4 text-lg text-slate-600 text-pretty">
            Try any plan free for 14 days. No credit card required, and you can
            change or cancel whenever you like.
          </p>
        </div>

        <div className="mt-10">
          <BillingToggle billing={billing} onChange={setBilling} />
        </div>

        <div className="mx-auto mt-14 grid max-w-md grid-cols-1 gap-8 lg:mt-16 lg:max-w-none lg:grid-cols-3 lg:items-center">
          {TIERS.map((t) => (
            <TierCard key={t.id} tier={t} billing={billing} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="compare-heading"
        className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <h2
          id="compare-heading"
          className="text-center text-3xl font-bold tracking-tight"
        >
          Compare plans in detail
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Everything included in each plan, side by side.
        </p>
        <div className="mt-10">
          <ComparisonTable />
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl px-4 py-16 pb-24 sm:px-6 lg:px-8"
      >
        <h2
          id="faq-heading"
          className="text-center text-3xl font-bold tracking-tight"
        >
          Frequently asked questions
        </h2>
        <div className="mt-10 rounded-2xl bg-white px-6 ring-1 ring-slate-200">
          {FAQS.map((f, i) => (
            <FaqItem
              key={f.q}
              faq={f}
              index={i}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-600">
          Still have questions? Email us at{" "}
          <a
            href="mailto:hello@example.com"
            className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            hello@example.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
