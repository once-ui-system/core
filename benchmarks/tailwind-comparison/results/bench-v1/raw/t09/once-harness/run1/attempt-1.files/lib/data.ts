import type { IconName } from "@once-ui-system/core";

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
} as const;

export const navItems = [
  { label: "Product", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Customers", href: "/#customers" },
] as const;

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
] as const;

export type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: IconName;
  points: readonly string[];
};

export const features: readonly Feature[] = [
  {
    id: "analytics",
    eyebrow: "Product analytics",
    title: "Numbers your whole team will open on a Monday",
    body: "Lumen turns raw events into a single weekly view: who signed up, what they used and where they stopped. No query language, no dashboards to maintain.",
    icon: "barChart",
    points: [
      "One shared weekly summary, written in plain sentences",
      "Funnels and retention without setting up a data warehouse",
      "Every chart links to the people and sessions behind it",
    ],
  },
  {
    id: "issues",
    eyebrow: "Issue tracking",
    title: "Bugs and requests, filed from the data itself",
    body: "Spot a drop-off, open an issue from the chart, and keep the evidence attached. The tracker is fast, keyboard-first and small enough to learn in an afternoon.",
    icon: "checkbox",
    points: [
      "Create an issue from any chart, session or user",
      "Cycles, labels and assignees, and nothing you do not need",
      "Status changes show up next to the metric they affect",
    ],
  },
  {
    id: "privacy",
    eyebrow: "Privacy and control",
    title: "Your data stays in the EU, and stays yours",
    body: "Events are stored in EU data centres and encrypted at rest. Export everything as plain files whenever you like, or delete a project in one step.",
    icon: "security",
    points: [
      "EU data residency, encrypted at rest",
      "Full export in open formats at any time",
      "Single sign-on and an audit log on the Business plan",
    ],
  },
];

export type Plan = {
  name: string;
  priceMonth: number;
  seats: string;
  features: readonly string[];
  highlight?: boolean;
  blurb: string;
  cta: string;
};

export const plans: readonly Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For one person trying Lumen on a side project.",
    cta: "Start for free",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For small teams that ship every week.",
    cta: "Start a Team trial",
    highlight: true,
    features: ["Unlimited projects", "1-year history", "Issue tracker", "Email support"],
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    blurb: "For teams that need access control and long memory.",
    cta: "Talk to us",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
  },
];

/** Yearly billing is two months free: pay for 10 months, spread over 12. */
export const YEARLY_MONTHS_PAID = 10;

export function monthlyPrice(plan: Plan, yearly: boolean): number {
  if (!yearly) return plan.priceMonth;
  const perMonth = (plan.priceMonth * YEARLY_MONTHS_PAID) / 12;
  return Math.round(perMonth * 100) / 100;
}

export function yearlyTotal(plan: Plan): number {
  return plan.priceMonth * YEARLY_MONTHS_PAID;
}

export function formatPrice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export const comparison: readonly Record<string, string>[] = [
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "History", free: "7 days", team: "1 year", business: "Unlimited" },
  { feature: "Issue tracker", free: "—", team: "Included", business: "Included" },
  { feature: "SSO and audit log", free: "—", team: "—", business: "Included" },
  { feature: "Support", free: "Community", team: "Email", business: "Priority" },
];

export const faq = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrades apply at once; downgrades at the end of the billing period.",
  },
  {
    q: "Do you offer a discount for non-profits?",
    a: "Yes, 50% off Team and Business for registered non-profits.",
  },
  {
    q: "Where is my data stored?",
    a: "In the EU, encrypted at rest.",
  },
] as const;

export const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Customers", href: "/#customers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Security", href: "/" },
    ],
  },
] as const;
