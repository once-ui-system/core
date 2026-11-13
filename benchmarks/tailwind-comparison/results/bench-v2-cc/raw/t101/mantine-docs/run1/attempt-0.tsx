```ts app/theme.ts
import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Lumen brand: #0F766E sits at index 7 of the "lumen" scale.
const lumen: MantineColorsTuple = [
  "#f0fdfa",
  "#ccfbf1",
  "#99f6e4",
  "#5eead4",
  "#2dd4bf",
  "#14b8a6",
  "#0d9488",
  "#0f766e",
  "#115e59",
  "#134e4a",
];

// Cool slate neutrals.
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

const slateDark: MantineColorsTuple = [
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#172033",
  "#0f172a",
  "#0b1220",
];

const serif = 'Georgia, "Times New Roman", serif';

export const theme = createTheme({
  colors: { lumen, gray: slate, dark: slateDark },
  primaryColor: "lumen",
  primaryShade: { light: 7, dark: 5 },
  black: "#0f172a",
  defaultRadius: "xs",
  radius: { xs: "2px", sm: "2px", md: "2px", lg: "2px", xl: "2px" },
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontSizes: { xs: "11px", sm: "12.5px", md: "13.5px", lg: "15px", xl: "17px" },
  spacing: { xs: "6px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  lineHeights: { xs: "1.3", sm: "1.35", md: "1.4", lg: "1.45", xl: "1.5" },
  headings: {
    fontFamily: serif,
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "26px", lineHeight: "1.25" },
      h2: { fontSize: "21px", lineHeight: "1.25" },
      h3: { fontSize: "17px", lineHeight: "1.3" },
      h4: { fontSize: "15px", lineHeight: "1.3" },
      h5: { fontSize: "13.5px", lineHeight: "1.35" },
      h6: { fontSize: "12.5px", lineHeight: "1.35" },
    },
  },
  components: {
    Button: { defaultProps: { size: "xs", radius: "xs" } },
    ActionIcon: { defaultProps: { size: "md", radius: "xs" } },
    TextInput: { defaultProps: { size: "xs", radius: "xs" } },
    Select: { defaultProps: { size: "xs", radius: "xs" } },
    Switch: { defaultProps: { size: "sm" } },
    SegmentedControl: { defaultProps: { size: "xs", radius: "xs" } },
    Card: { defaultProps: { padding: "md", radius: "xs", withBorder: true } },
    Paper: { defaultProps: { radius: "xs" } },
    Badge: { defaultProps: { size: "sm", radius: "xs" } },
    Menu: { defaultProps: { radius: "xs" } },
    Tooltip: { defaultProps: { radius: "xs" } },
    Table: { defaultProps: { verticalSpacing: "xs", horizontalSpacing: "sm", fz: "sm" } },
    NavLink: { defaultProps: { radius: "xs" } },
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
import { Shell } from "@/components/Shell";
import { theme } from "./theme";

export const metadata: Metadata = { title: "Lumen" };

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
            <Shell>{children}</Shell>
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
  Active: "lumen",
  Paused: "yellow",
  Archived: "gray",
};

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const reports = [
  { name: "Weekly issue throughput", period: "Week 41", owner: "Maya Okafor" },
  { name: "Active users by project", period: "September 2026", owner: "Maya Okafor" },
  { name: "Open issues by age", period: "Q3 2026", owner: "Maya Okafor" },
];
```

```tsx components/Shell.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Breadcrumbs,
  Burger,
  Divider,
  Drawer,
  Group,
  NavLink,
  Anchor,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  IconChartBar,
  IconChevronsLeft,
  IconChevronsRight,
  IconFileAnalytics,
  IconFolders,
  IconLayoutDashboard,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";
import { user } from "@/lib/data";

interface NavItem {
  label: string;
  href: string;
  icon: Icon;
}

interface NavGroup {
  label: string;
  icon: Icon;
  items: NavItem[];
}

const groups: NavGroup[] = [
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
    icon: IconFolders,
    items: [
      { label: "Projects", href: "/projects", icon: IconFolders },
      { label: "Settings", href: "/settings", icon: IconSettings },
    ],
  },
];

function Navigation({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <nav aria-label="Main">
        {groups.map((group, index) => (
          <div key={group.label}>
            {index > 0 && <Divider my="xs" />}
            {group.items.map((item) => {
              const active = pathname === item.href;
              const ItemIcon = item.icon;
              return (
                <Tooltip key={item.href} label={item.label} position="right" withArrow>
                  <NavLink
                    component={Link}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    active={active}
                    variant="filled"
                    leftSection={<ItemIcon size={18} aria-hidden />}
                    onClick={onNavigate}
                    styles={{ root: { justifyContent: "center", padding: 8 }, section: { margin: 0 } }}
                  />
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Main">
      {groups.map((group) => {
        const GroupIcon = group.icon;
        const groupActive = group.items.some((item) => item.href === pathname);
        return (
          <NavLink
            key={group.label}
            label={group.label}
            leftSection={<GroupIcon size={16} aria-hidden />}
            defaultOpened
            childrenOffset={16}
            fw={600}
            data-group-active={groupActive || undefined}
          >
            {group.items.map((item) => {
              const active = pathname === item.href;
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  aria-current={active ? "page" : undefined}
                  active={active}
                  variant="filled"
                  fw={400}
                  leftSection={<ItemIcon size={16} aria-hidden />}
                  onClick={onNavigate}
                />
              );
            })}
          </NavLink>
        );
      })}
    </nav>
  );
}

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return [{ label: "Lumen", href: "/" }, { label: group.label }, { label: item.label }];
      }
    }
  }
  return [{ label: "Lumen", href: "/" }];
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [collapsed, setCollapsed] = useLocalStorage<boolean>({
    key: "lumen-nav-collapsed",
    defaultValue: false,
    getInitialValueInEffect: true,
  });

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const crumbs = crumbsFor(pathname);

  return (
    <>
      <AppShell
        header={{ height: 44 }}
        navbar={{ width: collapsed ? 52 : 224, breakpoint: "sm", collapsed: { mobile: true } }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="sm" justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <Burger
                opened={drawerOpened}
                onClick={toggleDrawer}
                hiddenFrom="sm"
                size="sm"
                aria-label="Open navigation menu"
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                visibleFrom="sm"
                onClick={() => setCollapsed((value) => !value)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
              >
                {collapsed ? <IconChevronsRight size={16} /> : <IconChevronsLeft size={16} />}
              </ActionIcon>
              <Breadcrumbs separatorMargin={6} aria-label="Breadcrumb" style={{ flexWrap: "nowrap" }}>
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1;
                  if (crumb.href && !last) {
                    return (
                      <Anchor key={crumb.label} component={Link} href={crumb.href} fz="sm">
                        {crumb.label}
                      </Anchor>
                    );
                  }
                  return (
                    <Text
                      key={crumb.label}
                      fz="sm"
                      fw={last ? 600 : 400}
                      c={last ? undefined : "dimmed"}
                      aria-current={last ? "page" : undefined}
                    >
                      {crumb.label}
                    </Text>
                  );
                })}
              </Breadcrumbs>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Text fz="sm" visibleFrom="xs">
                {user.name}
              </Text>
              <Avatar size={24} color="lumen" aria-label={user.name}>
                MO
              </Avatar>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="xs">
          <Navigation collapsed={collapsed} />
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        hiddenFrom="sm"
        size={260}
        padding="xs"
        title="Lumen"
        styles={{ title: { fontFamily: "var(--mantine-font-family-headings)", fontWeight: 600 } }}
      >
        <Navigation collapsed={false} onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
```

```tsx app/page.tsx
"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { formatDate, projects, statusColor, user } from "@/lib/data";

const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
const activeCount = projects.filter((p) => p.status === "Active").length;
const pausedCount = projects.filter((p) => p.status === "Paused").length;
const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

const cards = [
  { label: "Open issues", value: String(totalIssues), note: "Across all projects" },
  { label: "Active projects", value: String(activeCount), note: "Receiving updates" },
  { label: "Paused projects", value: String(pausedCount), note: "Mobile beta" },
  { label: "Last update", value: formatDate(latest[0].updated), note: latest[0].name },
];

export default function DashboardPage() {
  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Welcome back, {user.name.split(" ")[0]}</Title>
        <Text c="dimmed" fz="sm">
          Here is where your workspace stands today.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
        {cards.map((card) => (
          <Card key={card.label}>
            <Text fz="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: 0.4 }}>
              {card.label}
            </Text>
            <Text
              fz={24}
              fw={600}
              mt={4}
              style={{ fontFamily: "var(--mantine-font-family-headings)", fontVariantNumeric: "tabular-nums" }}
            >
              {card.value}
            </Text>
            <Text fz="xs" c="dimmed">
              {card.note}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card padding={0}>
        <Group px="sm" py="xs" justify="space-between">
          <Title order={3}>Recently updated</Title>
        </Group>
        <Table.ScrollContainer minWidth={360}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Project</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {latest.slice(0, 4).map((p) => (
                <Table.Tr key={p.key}>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor[p.status]}>
                      {p.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">{formatDate(p.updated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Code, Group, SegmentedControl, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDate, projects, statusColor } from "@/lib/data";

const filters = ["All", "Active", "Paused", "Archived"];

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)),
    );
  }, [query, status]);

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Projects</Title>
        <Text c="dimmed" fz="sm">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </div>

      <Group gap="sm">
        <TextInput
          aria-label="Search projects"
          placeholder="Search by name or key"
          leftSection={<IconSearch size={14} aria-hidden />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          style={{ flex: "1 1 200px", maxWidth: 320 }}
        />
        <SegmentedControl
          aria-label="Filter by status"
          data={filters}
          value={status}
          onChange={setStatus}
        />
      </Group>

      <Card padding={0}>
        <Table.ScrollContainer minWidth={520}>
          <Table highlightOnHover stickyHeader>
            <Table.Caption>Projects with status, open issues and last update</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Key</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Issues</Table.Th>
                <Table.Th ta="right">Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((p) => (
                <Table.Tr key={p.key}>
                  <Table.Td>
                    <Code>{p.key}</Code>
                  </Table.Td>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor[p.status]}>
                      {p.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {p.issues}
                  </Table.Td>
                  <Table.Td ta="right">{formatDate(p.updated)}</Table.Td>
                </Table.Tr>
              ))}
              {rows.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" ta="center" fz="sm">
                      No projects match your filters.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    notifications.show({ title: "Settings saved", message: "Your changes have been applied." });
  }

  return (
    <Stack gap="md" maw={640}>
      <div>
        <Title order={1}>Settings</Title>
        <Text c="dimmed" fz="sm">
          Manage your profile and preferences.
        </Text>
      </div>

      <form onSubmit={onSubmit} aria-label="Settings">
        <Stack gap="md">
          <Card>
            <Title order={3} mb="xs">
              Profile
            </Title>
            <Stack gap="xs">
              <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
              />
              <TextInput label="Role" value={user.role} readOnly description="Only another owner can change this." />
            </Stack>
          </Card>

          <Card>
            <Title order={3} mb="xs">
              Notifications
            </Title>
            <Stack gap="xs">
              <Switch
                label="Weekly digest"
                description="A summary of issues opened and closed."
                checked={digest}
                onChange={(e) => setDigest(e.currentTarget.checked)}
              />
              <Switch
                label="Mentions"
                description="Email me when someone mentions me."
                checked={mentions}
                onChange={(e) => setMentions(e.currentTarget.checked)}
              />
            </Stack>
          </Card>

          <Card>
            <Title order={3} mb="xs">
              Appearance
            </Title>
            <SegmentedControl
              aria-label="Colour scheme"
              data={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "Auto", value: "auto" },
              ]}
              value={colorScheme}
              onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
            />
          </Card>

          <Group justify="flex-end">
            <Button type="submit">Save changes</Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
```

```tsx app/reports/page.tsx
"use client";

import { Card, Stack, Table, Text, Title } from "@mantine/core";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Reports</Title>
        <Text c="dimmed" fz="sm">
          Saved analytics reports for your workspace.
        </Text>
      </div>
      <Card padding={0}>
        <Table.ScrollContainer minWidth={420}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Report</Table.Th>
                <Table.Th>Period</Table.Th>
                <Table.Th>Owner</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports.map((r) => (
                <Table.Tr key={r.name}>
                  <Table.Td>{r.name}</Table.Td>
                  <Table.Td>{r.period}</Table.Td>
                  <Table.Td>{r.owner}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </Stack>
  );
}
```
