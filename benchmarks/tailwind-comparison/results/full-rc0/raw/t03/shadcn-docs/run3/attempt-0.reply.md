```tsx
"use client";

import * as React from "react";
import { Check, Minus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TierId = "starter" | "growth" | "scale";

interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number; // per month, billed annually
  cta: string;
  highlighted: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo builders shipping their first project.",
    monthly: 12,
    yearly: 9,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "3 active projects",
      "5 GB file storage",
      "Community support",
      "7-day activity history",
      "Basic analytics",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For growing teams that need speed and collaboration.",
    monthly: 39,
    yearly: 31,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "100 GB file storage",
      "Priority email support",
      "90-day activity history",
      "Advanced analytics & exports",
      "Custom domains",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For organizations with security and compliance needs.",
    monthly: 99,
    yearly: 79,
    cta: "Talk to sales",
    highlighted: false,
    features: [
      "Everything in Growth",
      "1 TB file storage",
      "24/7 phone & chat support",
      "Unlimited activity history",
      "SAML single sign-on",
      "Dedicated success manager",
    ],
  },
];

type CellValue = boolean | string;

interface ComparisonRow {
  label: string;
  values: [CellValue, CellValue, CellValue];
}

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { label: "Active projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Team members", values: ["1", "Up to 15", "Unlimited"] },
      { label: "File storage", values: ["5 GB", "100 GB", "1 TB"] },
      { label: "API requests / month", values: ["10k", "250k", "5M"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { label: "Shared workspaces", values: [false, true, true] },
      { label: "Comments & mentions", values: [true, true, true] },
      { label: "Guest access", values: [false, true, true] },
      { label: "Custom domains", values: [false, true, true] },
    ],
  },
  {
    group: "Security & compliance",
    rows: [
      { label: "Two-factor authentication", values: [true, true, true] },
      { label: "Audit log", values: [false, "90 days", "Unlimited"] },
      { label: "SAML single sign-on", values: [false, false, true] },
      { label: "Data residency options", values: [false, false, true] },
    ],
  },
  {
    group: "Support",
    rows: [
      {
        label: "Support channel",
        values: ["Community", "Priority email", "24/7 phone & chat"],
      },
      { label: "Response time", values: ["—", "Within 8 hours", "Within 1 hour"] },
      { label: "Dedicated success manager", values: [false, false, true] },
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does the 14-day free trial work?",
    a: "Every paid plan starts with a 14-day trial with full access to that plan's features. You don't need to enter a credit card to begin, and we'll email you before the trial ends so there are no surprises.",
  },
  {
    q: "Can I switch plans or cancel at any time?",
    a: "Yes. Upgrades take effect immediately and are prorated for the rest of your billing period. Downgrades and cancellations apply at the end of the current period, and you keep access until then.",
  },
  {
    q: "What happens if I go over my plan limits?",
    a: "We'll never shut off your projects without warning. If you approach a limit, we send a notification and give you a 7-day grace period to upgrade or clean up usage before any restrictions apply.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 30% off any plan for verified nonprofits, open-source maintainers and students. Contact our team with proof of status and we'll apply the discount to your account within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Annual Scale plans can also be paid by invoice with bank transfer. All prices are in US dollars and exclude applicable taxes.",
  },
  {
    q: "Is my data secure?",
    a: "Your data is encrypted in transit and at rest, backed up daily, and stored in SOC 2 Type II audited data centers. Scale customers can additionally choose the region where their data is stored.",
  },
];

function formatPrice(n: number): string {
  return `$${n}`;
}

function ComparisonCell({
  value,
  tierName,
}: {
  value: CellValue;
  tierName: string;
}) {
  if (value === true) {
    return (
      <>
        <Check
          className="mx-auto size-4 text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">Included in {tierName}</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus
          className="mx-auto size-4 text-muted-foreground/60"
          aria-hidden="true"
        />
        <span className="sr-only">Not included in {tierName}</span>
      </>
    );
  }
  return <span>{value}</span>;
}

export default function PricingPage() {
  const [yearly, setYearly] = React.useState<boolean>(true);

  function handleSelect(tier: Tier) {
    if (tier.id === "scale") {
      toast.success("Thanks for your interest!", {
        description: "Our sales team will reach out within one business day.",
      });
    } else {
      toast.success(`${tier.name} trial started`, {
        description: `Your 14-day free trial of ${tier.name} is ready. No card required.`,
      });
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Hero */}
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles aria-hidden="true" />
            14-day free trial on every plan
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Start free, upgrade when you&apos;re ready, and cancel whenever you
            like. No hidden fees, no long-term contracts.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm transition-colors",
                !yearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={yearly}
              onCheckedChange={setYearly}
              aria-label="Bill annually"
            />
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm transition-colors",
                yearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Yearly
              <Badge variant="outline" className="ml-1">
                Save 20%
              </Badge>
            </Label>
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
          <ul className="grid list-none gap-6 p-0 md:grid-cols-3 md:items-stretch lg:gap-8">
            {TIERS.map((tier) => {
              const price = yearly ? tier.yearly : tier.monthly;
              return (
                <li
                  key={tier.id}
                  className={cn(
                    "relative flex",
                    tier.highlighted && "md:-my-4"
                  )}
                >
                  {tier.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 shadow-sm">
                      Most popular
                    </Badge>
                  )}
                  <Card
                    className={cn(
                      "w-full",
                      tier.highlighted &&
                        "border-primary shadow-lg ring-2 ring-primary md:py-10"
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        <h3>{tier.name}</h3>
                      </CardTitle>
                      <CardDescription>{tier.tagline}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-6">
                      <div>
                        <p className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold tracking-tight">
                            {formatPrice(price)}
                            <span className="sr-only">
                              {" "}
                              per month per seat
                              {yearly ? ", billed annually" : ""}
                            </span>
                          </span>
                          <span
                            className="text-sm text-muted-foreground"
                            aria-hidden="true"
                          >
                            / month
                          </span>
                        </p>
                        <p
                          className="mt-1 text-xs text-muted-foreground"
                          aria-hidden="true"
                        >
                          {yearly
                            ? `Billed annually (${formatPrice(price * 12)}/yr)`
                            : "Billed monthly"}
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
                        type="button"
                        size="lg"
                        variant={tier.highlighted ? "default" : "outline"}
                        className="w-full"
                        onClick={() => handleSelect(tier)}
                        aria-label={`${tier.cta} — ${tier.name} plan`}
                      >
                        {tier.cta}
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Prices shown per seat in USD. Taxes calculated at checkout.
          </p>
        </section>

        {/* Comparison */}
        <section
          aria-labelledby="compare-heading"
          className="mt-20 sm:mt-28"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="compare-heading"
              className="text-3xl font-bold tracking-tight"
            >
              Compare plans in detail
            </h2>
            <p className="mt-3 text-muted-foreground">
              A full breakdown of what&apos;s included so you can pick with
              confidence.
            </p>
          </div>

          <div className="mt-10 rounded-xl border bg-card">
            <Table className="min-w-[640px]">
              <caption className="sr-only">
                Feature comparison across the Starter, Growth and Scale plans
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead
                    scope="col"
                    className="sticky left-0 z-10 w-[40%] bg-card px-4 py-4"
                  >
                    <span className="sr-only">Feature</span>
                  </TableHead>
                  {TIERS.map((tier) => (
                    <TableHead
                      key={tier.id}
                      scope="col"
                      className={cn(
                        "px-4 py-4 text-center text-base",
                        tier.highlighted && "bg-primary/5"
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{tier.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {formatPrice(yearly ? tier.yearly : tier.monthly)}
                          /mo
                        </span>
                      </div>
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
                      className="sticky left-0 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {group.group}
                    </TableHead>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.label}>
                      <TableHead
                        scope="row"
                        className="sticky left-0 z-10 bg-card px-4 py-3 font-normal"
                      >
                        {row.label}
                      </TableHead>
                      {row.values.map((value, i) => (
                        <TableCell
                          key={TIERS[i].id}
                          className={cn(
                            "px-4 py-3 text-center",
                            TIERS[i].highlighted && "bg-primary/5"
                          )}
                        >
                          <ComparisonCell
                            value={value}
                            tierName={TIERS[i].name}
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

        {/* FAQ */}
        <section
          aria-labelledby="faq-heading"
          className="mx-auto mt-20 max-w-3xl sm:mt-28"
        >
          <div className="text-center">
            <h2
              id="faq-heading"
              className="text-3xl font-bold tracking-tight"
            >
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Email us at
              billing@example.com and we&apos;ll get back to you quickly.
            </p>
          </div>
          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="mt-8 rounded-xl border bg-card px-4 sm:px-6"
          >
            {FAQS.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Closing CTA */}
        <section className="mt-20 rounded-xl border bg-muted/40 px-6 py-10 text-center sm:mt-28">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Join over 8,000 teams already building with us. Try any plan free
            for 14 days.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              onClick={() => handleSelect(TIERS[1])}
            >
              Start free trial
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => handleSelect(TIERS[2])}
            >
              Talk to sales
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
```