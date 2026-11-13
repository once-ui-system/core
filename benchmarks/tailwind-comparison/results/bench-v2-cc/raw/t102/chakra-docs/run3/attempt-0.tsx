```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Lumen's visual identity, carried by the design system itself: brand and sand
// colour tokens, 16px radii, rounded heading font, and a brand colour palette
// that every component (buttons, links, focus rings) picks up by default.
const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "brand",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
        },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#fdf2f8" },
          100: { value: "#fce7f3" },
          200: { value: "#fbcfe8" },
          300: { value: "#f9a8d4" },
          400: { value: "#f472b6" },
          500: { value: "#ec4899" },
          600: { value: "#db2777" },
          700: { value: "#be185d" },
          800: { value: "#9d174d" },
          900: { value: "#831843" },
          950: { value: "#500724" },
        },
        // Warm sand replaces the cool default neutrals.
        gray: {
          50: { value: "#fbf8f3" },
          100: { value: "#f5efe5" },
          200: { value: "#ebe2d2" },
          300: { value: "#dccfb8" },
          400: { value: "#b9aa8f" },
          500: { value: "#8f8069" },
          600: { value: "#6f6350" },
          700: { value: "#574d3e" },
          800: { value: "#3a3329" },
          900: { value: "#26211a" },
          950: { value: "#17130e" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
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
          focusRing: { value: "{colors.brand.600}" },
          border: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
          },
        },
        bg: {
          DEFAULT: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.950}" },
          },
        },
      },
      radii: {
        l1: { value: "12px" },
        l2: { value: "16px" },
        l3: { value: "16px" },
      },
    },
    recipes: {
      button: {
        defaultVariants: { size: "lg" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
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
      <ColorModeProvider
        defaultTheme="light"
        enableSystem={false}
        {...props}
      />
    </ChakraProvider>
  )
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Lumen",
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived"

export interface Project {
  key: string
  name: string
  status: ProjectStatus
  issues: number
  updated: string
}

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams"

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
}

export const projects: Project[] = [
  {
    key: "WEB",
    name: "Marketing site",
    status: "Active",
    issues: 12,
    updated: "2026-10-12",
  },
  {
    key: "APP",
    name: "Customer app",
    status: "Active",
    issues: 31,
    updated: "2026-10-14",
  },
  {
    key: "API",
    name: "Public API",
    status: "Active",
    issues: 9,
    updated: "2026-10-09",
  },
  {
    key: "MOB",
    name: "Mobile beta",
    status: "Paused",
    issues: 4,
    updated: "2026-09-28",
  },
  {
    key: "OPS",
    name: "Internal tools",
    status: "Archived",
    issues: 0,
    updated: "2026-08-30",
  },
]

export const statusPalette: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}
```

```tsx components/nav-config.tsx
import type { IconType } from "react-icons"
import { LuChartColumn, LuFileText, LuFolderKanban, LuSettings } from "react-icons/lu"

export interface NavItem {
  label: string
  href: string
  icon: IconType
  // Route that marks this item as current (anchors are never "current").
  route?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LuChartColumn, route: "/" },
      { label: "Reports", href: "/#reports", icon: LuFileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        label: "Projects",
        href: "/projects",
        icon: LuFolderKanban,
        route: "/projects",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: LuSettings,
        route: "/settings",
      },
    ],
  },
]

export function isCurrent(item: NavItem, pathname: string): boolean {
  if (!item.route) return false
  if (item.route === "/") return pathname === "/"
  return pathname === item.route || pathname.startsWith(`${item.route}/`)
}

export interface Crumb {
  label: string
  href?: string
}

export function crumbsFor(pathname: string): Crumb[] {
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }]
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }]
  }
  return [{ label: "Analytics" }, { label: "Overview" }]
}
```

```tsx components/sidebar-nav.tsx
"use client"

import { Box, Collapsible, HStack, Link, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuChevronDown } from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { isCurrent, navGroups, type NavItem } from "./nav-config"

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const current = isCurrent(item, pathname)
  const Icon = item.icon

  return (
    <Tooltip
      content={item.label}
      disabled={!collapsed}
      positioning={{ placement: "right" }}
      showArrow
    >
      <Link
        asChild
        variant="plain"
        aria-label={item.label}
        aria-current={current ? "page" : undefined}
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "flex-start"}
        gap="3"
        minH="12"
        px={collapsed ? "0" : "4"}
        borderRadius="l2"
        fontWeight="semibold"
        textDecoration="none"
        bg={current ? "brand.solid" : "transparent"}
        color={current ? "brand.contrast" : "fg"}
        _hover={{
          textDecoration: "none",
          bg: current ? "brand.solid" : "brand.muted",
          color: current ? "brand.contrast" : "brand.fg",
        }}
      >
        <NextLink href={item.href} onClick={onNavigate}>
          <Icon size={20} aria-hidden="true" />
          {!collapsed && <Text as="span">{item.label}</Text>}
        </NextLink>
      </Link>
    </Tooltip>
  )
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  return (
    <Box as="nav" aria-label="Main">
      <Stack as="ul" gap={collapsed ? "6" : "5"} listStyle="none" m="0" p="0">
        {navGroups.map((group) => (
          <Box as="li" key={group.label}>
            {collapsed ? (
              <Stack as="ul" gap="2" listStyle="none" m="0" p="0" aria-label={group.label}>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <NavLink item={item} collapsed onNavigate={onNavigate} />
                  </li>
                ))}
              </Stack>
            ) : (
              <Collapsible.Root defaultOpen>
                <Collapsible.Trigger
                  width="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  minH="10"
                  px="4"
                  borderRadius="l2"
                  cursor="pointer"
                  color="fg.muted"
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  _hover={{ color: "brand.fg" }}
                  css={{
                    "&[data-state=open] .chevron": { transform: "rotate(0deg)" },
                    "&[data-state=closed] .chevron": { transform: "rotate(-90deg)" },
                  }}
                >
                  <HStack gap="2">
                    <span>{group.label}</span>
                  </HStack>
                  <Box className="chevron" transition="transform 0.2s" display="inline-flex">
                    <LuChevronDown aria-hidden="true" />
                  </Box>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Stack as="ul" gap="2" listStyle="none" m="0" p="0" pt="2">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <NavLink
                          item={item}
                          collapsed={false}
                          onNavigate={onNavigate}
                        />
                      </li>
                    ))}
                  </Stack>
                </Collapsible.Content>
              </Collapsible.Root>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
```

```tsx components/app-shell.tsx
"use client"

import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LuMenu, LuPanelLeftClose, LuPanelLeftOpen, LuSparkles } from "react-icons/lu"
import { Avatar } from "@/components/ui/avatar"
import {
  BreadcrumbCurrentLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb"
import { ColorModeButton } from "@/components/ui/color-mode"
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"
import { crumbsFor } from "./nav-config"
import { SidebarNav } from "./sidebar-nav"

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      asChild
      variant="plain"
      textDecoration="none"
      color="fg"
      aria-label="Lumen home"
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/">
        <HStack gap="3" minH="12" justifyContent={collapsed ? "center" : "flex-start"}>
          <Flex
            boxSize="10"
            align="center"
            justify="center"
            borderRadius="l2"
            bg="brand.solid"
            color="brand.contrast"
            flexShrink={0}
          >
            <LuSparkles size={20} aria-hidden="true" />
          </Flex>
          {!collapsed && (
            <Heading as="span" size="xl">
              Lumen
            </Heading>
          )}
        </HStack>
      </NextLink>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const crumbs = crumbsFor(pathname)

  return (
    <Flex minH="100dvh" bg="bg">
      <Link
        href="#main"
        position="absolute"
        left="4"
        top="4"
        zIndex="max"
        px="4"
        py="3"
        borderRadius="l2"
        bg="brand.solid"
        color="brand.contrast"
        transform="translateY(-200%)"
        _focusVisible={{ transform: "translateY(0)" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        display={{ base: "none", lg: "flex" }}
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? "24" : "72"}
        transition="width 0.2s"
        bg="bg.panel"
        borderEndWidth="1px"
        borderColor="border"
        px={collapsed ? "4" : "5"}
        py="6"
        gap="8"
        overflowY="auto"
      >
        <Brand collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} />
      </Flex>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          align="center"
          justify="space-between"
          gap="4"
          minH="20"
          px={{ base: "4", md: "8" }}
          bg="bg.panel"
          borderBottomWidth="1px"
          borderColor="border"
        >
          <HStack gap="3" minW="0">
            <IconButton
              display={{ base: "inline-flex", lg: "none" }}
              variant="outline"
              aria-label="Open navigation menu"
              aria-haspopup="dialog"
              onClick={() => setDrawerOpen(true)}
            >
              <LuMenu />
            </IconButton>
            <Tooltip
              content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              positioning={{ placement: "bottom" }}
            >
              <IconButton
                display={{ base: "none", lg: "inline-flex" }}
                variant="ghost"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
              </IconButton>
            </Tooltip>
            <BreadcrumbRoot size="lg" separatorGap="3">
              {crumbs.map((crumb, i) =>
                i === crumbs.length - 1 ? (
                  <BreadcrumbCurrentLink key={crumb.label} fontWeight="semibold">
                    {crumb.label}
                  </BreadcrumbCurrentLink>
                ) : (
                  <Text as="span" key={crumb.label} color="fg.muted">
                    {crumb.label}
                  </Text>
                ),
              )}
            </BreadcrumbRoot>
          </HStack>

          <HStack gap="3" flexShrink={0}>
            <ColorModeButton size="md" />
            <HStack gap="3">
              <Avatar name={user.name} size="md" colorPalette="brand" />
              <Box display={{ base: "none", md: "block" }} lineHeight="short">
                <Text fontWeight="semibold">{user.name}</Text>
                <Text fontSize="sm" color="fg.muted">
                  {user.role}
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Flex>

        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          px={{ base: "4", md: "8", xl: "12" }}
          py={{ base: "8", md: "12" }}
          _focusVisible={{ outline: "none" }}
        >
          <Box maxW="6xl" mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Mobile navigation drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerTitle asChild>
              <Brand />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody pt="4" pb="8">
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  )
}
```

```tsx app/page.tsx
"use client"

import {
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { Link } from "@chakra-ui/react"
import { formatDate, projects, statusPalette, user } from "@/lib/data"

export default function DashboardPage() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const active = projects.filter((p) => p.status === "Active")
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0]
  const maxIssues = Math.max(...projects.map((p) => p.issues), 1)
  const firstName = user.name.split(" ")[0]

  const cards = [
    { label: "Open issues", value: String(totalIssues), help: "Across all projects" },
    { label: "Active projects", value: String(active.length), help: `of ${projects.length} in the workspace` },
    { label: "Most issues", value: "Customer app", help: "31 open right now" },
    { label: "Last activity", value: formatDate(latest.updated), help: latest.name },
  ]

  return (
    <Stack gap="10">
      <Stack gap="3">
        <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>
          Welcome back, {firstName}!
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Here is how things look for the team at Acme Labs today. Nice work, keep the momentum going.
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="6" aria-label="Summary">
        {cards.map((c) => (
          <Card.Root key={c.label} size="lg">
            <Card.Body>
              <Stat.Root>
                <Stat.Label fontSize="md">{c.label}</Stat.Label>
                <Stat.ValueText fontSize="3xl" fontFamily="heading">
                  {c.value}
                </Stat.ValueText>
                <Stat.HelpText>{c.help}</Stat.HelpText>
              </Stat.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root as="section" id="reports" aria-labelledby="reports-title" size="lg" scrollMarginTop="28">
        <Card.Header>
          <Heading as="h2" id="reports-title" size="xl">
            Reports: issues by project
          </Heading>
          <Text color="fg.muted">Where the team's attention is going this month.</Text>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" gap="6" listStyle="none" m="0" p="0">
            {projects.map((p) => (
              <Box as="li" key={p.key}>
                <HStack justify="space-between" mb="2" gap="4">
                  <HStack gap="3" minW="0">
                    <Link asChild fontWeight="semibold">
                      <NextLink href="/projects">{p.name}</NextLink>
                    </Link>
                    <Badge colorPalette={statusPalette[p.status]} variant="subtle" size="md">
                      {p.status}
                    </Badge>
                  </HStack>
                  <Text fontWeight="semibold">
                    {p.issues} {p.issues === 1 ? "issue" : "issues"}
                  </Text>
                </HStack>
                <Progress.Root
                  value={p.issues}
                  max={maxIssues}
                  size="md"
                  aria-label={`${p.name}: ${p.issues} open issues`}
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Box>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}
```

```tsx app/projects/page.tsx
"use client"

import { Badge, Box, Heading, Stack, Table, Text } from "@chakra-ui/react"
import { formatDate, projects, statusPalette } from "@/lib/data"

export default function ProjectsPage() {
  return (
    <Stack gap="8">
      <Stack gap="3">
        <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>
          Projects
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          {projects.length} projects in your workspace, from the marketing site to internal tools.
        </Text>
      </Stack>

      <Box bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="l3" p={{ base: "2", md: "4" }}>
        <Table.ScrollArea borderRadius="l2">
          <Table.Root size="lg" interactive>
            <Table.Caption srOnly>All Lumen projects with status, open issues and last update</Table.Caption>
            <Table.Header>
              <Table.Row bg="transparent">
                <Table.ColumnHeader>Key</Table.ColumnHeader>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Issues</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Updated</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {projects.map((p) => (
                <Table.Row key={p.key} bg="transparent">
                  <Table.Cell fontWeight="bold" fontFamily="mono" color="brand.fg">
                    {p.key}
                  </Table.Cell>
                  <Table.Cell fontWeight="semibold">{p.name}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={statusPalette[p.status]} variant="subtle" size="md">
                      {p.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                  <Table.Cell textAlign="end" whiteSpace="nowrap">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </Stack>
  )
}
```

```tsx app/settings/page.tsx
"use client"

import {
  Box,
  Button,
  Card,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode()
  const [name, setName] = useState(user.name)
  const [weekly, setWeekly] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [releases, setReleases] = useState(false)

  const invalid = name.trim().length === 0

  return (
    <Stack gap="8" maxW="3xl">
      <Stack gap="3">
        <Heading as="h1" size={{ base: "3xl", md: "4xl" }}>
          Settings
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Make Lumen feel like home for you and your team.
        </Text>
      </Stack>

      <Card.Root as="section" aria-labelledby="profile-title" size="lg">
        <Card.Header>
          <Heading as="h2" id="profile-title" size="xl">
            Profile
          </Heading>
        </Card.Header>
        <Card.Body>
          <Box
            as="form"
            id="profile-form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault()
              if (invalid) return
              toaster.create({
                title: "Profile saved",
                description: `Thanks, ${name.trim().split(" ")[0]}. Your changes are live.`,
                type: "success",
              })
            }}
          >
            <Stack gap="6">
              <Field
                label="Full name"
                required
                invalid={invalid}
                errorText="Please enter your name"
              >
                <Input
                  size="lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email" helperText="Your sign-in email can only be changed by support.">
                <Input size="lg" value={user.email} readOnly autoComplete="email" />
              </Field>
              <Field label="Role">
                <Input size="lg" value={user.role} readOnly />
              </Field>
            </Stack>
          </Box>
        </Card.Body>
        <Card.Footer>
          <Button type="submit" form="profile-form" size="lg">
            Save profile
          </Button>
        </Card.Footer>
      </Card.Root>

      <Card.Root as="section" aria-labelledby="notify-title" size="lg">
        <Card.Header>
          <Heading as="h2" id="notify-title" size="xl">
            Notifications
          </Heading>
          <Text color="fg.muted">Choose what lands in your inbox.</Text>
        </Card.Header>
        <Card.Body>
          <Stack gap="6">
            <Switch size="lg" checked={weekly} onCheckedChange={(e) => setWeekly(e.checked)}>
              Weekly summary of project activity
            </Switch>
            <Switch size="lg" checked={mentions} onCheckedChange={(e) => setMentions(e.checked)}>
              Someone mentions me on an issue
            </Switch>
            <Switch size="lg" checked={releases} onCheckedChange={(e) => setReleases(e.checked)}>
              Product news and new features
            </Switch>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root as="section" aria-labelledby="appearance-title" size="lg">
        <Card.Header>
          <Heading as="h2" id="appearance-title" size="xl">
            Appearance
          </Heading>
        </Card.Header>
        <Card.Body>
          <Switch
            size="lg"
            checked={colorMode === "dark"}
            onCheckedChange={(e) => setColorMode(e.checked ? "dark" : "light")}
          >
            Dark mode
          </Switch>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}
```
