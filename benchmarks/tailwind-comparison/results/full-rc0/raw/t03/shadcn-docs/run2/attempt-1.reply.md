```tsx
"use client";

import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "annual";

interface Tier {
  id: "starter" | "pro" | "business";
  name: string;
  description: string;
  monthly: number;
  annual: number; // per month, billed annually
  cta: string;
  highlighted: boolean;
  features: string[];
}

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals and side projects getting off the ground.",
    monthly: 12,
    annual: 9,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "Up to 3 projects",
      "5 GB of storage",
      "Basic analytics",
      "Community support",
      "Email notifications",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need speed, insight and control.",
    monthly: 36,
    annual: 29,
    cta: "Upgrade to Pro",
    highlighted: true,
    features: [
      "Unlimited projects",
      "100 GB of storage",
      "Advanced analytics and exports",
      "Priority email support",
      "Custom domains",
      "Role-based permissions",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "For organizations with security and compliance needs.",
    monthly: 89,
    annual: 72,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Pro",
      "1 TB of storage",
      "SSO and SAML",
      "Audit logs",
      "99.99% uptime SLA",
      "Dedicated success manager",
    ],
  },
];

type CellValue = boolean | string;

interface ComparisonRow {
  feature: string;
  values: [CellValue, CellValue, CellValue];
}

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const comparison: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Team members", values: ["1", "10", "Unlimited"] },
      { feature: "Storage", values: ["5 GB", "100 GB", "1 TB"] },
      { feature: "API requests / month", values: ["10k", "500k", "5M"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared workspaces", values: [false, true, true] },
      { feature: "Role-based permissions", values: [false, true, true] },
      { feature: "Custom domains", values: [false, true, true] },
      { feature: "Guest access", values: [false, "5 guests", "Unlimited"] },
    ],
  },
  {
    group: "Security",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SSO and SAML", values: [false, false, true] },
      { feature: "Audit logs", values: [false, false, true] },
      { feature: "Data retention controls", values: [false, "90 days", "Custom"] },
    ],
  },
  {
    group: "Support",
    rows: [
      { feature: "Community forum", values: [true, true, true] },
      { feature: "Email support", values: [false, "Priority", "Priority"] },
      { feature: "Uptime SLA", values: [false, false, "99.99%"] },
      { feature: "Dedicated success manager", values: [false, false, true] },
    ],
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Can I try a paid plan before I commit?",
    a: "Yes. Every paid plan includes a 14-day free trial with full access to its features. You don't need to enter a credit card to start, and we'll remind you before the trial ends.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual plans are billed once per year at a discounted monthly rate, saving you roughly 20% compared to paying month to month. You can switch between monthly and annual billing at any time from your account settings.",
  },
  {
    q: "Can I change or cancel my plan later?",
    a: "Absolutely. Upgrades take effect immediately and are prorated. Downgrades and cancellations apply at the end of your current billing period, and you keep access until then.",
  },
  {
    q: "What happens if I go over my storage or API limits?",
    a: "We never cut off your service without warning. You'll get an email at 80% and 100% of your limits, and you can upgrade or buy additional capacity whenever it suits you.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We do. Verified nonprofits, educators and students receive 50% off any paid plan. Reach out to our support team with proof of status and we'll apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Business plan customers can also pay by invoice with bank transfer on net-30 terms.",
  },
];

function formatPrice(n: number): string {
  return `$${n}`;
}

function CellContent({ value, label }: { value: CellValue; label: string }) {
  if (value === true) {
    return (
      <>
        <Check className="mx-auto size-4 text-primary" aria-hidden="true" />
        <span className="sr-only">Included in {label}</span>
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
        <span className="sr-only">Not included in {label}</span>
      </>
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("annual");
  const isAnnual = billing === "annual";

  function handleSelect(tier: Tier) {
    if (tier.id === "business") {
      toast.success("Thanks for your interest!", {
        description: "Our sales team will reach out within one business day.",
      });
      return;
    }
    toast.success(`${tier.name} trial started`, {
      description: `You're on the ${isAnnual ? "annual" : "monthly"} plan at ${formatPrice(
        isAnnual ? tier.annual : tier.monthly,
      )}/month.`,
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Start free for 14 days. No credit card required. Upgrade, downgrade
            or cancel whenever your needs change.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm",
                !isAnnual ? "font-semibold" : "text-muted-foreground",
              )}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={(checked) =>
                setBilling(checked ? "annual" : "monthly")
              }
              aria-label="Toggle annual billing"
            />
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm",
                isAnnual ? "font-semibold" : "text-muted-foreground",
              )}
            >
              Annual
            </Label>
            <Badge variant="outline" className="ml-1">
              Save 20%
            </Badge>
          </div>
        </header>

        {/* Tiers */}
        <section
          aria-label="Pricing plans"
          className="mt-12 grid items-stretch gap-6 md:grid-cols-3 md:gap-5 lg:gap-8"
        >
          {tiers.map((tier) => {
            const price = isAnnual ? tier.annual : tier.monthly;
            return (
              <Card
                key={tier.id}
                className={cn(
                  "relative",
                  tier.highlighted &&
                    "border-primary shadow-lg ring-1 ring-primary md:-my-4 md:py-10",
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
                    <h2>{tier.name}</h2>
                  </CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        {formatPrice(price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / month
                      </span>
                    </div>
                    <p className="mt-1 min-h-5 text-xs text-muted-foreground">
                      {isAnnual
                        ? `Billed annually (${formatPrice(price * 12)}/year)`
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
            );
          })}
        </section>

        {/* Comparison */}
        <section aria-labelledby="compare-heading" className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="compare-heading"
              className="text-3xl font-bold tracking-tight"
            >
              Compare plans in detail
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every feature, limit and perk, side by side.
            </p>
          </div>

          <div className="mt-10 rounded-xl border bg-card">
            <Table className="min-w-[640px]">
              <caption className="sr-only">
                Feature comparison across the Starter, Pro and Business plans
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className="h-14 w-2/5 px-4">
                    Features
                  </TableHead>
                  {tiers.map((tier) => (
                    <TableHead
                      key={tier.id}
                      scope="col"
                      className={cn(
                        "h-14 px-4 text-center text-sm",
                        tier.highlighted && "bg-primary/5 text-primary",
                      )}
                    >
                      {tier.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              {comparison.map((group) => (
                <TableBody key={group.group}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead
                      scope="colgroup"
                      colSpan={4}
                      className="h-9 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {group.group}
                    </TableHead>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableHead
                        scope="row"
                        className="px-4 py-3 font-normal"
                      >
                        {row.feature}
                      </TableHead>
                      {row.values.map((value, i) => (
                        <TableCell
                          key={tiers[i].id}
                          className={cn(
                            "px-4 py-3 text-center",
                            tiers[i].highlighted && "bg-primary/5",
                          )}
                        >
                          <CellContent value={value} label={tiers[i].name} />
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
          className="mx-auto mt-24 max-w-3xl"
        >
          <div className="text-center">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Our support team is
              happy to help.
            </p>
          </div>
          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="mt-8 rounded-xl border bg-card px-6"
          >
            {faqs.map((item, i) => (
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
        <section
          aria-labelledby="cta-heading"
          className="mt-24 rounded-2xl border bg-muted/40 px-6 py-12 text-center sm:px-12"
        >
          <h2 id="cta-heading" className="text-2xl font-bold tracking-tight">
            Still not sure which plan fits?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Talk to a real person. We&apos;ll help you pick the right plan and
            migrate your data for free.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() =>
                toast("Booking request sent", {
                  description: "We'll email you a few times for a quick call.",
                })
              }
            >
              Book a 15-minute call
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() =>
                toast("Opening documentation", {
                  description: "Billing guides are coming to your inbox.",
                })
              }
            >
              Read the billing guide
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
```