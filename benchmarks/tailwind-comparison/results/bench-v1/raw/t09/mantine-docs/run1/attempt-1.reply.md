The cause is that `theme.ts` is imported by the server layout, and `Button.extend` is a static method on a client component. On the server, `@mantine/core` exports client references, so those statics aren't callable. The fix is to define `components` as plain objects with `defaultProps`, with no `.extend()` calls and no component imports in `theme.ts`.

I'm also adding `"use client"` to the new files that use compound components. `PricingPlans`, `ComparisonTable` and `FaqAccordion` already have it, and `FeatureSection` is a client file too. `FeaturePanel` only uses simple components, but it is imported by a client file, so that's fine. `Home.module.css` uses a plain `@media`, so no preset is needed there.

```ts app/theme.ts
import { createTheme, type MantineColorsTuple } from "@mantine/core";

/**
 * Lumen brand: orange #E8590C. Shade 6 is the exact brand colour and
 * `primaryShade` points at it in both colour schemes, so filled buttons,
 * links and focus rings all resolve to the brand.
 */
const brand: MantineColorsTuple = [
  "#FFF4EC",
  "#FFE5D3",
  "#FFC9A6",
  "#FFA871",
  "#F58440",
  "#EE6C23",
  "#E8590C",
  "#C94A07",
  "#A53D07",
  "#7F2F06",
];

/** Warm stone-grey neutral, light to dark. Used for the light scheme. */
const stone: MantineColorsTuple = [
  "#FAF9F7",
  "#F4F2EF",
  "#E8E5E0",
  "#D8D4CD",
  "#BDB8AF",
  "#A39D93",
  "#79736A",
  "#57524A",
  "#3D3934",
  "#292622",
];

/**
 * Mantine's dark colour scheme reads surfaces, borders and text from the
 * `dark` scale (0 = lightest text, 9 = deepest surface), so a warm stone
 * scale here makes the whole dark theme warm.
 */
const darkStone: MantineColorsTuple = [
  "#E7E3DC", // text
  "#CBC6BD",
  "#A29C91", // dimmed
  "#7E786E", // placeholder
  "#4A453E", // borders
  "#3C3833", // hover
  "#2F2C28", // surfaces (cards, inputs)
  "#242220", // body background
  "#1B1917",
  "#131211",
];

const RADIUS = "4px";

/*
 * This file is imported by the server layout, so it must not call statics
 * such as `Button.extend()` (those live on client components). Component
 * defaults are plain `{ defaultProps }` objects instead.
 */
export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 6 },
  colors: {
    brand,
    dark: darkStone,
    gray: stone,
  },

  // The brand orange is mid-luminance: let Mantine pick black or white text
  // for filled controls, whichever contrasts better (dark text on #E8590C).
  autoContrast: true,
  luminanceThreshold: 0.35,

  // Focus ring follows the primary colour (brand) for keyboard users.
  focusRing: "auto",

  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: "700",
    textWrap: "balance",
    sizes: {
      h1: { fontSize: "3.25rem", lineHeight: "1.1" },
      h2: { fontSize: "2.25rem", lineHeight: "1.2" },
      h3: { fontSize: "1.5rem", lineHeight: "1.3" },
    },
  },

  // 4px corners everywhere a radius is not set explicitly.
  defaultRadius: "xs",
  radius: {
    xs: RADIUS,
    sm: RADIUS,
    md: RADIUS,
    lg: RADIUS,
    xl: RADIUS,
  },

  components: {
    Button: { defaultProps: { radius: "xs" } },
    ActionIcon: { defaultProps: { radius: "xs" } },
    TextInput: { defaultProps: { radius: "xs" } },
    PasswordInput: { defaultProps: { radius: "xs" } },
    Textarea: { defaultProps: { radius: "xs" } },
    Select: { defaultProps: { radius: "xs" } },
    NativeSelect: { defaultProps: { radius: "xs" } },
    Card: { defaultProps: { radius: "xs" } },
    Paper: { defaultProps: { radius: "xs" } },
    Menu: { defaultProps: { radius: "xs" } },
    Accordion: { defaultProps: { radius: "xs" } },
    SegmentedControl: { defaultProps: { radius: "xs" } },
    Badge: { defaultProps: { radius: "xs" } },
    Anchor: { defaultProps: { underline: "hover" } },
    Container: { defaultProps: { size: "lg" } },
    Table: { defaultProps: { verticalSpacing: "sm" } },
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
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Lumen: product analytics and issue tracking for small teams",
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
        <MantineProvider theme={theme} defaultColorScheme="dark">
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
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
] as const;

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

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
];

export const features = [
  {
    id: "analytics",
    kicker: "Product analytics",
    title: "See what people actually do",
    body: "Funnels, retention and event trends sit on one page instead of twelve dashboards. Every chart ends with a plain sentence saying what changed since last week, so the whole team reads it and not just the analyst.",
    points: [
      "Funnels and retention with no query language",
      "Weekly digest written in plain English",
      "Share any view with a single link",
    ],
  },
  {
    id: "issues",
    kicker: "Issue tracking",
    title: "Turn a drop-off into a ticket in one click",
    body: "Spot a broken step in a funnel and file the issue from the same screen, with the cohort, the chart and the session count already attached. Engineers get context, not a screenshot.",
    points: [
      "Issues link back to the data that raised them",
      "Boards, labels and a keyboard-first inbox",
      "Close the loop: see the metric move after the fix",
    ],
  },
  {
    id: "teams",
    kicker: "Built for small teams",
    title: "Set up in an afternoon, priced per seat",
    body: "No sales call, no tracking plan workshop. Install the snippet, name your key events and invite the team. Pricing stays flat per seat, and your data stays in the EU, encrypted at rest.",
    points: [
      "One snippet, no tracking plan to maintain",
      "EU data storage, encrypted at rest",
      "Free plan for solo projects, no card required",
    ],
  },
] as const;

export interface ComparisonRow {
  feature: string;
  free: string | boolean;
  team: string | boolean;
  business: string | boolean;
}

export const comparison: ComparisonRow[] = [
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "History", free: "7 days", team: "1 year", business: "Unlimited" },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "SSO and audit log", free: false, team: false, business: true },
  {
    feature: "Support",
    free: "Community",
    team: "Email",
    business: "Priority",
  },
];

/** Yearly billing is two months free: 10 months' price for 12 months. */
export const YEARLY_MONTHS_CHARGED = 10;

export function yearlyPrice(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_CHARGED;
}
```

```tsx components/ThemeToggle.tsx
"use client";

import {
  ActionIcon,
  Box,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

/**
 * Both icons are rendered and one is hidden per colour scheme with
 * `lightHidden` / `darkHidden`, so server and client markup match.
 */
export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      variant="default"
      size="lg"
      aria-label="Toggle light and dark theme"
      onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
    >
      <Box component="span" darkHidden style={{ display: "inline-flex" }}>
        <IconSun size={18} stroke={1.75} aria-hidden="true" />
      </Box>
      <Box component="span" lightHidden style={{ display: "inline-flex" }}>
        <IconMoon size={18} stroke={1.75} aria-hidden="true" />
      </Box>
    </ActionIcon>
  );
}
```

```css components/SiteShell.module.css
.skipLink {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
  padding: var(--mantine-spacing-xs) var(--mantine-spacing-md);
  background: var(--mantine-color-body);
  color: var(--mantine-color-text);
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-default);
  transform: translateY(-120%);

  &:focus {
    transform: translateY(0);
  }
}

.root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  outline: none;
}
```

```tsx components/SiteShell.tsx
import { Box } from "@mantine/core";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import classes from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box className={classes.root}>
      <a href="#main" className={classes.skipLink}>
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className={classes.main}>
        {children}
      </main>
      <SiteFooter />
    </Box>
  );
}
```

```css components/SiteHeader.module.css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--mantine-color-body);
  border-bottom: 1px solid var(--mantine-color-default-border);
}

.inner {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mantine-spacing-md);
}

.logo {
  font-family: var(--mantine-font-family-headings);
  font-size: var(--mantine-font-size-xl);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--mantine-color-bright);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mark {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--mantine-primary-color-filled);
}

.link {
  display: block;
  padding: 8px 12px;
  border-radius: var(--mantine-radius-default);
  color: var(--mantine-color-dimmed);
  font-size: var(--mantine-font-size-sm);
  font-weight: 600;
  text-decoration: none;

  @mixin hover {
    background: var(--mantine-color-default-hover);
    color: var(--mantine-color-bright);
  }

  &[data-active] {
    color: var(--mantine-color-bright);
    box-shadow: inset 0 -2px 0 var(--mantine-primary-color-filled);
    border-radius: 0;
  }
}

.mobileNav {
  border-top: 1px solid var(--mantine-color-default-border);
  padding: var(--mantine-spacing-sm) 0 var(--mantine-spacing-md);
}
```

```tsx components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Burger, Button, Collapse, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { brand, navLinks } from "@/lib/data";
import { ThemeToggle } from "./ThemeToggle";
import classes from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);

  const links = navLinks.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={classes.link}
      data-active={pathname === item.href ? "" : undefined}
      aria-current={pathname === item.href ? "page" : undefined}
      onClick={close}
    >
      {item.label}
    </Link>
  ));

  return (
    <Box component="header" className={classes.header}>
      <Container>
        <div className={classes.inner}>
          <Link href="/" className={classes.logo} aria-label={`${brand.name} home`}>
            <span className={classes.mark} aria-hidden="true" />
            {brand.name}
          </Link>

          <Group gap="xs" visibleFrom="sm" component="nav" aria-label="Main">
            {links}
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Button
              component={Link}
              href="/pricing"
              size="sm"
              visibleFrom="sm"
            >
              Start free
            </Button>
            <ThemeToggle />
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label={opened ? "Close navigation" : "Open navigation"}
              aria-expanded={opened}
              aria-controls="mobile-nav"
            />
          </Group>
        </div>

        <Collapse expanded={opened} hiddenFrom="sm" id="mobile-nav">
          <Box component="nav" aria-label="Mobile" className={classes.mobileNav}>
            {links}
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
}
```

```css components/SiteFooter.module.css
.footer {
  border-top: 1px solid var(--mantine-color-default-border);
  background: var(--mantine-color-body);
}

.link {
  color: var(--mantine-color-dimmed);
  font-size: var(--mantine-font-size-sm);
  text-decoration: none;

  @mixin hover {
    color: var(--mantine-color-bright);
    text-decoration: underline;
  }
}
```

```tsx components/SiteFooter.tsx
import Link from "next/link";
import { Box, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { brand, navLinks } from "@/lib/data";
import classes from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <Box component="footer" className={classes.footer} py="xl">
      <Container>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
          <Stack gap="xs">
            <Title order={3} component="p">
              {brand.name}
            </Title>
            <Text c="dimmed" size="sm" maw={360}>
              {brand.description} Your data stays in the EU, encrypted at rest.
            </Text>
          </Stack>

          <Stack gap="xs" align="flex-start">
            <Text fw={600} size="sm" component="p">
              Explore
            </Text>
            <Group component="nav" aria-label="Footer" gap="md">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} className={classes.link}>
                  {item.label}
                </Link>
              ))}
            </Group>
          </Stack>
        </SimpleGrid>

        <Text c="dimmed" size="xs" mt="xl">
          &copy; 2025 {brand.name}. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}
```

```css components/home/Home.module.css
.hero {
  padding: calc(var(--mantine-spacing-xl) * 2.5) 0 calc(var(--mantine-spacing-xl) * 2);
  border-bottom: 1px solid var(--mantine-color-default-border);
}

.kicker {
  color: var(--mantine-color-dimmed);
  font-size: var(--mantine-font-size-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.heroTitle {
  font-size: clamp(2.25rem, 6vw, 3.75rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.logos {
  border-bottom: 1px solid var(--mantine-color-default-border);
  padding: var(--mantine-spacing-xl) 0;
}

.logoList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--mantine-spacing-md) calc(var(--mantine-spacing-xl) * 1.5);
}

.logo {
  font-family: var(--mantine-font-family-headings);
  font-size: var(--mantine-font-size-lg);
  font-weight: 700;
  color: var(--mantine-color-dimmed);
  letter-spacing: 0.01em;
}

.feature {
  padding: calc(var(--mantine-spacing-xl) * 2) 0;
  border-bottom: 1px solid var(--mantine-color-default-border);
}

.featureTitle {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
}

/* On wide screens, every second feature puts its panel on the left. */
.copy {
  order: 1;
}

.visual {
  order: 2;
}

@media (min-width: 62em) {
  .reverse .copy {
    order: 2;
  }

  .reverse .visual {
    order: 1;
  }
}

.panel {
  border: 1px solid var(--mantine-color-default-border);
  background: var(--mantine-color-default);
  border-radius: var(--mantine-radius-default);
  padding: var(--mantine-spacing-lg);
}

.bar {
  height: 10px;
  border-radius: var(--mantine-radius-default);
  background: var(--mantine-color-default-border);
  overflow: hidden;
}

.barFill {
  height: 100%;
  background: var(--mantine-primary-color-filled);
}

.cta {
  padding: calc(var(--mantine-spacing-xl) * 2) 0;
  text-align: center;
}
```

```tsx components/home/FeaturePanel.tsx
import { Badge, Group, Stack, Text } from "@mantine/core";
import classes from "./Home.module.css";

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <Group justify="space-between" mb={4}>
        <Text size="sm">{label}</Text>
        <Text size="sm" c="dimmed">
          {value}%
        </Text>
      </Group>
      <div
        className={classes.bar}
        role="img"
        aria-label={`${label}: ${value} percent`}
      >
        <div className={classes.barFill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Small static illustrations built from theme components, one per feature. */
export function FeaturePanel({ id }: { id: string }) {
  if (id === "analytics") {
    return (
      <Stack className={classes.panel} gap="md">
        <Text fw={700} ff="heading">
          Signup funnel, last 7 days
        </Text>
        <Bar label="Visited pricing" value={100} />
        <Bar label="Started signup" value={46} />
        <Bar label="Created a project" value={31} />
        <Bar label="Invited a teammate" value={18} />
        <Text size="sm" c="dimmed">
          Biggest drop: pricing to signup, down 6 points since last week.
        </Text>
      </Stack>
    );
  }

  if (id === "issues") {
    return (
      <Stack className={classes.panel} gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} ff="heading">
            LUM-142 Signup step 2 fails on Safari
          </Text>
          <Badge variant="light">Open</Badge>
        </Group>
        <Text size="sm" c="dimmed">
          Raised from the signup funnel. Cohort: Safari, new visitors. 214
          sessions affected this week.
        </Text>
        <Group gap="xs">
          <Badge variant="outline">bug</Badge>
          <Badge variant="outline">onboarding</Badge>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack className={classes.panel} gap="sm">
      <Text fw={700} ff="heading">
        Setup checklist
      </Text>
      <Text size="sm">1. Paste the snippet into your app</Text>
      <Text size="sm">2. Name your five key events</Text>
      <Text size="sm">3. Invite the team</Text>
      <Text size="sm" c="dimmed">
        Most teams finish before lunch.
      </Text>
    </Stack>
  );
}
```

```tsx components/home/FeatureSection.tsx
"use client";

import { Box, Container, List, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { FeaturePanel } from "./FeaturePanel";
import classes from "./Home.module.css";

interface FeatureSectionProps {
  id: string;
  kicker: string;
  title: string;
  body: string;
  points: readonly string[];
  reverse: boolean;
}

export function FeatureSection({
  id,
  kicker,
  title,
  body,
  points,
  reverse,
}: FeatureSectionProps) {
  return (
    <Box
      component="section"
      className={classes.feature}
      aria-labelledby={`feature-${id}`}
    >
      <Container>
        <SimpleGrid
          cols={{ base: 1, md: 2 }}
          spacing="xl"
          verticalSpacing="xl"
          className={reverse ? classes.reverse : undefined}
        >
          <Stack gap="md" justify="center" className={classes.copy}>
            <Text className={classes.kicker}>{kicker}</Text>
            <Title order={2} id={`feature-${id}`} className={classes.featureTitle}>
              {title}
            </Title>
            <Text c="dimmed">{body}</Text>
            <List spacing="xs" size="sm">
              {points.map((point) => (
                <List.Item key={point}>{point}</List.Item>
              ))}
            </List>
          </Stack>
          <Box className={classes.visual}>
            <FeaturePanel id={id} />
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import { Box, Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { FeatureSection } from "@/components/home/FeatureSection";
import { brand, features, logos } from "@/lib/data";
import classes from "@/components/home/Home.module.css";

export default function HomePage() {
  return (
    <>
      <Box component="section" className={classes.hero} aria-labelledby="hero-title">
        <Container>
          <Stack gap="lg" maw={760}>
            <Text className={classes.kicker}>For small software teams</Text>
            <Title order={1} id="hero-title" className={classes.heroTitle}>
              {brand.tagline}
            </Title>
            <Text size="lg" c="dimmed" maw={620}>
              Lumen puts funnels, retention and your issue tracker in one calm
              place, so the numbers lead straight to the fix.
            </Text>
            <Group gap="sm">
              <Button component={Link} href="/pricing" size="md">
                Start free
              </Button>
              <Button component={Link} href="/pricing" size="md" variant="default">
                See pricing
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      <Box component="section" className={classes.logos} aria-labelledby="logos-title">
        <Container>
          <Text id="logos-title" ta="center" size="sm" c="dimmed" mb="md">
            Trusted by small teams shipping every week
          </Text>
          <ul className={classes.logoList}>
            {logos.map((name) => (
              <li key={name} className={classes.logo}>
                {name}
              </li>
            ))}
          </ul>
        </Container>
      </Box>

      {features.map((feature, index) => (
        <FeatureSection
          key={feature.id}
          id={feature.id}
          kicker={feature.kicker}
          title={feature.title}
          body={feature.body}
          points={feature.points}
          reverse={index % 2 === 1}
        />
      ))}

      <Box component="section" className={classes.cta} aria-labelledby="cta-title">
        <Container size="sm">
          <Stack gap="md" align="center">
            <Title order={2} id="cta-title" className={classes.featureTitle}>
              Read your numbers on Monday, fix them by Friday
            </Title>
            <Button component={Link} href="/pricing" size="md">
              Start free
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
```

```css components/pricing/Pricing.module.css
.head {
  padding: calc(var(--mantine-spacing-xl) * 2) 0 var(--mantine-spacing-xl);
}

.title {
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: -0.02em;
}

.section {
  padding: var(--mantine-spacing-xl) 0 calc(var(--mantine-spacing-xl) * 1.5);
}

.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--mantine-color-default);
  border: 1px solid var(--mantine-color-default-border);
}

/* Highlighted plan: brand border and a soft brand tint. */
.card[data-highlight] {
  border: 2px solid var(--mantine-primary-color-filled);
  background: color-mix(
    in srgb,
    var(--mantine-primary-color-filled),
    var(--mantine-color-default) 92%
  );
}

.price {
  font-family: var(--mantine-font-family-headings);
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.check {
  color: var(--mantine-primary-color-filled);
}

.tableWrap {
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-default);
}

.highlightCol {
  background: color-mix(
    in srgb,
    var(--mantine-primary-color-filled),
    transparent 92%
  );
}
```

```tsx components/pricing/PricingPlans.tsx
"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  List,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { plans, yearlyPrice, type Plan } from "@/lib/data";
import classes from "./Pricing.module.css";

function priceFor(plan: Plan, yearly: boolean): number {
  return yearly ? yearlyPrice(plan.priceMonth) : plan.priceMonth;
}

function unitLabel(plan: Plan, yearly: boolean): string {
  if (plan.priceMonth === 0) return "forever";
  const period = yearly ? "year" : "month";
  return plan.seats === "per seat" ? `per seat / ${period}` : `/ ${period}`;
}

export function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <Container className={classes.section}>
      <Stack gap="lg">
        <Group gap="sm" align="center">
          <Switch
            size="md"
            checked={yearly}
            onChange={(event) => setYearly(event.currentTarget.checked)}
            label="Bill yearly"
            aria-describedby="yearly-note"
          />
          <Badge variant="light" size="lg" id="yearly-note">
            2 months free
          </Badge>
        </Group>

        <Text size="sm" c="dimmed" role="status" aria-live="polite">
          Showing {yearly ? "yearly" : "monthly"} prices
          {yearly ? ": pay for 10 months, get 12." : "."}
        </Text>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              padding="xl"
              className={classes.card}
              data-highlight={plan.highlight ? "" : undefined}
              aria-labelledby={`plan-${plan.name}`}
            >
              <Stack gap="md" style={{ flex: 1 }}>
                <Group justify="space-between" wrap="nowrap">
                  <Title order={2} fz="h3" id={`plan-${plan.name}`}>
                    {plan.name}
                  </Title>
                  {plan.highlight ? <Badge>Most popular</Badge> : null}
                </Group>

                <div>
                  <Group gap="xs" align="baseline">
                    <span className={classes.price}>
                      ${priceFor(plan, yearly)}
                    </span>
                    <Text size="sm" c="dimmed">
                      {unitLabel(plan, yearly)}
                    </Text>
                  </Group>
                  {yearly && plan.priceMonth > 0 ? (
                    <Text size="xs" c="dimmed" mt={4}>
                      Instead of ${plan.priceMonth * 12} billed monthly
                    </Text>
                  ) : null}
                </div>

                <List
                  spacing="xs"
                  size="sm"
                  icon={
                    <IconCheck
                      size={16}
                      stroke={2}
                      className={classes.check}
                      aria-hidden="true"
                    />
                  }
                  style={{ flex: 1 }}
                >
                  {plan.features.map((feature) => (
                    <List.Item key={feature}>{feature}</List.Item>
                  ))}
                </List>

                <Button
                  component={Link}
                  href="/"
                  variant={plan.highlight ? "filled" : "default"}
                  fullWidth
                >
                  {plan.priceMonth === 0 ? "Start free" : `Choose ${plan.name}`}
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
```

```tsx components/pricing/ComparisonTable.tsx
"use client";

import { Container, Table, Text, Title, VisuallyHidden } from "@mantine/core";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import { comparison } from "@/lib/data";
import classes from "./Pricing.module.css";

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <>
        <IconCheck
          size={18}
          stroke={2}
          className={classes.check}
          aria-hidden="true"
        />
        <VisuallyHidden>Included</VisuallyHidden>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <IconMinus size={18} stroke={1.5} aria-hidden="true" />
        <VisuallyHidden>Not included</VisuallyHidden>
      </>
    );
  }
  return <>{value}</>;
}

export function ComparisonTable() {
  return (
    <Container className={classes.section} aria-labelledby="compare-title" component="section">
      <Title order={2} id="compare-title" mb="xs">
        Compare plans
      </Title>
      <Text c="dimmed" mb="lg">
        Everything side by side, so there are no surprises at checkout.
      </Text>

      <div className={classes.tableWrap}>
        <Table.ScrollContainer minWidth={560} type="native">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Feature</Table.Th>
                <Table.Th scope="col">Free</Table.Th>
                <Table.Th scope="col" className={classes.highlightCol}>
                  Team
                </Table.Th>
                <Table.Th scope="col">Business</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {comparison.map((row) => (
                <Table.Tr key={row.feature}>
                  <Table.Th scope="row" fw={600}>
                    {row.feature}
                  </Table.Th>
                  <Table.Td>
                    <Cell value={row.free} />
                  </Table.Td>
                  <Table.Td className={classes.highlightCol}>
                    <Cell value={row.team} />
                  </Table.Td>
                  <Table.Td>
                    <Cell value={row.business} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
    </Container>
  );
}
```

```tsx components/pricing/FaqAccordion.tsx
"use client";

import { Accordion, Container, Title } from "@mantine/core";
import { faq } from "@/lib/data";
import classes from "./Pricing.module.css";

export function FaqAccordion() {
  return (
    <Container
      size="md"
      className={classes.section}
      component="section"
      aria-labelledby="faq-title"
    >
      <Title order={2} id="faq-title" mb="lg">
        Frequently asked questions
      </Title>
      <Accordion variant="separated" order={3} defaultValue={faq[0]?.q}>
        {faq.map((item) => (
          <Accordion.Item key={item.q} value={item.q}>
            <Accordion.Control>{item.q}</Accordion.Control>
            <Accordion.Panel>{item.a}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}
```

```tsx app/pricing/page.tsx
import type { Metadata } from "next";
import { Box, Container, Stack, Text, Title } from "@mantine/core";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { FaqAccordion } from "@/components/pricing/FaqAccordion";
import classes from "@/components/pricing/Pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing | Lumen",
  description:
    "Simple per-seat pricing for small teams. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return (
    <>
      <Box component="section" className={classes.head} aria-labelledby="pricing-title">
        <Container>
          <Stack gap="sm" maw={680}>
            <Title order={1} id="pricing-title" className={classes.title}>
              Pricing that stays out of the way
            </Title>
            <Text size="lg" c="dimmed">
              Start free, add seats as the team grows. Pay yearly and get two
              months free.
            </Text>
          </Stack>
        </Container>
      </Box>

      <PricingPlans />
      <ComparisonTable />
      <FaqAccordion />
    </>
  );
}
```