import type { IconName } from "@once-ui-system/core";

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams. Clear dashboards, a tracker that stays out of the way, and data kept in the EU.",
};

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Product", href: "/#product" },
  { label: "Customers", href: "/#customers" },
  { label: "Pricing", href: "/pricing" },
];

export const logos = ["Acme Labs", "Northwind Studio", "Hooli", "Globex", "Initech"];

export type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: IconName;
  points: string[];
};

export const features: Feature[] = [
  {
    id: "analytics",
    eyebrow: "Analytics",
    title: "Dashboards your whole team will open on Monday",
    description:
      "Lumen turns raw events into a handful of charts that answer real questions: who signed up, what they used and where they got stuck. No query language, no twenty-tab report.",
    icon: "barChart",
    points: [
      "Weekly digest written in plain language",
      "Funnels and retention without a data analyst",
      "Every chart links to the events behind it",
    ],
  },
  {
    id: "issues",
    eyebrow: "Issue tracking",
    title: "A tracker that sits next to the numbers",
    description:
      "File an issue straight from a chart. Lumen attaches the segment, the release and the session count so the person who fixes it never has to ask what you meant.",
    icon: "checkbox",
    points: [
      "One-click issues from any metric",
      "Triage board with owners and due dates",
      "Closes the loop when the metric recovers",
    ],
  },
  {
    id: "privacy",
    eyebrow: "Data you can trust",
    title: "Kept in the EU, encrypted, and yours to export",
    description:
      "Events are stored in EU data centres and encrypted at rest. Export everything as CSV at any time, and delete a project with one confirmation.",
    icon: "security",
    points: [
      "EU hosting, encrypted at rest",
      "Full CSV and JSON export",
      "SSO and audit log on Business",
    ],
  },
];

export type Billing = "monthly" | "yearly";

export type Plan = {
  name: string;
  priceMonth: number;
  seats: string;
  description: string;
  cta: string;
  features: string[];
  highlight?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1",
    description: "For a solo developer trying Lumen on a side project.",
    cta: "Start for free",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    description: "For small teams that ship every week.",
    cta: "Start a Team trial",
    features: ["Unlimited projects", "1-year history", "Issue tracker", "Email support"],
    highlight: true,
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    description: "For companies that need single sign-on and an audit trail.",
    cta: "Talk to us",
    features: ["Everything in Team", "SSO and audit log", "Unlimited history", "Priority support"],
  },
];

/** Yearly billing is two months free: pay for ten months, spread over twelve. */
export const YEARLY_MONTHS_PAID = 10;

export function monthlyEquivalent(priceMonth: number, billing: Billing): number {
  if (billing === "monthly") return priceMonth;
  return Math.round(((priceMonth * YEARLY_MONTHS_PAID) / 12) * 100) / 100;
}

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_PAID;
}

export const comparisonHeaders = ["Feature", "Free", "Team", "Business"];

export const comparisonRows: string[][] = [
  ["Seats", "1", "Per seat", "Per seat"],
  ["Projects", "1", "Unlimited", "Unlimited"],
  ["History", "7 days", "1 year", "Unlimited"],
  ["Issue tracker", "—", "Included", "Included"],
  ["SSO and audit log", "—", "—", "Included"],
  ["Support", "Community", "Email", "Priority"],
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
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Analytics", href: "/#product" },
      { label: "Issue tracking", href: "/#product" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Customers", href: "/#customers" },
      { label: "Contact", href: "mailto:hello@lumen.example" },
    ],
  },
];
