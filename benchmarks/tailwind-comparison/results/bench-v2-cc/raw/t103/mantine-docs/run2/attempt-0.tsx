```ts app/theme.ts
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  createTheme,
  Paper,
  type MantineColorsTuple,
} from "@mantine/core";

// Lumen brand orange #E8590C sits at index 6, the primary shade.
const brand: MantineColorsTuple = [
  "#fff3ea",
  "#ffe3d1",
  "#ffc7a1",
  "#ffa56b",
  "#f58340",
  "#ee6c24",
  "#E8590C",
  "#c94a08",
  "#a63d07",
  "#7f2f06",
];

// Warm stone neutrals. `dark` drives surfaces and borders in dark mode,
// `gray` drives them in light mode.
const dark: MantineColorsTuple = [
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#a39c96",
  "#4a4440",
  "#44403c",
  "#292524",
  "#1c1917",
  "#171413",
  "#0c0a09",
];

const gray: MantineColorsTuple = [
  "#fafaf9",
  "#f5f5f4",
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#78716c",
  "#57534e",
  "#44403c",
  "#292524",
  "#1c1917",
];

const mono = 'ui-monospace, "SFMono-Regular", Menlo, monospace';

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, dark, gray },
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontFamilyMonospace: mono,
  headings: {
    fontFamily: mono,
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.75rem", lineHeight: "1.25" },
      h2: { fontSize: "1.375rem", lineHeight: "1.3" },
      h3: { fontSize: "1.125rem", lineHeight: "1.35" },
      h4: { fontSize: "1rem", lineHeight: "1.4" },
    },
  },
  defaultRadius: "sm",
  radius: { xs: "4px", sm: "4px", md: "4px", lg: "4px", xl: "4px" },
  focusRing: "auto",
  components: {
    Button: Button.extend({ defaultProps: { radius: "sm" } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { radius: "sm" } }),
    Badge: Badge.extend({ defaultProps: { radius: "sm" } }),
    Card: Card.extend({ defaultProps: { radius: "sm", withBorder: true, padding: "md" } }),
    Paper: Paper.extend({ defaultProps: { radius: "sm" } }),
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
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
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
  Active: "green",
  Paused: "yellow",
  Archived: "gray",
};

export const reports = [
  {
    title: "Weekly issue throughput",
    description: "Issues opened and closed per week across all active projects.",
  },
  {
    title: "Cycle time by project",
    description: "Median days from first commit to release, grouped by project key.",
  },
  {
    title: "Release health",
    description: "Error rate and regressions in the first 48 hours after each release.",
  },
];

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
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

```ts lib/nav.ts
import {
  IconBriefcase,
  IconChartLine,
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
    icon: IconChartLine,
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

export interface Crumb {
  label: string;
  href?: string;
}

export function crumbsFor(pathname: string): Crumb[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return [{ label: group.label }, { label: item.label, href: item.href }];
      }
    }
  }
  return [{ label: "Lumen" }];
}
```

```tsx components/SideNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { navGroups } from "@/lib/nav";

interface SideNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SideNav({ collapsed = false, onNavigate }: SideNavProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <nav aria-label="Main navigation">
        <Stack gap="xs" align="center">
          {navGroups.map((group, index) => (
            <Stack key={group.label} gap="xs" align="center" role="group" aria-label={group.label}>
              {index > 0 && <Divider w={32} aria-hidden />}
              {group.items.map((item) => {
                const active = pathname === item.href;
                const ItemIcon = item.icon;
                return (
                  <Tooltip key={item.href} label={`${group.label} / ${item.label}`} position="right">
                    <ActionIcon
                      component={Link}
                      href={item.href}
                      size={40}
                      variant={active ? "filled" : "subtle"}
                      color={active ? "brand" : "gray"}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                    >
                      <ItemIcon size={20} stroke={1.75} aria-hidden />
                    </ActionIcon>
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </nav>
    );
  }

  return (
    <nav aria-label="Main navigation">
      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <NavLink
            key={group.label}
            label={group.label}
            leftSection={<GroupIcon size={18} stroke={1.75} aria-hidden />}
            defaultOpened
            childrenOffset={16}
            fw={600}
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
                  leftSection={<ItemIcon size={18} stroke={1.75} aria-hidden />}
                  active={active}
                  variant="filled"
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  fw={500}
                />
              );
            })}
          </NavLink>
        );
      })}
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
  Anchor,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Drawer,
  Group,
  Text,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { initials, user } from "@/lib/data";
import { crumbsFor } from "@/lib/nav";
import { SideNav } from "./SideNav";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, drawer] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const { toggleColorScheme } = useMantineColorScheme();
  const crumbs = crumbsFor(pathname);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: collapsed ? 68 : 248,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" miw={0}>
            <Burger
              opened={drawerOpened}
              onClick={drawer.toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Open navigation menu"
            />
            <Anchor
              component={Link}
              href="/"
              underline="never"
              c="inherit"
              fw={700}
              ff="heading"
              visibleFrom="sm"
              aria-label="Lumen home"
            >
              <Group gap={8} wrap="nowrap">
                <Box w={12} h={12} bg="brand" style={{ borderRadius: 4 }} aria-hidden />
                lumen
              </Group>
            </Anchor>
            <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <ActionIcon
                variant="subtle"
                color="gray"
                visibleFrom="sm"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={20} aria-hidden />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={20} aria-hidden />
                )}
              </ActionIcon>
            </Tooltip>
            <nav aria-label="Breadcrumb" style={{ minWidth: 0 }}>
              <Breadcrumbs separatorMargin="xs">
                {crumbs.map((crumb, index) =>
                  index === crumbs.length - 1 ? (
                    <Text key={crumb.label} size="sm" fw={600} aria-current="page" truncate>
                      {crumb.label}
                    </Text>
                  ) : (
                    <Text key={crumb.label} size="sm" c="dimmed">
                      {crumb.label}
                    </Text>
                  ),
                )}
              </Breadcrumbs>
            </nav>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={toggleColorScheme}
              aria-label="Toggle colour scheme"
            >
              <IconSun size={20} darkHidden aria-hidden />
              <IconMoon size={20} lightHidden aria-hidden />
            </ActionIcon>
            <Avatar color="brand" size="sm" radius="sm" aria-label={user.name}>
              {initials(user.name)}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component="div">
          <SideNav collapsed={collapsed} />
        </AppShell.Section>
        <AppShell.Section>
          {collapsed ? (
            <Group justify="center" py="xs">
              <Avatar color="brand" size="md" radius="sm" aria-label={`${user.name}, ${user.role}`}>
                {initials(user.name)}
              </Avatar>
            </Group>
          ) : (
            <Group gap="sm" p="xs" wrap="nowrap">
              <Avatar color="brand" radius="sm" aria-hidden>
                {initials(user.name)}
              </Avatar>
              <Box miw={0}>
                <Text size="sm" fw={600} truncate>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {user.email}
                </Text>
              </Box>
            </Group>
          )}
        </AppShell.Section>
      </AppShell.Navbar>

      <Drawer
        opened={drawerOpened}
        onClose={drawer.close}
        title={
          <Text ff="heading" fw={700}>
            lumen
          </Text>
        }
        size="xs"
        padding="sm"
        closeButtonProps={{ "aria-label": "Close navigation menu" }}
      >
        <SideNav onNavigate={drawer.close} />
      </Drawer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
```

```tsx components/PageHeader.tsx
import { Box, Text, Title } from "@mantine/core";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <Box mb="lg">
      <Title order={1}>{title}</Title>
      {description && (
        <Text c="dimmed" mt={4}>
          {description}
        </Text>
      )}
    </Box>
  );
}
```

```tsx app/page.tsx
"use client";

import { Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export default function DashboardPage() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeCount = projects.filter((p) => p.status === "Active").length;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  const stats = [
    { label: "Open issues", value: String(totalIssues), hint: `across ${projects.length} projects` },
    { label: "Active projects", value: String(activeCount), hint: "currently in development" },
    { label: "Busiest project", value: busiest.key, hint: `${busiest.name}, ${busiest.issues} issues` },
    { label: "Last activity", value: formatDate(recent[0].updated), hint: recent[0].name },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} component="section" aria-label="Summary">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <Text size="xs" tt="uppercase" c="dimmed" fw={600}>
              {stat.label}
            </Text>
            <Text ff="heading" fz={28} fw={600} mt={4}>
              {stat.value}
            </Text>
            <Text size="sm" c="dimmed">
              {stat.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
      <Card component="section" aria-labelledby="recent-heading">
        <Title order={2} id="recent-heading" mb="sm">
          Recently updated
        </Title>
        <Stack gap="sm" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
          {recent.map((p) => (
            <li key={p.key}>
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Group gap="sm" wrap="nowrap" miw={0}>
                  <Text ff="monospace" fw={600} size="sm" w={44}>
                    {p.key}
                  </Text>
                  <Text truncate>{p.name}</Text>
                </Group>
                <Group gap="sm" wrap="nowrap">
                  <Text size="sm" c="dimmed" visibleFrom="xs">
                    {formatDate(p.updated)}
                  </Text>
                  <Badge color={statusColor[p.status]} variant="light">
                    {p.status}
                  </Badge>
                </Group>
              </Group>
            </li>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
```

```tsx components/ProjectsTable.tsx
"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Group, SegmentedControl, Table, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDate, projects, statusColor } from "@/lib/data";

const filters = ["All", "Active", "Paused", "Archived"];

export function ProjectsTable() {
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
    <Card>
      <Group justify="space-between" mb="md" gap="sm">
        <TextInput
          aria-label="Search projects"
          placeholder="Search by name or key"
          leftSection={<IconSearch size={16} aria-hidden />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          w={{ base: "100%", sm: 280 }}
        />
        <SegmentedControl
          aria-label="Filter by status"
          data={filters}
          value={status}
          onChange={setStatus}
          visibleFrom="sm"
        />
        <SegmentedControl
          aria-label="Filter by status"
          data={filters}
          value={status}
          onChange={setStatus}
          hiddenFrom="sm"
          fullWidth
        />
      </Group>
      <Table.ScrollContainer minWidth={520}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Caption>Projects in the Acme Labs workspace</Table.Caption>
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">Key</Table.Th>
              <Table.Th scope="col">Name</Table.Th>
              <Table.Th scope="col">Status</Table.Th>
              <Table.Th scope="col" ta="right">
                Issues
              </Table.Th>
              <Table.Th scope="col">Updated</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((p) => (
              <Table.Tr key={p.key}>
                <Table.Td ff="monospace" fw={600}>
                  {p.key}
                </Table.Td>
                <Table.Td>{p.name}</Table.Td>
                <Table.Td>
                  <Badge color={statusColor[p.status]} variant="light">
                    {p.status}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">{p.issues}</Table.Td>
                <Table.Td>{formatDate(p.updated)}</Table.Td>
              </Table.Tr>
            ))}
            {rows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" ta="center" py="md">
                    No projects match your filters.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Stack } from "@mantine/core";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsTable } from "@/components/ProjectsTable";

export default function ProjectsPage() {
  return (
    <Stack gap="lg">
      <PageHeader title="Projects" description="Every project in your workspace and where it stands." />
      <ProjectsTable />
    </Stack>
  );
}
```

```tsx app/reports/page.tsx
"use client";

import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { PageHeader } from "@/components/PageHeader";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <Stack gap="lg">
      <PageHeader title="Reports" description="Saved views of how your team is shipping." />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {reports.map((report) => (
          <Card key={report.title}>
            <Title order={2} size="h4" mb={4}>
              {report.title}
            </Title>
            <Text c="dimmed" size="sm">
              {report.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
```

```tsx app/settings/page.tsx
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
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/PageHeader";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      digest: true,
      mentions: true,
      releases: false,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Enter your full name" : null),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email address"),
    },
  });

  return (
    <Stack gap="lg">
      <PageHeader title="Settings" description="Manage your profile, notifications and appearance." />
      <form
        onSubmit={form.onSubmit(() =>
          notifications.show({
            title: "Settings saved",
            message: "Your changes have been applied.",
            color: "brand",
          }),
        )}
        noValidate
      >
        <Stack gap="md">
          <Card component="section" aria-labelledby="profile-heading">
            <Title order={2} id="profile-heading" size="h3" mb="sm">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Full name" {...form.getInputProps("name")} />
              <TextInput label="Email" type="email" {...form.getInputProps("email")} />
              <TextInput label="Role" value={user.role} disabled readOnly />
            </SimpleGrid>
          </Card>

          <Card component="section" aria-labelledby="notify-heading">
            <Title order={2} id="notify-heading" size="h3" mb="sm">
              Notifications
            </Title>
            <Stack gap="sm">
              <Switch
                label="Weekly digest"
                description="A Monday summary of issues opened and closed."
                {...form.getInputProps("digest", { type: "checkbox" })}
              />
              <Switch
                label="Mentions"
                description="Email me when someone mentions me on an issue."
                {...form.getInputProps("mentions", { type: "checkbox" })}
              />
              <Switch
                label="Release announcements"
                description="Product updates from the Lumen team."
                {...form.getInputProps("releases", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Card component="section" aria-labelledby="appearance-heading">
            <Title order={2} id="appearance-heading" size="h3" mb="sm">
              Appearance
            </Title>
            <Text size="sm" c="dimmed" mb="xs" id="scheme-label">
              Colour scheme
            </Text>
            <SegmentedControl
              aria-labelledby="scheme-label"
              value={colorScheme}
              onChange={(v) => setColorScheme(v as "light" | "dark" | "auto")}
              data={[
                { label: "Dark", value: "dark" },
                { label: "Light", value: "light" },
                { label: "System", value: "auto" },
              ]}
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
