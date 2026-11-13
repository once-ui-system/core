`app/page.tsx` and `app/(app)/page.tsx` would both resolve to `/`, and Next.js fails the build on that conflict. So the dashboard stays in `app/page.tsx`, and the shell mounts once from a client component that every route renders.

The simplest correct way to keep one shell instance is a **template-free shared wrapper**: `app/page.tsx` renders `<AppShell>` itself, and `app/(app)/layout.tsx` renders the same `<AppShell>` for the other routes. These are two different tree positions, so React remounts the shell when navigating between `/` and `/projects`. To keep the sidebar's collapsed state across that remount, the shell stores the preference in `sessionStorage`, as I noted earlier.

Here is the full app.

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
export type NavGroupDef = { label: string; icon: IconName; items: NavLink[] };

export const navGroups: NavGroupDef[] = [
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

export const navLinks: NavLink[] = navGroups.flatMap((g) => g.items);

export const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export const statusTone = (status: ProjectStatus): "success" | "warning" | "neutral" =>
  status === "Active" ? "success" : status === "Paused" ? "warning" : "neutral";

export const summary = [
  { label: "Open issues", value: projects.reduce((n, p) => n + p.issues, 0), hint: "Across 5 projects", icon: "inbox" as const },
  { label: "Active projects", value: projects.filter((p) => p.status === "Active").length, hint: "1 paused, 1 archived", icon: "folder" as const },
  { label: "Weekly active users", value: 1284, hint: "+6.2% vs last week", icon: "people" as const },
  { label: "Median time to fix", value: "2.4 days", hint: "Down from 3.1 days", icon: "time" as const },
];

export const recentActivity = [
  { text: "Customer app: 3 issues closed", when: "Oct 14, 2026" },
  { text: "Marketing site: pricing page published", when: "Oct 12, 2026" },
  { text: "Public API: rate-limit issue opened", when: "Oct 9, 2026" },
];
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
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navGroups, navLinks, product, user } from "@/lib/data";

const COLLAPSE_KEY = "lumen:sidebar-collapsed";

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

  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore the collapsed preference after mount (the shell remounts between "/" and other routes).
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.sessionStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const group = navGroups.find((g) => g.items.some((l) => l.href === current));
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
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  const expandedNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {navGroups.map((entry) => (
        <NavGroup
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          defaultOpen
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

  // Collapsed rail: every destination stays reachable as an icon with a tooltip and an accessible name.
  const collapsedNav = (
    <Column as="nav" aria-label="Main" gap="4" paddingX="8" horizontal="center">
      {navGroups.map((entry, index) => (
        <Column key={entry.label} gap="2" horizontal="center" role="group" aria-label={entry.label}>
          {index > 0 ? <Row height="1" width="24" background="neutral-alpha-weak" marginY="8" /> : null}
          {entry.items.map((link) => (
            <IconButton
              key={link.href}
              href={link.href}
              icon={link.icon}
              variant={link.href === current ? "secondary" : "ghost"}
              tooltip={`${entry.label}: ${link.label}`}
              tooltipPosition="right"
              aria-label={`${entry.label}: ${link.label}`}
              aria-current={link.href === current ? "page" : undefined}
            />
          ))}
        </Column>
      ))}
    </Nav>
  );

  const menuOpen = menuPath === pathname;

  return (
    <Column fill flex={1}>
      <VisuallyHiddenSkip />
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
            onClick={toggleCollapsed}
          />
        </Row>
        <Text textVariant="heading-strong-s">{product.name}</Text>
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

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          transition="macro-short"
        >
          {collapsed ? collapsedNav : expandedNav}
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
            <Column fillWidth maxWidth="xl" paddingX="24" paddingY="32" s={{ paddingX: "16", paddingY: "24" }} fitHeight>
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
          {expandedNav}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}

function VisuallyHiddenSkip() {
  return (
    <a
      href="#main"
      style={{
        position: "absolute",
        left: -9999,
        top: 0,
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = "8px";
        e.currentTarget.style.top = "8px";
        e.currentTarget.style.zIndex = "10";
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = "-9999px";
      }}
    >
      Skip to content
    </a>
  );
}
```

```tsx components/PageHeader.tsx
import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <Column gap="8" flex={1} minWidth={16}>
        <Heading as="h1" textVariant="display-strong-xs">
          {title}
        </Heading>
        {description ? (
          <Text onBackground="neutral-weak" textVariant="body-default-m">
            {description}
          </Text>
        ) : null}
      </Column>
      {actions}
    </div>
  );
}
```

```tsx components/Dashboard.tsx
import { Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { projects, recentActivity, statusTone, summary, user } from "@/lib/data";

export function Dashboard() {
  const firstName = user.name.split(" ")[0];
  const active = projects.filter((p) => p.status === "Active");

  return (
    <Column gap="32">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is how your workspace is doing today."
      />

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="ul" padding="0" margin="0">
        {summary.map((item) => (
          <Column
            as="li"
            key={item.label}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="12"
          >
            <Row horizontal="between" vertical="center">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {item.label}
              </Text>
              <Icon name={item.icon} size="s" onBackground="neutral-weak" />
            </Row>
            <Text textVariant="display-strong-xs">{item.value}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {item.hint}
            </Text>
          </Column>
        ))}
      </Grid>

      <Grid columns="2" s={{ columns: 1 }} gap="16">
        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" textVariant="heading-strong-m">
            Active projects
          </Heading>
          <Column as="ul" gap="12" padding="0" margin="0">
            {active.map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" gap="12">
                <Column gap="2">
                  <Text textVariant="label-strong-m">{p.name}</Text>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
                    {p.key} · {p.issues} open issues
                  </Text>
                </Column>
                <Tag tone={statusTone(p.status)} label={p.status} size="s" />
              </Row>
            ))}
          </Column>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" textVariant="heading-strong-m">
            Recent activity
          </Heading>
          <Column as="ul" gap="12" padding="0" margin="0">
            {recentActivity.map((item) => (
              <Column as="li" key={item.text} gap="2">
                <Text textVariant="label-default-m">{item.text}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {item.when}
                </Text>
              </Column>
            ))}
          </Column>
        </Column>
      </Grid>
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

```tsx app/(app)/projects/page.tsx
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, projects, statusTone } from "@/lib/data";

export const metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <Column gap="32">
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <Column as="ul" gap="12" padding="0" margin="0">
        {projects.map((p) => (
          <Row
            as="li"
            key={p.key}
            background="surface"
            border
            radius="l"
            padding="16"
            gap="16"
            vertical="center"
            wrap
          >
            <Row
              width="40"
              height="40"
              radius="m"
              background="brand-alpha-weak"
              center
              aria-hidden="true"
            >
              <Text textVariant="label-strong-s" onBackground="brand-strong">
                {p.key}
              </Text>
            </Row>
            <Column flex={1} minWidth={12} gap="2">
              <Heading as="h2" textVariant="heading-strong-s">
                {p.name}
              </Heading>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Updated {formatDate(p.updated)}
              </Text>
            </Column>
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {p.issues} {p.issues === 1 ? "issue" : "issues"}
            </Text>
            <Tag tone={statusTone(p.status)} label={p.status} size="s" />
          </Row>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx app/(app)/reports/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Reports · Lumen" };

const reports = [
  { title: "Weekly issue throughput", body: "Issues opened and closed per project, delivered every Monday." },
  { title: "Release health", body: "Crash-free sessions and regressions for each shipped build." },
  { title: "Team workload", body: "Open issues per assignee, to spot overloaded teammates early." },
];

export default function ReportsPage() {
  return (
    <Column gap="32">
      <PageHeader
        title="Reports"
        description="Scheduled summaries for your team."
      />
      <Column as="ul" gap="12" padding="0" margin="0">
        {reports.map((r) => (
          <Column
            as="li"
            key={r.title}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="4"
          >
            <Heading as="h2" textVariant="heading-strong-s">
              {r.title}
            </Heading>
            <Text onBackground="neutral-weak" textVariant="body-default-s">
              {r.body}
            </Text>
          </Column>
        ))}
      </Column>
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
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [product, setProduct] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addToast({ tone: "success", message: "Settings saved" });
  };

  return (
    <Column as="form" onSubmit={onSubmit} gap="24" maxWidth="m">
      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input
          id="settings-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          id="settings-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Your role in this workspace: {user.role}
        </Text>
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Switch
          id="settings-digest"
          label="Weekly digest"
          description="A Monday summary of activity across your projects."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <Switch
          id="settings-alerts"
          label="Issue alerts"
          description="Email me when an issue is assigned to me."
          checked={alerts}
          onCheckedChange={setAlerts}
        />
        <Switch
          id="settings-product"
          label="Product news"
          description="Occasional updates about new Lumen features."
          checked={product}
          onCheckedChange={setProduct}
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
    <Column gap="32">
      <PageHeader
        title="Settings"
        description="Manage your profile and how Lumen contacts you."
      />
      <SettingsForm />
    </Column>
  );
}
```

One correction is needed in `components/AppShell.tsx`. In the collapsed rail I closed a `Column as="nav"` with `</Nav>`, which is a JSX mismatch and fails to compile. Here is the corrected file, with a proper skip link (using `VisuallyHidden` from the library) in place of the inline-style one:

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
import { useEffect, useState } from "react";
import { navGroups, navLinks, product, user } from "@/lib/data";

const COLLAPSE_KEY = "lumen:sidebar-collapsed";

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

  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // The shell mounts per route tree ("/" vs the (app) group), so the collapsed
  // preference is restored from sessionStorage after mount.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.sessionStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  };

  const group = navGroups.find((g) => g.items.some((l) => l.href === current));
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
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  const expandedNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {navGroups.map((entry) => (
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
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );

  // Collapsed rail: every destination stays reachable as an icon with a tooltip
  // and an accessible name that includes its group.
  const collapsedNav = (
    <Column as="nav" aria-label="Main" gap="4" paddingX="8" horizontal="center">
      {navGroups.map((entry, index) => (
        <Column
          key={entry.label}
          gap="2"
          horizontal="center"
          role="group"
          aria-label={entry.label}
        >
          {index > 0 ? (
            <Row height="1" width="24" background="neutral-alpha-weak" marginY="8" />
          ) : null}
          {entry.items.map((link) => (
            <IconButton
              key={link.href}
              href={link.href}
              icon={link.icon}
              variant={link.href === current ? "secondary" : "ghost"}
              tooltip={`${entry.label}: ${link.label}`}
              tooltipPosition="right"
              aria-label={`${entry.label}: ${link.label}`}
              aria-current={link.href === current ? "page" : undefined}
            />
          ))}
        </Column>
      ))}
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
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={toggleCollapsed}
          />
        </Row>
        <Text textVariant="heading-strong-s">{product.name}</Text>
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

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          transition="macro-short"
        >
          {collapsed ? collapsedNav : expandedNav}
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
              fillWidth
              maxWidth="xl"
              paddingX="24"
              paddingY="32"
              s={{ paddingX: "16", paddingY: "24" }}
              fitHeight
            >
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
          {expandedNav}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```