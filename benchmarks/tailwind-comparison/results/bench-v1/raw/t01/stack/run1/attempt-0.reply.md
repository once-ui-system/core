I have enough. Design decisions:

-   **Routing:** `/` (dashboard), `/projects`, `/settings`, plus `/reports` so the "Reports" nav item isn't a dead link. "Overview" → `/`. One route group `(lumen)` holds the layout; the root `src/app/page.tsx` is deleted by moving the dashboard into `(lumen)/page.tsx`. I can't delete files, so I'll overwrite `src/app/page.tsx` as a server redirect-free re-export of the dashboard component, and the group layout can't cover it. Instead, I'll make `src/app/page.tsx` the dashboard wrapped in the shell, and share one `AppShell` component with the group layout.
-   **Collapse:** `Nav collapsed` plus a toggle. Because `/` mounts its own `AppShell` instance, I'll persist the collapsed flag in `localStorage` via `useSyncExternalStore` so it survives navigation without an effect/hydration mismatch.
-   **Nav in rail:** collapsed items need accessible names; I'll wrap each top-level group in a tooltip-capable icon `NavItem` fallback by rendering icon-only `IconButton` links when collapsed.

Writing the files now.

```ts src/lib/data.ts
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

export const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

/** "2026-10-14" -> "14 Oct 2026". Fixed locale and UTC so server and client agree. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export type NavLink = { href: string; label: string; icon?: IconName };
export type NavGroupDef = { label: string; icon: IconName; items: NavLink[] };
export type NavEntry = NavLink | NavGroupDef;

export const nav: NavEntry[] = [
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

export function isGroup(entry: NavEntry): entry is NavGroupDef {
  return "items" in entry;
}

export const navLinks: NavLink[] = nav.flatMap((entry) => (isGroup(entry) ? entry.items : [entry]));

export const summary = {
  openIssues: projects.reduce((total, p) => total + p.issues, 0),
  activeProjects: projects.filter((p) => p.status === "Active").length,
  totalProjects: projects.length,
  lastUpdated: projects.reduce((latest, p) => (p.updated > latest ? p.updated : latest), ""),
};

export const recentActivity = [
  { id: "a1", text: "Issue APP-142 moved to In review", when: "Today" },
  { id: "a2", text: "WEB-57 closed by Dan Whitfield", when: "Yesterday" },
  { id: "a3", text: "API-23 flagged as high priority", when: "12 Oct" },
];
```

```tsx src/components/lumen/AppShell.tsx
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
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { isGroup, nav, navLinks, product, user } from "@/lib/data";

const STORAGE_KEY = "lumen:sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readCollapsed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // storage unavailable: the toggle still works for this session below
  }
  for (const listener of listeners) listener();
}

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
    navLinks.map((link) => link.href),
  );

  // Server snapshot is always "expanded", so hydration matches.
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const toggleCollapsed = useCallback(() => writeCollapsed(!readCollapsed()), []);

  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [searchOpen, setSearchOpen] = useState(false);

  const group = nav.find((entry) => isGroup(entry) && entry.items.some((l) => l.href === current));
  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: "Pages",
    shortcut: [],
    keywords: link.label.toLowerCase(),
    href: link.href,
    icon: link.icon ?? (isGroupOf(link.href)?.icon ?? "home"),
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">{user.name}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option
        value="settings"
        label="Settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  /** Full navigation: used in the desktop sidebar (expanded) and the phone drawer. */
  const fullNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((entry) =>
        isGroup(entry) ? (
          <NavGroup
            key={entry.label}
            label={entry.label}
            icon={entry.icon}
            defaultOpen={entry.items.some((l) => l.href === current)}
          >
            {entry.items.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                selected={link.href === current}
              />
            ))}
          </NavGroup>
        ) : (
          <NavItem
            key={entry.href}
            href={entry.href}
            icon={entry.icon}
            label={entry.label}
            selected={entry.href === current}
          />
        ),
      )}
    </Nav>
  );

  /**
   * Collapsed rail: every destination stays reachable as an icon link with a
   * tooltip and an accessible name made of the group and the page.
   */
  const railNav = (
    <Nav fill padding="8" density="compact" aria-label="Main" horizontal="center" gap="4">
      {nav.flatMap((entry) =>
        isGroup(entry)
          ? entry.items.map((link) => (
              <IconButton
                key={link.href}
                href={link.href}
                icon={railIcon(link.href)}
                variant={link.href === current ? "secondary" : "ghost"}
                tooltip={`${entry.label}: ${link.label}`}
                tooltipPosition="right"
                aria-label={`${entry.label}: ${link.label}`}
                aria-current={link.href === current ? "page" : undefined}
              />
            ))
          : [
              <IconButton
                key={entry.href}
                href={entry.href}
                icon={entry.icon ?? "home"}
                variant={entry.href === current ? "secondary" : "ghost"}
                tooltip={entry.label}
                tooltipPosition="right"
                aria-label={entry.label}
                aria-current={entry.href === current ? "page" : undefined}
              />,
            ],
      )}
    </Nav>
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
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          />
        </Row>
        <Text variant="heading-strong-s">{product.name}</Text>
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
        <Row s={{ hide: true }}>
          <UserMenu
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <UserMenu placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      {/* Breadcrumb on phones, where the header has no room for it. */}
      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? 4 : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          {collapsed ? railNav : fullNav}
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            as="main"
            id="main"
            tabIndex={-1}
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
            border
          >
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="32" s={{ paddingX: "16" }} fitHeight>
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
          {fullNav}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}

function isGroupOf(href: string) {
  for (const entry of nav) {
    if (isGroup(entry) && entry.items.some((l) => l.href === href)) return entry;
  }
  return undefined;
}

function railIcon(href: string) {
  return isGroupOf(href)?.icon ?? "home";
}
```

```tsx src/app/(lumen)/layout.tsx
import { AppShell } from "@/components/lumen/AppShell";

export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx src/app/page.tsx
import { AppShell } from "@/components/lumen/AppShell";
import { Dashboard } from "@/components/lumen/Dashboard";

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
```

```tsx src/components/lumen/Dashboard.tsx
import { Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { formatDate, product, recentActivity, summary, user } from "@/lib/data";

type Card = { label: string; value: string; hint: string; icon: IconName };

const cards: Card[] = [
  {
    label: "Open issues",
    value: String(summary.openIssues),
    hint: "Across all projects",
    icon: "flag",
  },
  {
    label: "Active projects",
    value: `${summary.activeProjects} of ${summary.totalProjects}`,
    hint: "Currently in progress",
    icon: "folder",
  },
  {
    label: "Last activity",
    value: formatDate(summary.lastUpdated),
    hint: "Most recent project update",
    icon: "calendar",
  },
];

export function Dashboard() {
  const firstName = user.name.split(" ")[0];
  return (
    <Column gap="32" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Here is where things stand in {product.name} today.
        </Text>
      </Column>

      <Grid columns="3" s={{ columns: 1 }} m={{ columns: 2 }} gap="16" fillWidth>
        {cards.map((card) => (
          <Column
            key={card.label}
            as="section"
            aria-label={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="12"
          >
            <Row vertical="center" gap="8" onBackground="neutral-weak">
              <Icon name={card.icon} size="s" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
            </Row>
            <Heading as="p" variant="display-strong-xs">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.hint}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="recent-heading">
        <Row horizontal="between" vertical="center">
          <Heading as="h2" id="recent-heading" variant="heading-strong-m">
            Recent activity
          </Heading>
          <Tag size="s" label={`${user.role} view`} />
        </Row>
        <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
          {recentActivity.map((item) => (
            <Row as="li" key={item.id} horizontal="between" vertical="center" gap="16" wrap>
              <Text variant="body-default-m">{item.text}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {item.when}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx src/app/(lumen)/reports/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { product } from "@/lib/data";

export default function ReportsPage() {
  return (
    <Column gap="16" fillWidth>
      <Heading as="h1" variant="display-strong-xs">
        Reports
      </Heading>
      <Column background="surface" border radius="l" padding="24" gap="8">
        <Heading as="h2" variant="heading-strong-m">
          No reports scheduled
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {product.name} will email a weekly summary of issues opened and closed once you schedule
          your first report.
        </Text>
      </Column>
    </Column>
  );
}
```

```tsx src/app/(lumen)/projects/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectsTable } from "@/components/lumen/ProjectsTable";

export default function ProjectsPage() {
  return (
    <Column gap="24" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Every project in your workspace, with its open issue count and when it last changed.
        </Text>
      </Column>
      <ProjectsTable />
    </Column>
  );
}
```

```tsx src/components/lumen/ProjectsTable.tsx
"use client";

import { Column, Row, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusScheme } from "@/lib/data";

export function ProjectsTable() {
  const data = {
    headers: [
      { content: "Project", key: "name", sortable: true },
      { content: "Key", key: "key", sortable: true, hide: { s: true } },
      { content: "Status", key: "status", sortable: true },
      { content: "Open issues", key: "issues", sortable: true, align: "right" as const },
      { content: "Updated", key: "updated", sortable: true, hide: { s: true } },
    ],
    rows: projects.map((project) => [
      <Row key="n" gap="8" vertical="center">
        <Text variant="label-strong-s">{project.name}</Text>
      </Row>,
      <Text key="k" variant="code-default-s" onBackground="neutral-weak">
        {project.key}
      </Text>,
      <Tag key="s" size="s" scheme={statusScheme[project.status]} label={project.status} />,
      <Text key="i" variant="body-default-s">
        {project.issues}
      </Text>,
      <Text key="u" variant="body-default-s" onBackground="neutral-weak">
        {formatDate(project.updated)}
      </Text>,
    ]),
  };

  return (
    <Column fillWidth overflowX="auto">
      <Table data={data} searchable searchPlaceholder="Search projects" />
    </Column>
  );
}
```

```tsx src/app/(lumen)/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "@/components/lumen/SettingsForm";

export default function SettingsPage() {
  return (
    <Column gap="24" fillWidth maxWidth="m">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Manage your profile and how Lumen keeps you informed.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
```

```tsx src/components/lumen/SettingsForm.tsx
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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToast({ variant: "success", message: "Settings saved" });
  };

  return (
    <form onSubmit={onSubmit} aria-label="Account settings">
      <Column gap="24">
        <Column as="section" aria-labelledby="profile-heading" background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" id="profile-heading" variant="heading-strong-m">
            Profile
          </Heading>
          <Input
            id="settings-name"
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            id="settings-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Your role in this workspace: {user.role}
          </Text>
        </Column>

        <Column as="section" aria-labelledby="notify-heading" background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" id="notify-heading" variant="heading-strong-m">
            Notifications
          </Heading>
          <Row horizontal="between" vertical="center" gap="16">
            <Column gap="4" flex={1}>
              <Text variant="label-strong-s" id="weekly-label">
                Weekly summary
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                A Monday email with issues opened and closed.
              </Text>
            </Column>
            <Switch
              isChecked={weekly}
              onToggle={() => setWeekly((value) => !value)}
              aria-labelledby="weekly-label"
            />
          </Row>
          <Row horizontal="between" vertical="center" gap="16">
            <Column gap="4" flex={1}>
              <Text variant="label-strong-s" id="mentions-label">
                Mentions
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Notify me when someone mentions me on an issue.
              </Text>
            </Column>
            <Switch
              isChecked={mentions}
              onToggle={() => setMentions((value) => !value)}
              aria-labelledby="mentions-label"
            />
          </Row>
        </Column>

        <Row horizontal="end">
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>
    </form>
  );
}
```

Two corrections before finishing: `Switch` takes `checked` and `onToggle`, not `isChecked`, and the `isGroupOf(...)` expression in `commands` is clumsy. Here are the corrected files.

```tsx src/components/lumen/SettingsForm.tsx
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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToast({ variant: "success", message: "Settings saved" });
  };

  return (
    <form onSubmit={onSubmit} aria-label="Account settings">
      <Column gap="24">
        <Column
          as="section"
          aria-labelledby="profile-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
        >
          <Heading as="h2" id="profile-heading" variant="heading-strong-m">
            Profile
          </Heading>
          <Input
            id="settings-name"
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            id="settings-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Your role in this workspace: {user.role}
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="notify-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
        >
          <Heading as="h2" id="notify-heading" variant="heading-strong-m">
            Notifications
          </Heading>
          <Row horizontal="between" vertical="center" gap="16">
            <Column gap="4" flex={1}>
              <Text variant="label-strong-s" id="weekly-label">
                Weekly summary
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                A Monday email with issues opened and closed.
              </Text>
            </Column>
            <Switch
              checked={weekly}
              onToggle={(checked) => setWeekly(checked)}
              aria-labelledby="weekly-label"
            />
          </Row>
          <Row horizontal="between" vertical="center" gap="16">
            <Column gap="4" flex={1}>
              <Text variant="label-strong-s" id="mentions-label">
                Mentions
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Notify me when someone mentions me on an issue.
              </Text>
            </Column>
            <Switch
              checked={mentions}
              onToggle={(checked) => setMentions(checked)}
              aria-labelledby="mentions-label"
            />
          </Row>
        </Column>

        <Row horizontal="end">
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>
    </form>
  );
}
```

```tsx src/components/lumen/AppShell.tsx
"use client";

import {
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Kbar,
  type IconName,
  type KbarItem,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";
import { isGroup, nav, navLinks, product, user } from "@/lib/data";

const STORAGE_KEY = "lumen:sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readCollapsed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // storage unavailable: nothing to persist
  }
  for (const listener of listeners) listener();
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The icon of the group a link lives in, for the collapsed rail and the palette. */
function groupIconOf(href: string): IconName {
  for (const entry of nav) {
    if (isGroup(entry) && entry.items.some((l) => l.href === href)) return entry.icon;
  }
  return "home";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );

  // The server snapshot is always "expanded", so hydration matches.
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const toggleCollapsed = useCallback(() => writeCollapsed(!readCollapsed()), []);

  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [searchOpen, setSearchOpen] = useState(false);

  const group = nav.find((entry) => isGroup(entry) && entry.items.some((l) => l.href === current));
  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: "Pages",
    shortcut: [],
    keywords: link.label.toLowerCase(),
    href: link.href,
    icon: link.icon ?? groupIconOf(link.href),
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">{user.name}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option
        value="settings"
        label="Settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  /** Full navigation: the expanded desktop sidebar and the phone drawer. */
  const fullNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((entry) =>
        isGroup(entry) ? (
          <NavGroup
            key={entry.label}
            label={entry.label}
            icon={entry.icon}
            defaultOpen={entry.items.some((l) => l.href === current)}
          >
            {entry.items.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                selected={link.href === current}
              />
            ))}
          </NavGroup>
        ) : (
          <NavItem
            key={entry.href}
            href={entry.href}
            icon={entry.icon}
            label={entry.label}
            selected={entry.href === current}
          />
        ),
      )}
    </Nav>
  );

  /**
   * Collapsed rail: every destination stays reachable as an icon link whose
   * tooltip and accessible name are the group and the page.
   */
  const railNav = (
    <Nav fill padding="8" density="compact" aria-label="Main" horizontal="center" gap="4">
      {navLinks.map((link) => {
        const groupLabel = nav.find((e) => isGroup(e) && e.items.some((l) => l.href === link.href))
          ?.label;
        const name = groupLabel ? `${groupLabel}: ${link.label}` : link.label;
        return (
          <IconButton
            key={link.href}
            href={link.href}
            icon={link.icon ?? groupIconOf(link.href)}
            variant={link.href === current ? "secondary" : "ghost"}
            tooltip={name}
            tooltipPosition="right"
            aria-label={name}
            aria-current={link.href === current ? "page" : undefined}
          />
        );
      })}
    </Nav>
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
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          />
        </Row>
        <Text variant="heading-strong-s">{product.name}</Text>
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
        <Row s={{ hide: true }}>
          <UserMenu
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <UserMenu placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      {/* On phones the header has no room for the trail, so it sits below. */}
      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? 4 : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          {collapsed ? railNav : fullNav}
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="32" s={{ paddingX: "16" }} fitHeight>
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
          {fullNav}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```