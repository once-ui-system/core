```css app/fonts.css
/* System font stacks only (no network font fetch). Headings are rounded and friendly. */
:root {
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;
}
```

```tsx app/providers.tsx
"use client";

// Lumen's identity lives here, in the design system's own ThemeProvider:
// brand #DB2777 (primary buttons, current nav item, links, focus rings),
// warm sand neutrals, the roundest corner style, light by default, airy density.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider
        theme="system"
        defaultTheme="light"
        brand="custom"
        brandSeed="#DB2777"
        accent="orange"
        neutral="sand"
        solid="color"
        solidStyle="flat"
        border="rounded"
        surface="filled"
        density="spacious"
        transition="all"
      >
        <DataThemeProvider>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
```

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

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export type NavLink = { href: string; label: string };
export type NavGroupData = { label: string; icon: IconName; items: NavLink[] };

export const nav: NavGroupData[] = [
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
  Logo,
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
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const group = nav.find((g) => g.items.some((l) => l.href === current));
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
    shortcut: [],
    keywords: link.label.toLowerCase(),
    href: link.href,
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

  const renderNav = (isCollapsed: boolean) => (
    <Nav fill paddingX="8" collapsed={isCollapsed} aria-label="Main">
      {nav.map((entry) => (
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
              aria-label={link.label}
              selected={link.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );

  return (
    <Column fill flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row as="header" height="64" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-label="Open navigation menu"
            aria-expanded={menuPath === pathname}
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
            onClick={() => setCollapsed((c) => !c)}
          />
        </Row>
        <Row minWidth="10rem" s={{ minWidth: 0 }}>
          <Logo text={product.name} monogram size="s" href="/" />
        </Row>
        <Row flex={1} s={{ hide: true }}>
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
          maxWidth={collapsed ? "5rem" : "16rem"}
          minWidth={collapsed ? "5rem" : "16rem"}
          fitHeight
          position="sticky"
          top="64"
        >
          {renderNav(collapsed)}
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
            <Column maxWidth="xl" paddingX="24" paddingY="40" gap="32" fitHeight>
              <Row hide s={{ hide: false }}>
                <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
              </Row>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer
        open={menuPath === pathname}
        onClose={() => setMenuPath(null)}
        side="left"
        size="s"
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16">
          {renderNav(false)}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { AppShell } from "@/components/AppShell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "@/lib/data";

const active = projects.filter((p) => p.status === "Active");
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

const cards = [
  { label: "Active projects", value: String(active.length), note: `of ${projects.length} in your workspace` },
  { label: "Open issues", value: String(openIssues), note: "across every project" },
  { label: "Busiest project", value: "Customer app", note: "31 open issues" },
  { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
];

export default function DashboardPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Here is how your team is doing today. Nice work keeping things moving.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="20">
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="l" padding="24" gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Text as="p" textVariant="heading-strong-xl">
              {card.value}
            </Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-l">
          Recently updated
        </Heading>
        <Column as="ul" gap="12" margin="0" padding="0">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" gap="16" wrap>
                <Row gap="12" vertical="center">
                  <Tag label={p.key} size="s" />
                  <Text textVariant="label-strong-m">{p.name}</Text>
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {formatDate(p.updated)}
                </Text>
              </Row>
            ))}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx app/reports/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Reports
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Share of open issues by project.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="24" gap="16">
        {projects.map((p) => (
          <Column key={p.key} gap="8">
            <Text textVariant="label-strong-m">
              {p.name}: {p.issues} open ({total ? Math.round((p.issues / total) * 100) : 0}%)
            </Text>
            <Column background="neutral-alpha-weak" radius="full" height="8" fillWidth overflow="hidden">
              <Column
                background="brand-medium"
                radius="full"
                fillHeight
                style={{ width: `${total ? (p.issues / total) * 100 : 0}%` }}
              />
            </Column>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Column, Heading, Table, type TableColumn, Tag, Text } from "@once-ui-system/core";
import { formatDate, type Project, projects } from "@/lib/data";

const tone = { Active: "success", Paused: "warning", Archived: "neutral" } as const;

const columns: TableColumn<Project>[] = [
  { key: "key", header: "Key", sortable: true, width: "6rem" },
  { key: "name", header: "Project", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <Tag label={row.status} tone={tone[row.status]} size="s" />,
  },
  { key: "issues", header: "Open issues", sortable: true, align: "right" },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    cell: (row) => formatDate(row.updated),
  },
];

export default function ProjectsPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Projects
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          {projects.length} projects in your workspace.
        </Text>
      </Column>
      <Table<Project>
        aria-label="Projects"
        columns={columns}
        rows={projects}
        getRowId={(row) => row.key}
        searchable
        searchPlaceholder="Search projects"
      />
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

  return (
    <Column
      as="form"
      gap="32"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        addToast({ variant: "success", message: "Settings saved" });
      }}
    >
      <Column background="surface" border radius="l" padding="24" gap="20">
        <Heading as="h2" textVariant="heading-strong-l">
          Profile
        </Heading>
        <Input id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Your role in this workspace: {user.role}
        </Text>
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="20">
        <Heading as="h2" textVariant="heading-strong-l">
          Notifications
        </Heading>
        <Switch
          id="weekly"
          label="Weekly digest"
          description="A friendly summary of what your team shipped."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <Switch
          id="mentions"
          label="Mentions"
          description="Tell me when someone mentions me on an issue."
          checked={mentions}
          onCheckedChange={setMentions}
        />
        <Switch
          id="releases"
          label="Product news"
          description="New Lumen features and tips."
          checked={releases}
          onCheckedChange={setReleases}
        />
      </Column>

      <Row>
        <Button type="submit" label="Save changes" />
      </Row>
    </Column>
  );
}
```

```tsx app/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <Column gap="32" maxWidth="m">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Manage your profile and how Lumen keeps you in the loop.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
```
