I have what I need. I'll build the page with a monthly/annual billing toggle (a `ToggleGroup` of type `single`), three tier cards, a comparison table, and an FAQ accordion.

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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "annual";

interface Tier {
  id: "starter" | "team" | "enterprise";
  name: string;
  description: string;
  monthly: number | null;
  annual: number | null;
  cta: string;
  highlighted: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo makers shipping their first projects.",
    monthly: 12,
    annual: 10,
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
    description: "For growing teams that need to move fast together.",
    monthly: 36,
    annual: 29,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250 GB of asset storage",
      "Priority email support",
      "1-year activity history",
      "Advanced analytics & exports",
      "Role-based permissions",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with security and scale requirements.",
    monthly: null,
    annual: null,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Team",
      "Unlimited storage",
      "Dedicated success manager",
      "SAML SSO & SCIM provisioning",
      "Audit logs & custom retention",
      "99.99% uptime SLA",
    ],
  },
];

type CellValue = boolean | string;

interface ComparisonRow {
  feature: string;
  starter: CellValue;
  team: CellValue;
  enterprise: CellValue;
}

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { feature: "Active projects", starter: "3", team: "Unlimited", enterprise: "Unlimited" },
      { feature: "Team members", starter: "1", team: "Up to 25", enterprise: "Unlimited" },
      { feature: "Asset storage", starter: "5 GB", team: "250 GB", enterprise: "Unlimited" },
      { feature: "Activity history", starter: "7 days", team: "1 year", enterprise: "Custom" },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared workspaces", starter: false, team: true, enterprise: true },
      { feature: "Role-based permissions", starter: false, team: true, enterprise: true },
      { feature: "Guest access", starter: false, team: "10 guests", enterprise: "Unlimited" },
      { feature: "Comments & mentions", starter: true, team: true, enterprise: true },
    ],
  },
  {
    group: "Security & compliance",
    rows: [
      { feature: "Two-factor authentication", starter: true, team: true, enterprise: true },
      { feature: "SAML SSO", starter: false, team: false, enterprise: true },
      { feature: "SCIM provisioning", starter: false, team: false, enterprise: true },
      { feature: "Audit logs", starter: false, team: "30 days", enterprise: "Custom retention" },
    ],
  },
  {
    group: "Support",
    rows: [
      { feature: "Community forum", starter: true, team: true, enterprise: true },
      { feature: "Priority email support", starter: false, team: true, enterprise: true },
      { feature: "Dedicated success manager", starter: false, team: false, enterprise: true },
      { feature: "Uptime SLA", starter: false, team: "99.9%", enterprise: "99.99%" },
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access to the Team plan for 14 days with no credit card required. At the end of the trial you can pick a plan or drop to a limited free workspace. Nothing is deleted either way.",
  },
  {
    q: "Can I switch plans or cancel at any time?",
    a: "Yes. Upgrades take effect immediately and are prorated for the rest of your billing period. Downgrades and cancellations apply at the end of the current period, and you keep access until then.",
  },
  {
    q: "What does annual billing save me?",
    a: "Annual billing is roughly two months free: Starter drops from $12 to $10 per seat each month and Team from $36 to $29. You are billed once per year, and invoices are available in your billing settings.",
  },
  {
    q: "How is pricing calculated for teams?",
    a: "Prices are per seat per month. You only pay for members who can edit; viewers and guests on the Team plan are free up to the limits listed in the comparison table.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off for verified nonprofits, open-source maintainers and students. Send us a note from the contact page with proof of status and we will apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major credit and debit cards. Annual Enterprise contracts can also be paid by invoice with bank transfer on net-30 terms.",
  },
];

function formatPrice(tier: Tier, billing: Billing): string | null {
  const value = billing === "annual" ? tier.annual : tier.monthly;
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
        <Minus className="mx-auto size-4 text-muted-foreground/60" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("annual");

  const handleSelect = (tier: Tier) => {
    if (tier.id === "enterprise") {
      toast.success("Thanks for your interest!", {
        description: "Our sales team will reach out within one business day.",
      });
    } else {
      toast.success(`${tier.name} trial started`, {
        description: `Your 14-day free trial of ${tier.name} is ready.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Start with a 14-day free trial on any plan. No credit card, no
            surprises, cancel whenever you like.
          </p>

          <div className="mt-8 flex flex-col items-center gap-2">
            <ToggleGroup
              type="single"
              variant="outline"
              value={billing}
              onValueChange={(v) => {
                if (v === "monthly" || v === "annual") setBilling(v);
              }}
              aria-label="Billing period"
            >
              <ToggleGroupItem value="monthly" aria-label="Bill monthly">
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem value="annual" aria-label="Bill annually">
                Annual
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {billing === "annual"
                ? "Billed annually. You save about 2 months."
                : "Billed monthly. Switch to annual and save about 2 months."}
            </p>
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
          <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {TIERS.map((tier) => {
              const price = formatPrice(tier, billing);
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
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Sparkles aria-hidden="true" />
                      Most popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <h3>{tier.name}</h3>
                    </CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-6">
                    <div className="flex items-baseline gap-1">
                      {price ? (
                        <>
                          <span className="text-4xl font-bold tracking-tight">
                            {price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            per seat / month
                          </span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold tracking-tight">
                          Custom
                        </span>
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
                      <span className="sr-only"> for {tier.name}</span>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
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
              Everything included in each plan, side by side.
            </p>
          </div>

          <div className="mt-10 rounded-xl border bg-card">
            <Table className="min-w-[640px]">
              <TableCaption className="sr-only">
                Feature comparison between the Starter, Team and Enterprise
                plans
              </TableCaption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className="h-12 px-4">
                    Feature
                  </TableHead>
                  <TableHead scope="col" className="h-12 px-4 text-center">
                    Starter
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="h-12 bg-primary/5 px-4 text-center text-primary"
                  >
                    Team
                  </TableHead>
                  <TableHead scope="col" className="h-12 px-4 text-center">
                    Enterprise
                  </TableHead>
                </TableRow>
              </TableHeader>
              {COMPARISON.map((group) => (
                <TableBody key={group.group}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead
                      scope="colgroup"
                      colSpan={4}
                      className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
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
                      <TableCell className="px-4 py-3 text-center">
                        <CellContent value={row.starter} />
                      </TableCell>
                      <TableCell className="bg-primary/5 px-4 py-3 text-center">
                        <CellContent value={row.team} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <CellContent value={row.enterprise} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ))}
            </Table>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Can&apos;t find what you need? Our team is happy to help.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="mx-auto mt-10 max-w-3xl rounded-xl border bg-card px-6"
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

        {/* Closing CTA */}
        <section
          aria-labelledby="cta-heading"
          className="mt-24 rounded-2xl border bg-muted/40 px-6 py-12 text-center sm:px-12"
        >
          <h2 id="cta-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Join more than 4,000 teams building with us. Try every Team feature
            free for 14 days.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() =>
                toast.success("Trial started", {
                  description: "Your 14-day free trial of Team is ready.",
                })
              }
            >
              Start free trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                toast("Talk to sales", {
                  description: "We will email you to schedule a short call.",
                })
              }
            >
              Talk to sales
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
```