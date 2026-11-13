```css app/fonts.css
/* Lumen type and shape, set once as tokens: every Once UI component reads them. */
:root {
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;
}

/* 2px corners on buttons, inputs, cards and menus. */
:root,
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

// Standard Once UI provider stack, with Lumen's identity set on the ThemeProvider
// so every screen follows it: brand #0F766E, cool slate neutrals, compact density,
// light by default, restrained (conservative) corners.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      theme="system"
      defaultTheme="light"
      brand="custom"
      brandSeed="#0F766E"
      neutral="slate"
      solid="color"
      solidStyle="flat"
      border="conservative"
      surface="filled"
      density="compact"
    >
      <LayoutProvider>
        <DataThemeProvider>
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
import { AppShell } from "../components/AppShell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams.",
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

```ts lib/data.ts
import type { IconName } from "@once-ui-system/core";

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface NavSection {
  label: string;
  icon: IconName;
  items: NavLink[];
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

export const navSections: NavSection[] = [
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

export const reports = [
  { name: "Weekly issue throughput", cadence: "Every Monday", owner: "Maya Okafor" },
  { name: "Open issues by project", cadence: "Daily", owner: "Maya Okafor" },
  { name: "Release readiness", cadence: "On demand", owner: "Maya Okafor" },
];

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

export function statusTone(status: ProjectStatus): "success" | "warning" | "neutral" {
  if (status === "Active") return "success";
  if (status === "Paused") return "warning";
  return "neutral";
}
```

```tsx components/AppShell.tsx
"use client";

import {
  Breadcrumbs,
  Column,
  Drawer,
  Icon,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  SmartLink,
  selectNavHref,
  Text,
  User,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navSections, product, user } from "../lib/data";

/**
 * The signed-in frame, mounted once in the root layout so open groups and the
 * collapsed state survive navigation. Only the content pane scrolls.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navSections.flatMap((section) => section.items.map((item) => item.href)),
  );
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [collapsed, setCollapsed] = useState(false);

  const section = navSections.find((s) => s.items.some((item) => item.href === current));
  const page = section?.items.find((item) => item.href === current);
  const crumbs = [
    { label: product, href: "/" },
    ...(section ? [{ label: section.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email}
        </Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.role}
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
    <Nav fillWidth paddingX="8" density="compact" collapsed={isCollapsed} aria-label="Main">
      {navSections.map((entry) => (
        <NavGroup
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          defaultOpen={entry.items.some((item) => item.href === current)}
        >
          {entry.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              selected={item.href === current}
              aria-current={item.href === current ? "page" : undefined}
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
        <Row minWidth="12rem" s={{ minWidth: 0 }}>
          <SmartLink href="/" aria-label={`${product} home`}>
            <Text as="span" family="heading" textVariant="heading-strong-l">
              {product}
            </Text>
          </SmartLink>
        </Row>
        <Row flex={1} minWidth={0}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ hide: true }}>
          <User
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={{ value: initials }}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <User placement="bottom-end" avatarProps={{ value: initials }} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          gap="8"
        >
          {renderNav(collapsed)}
          <Row paddingX="8" horizontal={collapsed ? "center" : "start"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              onClick={() => setCollapsed((value) => !value)}
            />
          </Row>
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
            <Column fillWidth maxWidth="xl" paddingX="24" paddingY="24" s={{ paddingX: "12" }} fitHeight>
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
    </Column>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusTone, user } from "../lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const archived = projects.filter((p) => p.status === "Archived").length;
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  const cards = [
    { label: "Open issues", value: open, note: `across ${projects.length} projects` },
    { label: "Active projects", value: active, note: "currently shipping" },
    { label: "Paused projects", value: paused, note: "waiting on a decision" },
    { label: "Archived projects", value: archived, note: "read-only" },
  ];

  return (
    <Column gap="20">
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-l">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-s">
          {open} issues are open across {active} active projects. Last change on{" "}
          {formatDate(recent[0].updated)}.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="12" as="ul" padding="0" margin="0">
        {cards.map((card) => (
          <Column
            as="li"
            key={card.label}
            background="surface"
            border
            radius="m"
            padding="12"
            gap="4"
          >
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

      <Column background="surface" border radius="m" padding="12" gap="8" as="section" aria-labelledby="recent">
        <Heading as="h2" id="recent" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column as="ul" padding="0" margin="0" gap="4">
          {recent.map((p) => (
            <Row
              as="li"
              key={p.key}
              vertical="center"
              gap="12"
              paddingY="4"
              borderBottom
              wrap
            >
              <Text textVariant="code-default-s" onBackground="neutral-weak">
                {p.key}
              </Text>
              <Text textVariant="label-strong-s" flex={1}>
                {p.name}
              </Text>
              <Tag size="s" tone={statusTone(p.status)} label={p.status} />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
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

```tsx app/projects/page.tsx
"use client";

import { Column, Heading, Tag, Text, type TableColumn, Table } from "@once-ui-system/core";
import { formatDate, type Project, projects, statusTone } from "../../lib/data";

const columns: TableColumn<Project>[] = [
  { key: "key", header: "Key", sortable: true, width: "6rem" },
  { key: "name", header: "Project", sortable: true },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => <Tag size="s" tone={statusTone(row.status)} label={row.status} />,
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
    <Column gap="16">
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-l">
          Projects
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-s">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>
      <Table<Project>
        aria-label="Projects"
        columns={columns}
        rows={projects}
        getRowId={(row) => row.key}
        searchable
        searchPlaceholder="Search projects"
        compact
      />
    </Column>
  );
}
```

```tsx app/reports/page.tsx
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { reports } from "../../lib/data";

export default function ReportsPage() {
  return (
    <Column gap="16">
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-l">
          Reports
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-s">
          Saved reports for the workspace.
        </Text>
      </Column>
      <Column as="ul" padding="0" margin="0" background="surface" border radius="m">
        {reports.map((report) => (
          <Row as="li" key={report.name} padding="12" gap="12" vertical="center" wrap borderBottom>
            <Text textVariant="label-strong-s" flex={1}>
              {report.name}
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {report.cadence}
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {report.owner}
            </Text>
          </Row>
        ))}
      </Column>
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
  const [weekly, setWeekly] = useState(true);
  const [assigned, setAssigned] = useState(true);
  const [releases, setReleases] = useState(false);

  return (
    <Column
      as="form"
      gap="16"
      maxWidth="m"
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        addToast({ tone: "success", message: "Settings saved" });
      }}
    >
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-l">
          Settings
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-s">
          Your profile and notification preferences.
        </Text>
      </Column>

      <Column as="section" aria-labelledby="profile" background="surface" border radius="m" padding="16" gap="12">
        <Heading as="h2" id="profile" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input id="name" label="Full name" value={name} onValueChange={setName} />
        <Input id="email" label="Email" type="email" value={email} onValueChange={setEmail} />
        <Input id="role" label="Role" value={user.role} readOnly description="Only the workspace owner changes roles." />
      </Column>

      <Column as="section" aria-labelledby="notifications" background="surface" border radius="m" padding="16" gap="12">
        <Heading as="h2" id="notifications" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Switch
          id="weekly"
          label="Weekly summary"
          description="A Monday email with issues opened and closed."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <Switch
          id="assigned"
          label="Issues assigned to me"
          description="Notify me when someone assigns an issue."
          checked={assigned}
          onCheckedChange={setAssigned}
        />
        <Switch
          id="releases"
          label="Release notes"
          description="Product updates from Lumen."
          checked={releases}
          onCheckedChange={setReleases}
        />
      </Column>

      <Row gap="8">
        <Button type="submit" label="Save changes" />
      </Row>
    </Column>
  );
}
```
