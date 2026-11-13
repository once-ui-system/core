```css app/fonts.css
/* Lumen type: a serif for headings, the system sans for body text. No network fonts. */
:root {
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;
}

/* Lumen corners: 2px on buttons, inputs, cards and menus, set once on the radius tokens. */
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

```ts lib/theme.ts
import type { OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's identity, carried through the design system's theme options once.
export const style: OnceUIStyleConfig = {
  theme: "system",
  defaultTheme: "light", // light on a first visit; the visitor can still switch
  neutral: "slate", // cool slate grey
  brand: "custom",
  brandSeed: "#0F766E", // step 500: primary buttons, current nav item, links, focus rings
  accent: "custom",
  accentSeed: "#0F766E",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "sharp", // smallest corners; the exact 2px is set on the radius tokens in fonts.css
  surface: "filled",
  transition: "micro",
  density: "compact", // tight rows, small controls
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

export type NavLink = { label: string; href: string };
export type NavEntry = { label: string; icon: IconName; items: NavLink[] };

export const nav: NavEntry[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/" },
      { label: "Reports", href: "/reports" },
    ],
  },
  {
    label: "Workspace",
    icon: "folder",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Settings", href: "/settings" },
    ],
  },
];

export const navLinks: (NavLink & { group: string; icon: IconName })[] = nav.flatMap((entry) =>
  entry.items.map((link) => ({ ...link, group: entry.label, icon: entry.icon })),
);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Fixed formatting (no locale or timezone) so server and browser render the same text.
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack (mirrors the official Next.js starter):
// theme, Next-aware links/images, chart theme, toasts, icons.
// Lumen's identity is passed to ThemeProvider once, from lib/theme.ts.
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
import { product } from "../lib/data";
import { style } from "../lib/theme";
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
  Button,
  Column,
  Drawer,
  Heading,
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
import { useState } from "react";
import { nav, navLinks, product, user } from "../lib/data";

/**
 * The signed-in frame, mounted once in the root layout: header, sidebar and a raised
 * content panel. Only the panel scrolls. On desktop the sidebar collapses to icons;
 * below `s` it is replaced by a menu button that opens the same nav in a left drawer.
 */
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

  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(page ? [{ label: page.group }, { label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: link.group,
    shortcut: [],
    keywords: `${link.label} ${link.group}`.toLowerCase(),
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

  const sideNav = (isCollapsed: boolean) => (
    <Nav fill paddingX="8" density="compact" collapsed={isCollapsed} aria-label="Main">
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
              selected={link.href === current}
              aria-current={link.href === current ? "page" : undefined}
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
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row vertical="center" gap="8">
          <Heading as="span" textVariant="heading-strong-l">
            {product.name}
          </Heading>
        </Row>
        <Row flex={1} paddingLeft="12" s={{ hide: true }}>
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
        <Column s={{ hide: true }} fitHeight position="sticky" top="56">
          {sideNav(collapsed)}
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
            <Column fillWidth maxWidth="xl" paddingX="24" paddingY="24" s={{ paddingX: "16" }} fitHeight>
              <Row hide s={{ hide: false }} paddingBottom="12">
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
          {sideNav(false)}
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

```tsx app/page.tsx
import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const busiest = projects.reduce((a, b) => (b.issues > a.issues ? b : a));
  const latest = projects.reduce((a, b) => (b.updated > a.updated ? b : a));

  const cards = [
    { label: "Open issues", value: String(open), note: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "Paused and archived not counted" },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open issues` },
    { label: "Last update", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <Column gap="24">
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-xl">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" gap="12" m={{ columns: 2 }} s={{ columns: 1 }} as="ul" padding="0" margin="0">
        {cards.map((card) => (
          <Column
            as="li"
            key={card.label}
            background="surface"
            border
            radius="m"
            padding="16"
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

      <Column background="surface" border radius="m" padding="16" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column as="ul" margin="0" padding="0" gap="4">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" paddingY="4" gap="12">
                <Text textVariant="body-default-s">
                  {p.key} · {p.name}
                </Text>
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

```tsx app/reports/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "../../lib/data";

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <Column gap="16">
      <Heading as="h1" textVariant="heading-strong-xl">
        Reports
      </Heading>
      <Column background="surface" border radius="m" padding="16" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Open issues by project
        </Heading>
        <Column as="ul" margin="0" padding="0" gap="4">
          {projects.map((p) => (
            <Text as="li" key={p.key} textVariant="body-default-s" style={{ listStyle: "none" }}>
              {p.name}: {p.issues} ({total ? Math.round((p.issues / total) * 100) : 0}%)
            </Text>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import { Column, Heading, Row, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, type Project, type ProjectStatus, projects } from "../../lib/data";

const tone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function ProjectsPage() {
  return (
    <Column gap="16">
      <Row horizontal="between" vertical="end" gap="12" wrap>
        <Column gap="4">
          <Heading as="h1" textVariant="heading-strong-xl">
            Projects
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {projects.length} projects in this workspace
          </Text>
        </Column>
      </Row>
      <Table
        compact
        aria-label="Projects"
        rows={projects}
        getRowId={(row: Project) => row.key}
        defaultSort={{ key: "updated", direction: "desc" }}
        columns={[
          { key: "key", header: "Key", sortable: true, width: "6rem" },
          { key: "name", header: "Name", sortable: true },
          {
            key: "status",
            header: "Status",
            sortable: true,
            cell: (row: Project) => <Tag as="span" size="s" tone={tone[row.status]} label={row.status} />,
          },
          { key: "issues", header: "Open issues", sortable: true, align: "right" },
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

```tsx app/settings/page.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../../lib/data";

const preferences = [
  { id: "digest", label: "Weekly digest", hint: "A summary of open issues every Monday." },
  { id: "mentions", label: "Mentions", hint: "Email me when someone mentions me." },
  { id: "status", label: "Project status changes", hint: "Tell me when a project is paused or archived." },
];

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    digest: true,
    mentions: true,
    status: false,
  });

  return (
    <Column gap="24" maxWidth="m">
      <Heading as="h1" textVariant="heading-strong-xl">
        Settings
      </Heading>

      <Column
        as="form"
        background="surface"
        border
        radius="m"
        padding="16"
        gap="16"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          addToast({ variant: "success", message: "Profile saved" });
        }}
      >
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input
          id="name"
          label="Full name"
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        />
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Role: {user.role}
        </Text>
        <Row>
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>

      <Column background="surface" border radius="m" padding="16" gap="12">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        {preferences.map((pref) => (
          <Row key={pref.id} horizontal="between" vertical="center" gap="16">
            <Column gap="2">
              <Text id={`${pref.id}-label`} textVariant="label-default-s">
                {pref.label}
              </Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {pref.hint}
              </Text>
            </Column>
            <Switch
              aria-labelledby={`${pref.id}-label`}
              checked={prefs[pref.id]}
              onCheckedChange={(checked: boolean) => setPrefs((prev) => ({ ...prev, [pref.id]: checked }))}
            />
          </Row>
        ))}
      </Column>
    </Column>
  );
}
```
