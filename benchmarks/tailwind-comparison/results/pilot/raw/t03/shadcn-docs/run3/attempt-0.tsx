"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type Tier = {
  id: string
  name: string
  description: string
  monthly: number | null
  annual: number | null
  cta: string
  highlighted: boolean
  features: string[]
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For side projects and solo developers getting started.",
    monthly: 0,
    annual: 0,
    cta: "Start for free",
    highlighted: false,
    features: [
      "Up to 3 projects",
      "1 GB of storage",
      "Community support",
      "7-day activity history",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that ship every week.",
    monthly: 24,
    annual: 19,
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "100 GB of storage",
      "Priority email support",
      "1-year activity history",
      "Custom domains and roles",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with advanced security needs.",
    monthly: null,
    annual: null,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "SAML single sign-on",
      "Dedicated success manager",
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

const comparison: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Storage", values: ["1 GB", "100 GB", "Unlimited"] },
      { feature: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { feature: "API requests per month", values: ["10k", "1M", "Custom"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared workspaces", values: [false, true, true] },
      { feature: "Custom roles and permissions", values: [false, true, true] },
      { feature: "Review and approval flows", values: [false, true, true] },
      { feature: "Activity history", values: ["7 days", "1 year", "Unlimited"] },
    ],
  },
  {
    group: "Security and support",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SAML single sign-on", values: [false, false, true] },
      { feature: "Audit logs", values: [false, true, true] },
      {
        feature: "Support",
        values: ["Community", "Priority email", "Dedicated manager"],
      },
      { feature: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
]

const faqs: { q: string; a: string }[] = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and we prorate the difference. Downgrades apply at the end of your current billing period.",
  },
  {
    q: "How does the 14-day Pro trial work?",
    a: "You get full access to every Pro feature for 14 days. No credit card is required to start. If you do not add a payment method before the trial ends, your workspace moves to the Starter plan and nothing is deleted.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "We never cut off your service without warning. You will get an email at 80% and 100% of your limit, and you can upgrade or remove data at any point. Projects over the limit become read-only until you are back under it.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "Yes. Verified nonprofits, open-source maintainers and students get 50% off the Pro plan. Send us a message from the contact page and include a link that proves your status.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with bank transfer on net-30 terms.",
  },
  {
    q: "Can I cancel and get a refund?",
    a: "You can cancel at any time and keep access until the end of your billing period. If you are on an annual plan and cancel within 30 days of purchase, we will refund you in full.",
  },
]

function renderCell(value: CellValue) {
  if (value === true) {
    return (
      <>
        <CheckIcon className="mx-auto size-4 text-primary" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <MinusIcon
          className="mx-auto size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="sr-only">Not included</span>
      </>
    )
  }
  return <span>{value}</span>
}

export default function PricingPage() {
  const [annual, setAnnual] = React.useState(true)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary">Pricing</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Simple pricing that scales with your team
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Start free, upgrade when you are ready. No hidden fees, no
          long-term contracts, and you can cancel whenever you like.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Label htmlFor="billing-toggle" className="text-sm font-medium">
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={annual}
            onCheckedChange={setAnnual}
            aria-label="Bill annually"
          />
          <Label htmlFor="billing-toggle" className="text-sm font-medium">
            Annual
          </Label>
          <Badge variant="outline" className="text-xs">
            Save 20%
          </Badge>
        </div>
      </header>

      <section
        aria-labelledby="plans-heading"
        className="mt-12 sm:mt-16"
      >
        <h2 id="plans-heading" className="sr-only">
          Plans
        </h2>
        <ul className="grid list-none items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((tier) => {
            const price = annual ? tier.annual : tier.monthly
            return (
              <li key={tier.id} className="flex">
                <Card
                  className={cn(
                    "relative w-full",
                    tier.highlighted &&
                      "border-primary shadow-lg ring-1 ring-primary lg:-my-4 lg:py-10"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">
                        <h3>{tier.name}</h3>
                      </CardTitle>
                      {tier.highlighted && <Badge>Most popular</Badge>}
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-6">
                    <div aria-live="polite">
                      {price === null ? (
                        <p className="text-4xl font-bold tracking-tight">
                          Custom
                        </p>
                      ) : (
                        <p className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold tracking-tight">
                            ${price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            per user / month
                          </span>
                        </p>
                      )}
                      <p className="mt-1 min-h-5 text-xs text-muted-foreground">
                        {price === null
                          ? "Volume pricing and custom contracts"
                          : price === 0
                            ? "Free forever"
                            : annual
                              ? "Billed annually"
                              : "Billed monthly"}
                      </p>
                    </div>
                    <ul className="flex flex-col gap-3 text-sm">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckIcon
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
                      variant={tier.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {tier.cta}
                      <span className="sr-only"> for the {tier.name} plan</span>
                    </Button>
                  </CardFooter>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="compare-heading" className="mt-20 sm:mt-28">
        <h2
          id="compare-heading"
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Compare plans in detail
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Every feature across Starter, Pro and Enterprise, side by side.
        </p>

        <div className="mt-8 rounded-xl border">
          <Table>
            <caption className="sr-only">
              Feature comparison of the Starter, Pro and Enterprise plans
            </caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="min-w-40 pl-4">
                  Feature
                </TableHead>
                {tiers.map((tier) => (
                  <TableHead
                    key={tier.id}
                    scope="col"
                    className={cn(
                      "min-w-28 text-center",
                      tier.highlighted && "bg-muted/50 font-semibold text-foreground"
                    )}
                  >
                    {tier.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {comparison.map((group) => (
              <TableBody key={group.group}>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead
                    scope="colgroup"
                    colSpan={4}
                    className="pl-4 text-xs tracking-wide text-muted-foreground uppercase"
                  >
                    {group.group}
                  </TableHead>
                </TableRow>
                {group.rows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableHead scope="row" className="pl-4 font-normal text-foreground">
                      {row.feature}
                    </TableHead>
                    {row.values.map((value, i) => (
                      <TableCell
                        key={tiers[i].id}
                        className={cn(
                          "text-center",
                          tiers[i].highlighted && "bg-muted/50"
                        )}
                      >
                        {renderCell(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto mt-20 max-w-3xl sm:mt-28"
      >
        <h2
          id="faq-heading"
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Frequently asked questions
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Cannot find the answer you need? Our team replies within one
          business day.
        </p>
        <Accordion type="single" collapsible className="mt-8 w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  )
}
