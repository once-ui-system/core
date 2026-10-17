"use client";

import { useId, useState } from "react";
import { Check, Minus, Sparkles } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tier = {
  id: "starter" | "team" | "enterprise";
  name: string;
  description: string;
  monthly: number | null;
  annual: number | null;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo makers shipping their first few projects.",
    monthly: 12,
    annual: 10,
    cta: "Start free trial",
    features: [
      "Up to 3 active projects",
      "5 GB asset storage",
      "Basic analytics dashboard",
      "Community support",
      "1 team member",
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "For growing teams that need to collaborate and move fast.",
    monthly: 36,
    annual: 29,
    cta: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250 GB asset storage",
      "Advanced analytics and exports",
      "Priority email support",
      "Up to 25 team members",
      "Custom domains and roles",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with security and compliance needs.",
    monthly: null,
    annual: null,
    cta: "Contact sales",
    features: [
      "Everything in Team",
      "Unlimited storage",
      "SAML single sign-on and SCIM",
      "99.99% uptime SLA",
      "Dedicated success manager",
      "Unlimited team members",
    ],
  },
];

type CellValue = boolean | string;

type ComparisonRow = {
  feature: string;
  starter: CellValue;
  team: CellValue;
  enterprise: CellValue;
};

type ComparisonGroup = {
  group: string;
  rows: ComparisonRow[];
};

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { feature: "Active projects", starter: "3", team: "Unlimited", enterprise: "Unlimited" },
      { feature: "Team members", starter: "1", team: "25", enterprise: "Unlimited" },
      { feature: "Asset storage", starter: "5 GB", team: "250 GB", enterprise: "Unlimited" },
      { feature: "API requests / month", starter: "10,000", team: "500,000", enterprise: "Custom" },
    ],
  },
  {
    group: "Collaboration",
    rows: [
      { feature: "Shared workspaces", starter: false, team: true, enterprise: true },
      { feature: "Custom roles and permissions", starter: false, team: true, enterprise: true },
      { feature: "Comments and mentions", starter: true, team: true, enterprise: true },
      { feature: "Audit log", starter: false, team: "90 days", enterprise: "Unlimited" },
    ],
  },
  {
    group: "Security",
    rows: [
      { feature: "Two-factor authentication", starter: true, team: true, enterprise: true },
      { feature: "SAML single sign-on", starter: false, team: false, enterprise: true },
      { feature: "SCIM provisioning", starter: false, team: false, enterprise: true },
      { feature: "Uptime SLA", starter: false, team: "99.9%", enterprise: "99.99%" },
    ],
  },
  {
    group: "Support",
    rows: [
      { feature: "Community forum", starter: true, team: true, enterprise: true },
      { feature: "Email support", starter: false, team: "Priority", enterprise: "Priority" },
      { feature: "Dedicated success manager", starter: false, team: false, enterprise: true },
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access to the Team plan for 14 days, no credit card required. When the trial ends, you can pick a plan or your workspace switches to read-only mode. Nothing is deleted.",
  },
  {
    q: "Can I switch plans or cancel at any time?",
    a: "Yes. Upgrades take effect immediately and are prorated for the rest of your billing period. Downgrades and cancellations apply at the end of the current period, and you keep access until then.",
  },
  {
    q: "What happens if I go over my plan limits?",
    a: "We never cut you off without warning. You will get an email at 80% and 100% of any limit, and a short grace period to upgrade or clean up before new uploads are paused.",
  },
  {
    q: "Do you offer discounts for nonprofits and students?",
    a: "We offer 50% off any paid plan for registered nonprofits, accredited schools and open-source maintainers. Reach out to our team with proof of status and we will apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major credit and debit cards are supported on every plan. Annual Enterprise contracts can also be paid by invoice with bank transfer on net-30 terms.",
  },
  {
    q: "Is my data secure?",
    a: "Data is encrypted in transit and at rest, backups run every hour, and we undergo an independent SOC 2 Type II audit each year. Enterprise customers can request our full security documentation.",
  },
];

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function CellContent({ value }: { value: CellValue }) {
  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>;
  }
  if (value) {
    return (
      <>
        <Check className="mx-auto size-4 text-primary" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    );
  }
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

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const switchId = useId();

  const handleSelect = (tier: Tier) => {
    if (tier.id === "enterprise") {
      toast.success("Thanks for your interest!", {
        description: "Our sales team will reach out within one business day.",
      });
    } else {
      toast.success(`${tier.name} trial started`, {
        description: `Your 14-day free trial is ready, billed ${
          annual ? "annually" : "monthly"
        } afterwards.`,
      });
    }
  };

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
            Start free for 14 days. No credit card required, and you can change
            or cancel your plan whenever you like.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <label
              htmlFor={switchId}
              className={cn(
                "cursor-pointer text-sm font-medium",
                annual && "text-muted-foreground"
              )}
            >
              Monthly
            </label>
            <Switch
              id={switchId}
              checked={annual}
              onCheckedChange={setAnnual}
              aria-label="Bill annually"
            />
            <label
              htmlFor={switchId}
              className={cn(
                "cursor-pointer text-sm font-medium",
                !annual && "text-muted-foreground"
              )}
            >
              Annual
            </label>
            <Badge variant="outline" className="text-xs">
              Save 20%
            </Badge>
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
          <ul className="grid list-none gap-6 p-0 md:grid-cols-3 md:items-stretch">
            {TIERS.map((tier) => {
              const price = annual ? tier.annual : tier.monthly;
              return (
                <li
                  key={tier.id}
                  className={cn(
                    "flex",
                    tier.highlighted && "md:-my-4 md:order-none"
                  )}
                >
                  <Card
                    className={cn(
                      "relative w-full",
                      tier.highlighted &&
                        "border-primary shadow-lg ring-2 ring-primary md:py-10"
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg">{tier.name}</CardTitle>
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
                      <div>
                        {price === null ? (
                          <p className="text-4xl font-bold tracking-tight">
                            Custom
                          </p>
                        ) : (
                          <p className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">
                              {formatPrice(price)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / user / month
                            </span>
                          </p>
                        )}
                        <p
                          className="mt-1 min-h-5 text-sm text-muted-foreground"
                          aria-live="polite"
                        >
                          {price === null
                            ? "Tailored to your organization"
                            : annual
                              ? "Billed annually"
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
                        aria-label={`${tier.cta}: ${tier.name} plan`}
                      >
                        {tier.cta}
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Comparison */}
        <section
          aria-labelledby="compare-heading"
          className="mt-24 sm:mt-28"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="compare-heading"
              className="text-3xl font-bold tracking-tight"
            >
              Compare plans
            </h2>
            <p className="mt-3 text-muted-foreground">
              A detailed look at what is included in every plan.
            </p>
          </div>

          <div className="mt-10 rounded-xl border bg-card">
            <Table className="min-w-[640px]">
              <TableCaption className="sr-only">
                Feature comparison across the Starter, Team and Enterprise
                plans
              </TableCaption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className="h-14 w-2/5 px-4">
                    Features
                  </TableHead>
                  <TableHead scope="col" className="h-14 px-4 text-center">
                    Starter
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="h-14 bg-primary/5 px-4 text-center"
                  >
                    <span className="inline-flex items-center gap-2">
                      Team
                      <Badge className="hidden sm:inline-flex">Popular</Badge>
                    </span>
                  </TableHead>
                  <TableHead scope="col" className="h-14 px-4 text-center">
                    Enterprise
                  </TableHead>
                </TableRow>
              </TableHeader>
              {COMPARISON.map((group) => (
                <TableBody key={group.group}>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell
                      colSpan={4}
                      scope="colgroup"
                      className="px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                      role="columnheader"
                    >
                      {group.group}
                    </TableCell>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell
                        scope="row"
                        role="rowheader"
                        className="px-4 py-3 font-medium"
                      >
                        {row.feature}
                      </TableCell>
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
        <section
          aria-labelledby="faq-heading"
          className="mx-auto mt-24 max-w-3xl sm:mt-28"
        >
          <div className="text-center">
            <h2 id="faq-heading" className="text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Can&apos;t find what you are looking for? Email us at
              billing@example.com and we will get back to you quickly.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="faq-0"
            className="mt-8 rounded-xl border bg-card px-4 sm:px-6"
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
          className="mt-24 rounded-2xl border bg-muted/40 px-6 py-12 text-center sm:mt-28"
        >
          <h2 id="cta-heading" className="text-2xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Join over 4,000 teams already building with us. Your first 14 days
            are on the house.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() =>
                toast.success("Trial started", {
                  description: "Check your inbox to finish setting up.",
                })
              }
            >
              Start free trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                toast("Demo requested", {
                  description: "We will email you available times shortly.",
                })
              }
            >
              Book a demo
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
