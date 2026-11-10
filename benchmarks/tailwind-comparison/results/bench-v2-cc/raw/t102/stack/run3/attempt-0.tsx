```js src/resources/once-ui.config.js
import { defineConfig } from "@once-ui-system/core/config";
import { landing } from "./seo";

const baseURL = "https://lumen.example.com";

// Lumen's identity lives here and in custom.css (corner radius, font stacks):
// the providers and ThemeInit read this one object, so every screen follows it.
const config = defineConfig({
  style: {
    theme: "system", // stays "system" so the theme switch works
    defaultTheme: "light",
    neutral: "sand",
    brand: "custom",
    accent: "orange",
    brandSeed: "#DB2777",
    solid: "color",
    solidStyle: "flat",
    border: "rounded",
    surface: "filled",
    transition: "all",
    scaling: "105",
  },
  dataStyle: {
    variant: "gradient",
    mode: "categorical",
    height: 24,
    axis: {
      stroke: "var(--neutral-alpha-weak)",
    },
    tick: {
      fill: "var(--neutral-on-background-weak)",
      fontSize: 11,
      line: false,
    },
  },
});

const style = config.style;
const dataStyle = config.dataStyle;

const i18n = {
  locales: ["en"],
};

const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "hello@lumen.example.com",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, i18n, style, schema, social, dataStyle };
```

```tsx src/components/Providers.tsx
"use client";

import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
// The Next adapters: links go through next/link and images through next/image.
import { LayoutProvider } from "@once-ui-system/core/next";
import { style, dataStyle } from "../resources/once-ui.config";
import { iconLibrary } from "../resources/icons";
import { UserProvider } from "./UserProvider";
import { OrgProvider } from "./OrgProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider {...style}>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider>
            <IconProvider icons={iconLibrary}>
              <UserProvider>
                <OrgProvider>{children}</OrgProvider>
              </UserProvider>
            </IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
```

```css src/resources/custom.css
:root {
  --default-border: var(--neutral-alpha-weak);
}

/* Lumen: 16px corners on buttons, inputs, cards and menus. */
:root,
:root[data-theme] {
  --radius-s: 0.75rem;
  --radius-m: 1rem;
  --radius-l: 1rem;
  --radius-xl: 1.5rem;
}

/* Lumen: rounded headings, plain system body. No font is loaded from the network. */
html:root {
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import { baseURL, landing, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { LumenShell } from '@/components/LumenShell';
import { getLocale } from '@/lib/i18n/server';

export async function generateMetadata() {
  return Meta.generate({
    title: "Lumen",
    description: "Product analytics and issue tracking for small software teams.",
    baseURL: baseURL,
    image: landing.home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      as="html"
      lang={locale}
      fillWidth
    >
      <head>
        <Schema
          as="webPage"
          baseURL={baseURL}
          title="Lumen"
          description="Product analytics and issue tracking for small software teams."
          path="/"
        />
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <LumenShell>{children}</LumenShell>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```ts src/lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const product = "Lumen, a product-analytics and issue-tracking app for small software teams";

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

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}
```

```tsx src/components/LumenShell.tsx
"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs,
  Column,
  Drawer,
  DropdownWrapper,
  Heading,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
  type IconName,
} from "@once-ui-system/core";
import { user } from "@/lib/data";

type NavLeaf = { href: string; label: string };
type NavSection = { key: string; label: string; icon: IconName; items: NavLeaf[] };

const nav: NavSection[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "organization",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

const hrefs = nav.flatMap((s) => s.items.map((i) => i.href));

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, hrefs);
  return (
    <Nav fill paddingX="8" aria-label="Main" density="spacious" collapsed={collapsed}>
      {nav.map((section) => (
        <NavGroup
          key={section.key}
          label={section.label}
          icon={section.icon}
          defaultOpen={section.items.some((i) => i.href === current)}
        >
          {section.items.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} selected={item.href === current} />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

function crumbs(pathname: string) {
  for (const section of nav) {
    const item = section.items.find((i) => i.href === pathname);
    if (item) {
      return [{ label: section.label }, { label: item.label, href: item.href }];
    }
  }
  return [{ label: "Lumen" }];
}

/**
 * The signed-in shell, mounted once in the root layout so open groups and the
 * collapsed state survive navigation. Other routes (auth, invites) pass through.
 */
export function LumenShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  if (!hrefs.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            ariaLabel="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          />
        </Row>
        <Heading as="span" variant="heading-strong-m" onBackground="brand-strong">
          Lumen
        </Heading>
        <Row flex={1} paddingLeft="16" s={{ hide: true }}>
          <Breadcrumbs items={crumbs(pathname)} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} hide s={{ hide: false }} />
        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: "MO", size: "s" }}
          placement="bottom-end"
          dropdown={
            <Column minWidth={12} padding="4" gap="4">
              <Option value="email" label={user.email} disabled />
              <Option value="profile" label="Profile" href="/settings" />
              <Option value="settings" label="Settings" href="/settings" />
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column
          as="aside"
          s={{ hide: true }}
          width={collapsed ? "72" : undefined}
          maxWidth={collapsed ? "72" : 18}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row height="below-header" overflowY="auto" topRadius="l" horizontal="center" fillWidth background="surface">
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="32" padding="24" paddingY="40" fitHeight>
              <Row hide s={{ hide: false }}>
                <Breadcrumbs items={crumbs(pathname)} aria-label="Breadcrumb" />
              </Row>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>
      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16">
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}
```

```tsx src/app/page.tsx
import { Column, Grid, Heading, Text, Tag, Row } from "@once-ui-system/core";
import { projects, user, formatDate } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: "Across all projects" },
    { label: "Active projects", value: String(active.length), note: `${projects.length} projects in total` },
    { label: "Busiest project", value: "Customer app", note: "31 open issues" },
    { label: "Latest update", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Here is how your team is doing today.
        </Text>
      </Column>
      <Grid columns="4" s={{ columns: 1 }} m={{ columns: 2 }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} background="neutral-alpha-weak" border radius="l" padding="24" gap="8" as="section" aria-label={card.label}>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" variant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>
      <Column background="neutral-alpha-weak" border radius="l" padding="24" gap="16" as="section" aria-labelledby="active-title">
        <Heading as="h2" id="active-title" variant="heading-strong-l">
          Active projects
        </Heading>
        {active.map((p) => (
          <Row key={p.key} fillWidth vertical="center" horizontal="between" gap="16" paddingY="8" wrap>
            <Row gap="12" vertical="center">
              <Tag scheme="brand" size="m" label={p.key} />
              <Text variant="body-strong-m">{p.name}</Text>
            </Row>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {p.issues} open issues
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx src/app/projects/page.tsx
import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { projects, formatDate, type ProjectStatus } from "@/lib/data";

const scheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function Page() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {projects.length} projects in your workspace.
        </Text>
      </Column>
      <Table
        data={{
          headers: [
            { content: "Key", key: "key" },
            { content: "Project", key: "name" },
            { content: "Status", key: "status" },
            { content: "Open issues", key: "issues", align: "right" },
            { content: "Updated", key: "updated", hide: { s: true } },
          ],
          rows: projects.map((p) => [
            <Text key="k" variant="label-strong-s">{p.key}</Text>,
            <Text key="n" variant="body-strong-m">{p.name}</Text>,
            <Tag key="s" scheme={scheme[p.status]} size="m" label={p.status} />,
            <Text key="i" variant="body-default-m">{p.issues}</Text>,
            <Text key="u" variant="body-default-m">{formatDate(p.updated)}</Text>,
          ]),
        }}
      />
    </Column>
  );
}
```

```tsx src/app/reports/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function Page() {
  const total = projects.reduce((s, p) => s + p.issues, 0);
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Reports
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Open issues by project, out of {total} in total.
        </Text>
      </Column>
      <Column background="neutral-alpha-weak" border radius="l" padding="24" gap="16">
        {projects.map((p) => (
          <Column key={p.key} gap="8">
            <Text variant="label-default-m">
              {p.name}: {p.issues}
            </Text>
            <Column fillWidth background="neutral-alpha-medium" radius="full" height="8" overflow="hidden">
              <Column background="brand-strong" height="8" radius="full" style={{ width: `${total ? (p.issues / total) * 100 : 0}%` }} />
            </Column>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx src/app/settings/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { user } from "@/lib/data";

export default function Page() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addToast({ variant: "success", message: "Settings saved" });
  }

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Your profile and how Lumen keeps you posted. Role: {user.role}.
        </Text>
      </Column>
      <form onSubmit={onSubmit}>
        <Column gap="24" maxWidth="m">
          <Column background="neutral-alpha-weak" border radius="l" padding="24" gap="16" as="section" aria-labelledby="profile-title">
            <Heading as="h2" id="profile-title" variant="heading-strong-l">
              Profile
            </Heading>
            <Input id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Column>
          <Column background="neutral-alpha-weak" border radius="l" padding="24" gap="16" as="section" aria-labelledby="notify-title">
            <Heading as="h2" id="notify-title" variant="heading-strong-l">
              Notifications
            </Heading>
            <Row horizontal="between" vertical="center" gap="16">
              <Text id="digest-label" variant="body-default-m">Weekly digest</Text>
              <Switch aria-labelledby="digest-label" checked={digest} onToggle={setDigest} />
            </Row>
            <Row horizontal="between" vertical="center" gap="16">
              <Text id="mentions-label" variant="body-default-m">Mentions and assignments</Text>
              <Switch aria-labelledby="mentions-label" checked={mentions} onToggle={setMentions} />
            </Row>
          </Column>
          <Row>
            <Button type="submit" label="Save changes" size="l" />
          </Row>
        </Column>
      </form>
    </Column>
  );
}
```
