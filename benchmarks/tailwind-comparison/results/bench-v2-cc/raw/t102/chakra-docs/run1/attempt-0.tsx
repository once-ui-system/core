```ts lib/theme.ts
import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineSlotRecipe,
} from "@chakra-ui/react"

// Lumen's visual identity, carried through Chakra's own theming:
// brand colour (#DB2777) as the `brand` palette, warm sand neutrals replacing
// the `gray` scale, 16px radii, rounded headings, airy density.

const cardRecipe = defineSlotRecipe({
  slots: ["root", "header", "body", "footer", "title", "description"],
  variants: {
    size: {
      md: {
        root: { "--card-padding": "1.75rem" },
      },
    },
  },
})

const config = defineConfig({
  globalCss: {
    html: {
      // Every `colorPalette` inherits brand unless a component asks for another.
      colorPalette: "brand",
    },
    body: {
      bg: "bg",
      color: "fg",
    },
    "::selection": {
      bg: "brand.muted",
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
        // Warm sand replaces the neutral (gray) scale.
        gray: {
          50: { value: "#faf7f2" },
          100: { value: "#f4efe6" },
          200: { value: "#e8e0d0" },
          300: { value: "#d6cab4" },
          400: { value: "#b0a28a" },
          500: { value: "#7a6e58" },
          600: { value: "#5f5442" },
          700: { value: "#4a4132" },
          800: { value: "#342d22" },
          900: { value: "#231e16" },
          950: { value: "#17130d" },
        },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "12px" },
        l2: { value: "16px" },
        l3: { value: "16px" },
      },
      colors: {
        brand: {
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: { value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { base: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { base: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { base: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          border: { value: { base: "{colors.brand.300}", _dark: "{colors.brand.700}" } },
          focusRing: { value: "{colors.brand.600}" },
        },
        bg: {
          DEFAULT: { value: { base: "{colors.gray.50}", _dark: "{colors.gray.950}" } },
          subtle: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.900}" } },
          muted: { value: { base: "{colors.gray.200}", _dark: "{colors.gray.800}" } },
          emphasized: { value: { base: "{colors.gray.300}", _dark: "{colors.gray.700}" } },
          panel: { value: { base: "white", _dark: "{colors.gray.900}" } },
        },
        fg: {
          subtle: { value: { base: "{colors.gray.500}", _dark: "{colors.gray.400}" } },
        },
      },
    },
    slotRecipes: {
      card: cardRecipe,
    },
    recipes: {
      // Airy density: generous, large touch targets.
      button: {
        variants: {
          size: {
            sm: { h: "10", minW: "10", px: "4", textStyle: "sm" },
            md: { h: "12", minW: "12", px: "5", textStyle: "md" },
            lg: { h: "14", minW: "14", px: "6", textStyle: "md" },
          },
        },
      },
      input: {
        variants: {
          size: {
            md: { h: "12", px: "4", textStyle: "md" },
          },
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
      <ColorModeProvider defaultTheme="light" enableSystem={false} {...props} />
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
  title: { default: "Lumen", template: "%s · Lumen" },
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
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
]

export const statusColor: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`))
}

export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0)
export const countByStatus = (status: ProjectStatus) =>
  projects.filter((p) => p.status === status).length
```

```ts lib/nav.ts
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
  /** Pathname that makes this item the current one. */
  match?: string
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
      { label: "Overview", href: "/", match: "/", icon: LuLayoutDashboard },
      // Reports is a section of the dashboard.
      { label: "Reports", href: "/#reports", icon: LuFileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", match: "/projects", icon: LuFolder },
      { label: "Settings", href: "/settings", match: "/settings", icon: LuSettings },
    ],
  },
]

export function crumbsFor(pathname: string): { group: string; page: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.match === pathname) return { group: group.label, page: item.label }
    }
  }
  return { group: "Workspace", page: "Lumen" }
}
```

```tsx components/nav-list.tsx
"use client"

import { Box, Icon, Link, Separator, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Tooltip } from "@/components/ui/tooltip"
import { navGroups } from "@/lib/nav"

interface NavListProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname()

  return (
    <Box asChild>
      <nav aria-label="Main">
        <Stack asChild gap={collapsed ? "3" : "7"}>
          <ul>
            {navGroups.map((group, index) => (
              <li key={group.label}>
                {collapsed ? (
                  index > 0 && <Separator mb="3" />
                ) : (
                  <Text
                    textStyle="xs"
                    fontWeight="semibold"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    color="fg.muted"
                    px="4"
                    mb="2"
                  >
                    {group.label}
                  </Text>
                )}
                <Stack asChild gap="1">
                  <ul aria-label={group.label}>
                    {group.items.map((item) => {
                      const active = item.match === pathname
                      const IconGlyph = item.icon
                      return (
                        <li key={item.href}>
                          <Tooltip
                            content={item.label}
                            disabled={!collapsed}
                            showArrow
                            positioning={{ placement: "right" }}
                          >
                            <Link
                              asChild
                              colorPalette="brand"
                              display="flex"
                              alignItems="center"
                              gap="3"
                              minH="12"
                              px={collapsed ? "0" : "4"}
                              w={collapsed ? "12" : "full"}
                              mx={collapsed ? "auto" : "0"}
                              justifyContent={collapsed ? "center" : "flex-start"}
                              borderRadius="l2"
                              fontWeight="medium"
                              textDecoration="none"
                              color={active ? "colorPalette.contrast" : "fg"}
                              bg={active ? "colorPalette.solid" : "transparent"}
                              _hover={{
                                textDecoration: "none",
                                bg: active ? "colorPalette.solid" : "bg.muted",
                              }}
                            >
                              <NextLink
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                aria-label={collapsed ? item.label : undefined}
                                onClick={onNavigate}
                              >
                                <Icon boxSize="5" flexShrink={0}>
                                  <IconGlyph />
                                </Icon>
                                {!collapsed && <span>{item.label}</span>}
                              </NextLink>
                            </Link>
                          </Tooltip>
                        </li>
                      )
                    })}
                  </ul>
                </Stack>
              </li>
            ))}
          </ul>
        </Stack>
      </nav>
    </Box>
  )
}
```

```tsx components/app-shell.tsx
"use client"

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Link,
  Spacer,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  LuChevronsLeft,
  LuChevronsRight,
  LuMenu,
  LuSparkles,
} from "react-icons/lu"
import { NavList } from "@/components/nav-list"
import { Avatar } from "@/components/ui/avatar"
import { BreadcrumbCurrentLink, BreadcrumbRoot } from "@/components/ui/breadcrumb"
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
import { crumbsFor } from "@/lib/nav"

function BrandMark({ showName = true }: { showName?: boolean }) {
  return (
    <Link
      asChild
      colorPalette="brand"
      display="flex"
      alignItems="center"
      gap="3"
      textDecoration="none"
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/" aria-label="Lumen home">
        <Flex
          boxSize="11"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="l2"
          bg="colorPalette.solid"
          color="colorPalette.contrast"
        >
          <Icon boxSize="6">
            <LuSparkles />
          </Icon>
        </Flex>
        {showName && (
          <Text
            fontFamily="heading"
            fontWeight="bold"
            fontSize="2xl"
            color="fg"
            letterSpacing="tight"
          >
            Lumen
          </Text>
        )}
      </NextLink>
    </Link>
  )
}

function UserMenu() {
  return (
    <MenuRoot positioning={{ placement: "bottom-end" }}>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          colorPalette="gray"
          h="auto"
          py="2"
          px="2"
          gap="3"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar size="sm" name={user.name} colorPalette="brand" />
          <Box hideBelow="md" textAlign="start">
            <Text fontWeight="semibold" lineHeight="short">
              {user.name}
            </Text>
            <Text textStyle="xs" color="fg.muted" lineHeight="short">
              {user.role}
            </Text>
          </Box>
        </Button>
      </MenuTrigger>
      <MenuContent minW="64">
        <Box px="3" py="2">
          <Text fontWeight="semibold">{user.name}</Text>
          <Text textStyle="sm" color="fg.muted">
            {user.email}
          </Text>
        </Box>
        <MenuSeparator />
        <MenuItem value="settings" asChild minH="11">
          <NextLink href="/settings">Settings</NextLink>
        </MenuItem>
        <MenuItem
          value="sign-out"
          minH="11"
          onClick={() =>
            toaster.create({
              title: "Demo workspace",
              description: "Signing out is turned off in this preview.",
              type: "info",
            })
          }
        >
          Sign out
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const isDesktop = useBreakpointValue({ base: false, md: true })
  const crumbs = crumbsFor(pathname)

  React.useEffect(() => {
    if (isDesktop) setDrawerOpen(false)
  }, [isDesktop])

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar"

  return (
    <Flex minH="100dvh" colorPalette="brand" bg="bg">
      <Link
        href="#main"
        position="absolute"
        zIndex="skipLink"
        insetStart="4"
        top="4"
        px="5"
        py="3"
        borderRadius="l2"
        bg="colorPalette.solid"
        color="colorPalette.contrast"
        transform="translateY(-200%)"
        _focus={{ transform: "none" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Box asChild>
        <aside aria-label="Sidebar">
          <Flex
            display={{ base: "none", md: "flex" }}
            direction="column"
            position="sticky"
            top="0"
            alignSelf="flex-start"
            h="100dvh"
            flexShrink={0}
            w={collapsed ? "24" : "72"}
            px="4"
            py="5"
            gap="8"
            bg="bg.panel"
            borderEndWidth="1px"
            borderColor="border"
            transition="width 0.2s ease"
            overflowY="auto"
          >
            <Flex justify={collapsed ? "center" : "flex-start"} px={collapsed ? "0" : "2"}>
              <BrandMark showName={!collapsed} />
            </Flex>
            <Box flex="1">
              <NavList collapsed={collapsed} />
            </Box>
            <Tooltip
              content={toggleLabel}
              disabled={!collapsed}
              showArrow
              positioning={{ placement: "right" }}
            >
              <Button
                variant="ghost"
                colorPalette="gray"
                justifyContent={collapsed ? "center" : "flex-start"}
                w={collapsed ? "12" : "full"}
                mx={collapsed ? "auto" : "0"}
                px={collapsed ? "0" : "4"}
                aria-label={toggleLabel}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <LuChevronsRight /> : <LuChevronsLeft />}
                {!collapsed && "Collapse"}
              </Button>
            </Tooltip>
          </Flex>
        </aside>
      </Box>

      <Flex direction="column" flex="1" minW="0">
        <Box asChild>
          <header>
            <Flex
              position="sticky"
              top="0"
              zIndex="sticky"
              align="center"
              gap="3"
              minH="20"
              px={{ base: "4", md: "8" }}
              bg="bg/85"
              backdropFilter="blur(12px)"
              borderBottomWidth="1px"
              borderColor="border"
            >
              <IconButton
                hideFrom="md"
                variant="outline"
                colorPalette="gray"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
              >
                <LuMenu />
              </IconButton>
              <BreadcrumbRoot size="lg">
                <Text as="span" color="fg.muted">
                  {crumbs.group}
                </Text>
                <BreadcrumbCurrentLink>{crumbs.page}</BreadcrumbCurrentLink>
              </BreadcrumbRoot>
              <Spacer />
              <ColorModeButton colorPalette="gray" />
              <UserMenu />
            </Flex>
          </header>
        </Box>

        <Box asChild flex="1">
          <main id="main" tabIndex={-1}>
            <Box
              w="full"
              maxW="6xl"
              mx="auto"
              px={{ base: "4", md: "8" }}
              py={{ base: "8", md: "12" }}
              outline="none"
            >
              {children}
            </Box>
          </main>
        </Box>
      </Flex>

      {/* Phone navigation drawer */}
      <DrawerRoot
        placement="start"
        size="xs"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
      >
        <DrawerContent colorPalette="brand">
          <DrawerHeader pt="6">
            <DrawerTitle asChild>
              <div>
                <BrandMark />
              </div>
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody pt="4">
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  )
}
```

```tsx components/page-intro.tsx
"use client"

import { Box, Heading, Text } from "@chakra-ui/react"
import * as React from "react"

export function PageIntro({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="flex-end"
      justifyContent="space-between"
      gap="4"
      mb="10"
    >
      <Box>
        <Heading as="h1" size={{ base: "3xl", md: "4xl" }} letterSpacing="tight">
          {title}
        </Heading>
        <Text color="fg.muted" mt="2" textStyle="lg">
          {description}
        </Text>
      </Box>
      {actions}
    </Box>
  )
}
```

```tsx components/dashboard-view.tsx
"use client"

import {
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
import { LuBug, LuCirclePause, LuFolderCheck, LuHistory } from "react-icons/lu"
import { PageIntro } from "@/components/page-intro"
import { ProgressBar, ProgressRoot, ProgressValueText } from "@/components/ui/progress"
import {
  countByStatus,
  formatDate,
  projects,
  statusColor,
  totalIssues,
  user,
} from "@/lib/data"

function SummaryCard({
  icon,
  label,
  value,
  hint,
  palette,
}: {
  icon: IconType
  label: string
  value: string
  hint: string
  palette: string
}) {
  const Glyph = icon
  return (
    <Card.Root variant="elevated" colorPalette={palette}>
      <Card.Body gap="4">
        <Flex align="center" justify="space-between" gap="3">
          <Text color="fg.muted" fontWeight="medium">
            {label}
          </Text>
          <Flex
            boxSize="12"
            align="center"
            justify="center"
            borderRadius="l2"
            bg="colorPalette.muted"
            color="colorPalette.fg"
            aria-hidden="true"
          >
            <Icon boxSize="6">
              <Glyph />
            </Icon>
          </Flex>
        </Flex>
        <Text fontFamily="heading" fontWeight="bold" fontSize="4xl" lineHeight="1">
          {value}
        </Text>
        <Text textStyle="sm" color="fg.muted">
          {hint}
        </Text>
      </Card.Body>
    </Card.Root>
  )
}

export function DashboardView() {
  const firstName = user.name.split(" ")[0]
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 4)
  const withIssues = [...projects]
    .filter((p) => p.issues > 0)
    .sort((a, b) => b.issues - a.issues)
  const latest = recent[0]

  return (
    <Stack gap="10">
      <PageIntro
        title={`Welcome back, ${firstName}`}
        description="Here is how your projects are doing today. Nice work, team."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="6">
        <SummaryCard
          icon={LuBug}
          label="Open issues"
          value={String(totalIssues)}
          hint={`Across ${projects.length} projects`}
          palette="brand"
        />
        <SummaryCard
          icon={LuFolderCheck}
          label="Active projects"
          value={String(countByStatus("Active"))}
          hint={`${countByStatus("Archived")} archived`}
          palette="green"
        />
        <SummaryCard
          icon={LuCirclePause}
          label="Paused projects"
          value={String(countByStatus("Paused"))}
          hint="Mobile beta is waiting for a restart"
          palette="orange"
        />
        <SummaryCard
          icon={LuHistory}
          label="Latest update"
          value={formatDate(latest.updated)}
          hint={latest.name}
          palette="gray"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 5 }} gap="6">
        <Box id="reports" gridColumn={{ lg: "span 3" }} scrollMarginTop="24">
          <Card.Root variant="outline" h="full">
            <Card.Body gap="6">
              <Box>
                <Heading as="h2" size="xl">
                  Open issues by project
                </Heading>
                <Text color="fg.muted" mt="1">
                  Each bar shows a project's share of the {totalIssues} open issues.
                </Text>
              </Box>
              <Stack asChild gap="5">
                <ul>
                  {withIssues.map((p) => {
                    const share = Math.round((p.issues / totalIssues) * 100)
                    return (
                      <li key={p.key}>
                        <ProgressRoot value={share} size="lg" colorPalette="brand">
                          <HStack justify="space-between" mb="2">
                            <Text fontWeight="medium">
                              {p.name}{" "}
                              <Text as="span" color="fg.muted" fontWeight="normal">
                                ({p.issues} {p.issues === 1 ? "issue" : "issues"})
                              </Text>
                            </Text>
                            <ProgressValueText />
                          </HStack>
                          <ProgressBar />
                        </ProgressRoot>
                      </li>
                    )
                  })}
                </ul>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Box>

        <Box gridColumn={{ lg: "span 2" }}>
          <Card.Root variant="outline" h="full">
            <Card.Body gap="5">
              <Heading as="h2" size="xl">
                Recently updated
              </Heading>
              <Stack asChild gap="2">
                <ul>
                  {recent.map((p) => (
                    <li key={p.key}>
                      <Link
                        asChild
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        gap="3"
                        minH="14"
                        px="4"
                        borderRadius="l2"
                        textDecoration="none"
                        color="fg"
                        _hover={{ bg: "bg.muted", textDecoration: "none" }}
                      >
                        <NextLink href="/projects">
                          <Box minW="0">
                            <Text fontWeight="semibold" truncate>
                              {p.name}
                            </Text>
                            <Text textStyle="sm" color="fg.muted">
                              {formatDate(p.updated)}
                            </Text>
                          </Box>
                          <Text
                            textStyle="sm"
                            fontWeight="medium"
                            color={`${statusColor[p.status]}.fg`}
                          >
                            {p.status}
                          </Text>
                        </NextLink>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Box>
      </SimpleGrid>
    </Stack>
  )
}
```

```tsx components/projects-view.tsx
"use client"

import {
  Badge,
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { LuFolderSearch, LuPlus, LuSearch } from "react-icons/lu"
import { PageIntro } from "@/components/page-intro"
import { EmptyState } from "@/components/ui/empty-state"
import { InputGroup } from "@/components/ui/input-group"
import { toaster } from "@/components/ui/toaster"
import {
  formatDate,
  projects,
  statusColor,
  type ProjectStatus,
} from "@/lib/data"

const filters: Array<"All" | ProjectStatus> = ["All", "Active", "Paused", "Archived"]

export function ProjectsView() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<"All" | ProjectStatus>("All")

  const visible = projects.filter((p) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)
    return matchesQuery && (status === "All" || p.status === status)
  })

  return (
    <Stack gap="8">
      <PageIntro
        title="Projects"
        description="Everything your team is building, in one friendly list."
        actions={
          <Button
            colorPalette="brand"
            onClick={() =>
              toaster.create({
                title: "New projects are coming soon",
                description: "For now, this workspace keeps the five projects below.",
                type: "info",
              })
            }
          >
            <LuPlus />
            New project
          </Button>
        }
      />

      <Flex direction={{ base: "column", md: "row" }} gap="4" align={{ md: "center" }}>
        <InputGroup
          flex="1"
          maxW={{ md: "md" }}
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
        <Flex role="group" aria-label="Filter by status" gap="2" wrap="wrap">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              borderRadius="full"
              variant={status === f ? "solid" : "outline"}
              colorPalette={status === f ? "brand" : "gray"}
              aria-pressed={status === f}
              onClick={() => setStatus(f)}
            >
              {f}
            </Button>
          ))}
        </Flex>
      </Flex>

      <Text color="fg.muted" textStyle="sm" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </Text>

      {visible.length === 0 ? (
        <EmptyState
          icon={<LuFolderSearch />}
          title="No projects match"
          description="Try a different search or clear the status filter."
        >
          <Button
            variant="outline"
            colorPalette="gray"
            onClick={() => {
              setQuery("")
              setStatus("All")
            }}
          >
            Clear filters
          </Button>
        </EmptyState>
      ) : (
        <Box
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          borderRadius="l3"
          overflow="hidden"
        >
          <Table.ScrollArea>
            <Table.Root size="lg" interactive aria-label="Projects" minW="2xl">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader px="6" py="4">Key</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Project</Table.ColumnHeader>
                  <Table.ColumnHeader py="4">Status</Table.ColumnHeader>
                  <Table.ColumnHeader py="4" textAlign="end">Open issues</Table.ColumnHeader>
                  <Table.ColumnHeader px="6" py="4" textAlign="end">Updated</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {visible.map((p) => (
                  <Table.Row key={p.key}>
                    <Table.Cell px="6" py="5" fontFamily="mono" fontWeight="semibold" color="colorPalette.fg">
                      {p.key}
                    </Table.Cell>
                    <Table.Cell py="5" fontWeight="semibold">{p.name}</Table.Cell>
                    <Table.Cell py="5">
                      <Badge
                        size="lg"
                        borderRadius="full"
                        px="3"
                        colorPalette={statusColor[p.status]}
                      >
                        {p.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell py="5" textAlign="end">{p.issues}</Table.Cell>
                    <Table.Cell px="6" py="5" textAlign="end" color="fg.muted">
                      {formatDate(p.updated)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </Box>
      )}
    </Stack>
  )
}
```

```tsx components/settings-view.tsx
"use client"

import {
  Box,
  Button,
  ClientOnly,
  Card,
  Heading,
  Input,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import * as React from "react"
import { PageIntro } from "@/components/page-intro"
import { useColorMode } from "@/components/ui/color-mode"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

function AppearanceSwitch() {
  const { colorMode, setColorMode } = useColorMode()
  return (
    <Switch
      size="lg"
      checked={colorMode === "dark"}
      onCheckedChange={(e) => setColorMode(e.checked ? "dark" : "light")}
    >
      Dark mode
    </Switch>
  )
}

export function SettingsView() {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [notify, setNotify] = React.useState({
    assigned: true,
    weekly: true,
    mentions: false,
  })

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const nameValid = name.trim().length > 0

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!emailValid || !nameValid) return
    toaster.create({
      title: "Settings saved",
      description: "Your changes are live. Thanks for keeping things tidy.",
      type: "success",
    })
  }

  return (
    <Box maxW="3xl">
      <PageIntro
        title="Settings"
        description="Tune your profile and how Lumen keeps you in the loop."
      />
      <form onSubmit={save} noValidate>
        <Stack gap="8">
          <Card.Root variant="outline">
            <Card.Body gap="6">
              <Heading as="h2" size="xl">
                Profile
              </Heading>
              <Field label="Full name" invalid={!nameValid} errorText="Please enter your name.">
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field
                label="Email"
                invalid={!emailValid}
                errorText="Enter an email like name@company.com."
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Role" helperText="Only the workspace owner can change roles.">
                <Input value={user.role} readOnly />
              </Field>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Body gap="6">
              <Box>
                <Heading as="h2" size="xl">
                  Notifications
                </Heading>
                <Text color="fg.muted" mt="1">
                  Choose what lands in your inbox.
                </Text>
              </Box>
              <Switch
                size="lg"
                checked={notify.assigned}
                onCheckedChange={(e) => setNotify((n) => ({ ...n, assigned: e.checked }))}
              >
                Issues assigned to me
              </Switch>
              <Switch
                size="lg"
                checked={notify.weekly}
                onCheckedChange={(e) => setNotify((n) => ({ ...n, weekly: e.checked }))}
              >
                Weekly summary every Monday
              </Switch>
              <Switch
                size="lg"
                checked={notify.mentions}
                onCheckedChange={(e) => setNotify((n) => ({ ...n, mentions: e.checked }))}
              >
                Mentions in comments
              </Switch>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Body gap="6">
              <Heading as="h2" size="xl">
                Appearance
              </Heading>
              <ClientOnly fallback={<Skeleton h="8" w="40" />}>
                <AppearanceSwitch />
              </ClientOnly>
            </Card.Body>
          </Card.Root>

          <Box>
            <Button type="submit" size="lg" colorPalette="brand">
              Save changes
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  )
}
```

```tsx app/page.tsx
import { DashboardView } from "@/components/dashboard-view"

export default function DashboardPage() {
  return <DashboardView />
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next"
import { ProjectsView } from "@/components/projects-view"

export const metadata: Metadata = { title: "Projects" }

export default function ProjectsPage() {
  return <ProjectsView />
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next"
import { SettingsView } from "@/components/settings-view"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return <SettingsView />
}
```
