```ts lib/theme.ts
import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's identity, set once here and read by the ThemeProvider (app/providers.tsx)
// and by ThemeInit (app/layout.tsx), so every screen follows it.
export const style: OnceUIStyleConfig = {
  // "system" keeps the theme switch working; defaultTheme is what a first visit sees.
  theme: "system",
  defaultTheme: "light",
  neutral: "slate", // cool slate grey
  brand: "custom",
  brandSeed: "#0F766E", // step 500: primary buttons, current nav item, links, focus rings
  accent: "cyan",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "sharp", // small corner radius; fonts.css pins it to 2px
  surface: "filled",
  transition: "micro",
  density: "compact", // tight rows, small controls
};

export const dataStyle: OnceUIDataStyleConfig = {
  variant: "flat",
  mode: "categorical",
  height: 24,
  axis: { stroke: "var(--neutral-alpha-weak)" },
  tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
};
```

```ts lib/data.ts
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

export const statusTone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export type Report = {
  name: string;
  cadence: string;
  owner: string;
  lastRun: string;
};

export const reports: Report[] = [
  { name: "Issue throughput", cadence: "Weekly", owner: "Maya Okafor", lastRun: "2026-10-12" },
  { name: "Open issues by project", cadence: "Daily", owner: "Maya Okafor", lastRun: "2026-10-14" },
  { name: "Release readiness", cadence: "Monthly", owner: "Maya Okafor", lastRun: "2026-10-01" },
];

// Fixed locale and zone, so the server and the browser print the same text.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/nav.ts
import type { IconName } from "@once-ui-system/core";

export type NavLink = { href: string; label: string };
export type NavSection = { label: string; icon: IconName; items: NavLink[] };

// Links inside a group take no icon; the group's rail carries the hierarchy.
export const nav: NavSection[] = [
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

export const navLinks: NavLink[] = nav.flatMap((section) => section.items);
```

```css app/fonts.css
/* Lumen type: Georgia headings, system sans for everything else. No network fonts. */
:root {
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;
}

/* Corner radius: 2px on buttons, inputs, cards and menus. */
:root,
:root[data-border],
[data-border] {
  --radius-xs: 2px;
  --radius-s: 2px;
  --radius-m: 2px;
  --radius-l: 2px;
  --radius-xl: 2px;
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack: theme (Lumen's style), Next-aware links/images,
// chart theme, toasts, icons.
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
import { product } from "../lib/data";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: product.name, template: `%s · ${product.name}` },
  description: product.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Sets the theme and brand before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
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
  User,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { product, user } from "../lib/data";
import { nav, navLinks } from "../lib/nav";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * The signed-in frame shared by every screen: header with breadcrumb, a collapsible
 * sidebar on desktop and a drawer on phones. Only the content panel scrolls.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );

  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [searchOpen, setSearchOpen] = useState(false);

  const section = nav.find((entry) => entry.items.some((link) => link.href === current));
  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(section ? [{ label: section.label }] : []),
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

  const sideNav = (isCollapsed: boolean) => (
    <Nav fill paddingX="8" density="compact" collapsed={isCollapsed} aria-label="Main">
      {nav.map((entry) => (
        <NavGroup
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          selected={entry.items.some((link) => link.href === current)}
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

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

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
        <Row minWidth="14rem" s={{ hide: true }}>
          <Logo text={product.name} monogram size="s" href="/" />
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
        <Row s={{ hide: true }}>
          <ThemeSwitcher collapsed direction="column" />
        </Row>
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
          id="sidebar"
          s={{ hide: true }}
          width={collapsed ? 56 : 224}
          fitHeight
          position="sticky"
          top="56"
          transition="macro-short"
        >
          <Row paddingX="8" paddingBottom="4" horizontal={collapsed ? "center" : "end"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              tooltip={toggleLabel}
              tooltipPosition="right"
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              aria-controls="sidebar"
              onClick={() => setCollapsed((value) => !value)}
            />
          </Row>
          {sideNav(collapsed)}
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="24" s={{ paddingX: "16" }} fitHeight>
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
          {sideNav(false)}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

```tsx components/PageHeader.tsx
import { Column } from "@once-ui-system/core/components/Column";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Text } from "@once-ui-system/core/components/Text";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <Column gap="4">
      <Heading as="h1" textVariant="heading-strong-l">
        {title}
      </Heading>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  );
}
```

```tsx app/page.tsx
import { Column } from "@once-ui-system/core/components/Column";
import { Grid } from "@once-ui-system/core/components/Grid";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Row } from "@once-ui-system/core/components/Row";
import { Tag } from "@once-ui-system/core/components/Tag";
import { Text } from "@once-ui-system/core/components/Text";
import type { Metadata } from "next";
import { PageHeader } from "../components/PageHeader";
import { formatDate, projects, statusTone, user } from "../lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const active = projects.filter((project) => project.status === "Active");
  const totalIssues = projects.reduce((sum, project) => sum + project.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const firstName = user.name.split(" ")[0];

  const cards = [
    { label: "Open issues", value: String(totalIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: `of ${projects.length} in the workspace` },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open issues` },
    { label: "Last update", value: formatDate(latest.updated), note: `${latest.name} (${latest.key})` },
  ];

  return (
    <Column fillWidth gap="24">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is where your workspace stands today."
      />

      <Grid as="section" aria-label="Summary" columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="m" padding="16" gap="4">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" textVariant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" aria-labelledby="by-project" gap="8">
        <Heading as="h2" id="by-project" textVariant="heading-strong-s">
          Open issues by project
        </Heading>
        <Column border radius="m" background="surface" as="ul" margin="0" padding="0">
          {[...projects]
            .sort((a, b) => b.issues - a.issues)
            .map((project, index) => (
              <Row
                as="li"
                key={project.key}
                paddingX="12"
                paddingY="8"
                gap="12"
                vertical="center"
                borderTop={index > 0}
              >
                <Text textVariant="code-strong-xs" onBackground="neutral-weak">
                  {project.key}
                </Text>
                <Text textVariant="body-default-s" style={{ flex: 1 }}>
                  {project.name}
                </Text>
                <Tag tone={statusTone[project.status]} label={project.status} size="s" />
                <Text textVariant="label-strong-s">{project.issues}</Text>
              </Row>
            ))}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Column, Table, Tag } from "@once-ui-system/core";
import { PageHeader } from "../../components/PageHeader";
import { formatDate, type Project, projects, statusTone } from "../../lib/data";

export default function ProjectsPage() {
  const active = projects.filter((project) => project.status === "Active").length;

  return (
    <Column fillWidth gap="16">
      <PageHeader
        title="Projects"
        description={`${projects.length} projects, ${active} active.`}
      />
      <Table
        aria-label="Projects"
        rows={projects}
        compact
        searchable
        searchPlaceholder="Search projects"
        getRowId={(row: Project) => row.key}
        defaultSort={{ key: "updated", direction: "desc" }}
        columns={[
          { key: "key", header: "Key", sortable: true, width: "6rem" },
          { key: "name", header: "Name", sortable: true },
          {
            key: "status",
            header: "Status",
            sortable: true,
            cell: (row: Project) => <Tag tone={statusTone[row.status]} label={row.status} size="s" />,
          },
          { key: "issues", header: "Issues", sortable: true, align: "right" },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            cell: (row: Project) => formatDate(row.updated),
          },
        ]}
      />
    </Column>
  );
}
```

```tsx app/reports/page.tsx
"use client";

import { Column, Table } from "@once-ui-system/core";
import { PageHeader } from "../../components/PageHeader";
import { formatDate, type Report, reports } from "../../lib/data";

export default function ReportsPage() {
  return (
    <Column fillWidth gap="16">
      <PageHeader title="Reports" description="Scheduled reports for the workspace." />
      <Table
        aria-label="Reports"
        rows={reports}
        compact
        getRowId={(row: Report) => row.name}
        columns={[
          { key: "name", header: "Report", sortable: true },
          { key: "cadence", header: "Cadence", sortable: true },
          { key: "owner", header: "Owner" },
          {
            key: "lastRun",
            header: "Last run",
            sortable: true,
            cell: (row: Report) => formatDate(row.lastRun),
          },
        ]}
      />
    </Column>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Select,
  Switch,
  Text,
  useTheme,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { user } from "../../lib/data";

const panel = { background: "surface", border: true, radius: "m", padding: "16", gap: "12" } as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [landing, setLanding] = useState("/");
  const [issueEmails, setIssueEmails] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [productNews, setProductNews] = useState(false);

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToast({ tone: "success", children: "Settings saved" });
  };

  return (
    <Column as="form" onSubmit={save} fillWidth gap="16" maxWidth="40rem">
      <PageHeader title="Settings" description="Your profile, notifications and appearance." />

      <Column as="section" aria-labelledby="profile" {...panel}>
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
        <Input id="role" label="Role" value={user.role} readOnly description="Set by the workspace owner." />
        <Select
          id="landing"
          label="Open Lumen on"
          value={landing}
          onValueChange={(value) => setLanding(String(value))}
          options={[
            { value: "/", label: "Overview" },
            { value: "/projects", label: "Projects" },
            { value: "/reports", label: "Reports" },
          ]}
        />
      </Column>

      <Column as="section" aria-labelledby="notifications" {...panel}>
        <Heading as="h2" id="notifications" textVariant="heading-strong-s">
          Notifications
        </Heading>
        <Switch
          id="issue-emails"
          label="Issue assignments"
          description="Email me when an issue is assigned to me."
          checked={issueEmails}
          onCheckedChange={setIssueEmails}
        />
        <Switch
          id="weekly-digest"
          label="Weekly digest"
          description="A Monday summary of open issues and project activity."
          checked={weeklyDigest}
          onCheckedChange={setWeeklyDigest}
        />
        <Switch
          id="product-news"
          label="Product news"
          description="Occasional notes about new Lumen features."
          checked={productNews}
          onCheckedChange={setProductNews}
        />
      </Column>

      <Column as="section" aria-labelledby="appearance" {...panel}>
        <Heading as="h2" id="appearance" textVariant="heading-strong-s">
          Appearance
        </Heading>
        <Text id="theme-label" textVariant="label-default-s" onBackground="neutral-weak">
          Theme
        </Text>
        <SegmentedControl
          aria-labelledby="theme-label"
          maxWidth="20rem"
          value={theme}
          onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
          buttons={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
      </Column>

      <Row gap="8">
        <Button type="submit" label="Save changes" />
        <Button
          type="button"
          variant="secondary"
          label="Reset"
          onClick={() => {
            setName(user.name);
            setEmail(user.email);
            setLanding("/");
            setIssueEmails(true);
            setWeeklyDigest(true);
            setProductNews(false);
          }}
        />
      </Row>
    </Column>
  );
}
```
