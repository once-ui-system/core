```css app/fonts.css
/* System font stacks (no network font fetch). Lumen: rounded headings, plain body. */
:root {
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;

  /* Lumen corner radius: 16px on buttons, inputs, cards and menus. */
  --radius-m: 1rem;
  --radius-l: 1rem;
  --radius-xl: 1.25rem;
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack, carrying Lumen's identity through ThemeProvider:
// brand #DB2777, warm sand neutrals, rounded corners, airy density, light by default.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      defaultTheme="light"
      brand="custom"
      brandSeed="#DB2777"
      accent="custom"
      accentSeed="#DB2777"
      neutral="sand"
      solid="color"
      border="rounded"
      density="spacious"
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
import { Providers } from "./providers";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = { title: "Lumen" };

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

export const product = "Lumen";

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

export type NavLeaf = { label: string; href: string };
export type NavSection = { key: string; label: string; icon: IconName; items: NavLeaf[] };

export const nav: NavSection[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/" },
      { label: "Reports", href: "/reports" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "organization",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Settings", href: "/settings" },
    ],
  },
];

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
```

```tsx components/AppShell.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Dropdown,
  Heading,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { nav, product, user } from "@/lib/data";

const allHrefs = nav.flatMap((section) => section.items.map((item) => item.href));

function SideNav({ pathname, collapsed }: { pathname: string; collapsed?: boolean }) {
  const current = selectNavHref(pathname, allHrefs);
  return (
    <Nav fill paddingX="8" aria-label="Main" collapsed={collapsed} density="spacious">
      {nav.map((section) => (
        <NavGroup
          key={section.key}
          label={section.label}
          icon={section.icon}
          defaultOpen
          selected={section.items.some((item) => item.href === current)}
        >
          {section.items.map((item) => (
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
}

function trailFor(pathname: string) {
  const current = selectNavHref(pathname, allHrefs);
  for (const section of nav) {
    const leaf = section.items.find((item) => item.href === current);
    if (leaf) {
      return [{ label: section.label }, { label: leaf.label }];
    }
  }
  return [{ label: product }];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row height="56" fillWidth vertical="center" paddingX="16" gap="12" as="header">
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
        <Row gap="8" vertical="center" s={{ hide: true }}>
          <IconButton
            icon="grid"
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Heading as="span" textVariant="heading-strong-m" onBackground="brand-strong">
          {product}
        </Heading>
        <Row flex={1} paddingX="8" s={{ hide: true }}>
          <Breadcrumbs items={trailFor(pathname)} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} hide s={{ hide: false }} />
        <Dropdown
          placement="bottom-end"
          trigger={
            <Button variant="tertiary" size="m" aria-label="Account menu" suffixIcon="chevronDown">
              <Row gap="8" vertical="center">
                <Avatar size="s" value="MO" />
                <Row s={{ hide: true }}>{user.name}</Row>
              </Row>
            </Button>
          }
        >
          <Column padding="8" gap="4" minWidth={16}>
            <Option
              value="account"
              label={user.name}
              description={`${user.email} · ${user.role}`}
              prefix={<Avatar size="s" value="MO" />}
            />
            <Option value="settings" label="Settings" href="/settings" prefix={null} />
          </Column>
        </Dropdown>
      </Row>
      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth="18rem"
          fitHeight
          position="sticky"
          top="56"
          paddingY="8"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
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
          >
            <Column maxWidth="xl" fillWidth gap="32" paddingX="24" paddingY="40" fitHeight>
              <Row hide s={{ hide: false }}>
                <Breadcrumbs items={trailFor(pathname)} aria-label="Breadcrumb" />
              </Row>
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
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { projects, user } from "@/lib/data";

const active = projects.filter((p) => p.status === "Active").length;
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);

const cards = [
  { label: "Active projects", value: String(active), note: "of 5 in your workspace" },
  { label: "Open issues", value: String(openIssues), note: "across every project" },
  { label: "Busiest project", value: "Customer app", note: "31 open issues" },
  { label: "Team members", value: "1", note: `${user.name} (${user.role})` },
];

export default function DashboardPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Welcome back, Maya
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Here is how your team is doing today. Nice work, keep it up!
        </Text>
      </Column>
      <Grid columns="2" s={{ columns: 1 }} gap="24" as="section" aria-label="Summary">
        {cards.map((card) => (
          <Column
            key={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="8"
          >
            <Text onBackground="neutral-weak" textVariant="label-default-m">
              {card.label}
            </Text>
            <Heading as="p" textVariant="display-strong-xs">
              {card.value}
            </Heading>
            <Row>
              <Tag tone="brand" label={card.note} />
            </Row>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type Project } from "@/lib/data";

const tone = { Active: "success", Paused: "warning", Archived: "neutral" } as const;

export default function ProjectsPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Projects
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Everything your team is building, in one place.
        </Text>
      </Column>
      <Table<Project>
        aria-label="Projects"
        columns={[
          { key: "key", header: "Key", sortable: true, width: "8rem" },
          { key: "name", header: "Name", sortable: true },
          {
            key: "status",
            header: "Status",
            cell: (row) => <Tag tone={tone[row.status]} label={row.status} dot />,
          },
          { key: "issues", header: "Open issues", sortable: true, align: "right" },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            cell: (row) => formatDate(row.updated),
          },
        ]}
        rows={projects}
        getRowId={(row) => row.key}
        defaultSort={{ key: "updated", direction: "desc" }}
      />
    </Column>
  );
}
```

```tsx app/reports/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";

export default function ReportsPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Reports
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Weekly summaries of issues opened and closed will appear here.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="24" gap="8">
        <Heading as="h2" textVariant="heading-strong-l">
          No reports yet
        </Heading>
        <Text onBackground="neutral-weak">
          Your first weekly report arrives on Monday morning.
        </Text>
      </Column>
    </Column>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { useState } from "react";
import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Make Lumen feel like home for you and your team.
        </Text>
      </Column>
      <Column
        as="form"
        maxWidth="m"
        background="surface"
        border
        radius="l"
        padding="24"
        gap="24"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          addToast({ tone: "success", message: "Settings saved" });
        }}
      >
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
        <Text onBackground="neutral-weak">Role: {user.role}</Text>
        <Heading as="h2" textVariant="heading-strong-l">
          Notifications
        </Heading>
        <Row vertical="center" horizontal="between" gap="16">
          <Text id="digest-label">Weekly digest email</Text>
          <Switch aria-labelledby="digest-label" checked={digest} onCheckedChange={setDigest} />
        </Row>
        <Row vertical="center" horizontal="between" gap="16">
          <Text id="mentions-label">Notify me when I am mentioned</Text>
          <Switch aria-labelledby="mentions-label" checked={mentions} onCheckedChange={setMentions} />
        </Row>
        <Row>
          <Button type="submit" size="l">
            Save changes
          </Button>
        </Row>
      </Column>
    </Column>
  );
}
```
