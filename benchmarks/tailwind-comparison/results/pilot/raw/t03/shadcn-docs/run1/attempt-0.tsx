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
  TableCaption,
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
  monthly: number
  yearly: number
  cta: string
  highlighted?: boolean
  features: string[]
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For side projects and small teams getting started.",
    monthly: 0,
    yearly: 0,
    cta: "Start for free",
    features: [
      "Up to 3 projects",
      "5 GB storage",
      "Community support",
      "7-day activity history",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that ship every week.",
    monthly: 24,
    yearly: 19,
    cta: "Start 14-day trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250 GB storage",
      "Priority email support",
      "90-day activity history",
      "Custom domains and SSO",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with advanced security needs.",
    monthly: 79,
    yearly: 65,
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Dedicated success manager",
      "Unlimited activity history",
      "Audit logs and SLA",
    ],
  },
]

type Cell = boolean | string

type Row = {
  feature: string
  values: [Cell, Cell, Cell]
}

type Group = {
  title: string
  rows: Row[]
}

const comparison: Group[] = [
  {
    title: "Usage",
    rows: [
      { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Storage", values: ["5 GB", "250 GB", "Unlimited"] },
      { feature: "Team members", values: ["Up to 5", "Up to 50", "Unlimited"] },
      { feature: "Activity history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    title: "Collaboration",
    rows: [
      { feature: "Shared workspaces", values: [true, true, true] },
      { feature: "Custom domains", values: [false, true, true] },
      { feature: "Role-based permissions", values: [false, true, true] },
    ],
  },
  {
    title: "Security and support",
    rows: [
      { feature: "Single sign-on (SSO)", values: [false, true, true] },
      { feature: "Audit logs", values: [false, false, true] },
      { feature: "Uptime SLA", values: [false, false, "99.99%"] },
      {
        feature: "Support",
        values: ["Community", "Priority email", "Dedicated manager"],
      },
    ],
  },
]

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and we prorate the difference; downgrades apply at the start of your next billing cycle.",
  },
  {
    q: "How does the 14-day trial work?",
    a: "The Pro trial gives you full access to every Pro feature with no credit card required. If you do not upgrade by the end of the trial, your workspace moves to the free Starter plan and nothing is deleted.",
  },
  {
    q: "What happens if I exceed my storage limit?",
    a: "We will email you at 80% and 100% of your limit. Existing files stay available, but new uploads are paused until you free up space or move to a larger plan.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off Pro for verified nonprofits, open-source maintainers and educational institutions. Reach out to our team with proof of status and we will apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with bank transfer on annual contracts.",
  },
]

function formatPrice(value: number): string {
  return value === 0 ? "$0" : `$${value}`
}

function ComparisonValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <>
        <CheckIcon
          className="mx-auto size-4 text-primary"
          aria-hidden="true"
        />
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
  const [yearly, setYearly] = React.useState(true)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
      <header className="mx-auto max-w-2xl text-center">
        <Badge variant="secondary" className="mb-4">
          Pricing
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Simple pricing that scales with your team
        </h1>
        <p className="mt-4 text-base text-muted-foreground text-pretty sm:text-lg">
          Start free, upgrade when you are ready. No hidden fees, and you can
          cancel at any time.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Label htmlFor="billing-cycle" className="cursor-pointer">
            Monthly
          </Label>
          <Switch
            id="billing-cycle"
            checked={yearly}
            onCheckedChange={setYearly}
            aria-label="Bill yearly"
          />
          <Label htmlFor="billing-cycle" className="cursor-pointer">
            Yearly
          </Label>
          <Badge variant="outline">Save 20%</Badge>
        </div>
      </header>

      <section
        aria-labelledby="plans-heading"
        className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch"
      >
        <h2 id="plans-heading" className="sr-only">
          Plans
        </h2>
        {tiers.map((tier) => {
          const price = yearly ? tier.yearly : tier.monthly
          return (
            <Card
              key={tier.id}
              className={cn(
                "relative",
                tier.highlighted &&
                  "border-primary shadow-lg ring-1 ring-primary lg:-my-4 lg:py-10"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  {tier.highlighted && <Badge>Most popular</Badge>}
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {formatPrice(price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    per user / month
                  </span>
                </p>
                <p className="mt-1 min-h-5 text-xs text-muted-foreground">
                  {price === 0
                    ? "Free forever"
                    : yearly
                      ? "Billed annually"
                      : "Billed monthly"}
                </p>
                <ul className="mt-6 space-y-3 text-sm">
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
                  type="button"
                >
                  {tier.cta}
                  <span className="sr-only"> for the {tier.name} plan</span>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </section>

      <section aria-labelledby="compare-heading" className="mt-20 sm:mt-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="compare-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Compare plans
          </h2>
          <p className="mt-3 text-muted-foreground">
            A detailed look at what is included in each plan.
          </p>
        </div>

        <div className="mt-8 rounded-xl border">
          <Table className="min-w-[640px]">
            <TableCaption className="sr-only">
              Feature comparison between the Starter, Pro and Enterprise plans
            </TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="w-1/3 px-4">
                  Feature
                </TableHead>
                {tiers.map((tier) => (
                  <TableHead
                    key={tier.id}
                    scope="col"
                    className={cn(
                      "px-4 text-center",
                      tier.highlighted && "bg-primary/5 text-primary"
                    )}
                  >
                    {tier.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.map((group) => (
                <React.Fragment key={group.title}>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead
                      scope="colgroup"
                      colSpan={4}
                      className="px-4 text-xs tracking-wide text-muted-foreground uppercase"
                    >
                      {group.title}
                    </TableHead>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableHead scope="row" className="px-4 font-normal">
                        {row.feature}
                      </TableHead>
                      {row.values.map((value, i) => (
                        <TableCell
                          key={tiers[i].id}
                          className={cn(
                            "px-4 text-center",
                            tiers[i].highlighted && "bg-primary/5 font-medium"
                          )}
                        >
                          <ComparisonValue value={value} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto mt-20 max-w-3xl sm:mt-28"
      >
        <div className="text-center">
          <h2
            id="faq-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Can&apos;t find what you are looking for? Our team replies within
            one business day.
          </p>
        </div>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-base">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  )
}
