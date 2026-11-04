The failure is in `app/page.tsx`, a server component that renders `<Text component={Link} …>`. Passing the `Link` function as a prop from a server component to a Mantine client component can't be serialized. The fix is to move the dashboard body into a client component, so the `component={Link}` usage happens client-side. The dashboard page itself becomes a thin server wrapper that renders `AppFrame` around that client component.

I'll also double-check the other server pages. `projects`, `reports` and `settings` pass no functions as props to Mantine components, so they stay as they are.

```ts lib/data.ts
export const product = {
  name: "Lumen",
  tagline:
    "Product analytics and issue tracking for small software teams",
};

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

export const user: User = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

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

export const statusColor: Record<ProjectStatus, string> = {
  Active: "teal",
  Paused: "yellow",
  Archived: "gray",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}
```

```ts lib/navigation.ts
import type { ComponentType } from "react";
import {
  IconChartBar,
  IconFileAnalytics,
  IconFolders,
  IconSettings,
  IconChartDots3,
  IconBriefcase,
} from "@tabler/icons-react";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; stroke?: number }>;
}

export interface NavGroup {
  label: string;
  icon: ComponentType<{ size?: number; stroke?: number }>;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    icon: IconChartDots3,
    items: [
      { label: "Overview", href: "/", icon: IconChartBar },
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

/** Breadcrumb trail for a pathname, derived from the navigation groups. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return [
          { label: "Lumen", href: "/" },
          { label: group.label },
          { label: item.label },
        ];
      }
    }
  }
  return [{ label: "Lumen", href: "/" }];
}

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
```

```tsx components/NavContent.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, Stack, Tooltip, UnstyledButton, Divider } from "@mantine/core";
import { isActive, navGroups } from "@/lib/navigation";
import classes from "./NavContent.module.css";

interface NavContentProps {
  /** Icon-only rail (desktop collapsed state). */
  collapsed?: boolean;
  /** Called after a link is followed, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

export function NavContent({ collapsed = false, onNavigate }: NavContentProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <nav aria-label="Primary">
        <Stack gap={4} align="center">
          {navGroups.map((group, index) => (
            <Stack
              key={group.label}
              gap={4}
              align="center"
              component="ul"
              className={classes.list}
              aria-label={group.label}
            >
              {index > 0 && (
                <li aria-hidden>
                  <Divider w={24} my={4} />
                </li>
              )}
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Tooltip
                      label={`${group.label} · ${item.label}`}
                      position="right"
                      events={{ hover: true, focus: true, touch: true }}
                    >
                      <UnstyledButton
                        component={Link}
                        href={item.href}
                        className={classes.iconLink}
                        data-active={active || undefined}
                        aria-label={item.label}
                        aria-current={active ? "page" : undefined}
                        onClick={onNavigate}
                      >
                        <item.icon size={20} stroke={1.6} />
                      </UnstyledButton>
                    </Tooltip>
                  </li>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </nav>
    );
  }

  return (
    <nav aria-label="Primary">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={18} stroke={1.6} />}
          childrenOffset={16}
          defaultOpened
          variant="subtle"
          fw={600}
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={18} stroke={1.6} />}
                active={active}
                aria-current={active ? "page" : undefined}
                variant="light"
                fw={500}
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

```css components/NavContent.module.css
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.list li {
  display: flex;
  justify-content: center;
  width: 100%;
}

.iconLink {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--mantine-radius-md);
  color: var(--mantine-color-text);

  @mixin hover {
    background-color: var(--mantine-color-default-hover);
  }

  &[data-active] {
    background-color: var(--mantine-primary-color-light);
    color: var(--mantine-primary-color-light-color);
  }
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
  ScrollArea,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSparkles,
} from "@tabler/icons-react";
import { getBreadcrumbs } from "@/lib/navigation";
import { user } from "@/lib/data";
import { NavContent } from "./NavContent";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Anchor
      component={Link}
      href="/"
      underline="never"
      c="inherit"
      aria-label="Lumen home"
    >
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon
          size={32}
          radius="md"
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          <IconSparkles size={18} />
        </ThemeIcon>
        {!compact && (
          <Text fw={700} size="lg">
            Lumen
          </Text>
        )}
      </Group>
    </Anchor>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);

  const crumbs = getBreadcrumbs(pathname);
  const crumbItems = crumbs.map((crumb, index) => {
    const last = index === crumbs.length - 1;
    if (last) {
      return (
        <Text key={crumb.label} size="sm" fw={600} aria-current="page">
          {crumb.label}
        </Text>
      );
    }
    return crumb.href ? (
      <Anchor
        key={crumb.label}
        component={Link}
        href={crumb.href}
        size="sm"
        c="dimmed"
      >
        {crumb.label}
      </Anchor>
    ) : (
      <Text key={crumb.label} size="sm" c="dimmed">
        {crumb.label}
      </Text>
    );
  });

  return (
    <>
      <AppShell
        padding={{ base: "md", sm: "xl" }}
        header={{ height: 60 }}
        navbar={{
          width: collapsed ? 72 : 260,
          breakpoint: "sm",
          collapsed: { mobile: true },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" miw={0}>
              <Burger
                opened={drawerOpened}
                onClick={toggleDrawer}
                hiddenFrom="sm"
                size="sm"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpened}
              />
              <Box hiddenFrom="sm">
                <Brand compact />
              </Box>
              <Breadcrumbs
                separator="/"
                separatorMargin={6}
                aria-label="Breadcrumb"
                style={{ flexWrap: "nowrap", overflow: "hidden" }}
              >
                {crumbItems}
              </Breadcrumbs>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <Box visibleFrom="xs" ta="right">
                <Text size="sm" fw={600} lh={1.2}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {user.role}
                </Text>
              </Box>
              <Avatar color="indigo" radius="xl" size={36} aria-label={user.name}>
                {initials(user.name)}
              </Avatar>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="sm" aria-label="Sidebar">
          <AppShell.Section>
            <Group
              justify={collapsed ? "center" : "space-between"}
              wrap="nowrap"
              mb="sm"
              px={collapsed ? 0 : "xs"}
              h={36}
            >
              <Brand compact={collapsed} />
            </Group>
          </AppShell.Section>
          <AppShell.Section grow component={ScrollArea}>
            <NavContent collapsed={collapsed} />
          </AppShell.Section>
          <AppShell.Section>
            <Group justify={collapsed ? "center" : "flex-end"} pt="sm">
              <Tooltip
                label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                position="right"
                events={{ hover: true, focus: true, touch: true }}
              >
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={toggleCollapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  aria-pressed={collapsed}
                >
                  {collapsed ? (
                    <IconLayoutSidebarLeftExpand size={20} />
                  ) : (
                    <IconLayoutSidebarLeftCollapse size={20} />
                  )}
                </ActionIcon>
              </Tooltip>
            </Group>
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Lumen navigation"
        size="xs"
        hiddenFrom="sm"
        closeButtonProps={{ "aria-label": "Close navigation menu" }}
      >
        <NavContent onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
```

```tsx components/DashboardContent.tsx
"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBug,
  IconFolders,
  IconPlayerPause,
  IconUsers,
} from "@tabler/icons-react";
import { formatDate, projects, statusColor, user } from "@/lib/data";

export function DashboardContent() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  const cards = [
    {
      label: "Active projects",
      value: active,
      hint: `${projects.length} projects in total`,
      icon: IconFolders,
      color: "teal",
    },
    {
      label: "Open issues",
      value: openIssues,
      hint: "Across all projects",
      icon: IconBug,
      color: "indigo",
    },
    {
      label: "Paused projects",
      value: paused,
      hint: "Mobile beta is on hold",
      icon: IconPlayerPause,
      color: "yellow",
    },
    {
      label: "Team members",
      value: 6,
      hint: "You are the workspace owner",
      icon: IconUsers,
      color: "cyan",
    },
  ];

  return (
    <Stack gap="xl">
      <div>
        <Title order={1} size="h2">
          Welcome back, {user.name.split(" ")[0]}
        </Title>
        <Text c="dimmed" mt={4}>
          Here is where things stand across your workspace today.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
        {cards.map((card) => (
          <Card key={card.label} withBorder padding="lg" radius="md">
            <Group justify="space-between" wrap="nowrap" align="flex-start">
              <div>
                <Text size="sm" c="dimmed">
                  {card.label}
                </Text>
                <Text fz={32} fw={700} lh={1.2} mt={4}>
                  {card.value}
                </Text>
              </div>
              <ThemeIcon
                variant="light"
                color={card.color}
                size={40}
                radius="md"
              >
                <card.icon size={22} aria-hidden />
              </ThemeIcon>
            </Group>
            <Text size="xs" c="dimmed" mt="sm">
              {card.hint}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={2} size="h4">
            Recently updated
          </Title>
          <Anchor component={Link} href="/projects" size="sm">
            View all projects
          </Anchor>
        </Group>
        <Stack
          gap="sm"
          component="ul"
          m={0}
          p={0}
          style={{ listStyle: "none" }}
        >
          {recent.map((project) => (
            <li key={project.key}>
              <Group justify="space-between" wrap="nowrap">
                <div>
                  <Text fw={600}>
                    {project.name}{" "}
                    <Text span c="dimmed" size="sm">
                      ({project.key})
                    </Text>
                  </Text>
                  <Text size="sm" c="dimmed">
                    Updated {formatDate(project.updated)} · {project.issues}{" "}
                    open issues
                  </Text>
                </div>
                <Badge color={statusColor[project.status]} variant="light">
                  {project.status}
                </Badge>
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

import { Badge, Card, Table, Text } from "@mantine/core";
import { formatDate, projects, statusColor } from "@/lib/data";

export function ProjectsTable() {
  return (
    <Card withBorder padding={0} radius="md">
      <Table.ScrollContainer minWidth={560}>
        <Table
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          tabularNums
        >
          <Table.Caption>Projects and their open issue counts</Table.Caption>
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">Key</Table.Th>
              <Table.Th scope="col">Name</Table.Th>
              <Table.Th scope="col">Status</Table.Th>
              <Table.Th scope="col" ta="right">
                Open issues
              </Table.Th>
              <Table.Th scope="col">Last updated</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {projects.map((project) => (
              <Table.Tr key={project.key}>
                <Table.Td>
                  <Text ff="monospace" fw={600} size="sm">
                    {project.key}
                  </Text>
                </Table.Td>
                <Table.Td>{project.name}</Table.Td>
                <Table.Td>
                  <Badge color={statusColor[project.status]} variant="light">
                    {project.status}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">{project.issues}</Table.Td>
                <Table.Td>
                  <time dateTime={project.updated}>
                    {formatDate(project.updated)}
                  </time>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import {
  Button,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";

interface SettingsValues {
  name: string;
  email: string;
  digest: string;
  issueAlerts: boolean;
  weeklyReport: boolean;
  productUpdates: boolean;
}

export function SettingsForm() {
  const form = useForm<SettingsValues>({
    mode: "controlled",
    initialValues: {
      name: user.name,
      email: user.email,
      digest: "weekly",
      issueAlerts: true,
      weeklyReport: true,
      productUpdates: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Enter your full name" : null),
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address",
    },
  });

  const handleSubmit = form.onSubmit(() => {
    notifications.show({
      title: "Settings saved",
      message: "Your preferences have been updated.",
      color: "teal",
    });
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="lg" maw={640}>
        <Card withBorder padding="lg" radius="md">
          <Title order={2} size="h4">
            Profile
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Your role in this workspace is {user.role}.
          </Text>
          <Stack gap="md">
            <TextInput
              label="Full name"
              autoComplete="name"
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              {...form.getInputProps("email")}
            />
          </Stack>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Title order={2} size="h4">
            Notifications
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Choose what lands in your inbox.
          </Text>
          <Stack gap="md">
            <Select
              label="Email digest"
              allowDeselect={false}
              data={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "never", label: "Never" },
              ]}
              {...form.getInputProps("digest")}
            />
            <Divider />
            <Switch
              label="Issue alerts"
              description="Get notified when an issue is assigned to you."
              {...form.getInputProps("issueAlerts", { type: "checkbox" })}
            />
            <Switch
              label="Weekly analytics report"
              description="A summary of traffic and conversion for each project."
              {...form.getInputProps("weeklyReport", { type: "checkbox" })}
            />
            <Switch
              label="Product updates"
              description="News about new Lumen features."
              {...form.getInputProps("productUpdates", { type: "checkbox" })}
            />
          </Stack>
        </Card>

        <Group justify="flex-end">
          <Button type="button" variant="default" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </Group>
      </Stack>
    </form>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { AppFrame } from "@/components/AppFrame";
import { DashboardContent } from "@/components/DashboardContent";

export const metadata: Metadata = { title: "Dashboard · Lumen" };

export default function DashboardPage() {
  return (
    <AppFrame>
      <DashboardContent />
    </AppFrame>
  );
}
```

```tsx app/(shell)/layout.tsx
import { AppFrame } from "@/components/AppFrame";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppFrame>{children}</AppFrame>;
}
```

```tsx app/(shell)/projects/page.tsx
import type { Metadata } from "next";
import { Stack, Text, Title } from "@mantine/core";
import { ProjectsTable } from "@/components/ProjectsTable";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Projects
        </Title>
        <Text c="dimmed" mt={4}>
          {projects.length} projects in the Acme Labs workspace. Dates are shown
          in UTC.
        </Text>
      </div>
      <ProjectsTable />
    </Stack>
  );
}
```

```tsx app/(shell)/reports/page.tsx
import type { Metadata } from "next";
import { Card, Stack, Text, Title } from "@mantine/core";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports · Lumen" };

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Reports
        </Title>
        <Text c="dimmed" mt={4}>
          A quick read on where issues are piling up.
        </Text>
      </div>
      <Card withBorder padding="lg" radius="md">
        <Title order={2} size="h4" mb="xs">
          Issue load
        </Title>
        <Text>
          There are {total} open issues across {projects.length} projects.{" "}
          {busiest.name} carries the most with {busiest.issues}.
        </Text>
      </Card>
    </Stack>
  );
}
```

```tsx app/(shell)/settings/page.tsx
import type { Metadata } from "next";
import { Stack, Text, Title } from "@mantine/core";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Settings
        </Title>
        <Text c="dimmed" mt={4}>
          Manage your profile and how Lumen keeps you informed.
        </Text>
      </div>
      <SettingsForm />
    </Stack>
  );
}
```