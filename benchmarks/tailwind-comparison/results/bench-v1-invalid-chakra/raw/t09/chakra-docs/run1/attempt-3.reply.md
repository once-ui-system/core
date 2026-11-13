The type error comes from `Box as="a" href=...`, because `Box` is typed as a div and has no `href`. I'll use `chakra.a` for the skip link. Using `ChakraLink` would also work, but `chakra.a` keeps the link unstyled by the theme's link rules. I'm leaving every other file as it was.

```tsx components/site/site-shell.tsx
import { Box, chakra, Flex } from "@chakra-ui/react"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" minH="100dvh" bg="bg" color="fg">
      <chakra.a
        href="#main-content"
        position="absolute"
        left="2"
        top="2"
        zIndex="max"
        px="4"
        py="2"
        bg="brand.solid"
        color="brand.contrast"
        borderRadius="l2"
        fontWeight="medium"
        transform="translateY(-200%)"
        _focusVisible={{ transform: "translateY(0)" }}
      >
        Skip to content
      </chakra.a>
      <SiteHeader />
      <Box as="main" id="main-content" tabIndex={-1} flex="1" outline="none">
        {children}
      </Box>
      <SiteFooter />
    </Flex>
  )
}
```

```tsx components/site/site-header.tsx
"use client"

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link as ChakraLink,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuMenu } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { brand, navLinks } from "@/lib/data"

export function SiteHeader() {
  const pathname = usePathname()

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
          <ChakraLink
            asChild
            fontFamily="heading"
            fontSize="2xl"
            fontWeight="bold"
            letterSpacing="tight"
            color="fg"
            _hover={{ textDecoration: "none", color: "brand.fg" }}
          >
            <NextLink href="/" aria-label={`${brand.name} home`}>
              {brand.name}
              <Box as="span" color="brand.solid" aria-hidden="true">
                .
              </Box>
            </NextLink>
          </ChakraLink>

          <HStack
            as="nav"
            aria-label="Primary"
            gap="6"
            display={{ base: "none", md: "flex" }}
          >
            {navLinks.map((link) => {
              const active = link.href === pathname
              return (
                <ChakraLink
                  key={link.href}
                  asChild
                  fontSize="sm"
                  fontWeight="medium"
                  color={active ? "brand.fg" : "fg.muted"}
                  _hover={{ color: "fg", textDecoration: "none" }}
                >
                  <NextLink
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </NextLink>
                </ChakraLink>
              )
            })}
          </HStack>

          <HStack gap="2">
            <Button
              asChild
              size="sm"
              display={{ base: "none", sm: "inline-flex" }}
            >
              <NextLink href="/pricing">Start free</NextLink>
            </Button>
            <ColorModeButton />

            <Box
              as="details"
              position="relative"
              display={{ base: "block", md: "none" }}
              css={{
                "& > summary": { listStyle: "none" },
                "& > summary::-webkit-details-marker": { display: "none" },
              }}
            >
              <Box
                as="summary"
                aria-label="Open navigation menu"
                cursor="pointer"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxSize="8"
                borderRadius="l2"
                _hover={{ bg: "bg.muted" }}
                _focusVisible={{
                  outline: "2px solid",
                  outlineColor: "brand.focusRing",
                }}
              >
                <LuMenu aria-hidden="true" />
              </Box>
              <Box
                as="nav"
                aria-label="Mobile"
                position="absolute"
                right="0"
                top="10"
                minW="44"
                py="1"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                borderRadius="l2"
                shadow="md"
              >
                {navLinks.map((link) => (
                  <ChakraLink
                    key={link.href}
                    asChild
                    display="block"
                    px="4"
                    py="2"
                    fontSize="sm"
                    color="fg"
                    _hover={{ bg: "bg.muted", textDecoration: "none" }}
                  >
                    <NextLink href={link.href}>{link.label}</NextLink>
                  </ChakraLink>
                ))}
              </Box>
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
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
  const { toggleColorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="9" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
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

```tsx components/ui/provider.tsx
"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { system } from "@/lib/theme"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
```

```tsx app/layout.tsx
import type { Metadata } from "next"
import { Provider } from "@/components/ui/provider"

export const metadata: Metadata = {
  title: "Lumen — product analytics and issue tracking for small teams",
  description:
    "Product analytics and issue tracking that small teams actually read.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
```

```ts lib/data.ts
export interface Plan {
  name: string
  priceMonth: number
  seats: string
  features: string[]
  highlight?: boolean
  blurb: string
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

export const brand = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking that small teams actually read",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
}

export const navLinks = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/pricing#faq" },
]

export const logos = [
  "Acme Labs",
  "Northwind Studio",
  "Hooli",
  "Globex",
  "Initech",
]

export const features: Feature[] = [
  {
    eyebrow: "Analytics",
    title: "Numbers your whole team will open on Monday",
    body: "Lumen turns raw events into one short weekly page: what grew, what broke and what is worth your attention. No dashboards to assemble, no query language to learn.",
    points: [
      "A plain-language summary of every release",
      "Funnels and retention without a data team",
      "Events stay in the EU, encrypted at rest",
    ],
  },
  {
    eyebrow: "Issue tracking",
    title: "Bugs are filed from the data that revealed them",
    body: "When a metric drops, open an issue from the chart itself. The graph, the affected cohort and the release are attached for you, so whoever picks it up starts with context.",
    points: [
      "One click from a chart to a ready-made issue",
      "Cohort and release attached automatically",
      "A lightweight board that fits teams of three to thirty",
    ],
  },
  {
    eyebrow: "Small teams",
    title: "Built to be read, not administered",
    body: "Lumen keeps the surface area small on purpose. Setup takes an afternoon, permissions are three roles, and the weekly digest lands where your team already talks.",
    points: [
      "Single sign-on and audit log when you grow into them",
      "Digest by email or in your chat tool",
      "Priority support on the Business plan",
    ],
  },
]

export const plans: Plan[] = [
  {
    name: "Free",
    priceMonth: 0,
    seats: "1 seat",
    blurb: "For a side project or a first look.",
    cta: "Start for free",
    features: ["1 project", "7-day history", "Community support"],
  },
  {
    name: "Team",
    priceMonth: 12,
    seats: "per seat",
    blurb: "For product teams shipping every week.",
    cta: "Start a Team trial",
    highlight: true,
    features: [
      "Unlimited projects",
      "1-year history",
      "Issue tracker",
      "Email support",
    ],
  },
  {
    name: "Business",
    priceMonth: 29,
    seats: "per seat",
    blurb: "For teams with security and audit needs.",
    cta: "Talk to sales",
    features: [
      "Everything in Team",
      "SSO and audit log",
      "Unlimited history",
      "Priority support",
    ],
  },
]

/** Yearly billing is two months free: 10 months are charged. */
export const YEARLY_MONTHS_CHARGED = 10

export function yearlyTotal(priceMonth: number): number {
  return priceMonth * YEARLY_MONTHS_CHARGED
}

export function yearlyPerMonth(priceMonth: number): number {
  return Math.round((yearlyTotal(priceMonth) / 12) * 100) / 100
}

export function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`
}

export interface ComparisonRow {
  feature: string
  free: string | boolean
  team: string | boolean
  business: string | boolean
}

export const comparison: ComparisonRow[] = [
  { feature: "Projects", free: "1", team: "Unlimited", business: "Unlimited" },
  { feature: "Seats", free: "1", team: "Per seat", business: "Per seat" },
  {
    feature: "History",
    free: "7 days",
    team: "1 year",
    business: "Unlimited",
  },
  { feature: "Issue tracker", free: false, team: true, business: true },
  { feature: "SSO and audit log", free: false, team: false, business: true },
  {
    feature: "Support",
    free: "Community",
    team: "Email",
    business: "Priority",
  },
  { feature: "EU data storage", free: true, team: true, business: true },
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

```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Lumen design system.
 *
 * - brand colour #E8590C is the primary colour: buttons, links, focus rings
 * - warm stone-grey replaces the default neutral scale
 * - 4px corner radius on buttons, inputs, cards and menus
 * - Georgia headings, system sans body (both system fonts, nothing loaded)
 *
 * Chakra components default to the `gray` palette for their solid fills and
 * focus rings, so the `gray` palette's interactive semantic tokens are pointed
 * at the brand colour while its raw scale stays warm stone grey.
 */
const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "gray",
    },
    body: {
      bg: "bg",
      color: "fg",
    },
    "a:not([class])": {
      color: "brand.fg",
    },
    "*::selection": {
      bg: "brand.muted",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      radii: {
        // 4px on buttons, inputs, cards and menus (they use l1/l2/l3, sm, md)
        xs: { value: "4px" },
        sm: { value: "4px" },
        md: { value: "4px" },
        lg: { value: "4px" },
        l1: { value: "4px" },
        l2: { value: "4px" },
        l3: { value: "4px" },
      },
      colors: {
        brand: {
          50: { value: "#FFF4EC" },
          100: { value: "#FFE5D1" },
          200: { value: "#FFC9A1" },
          300: { value: "#FFA666" },
          400: { value: "#F57F33" },
          500: { value: "#E8590C" },
          600: { value: "#C94A08" },
          700: { value: "#A23B09" },
          800: { value: "#7C2E0C" },
          900: { value: "#5A230C" },
          950: { value: "#331205" },
        },
        // warm stone grey
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
    },
    semanticTokens: {
      colors: {
        // page surfaces and text
        bg: {
          DEFAULT: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
          subtle: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          muted: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          emphasized: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
          inverted: {
            value: { _light: "{colors.gray.950}", _dark: "{colors.gray.50}" },
          },
          panel: {
            value: { _light: "white", _dark: "{colors.gray.900}" },
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: "{colors.gray.950}", _dark: "{colors.gray.50}" },
          },
          muted: {
            value: { _light: "{colors.gray.600}", _dark: "{colors.gray.400}" },
          },
          subtle: {
            value: { _light: "{colors.gray.500}", _dark: "{colors.gray.500}" },
          },
          inverted: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
        },
        border: {
          DEFAULT: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          subtle: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
          emphasized: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
        },

        // brand palette (usable as colorPalette="brand")
        brand: {
          contrast: { value: "white" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          subtle: {
            value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" },
          },
          muted: {
            value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" },
          },
          emphasized: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
          },
          solid: { value: "{colors.brand.500}" },
          focusRing: { value: "{colors.brand.500}" },
          border: {
            value: { _light: "{colors.brand.500}", _dark: "{colors.brand.400}" },
          },
        },

        // gray palette: neutral scale stays stone, interactive tokens go brand
        gray: {
          contrast: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
          fg: {
            value: { _light: "{colors.gray.800}", _dark: "{colors.gray.100}" },
          },
          subtle: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          muted: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          emphasized: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
          solid: { value: "{colors.brand.500}" },
          focusRing: { value: "{colors.brand.500}" },
          border: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
        },
      },
    },
    recipes: {
      button: {
        variants: {
          variant: {
            solid: {
              bg: "brand.solid",
              color: "brand.contrast",
              _hover: { bg: "brand.600" },
              _expanded: { bg: "brand.600" },
            },
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
```

```tsx components/site/site-footer.tsx
import {
  Box,
  Container,
  Flex,
  HStack,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { brand, navLinks } from "@/lib/data"

export function SiteFooter() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="border"
      bg="bg.subtle"
      mt="20"
    >
      <Container maxW="6xl" py="10">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap="6"
        >
          <Box maxW="sm">
            <Text
              fontFamily="heading"
              fontSize="xl"
              fontWeight="bold"
              letterSpacing="tight"
            >
              {brand.name}
              <Box as="span" color="brand.solid" aria-hidden="true">
                .
              </Box>
            </Text>
            <Text mt="2" fontSize="sm" color="fg.muted">
              {brand.description}
            </Text>
          </Box>

          <HStack
            as="nav"
            aria-label="Footer"
            gap="6"
            align="flex-start"
            wrap="wrap"
          >
            {navLinks.map((link) => (
              <ChakraLink
                key={link.href}
                asChild
                fontSize="sm"
                color="fg.muted"
                _hover={{ color: "brand.fg" }}
              >
                <NextLink href={link.href}>{link.label}</NextLink>
              </ChakraLink>
            ))}
          </HStack>
        </Flex>

        <Text mt="8" fontSize="xs" color="fg.subtle">
          © 2025 {brand.name}. Your data is stored in the EU and encrypted at
          rest.
        </Text>
      </Container>
    </Box>
  )
}
```

```tsx components/site/hero.tsx
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { LuArrowRight } from "react-icons/lu"
import { brand } from "@/lib/data"

export function Hero() {
  return (
    <Box
      as="section"
      aria-labelledby="hero-title"
      borderBottomWidth="1px"
      borderColor="border"
      bgGradient="to-b"
      gradientFrom="brand.subtle"
      gradientTo="bg"
    >
      <Container maxW="4xl" py={{ base: "16", md: "28" }}>
        <Stack gap="8" align="center" textAlign="center">
          <Badge
            colorPalette="brand"
            variant="subtle"
            size="lg"
            bg="brand.subtle"
            color="brand.fg"
          >
            For small software teams
          </Badge>
          <Heading
            as="h1"
            id="hero-title"
            fontSize={{ base: "4xl", md: "6xl" }}
            lineHeight="1.1"
            letterSpacing="tight"
          >
            {brand.tagline}
          </Heading>
          <Text fontSize={{ base: "md", md: "xl" }} color="fg.muted" maxW="2xl">
            Lumen turns your product events into one short weekly page, and lets
            you file the bug straight from the chart that revealed it.
          </Text>
          <HStack gap="3" wrap="wrap" justify="center">
            <Button asChild size="lg">
              <NextLink href="/pricing">
                Start for free <LuArrowRight />
              </NextLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <NextLink href="/#product">See how it works</NextLink>
            </Button>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
```

```tsx components/site/logo-row.tsx
import { Box, Container, Flex, Text } from "@chakra-ui/react"
import { logos } from "@/lib/data"

export function LogoRow() {
  return (
    <Box as="section" aria-labelledby="logos-title" py="12">
      <Container maxW="6xl">
        <Text
          id="logos-title"
          textAlign="center"
          fontSize="sm"
          color="fg.muted"
          mb="6"
        >
          Trusted by small teams who ship every week
        </Text>
        <Flex
          as="ul"
          listStyleType="none"
          m="0"
          p="0"
          wrap="wrap"
          justify="center"
          columnGap={{ base: "6", md: "12" }}
          rowGap="4"
        >
          {logos.map((name) => (
            <Box
              as="li"
              key={name}
              fontFamily="heading"
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="bold"
              letterSpacing="tight"
              color="fg.subtle"
            >
              {name}
            </Box>
          ))}
        </Flex>
      </Container>
    </Box>
  )
}
```

```tsx components/site/feature-sections.tsx
import {
  Box,
  Container,
  Grid,
  Heading,
  List,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuCheck } from "react-icons/lu"
import { features } from "@/lib/data"

export function FeatureSections() {
  return (
    <Box id="product" as="section" aria-labelledby="features-title" py="12">
      <Container maxW="6xl">
        <Heading
          id="features-title"
          as="h2"
          fontSize={{ base: "3xl", md: "4xl" }}
          letterSpacing="tight"
          textAlign="center"
          mb={{ base: "12", md: "20" }}
        >
          Everything a small team needs, nothing it doesn&apos;t
        </Heading>

        <Stack gap={{ base: "16", md: "24" }}>
          {features.map((feature, index) => (
            <Grid
              key={feature.title}
              as="article"
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={{ base: "6", md: "16" }}
              alignItems="center"
            >
              <Stack
                gap="4"
                order={{ base: 1, md: index % 2 === 0 ? 1 : 2 }}
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.fg"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  {feature.eyebrow}
                </Text>
                <Heading
                  as="h3"
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
                order={{ base: 2, md: index % 2 === 0 ? 2 : 1 }}
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                borderRadius="l2"
                p={{ base: "5", md: "8" }}
              >
                <List.Root
                  gap="4"
                  variant="plain"
                  aria-label={`${feature.eyebrow} highlights`}
                >
                  {feature.points.map((point) => (
                    <List.Item key={point} alignItems="flex-start">
                      <List.Indicator asChild color="brand.solid" mt="1">
                        <LuCheck />
                      </List.Indicator>
                      {point}
                    </List.Item>
                  ))}
                </List.Root>
              </Box>
            </Grid>
          ))}
        </Stack>
      </Container>
    </Box>
  )
}
```

```tsx app/page.tsx
import { FeatureSections } from "@/components/site/feature-sections"
import { Hero } from "@/components/site/hero"
import { LogoRow } from "@/components/site/logo-row"
import { SiteShell } from "@/components/site/site-shell"

export default function Page() {
  return (
    <SiteShell>
      <Hero />
      <LogoRow />
      <FeatureSections />
    </SiteShell>
  )
}
```

```tsx components/pricing/pricing-view.tsx
"use client"

import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Heading,
  HStack,
  List,
  Stack,
  Switch,
  Table,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { LuCheck, LuMinus } from "react-icons/lu"
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "@/components/ui/accordion"
import {
  comparison,
  faq,
  formatPrice,
  plans,
  yearlyPerMonth,
  yearlyTotal,
  type ComparisonRow,
} from "@/lib/data"

function Cell({ value, plan }: { value: string | boolean; plan: string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Box as="span" color="brand.fg" display="inline-flex">
        <LuCheck aria-hidden="true" />
        <Box as="span" srOnly>
          Included in {plan}
        </Box>
      </Box>
    ) : (
      <Box as="span" color="fg.subtle" display="inline-flex">
        <LuMinus aria-hidden="true" />
        <Box as="span" srOnly>
          Not included in {plan}
        </Box>
      </Box>
    )
  }
  return <>{value}</>
}

function rowValues(row: ComparisonRow) {
  return [
    { plan: "Free", value: row.free },
    { plan: "Team", value: row.team },
    { plan: "Business", value: row.business },
  ]
}

export function PricingView() {
  const [yearly, setYearly] = useState(false)

  return (
    <>
      <Box
        as="section"
        aria-labelledby="pricing-title"
        borderBottomWidth="1px"
        borderColor="border"
        bgGradient="to-b"
        gradientFrom="brand.subtle"
        gradientTo="bg"
      >
        <Container maxW="4xl" py={{ base: "14", md: "20" }}>
          <Stack gap="6" align="center" textAlign="center">
            <Heading
              as="h1"
              id="pricing-title"
              fontSize={{ base: "4xl", md: "5xl" }}
              letterSpacing="tight"
            >
              Simple pricing for small teams
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }} maxW="xl">
              Start free, move to Team when you ship together, and add SSO and
              audit logs on Business.
            </Text>

            <Switch.Root
              checked={yearly}
              onCheckedChange={(e) => setYearly(e.checked)}
              size="lg"
            >
              <Switch.HiddenInput aria-label="Bill yearly" />
              <Text
                as="span"
                fontWeight={yearly ? "normal" : "semibold"}
                color={yearly ? "fg.muted" : "fg"}
              >
                Monthly
              </Text>
              <Switch.Control mx="3">
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Label>
                <Text
                  as="span"
                  fontWeight={yearly ? "semibold" : "normal"}
                  color={yearly ? "fg" : "fg.muted"}
                >
                  Yearly
                </Text>
                <Badge ms="2" bg="brand.subtle" color="brand.fg">
                  2 months free
                </Badge>
              </Switch.Label>
            </Switch.Root>
          </Stack>
        </Container>
      </Box>

      <Container maxW="6xl" py={{ base: "10", md: "16" }}>
        <Grid
          as="ul"
          listStyleType="none"
          m="0"
          p="0"
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap="6"
          alignItems="stretch"
        >
          {plans.map((plan) => {
            const price = yearly
              ? yearlyPerMonth(plan.priceMonth)
              : plan.priceMonth
            return (
              <Box as="li" key={plan.name} display="flex">
                <Card.Root
                  w="full"
                  variant="outline"
                  borderWidth={plan.highlight ? "2px" : "1px"}
                  borderColor={plan.highlight ? "brand.solid" : "border"}
                  bg="bg.panel"
                  position="relative"
                >
                  <Card.Header>
                    <HStack justify="space-between">
                      <Card.Title
                        as="h2"
                        fontFamily="heading"
                        fontSize="2xl"
                      >
                        {plan.name}
                      </Card.Title>
                      {plan.highlight && (
                        <Badge
                          bg="brand.solid"
                          color="brand.contrast"
                          variant="solid"
                        >
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
                          aria-label={`${formatPrice(price)} per month`}
                        >
                          {formatPrice(price)}
                        </Text>
                        <Text color="fg.muted" fontSize="sm">
                          {plan.priceMonth === 0
                            ? "forever"
                            : `/ month, ${plan.seats}`}
                        </Text>
                      </HStack>
                      <Text color="fg.muted" fontSize="sm" mt="2" minH="5">
                        {plan.priceMonth === 0
                          ? plan.seats
                          : yearly
                            ? `Billed ${formatPrice(yearlyTotal(plan.priceMonth))} per seat yearly`
                            : "Billed monthly"}
                      </Text>
                    </Box>
                    <List.Root
                      variant="plain"
                      gap="3"
                      aria-label={`${plan.name} features`}
                    >
                      {plan.features.map((feature) => (
                        <List.Item key={feature} alignItems="flex-start">
                          <List.Indicator asChild color="brand.solid" mt="1">
                            <LuCheck />
                          </List.Indicator>
                          {feature}
                        </List.Item>
                      ))}
                    </List.Root>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      w="full"
                      variant={plan.highlight ? "solid" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Card.Footer>
                </Card.Root>
              </Box>
            )
          })}
        </Grid>

        <Box as="section" aria-labelledby="compare-title" mt={{ base: "16", md: "24" }}>
          <Heading
            as="h2"
            id="compare-title"
            fontSize={{ base: "2xl", md: "3xl" }}
            letterSpacing="tight"
            mb="6"
          >
            Compare plans
          </Heading>
          <Table.ScrollArea
            borderWidth="1px"
            borderColor="border"
            borderRadius="l2"
          >
            <Table.Root size="md" minW="xl">
              <Table.Caption srOnly>
                Feature comparison of the Free, Team and Business plans
              </Table.Caption>
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader scope="col">Feature</Table.ColumnHeader>
                  <Table.ColumnHeader scope="col">Free</Table.ColumnHeader>
                  <Table.ColumnHeader
                    scope="col"
                    color="brand.fg"
                  >
                    Team
                  </Table.ColumnHeader>
                  <Table.ColumnHeader scope="col">Business</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {comparison.map((row) => (
                  <Table.Row key={row.feature}>
                    <Table.Cell as="th" scope="row" fontWeight="medium" textAlign="start">
                      {row.feature}
                    </Table.Cell>
                    {rowValues(row).map(({ plan, value }) => (
                      <Table.Cell
                        key={plan}
                        bg={plan === "Team" ? "brand.subtle" : undefined}
                      >
                        <Cell value={value} plan={plan} />
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>

        <Box
          id="faq"
          as="section"
          aria-labelledby="faq-title"
          mt={{ base: "16", md: "24" }}
          maxW="3xl"
          mx="auto"
          scrollMarginTop="24"
        >
          <Heading
            as="h2"
            id="faq-title"
            fontSize={{ base: "2xl", md: "3xl" }}
            letterSpacing="tight"
            mb="6"
          >
            Frequently asked questions
          </Heading>
          <AccordionRoot collapsible defaultValue={[faq[0].q]}>
            {faq.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionItemTrigger fontWeight="medium">
                  {item.q}
                </AccordionItemTrigger>
                <AccordionItemContent color="fg.muted">
                  {item.a}
                </AccordionItemContent>
              </AccordionItem>
            ))}
          </AccordionRoot>
        </Box>
      </Container>
    </>
  )
}
```

```tsx app/pricing/page.tsx
import type { Metadata } from "next"
import { PricingView } from "@/components/pricing/pricing-view"
import { SiteShell } from "@/components/site/site-shell"

export const metadata: Metadata = {
  title: "Pricing — Lumen",
  description:
    "Free, Team and Business plans for product analytics and issue tracking. Yearly billing includes two months free.",
}

export default function PricingPage() {
  return (
    <SiteShell>
      <PricingView />
    </SiteShell>
  )
}
```