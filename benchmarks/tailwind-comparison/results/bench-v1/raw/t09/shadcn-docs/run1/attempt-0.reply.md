Writing the files now.

```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Brand corner radius: every component radius step resolves to the one brand value */
  --radius-xs: 2px;
  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: calc(var(--radius) * 2);
  --radius-3xl: calc(var(--radius) * 3);
  --radius-4xl: calc(var(--radius) * 4);

  /* Brand fonts (system stacks, nothing to load) */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
  --font-heading: var(--font-serif);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

/* Light theme: warm stone neutrals + Lumen orange (#E8590C family) */
:root {
  --radius: 4px;
  --background: oklch(0.985 0.003 75);
  --foreground: oklch(0.216 0.006 56);
  --card: oklch(1 0.002 75);
  --card-foreground: oklch(0.216 0.006 56);
  --popover: oklch(1 0.002 75);
  --popover-foreground: oklch(0.216 0.006 56);
  /* Slightly deeper than #E8590C so links and white text pass contrast on light surfaces */
  --primary: oklch(0.57 0.19 42);
  --primary-foreground: oklch(0.985 0.003 75);
  --secondary: oklch(0.953 0.005 75);
  --secondary-foreground: oklch(0.268 0.007 34);
  --muted: oklch(0.953 0.005 75);
  --muted-foreground: oklch(0.47 0.012 56);
  --accent: oklch(0.937 0.008 75);
  --accent-foreground: oklch(0.216 0.006 56);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.88 0.008 75);
  --input: oklch(0.88 0.008 75);
  --ring: oklch(0.57 0.19 42);
  --chart-1: oklch(0.65 0.2 43);
  --chart-2: oklch(0.6 0.05 60);
  --chart-3: oklch(0.45 0.02 56);
  --chart-4: oklch(0.78 0.14 70);
  --chart-5: oklch(0.7 0.1 30);
  --sidebar: oklch(0.97 0.004 75);
  --sidebar-foreground: oklch(0.216 0.006 56);
  --sidebar-primary: oklch(0.57 0.19 42);
  --sidebar-primary-foreground: oklch(0.985 0.003 75);
  --sidebar-accent: oklch(0.937 0.008 75);
  --sidebar-accent-foreground: oklch(0.216 0.006 56);
  --sidebar-border: oklch(0.88 0.008 75);
  --sidebar-ring: oklch(0.57 0.19 42);
}

/* Dark theme (default) */
.dark {
  --background: oklch(0.147 0.004 49);
  --foreground: oklch(0.97 0.003 75);
  --card: oklch(0.216 0.006 56);
  --card-foreground: oklch(0.97 0.003 75);
  --popover: oklch(0.216 0.006 56);
  --popover-foreground: oklch(0.97 0.003 75);
  /* Brand colour #E8590C */
  --primary: oklch(0.65 0.2 43);
  --primary-foreground: oklch(0.147 0.004 49);
  --secondary: oklch(0.268 0.007 34);
  --secondary-foreground: oklch(0.97 0.003 75);
  --muted: oklch(0.268 0.007 34);
  --muted-foreground: oklch(0.74 0.012 75);
  --accent: oklch(0.268 0.007 34);
  --accent-foreground: oklch(0.97 0.003 75);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(0.97 0.003 75 / 12%);
  --input: oklch(0.97 0.003 75 / 16%);
  --ring: oklch(0.65 0.2 43);
  --chart-1: oklch(0.65 0.2 43);
  --chart-2: oklch(0.7 0.05 60);
  --chart-3: oklch(0.8 0.02 75);
  --chart-4: oklch(0.78 0.14 70);
  --chart-5: oklch(0.7 0.1 30);
  --sidebar: oklch(0.216 0.006 56);
  --sidebar-foreground: oklch(0.97 0.003 75);
  --sidebar-primary: oklch(0.65 0.2 43);
  --sidebar-primary-foreground: oklch(0.147 0.004 49);
  --sidebar-accent: oklch(0.268 0.007 34);
  --sidebar-accent-foreground: oklch(0.97 0.003 75);
  --sidebar-border: oklch(0.97 0.003 75 / 12%);
  --sidebar-ring: oklch(0.65 0.2 43);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    font-family: var(--font-sans);
  }
  body {
    @apply bg-background text-foreground;
  }
  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-heading);
    letter-spacing: -0.01em;
  }
  a:not([data-slot="button"]) {
    text-underline-offset: 4px;
  }
  .prose-link {
    @apply font-medium text-primary underline-offset-4 hover:underline;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Lumen: product analytics and issue tracking for small teams",
    template: "%s | Lumen",
  },
  description:
    "Product analytics and issue tracking that small teams actually read.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```tsx components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

```tsx components/theme-toggle.tsx
"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Toggle theme">
          <SunIcon className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
          <MoonIcon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme === "light" ? "light" : "dark"}
          onValueChange={(value) => setTheme(value)}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

```ts lib/data.ts
export const brand = {
  name: "Lumen",
  product:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking that small teams actually read",
  brandColor: "#E8590C",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
] as const;

export type Plan = {
  name: string;
  priceMonth: number;
  seats: string;
  blurb: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For solo builders trying out Lumen on a side project.",
    features: ["1 project", "7-day history", "Community support"],
    cta: "Start for free",
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For small software teams who ship every week.",
    features: [
      "Unlimited projects",
      "1-year history",
      "Issue tracker",
      "Email support",
    ],
    highlight: true,
    cta: "Start Team trial",
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    blurb: "For growing teams that need control and compliance.",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
    cta: "Talk to sales",
  },
];

/** Yearly billing = two months free, i.e. 10 months charged. Returns the per-month equivalent. */
export function yearlyMonthlyEquivalent(priceMonth: number): number {
  return (priceMonth * 10) / 12;
}

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * 10;
}

export type ComparisonRow = {
  feature: string;
  values: [boolean | string, boolean | string, boolean | string];
};

export const comparison: ComparisonRow[] = [
  { feature: "Projects", values: ["1", "Unlimited", "Unlimited"] },
  { feature: "Event history", values: ["7 days", "1 year", "Unlimited"] },
  { feature: "Issue tracker", values: [false, true, true] },
  { feature: "SSO and audit log", values: [false, false, true] },
  {
    feature: "Support",
    values: ["Community", "Email", "Priority"],
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
] as const;

export const features = [
  {
    title: "Analytics you can read in a minute",
    body: "One page per product area, with the five numbers your team actually discusses. No dashboards to build, no query language to learn, and no chart that needs a legend to decode.",
    points: [
      "Weekly digest written in plain sentences",
      "Funnels and retention without setup",
      "Shareable links that never expire",
    ],
  },
  {
    title: "An issue tracker that lives next to the data",
    body: "Spot a drop in signups, open an issue from the chart, and the evidence travels with it. When the fix ships, Lumen shows you whether the number moved.",
    points: [
      "Issues linked to the metric that triggered them",
      "Lightweight boards, no sprints required",
      "Before-and-after view on every release",
    ],
  },
  {
    title: "Built for teams of three to thirty",
    body: "Predictable per-seat pricing, EU data residency and encryption at rest from day one. Add SSO and an audit log when your customers ask for them.",
    points: [
      "Data stored in the EU, encrypted at rest",
      "Per-seat pricing with no event quotas",
      "Upgrade or downgrade whenever you like",
    ],
  },
] as const;

export const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Features", href: "/#features" },
      { label: "Customers", href: "/#customers" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Changelog", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
] as const;
```

```tsx components/site-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand, navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-md font-serif text-2xl font-bold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {brand.name}
          <span className="text-primary" aria-hidden="true">
            .
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                className={cn(active && "bg-accent text-accent-foreground")}
              >
                <Link href={link.href} aria-current={active ? "page" : undefined}>
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/">Sign in</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/pricing">Get started</Link>
          </Button>
          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{brand.name}</SheetTitle>
                <SheetDescription>Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start"
                    >
                      <Link
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    </Button>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild className="mt-2">
                    <Link href="/pricing">Get started</Link>
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
```

```tsx components/site-footer.tsx
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { brand, footerLinks } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-serif text-2xl font-bold">
              {brand.name}
              <span className="text-primary" aria-hidden="true">
                .
              </span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {brand.tagline}.
            </p>
          </div>
          {footerLinks.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="font-sans text-sm font-semibold">
                {group.heading}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-muted-foreground outline-none hover:text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2025 Lumen. All rights reserved.</p>
          <p>Your data stays in the EU, encrypted at rest.</p>
        </div>
      </div>
    </footer>
  );
}
```

```tsx components/site-shell.tsx
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { brand, features, logos } from "@/lib/data";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            For small software teams
          </p>
          <h1 className="mt-4 text-4xl font-bold text-balance sm:text-5xl lg:text-6xl">
            {brand.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Lumen turns your product data into a short, honest page your whole
            team reads on Monday morning, and lets you open an issue the moment
            a number looks wrong.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/pricing">
                Start free
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="customers"
        aria-labelledby="customers-heading"
        className="border-y bg-card/40"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <h2
            id="customers-heading"
            className="text-center font-sans text-sm font-medium text-muted-foreground"
          >
            Trusted by small teams at
          </h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((logo) => (
              <li
                key={logo}
                className="font-serif text-xl font-semibold text-muted-foreground"
              >
                {logo}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div id="features" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {features.map((feature, index) => (
          <section
            key={feature.title}
            aria-labelledby={`feature-${index}`}
            className="grid items-center gap-8 border-b py-14 last:border-b-0 sm:py-20 lg:grid-cols-2 lg:gap-16"
          >
            <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
              <p className="text-sm font-medium text-primary">
                0{index + 1}
              </p>
              <h2
                id={`feature-${index}`}
                className="mt-2 text-3xl font-bold text-balance"
              >
                {feature.title}
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                {feature.body}
              </p>
            </div>
            <ul className="space-y-3 rounded-lg border bg-card p-6 text-card-foreground">
              {feature.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm">
                  <CheckIcon
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="border-t bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-3xl font-bold text-balance">
            Give your team one page worth reading.
          </h2>
          <Button asChild size="lg">
            <Link href="/pricing">
              Compare plans
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
```

```tsx app/pricing/page.tsx
import type { Metadata } from "next";

import { SiteShell } from "@/components/site-shell";
import { PricingView } from "@/components/pricing-view";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple per-seat pricing for Lumen. Free for one seat, Team and Business for growing teams. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingView />
    </SiteShell>
  );
}
```

```tsx components/pricing-view.tsx
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
```