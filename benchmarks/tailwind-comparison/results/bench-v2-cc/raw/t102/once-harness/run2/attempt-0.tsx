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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Fixed-format date so server and client render the same text. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function statusTone(status: ProjectStatus): "success" | "warning" | "neutral" {
  if (status === "Active") return "success";
  if (status === "Paused") return "warning";
  return "neutral";
}
```

```ts lib/theme.ts
import type { OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's identity, applied once through the design system's theme provider.
export const style: OnceUIStyleConfig = {
  theme: "system", // keep "system" so the theme switch works
  defaultTheme: "light",
  brand: "custom",
  brandSeed: "#DB2777",
  accent: "magenta",
  neutral: "sand",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "rounded",
  surface: "filled",
  transition: "all",
  density: "spacious",
};
```

```css app/fonts.css
/* System font stacks, no network font fetch. */
:root {
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;
}

/* Lumen corner radius: 16px on buttons, inputs, cards and menus. */
:root:root:root {
  --radius-s: 1rem;
  --radius-m: 1rem;
  --radius-l: 1rem;
  --radius-xl: 1.25rem;
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack: theme (Lumen's brand), Next-aware links/images,
// chart theme, toasts, icons.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { style } from "../lib/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider {...style}>
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
import { ThemeInit } from "@once-ui-system/core/components/ThemeInit";
import { AppShell } from "../components/AppShell";
import { style } from "../lib/theme";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        <ThemeInit config={style} />
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
  Column,
  Drawer,
  IconButton,
  Logo,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  selectNavHref,
  Text,
  User,
  VisuallyHidden,
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
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const group = nav.find((entry) => entry.items.some((link) => link.href === current));
  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="8" gap="4" minWidth="14rem">
      <Column paddingX="12" paddingY="8">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option value="profile" label="Profile and settings" href="/settings" />
    </Column>
  );

  const renderNav = (isCollapsed: boolean) => (
    <Nav paddingX="8" aria-label="Main" collapsed={isCollapsed}>
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
          <Logo text={product.name} monogram size="s" href="/" />
        </Row>
        <Row flex={1} paddingLeft="16" s={{ paddingLeft: "0" }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <User
          name={user.name}
          subline={user.email}
          placement="bottom-end"
          avatarProps={avatar}
          dropdown={account}
        />
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} fitHeight position="sticky" top="64" gap="8" paddingBottom="16">
          {renderNav(collapsed)}
          <Row paddingX="8">
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="40" fitHeight>
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
    </Column>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusTone, user } from "../lib/data";

const activeCount = projects.filter((p) => p.status === "Active").length;
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

const cards = [
  { label: "Open issues", value: String(openIssues), note: "Across all projects" },
  { label: "Active projects", value: String(activeCount), note: `${projects.length} in total` },
  { label: "Busiest project", value: "Customer app", note: "31 open issues" },
  { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
];

export default function DashboardPage() {
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          Here is how your team is doing today. Nice work keeping things moving.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="l" padding="24" gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Text textVariant="heading-strong-l">{card.value}</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column as="ul" gap="8">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" gap="16" paddingY="8" wrap>
                <Column gap="2">
                  <Text textVariant="label-strong-m">{p.name}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {p.key} · {p.issues} open issues · {formatDate(p.updated)}
                  </Text>
                </Column>
                <Tag tone={statusTone(p.status)} label={p.status} />
              </Row>
            ))}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectsTable } from "../../components/ProjectsTable";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Projects
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          Every project your team tracks in Lumen, with open issues and the last update.
        </Text>
      </Column>
      <ProjectsTable />
    </Column>
  );
}
```

```tsx components/ProjectsTable.tsx
"use client";

import { Column, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusTone } from "../lib/data";

export function ProjectsTable() {
  return (
    <Column fillWidth overflowX="auto">
      <Table
        aria-label="Projects"
        rows={projects}
        getRowId={(row) => row.key}
        columns={[
          {
            key: "key",
            header: "Key",
            sortable: true,
            cell: (row) => <Text textVariant="label-strong-s">{row.key}</Text>,
          },
          { key: "name", header: "Name", sortable: true, cell: (row) => <Text>{row.name}</Text> },
          {
            key: "status",
            header: "Status",
            cell: (row) => <Tag tone={statusTone(row.status)} label={row.status} />,
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
            cell: (row) => <Text>{formatDate(row.updated)}</Text>,
          },
        ]}
      />
    </Column>
  );
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { projects } from "../../lib/data";

export const metadata: Metadata = { title: "Reports" };

const max = Math.max(...projects.map((p) => p.issues));

export default function ReportsPage() {
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Reports
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          Open issues by project.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="24" gap="20">
        {projects.map((p) => (
          <Column key={p.key} gap="8">
            <Row horizontal="between">
              <Text textVariant="label-strong-s">{p.name}</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {p.issues}
              </Text>
            </Row>
            <Row fillWidth height="8" radius="full" background="neutral-alpha-weak">
              <Row
                height="8"
                radius="full"
                background="brand-medium"
                style={{ width: `${(p.issues / max) * 100}%` }}
              />
            </Row>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "../../components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          Manage your profile and how Lumen keeps you in the loop.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import { Button, Column, Heading, Input, Switch, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);

  return (
    <Column
      as="form"
      fillWidth
      maxWidth="m"
      gap="24"
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        addToast({ tone: "success", message: "Settings saved" });
      }}
    >
      <Column background="surface" border radius="l" padding="24" gap="20">
        <Heading as="h2" textVariant="heading-strong-m">
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
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="20">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Switch
          id="digest"
          label="Weekly digest"
          description="A friendly summary of your projects every Monday."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <Switch
          id="mentions"
          label="Mentions"
          description="Get an email when a teammate mentions you."
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

      <Button type="submit" label="Save changes" />
    </Column>
  );
}
```
