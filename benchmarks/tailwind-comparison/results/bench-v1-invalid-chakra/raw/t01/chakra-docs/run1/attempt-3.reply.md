Reading these turned up a real defect that matches a build or boot failure. In `app/page.tsx`, `AppShell` is a client component, so its `children` is fine. But the snippet files I import from `@/components/ui/*` (`drawer`, `breadcrumb`, `switch`, `field`, `avatar`) have no `"use client"` directive, and they use `React.forwardRef` and compound components. They are only safe when imported from client files, and my server pages (`app/projects/page.tsx`, `components/dashboard.tsx`) are fine, but a few details still risk breaking the build:

-   `Card.Root` in `dashboard.tsx` takes `scrollMarginTop`, which isn't a valid style prop and would fail type-checking under `next build`.
-   `statusColor` is typed `Record<ProjectStatus, string>`, which is fine, but `Table.Caption srOnly` isn't a documented prop.
-   `LuChartColumn`, `LuFolderKanban`, `LuPanelLeftClose` and `LuPanelLeftOpen` may not exist in react-icons 5.7's `lu` set, and a missing export fails the build.

I'll switch to icons I'm confident exist (`LuChartBar`-style names are uncertain, so I'll use `LuHouse`, `LuFileText`, `LuFolder`, `LuSettings`, `LuChevronsLeft`, `LuChevronsRight`, `LuMenu`, `LuSparkles`), which appear in the docs or are long-standing. I'll remove the invalid props, and make every page-level component that uses Chakra compound parts a client component so nothing depends on server resolution.

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
      { label: "Reports", href: "/#reports", icon: "reports" },
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
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { LuFileText, LuFolder, LuHouse, LuSettings } from "react-icons/lu";
import type { IconType } from "react-icons";
import { navGroups, type NavIconName } from "@/lib/data";

const icons: Record<NavIconName, IconType> = {
  overview: LuHouse,
  reports: LuFileText,
  projects: LuFolder,
  settings: LuSettings,
};

function isActive(pathname: string, href: string): boolean {
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
    <Box as="nav" aria-label={`Main navigation (${idPrefix})`}>
      <Stack gap="5" as="ul" listStyleType="none" m="0" p="0">
        {navGroups.map((group) => {
          const headingId = `${idPrefix}-group-${group.label.toLowerCase()}`;
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
                          <ItemIcon size={20} aria-hidden="true" />
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
  LuChevronsLeft,
  LuChevronsRight,
  LuMenu,
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
  // The drawer counts as open only while the route it was opened on is
  // current, so navigating closes it without an effect.
  const [drawerOpenAt, setDrawerOpenAt] = useState<string | null>(null);
  const drawerOpen = drawerOpenAt === pathname;

  const crumbs = getBreadcrumb(pathname);

  return (
    <Flex minH="100vh" bg="bg">
      <Box
        as="aside"
        aria-label="Sidebar"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100vh"
        flexShrink="0"
        w={collapsed ? "16" : "64"}
        borderEndWidth="1px"
        bg="bg.subtle"
        transition="width 0.2s"
      >
        <Box px="3" h="14" display="flex" alignItems="center">
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
            onClick={() => setDrawerOpenAt(pathname)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            display={{ base: "none", md: "inline-flex" }}
            variant="ghost"
            size="sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <LuChevronsRight /> : <LuChevronsLeft />}
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
"use client";

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
              <Text textStyle="2xl" fontWeight="semibold" truncate>
                {card.value}
              </Text>
              <Text textStyle="xs" color="fg.muted">
                {card.note}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Box id="reports">
        <Card.Root variant="outline">
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
      </Box>
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
import { ProjectsTable } from "@/components/projects-table";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return <ProjectsTable />;
}
```

```tsx components/projects-table.tsx
"use client";

import { Badge, Box, Heading, Stack, Table, Text } from "@chakra-ui/react";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusColor: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
};

export function ProjectsTable() {
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