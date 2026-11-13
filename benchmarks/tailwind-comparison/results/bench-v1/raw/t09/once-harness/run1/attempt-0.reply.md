The example's Table is loosely typed, and I can't confirm the generic row type from the slice, so I'll make my Table rows a plain `Record<string, string>` to stay type-safe. Final output:

`lib/theme.ts`

```ts
import { defineConfig } from "@once-ui-system/core/config";

/**
 * Lumen brand theme: the single source of truth, spread into both
 * <ThemeInit> (server, first paint) and <ThemeProvider> (client).
 *
 * - theme "system" + defaultTheme "dark": dark on first visit, switchable.
 * - brand: exact ramp built around #E8590C (step 600 is the brand colour).
 * - neutral: warm stone grey ramp.
 */
export const { style, dataStyle } = defineConfig({
  style: {
    theme: "system",
    defaultTheme: "dark",
    neutral: "custom",
    brand: "custom",
    accent: "custom",
    solid: "color",
    solidStyle: "flat",
    border: "conservative",
    surface: "filled",
    transition: "micro",
    scaling: "100",
    brandSeed: "#E8590C",
    accentSeed: "#E8590C",
    neutralSeed: "#78716C",
    brandScale: {
      light: {
        100: "#FFF4EC",
        200: "#FFE6D3",
        300: "#FFCFAB",
        400: "#FFB07A",
        500: "#F5873F",
        600: "#E8590C",
        700: "#C94A07",
        800: "#A33C06",
        900: "#7D2F06",
        1000: "#5A2305",
        1100: "#3D1804",
        1200: "#260F03",
      },
      dark: {
        100: "#2A1405",
        200: "#3D1B07",
        300: "#5A260A",
        400: "#7D330C",
        500: "#A5430D",
        600: "#E8590C",
        700: "#F2762E",
        800: "#F79357",
        900: "#FAB083",
        1000: "#FCCBAB",
        1100: "#FDE2CF",
        1200: "#FEF1E6",
      },
    },
    accentScale: {
      light: {
        100: "#FFF4EC",
        200: "#FFE6D3",
        300: "#FFCFAB",
        400: "#FFB07A",
        500: "#F5873F",
        600: "#E8590C",
        700: "#C94A07",
        800: "#A33C06",
        900: "#7D2F06",
        1000: "#5A2305",
        1100: "#3D1804",
        1200: "#260F03",
      },
      dark: {
        100: "#2A1405",
        200: "#3D1B07",
        300: "#5A260A",
        400: "#7D330C",
        500: "#A5430D",
        600: "#E8590C",
        700: "#F2762E",
        800: "#F79357",
        900: "#FAB083",
        1000: "#FCCBAB",
        1100: "#FDE2CF",
        1200: "#FEF1E6",
      },
    },
    neutralScale: {
      light: {
        100: "#FAF9F7",
        200: "#F5F5F4",
        300: "#E7E5E4",
        400: "#D6D3D1",
        500: "#A8A29E",
        600: "#78716C",
        700: "#57534E",
        800: "#44403C",
        900: "#292524",
        1000: "#1C1917",
        1100: "#12100F",
        1200: "#0C0A09",
      },
      dark: {
        100: "#12100F",
        200: "#1C1917",
        300: "#292524",
        400: "#3A3532",
        500: "#57534E",
        600: "#78716C",
        700: "#A8A29E",
        800: "#D6D3D1",
        900: "#E7E5E4",
        1000: "#F5F5F4",
        1100: "#FAF9F7",
        1200: "#FFFFFF",
      },
    },
    pageBackground: { light: "#FAF9F7", dark: "#14110F" },
    surfaceBackground: { light: "#FFFFFF", dark: "#1C1917" },
  },
  dataStyle: {
    variant: "flat",
    mode: "categorical",
    height: 24,
    axis: { stroke: "var(--neutral-alpha-weak)" },
    tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
  },
});
```

```ts lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
} as const;

export const navItems = [
  { label: "Product", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Customers", href: "/#customers" },
] as const;

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
] as const;

export type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: IconName;
  points: readonly string[];
};

export const features: readonly Feature[] = [
  {
    id: "analytics",
    eyebrow: "Product analytics",
    title: "Numbers your whole team will open on a Monday",
    body: "Lumen turns raw events into a single weekly view: who signed up, what they used and where they stopped. No query language, no dashboards to maintain.",
    icon: "barChart",
    points: [
      "One shared weekly summary, written in plain sentences",
      "Funnels and retention without setting up a data warehouse",
      "Every chart links to the people and sessions behind it",
    ],
  },
  {
    id: "issues",
    eyebrow: "Issue tracking",
    title: "Bugs and requests, filed from the data itself",
    body: "Spot a drop-off, open an issue from the chart, and keep the evidence attached. The tracker is fast, keyboard-first and small enough to learn in an afternoon.",
    icon: "checkbox",
    points: [
      "Create an issue from any chart, session or user",
      "Cycles, labels and assignees, and nothing you do not need",
      "Status changes show up next to the metric they affect",
    ],
  },
  {
    id: "privacy",
    eyebrow: "Privacy and control",
    title: "Your data stays in the EU, and stays yours",
    body: "Events are stored in EU data centres and encrypted at rest. Export everything as plain files whenever you like, or delete a project in one step.",
    icon: "security",
    points: [
      "EU data residency, encrypted at rest",
      "Full export in open formats at any time",
      "Single sign-on and an audit log on the Business plan",
    ],
  },
];

export type Plan = {
  name: string;
  priceMonth: number;
  seats: string;
  features: readonly string[];
  highlight?: boolean;
  blurb: string;
  cta: string;
};

export const plans: readonly Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For one person trying Lumen on a side project.",
    cta: "Start for free",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For small teams that ship every week.",
    cta: "Start a Team trial",
    highlight: true,
    features: ["Unlimited projects", "1-year history", "Issue tracker", "Email support"],
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    blurb: "For teams that need access control and long memory.",
    cta: "Talk to us",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
  },
];

/** Yearly billing is two months free: pay for 10 months, spread over 12. */
export const YEARLY_MONTHS_PAID = 10;

export function monthlyPrice(plan: Plan, yearly: boolean): number {
  if (!yearly) return plan.priceMonth;
  const perMonth = (plan.priceMonth * YEARLY_MONTHS_PAID) / 12;
  return Math.round(perMonth * 100) / 100;
}

export function yearlyTotal(plan: Plan): number {
  return plan.priceMonth * YEARLY_MONTHS_PAID;
}

export function formatPrice(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export const comparison: readonly Record<string, string>[] = [
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "History", free: "7 days", team: "1 year", business: "Unlimited" },
  { feature: "Issue tracker", free: "—", team: "Included", business: "Included" },
  { feature: "SSO and audit log", free: "—", team: "—", business: "Included" },
  { feature: "Support", free: "Community", team: "Email", business: "Priority" },
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

export const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Customers", href: "/#customers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Security", href: "/" },
    ],
  },
] as const;
```

```css app/fonts.css
/*
 * Lumen typography and shape, expressed as design-system tokens (not per-element styles).
 * Both families are system fonts: nothing is loaded from the network.
 */
:root {
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;
}

/*
 * 4px corner radius on buttons, inputs, cards and menus: every Once UI
 * component reads its corners from the radius scale, so we set the scale.
 * Applied on :root and on every theme attribute so the system's own
 * data-border rules cannot win over it.
 */
:root,
:root[data-border],
[data-border] {
  --radius-xs: 2px;
  --radius-s: 4px;
  --radius-m: 4px;
  --radius-l: 4px;
  --radius-xl: 4px;
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { brand } from "../lib/data";
import { dataStyle, style } from "../lib/theme";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: `${brand.name}: ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Paints the dark default and the brand ramps before first render. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>{children}</Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack (mirrors the official Next.js starter):
// theme, Next-aware links/images, chart theme, toasts, icons.
// The Lumen brand is applied here once, through the design system's own theme options.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { dataStyle, style } from "../lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider {...style}>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
```

```tsx components/ThemeToggle.tsx
"use client";

import { IconButton, useTheme } from "@once-ui-system/core";
import { useEffect, useState } from "react";

/** Light/dark toggle: flips the whole site through the design system's theme context. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mount the resolved theme can differ from the server render; keep markup stable.
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const next = isDark ? "light" : "dark";

  return (
    <IconButton
      variant="tertiary"
      icon={isDark ? "light" : "dark"}
      tooltip={`Switch to ${next} theme`}
      aria-label={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
    />
  );
}
```

```tsx components/SiteHeader.tsx
"use client";

import { Button, Column, Drawer, IconButton, Row, SmartLink, Text } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand, navItems } from "../lib/data";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <Row
      as="header"
      fillWidth
      horizontal="center"
      paddingX="16"
      background="page"
      borderBottom
      style={{ position: "sticky", top: 0, zIndex: 10 }}
    >
      <Row maxWidth="l" height="56" vertical="center" horizontal="between" gap="16">
        <SmartLink href="/" aria-label={`${brand.name} home`}>
          <Text as="span" family="heading" textVariant="heading-strong-l" onBackground="neutral-strong">
            {brand.name}
          </Text>
        </SmartLink>

        <Row as="nav" aria-label="Main" gap="4" s={{ hide: true }}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              href={item.href}
              variant="tertiary"
              size="s"
              data-border="rounded"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Button>
          ))}
        </Row>

        <Row gap="8" vertical="center">
          <ThemeToggle />
          <Row s={{ hide: true }}>
            <Button href="/pricing" size="s" data-border="rounded">
              Get started
            </Button>
          </Row>
          <Row hide s={{ hide: false }}>
            <IconButton
              icon="menu"
              variant="tertiary"
              tooltip="Menu"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuPath(pathname)}
            />
          </Row>
        </Row>
      </Row>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuPath(null)}
        side="right"
        size="s"
        title="Menu"
      >
        <Column as="nav" aria-label="Mobile" gap="8" paddingTop="16">
          {navItems.map((item) => (
            <Button
              key={item.href}
              href={item.href}
              variant="tertiary"
              fillWidth
              horizontal="start"
              data-border="rounded"
            >
              {item.label}
            </Button>
          ))}
          <Button href="/pricing" fillWidth data-border="rounded">
            Get started
          </Button>
        </Column>
      </Drawer>
    </Row>
  );
}
```

```tsx components/SiteFooter.tsx
import { Column, Grid, Heading, Row, SmartLink, Text } from "@once-ui-system/core";
import { brand, footerLinks } from "../lib/data";

export function SiteFooter() {
  return (
    <Row
      as="footer"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="64"
      borderTop
      background="surface"
    >
      <Column maxWidth="l" gap="48">
        <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="32">
          <Column gap="12">
            <Text as="p" family="heading" textVariant="heading-strong-l">
              {brand.name}
            </Text>
            <Text as="p" textVariant="body-default-s" onBackground="neutral-weak">
              Product analytics and issue tracking for small software teams.
            </Text>
          </Column>
          {footerLinks.map((group) => (
            <Column key={group.title} as="nav" aria-label={group.title} gap="12">
              <Heading as="h2" textVariant="label-strong-s" onBackground="neutral-strong">
                {group.title}
              </Heading>
              <Column as="ul" gap="8">
                {group.links.map((link) => (
                  <Column as="li" key={link.label}>
                    <SmartLink href={link.href}>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {link.label}
                      </Text>
                    </SmartLink>
                  </Column>
                ))}
              </Column>
            </Column>
          ))}
        </Grid>
        <Row
          borderTop
          paddingTop="24"
          gap="16"
          horizontal="between"
          wrap
          textVariant="body-default-xs"
          onBackground="neutral-weak"
        >
          <Text as="span">© 2025 Lumen Analytics GmbH. All rights reserved.</Text>
          <Text as="span">Data stored in the EU, encrypted at rest.</Text>
        </Row>
      </Column>
    </Row>
  );
}
```

```tsx components/SiteShell.tsx
import { Column, VisuallyHidden } from "@once-ui-system/core";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Shared page frame: skip link, header, main landmark and footer. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth minHeight="100vh">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <SiteHeader />
      <Column as="main" id="main" fillWidth horizontal="center" flex={1}>
        {children}
      </Column>
      <SiteFooter />
    </Column>
  );
}
```

```tsx components/FeatureSection.tsx
import { Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type { Feature } from "../lib/data";

export function FeatureSection({ feature, reverse }: { feature: Feature; reverse?: boolean }) {
  return (
    <Row
      as="section"
      aria-labelledby={`feature-${feature.id}`}
      fillWidth
      gap="64"
      vertical="center"
      direction={reverse ? "row-reverse" : "row"}
      m={{ gap: "40" }}
      s={{ direction: "column", gap: "32" }}
    >
      <Column flex={1} gap="20">
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {feature.eyebrow}
        </Text>
        <Heading as="h3" id={`feature-${feature.id}`} textVariant="display-strong-xs">
          {feature.title}
        </Heading>
        <Text as="p" textVariant="body-default-l" onBackground="neutral-weak">
          {feature.body}
        </Text>
      </Column>
      <Column flex={1} fillWidth background="surface" border radius="l" padding="32" gap="20">
        <Row width="48" height="48" center radius="m" background="brand-alpha-weak" aria-hidden="true">
          <Icon name={feature.icon} size="m" onBackground="brand-strong" />
        </Row>
        <Column as="ul" gap="12">
          {feature.points.map((point) => (
            <Row as="li" key={point} gap="12" vertical="start">
              <Row paddingTop="2">
                <Icon name="check" size="xs" onBackground="brand-medium" />
              </Row>
              <Text textVariant="body-default-m">{point}</Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Row>
  );
}
```

```tsx app/page.tsx
import { Background, Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { FeatureSection } from "../components/FeatureSection";
import { SiteShell } from "../components/SiteShell";
import { brand, features, logos } from "../lib/data";

export default function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Column
        as="section"
        aria-labelledby="hero-title"
        fillWidth
        horizontal="center"
        paddingX="16"
        paddingY="104"
      >
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            colorStart: "brand-alpha-medium",
            colorEnd: "static-transparent",
            x: "50%",
            y: 0,
            width: "150%",
            height: "80%",
            opacity: 50,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />
        <Column zIndex={1} horizontal="center" gap="24" maxWidth="48rem">
          <Text textVariant="label-default-s" onBackground="brand-medium">
            Analytics + issues for small teams
          </Text>
          <Heading as="h1" id="hero-title" textVariant="display-strong-l" align="center">
            {brand.tagline}
          </Heading>
          <Text as="p" textVariant="body-default-l" onBackground="neutral-weak" align="center">
            Lumen puts what your users do and what your team owes them in one calm place, so the
            whole team sees the same picture every week.
          </Text>
          <Row gap="12" horizontal="center" wrap marginTop="8">
            <Button href="/pricing" size="l" arrowIcon data-border="rounded">
              Start for free
            </Button>
            <Button href="/#features" size="l" variant="secondary" data-border="rounded">
              See how it works
            </Button>
          </Row>
        </Column>
      </Column>

      {/* Customer logos, as text */}
      <Column
        as="section"
        id="customers"
        aria-labelledby="customers-title"
        fillWidth
        horizontal="center"
        paddingX="16"
        paddingBottom="104"
      >
        <Column maxWidth="l" gap="24" horizontal="center">
          <Text
            as="h2"
            id="customers-title"
            textVariant="label-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Trusted by small teams at
          </Text>
          <Grid as="ul" columns="5" m={{ columns: 3 }} s={{ columns: 2 }} gap="16" fillWidth>
            {logos.map((name) => (
              <Row
                as="li"
                key={name}
                center
                paddingY="16"
                paddingX="12"
                border
                radius="m"
                background="surface"
              >
                <Text
                  family="heading"
                  textVariant="heading-strong-s"
                  onBackground="neutral-medium"
                  align="center"
                >
                  {name}
                </Text>
              </Row>
            ))}
          </Grid>
        </Column>
      </Column>

      {/* Three feature sections */}
      <Column
        id="features"
        fillWidth
        horizontal="center"
        paddingX="16"
        paddingBottom="104"
        style={{ scrollMarginTop: "5rem" }}
      >
        <Column maxWidth="l" gap="104">
          <Column gap="16" maxWidth="40rem">
            <Text textVariant="label-default-s" onBackground="brand-medium">
              Why Lumen
            </Text>
            <Heading as="h2" textVariant="display-strong-s">
              Less to set up, more to read
            </Heading>
          </Column>
          {features.map((feature, index) => (
            <FeatureSection key={feature.id} feature={feature} reverse={index % 2 === 1} />
          ))}
        </Column>
      </Column>

      {/* Closing call to action */}
      <Column fillWidth horizontal="center" paddingX="16" paddingBottom="104">
        <Column
          maxWidth="l"
          center
          gap="24"
          padding="64"
          background="surface"
          border="brand-alpha-medium"
          radius="l"
          s={{ padding: "32" }}
        >
          <Heading as="h2" textVariant="display-strong-xs" align="center">
            Give your team one place to look
          </Heading>
          <Text as="p" textVariant="body-default-m" onBackground="neutral-weak" align="center">
            Free for one seat, $12 per seat for teams. Cancel whenever you like.
          </Text>
          <Button href="/pricing" arrowIcon data-border="rounded">
            See pricing
          </Button>
        </Column>
      </Column>
    </SiteShell>
  );
}
```

```tsx components/PricingView.tsx
"use client";

import {
  AccordionGroup,
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";
import { comparison, faq, formatPrice, monthlyPrice, plans, yearlyTotal } from "../lib/data";

type Billing = "monthly" | "yearly";

const columns = [
  { key: "feature", header: "Feature" },
  { key: "free", header: "Free" },
  { key: "team", header: "Team" },
  { key: "business", header: "Business" },
];

export function PricingView() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const yearly = billing === "yearly";

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingTop="80" paddingBottom="104" gap="104">
      {/* Intro + plans */}
      <Column maxWidth="l" gap="40">
        <Column gap="16" horizontal="center" maxWidth="40rem" marginX="auto">
          <Text textVariant="label-default-s" onBackground="brand-medium">
            Pricing
          </Text>
          <Heading as="h1" textVariant="display-strong-l" align="center">
            Simple plans for small teams
          </Heading>
          <Text as="p" textVariant="body-default-l" onBackground="neutral-weak" align="center">
            Start free. Pay yearly and get two months free.
          </Text>
        </Column>

        <Column gap="8" horizontal="center" maxWidth="20rem" marginX="auto">
          <SegmentedControl
            aria-label="Billing period"
            value={billing}
            onValueChange={(value) => setBilling(value as Billing)}
            buttons={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <Text
            as="p"
            textVariant="label-default-s"
            onBackground={yearly ? "brand-medium" : "neutral-weak"}
            aria-live="polite"
            align="center"
          >
            {yearly ? "Two months free, billed yearly" : "Switch to yearly for two months free"}
          </Text>
        </Column>

        <Grid as="ul" columns="3" m={{ columns: 1 }} gap="24">
          {plans.map((plan) => {
            const price = monthlyPrice(plan, yearly);
            const free = plan.priceMonth === 0;
            return (
              <Column
                as="li"
                key={plan.name}
                background="surface"
                border={plan.highlight ? "brand-alpha-medium" : true}
                radius="l"
                padding="32"
                overflow="hidden"
              >
                {plan.highlight && (
                  <Background
                    position="absolute"
                    top="0"
                    left="0"
                    fill
                    pointerEvents="none"
                    gradient={{
                      display: true,
                      colorStart: "brand-alpha-medium",
                      colorEnd: "static-transparent",
                      x: "50%",
                      y: 0,
                      width: "200%",
                      height: "60%",
                      opacity: 50,
                    }}
                  />
                )}
                <Column zIndex={1} fill gap="24">
                  <Row horizontal="between" vertical="center" gap="8">
                    <Heading as="h2" textVariant="heading-strong-l">
                      {plan.name}
                    </Heading>
                    {plan.highlight && <Tag tone="brand" size="s" label="Most popular" />}
                  </Row>
                  <Text as="p" textVariant="body-default-s" onBackground="neutral-weak">
                    {plan.blurb}
                  </Text>
                  <Column gap="4">
                    <Row gap="8" style={{ alignItems: "baseline" }}>
                      <Text textVariant="display-strong-s">${formatPrice(price)}</Text>
                      <Text textVariant="label-default-s" onBackground="neutral-weak">
                        {free ? "forever" : `/ month, ${plan.seats}`}
                      </Text>
                    </Row>
                    <Text
                      as="p"
                      textVariant="body-default-xs"
                      onBackground="neutral-weak"
                      aria-live="polite"
                    >
                      {free
                        ? plan.seats
                        : yearly
                          ? `$${yearlyTotal(plan)} per seat, billed yearly`
                          : "Billed monthly"}
                    </Text>
                  </Column>
                  <Column as="ul" flex={1} gap="12">
                    {plan.features.map((feature) => (
                      <Row as="li" key={feature} gap="12" vertical="center">
                        <Icon name="check" size="xs" onBackground="brand-medium" />
                        <Text textVariant="body-default-s">{feature}</Text>
                      </Row>
                    ))}
                  </Column>
                  <Button
                    fillWidth
                    href="/pricing"
                    variant={plan.highlight ? "primary" : "secondary"}
                    data-border="rounded"
                  >
                    {plan.cta}
                  </Button>
                </Column>
              </Column>
            );
          })}
        </Grid>
      </Column>

      {/* Comparison table */}
      <Column maxWidth="l" gap="32">
        <Heading as="h2" id="compare-title" textVariant="display-strong-xs">
          Compare plans, feature by feature
        </Heading>
        <Table
          fillWidth
          aria-labelledby="compare-title"
          columns={columns}
          rows={[...comparison]}
          getRowId={(row) => row.feature}
        />
      </Column>

      {/* FAQ */}
      <Column maxWidth="m" gap="32">
        <Heading as="h2" textVariant="display-strong-xs">
          Questions, answered
        </Heading>
        <AccordionGroup
          items={faq.map((item) => ({
            title: item.q,
            content: (
              <Text as="p" textVariant="body-default-m" onBackground="neutral-weak">
                {item.a}
              </Text>
            ),
          }))}
        />
      </Column>
    </Column>
  );
}
```

```tsx app/pricing/page.tsx
import type { Metadata } from "next";
import { PricingView } from "../../components/PricingView";
import { SiteShell } from "../../components/SiteShell";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Lumen plans: Free, Team and Business. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingView />
    </SiteShell>
  );
}
```