export type Plan = {
  name: string;
  priceMonth: number;
  seats: string;
  features: string[];
  highlight?: boolean;
};

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

export const nav = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
];

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    features: [
      "Unlimited projects",
      "1-year history",
      "Issue tracker",
      "Email support",
    ],
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

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
];

export const features = [
  {
    title: "Analytics you can read in a minute",
    body: "One dashboard shows what shipped, what people used and what broke. No query language, no twenty-tab report builder, just the numbers a small team needs on Monday morning.",
    points: ["Weekly digest by email", "Funnels and retention", "Shareable links"],
    icon: "chart",
  },
  {
    title: "Issues that live next to the data",
    body: "Open an issue straight from a drop in a funnel. The chart, the affected sessions and the discussion stay attached, so nobody has to reconstruct the context later.",
    points: ["Issue from any chart", "Sessions attached", "Keyboard-first triage"],
    icon: "issue",
  },
  {
    title: "Built for teams of two to twenty",
    body: "Simple per-seat pricing, EU data storage and sensible defaults. Invite the whole team without a procurement meeting, and grow into SSO and audit logs when you need them.",
    points: ["EU data, encrypted at rest", "Per-seat pricing", "SSO on Business"],
    icon: "team",
  },
] as const;

export const comparison: { feature: string; values: [string, string, string] }[] =
  [
    { feature: "Projects", values: ["1", "Unlimited", "Unlimited"] },
    { feature: "History", values: ["7 days", "1 year", "Unlimited"] },
    { feature: "Issue tracker", values: ["No", "Yes", "Yes"] },
    { feature: "SSO and audit log", values: ["No", "No", "Yes"] },
    {
      feature: "Support",
      values: ["Community", "Email", "Priority"],
    },
  ];

/** Yearly billing = two months free: pay for 10 months, shown per month. */
export function planPrice(priceMonth: number, yearly: boolean): number {
  if (!yearly) return priceMonth;
  return Math.round(((priceMonth * 10) / 12) * 100) / 100;
}

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * 10;
}
