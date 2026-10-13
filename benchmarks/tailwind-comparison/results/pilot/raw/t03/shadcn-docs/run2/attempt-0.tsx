"use client"

import { useState } from "react"
import { Check, Minus, Sparkles } from "lucide-react"

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
  monthly: number
  yearly: number
  cta: string
  highlighted: boolean
  features: string[]
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For side projects and individuals getting started.",
    monthly: 0,
    yearly: 0,
    cta: "Start for free",
    highlighted: false,
    features: [
      "Up to 3 projects",
      "1 GB storage",
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
      "100 GB storage",
      "Priority email support",
      "90-day activity history",
      "Custom domains",
      "Advanced analytics",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with security and scale needs.",
    monthly: 79,
    yearly: 65,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Pro",
      "1 TB storage",
      "Dedicated success manager",
      "Unlimited activity history",
      "SAML single sign-on",
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
      { feature: "Storage", values: ["1 GB", "100 GB", "1 TB"] },
      { feature: "Team members", values: ["1", "Up to 20", "Unlimited"] },
      { feature: "Activity history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared workspaces", values: [false, true, true] },
      { feature: "Custom domains", values: [false, true, true] },
      { feature: "Advanced analytics", values: [false, true, true] },
      { feature: "Audit logs", values: [false, false, true] },
    ],
  },
  {
    group: "Security and support",
    rows: [
      { feature: "SAML single sign-on", values: [false, false, true] },
      { feature: "Uptime SLA", values: [false, false, "99.99%"] },
      {
        feature: "Support",
        values: ["Community", "Priority email", "Dedicated manager"],
      },
    ],
  },
]

const faqs: { question: string; answer: string }[] = [
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and are prorated, while downgrades apply at the start of your next billing cycle.",
  },
  {
    question: "How does the 14-day free trial work?",
    answer:
      "The Pro trial gives you full access to every feature with no credit card required. If you do not add a payment method before the trial ends, your workspace moves to the Starter plan and nothing is deleted.",
  },
  {
    question: "What happens if I go over my storage limit?",
    answer:
      "We never delete your files. You will get an email when you reach 80% and 100% of your limit, and new uploads pause until you free up space or move to a larger plan.",
  },
  {
    question: "Do you offer discounts for nonprofits or students?",
    answer:
      "We offer 50% off Pro for registered nonprofits, open source maintainers and verified students. Reach out to our support team with proof of status and we will apply the discount within one business day.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with bank transfer on annual contracts.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Absolutely. Cancel from your billing settings in a couple of clicks. You keep access until the end of the period you have already paid for, and you can export all of your data first.",
  },
]

function formatPrice(value: number): string {
  return value === 0 ? "$0" : `$${value}`
}

function ComparisonCell({ value, tier }: { value: CellValue; tier: string }) {
  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>
  }
  return value ? (
    <>
      <Check className="mx-auto size-4 text-primary" aria-hidden="true" />
      <span className="sr-only">Included in {tier}</span>
    </>
  ) : (
    <>
      <Minus
        className="mx-auto size-4 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="sr-only">Not included in {tier}</span>
    </>
  )
}

export default function PricingPage() {
  const [yearly, setYearly] = useState<boolean>(true)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <section aria-labelledby="pricing-heading" className="text-center">
        <Badge variant="secondary" className="mb-4">
          Pricing
        </Badge>
        <h1
          id="pricing-heading"
          className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Simple pricing that scales with you
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          Start free, upgrade when your team grows. No hidden fees, no
          surprises, and you can cancel whenever you like.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Label
            htmlFor="billing-toggle"
            className={cn(!yearly && "font-semibold")}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={yearly}
            onCheckedChange={setYearly}
            aria-label="Bill yearly"
          />
          <Label
            htmlFor="billing-toggle"
            className={cn(yearly && "font-semibold")}
          >
            Yearly
          </Label>
          <Badge variant="outline">Save 20%</Badge>
        </div>
      </section>

      <section
        aria-label="Plans"
        className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch lg:gap-8"
      >
        {tiers.map((tier) => {
          const price = yearly ? tier.yearly : tier.monthly
          return (
            <Card
              key={tier.id}
              className={cn(
                "relative flex flex-col",
                tier.highlighted &&
                  "border-primary shadow-lg ring-2 ring-primary md:-my-4 md:py-10"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  {tier.highlighted && (
                    <Badge>
                      <Sparkles aria-hidden="true" />
                      Most popular
                    </Badge>
                  )}
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {formatPrice(price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {price === 0 ? "forever" : "/ user / month"}
                  </span>
                </p>
                {price !== 0 && (
                  <p className="-mt-4 text-xs text-muted-foreground">
                    {yearly ? "Billed annually" : "Billed monthly"}
                  </p>
                )}
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
                  variant={tier.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {tier.cta}
                  <span className="sr-only"> for the {tier.name} plan</span>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </section>

      <section aria-labelledby="compare-heading" className="mt-20 lg:mt-28">
        <h2
          id="compare-heading"
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Compare plans
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Every feature, side by side, so you can pick the plan that fits.
        </p>

        <div className="mt-8 rounded-lg border">
          <Table>
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
                      tier.highlighted && "text-foreground"
                    )}
                  >
                    {tier.name}
                    {tier.highlighted && (
                      <Badge className="ml-2 hidden sm:inline-flex">
                        Popular
                      </Badge>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {comparison.map((group) => (
              <TableBody key={group.group}>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead
                    scope="colgroup"
                    colSpan={4}
                    className="pl-4 font-semibold text-foreground"
                  >
                    {group.group}
                  </TableHead>
                </TableRow>
                {group.rows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableHead scope="row" className="pl-4 font-normal">
                      {row.feature}
                    </TableHead>
                    {row.values.map((value, index) => (
                      <TableCell
                        key={tiers[index].id}
                        className={cn(
                          "text-center",
                          tiers[index].highlighted && "bg-primary/5"
                        )}
                      >
                        <ComparisonCell
                          value={value}
                          tier={tiers[index].name}
                        />
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
        className="mx-auto mt-20 max-w-3xl lg:mt-28"
      >
        <h2
          id="faq-heading"
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-8 w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section
        aria-labelledby="cta-heading"
        className="mt-20 rounded-xl border bg-muted/40 px-6 py-10 text-center lg:mt-28"
      >
        <h2
          id="cta-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Still have questions?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Our team replies within one business day. Tell us about your project
          and we will help you choose the right plan.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg">Talk to sales</Button>
          <Button size="lg" variant="outline">
            Read the docs
          </Button>
        </div>
      </section>
    </main>
  )
}
