export const brand = {
  name: "Lumen",
  product:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking that small teams actually read",
  brandColor: "#E8590C",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
] as const;

export type Plan = {
  name: string;
  priceMonth: number;
  seats: string;
  blurb: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For solo builders trying out Lumen on a side project.",
    features: ["1 project", "7-day history", "Community support"],
    cta: "Start for free",
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For small software teams who ship every week.",
    features: [
      "Unlimited projects",
      "1-year history",
      "Issue tracker",
      "Email support",
    ],
    highlight: true,
    cta: "Start Team trial",
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    blurb: "For growing teams that need control and compliance.",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
    cta: "Talk to sales",
  },
];

/** Yearly billing = two months free, i.e. 10 months charged. Returns the per-month equivalent. */
export function yearlyMonthlyEquivalent(priceMonth: number): number {
  return (priceMonth * 10) / 12;
}

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * 10;
}

export type ComparisonRow = {
  feature: string;
  values: [boolean | string, boolean | string, boolean | string];
};

export const comparison: ComparisonRow[] = [
  { feature: "Projects", values: ["1", "Unlimited", "Unlimited"] },
  { feature: "Event history", values: ["7 days", "1 year", "Unlimited"] },
  { feature: "Issue tracker", values: [false, true, true] },
  { feature: "SSO and audit log", values: [false, false, true] },
  {
    feature: "Support",
    values: ["Community", "Email", "Priority"],
  },
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

export const features = [
  {
    title: "Analytics you can read in a minute",
    body: "One page per product area, with the five numbers your team actually discusses. No dashboards to build, no query language to learn, and no chart that needs a legend to decode.",
    points: [
      "Weekly digest written in plain sentences",
      "Funnels and retention without setup",
      "Shareable links that never expire",
    ],
  },
  {
    title: "An issue tracker that lives next to the data",
    body: "Spot a drop in signups, open an issue from the chart, and the evidence travels with it. When the fix ships, Lumen shows you whether the number moved.",
    points: [
      "Issues linked to the metric that triggered them",
      "Lightweight boards, no sprints required",
      "Before-and-after view on every release",
    ],
  },
  {
    title: "Built for teams of three to thirty",
    body: "Predictable per-seat pricing, EU data residency and encryption at rest from day one. Add SSO and an audit log when your customers ask for them.",
    points: [
      "Data stored in the EU, encrypted at rest",
      "Per-seat pricing with no event quotas",
      "Upgrade or downgrade whenever you like",
    ],
  },
] as const;

export const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Features", href: "/#features" },
      { label: "Customers", href: "/#customers" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Changelog", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
] as const;
