```ts app/theme.ts
import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Lumen brand: #E8590C sits at shade 6, the primary shade in both colour schemes.
const brand: MantineColorsTuple = [
  "#fff4ec",
  "#ffe3d1",
  "#ffc7a1",
  "#fda66b",
  "#f58340",
  "#ee6c22",
  "#E8590C",
  "#c94a08",
  "#a63d07",
  "#823006",
];

// Warm stone neutrals. `dark` drives the dark surfaces (body is dark[7], text is dark[0]).
const stoneDark: MantineColorsTuple = [
  "#e7e5e4",
  "#c7c3c0",
  "#a8a29e",
  "#8a847f",
  "#6b6560",
  "#4a4541",
  "#383431",
  "#2a2725",
  "#201e1c",
  "#161412",
];

const stoneGray: MantineColorsTuple = [
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
const sans = "ui-sans-serif, system-ui, sans-serif";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 6 },
  colors: { brand, dark: stoneDark, gray: stoneGray },
  autoContrast: true,
  luminanceThreshold: 0.22,
  fontFamily: sans,
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
    Button: { defaultProps: { fw: 600 } },
    Card: { defaultProps: { withBorder: true, padding: "md" } },
    Paper: { defaultProps: { withBorder: true } },
    Badge: { defaultProps: { variant: "light" } },
    NavLink: { defaultProps: { variant: "light", color: "brand" } },
    Table: { defaultProps: { highlightOnHover: true, verticalSpacing: "sm" } },
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
  title: "Lumen",
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
  Active: "teal",
  Paused: "yellow",
  Archived: "gray",
};

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Deterministic date formatting (same output on server and client). */
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
  IconChartLine,
  IconFolders,
  IconGauge,
  IconReportAnalytics,
  IconSettings,
} from "@tabler/icons-react";

export type NavIcon = typeof IconGauge;

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
    icon: IconChartLine,
    items: [
      { label: "Overview", href: "/", icon: IconGauge },
      { label: "Reports", href: "/reports", icon: IconReportAnalytics },
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
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function getCrumbs(pathname: string): { group: string; page: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group: group.label, page: item.label };
    }
  }
  return { group: "Lumen", page: "Not found" };
}
```

```tsx components/NavList.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { isActive, navGroups } from "@/lib/nav";

interface NavListProps {
  /** Icons only (desktop sidebar collapsed). */
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <Stack gap="xs" align="center" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
        {navGroups.map((group, index) => (
          <li key={group.label} style={{ display: "contents" }}>
            {index > 0 && <Divider w="60%" my={4} aria-hidden />}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Tooltip key={item.href} label={`${group.label}: ${item.label}`} position="right" withArrow>
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size="lg"
                    variant={active ? "light" : "subtle"}
                    color={active ? "brand" : "gray"}
                    aria-label={`${group.label}: ${item.label}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <Icon size={20} stroke={1.75} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </li>
        ))}
      </Stack>
    );
  }

  return (
    <nav aria-label="Main">
      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <NavLink
            key={group.label}
            label={group.label}
            leftSection={<GroupIcon size={18} stroke={1.75} />}
            childrenOffset={16}
            defaultOpened
            fw={600}
          >
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<Icon size={16} stroke={1.75} />}
                  active={active}
                  aria-current={active ? "page" : undefined}
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
```

```tsx components/AppFrame.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Drawer,
  Group,
  Menu,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconTerminal2,
} from "@tabler/icons-react";
import { initials, user } from "@/lib/data";
import { getCrumbs } from "@/lib/nav";
import { NavList } from "./NavList";

function Logo() {
  return (
    <UnstyledButton component={Link} href="/" aria-label="Lumen home">
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size={28} variant="filled" color="brand">
          <IconTerminal2 size={18} stroke={2} />
        </ThemeIcon>
        <Text ff="monospace" fw={700} size="lg" visibleFrom="sm">
          Lumen
        </Text>
      </Group>
    </UnstyledButton>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);
  const { toggleColorScheme } = useMantineColorScheme();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const isDesktop = useMediaQuery("(min-width: 48em)");

  return (
    <>
      <AppShell
        padding="md"
        header={{ height: 56 }}
        navbar={{
          width: collapsed ? 68 : 260,
          breakpoint: "sm",
          collapsed: { mobile: true },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" gap="sm" wrap="nowrap" justify="space-between">
            <Group gap="sm" wrap="nowrap" miw={0} style={{ flex: 1 }}>
              <Burger
                opened={drawerOpened}
                onClick={openDrawer}
                hiddenFrom="sm"
                size="sm"
                aria-label="Open navigation menu"
              />
              <Logo />
              <ActionIcon
                variant="subtle"
                color="gray"
                visibleFrom="sm"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar to icons"}
                aria-expanded={!collapsed}
                aria-controls="app-sidebar"
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={20} stroke={1.75} />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={20} stroke={1.75} />
                )}
              </ActionIcon>
              <nav aria-label="Breadcrumb" style={{ minWidth: 0 }}>
                <Breadcrumbs separator="/" separatorMargin="xs" style={{ flexWrap: "nowrap" }}>
                  <Text size="sm" c="dimmed" truncate>
                    {crumbs.group}
                  </Text>
                  <Text size="sm" fw={600} truncate aria-current="page">
                    {crumbs.page}
                  </Text>
                </Breadcrumbs>
              </nav>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => toggleColorScheme()}
                aria-label="Toggle light and dark theme"
              >
                <Box component="span" lightHidden display="flex">
                  <IconSun size={18} stroke={1.75} />
                </Box>
                <Box component="span" darkHidden display="flex">
                  <IconMoon size={18} stroke={1.75} />
                </Box>
              </ActionIcon>
              <Menu position="bottom-end" width={240} withArrow>
                <Menu.Target>
                  <UnstyledButton aria-label={`Account menu for ${user.name}`}>
                    <Group gap="xs" wrap="nowrap">
                      <Avatar color="brand" size="md">
                        {initials(user.name)}
                      </Avatar>
                      <Box visibleFrom="md">
                        <Text size="sm" fw={600} lh={1.2}>
                          {user.name}
                        </Text>
                        <Text size="xs" c="dimmed" lh={1.2}>
                          {user.role}
                        </Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{user.email}</Menu.Label>
                  <Menu.Item component={Link} href="/settings" leftSection={<IconSettings size={16} />}>
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconLogout size={16} />}>
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar id="app-sidebar" p="xs" aria-label="Sidebar">
          <AppShell.Section grow style={{ overflowY: "auto" }} pt="xs">
            <NavList collapsed={collapsed} />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main id="main">{children}</AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened && !isDesktop}
        onClose={closeDrawer}
        size={280}
        padding="md"
        title={
          <Text ff="monospace" fw={700} size="lg">
            Lumen
          </Text>
        }
        closeButtonProps={{ "aria-label": "Close navigation menu" }}
      >
        <NavList onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
```

```tsx components/PageHeading.tsx
"use client";

import { Stack, Text, Title } from "@mantine/core";

export function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <Stack gap={4} mb="lg">
      <Title order={1}>{title}</Title>
      {description && (
        <Text c="dimmed" maw={640}>
          {description}
        </Text>
      )}
    </Stack>
  );
}
```

```tsx app/page.tsx
"use client";

import Link from "next/link";
import { Anchor, Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { PageHeading } from "@/components/PageHeading";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  const stats = [
    { label: "Open issues", value: openIssues, hint: "across all projects" },
    { label: "Active projects", value: active, hint: `of ${projects.length} in the workspace` },
    { label: "Paused projects", value: paused, hint: "waiting on a restart" },
    { label: "Latest update", value: formatDate(recent[0].updated), hint: recent[0].name },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your team's projects stand today."
      />

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md" component="section" aria-label="Summary">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <Text size="xs" tt="uppercase" fw={600} c="dimmed" ff="monospace" style={{ letterSpacing: "0.04em" }}>
              {stat.label}
            </Text>
            <Text ff="monospace" fw={700} fz={{ base: 28, sm: 30 }} mt={4}>
              {stat.value}
            </Text>
            <Text size="sm" c="dimmed">
              {stat.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card mt="md" component="section" aria-labelledby="recent-heading">
        <Group justify="space-between" mb="sm">
          <Title order={2} id="recent-heading">
            Recently updated
          </Title>
          <Anchor component={Link} href="/projects" size="sm">
            View all projects
          </Anchor>
        </Group>
        <Stack gap="sm" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
          {recent.map((project) => (
            <Group key={project.key} component="li" justify="space-between" wrap="nowrap" gap="sm">
              <Group gap="sm" wrap="nowrap" miw={0}>
                <Text ff="monospace" fw={600} size="sm" w={44}>
                  {project.key}
                </Text>
                <Text truncate>{project.name}</Text>
              </Group>
              <Group gap="sm" wrap="nowrap">
                <Badge color={statusColor[project.status]} visibleFrom="xs">
                  {project.status}
                </Badge>
                <Text size="sm" c="dimmed" component="time" dateTime={project.updated}>
                  {formatDate(project.updated)}
                </Text>
              </Group>
            </Group>
          ))}
        </Stack>
      </Card>
    </>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Group, SegmentedControl, Table, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { PageHeading } from "@/components/PageHeading";
import { formatDate, projects, statusColor } from "@/lib/data";

const filters = ["All", "Active", "Paused", "Archived"];

export default function Page() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)),
    );
  }, [query, status]);

  return (
    <>
      <PageHeading title="Projects" description="Every project in the Acme Labs workspace, with its open issue count." />

      <Group mb="md" gap="md" align="flex-end">
        <TextInput
          label="Search projects"
          placeholder="Name or key"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          style={{ flex: "1 1 220px", maxWidth: 360 }}
        />
        <SegmentedControl
          aria-label="Filter by status"
          data={filters}
          value={status}
          onChange={setStatus}
        />
      </Group>

      <Card p={0}>
        <Table.ScrollContainer minWidth={560}>
          <Table>
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
              {visible.map((project) => (
                <Table.Tr key={project.key}>
                  <Table.Td ff="monospace" fw={600}>
                    {project.key}
                  </Table.Td>
                  <Table.Td>{project.name}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColor[project.status]}>{project.status}</Badge>
                  </Table.Td>
                  <Table.Td ta="right" ff="monospace">
                    {project.issues}
                  </Table.Td>
                  <Table.Td>
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {visible.length === 0 && (
          <Text c="dimmed" ta="center" py="lg" role="status">
            No projects match your filters.
          </Text>
        )}
      </Card>
    </>
  );
}
```

```tsx app/reports/page.tsx
"use client";

import { Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { PageHeading } from "@/components/PageHeading";
import { projects } from "@/lib/data";

export default function Page() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  const ranked = [...projects].sort((a, b) => b.issues - a.issues);

  return (
    <>
      <PageHeading
        title="Reports"
        description="Where open issues are concentrated, so you can decide where to spend the next sprint."
      />
      <Card component="section" aria-labelledby="share-heading">
        <Title order={2} id="share-heading" mb="md">
          Open issues by project
        </Title>
        <Stack gap="md">
          {ranked.map((project) => {
            const share = total === 0 ? 0 : Math.round((project.issues / total) * 100);
            return (
              <div key={project.key}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">
                    <Text span ff="monospace" fw={600}>
                      {project.key}
                    </Text>{" "}
                    {project.name}
                  </Text>
                  <Text size="sm" c="dimmed" ff="monospace">
                    {project.issues} ({share}%)
                  </Text>
                </Group>
                <Progress value={share} aria-label={`${project.name}: ${share}% of open issues`} />
              </div>
            );
          })}
        </Stack>
      </Card>
    </>
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
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PageHeading } from "@/components/PageHeading";
import { user } from "@/lib/data";

interface SettingsValues {
  name: string;
  email: string;
  digest: string;
  issueAlerts: boolean;
  weeklyReport: boolean;
}

const initialValues: SettingsValues = {
  name: user.name,
  email: user.email,
  digest: "daily",
  issueAlerts: true,
  weeklyReport: false,
};

export default function Page() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const form = useForm<SettingsValues>({
    mode: "uncontrolled",
    initialValues,
    validate: {
      name: (value) => (value.trim().length < 2 ? "Enter your full name" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
    },
  });

  const save = form.onSubmit(() => {
    notifications.show({
      title: "Settings saved",
      message: "Your profile and notification preferences are up to date.",
      color: "teal",
    });
  });

  return (
    <>
      <PageHeading title="Settings" description="Your profile, notifications and appearance." />
      <Stack gap="md" maw={640}>
        <form onSubmit={save} noValidate>
          <Stack gap="md">
            <Card component="section" aria-labelledby="profile-heading">
              <Title order={2} id="profile-heading" mb="sm">
                Profile
              </Title>
              <Stack gap="sm">
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
                <Text size="sm" c="dimmed">
                  Role: {user.role}
                </Text>
              </Stack>
            </Card>

            <Card component="section" aria-labelledby="notify-heading">
              <Title order={2} id="notify-heading" mb="sm">
                Notifications
              </Title>
              <Stack gap="sm">
                <Select
                  label="Email digest"
                  allowDeselect={false}
                  data={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "off", label: "Off" },
                  ]}
                  key={form.key("digest")}
                  {...form.getInputProps("digest")}
                />
                <Switch
                  label="Alert me when an issue is assigned to me"
                  key={form.key("issueAlerts")}
                  {...form.getInputProps("issueAlerts", { type: "checkbox" })}
                />
                <Switch
                  label="Send the weekly analytics report"
                  key={form.key("weeklyReport")}
                  {...form.getInputProps("weeklyReport", { type: "checkbox" })}
                />
              </Stack>
            </Card>

            <Group>
              <Button type="submit">Save changes</Button>
              <Button type="button" variant="default" onClick={() => form.reset()}>
                Reset
              </Button>
            </Group>
          </Stack>
        </form>

        <Card component="section" aria-labelledby="appearance-heading">
          <Title order={2} id="appearance-heading" mb="sm">
            Appearance
          </Title>
          <SegmentedControl
            aria-label="Colour scheme"
            value={colorScheme}
            onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
            data={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "auto", label: "System" },
            ]}
          />
        </Card>
      </Stack>
    </>
  );
}
```
