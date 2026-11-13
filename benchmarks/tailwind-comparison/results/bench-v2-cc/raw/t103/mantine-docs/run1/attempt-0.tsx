```ts app/theme.ts
import { Card, createTheme, Paper, type MantineColorsTuple } from "@mantine/core";

// Lumen brand orange: shade 6 is exactly #E8590C.
const brand: MantineColorsTuple = [
  "#fff3eb",
  "#ffe3d1",
  "#fdc9a4",
  "#fbab74",
  "#f78c47",
  "#f0711f",
  "#E8590C",
  "#c94a08",
  "#a83e08",
  "#8a3407",
];

// Warm stone neutrals. Dark mode reads body background from dark[7], text from dark[0].
const stoneDark: MantineColorsTuple = [
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#8b847e",
  "#57534e",
  "#44403c",
  "#2b2724",
  "#1c1917",
  "#171412",
  "#0c0a09",
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

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const SANS = "ui-sans-serif, system-ui, sans-serif";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, dark: stoneDark, gray: stoneGray },
  // The brand orange is too light for white text at small sizes; pick dark text on filled surfaces.
  autoContrast: true,
  luminanceThreshold: 0.2,
  black: "#1c1917",
  fontFamily: SANS,
  fontFamilyMonospace: MONO,
  headings: { fontFamily: MONO, fontWeight: "600" },
  defaultRadius: "xs",
  radius: { xs: "4px", sm: "4px", md: "4px", lg: "4px", xl: "4px" },
  components: {
    Card: Card.extend({ defaultProps: { withBorder: true, padding: "md" } }),
    Paper: Paper.extend({ defaultProps: { withBorder: true } }),
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

export const product = "Lumen";

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

export const reports = [
  {
    title: "Weekly issue throughput",
    description: "Issues opened and closed per project, compared with the previous week.",
    cadence: "Weekly",
  },
  {
    title: "Feature adoption",
    description: "Share of active accounts that used each tracked feature in the last 30 days.",
    cadence: "Monthly",
  },
  {
    title: "Release health",
    description: "Error rate and regressions in the first 48 hours after each release.",
    cadence: "Per release",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats an ISO date (YYYY-MM-DD) without time zone surprises, e.g. "12 Oct 2026". */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export const statusColor: Record<ProjectStatus, string> = {
  Active: "teal",
  Paused: "yellow",
  Archived: "gray",
};

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
  Divider,
  Drawer,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBolt,
  IconBriefcase,
  IconChartBar,
  IconFolders,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconReport,
  IconSettings,
} from "@tabler/icons-react";
import { initials, product, user } from "@/lib/data";

type IconType = typeof IconBolt;

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

interface NavGroup {
  label: string;
  icon: IconType;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Analytics",
    icon: IconChartBar,
    items: [
      { label: "Overview", href: "/", icon: IconLayoutDashboard },
      { label: "Reports", href: "/reports", icon: IconReport },
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

function crumbsFor(pathname: string): string[] {
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return [group.label, item.label];
      }
    }
  }
  return [product];
}

function Brand() {
  return (
    <Group gap="xs" wrap="nowrap">
      <ThemeIcon size={28} aria-hidden>
        <IconBolt size={18} stroke={2} />
      </ThemeIcon>
      <Text ff="heading" fw={700} size="lg">
        {product}
      </Text>
    </Group>
  );
}

function NavList({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  if (collapsed) {
    return (
      <Stack gap="xs" align="center">
        {NAV.map((group, index) => (
          <Stack key={group.label} gap="xs" align="center" w="100%">
            {index > 0 && <Divider w="60%" />}
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Tooltip key={item.href} label={item.label} position="right" withArrow>
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size="lg"
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "gray"}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon size={20} stroke={1.5} />
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
    <Stack gap={4}>
      {NAV.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={18} stroke={1.5} />}
          defaultOpened
          childrenOffset={20}
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
                leftSection={<item.icon size={18} stroke={1.5} />}
                active={active}
                variant="filled"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              />
            );
          })}
        </NavLink>
      ))}
    </Stack>
  );
}

function UserBlock({ collapsed }: { collapsed: boolean }) {
  const avatar = (
    <Avatar color="brand" variant="light" aria-hidden>
      {initials(user.name)}
    </Avatar>
  );
  if (collapsed) {
    return (
      <Group justify="center">
        <Tooltip label={`${user.name}, ${user.role}`} position="right" withArrow>
          {avatar}
        </Tooltip>
      </Group>
    );
  }
  return (
    <Group wrap="nowrap" gap="sm">
      {avatar}
      <Box miw={0}>
        <Text size="sm" fw={600} truncate>
          {user.name}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {user.role} · {user.email}
        </Text>
      </Box>
    </Group>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const crumbs = crumbsFor(pathname);

  return (
    <>
      <AppShell
        padding="md"
        header={{ height: 56 }}
        navbar={{
          width: collapsed ? 72 : 264,
          breakpoint: "sm",
          collapsed: { mobile: true },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" gap="md" wrap="nowrap">
            <Burger
              opened={drawerOpened}
              onClick={openDrawer}
              hiddenFrom="sm"
              size="sm"
              aria-label="Open navigation menu"
            />
            <Brand />
            <ActionIcon
              variant="subtle"
              color="gray"
              visibleFrom="sm"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar to icons"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <IconLayoutSidebarLeftExpand size={20} stroke={1.5} />
              ) : (
                <IconLayoutSidebarLeftCollapse size={20} stroke={1.5} />
              )}
            </ActionIcon>
            <Box component="nav" aria-label="Breadcrumb" miw={0} style={{ overflow: "hidden" }}>
              <Breadcrumbs separator="/" separatorMargin="xs">
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1;
                  return (
                    <Text
                      key={crumb}
                      size="sm"
                      fw={last ? 600 : 400}
                      c={last ? undefined : "dimmed"}
                      aria-current={last ? "page" : undefined}
                      truncate
                    >
                      {crumb}
                    </Text>
                  );
                })}
              </Breadcrumbs>
            </Box>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" aria-label="Primary">
          <AppShell.Section grow component={ScrollArea}>
            <NavList pathname={pathname} collapsed={collapsed} />
          </AppShell.Section>
          <AppShell.Section pt="md">
            <Divider mb="md" />
            <UserBlock collapsed={collapsed} />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={<Brand />}
        size="xs"
        hiddenFrom="sm"
      >
        <Stack justify="space-between" mih="calc(100dvh - 120px)">
          <Box component="nav" aria-label="Primary">
            <NavList pathname={pathname} collapsed={false} onNavigate={closeDrawer} />
          </Box>
          <Box>
            <Divider mb="md" />
            <UserBlock collapsed={false} />
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
```

```tsx app/page.tsx
"use client";

import { Box, Card, Container, Group, Progress, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { formatDate, projects, user } from "@/lib/data";

export default function Page() {
  const firstName = user.name.split(" ")[0];
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const byIssues = [...projects].sort((a, b) => b.issues - a.issues).slice(0, 4);
  const maxIssues = Math.max(...projects.map((p) => p.issues), 1);

  const stats = [
    { label: "Projects", value: String(projects.length), note: "across your workspace" },
    { label: "Active projects", value: String(active), note: "currently in progress" },
    { label: "Open issues", value: String(openIssues), note: "in all projects" },
    { label: "Last activity", value: formatDate(latest.updated), note: `${latest.key} · ${latest.name}` },
  ];

  return (
    <Container size="xl" p={0}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Welcome back, {firstName}
          </Title>
          <Text c="dimmed" mt={4}>
            Here is the state of your workspace today.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" lts={0.5}>
                {stat.label}
              </Text>
              <Text ff="heading" fw={700} fz={28} mt={6}>
                {stat.value}
              </Text>
              <Text size="sm" c="dimmed" mt={2}>
                {stat.note}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Card>
          <Title order={2} size="h4" mb="md">
            Open issues by project
          </Title>
          <Stack gap="md">
            {byIssues.map((p) => (
              <Box key={p.key}>
                <Group justify="space-between" mb={6} wrap="nowrap">
                  <Text size="sm" fw={500} truncate>
                    <Text span ff="monospace" c="dimmed" mr="xs">
                      {p.key}
                    </Text>
                    {p.name}
                  </Text>
                  <Text size="sm" ff="monospace">
                    {p.issues}
                  </Text>
                </Group>
                <Progress
                  value={(p.issues / maxIssues) * 100}
                  aria-label={`${p.name}: ${p.issues} open issues`}
                />
              </Box>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
```

```tsx app/reports/page.tsx
"use client";

import { Badge, Box, Card, Container, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { reports } from "@/lib/data";

export default function Page() {
  return (
    <Container size="xl" p={0}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Reports
          </Title>
          <Text c="dimmed" mt={4}>
            Scheduled summaries your team receives from Lumen.
          </Text>
        </Box>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {reports.map((report) => (
            <Card key={report.title}>
              <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                <Title order={2} size="h5">
                  {report.title}
                </Title>
                <Badge variant="light">{report.cadence}</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {report.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { useState } from "react";
import { Badge, Box, Card, Code, Container, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { formatDate, projects, statusColor } from "@/lib/data";

export default function Page() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) => q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
  );

  return (
    <Container size="xl" p={0}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Projects
          </Title>
          <Text c="dimmed" mt={4}>
            {projects.length} projects in this workspace.
          </Text>
        </Box>

        <TextInput
          label="Filter projects"
          placeholder="Name or key"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          maw={360}
        />

        <Card p={0}>
          <Table.ScrollContainer minWidth={560}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md" aria-label="Projects">
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
                {rows.map((p) => (
                  <Table.Tr key={p.key}>
                    <Table.Td>
                      <Code>{p.key}</Code>
                    </Table.Td>
                    <Table.Td fw={500}>{p.name}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={statusColor[p.status]}>
                        {p.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="right" ff="monospace">
                      {p.issues}
                    </Table.Td>
                    <Table.Td>
                      <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {rows.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed" ta="center" py="md">
                        No projects match &ldquo;{query}&rdquo;.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      </Stack>
    </Container>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Input,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";

export default function Page() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      notifyAssigned: true,
      notifyWeekly: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Enter at least 2 characters" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
    },
  });

  return (
    <Container size="sm" p={0} ml={0}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Settings
          </Title>
          <Text c="dimmed" mt={4}>
            Your profile, notifications and appearance.
          </Text>
        </Box>

        <form
          onSubmit={form.onSubmit(() => {
            notifications.show({
              title: "Settings saved",
              message: "Your changes have been applied.",
            });
          })}
        >
          <Stack gap="md">
            <Card>
              <Title order={2} size="h4" mb="md">
                Profile
              </Title>
              <Stack gap="sm">
                <TextInput label="Name" required {...form.getInputProps("name")} />
                <TextInput label="Email" type="email" required {...form.getInputProps("email")} />
                <TextInput
                  label="Role"
                  value={user.role}
                  readOnly
                  description="Only another owner can change your role."
                />
              </Stack>
            </Card>

            <Card>
              <Title order={2} size="h4" mb="md">
                Notifications
              </Title>
              <Stack gap="md">
                <Switch
                  label="Issues assigned to me"
                  description="Send an email when an issue is assigned to you."
                  {...form.getInputProps("notifyAssigned", { type: "checkbox" })}
                />
                <Switch
                  label="Weekly summary"
                  description="A Monday digest of activity in your active projects."
                  {...form.getInputProps("notifyWeekly", { type: "checkbox" })}
                />
              </Stack>
            </Card>

            <Card>
              <Title order={2} size="h4" mb="md">
                Appearance
              </Title>
              <Input.Wrapper label="Color scheme" description="Dark is the default for Lumen.">
                <Box mt="xs">
                  <SegmentedControl
                    value={colorScheme}
                    onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
                    data={[
                      { label: "Dark", value: "dark" },
                      { label: "Light", value: "light" },
                      { label: "System", value: "auto" },
                    ]}
                    aria-label="Color scheme"
                  />
                </Box>
              </Input.Wrapper>
            </Card>

            <Group justify="flex-end">
              <Button type="button" variant="default" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">Save changes</Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
```
