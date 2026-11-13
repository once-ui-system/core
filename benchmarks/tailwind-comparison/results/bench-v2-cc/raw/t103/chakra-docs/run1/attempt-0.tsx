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
  description: string
  cadence: "Daily" | "Weekly" | "Monthly"
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
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
]

export const reports: Report[] = [
  {
    id: "throughput",
    name: "Weekly issue throughput",
    description: "Issues opened and closed per project, compared with the previous week.",
    cadence: "Weekly",
    lastRun: "2026-10-12",
  },
  {
    id: "digest",
    name: "Project activity digest",
    description: "What changed across your projects in the last 24 hours.",
    cadence: "Daily",
    lastRun: "2026-10-14",
  },
  {
    id: "aging",
    name: "Issue aging",
    description: "Open issues grouped by how long they have been waiting.",
    cadence: "Weekly",
    lastRun: "2026-10-12",
  },
  {
    id: "readiness",
    name: "Release readiness",
    description: "Open blockers and unfinished work for the next release.",
    cadence: "Monthly",
    lastRun: "2026-10-01",
  },
]

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

/** Deterministic (UTC) date label so server and client render the same text. */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`))
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName
}

export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0)
export const activeProjects = projects.filter((p) => p.status === "Active")
export const projectsByUpdate = [...projects].sort((a, b) =>
  b.updated.localeCompare(a.updated),
)
export const busiestProject = projects.reduce((top, p) =>
  p.issues > top.issues ? p : top,
)
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
      { label: "Reports", href: "/reports", icon: LuFileText },
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

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function findNav(
  pathname: string,
): { group: NavGroup; item: NavItem } | undefined {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group, item }
    }
  }
  return undefined
}
```

```ts lib/theme.ts
import {
  type SystemStyleObject,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"

// Lumen's identity lives here: tokens, semantic tokens and global styles.
// Components read it through the theme, so every screen follows it.

// Make the brand palette the default colorPalette: buttons, links, the current
// navigation item and focus rings all resolve colorPalette.* to the brand colour.
const brandPalette = "brand" as string as NonNullable<
  SystemStyleObject["colorPalette"]
>

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace'
const SANS = "ui-sans-serif, system-ui, sans-serif"

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: brandPalette,
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: MONO },
        body: { value: SANS },
        mono: { value: MONO },
      },
      colors: {
        // Lumen orange, anchored on #E8590C at 500.
        brand: {
          50: { value: "#fff4ed" },
          100: { value: "#ffe6d5" },
          200: { value: "#fecaaa" },
          300: { value: "#fdaa74" },
          400: { value: "#f77f3a" },
          500: { value: "#e8590c" },
          600: { value: "#c2480a" },
          700: { value: "#9a3a0b" },
          800: { value: "#7a2f0e" },
          900: { value: "#5a230d" },
          950: { value: "#2e1105" },
        },
        // Warm stone replaces the default cool grey, so every neutral
        // semantic token (bg, fg, border) turns warm.
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
      // 4px corners on buttons, inputs, cards, menus and dialogs.
      radii: {
        md: { value: "0.25rem" },
        lg: { value: "0.25rem" },
        xl: { value: "0.25rem" },
        l1: { value: "0.25rem" },
        l2: { value: "0.25rem" },
        l3: { value: "0.25rem" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          // Dark text on the orange fill reaches 5.5:1; white would only reach 3.6:1.
          contrast: { value: "{colors.gray.950}" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          muted: {
            value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" },
          },
          subtle: {
            value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" },
          },
          emphasized: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
          },
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
        defaultTheme="dark"
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

```tsx components/app-shell.tsx
"use client"

import {
  Box,
  Button,
  Flex,
  IconButton,
  Separator,
  Span,
  Text,
  chakra,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  LuChevronDown,
  LuChevronRight,
  LuLogOut,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSettings,
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
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { toaster } from "@/components/ui/toaster"
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"
import { type NavItem, findNav, isActive, navGroups } from "@/lib/nav"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_COLLAPSED = "4.25rem"

const NavAnchor = chakra(NextLink)

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <NavAnchor
      href="/"
      aria-label="Lumen, go to overview"
      display="flex"
      alignItems="center"
      gap="3"
      borderRadius="l2"
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "colorPalette.focusRing",
        outlineOffset: "2px",
      }}
    >
      <Flex
        boxSize="8"
        flexShrink={0}
        alignItems="center"
        justifyContent="center"
        borderRadius="l2"
        bg="colorPalette.solid"
        color="colorPalette.contrast"
        fontFamily="heading"
        fontWeight="bold"
        aria-hidden="true"
      >
        L
      </Flex>
      {!collapsed && (
        <Text fontFamily="heading" fontWeight="bold" fontSize="lg" letterSpacing="tight">
          Lumen
        </Text>
      )}
    </NavAnchor>
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
  return (
    <Tooltip
      content={item.label}
      disabled={!collapsed}
      positioning={{ placement: "right" }}
    >
      <NavAnchor
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        onClick={onNavigate}
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "flex-start"}
        gap="3"
        h="9"
        px={collapsed ? "0" : "3"}
        borderRadius="l2"
        borderStartWidth="2px"
        borderStartColor={active ? "colorPalette.solid" : "transparent"}
        bg={active ? "colorPalette.subtle" : "transparent"}
        color={active ? "colorPalette.fg" : "fg.muted"}
        fontSize="sm"
        fontWeight="medium"
        _hover={active ? undefined : { bg: "bg.muted", color: "fg" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "colorPalette.focusRing",
          outlineOffset: "2px",
        }}
      >
        <Icon size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
        {!collapsed && <Span truncate>{item.label}</Span>}
      </NavAnchor>
    </Tooltip>
  )
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const [closed, setClosed] = React.useState<Record<string, boolean>>({})

  return (
    <chakra.nav aria-label="Primary" flex="1" overflowY="auto" p="3">
      <chakra.ul listStyle="none" m="0" p="0" display="flex" flexDirection="column" gap={collapsed ? "2" : "4"}>
        {navGroups.map((group, index) => {
          const open = collapsed || !closed[group.id]
          return (
            <chakra.li key={group.id} listStyle="none">
              {collapsed ? (
                index > 0 && <Separator mb="2" />
              ) : (
                <chakra.button
                  type="button"
                  onClick={() =>
                    setClosed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                  }
                  aria-expanded={open}
                  display="flex"
                  w="full"
                  h="7"
                  px="3"
                  mb="1"
                  alignItems="center"
                  justifyContent="space-between"
                  borderRadius="l2"
                  color="fg.muted"
                  fontSize="xs"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  cursor="pointer"
                  _hover={{ color: "fg" }}
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: "colorPalette.focusRing",
                    outlineOffset: "2px",
                  }}
                >
                  {group.label}
                  {open ? (
                    <LuChevronDown aria-hidden="true" />
                  ) : (
                    <LuChevronRight aria-hidden="true" />
                  )}
                </chakra.button>
              )}
              {open && (
                <chakra.ul
                  aria-label={group.label}
                  listStyle="none"
                  m="0"
                  p="0"
                  display="flex"
                  flexDirection="column"
                  gap="1"
                >
                  {group.items.map((item) => (
                    <chakra.li key={item.href} listStyle="none">
                      <NavLinkItem
                        item={item}
                        active={isActive(pathname, item.href)}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                      />
                    </chakra.li>
                  ))}
                </chakra.ul>
              )}
            </chakra.li>
          )
        })}
      </chakra.ul>
    </chakra.nav>
  )
}

function SidebarUser({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex
      align="center"
      justify={collapsed ? "center" : "flex-start"}
      gap="3"
      p="3"
      borderTopWidth="1px"
    >
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.email}
          </Text>
        </Box>
      )}
    </Flex>
  )
}

function Header({
  collapsed,
  onToggleCollapsed,
  onOpenMenu,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
  onOpenMenu: () => void
}) {
  const pathname = usePathname()
  const current = findNav(pathname)

  return (
    <Flex
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      h="14"
      px={{ base: "4", md: "6" }}
      align="center"
      gap="3"
      bg="bg"
      borderBottomWidth="1px"
    >
      <IconButton
        hideFrom="md"
        variant="ghost"
        size="sm"
        aria-label="Open navigation menu"
        onClick={onOpenMenu}
      >
        <LuMenu />
      </IconButton>
      <IconButton
        hideBelow="md"
        variant="ghost"
        size="sm"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        onClick={onToggleCollapsed}
      >
        {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
      </IconButton>

      <Box flex="1" minW="0">
        {current ? (
          <BreadcrumbRoot size="sm" separator={<LuChevronRight aria-hidden="true" />}>
            <Span color="fg.muted">{current.group.label}</Span>
            <BreadcrumbCurrentLink>{current.item.label}</BreadcrumbCurrentLink>
          </BreadcrumbRoot>
        ) : (
          <Text fontSize="sm" color="fg.muted">
            Lumen
          </Text>
        )}
      </Box>

      <ColorModeButton />

      <MenuRoot positioning={{ placement: "bottom-end" }}>
        <MenuTrigger asChild>
          <Button variant="ghost" size="sm" px="1" aria-label="Account menu">
            <Avatar name={user.name} size="xs" />
            <Span hideBelow="md">{user.name}</Span>
          </Button>
        </MenuTrigger>
        <MenuContent minW="12rem">
          <Box px="3" py="2">
            <Text fontSize="sm" fontWeight="medium">
              {user.name}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {user.email} · {user.role}
            </Text>
          </Box>
          <Separator />
          <MenuItem value="settings" asChild>
            <NextLink href="/settings">
              <LuSettings /> Settings
            </NextLink>
          </MenuItem>
          <MenuItem
            value="sign-out"
            onClick={() =>
              toaster.create({
                title: "Sign out is not available in this preview",
                type: "info",
              })
            }
          >
            <LuLogOut /> Sign out
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Flex>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  return (
    <Flex minH="100dvh" bg="bg" color="fg">
      <chakra.a
        href="#main-content"
        position="absolute"
        top="2"
        left="2"
        zIndex="skipLink"
        px="3"
        py="2"
        bg="bg.panel"
        borderWidth="1px"
        borderRadius="l2"
        transform="translateY(-200%)"
        _focusVisible={{ transform: "none" }}
      >
        Skip to content
      </chakra.a>

      <chakra.aside
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}
        bg="bg.subtle"
        borderEndWidth="1px"
        overflow="hidden"
        transition="width 0.2s ease"
        css={{ "@media (prefers-reduced-motion: reduce)": { transition: "none" } }}
      >
        <Flex
          h="14"
          align="center"
          justify={collapsed ? "center" : "flex-start"}
          px="4"
          borderBottomWidth="1px"
        >
          <Logo collapsed={collapsed} />
        </Flex>
        <SidebarNav collapsed={collapsed} />
        <SidebarUser collapsed={collapsed} />
      </chakra.aside>

      <DrawerRoot
        placement="start"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
      >
        <DrawerContent bg="bg.subtle">
          <DrawerHeader borderBottomWidth="1px">
            <DrawerTitle asChild>
              <Logo collapsed={false} />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody p="0" display="flex" flexDirection="column">
            <SidebarNav collapsed={false} onNavigate={() => setDrawerOpen(false)} />
            <SidebarUser collapsed={false} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Header
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onOpenMenu={() => setDrawerOpen(true)}
        />
        <chakra.main
          id="main-content"
          tabIndex={-1}
          flex="1"
          w="full"
          maxW="6xl"
          mx="auto"
          px={{ base: "4", md: "6", lg: "8" }}
          py={{ base: "6", md: "8" }}
          _focusVisible={{ outline: "none" }}
        >
          {children}
        </chakra.main>
      </Flex>
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
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <Stack
      direction={{ base: "column", sm: "row" }}
      justify="space-between"
      align={{ base: "flex-start", sm: "flex-end" }}
      gap="4"
      mb="6"
    >
      <Stack gap="1">
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
          {title}
        </Heading>
        {description && <Text color="fg.muted">{description}</Text>}
      </Stack>
      {actions}
    </Stack>
  )
}
```

```tsx components/status-badge.tsx
"use client"

import { Badge } from "@chakra-ui/react"
import type { ProjectStatus } from "@/lib/data"

const palette: Record<ProjectStatus, "green" | "yellow" | "gray"> = {
  Active: "green",
  Paused: "yellow",
  Archived: "gray",
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge colorPalette={palette[status]}>{status}</Badge>
}
```

```tsx app/page.tsx
"use client"

import {
  Box,
  Card,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  chakra,
} from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"
import {
  StatHelpText,
  StatLabel,
  StatRoot,
  StatValueText,
} from "@/components/ui/stat"
import {
  activeProjects,
  busiestProject,
  firstName,
  formatDate,
  projects,
  projectsByUpdate,
  totalIssues,
  user,
} from "@/lib/data"

export default function DashboardPage() {
  const latest = projectsByUpdate[0]
  const maxIssues = Math.max(...projects.map((p) => p.issues), 1)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName(user.name)}`}
        description={`${activeProjects.length} projects are active and ${totalIssues} issues are open across the workspace.`}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb="6">
        <Card.Root>
          <Card.Body>
            <StatRoot>
              <StatLabel>Open issues</StatLabel>
              <StatValueText value={totalIssues} />
              <StatHelpText>across {projects.length} projects</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root>
          <Card.Body>
            <StatRoot>
              <StatLabel>Active projects</StatLabel>
              <StatValueText value={activeProjects.length} />
              <StatHelpText>of {projects.length} in the workspace</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root>
          <Card.Body>
            <StatRoot>
              <StatLabel>Busiest project</StatLabel>
              <StatValueText>{busiestProject.key}</StatValueText>
              <StatHelpText>
                {busiestProject.name}, {busiestProject.issues} open issues
              </StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
        <Card.Root>
          <Card.Body>
            <StatRoot>
              <StatLabel>Last activity</StatLabel>
              <StatValueText>{formatDate(latest.updated)}</StatValueText>
              <StatHelpText>{latest.name}</StatHelpText>
            </StatRoot>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <Card.Root>
          <Card.Header>
            <Heading as="h2" size="md">
              Open issues by project
            </Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              {projects.map((p) => (
                <Box key={p.key}>
                  <Flex justify="space-between" mb="1" fontSize="sm">
                    <Text>
                      <chakra.span fontFamily="mono" color="fg.muted" mr="2">
                        {p.key}
                      </chakra.span>
                      {p.name}
                    </Text>
                    <Text fontWeight="medium">{p.issues}</Text>
                  </Flex>
                  <ProgressRoot
                    value={p.issues}
                    max={maxIssues}
                    size="sm"
                    aria-label={`${p.name}: ${p.issues} open issues`}
                  >
                    <ProgressBar />
                  </ProgressRoot>
                </Box>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading as="h2" size="md">
              Recently updated
            </Heading>
          </Card.Header>
          <Card.Body>
            <chakra.ul listStyle="none" m="0" p="0">
              {projectsByUpdate.map((p) => (
                <chakra.li
                  key={p.key}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="3"
                  py="3"
                  borderTopWidth="1px"
                  _first={{ borderTopWidth: "0", pt: "0" }}
                  _last={{ pb: "0" }}
                >
                  <Box minW="0">
                    <Text fontWeight="medium" truncate>
                      {p.name}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">
                      <chakra.span fontFamily="mono">{p.key}</chakra.span>
                      {" · "}
                      <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                    </Text>
                  </Box>
                  <StatusBadge status={p.status} />
                </chakra.li>
              ))}
            </chakra.ul>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </>
  )
}
```

```tsx app/projects/page.tsx
"use client"

import {
  Box,
  Input,
  Stack,
  Table,
  Text,
  chakra,
} from "@chakra-ui/react"
import * as React from "react"
import { LuSearch } from "react-icons/lu"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { InputGroup } from "@/components/ui/input-group"
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select"
import { formatDate, projects } from "@/lib/data"

const statusItems = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
  { value: "Archived", label: "Archived" },
]

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q)),
    )
  }, [query, status])

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the Acme Labs workspace and where its issues stand."
      />

      <Stack direction={{ base: "column", sm: "row" }} gap="3" mb="4">
        <InputGroup flex="1" startElement={<LuSearch aria-hidden="true" />}>
          <Input
            type="search"
            placeholder="Search by name or key"
            aria-label="Search projects"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </InputGroup>
        <NativeSelectRoot width={{ base: "full", sm: "12rem" }}>
          <NativeSelectField
            aria-label="Filter by status"
            items={statusItems}
            value={status}
            onChange={(e) => setStatus(e.currentTarget.value)}
          />
        </NativeSelectRoot>
      </Stack>

      <Text fontSize="sm" color="fg.muted" mb="2" role="status" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </Text>

      <Box overflowX="auto" borderWidth="1px" borderRadius="l3">
        <Table.Root aria-label="Projects" size="md">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
              <Table.ColumnHeader>Updated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visible.map((p) => (
              <Table.Row key={p.key}>
                <Table.Cell>
                  <chakra.span fontFamily="mono" fontWeight="medium">
                    {p.key}
                  </chakra.span>
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{p.name}</Table.Cell>
                <Table.Cell>
                  <StatusBadge status={p.status} />
                </Table.Cell>
                <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                <Table.Cell whiteSpace="nowrap">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
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
      </Box>
    </>
  )
}
```

```tsx app/reports/page.tsx
"use client"

import { Badge, Card, Heading, SimpleGrid, Text } from "@chakra-ui/react"
import { PageHeader } from "@/components/page-header"
import { formatDate, reports } from "@/lib/data"

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Scheduled reports that keep the team informed without a status meeting."
      />
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        {reports.map((r) => (
          <Card.Root key={r.id}>
            <Card.Header>
              <Heading as="h2" size="md">
                {r.name}
              </Heading>
            </Card.Header>
            <Card.Body gap="3">
              <Text color="fg.muted">{r.description}</Text>
              <Text fontSize="sm" color="fg.muted">
                Last run <time dateTime={r.lastRun}>{formatDate(r.lastRun)}</time>
              </Text>
            </Card.Body>
            <Card.Footer>
              <Badge>{r.cadence}</Badge>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>
    </>
  )
}
```

```tsx app/settings/page.tsx
"use client"

import {
  Button,
  Card,
  ClientOnly,
  Heading,
  Input,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

const themeItems = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
]

export default function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode()
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [assigned, setAssigned] = React.useState(true)
  const [digest, setDigest] = React.useState(true)
  const [weekly, setWeekly] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toaster.create({
      title: "Settings saved",
      description: `Changes for ${name} are applied.`,
      type: "success",
    })
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile, notifications and how Lumen looks."
      />

      <form onSubmit={handleSubmit}>
        <Stack gap="6" maxW="2xl">
          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="md">
                Profile
              </Heading>
            </Card.Header>
            <Card.Body gap="4">
              <Field label="Full name">
                <Input
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.currentTarget.value)}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
              </Field>
              <Field label="Role" helperText="Your role in this workspace.">
                <Input value={user.role} readOnly />
              </Field>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="md">
                Notifications
              </Heading>
            </Card.Header>
            <Card.Body gap="4">
              <Switch checked={assigned} onCheckedChange={(e) => setAssigned(e.checked)}>
                Email me when an issue is assigned to me
              </Switch>
              <Switch checked={digest} onCheckedChange={(e) => setDigest(e.checked)}>
                Send a daily project activity digest
              </Switch>
              <Switch checked={weekly} onCheckedChange={(e) => setWeekly(e.checked)}>
                Send a weekly throughput report
              </Switch>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="md">
                Appearance
              </Heading>
            </Card.Header>
            <Card.Body gap="3">
              <Text id="theme-label" color="fg.muted" fontSize="sm">
                Color theme
              </Text>
              <ClientOnly fallback={<Skeleton h="9" w="40" />}>
                <SegmentedControl
                  aria-labelledby="theme-label"
                  items={themeItems}
                  value={colorMode === "light" ? "light" : "dark"}
                  onValueChange={(e) => {
                    if (e.value === "dark" || e.value === "light") {
                      setColorMode(e.value)
                    }
                  }}
                />
              </ClientOnly>
            </Card.Body>
          </Card.Root>

          <Button type="submit" alignSelf="flex-start">
            Save changes
          </Button>
        </Stack>
      </form>
    </>
  )
}
```
