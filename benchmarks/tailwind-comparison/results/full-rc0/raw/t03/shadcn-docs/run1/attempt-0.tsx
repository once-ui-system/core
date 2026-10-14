"use client"

import * as React from "react"
import { Check, Minus, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type Tier = {
  id: "starter" | "team" | "business"
  name: string
  tagline: string
  monthly: number
  annual: number
  cta: string
  highlighted: boolean
  features: string[]
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo makers shipping their first projects.",
    monthly: 12,
    annual: 9,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "Up to 3 active projects",
      "5 GB of asset storage",
      "Community support",
      "7-day activity history",
      "Basic analytics",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For growing teams that need to move fast together.",
    monthly: 36,
    annual: 29,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "100 GB of asset storage",
      "Priority email support",
      "90-day activity history",
      "Advanced analytics & exports",
      "Role-based permissions",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For organizations with security and scale requirements.",
    monthly: 89,
    annual: 72,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Team",
      "1 TB of asset storage",
      "Dedicated success manager",
      "Unlimited activity history",
      "SSO / SAML and audit logs",
      "99.99% uptime SLA",
    ],
  },
]

type CellValue = boolean | string

type ComparisonRow = {
  feature: string
  values: [CellValue, CellValue, CellValue]
}

type ComparisonGroup = {
  group: string
  rows: ComparisonRow[]
}

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Workspace",
    rows: [
      { feature: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Team members included", values: ["1", "10", "50"] },
      { feature: "Asset storage", values: ["5 GB", "100 GB", "1 TB"] },
      { feature: "Custom domains", values: [false, true, true] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared comments & mentions", values: [true, true, true] },
      { feature: "Role-based permissions", values: [false, true, true] },
      { feature: "Guest reviewer access", values: [false, true, true] },
      { feature: "Activity history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Security & compliance",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SSO / SAML", values: [false, false, true] },
      { feature: "Audit logs", values: [false, false, true] },
      { feature: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
  {
    group: "Support",
    rows: [
      { feature: "Community forum", values: [true, true, true] },
      { feature: "Priority email support", values: [false, true, true] },
      { feature: "Dedicated success manager", values: [false, false, true] },
    ],
  },
]

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access to the Team plan for 14 days with no credit card required. At the end of the trial you can pick any plan, or your workspace moves to a read-only state so nothing is lost.",
  },
  {
    q: "Can I switch plans or cancel at any time?",
    a: "Yes. Upgrades take effect immediately and are prorated for the rest of the billing period. Downgrades and cancellations take effect at the end of your current period, and you keep access until then.",
  },
  {
    q: "What counts as a team member?",
    a: "Anyone who can create or edit content in your workspace counts as a member. Guest reviewers who only view and comment on shared links are free and do not count toward your limit.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 40% off any plan for registered nonprofits, accredited educational institutions, and open-source maintainers. Reach out to our team with proof of status and we will apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Annual Business plans can also be paid by invoice with bank transfer, and we issue VAT-compliant receipts for every payment.",
  },
  {
    q: "What happens if I exceed my storage limit?",
    a: "We will notify you at 80% and 100% of your limit. Existing files stay available, and you can upgrade your plan or purchase additional storage in 50 GB increments whenever you need it.",
  },
]

function formatPrice(value: number): string {
  return `$${value}`
}

function ComparisonCell({ value, tierName }: { value: CellValue; tierName: string }) {
  if (typeof value === "string") {
    return <span className="font-medium">{value}</span>
  }
  if (value) {
    return (
      <>
        <Check className="mx-auto size-4 text-primary" aria-hidden="true" />
        <span className="sr-only">Included in {tierName}</span>
      </>
    )
  }
  return (
    <>
      <Minus className="mx-auto size-4 text-muted-foreground/60" aria-hidden="true" />
      <span className="sr-only">Not included in {tierName}</span>
    </>
  )
}

export default function PricingPage() {
  const [annual, setAnnual] = React.useState<boolean>(true)

  const handleSelect = (tier: Tier) => {
    if (tier.id === "business") {
      toast.success("Thanks for your interest!", {
        description: "Our sales team will reach out within one business day.",
      })
      return
    }
    toast.success(`${tier.name} trial started`, {
      description: `Your 14-day free trial is on the ${
        annual ? "annual" : "monthly"
      } billing plan.`,
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Hero */}
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            14-day free trial on every plan
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Start free, upgrade when you are ready, and never pay for seats nobody
            uses. Every plan includes unlimited guest reviewers.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm font-medium transition-colors",
                !annual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </label>
            <Switch
              id="billing-toggle"
              checked={annual}
              onCheckedChange={setAnnual}
              aria-label="Toggle annual billing"
            />
            <label
              htmlFor="billing-toggle"
              className={cn(
                "flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors",
                annual ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Annual
              <Badge variant="outline" className="text-xs">
                Save 20%
              </Badge>
            </label>
          </div>
        </header>

        {/* Tiers */}
        <section
          aria-labelledby="plans-heading"
          className="mt-12 sm:mt-16"
        >
          <h2 id="plans-heading" className="sr-only">
            Plans
          </h2>
          <div className="grid items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
            {TIERS.map((tier) => {
              const price = annual ? tier.annual : tier.monthly
              return (
                <Card
                  key={tier.id}
                  className={cn(
                    "relative",
                    tier.highlighted &&
                      "border-primary shadow-lg ring-1 ring-primary lg:-my-4 lg:py-10"
                  )}
                >
                  {tier.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
                      <Sparkles aria-hidden="true" />
                      Most popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <h3>{tier.name}</h3>
                    </CardTitle>
                    <CardDescription>{tier.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-6">
                    <div>
                      <p className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">
                          {formatPrice(price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / member / month
                        </span>
                      </p>
                      <p className="mt-1 min-h-5 text-xs text-muted-foreground">
                        {annual
                          ? `Billed annually (${formatPrice(price * 12)} per member)`
                          : "Billed monthly, cancel anytime"}
                      </p>
                    </div>
                    <ul className="flex flex-col gap-3 text-sm">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      variant={tier.highlighted ? "default" : "outline"}
                      onClick={() => handleSelect(tier)}
                    >
                      {tier.cta}
                      <span className="sr-only"> for the {tier.name} plan</span>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Comparison */}
        <section
          aria-labelledby="compare-heading"
          className="mt-20 sm:mt-28"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="compare-heading"
              className="text-balance text-3xl font-bold tracking-tight"
            >
              Compare plans in detail
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every feature, side by side, so you can pick with confidence.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border">
            <Table className="min-w-[640px]">
              <TableCaption className="sr-only">
                Feature comparison across the Starter, Team and Business plans
              </TableCaption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className="h-14 w-[34%] px-4">
                    <span className="sr-only">Feature</span>
                  </TableHead>
                  {TIERS.map((tier) => (
                    <TableHead
                      key={tier.id}
                      scope="col"
                      className={cn(
                        "h-14 px-4 text-center text-base",
                        tier.highlighted && "bg-primary/5"
                      )}
                    >
                      {tier.name}
                      {tier.highlighted && (
                        <span className="sr-only"> (most popular)</span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              {COMPARISON.map((group) => (
                <TableBody key={group.group}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead
                      scope="colgroup"
                      colSpan={4}
                      className="h-10 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {group.group}
                    </TableHead>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableHead
                        scope="row"
                        className="h-12 px-4 font-normal"
                      >
                        {row.feature}
                      </TableHead>
                      {row.values.map((value, i) => (
                        <TableCell
                          key={TIERS[i].id}
                          className={cn(
                            "h-12 px-4 text-center",
                            TIERS[i].highlighted && "bg-primary/5"
                          )}
                        >
                          <ComparisonCell value={value} tierName={TIERS[i].name} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              ))}
            </Table>
          </div>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="faq-heading"
          className="mx-auto mt-20 max-w-3xl sm:mt-28"
        >
          <div className="text-center">
            <h2
              id="faq-heading"
              className="text-balance text-3xl font-bold tracking-tight"
            >
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Can&apos;t find what you are looking for? Email us at
              billing@northwind.example and we will help.
            </p>
          </div>
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="mt-8 rounded-xl border px-6"
          >
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.q} value={`item-${index}`}>
                <AccordionTrigger className="text-base">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </main>
  )
}
