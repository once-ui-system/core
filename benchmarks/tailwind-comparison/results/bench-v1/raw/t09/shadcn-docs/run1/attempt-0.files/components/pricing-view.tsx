"use client";

import * as React from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
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
import {
  comparison,
  faq,
  plans,
  yearlyMonthlyEquivalent,
  yearlyTotal,
  type Plan,
} from "@/lib/data";
import { cn } from "@/lib/utils";

function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const free = plan.priceMonth === 0;
  const shown = yearly
    ? yearlyMonthlyEquivalent(plan.priceMonth)
    : plan.priceMonth;

  return (
    <Card
      className={cn(
        "relative",
        plan.highlight && "border-2 border-primary shadow-lg"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-serif text-xl">{plan.name}</CardTitle>
          {plan.highlight && <Badge>Most popular</Badge>}
        </div>
        <CardDescription>{plan.blurb}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div>
          <p className="flex items-baseline gap-1">
            <span className="font-serif text-4xl font-bold">
              {formatPrice(shown)}
            </span>
            <span className="text-sm text-muted-foreground">
              {free ? "forever" : `/ ${plan.seats} / month`}
            </span>
          </p>
          <p className="mt-1 min-h-5 text-sm text-muted-foreground">
            {free
              ? plan.seats
              : yearly
                ? `Billed ${formatPrice(yearlyTotal(plan.priceMonth))} per seat yearly (2 months free)`
                : "Billed monthly"}
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          {plan.features.map((feature) => (
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
          variant={plan.highlight ? "default" : "outline"}
          onClick={() =>
            toast.success(`${plan.name} selected`, {
              description: "This is a demo, so nothing was charged.",
            })
          }
        >
          {plan.cta}
        </Button>
      </CardFooter>
    </Card>
  );
}

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <>
        <CheckIcon
          className="mx-auto size-4 text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">Included</span>
      </>
    );
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
    );
  }
  return <span>{value}</span>;
}

export function PricingView() {
  const [yearly, setYearly] = React.useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-balance sm:text-5xl">
          Simple pricing for small teams
        </h1>
        <p className="mt-4 text-muted-foreground text-pretty">
          Start free, upgrade when your team grows. Pay yearly and get two
          months free.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Label
            htmlFor="billing-switch"
            className={cn(!yearly && "text-foreground", yearly && "text-muted-foreground")}
          >
            Monthly
          </Label>
          <Switch
            id="billing-switch"
            checked={yearly}
            onCheckedChange={setYearly}
            aria-label="Bill yearly"
          />
          <Label
            htmlFor="billing-switch"
            className={cn(yearly ? "text-foreground" : "text-muted-foreground")}
          >
            Yearly
          </Label>
          <Badge variant="secondary">2 months free</Badge>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {yearly
            ? "Showing yearly prices, two months free"
            : "Showing monthly prices"}
        </p>
      </div>

      <section
        aria-label="Plans"
        className="mt-12 grid gap-6 md:grid-cols-3"
      >
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} yearly={yearly} />
        ))}
      </section>

      <section aria-labelledby="compare-heading" className="mt-20">
        <h2 id="compare-heading" className="text-3xl font-bold">
          Compare plans
        </h2>
        <div className="mt-6 rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="h-12 px-4">
                  Feature
                </TableHead>
                {plans.map((plan) => (
                  <TableHead
                    key={plan.name}
                    scope="col"
                    className={cn(
                      "h-12 px-4 text-center",
                      plan.highlight && "text-primary"
                    )}
                  >
                    {plan.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.map((row) => (
                <TableRow key={row.feature}>
                  <TableHead scope="row" className="px-4 py-3 font-medium">
                    {row.feature}
                  </TableHead>
                  {row.values.map((value, i) => (
                    <TableCell
                      key={plans[i].name}
                      className={cn(
                        "px-4 py-3 text-center",
                        plans[i].highlight && "bg-primary/5"
                      )}
                    >
                      <Cell value={value} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto mt-20 max-w-3xl"
      >
        <h2 id="faq-heading" className="text-3xl font-bold">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="mt-6">
          {faq.map((item, index) => (
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
    </div>
  );
}
