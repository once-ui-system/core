The `project/` directory has no `lib/` folder yet, and the `@/*` alias maps to the project root. My earlier reply put `lib/data.ts` in a block that may not have been written out as a separate file. I'll resend every file in full, with `lib/data.ts` included explicitly.

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived"

export interface Project {
  key: string
  name: string
  status: ProjectStatus
  issues: number
  updated: string
}

export interface User {
  name: string
  email: string
  role: string
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
}

export const user: User = {
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

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** Formats an ISO date (YYYY-MM-DD) deterministically, independent of locale/timezone. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}

export type NavIconName = "overview" | "reports" | "projects" | "settings"

export interface NavItem {
  label: string
  /** Route to link to. Items without an href are rendered as unavailable. */
  href?: string
  icon: NavIconName
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: "overview" },
      { label: "Reports", icon: "reports" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
]

export interface Crumb {
  label: string
  href?: string
}

/** Breadcrumb trail for a pathname. The last crumb is the current page. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }]
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }]
  }
  return [{ label: "Analytics" }, { label: "Overview" }]
}

export interface SummaryCard {
  label: string
  value: number
  unit?: string
  help: string
  trend: "up" | "down"
  change: string
}

export const summaryCards: SummaryCard[] = [
  {
    label: "Open issues",
    value: projects.reduce((sum, p) => sum + p.issues, 0),
    help: "Across 5 projects",
    trend: "up",
    change: "8%",
  },
  {
    label: "Active projects",
    value: projects.filter((p) => p.status === "Active").length,
    help: "1 paused, 1 archived",
    trend: "up",
    change: "1 new",
  },
  {
    label: "Weekly active users",
    value: 2841,
    help: "vs. previous 7 days",
    trend: "up",
    change: "4.2%",
  },
  {
    label: "Median time to close",
    value: 3.4,
    unit: "days",
    help: "vs. previous 7 days",
    trend: "down",
    change: "0.6 d",
  },
]
```

```tsx components/nav-list.tsx
"use client"

import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useState } from "react"
import {
  LuChevronDown,
  LuFileText,
  LuFolderKanban,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { type NavGroup, type NavIconName, navGroups } from "@/lib/data"

const icons: Record<NavIconName, ReactNode> = {
  overview: <LuLayoutDashboard />,
  reports: <LuFileText />,
  projects: <LuFolderKanban />,
  settings: <LuSettings />,
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface NavListProps {
  /** Icon-only presentation (desktop collapsed sidebar). */
  collapsed?: boolean
  /** Called after a link is chosen, e.g. to close the mobile drawer. */
  onNavigate?: () => void
}

interface NavGroupSectionProps extends NavListProps {
  group: NavGroup
  pathname: string
}

function NavGroupSection({
  group,
  pathname,
  collapsed = false,
  onNavigate,
}: NavGroupSectionProps) {
  const [open, setOpen] = useState(true)
  const listId = `nav-group-${group.label.toLowerCase()}`
  const showItems = collapsed || open

  const list = (
    <Box
      as="ul"
      id={listId}
      listStyleType="none"
      m="0"
      p="0"
      display="flex"
      flexDirection="column"
      gap="0.5"
    >
      {group.items.map((item) => {
        const active = !!item.href && isActive(pathname, item.href)

        const content = (
          <>
            <Icon boxSize="5" flexShrink="0" aria-hidden="true">
              {icons[item.icon]}
            </Icon>
            {collapsed ? (
              <Box srOnly>{item.label}</Box>
            ) : (
              <>
                <Text as="span" flex="1" truncate>
                  {item.label}
                </Text>
                {!item.href && (
                  <Text as="span" fontSize="xs" color="fg.subtle">
                    Soon
                  </Text>
                )}
              </>
            )}
          </>
        )

        return (
          <li key={item.label}>
            <Tooltip
              content={item.label}
              positioning={{ placement: "right" }}
              disabled={!collapsed}
              showArrow
            >
              {item.href ? (
                <Flex
                  asChild
                  align="center"
                  gap="3"
                  px={collapsed ? "0" : "3"}
                  justify={collapsed ? "center" : "flex-start"}
                  h="10"
                  rounded="md"
                  fontSize="sm"
                  fontWeight={active ? "semibold" : "medium"}
                  colorPalette="blue"
                  bg={active ? "colorPalette.subtle" : "transparent"}
                  color={active ? "colorPalette.fg" : "fg.muted"}
                  _hover={{
                    bg: active ? "colorPalette.subtle" : "bg.muted",
                    color: active ? "colorPalette.fg" : "fg",
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                  >
                    {content}
                  </Link>
                </Flex>
              ) : (
                <Flex
                  align="center"
                  gap="3"
                  px={collapsed ? "0" : "3"}
                  justify={collapsed ? "center" : "flex-start"}
                  h="10"
                  rounded="md"
                  fontSize="sm"
                  fontWeight="medium"
                  tabIndex={0}
                  role="link"
                  aria-disabled="true"
                  color="fg.subtle"
                  cursor="not-allowed"
                >
                  {content}
                </Flex>
              )}
            </Tooltip>
          </li>
        )
      })}
    </Box>
  )

  if (collapsed) {
    return (
      <Box role="group" aria-label={group.label}>
        <Box h="px" bg="border.muted" mx="2" mb="2" aria-hidden="true" />
        {list}
      </Box>
    )
  }

  return (
    <Box>
      <Flex
        asChild
        w="full"
        align="center"
        justify="space-between"
        px="3"
        py="1.5"
        mb="1"
        rounded="md"
        cursor="pointer"
        color="fg.muted"
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wider"
        _hover={{ color: "fg" }}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
        >
          {group.label}
          <Icon
            boxSize="4"
            transition="transform 0.15s"
            transform={open ? "rotate(0deg)" : "rotate(-90deg)"}
            aria-hidden="true"
          >
            <LuChevronDown />
          </Icon>
        </button>
      </Flex>
      {showItems ? list : null}
    </Box>
  )
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname()

  return (
    <Box as="nav" aria-label="Main" w="full">
      <Box
        as="ul"
        listStyleType="none"
        m="0"
        p="0"
        display="flex"
        flexDirection="column"
        gap="4"
      >
        {navGroups.map((group) => (
          <li key={group.label}>
            <NavGroupSection
              group={group}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </Box>
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
  IconButton,
  Separator,
  SkipNavContent,
  SkipNavLink,
  Text,
} from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSparkles,
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
import { Tooltip } from "@/components/ui/tooltip"
import { getBreadcrumbs, user } from "@/lib/data"

function BrandMark() {
  return (
    <Flex
      boxSize="8"
      rounded="md"
      bg="blue.solid"
      color="blue.contrast"
      align="center"
      justify="center"
      flexShrink="0"
      aria-hidden="true"
    >
      <LuSparkles />
    </Flex>
  )
}

function BrandLink({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" aria-label="Lumen home">
      <HStack gap="2" justify={collapsed ? "center" : "flex-start"}>
        <BrandMark />
        {!collapsed && (
          <Text fontWeight="bold" fontSize="lg" letterSpacing="tight">
            Lumen
          </Text>
        )}
      </HStack>
    </Link>
  )
}

function UserBadge({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <HStack gap="3" justify={collapsed ? "center" : "flex-start"} minW="0">
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.role}
          </Text>
        </Box>
      )}
    </HStack>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const crumbs = getBreadcrumbs(pathname)

  // Close the phone drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <Flex minH="100dvh" bg="bg">
      <SkipNavLink>Skip to content</SkipNavLink>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        aria-label="Sidebar"
        display={{ base: "none", md: "flex" }}
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink="0"
        w={collapsed ? "16" : "64"}
        borderEndWidth="1px"
        bg="bg.subtle"
        transition="width 0.2s ease"
        overflow="hidden"
      >
        <Flex h="14" align="center" justify="center" px={collapsed ? "0" : "4"}>
          <Box flex={collapsed ? "none" : "1"}>
            <BrandLink collapsed={collapsed} />
          </Box>
        </Flex>
        <Box flex="1" overflowY="auto" overflowX="hidden" px="2" py="2">
          <NavList collapsed={collapsed} />
        </Box>
        <Separator />
        <Box p="3">
          <UserBadge collapsed={collapsed} />
        </Box>
      </Flex>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="14"
          align="center"
          gap="2"
          px={{ base: "3", md: "6" }}
          borderBottomWidth="1px"
          bg="bg"
        >
          {/* Phones: menu button opens the navigation drawer */}
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>

          {/* Desktop: collapse / expand the sidebar */}
          <Box display={{ base: "none", md: "block" }}>
            <Tooltip
              content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box flex="1" minW="0">
            <BreadcrumbRoot size="sm">
              {crumbs.map((crumb, index) =>
                index === crumbs.length - 1 ? (
                  <BreadcrumbCurrentLink key={crumb.label}>
                    {crumb.label}
                  </BreadcrumbCurrentLink>
                ) : (
                  <Text as="span" key={crumb.label} color="fg.muted">
                    {crumb.label}
                  </Text>
                ),
              )}
            </BreadcrumbRoot>
          </Box>

          <ColorModeButton />
          <Box display={{ base: "none", sm: "block" }}>
            <Avatar name={user.name} size="xs" />
          </Box>
        </Flex>

        <Box
          as="main"
          flex="1"
          px={{ base: "4", md: "8" }}
          py={{ base: "5", md: "8" }}
        >
          <SkipNavContent />
          <Box maxW="6xl" mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Phone navigation drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(details) => setDrawerOpen(details.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent>
          <DrawerHeader>
            <HStack gap="2">
              <BrandMark />
              <DrawerTitle fontWeight="bold" fontSize="lg">
                Lumen
              </DrawerTitle>
            </HStack>
          </DrawerHeader>
          <DrawerBody px="2">
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
          <Box p="4" borderTopWidth="1px">
            <UserBadge />
          </Box>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  )
}
```

```tsx components/page-heading.tsx
import { Box, Heading, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

interface PageHeadingProps {
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeading({ title, description, actions }: PageHeadingProps) {
  return (
    <Box
      display="flex"
      flexDirection={{ base: "column", sm: "row" }}
      alignItems={{ base: "flex-start", sm: "center" }}
      justifyContent="space-between"
      gap="3"
      mb="6"
    >
      <Box minW="0">
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
          {title}
        </Heading>
        <Text color="fg.muted" mt="1">
          {description}
        </Text>
      </Box>
      {actions}
    </Box>
  )
}
```

```tsx components/settings-form.tsx
"use client"

import { Button, Card, Heading, Input, Stack, Text } from "@chakra-ui/react"
import { type FormEvent, useState } from "react"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"

export function SettingsForm() {
  const [displayName, setDisplayName] = useState(user.name)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [issueAlerts, setIssueAlerts] = useState(true)
  const [productNews, setProductNews] = useState(false)

  const nameInvalid = displayName.trim().length === 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (nameInvalid) return
    toaster.create({
      title: "Settings saved",
      description: "Your preferences have been updated.",
      type: "success",
    })
  }

  return (
    <Card.Root variant="outline" asChild>
      <form onSubmit={handleSubmit} noValidate>
        <Card.Header>
          <Heading as="h2" size="md">
            Preferences
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            Choose your display name and notification settings.
          </Text>
        </Card.Header>
        <Card.Body>
          <Stack gap="5">
            <Field
              label="Display name"
              invalid={nameInvalid}
              errorText="Display name is required."
              helperText="Shown to teammates on issues and comments."
              required
            >
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </Field>

            <Stack gap="4" role="group" aria-label="Notifications">
              <Switch
                checked={weeklyDigest}
                onCheckedChange={(e) => setWeeklyDigest(e.checked)}
              >
                Weekly analytics digest
              </Switch>
              <Switch
                checked={issueAlerts}
                onCheckedChange={(e) => setIssueAlerts(e.checked)}
              >
                Alert me when an issue is assigned to me
              </Switch>
              <Switch
                checked={productNews}
                onCheckedChange={(e) => setProductNews(e.checked)}
              >
                Product news and release notes
              </Switch>
            </Stack>
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent="flex-end">
          <Button type="submit" colorPalette="blue">
            Save changes
          </Button>
        </Card.Footer>
      </form>
    </Card.Root>
  )
}
```

```tsx app/page.tsx
import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stat,
  Text,
} from "@chakra-ui/react"
import { AppShell } from "@/components/app-shell"
import { PageHeading } from "@/components/page-heading"
import {
  formatDate,
  product,
  projects,
  statusPalette,
  summaryCards,
  user,
} from "@/lib/data"

export default function DashboardPage() {
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3)

  return (
    <AppShell>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${product.tagline}. Here is how your workspace looks today.`}
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" mb="8">
        {summaryCards.map((card) => (
          <Card.Root key={card.label} variant="outline">
            <Card.Body>
              <Stat.Root>
                <Stat.Label>{card.label}</Stat.Label>
                <Stat.ValueText alignItems="baseline">
                  {card.value}
                  {card.unit ? (
                    <Stat.ValueUnit>{card.unit}</Stat.ValueUnit>
                  ) : null}
                </Stat.ValueText>
                <HStack gap="2" flexWrap="wrap">
                  <Badge colorPalette={card.trend === "up" ? "green" : "blue"}>
                    {card.trend === "up" ? (
                      <Stat.UpIndicator />
                    ) : (
                      <Stat.DownIndicator />
                    )}
                    {card.change}
                  </Badge>
                  <Stat.HelpText>{card.help}</Stat.HelpText>
                </HStack>
              </Stat.Root>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading as="h2" size="md">
            Recently updated projects
          </Heading>
        </Card.Header>
        <Card.Body pt="0">
          <Box as="ul" listStyleType="none" m="0" p="0">
            {recent.map((project, index) => (
              <Flex
                as="li"
                key={project.key}
                align="center"
                justify="space-between"
                gap="3"
                py="3"
                borderTopWidth={index === 0 ? "0" : "1px"}
              >
                <Box minW="0">
                  <Text fontWeight="medium" truncate>
                    {project.name}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {project.key} · {project.issues} open issues · Updated{" "}
                    {formatDate(project.updated)}
                  </Text>
                </Box>
                <Badge colorPalette={statusPalette[project.status]}>
                  {project.status}
                </Badge>
              </Flex>
            ))}
          </Box>
        </Card.Body>
      </Card.Root>
    </AppShell>
  )
}
```

```tsx app/projects/layout.tsx
import type { ReactNode } from "react"
import { AppShell } from "@/components/app-shell"

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

```tsx app/projects/page.tsx
import { Badge, Box, Table, Text } from "@chakra-ui/react"
import { PageHeading } from "@/components/page-heading"
import { formatDate, projects, statusPalette } from "@/lib/data"

export const metadata = { title: "Projects · Lumen" }

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in your workspace.`}
      />

      <Table.ScrollArea borderWidth="1px" rounded="md">
        <Table.Root size="md" variant="line" interactive>
          <Table.Caption srOnly>
            Projects with their status, open issue count and last update
          </Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader scope="col">Key</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Project</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Status</Table.ColumnHeader>
              <Table.ColumnHeader scope="col" textAlign="end">
                Open issues
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col" textAlign="end">
                Updated
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projects.map((project) => (
              <Table.Row key={project.key}>
                <Table.Cell>
                  <Box as="code" fontSize="sm" fontWeight="semibold">
                    {project.key}
                  </Box>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="medium">{project.name}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusPalette[project.status]}>
                    {project.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{project.issues}</Table.Cell>
                <Table.Cell textAlign="end" whiteSpace="nowrap">
                  <time dateTime={project.updated}>
                    {formatDate(project.updated)}
                  </time>
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

```tsx app/settings/layout.tsx
import type { ReactNode } from "react"
import { AppShell } from "@/components/app-shell"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

```tsx app/settings/page.tsx
import { Box, Card, DataList, Heading, Text } from "@chakra-ui/react"
import { PageHeading } from "@/components/page-heading"
import { SettingsForm } from "@/components/settings-form"
import { user } from "@/lib/data"

export const metadata = { title: "Settings · Lumen" }

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />

      <Box display="grid" gap="6" maxW="3xl">
        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h2" size="md">
              Account
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              Details for the signed-in user.
            </Text>
          </Card.Header>
          <Card.Body>
            <DataList.Root orientation="horizontal" gap="3">
              <DataList.Item>
                <DataList.ItemLabel>Name</DataList.ItemLabel>
                <DataList.ItemValue>{user.name}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Email</DataList.ItemLabel>
                <DataList.ItemValue>{user.email}</DataList.ItemValue>
              </DataList.Item>
              <DataList.Item>
                <DataList.ItemLabel>Role</DataList.ItemLabel>
                <DataList.ItemValue>{user.role}</DataList.ItemValue>
              </DataList.Item>
            </DataList.Root>
          </Card.Body>
        </Card.Root>

        <SettingsForm />
      </Box>
    </>
  )
}
```