Now I'll write everything.

```ts app/theme.ts
import {
  Accordion,
  Anchor,
  Button,
  Card,
  Container,
  Input,
  Menu,
  Paper,
  Switch,
  Table,
  Title,
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

/**
 * Lumen brand: #E8590C sits at shade 6 of the `lumen` tuple and is used as the
 * primary colour for filled buttons, links and focus rings.
 */
const lumen: MantineColorsTuple = [
  "#fff4ec",
  "#ffe6d4",
  "#fdcaa6",
  "#fbab74",
  "#f98f49",
  "#ee7424",
  "#E8590C",
  "#c94a08",
  "#a63d06",
  "#7f2e04",
];

/**
 * Warm stone grey. Mantine's `dark` tuple drives the dark theme surfaces
 * (index 7 = body background, 6 = cards, 4 = borders, 0 = text), and `gray`
 * drives the light theme surfaces. Both are replaced with stone values.
 */
const stoneDark: MantineColorsTuple = [
  "#e7e5e4", // 0 text
  "#d6d3d1", // 1
  "#a8a29e", // 2 dimmed text
  "#78716c", // 3
  "#57534e", // 4 borders / default button borders
  "#44403c", // 5 hover surfaces
  "#292524", // 6 cards / inputs
  "#1c1917", // 7 body
  "#151211", // 8
  "#0c0a09", // 9
];

const stoneGray: MantineColorsTuple = [
  "#fafaf9",
  "#f5f5f4",
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#78716c",
  "#57534e",
  "#44403c",
  "#292524",
  "#1c1917",
];

const BRAND_FONT_BODY = 'ui-sans-serif, system-ui, sans-serif';
const BRAND_FONT_HEADING = 'Georgia, "Times New Roman", serif';

export const theme = createTheme({
  primaryColor: "lumen",
  primaryShade: { light: 6, dark: 6 },
  colors: {
    lumen,
    dark: stoneDark,
    gray: stoneGray,
  },
  // White on #E8590C is ~3.9:1; dark stone text on the brand colour is ~5:1.
  autoContrast: true,
  luminanceThreshold: 0.4,
  white: "#fafaf9",
  black: "#1c1917",

  fontFamily: BRAND_FONT_BODY,
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  headings: {
    fontFamily: BRAND_FONT_HEADING,
    fontWeight: "700",
    textWrap: "balance",
    sizes: {
      h1: { fontSize: "clamp(2.25rem, 5vw + 1rem, 3.75rem)", lineHeight: "1.1" },
      h2: { fontSize: "clamp(1.75rem, 3vw + 1rem, 2.5rem)", lineHeight: "1.2" },
      h3: { fontSize: "1.5rem", lineHeight: "1.3" },
      h4: { fontSize: "1.25rem", lineHeight: "1.35" },
      h5: { fontSize: "1.125rem", lineHeight: "1.4" },
      h6: { fontSize: "1rem", lineHeight: "1.4" },
    },
  },

  // 4px corner radius everywhere.
  defaultRadius: 4,
  radius: {
    xs: "2px",
    sm: "4px",
    md: "4px",
    lg: "4px",
    xl: "4px",
  },

  focusRing: "auto",
  cursorType: "pointer",

  components: {
    Button: Button.extend({
      defaultProps: { radius: 4 },
    }),
    Input: Input.extend({
      defaultProps: { radius: 4 },
    }),
    Card: Card.extend({
      defaultProps: { radius: 4, withBorder: true, padding: "lg" },
    }),
    Paper: Paper.extend({
      defaultProps: { radius: 4 },
    }),
    Menu: Menu.extend({
      defaultProps: { radius: 4 },
    }),
    Accordion: Accordion.extend({
      defaultProps: { radius: 4 },
    }),
    Switch: Switch.extend({
      defaultProps: { radius: 4 },
    }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: "sm" },
    }),
    Anchor: Anchor.extend({
      defaultProps: { underline: "hover" },
    }),
    Title: Title.extend({
      defaultProps: { c: "var(--mantine-color-text)" },
    }),
    Container: Container.extend({
      defaultProps: { size: "lg" },
    }),
  },
});

/**
 * Link colour needs more luminance on the dark surface to keep AA contrast,
 * so links use the lighter brand shade in dark mode and the deeper one in light.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-anchor": "#c94a08",
    "--mantine-color-body": "#fafaf9",
  },
  dark: {
    "--mantine-color-anchor": "#fb8c4a",
    "--mantine-color-body": "#1c1917",
  },
});
```

```tsx app/layout.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { SiteShell } from "@/components/SiteShell";
import { cssVariablesResolver, theme } from "./theme";

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
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider
          theme={theme}
          cssVariablesResolver={cssVariablesResolver}
          defaultColorScheme="dark"
        >
          <ModalsProvider>
            <Notifications />
            <SiteShell>{children}</SiteShell>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```ts lib/data.ts
export interface Plan {
  name: string;
  priceMonth: number;
  seats: string;
  features: string[];
  highlight?: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams. See what people do in your product, and turn what you learn into issues, in one place.",
} as const;

export const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Customers", href: "/#customers" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const logos = ["Acme Labs", "Northwind Studio", "Hooli", "Globex", "Initech"];

export interface Feature {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}

export const features: Feature[] = [
  {
    id: "analytics",
    eyebrow: "Product analytics",
    title: "Dashboards your whole team will open on Monday",
    body: "Lumen turns raw events into a short weekly summary: who signed up, what they used and where they got stuck. No query language and no analyst required.",
    points: [
      "Funnels, retention and feature adoption out of the box",
      "A weekly digest written in plain sentences, not charts alone",
      "Event history from 7 days to unlimited, depending on plan",
    ],
  },
  {
    id: "issues",
    eyebrow: "Issue tracking",
    title: "Turn a drop-off into a ticket in two clicks",
    body: "Spot a problem in a funnel and file it without leaving the page. The issue keeps a link to the data that raised it, so nobody has to ask for context later.",
    points: [
      "Issues carry the chart and the segment that prompted them",
      "Lightweight boards with the statuses small teams actually use",
      "Close the loop: see the metric move after the fix ships",
    ],
  },
  {
    id: "privacy",
    eyebrow: "Privacy and control",
    title: "Your data stays in the EU, encrypted at rest",
    body: "Lumen stores everything in EU data centres and encrypts it at rest. Business teams get SSO and an audit log, so reviews with security take minutes.",
    points: [
      "EU hosting with encryption at rest",
      "SSO and audit log on the Business plan",
      "Export your data whenever you like",
    ],
  },
];

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    features: ["Unlimited projects", "1-year history", "Issue tracker", "Email support"],
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

/** Yearly billing is two months free: pay for 10 months, shown per month. */
export const YEARLY_MONTHS_PAID = 10;

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_PAID;
}

export function yearlyPerMonth(priceMonth: number): number {
  return yearlyTotal(priceMonth) / 12;
}

export type ComparisonValue = boolean | string;

export interface ComparisonRow {
  feature: string;
  free: ComparisonValue;
  team: ComparisonValue;
  business: ComparisonValue;
}

export const comparison: ComparisonRow[] = [
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  { feature: "Event history", free: "7 days", team: "1 year", business: "Unlimited" },
  { feature: "Product analytics dashboards", free: true, team: true, business: true },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "SSO", free: false, team: false, business: true },
  { feature: "Audit log", free: false, team: false, business: true },
  {
    feature: "Support",
    free: "Community",
    team: "Email",
    business: "Priority",
  },
];

export const faq: FaqItem[] = [
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
```

```tsx components/SiteShell.tsx
import { Box } from "@mantine/core";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import classes from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box className={classes.shell}>
      <a href="#main" className={classes.skip}>
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className={classes.main} tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </Box>
  );
}
```

```css components/SiteShell.module.css
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--mantine-color-body);
  color: var(--mantine-color-text);
}

.main {
  flex: 1;
  outline: none;
}

.skip {
  position: absolute;
  left: var(--mantine-spacing-md);
  top: -4rem;
  z-index: 1000;
  padding: var(--mantine-spacing-xs) var(--mantine-spacing-md);
  background-color: var(--mantine-color-body);
  color: var(--mantine-color-text);
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-default);

  &:focus {
    top: var(--mantine-spacing-md);
    outline: 2px solid var(--mantine-primary-color-filled);
    outline-offset: 2px;
  }
}
```

```tsx components/ThemeToggle.tsx
"use client";

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import classes from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("dark", { getInitialValueInEffect: true });

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
      onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
    >
      <IconSun className={classes.sun} size={18} stroke={1.75} aria-hidden="true" />
      <IconMoon className={classes.moon} size={18} stroke={1.75} aria-hidden="true" />
    </ActionIcon>
  );
}
```

```css components/ThemeToggle.module.css
/* Show the sun in dark mode (click to go light) and the moon in light mode. */
.sun {
  display: none;

  @mixin dark {
    display: block;
  }
}

.moon {
  display: block;

  @mixin dark {
    display: none;
  }
}
```

```tsx components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Burger, Button, Container, Drawer, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { brand, navLinks } from "@/lib/data";
import { ThemeToggle } from "./ThemeToggle";
import classes from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);

  const isCurrent = (href: string) => href === pathname;

  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <Anchor component={Link} href="/" className={classes.logo} underline="never" aria-label="Lumen home">
          {brand.name}
        </Anchor>

        <nav aria-label="Main" className={classes.desktopNav}>
          <Group gap="xs">
            {navLinks.map((link) => (
              <Anchor
                key={link.href}
                component={Link}
                href={link.href}
                className={classes.link}
                aria-current={isCurrent(link.href) ? "page" : undefined}
                data-active={isCurrent(link.href) || undefined}
                underline="never"
              >
                {link.label}
              </Anchor>
            ))}
          </Group>
        </nav>

        <Group gap="xs" className={classes.actions}>
          <Button component={Link} href="/pricing" size="sm" className={classes.cta}>
            Start free
          </Button>
          <ThemeToggle />
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
            aria-label={opened ? "Close navigation menu" : "Open navigation menu"}
          />
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title={brand.name}
        padding="md"
        hiddenFrom="sm"
        zIndex={300}
      >
        <nav aria-label="Mobile">
          <Stack gap="xs">
            {navLinks.map((link) => (
              <Anchor
                key={link.href}
                component={Link}
                href={link.href}
                onClick={close}
                className={classes.mobileLink}
                aria-current={isCurrent(link.href) ? "page" : undefined}
                underline="never"
              >
                {link.label}
              </Anchor>
            ))}
            <Button component={Link} href="/pricing" onClick={close} mt="sm">
              Start free
            </Button>
          </Stack>
        </nav>
      </Drawer>
    </header>
  );
}
```

```css components/SiteHeader.module.css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--mantine-color-body);
  border-bottom: 1px solid var(--mantine-color-default-border);
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mantine-spacing-md);
  height: 3.75rem;
}

.logo {
  font-family: var(--mantine-font-family-headings);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--mantine-color-text);
  border-radius: var(--mantine-radius-default);

  &::before {
    content: "";
    display: inline-block;
    width: 0.6rem;
    height: 0.6rem;
    margin-right: 0.5rem;
    background-color: var(--mantine-primary-color-filled);
    border-radius: 50%;
  }
}

.desktopNav {
  display: none;
  flex: 1;
  margin-left: var(--mantine-spacing-xl);

  @mixin larger-than $mantine-breakpoint-sm {
    display: block;
  }
}

.link {
  padding: 0.4rem 0.75rem;
  font-size: var(--mantine-font-size-sm);
  font-weight: 500;
  color: var(--mantine-color-dimmed);
  border-radius: var(--mantine-radius-default);

  @mixin hover {
    color: var(--mantine-color-text);
    background-color: var(--mantine-color-default-hover);
  }

  &[data-active] {
    color: var(--mantine-color-text);
  }
}

.mobileLink {
  padding: 0.6rem 0.5rem;
  font-size: var(--mantine-font-size-lg);
  color: var(--mantine-color-text);
  border-radius: var(--mantine-radius-default);

  @mixin hover {
    background-color: var(--mantine-color-default-hover);
  }
}

.cta {
  display: none;

  @mixin larger-than $mantine-breakpoint-xs {
    display: inline-flex;
  }
}

.burger {
  @mixin larger-than $mantine-breakpoint-sm {
    display: none;
  }
}
```

```tsx components/SiteFooter.tsx
import Link from "next/link";
import { Anchor, Container, Group, Stack, Text } from "@mantine/core";
import { brand, navLinks } from "@/lib/data";
import classes from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={classes.footer}>
      <Container>
        <div className={classes.inner}>
          <Stack gap="xs" maw={360}>
            <Text className={classes.logo}>{brand.name}</Text>
            <Text size="sm" c="dimmed">
              {brand.tagline}.
            </Text>
          </Stack>

          <nav aria-label="Footer">
            <Group gap="lg" wrap="wrap">
              {navLinks.map((link) => (
                <Anchor key={link.href} component={Link} href={link.href} size="sm">
                  {link.label}
                </Anchor>
              ))}
            </Group>
          </nav>
        </div>

        <Text size="xs" c="dimmed" className={classes.legal}>
          © {new Date().getFullYear()} Lumen. Your data is stored in the EU, encrypted at rest.
        </Text>
      </Container>
    </footer>
  );
}
```

```css components/SiteFooter.module.css
.footer {
  padding: var(--mantine-spacing-xl) 0;
  border-top: 1px solid var(--mantine-color-default-border);
  background-color: var(--mantine-color-body);
}

.inner {
  display: flex;
  flex-direction: column;
  gap: var(--mantine-spacing-lg);

  @mixin larger-than $mantine-breakpoint-sm {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.logo {
  font-family: var(--mantine-font-family-headings);
  font-size: 1.5rem;
  font-weight: 700;
}

.legal {
  margin-top: var(--mantine-spacing-xl);
  padding-top: var(--mantine-spacing-md);
  border-top: 1px solid var(--mantine-color-default-border);
}
```

```tsx components/Hero.tsx
import Link from "next/link";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import { brand } from "@/lib/data";
import classes from "./Hero.module.css";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className={classes.hero}>
      <Container>
        <div className={classes.content}>
          <Text className={classes.eyebrow}>For small software teams</Text>
          <Title order={1} id="hero-title" className={classes.title}>
            {brand.tagline}
          </Title>
          <Text className={classes.lead}>{brand.description}</Text>
          <Group gap="sm" mt="xl">
            <Button component={Link} href="/pricing" size="lg">
              Start free
            </Button>
            <Button component={Link} href="/#features" size="lg" variant="default">
              See how it works
            </Button>
          </Group>
        </div>
      </Container>
    </section>
  );
}
```

```css components/Hero.module.css
.hero {
  padding: var(--mantine-spacing-xl) 0;
  padding-block: clamp(3rem, 8vw, 7rem);
  border-bottom: 1px solid var(--mantine-color-default-border);
  background-image: radial-gradient(
    ellipse at 15% 0%,
    color-mix(in srgb, var(--mantine-primary-color-filled) 16%, transparent),
    transparent 55%
  );
}

.content {
  max-width: 46rem;
}

.eyebrow {
  margin-bottom: var(--mantine-spacing-sm);
  font-size: var(--mantine-font-size-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mantine-color-anchor);
}

.title {
  margin-bottom: var(--mantine-spacing-md);
}

.lead {
  max-width: 38rem;
  font-size: var(--mantine-font-size-lg);
  line-height: 1.6;
  color: var(--mantine-color-dimmed);
}
```

```tsx components/CustomerLogos.tsx
import { Container, Text } from "@mantine/core";
import { logos } from "@/lib/data";
import classes from "./CustomerLogos.module.css";

export function CustomerLogos() {
  return (
    <section id="customers" aria-labelledby="customers-title" className={classes.section}>
      <Container>
        <Text id="customers-title" className={classes.label}>
          Trusted by small teams shipping real software
        </Text>
        <ul className={classes.list}>
          {logos.map((name) => (
            <li key={name} className={classes.item}>
              {name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

```css components/CustomerLogos.module.css
.section {
  padding: var(--mantine-spacing-xl) 0;
  border-bottom: 1px solid var(--mantine-color-default-border);
  scroll-margin-top: 4rem;
}

.label {
  text-align: center;
  font-size: var(--mantine-font-size-sm);
  color: var(--mantine-color-dimmed);
}

.list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--mantine-spacing-md) var(--mantine-spacing-xl);
  margin: var(--mantine-spacing-lg) 0 0;
  padding: 0;
  list-style: none;
}

.item {
  font-family: var(--mantine-font-family-headings);
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--mantine-color-dimmed);
}
```

```tsx components/FeatureSection.tsx
import { Container, List, Text, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { Feature } from "@/lib/data";
import classes from "./FeatureSection.module.css";

interface FeatureSectionProps {
  feature: Feature;
  reversed?: boolean;
}

export function FeatureSection({ feature, reversed = false }: FeatureSectionProps) {
  const titleId = `feature-${feature.id}-title`;

  return (
    <section aria-labelledby={titleId} className={classes.section}>
      <Container>
        <div className={classes.grid} data-reversed={reversed || undefined}>
          <div className={classes.copy}>
            <Text className={classes.eyebrow}>{feature.eyebrow}</Text>
            <Title order={2} id={titleId} mb="md">
              {feature.title}
            </Title>
            <Text c="dimmed" size="lg" lh={1.6}>
              {feature.body}
            </Text>
          </div>

          <div className={classes.panel}>
            <List
              spacing="md"
              size="md"
              icon={
                <IconCheck
                  size={18}
                  stroke={2.25}
                  className={classes.check}
                  aria-hidden="true"
                />
              }
            >
              {feature.points.map((point) => (
                <List.Item key={point}>{point}</List.Item>
              ))}
            </List>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

```css components/FeatureSection.module.css
.section {
  padding-block: clamp(2.5rem, 6vw, 5rem);
  border-bottom: 1px solid var(--mantine-color-default-border);
  scroll-margin-top: 4rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--mantine-spacing-xl);
  align-items: center;

  @mixin larger-than $mantine-breakpoint-md {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;

    &[data-reversed] .copy {
      order: 2;
    }
  }
}

.eyebrow {
  margin-bottom: var(--mantine-spacing-xs);
  font-size: var(--mantine-font-size-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mantine-color-anchor);
}

.panel {
  padding: var(--mantine-spacing-lg);
  background-color: light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6));
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-default);
}

.check {
  color: var(--mantine-color-anchor);
}
```

```tsx components/Features.tsx
import { features } from "@/lib/data";
import { FeatureSection } from "./FeatureSection";

export function Features() {
  return (
    <div id="features" style={{ scrollMarginTop: "4rem" }}>
      {features.map((feature, index) => (
        <FeatureSection key={feature.id} feature={feature} reversed={index % 2 === 1} />
      ))}
    </div>
  );
}
```

```tsx app/page.tsx
import { CustomerLogos } from "@/components/CustomerLogos";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CustomerLogos />
      <Features />
    </>
  );
}
```

```tsx app/pricing/page.tsx
import type { Metadata } from "next";
import { Container, Text, Title } from "@mantine/core";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PlanComparison } from "@/components/PlanComparison";
import { PricingPlans } from "@/components/PricingPlans";
import classes from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Lumen pricing: a free plan for one person, Team at $12 per seat and Business at $29 per seat. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return (
    <>
      <section aria-labelledby="pricing-title" className={classes.intro}>
        <Container>
          <Title order={1} id="pricing-title" className={classes.title}>
            Simple pricing for small teams
          </Title>
          <Text size="lg" c="dimmed" maw={600} mt="md">
            Start free, upgrade when your team grows. Pay yearly and get two months free.
          </Text>
        </Container>
      </section>

      <PricingPlans />

      <section aria-labelledby="compare-title" className={classes.section}>
        <Container>
          <Title order={2} id="compare-title" mb="lg">
            Compare plans
          </Title>
          <PlanComparison />
        </Container>
      </section>

      <section aria-labelledby="faq-title" className={classes.section}>
        <Container size="md">
          <Title order={2} id="faq-title" mb="lg">
            Frequently asked questions
          </Title>
          <FaqAccordion />
        </Container>
      </section>
    </>
  );
}
```

```css app/pricing/pricing.module.css
.intro {
  padding-block: clamp(2.5rem, 6vw, 5rem) var(--mantine-spacing-lg);
}

.title {
  max-width: 40rem;
}

.section {
  padding-block: clamp(2rem, 5vw, 4rem);
  border-top: 1px solid var(--mantine-color-default-border);
}
```

```tsx components/PricingPlans.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  List,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { plans, yearlyPerMonth, yearlyTotal, type Plan } from "@/lib/data";
import classes from "./PricingPlans.module.css";

type Billing = "monthly" | "yearly";

function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const yearly = billing === "yearly";
  const perMonth = yearly ? yearlyPerMonth(plan.priceMonth) : plan.priceMonth;
  const isFree = plan.priceMonth === 0;
  const unit = isFree ? "1 seat" : plan.seats;
  const titleId = `plan-${plan.name.toLowerCase()}`;

  return (
    <Card
      className={classes.card}
      data-highlight={plan.highlight || undefined}
      aria-labelledby={titleId}
      component="article"
    >
      <Stack gap="md" h="100%">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={3} id={titleId}>
            {plan.name}
          </Title>
          {plan.highlight ? <Badge variant="filled">Most popular</Badge> : null}
        </Group>

        <div>
          <Group gap={6} align="baseline" wrap="nowrap">
            <Text className={classes.price} aria-label={`${formatPrice(perMonth)} per month`}>
              {formatPrice(perMonth)}
            </Text>
            <Text c="dimmed" size="sm">
              / month · {unit}
            </Text>
          </Group>
          <Text size="sm" c="dimmed" mt={4} mih={20} aria-live="polite">
            {isFree
              ? "Free forever"
              : yearly
                ? `Billed ${formatPrice(yearlyTotal(plan.priceMonth))} per seat yearly`
                : "Billed monthly"}
          </Text>
        </div>

        <List
          spacing="xs"
          size="sm"
          center
          icon={<IconCheck size={16} stroke={2.25} className={classes.check} aria-hidden="true" />}
          className={classes.features}
        >
          {plan.features.map((feature) => (
            <List.Item key={feature}>{feature}</List.Item>
          ))}
        </List>

        <Button
          component={Link}
          href="/pricing"
          variant={plan.highlight ? "filled" : "default"}
          fullWidth
          aria-label={`${isFree ? "Start free with" : "Choose"} the ${plan.name} plan`}
        >
          {isFree ? "Start free" : `Choose ${plan.name}`}
        </Button>
      </Stack>
    </Card>
  );
}

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section aria-label="Plans and prices" className={classes.section}>
      <Container>
        <Group justify="center" mb="xl">
          <SegmentedControl
            value={billing}
            onChange={(value) => setBilling(value as Billing)}
            aria-label="Billing period"
            data={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly · 2 months free" },
            ]}
          />
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} billing={billing} />
          ))}
        </SimpleGrid>

        <Text size="sm" c="dimmed" ta="center" mt="lg">
          {billing === "yearly"
            ? "Yearly prices are shown per month and include two months free."
            : "Switch to yearly billing to get two months free."}
        </Text>
      </Container>
    </section>
  );
}
```

```css components/PricingPlans.module.css
.section {
  padding-bottom: clamp(2rem, 5vw, 4rem);
}

.card {
  height: 100%;
  background-color: light-dark(var(--mantine-color-white), var(--mantine-color-dark-6));

  &[data-highlight] {
    border-color: var(--mantine-primary-color-filled);
    box-shadow: 0 0 0 1px var(--mantine-primary-color-filled);
    background-image: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--mantine-primary-color-filled) 10%, transparent),
      transparent 40%
    );
  }
}

.price {
  font-family: var(--mantine-font-family-headings);
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.features {
  flex: 1;
}

.check {
  color: var(--mantine-color-anchor);
}
```

```tsx components/PlanComparison.tsx
import { Table, Text, VisuallyHidden } from "@mantine/core";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import { comparison, plans, type ComparisonValue } from "@/lib/data";
import classes from "./PlanComparison.module.css";

function Cell({ value }: { value: ComparisonValue }) {
  if (typeof value === "string") {
    return <Text size="sm">{value}</Text>;
  }
  return value ? (
    <>
      <IconCheck size={18} stroke={2.25} className={classes.yes} aria-hidden="true" />
      <VisuallyHidden>Included</VisuallyHidden>
    </>
  ) : (
    <>
      <IconMinus size={18} stroke={1.75} className={classes.no} aria-hidden="true" />
      <VisuallyHidden>Not included</VisuallyHidden>
    </>
  );
}

export function PlanComparison() {
  return (
    <Table.ScrollContainer minWidth={560} type="native">
      <Table withTableBorder withRowBorders className={classes.table}>
        <Table.Caption>Feature comparison of the Free, Team and Business plans</Table.Caption>
        <Table.Thead>
          <Table.Tr>
            <Table.Th scope="col">Feature</Table.Th>
            {plans.map((plan) => (
              <Table.Th
                key={plan.name}
                scope="col"
                className={classes.planHead}
                data-highlight={plan.highlight || undefined}
              >
                {plan.name}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {comparison.map((row) => (
            <Table.Tr key={row.feature}>
              <Table.Th scope="row" className={classes.rowHead}>
                {row.feature}
              </Table.Th>
              <Table.Td className={classes.cell}>
                <Cell value={row.free} />
              </Table.Td>
              <Table.Td className={classes.cell} data-highlight>
                <Cell value={row.team} />
              </Table.Td>
              <Table.Td className={classes.cell}>
                <Cell value={row.business} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
```

```css components/PlanComparison.module.css
.table {
  background-color: light-dark(var(--mantine-color-white), var(--mantine-color-dark-6));
}

.planHead[data-highlight] {
  color: var(--mantine-color-anchor);
}

.rowHead {
  font-weight: 500;
  text-align: left;
}

.cell[data-highlight] {
  background-color: color-mix(in srgb, var(--mantine-primary-color-filled) 8%, transparent);
}

.yes {
  display: block;
  color: var(--mantine-color-anchor);
}

.no {
  display: block;
  color: var(--mantine-color-dimmed);
}
```

```tsx components/FaqAccordion.tsx
"use client";

import { Accordion } from "@mantine/core";
import { faq } from "@/lib/data";

export function FaqAccordion() {
  return (
    <Accordion variant="separated" order={3} defaultValue={faq[0]?.q}>
      {faq.map((item) => (
        <Accordion.Item key={item.q} value={item.q}>
          <Accordion.Control>{item.q}</Accordion.Control>
          <Accordion.Panel>{item.a}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
```