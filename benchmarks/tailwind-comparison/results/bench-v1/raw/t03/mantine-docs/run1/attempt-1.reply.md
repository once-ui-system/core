Nothing I wrote exists in the project, so the module-not-found errors may mean the file paths or the alias aren't resolving as I assumed. I'll sidestep the alias entirely and use relative imports everywhere, which resolve regardless of path-mapping. That also clears the implicit-`any` errors, since they come from the unresolved `@/lib/data` import.

```ts lib/data.ts
export interface Project {
  key: string;
  name: string;
  status: "Active" | "Paused" | "Archived";
  issues: number;
  updated: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "Active" | "Invited" | "Suspended";
  joined: string | null;
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
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

export const members: Member[] = [
  { id: "m-01", name: "Maya Okafor", email: "maya@acmelabs.io", role: "Owner", status: "Active", joined: "2024-03-02" },
  { id: "m-02", name: "Daniel Reyes", email: "daniel@acmelabs.io", role: "Admin", status: "Active", joined: "2024-05-19" },
  { id: "m-03", name: "Priya Natarajan", email: "priya@acmelabs.io", role: "Member", status: "Active", joined: "2024-11-07" },
  { id: "m-04", name: "Tomás Lindqvist", email: "tomas@acmelabs.io", role: "Member", status: "Active", joined: "2025-02-14" },
  { id: "m-05", name: "Hana Sato", email: "hana@acmelabs.io", role: "Member", status: "Invited", joined: null },
  { id: "m-06", name: "Grace Mensah", email: "grace@acmelabs.io", role: "Viewer", status: "Active", joined: "2025-06-30" },
  { id: "m-07", name: "Leo Brandt", email: "leo@acmelabs.io", role: "Member", status: "Suspended", joined: "2025-01-21" },
  { id: "m-08", name: "Ines Duarte", email: "ines@acmelabs.io", role: "Viewer", status: "Invited", joined: null },
];

/** The three most recently updated projects, newest first. */
export const recentProjects: Project[] = [...projects]
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, 3);

/** Deterministic date formatting (same output on server and client). */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function statusColor(status: string): string {
  switch (status) {
    case "Active":
      return "teal";
    case "Paused":
      return "yellow";
    case "Invited":
      return "blue";
    case "Suspended":
      return "red";
    default:
      return "gray";
  }
}
```

```tsx components/AppFrame.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Group,
  Kbd,
  NavLink,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useOs } from "@mantine/hooks";
import { spotlight } from "@mantine/spotlight";
import {
  IconFolders,
  IconLayoutDashboard,
  IconMoon,
  IconSearch,
  IconSparkles,
  IconSun,
  IconUsers,
} from "@tabler/icons-react";
import { CommandPalette } from "./CommandPalette";
import { InviteMemberModal } from "./InviteMemberModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { FrameActionsContext, type FrameActions } from "./frame-actions";
import { user } from "../lib/data";

const navItems = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/projects", label: "Projects", icon: IconFolders },
  { href: "/members", label: "Members", icon: IconUsers },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);
  const [inviteOpened, invite] = useDisclosure(false);
  const [createOpened, create] = useDisclosure(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const os = useOs({ getValueInEffect: true });
  const modKey = os === "macos" || os === "ios" ? "⌘" : "Ctrl";

  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", { getInitialValueInEffect: true });

  const toggleTheme = useCallback(() => {
    setColorScheme(computed === "dark" ? "light" : "dark");
  }, [computed, setColorScheme]);

  const { open: openInvite, close: closeInvite } = invite;
  const { open: openCreate, close: closeCreate } = create;

  const actions = useMemo<FrameActions>(
    () => ({ openInvite, openCreateProject: openCreate, toggleTheme }),
    [openInvite, openCreate, toggleTheme]
  );

  return (
    <FrameActionsContext.Provider value={actions}>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !navOpened } }}
        padding={{ base: "sm", sm: "md", lg: "xl" }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap" gap="xs">
            <Group gap="xs" wrap="nowrap">
              <Burger
                opened={navOpened}
                onClick={toggleNav}
                hiddenFrom="sm"
                size="sm"
                aria-label="Toggle navigation"
              />
              <Group
                gap={6}
                wrap="nowrap"
                component={Link}
                href="/"
                aria-label="Lumen home"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <IconSparkles size={22} aria-hidden color="var(--mantine-color-indigo-6)" />
                <Text fw={700} size="lg">
                  Lumen
                </Text>
              </Group>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <Button
                variant="default"
                onClick={spotlight.open}
                leftSection={<IconSearch size={16} aria-hidden />}
                rightSection={
                  <Group gap={4} wrap="nowrap" visibleFrom="sm" aria-hidden>
                    <Kbd size="xs">{modKey}</Kbd>
                    <Kbd size="xs">K</Kbd>
                  </Group>
                }
                aria-label={`Open command palette, shortcut ${modKey} K`}
                aria-keyshortcuts="Control+K Meta+K"
                aria-haspopup="dialog"
                aria-expanded={paletteOpen}
              >
                <Text span size="sm" c="dimmed">
                  Search
                </Text>
              </Button>

              <ActionIcon
                variant="default"
                size="lg"
                onClick={toggleTheme}
                aria-label="Toggle color theme"
              >
                <Box component="span" lightHidden style={{ display: "inline-flex" }}>
                  <IconSun size={18} aria-hidden />
                </Box>
                <Box component="span" darkHidden style={{ display: "inline-flex" }}>
                  <IconMoon size={18} aria-hidden />
                </Box>
              </ActionIcon>

              <Avatar color="indigo" radius="xl" size="md" visibleFrom="xs" aria-label={user.name}>
                MO
              </Avatar>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <nav aria-label="Main">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  active={active}
                  aria-current={active ? "page" : undefined}
                  leftSection={<item.icon size={18} aria-hidden />}
                  onClick={closeNav}
                  variant="light"
                  style={{ borderRadius: "var(--mantine-radius-sm)" }}
                />
              );
            })}
          </nav>
          <Text size="xs" c="dimmed" mt="auto">
            Signed in as {user.email}
          </Text>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <CommandPalette onOpenChange={setPaletteOpen} />
      <InviteMemberModal opened={inviteOpened} onClose={closeInvite} />
      <CreateProjectModal opened={createOpened} onClose={closeCreate} />
    </FrameActionsContext.Provider>
  );
}
```

```tsx components/frame-actions.tsx
"use client";

import { createContext, useContext } from "react";

export interface FrameActions {
  openInvite: () => void;
  openCreateProject: () => void;
  toggleTheme: () => void;
}

export const FrameActionsContext = createContext<FrameActions | null>(null);

export function useFrameActions(): FrameActions {
  const ctx = useContext(FrameActionsContext);
  if (!ctx) throw new Error("useFrameActions must be used inside AppFrame");
  return ctx;
}
```

```tsx components/CommandPalette.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Group, Highlight, Kbd, Text } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";
import {
  IconFolder,
  IconFolderPlus,
  IconFolders,
  IconLayoutDashboard,
  IconMoon,
  IconSearch,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { useFrameActions } from "./frame-actions";
import { recentProjects, type Project } from "../lib/data";

interface CommandPaletteProps {
  onOpenChange?: (opened: boolean) => void;
}

interface PaletteItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: React.ReactNode;
  badge?: string;
  run: () => void;
}

interface PaletteGroup {
  group: string;
  items: PaletteItem[];
}

function matches(item: PaletteItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [item.label, item.description, ...item.keywords].join(" ").toLowerCase();
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

export function CommandPalette({ onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { openInvite, openCreateProject, toggleTheme } = useFrameActions();
  const [query, setQuery] = useState("");

  const groups = useMemo<PaletteGroup[]>(
    () => [
      {
        group: "Pages",
        items: [
          {
            id: "page-dashboard",
            label: "Dashboard",
            description: "Overview of activity across your projects",
            keywords: ["home", "overview", "stats"],
            icon: <IconLayoutDashboard size={22} aria-hidden />,
            run: () => router.push("/"),
          },
          {
            id: "page-projects",
            label: "Projects",
            description: "Browse every project and its open issues",
            keywords: ["issues", "boards"],
            icon: <IconFolders size={22} aria-hidden />,
            run: () => router.push("/projects"),
          },
          {
            id: "page-members",
            label: "Members",
            description: "People and roles on your team",
            keywords: ["team", "people", "users"],
            icon: <IconUsers size={22} aria-hidden />,
            run: () => router.push("/members"),
          },
        ],
      },
      {
        group: "Actions",
        items: [
          {
            id: "action-create-project",
            label: "Create project",
            description: "Start a new project for your team",
            keywords: ["new", "add"],
            icon: <IconFolderPlus size={22} aria-hidden />,
            run: openCreateProject,
          },
          {
            id: "action-invite-member",
            label: "Invite member",
            description: "Send an email invitation to a teammate",
            keywords: ["add", "email", "teammate"],
            icon: <IconUserPlus size={22} aria-hidden />,
            run: openInvite,
          },
          {
            id: "action-toggle-theme",
            label: "Toggle theme",
            description: "Switch between light and dark mode",
            keywords: ["dark", "light", "appearance", "color"],
            icon: <IconMoon size={22} aria-hidden />,
            run: toggleTheme,
          },
        ],
      },
      {
        group: "Recent",
        items: recentProjects.map(
          (project: Project): PaletteItem => ({
            id: `recent-${project.key}`,
            label: project.name,
            description: `${project.key} · ${project.issues} open issues`,
            keywords: [project.key, "project"],
            icon: <IconFolder size={22} aria-hidden />,
            badge: project.key,
            run: () => router.push("/projects"),
          })
        ),
      },
    ],
    [router, openInvite, openCreateProject, toggleTheme]
  );

  const filtered = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, items: g.items.filter((item) => matches(item, query)) }))
        .filter((g) => g.items.length > 0),
    [groups, query]
  );

  return (
    <Spotlight.Root
      query={query}
      onQueryChange={setQuery}
      shortcut="mod + K"
      clearQueryOnClose
      onSpotlightOpen={() => onOpenChange?.(true)}
      onSpotlightClose={() => onOpenChange?.(false)}
      scrollable
      maxHeight={420}
      size="lg"
    >
      <Spotlight.Search
        placeholder="Search pages, actions and projects…"
        aria-label="Search commands"
        leftSection={<IconSearch size={20} aria-hidden />}
      />
      <Spotlight.ActionsList>
        {filtered.length > 0 ? (
          filtered.map((g) => (
            <Spotlight.ActionsGroup key={g.group} label={g.group}>
              {g.items.map((item) => (
                <Spotlight.Action key={item.id} onClick={item.run}>
                  <Group wrap="nowrap" w="100%" gap="sm">
                    {item.icon}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Highlight highlight={query.trim()} fw={500} size="sm">
                        {item.label}
                      </Highlight>
                      <Text size="xs" c="dimmed" truncate>
                        {item.description}
                      </Text>
                    </div>
                    {item.badge ? (
                      <Badge variant="light" color="indigo">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Group>
                </Spotlight.Action>
              ))}
            </Spotlight.ActionsGroup>
          ))
        ) : (
          <Spotlight.Empty>No pages, actions or projects match your search.</Spotlight.Empty>
        )}
      </Spotlight.ActionsList>
      <Spotlight.Footer>
        <Group gap="md" justify="center" visibleFrom="sm">
          <Group gap={4}>
            <Kbd size="xs">↑</Kbd>
            <Kbd size="xs">↓</Kbd>
            <Text size="xs" c="dimmed">
              navigate
            </Text>
          </Group>
          <Group gap={4}>
            <Kbd size="xs">Enter</Kbd>
            <Text size="xs" c="dimmed">
              select
            </Text>
          </Group>
          <Group gap={4}>
            <Kbd size="xs">Esc</Kbd>
            <Text size="xs" c="dimmed">
              close
            </Text>
          </Group>
        </Group>
      </Spotlight.Footer>
    </Spotlight.Root>
  );
}
```

```tsx components/InviteMemberModal.tsx
"use client";

import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { isEmail, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

interface InviteMemberModalProps {
  opened: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ opened, onClose }: InviteMemberModalProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "" },
    validate: {
      email: isEmail("Enter a valid email address"),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: { email: string }) => {
    notifications.show({
      title: "Invitation sent",
      message: `${values.email} will receive an invite to join Acme Labs on Lumen.`,
      color: "teal",
      icon: <IconCheck size={18} aria-hidden />,
    });
    handleClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Invite member" centered>
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Text size="sm" c="dimmed" mb="md">
          Invite a teammate by email. They will join as a Member and can be given a different role later.
        </Text>
        <TextInput
          label="Email"
          placeholder="teammate@acmelabs.io"
          type="email"
          autoComplete="email"
          withAsterisk
          data-autofocus
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Send invite</Button>
        </Group>
      </form>
    </Modal>
  );
}
```

```tsx components/CreateProjectModal.tsx
"use client";

import { Button, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

interface CreateProjectModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ opened, onClose }: CreateProjectModalProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", key: "" },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Name must have at least 2 characters" : null),
      key: (value) => (/^[A-Za-z]{2,5}$/.test(value.trim()) ? null : "Use 2–5 letters, for example DOCS"),
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: { name: string; key: string }) => {
    notifications.show({
      title: "Project created",
      message: `${values.name} (${values.key.trim().toUpperCase()}) is ready for its first issue.`,
      color: "teal",
      icon: <IconCheck size={18} aria-hidden />,
    });
    handleClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Create project" centered>
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <TextInput
          label="Project name"
          placeholder="Docs portal"
          withAsterisk
          data-autofocus
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput
          mt="md"
          label="Project key"
          description="Short prefix used for issue IDs"
          placeholder="DOCS"
          withAsterisk
          key={form.key("key")}
          {...form.getInputProps("key")}
        />
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Create project</Button>
        </Group>
      </form>
    </Modal>
  );
}
```

```tsx components/DashboardScreen.tsx
import {
  Badge,
  Card,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconFolders, IconUsers, IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import {
  formatDate,
  members,
  projects,
  recentProjects,
  statusColor,
  user,
  type Member,
  type Project,
} from "../lib/data";

export function DashboardScreen() {
  const openIssues = projects.reduce((sum: number, p: Project) => sum + p.issues, 0);
  const activeProjects = projects.filter((p: Project) => p.status === "Active").length;
  const activeMembers = members.filter((m: Member) => m.status === "Active").length;
  const pendingInvites = members.filter((m: Member) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, icon: IconAlertCircle, color: "orange" },
    { label: "Active projects", value: activeProjects, icon: IconFolders, color: "indigo" },
    { label: "Active members", value: activeMembers, icon: IconUsers, color: "teal" },
    { label: "Pending invites", value: pendingInvites, icon: IconUserPlus, color: "blue" },
  ];

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Good to see you, {user.name.split(" ")[0]}
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          Here is how the Acme Labs workspace looks today. Press Ctrl+K (⌘K on a Mac) to jump anywhere.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} component="section" aria-label="Workspace summary">
        {stats.map((stat) => (
          <Card key={stat.label} withBorder padding="md">
            <Group wrap="nowrap">
              <ThemeIcon variant="light" size="xl" color={stat.color} radius="md">
                <stat.icon size={24} aria-hidden />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {stat.label}
                </Text>
                <Text fz={28} fw={700} lh={1.1}>
                  {stat.value}
                </Text>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder padding="md" component="section" aria-labelledby="recent-heading">
          <Title order={2} size="h4" id="recent-heading" mb="sm">
            Recently updated projects
          </Title>
          <Stack gap="sm">
            {recentProjects.map((project: Project) => (
              <Group key={project.key} justify="space-between" wrap="nowrap" gap="sm">
                <div style={{ minWidth: 0 }}>
                  <Text fw={500} truncate>
                    {project.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {project.key} · updated {formatDate(project.updated)}
                  </Text>
                </div>
                <Badge variant="light" color={statusColor(project.status)}>
                  {project.issues} open
                </Badge>
              </Group>
            ))}
          </Stack>
          <Text component={Link} href="/projects" size="sm" mt="md" display="inline-block" c="indigo">
            View all projects
          </Text>
        </Card>

        <Card withBorder padding="md" component="section" aria-labelledby="tips-heading">
          <Title order={2} size="h4" id="tips-heading" mb="sm">
            Command palette tips
          </Title>
          <List spacing="xs" size="sm">
            <List.Item>Type “inv” to find Invite member and add a teammate by email.</List.Item>
            <List.Item>Use the arrow keys to move the highlight and Enter to run a command.</List.Item>
            <List.Item>Pick a recent project to jump straight to the projects list.</List.Item>
            <List.Item>On a phone, tap the Search button in the header.</List.Item>
          </List>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
```

```tsx components/ProjectsScreen.tsx
import { Badge, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { formatDate, projects, statusColor, type Project } from "../lib/data";

export function ProjectsScreen() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Projects
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          {projects.length} projects across the Acme Labs workspace.
        </Text>
      </div>

      {/* Table on larger screens */}
      <Card withBorder padding={0} visibleFrom="sm">
        <Table.ScrollContainer minWidth={520}>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Caption>All Lumen projects with status, open issues and last update</Table.Caption>
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
              {projects.map((project: Project) => (
                <Table.Tr key={project.key}>
                  <Table.Td>
                    <Text fw={600} size="sm" ff="monospace">
                      {project.key}
                    </Text>
                  </Table.Td>
                  <Table.Td>{project.name}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right">{project.issues}</Table.Td>
                  <Table.Td>{formatDate(project.updated)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      {/* Cards on phones */}
      <SimpleGrid cols={1} hiddenFrom="sm" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {projects.map((project: Project) => (
          <li key={project.key}>
            <Card withBorder padding="md">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <div style={{ minWidth: 0 }}>
                  <Text fw={600} truncate>
                    {project.name}
                  </Text>
                  <Text size="xs" c="dimmed" ff="monospace">
                    {project.key}
                  </Text>
                </div>
                <Badge variant="light" color={statusColor(project.status)}>
                  {project.status}
                </Badge>
              </Group>
              <Group justify="space-between" mt="sm">
                <Text size="sm">{project.issues} open issues</Text>
                <Text size="xs" c="dimmed">
                  Updated {formatDate(project.updated)}
                </Text>
              </Group>
            </Card>
          </li>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
```

```tsx components/MembersScreen.tsx
import { Avatar, Badge, Card, Group, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { formatDate, members, statusColor, type Member } from "../lib/data";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function MembersScreen() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={1} size="h2">
          Members
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          {members.length} people have access to this workspace. Use the command palette to invite more.
        </Text>
      </div>

      <Card withBorder padding={0} visibleFrom="sm">
        <Table.ScrollContainer minWidth={640}>
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Caption>Workspace members with role, status and join date</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th scope="col">Member</Table.Th>
                <Table.Th scope="col">Role</Table.Th>
                <Table.Th scope="col">Status</Table.Th>
                <Table.Th scope="col">Joined</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {members.map((member: Member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="indigo" radius="xl" size="sm" aria-hidden>
                        {initials(member.name)}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {member.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {member.email}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>{member.role}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatDate(member.joined)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      <SimpleGrid cols={1} hiddenFrom="sm" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {members.map((member: Member) => (
          <li key={member.id}>
            <Card withBorder padding="md">
              <Group wrap="nowrap" align="flex-start">
                <Avatar color="indigo" radius="xl" aria-hidden>
                  {initials(member.name)}
                </Avatar>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text fw={600} truncate>
                    {member.name}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {member.email}
                  </Text>
                  <Group gap="xs" mt="xs">
                    <Badge variant="outline" color="gray">
                      {member.role}
                    </Badge>
                    <Badge variant="light" color={statusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt="xs">
                    {member.joined ? `Joined ${formatDate(member.joined)}` : "Invitation pending"}
                  </Text>
                </div>
              </Group>
            </Card>
          </li>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
```

```tsx app/page.tsx
import { AppFrame } from "../components/AppFrame";
import { DashboardScreen } from "../components/DashboardScreen";

export default function Page() {
  return (
    <AppFrame>
      <DashboardScreen />
    </AppFrame>
  );
}
```

```tsx app/projects/layout.tsx
import type { Metadata } from "next";
import { AppFrame } from "../../components/AppFrame";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
```

```tsx app/projects/page.tsx
import { ProjectsScreen } from "../../components/ProjectsScreen";

export default function Page() {
  return <ProjectsScreen />;
}
```

```tsx app/members/layout.tsx
import type { Metadata } from "next";
import { AppFrame } from "../../components/AppFrame";

export const metadata: Metadata = { title: "Members · Lumen" };

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
```

```tsx app/members/page.tsx
import { MembersScreen } from "../../components/MembersScreen";

export default function Page() {
  return <MembersScreen />;
}
```