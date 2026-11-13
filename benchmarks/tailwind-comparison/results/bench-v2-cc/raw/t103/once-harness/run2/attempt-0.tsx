```css app/fonts.css
/* Lumen typography and shape, system stacks only (no network font fetch).
   Once UI reads these variables for every Heading, Text, Button and field. */
:root {
  --font-heading: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, "SFMono-Regular", Menlo, monospace;
}

/* 4px corners on buttons, inputs, cards and menus, whatever border style is set. */
:root[data-border] {
  --radius-xs: 4px;
  --radius-s: 4px;
  --radius-m: 4px;
  --radius-l: 4px;
  --radius-xl: 4px;
}
```

```ts lib/theme.ts
import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's visual identity, expressed once through the design system's own theme
// options. ThemeInit (root layout) and ThemeProvider (providers) both read it.
export const style: OnceUIStyleConfig = {
  // "system" keeps the theme switch working; defaultTheme is what a first visit sees.
  theme: "system",
  defaultTheme: "dark",
  neutral: "sand", // warm stone grey
  brand: "custom",
  brandSeed: "#E8590C", // step 500: primary buttons, current nav item, links, focus rings
  accent: "custom",
  accentSeed: "#E8590C",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "conservative", // small corners (4px, see app/fonts.css)
  surface: "filled",
  transition: "micro",
  scaling: "100",
  density: "normal",
};

export const dataStyle: OnceUIDataStyleConfig = {
  variant: "flat",
  mode: "categorical",
};
```

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

export const statusTone = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
} as const;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-12" -> "12 Oct 2026", without time zones so server and browser agree. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

export type NavLink = { href: string; label: string; icon?: IconName };
export type NavEntry = { label: string; icon: IconName; items: NavLink[] };

// Links inside a group take no icon: the group's rail carries the hierarchy.
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
    icon: "organization",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

/** Every link in `nav`, groups flattened, in order. */
export const navLinks: NavLink[] = nav.flatMap((entry) => entry.items);
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack: theme (with Lumen's identity), Next-aware
// links/images, chart theme, toasts, icons.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { dataStyle, style } from "../lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider {...style}>
      <LayoutProvider>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex } from "@once-ui-system/core";
import { ThemeInit } from "@once-ui-system/core/components/ThemeInit";
import { AppShell } from "../components/AppShell";
import { dataStyle, style } from "../lib/theme";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme and the brand scheme before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          {/* Mounted once here so open groups and the collapsed state survive navigation. */}
          <AppShell>{children}</AppShell>
        </Providers>
      </Column>
    </Flex>
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
  Logo,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  selectNavHref,
  Text,
  ThemeSwitcher,
  useHotkeys,
  User,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, navLinks, product, user } from "../lib/data";

/**
 * The signed-in frame shared by every route: top bar with breadcrumb, a
 * collapsible sidebar with nested groups, and a raised content panel. Only the
 * panel scrolls. Below `s` the sidebar hides and the menu button opens the same
 * nav in a left drawer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useHotkeys("mod+k", (event) => {
    event.preventDefault();
    setSearchOpen((open) => !open);
  });

  const group = nav.find((entry) => entry.items.some((link) => link.href === current));
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
    <Nav fill paddingX="8" density="compact" aria-label="Main" collapsed={isCollapsed}>
      {nav.map((entry) => (
        <NavGroup
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          defaultOpen={entry.items.some((link) => link.href === current)}
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
          <Logo text={product.name} monogram size="s" href="/" />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row flex={1} minWidth={0}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ hide: true }}>
          <Button
            size="s"
            variant="secondary"
            prefixIcon="search"
            label="Search"
            onClick={() => setSearchOpen(true)}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="search"
            variant="tertiary"
            tooltip="Search"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          />
        </Row>
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
        <Column s={{ hide: true }} width={collapsed ? "fit" : "16rem"} fitHeight position="sticky" top="56">
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
            <Column maxWidth="xl" paddingX="24" paddingY="32" fitHeight>
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

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
```

```tsx components/PageHeader.tsx
import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <Column gap="8">
      <Heading as="h1" textVariant="heading-strong-l">
        {title}
      </Heading>
      <Text textVariant="body-default-m" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { PageHeader } from "../components/PageHeader";
import { formatDate, projects, statusTone, user } from "../lib/data";

export const metadata: Metadata = { title: "Overview" };

const openIssues = projects.reduce((sum, project) => sum + project.issues, 0);
const active = projects.filter((project) => project.status === "Active").length;
const paused = projects.filter((project) => project.status === "Paused").length;
const latest = projects.reduce((a, b) => (a.updated > b.updated ? a : b));

const cards = [
  { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
  { label: "Active projects", value: String(active), note: "shipping this month" },
  { label: "Paused projects", value: String(paused), note: "waiting on a decision" },
  { label: "Last update", value: formatDate(latest.updated), note: `${latest.key} · ${latest.name}` },
];

export default function DashboardPage() {
  const busiest = [...projects].sort((a, b) => b.issues - a.issues).slice(0, 3);
  return (
    <Column fillWidth gap="32">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />

      <Grid as="section" aria-label="Summary" fillWidth columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="m" padding="20" gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" textVariant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" aria-labelledby="busiest" background="surface" border radius="m" padding="20" gap="16">
        <Heading as="h2" id="busiest" textVariant="heading-strong-s">
          Busiest projects
        </Heading>
        <Column as="ul" gap="12" margin="0" padding="0">
          {busiest.map((project) => (
            <Row as="li" key={project.key} fillWidth vertical="center" gap="12" wrap>
              <Text textVariant="code-strong-s" onBackground="brand-medium">
                {project.key}
              </Text>
              <Row flex={1} minWidth={0}>
                <Text textVariant="body-default-m">{project.name}</Text>
              </Row>
              <Tag label={project.status} tone={statusTone[project.status]} size="s" />
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {project.issues} open issues
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
import { Column, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { PageHeader } from "../../components/PageHeader";
import { projects } from "../../lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const total = projects.reduce((sum, project) => sum + project.issues, 0);
  return (
    <Column fillWidth gap="24">
      <PageHeader
        title="Reports"
        description="Scheduled summaries of issue activity for your team."
      />
      <Column background="surface" border radius="m" padding="20" gap="8">
        <Text textVariant="label-strong-m">Weekly issue digest</Text>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Every Monday at 09:00 UTC, covering {total} open issues in {projects.length} projects.
        </Text>
      </Column>
    </Column>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Column, Row, Table, type TableColumn, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "../../components/PageHeader";
import { formatDate, type Project, projects, statusTone } from "../../lib/data";

const columns: TableColumn<Project>[] = [
  {
    key: "key",
    header: "Key",
    sortable: true,
    cell: (row) => (
      <Text textVariant="code-strong-s" onBackground="brand-medium">
        {row.key}
      </Text>
    ),
  },
  { key: "name", header: "Project", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <Tag label={row.status} tone={statusTone[row.status]} size="s" />,
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
    <Column fillWidth gap="24">
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />
      <Row fillWidth overflowX="auto">
        <Column fillWidth minWidth="36rem">
          <Table
            aria-label="Projects"
            columns={columns}
            rows={projects}
            getRowId={(row) => row.key}
            searchable
            searchPlaceholder="Search projects"
          />
        </Column>
      </Row>
    </Column>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);

  return (
    <Column fillWidth gap="32" maxWidth="m">
      <PageHeader title="Settings" description="Your profile and how Lumen keeps you informed." />

      <Column
        as="form"
        aria-labelledby="profile"
        background="surface"
        border
        radius="m"
        padding="24"
        gap="16"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          addToast({ tone: "success", message: "Profile saved" });
        }}
      >
        <Heading as="h2" id="profile" textVariant="heading-strong-s">
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
        <Row vertical="center" gap="8">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Role
          </Text>
          <Text textVariant="code-default-s">{user.role}</Text>
        </Row>
        <Row>
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>

      <Column as="section" aria-labelledby="notifications" background="surface" border radius="m" padding="24" gap="16">
        <Heading as="h2" id="notifications" textVariant="heading-strong-s">
          Notifications
        </Heading>
        <Switch
          id="digest"
          label="Weekly issue digest"
          description="A Monday summary of what changed across your projects."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <Switch
          id="mentions"
          label="Mentions and assignments"
          description="Email me when someone assigns or mentions me on an issue."
          checked={mentions}
          onCheckedChange={setMentions}
        />
        <Switch
          id="releases"
          label="Release announcements"
          description="Product updates from the Lumen team."
          checked={releases}
          onCheckedChange={setReleases}
        />
      </Column>
    </Column>
  );
}
```
