```ts app/theme.ts
import { createTheme, rem } from "@mantine/core";
import type { MantineColorsTuple } from "@mantine/core";

// Lumen brand colour #DB2777 sits at shade 6 (the primary shade).
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

// Warm sand neutrals; replacing `gray` makes borders, dimmed text and defaults warm.
const sand: MantineColorsTuple = [
  "#faf7f2",
  "#f3eee6",
  "#e9e1d4",
  "#dcd0bd",
  "#c4b69d",
  "#a99a7e",
  "#7a6d58",
  "#5f5443",
  "#463d31",
  "#2f2923",
];

// Plain-object component defaults (no `.extend`) so the theme stays serialisable
// and can be imported from the server root layout.
export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 5 },
  colors: { brand, sand, gray: sand },
  black: "#2f2923",
  white: "#ffffff",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
    fontWeight: "700",
  },
  defaultRadius: "md",
  radius: { xs: rem(8), sm: rem(12), md: rem(16), lg: rem(20), xl: rem(28) },
  // Airy density: generous spacing.
  spacing: { xs: rem(12), sm: rem(16), md: rem(24), lg: rem(32), xl: rem(48) },
  components: {
    Button: { defaultProps: { size: "md", radius: "md" } },
    TextInput: { defaultProps: { size: "md", radius: "md" } },
    Select: { defaultProps: { size: "md", radius: "md" } },
    Switch: { defaultProps: { size: "lg" } },
    SegmentedControl: { defaultProps: { size: "md", radius: "md" } },
    Card: { defaultProps: { radius: "md", padding: "lg", withBorder: true } },
    Paper: { defaultProps: { radius: "md" } },
    Menu: { defaultProps: { radius: "md", shadow: "md" } },
    Badge: { defaultProps: { size: "lg", variant: "light" } },
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
  description: "Lumen: product analytics and issue tracking for small software teams.",
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
            <Notifications position="top-right" />
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

```ts components/nav-config.ts
import {
  IconChartBar,
  IconFolders,
  IconLayoutDashboard,
  IconReportAnalytics,
  IconSettings,
  IconStack2,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

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
      { label: "Reports", href: "/reports", icon: IconReportAnalytics },
    ],
  },
  {
    label: "Workspace",
    icon: IconStack2,
    items: [
      { label: "Projects", href: "/projects", icon: IconFolders },
      { label: "Settings", href: "/settings", icon: IconSettings },
    ],
  },
];

export function findCrumbs(pathname: string): { group: string; label: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, label: item.label };
    }
  }
  return null;
}
```

```tsx components/NavList.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { navGroups } from "./nav-config";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <Stack gap="xs" align="center">
        {navGroups.map((group, index) => (
          <Stack key={group.label} gap="xs" align="center" w="100%">
            {index > 0 && <Divider w="60%" />}
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Tooltip key={item.href} label={item.label} position="right" withArrow>
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size={48}
                    radius="md"
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "gray"}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <item.icon size={24} stroke={1.8} aria-hidden />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Stack>
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
          leftSection={<group.icon size={22} stroke={1.8} aria-hidden />}
          defaultOpened
          childrenOffset={24}
          py="sm"
          fw={600}
        >
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.8} aria-hidden />}
                active={active}
                variant="filled"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                py="sm"
                mb={4}
              />
            );
          })}
        </NavLink>
      ))}
    </Stack>
  );
}
```

```tsx components/AppFrame.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
  ScrollArea,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconSparkles } from "@tabler/icons-react";
import { initials, user } from "@/lib/data";
import { NavList } from "./NavList";
import { findCrumbs } from "./nav-config";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, drawer] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const isDesktop = useMediaQuery("(min-width: 48em)");
  const crumbs = findCrumbs(pathname);

  useEffect(() => {
    drawer.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (isDesktop) drawer.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  const navbarWidth = collapsed ? 96 : 300;

  return (
    <AppShell
      header={{ height: 76 }}
      navbar={{ width: navbarWidth, breakpoint: "sm", collapsed: { mobile: true } }}
      padding={{ base: "md", sm: "xl" }}
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: "sm", sm: "md" }} gap="sm" wrap="nowrap">
          <Burger
            opened={drawerOpen}
            onClick={drawer.toggle}
            hiddenFrom="sm"
            size="md"
            aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          />
          <Link href="/" aria-label="Lumen home" style={{ textDecoration: "none", color: "inherit" }}>
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={44} radius="md" variant="filled" color="brand">
                <IconSparkles size={26} aria-hidden />
              </ThemeIcon>
              <Title order={3} visibleFrom="sm">
                Lumen
              </Title>
            </Group>
          </Link>
          <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} withArrow>
            <ActionIcon
              visibleFrom="sm"
              variant="subtle"
              color="gray"
              size={44}
              radius="md"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <IconLayoutSidebarLeftExpand size={24} aria-hidden />
              ) : (
                <IconLayoutSidebarLeftCollapse size={24} aria-hidden />
              )}
            </ActionIcon>
          </Tooltip>
          <Box style={{ minWidth: 0, flex: 1 }}>
            {crumbs && (
              <Breadcrumbs separator="/" aria-label="Breadcrumb" style={{ flexWrap: "nowrap" }}>
                <Anchor component={Link} href="/" size="md">
                  Lumen
                </Anchor>
                <Text size="md" c="dimmed">
                  {crumbs.group}
                </Text>
                <Text size="md" fw={600} aria-current="page">
                  {crumbs.label}
                </Text>
              </Breadcrumbs>
            )}
          </Box>
          <Group gap="sm" wrap="nowrap">
            <Box visibleFrom="md" ta="right">
              <Text size="sm" fw={600} lh={1.2}>
                {user.name}
              </Text>
              <Text size="xs" c="dimmed">
                {user.role}
              </Text>
            </Box>
            <Avatar color="brand" radius="xl" size={44} aria-label={user.name}>
              {initials(user.name)}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" aria-label="Main navigation">
        <AppShell.Section grow component={ScrollArea}>
          <NavList collapsed={collapsed} />
        </AppShell.Section>
        <AppShell.Section pt="md">
          {collapsed ? (
            <Group justify="center">
              <Avatar color="brand" radius="xl" size={44} aria-label={user.name}>
                {initials(user.name)}
              </Avatar>
            </Group>
          ) : (
            <Group gap="sm" wrap="nowrap">
              <Avatar color="brand" radius="xl" size={44}>
                {initials(user.name)}
              </Avatar>
              <Box style={{ minWidth: 0 }}>
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
        opened={drawerOpen}
        onClose={drawer.close}
        title="Navigation"
        size="min(320px, 85vw)"
        padding="md"
      >
        <nav aria-label="Main navigation">
          <NavList onNavigate={drawer.close} />
        </nav>
      </Drawer>

      <AppShell.Main bg="var(--mantine-color-sand-0)" id="main-content">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
```

```tsx components/PageHeading.tsx
import { Stack, Text, Title } from "@mantine/core";

export function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <Stack gap={4} mb="lg">
      <Title order={1} fz={{ base: 28, sm: 34 }}>
        {title}
      </Title>
      {description && (
        <Text c="dimmed" size="lg">
          {description}
        </Text>
      )}
    </Stack>
  );
}
```

```tsx components/SummaryCard.tsx
import type { ReactNode } from "react";
import { Card, Group, Text, ThemeIcon } from "@mantine/core";

interface SummaryCardProps {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}

export function SummaryCard({ label, value, hint, icon }: SummaryCardProps) {
  return (
    <Card>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="sm" c="dimmed" fw={600}>
            {label}
          </Text>
          <Text fz={36} fw={700} lh={1.2} mt={4} ff="heading">
            {value}
          </Text>
        </div>
        <ThemeIcon size={48} radius="md" variant="light" color="brand" aria-hidden>
          {icon}
        </ThemeIcon>
      </Group>
      <Text size="sm" c="dimmed" mt="sm">
        {hint}
      </Text>
    </Card>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Anchor, Badge, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconBug, IconCircleCheck, IconClockPause, IconFolders } from "@tabler/icons-react";
import { PageHeading } from "@/components/PageHeading";
import { SummaryCard } from "@/components/SummaryCard";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  const firstName = user.name.split(" ")[0];
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <>
      <PageHeading
        title={`Welcome back, ${firstName}!`}
        description="Here is how your team is doing across all projects today."
      />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <SummaryCard
          label="Open issues"
          value={String(openIssues)}
          hint="Across every project"
          icon={<IconBug size={26} />}
        />
        <SummaryCard
          label="Active projects"
          value={String(active)}
          hint="Shipping right now"
          icon={<IconCircleCheck size={26} />}
        />
        <SummaryCard
          label="Paused"
          value={String(paused)}
          hint="Waiting for a restart"
          icon={<IconClockPause size={26} />}
        />
        <SummaryCard
          label="Projects"
          value={String(projects.length)}
          hint="Including archived"
          icon={<IconFolders size={26} />}
        />
      </SimpleGrid>

      <Card mt="lg">
        <Group justify="space-between" mb="md">
          <Title order={2} fz={22}>
            Recently updated
          </Title>
          <Anchor component={Link} href="/projects" fw={600}>
            View all projects
          </Anchor>
        </Group>
        <Stack gap="md">
          {recent.map((project) => (
            <Group key={project.key} justify="space-between" wrap="wrap" gap="sm">
              <div>
                <Text fw={600}>
                  {project.name}{" "}
                  <Text span c="dimmed" fw={500}>
                    {project.key}
                  </Text>
                </Text>
                <Text size="sm" c="dimmed">
                  Updated {formatDate(project.updated)} · {project.issues} open issues
                </Text>
              </div>
              <Badge color={statusColor[project.status]}>{project.status}</Badge>
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
      <PageHeading title="Projects" description="Every project your team tracks in Lumen." />
      <Card>
        <Group justify="space-between" mb="lg" gap="md">
          <TextInput
            placeholder="Search by name or key"
            aria-label="Search projects"
            leftSection={<IconSearch size={18} aria-hidden />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 240px", maxWidth: 380 }}
          />
          <SegmentedControl
            data={filters}
            value={status}
            onChange={setStatus}
            aria-label="Filter by status"
          />
        </Group>
        <Table.ScrollContainer minWidth={560}>
          <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Key</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="right">Open issues</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visible.map((project) => (
                <Table.Tr key={project.key}>
                  <Table.Td fw={600}>{project.key}</Table.Td>
                  <Table.Td>{project.name}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColor[project.status]}>{project.status}</Badge>
                  </Table.Td>
                  <Table.Td ta="right">{project.issues}</Table.Td>
                  <Table.Td>{formatDate(project.updated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {visible.length === 0 && (
          <Text ta="center" c="dimmed" py="xl" role="status">
            No projects match your search. Try a different name or status.
          </Text>
        )}
      </Card>
    </>
  );
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { Card, Group, Progress, Stack, Text, Title } from "@mantine/core";
import { PageHeading } from "@/components/PageHeading";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <>
      <PageHeading title="Reports" description="Where open issues are piling up." />
      <Card>
        <Title order={2} fz={22} mb="md">
          Open issues by project
        </Title>
        <Stack gap="lg">
          {projects.map((project) => {
            const share = total === 0 ? 0 : Math.round((project.issues / total) * 100);
            return (
              <div key={project.key}>
                <Group justify="space-between" mb={6}>
                  <Text fw={600}>{project.name}</Text>
                  <Text c="dimmed" size="sm">
                    {project.issues} issues · {share}%
                  </Text>
                </Group>
                <Progress value={share} size="lg" aria-label={`${project.name}: ${share}% of open issues`} />
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

import { Button, Card, Group, SegmentedControl, Select, SimpleGrid, Stack, Switch, Text, TextInput, Title, useMantineColorScheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { PageHeading } from "@/components/PageHeading";
import { user } from "@/lib/data";

export default function Page() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      weeklyDigest: true,
      issueAssigned: true,
      productNews: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Please enter your name" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
    },
  });

  const save = form.onSubmit(() => {
    notifications.show({
      title: "Settings saved",
      message: "Your changes are live. Nice one!",
      color: "teal",
      icon: <IconCheck size={18} aria-hidden />,
    });
    form.resetDirty();
  });

  return (
    <>
      <PageHeading title="Settings" description="Your profile, notifications and appearance." />
      <form onSubmit={save} noValidate>
        <Stack gap="lg" maw={760}>
          <Card>
            <Title order={2} fz={22} mb="md">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label="Full name" autoComplete="name" {...form.getInputProps("name")} />
              <TextInput label="Email" type="email" autoComplete="email" {...form.getInputProps("email")} />
              <Select
                label="Role"
                data={["Owner", "Admin", "Member"]}
                allowDeselect={false}
                {...form.getInputProps("role")}
              />
            </SimpleGrid>
          </Card>

          <Card>
            <Title order={2} fz={22} mb="md">
              Notifications
            </Title>
            <Stack gap="md">
              <Switch
                label="Weekly digest"
                description="A Monday summary of what moved across your projects."
                {...form.getInputProps("weeklyDigest", { type: "checkbox" })}
              />
              <Switch
                label="Issue assigned to me"
                description="Hear about it the moment a teammate hands you an issue."
                {...form.getInputProps("issueAssigned", { type: "checkbox" })}
              />
              <Switch
                label="Product news"
                description="Occasional updates about new Lumen features."
                {...form.getInputProps("productNews", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Card>
            <Title order={2} fz={22} mb="xs">
              Appearance
            </Title>
            <Text c="dimmed" mb="md">
              Choose how Lumen looks for you.
            </Text>
            <SegmentedControl
              aria-label="Colour scheme"
              value={colorScheme}
              onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
              data={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System", value: "auto" },
              ]}
            />
          </Card>

          <Group justify="flex-end">
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
