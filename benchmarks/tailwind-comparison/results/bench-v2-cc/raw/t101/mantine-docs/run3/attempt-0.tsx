```ts app/theme.ts
import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Lumen brand: #0F766E sits at index 6, which is the primary shade.
const brand: MantineColorsTuple = [
  "#f0fdfa",
  "#ccfbf1",
  "#99f6e4",
  "#5eead4",
  "#2dd4bf",
  "#14b8a6",
  "#0f766e",
  "#0d6560",
  "#115e59",
  "#134e4a",
];

// Cool slate neutrals replace Mantine's gray scale.
const slate: MantineColorsTuple = [
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, gray: slate },
  black: "#0f172a",
  white: "#ffffff",
  autoContrast: true,
  focusRing: "auto",

  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.375rem", lineHeight: "1.25" },
      h2: { fontSize: "1.0625rem", lineHeight: "1.3" },
      h3: { fontSize: "0.9375rem", lineHeight: "1.35" },
      h4: { fontSize: "0.875rem", lineHeight: "1.4" },
      h5: { fontSize: "0.8125rem", lineHeight: "1.4" },
      h6: { fontSize: "0.75rem", lineHeight: "1.4" },
    },
  },

  // Compact density: smaller type and tighter spacing everywhere.
  fontSizes: {
    xs: "0.6875rem",
    sm: "0.75rem",
    md: "0.8125rem",
    lg: "0.9375rem",
    xl: "1.0625rem",
  },
  lineHeights: { xs: "1.3", sm: "1.35", md: "1.4", lg: "1.45", xl: "1.5" },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },

  // 2px corners on buttons, inputs, cards and menus.
  radius: { xs: "2px", sm: "2px", md: "2px", lg: "2px", xl: "2px" },
  defaultRadius: "sm",

  components: {
    Button: { defaultProps: { size: "xs" } },
    TextInput: { defaultProps: { size: "xs" } },
    Select: { defaultProps: { size: "xs" } },
    Switch: { defaultProps: { size: "sm" } },
    Card: { defaultProps: { padding: "md", withBorder: true } },
    Paper: { defaultProps: { withBorder: true } },
    Table: {
      defaultProps: {
        verticalSpacing: "xs",
        horizontalSpacing: "sm",
        highlightOnHover: true,
      },
    },
    Menu: { defaultProps: { shadow: "sm" } },
    NavLink: { defaultProps: { variant: "filled" } },
  },
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
import { theme } from "./theme";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
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

export interface Report {
  name: string;
  cadence: string;
  recipients: string;
  lastRun: string;
}

export const product = "Lumen";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const workspaceName = "Acme Labs";

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export const reports: Report[] = [
  {
    name: "Weekly issue summary",
    cadence: "Mondays, 08:00",
    recipients: "Whole team",
    lastRun: "2026-10-12",
  },
  {
    name: "Open issues by project",
    cadence: "Daily, 07:30",
    recipients: "Maya Okafor",
    lastRun: "2026-10-14",
  },
  {
    name: "Paused and archived projects",
    cadence: "First of the month",
    recipients: "Owners",
    lastRun: "2026-10-01",
  },
];

// Deterministic on server and client: fixed locale and UTC.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const totalOpenIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeProjects = projects.filter((p) => p.status === "Active");
export const pausedProjects = projects.filter((p) => p.status === "Paused");
export const archivedProjects = projects.filter((p) => p.status === "Archived");
export const projectsByUpdated = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
export const busiestProject = [...projects].sort((a, b) => b.issues - a.issues)[0];
export const latestProject = projectsByUpdated[0];
```

```ts components/nav-config.ts
import type { ComponentType } from "react";
import {
  IconBriefcase,
  IconChartBar,
  IconFileAnalytics,
  IconFolders,
  IconLayoutDashboard,
  IconSettings,
} from "@tabler/icons-react";

type NavIcon = ComponentType<{ size?: number | string; stroke?: number | string }>;

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

export function findCrumbs(pathname: string): { group?: string; page: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group: group.label, page: item.label };
    }
  }
  return { page: "Not found" };
}
```

```tsx components/SidebarNav.tsx
"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ActionIcon, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { isActive, navGroups } from "./nav-config";

interface SidebarNavProps {
  pathname: string;
  collapsed?: boolean;
  label: string;
  onNavigate?: () => void;
}

export function SidebarNav({ pathname, collapsed = false, label, onNavigate }: SidebarNavProps) {
  if (collapsed) {
    return (
      <Stack component="nav" aria-label={label} gap={4} align="center">
        {navGroups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <Divider w="100%" aria-hidden="true" />}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Tooltip key={item.href} label={`${group.label}: ${item.label}`} position="right">
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size="lg"
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "gray"}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <item.icon size={18} stroke={1.75} />
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
    <nav aria-label={label}>
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={16} stroke={1.75} />}
          childrenOffset={14}
          defaultOpened
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={16} stroke={1.75} />}
                active={active}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              />
            );
          })}
        </NavLink>
      ))}
    </nav>
  );
}
```

```tsx components/AppFrame.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Breadcrumbs,
  Burger,
  Drawer,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { user } from "@/lib/data";
import { findCrumbs } from "./nav-config";
import { SidebarNav } from "./SidebarNav";

const initials = user.name
  .split(" ")
  .map((part) => part[0])
  .join("");

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const crumbs = findCrumbs(pathname);

  return (
    <AppShell
      padding="md"
      header={{ height: 44 }}
      navbar={{
        width: collapsed ? 48 : 208,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="sm" gap="sm" wrap="nowrap" justify="space-between">
          <Group gap="sm" wrap="nowrap" miw={0}>
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom="sm"
              size="sm"
              aria-label={drawerOpened ? "Close navigation" : "Open navigation"}
            />
            <ActionIcon
              visibleFrom="sm"
              variant="subtle"
              color="gray"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <IconLayoutSidebarLeftExpand size={18} stroke={1.75} />
              ) : (
                <IconLayoutSidebarLeftCollapse size={18} stroke={1.75} />
              )}
            </ActionIcon>
            <Text component={Link} href="/" ff="heading" fw={700} fz="lg" c="brand.6" td="none">
              Lumen
            </Text>
            <nav aria-label="Breadcrumb">
              <Breadcrumbs separator="/" separatorMargin={6}>
                {crumbs.group ? (
                  <Text key="group" size="sm" c="dimmed">
                    {crumbs.group}
                  </Text>
                ) : null}
                <Text key="page" size="sm" fw={600} aria-current="page">
                  {crumbs.page}
                </Text>
              </Breadcrumbs>
            </nav>
          </Group>

          <Menu position="bottom-end" width={220}>
            <Menu.Target>
              <UnstyledButton aria-label={`Account menu for ${user.name}`}>
                <Avatar color="brand" size="sm" radius={999}>
                  {initials}
                </Avatar>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>
                {user.name} ({user.role})
                <br />
                {user.email}
              </Menu.Label>
              <Menu.Item
                component={Link}
                href="/settings"
                leftSection={<IconSettings size={14} stroke={1.75} />}
              >
                Settings
              </Menu.Item>
              <Menu.Item
                leftSection={<IconLogout size={14} stroke={1.75} />}
                onClick={() =>
                  notifications.show({
                    title: "Signed out",
                    message: "You have been signed out of this demo session.",
                  })
                }
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs" visibleFrom="sm">
        <AppShell.Section grow>
          <SidebarNav pathname={pathname} collapsed={collapsed} label="Primary" />
        </AppShell.Section>
        {!collapsed && (
          <AppShell.Section>
            <Text size="sm" fw={600}>
              {user.name}
            </Text>
            <Text size="xs" c="dimmed">
              {user.role}, {user.email}
            </Text>
          </AppShell.Section>
        )}
      </AppShell.Navbar>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Lumen"
        size={264}
        padding="sm"
        hiddenFrom="sm"
        closeButtonProps={{ "aria-label": "Close navigation" }}
      >
        <SidebarNav pathname={pathname} label="Mobile" onNavigate={closeDrawer} />
      </Drawer>

      <AppShell.Main bg="gray.0">{children}</AppShell.Main>
    </AppShell>
  );
}
```

```tsx components/PageHeader.tsx
"use client";

import { Stack, Text, Title } from "@mantine/core";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <Stack gap={2} mb="md">
      <Title order={1}>{title}</Title>
      {description ? (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}
```

```tsx components/ProjectStatusBadge.tsx
"use client";

import { Badge } from "@mantine/core";
import type { ProjectStatus } from "@/lib/data";

const colors: Record<ProjectStatus, string> = {
  Active: "brand.6",
  Paused: "orange.8",
  Archived: "gray.7",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" size="sm" color={colors[status]}>
      {status}
    </Badge>
  );
}
```

```tsx components/Dashboard.tsx
"use client";

import Link from "next/link";
import { Anchor, Card, Group, SimpleGrid, Table, Text, Title } from "@mantine/core";
import {
  activeProjects,
  archivedProjects,
  busiestProject,
  formatDate,
  latestProject,
  pausedProjects,
  projects,
  projectsByUpdated,
  totalOpenIssues,
  user,
  workspaceName,
} from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

const cards = [
  {
    label: "Open issues",
    value: String(totalOpenIssues),
    note: `Across ${projects.length} projects`,
  },
  {
    label: "Active projects",
    value: String(activeProjects.length),
    note: `${pausedProjects.length} paused, ${archivedProjects.length} archived`,
  },
  {
    label: "Busiest project",
    value: busiestProject.name,
    note: `${busiestProject.issues} open issues`,
  },
  {
    label: "Last updated",
    value: formatDate(latestProject.updated),
    note: latestProject.name,
  },
];

export function Dashboard() {
  const recent = projectsByUpdated.slice(0, 3);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${workspaceName} has ${totalOpenIssues} open issues across ${activeProjects.length} active projects.`}
      />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md" mb="md">
        {cards.map((card) => (
          <Card key={card.label}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.04em">
              {card.label}
            </Text>
            <Text ff="heading" fz={24} fw={600} lh={1.2} mt={4}>
              {card.value}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {card.note}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card>
        <Group justify="space-between" mb="xs">
          <Title order={2}>Recently updated</Title>
          <Anchor component={Link} href="/projects" size="sm">
            All projects
          </Anchor>
        </Group>
        <Table.ScrollContainer minWidth={420}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Key</Table.Th>
                <Table.Th>Project</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Issues</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recent.map((project) => (
                <Table.Tr key={project.key}>
                  <Table.Td fw={600}>{project.key}</Table.Td>
                  <Table.Td>{project.name}</Table.Td>
                  <Table.Td>
                    <ProjectStatusBadge status={project.status} />
                  </Table.Td>
                  <Table.Td ta="right">{project.issues}</Table.Td>
                  <Table.Td>{formatDate(project.updated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <Dashboard />;
}
```

```tsx components/ProjectsList.tsx
"use client";

import { useState } from "react";
import { Card, Group, Select, Table, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDate, projects } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

const statusOptions = ["All statuses", "Active", "Paused", "Archived"];

export function ProjectsList() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("All statuses");

  const needle = query.trim().toLowerCase();
  const visible = projects.filter((project) => {
    const matchesStatus = status === "All statuses" || project.status === status;
    const matchesQuery =
      needle === "" ||
      project.name.toLowerCase().includes(needle) ||
      project.key.toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the workspace with its open issue count and last update."
      />
      <Card>
        <Group gap="sm" mb="sm" align="flex-end">
          <TextInput
            label="Search projects"
            placeholder="Name or key"
            leftSection={<IconSearch size={14} stroke={1.75} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 200px", maxWidth: 320 }}
          />
          <Select
            label="Status"
            data={statusOptions}
            value={status}
            onChange={(value) => setStatus(value ?? "All statuses")}
            allowDeselect={false}
            style={{ flex: "0 1 160px" }}
          />
        </Group>

        <Table.ScrollContainer minWidth={520}>
          <Table>
            <Table.Caption>
              Showing {visible.length} of {projects.length} projects
            </Table.Caption>
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
              {visible.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text size="sm" c="dimmed" ta="center">
                      No projects match these filters.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                visible.map((project) => (
                  <Table.Tr key={project.key}>
                    <Table.Td fw={600}>{project.key}</Table.Td>
                    <Table.Td>{project.name}</Table.Td>
                    <Table.Td>
                      <ProjectStatusBadge status={project.status} />
                    </Table.Td>
                    <Table.Td ta="right">{project.issues}</Table.Td>
                    <Table.Td>{formatDate(project.updated)}</Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { ProjectsList } from "@/components/ProjectsList";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsList />;
}
```

```tsx components/ReportsList.tsx
"use client";

import { Card, Table } from "@mantine/core";
import { formatDate, reports } from "@/lib/data";
import { PageHeader } from "./PageHeader";

export function ReportsList() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Scheduled summaries that Lumen sends to your team."
      />
      <Card>
        <Table.ScrollContainer minWidth={520}>
          <Table>
            <Table.Caption>{reports.length} scheduled reports</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Report</Table.Th>
                <Table.Th scope="col">Schedule</Table.Th>
                <Table.Th scope="col">Recipients</Table.Th>
                <Table.Th scope="col">Last run</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports.map((report) => (
                <Table.Tr key={report.name}>
                  <Table.Td fw={600}>{report.name}</Table.Td>
                  <Table.Td>{report.cadence}</Table.Td>
                  <Table.Td>{report.recipients}</Table.Td>
                  <Table.Td>{formatDate(report.lastRun)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </>
  );
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { ReportsList } from "@/components/ReportsList";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ReportsList />;
}
```

```tsx components/SettingsForm.tsx
"use client";

import { Button, Card, Group, Select, SimpleGrid, Stack, Switch, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user, workspaceName } from "@/lib/data";
import { PageHeader } from "./PageHeader";

const timezones = [
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Africa/Lagos",
];

export function SettingsForm() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      workspace: workspaceName,
      timezone: "Europe/London",
      digest: "Weekly",
      notifyAssigned: true,
      notifyMentions: true,
      notifyStatus: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Enter your full name" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
      workspace: (value) => (value.trim().length === 0 ? "Workspace name is required" : null),
    },
  });

  return (
    <>
      <PageHeader title="Settings" description="Your profile, workspace and notification preferences." />
      <form
        onSubmit={form.onSubmit(() =>
          notifications.show({
            title: "Settings saved",
            message: "Your changes have been applied.",
          }),
        )}
        noValidate
      >
        <Stack gap="md" maw={760}>
          <Card>
            <Title order={2} mb="sm">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Full name"
                autoComplete="name"
                key={form.key("name")}
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Email"
                type="email"
                autoComplete="email"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />
              <TextInput
                label="Role"
                description="Only another owner can change this."
                readOnly
                key={form.key("role")}
                {...form.getInputProps("role")}
              />
            </SimpleGrid>
          </Card>

          <Card>
            <Title order={2} mb="sm">
              Workspace
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Workspace name"
                key={form.key("workspace")}
                {...form.getInputProps("workspace")}
              />
              <Select
                label="Time zone"
                data={timezones}
                allowDeselect={false}
                key={form.key("timezone")}
                {...form.getInputProps("timezone")}
              />
              <Select
                label="Email digest"
                data={["Daily", "Weekly", "Never"]}
                allowDeselect={false}
                key={form.key("digest")}
                {...form.getInputProps("digest")}
              />
            </SimpleGrid>
          </Card>

          <Card>
            <Title order={2} mb="sm">
              Notifications
            </Title>
            <Stack gap="sm">
              <Switch
                label="Issues assigned to me"
                key={form.key("notifyAssigned")}
                {...form.getInputProps("notifyAssigned", { type: "checkbox" })}
              />
              <Switch
                label="Mentions in comments"
                key={form.key("notifyMentions")}
                {...form.getInputProps("notifyMentions", { type: "checkbox" })}
              />
              <Switch
                label="Status changes on projects I follow"
                key={form.key("notifyStatus")}
                {...form.getInputProps("notifyStatus", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Group justify="flex-end" gap="sm">
            <Button type="button" variant="default" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit">Save changes</Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsForm />;
}
```
