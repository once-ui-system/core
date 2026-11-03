The docs confirm `Switch.Label` is a `<span>`, so my `<Text>` (a `<p>`) inside it is invalid nesting. That is a real bug, but it only affects `/settings`.

For the error on every route, the most likely cause is what I've been circling: server-rendered markup that React doesn't reproduce on the client. The server HTML contains the `Drawer`'s `DrawerContent`/`Portal` and the desktop/mobile controls that are toggled by CSS. The robust fix is to render the entire interactive shell (sidebar, drawer, header controls) on the client only, with a static skeleton fallback matching the layout. Pages render inside `<main>` on the server for SEO and a fast first paint, and hydration only has to match the static content.

The shell has these parts:

-   Server-rendered: `<main>` with the page content (static).
-   Client-only: sidebar, header, breadcrumb, drawer. They sit behind `ClientOnly`, so the server HTML and first client render are identical (the fallback).

I'll split the shell into `AppShell`, which keeps the layout frame and the static skip link, and a `ShellChrome` (client-only) that holds the interactive parts.

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user: User = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type IconName = "overview" | "reports" | "projects" | "settings";

export interface NavItem {
  label: string;
  /** Route to navigate to. Items without an href are not available yet. */
  href?: string;
  icon: IconName;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
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
];

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb trail per route. The last crumb is the current screen. */
export const breadcrumbs: Record<string, Crumb[]> = {
  "/": [{ label: "Analytics" }, { label: "Overview" }],
  "/projects": [{ label: "Workspace" }, { label: "Projects" }],
  "/settings": [{ label: "Workspace" }, { label: "Settings" }],
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Deterministic date formatting (no locale/timezone dependence, so SSR and client match). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export const recentActivity = [
  { id: 1, text: "Maya closed APP-212 “Fix checkout redirect on Safari”", when: "2 hours ago" },
  { id: 2, text: "Tomás opened WEB-87 “Pricing page hero overlaps nav”", when: "Yesterday" },
  { id: 3, text: "Priya commented on API-45 “Rate limit headers missing”", when: "Yesterday" },
  { id: 4, text: "Weekly report for Customer app is ready", when: "Monday" },
];
```

```tsx components/nav-icon.tsx
import {
  LuChartColumn,
  LuFileText,
  LuFolderKanban,
  LuSettings,
} from "react-icons/lu";
import type { IconName } from "@/lib/data";

export function NavIcon({ name }: { name: IconName }) {
  switch (name) {
    case "overview":
      return <LuChartColumn aria-hidden="true" />;
    case "reports":
      return <LuFileText aria-hidden="true" />;
    case "projects":
      return <LuFolderKanban aria-hidden="true" />;
    case "settings":
      return <LuSettings aria-hidden="true" />;
  }
}
```

```tsx components/nav-list.tsx
"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, Heading, Icon, Span } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { NavIcon } from "@/components/nav-icon";
import { navGroups, type NavItem } from "@/lib/data";

interface NavListProps {
  /** Icon-only mode (desktop sidebar collapsed). */
  collapsed?: boolean;
  /** Prefix that keeps element ids unique when the list is rendered twice. */
  idPrefix: string;
  /** Called after a link is activated (used to close the mobile drawer). */
  onNavigate?: () => void;
}

export function NavList({ collapsed = false, idPrefix, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <Box as="nav" aria-label={idPrefix === "drawer" ? "Menu navigation" : "Main navigation"}>
      <Flex direction="column" gap={collapsed ? "4" : "6"}>
        {navGroups.map((group, gi) => {
          const headingId = `${idPrefix}-nav-group-${gi}`;
          return (
            <Box key={group.label} role="group" aria-labelledby={headingId}>
              <Heading
                id={headingId}
                as="h2"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                color="fg.muted"
                fontWeight="semibold"
                px="3"
                mb="2"
                srOnly={collapsed}
              >
                {group.label}
              </Heading>
              <Box
                as="ul"
                display="flex"
                flexDirection="column"
                gap="1"
                listStyleType="none"
                m="0"
                p="0"
              >
                {group.items.map((item) => (
                  <NavLink
                    key={item.label}
                    item={item}
                    collapsed={collapsed}
                    active={item.href === pathname}
                    onNavigate={onNavigate}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}

interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, collapsed, active, onNavigate }: NavLinkProps) {
  const itemStyles = {
    display: "flex",
    alignItems: "center",
    gap: "3",
    px: "3",
    py: "2",
    rounded: "md",
    fontSize: "sm",
    fontWeight: active ? "semibold" : "medium",
    justifyContent: collapsed ? "center" : "flex-start",
    bg: active ? "blue.subtle" : "transparent",
    color: active ? "blue.fg" : "fg",
    outline: "none",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "blue.focusRing",
    },
  } as const;

  const content = (
    <>
      <Icon fontSize="lg" flexShrink={0}>
        <NavIcon name={item.icon} />
      </Icon>
      {collapsed ? <Span srOnly>{item.label}</Span> : <Span>{item.label}</Span>}
    </>
  );

  if (!item.href) {
    // No route for this item yet: expose it as unavailable rather than a dead link.
    return (
      <li>
        <Tooltip
          content={`${item.label} (coming soon)`}
          positioning={{ placement: "right" }}
          disabled={!collapsed}
        >
          <Box
            {...itemStyles}
            role="link"
            tabIndex={0}
            aria-disabled="true"
            color="fg.muted"
            cursor="not-allowed"
          >
            {content}
            {!collapsed && (
              <Span ms="auto" fontSize="xs" color="fg.subtle">
                Soon
              </Span>
            )}
          </Box>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <Tooltip
        content={item.label}
        positioning={{ placement: "right" }}
        disabled={!collapsed}
      >
        <Box
          asChild
          {...itemStyles}
          _hover={{ bg: active ? "blue.subtle" : "bg.muted" }}
        >
          <NextLink
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {content}
          </NextLink>
        </Box>
      </Tooltip>
    </li>
  );
}
```

```tsx components/shell-chrome.tsx
"use client";

import { Fragment, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Box,
  Breadcrumb,
  Flex,
  HStack,
  IconButton,
  Span,
  Text,
} from "@chakra-ui/react";
import { LuMenu, LuPanelLeftClose, LuPanelLeftOpen, LuSparkles } from "react-icons/lu";
import { ColorModeButton } from "@/components/ui/color-mode";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "@/components/ui/drawer";
import { NavList } from "@/components/nav-list";
import { breadcrumbs, product, user } from "@/lib/data";

const EXPANDED_WIDTH = "260px";
const COLLAPSED_WIDTH = "72px";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <NextLink href="/" aria-label={`${product.name} home`}>
      <HStack gap="2" minH="8">
        <Flex
          boxSize="8"
          flexShrink={0}
          align="center"
          justify="center"
          rounded="lg"
          bg="blue.solid"
          color="blue.contrast"
        >
          <LuSparkles aria-hidden="true" />
        </Flex>
        {!compact && (
          <Span fontWeight="semibold" fontSize="lg" letterSpacing="tight">
            {product.name}
          </Span>
        )}
      </HStack>
    </NextLink>
  );
}

function UserCard({ compact = false }: { compact?: boolean }) {
  return (
    <HStack gap="3" justify={compact ? "center" : "flex-start"}>
      <Avatar.Root size="sm">
        <Avatar.Fallback name={user.name} />
      </Avatar.Root>
      {compact ? (
        <Span srOnly>
          {user.name}, {user.role}
        </Span>
      ) : (
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
  );
}

interface ShellChromeProps {
  children: React.ReactNode;
}

/**
 * Sidebar, mobile drawer and header. Rendered client-only (see AppShell) so it
 * never has to reconcile with server markup.
 */
export function ShellChrome({ children }: ShellChromeProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const crumbs = breadcrumbs[pathname] ?? [{ label: "Lumen" }];
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <Flex minH="100dvh" bg="bg.subtle">
      {/* Desktop sidebar */}
      <Flex
        as="aside"
        aria-label="Sidebar"
        hideBelow="md"
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}
        transition="width 0.2s ease"
        bg="bg"
        borderEndWidth="1px"
        borderColor="border"
      >
        <Flex
          px={collapsed ? "0" : "5"}
          h="14"
          align="center"
          justify={collapsed ? "center" : "flex-start"}
          borderBottomWidth="1px"
          borderColor="border"
        >
          <Brand compact={collapsed} />
        </Flex>

        <Box flex="1" overflowY="auto" overflowX="hidden" px="3" py="4">
          <NavList collapsed={collapsed} idPrefix="sidebar" />
        </Box>

        <Box borderTopWidth="1px" borderColor="border" p="3">
          <UserCard compact={collapsed} />
        </Box>
      </Flex>

      {/* Mobile drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerTitle>{product.name}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <NavList idPrefix="drawer" onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
          <Box borderTopWidth="1px" borderColor="border" p="4">
            <UserCard />
          </Box>
        </DrawerContent>
      </DrawerRoot>

      {/* Main column */}
      <Flex direction="column" flex="1" minW="0">
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
          borderColor="border"
        >
          <IconButton
            hideFrom="md"
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>

          <Tooltip content={toggleLabel} positioning={{ placement: "bottom" }}>
            <IconButton
              hideBelow="md"
              variant="ghost"
              size="sm"
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
            </IconButton>
          </Tooltip>

          <Breadcrumb.Root size="sm" flex="1" minW="0">
            <Breadcrumb.List flexWrap="nowrap">
              {crumbs.map((crumb, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <Fragment key={crumb.label}>
                    <Breadcrumb.Item>
                      {last ? (
                        <Breadcrumb.CurrentLink>{crumb.label}</Breadcrumb.CurrentLink>
                      ) : crumb.href ? (
                        <Breadcrumb.Link asChild>
                          <NextLink href={crumb.href}>{crumb.label}</NextLink>
                        </Breadcrumb.Link>
                      ) : (
                        <Span color="fg.muted">{crumb.label}</Span>
                      )}
                    </Breadcrumb.Item>
                    {!last && <Breadcrumb.Separator />}
                  </Fragment>
                );
              })}
            </Breadcrumb.List>
          </Breadcrumb.Root>

          <ColorModeButton />
        </Flex>

        {children}
      </Flex>
    </Flex>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import { Box, ClientOnly, Flex, SkipNavContent, SkipNavLink } from "@chakra-ui/react";
import { ShellChrome } from "@/components/shell-chrome";

/**
 * Shared layout for every screen. The interactive chrome (sidebar, drawer,
 * header) renders on the client only; until then a plain frame with the page
 * content is shown, so server HTML and the first client render are identical.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const main = (
    <Box as="main" flex="1" px={{ base: "4", md: "8" }} py={{ base: "6", md: "8" }}>
      <SkipNavContent />
      <Box maxW="6xl" mx="auto">
        {children}
      </Box>
    </Box>
  );

  return (
    <>
      <SkipNavLink>Skip to content</SkipNavLink>
      <ClientOnly
        fallback={
          <Flex minH="100dvh" bg="bg.subtle" direction="column">
            {main}
          </Flex>
        }
      >
        <ShellChrome>{main}</ShellChrome>
      </ClientOnly>
    </>
  );
}
```

```tsx components/page-heading.tsx
import { Box, Heading, Text } from "@chakra-ui/react";

export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box mb="6">
      <Heading as="h1" size="2xl" letterSpacing="tight">
        {title}
      </Heading>
      {description && (
        <Text color="fg.muted" mt="1">
          {description}
        </Text>
      )}
    </Box>
  );
}
```

```tsx components/status-badge.tsx
import { Badge } from "@chakra-ui/react";
import type { ProjectStatus } from "@/lib/data";

const palette: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge colorPalette={palette[status]} variant="subtle">
      {status}
    </Badge>
  );
}
```

```tsx components/dashboard.tsx
import NextLink from "next/link";
import { Box, Card, Heading, HStack, Link, SimpleGrid, Text } from "@chakra-ui/react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, projects, recentActivity, user } from "@/lib/data";

export function Dashboard() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const firstName = user.name.split(" ")[0];

  const summary = [
    { label: "Open issues", value: String(openIssues), help: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), help: `${projects.length - active.length} paused or archived` },
    { label: "Busiest project", value: busiest.name, help: `${busiest.issues} open issues` },
    { label: "Latest update", value: formatDate(latest.updated), help: latest.name },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${firstName}`}
        description="Here is what is happening across your workspace today."
      />

      <SimpleGrid
        as="ul"
        columns={{ base: 1, sm: 2, xl: 4 }}
        gap="4"
        mb="8"
        listStyleType="none"
        p="0"
      >
        {summary.map((item) => (
          <Card.Root key={item.label} as="li" size="sm">
            <Card.Body gap="1">
              <Text fontSize="sm" color="fg.muted">
                {item.label}
              </Text>
              <Text fontSize="2xl" fontWeight="semibold" letterSpacing="tight" lineClamp="1">
                {item.value}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {item.help}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <Card.Root>
          <Card.Header>
            <HStack justify="space-between">
              <Heading as="h2" size="md">
                Active projects
              </Heading>
              <Link asChild fontSize="sm">
                <NextLink href="/projects">View all</NextLink>
              </Link>
            </HStack>
          </Card.Header>
          <Card.Body>
            <Box
              as="ul"
              display="flex"
              flexDirection="column"
              gap="3"
              listStyleType="none"
              m="0"
              p="0"
            >
              {active.map((p) => (
                <HStack as="li" key={p.key} justify="space-between" gap="3">
                  <Box minW="0">
                    <Text fontWeight="medium" truncate>
                      {p.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {p.key} · Updated {formatDate(p.updated)}
                    </Text>
                  </Box>
                  <HStack gap="3" flexShrink={0}>
                    <Text fontSize="sm" color="fg.muted">
                      {p.issues} issues
                    </Text>
                    <StatusBadge status={p.status} />
                  </HStack>
                </HStack>
              ))}
            </Box>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading as="h2" size="md">
              Recent activity
            </Heading>
          </Card.Header>
          <Card.Body>
            <Box
              as="ul"
              display="flex"
              flexDirection="column"
              gap="4"
              listStyleType="none"
              m="0"
              p="0"
            >
              {recentActivity.map((a) => (
                <Box as="li" key={a.id}>
                  <Text fontSize="sm">{a.text}</Text>
                  <Text fontSize="xs" color="fg.muted">
                    {a.when}
                  </Text>
                </Box>
              ))}
            </Box>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
```

```tsx app/projects/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/projects/page.tsx
import { Badge, Box, Table } from "@chakra-ui/react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <Box bg="bg" rounded="lg" borderWidth="1px" borderColor="border" overflow="hidden">
        <Table.ScrollArea>
          <Table.Root size="md" interactive>
            <Table.Caption srOnly>
              Projects with their status, open issue count and last update date
            </Table.Caption>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader scope="col">Key</Table.ColumnHeader>
                <Table.ColumnHeader scope="col">Name</Table.ColumnHeader>
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
              {projects.map((p) => (
                <Table.Row key={p.key}>
                  <Table.Cell>
                    <Badge variant="outline" fontFamily="mono">
                      {p.key}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                  <Table.Cell>
                    <StatusBadge status={p.status} />
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
    </>
  );
}
```

```tsx app/settings/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/settings/page.tsx
import { SettingsForm } from "@/components/settings-form";
import { PageHeading } from "@/components/page-heading";

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />
      <SettingsForm />
    </>
  );
}
```

```tsx components/settings-form.tsx
"use client";

import { useState } from "react";
import { Box, Button, Card, Fieldset, HStack, Input } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [productNews, setProductNews] = useState(false);

  const nameInvalid = name.trim().length === 0;
  const emailInvalid = !/^\S+@\S+\.\S+$/.test(email);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nameInvalid || emailInvalid) return;
    toaster.create({
      title: "Settings saved",
      description: "Your profile and notification preferences were updated.",
      type: "success",
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Box display="flex" flexDirection="column" gap="6" maxW="2xl">
        <Card.Root>
          <Card.Header>
            <Card.Title>Profile</Card.Title>
            <Card.Description>
              Your role in this workspace is {user.role}.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <Box display="flex" flexDirection="column" gap="4">
              <Field
                label="Full name"
                required
                invalid={nameInvalid}
                errorText="Enter your name."
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field
                label="Email address"
                required
                invalid={emailInvalid}
                errorText="Enter a valid email address."
                helperText="Used for sign-in and notifications."
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
            </Box>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body>
            <Fieldset.Root>
              <Fieldset.Legend>Notifications</Fieldset.Legend>
              <Fieldset.HelperText>
                Choose which emails you receive from Lumen.
              </Fieldset.HelperText>
              <Fieldset.Content>
                <Box display="flex" flexDirection="column" gap="4" mt="2">
                  <Switch
                    checked={weeklyReport}
                    onCheckedChange={(e) => setWeeklyReport(e.checked)}
                  >
                    Weekly analytics report
                  </Switch>
                  <Switch
                    checked={issueAlerts}
                    onCheckedChange={(e) => setIssueAlerts(e.checked)}
                  >
                    Alerts when I am assigned an issue
                  </Switch>
                  <Switch
                    checked={productNews}
                    onCheckedChange={(e) => setProductNews(e.checked)}
                  >
                    Product news and release notes
                  </Switch>
                </Box>
              </Fieldset.Content>
            </Fieldset.Root>
          </Card.Body>
        </Card.Root>

        <HStack justify="flex-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setWeeklyReport(true);
              setIssueAlerts(true);
              setProductNews(false);
            }}
          >
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </HStack>
      </Box>
    </form>
  );
}
```