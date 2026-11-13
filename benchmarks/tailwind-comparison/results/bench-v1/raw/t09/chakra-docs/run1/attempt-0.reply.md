The `Theme` component takes a `colorPalette` prop, which sets the app-wide default palette without touching recipe typing. That suits the whole site: wrapping the app in `<Theme colorPalette="brand">` makes brand the default palette for buttons, links, switches, focus rings and the like, and an explicit `colorPalette` on any element still wins. I'll drop the risky `recipes` override and put the palette in the provider.

Final theme and provider:

```ts
// lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    html: { fontFamily: "body" },
    "*::selection": { bg: "brand.muted" },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#FFF4EC" },
          100: { value: "#FFE5D1" },
          200: { value: "#FFC9A1" },
          300: { value: "#FFA66B" },
          400: { value: "#F77F37" },
          500: { value: "#E8590C" },
          600: { value: "#C2410C" },
          700: { value: "#9A330B" },
          800: { value: "#732709" },
          900: { value: "#4D1A06" },
          950: { value: "#2E0F03" },
        },
        gray: {
          50: { value: "#FAFAF9" },
          100: { value: "#F5F5F4" },
          200: { value: "#E7E5E4" },
          300: { value: "#D6D3D1" },
          400: { value: "#A8A29E" },
          500: { value: "#78716C" },
          600: { value: "#57534E" },
          700: { value: "#44403C" },
          800: { value: "#292524" },
          900: { value: "#1C1917" },
          950: { value: "#0C0A09" },
        },
      },
      radii: {
        xs: { value: "2px" },
        sm: { value: "4px" },
        md: { value: "4px" },
        l1: { value: "4px" },
        l2: { value: "4px" },
        l3: { value: "4px" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: "{colors.brand.500}" },
        },
        gray: {
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
```

One more check: in the default theme, are `bg`/`fg` semantic tokens built from `gray.*`, so the stone palette actually reaches page backgrounds? The docs say `bg` is `white`/`gray.950` and borders use `gray.200`/`gray.800`, so overriding the `gray` scale carries through. 

Now I'll write the final answer with all files.

```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Lumen brand theme.
 *
 * All brand decisions live here, in the design system, so components never
 * carry one-off colours, radii or fonts:
 *  - `brand` palette built around #E8590C (primary buttons, links, focus rings)
 *  - `gray` scale replaced by a warm stone grey (every neutral surface/border/text)
 *  - 4px radii for buttons, inputs, cards and menus (via l1/l2/l3 + sm/md)
 *  - Georgia heading font, system sans body font (no fonts are loaded)
 */
const config = defineConfig({
  globalCss: {
    html: { fontFamily: "body" },
    "*::selection": { bg: "brand.muted" },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      colors: {
        // Brand colour #E8590C sits at 500.
        brand: {
          50: { value: "#FFF4EC" },
          100: { value: "#FFE5D1" },
          200: { value: "#FFC9A1" },
          300: { value: "#FFA66B" },
          400: { value: "#F77F37" },
          500: { value: "#E8590C" },
          600: { value: "#C2410C" },
          700: { value: "#9A330B" },
          800: { value: "#732709" },
          900: { value: "#4D1A06" },
          950: { value: "#2E0F03" },
        },
        // Warm stone grey: replaces the default cool gray scale.
        gray: {
          50: { value: "#FAFAF9" },
          100: { value: "#F5F5F4" },
          200: { value: "#E7E5E4" },
          300: { value: "#D6D3D1" },
          400: { value: "#A8A29E" },
          500: { value: "#78716C" },
          600: { value: "#57534E" },
          700: { value: "#44403C" },
          800: { value: "#292524" },
          900: { value: "#1C1917" },
          950: { value: "#0C0A09" },
        },
      },
      // Chakra recipes use the semantic l1/l2/l3 radii (buttons, inputs, cards,
      // menus), so pinning them to 4px applies the rule through the system.
      radii: {
        xs: { value: "2px" },
        sm: { value: "4px" },
        md: { value: "4px" },
        l1: { value: "4px" },
        l2: { value: "4px" },
        l3: { value: "4px" },
      },
    },
    semanticTokens: {
      colors: {
        // Full colour-palette contract so `colorPalette="brand"` works.
        brand: {
          // 600 keeps white text on solid buttons above 4.5:1 contrast.
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" },
          },
          muted: {
            value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" },
          },
          subtle: {
            value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" },
          },
          emphasized: {
            value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" },
          },
          focusRing: { value: "{colors.brand.500}" },
        },
        // Neutral components (inputs, menus, accordion, switch) read the gray
        // palette's focus ring, so point it at the brand colour as well.
        gray: {
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
```

```tsx components/ui/provider.tsx
"use client"

import { ChakraProvider, Theme } from "@chakra-ui/react"
import { system } from "@/lib/theme"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props}>
        {/* Brand is the default colour palette site-wide: primary buttons,
            switches and other palette-aware components pick it up without
            per-element props. An explicit colorPalette still wins. */}
        <Theme colorPalette="brand" display="contents">
          {props.children}
        </Theme>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
```

```tsx components/ui/color-mode.tsx
"use client"

import type { IconButtonProps, SpanProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Skeleton, Span } from "@chakra-ui/react"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    />
  )
}

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme()
  const colorMode = forcedTheme || resolvedTheme
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  return {
    colorMode: colorMode as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode, colorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="9" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label={
          colorMode === "dark" ? "Switch to light theme" : "Switch to dark theme"
        }
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    )
  },
)
```

```ts lib/data.ts
export interface Plan {
  name: string
  priceMonth: number
  seats: string
  blurb: string
  features: string[]
  highlight?: boolean
  cta: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface Feature {
  eyebrow: string
  title: string
  body: string
  points: string[]
}

export interface NavItem {
  label: string
  href: string
}

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
} as const

export const navItems: NavItem[] = [
  { label: "Product", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Customers", href: "/#customers" },
]

export const logos: string[] = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
]

export const features: Feature[] = [
  {
    eyebrow: "Analytics",
    title: "Numbers that fit on one screen",
    body: "Lumen turns raw events into a short weekly digest: what grew, what broke, and what nobody opened. No dashboards to maintain, nothing to decode.",
    points: [
      "One page per product area, not forty charts",
      "Plain-language summaries of every change",
      "Share a live view with a single link",
    ],
  },
  {
    eyebrow: "Issues",
    title: "A tracker that stays out of the way",
    body: "Capture a bug from the exact chart where you spotted it. Issues keep the context they came from, so nobody has to ask for reproduction steps.",
    points: [
      "Create an issue straight from any metric",
      "Keyboard-first triage for quick backlog passes",
      "Cycles and priorities without the ceremony",
    ],
  },
  {
    eyebrow: "Teamwork",
    title: "Built for teams of three to thirty",
    body: "Everyone sees the same picture. Comment on a trend, assign the follow-up, and close the loop in the same place where the question started.",
    points: [
      "Threads attached to charts and issues",
      "Weekly digest delivered to email or chat",
      "EU data hosting, encrypted at rest",
    ],
  },
]

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For solo builders trying Lumen on a side project.",
    features: ["1 project", "7-day history", "Community support"],
    cta: "Start for free",
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For small teams that ship every week.",
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
]

/** Yearly billing is two months free: 10 months charged out of 12. */
export const YEARLY_MONTHS_CHARGED = 10

export function formatPrice(priceMonth: number, yearly: boolean): string {
  if (priceMonth === 0) return "$0"
  if (!yearly) return `$${priceMonth}`
  const perMonth = (priceMonth * YEARLY_MONTHS_CHARGED) / 12
  return `$${Number.isInteger(perMonth) ? perMonth : perMonth.toFixed(2)}`
}

export function formatYearlyTotal(priceMonth: number): string {
  return `$${priceMonth * YEARLY_MONTHS_CHARGED}`
}

export type ComparisonValue = string | boolean

export interface ComparisonRow {
  feature: string
  free: ComparisonValue
  team: ComparisonValue
  business: ComparisonValue
}

export const comparison: ComparisonRow[] = [
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  {
    feature: "History",
    free: "7 days",
    team: "1 year",
    business: "Unlimited",
  },
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "Weekly digest", free: true, team: true, business: true },
  { feature: "SSO", free: false, team: false, business: true },
  { feature: "Audit log", free: false, team: false, business: true },
  {
    feature: "Support",
    free: "Community",
    team: "Email",
    business: "Priority",
  },
]

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
]
```

```tsx components/site-header.tsx
"use client"

import NextLink from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { LuMenu, LuX } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { brand, navItems } from "@/lib/data"

function isActive(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) return false
  return pathname === href
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <Container maxW="6xl">
        <Flex h="16" align="center" justify="space-between" gap="4">
          <Link
            asChild
            fontFamily="heading"
            fontSize="2xl"
            fontWeight="bold"
            color="fg"
            letterSpacing="tight"
            _hover={{ textDecoration: "none", color: "brand.fg" }}
          >
            <NextLink href="/" aria-label={`${brand.name} home`}>
              {brand.name}
            </NextLink>
          </Link>

          <HStack as="nav" aria-label="Main" gap="7" display={{ base: "none", md: "flex" }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                asChild
                color={isActive(pathname, item.href) ? "fg" : "fg.muted"}
                fontWeight="medium"
                textStyle="sm"
                _hover={{ color: "fg", textDecoration: "none" }}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                <NextLink href={item.href}>{item.label}</NextLink>
              </Link>
            ))}
          </HStack>

          <HStack gap="2">
            <ColorModeButton />
            <IconButton
              display={{ base: "inline-flex", md: "none" }}
              variant="ghost"
              size="sm"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <LuX /> : <LuMenu />}
            </IconButton>
          </HStack>
        </Flex>

        {open && (
          <Stack
            as="nav"
            id="mobile-nav"
            aria-label="Mobile"
            display={{ base: "flex", md: "none" }}
            gap="1"
            pb="4"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                asChild
                py="2"
                color="fg"
                fontWeight="medium"
                _hover={{ textDecoration: "none", color: "brand.fg" }}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                <NextLink href={item.href} onClick={() => setOpen(false)}>
                  <Text as="span">{item.label}</Text>
                </NextLink>
              </Link>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
```

```tsx components/site-footer.tsx
import NextLink from "next/link"
import { Box, Container, Flex, HStack, Link, Stack, Text } from "@chakra-ui/react"
import { brand, navItems } from "@/lib/data"

export function SiteFooter() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border" bg="bg.subtle">
      <Container maxW="6xl" py={{ base: "10", md: "12" }}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap="8"
        >
          <Stack gap="3" maxW="sm">
            <Text fontFamily="heading" fontSize="xl" fontWeight="bold">
              {brand.name}
            </Text>
            <Text color="fg.muted" textStyle="sm">
              {brand.description}
            </Text>
          </Stack>
          <HStack as="nav" aria-label="Footer" gap="6" wrap="wrap" align="flex-start">
            {navItems.map((item) => (
              <Link
                key={item.href}
                asChild
                color="fg.muted"
                textStyle="sm"
                _hover={{ color: "fg", textDecoration: "none" }}
              >
                <NextLink href={item.href}>{item.label}</NextLink>
              </Link>
            ))}
          </HStack>
        </Flex>
        <Text color="fg.subtle" textStyle="xs" mt="10">
          © {new Date().getFullYear()} {brand.name}. Data hosted in the EU,
          encrypted at rest.
        </Text>
      </Container>
    </Box>
  )
}
```

```tsx components/site-shell.tsx
import { Box, SkipNavContent, SkipNavLink } from "@chakra-ui/react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" display="flex" flexDirection="column">
      <SkipNavLink>Skip to content</SkipNavLink>
      <SiteHeader />
      <Box as="main" flex="1">
        <SkipNavContent />
        {children}
      </Box>
      <SiteFooter />
    </Box>
  )
}
```

```tsx app/page.tsx
import NextLink from "next/link"
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  List,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuArrowRight, LuCheck } from "react-icons/lu"
import { SiteShell } from "@/components/site-shell"
import { brand, features, logos } from "@/lib/data"

export default function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Box as="section" aria-labelledby="hero-title">
        <Container maxW="4xl" py={{ base: "16", md: "28" }}>
          <Stack gap="8" align="center" textAlign="center">
            <Text
              textStyle="sm"
              fontWeight="semibold"
              color="brand.fg"
              textTransform="uppercase"
              letterSpacing="widest"
            >
              {brand.name}
            </Text>
            <Heading
              as="h1"
              id="hero-title"
              fontFamily="heading"
              fontSize={{ base: "4xl", md: "6xl" }}
              lineHeight="1.1"
              letterSpacing="tight"
            >
              {brand.tagline}
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "xl" }} maxW="2xl">
              {brand.description} See what changed, file what broke, and keep
              the whole team looking at the same page.
            </Text>
            <Flex gap="3" wrap="wrap" justify="center">
              <Button asChild size="lg">
                <NextLink href="/pricing">
                  Start free <LuArrowRight />
                </NextLink>
              </Button>
              <Button asChild size="lg" variant="outline" colorPalette="gray">
                <NextLink href="/#features">See how it works</NextLink>
              </Button>
            </Flex>
          </Stack>
        </Container>
      </Box>

      {/* Customer logos */}
      <Box
        as="section"
        id="customers"
        aria-labelledby="customers-title"
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        <Container maxW="6xl" py="10">
          <Text
            id="customers-title"
            textAlign="center"
            color="fg.muted"
            textStyle="sm"
            mb="6"
          >
            Trusted by small teams that ship every week
          </Text>
          <List.Root
            as="ul"
            listStyle="none"
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            columnGap={{ base: "6", md: "12" }}
            rowGap="4"
            m="0"
            p="0"
          >
            {logos.map((logo) => (
              <List.Item
                key={logo}
                fontFamily="heading"
                fontSize={{ base: "lg", md: "2xl" }}
                fontWeight="bold"
                color="fg.muted"
                letterSpacing="tight"
              >
                {logo}
              </List.Item>
            ))}
          </List.Root>
        </Container>
      </Box>

      {/* Features */}
      <Box as="section" id="features" aria-labelledby="features-title">
        <Container maxW="6xl" py={{ base: "16", md: "24" }}>
          <Stack gap={{ base: "14", md: "20" }}>
            <Heading
              as="h2"
              id="features-title"
              fontFamily="heading"
              fontSize={{ base: "3xl", md: "4xl" }}
              textAlign="center"
              letterSpacing="tight"
            >
              Everything a small team needs, nothing it doesn&apos;t
            </Heading>
            {features.map((feature, index) => (
              <SimpleGrid
                key={feature.title}
                columns={{ base: 1, md: 2 }}
                gap={{ base: "6", md: "16" }}
                alignItems="center"
              >
                <Stack
                  gap="4"
                  order={{ base: 0, md: index % 2 === 1 ? 2 : 0 }}
                >
                  <Text
                    textStyle="sm"
                    fontWeight="semibold"
                    color="brand.fg"
                    textTransform="uppercase"
                    letterSpacing="widest"
                  >
                    {feature.eyebrow}
                  </Text>
                  <Heading
                    as="h3"
                    fontFamily="heading"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    letterSpacing="tight"
                  >
                    {feature.title}
                  </Heading>
                  <Text color="fg.muted" fontSize="lg">
                    {feature.body}
                  </Text>
                </Stack>
                <Box
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.panel"
                  rounded="l3"
                  p={{ base: "5", md: "8" }}
                >
                  <List.Root gap="4" variant="plain">
                    {feature.points.map((point) => (
                      <List.Item key={point} alignItems="flex-start">
                        <List.Indicator color="brand.fg" mt="1">
                          <LuCheck />
                        </List.Indicator>
                        {point}
                      </List.Item>
                    ))}
                  </List.Root>
                </Box>
              </SimpleGrid>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Closing call to action */}
      <Box as="section" aria-labelledby="cta-title" bg="bg.subtle" borderTopWidth="1px" borderColor="border">
        <Container maxW="3xl" py={{ base: "14", md: "20" }}>
          <Stack gap="5" align="center" textAlign="center">
            <Heading
              as="h2"
              id="cta-title"
              fontFamily="heading"
              fontSize={{ base: "2xl", md: "4xl" }}
              letterSpacing="tight"
            >
              Read your product again
            </Heading>
            <Text color="fg.muted" fontSize="lg">
              Free for one seat, $12 per seat for the whole team.
            </Text>
            <Button asChild size="lg">
              <NextLink href="/pricing">Compare plans</NextLink>
            </Button>
          </Stack>
        </Container>
      </Box>
    </SiteShell>
  )
}
```

```tsx components/pricing-view.tsx
"use client"

import NextLink from "next/link"
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Heading,
  HStack,
  List,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  Accordion,
  Span,
} from "@chakra-ui/react"
import { useId, useState } from "react"
import { LuCheck, LuMinus } from "react-icons/lu"
import {
  comparison,
  faq,
  formatPrice,
  formatYearlyTotal,
  plans,
  type ComparisonValue,
} from "@/lib/data"

function Cell({ value }: { value: ComparisonValue }) {
  if (value === true) {
    return (
      <>
        <Box as="span" color="brand.fg" aria-hidden="true" display="inline-flex">
          <LuCheck />
        </Box>
        <Span srOnly>Included</Span>
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <Box as="span" color="fg.subtle" aria-hidden="true" display="inline-flex">
          <LuMinus />
        </Box>
        <Span srOnly>Not included</Span>
      </>
    )
  }
  return <>{value}</>
}

export function PricingView() {
  const [yearly, setYearly] = useState(false)
  const switchId = useId()

  return (
    <>
      <Box as="section" aria-labelledby="pricing-title">
        <Container maxW="6xl" py={{ base: "12", md: "20" }}>
          <Stack gap="5" align="center" textAlign="center" mb="10">
            <Heading
              as="h1"
              id="pricing-title"
              fontFamily="heading"
              fontSize={{ base: "4xl", md: "5xl" }}
              letterSpacing="tight"
            >
              Simple pricing for small teams
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }} maxW="xl">
              Start free. Pay per seat when your team grows. Switch to yearly
              billing and get two months free.
            </Text>

            <HStack gap="3">
              <Text
                as="span"
                id={`${switchId}-monthly`}
                fontWeight={yearly ? "normal" : "semibold"}
                color={yearly ? "fg.muted" : "fg"}
              >
                Monthly
              </Text>
              <Switch.Root
                checked={yearly}
                onCheckedChange={(e) => setYearly(e.checked)}
                aria-label="Bill yearly"
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
              <Text
                as="span"
                id={`${switchId}-yearly`}
                fontWeight={yearly ? "semibold" : "normal"}
                color={yearly ? "fg" : "fg.muted"}
              >
                Yearly
              </Text>
              <Badge colorPalette="brand" variant="subtle">
                2 months free
              </Badge>
            </HStack>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="6" alignItems="stretch">
            {plans.map((plan) => {
              const highlighted = plan.highlight === true
              const free = plan.priceMonth === 0
              return (
                <Card.Root
                  key={plan.name}
                  variant="outline"
                  borderWidth={highlighted ? "2px" : "1px"}
                  borderColor={highlighted ? "brand.solid" : "border"}
                  bg={highlighted ? "brand.subtle" : "bg.panel"}
                  position="relative"
                >
                  <Card.Header>
                    <HStack justify="space-between" align="center">
                      <Card.Title
                        as="h2"
                        fontFamily="heading"
                        fontSize="2xl"
                      >
                        {plan.name}
                      </Card.Title>
                      {highlighted && (
                        <Badge colorPalette="brand" variant="solid">
                          Most popular
                        </Badge>
                      )}
                    </HStack>
                    <Card.Description>{plan.blurb}</Card.Description>
                  </Card.Header>
                  <Card.Body gap="5">
                    <Box>
                      <HStack align="baseline" gap="2">
                        <Text
                          fontFamily="heading"
                          fontSize="5xl"
                          fontWeight="bold"
                          lineHeight="1"
                        >
                          {formatPrice(plan.priceMonth, yearly)}
                        </Text>
                        <Text color="fg.muted" textStyle="sm">
                          {free ? "forever" : `/ month, ${plan.seats}`}
                        </Text>
                      </HStack>
                      <Text color="fg.muted" textStyle="sm" mt="2" minH="5">
                        {free
                          ? plan.seats
                          : yearly
                            ? `${formatYearlyTotal(plan.priceMonth)} per seat, billed yearly`
                            : "Billed monthly"}
                      </Text>
                    </Box>
                    <List.Root gap="3" variant="plain">
                      {plan.features.map((feature) => (
                        <List.Item key={feature} alignItems="flex-start">
                          <List.Indicator color="brand.fg" mt="1">
                            <LuCheck />
                          </List.Indicator>
                          {feature}
                        </List.Item>
                      ))}
                    </List.Root>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      asChild
                      w="full"
                      variant={highlighted ? "solid" : "outline"}
                      colorPalette={highlighted ? "brand" : "gray"}
                    >
                      <NextLink href="/pricing">{plan.cta}</NextLink>
                    </Button>
                  </Card.Footer>
                </Card.Root>
              )
            })}
          </SimpleGrid>
        </Container>
      </Box>

      <Box as="section" aria-labelledby="compare-title" bg="bg.subtle" borderTopWidth="1px" borderBottomWidth="1px" borderColor="border">
        <Container maxW="5xl" py={{ base: "12", md: "20" }}>
          <Heading
            as="h2"
            id="compare-title"
            fontFamily="heading"
            fontSize={{ base: "2xl", md: "4xl" }}
            textAlign="center"
            letterSpacing="tight"
            mb="8"
          >
            Compare plans
          </Heading>
          <Table.ScrollArea
            borderWidth="1px"
            borderColor="border"
            rounded="l3"
            bg="bg.panel"
          >
            <Table.Root size="md" minW="560px">
              <Table.Caption srOnly>
                Feature comparison of the Free, Team and Business plans
              </Table.Caption>
              <Table.Header>
                <Table.Row bg="bg.panel">
                  <Table.ColumnHeader scope="col">Feature</Table.ColumnHeader>
                  {plans.map((plan) => (
                    <Table.ColumnHeader
                      key={plan.name}
                      scope="col"
                      textAlign="center"
                      color={plan.highlight ? "brand.fg" : undefined}
                    >
                      {plan.name}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {comparison.map((row) => (
                  <Table.Row key={row.feature} bg="bg.panel">
                    <Table.Cell as="th" scope="row" fontWeight="medium" textAlign="start">
                      {row.feature}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Cell value={row.free} />
                    </Table.Cell>
                    <Table.Cell textAlign="center" bg="brand.subtle">
                      <Cell value={row.team} />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Cell value={row.business} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Container>
      </Box>

      <Box as="section" aria-labelledby="faq-title">
        <Container maxW="3xl" py={{ base: "12", md: "20" }}>
          <Heading
            as="h2"
            id="faq-title"
            fontFamily="heading"
            fontSize={{ base: "2xl", md: "4xl" }}
            textAlign="center"
            letterSpacing="tight"
            mb="8"
          >
            Frequently asked questions
          </Heading>
          <Accordion.Root collapsible defaultValue={[faq[0].q]}>
            {faq.map((item) => (
              <Accordion.Item key={item.q} value={item.q}>
                <Accordion.ItemTrigger>
                  <Span flex="1" fontWeight="medium">
                    {item.q}
                  </Span>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody color="fg.muted">
                    {item.a}
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Container>
      </Box>
    </>
  )
}
```

```tsx app/pricing/page.tsx
import type { Metadata } from "next"
import { SiteShell } from "@/components/site-shell"
import { PricingView } from "@/components/pricing-view"

export const metadata: Metadata = {
  title: "Pricing | Lumen",
  description:
    "Lumen pricing: Free, Team and Business plans, with two months free on yearly billing.",
}

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingView />
    </SiteShell>
  )
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Lumen | Product analytics and issue tracking for small teams",
  description:
    "Product analytics and issue tracking that small teams actually read.",
};

// Official Next.js App Router setup: the CLI's Provider snippet (ChakraProvider
// with the Lumen system + next-themes color mode, dark by default), the Toaster
// snippet, and the guide's EmotionRegistry (useServerInsertedHTML), without which
// Next 16 production builds fail hydration (React #418) on every page.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            {children}
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```