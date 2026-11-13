```ts lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  description: "Product analytics and issue tracking for small software teams",
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
export type NavEntry = { label: string; icon: IconName; items: NavLink[] };

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

export const navLinks: NavLink[] = nav.flatMap((entry) => entry.items);

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/theme.ts
import type { OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's identity, applied once through the design system's ThemeProvider.
export const style: OnceUIStyleConfig = {
  theme: "system", // stays "system" so the theme switch works
  defaultTheme: "dark", // what a first visit sees
  neutral: "sand", // warm stone grey
  brand: "custom",
  brandSeed: "#E8590C", // primary buttons, current nav item, links, focus rings
  accent: "custom",
  accentSeed: "#E8590C",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "conservative", // small corner radius; exact 4px set in app/fonts.css
  surface: "filled",
  transition: "micro",
  scaling: "100",
  density: "normal",
};
```

```css app/fonts.css
/* System font stacks, no network fetch. Headings in monospace for the control-room feel. */
:root {
  --font-heading: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, "SFMono-Regular", Menlo, monospace;
}

/* Lumen: 4px corners on buttons, inputs, cards and menus. */
:root,
:root[data-border] {
  --radius-xs: 4px;
  --radius-s: 4px;
  --radius-m: 4px;
  --radius-l: 4px;
  --radius-xl: 4px;
}
```

```tsx app/providers.tsx
"use client";

import {
  DataThemeProvider,
  IconProvider,
  ThemeProvider,
  ToastProvider,
} from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { style } from "../lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider {...style}>
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

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import { ThemeInit } from "@once-ui-system/core/components/ThemeInit";
import type { Metadata } from "next";
import { AppShell } from "../components/AppShell";
import { style } from "../lib/theme";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme and the brand scheme before first paint. */}
        <ThemeInit config={style} />
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: "100vh" }}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
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
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, navLinks, product, user } from "../lib/data";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
  const menuOpen = menuPath === pathname;

  const group = nav.find((entry) => entry.items.some((l) => l.href === current));
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
    <Nav fill paddingX="8" density="compact" collapsed={isCollapsed} aria-label="Main">
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
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );

  return (
    <Column fill flex={1}>
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
            icon="menu"
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row vertical="center" gap="8" minWidth="8rem" s={{ minWidth: 0 }}>
          <Icon name="bolt" onBackground="brand-strong" />
          <Text as="span" textVariant="heading-strong-m" family="heading">
            {product.name}
          </Text>
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

      {/* Breadcrumb on phones, where the header has no room for it. */}
      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth="16rem" fitHeight position="sticky" top="56">
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
            <Column fillWidth maxWidth="xl" paddingX="24" paddingY="32" fitHeight>
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
          {renderNav(false)}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(open), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: `${paused} paused` },
    {
      label: "Busiest project",
      value: [...projects].sort((a, b) => b.issues - a.issues)[0].key,
      note: `${Math.max(...projects.map((p) => p.issues))} open issues`,
    },
    {
      label: "Last updated",
      value: latest.key,
      note: `${latest.name}, ${formatDate(latest.updated)}`,
    },
  ];

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="section" aria-label="Summary">
        {cards.map((card) => (
          <Column
            key={card.label}
            background="page"
            border
            radius="m"
            padding="20"
            gap="8"
          >
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" variant="display-strong-s">
              {card.value}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
```

```tsx app/reports/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "../../lib/data";

export default function ReportsPage() {
  const rows = [...projects].sort((a, b) => b.issues - a.issues);
  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Reports
        </Heading>
        <Text onBackground="neutral-weak">Open issues by project, highest first.</Text>
      </Column>
      <Column as="ul" gap="8">
        {rows.map((p) => (
          <Column as="li" key={p.key} background="page" border radius="m" padding="16" gap="4">
            <Text textVariant="label-strong-m">
              {p.key} · {p.name}
            </Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {p.issues} open issues
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, type Project, type ProjectStatus, projects } from "../../lib/data";

const tone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function ProjectsPage() {
  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text onBackground="neutral-weak">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>
      <Table<Project>
        aria-label="Projects"
        rows={projects}
        getRowId={(row) => row.key}
        columns={[
          {
            key: "key",
            header: "Key",
            sortable: true,
            cell: (row) => <Text textVariant="code-strong-s">{row.key}</Text>,
          },
          { key: "name", header: "Name", sortable: true },
          {
            key: "status",
            header: "Status",
            sortable: true,
            cell: (row) => <Tag as="span" tone={tone[row.status]} label={row.status} />,
          },
          { key: "issues", header: "Open issues", sortable: true, align: "right" },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            cell: (row) => formatDate(row.updated),
          },
        ]}
      />
    </Column>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);

  return (
    <Column gap="32" maxWidth="m">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text onBackground="neutral-weak">Your profile and notification preferences.</Text>
      </Column>

      <Column
        as="form"
        background="page"
        border
        radius="m"
        padding="24"
        gap="16"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          addToast({ variant: "success", message: "Settings saved" });
        }}
      >
        <Heading as="h2" variant="heading-strong-l">
          Profile
        </Heading>
        <Input id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Role: {user.role}
        </Text>

        <Heading as="h2" variant="heading-strong-l">
          Notifications
        </Heading>
        <Switch
          label="Weekly digest"
          description="A Monday summary of open issues and project activity."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <Switch
          label="Critical issue alerts"
          description="Email me as soon as an issue is marked critical."
          checked={alerts}
          onCheckedChange={setAlerts}
        />
        <Row>
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>
    </Column>
  );
}
```
