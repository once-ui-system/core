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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Tier = {
  id: "starter" | "growth" | "scale";
  name: string;
  tagline: string;
  monthly: number;
  yearly: number; // per month, billed annually
  cta: string;
  highlighted: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For solo builders shipping their first product.",
    monthly: 12,
    yearly: 10,
    cta: "Start free trial",
    highlighted: false,
    features: [
      "Up to 3 projects",
      "5 GB asset storage",
      "Community support",
      "7-day activity history",
      "Basic analytics",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For growing teams that need to move fast together.",
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
      "Custom domains",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For organizations with security and compliance needs.",
    monthly: 99,
    yearly: 82,
    cta: "Contact sales",
    highlighted: false,
    features: [
      "Everything in Growth",
      "1 TB asset storage",
      "Dedicated success manager",
      "Unlimited activity history",
      "SSO / SAML and audit logs",
      "99.99% uptime SLA",
    ],
  },
];

type CellValue = boolean | string;

type ComparisonGroup = {
  group: string;
  rows: { label: string; values: [CellValue, CellValue, CellValue] }[];
};

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { label: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { label: "Team members", values: ["1", "10", "Unlimited"] },
      { label: "Asset storage", values: ["5 GB", "100 GB", "1 TB"] },
      { label: "API requests / month", values: ["50k", "1M", "10M"] },
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
      { label: "SSO / SAML", values: [false, false, true] },
      { label: "Audit logs", values: [false, false, true] },
      { label: "Uptime SLA", values: [false, "99.9%", "99.99%"] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Community forum", values: [true, true, true] },
      { label: "Priority email support", values: [false, true, true] },
      { label: "Dedicated success manager", values: [false, false, true] },
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How does the 14-day free trial work?",
    a: "You get full access to the Growth plan for 14 days, no credit card required. When the trial ends you can pick any plan, or your workspace switches to read-only until you do. Nothing is deleted.",
  },
  {
    q: "Can I switch plans or cancel at any time?",
    a: "Yes. Upgrades take effect immediately and are prorated for the rest of your billing period. Downgrades and cancellations apply at the end of the current period, and you keep access until then.",
  },
  {
    q: "What happens if I go over my storage or API limits?",
    a: "We never cut you off without warning. You'll get an email at 80% and 100% of your limit, and a short grace period to either clean up or upgrade. Overage is not billed automatically.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We offer 50% off any plan for registered nonprofits, open-source maintainers and students. Send us a note from your organization's email address and we'll apply the discount within one business day.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major credit and debit cards, plus ACH and wire transfer for annual Scale plans. Invoices are issued automatically and include your company details and VAT number if provided.",
  },
  {
    q: "Is my data secure?",
    a: "Data is encrypted in transit and at rest, backed up daily, and stored in SOC 2 Type II certified data centers. Scale customers can also enable SSO, audit logs and data residency controls.",
  },
];

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
  return <span>{value}</span>;
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(true);

  const handleSelect = (tier: Tier) => {
    if (tier.id === "scale") {
      toast.success("Thanks! Our sales team will reach out within one business day.");
    } else {
      toast.success(
        `Your 14-day ${tier.name} trial is ready (${yearly ? "billed yearly" : "billed monthly"}).`,
      );
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24">
        <Badge variant="secondary" className="mb-4">
          Simple, transparent pricing
        </Badge>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Pricing that scales with your team
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          Start free for 14 days. No credit card required, and you can change or
          cancel your plan whenever you like.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            id="billing-monthly"
            className={cn(
              "text-sm font-medium",
              yearly && "text-muted-foreground",
            )}
          >
            Monthly
          </span>
          <Switch
            checked={yearly}
            onCheckedChange={setYearly}
            aria-label="Bill yearly"
          />
          <span
            id="billing-yearly"
            className={cn(
              "text-sm font-medium",
              !yearly && "text-muted-foreground",
            )}
          >
            Yearly
          </span>
          <Badge variant="outline" className="text-xs">
            Save up to 20%
          </Badge>
        </div>
      </section>

      {/* Tiers */}
      <section
        aria-labelledby="plans-heading"
        className="mx-auto max-w-6xl px-4 sm:px-6"
      >
        <h2 id="plans-heading" className="sr-only">
          Plans
        </h2>
        <div className="grid items-stretch gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
          {TIERS.map((tier) => {
            const price = yearly ? tier.yearly : tier.monthly;
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
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <div>
                    <p className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        ${price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / month
                      </span>
                    </p>
                    <p className="mt-1 min-h-5 text-xs text-muted-foreground">
                      {yearly
                        ? `Billed $${tier.yearly * 12} yearly`
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
        </div>
      </section>

      {/* Comparison */}
      <section
        aria-labelledby="compare-heading"
        className="mx-auto mt-24 max-w-6xl px-4 sm:px-6"
      >
        <div className="mb-8 text-center">
          <h2
            id="compare-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Compare plans in detail
          </h2>
          <p className="mt-2 text-muted-foreground">
            Everything included in each plan, side by side.
          </p>
        </div>

        <div className="rounded-xl border bg-card">
          <Table className="min-w-[36rem]">
            <TableCaption className="sr-only">
              Feature comparison of the Starter, Growth and Scale plans
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
            <TableBody>
              {COMPARISON.map((group) => (
                <GroupRows key={group.group} group={group} />
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="mx-auto mt-24 max-w-3xl px-4 pb-24 sm:px-6"
      >
        <div className="mb-8 text-center">
          <h2
            id="faq-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Email us at
            support@northwind.example.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
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
    </main>
  );
}

function GroupRows({ group }: { group: ComparisonGroup }) {
  return (
    <>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableHead
          scope="colgroup"
          colSpan={4}
          className="px-4 text-xs uppercase tracking-wide text-muted-foreground"
        >
          {group.group}
        </TableHead>
      </TableRow>
      {group.rows.map((row) => (
        <TableRow key={row.label}>
          <TableHead scope="row" className="px-4 py-3 font-normal">
            {row.label}
          </TableHead>
          {row.values.map((value, i) => (
            <TableCell
              key={TIERS[i].id}
              className={cn(
                "px-4 py-3 text-center",
                TIERS[i].highlighted && "bg-primary/5 font-medium",
              )}
            >
              <CellContent value={value} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
