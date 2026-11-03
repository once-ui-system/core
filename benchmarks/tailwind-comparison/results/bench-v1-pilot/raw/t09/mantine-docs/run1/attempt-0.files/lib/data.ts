export interface Plan {
  name: string;
  priceMonth: number;
  seats: string;
  features: string[];
  highlight?: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams. See what people do in your product, and turn what you learn into issues, in one place.",
} as const;

export const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Customers", href: "/#customers" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const logos = ["Acme Labs", "Northwind Studio", "Hooli", "Globex", "Initech"];

export interface Feature {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}

export const features: Feature[] = [
  {
    id: "analytics",
    eyebrow: "Product analytics",
    title: "Dashboards your whole team will open on Monday",
    body: "Lumen turns raw events into a short weekly summary: who signed up, what they used and where they got stuck. No query language and no analyst required.",
    points: [
      "Funnels, retention and feature adoption out of the box",
      "A weekly digest written in plain sentences, not charts alone",
      "Event history from 7 days to unlimited, depending on plan",
    ],
  },
  {
    id: "issues",
    eyebrow: "Issue tracking",
    title: "Turn a drop-off into a ticket in two clicks",
    body: "Spot a problem in a funnel and file it without leaving the page. The issue keeps a link to the data that raised it, so nobody has to ask for context later.",
    points: [
      "Issues carry the chart and the segment that prompted them",
      "Lightweight boards with the statuses small teams actually use",
      "Close the loop: see the metric move after the fix ships",
    ],
  },
  {
    id: "privacy",
    eyebrow: "Privacy and control",
    title: "Your data stays in the EU, encrypted at rest",
    body: "Lumen stores everything in EU data centres and encrypts it at rest. Business teams get SSO and an audit log, so reviews with security take minutes.",
    points: [
      "EU hosting with encryption at rest",
      "SSO and audit log on the Business plan",
      "Export your data whenever you like",
    ],
  },
];

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    features: ["Unlimited projects", "1-year history", "Issue tracker", "Email support"],
    highlight: true,
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
  },
];

/** Yearly billing is two months free: pay for 10 months, shown per month. */
export const YEARLY_MONTHS_PAID = 10;

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_PAID;
}

export function yearlyPerMonth(priceMonth: number): number {
  return yearlyTotal(priceMonth) / 12;
}

export type ComparisonValue = boolean | string;

export interface ComparisonRow {
  feature: string;
  free: ComparisonValue;
  team: ComparisonValue;
  business: ComparisonValue;
}

export const comparison: ComparisonRow[] = [
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  { feature: "Event history", free: "7 days", team: "1 year", business: "Unlimited" },
  { feature: "Product analytics dashboards", free: true, team: true, business: true },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "SSO", free: false, team: false, business: true },
  { feature: "Audit log", free: false, team: false, business: true },
  {
    feature: "Support",
    free: "Community",
    team: "Email",
    business: "Priority",
  },
];

export const faq: FaqItem[] = [
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
];
