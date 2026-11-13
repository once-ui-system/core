export interface Plan {
  name: string
  priceMonth: number
  seats: string
  blurb: string
  features: string[]
  highlight?: boolean
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

export interface NavItem {
  label: string
  href: string
}

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
} as const

export const navItems: NavItem[] = [
  { label: "Product", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Customers", href: "/#customers" },
]

export const logos: string[] = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
]

export const features: Feature[] = [
  {
    eyebrow: "Analytics",
    title: "Numbers that fit on one screen",
    body: "Lumen turns raw events into a short weekly digest: what grew, what broke, and what nobody opened. No dashboards to maintain, nothing to decode.",
    points: [
      "One page per product area, not forty charts",
      "Plain-language summaries of every change",
      "Share a live view with a single link",
    ],
  },
  {
    eyebrow: "Issues",
    title: "A tracker that stays out of the way",
    body: "Capture a bug from the exact chart where you spotted it. Issues keep the context they came from, so nobody has to ask for reproduction steps.",
    points: [
      "Create an issue straight from any metric",
      "Keyboard-first triage for quick backlog passes",
      "Cycles and priorities without the ceremony",
    ],
  },
  {
    eyebrow: "Teamwork",
    title: "Built for teams of three to thirty",
    body: "Everyone sees the same picture. Comment on a trend, assign the follow-up, and close the loop in the same place where the question started.",
    points: [
      "Threads attached to charts and issues",
      "Weekly digest delivered to email or chat",
      "EU data hosting, encrypted at rest",
    ],
  },
]

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For solo builders trying Lumen on a side project.",
    features: ["1 project", "7-day history", "Community support"],
    cta: "Start for free",
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For small teams that ship every week.",
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
]

/** Yearly billing is two months free: 10 months charged out of 12. */
export const YEARLY_MONTHS_CHARGED = 10

export function formatPrice(priceMonth: number, yearly: boolean): string {
  if (priceMonth === 0) return "$0"
  if (!yearly) return `$${priceMonth}`
  const perMonth = (priceMonth * YEARLY_MONTHS_CHARGED) / 12
  return `$${Number.isInteger(perMonth) ? perMonth : perMonth.toFixed(2)}`
}

export function formatYearlyTotal(priceMonth: number): string {
  return `$${priceMonth * YEARLY_MONTHS_CHARGED}`
}

export type ComparisonValue = string | boolean

export interface ComparisonRow {
  feature: string
  free: ComparisonValue
  team: ComparisonValue
  business: ComparisonValue
}

export const comparison: ComparisonRow[] = [
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  {
    feature: "History",
    free: "7 days",
    team: "1 year",
    business: "Unlimited",
  },
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "Weekly digest", free: true, team: true, business: true },
  { feature: "SSO", free: false, team: false, business: true },
  { feature: "Audit log", free: false, team: false, business: true },
  {
    feature: "Support",
    free: "Community",
    team: "Email",
    business: "Priority",
  },
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
