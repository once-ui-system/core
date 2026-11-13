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
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
] as const;

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

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
];

export const features = [
  {
    id: "analytics",
    kicker: "Product analytics",
    title: "See what people actually do",
    body: "Funnels, retention and event trends sit on one page instead of twelve dashboards. Every chart ends with a plain sentence saying what changed since last week, so the whole team reads it and not just the analyst.",
    points: [
      "Funnels and retention with no query language",
      "Weekly digest written in plain English",
      "Share any view with a single link",
    ],
  },
  {
    id: "issues",
    kicker: "Issue tracking",
    title: "Turn a drop-off into a ticket in one click",
    body: "Spot a broken step in a funnel and file the issue from the same screen, with the cohort, the chart and the session count already attached. Engineers get context, not a screenshot.",
    points: [
      "Issues link back to the data that raised them",
      "Boards, labels and a keyboard-first inbox",
      "Close the loop: see the metric move after the fix",
    ],
  },
  {
    id: "teams",
    kicker: "Built for small teams",
    title: "Set up in an afternoon, priced per seat",
    body: "No sales call, no tracking plan workshop. Install the snippet, name your key events and invite the team. Pricing stays flat per seat, and your data stays in the EU, encrypted at rest.",
    points: [
      "One snippet, no tracking plan to maintain",
      "EU data storage, encrypted at rest",
      "Free plan for solo projects, no card required",
    ],
  },
] as const;

export interface ComparisonRow {
  feature: string;
  free: string | boolean;
  team: string | boolean;
  business: string | boolean;
}

export const comparison: ComparisonRow[] = [
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "History", free: "7 days", team: "1 year", business: "Unlimited" },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "SSO and audit log", free: false, team: false, business: true },
  {
    feature: "Support",
    free: "Community",
    team: "Email",
    business: "Priority",
  },
];

/** Yearly billing is two months free: 10 months' price for 12 months. */
export const YEARLY_MONTHS_CHARGED = 10;

export function yearlyPrice(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_CHARGED;
}
