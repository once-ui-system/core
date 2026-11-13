Chakra components do work in server components, so that isn't the cause. The remaining suspect is the one place I pass non-serializable values across the server/client boundary. In `app/page.tsx` the server component `Dashboard` is passed as `children` to the client `AppShell`, which is fine, but `navGroups` in `lib/data.ts` is imported by a client component, which is also fine.

The most likely culprit is `NextLink` with a `style` prop inside a Chakra `Box as="li"`, or a client component using `useState` in a file without `"use client"`. I've checked the latter: `AppShell`, `NavList` and `SettingsForm` all have the directive.

The remaining hazard is the `/reports` route. The task says the app must serve `/`, `/projects` and `/settings`, and my extra route adds a nested layout that wraps the shell a second time in a different tree. I'll remove it and point "Reports" at an in-page anchor on the dashboard instead. I'll also make the active-route check robust to that and simplify the drawer.

```ts lib/data.ts
export const product = {
  name: "Lumen",
  description:
    "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
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
];

export type NavIconName = "overview" | "reports" | "projects" | "settings";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
  /** Route that marks this item as current. Defaults to href. */
  match?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: "overview", match: "/" },
      {
        label: "Reports",
        href: "/#reports",
        icon: "reports",
        match: "/#reports",
      },
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
}

export function getBreadcrumb(pathname: string): Crumb[] {
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }];
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }];
  }
  return [{ label: "Analytics" }, { label: "Overview" }];
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
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
```

```tsx components/nav-list.tsx
"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import {
  LuChartColumn,
  LuFileText,
  LuFolderKanban,
  LuSettings,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { navGroups, type NavIconName } from "@/lib/data";

const icons: Record<NavIconName, IconType> = {
  overview: LuChartColumn,
  reports: LuFileText,
  projects: LuFolderKanban,
  settings: LuSettings,
};

export function isActive(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavListProps {
  collapsed?: boolean;
  idPrefix: string;
  onNavigate?: () => void;
}

export function NavList({
  collapsed = false,
  idPrefix,
  onNavigate,
}: NavListProps) {
  const pathname = usePathname();

  return (
    <Box as="nav" aria-label={`Main ${idPrefix}`}>
      <Stack gap="5" as="ul" listStyleType="none" m="0" p="0">
        {navGroups.map((group) => {
          const headingId = `${idPrefix}-nav-group-${group.label.toLowerCase()}`;
          return (
            <Box as="li" key={group.label}>
              <Text
                id={headingId}
                textStyle="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wider"
                color="fg.muted"
                px="3"
                mb="1"
                srOnly={collapsed}
              >
                {group.label}
              </Text>
              {collapsed && (
                <Box
                  borderTopWidth="1px"
                  borderColor="border.muted"
                  mx="2"
                  mb="2"
                  aria-hidden="true"
                />
              )}
              <Stack
                as="ul"
                gap="1"
                listStyleType="none"
                m="0"
                p="0"
                aria-labelledby={headingId}
              >
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const ItemIcon = icons[item.icon];
                  return (
                    <Box as="li" key={item.href}>
                      <NextLink
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        onClick={onNavigate}
                        style={{ display: "block", textDecoration: "none" }}
                      >
                        <Flex
                          align="center"
                          gap="3"
                          px="3"
                          py="2"
                          rounded="md"
                          justify={collapsed ? "center" : "flex-start"}
                          fontWeight={active ? "semibold" : "medium"}
                          textStyle="sm"
                          colorPalette="blue"
                          bg={active ? "colorPalette.subtle" : "transparent"}
                          color={active ? "colorPalette.fg" : "fg"}
                          _hover={{
                            bg: active ? "colorPalette.subtle" : "bg.muted",
                          }}
                          transition="background 0.15s"
                        >
                          <Icon boxSize="5" flexShrink="0">
                            <ItemIcon />
                          </Icon>
                          {!collapsed && <span>{item.label}</span>}
                        </Flex>
                      </NextLink>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSparkles,
} from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import {
  BreadcrumbCurrentLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb";
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "@/components/ui/drawer";
import { NavList } from "@/components/nav-list";
import { getBreadcrumb, product, user } from "@/lib/data";

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <NextLink
      href="/"
      aria-label={collapsed ? `${product.name} home` : undefined}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <HStack gap="2" justify={collapsed ? "center" : "flex-start"}>
        <Flex
          boxSize="8"
          rounded="md"
          bg="blue.solid"
          color="blue.contrast"
          align="center"
          justify="center"
          flexShrink="0"
        >
          <LuSparkles aria-hidden="true" />
        </Flex>
        {!collapsed && (
          <Text fontWeight="bold" textStyle="lg">
            {product.name}
          </Text>
        )}
      </HStack>
    </NextLink>
  );
}

function UserBlock({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <HStack gap="3" justify={collapsed ? "center" : "flex-start"} minW="0">
      <Avatar name={user.name} size="sm" />
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
    </HStack>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open only while the route it was opened on is current,
  // so navigating closes it without needing an effect.
  const [drawerOpenAt, setDrawerOpenAt] = useState<string | null>(null);
  const drawerOpen = drawerOpenAt === pathname;

  const crumbs = getBreadcrumb(pathname);

  return (
    <Flex minH="100dvh" bg="bg">
      <Box
        as="aside"
        aria-label="Sidebar"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink="0"
        w={collapsed ? "16" : "64"}
        borderEndWidth="1px"
        bg="bg.subtle"
        transition="width 0.2s"
      >
        <Box px="3" py="4" h="14" display="flex" alignItems="center">
          <Box flex="1" minW="0">
            <Brand collapsed={collapsed} />
          </Box>
        </Box>
        <Box flex="1" overflowY="auto" px="2" py="3">
          <NavList collapsed={collapsed} idPrefix="sidebar" />
        </Box>
        <Box borderTopWidth="1px" p="3">
          <UserBlock collapsed={collapsed} />
        </Box>
      </Box>

      <Flex direction="column" flex="1" minW="0">
        <Box
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="14"
          borderBottomWidth="1px"
          bg="bg"
          px={{ base: "3", md: "6" }}
          display="flex"
          alignItems="center"
          gap="3"
        >
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            onClick={() => setDrawerOpenAt(pathname)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            display={{ base: "none", md: "inline-flex" }}
            variant="ghost"
            size="sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
          </IconButton>

          <BreadcrumbRoot size="sm" flex="1" minW="0">
            {crumbs.map((crumb, i) =>
              i === crumbs.length - 1 ? (
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

          <ColorModeButton />
          <Box display={{ base: "none", sm: "block" }}>
            <Avatar name={user.name} size="xs" />
          </Box>
        </Box>

        <Box
          as="main"
          id="main"
          flex="1"
          px={{ base: "4", md: "8" }}
          py={{ base: "5", md: "8" }}
        >
          <Box maxW="6xl" mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>

      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpenAt(e.open ? pathname : null)}
        placement="start"
        size="xs"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              <Brand />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <NavList
              idPrefix="drawer"
              onNavigate={() => setDrawerOpenAt(null)}
            />
          </DrawerBody>
          <Box borderTopWidth="1px" p="4">
            <UserBlock />
          </Box>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = { title: "Overview · Lumen" };

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
```

```tsx components/dashboard.tsx
import {
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { projects, user } from "@/lib/data";

export function Dashboard() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const firstName = user.name.split(" ")[0];

  const cards = [
    {
      label: "Open issues",
      value: String(openIssues),
      note: `Across ${projects.length} projects`,
    },
    {
      label: "Active projects",
      value: String(active.length),
      note: active.map((p) => p.key).join(", "),
    },
    {
      label: "Busiest project",
      value: busiest.name,
      note: `${busiest.issues} open issues`,
    },
    {
      label: "Weekly active users",
      value: "1,284",
      note: "+6.2% from last week",
    },
  ];

  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  return (
    <Stack gap="8">
      <Box>
        <Heading as="h1" size="2xl">
          Welcome back, {firstName}
        </Heading>
        <Text color="fg.muted" mt="1">
          Here is what is happening across your workspace today.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4">
        {cards.map((card) => (
          <Card.Root key={card.label} variant="outline">
            <Card.Body gap="1">
              <Text textStyle="sm" color="fg.muted">
                {card.label}
              </Text>
              <Text textStyle="2xl" fontWeight="semibold" lineClamp={1}>
                {card.value}
              </Text>
              <Text textStyle="xs" color="fg.muted">
                {card.note}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root variant="outline" id="reports" scrollMarginTop="20">
        <Card.Header>
          <Card.Title>Recently updated</Card.Title>
          <Card.Description>
            The three projects with the latest activity.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Stack as="ul" listStyleType="none" m="0" p="0" gap="3">
            {recent.map((p) => (
              <HStack as="li" key={p.key} justify="space-between" gap="3">
                <HStack gap="3" minW="0">
                  <Badge variant="surface">{p.key}</Badge>
                  <Text truncate>{p.name}</Text>
                </HStack>
                <Text textStyle="sm" color="fg.muted" flexShrink="0">
                  {p.issues} open
                </Text>
              </HStack>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
```

```tsx app/projects/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { Badge, Box, Heading, Stack, Table, Text } from "@chakra-ui/react";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

const statusColor: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
};

export default function ProjectsPage() {
  return (
    <Stack gap="6">
      <Box>
        <Heading as="h1" size="2xl">
          Projects
        </Heading>
        <Text color="fg.muted" mt="1">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Box>

      <Table.ScrollArea borderWidth="1px" rounded="md">
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
                  <Badge variant="surface">{p.key}</Badge>
                </Table.Cell>
                <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusColor[p.status]}>{p.status}</Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{p.issues}</Table.Cell>
                <Table.Cell textAlign="end">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Stack>
  );
}
```

```tsx app/settings/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return <SettingsForm />;
}
```

```tsx components/settings-form.tsx
"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [productNews, setProductNews] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Stack gap="6" maxW="2xl">
      <Box>
        <Heading as="h1" size="2xl">
          Settings
        </Heading>
        <Text color="fg.muted" mt="1">
          Manage your profile and notification preferences.
        </Text>
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <Stack gap="6">
          <Card.Root variant="outline">
            <Card.Header>
              <Card.Title>Profile</Card.Title>
              <Card.Description>
                This information is visible to your teammates.
              </Card.Description>
            </Card.Header>
            <Card.Body gap="4">
              <HStack gap="3">
                <Avatar name={user.name} size="lg" />
                <Box>
                  <Text fontWeight="medium">{name}</Text>
                  <Badge colorPalette="blue">{user.role}</Badge>
                </Box>
              </HStack>
              <Field label="Full name">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSaved(false);
                  }}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email address">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSaved(false);
                  }}
                  autoComplete="email"
                />
              </Field>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="outline">
            <Card.Header>
              <Card.Title>Notifications</Card.Title>
              <Card.Description>
                Choose what Lumen sends to {email}.
              </Card.Description>
            </Card.Header>
            <Card.Body gap="4">
              <Switch
                checked={weeklyDigest}
                onCheckedChange={(e) => {
                  setWeeklyDigest(e.checked);
                  setSaved(false);
                }}
              >
                Weekly analytics digest
              </Switch>
              <Switch
                checked={issueAlerts}
                onCheckedChange={(e) => {
                  setIssueAlerts(e.checked);
                  setSaved(false);
                }}
              >
                Alerts when an issue is assigned to me
              </Switch>
              <Switch
                checked={productNews}
                onCheckedChange={(e) => {
                  setProductNews(e.checked);
                  setSaved(false);
                }}
              >
                Product news and release notes
              </Switch>
            </Card.Body>
          </Card.Root>

          <HStack gap="4">
            <Button type="submit">Save changes</Button>
            <Text
              role="status"
              aria-live="polite"
              textStyle="sm"
              color="fg.success"
            >
              {saved ? "Settings saved." : ""}
            </Text>
          </HStack>
        </Stack>
      </form>
    </Stack>
  );
}
```