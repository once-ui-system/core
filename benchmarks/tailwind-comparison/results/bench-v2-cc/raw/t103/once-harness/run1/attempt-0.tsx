```css app/fonts.css
/* Lumen type: monospace headings, system sans body. No network font fetch. */
:root {
  --font-heading: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, "SFMono-Regular", Menlo, monospace;
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack with Lumen's identity set once, on the ThemeProvider.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      theme="system"
      defaultTheme="dark"
      neutral="sand"
      brand="custom"
      brandSeed="#E8590C"
      accent="custom"
      accentSeed="#E8590C"
      solid="color"
      solidStyle="flat"
      border="conservative"
      surface="filled"
      scaling="100"
      density="normal"
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

export const product = {
  name: "Lumen",
  description: "A product-analytics and issue-tracking app for small software teams",
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

export const reports = [
  { title: "Weekly issue flow", detail: "Opened versus closed issues per project, last 7 days.", cadence: "Weekly" },
  { title: "Release health", detail: "Error rate and regressions after each deploy.", cadence: "Per release" },
  { title: "Funnel conversion", detail: "Sign-up to first project, by acquisition source.", cadence: "Monthly" },
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
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, navLinks, product, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * Signed-in frame shared by every route: header with breadcrumb, collapsible
 * sidebar with nested groups, and a drawer with the same nav on phones.
 */
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
        <Row flex={1} vertical="center" minWidth={0}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
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
          maxWidth={collapsed ? undefined : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          gap="8"
        >
          {renderNav(collapsed)}
          <Row paddingX="8" paddingBottom="8" horizontal={collapsed ? "center" : "end"}>
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
```

```tsx app/page.tsx
import { Column } from "@once-ui-system/core/components/Column";
import { Grid } from "@once-ui-system/core/components/Grid";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Row } from "@once-ui-system/core/components/Row";
import { Tag } from "@once-ui-system/core/components/Tag";
import { Text } from "@once-ui-system/core/components/Text";
import { projects, statusTone, user } from "../lib/data";

const active = projects.filter((p) => p.status === "Active").length;
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

const cards = [
  { label: "Projects", value: String(projects.length), note: `${active} active` },
  { label: "Open issues", value: String(openIssues), note: "Across all projects" },
  { label: "Busiest project", value: "APP", note: "31 open issues" },
  { label: "Last activity", value: latest.updated, note: latest.name },
];

export default function DashboardPage() {
  const first = user.name.split(" ")[0];
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Welcome back, {first}
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        {cards.map((card) => (
          <Column
            key={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="8"
            as="section"
            aria-label={card.label}
          >
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" textVariant="heading-strong-xl">
              {card.value}
            </Heading>
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
        <Column as="ul" gap="12">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" gap="12" wrap>
                <Row gap="12" vertical="center">
                  <Text textVariant="code-strong-s">{p.key}</Text>
                  <Text textVariant="body-default-m">{p.name}</Text>
                </Row>
                <Row gap="12" vertical="center">
                  <Tag tone={statusTone[p.status]} label={p.status} size="s" />
                  <Text textVariant="code-default-s" onBackground="neutral-weak">
                    {p.updated}
                  </Text>
                </Row>
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

import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { type Project, projects, statusTone } from "../../lib/data";

export default function ProjectsPage() {
  return (
    <Column fillWidth gap="24">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Projects
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
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
            cell: (row) => <Tag tone={statusTone[row.status]} label={row.status} size="s" />,
          },
          { key: "issues", header: "Open issues", sortable: true, align: "right" },
          { key: "updated", header: "Updated", sortable: true },
        ]}
      />
    </Column>
  );
}
```

```tsx app/reports/page.tsx
import { Column } from "@once-ui-system/core/components/Column";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Row } from "@once-ui-system/core/components/Row";
import { Tag } from "@once-ui-system/core/components/Tag";
import { Text } from "@once-ui-system/core/components/Text";
import { reports } from "../../lib/data";

export default function ReportsPage() {
  return (
    <Column fillWidth gap="24">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Reports
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Scheduled summaries for your team.
        </Text>
      </Column>
      <Column gap="16">
        {reports.map((report) => (
          <Column key={report.title} background="surface" border radius="l" padding="24" gap="8">
            <Row horizontal="between" vertical="center" gap="12" wrap>
              <Heading as="h2" textVariant="heading-strong-s">
                {report.title}
              </Heading>
              <Tag label={report.cadence} size="s" />
            </Row>
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              {report.detail}
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Column fillWidth gap="24" maxWidth="m">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Settings
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Your profile and notification preferences.
        </Text>
      </Column>

      <Column
        as="form"
        background="surface"
        border
        radius="l"
        padding="24"
        gap="16"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input
          id="settings-name"
          label="Full name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
        />
        <Input
          id="settings-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSaved(false);
          }}
        />
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Role: {user.role}
        </Text>
        <Row gap="16" vertical="center">
          <Button type="submit" label="Save changes" />
          <Text role="status" textVariant="body-default-s" onBackground="neutral-weak">
            {saved ? "Changes saved." : ""}
          </Text>
        </Row>
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Row horizontal="between" vertical="center" gap="16">
          <Column gap="4">
            <Text textVariant="label-strong-m">Weekly digest</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              A Monday summary of issues and activity.
            </Text>
          </Column>
          <Switch aria-label="Weekly digest" checked={digest} onCheckedChange={setDigest} />
        </Row>
        <Row horizontal="between" vertical="center" gap="16">
          <Column gap="4">
            <Text textVariant="label-strong-m">Regression alerts</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Email me when a release raises the error rate.
            </Text>
          </Column>
          <Switch aria-label="Regression alerts" checked={alerts} onCheckedChange={setAlerts} />
        </Row>
      </Column>
    </Column>
  );
}
```
