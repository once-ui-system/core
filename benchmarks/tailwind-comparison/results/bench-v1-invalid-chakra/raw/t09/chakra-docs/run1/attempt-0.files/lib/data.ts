export interface Plan {
  name: string
  priceMonth: number
  seats: string
  features: string[]
  highlight?: boolean
  blurb: string
  cta: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface Feature {
  eyebrow: string
  title: string
  body: string
  points: string[]
}

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
}

export const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/pricing#faq" },
]

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
]

export const features: Feature[] = [
  {
    eyebrow: "Analytics",
    title: "Numbers your whole team will open on Monday",
    body: "Lumen turns raw events into one short weekly page: what grew, what broke and what is worth your attention. No dashboards to assemble, no query language to learn.",
    points: [
      "A plain-language summary of every release",
      "Funnels and retention without a data team",
      "Events stay in the EU, encrypted at rest",
    ],
  },
  {
    eyebrow: "Issue tracking",
    title: "Bugs are filed from the data that revealed them",
    body: "When a metric drops, open an issue from the chart itself. The graph, the affected cohort and the release are attached for you, so whoever picks it up starts with context.",
    points: [
      "One click from a chart to a ready-made issue",
      "Cohort and release attached automatically",
      "A lightweight board that fits teams of three to thirty",
    ],
  },
  {
    eyebrow: "Small teams",
    title: "Built to be read, not administered",
    body: "Lumen keeps the surface area small on purpose. Setup takes an afternoon, permissions are three roles, and the weekly digest lands where your team already talks.",
    points: [
      "Single sign-on and audit log when you grow into them",
      "Digest by email or in your chat tool",
      "Priority support on the Business plan",
    ],
  },
]

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For a side project or a first look.",
    cta: "Start for free",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For product teams shipping every week.",
    cta: "Start a Team trial",
    highlight: true,
    features: [
      "Unlimited projects",
      "1-year history",
      "Issue tracker",
      "Email support",
    ],
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    blurb: "For teams with security and audit needs.",
    cta: "Talk to sales",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
  },
]

/** Yearly billing is two months free: 10 months are charged. */
export const YEARLY_MONTHS_CHARGED = 10

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_CHARGED
}

export function yearlyPerMonth(priceMonth: number): number {
  return Math.round((yearlyTotal(priceMonth) / 12) * 100) / 100
}

export function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}

export interface ComparisonRow {
  feature: string
  free: string | boolean
  team: string | boolean
  business: string | boolean
}

export const comparison: ComparisonRow[] = [
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
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
  { feature: "EU data storage", free: true, team: true, business: true },
]

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
]
