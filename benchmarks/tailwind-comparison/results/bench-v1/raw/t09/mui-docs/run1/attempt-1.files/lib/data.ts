export interface Plan {
  name: string;
  priceMonth: number;
  seats: string;
  blurb: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FeatureSection {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  stat: { value: string; label: string };
}

export interface ComparisonRow {
  feature: string;
  free: string | boolean;
  team: string | boolean;
  business: string | boolean;
}

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
  brandColor: "#E8590C",
  headingFont: 'Georgia, "Times New Roman", serif',
  bodyFont: "ui-sans-serif, system-ui, sans-serif",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const logos: string[] = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
];

export const featureSections: FeatureSection[] = [
  {
    eyebrow: "Analytics",
    title: "Numbers your whole team will open on Monday",
    body: "Lumen turns raw events into a single weekly page: who showed up, what they did, and what changed since last week. No dashboards to build, no query language to learn.",
    points: [
      "A weekly digest written in plain sentences, not charts alone",
      "Funnels and retention ready after your first 100 events",
      "Every metric links to the sessions behind it",
    ],
    stat: { value: "9 min", label: "median time to first insight" },
  },
  {
    eyebrow: "Issue tracking",
    title: "Bugs that arrive with their own evidence",
    body: "When something breaks, Lumen opens the issue for you and attaches the session, the release and the affected users. Triage takes a glance instead of a meeting.",
    points: [
      "Issues grouped by cause, so one bug is one ticket",
      "Each issue shows how many users it touched",
      "Close the loop: see the fix land in the metrics",
    ],
    stat: { value: "62%", label: "fewer duplicate tickets" },
  },
  {
    eyebrow: "Built for small teams",
    title: "Quiet by design, clear by default",
    body: "Lumen is priced and shaped for teams of two to twenty. Sensible defaults, a short settings page, and data that stays in the EU, encrypted at rest.",
    points: [
      "Set up in an afternoon, with no analyst required",
      "Per-seat pricing with no event-volume surprises",
      "EU data residency with encryption at rest",
    ],
    stat: { value: "2–20", label: "people on the typical Lumen team" },
  },
];

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For a side project or a first look at Lumen.",
    features: ["1 project", "7-day history", "Community support"],
    cta: "Start for free",
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For product teams who ship every week.",
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
    blurb: "For teams that need control and fast answers.",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
    cta: "Talk to sales",
  },
];

export const comparison: ComparisonRow[] = [
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  {
    feature: "History",
    free: "7 days",
    team: "1 year",
    business: "Unlimited",
  },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "SSO and audit log", free: false, team: false, business: true },
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

/** Yearly billing is two months free: pay for 10 months. */
export const YEARLY_MONTHS_PAID = 10;

export function yearlyPrice(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_PAID;
}

export function yearlyPerMonth(priceMonth: number): number {
  return (priceMonth * YEARLY_MONTHS_PAID) / 12;
}
