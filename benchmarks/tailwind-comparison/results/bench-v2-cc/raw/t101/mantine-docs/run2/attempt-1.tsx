```ts app/theme.ts
import {
  Badge,
  Button,
  Card,
  Drawer,
  Menu,
  NumberInput,
  Paper,
  Select,
  SegmentedControl,
  Switch,
  Table,
  TextInput,
  Tooltip,
  createTheme,
  type MantineColorsTuple,
} from "@mantine/core";

// Lumen brand teal: shade 7 is exactly #0F766E.
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

// Cool slate neutrals replace the default grey and dark scales.
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

export const theme = createTheme({
  primaryColor: "lumen",
  primaryShade: { light: 7, dark: 5 },
  colors: { lumen, gray: slate, dark: slateDark },
  black: "#0f172a",
  autoContrast: true,
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  headings: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.5rem", lineHeight: "1.25" },
      h2: { fontSize: "1.25rem", lineHeight: "1.3" },
      h3: { fontSize: "1.0625rem", lineHeight: "1.35" },
      h4: { fontSize: "0.9375rem", lineHeight: "1.4" },
      h5: { fontSize: "0.8125rem", lineHeight: "1.4" },
      h6: { fontSize: "0.75rem", lineHeight: "1.4" },
    },
  },
  fontSizes: {
    xs: "0.6875rem",
    sm: "0.8125rem",
    md: "0.875rem",
    lg: "1rem",
    xl: "1.125rem",
  },
  radius: { xs: "2px", sm: "2px", md: "2px", lg: "2px", xl: "2px" },
  defaultRadius: "xs",
  spacing: {
    xs: "0.375rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  components: {
    Button: Button.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    TextInput: TextInput.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    NumberInput: NumberInput.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    Select: Select.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    SegmentedControl: SegmentedControl.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    Switch: Switch.extend({ defaultProps: { size: "xs" } }),
    Card: Card.extend({ defaultProps: { padding: "md", radius: "xs", withBorder: true } }),
    Paper: Paper.extend({ defaultProps: { radius: "xs" } }),
    Menu: Menu.extend({ defaultProps: { radius: "xs", shadow: "sm" } }),
    Drawer: Drawer.extend({ defaultProps: { radius: 0 } }),
    Badge: Badge.extend({ defaultProps: { radius: "xs", size: "sm" } }),
    Tooltip: Tooltip.extend({ defaultProps: { radius: "xs" } }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: 6, horizontalSpacing: "sm", fz: "sm" },
    }),
  },
});
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

export const statusColor: Record<ProjectStatus, string> = {
  Active: "lumen",
  Paused: "yellow",
  Archived: "gray",
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Deterministic (no locale or timezone dependence), so server and client agree.
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthNames[m - 1]} ${y}`;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/" },
      { label: "Reports", href: "/reports" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Settings", href: "/settings" },
    ],
  },
];

export function findCrumbs(pathname: string): { group: string; label: string } | null {
  for (const g of navGroups) {
    for (const item of g.items) {
      if (item.href === pathname) return { group: g.label, label: item.label };
    }
  }
  return null;
}
```

```tsx components/AppFrame.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Anchor,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Divider,
  Drawer,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBriefcase,
  IconChartBar,
  IconFolders,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconReport,
  IconSettings,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { findCrumbs, navGroups, user } from "@/lib/data";

const itemIcons: Record<string, ReactNode> = {
  "/": <IconLayoutDashboard size={16} stroke={1.6} />,
  "/reports": <IconReport size={16} stroke={1.6} />,
  "/projects": <IconFolders size={16} stroke={1.6} />,
  "/settings": <IconSettings size={16} stroke={1.6} />,
};

const groupIcons: Record<string, ReactNode> = {
  Analytics: <IconChartBar size={16} stroke={1.6} />,
  Workspace: <IconBriefcase size={16} stroke={1.6} />,
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavContent({
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
      <Stack gap={4} align="center" component="nav" aria-label="Primary">
        {navGroups.map((group, i) => (
          <Stack key={group.label} gap={4} align="center" w="100%">
            {i > 0 && <Divider w="70%" />}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Tooltip key={item.href} label={`${group.label}: ${item.label}`} position="right">
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size="lg"
                    variant={active ? "filled" : "subtle"}
                    color={active ? "lumen" : "gray"}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                  >
                    {itemIcons[item.href]}
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
    <Box component="nav" aria-label="Primary">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={groupIcons[group.label]}
          defaultOpened
          childrenOffset={14}
          fw={600}
          py={6}
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={itemIcons[item.href]}
                active={active}
                variant="filled"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                py={6}
                fw={500}
              />
            );
          })}
        </NavLink>
      ))}
    </Box>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, drawer] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const crumbs = findCrumbs(pathname);

  const crumbItems = crumbs
    ? [
        <Text key="root" size="sm" c="dimmed">
          {crumbs.group}
        </Text>,
        <Text key="leaf" size="sm" fw={600} aria-current="page">
          {crumbs.label}
        </Text>,
      ]
    : [
        <Anchor key="home" component={Link} href="/" size="sm">
          Lumen
        </Anchor>,
      ];

  return (
    <AppShell
      header={{ height: 44 }}
      navbar={{
        width: collapsed ? 52 : 224,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="sm" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
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
              ff="heading"
              fw={700}
              fz="lg"
              c="lumen.7"
              underline="never"
              aria-label="Lumen home"
            >
              Lumen
            </Anchor>
            <Divider orientation="vertical" visibleFrom="xs" />
            <Breadcrumbs separator="/" visibleFrom="xs" aria-label="Breadcrumb">
              {crumbItems}
            </Breadcrumbs>
          </Group>
          <Menu position="bottom-end" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" radius="xl" size="lg" aria-label="Account menu">
                <Avatar size={26} radius="xl" color="lumen" name={user.name} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>
                {user.name}
                <Text size="xs" c="dimmed" fw={400}>
                  {user.email}
                </Text>
              </Menu.Label>
              <Menu.Item component={Link} href="/settings" leftSection={<IconSettings size={14} />}>
                Settings
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          <NavContent pathname={pathname} collapsed={collapsed} />
        </AppShell.Section>
        <AppShell.Section>
          <Divider mb="xs" />
          <Group justify={collapsed ? "center" : "flex-end"}>
            <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} position="right">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={18} stroke={1.6} />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={18} stroke={1.6} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <Drawer
        opened={drawerOpened}
        onClose={drawer.close}
        hiddenFrom="sm"
        size={260}
        padding="xs"
        title="Lumen"
        closeButtonProps={{ "aria-label": "Close navigation menu" }}
      >
        <NavContent pathname={pathname} collapsed={false} onNavigate={drawer.close} />
      </Drawer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
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
            <AppFrame>{children}</AppFrame>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
"use client";

import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { projects, user, formatDate } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = projects.map((p) => p.updated).sort().at(-1) ?? projects[0].updated;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  const cards = [
    { label: "Active projects", value: String(active), note: `${projects.length} in the workspace` },
    { label: "Open issues", value: String(openIssues), note: `Most in ${busiest.name} (${busiest.issues})` },
    { label: "Paused projects", value: String(paused), note: "Mobile beta is on hold" },
    { label: "Last update", value: formatDate(latest), note: "Customer app" },
  ];

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Welcome back, {user.name.split(" ")[0]}</Title>
        <Text size="sm" c="dimmed">
          Here is where your workspace stands today.
        </Text>
      </div>
      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="sm">
        {cards.map((c) => (
          <Card key={c.label}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.5}>
              {c.label}
            </Text>
            <Text ff="heading" fz={26} fw={600} mt={4} lh={1.2}>
              {c.value}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {c.note}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Badge, Card, Stack, Table, Text, Title } from "@mantine/core";
import { formatDate, projects, statusColor } from "@/lib/data";

export default function Page() {
  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Projects</Title>
        <Text size="sm" c="dimmed">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </div>
      <Card p={0}>
        <Table.ScrollContainer minWidth={520}>
          <Table highlightOnHover striped="even">
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Key</Table.Th>
                <Table.Th scope="col">Name</Table.Th>
                <Table.Th scope="col">Status</Table.Th>
                <Table.Th scope="col" ta="right">
                  Open issues
                </Table.Th>
                <Table.Th scope="col">Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {projects.map((p) => (
                <Table.Tr key={p.key}>
                  <Table.Td fw={600} ff="monospace">
                    {p.key}
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
                  <Table.Td>
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </Table.Td>
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

```tsx app/reports/page.tsx
"use client";

import { Card, Stack, Table, Text, Title } from "@mantine/core";
import { projects } from "@/lib/data";

export default function Page() {
  const total = projects.reduce((s, p) => s + p.issues, 0);
  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Reports</Title>
        <Text size="sm" c="dimmed">
          Open issues by project, {total} in total.
        </Text>
      </div>
      <Card p={0}>
        <Table.ScrollContainer minWidth={360}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Project</Table.Th>
                <Table.Th scope="col" ta="right">
                  Open issues
                </Table.Th>
                <Table.Th scope="col" ta="right">
                  Share
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {projects.map((p) => (
                <Table.Tr key={p.key}>
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td ta="right">{p.issues}</Table.Td>
                  <Table.Td ta="right">{total ? Math.round((p.issues / total) * 100) : 0}%</Table.Td>
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

```tsx app/settings/page.tsx
"use client";

import { Button, Card, Group, Select, Stack, Switch, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";

export default function Page() {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      weeklyDigest: true,
      assignmentEmails: true,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Enter your full name" : null),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email address"),
    },
  });

  const handleSubmit = () => {
    notifications.show({ title: "Settings saved", message: "Your changes have been applied." });
  };

  return (
    <Stack gap="md" maw={560}>
      <div>
        <Title order={1}>Settings</Title>
        <Text size="sm" c="dimmed">
          Your profile and notification preferences.
        </Text>
      </div>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <Card>
            <Stack gap="sm">
              <Title order={2}>Profile</Title>
              <TextInput label="Full name" key={form.key("name")} {...form.getInputProps("name")} />
              <TextInput
                label="Email"
                type="email"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />
              <Select
                label="Role"
                data={["Owner", "Admin", "Member"]}
                allowDeselect={false}
                key={form.key("role")}
                {...form.getInputProps("role")}
              />
            </Stack>
          </Card>
          <Card>
            <Stack gap="sm">
              <Title order={2}>Notifications</Title>
              <Switch
                label="Weekly digest"
                description="A Monday summary of open issues per project."
                key={form.key("weeklyDigest")}
                {...form.getInputProps("weeklyDigest", { type: "checkbox" })}
              />
              <Switch
                label="Assignment emails"
                description="Email me when an issue is assigned to me."
                key={form.key("assignmentEmails")}
                {...form.getInputProps("assignmentEmails", { type: "checkbox" })}
              />
            </Stack>
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
