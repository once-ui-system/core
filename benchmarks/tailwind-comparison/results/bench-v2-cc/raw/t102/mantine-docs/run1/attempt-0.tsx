```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const product = {
  name: "Lumen",
  description: "A product-analytics and issue-tracking app for small software teams",
};

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

export const firstName = user.name.split(" ")[0];

export const userInitials = user.name
  .split(" ")
  .map((part) => part[0])
  .join("");

/** Fixed locale and time zone so server and client render the same text. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/nav.ts
import {
  IconBriefcase,
  IconChartBar,
  IconFileAnalytics,
  IconFolders,
  IconLayoutDashboard,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";

export interface NavItem {
  label: string;
  href: string;
  icon: Icon;
}

export interface NavGroup {
  label: string;
  icon: Icon;
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

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNav(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group, item };
    }
  }
  return null;
}
```

```ts app/theme.ts
"use client";

import {
  Badge,
  Button,
  Card,
  createTheme,
  Menu,
  NavLink,
  Select,
  Switch,
  Table,
  TextInput,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

// Brand pink: shade 6 is exactly #DB2777.
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

// Warm sand neutrals. Replaces the default gray so borders, dimmed text and
// surfaces all turn warm without touching individual components.
const sand: MantineColorsTuple = [
  "#faf7f2",
  "#f3eee4",
  "#e9e1d1",
  "#ddd1ba",
  "#cdbd9f",
  "#bba88a",
  "#a3906f",
  "#85734f",
  "#665740",
  "#3f352a",
];

const warmDark: MantineColorsTuple = [
  "#e6dfd2",
  "#c9bfae",
  "#ab9f8b",
  "#8d8272",
  "#6b6254",
  "#52493d",
  "#41392f",
  "#322c24",
  "#26211b",
  "#1b1712",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, sand, gray: sand, dark: warmDark },
  black: "#2b2219",
  white: "#ffffff",
  focusRing: "auto",
  cursorType: "pointer",

  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  headings: {
    fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2.25rem", lineHeight: "1.15" },
      h2: { fontSize: "1.5rem", lineHeight: "1.25" },
      h3: { fontSize: "1.25rem", lineHeight: "1.3" },
    },
  },

  // 16px corners everywhere.
  defaultRadius: "md",
  radius: { xs: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1.25rem", xl: "1.75rem" },

  // Airy density.
  spacing: { xs: "0.625rem", sm: "0.875rem", md: "1.25rem", lg: "1.75rem", xl: "2.5rem" },

  components: {
    Button: Button.extend({
      defaultProps: { size: "lg", fw: 600 },
    }),
    TextInput: TextInput.extend({
      defaultProps: { size: "lg" },
    }),
    Select: Select.extend({
      defaultProps: { size: "lg", allowDeselect: false },
    }),
    Switch: Switch.extend({
      defaultProps: { size: "lg" },
    }),
    Card: Card.extend({
      defaultProps: { padding: "lg", withBorder: true, radius: "md" },
    }),
    Badge: Badge.extend({
      defaultProps: { size: "lg", fw: 700 },
    }),
    Menu: Menu.extend({
      defaultProps: { shadow: "md", radius: "md" },
    }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: "md", horizontalSpacing: "lg" },
    }),
    NavLink: NavLink.extend({
      styles: {
        root: { minHeight: "3rem", borderRadius: "var(--mantine-radius-md)" },
        label: { fontSize: "var(--mantine-font-size-md)" },
      },
    }),
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    // Sand page background; cards and inputs stay white on top of it.
    "--mantine-color-body": "#fbf8f2",
    "--mantine-color-dimmed": "#665740",
    // Links: brand shade 7 keeps small link text above 4.5:1 on sand.
    "--mantine-color-anchor": "#be185d",
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
import { AppShellFrame } from "@/components/app-shell-frame";
import { cssVariablesResolver, theme } from "./theme";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
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
            <Notifications position="top-right" />
            <AppShellFrame>{children}</AppShellFrame>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```tsx components/app-shell-frame.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconFolders,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";
import { user, userInitials } from "@/lib/data";
import { findNav, isActive, navGroups } from "@/lib/nav";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <UnstyledButton component={Link} href="/" aria-label="Lumen home">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          size={44}
          radius="md"
          variant="gradient"
          gradient={{ from: "brand.5", to: "brand.7", deg: 135 }}
        >
          <IconSparkles size={24} aria-hidden />
        </ThemeIcon>
        {!compact && (
          <Text component="span" ff="heading" fw={800} fz={26}>
            Lumen
          </Text>
        )}
      </Group>
    </UnstyledButton>
  );
}

function NavTree({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  if (collapsed) {
    return (
      <Stack align="center" gap="xs">
        {navGroups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <Divider w="60%" />}
            {group.items.map((item) => {
              const active = isActive(item.href, pathname);
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
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "sand.9"}
                    aria-label={`${group.label}: ${item.label}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <item.icon size={22} aria-hidden />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Fragment>
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={22} aria-hidden />}
          childrenOffset={28}
          defaultOpened
          fw={700}
        >
          {group.items.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} aria-hidden />}
                variant="filled"
                active={active}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                fw={600}
              />
            );
          })}
        </NavLink>
      ))}
    </Stack>
  );
}

function Crumbs({ pathname }: { pathname: string }) {
  const current = findNav(pathname);
  if (!current) {
    return (
      <Text fz="sm" fw={600}>
        Lumen
      </Text>
    );
  }
  return (
    <Box component="nav" aria-label="Breadcrumb" miw={0}>
      <Breadcrumbs separator="/" separatorMargin="xs">
        <Text fz="sm" c="dimmed">
          {current.group.label}
        </Text>
        <Text fz="sm" fw={700} aria-current="page">
          {current.item.label}
        </Text>
      </Breadcrumbs>
    </Box>
  );
}

export function AppShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <>
      <AppShell
        header={{ height: 76 }}
        navbar={{
          width: collapsed ? 100 : 300,
          breakpoint: "sm",
          collapsed: { mobile: true },
        }}
        padding={{ base: "md", sm: "xl" }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" miw={0}>
              <ActionIcon
                hiddenFrom="sm"
                size={48}
                variant="subtle"
                color="sand.9"
                aria-label="Open navigation menu"
                aria-haspopup="dialog"
                aria-expanded={drawerOpened}
                onClick={openDrawer}
              >
                <IconMenu2 size={24} aria-hidden />
              </ActionIcon>
              <ActionIcon
                visibleFrom="sm"
                size={48}
                variant="subtle"
                color="sand.9"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                onClick={toggleCollapsed}
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={24} aria-hidden />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={24} aria-hidden />
                )}
              </ActionIcon>
              <Crumbs pathname={pathname} />
            </Group>

            <Menu position="bottom-end" width={270}>
              <Menu.Target>
                <UnstyledButton aria-label={`Account menu for ${user.name}`}>
                  <Avatar color="brand" variant="filled" size={48} radius="xl">
                    {userInitials}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  {user.name}
                  <br />
                  {user.email}
                </Menu.Label>
                <Menu.Item
                  component={Link}
                  href="/projects"
                  py="sm"
                  leftSection={<IconFolders size={18} aria-hidden />}
                >
                  Your projects
                </Menu.Item>
                <Menu.Item
                  component={Link}
                  href="/settings"
                  py="sm"
                  leftSection={<IconSettings size={18} aria-hidden />}
                >
                  Account settings
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar visibleFrom="sm" p="md" aria-label="Main navigation">
          <AppShell.Section mb="lg">
            <Group justify={collapsed ? "center" : "flex-start"}>
              <Brand compact={collapsed} />
            </Group>
          </AppShell.Section>

          <AppShell.Section grow style={{ overflowY: "auto" }}>
            <NavTree collapsed={collapsed} pathname={pathname} />
          </AppShell.Section>

          <AppShell.Section mt="md">
            <Divider mb="md" />
            {collapsed ? (
              <Group justify="center">
                <Tooltip label={`${user.name}, ${user.role}`} position="right" withArrow>
                  <Avatar color="brand" variant="light" size={48} radius="xl" aria-label={user.name}>
                    {userInitials}
                  </Avatar>
                </Tooltip>
              </Group>
            ) : (
              <Group gap="sm" wrap="nowrap">
                <Avatar color="brand" variant="light" size={48} radius="xl" aria-hidden>
                  {userInitials}
                </Avatar>
                <Box miw={0}>
                  <Text fw={700} truncate>
                    {user.name}
                  </Text>
                  <Text fz="sm" c="dimmed" truncate>
                    {user.role}
                  </Text>
                </Box>
              </Group>
            )}
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main id="main-content">
          <Container size="lg" px={0} py="md">
            {children}
          </Container>
        </AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        hiddenFrom="sm"
        size={320}
        padding="md"
        title={<Brand />}
        closeButtonProps={{ "aria-label": "Close navigation menu", size: "xl" }}
      >
        <Box component="nav" aria-label="Main navigation">
          <NavTree collapsed={false} pathname={pathname} onNavigate={closeDrawer} />
        </Box>
      </Drawer>
    </>
  );
}
```

```tsx components/page-header.tsx
import type { ReactNode } from "react";
import { Group, Stack, Text, Title } from "@mantine/core";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Group justify="space-between" align="flex-end" gap="md">
      <Stack gap={6}>
        <Title order={1}>{title}</Title>
        <Text c="dimmed" fz="lg" maw={560}>
          {description}
        </Text>
      </Stack>
      {action}
    </Group>
  );
}
```

```tsx components/dashboard-view.tsx
"use client";

import Link from "next/link";
import { Badge, Box, Button, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconActivity, IconBug, IconCalendarEvent, IconFolders, type Icon } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";
import { firstName, formatDate, projects } from "@/lib/data";

interface Stat {
  label: string;
  value: string;
  hint: string;
  icon: Icon;
}

const byUpdated = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
const byIssues = [...projects].sort((a, b) => b.issues - a.issues);
const activeCount = projects.filter((p) => p.status === "Active").length;
const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);

const stats: Stat[] = [
  {
    label: "Active projects",
    value: String(activeCount),
    hint: `${projects.length} projects in total`,
    icon: IconFolders,
  },
  {
    label: "Open issues",
    value: String(totalIssues),
    hint: "Across every project",
    icon: IconBug,
  },
  {
    label: "Busiest project",
    value: byIssues[0].name,
    hint: `${byIssues[0].issues} open issues`,
    icon: IconActivity,
  },
  {
    label: "Last update",
    value: formatDate(byUpdated[0].updated),
    hint: byUpdated[0].name,
    icon: IconCalendarEvent,
  },
];

export function DashboardView() {
  return (
    <Stack gap="xl">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Here is how your ${projects.length} projects are doing today. Nice work, team.`}
      />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg">
        {stats.map((stat) => (
          <Card key={stat.label} component="section" aria-label={stat.label}>
            <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md">
              <Text fw={600} c="dimmed">
                {stat.label}
              </Text>
              <ThemeIcon size={44} variant="light" color="brand" aria-hidden>
                <stat.icon size={24} />
              </ThemeIcon>
            </Group>
            <Text ff="heading" fw={800} fz={stat.value.length > 8 ? 26 : 36} lh={1.2}>
              {stat.value}
            </Text>
            <Text fz="sm" c="dimmed" mt={6}>
              {stat.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card component="section" aria-labelledby="recent-heading">
        <Group justify="space-between" align="center" mb="md">
          <Title order={2} id="recent-heading">
            Recently updated
          </Title>
          <Button component={Link} href="/projects" variant="light">
            View all projects
          </Button>
        </Group>
        <Stack component="ul" gap={0} p={0} m={0} style={{ listStyle: "none" }}>
          {byUpdated.slice(0, 3).map((project, index) => (
            <Box
              key={project.key}
              component="li"
              py="md"
              style={
                index > 0 ? { borderTop: "1px solid var(--mantine-color-default-border)" } : undefined
              }
            >
              <Group justify="space-between" wrap="nowrap" gap="md">
                <Group gap="md" wrap="nowrap" miw={0}>
                  <Badge variant="light" color="sand.9">
                    {project.key}
                  </Badge>
                  <Box miw={0}>
                    <Text fw={700} truncate>
                      {project.name}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {project.issues} open issues
                    </Text>
                  </Box>
                </Group>
                <Text fz="sm" c="dimmed" ta="right">
                  <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                </Text>
              </Group>
            </Box>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
```

```tsx components/projects-view.tsx
"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Group, Select, Stack, Table, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusColor: Record<ProjectStatus, string> = {
  Active: "teal.9",
  Paused: "orange.9",
  Archived: "sand.9",
};

const statusOptions = ["All statuses", "Active", "Paused", "Archived"];

export function ProjectsView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("All statuses");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery = q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q);
      const matchesStatus = status === "All statuses" || p.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <Stack gap="xl">
      <PageHeader
        title="Projects"
        description="Every project your team is shipping, with its open issues and latest activity."
      />

      <Card component="section" aria-label="Project list">
        <Group align="flex-end" gap="md" mb="lg">
          <TextInput
            label="Search projects"
            placeholder="Name or key"
            leftSection={<IconSearch size={18} aria-hidden />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 240px" }}
          />
          <Select
            label="Status"
            data={statusOptions}
            value={status}
            onChange={(value) => setStatus(value ?? "All statuses")}
            style={{ flex: "0 1 220px" }}
          />
        </Group>

        <Table.ScrollContainer minWidth={560}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Project</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Open issues</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visible.map((project) => (
                <Table.Tr key={project.key}>
                  <Table.Td>
                    <Group gap="md" wrap="nowrap">
                      <Badge variant="light" color="sand.9">
                        {project.key}
                      </Badge>
                      <Text fw={700}>{project.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor[project.status]}>
                      {project.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">{project.issues}</Table.Td>
                  <Table.Td>
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Text fz="sm" c="dimmed" mt="md" role="status" aria-live="polite">
          {visible.length === 0
            ? "No projects match your search. Try a different name or status."
            : `Showing ${visible.length} of ${projects.length} projects`}
        </Text>
      </Card>
    </Stack>
  );
}
```

```tsx components/reports-view.tsx
"use client";

import { Badge, Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { PageHeader } from "@/components/page-header";
import { projects } from "@/lib/data";

const ranked = [...projects].sort((a, b) => b.issues - a.issues);
const maxIssues = Math.max(...projects.map((p) => p.issues), 1);

export function ReportsView() {
  return (
    <Stack gap="xl">
      <PageHeader
        title="Reports"
        description="See where open issues are piling up, so the team knows where to lend a hand."
      />

      <Card component="section" aria-labelledby="issues-heading">
        <Title order={2} id="issues-heading" mb="lg">
          Open issues by project
        </Title>
        <Stack gap="lg">
          {ranked.map((project) => (
            <Stack key={project.key} gap={8}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <Badge variant="light" color="sand.9">
                    {project.key}
                  </Badge>
                  <Text fw={700}>{project.name}</Text>
                </Group>
                <Text fw={700}>{project.issues}</Text>
              </Group>
              <Progress
                value={(project.issues / maxIssues) * 100}
                size="lg"
                aria-label={`${project.name}: ${project.issues} open issues`}
              />
            </Stack>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
```

```tsx components/settings-view.tsx
"use client";

import { Button, Card, Group, SimpleGrid, Stack, Switch, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";
import { user } from "@/lib/data";

export function SettingsView() {
  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      weeklyDigest: true,
      assignments: true,
      productNews: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Please enter your name" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Please enter a valid email address"),
    },
  });

  return (
    <Stack gap="xl" maw={760}>
      <PageHeader
        title="Settings"
        description="Keep your profile up to date and choose how Lumen keeps you in the loop."
      />

      <form
        noValidate
        onSubmit={form.onSubmit(() => {
          notifications.show({
            title: "Settings saved",
            message: "Your profile and notification choices are up to date.",
            icon: <IconCheck size={18} aria-hidden />,
            color: "brand",
          });
        })}
      >
        <Stack gap="xl">
          <Card component="section" aria-labelledby="profile-heading">
            <Title order={2} id="profile-heading" mb="lg">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <TextInput
                label="Full name"
                autoComplete="name"
                required
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Email"
                type="email"
                autoComplete="email"
                required
                {...form.getInputProps("email")}
              />
              <TextInput
                label="Role"
                description="Only another owner can change this."
                value={user.role}
                readOnly
              />
            </SimpleGrid>
          </Card>

          <Card component="section" aria-labelledby="notify-heading">
            <Title order={2} id="notify-heading" mb="lg">
              Notifications
            </Title>
            <Stack gap="lg">
              <Switch
                label="Weekly digest"
                description="A friendly Monday summary of what your team shipped."
                {...form.getInputProps("weeklyDigest", { type: "checkbox" })}
              />
              <Switch
                label="Issue assignments"
                description="Tell me when an issue lands on my plate."
                {...form.getInputProps("assignments", { type: "checkbox" })}
              />
              <Switch
                label="Product news"
                description="Occasional notes about new Lumen features."
                {...form.getInputProps("productNews", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Group justify="flex-end" align="center" gap="md">
            <Text fz="sm" c="dimmed">
              Changes apply to {user.email}
            </Text>
            <Button type="submit">Save changes</Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <DashboardView />;
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { ProjectsView } from "@/components/projects-view";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsView />;
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsView />;
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { ReportsView } from "@/components/reports-view";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsView />;
}
```
