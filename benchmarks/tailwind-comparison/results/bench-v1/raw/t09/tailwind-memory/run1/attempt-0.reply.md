The design is built on Tailwind v4 theme tokens. `@theme` defines the semantic colour, radius and font tokens, and the dark and light values are swapped through CSS variables keyed on a `data-theme` attribute on `<html>`. An inline script sets the theme before paint, so there is no flash and no hydration mismatch.

Because the theme is applied to `<html>` before React hydrates, the `<html>` element gets `suppressHydrationWarning`.

I'm leaving out `lib/theme`. The toggle reads the attribute from the DOM, and the mounted state is handled with `useSyncExternalStore`.

```css app/globals.css
@import "tailwindcss";

/*
 * Lumen design tokens.
 * Semantic tokens are CSS variables swapped per theme; Tailwind utilities
 * (bg-surface, text-fg, border-line, bg-brand, rounded-lumen ...) read them.
 */

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root,
[data-theme="dark"] {
  color-scheme: dark;
  --bg: #1c1917; /* stone-900 */
  --surface: #292524; /* stone-800 */
  --surface-2: #34302d;
  --line: #44403c; /* stone-700 */
  --fg: #fafaf9; /* stone-50 */
  --fg-muted: #a8a29e; /* stone-400 */
  --brand: #e8590c;
  --brand-hover: #f76707;
  --brand-fg: #1c1917;
  --link: #ff8a4c;
}

[data-theme="light"] {
  color-scheme: light;
  --bg: #fafaf9; /* stone-50 */
  --surface: #ffffff;
  --surface-2: #f5f5f4; /* stone-100 */
  --line: #d6d3d1; /* stone-300 */
  --fg: #1c1917; /* stone-900 */
  --fg-muted: #57534e; /* stone-600 */
  --brand: #e8590c;
  --brand-hover: #c2410c;
  --brand-fg: #ffffff;
  --link: #c2410c;
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-line: var(--line);
  --color-fg: var(--fg);
  --color-muted: var(--fg-muted);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-fg: var(--brand-fg);
  --color-link: var(--link);

  --radius-lumen: 4px;

  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
}

@layer base {
  html {
    background-color: var(--bg);
    color: var(--fg);
  }

  body {
    background-color: var(--bg);
    color: var(--fg);
    font-family: var(--font-sans);
    min-height: 100vh;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-serif);
    letter-spacing: -0.01em;
  }

  :focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
    border-radius: 4px;
  }

  a:not([class]) {
    color: var(--link);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

@layer components {
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: var(--radius-lumen);
    padding: 0.625rem 1.125rem;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.25rem;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s, color 0.15s;
  }

  .btn-primary {
    background-color: var(--brand);
    color: var(--brand-fg);
  }
  .btn-primary:hover {
    background-color: var(--brand-hover);
  }

  .btn-secondary {
    background-color: transparent;
    color: var(--fg);
    border-color: var(--line);
  }
  .btn-secondary:hover {
    background-color: var(--surface-2);
  }

  .card {
    background-color: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-lumen);
  }

  .input {
    background-color: var(--bg);
    color: var(--fg);
    border: 1px solid var(--line);
    border-radius: var(--radius-lumen);
    padding: 0.5rem 0.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Lumen — Product analytics and issue tracking",
  description:
    "Product analytics and issue tracking that small teams actually read.",
};

// Runs before first paint: dark by default, honour a saved choice.
const themeScript = `(function(){try{var t=localStorage.getItem("lumen-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lumen focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
```

```ts lib/data.ts
export type Plan = {
  name: string;
  priceMonth: number;
  seats: string;
  features: string[];
  highlight?: boolean;
};

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

export const nav = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
];

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    features: [
      "Unlimited projects",
      "1-year history",
      "Issue tracker",
      "Email support",
    ],
    highlight: true,
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
  },
];

export const faq = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrades apply at once; downgrades at the end of the billing period.",
  },
  {
    q: "Do you offer a discount for non-profits?",
    a: "Yes, 50% off Team and Business for registered non-profits.",
  },
  {
    q: "Where is my data stored?",
    a: "In the EU, encrypted at rest.",
  },
];

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
];

export const features = [
  {
    title: "Analytics you can read in a minute",
    body: "One dashboard shows what shipped, what people used and what broke. No query language, no twenty-tab report builder, just the numbers a small team needs on Monday morning.",
    points: ["Weekly digest by email", "Funnels and retention", "Shareable links"],
    icon: "chart",
  },
  {
    title: "Issues that live next to the data",
    body: "Open an issue straight from a drop in a funnel. The chart, the affected sessions and the discussion stay attached, so nobody has to reconstruct the context later.",
    points: ["Issue from any chart", "Sessions attached", "Keyboard-first triage"],
    icon: "issue",
  },
  {
    title: "Built for teams of two to twenty",
    body: "Simple per-seat pricing, EU data storage and sensible defaults. Invite the whole team without a procurement meeting, and grow into SSO and audit logs when you need them.",
    points: ["EU data, encrypted at rest", "Per-seat pricing", "SSO on Business"],
    icon: "team",
  },
] as const;

export const comparison: { feature: string; values: [string, string, string] }[] =
  [
    { feature: "Projects", values: ["1", "Unlimited", "Unlimited"] },
    { feature: "History", values: ["7 days", "1 year", "Unlimited"] },
    { feature: "Issue tracker", values: ["No", "Yes", "Yes"] },
    { feature: "SSO and audit log", values: ["No", "No", "Yes"] },
    {
      feature: "Support",
      values: ["Community", "Email", "Priority"],
    },
  ];

/** Yearly billing = two months free: pay for 10 months, shown per month. */
export function planPrice(priceMonth: number, yearly: boolean): number {
  if (!yearly) return priceMonth;
  return Math.round(((priceMonth * 10) / 12) * 100) / 100;
}

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * 10;
}
```

```tsx components/theme-toggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): "dark" | "light" {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("lumen-theme", next);
    } catch {
      // storage unavailable; theme still applies for this session
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex size-10 items-center justify-center rounded-lumen border border-line text-fg transition-colors hover:bg-surface-2"
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
```

```tsx components/site-header.tsx
import Link from "next/link";

import { brand, nav } from "@/lib/data";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tight text-fg"
        >
          {brand.name}
          <span className="text-brand" aria-hidden="true">
            .
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <nav aria-label="Main">
            <ul className="flex items-center gap-1 sm:gap-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-lumen px-2 py-2 text-sm font-medium text-muted transition-colors hover:text-fg sm:px-3"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

```tsx components/site-footer.tsx
import Link from "next/link";

import { brand, nav } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-xl font-bold">{brand.name}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Analytics and issue tracking for small software teams.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-link"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-muted">
          © 2025 {brand.name}. Data stored in the EU.
        </p>
      </div>
    </footer>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import { BarChart3, Bug, Users } from "lucide-react";

import { brand, features, logos } from "@/lib/data";

const icons = {
  chart: BarChart3,
  issue: Bug,
  team: Users,
} as const;

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-link">
          {brand.name} for small software teams
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          {brand.tagline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          See what your users do, turn the surprises into issues, and keep both
          in one place your whole team opens every day.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/pricing" className="btn btn-primary">
            Start free
          </Link>
          <Link href="/pricing" className="btn btn-secondary">
            See pricing
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="logos-heading"
        className="border-y border-line bg-surface"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2
            id="logos-heading"
            className="text-center text-sm font-medium text-muted"
          >
            Trusted by small teams shipping every week
          </h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((logo) => (
              <li
                key={logo}
                className="font-serif text-xl font-bold text-muted"
              >
                {logo}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 sm:px-6">
        {features.map((f, i) => {
          const Icon = icons[f.icon];
          return (
            <section
              key={f.title}
              aria-labelledby={`feature-${i}`}
              className="grid items-center gap-8 border-b border-line py-16 last:border-b-0 md:grid-cols-2 md:gap-14"
            >
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <span className="inline-flex size-11 items-center justify-center rounded-lumen bg-brand text-brand-fg">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h2 id={`feature-${i}`} className="mt-5 text-3xl font-bold">
                  {f.title}
                </h2>
                <p className="mt-4 text-muted">{f.body}</p>
              </div>
              <ul className="card divide-y divide-line">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 px-5 py-4">
                    <span
                      className="size-2 shrink-0 rounded-full bg-brand"
                      aria-hidden="true"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Ready to read your product?</h2>
          <Link href="/pricing" className="btn btn-primary">
            Compare plans
          </Link>
        </div>
      </section>
    </>
  );
}
```

```tsx components/pricing-view.tsx
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
```

```tsx app/pricing/page.tsx
import type { Metadata } from "next";

import { PricingView } from "@/components/pricing-view";

export const metadata: Metadata = {
  title: "Pricing — Lumen",
  description: "Free, Team and Business plans. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return <PricingView />;
}
```