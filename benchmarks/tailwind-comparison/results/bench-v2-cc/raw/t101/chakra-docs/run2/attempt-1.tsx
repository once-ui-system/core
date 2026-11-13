```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Lumen's identity lives here: tokens, semantic tokens, fonts, radii and global styles.
const config = defineConfig({
  globalCss: {
    // Brand teal becomes the default colour palette: primary buttons, switches,
    // links (colorPalette.fg) and focus rings all follow it.
    html: { colorPalette: "brand" },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#f0fdfa" },
          100: { value: "#ccfbf1" },
          200: { value: "#99f6e4" },
          300: { value: "#5eead4" },
          400: { value: "#2dd4bf" },
          500: { value: "#14b8a6" },
          600: { value: "#0d9488" },
          700: { value: "#0f766e" },
          800: { value: "#115e59" },
          900: { value: "#134e4a" },
          950: { value: "#042f2e" },
        },
        // Cool slate neutrals replace Chakra's gray scale.
        gray: {
          50: { value: "#f8fafc" },
          100: { value: "#f1f5f9" },
          200: { value: "#e2e8f0" },
          300: { value: "#cbd5e1" },
          400: { value: "#94a3b8" },
          500: { value: "#64748b" },
          600: { value: "#475569" },
          700: { value: "#334155" },
          800: { value: "#1e293b" },
          900: { value: "#0f172a" },
          950: { value: "#020617" },
        },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "2px" },
        l2: { value: "2px" },
        l3: { value: "2px" },
      },
      colors: {
        brand: {
          solid: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.500}" } },
          contrast: { value: { _light: "white", _dark: "{colors.brand.950}" } },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" } },
        },
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
  description: "Product analytics and issue tracking for small software teams.",
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
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
]

export interface Report {
  name: string
  period: string
  owner: string
  generated: string
}

export const reports: Report[] = [
  { name: "Weekly issue throughput", period: "6 Oct to 12 Oct 2026", owner: "Maya Okafor", generated: "2026-10-13" },
  { name: "Active users by project", period: "September 2026", owner: "Maya Okafor", generated: "2026-10-01" },
  { name: "Cycle time by status", period: "Q3 2026", owner: "Maya Okafor", generated: "2026-10-02" },
  { name: "Archived project summary", period: "Q3 2026", owner: "Maya Okafor", generated: "2026-09-30" },
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
```

```ts lib/nav.ts
import type { IconType } from "react-icons"
import {
  LuFileText,
  LuFolderKanban,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu"

export interface NavItemData {
  label: string
  href: string
  icon: IconType
}

export interface NavGroupData {
  label: string
  items: NavItemData[]
}

export const navGroups: NavGroupData[] = [
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
      { label: "Projects", href: "/projects", icon: LuFolderKanban },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
]

export function findNav(pathname: string) {
  for (const group of navGroups) {
    const item = group.items.find((i) => i.href === pathname)
    if (item) return { group: group.label, label: item.label }
  }
  return { group: "Lumen", label: "Page" }
}
```

```tsx components/nav-list.tsx
"use client"

import { Box, Collapsible, Flex, Link, Separator, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuChevronDown } from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { navGroups, type NavGroupData, type NavItemData } from "@/lib/nav"

interface NavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

function NavItem({
  item,
  collapsed,
  onNavigate,
}: NavProps & { item: NavItemData }) {
  const pathname = usePathname()
  const active = pathname === item.href
  const Icon = item.icon
  return (
    <Tooltip
      content={item.label}
      disabled={!collapsed}
      positioning={{ placement: "right" }}
    >
      <Link
        asChild
        display="flex"
        alignItems="center"
        gap="2"
        h="8"
        px={collapsed ? "0" : "2.5"}
        justifyContent={collapsed ? "center" : "flex-start"}
        rounded="l2"
        textStyle="sm"
        fontWeight="medium"
        textDecoration="none"
        bg={active ? "brand.solid" : "transparent"}
        color={active ? "brand.contrast" : "fg"}
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
          <Icon aria-hidden size={16} />
          {!collapsed && <span>{item.label}</span>}
        </NextLink>
      </Link>
    </Tooltip>
  )
}

function ItemList({
  group,
  collapsed,
  onNavigate,
}: NavProps & { group: NavGroupData }) {
  return (
    <ul
      aria-label={group.label}
      style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}
    >
      {group.items.map((item) => (
        <li key={item.href}>
          <NavItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  )
}

function NavGroup({
  group,
  collapsed,
  onNavigate,
  first,
}: NavProps & { group: NavGroupData; first: boolean }) {
  if (collapsed) {
    return (
      <Box>
        {!first && <Separator my="2" />}
        <ItemList group={group} collapsed onNavigate={onNavigate} />
      </Box>
    )
  }
  return (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger
        display="flex"
        w="full"
        alignItems="center"
        justifyContent="space-between"
        h="7"
        px="2.5"
        mb="0.5"
        rounded="l2"
        cursor="pointer"
        color="fg.muted"
        textStyle="xs"
        fontWeight="semibold"
        letterSpacing="wider"
        textTransform="uppercase"
        _hover={{ color: "fg" }}
      >
        <Text as="span">{group.label}</Text>
        <LuChevronDown aria-hidden size={14} />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <ItemList group={group} onNavigate={onNavigate} />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export function NavList({ collapsed = false, onNavigate }: NavProps) {
  return (
    <Box as="nav" aria-label="Primary">
      <Stack gap={collapsed ? "0" : "3"}>
        {navGroups.map((group, i) => (
          <NavGroup
            key={group.label}
            group={group}
            collapsed={collapsed}
            onNavigate={onNavigate}
            first={i === 0}
          />
        ))}
      </Stack>
    </Box>
  )
}
```

```tsx components/app-shell.tsx
"use client"

import { Box, Flex, IconButton, Link, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu"
import { NavList } from "@/components/nav-list"
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
import { user } from "@/lib/data"
import { findNav } from "@/lib/nav"

function Brand({ showName = true }: { showName?: boolean }) {
  return (
    <Link
      asChild
      display="flex"
      alignItems="center"
      gap="2"
      textDecoration="none"
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/" aria-label="Lumen home">
        <Flex
          boxSize="6"
          align="center"
          justify="center"
          rounded="l2"
          bg="brand.solid"
          color="brand.contrast"
          fontFamily="heading"
          fontWeight="bold"
          textStyle="sm"
          aria-hidden
        >
          L
        </Flex>
        {showName && (
          <Text as="span" fontFamily="heading" fontWeight="semibold" textStyle="lg" color="fg">
            Lumen
          </Text>
        )}
      </NextLink>
    </Link>
  )
}

function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex
      as="aside"
      hideBelow="md"
      direction="column"
      flexShrink={0}
      w={collapsed ? "14" : "60"}
      transition="width 0.15s ease"
      position="sticky"
      top="0"
      h="100dvh"
      bg="bg.subtle"
      borderEndWidth="1px"
      aria-label="Sidebar"
    >
      <Flex h="12" align="center" px={collapsed ? "0" : "4"} justify={collapsed ? "center" : "flex-start"} borderBottomWidth="1px">
        <Brand showName={!collapsed} />
      </Flex>
      <Box flex="1" overflowY="auto" overflowX="hidden" p="2">
        <NavList collapsed={collapsed} />
      </Box>
      <Flex
        align="center"
        gap="2"
        p="2"
        borderTopWidth="1px"
        justify={collapsed ? "center" : "flex-start"}
      >
        <Avatar name={user.name} size="xs" />
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
    </Flex>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const current = findNav(pathname)

  return (
    <Flex minH="100dvh" bg="bg">
      <Link
        href="#main"
        position="absolute"
        left="2"
        top="2"
        zIndex="max"
        px="3"
        py="1.5"
        bg="bg"
        color="fg"
        rounded="l2"
        borderWidth="1px"
        transform="translateY(-200%)"
        _focus={{ transform: "none" }}
      >
        Skip to content
      </Link>

      <Sidebar collapsed={collapsed} />

      <DrawerRoot
        placement="start"
        size="xs"
        open={menuOpen}
        onOpenChange={(e) => setMenuOpen(e.open)}
      >
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" py="3">
            <DrawerTitle>
              <Brand />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody p="2">
            <NavList onNavigate={() => setMenuOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="12"
          px={{ base: "3", md: "4" }}
          align="center"
          gap="2"
          bg="bg"
          borderBottomWidth="1px"
        >
          <IconButton
            hideFrom="md"
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            hideBelow="md"
            variant="ghost"
            size="sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
          </IconButton>
          <BreadcrumbRoot size="sm" separator="/" separatorGap="1.5">
            <Text as="span" color="fg.muted">
              {current.group}
            </Text>
            <BreadcrumbCurrentLink>{current.label}</BreadcrumbCurrentLink>
          </BreadcrumbRoot>
          <Box flex="1" />
          <ColorModeButton />
          <Avatar name={user.name} size="xs" />
        </Flex>

        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          w="full"
          maxW="1100px"
          p={{ base: "4", md: "6" }}
          _focus={{ outline: "none" }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
```

```tsx components/projects-table.tsx
"use client"

import { Badge, Table } from "@chakra-ui/react"
import { formatDate, type Project, type ProjectStatus } from "@/lib/data"

const statusPalette: Record<ProjectStatus, string> = {
  Active: "brand",
  Paused: "orange",
  Archived: "gray",
}

export function ProjectsTable({
  items,
  label,
}: {
  items: Project[]
  label: string
}) {
  return (
    <Table.ScrollArea
      borderWidth="1px"
      rounded="l2"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <Table.Root size="sm" interactive>
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader>Key</Table.ColumnHeader>
            <Table.ColumnHeader>Project</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Updated</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((p) => (
            <Table.Row key={p.key}>
              <Table.Cell fontWeight="medium">{p.key}</Table.Cell>
              <Table.Cell>{p.name}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={statusPalette[p.status]} variant="subtle" size="sm">
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
  )
}
```

```tsx app/page.tsx
"use client"

import { Box, Card, Grid, Heading, Link, Stat, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { ProjectsTable } from "@/components/projects-table"
import { formatDate, projects, user } from "@/lib/data"

export default function DashboardPage() {
  const totalIssues = projects.reduce((n, p) => n + p.issues, 0)
  const active = projects.filter((p) => p.status === "Active").length
  const paused = projects.filter((p) => p.status === "Paused").length
  const archived = projects.filter((p) => p.status === "Archived").length
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0]
  const byUpdated = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))
  const latest = byUpdated[0]

  const cards = [
    { label: "Open issues", value: String(totalIssues), help: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active), help: `${paused} paused, ${archived} archived` },
    { label: "Busiest project", value: busiest.key, help: `${busiest.name}, ${busiest.issues} open issues` },
    { label: "Last activity", value: formatDate(latest.updated), help: latest.name },
  ]

  return (
    <Box>
      <Heading as="h1" size="xl" mb="1">
        Welcome back, {user.name.split(" ")[0]}
      </Heading>
      <Text color="fg.muted" textStyle="sm" mb="5">
        Here is where the workspace at Acme Labs stands today.
      </Text>

      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }}
        gap="3"
        mb="6"
      >
        {cards.map((c) => (
          <Card.Root key={c.label} size="sm" variant="outline">
            <Card.Body>
              <Stat.Root>
                <Stat.Label>{c.label}</Stat.Label>
                <Stat.ValueText fontFamily="heading">{c.value}</Stat.ValueText>
                <Stat.HelpText>{c.help}</Stat.HelpText>
              </Stat.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      <Box as="section" aria-labelledby="recent-heading">
        <Box display="flex" justifyContent="space-between" alignItems="baseline" mb="2">
          <Heading as="h2" id="recent-heading" size="md">
            Recently updated
          </Heading>
          <Link asChild color="brand.fg" textStyle="sm">
            <NextLink href="/projects">View all projects</NextLink>
          </Link>
        </Box>
        <ProjectsTable items={byUpdated.slice(0, 3)} label="Recently updated projects" />
      </Box>
    </Box>
  )
}
```

```tsx app/projects/page.tsx
"use client"

import { Box, Heading, Text } from "@chakra-ui/react"
import { ProjectsTable } from "@/components/projects-table"
import { projects } from "@/lib/data"

export default function ProjectsPage() {
  const total = projects.reduce((n, p) => n + p.issues, 0)
  return (
    <Box>
      <Heading as="h1" size="xl" mb="1">
        Projects
      </Heading>
      <Text color="fg.muted" textStyle="sm" mb="4">
        {projects.length} projects, {total} open issues in total.
      </Text>
      <ProjectsTable items={projects} label="All projects" />
    </Box>
  )
}
```

```tsx app/reports/page.tsx
"use client"

import { Box, Heading, Table, Text } from "@chakra-ui/react"
import { formatDate, reports } from "@/lib/data"

export default function ReportsPage() {
  return (
    <Box>
      <Heading as="h1" size="xl" mb="1">
        Reports
      </Heading>
      <Text color="fg.muted" textStyle="sm" mb="4">
        Scheduled reports generated for your workspace.
      </Text>
      <Table.ScrollArea borderWidth="1px" rounded="l2" role="region" aria-label="Reports" tabIndex={0}>
        <Table.Root size="sm" interactive>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader>Report</Table.ColumnHeader>
              <Table.ColumnHeader>Period</Table.ColumnHeader>
              <Table.ColumnHeader>Owner</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Generated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.map((r) => (
              <Table.Row key={r.name}>
                <Table.Cell fontWeight="medium">{r.name}</Table.Cell>
                <Table.Cell>{r.period}</Table.Cell>
                <Table.Cell>{r.owner}</Table.Cell>
                <Table.Cell textAlign="end" whiteSpace="nowrap">
                  <time dateTime={r.generated}>{formatDate(r.generated)}</time>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  )
}
```

```tsx app/settings/page.tsx
"use client"

import { Box, Button, Card, Heading, Input, Stack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { Field } from "@/components/ui/field"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [timezone, setTimezone] = useState("Europe/London")
  const [digest, setDigest] = useState(true)
  const [assigned, setAssigned] = useState(true)
  const [mentions, setMentions] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toaster.create({
      title: "Settings saved",
      description: "Your profile and notification preferences are up to date.",
      type: "success",
    })
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb="1">
        Settings
      </Heading>
      <Text color="fg.muted" textStyle="sm" mb="4">
        Manage your profile and how Lumen keeps you informed.
      </Text>

      <form onSubmit={onSubmit}>
        <Stack gap="4" maxW="2xl">
          <Card.Root size="sm" variant="outline">
            <Card.Header>
              <Heading as="h2" size="md">
                Profile
              </Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap="3">
                <Field label="Full name">
                  <Input size="sm" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </Field>
                <Field label="Email" helperText="Used for sign-in and notifications.">
                  <Input size="sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </Field>
                <Field label="Role" helperText="Only another owner can change roles.">
                  <Input size="sm" value={user.role} readOnly />
                </Field>
                <Field label="Time zone">
                  <NativeSelectRoot size="sm">
                    <NativeSelectField
                      value={timezone}
                      onChange={(e) => setTimezone(e.currentTarget.value)}
                      items={["Europe/London", "Europe/Berlin", "America/New_York", "Asia/Tokyo"]}
                    />
                  </NativeSelectRoot>
                </Field>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root size="sm" variant="outline">
            <Card.Header>
              <Heading as="h2" size="md">
                Notifications
              </Heading>
            </Card.Header>
            <Card.Body>
              <Stack gap="3">
                <Switch size="sm" checked={digest} onCheckedChange={(e) => setDigest(e.checked)}>
                  Weekly digest of project activity
                </Switch>
                <Switch size="sm" checked={assigned} onCheckedChange={(e) => setAssigned(e.checked)}>
                  Email me when an issue is assigned to me
                </Switch>
                <Switch size="sm" checked={mentions} onCheckedChange={(e) => setMentions(e.checked)}>
                  Email me when I am mentioned
                </Switch>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Box>
            <Button type="submit" size="sm">
              Save changes
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  )
}
```
