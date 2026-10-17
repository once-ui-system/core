I have what I need. Writing the page now.

```tsx
"use client";

import { useId, useState } from "react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

interface Tier {
  id: "starter" | "pro" | "enterprise";
  name: string;
  tagline: string;
  monthly: number | null;
  yearly: number | null; // per-month price when billed yearly
  cta: string;
  highlighted?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo builders shipping their first projects.",
    monthly: 12,
    yearly: 10,
    cta: "Start free trial",
    features: [
      "Up to 3 active projects",
      "5 GB asset storage",
      "Community support",
      "7-day activity history",
      "Basic analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For growing teams that need speed and collaboration.",
    monthly: 39,
    yearly: 32,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "100 GB asset storage",
      "Priority email support",
      "90-day activity history",
      "Advanced analytics & exports",
      "Custom domains & SSO via Google",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with security and scale requirements.",
    monthly: null,
    yearly: null,
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "Dedicated success manager",
      "Unlimited activity history",
      "SAML SSO & SCIM provisioning",
      "99.99% uptime SLA",
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
      { label: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { label: "Asset storage", values: ["5 GB", "100 GB", "Unlimited"] },
      { label: "API requests / month", values: ["50k", "1M", "Custom"] },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { label: "Shared workspaces", values: [false, true, true] },
      { label: "Comments & mentions", values: [true, true, true] },
      { label: "Role-based permissions", values: [false, true, true] },
      { label: "Activity history", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Security",
    rows: [
      { label: "Two-factor authentication", values: [true, true, true] },
      { label: "Google SSO", values: [false, true, true] },
      { label: "SAML SSO & SCIM", values: [false, false, true] },
      { label: "Audit logs", values: [false, "30 days", "Unlimited"] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Community forum", values: [true, true, true] },
      { label: "Priority email support", values: [false, true, true] },
      { label: "Dedicated success manager", values: [false, false, true] },
      { label: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does the 14-day free trial work?",
    a: "Every paid plan starts with a 14-day trial with full access to its features. You don't need a credit card to start, and we'll email you three days before the trial ends so there are no surprises.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time from your billing settings. Upgrades take effect immediately and are prorated; downgrades apply at the start of your next billing cycle.",
  },
  {
    q: "What happens if I go over my storage or API limits?",
    a: "We never cut off your projects without warning. You'll get a notification at 80% and 100% of your limits, and you can either upgrade or purchase add-on capacity until your next cycle.",
  },
  {
    q: "Do you offer discounts for startups, students, or nonprofits?",
    a: "We do. Eligible startups, students and registered nonprofits get 50% off the Pro plan for the first year. Reach out to our team with a bit of context and we'll set it up within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept all major credit and debit cards. Enterprise customers can also pay by invoice with net-30 terms via bank transfer.",
  },
  {
    q: "How do refunds work?",
    a: "If you're not happy within the first 30 days of a paid subscription, contact support and we'll refund your payment in full, no questions asked.",
  },
];

function formatPrice(tier: Tier, billing: Billing): string | null {
  const value = billing === "yearly" ? tier.yearly : tier.monthly;
  return value === null ? null : `$${value}`;
}

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <>
        <Check className="mx-auto size-4 text-primary" aria-hidden="true" />
        <span className="sr-only">Included</span>
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
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const switchId = useId();

  const handleSelect = (tier: Tier) => {
    if (tier.id === "enterprise") {
      toast.success("Thanks for your interest!", {
        description: "Our sales team will reach out within one business day.",
      });
    } else {
      toast.success(`Your ${tier.name} trial is ready`, {
        description: `Billed ${billing === "yearly" ? "yearly" : "monthly"}. No credit card required.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Hero */}
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            14-day free trial on all paid plans
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Start small, upgrade when you&apos;re ready. No hidden fees, no
            per-seat surprises, and you can cancel any time.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <label
              htmlFor={switchId}
              className={cn(
                "cursor-pointer text-sm font-medium",
                billing === "monthly" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Monthly
            </label>
            <Switch
              id={switchId}
              checked={billing === "yearly"}
              onCheckedChange={(checked) =>
                setBilling(checked ? "yearly" : "monthly")
              }
              aria-label="Toggle yearly billing"
            />
            <span
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                billing === "yearly" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Yearly
              <Badge variant="outline" className="text-xs">
                Save 18%
              </Badge>
            </span>
          </div>
        </header>

        {/* Tiers */}
        <section
          aria-labelledby="plans-heading"
          className="mt-12 sm:mt-14"
        >
          <h2 id="plans-heading" className="sr-only">
            Plans
          </h2>
          <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
            {TIERS.map((tier) => {
              const price = formatPrice(tier, billing);
              const headingId = `tier-${tier.id}`;
              return (
                <Card
                  key={tier.id}
                  aria-labelledby={headingId}
                  className={cn(
                    "relative",
                    tier.highlighted &&
                      "border-primary shadow-lg ring-1 ring-primary md:-my-4 md:py-10",
                  )}
                >
                  {tier.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Sparkles aria-hidden="true" />
                      Most popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle id={headingId} className="text-lg">
                      <h3>{tier.name}</h3>
                    </CardTitle>
                    <CardDescription>{tier.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-6">
                    <div className="min-h-[4.5rem]">
                      {price ? (
                        <>
                          <p className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">
                              {price}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / month
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {billing === "yearly"
                              ? `Billed annually ($${(tier.yearly ?? 0) * 12}/year)`
                              : "Billed monthly"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-4xl font-bold tracking-tight">
                            Custom
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tailored to your organization
                          </p>
                        </>
                      )}
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
          </div>
        </section>

        {/* Comparison */}
        <section
          aria-labelledby="compare-heading"
          className="mt-20 sm:mt-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="compare-heading"
              className="text-3xl font-bold tracking-tight"
            >
              Compare plans in detail
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every feature, limit and support option side by side.
            </p>
          </div>

          <div className="mt-8 rounded-xl border">
            <Table className="min-w-[640px]">
              <TableCaption className="sr-only">
                Feature comparison between the Starter, Pro and Enterprise
                plans
              </TableCaption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className="h-14 px-4">
                    <span className="sr-only">Feature</span>
                  </TableHead>
                  {TIERS.map((tier) => (
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
              {COMPARISON.map((group) => (
                <TableBody key={group.group}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead
                      scope="colgroup"
                      colSpan={4}
                      className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {group.group}
                    </TableHead>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.label}>
                      <TableHead
                        scope="row"
                        className="px-4 py-3 font-normal"
                      >
                        {row.label}
                      </TableHead>
                      {row.values.map((value, i) => (
                        <TableCell
                          key={TIERS[i].id}
                          className={cn(
                            "px-4 py-3 text-center",
                            TIERS[i].highlighted && "bg-primary/5",
                          )}
                        >
                          <CellContent value={value} />
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
          className="mx-auto mt-20 max-w-3xl sm:mt-24"
        >
          <div className="text-center">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Email us at
              support@example.com.
            </p>
          </div>
          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="mt-8 rounded-xl border px-4 sm:px-6"
          >
            {FAQS.map((item, index) => (
              <AccordionItem key={item.q} value={`faq-${index}`}>
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
      </main>
    </div>
  );
}
```