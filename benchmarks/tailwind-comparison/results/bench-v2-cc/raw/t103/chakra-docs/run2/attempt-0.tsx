```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Lumen's identity lives in the design system: brand and stone-grey tokens,
// semantic tokens for the brand palette, font tokens, 4px radii, and a global
// default colour palette so primary buttons, links, focus rings and the
// current nav item follow the brand everywhere (portals included).
const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "brand",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fff4ec" },
          100: { value: "#ffe5d1" },
          200: { value: "#ffc9a1" },
          300: { value: "#ffa766" },
          400: { value: "#f77d30" },
          500: { value: "#e8590c" },
          600: { value: "#c94a08" },
          700: { value: "#a03c0a" },
          800: { value: "#7a2f0c" },
          900: { value: "#4f1f0a" },
          950: { value: "#2b1005" },
        },
        // Warm stone grey replaces the default neutral scale.
        gray: {
          50: { value: "#fafaf9" },
          100: { value: "#f5f5f4" },
          200: { value: "#e7e5e4" },
          300: { value: "#d6d3d1" },
          400: { value: "#a8a29e" },
          500: { value: "#78716c" },
          600: { value: "#57534e" },
          700: { value: "#44403c" },
          800: { value: "#292524" },
          900: { value: "#1c1917" },
          950: { value: "#0c0a09" },
        },
      },
      fonts: {
        heading: {
          value: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
        },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
        mono: {
          value: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          // Dark text on the orange fill keeps button labels above 4.5:1.
          contrast: { value: "{colors.gray.950}" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          muted: {
            value: { _light: "{colors.brand.100}", _dark: "{colors.brand.950}" },
          },
          subtle: {
            value: { _light: "{colors.brand.200}", _dark: "{colors.brand.900}" },
          },
          emphasized: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.800}" },
          },
          border: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
          },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
      // 4px corners on buttons, inputs, cards and menus.
      radii: {
        l1: { value: "{radii.sm}" },
        l2: { value: "{radii.sm}" },
        l3: { value: "{radii.sm}" },
      },
    },
    recipes: {
      link: {
        base: {
          color: "colorPalette.fg",
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
      <ColorModeProvider defaultTheme="dark" enableSystem={false} {...props} />
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
  Paused: "yellow",
  Archived: "gray",
}

export const activeProjects = projects.filter((p) => p.status === "Active")
export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0)
export const busiestProject = projects.reduce((a, b) =>
  b.issues > a.issues ? b : a,
)
export const maxIssues = Math.max(...projects.map((p) => p.issues))
export const recentlyUpdated = [...projects].sort((a, b) =>
  b.updated.localeCompare(a.updated),
)

// Fixed locale and time zone so server and client render the same text.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
```

```ts components/shell/nav-config.ts
import type { IconType } from "react-icons"
import {
  LuFileText,
  LuFolder,
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
      { label: "Projects", href: "/projects", icon: LuFolder },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
]

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function findCurrent(
  pathname: string,
): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group, item }
    }
  }
  return null
}
```

```tsx components/shell/app-shell.tsx
"use client"

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  Separator,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  LuChevronDown,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu"
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
import {
  type NavGroup,
  type NavItem,
  findCurrent,
  isActive,
  navGroups,
} from "./nav-config"

function Brand({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <Link
      asChild
      display="flex"
      alignItems="center"
      gap="3"
      color="fg"
      justifyContent={collapsed ? "center" : "flex-start"}
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/" aria-label="Lumen home" onClick={onNavigate}>
        <Flex
          boxSize="8"
          flexShrink="0"
          align="center"
          justify="center"
          rounded="l2"
          bg="brand.solid"
          color="brand.contrast"
          fontFamily="heading"
          fontWeight="bold"
          aria-hidden="true"
        >
          L
        </Flex>
        {!collapsed && (
          <Text
            as="span"
            fontFamily="heading"
            fontWeight="semibold"
            letterSpacing="0.12em"
            fontSize="sm"
          >
            LUMEN
          </Text>
        )}
      </NextLink>
    </Link>
  )
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
      gap="3"
      px="3"
      py="2"
      rounded="l2"
      fontSize="sm"
      fontWeight="medium"
      justifyContent={collapsed ? "center" : "flex-start"}
      color={active ? "brand.fg" : "fg.muted"}
      bg={active ? "brand.muted" : "transparent"}
      borderStartWidth="2px"
      borderStartColor={active ? "brand.solid" : "transparent"}
      _hover={{
        textDecoration: "none",
        bg: active ? "brand.muted" : "bg.muted",
        color: active ? "brand.fg" : "fg",
      }}
    >
      <NextLink
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        onClick={onNavigate}
      >
        <Icon size={18} aria-hidden="true" />
        {!collapsed && <span>{item.label}</span>}
      </NextLink>
    </Link>
  )

  return (
    <Tooltip
      content={item.label}
      positioning={{ placement: "right" }}
      disabled={!collapsed}
    >
      {link}
    </Tooltip>
  )
}

function NavGroupSection({
  group,
  pathname,
  collapsed,
  onNavigate,
}: {
  group: NavGroup
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  const [open, setOpen] = React.useState(true)
  const listId = `nav-group-${group.id}`
  const expanded = collapsed || open

  return (
    <Box as="li" listStyleType="none">
      {collapsed ? (
        <Separator my="3" />
      ) : (
        <HStack
          as="button"
          type="button"
          w="full"
          justify="space-between"
          px="3"
          py="1.5"
          mb="1"
          rounded="l2"
          color="fg.subtle"
          fontFamily="heading"
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="0.1em"
          textTransform="uppercase"
          cursor="pointer"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          _hover={{ color: "fg" }}
          focusVisibleRing="outside"
        >
          <span>{group.label}</span>
          <Box
            as="span"
            display="inline-flex"
            transition="transform 0.15s"
            transform={open ? "rotate(0deg)" : "rotate(-90deg)"}
          >
            <LuChevronDown size={14} aria-hidden="true" />
          </Box>
        </HStack>
      )}
      <Box id={listId} hidden={!expanded}>
        <Box
          as="ul"
          m="0"
          p="0"
          listStyleType="none"
          display="flex"
          flexDirection="column"
          gap="1"
          aria-label={collapsed ? group.label : undefined}
        >
          {group.items.map((item) => (
            <li key={item.href}>
              <NavItemLink
                item={item}
                active={isActive(pathname, item.href)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function SidebarNav({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <Box as="nav" aria-label="Primary" px="3" py="2" flex="1" overflowY="auto">
      <Box
        as="ul"
        m="0"
        p="0"
        listStyleType="none"
        display="flex"
        flexDirection="column"
        gap="2"
      >
        {navGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </Box>
    </Box>
  )
}

function UserBlock({ collapsed }: { collapsed: boolean }) {
  return (
    <HStack
      gap="3"
      p="3"
      borderTopWidth="1px"
      justify={collapsed ? "center" : "flex-start"}
    >
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.role} · {user.email}
          </Text>
        </Box>
      )}
    </HStack>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const current = findCurrent(pathname)

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <Flex minH="100dvh" bg="bg" color="fg">
      <Link
        href="#main"
        position="absolute"
        left="2"
        top="2"
        zIndex="toast"
        px="3"
        py="2"
        rounded="l2"
        bg="brand.solid"
        color="brand.contrast"
        transform="translateY(-250%)"
        _focus={{ transform: "translateY(0)" }}
      >
        Skip to content
      </Link>

      <Box
        as="aside"
        id="sidebar"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        flexShrink="0"
        position="sticky"
        top="0"
        h="100dvh"
        w={collapsed ? "64px" : "264px"}
        bg="bg.subtle"
        borderEndWidth="1px"
        transition="width 0.15s ease"
      >
        <Flex h="14" align="center" px="3" borderBottomWidth="1px">
          <Brand collapsed={collapsed} />
        </Flex>
        <SidebarNav pathname={pathname} collapsed={collapsed} />
        <UserBlock collapsed={collapsed} />
      </Box>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="14"
          align="center"
          gap="3"
          px={{ base: "4", md: "6" }}
          bg="bg"
          borderBottomWidth="1px"
        >
          <IconButton
            variant="ghost"
            colorPalette="gray"
            size="sm"
            display={{ base: "inline-flex", md: "none" }}
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            variant="ghost"
            colorPalette="gray"
            size="sm"
            display={{ base: "none", md: "inline-flex" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="sidebar"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
          </IconButton>

          <Box flex="1" minW="0">
            {current && (
              <BreadcrumbRoot>
                <Text as="span" color="fg.muted">
                  {current.group.label}
                </Text>
                <BreadcrumbCurrentLink>{current.item.label}</BreadcrumbCurrentLink>
              </BreadcrumbRoot>
            )}
          </Box>

          <ColorModeButton />
          <Avatar
            name={user.name}
            size="xs"
            display={{ base: "none", sm: "inline-flex" }}
          />
        </Flex>

        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          px={{ base: "4", md: "8" }}
          py={{ base: "6", md: "8" }}
          outline="none"
        >
          <Box maxW="1200px" mx="auto" w="full">
            {children}
          </Box>
        </Box>
      </Flex>

      <DrawerRoot
        open={mobileOpen}
        onOpenChange={(e) => setMobileOpen(e.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent bg="bg.subtle">
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerTitle fontFamily="heading" letterSpacing="0.1em">
              LUMEN
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody p="0" display="flex" flexDirection="column">
            <SidebarNav
              pathname={pathname}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
            <UserBlock collapsed={false} />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  )
}
```

```tsx components/page-header.tsx
"use client"

import { Heading, Stack, Text } from "@chakra-ui/react"
import type * as React from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <Stack
      direction={{ base: "column", sm: "row" }}
      justify="space-between"
      align={{ base: "flex-start", sm: "flex-end" }}
      gap="3"
      mb="6"
    >
      <Stack gap="1">
        <Heading as="h1" size="2xl">
          {title}
        </Heading>
        <Text color="fg.muted">{description}</Text>
      </Stack>
      {actions}
    </Stack>
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

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Stat,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { LuActivity, LuBug, LuClock, LuFolder } from "react-icons/lu"
import { PageHeader } from "@/components/page-header"
import {
  activeProjects,
  busiestProject,
  formatDate,
  projects,
  recentlyUpdated,
  totalIssues,
  user,
} from "@/lib/data"

const summary = [
  {
    label: "Active projects",
    value: String(activeProjects.length),
    help: `of ${projects.length} projects`,
    icon: LuFolder,
  },
  {
    label: "Open issues",
    value: String(totalIssues),
    help: "across all projects",
    icon: LuBug,
  },
  {
    label: "Busiest project",
    value: busiestProject.key,
    help: `${busiestProject.name}, ${busiestProject.issues} issues`,
    icon: LuActivity,
  },
  {
    label: "Last update",
    value: formatDate(recentlyUpdated[0].updated),
    help: recentlyUpdated[0].name,
    icon: LuClock,
  },
]

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0]
  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your workspace stands today."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb="8">
        {summary.map((item) => {
          const Icon = item.icon
          return (
            <Card.Root key={item.label} variant="outline">
              <Card.Body>
                <Flex justify="space-between" align="flex-start" gap="3">
                  <Stat.Root>
                    <Stat.Label>{item.label}</Stat.Label>
                    <Stat.ValueText fontFamily="heading" fontSize="2xl">
                      {item.value}
                    </Stat.ValueText>
                    <Stat.HelpText>{item.help}</Stat.HelpText>
                  </Stat.Root>
                  <Box color="brand.fg" aria-hidden="true">
                    <Icon size={20} />
                  </Box>
                </Flex>
              </Card.Body>
            </Card.Root>
          )
        })}
      </SimpleGrid>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading as="h2" size="md">
            Recently updated
          </Heading>
        </Card.Header>
        <Card.Body pt="0">
          <Stack as="ul" m="0" p="0" listStyleType="none" gap="0">
            {recentlyUpdated.slice(0, 4).map((project) => (
              <Flex
                as="li"
                key={project.key}
                align="center"
                gap="3"
                py="3"
                borderTopWidth="1px"
                wrap="wrap"
              >
                <Badge variant="outline" fontFamily="heading">
                  {project.key}
                </Badge>
                <Link asChild fontWeight="medium" flex="1" minW="40">
                  <NextLink href="/projects">{project.name}</NextLink>
                </Link>
                <Text fontSize="sm" color="fg.muted">
                  {project.issues} open · {formatDate(project.updated)}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </>
  )
}
```

```tsx app/projects/page.tsx
"use client"

import {
  Badge,
  Box,
  Input,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { LuSearch } from "react-icons/lu"
import { PageHeader } from "@/components/page-header"
import { InputGroup } from "@/components/ui/input-group"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select"
import { formatDate, projects, statusPalette } from "@/lib/data"

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")

  const visible = projects.filter((p) => {
    const matchesStatus = status === "all" || p.status === status
    const q = query.trim().toLowerCase()
    const matchesQuery =
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q)
    return matchesStatus && matchesQuery
  })

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the workspace with its open issues."
      />

      <Stack direction={{ base: "column", sm: "row" }} gap="3" mb="4">
        <InputGroup
          flex="1"
          maxW={{ sm: "sm" }}
          startElement={<LuSearch aria-hidden="true" />}
        >
          <Input
            type="search"
            placeholder="Search by name or key"
            aria-label="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <NativeSelectRoot width={{ base: "full", sm: "48" }}>
          <NativeSelectField
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.currentTarget.value)}
            items={[
              { value: "all", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Paused", label: "Paused" },
              { value: "Archived", label: "Archived" },
            ]}
          />
        </NativeSelectRoot>
      </Stack>

      <Text fontSize="sm" color="fg.muted" mb="2" aria-live="polite">
        {visible.length} of {projects.length} projects
      </Text>

      <Box borderWidth="1px" rounded="l3" overflow="hidden">
        <Table.ScrollArea>
          <Table.Root size="md">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Key</Table.ColumnHeader>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Updated</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visible.map((p) => (
                <Table.Row key={p.key}>
                  <Table.Cell fontFamily="heading" fontWeight="semibold">
                    {p.key}
                  </Table.Cell>
                  <Table.Cell>{p.name}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={statusPalette[p.status]}>{p.status}</Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                  <Table.Cell textAlign="end" whiteSpace="nowrap">
                    {formatDate(p.updated)}
                  </Table.Cell>
                </Table.Row>
              ))}
              {visible.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" color="fg.muted" py="8">
                    No projects match your filters.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </>
  )
}
```

```tsx app/reports/page.tsx
"use client"

import {
  Badge,
  Card,
  Flex,
  Heading,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import {
  type ProjectStatus,
  maxIssues,
  projects,
  statusPalette,
} from "@/lib/data"

const statuses: ProjectStatus[] = ["Active", "Paused", "Archived"]

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Where open issues sit across the workspace."
      />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="4">
        <Card.Root variant="outline" gridColumn={{ lg: "span 2" }}>
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by project
            </Heading>
          </Card.Header>
          <Card.Body pt="0">
            <Stack gap="4">
              {projects.map((p) => (
                <Stack key={p.key} gap="1">
                  <Flex justify="space-between" gap="3" fontSize="sm">
                    <Text>
                      <Text as="span" fontFamily="heading" fontWeight="semibold">
                        {p.key}
                      </Text>{" "}
                      <Text as="span" color="fg.muted">
                        {p.name}
                      </Text>
                    </Text>
                    <Text fontWeight="medium">{p.issues}</Text>
                  </Flex>
                  <Progress.Root
                    value={p.issues}
                    max={maxIssues}
                    size="sm"
                    aria-label={`${p.name}: ${p.issues} open issues`}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Stack>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h2" size="md">
              Projects by status
            </Heading>
          </Card.Header>
          <Card.Body pt="0">
            <Stack gap="3">
              {statuses.map((s) => (
                <Flex key={s} justify="space-between" align="center">
                  <Badge colorPalette={statusPalette[s]}>{s}</Badge>
                  <Text fontFamily="heading" fontWeight="semibold">
                    {projects.filter((p) => p.status === s).length}
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </>
  )
}
```

```tsx app/settings/page.tsx
"use client"

import {
  Badge,
  Button,
  Card,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode()
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [landing, setLanding] = React.useState("overview")
  const [issueEmails, setIssueEmails] = React.useState(true)
  const [weeklyDigest, setWeeklyDigest] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toaster.create({
      title: "Settings saved",
      description: "Your changes are applied to this workspace.",
      type: "success",
    })
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile and how Lumen behaves for you."
      />

      <form onSubmit={handleSubmit}>
        <Stack gap="6" maxW="3xl">
          <Card.Root variant="outline">
            <Card.Header>
              <Heading as="h2" size="md">
                Profile
              </Heading>
            </Card.Header>
            <Card.Body pt="0" gap="4">
              <Field label="Full name">
                <Input
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Email" helperText="Used for sign-in and notifications.">
                <Input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Stack direction="row" align="center" gap="3">
                <Text fontSize="sm" color="fg.muted">
                  Role
                </Text>
                <Badge colorPalette="brand">{user.role}</Badge>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Header>
              <Heading as="h2" size="md">
                Preferences
              </Heading>
            </Card.Header>
            <Card.Body pt="0" gap="5">
              <Field label="Start page">
                <NativeSelectRoot>
                  <NativeSelectField
                    value={landing}
                    onChange={(e) => setLanding(e.currentTarget.value)}
                    items={[
                      { value: "overview", label: "Overview" },
                      { value: "projects", label: "Projects" },
                      { value: "reports", label: "Reports" },
                    ]}
                  />
                </NativeSelectRoot>
              </Field>
              <Switch
                checked={colorMode === "dark"}
                onCheckedChange={(e) => setColorMode(e.checked ? "dark" : "light")}
              >
                Dark theme
              </Switch>
              <Switch
                checked={issueEmails}
                onCheckedChange={(e) => setIssueEmails(e.checked)}
              >
                Email me when an issue is assigned to me
              </Switch>
              <Switch
                checked={weeklyDigest}
                onCheckedChange={(e) => setWeeklyDigest(e.checked)}
              >
                Send a weekly activity digest
              </Switch>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
              <Button type="submit">Save changes</Button>
            </Card.Footer>
          </Card.Root>
        </Stack>
      </form>
    </>
  )
}
```
