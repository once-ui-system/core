"use client";

import * as React from "react";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Tier = {
  id: "starter" | "team" | "enterprise";
  name: string;
  tagline: string;
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
    tagline: "For solo builders shipping their first side project.",
    monthly: 0,
    annual: 0,
    cta: "Start for free",
    features: [
      "Up to 3 projects",
      "5,000 monitored events / month",
      "7-day data retention",
      "Community support",
      "1 team member",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "For growing teams that need speed and visibility.",
    monthly: 29,
    annual: 24,
    cta: "Start 14-day free trial",
    highlighted: true,
    features: [
      "Unlimited projects",
      "250,000 monitored events / month",
      "90-day data retention",
      "Custom dashboards & alerts",
      "Slack and PagerDuty integrations",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations with security and scale requirements.",
    monthly: null,
    annual: null,
    cta: "Contact sales",
    features: [
      "Unlimited events, volume pricing",
      "Unlimited data retention",
      "SAML SSO and SCIM provisioning",
      "Audit logs and custom roles",
      "99.99% uptime SLA",
      "Dedicated success manager",
    ],
  },
];

type CellValue = boolean | string;

type ComparisonRow = {
  feature: string;
  values: [CellValue, CellValue, CellValue];
};

type ComparisonGroup = {
  group: string;
  rows: ComparisonRow[];
};

const COMPARISON: ComparisonGroup[] = [
  {
    group: "Usage",
    rows: [
      { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      {
        feature: "Monitored events / month",
        values: ["5,000", "250,000", "Custom"],
      },
      { feature: "Team members", values: ["1", "Up to 25", "Unlimited"] },
      { feature: "Data retention", values: ["7 days", "90 days", "Unlimited"] },
    ],
  },
  {
    group: "Features",
    rows: [
      { feature: "Custom dashboards", values: [false, true, true] },
      { feature: "Alert rules", values: ["2", "Unlimited", "Unlimited"] },
      { feature: "Slack & PagerDuty integrations", values: [false, true, true] },
      { feature: "Public API access", values: [true, true, true] },
      { feature: "Data export (CSV, S3)", values: [false, true, true] },
    ],
  },
  {
    group: "Security & compliance",
    rows: [
      { feature: "Two-factor authentication", values: [true, true, true] },
      { feature: "SAML SSO & SCIM", values: [false, false, true] },
      { feature: "Audit logs", values: [false, false, true] },
      { feature: "SOC 2 report & DPA", values: [false, false, true] },
    ],
  },
  {
    group: "Support",
    rows: [
      {
        feature: "Support channel",
        values: ["Community", "Priority email", "Dedicated manager"],
      },
      { feature: "First response time", values: ["—", "< 8 hours", "< 1 hour"] },
      { feature: "Uptime SLA", values: [false, false, "99.99%"] },
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I try Team before paying?",
    a: "Yes. Every new workspace gets a 14-day free trial of the Team plan with no credit card required. When the trial ends, your workspace moves to Starter unless you choose to upgrade.",
  },
  {
    q: "What counts as a monitored event?",
    a: "An event is any error, performance trace, or custom log line sent to Pulseboard from your application. Health checks and dashboard views never count against your quota.",
  },
  {
    q: "What happens if I go over my event limit?",
    a: "We never drop data without warning. You'll get an email at 80% and 100% of your quota, and on Team you can enable overage billing at $0.40 per additional 1,000 events or let ingestion pause until the next cycle.",
  },
  {
    q: "Can I switch between monthly and annual billing?",
    a: "Absolutely. Switching to annual billing saves about 17% and takes effect on your next invoice. If you move from annual back to monthly, the change applies at the end of your current term.",
  },
  {
    q: "Do you offer discounts for startups or nonprofits?",
    a: "We do. Early-stage startups can receive 50% off Team for their first year, and registered nonprofits and open-source maintainers get a 30% discount. Contact our team with a few details and we'll set it up.",
  },
  {
    q: "How do refunds work?",
    a: "If Pulseboard isn't the right fit, email us within 30 days of your first paid invoice and we'll refund it in full, no questions asked.",
  },
];

function formatPrice(value: number): string {
  return `$${value}`;
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
  return <span>{value}</span>;
}

function PriceBlock({ tier, annual }: { tier: Tier; annual: boolean }) {
  const price = annual ? tier.annual : tier.monthly;

  if (price === null) {
    return (
      <div className="flex min-h-[4.5rem] flex-col justify-end">
        <p className="text-4xl font-bold tracking-tight">Custom</p>
        <p className="text-sm text-muted-foreground">Tailored to your volume</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[4.5rem] flex-col justify-end">
      <p className="flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">
          {formatPrice(price)}
        </span>
        <span className="text-sm text-muted-foreground">
          {price === 0 ? "forever" : "/ user / month"}
        </span>
      </p>
      <p className="text-sm text-muted-foreground">
        {price === 0
          ? "No credit card required"
          : annual
            ? "Billed annually"
            : "Billed monthly"}
      </p>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = React.useState(true);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        {/* Hero */}
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Simple pricing that scales with your team
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Pulseboard gives you real-time monitoring for errors, performance
            and uptime. Start free, upgrade when you need more room, and cancel
            any time.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm",
                !annual ? "font-semibold" : "text-muted-foreground",
              )}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={annual}
              onCheckedChange={setAnnual}
              aria-label="Toggle annual billing"
            />
            <Label
              htmlFor="billing-toggle"
              className={cn(
                "cursor-pointer text-sm",
                annual ? "font-semibold" : "text-muted-foreground",
              )}
            >
              Annual
            </Label>
            <Badge variant="outline" className="ml-1">
              Save 17%
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
          <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-8">
            {TIERS.map((tier) => (
              <Card
                key={tier.id}
                className={cn(
                  "relative",
                  tier.highlighted &&
                    "border-primary shadow-lg ring-2 ring-primary lg:-my-4 lg:py-10",
                )}
              >
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Sparkles aria-hidden="true" />
                    Most popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription className="min-h-10">
                    {tier.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <PriceBlock tier={tier} annual={annual} />
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
                    aria-label={`${tier.cta} — ${tier.name} plan`}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
              Every feature, limit and service level across Starter, Team and
              Enterprise.
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
                  <TableHead scope="col" className="h-14 w-2/5 px-4">
                    <span className="sr-only">Feature</span>
                  </TableHead>
                  {TIERS.map((tier) => (
                    <TableHead
                      key={tier.id}
                      scope="col"
                      className={cn(
                        "h-14 px-4 text-center text-base",
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
                      className="h-10 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {group.group}
                    </TableHead>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableHead
                        scope="row"
                        className="h-12 px-4 font-normal whitespace-normal"
                      >
                        {row.feature}
                      </TableHead>
                      {row.values.map((value, i) => (
                        <TableCell
                          key={TIERS[i].id}
                          className={cn(
                            "px-4 text-center",
                            TIERS[i].highlighted && "bg-primary/5 font-medium",
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
              Can&apos;t find what you&apos;re looking for? Email
              support@pulseboard.example and a human will get back to you.
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
        <section
          aria-labelledby="cta-heading"
          className="mt-20 rounded-2xl border bg-muted/40 px-6 py-12 text-center sm:mt-28"
        >
          <h2
            id="cta-heading"
            className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Ready to see what your app is really doing?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Connect your first project in under five minutes. No credit card,
            no sales call.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg">Start for free</Button>
            <Button size="lg" variant="outline">
              Talk to sales
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
