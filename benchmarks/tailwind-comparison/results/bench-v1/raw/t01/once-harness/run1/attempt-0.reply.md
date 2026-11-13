The `@/*` alias maps to the project root, so my imports work. One more concern: the `Tag` and `Table` details for the projects list. I'll use the Table with typed columns.

Final files (the `PageHeader` block above is the corrected one):

```ts lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const product = {
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

export type NavLink = { href: string; label: string; icon: IconName };
export type NavEntry = { label: string; icon: IconName; items: NavLink[] };

export const nav: NavEntry[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview", icon: "home" },
      { href: "/reports", label: "Reports", icon: "document" },
    ],
  },
  {
    label: "Workspace",
    icon: "organization",
    items: [
      { href: "/projects", label: "Projects", icon: "folder" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const navLinks: NavLink[] = nav.flatMap((entry) => entry.items);

export type SummaryCard = {
  label: string;
  value: string;
  note: string;
  icon: IconName;
  href: string;
};

const activeProjects = projects.filter((p) => p.status === "Active");
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);

export const summaryCards: SummaryCard[] = [
  {
    label: "Open issues",
    value: String(openIssues),
    note: `Across ${projects.length} projects`,
    icon: "clipboard",
    href: "/projects",
  },
  {
    label: "Active projects",
    value: String(activeProjects.length),
    note: "1 paused, 1 archived",
    icon: "folder",
    href: "/projects",
  },
  {
    label: "Weekly active users",
    value: "2,418",
    note: "Up 6.2% from last week",
    icon: "trendUp",
    href: "/reports",
  },
  {
    label: "Median time to close",
    value: "3.4 days",
    note: "Down from 4.1 days",
    icon: "time",
    href: "/reports",
  },
];

export const recentActivity = [
  { id: "a1", text: "APP-214 moved to In review", who: "Daniel Reyes", when: "2 hours ago" },
  { id: "a2", text: "WEB-87 closed as fixed", who: "Priya Nair", when: "Yesterday" },
  { id: "a3", text: "API-33 assigned to you", who: "Tom Becker", when: "Yesterday" },
  { id: "a4", text: "Mobile beta paused", who: "Maya Okafor", when: "Sep 28" },
];

export const reportsList = [
  { id: "r1", title: "Weekly activation funnel", detail: "Sign-up to first project, last 7 days", updated: "2026-10-14" },
  { id: "r2", title: "Issue throughput", detail: "Opened versus closed per week", updated: "2026-10-13" },
  { id: "r3", title: "Feature adoption", detail: "Share of teams using each feature", updated: "2026-10-10" },
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}
```

```ts lib/sidebar-store.ts
"use client";

import { useSyncExternalStore } from "react";

// A tiny store so the collapsed state survives navigation between routes whose
// layouts each mount the shell.
let collapsed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSidebarCollapsed(next: boolean) {
  collapsed = next;
  listeners.forEach((l) => l());
}

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => collapsed,
    () => false,
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
  Nav,
  NavGroup,
  NavItem,
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
import { nav, navLinks, product, user } from "@/lib/data";
import { setSidebarCollapsed, useSidebarCollapsed } from "@/lib/sidebar-store";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

function FullNav({ current }: { current: string | null }) {
  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((entry) => (
        <NavGroup
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          defaultOpen
          selected={entry.items.some((l) => l.href === current)}
        >
          {entry.items.map((link) => (
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

function RailNav({ current }: { current: string | null }) {
  return (
    <Column as="nav" aria-label="Main" gap="16" paddingX="8" horizontal="center">
      {nav.map((entry) => (
        <Column key={entry.label} as="ul" gap="4" horizontal="center" fillWidth role="group" aria-label={entry.label}>
          {entry.items.map((link) => (
            <Row as="li" key={link.href}>
              <IconButton
                icon={link.icon}
                variant={link.href === current ? "secondary" : "ghost"}
                href={link.href}
                tooltip={`${entry.label}: ${link.label}`}
                tooltipPosition="right"
                aria-label={`${entry.label}: ${link.label}`}
                aria-current={link.href === current ? "page" : undefined}
              />
            </Row>
          ))}
        </Column>
      ))}
    </Column>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((l) => l.href),
  );
  const collapsed = useSidebarCollapsed();
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const group = nav.find((entry) => entry.items.some((l) => l.href === current));
  const page = navLinks.find((l) => l.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: "Pages",
    keywords: link.label.toLowerCase(),
    href: link.href,
    icon: link.icon,
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option
        value="settings"
        label="Account settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  const menuOpen = menuPath === pathname;

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
        <Row gap="8" vertical="center">
          <Icon name="sparkle" onBackground="brand-medium" />
          <Text textVariant="heading-strong-s">{product.name}</Text>
        </Row>
        <Row flex={1} paddingLeft="16" s={{ hide: true }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} hide s={{ hide: false }} />
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

      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "4rem" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          gap="8"
          transition="macro-medium"
        >
          <Row paddingX="8" horizontal={collapsed ? "center" : "end"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setSidebarCollapsed(!collapsed)}
            />
          </Row>
          {collapsed ? <RailNav current={current} /> : <FullNav current={current} />}
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="32" gap="24" fitHeight s={{ paddingX: "16" }}>
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
          <FullNav current={current} />
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

```tsx components/PageHeader.tsx
import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Column gap="8">
      <Heading as="h1" textVariant="display-strong-xs">
        {title}
      </Heading>
      {description ? (
        <Text onBackground="neutral-weak" textVariant="body-default-m">
          {description}
        </Text>
      ) : null}
    </Column>
  );
}
```

```tsx components/ProjectsTable.tsx
"use client";

import { Row, Table, type TableColumn, Tag, Text } from "@once-ui-system/core";
import { formatDate, type Project, type ProjectStatus, projects } from "@/lib/data";

const statusTone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

const columns: TableColumn<Project>[] = [
  {
    key: "key",
    header: "Key",
    sortable: true,
    sort: (a, b) => a.key.localeCompare(b.key),
    cell: (row) => <Text textVariant="code-default-s">{row.key}</Text>,
    width: "6rem",
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
    cell: (row) => (
      <Row>
        <Tag tone={statusTone[row.status]} size="s" label={row.status} />
      </Row>
    ),
  },
  {
    key: "issues",
    header: "Open issues",
    align: "right",
    sortable: true,
    sort: (a, b) => a.issues - b.issues,
    cell: (row) => <Text>{row.issues}</Text>,
  },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    sort: (a, b) => a.updated.localeCompare(b.updated),
    cell: (row) => <Text>{formatDate(row.updated)}</Text>,
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
      searchable
      searchPlaceholder="Search projects"
      matchSearch={(row, q) =>
        `${row.key} ${row.name} ${row.status}`.toLowerCase().includes(q.toLowerCase())
      }
      defaultSort={{ key: "updated", direction: "desc" }}
    />
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SummaryLink } from "@/components/SummaryLink";
import { product, recentActivity, summaryCards, user } from "@/lib/data";

export default function Page() {
  return (
    <AppShell>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`Here is how things look across your workspace today. ${product.tagline}.`}
      />

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="section" aria-label="Summary">
        {summaryCards.map((card) => (
          <SummaryLink key={card.label} card={card} />
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="activity-title">
        <Heading as="h2" id="activity-title" textVariant="heading-strong-m">
          Recent activity
        </Heading>
        <Column as="ul" gap="12">
          {recentActivity.map((item) => (
            <Row as="li" key={item.id} horizontal="between" vertical="center" gap="16" wrap>
              <Row gap="12" vertical="center" flex={1}>
                <Icon name="chevronRight" size="xs" onBackground="neutral-weak" />
                <Column>
                  <Text textVariant="label-default-m">{item.text}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {item.who}
                  </Text>
                </Column>
              </Row>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {item.when}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </AppShell>
  );
}
```

```tsx components/SummaryLink.tsx
"use client";

import { Card, Column, Icon, Row, Text } from "@once-ui-system/core";
import type { SummaryCard } from "@/lib/data";

export function SummaryLink({ card }: { card: SummaryCard }) {
  return (
    <Card href={card.href} fillWidth padding="20" radius="l" direction="column" gap="12" aria-label={`${card.label}: ${card.value}. ${card.note}`}>
      <Row horizontal="between" vertical="center" fillWidth>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {card.label}
        </Text>
        <Icon name={card.icon} size="s" onBackground="neutral-weak" />
      </Row>
      <Column gap="4">
        <Text textVariant="display-strong-xs">{card.value}</Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {card.note}
        </Text>
      </Column>
    </Card>
  );
}
```

```tsx app/projects/layout.tsx
import { AppShell } from "@/components/AppShell";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { Row, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { ProjectsTable } from "@/components/ProjectsTable";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the Acme Labs workspace, with its open issue count."
      />
      <Row gap="12" vertical="center" wrap>
        <Tag tone="success" size="s" label={`${active} active`} />
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {projects.length} projects in total
        </Text>
      </Row>
      <ProjectsTable />
    </>
  );
}
```

```tsx app/reports/layout.tsx
import { AppShell } from "@/components/AppShell";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, reportsList } from "@/lib/data";

export const metadata: Metadata = { title: "Reports · Lumen" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Saved analytics reports for your team, refreshed every morning."
      />
      <Column as="ul" gap="12">
        {reportsList.map((report) => (
          <Row
            as="li"
            key={report.id}
            background="surface"
            border
            radius="l"
            padding="20"
            horizontal="between"
            vertical="center"
            gap="16"
            wrap
          >
            <Column gap="4" flex={1}>
              <Heading as="h2" textVariant="heading-strong-s">
                {report.title}
              </Heading>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {report.detail}
              </Text>
            </Column>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Updated {formatDate(report.updated)}
            </Text>
          </Row>
        ))}
      </Column>
    </>
  );
}
```

```tsx app/settings/layout.tsx
import { AppShell } from "@/components/AppShell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile and how Lumen keeps you informed."
      />
      <SettingsForm />
    </>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Tag, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToast({ variant: "success", message: "Settings saved." });
  };

  return (
    <Column as="form" gap="24" maxWidth="m" onSubmit={onSubmit} aria-label="Account settings">
      <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="profile-title">
        <Row horizontal="between" vertical="center" gap="12" wrap>
          <Heading as="h2" id="profile-title" textVariant="heading-strong-m">
            Profile
          </Heading>
          <Tag tone="brand" size="s" label={user.role} />
        </Row>
        <Input id="settings-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          id="settings-email"
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="20" as="section" aria-labelledby="notify-title">
        <Column gap="4">
          <Heading as="h2" id="notify-title" textVariant="heading-strong-m">
            Notifications
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Choose which updates reach your inbox.
          </Text>
        </Column>
        <Switch
          id="notify-weekly"
          label="Weekly analytics summary"
          description="A Monday email with last week's key numbers."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <Switch
          id="notify-mentions"
          label="Mentions and assignments"
          description="Get notified when someone assigns or mentions you on an issue."
          checked={mentions}
          onCheckedChange={setMentions}
        />
        <Switch
          id="notify-digest"
          label="Daily issue digest"
          description="One email each evening listing issues that changed."
          checked={digest}
          onCheckedChange={setDigest}
        />
      </Column>

      <Row gap="12" horizontal="end">
        <Button type="submit" label="Save changes" prefixIcon="check" />
      </Row>
    </Column>
  );
}
```