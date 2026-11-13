```ts app/theme.ts
import {
  ActionIcon,
  AppShell,
  Button,
  Card,
  NavLink,
  PasswordInput,
  Select,
  TextInput,
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

// Lumen brand: #DB2777 sits on shade 6 of the "brand" palette.
const brand: MantineColorsTuple = [
  "#fdf2f8",
  "#fce7f3",
  "#fbcfe8",
  "#f9a8d4",
  "#f472b6",
  "#ec4899",
  "#db2777",
  "#be185d",
  "#9d174d",
  "#831843",
];

// Warm sand neutrals. Also replaces the default gray so every neutral is warm.
const sand: MantineColorsTuple = [
  "#f8f3ea",
  "#f1e9dc",
  "#e7dccb",
  "#dbcdb7",
  "#d2c2a8",
  "#b5a285",
  "#8f7d62",
  "#6f6049",
  "#54483a",
  "#3a3128",
];

const headingFont = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const bodyFont = "ui-sans-serif, system-ui, sans-serif";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 6 },
  colors: { brand, sand, gray: sand },
  black: "#2b2118",
  white: "#ffffff",
  fontFamily: bodyFont,
  headings: {
    fontFamily: headingFont,
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2rem", lineHeight: "1.2" },
      h2: { fontSize: "1.5rem", lineHeight: "1.3" },
      h3: { fontSize: "1.25rem", lineHeight: "1.35" },
    },
  },
  defaultRadius: "md",
  radius: {
    xs: "0.375rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.75rem",
  },
  spacing: {
    xs: "0.625rem",
    sm: "0.875rem",
    md: "1.25rem",
    lg: "1.75rem",
    xl: "2.5rem",
  },
  components: {
    Button: {
      defaultProps: { size: "lg" },
      styles: { root: { fontWeight: 600 } },
    },
    ActionIcon: { defaultProps: { size: "xl" } },
    TextInput: { defaultProps: { size: "lg" } },
    PasswordInput: { defaultProps: { size: "lg" } },
    Select: { defaultProps: { size: "lg" } },
    Card: {
      defaultProps: { padding: "lg", withBorder: true, shadow: "xs" },
    },
    NavLink: {
      styles: {
        root: {
          minHeight: "3rem",
          borderRadius: "var(--mantine-radius-md)",
        },
        label: { fontSize: "var(--mantine-font-size-md)" },
      },
    },
    AppShell: {
      styles: {
        main: {
          backgroundColor:
            "light-dark(var(--mantine-color-sand-0), var(--mantine-color-dark-8))",
        },
      },
    },
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": "#fffdfa",
    "--mantine-color-dimmed": "#6f6049",
  },
  dark: {},
});
```

```tsx app/layout.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { AppFrame } from "@/components/AppFrame";
import { cssVariablesResolver, theme } from "./theme";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
  description: "Lumen: product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider
          theme={theme}
          defaultColorScheme="light"
          cssVariablesResolver={cssVariablesResolver}
        >
          <ModalsProvider>
            <Notifications />
            <AppFrame>{children}</AppFrame>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user = {
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

export const statusColor: Record<ProjectStatus, string> = {
  Active: "teal",
  Paused: "orange",
  Archived: "gray",
};

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
```

```tsx lib/nav.ts
import {
  IconBriefcase,
  IconChartBar,
  IconFileAnalytics,
  IconFolders,
  IconLayoutDashboard,
  IconSettings,
} from "@tabler/icons-react";

export type NavIcon = typeof IconSettings;

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
}

export interface NavGroup {
  label: string;
  icon: NavIcon;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    icon: IconChartBar,
    items: [
      { label: "Overview", href: "/", icon: IconLayoutDashboard },
      { label: "Reports", href: "/reports", icon: IconFileAnalytics },
    ],
  },
  {
    label: "Workspace",
    icon: IconBriefcase,
    items: [
      { label: "Projects", href: "/projects", icon: IconFolders },
      { label: "Settings", href: "/settings", icon: IconSettings },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function trailFor(pathname: string): { group: string; page: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group: group.label, page: item.label };
    }
  }
  return null;
}
```

```tsx components/NavItems.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Box, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { isActive, navGroups } from "@/lib/nav";

interface NavItemsProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavItems({ collapsed = false, onNavigate }: NavItemsProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <Box component="nav" aria-label="Main navigation">
        <Stack gap="xs" align="center">
          {navGroups.map((group, index) => (
            <Stack key={group.label} gap="xs" align="center" role="group" aria-label={group.label}>
              {index > 0 && <Divider w={32} />}
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Tooltip
                    key={item.href}
                    label={`${group.label}: ${item.label}`}
                    position="right"
                    withArrow
                  >
                    <ActionIcon
                      component={Link}
                      href={item.href}
                      size={48}
                      variant={active ? "light" : "subtle"}
                      color={active ? "brand" : "sand.8"}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon size={22} stroke={1.75} aria-hidden />
                    </ActionIcon>
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box component="nav" aria-label="Main navigation">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={20} stroke={1.75} aria-hidden />}
          defaultOpened
          childrenOffset={28}
          fw={700}
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.75} aria-hidden />}
                active={active}
                variant="light"
                color="brand"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                fw={active ? 700 : 500}
              />
            );
          })}
        </NavLink>
      ))}
    </Box>
  );
}
```

```tsx components/AppFrame.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Button,
  Drawer,
  Group,
  Menu,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronRight,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";
import { initials, user } from "@/lib/data";
import { trailFor } from "@/lib/nav";
import { NavItems } from "./NavItems";

function Brand() {
  return (
    <Anchor component={Link} href="/" aria-label="Lumen home" underline="never" c="inherit">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon size={44} radius="md" variant="gradient" gradient={{ from: "brand.5", to: "brand.7", deg: 135 }}>
          <IconSparkles size={24} stroke={1.75} aria-hidden />
        </ThemeIcon>
        <Text ff="heading" fw={800} fz={24} lh={1}>
          Lumen
        </Text>
      </Group>
    </Anchor>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const trail = trailFor(pathname);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <>
      <AppShell
        header={{ height: 76 }}
        navbar={{ width: collapsed ? 104 : 296, breakpoint: "sm", collapsed: { mobile: true } }}
        padding={{ base: "md", sm: "xl" }}
      >
        <AppShell.Header>
          <Group h="100%" px={{ base: "md", sm: "xl" }} justify="space-between" wrap="nowrap">
            <Group gap="md" wrap="nowrap" miw={0}>
              <Burger
                opened={drawerOpened}
                onClick={drawerOpened ? closeDrawer : openDrawer}
                hiddenFrom="sm"
                size="md"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpened}
              />
              <Box visibleFrom="sm">
                <Brand />
              </Box>
              {trail && (
                <Box component="nav" aria-label="Breadcrumb" miw={0} ml={{ sm: "xl" }}>
                  <Breadcrumbs
                    separator={<IconChevronRight size={14} aria-hidden />}
                    separatorMargin="xs"
                  >
                    <Text size="sm" c="dimmed">
                      {trail.group}
                    </Text>
                    <Text size="sm" fw={700} aria-current="page">
                      {trail.page}
                    </Text>
                  </Breadcrumbs>
                </Box>
              )}
            </Group>

            <Menu position="bottom-end" width={260} withArrow>
              <Menu.Target>
                <UnstyledButton aria-label={`Account menu for ${user.name}`} p={4}>
                  <Avatar color="brand" radius="xl" size={44}>
                    {initials(user.name)}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  {user.name} ({user.role})
                </Menu.Label>
                <Menu.Label>{user.email}</Menu.Label>
                <Menu.Item
                  component={Link}
                  href="/settings"
                  leftSection={<IconSettings size={18} aria-hidden />}
                  py="sm"
                >
                  Settings
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <AppShell.Section grow>
            <NavItems collapsed={collapsed} />
          </AppShell.Section>
          <AppShell.Section>
            {collapsed ? (
              <Group justify="center">
                <Tooltip label="Expand sidebar" position="right" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="sand.8"
                    size={48}
                    onClick={toggleCollapsed}
                    aria-label="Expand sidebar"
                    aria-expanded={false}
                  >
                    <IconLayoutSidebarLeftExpand size={22} stroke={1.75} aria-hidden />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ) : (
              <Button
                variant="subtle"
                color="sand.8"
                size="md"
                fullWidth
                justify="flex-start"
                leftSection={<IconLayoutSidebarLeftCollapse size={20} stroke={1.75} aria-hidden />}
                onClick={toggleCollapsed}
                aria-expanded
              >
                Collapse sidebar
              </Button>
            )}
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main id="main-content">
          <Box maw={1200} mx="auto">
            {children}
          </Box>
        </AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="xs"
        padding="md"
        title={<Brand />}
        closeButtonProps={{ "aria-label": "Close navigation menu", size: "xl" }}
      >
        <NavItems onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
```

```tsx components/PageHeader.tsx
import { Box, Text, Title } from "@mantine/core";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <Box
      mb="xl"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--mantine-spacing-md)",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <Box maw={640}>
        <Title order={1}>{title}</Title>
        <Text c="dimmed" mt="xs" size="lg">
          {description}
        </Text>
      </Box>
      {actions}
    </Box>
  );
}
```

```tsx components/DashboardView.tsx
"use client";

import Link from "next/link";
import { Badge, Button, Card, Group, Progress, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBug, IconFolders, IconPlayerPause, IconSparkles } from "@tabler/icons-react";
import { formatDate, projects, statusColor, user } from "@/lib/data";
import { PageHeader } from "./PageHeader";

export function DashboardView() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const maxIssues = Math.max(...projects.map((p) => p.issues), 1);
  const firstName = user.name.split(" ")[0];

  const cards = [
    { label: "Open issues", value: String(totalIssues), hint: `Across ${projects.length} projects`, icon: IconBug },
    { label: "Active projects", value: String(active), hint: "Shipping this month", icon: IconFolders },
    { label: "Paused", value: String(paused), hint: "Waiting for a restart", icon: IconPlayerPause },
    { label: "Latest update", value: latest.key, hint: `${latest.name}, ${formatDate(latest.updated)}`, icon: IconSparkles },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        description="Here is how your team is doing across every project today."
        actions={
          <Button component={Link} href="/projects">
            View projects
          </Button>
        }
      />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg" mb="xl">
        {cards.map((card) => (
          <Card key={card.label} component="section" aria-label={card.label}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Text fw={600} c="dimmed">
                {card.label}
              </Text>
              <ThemeIcon variant="light" size={44} radius="md">
                <card.icon size={22} stroke={1.75} aria-hidden />
              </ThemeIcon>
            </Group>
            <Text ff="heading" fw={800} fz={40} lh={1.1} mt="md">
              {card.value}
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              {card.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card component="section" aria-labelledby="busiest-heading">
        <Text id="busiest-heading" ff="heading" fw={700} fz="xl" mb="lg">
          Where the work is
        </Text>
        <Stack gap="lg">
          {projects.map((p) => (
            <div key={p.key}>
              <Group justify="space-between" mb={6} wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Text fw={600}>{p.name}</Text>
                  <Badge variant="light" color={statusColor[p.status]}>
                    {p.status}
                  </Badge>
                </Group>
                <Text fw={600}>{p.issues} open</Text>
              </Group>
              <Progress value={(p.issues / maxIssues) * 100} size="md" aria-label={`${p.name}: ${p.issues} open issues`} />
            </div>
          ))}
        </Stack>
      </Card>
    </>
  );
}
```

```tsx components/ReportsView.tsx
"use client";

import { Card, Group, Progress, SimpleGrid, Stack, Text } from "@mantine/core";
import { projects, statusColor } from "@/lib/data";
import { PageHeader } from "./PageHeader";

export function ReportsView() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  const statuses = (["Active", "Paused", "Archived"] as const).map((status) => ({
    status,
    count: projects.filter((p) => p.status === status).length,
    issues: projects.filter((p) => p.status === status).reduce((s, p) => s + p.issues, 0),
  }));

  return (
    <>
      <PageHeader
        title="Reports"
        description="A simple look at where issues are piling up and which projects carry them."
      />
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card component="section" aria-labelledby="by-project">
          <Text id="by-project" ff="heading" fw={700} fz="xl" mb="lg">
            Issues by project
          </Text>
          <Stack gap="lg">
            {projects.map((p) => (
              <div key={p.key}>
                <Group justify="space-between" mb={6}>
                  <Text fw={600}>{p.name}</Text>
                  <Text fw={600}>{p.issues}</Text>
                </Group>
                <Progress
                  value={total ? (p.issues / total) * 100 : 0}
                  size="md"
                  aria-label={`${p.name}: ${p.issues} of ${total} open issues`}
                />
              </div>
            ))}
          </Stack>
        </Card>
        <Card component="section" aria-labelledby="by-status">
          <Text id="by-status" ff="heading" fw={700} fz="xl" mb="lg">
            Issues by status
          </Text>
          <Stack gap="lg">
            {statuses.map((s) => (
              <div key={s.status}>
                <Group justify="space-between" mb={6}>
                  <Text fw={600}>
                    {s.status} ({s.count} {s.count === 1 ? "project" : "projects"})
                  </Text>
                  <Text fw={600}>{s.issues} issues</Text>
                </Group>
                <Progress
                  value={total ? (s.issues / total) * 100 : 0}
                  color={statusColor[s.status]}
                  size="md"
                  aria-label={`${s.status}: ${s.issues} of ${total} open issues`}
                />
              </div>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  );
}
```

```tsx components/ProjectsView.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Modal,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { formatDate, projects as seed, statusColor, type Project, type ProjectStatus } from "@/lib/data";
import { PageHeader } from "./PageHeader";

const filters = ["All", "Active", "Paused", "Archived"];

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="light" color={statusColor[status]} size="lg">
      {status}
    </Badge>
  );
}

export function ProjectsView() {
  const [items, setItems] = useState<Project[]>(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: { name: "", key: "", status: "Active" as string },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Give the project a name" : null),
      key: (v) =>
        !/^[A-Za-z]{2,5}$/.test(v)
          ? "Use 2 to 5 letters"
          : items.some((p) => p.key === v.toUpperCase())
            ? "That key is taken"
            : null,
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((p) => status === "All" || p.status === status)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q))
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }, [items, query, status]);

  const addProject = form.onSubmit((values) => {
    const project: Project = {
      key: values.key.toUpperCase(),
      name: values.name.trim(),
      status: values.status as ProjectStatus,
      issues: 0,
      updated: new Date().toISOString().slice(0, 10),
    };
    setItems((prev) => [project, ...prev]);
    notifications.show({ title: "Project created", message: `${project.name} is ready for its first issue.`, color: "teal" });
    form.reset();
    close();
  });

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project your team tracks in Lumen, newest activity first."
        actions={
          <Button leftSection={<IconPlus size={20} aria-hidden />} onClick={open}>
            New project
          </Button>
        }
      />

      <Stack gap="lg">
        <Group gap="md" align="flex-end">
          <TextInput
            label="Search projects"
            placeholder="Name or key"
            leftSection={<IconSearch size={18} aria-hidden />}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            style={{ flex: "1 1 260px" }}
          />
          <div style={{ flex: "1 1 320px" }}>
            <Text component="label" size="sm" fw={500} id="status-filter-label" display="block" mb={6}>
              Status
            </Text>
            <SegmentedControl
              fullWidth
              size="md"
              data={filters}
              value={status}
              onChange={setStatus}
              aria-labelledby="status-filter-label"
            />
          </div>
        </Group>

        <Text size="sm" c="dimmed" role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"} shown
        </Text>

        {filtered.length === 0 ? (
          <Card ta="center" py="xl">
            <Text ff="heading" fw={700} fz="xl">
              Nothing matches yet
            </Text>
            <Text c="dimmed" mt="xs">
              Try a different search or switch the status filter back to All.
            </Text>
          </Card>
        ) : (
          <>
            <Card p={0} visibleFrom="sm" style={{ overflow: "hidden" }}>
              <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th scope="col">Key</Table.Th>
                    <Table.Th scope="col">Project</Table.Th>
                    <Table.Th scope="col">Status</Table.Th>
                    <Table.Th scope="col" ta="right">
                      Open issues
                    </Table.Th>
                    <Table.Th scope="col">Updated</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((p) => (
                    <Table.Tr key={p.key}>
                      <Table.Td fw={700}>{p.key}</Table.Td>
                      <Table.Td>{p.name}</Table.Td>
                      <Table.Td>
                        <StatusBadge status={p.status} />
                      </Table.Td>
                      <Table.Td ta="right">{p.issues}</Table.Td>
                      <Table.Td>{formatDate(p.updated)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>

            <Box component="ul" hiddenFrom="sm" p={0} m={0} style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--mantine-spacing-md)" }}>
              {filtered.map((p) => (
                <li key={p.key}>
                  <Card>
                    <Group justify="space-between" wrap="nowrap" align="flex-start">
                      <div>
                        <Text fw={700} fz="lg">
                          {p.name}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {p.key}
                        </Text>
                      </div>
                      <StatusBadge status={p.status} />
                    </Group>
                    <Group justify="space-between" mt="md">
                      <Text size="sm">{p.issues} open issues</Text>
                      <Text size="sm" c="dimmed">
                        Updated {formatDate(p.updated)}
                      </Text>
                    </Group>
                  </Card>
                </li>
              ))}
            </Box>
          </>
        )}
      </Stack>

      <Modal opened={opened} onClose={close} title="New project" size="md" centered>
        <form onSubmit={addProject} noValidate>
          <Stack gap="md">
            <TextInput label="Name" placeholder="Billing portal" required {...form.getInputProps("name")} />
            <TextInput label="Key" description="2 to 5 letters, shown on every issue" placeholder="BILL" required {...form.getInputProps("key")} />
            <Select
              label="Status"
              data={["Active", "Paused", "Archived"]}
              allowDeselect={false}
              {...form.getInputProps("status")}
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Create project</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
```

```tsx components/SettingsView.tsx
"use client";

import {
  Button,
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";
import { PageHeader } from "./PageHeader";

export function SettingsView() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      weekly: true,
      mentions: true,
      releases: false,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Enter your name" : null),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email address"),
    },
  });

  const save = form.onSubmit((values) => {
    form.resetDirty(values);
    notifications.show({ title: "Settings saved", message: "Your changes are live.", color: "teal" });
  });

  return (
    <form onSubmit={save} noValidate>
      <PageHeader title="Settings" description="Tune your profile, notifications and how Lumen looks for you." />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="lg">
        <Card component="section" aria-labelledby="profile-heading">
          <Text id="profile-heading" ff="heading" fw={700} fz="xl" mb="lg">
            Profile
          </Text>
          <Stack gap="md">
            <TextInput label="Full name" autoComplete="name" {...form.getInputProps("name")} />
            <TextInput label="Email" type="email" autoComplete="email" {...form.getInputProps("email")} />
            <TextInput label="Role" value={user.role} readOnly description="Only another owner can change this." />
          </Stack>
        </Card>

        <Stack gap="lg">
          <Card component="section" aria-labelledby="notify-heading">
            <Text id="notify-heading" ff="heading" fw={700} fz="xl" mb="lg">
              Notifications
            </Text>
            <Stack gap="lg">
              <Switch
                size="md"
                label="Weekly summary"
                description="A Monday email with what moved across your projects."
                {...form.getInputProps("weekly", { type: "checkbox" })}
              />
              <Switch
                size="md"
                label="Mentions"
                description="Tell me when a teammate mentions me on an issue."
                {...form.getInputProps("mentions", { type: "checkbox" })}
              />
              <Switch
                size="md"
                label="Product news"
                description="Occasional notes about new Lumen features."
                {...form.getInputProps("releases", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Card component="section" aria-labelledby="appearance-heading">
            <Text id="appearance-heading" ff="heading" fw={700} fz="xl" mb="lg">
              Appearance
            </Text>
            <SegmentedControl
              fullWidth
              size="md"
              aria-label="Color scheme"
              value={colorScheme}
              onChange={(v) => setColorScheme(v as "light" | "dark" | "auto")}
              data={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Match system" },
              ]}
            />
          </Card>
        </Stack>
      </SimpleGrid>

      <Group justify="flex-end">
        <Button variant="default" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit">Save changes</Button>
      </Group>
    </form>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { DashboardView } from "@/components/DashboardView";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardView />;
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { ProjectsView } from "@/components/ProjectsView";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsView />;
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { SettingsView } from "@/components/SettingsView";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsView />;
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { ReportsView } from "@/components/ReportsView";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsView />;
}
```
