```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Lumen's visual identity, carried through Chakra's own theming:
 * brand colour palette, cool slate neutrals, 2px radii, Georgia headings,
 * system sans body text and compact default sizes for the core components.
 */
const config = defineConfig({
  globalCss: {
    body: {
      fontSize: "sm",
      lineHeight: "1.45",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      radii: {
        l1: { value: "2px" },
        l2: { value: "2px" },
        l3: { value: "2px" },
      },
      colors: {
        // Brand: Lumen teal. 700 is #0F766E.
        brand: {
          "50": { value: "#f0fdfa" },
          "100": { value: "#ccfbf1" },
          "200": { value: "#99f6e4" },
          "300": { value: "#5eead4" },
          "400": { value: "#2dd4bf" },
          "500": { value: "#14b8a6" },
          "600": { value: "#0d9488" },
          "700": { value: "#0f766e" },
          "800": { value: "#115e59" },
          "900": { value: "#134e4a" },
          "950": { value: "#042f2e" },
        },
        // Neutrals: cool slate grey replaces the default gray scale.
        gray: {
          "50": { value: "#f8fafc" },
          "100": { value: "#f1f5f9" },
          "200": { value: "#e2e8f0" },
          "300": { value: "#cbd5e1" },
          "400": { value: "#94a3b8" },
          "500": { value: "#64748b" },
          "600": { value: "#475569" },
          "700": { value: "#334155" },
          "800": { value: "#1e293b" },
          "900": { value: "#0f172a" },
          "950": { value: "#020617" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" },
          },
          contrast: {
            value: { _light: "{colors.white}", _dark: "{colors.brand.950}" },
          },
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
          focusRing: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" },
          },
        },
        // Focus rings are brand coloured everywhere, including neutral controls.
        gray: {
          focusRing: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" },
          },
        },
      },
    },
    recipes: {
      // Links use the brand colour.
      link: {
        variants: {
          variant: {
            underline: { color: "brand.fg" },
            plain: { color: "brand.fg" },
          },
        },
      },
      // Compact density: small controls by default.
      button: { defaultVariants: { size: "sm" } },
      input: { defaultVariants: { size: "sm" } },
      textarea: { defaultVariants: { size: "sm" } },
    },
    slotRecipes: {
      card: {
        slots: ["root", "header", "body", "footer", "title", "description"],
        defaultVariants: { size: "sm" },
      },
      table: {
        slots: [
          "root",
          "header",
          "body",
          "row",
          "columnHeader",
          "cell",
          "footer",
          "caption",
        ],
        defaultVariants: { size: "sm" },
      },
      nativeSelect: {
        slots: ["root", "field", "indicator"],
        defaultVariants: { size: "sm" },
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
      <ColorModeProvider defaultTheme="light" enableSystem={false} {...props} />
    </ChakraProvider>
  )
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/shell/app-shell";
import { EmotionRegistry } from "@/components/ui/emotion-registry";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
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

export interface Report {
  id: string
  name: string
  cadence: string
  owner: string
  lastRun: string
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

export const reports: Report[] = [
  {
    id: "RPT-1",
    name: "Weekly issue throughput",
    cadence: "Weekly, Monday",
    owner: "Maya Okafor",
    lastRun: "2026-10-12",
  },
  {
    id: "RPT-2",
    name: "Issue age by project",
    cadence: "Monthly",
    owner: "Maya Okafor",
    lastRun: "2026-10-01",
  },
  {
    id: "RPT-3",
    name: "Customer app release readiness",
    cadence: "On demand",
    owner: "Maya Okafor",
    lastRun: "2026-10-14",
  },
  {
    id: "RPT-4",
    name: "Public API error budget",
    cadence: "Daily",
    owner: "Maya Okafor",
    lastRun: "2026-10-14",
  },
]
```

```ts lib/format.ts
/** Formats an ISO date (YYYY-MM-DD) the same way on the server and the client. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
```

```ts lib/nav.ts
import type { IconType } from "react-icons"
import {
  LuFileText,
  LuFolderOpen,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu"

export interface NavItem {
  label: string
  href: string
  icon: IconType
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LuLayoutDashboard },
      { label: "Reports", href: "/reports", icon: LuFileText },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: LuFolderOpen },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
]

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function findNav(
  pathname: string,
): { group: NavGroup; item: NavItem } | undefined {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group, item }
    }
  }
  return undefined
}
```

```tsx components/shell/sidebar-nav.tsx
"use client"

import { Tooltip } from "@/components/ui/tooltip"
import { type NavItem, isActive, navGroups } from "@/lib/nav"
import { Collapsible, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LuChevronDown } from "react-icons/lu"

export const NavLink = chakra(NextLink)

interface NavItemLinkProps {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}

function NavItemLink({ item, active, collapsed, onNavigate }: NavItemLinkProps) {
  const Icon = item.icon
  const link = (
    <NavLink
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
      display="flex"
      alignItems="center"
      justifyContent={collapsed ? "center" : "flex-start"}
      gap="2.5"
      h="8"
      px="2"
      fontSize="sm"
      fontWeight={active ? "semibold" : "medium"}
      borderRadius="l2"
      borderStartWidth="2px"
      borderStartColor={active ? "brand.solid" : "transparent"}
      bg={active ? "brand.muted" : "transparent"}
      color={active ? "brand.fg" : "fg.muted"}
      textDecoration="none"
      _hover={{
        bg: active ? "brand.muted" : "bg.muted",
        color: active ? "brand.fg" : "fg",
      }}
      focusVisibleRing="outside"
    >
      <Icon aria-hidden size={16} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )

  return (
    <Tooltip
      content={item.label}
      positioning={{ placement: "right" }}
      openDelay={200}
      disabled={!collapsed}
    >
      {link}
    </Tooltip>
  )
}

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const [closed, setClosed] = useState<Record<string, boolean>>({})

  return (
    <chakra.nav aria-label="Main navigation">
      <chakra.ul
        listStyle="none"
        m="0"
        p="0"
        display="flex"
        flexDirection="column"
        gap={collapsed ? "2" : "3"}
      >
        {navGroups.map((group, index) => {
          const items = (
            <chakra.ul
              aria-label={group.label}
              listStyle="none"
              m="0"
              p="0"
              display="flex"
              flexDirection="column"
              gap="0.5"
            >
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItemLink
                    item={item}
                    active={isActive(item.href, pathname)}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </chakra.ul>
          )

          return (
            <li key={group.id}>
              {collapsed ? (
                <chakra.div
                  borderTopWidth={index > 0 ? "1px" : "0"}
                  pt={index > 0 ? "2" : "0"}
                >
                  {items}
                </chakra.div>
              ) : (
                <Collapsible.Root
                  open={!closed[group.id]}
                  onOpenChange={(e) =>
                    setClosed((prev) => ({ ...prev, [group.id]: !e.open }))
                  }
                >
                  <Collapsible.Trigger
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    w="100%"
                    h="6"
                    px="2"
                    mb="0.5"
                    fontSize="xs"
                    fontWeight="semibold"
                    letterSpacing="0.06em"
                    textTransform="uppercase"
                    color="fg.muted"
                    borderRadius="l2"
                    cursor="pointer"
                    _hover={{ color: "fg" }}
                    focusVisibleRing="outside"
                  >
                    {group.label}
                    <Collapsible.Indicator
                      display="inline-flex"
                      transition="transform 0.15s"
                      _open={{ transform: "rotate(180deg)" }}
                    >
                      <LuChevronDown aria-hidden size={14} />
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>{items}</Collapsible.Content>
                </Collapsible.Root>
              )}
            </li>
          )
        })}
      </chakra.ul>
    </chakra.nav>
  )
}
```

```tsx components/shell/app-shell.tsx
"use client"

import { Avatar } from "@/components/ui/avatar"
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
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
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"
import { findNav } from "@/lib/nav"
import { Box, Button, Flex, IconButton, Text, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LuChevronDown,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu"
import { NavLink, SidebarNav } from "./sidebar-nav"

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <NavLink
      href="/"
      aria-label="Lumen home"
      display="flex"
      alignItems="center"
      gap="2"
      borderRadius="l2"
      textDecoration="none"
      color="fg"
      focusVisibleRing="outside"
    >
      <Box
        aria-hidden
        display="grid"
        placeItems="center"
        w="6"
        h="6"
        flexShrink={0}
        borderRadius="l2"
        bg="brand.solid"
        color="brand.contrast"
        fontFamily="heading"
        fontWeight="bold"
        fontSize="sm"
      >
        L
      </Box>
      {!collapsed && (
        <Text
          as="span"
          fontFamily="heading"
          fontWeight="semibold"
          fontSize="lg"
          letterSpacing="-0.01em"
        >
          Lumen
        </Text>
      )}
    </NavLink>
  )
}

function UserMenu() {
  return (
    <MenuRoot positioning={{ placement: "bottom-end" }}>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          px="1"
          aria-label={`Account menu, ${user.name}`}
        >
          <Avatar size="2xs" name={user.name} colorPalette="brand" />
          <Text as="span" hideBelow="md" fontWeight="medium">
            {user.name}
          </Text>
          <LuChevronDown aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuContent minW="56">
        <Box px="3" py="2">
          <Text fontWeight="semibold">{user.name}</Text>
          <Text fontSize="xs" color="fg.muted">
            {user.email}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Role: {user.role}
          </Text>
        </Box>
        <MenuSeparator />
        <MenuItem value="settings" asChild>
          <NextLink href="/settings">Settings</NextLink>
        </MenuItem>
        <MenuItem value="projects" asChild>
          <NextLink href="/projects">Projects</NextLink>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const current = findNav(pathname)

  // Close the phone drawer when the viewport grows to the desktop layout.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 48em)")
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false)
    }
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar"

  return (
    <Flex minH="100dvh" bg="bg">
      <chakra.a
        href="#main"
        position="absolute"
        left="2"
        top="2"
        zIndex="skipLink"
        px="3"
        py="1.5"
        bg="bg"
        borderWidth="1px"
        borderRadius="l2"
        fontSize="sm"
        transform="translateY(-200%)"
        _focus={{ transform: "none" }}
      >
        Skip to content
      </chakra.a>

      {/* Desktop sidebar */}
      <Box
        as="aside"
        hideBelow="md"
        flexShrink={0}
        w={collapsed ? "14" : "60"}
        transition="width 0.15s ease"
        _motionReduce={{ transition: "none" }}
        borderEndWidth="1px"
        bg="bg.subtle"
      >
        <Flex direction="column" position="sticky" top="0" h="100dvh">
          <Flex
            h="12"
            align="center"
            justify={collapsed ? "center" : "flex-start"}
            px="3"
            borderBottomWidth="1px"
          >
            <Brand collapsed={collapsed} />
          </Flex>
          <Box flex="1" overflowY="auto" px="2" py="3">
            <SidebarNav collapsed={collapsed} />
          </Box>
          <Box p="2" borderTopWidth="1px">
            <Tooltip
              content={toggleLabel}
              positioning={{ placement: "right" }}
              disabled={!collapsed}
            >
              <Button
                variant="ghost"
                size="xs"
                w="100%"
                justifyContent={collapsed ? "center" : "flex-start"}
                color="fg.muted"
                aria-label={toggleLabel}
                onClick={() => setCollapsed((value) => !value)}
              >
                {collapsed ? (
                  <LuPanelLeftOpen aria-hidden />
                ) : (
                  <LuPanelLeftClose aria-hidden />
                )}
                {!collapsed && "Collapse"}
              </Button>
            </Tooltip>
            <Flex
              mt="2"
              px="1"
              align="center"
              gap="2"
              justify={collapsed ? "center" : "flex-start"}
            >
              <Avatar size="xs" name={user.name} colorPalette="brand" />
              {!collapsed && (
                <Box minW="0">
                  <Text fontSize="xs" fontWeight="semibold" truncate>
                    {user.name}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {user.role}
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Phone navigation drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(event) => setDrawerOpen(event.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent bg="bg.subtle">
          <DrawerHeader h="12" py="0" display="flex" alignItems="center">
            <DrawerTitle fontFamily="heading" fontSize="lg">
              Lumen
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody px="2" py="3">
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Box
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="12"
          px={{ base: "2", md: "5" }}
          borderBottomWidth="1px"
          bg="bg"
        >
          <Flex h="100%" align="center" gap="2">
            <IconButton
              hideFrom="md"
              variant="ghost"
              size="sm"
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
            >
              <LuMenu aria-hidden />
            </IconButton>
            <Box flex="1" minW="0" overflow="hidden">
              <BreadcrumbRoot size="sm">
                <BreadcrumbLink asChild>
                  <NextLink href="/">Lumen</NextLink>
                </BreadcrumbLink>
                {current ? (
                  <Text as="span" color="fg.muted">
                    {current.group.label}
                  </Text>
                ) : null}
                {current ? (
                  <BreadcrumbCurrentLink>{current.item.label}</BreadcrumbCurrentLink>
                ) : (
                  <BreadcrumbCurrentLink>Not found</BreadcrumbCurrentLink>
                )}
              </BreadcrumbRoot>
            </Box>
            <ColorModeButton />
            <UserMenu />
          </Flex>
        </Box>
        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          w="100%"
          maxW="1200px"
          px={{ base: "3", md: "5" }}
          py={{ base: "4", md: "5" }}
          _focusVisible={{ outline: "none" }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
```

```tsx components/page-header.tsx
"use client"

import { Box, Flex, Heading, Text } from "@chakra-ui/react"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      justify="space-between"
      align={{ base: "stretch", sm: "flex-end" }}
      gap="3"
      mb="4"
    >
      <Box minW="0">
        <Heading as="h1" size="xl">
          {title}
        </Heading>
        {description ? (
          <Text mt="1" color="fg.muted">
            {description}
          </Text>
        ) : null}
      </Box>
      {actions}
    </Flex>
  )
}
```

```tsx components/text-link.tsx
"use client"

import { Link, type LinkProps } from "@chakra-ui/react"
import NextLink from "next/link"

interface TextLinkProps extends Omit<LinkProps, "href"> {
  href: string
}

/** A brand-coloured in-text link that navigates with the Next.js router. */
export function TextLink({ href, children, ...rest }: TextLinkProps) {
  return (
    <Link asChild color="brand.fg" fontWeight="medium" {...rest}>
      <NextLink href={href}>{children}</NextLink>
    </Link>
  )
}
```

```tsx components/dashboard/dashboard-view.tsx
"use client"

import { PageHeader } from "@/components/page-header"
import { TextLink } from "@/components/text-link"
import { StatHelpText, StatLabel, StatRoot, StatValueText } from "@/components/ui/stat"
import { projects, user } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { Badge, Box, Card, Flex, Grid, Heading, Progress, Text, chakra } from "@chakra-ui/react"

export function DashboardView() {
  const firstName = user.name.split(" ")[0]
  const openIssues = projects.reduce((sum, project) => sum + project.issues, 0)
  const activeCount = projects.filter((project) => project.status === "Active").length
  const withIssues = projects.filter((project) => project.issues > 0).length
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0]
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0]
  const maxIssues = Math.max(...projects.map((project) => project.issues), 1)

  const cards = [
    {
      label: "Open issues",
      value: String(openIssues),
      help: `across ${withIssues} projects`,
    },
    {
      label: "Active projects",
      value: String(activeCount),
      help: `of ${projects.length} in the workspace`,
    },
    {
      label: "Busiest project",
      value: busiest.key,
      help: `${busiest.name}, ${busiest.issues} open`,
    },
    {
      label: "Last update",
      value: formatDate(latest.updated),
      help: latest.name,
    },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Your workspace has ${activeCount} active projects and ${openIssues} open issues.`}
      />

      <Grid
        as="section"
        aria-label="Summary"
        templateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }}
        gap="3"
        mb="4"
      >
        {cards.map((card) => (
          <Card.Root key={card.label}>
            <Card.Body>
              <StatRoot>
                <StatLabel>{card.label}</StatLabel>
                <StatValueText fontSize="2xl" fontFamily="heading">
                  {card.value}
                </StatValueText>
                <StatHelpText>{card.help}</StatHelpText>
              </StatRoot>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 2fr) minmax(0, 1fr)" }} gap="3">
        <Card.Root as="section" aria-labelledby="issues-by-project">
          <Card.Header>
            <Flex justify="space-between" align="baseline" gap="2">
              <Heading as="h2" size="md" id="issues-by-project">
                Open issues by project
              </Heading>
              <TextLink href="/projects">View all projects</TextLink>
            </Flex>
          </Card.Header>
          <Card.Body>
            <chakra.ul listStyle="none" m="0" p="0" display="flex" flexDirection="column" gap="3">
              {projects.map((project) => (
                <li key={project.key}>
                  <Flex align="center" gap="3">
                    <Text
                      as="span"
                      w="10"
                      flexShrink={0}
                      fontFamily="mono"
                      fontSize="xs"
                      fontWeight="medium"
                      color="fg.muted"
                    >
                      {project.key}
                    </Text>
                    <Box flex="1" minW="0">
                      <Text fontWeight="medium" truncate>
                        {project.name}
                      </Text>
                      <Progress.Root
                        value={project.issues}
                        max={maxIssues}
                        size="xs"
                        colorPalette="brand"
                        aria-label={`${project.name}: ${project.issues} open issues`}
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                    <Text
                      as="span"
                      w="8"
                      flexShrink={0}
                      textAlign="end"
                      fontWeight="semibold"
                      fontVariantNumeric="tabular-nums"
                    >
                      {project.issues}
                    </Text>
                  </Flex>
                </li>
              ))}
            </chakra.ul>
          </Card.Body>
        </Card.Root>

        <Card.Root as="section" aria-labelledby="your-account">
          <Card.Header>
            <Heading as="h2" size="md" id="your-account">
              Your account
            </Heading>
          </Card.Header>
          <Card.Body>
            <Flex direction="column" gap="2">
              <Box>
                <Text fontSize="xs" color="fg.muted">
                  Name
                </Text>
                <Text fontWeight="medium">{user.name}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted">
                  Email
                </Text>
                <Text fontWeight="medium" wordBreak="break-all">
                  {user.email}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="fg.muted" mb="0.5">
                  Role
                </Text>
                <Badge colorPalette="brand" variant="subtle">
                  {user.role}
                </Badge>
              </Box>
              <TextLink href="/settings">Edit settings</TextLink>
            </Flex>
          </Card.Body>
        </Card.Root>
      </Grid>
    </>
  )
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <DashboardView />;
}
```

```tsx components/projects/projects-view.tsx
"use client"

import { PageHeader } from "@/components/page-header"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { type ProjectStatus, projects } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { Badge, Flex, Input, Table, Text } from "@chakra-ui/react"
import { useState } from "react"
import { LuSearch } from "react-icons/lu"

const statusColor: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
  { value: "Archived", label: "Archived" },
]

export function ProjectsView() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  const needle = query.trim().toLowerCase()
  const rows = projects.filter((project) => {
    const matchesStatus = status === "all" || project.status === status
    const matchesText =
      needle === "" ||
      project.name.toLowerCase().includes(needle) ||
      project.key.toLowerCase().includes(needle)
    return matchesStatus && matchesText
  })

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the workspace, with its open issues and last update."
      />

      <Flex direction={{ base: "column", sm: "row" }} gap="2" mb="3" align={{ sm: "center" }}>
        <InputGroup flex="1" maxW={{ sm: "xs" }} startElement={<LuSearch aria-hidden />}>
          <Input
            aria-label="Filter projects by name or key"
            placeholder="Filter by name or key"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
        <NativeSelectRoot w={{ base: "100%", sm: "44" }}>
          <NativeSelectField
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.currentTarget.value)}
            items={statusOptions}
          />
        </NativeSelectRoot>
        <Text
          role="status"
          aria-live="polite"
          fontSize="xs"
          color="fg.muted"
          ms={{ sm: "auto" }}
        >
          Showing {rows.length} of {projects.length} projects
        </Text>
      </Flex>

      <Table.ScrollArea borderWidth="1px" borderRadius="l2">
        <Table.Root size="sm" variant="line" aria-label="Projects">
          <Table.Header bg="bg.subtle">
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Project</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
              <Table.ColumnHeader display={{ base: "none", sm: "table-cell" }}>
                Updated
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} color="fg.muted" textAlign="center" py="6">
                  No projects match the current filter.
                </Table.Cell>
              </Table.Row>
            ) : (
              rows.map((project) => (
                <Table.Row key={project.key}>
                  <Table.Cell fontFamily="mono" fontSize="xs" fontWeight="medium">
                    {project.key}
                  </Table.Cell>
                  <Table.Cell fontWeight="medium">{project.name}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={statusColor[project.status]} variant="subtle">
                      {project.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                    {project.issues}
                  </Table.Cell>
                  <Table.Cell
                    color="fg.muted"
                    whiteSpace="nowrap"
                    display={{ base: "none", sm: "table-cell" }}
                  >
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { ProjectsView } from "@/components/projects/projects-view";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsView />;
}
```

```tsx components/reports/reports-view.tsx
"use client"

import { PageHeader } from "@/components/page-header"
import { reports } from "@/lib/data"
import { formatDate } from "@/lib/format"
import { Table } from "@chakra-ui/react"

export function ReportsView() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Saved analytics reports and when each one last ran."
      />
      <Table.ScrollArea borderWidth="1px" borderRadius="l2">
        <Table.Root size="sm" variant="line" aria-label="Reports">
          <Table.Header bg="bg.subtle">
            <Table.Row>
              <Table.ColumnHeader>Report</Table.ColumnHeader>
              <Table.ColumnHeader>Schedule</Table.ColumnHeader>
              <Table.ColumnHeader display={{ base: "none", sm: "table-cell" }}>
                Owner
              </Table.ColumnHeader>
              <Table.ColumnHeader>Last run</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.map((report) => (
              <Table.Row key={report.id}>
                <Table.Cell fontWeight="medium">{report.name}</Table.Cell>
                <Table.Cell color="fg.muted" whiteSpace="nowrap">
                  {report.cadence}
                </Table.Cell>
                <Table.Cell
                  color="fg.muted"
                  whiteSpace="nowrap"
                  display={{ base: "none", sm: "table-cell" }}
                >
                  {report.owner}
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">
                  <time dateTime={report.lastRun}>{formatDate(report.lastRun)}</time>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsView />;
}
```

```tsx components/settings/settings-view.tsx
"use client"

import { PageHeader } from "@/components/page-header"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"
import { Badge, Button, Card, Flex, Grid, Heading, Input, chakra } from "@chakra-ui/react"
import { useState } from "react"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SettingsView() {
  const { colorMode, setColorMode } = useColorMode()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [defaultView, setDefaultView] = useState("overview")
  const [assigned, setAssigned] = useState(true)
  const [weekly, setWeekly] = useState(true)
  const [product, setProduct] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const nameError = name.trim() === "" ? "Enter your name." : ""
  const emailError = emailPattern.test(email.trim()) ? "" : "Enter a valid email address."

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (nameError || emailError) return
    toaster.create({
      type: "success",
      title: "Settings saved",
      description: "Your profile and notification preferences were updated.",
    })
  }

  function handleReset() {
    setName(user.name)
    setEmail(user.email)
    setDefaultView("overview")
    setAssigned(true)
    setWeekly(true)
    setProduct(false)
    setSubmitted(false)
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, notifications and how Lumen looks."
      />

      <chakra.form onSubmit={handleSubmit} noValidate display="flex" flexDirection="column" gap="3" maxW="3xl">
        <Card.Root as="section" aria-labelledby="profile-heading">
          <Card.Header>
            <Heading as="h2" size="md" id="profile-heading">
              Profile
            </Heading>
          </Card.Header>
          <Card.Body>
            <Grid templateColumns={{ base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }} gap="3">
              <Field
                label="Full name"
                required
                invalid={submitted && nameError !== ""}
                errorText={nameError}
              >
                <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
              </Field>
              <Field
                label="Email"
                required
                invalid={submitted && emailError !== ""}
                errorText={emailError}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Role" helperText="Only another owner can change this.">
                <Flex align="center" h="8">
                  <Badge colorPalette="brand" variant="subtle">
                    {user.role}
                  </Badge>
                </Flex>
              </Field>
              <Field label="Start page">
                <NativeSelectRoot>
                  <NativeSelectField
                    value={defaultView}
                    onChange={(event) => setDefaultView(event.currentTarget.value)}
                    items={[
                      { value: "overview", label: "Overview" },
                      { value: "projects", label: "Projects" },
                      { value: "reports", label: "Reports" },
                    ]}
                  />
                </NativeSelectRoot>
              </Field>
            </Grid>
          </Card.Body>
        </Card.Root>

        <Card.Root as="section" aria-labelledby="notifications-heading">
          <Card.Header>
            <Heading as="h2" size="md" id="notifications-heading">
              Notifications
            </Heading>
          </Card.Header>
          <Card.Body>
            <Flex direction="column" gap="3">
              <Switch
                colorPalette="brand"
                checked={assigned}
                onCheckedChange={(event) => setAssigned(event.checked)}
              >
                Email me when an issue is assigned to me
              </Switch>
              <Switch
                colorPalette="brand"
                checked={weekly}
                onCheckedChange={(event) => setWeekly(event.checked)}
              >
                Send a weekly summary of project activity
              </Switch>
              <Switch
                colorPalette="brand"
                checked={product}
                onCheckedChange={(event) => setProduct(event.checked)}
              >
                Send product updates and release notes
              </Switch>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Card.Root as="section" aria-labelledby="appearance-heading">
          <Card.Header>
            <Heading as="h2" size="md" id="appearance-heading">
              Appearance
            </Heading>
          </Card.Header>
          <Card.Body>
            <Field label="Color mode" maxW={{ md: "xs" }}>
              <NativeSelectRoot>
                <NativeSelectField
                  value={colorMode === "dark" ? "dark" : "light"}
                  onChange={(event) =>
                    setColorMode(event.currentTarget.value === "dark" ? "dark" : "light")
                  }
                  items={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                />
              </NativeSelectRoot>
            </Field>
          </Card.Body>
        </Card.Root>

        <Flex gap="2" justify={{ base: "stretch", sm: "flex-end" }}>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" colorPalette="brand">
            Save changes
          </Button>
        </Flex>
      </chakra.form>
    </>
  )
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsView />;
}
```
