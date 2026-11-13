The `@/*` alias maps to the project root, so all my imports resolve.

```ts lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const app = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type NavLink = { href: string; label: string };
export type NavGroupEntry = { label: string; icon: IconName; items: NavLink[] };

export const nav: NavGroupEntry[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    label: "Workspace",
    icon: "folder",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export const navLinks: NavLink[] = nav.flatMap((group) => group.items);

export const statusTone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

export const totalOpenIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeProjects = projects.filter((p) => p.status === "Active").length;
export const lastUpdated = projects.reduce(
  (latest, p) => (p.updated > latest ? p.updated : latest),
  projects[0].updated,
);
```

```tsx components/sidebar-store.ts
"use client";

import { useSyncExternalStore } from "react";

// Module-level store so the collapsed state survives the shell being
// remounted when navigating between "/" and the (app) route group.
let collapsed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return collapsed;
}

function getServerSnapshot() {
  return false;
}

export function setSidebarCollapsed(value: boolean) {
  collapsed = value;
  listeners.forEach((l) => l());
}

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

```tsx components/SideNav.tsx
"use client";

import {
  Column,
  IconButton,
  Line,
  Nav,
  NavGroup,
  NavItem,
  type IconName,
} from "@once-ui-system/core";
import { nav } from "@/lib/data";

type SideNavProps = {
  current: string | null;
  collapsed?: boolean;
};

// Distinct icons per destination in the collapsed rail.
function iconFor(href: string, fallback: IconName): IconName {
  switch (href) {
    case "/":
      return "home";
    case "/reports":
      return "document";
    case "/projects":
      return "folder";
    case "/settings":
      return "settings";
    default:
      return fallback;
  }
}

/**
 * The navigation tree. Expanded: nested groups with labels. Collapsed: every
 * destination stays reachable as an icon button named "Group: Page".
 */
export function SideNav({ current, collapsed = false }: SideNavProps) {
  if (collapsed) {
    return (
      <Nav fill paddingX="8" density="compact" aria-label="Main" horizontal="center">
        <Column gap="4" horizontal="center" fillWidth>
          {nav.map((group, index) => (
            <Column
              key={group.label}
              gap="4"
              horizontal="center"
              role="group"
              aria-label={group.label}
            >
              {index > 0 && <Line width="24" marginY="4" />}
              {group.items.map((link) => {
                const selected = link.href === current;
                return (
                  <IconButton
                    key={link.href}
                    href={link.href}
                    icon={iconFor(link.href, group.icon)}
                    variant={selected ? "secondary" : "tertiary"}
                    tooltip={`${group.label}: ${link.label}`}
                    tooltipPosition="right"
                    aria-label={`${group.label}: ${link.label}`}
                    aria-current={selected ? "page" : undefined}
                  />
                );
              })}
            </Column>
          ))}
        </Column>
      </Nav>
    );
  }

  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          icon={group.icon}
          defaultOpen
          selected={group.items.some((l) => l.href === current)}
        >
          {group.items.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              selected={link.href === current}
              aria-current={link.href === current ? "page" : undefined}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import {
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Kbar,
  type KbarItem,
  Option,
  Row,
  selectNavHref,
  Text,
  ThemeSwitcher,
  User,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { app, nav, navLinks, user } from "@/lib/data";
import { SideNav } from "./SideNav";
import { setSidebarCollapsed, useSidebarCollapsed } from "./sidebar-store";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((l) => l.href),
  );
  const collapsed = useSidebarCollapsed();

  // Drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [searchOpen, setSearchOpen] = useState(false);

  const group = nav.find((g) => g.items.some((l) => l.href === current));
  const page = navLinks.find((l) => l.href === current);
  const crumbs = [
    { label: app.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: "Pages",
    keywords: link.label.toLowerCase(),
    href: link.href,
    icon: "arrowRight",
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email}
        </Text>
      </Column>
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  return (
    <Column fill flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setSidebarCollapsed(!collapsed)}
          />
        </Row>
        <Row vertical="center" gap="8">
          <Icon name="sparkle" size="s" onBackground="brand-medium" />
          <Text textVariant="heading-strong-s">{app.name}</Text>
        </Row>
        <Row flex={1} paddingLeft="16" s={{ hide: true }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ flex: 1 }} />
        <Button
          size="s"
          variant="secondary"
          prefixIcon="search"
          label="Search"
          onClick={() => setSearchOpen(true)}
        />
        <ThemeSwitcher collapsed direction="column" />
        <Row s={{ hide: true }}>
          <User
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <User placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav current={current} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            as="main"
            id="main"
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
            border
          >
            <Column
              maxWidth="xl"
              fillWidth
              paddingX="24"
              paddingY="32"
              s={{ paddingX: "16", paddingY: "24" }}
              fitHeight
              gap="24"
            >
              <Row hide s={{ hide: false }}>
                <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
              </Row>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuPath(null)}
        side="left"
        size="s"
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16">
          <SideNav current={current} />
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

```tsx components/PageHeader.tsx
import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <Column gap="8">
      <Heading as="h1" textVariant="display-strong-xs">
        {title}
      </Heading>
      <Text textVariant="body-default-m" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  );
}
```

```tsx components/Dashboard.tsx
import { Column, Grid, Heading, Icon, Row, Tag, Text, type IconName } from "@once-ui-system/core";
import {
  activeProjects,
  formatDate,
  lastUpdated,
  projects,
  statusTone,
  totalOpenIssues,
  user,
} from "@/lib/data";

type Stat = { label: string; value: string; hint: string; icon: IconName };

const stats: Stat[] = [
  {
    label: "Open issues",
    value: String(totalOpenIssues),
    hint: `Across ${projects.length} projects`,
    icon: "flag",
  },
  {
    label: "Active projects",
    value: String(activeProjects),
    hint: "Currently receiving updates",
    icon: "folder",
  },
  {
    label: "Last activity",
    value: formatDate(lastUpdated),
    hint: "Most recent project update",
    icon: "calendar",
  },
  {
    label: "Team seats",
    value: "8 of 10",
    hint: "Two seats available on your plan",
    icon: "people",
  },
];

export function Dashboard() {
  const firstName = user.name.split(" ")[0];
  const busiest = projects.reduce((a, b) => (b.issues > a.issues ? b : a), projects[0]);
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Welcome back, {firstName}
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          {busiest.name} has the most open issues right now ({busiest.issues}). Here is where your
          workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="ul" padding="0" margin="0">
        {stats.map((stat) => (
          <Column
            as="li"
            key={stat.label}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="12"
          >
            <Row vertical="center" gap="8">
              <Icon name={stat.icon} size="s" onBackground="neutral-weak" />
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {stat.label}
              </Text>
            </Row>
            <Text textVariant="heading-strong-xl">{stat.value}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {stat.hint}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column gap="16" as="section" aria-labelledby="recent-heading">
        <Heading as="h2" id="recent-heading" textVariant="heading-strong-l">
          Recently updated
        </Heading>
        <Column background="surface" border radius="l" as="ul" padding="0" margin="0">
          {recent.map((project, index) => (
            <Row
              as="li"
              key={project.key}
              paddingX="20"
              paddingY="16"
              gap="16"
              vertical="center"
              wrap
              borderTop={index > 0 ? true : undefined}
            >
              <Column flex={1} gap="4" minWidth={12}>
                <Text textVariant="label-strong-m">{project.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {project.key} · {project.issues} open issues · Updated {formatDate(project.updated)}
                </Text>
              </Column>
              <Tag tone={statusTone[project.status]} label={project.status} size="s" />
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
```

```tsx app/(app)/layout.tsx
import { AppShell } from "@/components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx components/ProjectsTable.tsx
"use client";

import { Row, Table, Tag, Text, type TableColumn } from "@once-ui-system/core";
import { formatDate, projects, statusTone, type Project } from "@/lib/data";

const columns: TableColumn<Project>[] = [
  {
    key: "key",
    header: "Key",
    sortable: true,
    width: "6rem",
    sort: (a, b) => a.key.localeCompare(b.key),
    cell: (row) => <Text textVariant="code-default-s">{row.key}</Text>,
  },
  {
    key: "name",
    header: "Project",
    sortable: true,
    sort: (a, b) => a.name.localeCompare(b.name),
    cell: (row) => <Text textVariant="label-strong-s">{row.name}</Text>,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    sort: (a, b) => a.status.localeCompare(b.status),
    cell: (row) => (
      <Row>
        <Tag tone={statusTone[row.status]} label={row.status} size="s" />
      </Row>
    ),
  },
  {
    key: "issues",
    header: "Open issues",
    sortable: true,
    align: "right",
    sort: (a, b) => a.issues - b.issues,
    cell: (row) => <Text textVariant="body-default-s">{row.issues}</Text>,
  },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    sort: (a, b) => a.updated.localeCompare(b.updated),
    cell: (row) => <Text textVariant="body-default-s">{formatDate(row.updated)}</Text>,
    hide: { s: true },
  },
];

export function ProjectsTable() {
  return (
    <Table<Project>
      aria-label="Projects"
      columns={columns}
      rows={projects}
      getRowId={(row) => row.key}
      defaultSort={{ key: "updated", direction: "desc" }}
      searchable
      searchPlaceholder="Search projects"
      matchSearch={(row, query) =>
        `${row.key} ${row.name} ${row.status}`.toLowerCase().includes(query.toLowerCase())
      }
    />
  );
}
```

```tsx app/(app)/projects/page.tsx
import { Column } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsTable } from "@/components/ProjectsTable";

export const metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <Column gap="24">
      <PageHeader
        title="Projects"
        description="Every project in the Acme Labs workspace, with its open issue count and last update."
      />
      <ProjectsTable />
    </Column>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);

  const nameError = name.trim().length === 0;
  const emailError = !/^\S+@\S+\.\S+$/.test(email);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameError || emailError) return;
    addToast({ tone: "success", message: "Settings saved" });
  }

  return (
    <Column as="form" gap="24" onSubmit={onSubmit} noValidate>
      <Column
        as="section"
        aria-labelledby="profile-heading"
        background="surface"
        border
        radius="l"
        padding="24"
        gap="20"
      >
        <Column gap="4">
          <Heading as="h2" id="profile-heading" textVariant="heading-strong-l">
            Profile
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Your role in this workspace is {user.role}.
          </Text>
        </Column>
        <Input
          id="settings-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          errorMessage={nameError ? "Enter your name" : undefined}
        />
        <Input
          id="settings-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          errorMessage={emailError ? "Enter a valid email address" : undefined}
        />
      </Column>

      <Column
        as="section"
        aria-labelledby="notify-heading"
        background="surface"
        border
        radius="l"
        padding="24"
        gap="20"
      >
        <Column gap="4">
          <Heading as="h2" id="notify-heading" textVariant="heading-strong-l">
            Notifications
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Choose which emails Lumen sends to {email || "you"}.
          </Text>
        </Column>
        <Switch
          label="Weekly analytics digest"
          description="A Monday summary of usage and issue trends."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <Switch
          label="Mentions and assignments"
          description="Get notified when someone assigns or mentions you on an issue."
          checked={mentions}
          onCheckedChange={setMentions}
        />
        <Switch
          label="Product release notes"
          description="Occasional news about new Lumen features."
          checked={releases}
          onCheckedChange={setReleases}
        />
      </Column>

      <Row horizontal="end">
        <Button type="submit" label="Save changes" />
      </Row>
    </Column>
  );
}
```

```tsx app/(app)/settings/page.tsx
import { Column } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <Column gap="24" maxWidth="m">
      <PageHeader
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />
      <SettingsForm />
    </Column>
  );
}
```

```tsx app/(app)/reports/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Reports · Lumen" };

const reports = [
  {
    title: "Weekly issue throughput",
    summary: "Issues opened versus closed across all active projects.",
    cadence: "Weekly",
  },
  {
    title: "Feature adoption",
    summary: "How many accounts used each shipped feature in the last 30 days.",
    cadence: "Monthly",
  },
  {
    title: "Cycle time by project",
    summary: "Median time from first commit to a closed issue, per project.",
    cadence: "Weekly",
  },
];

export default function ReportsPage() {
  return (
    <Column gap="24">
      <PageHeader title="Reports" description="Scheduled summaries your team can open or share." />
      <Grid columns="3" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="ul" padding="0" margin="0">
        {reports.map((report) => (
          <Column
            as="li"
            key={report.title}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="12"
          >
            <Heading as="h2" textVariant="heading-strong-m">
              {report.title}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {report.summary}
            </Text>
            <Row>
              <Tag label={report.cadence} size="s" />
            </Row>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
```