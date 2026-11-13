```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Lumen's visual identity, carried by the design system itself:
// tokens (brand teal, slate neutrals, fonts, 2px radii), semantic tokens
// (the "brand" colour palette) and compact default sizes for the recipes.
const config = defineConfig({
  globalCss: {
    ":where(a, button, input, select, textarea, summary, [tabindex])": {
      focusRingColor: "brand.focusRing",
    },
    a: { color: "brand.fg" },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#F0FDFA" },
          100: { value: "#CCFBF1" },
          200: { value: "#99F6E4" },
          300: { value: "#5EEAD4" },
          400: { value: "#2DD4BF" },
          500: { value: "#14B8A6" },
          600: { value: "#0F766E" },
          700: { value: "#115E59" },
          800: { value: "#134E4A" },
          900: { value: "#0B3B37" },
          950: { value: "#042F2E" },
        },
        // Cool slate neutrals replace the default gray scale.
        gray: {
          50: { value: "#F8FAFC" },
          100: { value: "#F1F5F9" },
          200: { value: "#E2E8F0" },
          300: { value: "#CBD5E1" },
          400: { value: "#94A3B8" },
          500: { value: "#64748B" },
          600: { value: "#475569" },
          700: { value: "#334155" },
          800: { value: "#1E293B" },
          900: { value: "#0F172A" },
          950: { value: "#020617" },
        },
      },
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      radii: {
        l1: { value: "2px" },
        l2: { value: "2px" },
        l3: { value: "2px" },
        l4: { value: "2px" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.300}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          solid: { value: "{colors.brand.600}" },
          focusRing: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" } },
          border: { value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" } },
        },
      },
    },
    // Compact density: small controls by default.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recipes: {
      button: { defaultVariants: { size: "sm" } } as any,
      input: { defaultVariants: { size: "sm" } } as any,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slotRecipes: {
      card: { defaultVariants: { size: "sm" } } as any,
      table: { defaultVariants: { size: "sm" } } as any,
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
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
]

export interface Report {
  name: string
  schedule: string
  recipients: number
  lastRun: string
}

export const reports: Report[] = [
  { name: "Weekly issue throughput", schedule: "Mondays, 08:00", recipients: 4, lastRun: "2026-10-12" },
  { name: "Open issues by project", schedule: "Daily, 07:30", recipients: 6, lastRun: "2026-10-14" },
  { name: "Cycle time by team", schedule: "First of the month", recipients: 3, lastRun: "2026-10-01" },
  { name: "Public API error budget", schedule: "Fridays, 16:00", recipients: 2, lastRun: "2026-10-09" },
]

// Deterministic (UTC) so server and client render the same text.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
```

```tsx components/page-header.tsx
"use client"

import { Box, Heading, Text } from "@chakra-ui/react"

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="flex-end"
      justifyContent="space-between"
      gap="2"
      mb="4"
    >
      <Box minW="0">
        <Heading as="h1" size="xl" fontWeight="semibold" letterSpacing="-0.01em">
          {title}
        </Heading>
        {description && (
          <Text fontSize="sm" color="fg.muted" mt="0.5">
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  )
}
```

```tsx components/shell/app-shell.tsx
"use client"

import { useState } from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  Collapsible,
  Flex,
  Heading,
  IconButton,
  Link,
  Separator,
  SkipNavContent,
  SkipNavLink,
  Text,
} from "@chakra-ui/react"
import type { IconType } from "react-icons"
import {
  LuChevronDown,
  LuFileText,
  LuFolder,
  LuLayoutDashboard,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSettings,
} from "react-icons/lu"
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
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"

interface NavItem {
  label: string
  href: string
  icon: IconType
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LuLayoutDashboard },
      { label: "Reports", href: "/reports", icon: LuFileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: LuFolder },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
]

function crumbsFor(pathname: string): { group: string; label: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, label: item.label }
    }
  }
  return { group: "Analytics", label: "Overview" }
}

function NavItemLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  const link = (
    <Link
      asChild
      display="flex"
      alignItems="center"
      justifyContent={collapsed ? "center" : "flex-start"}
      gap="2"
      h="7"
      px="2"
      rounded="l2"
      textStyle="sm"
      fontWeight={active ? "medium" : "normal"}
      textDecoration="none"
      color={active ? "brand.contrast" : "fg"}
      bg={active ? "brand.solid" : "transparent"}
      _hover={{
        textDecoration: "none",
        bg: active ? "brand.solid" : "bg.muted",
      }}
    >
      <NextLink
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        onClick={onNavigate}
      >
        <Icon size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
        {!collapsed && <span>{item.label}</span>}
      </NextLink>
    </Link>
  )

  return (
    <Tooltip
      content={item.label}
      disabled={!collapsed}
      positioning={{ placement: "right" }}
    >
      {link}
    </Tooltip>
  )
}

function NavList({
  label,
  collapsed,
  pathname,
  onNavigate,
}: {
  label: string
  collapsed: boolean
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <Box as="nav" aria-label={label}>
      {navGroups.map((group, index) =>
        collapsed ? (
          <Box key={group.label} role="group" aria-label={group.label}>
            {index > 0 && <Separator my="2" />}
            <Flex direction="column" gap="0.5">
              {group.items.map((item) => (
                <NavItemLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  collapsed
                  onNavigate={onNavigate}
                />
              ))}
            </Flex>
          </Box>
        ) : (
          <Collapsible.Root key={group.label} defaultOpen mb="2">
            <Collapsible.Trigger
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              w="full"
              h="6"
              px="2"
              rounded="l2"
              cursor="pointer"
              color="fg.muted"
              textStyle="xs"
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="0.06em"
              _hover={{ color: "fg" }}
            >
              {group.label}
              <Box
                as="span"
                display="inline-flex"
                css={{
                  transition: "transform 0.15s",
                  "[data-state=open] > &": { transform: "rotate(180deg)" },
                }}
              >
                <LuChevronDown size={14} aria-hidden="true" />
              </Box>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Flex direction="column" gap="0.5" mt="1">
                {group.items.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    active={pathname === item.href}
                    collapsed={false}
                    onNavigate={onNavigate}
                  />
                ))}
              </Flex>
            </Collapsible.Content>
          </Collapsible.Root>
        ),
      )}
    </Box>
  )
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex
      align="center"
      justify={collapsed ? "center" : "flex-start"}
      gap="2"
      h="11"
      px={collapsed ? "0" : "3"}
    >
      <Flex
        align="center"
        justify="center"
        boxSize="6"
        rounded="l2"
        bg="brand.solid"
        color="brand.contrast"
        fontFamily="heading"
        fontWeight="bold"
        aria-hidden="true"
        flexShrink={0}
      >
        L
      </Flex>
      {!collapsed && (
        <Heading as="p" size="lg" fontWeight="semibold">
          Lumen
        </Heading>
      )}
    </Flex>
  )
}

function UserBlock({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex
      align="center"
      justify={collapsed ? "center" : "flex-start"}
      gap="2"
      p="2"
      borderTopWidth="1px"
    >
      <Avatar name={user.name} size="xs" colorPalette="brand" />
      {!collapsed && (
        <Box minW="0">
          <Text textStyle="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text textStyle="xs" color="fg.muted" truncate>
            {user.role}
          </Text>
        </Box>
      )}
    </Flex>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const crumbs = crumbsFor(pathname)

  return (
    <Flex minH="100dvh" bg="bg" color="fg" colorPalette="brand">
      <SkipNavLink>Skip to content</SkipNavLink>

      {/* Desktop sidebar */}
      <Box
        as="aside"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? "52px" : "224px"}
        borderEndWidth="1px"
        bg="bg.subtle"
        css={{ transition: "width 0.15s ease" }}
      >
        <Brand collapsed={collapsed} />
        <Box flex="1" overflowY="auto" px="2" py="2">
          <NavList
            label="Primary"
            collapsed={collapsed}
            pathname={pathname}
          />
        </Box>
        <UserBlock collapsed={collapsed} />
      </Box>

      {/* Phone drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent colorPalette="brand">
          <DrawerHeader>
            <DrawerTitle fontFamily="heading">Lumen</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <NavList
              label="Mobile"
              collapsed={false}
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          align="center"
          gap="2"
          h="11"
          px={{ base: "3", md: "4" }}
          borderBottomWidth="1px"
          bg="bg"
          position="sticky"
          top="0"
          zIndex="sticky"
        >
          <IconButton
            variant="ghost"
            size="sm"
            display={{ base: "inline-flex", md: "none" }}
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            display={{ base: "none", md: "inline-flex" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
          </IconButton>

          <Box minW="0" flex="1">
            <BreadcrumbRoot size="sm" separatorGap="1.5">
              <BreadcrumbLink asChild>
                <NextLink href="/">Lumen</NextLink>
              </BreadcrumbLink>
              <span>{crumbs.group}</span>
              <BreadcrumbCurrentLink>{crumbs.label}</BreadcrumbCurrentLink>
            </BreadcrumbRoot>
          </Box>

          <ColorModeButton />
        </Flex>

        <SkipNavContent />
        <Box
          as="main"
          flex="1"
          minW="0"
          px={{ base: "3", md: "5" }}
          py={{ base: "4", md: "5" }}
          maxW="6xl"
          w="full"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
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
  title: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
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

```tsx app/page.tsx
"use client"

import NextLink from "next/link"
import {
  Badge,
  Card,
  Heading,
  Link,
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { formatDate, projects, user } from "@/lib/data"

const statusColor = {
  Active: "brand",
  Paused: "orange",
  Archived: "gray",
} as const

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active")
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0]
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))
  const firstName = user.name.split(" ")[0]

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: "1 paused, 1 archived" },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open` },
    { label: "Last update", value: formatDate(latest[0].updated), note: latest[0].name },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your workspace stands today."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="3" mb="5">
        {cards.map((card) => (
          <Card.Root key={card.label} variant="outline">
            <Card.Body gap="0.5">
              <Text textStyle="xs" color="fg.muted" textTransform="uppercase" letterSpacing="0.05em">
                {card.label}
              </Text>
              <Text
                fontFamily="heading"
                fontSize="2xl"
                fontWeight="semibold"
                fontVariantNumeric="tabular-nums"
              >
                {card.value}
              </Text>
              <Text textStyle="xs" color="fg.muted">
                {card.note}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root variant="outline">
        <Card.Header display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Heading as="h2" size="md" fontWeight="semibold">
            Recently updated
          </Heading>
          <Link asChild textStyle="sm">
            <NextLink href="/projects">View all projects</NextLink>
          </Link>
        </Card.Header>
        <Card.Body p="0">
          <Table.ScrollArea>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Project</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
                  <Table.ColumnHeader>Updated</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {latest.slice(0, 4).map((p) => (
                  <Table.Row key={p.key}>
                    <Table.Cell>
                      <Text as="span" fontFamily="mono" textStyle="xs" color="fg.muted" mr="2">
                        {p.key}
                      </Text>
                      {p.name}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge size="sm" variant="subtle" colorPalette={statusColor[p.status]}>
                        {p.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                      {p.issues}
                    </Table.Cell>
                    <Table.Cell>{formatDate(p.updated)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Card.Body>
      </Card.Root>
    </>
  )
}
```

```tsx app/projects/page.tsx
"use client"

import { useState } from "react"
import { Badge, Box, Table, Text } from "@chakra-ui/react"
import { LuSearch } from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { Input } from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { formatDate, projects } from "@/lib/data"

const statusColor = {
  Active: "brand",
  Paused: "orange",
  Archived: "gray",
} as const

export default function ProjectsPage() {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const rows = projects.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
  )

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in this workspace`}
      />

      <Box mb="3" maxW={{ base: "full", sm: "xs" }}>
        <Field label="Filter projects" labelProps={{ srOnly: true } as never}>
          <InputGroup w="full" startElement={<LuSearch />}>
            <Input
              placeholder="Filter by name or key"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
        </Field>
      </Box>

      <Table.ScrollArea borderWidth="1px" rounded="l2">
        <Table.Root size="sm" minW="520px">
          <Table.Caption srOnly>Lumen projects</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Project</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
              <Table.ColumnHeader>Updated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text color="fg.muted" py="2">
                    No projects match &ldquo;{query}&rdquo;.
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              rows.map((p) => (
                <Table.Row key={p.key}>
                  <Table.Cell fontFamily="mono" textStyle="xs">
                    {p.key}
                  </Table.Cell>
                  <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                  <Table.Cell>
                    <Badge size="sm" variant="subtle" colorPalette={statusColor[p.status]}>
                      {p.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                    {p.issues}
                  </Table.Cell>
                  <Table.Cell>{formatDate(p.updated)}</Table.Cell>
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

```tsx app/reports/page.tsx
"use client"

import { Table } from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { formatDate, reports } from "@/lib/data"

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Scheduled reports sent to your team."
      />
      <Table.ScrollArea borderWidth="1px" rounded="l2">
        <Table.Root size="sm" minW="520px">
          <Table.Caption srOnly>Scheduled reports</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Report</Table.ColumnHeader>
              <Table.ColumnHeader>Schedule</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Recipients</Table.ColumnHeader>
              <Table.ColumnHeader>Last run</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.map((r) => (
              <Table.Row key={r.name}>
                <Table.Cell fontWeight="medium">{r.name}</Table.Cell>
                <Table.Cell>{r.schedule}</Table.Cell>
                <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                  {r.recipients}
                </Table.Cell>
                <Table.Cell>{formatDate(r.lastRun)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </>
  )
}
```

```tsx app/settings/page.tsx
"use client"

import { useState } from "react"
import { Button, Card, Heading, Input, Stack } from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { PageHeader } from "@/components/page-header"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile and notification preferences."
      />

      <Stack
        as="form"
        gap="4"
        maxW="xl"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault()
          toaster.create({
            title: "Settings saved",
            description: "Your changes have been applied.",
            type: "success",
          })
        }}
      >
        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h2" size="md" fontWeight="semibold">
              Profile
            </Heading>
          </Card.Header>
          <Card.Body gap="3">
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Email" helperText={`Role: ${user.role}`}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h2" size="md" fontWeight="semibold">
              Notifications
            </Heading>
          </Card.Header>
          <Card.Body gap="3">
            <Switch colorPalette="brand" defaultChecked>
              Weekly digest by email
            </Switch>
            <Switch colorPalette="brand" defaultChecked>
              Notify me when an issue is assigned to me
            </Switch>
            <Switch colorPalette="brand">Product updates and tips</Switch>
          </Card.Body>
        </Card.Root>

        <Button type="submit" colorPalette="brand" alignSelf="flex-start">
          Save changes
        </Button>
      </Stack>
    </>
  )
}
```
