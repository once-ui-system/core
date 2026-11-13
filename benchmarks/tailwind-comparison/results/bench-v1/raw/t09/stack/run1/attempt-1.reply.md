The config is plain JS, so its values are inferred as `string`. Typing it with `defineConfig` fixes both layout errors, since it keeps literal types and lets me pass `config={style}` and `dataStyle={dataStyle}`. For the Grid, I'll drop `vertical` and put the two columns in a Row-style layout.

```ts src/lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams. Clear dashboards, a tracker that stays out of the way, and data kept in the EU.",
};

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Product", href: "/#product" },
  { label: "Customers", href: "/#customers" },
  { label: "Pricing", href: "/pricing" },
];

export const logos = ["Acme Labs", "Northwind Studio", "Hooli", "Globex", "Initech"];

export type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: IconName;
  points: string[];
};

export const features: Feature[] = [
  {
    id: "analytics",
    eyebrow: "Analytics",
    title: "Dashboards your whole team will open on Monday",
    description:
      "Lumen turns raw events into a handful of charts that answer real questions: who signed up, what they used and where they got stuck. No query language, no twenty-tab report.",
    icon: "barChart",
    points: [
      "Weekly digest written in plain language",
      "Funnels and retention without a data analyst",
      "Every chart links to the events behind it",
    ],
  },
  {
    id: "issues",
    eyebrow: "Issue tracking",
    title: "A tracker that sits next to the numbers",
    description:
      "File an issue straight from a chart. Lumen attaches the segment, the release and the session count so the person who fixes it never has to ask what you meant.",
    icon: "checkbox",
    points: [
      "One-click issues from any metric",
      "Triage board with owners and due dates",
      "Closes the loop when the metric recovers",
    ],
  },
  {
    id: "privacy",
    eyebrow: "Data you can trust",
    title: "Kept in the EU, encrypted, and yours to export",
    description:
      "Events are stored in EU data centres and encrypted at rest. Export everything as CSV at any time, and delete a project with one confirmation.",
    icon: "security",
    points: [
      "EU hosting, encrypted at rest",
      "Full CSV and JSON export",
      "SSO and audit log on Business",
    ],
  },
];

export type Billing = "monthly" | "yearly";

export type Plan = {
  name: string;
  priceMonth: number;
  seats: string;
  description: string;
  cta: string;
  features: string[];
  highlight?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1",
    description: "For a solo developer trying Lumen on a side project.",
    cta: "Start for free",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    description: "For small teams that ship every week.",
    cta: "Start a Team trial",
    features: ["Unlimited projects", "1-year history", "Issue tracker", "Email support"],
    highlight: true,
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    description: "For companies that need single sign-on and an audit trail.",
    cta: "Talk to us",
    features: ["Everything in Team", "SSO and audit log", "Unlimited history", "Priority support"],
  },
];

/** Yearly billing is two months free: pay for ten months, spread over twelve. */
export const YEARLY_MONTHS_PAID = 10;

export function monthlyEquivalent(priceMonth: number, billing: Billing): number {
  if (billing === "monthly") return priceMonth;
  return Math.round(((priceMonth * YEARLY_MONTHS_PAID) / 12) * 100) / 100;
}

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_PAID;
}

export const comparisonHeaders = ["Feature", "Free", "Team", "Business"];

export const comparisonRows: string[][] = [
  ["Seats", "1", "Per seat", "Per seat"],
  ["Projects", "1", "Unlimited", "Unlimited"],
  ["History", "7 days", "1 year", "Unlimited"],
  ["Issue tracker", "—", "Included", "Included"],
  ["SSO and audit log", "—", "—", "Included"],
  ["Support", "Community", "Email", "Priority"],
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

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Analytics", href: "/#product" },
      { label: "Issue tracking", href: "/#product" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Customers", href: "/#customers" },
      { label: "Contact", href: "mailto:hello@lumen.example" },
    ],
  },
];
```

```js src/resources/once-ui.config.js
import { defineConfig } from "@once-ui-system/core/config";
import { landing } from "./seo";

// The site's public origin, used for SEO tags and schema.
const baseURL = "https://lumen.example";

// Fonts are system fonts, so nothing is loaded. The family stacks live in
// custom.css as the --font-* variables the design system reads.
const fonts = {};

// The app's languages, as BCP 47 tags ("en", "hu", "de-AT"). The first is the
// default: it sets <html lang>, how prices are formatted and which entry of
// each labels file (src/content/<surface>/labels.ts) the UI shows.
const i18n = {
  locales: ["en"],
};

// Lumen brand ramp, built around #E8590C at step 600 (the solid colour that
// primary buttons, links and focus rings use), one ramp per theme.
const brandScale = {
  light: {
    100: "#fff4ec",
    200: "#ffe6d4",
    300: "#ffcfab",
    400: "#ffb078",
    500: "#f78a45",
    600: "#E8590C",
    700: "#c24a08",
    800: "#9b3b08",
    900: "#7a3009",
    1000: "#5a2408",
    1100: "#3d1807",
    1200: "#260f05",
    "600-15": "rgba(232, 89, 12, 0.15)",
    "600-30": "rgba(232, 89, 12, 0.3)",
    "600-50": "rgba(232, 89, 12, 0.5)",
  },
  dark: {
    100: "#260f05",
    200: "#3d1807",
    300: "#5a2408",
    400: "#7a3009",
    500: "#a63f08",
    600: "#E8590C",
    700: "#f27a38",
    800: "#f99a63",
    900: "#fdb88d",
    1000: "#ffd2b3",
    1100: "#ffe6d4",
    1200: "#fff4ec",
    "600-15": "rgba(232, 89, 12, 0.15)",
    "600-30": "rgba(232, 89, 12, 0.3)",
    "600-50": "rgba(232, 89, 12, 0.5)",
  },
};

// Warm stone grey: a neutral with a slight red-yellow cast, so surfaces and
// borders sit comfortably next to the orange brand colour.
const neutralScale = {
  light: {
    100: "#fafaf9",
    200: "#f5f5f4",
    300: "#e7e5e4",
    400: "#d6d3d1",
    500: "#a8a29e",
    600: "#78716c",
    700: "#57534e",
    800: "#44403c",
    900: "#292524",
    1000: "#1c1917",
    1100: "#0f0d0c",
    1200: "#0a0908",
    "600-15": "rgba(120, 113, 108, 0.15)",
    "600-30": "rgba(120, 113, 108, 0.3)",
    "600-50": "rgba(120, 113, 108, 0.5)",
  },
  dark: {
    100: "#0c0a09",
    200: "#1c1917",
    300: "#292524",
    400: "#44403c",
    500: "#57534e",
    600: "#78716c",
    700: "#a8a29e",
    800: "#d6d3d1",
    900: "#e7e5e4",
    1000: "#f5f5f4",
    1100: "#fafaf9",
    1200: "#fdfdfc",
    "600-15": "rgba(120, 113, 108, 0.15)",
    "600-30": "rgba(120, 113, 108, 0.3)",
    "600-50": "rgba(120, 113, 108, 0.5)",
  },
};

// `theme` stays "system" so the header toggle can switch the whole site
// ("dark" or "light" would lock it); `defaultTheme` is what a first visit sees.
const { style, dataStyle } = defineConfig({
  style: {
    theme: "system",
    defaultTheme: "dark",
    neutral: "custom",
    brand: "custom",
    accent: "custom",
    brandScale,
    accentScale: brandScale,
    neutralScale,
    solid: "color",
    solidStyle: "flat",
    border: "conservative",
    surface: "filled",
    transition: "all",
    scaling: "100",
  },
  dataStyle: {
    variant: "gradient",
    mode: "categorical",
    height: 24,
    axis: {
      stroke: "var(--neutral-alpha-weak)",
    },
    tick: {
      fill: "var(--neutral-on-background-weak)",
      fontSize: 11,
      line: false,
    },
  },
});

// default schema data
const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "hello@lumen.example",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [
  {
    name: "Email",
    icon: "email",
    link: `mailto:${schema.email}`,
  },
];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
```

```js src/resources/seo.js
const origin = "https://lumen.example";

const base = {
  image: "/images/og/home.jpg",
  alternates: [{ href: origin, hrefLang: "en" }],
};

const landing = {
  home: {
    ...base,
    path: "/",
    title: "Lumen: product analytics and issue tracking for small teams",
    description:
      "Product analytics and issue tracking that small teams actually read. Dashboards, a built-in tracker and EU-hosted data.",
    robots: "index,follow",
    canonical: origin,
  },
  pricing: {
    ...base,
    path: "/pricing",
    title: "Pricing - Lumen",
    description:
      "Simple pricing for Lumen. Start free, move to Team at $12 per seat, and get two months free on yearly billing.",
    robots: "index,follow",
    canonical: `${origin}/pricing`,
  },
};

const product = {
  dashboard: {
    ...base,
    path: "/app",
    title: "Dashboard - Lumen",
    description: "Your Lumen dashboard.",
    robots: "noindex,nofollow",
    canonical: `${origin}/app`,
  },
  analytics: {
    ...base,
    path: "/app/analytics",
    title: "Analytics - Lumen",
    description: "Analytics in Lumen.",
    robots: "noindex,nofollow",
    canonical: `${origin}/app/analytics`,
  },
  users: {
    ...base,
    path: "/app/users",
    title: "Users - Lumen",
    description: "Users in Lumen.",
    robots: "noindex,nofollow",
    canonical: `${origin}/app/users`,
  },
  settings: {
    ...base,
    path: "/app/settings",
    title: "Settings - Lumen",
    description: "Settings in Lumen.",
    robots: "noindex,nofollow",
    canonical: `${origin}/app/settings`,
  },
};

const auth = {
  auth: {
    ...base,
    path: "/auth",
    title: "Log in - Lumen",
    description: "Sign up or log in to your Lumen account.",
    robots: "index,follow",
    canonical: `${origin}/auth`,
  },
};

const sameAs = {};

export { landing, product, auth, sameAs };
```

```css src/resources/custom.css
:root {
  --default-border: var(--neutral-alpha-weak);

  /* Fonts: system stacks, so nothing is downloaded. The design system reads
     these four variables for heading, body, label and code text. */
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* Brand corner radius: 4px on buttons, inputs, cards and menus.
   The design system draws every corner from these radius tokens, so setting
   them on the root (and on each border style, which would otherwise redefine
   them) applies the radius to all components at once. */
:root,
[data-border="rounded"],
[data-border="playful"],
[data-border="conservative"],
[data-border="sharp"] {
  --radius-xs: 2px;
  --radius-s: 4px;
  --radius-m: 4px;
  --radius-l: 4px;
  --radius-xl: 4px;
  --radius-full: 4px;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-heading);
}

/* Visible focus ring in the brand colour. */
:focus-visible {
  outline: 2px solid var(--brand-solid-strong);
  outline-offset: 2px;
}
```

```tsx src/components/Providers.tsx
"use client";

import {
  DataThemeProvider,
  IconProvider,
  ThemeProvider,
  ToastProvider,
} from "@once-ui-system/core";
// The Next adapters: links go through next/link and images through next/image.
import { LayoutProvider } from "@once-ui-system/core/next";
import { iconLibrary } from "../resources/icons";
import { dataStyle, style } from "../resources/once-ui.config";
import { OrgProvider } from "./OrgProvider";
import { UserProvider } from "./UserProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider {...style}>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider>
            <IconProvider icons={iconLibrary}>
              <UserProvider>
                <OrgProvider>{children}</OrgProvider>
              </UserProvider>
            </IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
```

```tsx src/app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import { LocaleProvider, Providers } from "@/components";
import { getLocale } from "@/lib/i18n/server";
import { baseURL, dataStyle, landing, style } from "@/resources";
import { Column, Flex, Meta, Schema, ThemeInit } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    image: landing.home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      as="html"
      lang={locale}
      fillWidth
    >
      <head>
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        {/* Paints data-theme, the brand and neutral scales and the border
            style before first paint, so the dark default never flashes. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              {children}
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```tsx src/components/site/SiteHeader.tsx
"use client";

import { brand, navLinks } from "@/lib/data";
import {
  Button,
  Column,
  Drawer,
  IconButton,
  Row,
  SmartLink,
  Text,
  ThemeSwitcher,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  // The drawer is open for the path it was opened on, so following a link in
  // it closes it along with the navigation.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <Row
      as="header"
      fillWidth
      horizontal="center"
      position="sticky"
      top="0"
      background="page"
      borderBottom
      zIndex={2}
    >
      <Row maxWidth="l" height="64" vertical="center" horizontal="between" paddingX="24" gap="16">
        <Row vertical="center" gap="32">
          <SmartLink href="/" aria-label={`${brand.name} home`}>
            <Text variant="heading-strong-l" onBackground="neutral-strong">
              {brand.name}
            </Text>
          </SmartLink>
          <Row as="nav" aria-label="Main" gap="24" vertical="center" s={{ hide: true }}>
            {navLinks.map((link) => (
              <SmartLink key={link.href} href={link.href} selected={link.href === pathname}>
                <Text variant="label-default-m">{link.label}</Text>
              </SmartLink>
            ))}
          </Row>
        </Row>

        <Row vertical="center" gap="12">
          <ThemeSwitcher collapsed direction="column" />
          <Row s={{ hide: true }}>
            <Button href="/pricing" size="s" label="Start free" />
          </Row>
          <Row hide s={{ hide: false }}>
            <IconButton
              icon="menu"
              variant="tertiary"
              tooltip="Menu"
              ariaLabel="Open menu"
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
        <Column as="nav" aria-label="Mobile" gap="16" paddingTop="24">
          {navLinks.map((link) => (
            <SmartLink key={link.href} href={link.href}>
              <Text variant="heading-strong-m">{link.label}</Text>
            </SmartLink>
          ))}
          <Button href="/pricing" fillWidth label="Start free" />
        </Column>
      </Drawer>
    </Row>
  );
}
```

```tsx src/components/site/SiteFooter.tsx
import { brand, footerColumns } from "@/lib/data";
import { Column, Grid, Line, Row, SmartLink, Text } from "@once-ui-system/core";

export function SiteFooter() {
  return (
    <Column as="footer" fillWidth horizontal="center" paddingX="24" paddingY="64" borderTop>
      <Column maxWidth="l" gap="48">
        <Grid columns="3" gap="32" s={{ columns: 1 }}>
          <Column gap="12">
            <Text variant="heading-strong-l" onBackground="neutral-strong">
              {brand.name}
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Product analytics and issue tracking for small software teams.
            </Text>
          </Column>
          {footerColumns.map((column) => (
            <Column as="nav" key={column.title} gap="12" aria-label={column.title}>
              <Text variant="label-strong-s" onBackground="neutral-strong">
                {column.title}
              </Text>
              {column.links.map((link) => (
                <SmartLink key={link.label} href={link.href}>
                  <Text variant="body-default-s">{link.label}</Text>
                </SmartLink>
              ))}
            </Column>
          ))}
        </Grid>
        <Line />
        <Row horizontal="between" gap="16" wrap>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </Text>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Data stored in the EU, encrypted at rest.
          </Text>
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx src/components/site/SiteShell.tsx
import { Column, VisuallyHidden } from "@once-ui-system/core";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Header and footer shared by every marketing page. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Column fillWidth flex={1}>
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

```tsx src/app/page.tsx
import { SiteShell } from "@/components/site/SiteShell";
import { brand, features, logos } from "@/lib/data";
import { baseURL, landing } from "@/resources";
import {
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Meta,
  Row,
  Text,
} from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL,
    path: landing.home.path,
    image: landing.home.image,
  });
}

export default function Page() {
  return (
    <SiteShell>
      <Column fillWidth horizontal="center" gap="104" paddingBottom="104">
        {/* Hero */}
        <Column fillWidth horizontal="center" paddingX="24" paddingY="80">
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
              x: 50,
              y: 0,
              width: 150,
              height: 80,
              opacity: 60,
            }}
            dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
          />
          <Column zIndex={1} horizontal="center" gap="24" maxWidth={48}>
            <Text variant="label-default-s" onBackground="brand-medium">
              Analytics and issues, in one place
            </Text>
            <Heading as="h1" variant="display-strong-l" align="center">
              {brand.tagline}
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" align="center">
              Lumen shows a small team what changed, why it matters and who is on it, without a
              data analyst or a twenty-tab report.
            </Text>
            <Row gap="12" horizontal="center" s={{ direction: "column", horizontal: "stretch" }}>
              <Button href="/pricing" arrowIcon label="Start for free" />
              <Button href="/pricing" variant="secondary" label="See pricing" />
            </Row>
          </Column>
        </Column>

        {/* Customers: logos set as text */}
        <Column
          as="section"
          id="customers"
          aria-labelledby="customers-title"
          fillWidth
          horizontal="center"
          paddingX="24"
          gap="24"
        >
          <Text
            id="customers-title"
            variant="label-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Trusted by small teams at
          </Text>
          <Row
            as="ul"
            maxWidth="l"
            horizontal="center"
            gap="32"
            wrap
            margin="0"
            padding="0"
            style={{ listStyle: "none" }}
          >
            {logos.map((name) => (
              <Text as="li" key={name} variant="heading-strong-l" onBackground="neutral-weak">
                {name}
              </Text>
            ))}
          </Row>
        </Column>

        {/* Three feature sections */}
        <Column id="product" fillWidth horizontal="center" paddingX="24" gap="104">
          {features.map((feature, index) => {
            const text = (
              <Column key="text" gap="24" vertical="center">
                <Text variant="label-default-s" onBackground="brand-medium">
                  {feature.eyebrow}
                </Text>
                <Heading as="h2" variant="display-strong-xs">
                  {feature.title}
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {feature.description}
                </Text>
              </Column>
            );
            const panel = (
              <Column key="panel" background="surface" border radius="l" padding="32" gap="24">
                <Row
                  center
                  width="48"
                  height="48"
                  radius="m"
                  background="brand-alpha-weak"
                  border="brand-alpha-medium"
                >
                  <Icon name={feature.icon} size="m" onBackground="brand-medium" />
                </Row>
                <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                  {feature.points.map((point) => (
                    <Row as="li" key={point} gap="12" vertical="center">
                      <Icon name="check" size="xs" onBackground="brand-medium" />
                      <Text variant="body-default-m">{point}</Text>
                    </Row>
                  ))}
                </Column>
              </Column>
            );
            return (
              <Column as="section" key={feature.id} maxWidth="l" aria-label={feature.eyebrow}>
                <Grid columns="2" gap="40" s={{ columns: 1 }}>
                  {index % 2 === 0 ? [text, panel] : [panel, text]}
                </Grid>
              </Column>
            );
          })}
        </Column>
      </Column>
    </SiteShell>
  );
}
```

```tsx src/components/pricing/PricingContent.tsx
"use client";

import {
  type Billing,
  comparisonHeaders,
  comparisonRows,
  faq,
  monthlyEquivalent,
  plans,
  yearlyTotal,
} from "@/lib/data";
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

const formatPrice = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

export function PricingContent() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <Column fillWidth horizontal="center" gap="104" paddingBottom="104">
      {/* Intro and plans */}
      <Column fillWidth horizontal="center" paddingX="24" paddingTop="80">
        <Column maxWidth="l" gap="40">
          <Column gap="16" maxWidth={40}>
            <Text variant="label-default-s" onBackground="brand-medium">
              Pricing
            </Text>
            <Heading as="h1" variant="display-strong-l">
              Start free. Pay when your team grows.
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              Every plan includes the dashboards. Choose yearly billing and get two months free.
            </Text>
          </Column>

          <Row horizontal="start">
            <SegmentedControl
              aria-label="Billing period"
              value={billing}
              onChange={(value) => setBilling(value as Billing)}
              buttons={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly, 2 months free" },
              ]}
            />
          </Row>

          <Grid columns="3" gap="24" m={{ columns: 1 }} s={{ columns: 1 }}>
            {plans.map((plan) => {
              const perMonth = monthlyEquivalent(plan.priceMonth, billing);
              const isFree = plan.priceMonth === 0;
              return (
                <Column
                  key={plan.name}
                  as="section"
                  aria-label={`${plan.name} plan`}
                  background="surface"
                  border={plan.highlight ? "brand-alpha-strong" : true}
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
                        x: 50,
                        y: 0,
                        width: 200,
                        height: 60,
                        opacity: 50,
                      }}
                    />
                  )}
                  <Column zIndex={1} fill gap="24">
                    <Row fillWidth horizontal="between" vertical="center">
                      <Heading as="h2" variant="heading-strong-l">
                        {plan.name}
                      </Heading>
                      {plan.highlight && <Tag scheme="brand" size="s" label="Most popular" />}
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {plan.description}
                    </Text>
                    <Column gap="4">
                      <Row gap="4" style={{ alignItems: "baseline" }}>
                        <Text variant="display-strong-s">${formatPrice(perMonth)}</Text>
                        <Text variant="label-default-s" onBackground="neutral-weak">
                          {isFree ? "forever" : "/ seat / month"}
                        </Text>
                      </Row>
                      <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
                        {isFree
                          ? "1 seat"
                          : billing === "yearly"
                            ? `Billed $${yearlyTotal(plan.priceMonth)} per seat each year`
                            : "Billed monthly"}
                      </Text>
                    </Column>
                    <Column
                      as="ul"
                      flex={1}
                      gap="12"
                      margin="0"
                      padding="0"
                      style={{ listStyle: "none" }}
                    >
                      {plan.features.map((feature) => (
                        <Row as="li" key={feature} gap="12" vertical="center">
                          <Icon name="check" size="xs" onBackground="brand-medium" />
                          <Text variant="body-default-s">{feature}</Text>
                        </Row>
                      ))}
                    </Column>
                    <Button
                      fillWidth
                      href="/pricing"
                      variant={plan.highlight ? "primary" : "secondary"}
                      label={plan.cta}
                    />
                  </Column>
                </Column>
              );
            })}
          </Grid>
        </Column>
      </Column>

      {/* Feature comparison */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="l" gap="32">
          <Heading as="h2" variant="display-strong-xs">
            Compare the plans
          </Heading>
          <Table
            fillWidth
            data={{
              headers: comparisonHeaders.map((header) => ({
                content: header,
                key: header.toLowerCase(),
              })),
              rows: comparisonRows,
            }}
          />
        </Column>
      </Column>

      {/* FAQ */}
      <Column fillWidth horizontal="center" paddingX="24">
        <Column maxWidth="m" gap="32">
          <Heading as="h2" variant="display-strong-xs">
            Questions, answered
          </Heading>
          <AccordionGroup
            fillWidth
            items={faq.map((item) => ({
              title: item.q,
              content: (
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {item.a}
                </Text>
              ),
            }))}
          />
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx src/app/pricing/page.tsx
import { PricingContent } from "@/components/pricing/PricingContent";
import { SiteShell } from "@/components/site/SiteShell";
import { baseURL, landing } from "@/resources";
import { Meta } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.pricing.title,
    description: landing.pricing.description,
    baseURL,
    path: landing.pricing.path,
    image: landing.pricing.image,
  });
}

export default function Page() {
  return (
    <SiteShell>
      <PricingContent />
    </SiteShell>
  );
}
```

```tsx src/app/not-found.tsx
import { Background, Button, Column, Heading, Row, Text } from "@once-ui-system/core";

export default function NotFound() {
  return (
    <Column as="section" fill center padding="24">
      <Column maxWidth="m" radius="xl" padding="xl" overflow="hidden">
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
            x: 50,
            y: 0,
            width: 200,
            height: 80,
            opacity: 60,
          }}
        />
        <Column zIndex={1} gap="8">
          <Text variant="display-strong-xl">404</Text>
          <Heading as="h1" variant="display-default-xs">
            Page not found
          </Heading>
          <Text onBackground="neutral-weak" marginBottom="24">
            The page you are looking for does not exist.
          </Text>
          <Row>
            <Button href="/" label="Back to home" />
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
```