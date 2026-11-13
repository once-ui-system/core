```ts lib/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const headingFont =
  'ui-rounded, "SF Pro Rounded", system-ui, sans-serif'
const bodyFont = "ui-sans-serif, system-ui, sans-serif"

const config = defineConfig({
  globalCss: {
    html: {
      // Lumen's brand colour is the default palette: primary buttons, focus
      // rings, switches, links and badges all follow it.
      colorPalette: "brand",
      fontFamily: "body",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
    },
    a: {
      color: "colorPalette.fg",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: headingFont },
        body: { value: bodyFont },
      },
      colors: {
        // Lumen pink, #DB2777 at 600.
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
        // Warm sand neutrals replace the cool grays.
        gray: {
          50: { value: "#faf7f2" },
          100: { value: "#f4efe6" },
          200: { value: "#e8e0d0" },
          300: { value: "#d6cab4" },
          400: { value: "#b5a68b" },
          500: { value: "#8f8068" },
          600: { value: "#6f6350" },
          700: { value: "#544a3c" },
          800: { value: "#3a3329" },
          900: { value: "#26211a" },
          950: { value: "#17130e" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
        },
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
        },
      },
      // 16px on buttons, inputs, cards and menus (they use l2 and l3).
      radii: {
        l1: { value: "{radii.xl}" },
        l2: { value: "{radii.2xl}" },
        l3: { value: "{radii.2xl}" },
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

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

// Deterministic (no locale or time zone), so server and client render the same.
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return `${d} ${months[m - 1]} ${y}`
}
```

```tsx components/nav-config.ts
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
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
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

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function findCurrent(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group, item }
    }
  }
  return null
}
```

```tsx components/nav-list.tsx
"use client"

import { Box, chakra, Collapsible, Icon, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuChevronDown } from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { isActive, type NavGroup, type NavItem, navGroups } from "./nav-config"

const NavLink = chakra(NextLink)

function NavItemLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
}) {
  return (
    <Box as="li" listStyleType="none">
      <Tooltip
        content={item.label}
        positioning={{ placement: "right" }}
        disabled={!collapsed}
        showArrow
      >
        <NavLink
          href={item.href}
          aria-current={active ? "page" : undefined}
          aria-label={collapsed ? item.label : undefined}
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
          _hover={{
            bg: active ? "brand.solid" : "bg.muted",
            textDecoration: "none",
          }}
          focusVisibleRing="outside"
        >
          <Icon boxSize="5" flexShrink={0}>
            <item.icon />
          </Icon>
          {!collapsed && <Text truncate>{item.label}</Text>}
        </NavLink>
      </Tooltip>
    </Box>
  )
}

function ItemList({
  group,
  collapsed,
  pathname,
}: {
  group: NavGroup
  collapsed: boolean
  pathname: string
}) {
  return (
    <Stack as="ul" gap="1" m="0" p="0" listStyleType="none">
      {group.items.map((item) => (
        <NavItemLink
          key={item.href}
          item={item}
          collapsed={collapsed}
          active={isActive(pathname, item.href)}
        />
      ))}
    </Stack>
  )
}

export function NavList({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname()

  return (
    <Box as="nav" aria-label="Main navigation">
      <Stack gap={collapsed ? "5" : "4"}>
        {navGroups.map((group) =>
          collapsed ? (
            <ItemList
              key={group.label}
              group={group}
              collapsed
              pathname={pathname}
            />
          ) : (
            <Collapsible.Root key={group.label} defaultOpen>
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
                focusVisibleRing="outside"
                _open={{ "& svg": { transform: "rotate(180deg)" } }}
              >
                {group.label}
                <Icon boxSize="4" transition="transform 0.2s">
                  <LuChevronDown />
                </Icon>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <ItemList group={group} collapsed={false} pathname={pathname} />
              </Collapsible.Content>
            </Collapsible.Root>
          ),
        )}
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
  HStack,
  Icon,
  IconButton,
  Link,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSparkles,
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
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"
import { findCurrent } from "./nav-config"
import { NavList } from "./nav-list"

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <HStack gap="3" justify={collapsed ? "center" : "flex-start"}>
      <Flex
        boxSize="11"
        align="center"
        justify="center"
        flexShrink={0}
        borderRadius="l2"
        bg="brand.solid"
        color="brand.contrast"
      >
        <Icon boxSize="6" aria-hidden>
          <LuSparkles />
        </Icon>
      </Flex>
      {!collapsed && (
        <Text
          fontFamily="heading"
          fontSize="2xl"
          fontWeight="bold"
          letterSpacing="tight"
        >
          Lumen
        </Text>
      )}
    </HStack>
  )
}

function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname()
  const current = findCurrent(pathname)

  return (
    <Flex
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      align="center"
      gap="4"
      minH="20"
      px={{ base: "4", md: "10" }}
      bg="bg/85"
      backdropFilter="blur(10px)"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <IconButton
        display={{ base: "inline-flex", md: "none" }}
        variant="outline"
        size="lg"
        aria-label="Open navigation menu"
        onClick={onOpenMenu}
      >
        <LuMenu />
      </IconButton>

      <BreadcrumbRoot size="lg" separatorGap="3">
        <BreadcrumbLink asChild>
          <NextLink href="/">Lumen</NextLink>
        </BreadcrumbLink>
        {current ? (
          <Text as="span" color="fg.muted">
            {current.group.label}
          </Text>
        ) : (
          <Text as="span" color="fg.muted">
            Page
          </Text>
        )}
        <BreadcrumbCurrentLink>
          {current ? current.item.label : "Not found"}
        </BreadcrumbCurrentLink>
      </BreadcrumbRoot>

      <HStack ml="auto" gap="2">
        <ColorModeButton size="lg" />
        <MenuRoot positioning={{ placement: "bottom-end" }}>
          <MenuTrigger asChild>
            <IconButton
              variant="ghost"
              size="lg"
              rounded="full"
              aria-label={`Account menu for ${user.name}`}
            >
              <Avatar name={user.name} size="sm" colorPalette="brand" />
            </IconButton>
          </MenuTrigger>
          <MenuContent minW="56" p="2">
            <Box px="3" py="2">
              <Text fontWeight="semibold">{user.name}</Text>
              <Text fontSize="sm" color="fg.muted">
                {user.email}
              </Text>
            </Box>
            <MenuItem value="settings" asChild minH="11" px="3">
              <NextLink href="/settings">Settings</NextLink>
            </MenuItem>
            <MenuItem
              value="sign-out"
              minH="11"
              px="3"
              onClick={() =>
                toaster.create({
                  title: "Sign-out is off in this demo workspace",
                  type: "info",
                })
              }
            >
              Sign out
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </HStack>
    </Flex>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Close the phone drawer after navigating.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <Flex minH="100dvh" bg="bg" color="fg">
      <Link
        href="#main-content"
        position="absolute"
        left="4"
        top="-20"
        zIndex="max"
        px="4"
        py="3"
        borderRadius="l2"
        bg="bg.panel"
        _focus={{ top: "4" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        display={{ base: "none", md: "flex" }}
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? "24" : "80"}
        px="4"
        py="6"
        gap="8"
        bg="bg.panel"
        borderRightWidth="1px"
        borderColor="border"
        transition="width 0.2s ease"
      >
        <Box px={collapsed ? "0" : "2"}>
          <Brand collapsed={collapsed} />
        </Box>
        <Box flex="1" overflowY="auto" overflowX="hidden">
          <NavList collapsed={collapsed} />
        </Box>
        <IconButton
          variant="ghost"
          size="lg"
          alignSelf={collapsed ? "center" : "flex-end"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
        </IconButton>
      </Flex>

      {/* Phone drawer */}
      <DrawerRoot
        placement="start"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
      >
        <DrawerContent maxW="80" w="calc(100vw - 3rem)">
          <DrawerHeader pt="6" pb="2">
            <DrawerTitle asChild>
              <Brand />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody py="6">
            <NavList />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Header onOpenMenu={() => setDrawerOpen(true)} />
        <Box
          as="main"
          id="main-content"
          tabIndex={-1}
          flex="1"
          w="full"
          maxW="6xl"
          mx="auto"
          px={{ base: "4", md: "10" }}
          py={{ base: "8", md: "12" }}
          outline="none"
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
import { AppShell } from "@/components/app-shell";
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
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import type { IconType } from "react-icons"
import { LuBug, LuCalendarCheck, LuFolderKanban, LuPause } from "react-icons/lu"
import { formatDate, projects, statusPalette, user } from "@/lib/data"

interface SummaryCard {
  label: string
  value: string
  hint: string
  icon: IconType
}

const active = projects.filter((p) => p.status === "Active")
const paused = projects.filter((p) => p.status === "Paused")
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))
const latest = recent[0]

const cards: SummaryCard[] = [
  {
    label: "Active projects",
    value: String(active.length),
    hint: "Marketing site, Customer app, Public API",
    icon: LuFolderKanban,
  },
  {
    label: "Open issues",
    value: String(openIssues),
    hint: "Across every project",
    icon: LuBug,
  },
  {
    label: "Paused",
    value: String(paused.length),
    hint: paused.map((p) => p.name).join(", "),
    icon: LuPause,
  },
  {
    label: "Latest update",
    value: formatDate(latest.updated),
    hint: latest.name,
    icon: LuCalendarCheck,
  },
]

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0]

  return (
    <Stack gap="10">
      <Stack gap="2">
        <Heading as="h1" size="3xl">
          Welcome back, {firstName}
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Here is how things look across your workspace today.
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="6">
        {cards.map((card) => (
          <Card.Root key={card.label} size="lg">
            <Card.Body gap="4">
              <Flex align="center" justify="space-between" gap="3">
                <Text fontWeight="medium" color="fg.muted">
                  {card.label}
                </Text>
                <Flex
                  boxSize="11"
                  align="center"
                  justify="center"
                  borderRadius="l2"
                  bg="brand.subtle"
                  color="brand.fg"
                >
                  <Icon boxSize="5" aria-hidden>
                    <card.icon />
                  </Icon>
                </Flex>
              </Flex>
              <Text
                fontFamily="heading"
                fontSize="4xl"
                fontWeight="bold"
                lineHeight="1.1"
              >
                {card.value}
              </Text>
              <Text fontSize="sm" color="fg.muted">
                {card.hint}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root size="lg">
        <Card.Header>
          <Flex align="center" justify="space-between" gap="4" wrap="wrap">
            <Heading as="h2" size="xl">
              Recently updated
            </Heading>
            <Link asChild fontWeight="medium">
              <NextLink href="/projects">View all projects</NextLink>
            </Link>
          </Flex>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" gap="3" m="0" p="0" listStyleType="none">
            {recent.slice(0, 3).map((project) => (
              <Flex
                as="li"
                key={project.key}
                align="center"
                justify="space-between"
                gap="4"
                wrap="wrap"
                minH="14"
                px="4"
                py="3"
                borderRadius="l2"
                bg="bg.muted"
              >
                <Box>
                  <Text fontWeight="semibold">{project.name}</Text>
                  <Text fontSize="sm" color="fg.muted">
                    {project.key} · updated {formatDate(project.updated)}
                  </Text>
                </Box>
                <HStack gap="3">
                  <Text fontSize="sm" color="fg.muted">
                    {project.issues} open issues
                  </Text>
                  <Badge
                    size="lg"
                    colorPalette={statusPalette[project.status]}
                  >
                    {project.status}
                  </Badge>
                </HStack>
              </Flex>
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

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  HStack,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import { formatDate, projects, statusPalette } from "@/lib/data"

export default function ProjectsPage() {
  return (
    <Stack gap="10">
      <Stack gap="2">
        <Heading as="h1" size="3xl">
          Projects
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          {projects.length} projects in your workspace.
        </Text>
      </Stack>

      {/* Phones: one card per project */}
      <Stack
        as="ul"
        display={{ base: "flex", md: "none" }}
        gap="4"
        m="0"
        p="0"
        listStyleType="none"
      >
        {projects.map((project) => (
          <Card.Root as="li" key={project.key} size="lg">
            <Card.Body gap="3">
              <Flex align="center" justify="space-between" gap="3">
                <Heading as="h2" size="lg">
                  {project.name}
                </Heading>
                <Badge size="lg" colorPalette={statusPalette[project.status]}>
                  {project.status}
                </Badge>
              </Flex>
              <HStack gap="3" color="fg.muted" fontSize="sm" wrap="wrap">
                <Text fontWeight="semibold" color="fg">
                  {project.key}
                </Text>
                <Text>{project.issues} open issues</Text>
                <Text>Updated {formatDate(project.updated)}</Text>
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>

      {/* Tablet and desktop: table */}
      <Card.Root display={{ base: "none", md: "block" }} overflow="hidden">
        <Box overflowX="auto">
          <Table.Root size="lg" interactive>
            <Table.Caption srOnly>Projects in the Lumen workspace</Table.Caption>
            <Table.Header>
              <Table.Row bg="bg.muted">
                <Table.ColumnHeader px="6" py="4">
                  Key
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4">
                  Project
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4">
                  Status
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4" textAlign="end">
                  Open issues
                </Table.ColumnHeader>
                <Table.ColumnHeader px="6" py="4">
                  Updated
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {projects.map((project) => (
                <Table.Row key={project.key}>
                  <Table.Cell px="6" py="5" fontWeight="semibold">
                    {project.key}
                  </Table.Cell>
                  <Table.Cell px="6" py="5">
                    {project.name}
                  </Table.Cell>
                  <Table.Cell px="6" py="5">
                    <Badge
                      size="lg"
                      colorPalette={statusPalette[project.status]}
                    >
                      {project.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell px="6" py="5" textAlign="end">
                    {project.issues}
                  </Table.Cell>
                  <Table.Cell px="6" py="5">
                    {formatDate(project.updated)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Root>
    </Stack>
  )
}
```

```tsx app/reports/page.tsx
"use client"

import { Card, Flex, Heading, Progress, Stack, Text } from "@chakra-ui/react"
import { projects } from "@/lib/data"

const maxIssues = Math.max(...projects.map((p) => p.issues))

export default function ReportsPage() {
  return (
    <Stack gap="10">
      <Stack gap="2">
        <Heading as="h1" size="3xl">
          Reports
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Where your team&apos;s open issues sit right now.
        </Text>
      </Stack>

      <Card.Root size="lg">
        <Card.Header>
          <Heading as="h2" size="xl">
            Open issues by project
          </Heading>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" gap="6" m="0" p="0" listStyleType="none">
            {projects.map((project) => (
              <Stack as="li" key={project.key} gap="2">
                <Flex justify="space-between" gap="4">
                  <Text fontWeight="medium">{project.name}</Text>
                  <Text color="fg.muted">{project.issues}</Text>
                </Flex>
                <Progress.Root
                  value={project.issues}
                  max={maxIssues}
                  size="lg"
                  aria-label={`${project.name}: ${project.issues} open issues`}
                >
                  <Progress.Track borderRadius="full">
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </Stack>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}
```

```tsx app/settings/page.tsx
"use client"

import {
  Button,
  Card,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export default function SettingsPage() {
  const [name, setName] = useState(user.name)
  const [weekly, setWeekly] = useState(true)
  const [mentions, setMentions] = useState(true)
  const [releases, setReleases] = useState(false)

  const nameInvalid = name.trim().length === 0

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (nameInvalid) return
    toaster.create({
      title: "Settings saved",
      description: "Your changes are live for the whole team.",
      type: "success",
    })
  }

  return (
    <Stack gap="10" as="form" onSubmit={save} maxW="3xl">
      <Stack gap="2">
        <Heading as="h1" size="3xl">
          Settings
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          Your profile and how Lumen keeps you in the loop.
        </Text>
      </Stack>

      <Card.Root size="lg">
        <Card.Header>
          <Heading as="h2" size="xl">
            Profile
          </Heading>
        </Card.Header>
        <Card.Body gap="6">
          <Field
            label="Full name"
            invalid={nameInvalid}
            errorText="Please enter your name."
            required
          >
            <Input
              size="lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </Field>
          <Field label="Email" helperText="Contact your workspace owner to change this.">
            <Input size="lg" type="email" value={user.email} readOnly />
          </Field>
          <Field label="Role">
            <Input size="lg" value={user.role} readOnly />
          </Field>
        </Card.Body>
      </Card.Root>

      <Card.Root size="lg">
        <Card.Header>
          <Heading as="h2" size="xl">
            Notifications
          </Heading>
        </Card.Header>
        <Card.Body gap="6">
          <Switch
            size="lg"
            checked={weekly}
            onCheckedChange={(e) => setWeekly(e.checked)}
          >
            Weekly summary email
          </Switch>
          <Switch
            size="lg"
            checked={mentions}
            onCheckedChange={(e) => setMentions(e.checked)}
          >
            Tell me when someone mentions me
          </Switch>
          <Switch
            size="lg"
            checked={releases}
            onCheckedChange={(e) => setReleases(e.checked)}
          >
            Product news and releases
          </Switch>
        </Card.Body>
      </Card.Root>

      <Button type="submit" size="xl" alignSelf="flex-start" px="8">
        Save changes
      </Button>
    </Stack>
  )
}
```
