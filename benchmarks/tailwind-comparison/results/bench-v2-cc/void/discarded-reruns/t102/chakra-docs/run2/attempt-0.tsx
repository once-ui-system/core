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

export const statusPalette: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
}

/** Deterministic (UTC, en-US) so server and client render the same text. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
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
      { label: "Reports", href: "/#reports", icon: LuFileText },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: LuFolderKanban },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
]

/** An item is the current route when its path matches (hash links are in-page jumps). */
export function isActive(item: NavItem, pathname: string): boolean {
  return !item.href.includes("#") && item.href === pathname
}

export function crumbsFor(pathname: string): { group: string; page: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item, pathname)) return { group: group.label, page: item.label }
    }
  }
  return { group: "Workspace", page: "Page" }
}
```

```ts lib/theme.ts
import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe,
} from "@chakra-ui/react"

// Lumen: friendly, upbeat, generous. Brand #DB2777 on warm sand neutrals,
// 16px corners, rounded headings, airy density. Everything lives in the theme.
const config = defineConfig({
  globalCss: {
    html: {
      // Every component (buttons, links, switches, focus rings) takes the brand palette.
      colorPalette: "brand",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fdf2f8" },
          100: { value: "#fce7f3" },
          200: { value: "#fbcfe8" },
          300: { value: "#f9a8d4" },
          400: { value: "#f472b6" },
          500: { value: "#ec4899" },
          600: { value: "#db2777" },
          700: { value: "#a41752" },
          800: { value: "#6d0e34" },
          900: { value: "#45061f" },
          950: { value: "#2c0514" },
        },
        // Warm sand replaces the default cool gray, so every neutral token follows.
        gray: {
          50: { value: "#faf7f2" },
          100: { value: "#f4eee3" },
          200: { value: "#e9e0cf" },
          300: { value: "#d8cbb4" },
          400: { value: "#b5a68b" },
          500: { value: "#8c7d65" },
          600: { value: "#6a5d49" },
          700: { value: "#4d4334" },
          800: { value: "#342d23" },
          900: { value: "#211c15" },
          950: { value: "#15110c" },
        },
      },
      fonts: {
        heading: {
          value: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
        },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      radii: {
        // Component radii: buttons, inputs, menus (l2), cards (l3), menu items and tags (l1).
        l1: { value: "{radii.xl}" },
        l2: { value: "{radii.2xl}" },
        l3: { value: "{radii.2xl}" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: { value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { base: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { base: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { base: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: { base: "{colors.brand.600}", _dark: "{colors.brand.400}" } },
        },
        bg: {
          DEFAULT: { value: { base: "{colors.gray.50}", _dark: "{colors.gray.950}" } },
          subtle: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.900}" } },
          muted: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.800}" } },
          emphasized: { value: { base: "{colors.gray.200}", _dark: "{colors.gray.700}" } },
          panel: { value: { base: "#fffdf9", _dark: "{colors.gray.900}" } },
        },
      },
    },
    recipes: {
      // Airy density: large touch targets by default.
      button: defineRecipe({
        variants: { size: { lg: {} } },
        defaultVariants: { size: "lg" },
      }),
      input: defineRecipe({
        variants: { size: { lg: {} } },
        defaultVariants: { size: "lg" },
      }),
    },
    slotRecipes: {
      card: defineSlotRecipe({
        slots: ["root", "header", "body", "footer", "title", "description"],
        variants: { size: { lg: {} } },
        defaultVariants: { size: "lg" },
      }),
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

```tsx components/shell/app-shell.tsx
"use client"

import {
  Box,
  Breadcrumb,
  Button,
  Collapsible,
  Flex,
  Heading,
  IconButton,
  SkipNavContent,
  SkipNavLink,
  Span,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  LuChevronDown,
  LuLogOut,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSettings,
  LuSparkles,
} from "react-icons/lu"
import { Avatar } from "@/components/ui/avatar"
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
import { toaster } from "@/components/ui/toaster"
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"
import { crumbsFor, isActive, navGroups, type NavGroup, type NavItem } from "@/lib/nav"

const NavAnchor = chakra(NextLink)

function BrandMark({ showName }: { showName: boolean }) {
  return (
    <Flex align="center" gap="3">
      <Flex
        boxSize="11"
        flexShrink={0}
        align="center"
        justify="center"
        bg="brand.solid"
        color="brand.contrast"
        borderRadius="l2"
      >
        <LuSparkles size={22} aria-hidden />
      </Flex>
      {showName && (
        <Heading as="span" size="xl" letterSpacing="tight">
          Lumen
        </Heading>
      )}
    </Flex>
  )
}

function NavLinkItem({
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
    <NavAnchor
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      display="flex"
      alignItems="center"
      justifyContent={collapsed ? "center" : "flex-start"}
      gap="3"
      minH="12"
      px={collapsed ? "0" : "4"}
      borderRadius="l2"
      fontWeight="medium"
      textDecoration="none"
      bg={active ? "brand.solid" : "transparent"}
      color={active ? "brand.contrast" : "fg"}
      _hover={{ bg: active ? "brand.700" : "bg.muted", textDecoration: "none" }}
      focusVisibleRing="outside"
      transition="background 0.15s ease"
    >
      <Icon size={20} aria-hidden />
      {collapsed ? <VisuallyHidden>{item.label}</VisuallyHidden> : <Span>{item.label}</Span>}
    </NavAnchor>
  )
  return (
    <Tooltip
      content={item.label}
      disabled={!collapsed}
      showArrow
      positioning={{ placement: "right" }}
    >
      {link}
    </Tooltip>
  )
}

function NavGroupSection({
  group,
  index,
  collapsed,
  pathname,
  onNavigate,
}: {
  group: NavGroup
  index: number
  collapsed: boolean
  pathname: string
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(true)
  const expanded = collapsed || open

  return (
    <Box role="group" aria-label={group.label}>
      <Collapsible.Root
        open={expanded}
        onOpenChange={(e) => {
          if (!collapsed) setOpen(e.open)
        }}
      >
        {collapsed ? (
          index > 0 && (
            <Box h="1px" bg="border" mx="3" mb="3" aria-hidden />
          )
        ) : (
          <Collapsible.Trigger
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            w="full"
            minH="10"
            px="4"
            mb="1"
            borderRadius="l2"
            cursor="pointer"
            fontSize="xs"
            fontWeight="semibold"
            letterSpacing="wider"
            textTransform="uppercase"
            color="fg.muted"
            _hover={{ bg: "bg.muted" }}
            focusVisibleRing="outside"
          >
            <Span>{group.label}</Span>
            <Box
              as="span"
              display="inline-flex"
              transition="transform 0.2s ease"
              transform={expanded ? "rotate(0deg)" : "rotate(-90deg)"}
              aria-hidden
            >
              <LuChevronDown size={16} />
            </Box>
          </Collapsible.Trigger>
        )}
        <Collapsible.Content>
          <Stack as="ul" gap="1" m="0" p="0" listStyleType="none">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLinkItem
                  item={item}
                  active={isActive(item, pathname)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <Box as="nav" aria-label="Main">
      <Stack gap="5">
        {navGroups.map((group, index) => (
          <NavGroupSection
            key={group.id}
            group={group}
            index={index}
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </Stack>
    </Box>
  )
}

function ProfileMenu() {
  return (
    <MenuRoot positioning={{ placement: "bottom-end" }}>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={`Account menu for ${user.name}`}
          px="2"
          gap="3"
        >
          <Avatar name={user.name} size="sm" />
          <Stack display={{ base: "none", lg: "flex" }} gap="0" align="start" textAlign="start">
            <Text fontSize="sm" fontWeight="semibold" lineHeight="short">
              {user.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" lineHeight="short">
              {user.role}
            </Text>
          </Stack>
          <Box display={{ base: "none", lg: "inline-flex" }} aria-hidden>
            <LuChevronDown size={16} />
          </Box>
        </Button>
      </MenuTrigger>
      <MenuContent minW="16rem" p="2">
        <Box px="3" py="3">
          <Text fontWeight="semibold">{user.name}</Text>
          <Text fontSize="sm" color="fg.muted">
            {user.email}
          </Text>
        </Box>
        <MenuSeparator />
        <MenuItem value="settings" asChild py="3">
          <NextLink href="/settings">
            <LuSettings aria-hidden />
            Settings
          </NextLink>
        </MenuItem>
        <MenuItem
          value="sign-out"
          py="3"
          onClick={() =>
            toaster.create({
              type: "info",
              title: "Signing out is not connected in this preview",
              description: "You are still signed in as " + user.email + ".",
            })
          }
        >
          <LuLogOut aria-hidden />
          Sign out
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const crumbs = crumbsFor(pathname)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Flex minH="100dvh" bg="bg" color="fg">
      <SkipNavLink>Skip to content</SkipNavLink>

      {/* Desktop sidebar */}
      <Box
        as="aside"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        flexShrink={0}
        gap="8"
        position="sticky"
        top="0"
        h="100dvh"
        w={collapsed ? "6.5rem" : "18rem"}
        px={collapsed ? "4" : "5"}
        py="6"
        overflowX="hidden"
        overflowY="auto"
        bg="bg.panel"
        borderEndWidth="1px"
        borderColor="border.muted"
        transition="width 0.2s ease"
        _motionReduce={{ transition: "none" }}
      >
        <NextLink href="/" aria-label="Lumen home">
          <Box px={collapsed ? "0" : "1"} display="flex" justifyContent={collapsed ? "center" : "flex-start"}>
            <BrandMark showName={!collapsed} />
          </Box>
        </NextLink>
        <Box flex="1">
          <NavList collapsed={collapsed} />
        </Box>
        <Tooltip
          content="Expand sidebar"
          disabled={!collapsed}
          showArrow
          positioning={{ placement: "right" }}
        >
          <Button
            variant="ghost"
            justifyContent={collapsed ? "center" : "flex-start"}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((c) => !c)}
            color="fg.muted"
            gap="3"
            px={collapsed ? "0" : "4"}
          >
            {collapsed ? <LuPanelLeftOpen size={20} /> : <LuPanelLeftClose size={20} />}
            {!collapsed && <Span>Collapse</Span>}
          </Button>
        </Tooltip>
      </Box>

      {/* Phone navigation drawer */}
      <DrawerRoot
        placement="start"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        lazyMount
        unmountOnExit
      >
        <DrawerContent maxW="20rem" bg="bg.panel">
          <DrawerHeader pt="6" pb="4">
            <Flex align="center" gap="3">
              <BrandMark showName={false} />
              <DrawerTitle fontFamily="heading" fontSize="xl">
                Lumen
              </DrawerTitle>
            </Flex>
          </DrawerHeader>
          <DrawerBody pb="8">
            <NavList collapsed={false} onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger top="5" insetEnd="4" />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          align="center"
          gap="3"
          h={{ base: "16", md: "20" }}
          px={{ base: "4", md: "10" }}
          bg="bg"
          borderBottomWidth="1px"
          borderColor="border.muted"
        >
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>

          <Breadcrumb.Root size="md" flex="1" minW="0">
            <Breadcrumb.List>
              <Breadcrumb.Item display={{ base: "none", sm: "inline-flex" }}>
                <Breadcrumb.Link asChild>
                  <NextLink href="/">Lumen</NextLink>
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator display={{ base: "none", sm: "inline-flex" }} />
              <Breadcrumb.Item>
                <Span color="fg.muted">{crumbs.group}</Span>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.CurrentLink fontWeight="semibold">
                  {crumbs.page}
                </Breadcrumb.CurrentLink>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>

          <ColorModeButton size="lg" />
          <ProfileMenu />
        </Flex>

        <Box
          as="main"
          flex="1"
          w="full"
          maxW="6xl"
          mx="auto"
          px={{ base: "5", md: "10" }}
          py={{ base: "8", md: "12" }}
        >
          <SkipNavContent>{children}</SkipNavContent>
        </Box>
      </Flex>
    </Flex>
  )
}
```

```tsx components/shell/page-header.tsx
"use client"

import { Heading, Stack, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
}: {
  title: string
  description: ReactNode
}) {
  return (
    <Stack gap="2" mb={{ base: "8", md: "10" }}>
      <Heading as="h1" size={{ base: "2xl", md: "3xl" }} letterSpacing="tight">
        {title}
      </Heading>
      <Text fontSize="lg" color="fg.muted" maxW="2xl">
        {description}
      </Text>
    </Stack>
  )
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
  Progress,
  SimpleGrid,
  Stack,
  Stat,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { PageHeader } from "@/components/shell/page-header"
import { formatDate, projects, statusPalette, user } from "@/lib/data"

const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0)
const maxIssues = Math.max(...projects.map((p) => p.issues), 1)
const activeCount = projects.filter((p) => p.status === "Active").length
const pausedCount = projects.filter((p) => p.status === "Paused").length
const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))
const latest = recent[0]

const summary = [
  {
    label: "Open issues",
    value: String(totalIssues),
    help: `Across ${projects.length} projects`,
  },
  {
    label: "Active projects",
    value: String(activeCount),
    help: "Shipping this month",
  },
  {
    label: "Paused projects",
    value: String(pausedCount),
    help: "Waiting for a restart",
  },
  {
    label: "Latest update",
    value: formatDate(latest.updated),
    help: latest.name,
  },
]

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where things stand across your team's projects today."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="6" mb={{ base: "10", md: "12" }}>
        {summary.map((item) => (
          <Card.Root key={item.label}>
            <Card.Body>
              <Stat.Root>
                <Stat.Label fontSize="md">{item.label}</Stat.Label>
                <Stat.ValueText fontFamily="heading" fontSize="3xl">
                  {item.value}
                </Stat.ValueText>
                <Stat.HelpText>{item.help}</Stat.HelpText>
              </Stat.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="6">
        <Card.Root id="reports" gridColumn={{ lg: "span 2" }} scrollMarginTop="24">
          <Card.Header>
            <Heading as="h2" size="lg">
              Open issues by project
            </Heading>
            <Text color="fg.muted">A quick report on where the work is piling up.</Text>
          </Card.Header>
          <Card.Body>
            <Stack gap="6">
              {projects.map((project) => (
                <Box key={project.key}>
                  <Flex justify="space-between" align="baseline" mb="2" gap="4">
                    <Text fontWeight="medium">{project.name}</Text>
                    <Text color="fg.muted" fontSize="sm">
                      {project.issues} open
                    </Text>
                  </Flex>
                  <Progress.Root
                    value={project.issues}
                    max={maxIssues}
                    size="lg"
                    aria-label={`${project.name}: ${project.issues} open issues`}
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

        <Card.Root>
          <Card.Header>
            <Heading as="h2" size="lg">
              Recently updated
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack as="ul" gap="5" m="0" p="0" listStyleType="none">
              {recent.slice(0, 3).map((project) => (
                <li key={project.key}>
                  <Flex justify="space-between" align="center" gap="3">
                    <Box minW="0">
                      <Text fontWeight="medium" truncate>
                        {project.name}
                      </Text>
                      <Text color="fg.muted" fontSize="sm">
                        {formatDate(project.updated)}
                      </Text>
                    </Box>
                    <Badge colorPalette={statusPalette[project.status]} size="lg">
                      {project.status}
                    </Badge>
                  </Flex>
                </li>
              ))}
            </Stack>
          </Card.Body>
          <Card.Footer>
            <Link asChild fontWeight="medium">
              <NextLink href="/projects">View all projects</NextLink>
            </Link>
          </Card.Footer>
        </Card.Root>
      </SimpleGrid>
    </>
  )
}
```

```tsx app/projects/page.tsx
"use client"

import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { LuSearch } from "react-icons/lu"
import { PageHeader } from "@/components/shell/page-header"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { Input } from "@chakra-ui/react"
import { formatDate, projects, statusPalette } from "@/lib/data"

const statusOptions = [
  { value: "All", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
  { value: "Archived", label: "Archived" },
]

export default function ProjectsPage() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)),
    )
  }, [query, status])

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project your team tracks in Lumen, with its open issues and last activity."
      />

      <Flex direction={{ base: "column", md: "row" }} gap="5" mb="6" align={{ md: "flex-end" }}>
        <Field label="Search projects" flex="1" maxW={{ md: "md" }}>
          <InputGroup startElement={<LuSearch />} w="full">
            <Input
              placeholder="Name or key"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
        </Field>
        <Field label="Status" w={{ base: "full", md: "14rem" }}>
          <NativeSelectRoot>
            <NativeSelectField
              items={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.currentTarget.value)}
            />
          </NativeSelectRoot>
        </Field>
      </Flex>

      <Text role="status" aria-live="polite" color="fg.muted" mb="4">
        Showing {filtered.length} of {projects.length} projects
      </Text>

      {filtered.length === 0 ? (
        <Card.Root>
          <Card.Body alignItems="center" textAlign="center" py="12" gap="3">
            <Heading as="h2" size="lg">
              No projects match
            </Heading>
            <Text color="fg.muted">Try a different name or status.</Text>
            <Button
              variant="outline"
              mt="2"
              onClick={() => {
                setQuery("")
                setStatus("All")
              }}
            >
              Clear filters
            </Button>
          </Card.Body>
        </Card.Root>
      ) : (
        <>
          {/* Phones: one card per project */}
          <Stack as="ul" gap="4" m="0" p="0" listStyleType="none" display={{ base: "flex", md: "none" }}>
            {filtered.map((project) => (
              <li key={project.key}>
                <Card.Root>
                  <Card.Body gap="3">
                    <Flex justify="space-between" align="center" gap="3">
                      <Heading as="h2" size="lg">
                        {project.name}
                      </Heading>
                      <Badge colorPalette={statusPalette[project.status]} size="lg">
                        {project.status}
                      </Badge>
                    </Flex>
                    <Flex gap="3" align="center" color="fg.muted" fontSize="sm" wrap="wrap">
                      <Badge variant="outline" size="md">
                        {project.key}
                      </Badge>
                      <Text>{project.issues} open issues</Text>
                      <Text>Updated {formatDate(project.updated)}</Text>
                    </Flex>
                  </Card.Body>
                </Card.Root>
              </li>
            ))}
          </Stack>

          {/* Tablet and desktop: a table */}
          <Box display={{ base: "none", md: "block" }}>
            <Card.Root overflow="hidden">
              <Table.ScrollArea>
                <Table.Root size="lg" interactive>
                  <Table.Caption srOnly>Projects with status, open issues and last update</Table.Caption>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Key</Table.ColumnHeader>
                      <Table.ColumnHeader>Project</Table.ColumnHeader>
                      <Table.ColumnHeader>Status</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="end">Updated</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filtered.map((project) => (
                      <Table.Row key={project.key}>
                        <Table.Cell>
                          <Badge variant="outline" size="md">
                            {project.key}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell fontWeight="medium">{project.name}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={statusPalette[project.status]} size="lg">
                            {project.status}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell textAlign="end">{project.issues}</Table.Cell>
                        <Table.Cell textAlign="end" color="fg.muted">
                          {formatDate(project.updated)}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Card.Root>
          </Box>
        </>
      )}
    </>
  )
}
```

```tsx app/settings/page.tsx
"use client"

import {
  Button,
  Card,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  chakra,
} from "@chakra-ui/react"
import { useState, type FormEvent } from "react"
import { PageHeader } from "@/components/shell/page-header"
import { Field } from "@/components/ui/field"
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

const defaults = {
  name: user.name,
  email: user.email,
  workspace: "Acme Labs",
  timezone: "Europe/London",
  weeklyDigest: true,
  assignments: true,
  productNews: false,
}

const timezones = [
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "Europe/London", label: "London" },
  { value: "Africa/Lagos", label: "West Africa (Lagos)" },
  { value: "Asia/Tokyo", label: "Japan (Tokyo)" },
]

export default function SettingsPage() {
  const [values, setValues] = useState(defaults)

  const update = <K extends keyof typeof defaults>(key: K, value: (typeof defaults)[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toaster.create({
      type: "success",
      title: "Settings saved",
      description: "Your changes are live for everyone on the team.",
    })
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Tune your profile, your workspace and how Lumen keeps you in the loop."
      />

      <chakra.form onSubmit={onSubmit} maxW="3xl">
        <Stack gap="8">
          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="lg">
                Profile
              </Heading>
              <Text color="fg.muted">How you appear to the rest of your team.</Text>
            </Card.Header>
            <Card.Body gap="6">
              <Field label="Full name">
                <Input
                  value={values.name}
                  autoComplete="name"
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>
              <Field label="Email" helperText="We send sign-in links and notifications here.">
                <Input
                  type="email"
                  value={values.email}
                  autoComplete="email"
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
              <Field label="Role" helperText="Only owners can change roles.">
                <Input value={user.role} readOnly />
              </Field>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="lg">
                Workspace
              </Heading>
              <Text color="fg.muted">Shared by everyone in your team.</Text>
            </Card.Header>
            <Card.Body gap="6">
              <Field label="Workspace name">
                <Input
                  value={values.workspace}
                  onChange={(e) => update("workspace", e.target.value)}
                />
              </Field>
              <Field label="Time zone" helperText="Used for reports and due dates.">
                <NativeSelectRoot>
                  <NativeSelectField
                    items={timezones}
                    value={values.timezone}
                    onChange={(e) => update("timezone", e.currentTarget.value)}
                  />
                </NativeSelectRoot>
              </Field>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="lg">
                Notifications
              </Heading>
              <Text color="fg.muted">Choose what lands in your inbox.</Text>
            </Card.Header>
            <Card.Body gap="6">
              <Switch
                size="lg"
                checked={values.weeklyDigest}
                onCheckedChange={(e) => update("weeklyDigest", e.checked)}
              >
                Weekly digest of project activity
              </Switch>
              <Switch
                size="lg"
                checked={values.assignments}
                onCheckedChange={(e) => update("assignments", e.checked)}
              >
                Email me when an issue is assigned to me
              </Switch>
              <Switch
                size="lg"
                checked={values.productNews}
                onCheckedChange={(e) => update("productNews", e.checked)}
              >
                Product news and tips from Lumen
              </Switch>
            </Card.Body>
          </Card.Root>

          <Flex gap="4" wrap="wrap">
            <Button type="submit" colorPalette="brand">
              Save changes
            </Button>
            <Button type="button" variant="outline" onClick={() => setValues(defaults)}>
              Discard changes
            </Button>
          </Flex>
        </Stack>
      </chakra.form>
    </>
  )
}
```
