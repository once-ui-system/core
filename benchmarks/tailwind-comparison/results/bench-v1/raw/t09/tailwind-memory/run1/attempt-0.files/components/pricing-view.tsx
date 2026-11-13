"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useId, useState } from "react";

import {
  comparison,
  faq,
  planPrice,
  plans,
  yearlyTotal,
} from "@/lib/data";

function formatPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

export function PricingView() {
  const [yearly, setYearly] = useState(false);
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-16 text-center sm:px-6 sm:pt-20">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Simple pricing for small teams
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Start free. Pay per seat when your team grows. Choose yearly billing
          and get two months free.
        </p>

        <div className="mt-8 inline-flex items-center gap-3">
          <span
            className={yearly ? "text-muted" : "font-semibold"}
            id={`${baseId}-monthly`}
          >
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            aria-labelledby={`${baseId}-yearly`}
            onClick={() => setYearly((v) => !v)}
            className="relative h-7 w-12 rounded-lumen border border-line bg-surface-2 transition-colors aria-checked:bg-brand"
          >
            <span
              className={`absolute left-0.5 top-0.5 size-5 rounded-[3px] bg-fg transition-transform ${
                yearly ? "translate-x-5" : ""
              }`}
              aria-hidden="true"
            />
          </button>
          <span
            className={yearly ? "font-semibold" : "text-muted"}
            id={`${baseId}-yearly`}
          >
            Yearly{" "}
            <span className="ml-1 rounded-lumen bg-brand px-2 py-0.5 text-xs font-semibold text-brand-fg">
              2 months free
            </span>
          </span>
        </div>
      </section>

      <section
        aria-label="Plans"
        className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3"
      >
        {plans.map((plan) => {
          const price = planPrice(plan.priceMonth, yearly);
          return (
            <article
              key={plan.name}
              className={`card relative flex flex-col p-6 ${
                plan.highlight ? "border-2 !border-brand" : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-lumen bg-brand px-3 py-0.5 text-xs font-semibold text-brand-fg">
                  Most popular
                </span>
              )}
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-serif text-5xl font-bold">
                  {formatPrice(price)}
                </span>
                <span className="text-sm text-muted">
                  / month · {plan.seats}
                </span>
              </p>
              <p className="mt-1 min-h-5 text-sm text-muted" aria-live="polite">
                {plan.priceMonth === 0
                  ? "Free forever"
                  : yearly
                    ? `Billed ${formatPrice(yearlyTotal(plan.priceMonth))} per seat yearly`
                    : "Billed monthly"}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-link"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn mt-8 ${
                  plan.highlight ? "btn-primary" : "btn-secondary"
                }`}
              >
                {plan.priceMonth === 0 ? "Start free" : `Choose ${plan.name}`}
              </button>
            </article>
          );
        })}
      </section>

      <section
        aria-labelledby="compare-heading"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6"
      >
        <h2 id="compare-heading" className="text-3xl font-bold">
          Compare plans
        </h2>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <caption className="sr-only">Feature comparison by plan</caption>
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Feature
                </th>
                {plans.map((p) => (
                  <th
                    key={p.name}
                    scope="col"
                    className={`px-4 py-3 font-semibold ${
                      p.highlight ? "text-link" : ""
                    }`}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-b-0">
                  <th scope="row" className="px-4 py-3 font-medium">
                    {row.feature}
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-4 py-3 ${
                        v === "No" ? "text-muted" : ""
                      }`}
                    >
                      {v === "No" ? (
                        <>
                          <Minus className="size-4" aria-hidden="true" />
                          <span className="sr-only">No</span>
                        </>
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl px-4 py-12 sm:px-6"
      >
        <h2 id="faq-heading" className="text-3xl font-bold">
          Frequently asked questions
        </h2>
        <div className="card mt-6 divide-y divide-line">
          {faq.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-sans text-base font-semibold hover:bg-surface-2"
                  >
                    {item.q}
                    {isOpen ? (
                      <Minus className="size-5 shrink-0 text-link" aria-hidden="true" />
                    ) : (
                      <Plus className="size-5 shrink-0 text-link" aria-hidden="true" />
                    )}
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-5 pb-4 text-muted"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
