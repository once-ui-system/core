```js src/resources/once-ui.config.js
import { landing } from "./seo";

// Lumen: public address used for SEO in meta tags and schema
const baseURL = "https://lumen.example";

// Fonts are system stacks, set once as CSS variables in src/resources/custom.css
// (headings in ui-monospace, body in ui-sans-serif). Nothing is loaded from the network.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

// The app's languages, as BCP 47 tags. The first is the default.
const i18n = {
  locales: ["en"],
};

// Lumen's theme: dark by default, warm stone neutrals, brand #E8590C (the
// exact scale lives in custom.css), 4px corners ("conservative" borders).
const style = {
  theme: "dark", // dark | light | system
  neutral: "sand", // sand | gray | slate (refined to warm stone in custom.css)
  brand: "orange", // refined to #E8590C in custom.css
  accent: "orange",
  solid: "color", // primary buttons are filled with the brand colour
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "micro", // all | micro | macro
  scaling: "100", // balanced density
};

const dataStyle = {
  variant: "flat", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

// default schema data
const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "support@lumen.example",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
```

```css src/resources/custom.css
/*
  Lumen theme tokens. The design system reads these scheme variables, so every
  screen follows them: brand #E8590C, warm stone neutrals, 4px corners and the
  two font stacks. Selectors are repeated so they win over the preset scales.
*/
:root,
html[data-brand],
html[data-neutral],
html[data-brand][data-neutral],
html[data-theme][data-brand][data-neutral] {
  --default-border: var(--neutral-alpha-weak);

  /* fonts */
  --font-heading: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, "SFMono-Regular", Menlo, monospace;

  /* corner radius: 4px on buttons, inputs, cards and menus */
  --radius-xs: 4px;
  --radius-s: 4px;
  --radius-m: 4px;
  --radius-l: 4px;
  --radius-xl: 4px;
  --static-radius-xs: 4px;
  --static-radius-s: 4px;
  --static-radius-m: 4px;
  --static-radius-l: 4px;
  --static-radius-xl: 4px;

  /* brand: #E8590C sits at step 600 */
  --scheme-brand-100: #1a0900;
  --scheme-brand-200: #331300;
  --scheme-brand-300: #5c2200;
  --scheme-brand-400: #8a3407;
  --scheme-brand-500: #b84708;
  --scheme-brand-600: #e8590c;
  --scheme-brand-700: #f0762f;
  --scheme-brand-800: #f79a62;
  --scheme-brand-900: #fbb68a;
  --scheme-brand-1000: #fdd1b3;
  --scheme-brand-1100: #fee6d4;
  --scheme-brand-1200: #fff3ea;
  --scheme-brand-600-10: rgba(232, 89, 12, 0.1);
  --scheme-brand-600-30: rgba(232, 89, 12, 0.3);
  --scheme-brand-600-50: rgba(232, 89, 12, 0.5);

  --scheme-accent-100: #1a0900;
  --scheme-accent-200: #331300;
  --scheme-accent-300: #5c2200;
  --scheme-accent-400: #8a3407;
  --scheme-accent-500: #b84708;
  --scheme-accent-600: #e8590c;
  --scheme-accent-700: #f0762f;
  --scheme-accent-800: #f79a62;
  --scheme-accent-900: #fbb68a;
  --scheme-accent-1000: #fdd1b3;
  --scheme-accent-1100: #fee6d4;
  --scheme-accent-1200: #fff3ea;
  --scheme-accent-600-10: rgba(232, 89, 12, 0.1);
  --scheme-accent-600-30: rgba(232, 89, 12, 0.3);
  --scheme-accent-600-50: rgba(232, 89, 12, 0.5);

  /* neutrals: warm stone grey */
  --scheme-neutral-100: #0c0a09;
  --scheme-neutral-200: #1c1917;
  --scheme-neutral-300: #292524;
  --scheme-neutral-400: #44403c;
  --scheme-neutral-500: #57534e;
  --scheme-neutral-600: #78716c;
  --scheme-neutral-700: #a8a29e;
  --scheme-neutral-800: #d6d3d1;
  --scheme-neutral-900: #e7e5e4;
  --scheme-neutral-1000: #f5f5f4;
  --scheme-neutral-1100: #fafaf9;
  --scheme-neutral-1200: #ffffff;
  --scheme-neutral-600-10: rgba(120, 113, 108, 0.1);
  --scheme-neutral-600-30: rgba(120, 113, 108, 0.3);
  --scheme-neutral-600-50: rgba(120, 113, 108, 0.5);
}

html {
  font-family: var(--font-body);
}
```

```tsx src/app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";

import { baseURL, fonts, style, dataStyle } from "@/resources";
import { Meta, Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from "@/components";
import { AppShell } from "@/components/shell/AppShell";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  return Meta.generate({
    title: "Lumen",
    description: "Product analytics and issue tracking for small software teams.",
    baseURL: baseURL,
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
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        <ThemeInit
          config={{
            theme: "dark",
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            solid: style.solid,
            "solid-style": style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            "viz-style": dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              {/* The signed-in shell is mounted once here and frames Lumen's
                  three screens; any other route renders as it is. */}
              <AppShell>{children}</AppShell>
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

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-12" to "12 Oct 2026", the same on server and client. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
}
```

```tsx src/components/shell/AppShell.tsx
"use client";

import {
  Avatar,
  Breadcrumbs,
  Column,
  Drawer,
  Icon,
  IconButton,
  Line,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { user } from "@/lib/data";

type NavLeaf = { label: string; href?: string; icon: IconName };
type NavGroupDef = { key: string; label: string; icon: IconName; items: NavLeaf[] };

const navigation: NavGroupDef[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/", icon: "trend" },
      // Reports has no screen yet, so it is a placeholder without a link.
      { label: "Reports", icon: "document" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "organization",
    items: [
      { label: "Projects", href: "/projects", icon: "folder" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

const routes: Record<string, { group: string; label: string }> = {
  "/": { group: "Analytics", label: "Overview" },
  "/projects": { group: "Workspace", label: "Projects" },
  "/settings": { group: "Workspace", label: "Settings" },
};

const hrefs = navigation.flatMap((group) =>
  group.items.flatMap((item) => (item.href ? [item.href] : [])),
);

function normalize(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, hrefs);
  const [open, setOpen] = useState<Record<string, boolean>>({ analytics: true, workspace: true });

  return (
    <Nav density="compact" fill padding="4" collapsed={collapsed} aria-label="Main">
      {navigation.map((group) => (
        <NavGroup
          key={group.key}
          label={group.label}
          icon={group.icon}
          open={collapsed ? true : !!open[group.key]}
          onToggle={() => setOpen((state) => ({ ...state, [group.key]: !state[group.key] }))}
        >
          {group.items.map((item) => (
            <NavItem
              key={item.label}
              href={item.href}
              label={item.label}
              icon={collapsed ? item.icon : undefined}
              selected={item.href !== undefined && item.href === current}
              aria-current={item.href !== undefined && item.href === current ? "page" : undefined}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const rawPath = usePathname() ?? "/";
  const pathname = normalize(rawPath);
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  useEffect(() => {
    try {
      if (window.localStorage.getItem("lumen-sidebar") === "collapsed") setCollapsed(true);
    } catch {
      // storage unavailable: the sidebar simply starts expanded
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem("lumen-sidebar", next ? "collapsed" : "expanded");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const route = routes[pathname];
  if (!route) return <>{children}</>;

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        minHeight="56"
        position="sticky"
        top="0"
        background="page"
        vertical="center"
        paddingX="16"
        gap="8"
        zIndex={1}
      >
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            ariaLabel="Open navigation menu"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          />
        </Row>
        <Text variant="heading-strong-m" onBackground="brand-strong">
          Lumen
        </Text>
        <Row fillWidth paddingLeft="16" vertical="center" overflow="hidden">
          <Breadcrumbs
            aria-label="Breadcrumb"
            items={[{ label: route.group }, { label: route.label }]}
          />
        </Row>
        <UserMenu
          name={user.name}
          avatarProps={{ value: "M" }}
          dropdown={
            <Column minWidth={14}>
              <Column fillWidth paddingX="12" paddingY="12" gap="2">
                <Text variant="heading-strong-s">{user.name}</Text>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {user.email}
                </Text>
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  {user.role}
                </Text>
              </Column>
              <Line />
              <Column fillWidth padding="4" gap="2">
                <Option
                  prefix={<Icon onBackground="neutral-weak" size="s" name="settings" />}
                  label="Settings"
                  value="settings"
                  href="/settings"
                />
                <Option
                  prefix={<Icon onBackground="neutral-weak" size="s" name="folder" />}
                  label="Projects"
                  value="projects"
                  href="/projects"
                />
              </Column>
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            paddingX="l"
            background="surface"
          >
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="m" paddingY="32" fitHeight>
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
        <Column paddingTop="64" paddingBottom="16" fillWidth>
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}
```

```tsx src/app/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "currently shipping" },
    { label: "Paused projects", value: String(paused), note: "waiting to resume" },
    { label: "Last updated", value: latest.key, note: `${latest.name}, ${formatDate(latest.updated)}` },
  ];

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>
      <Grid as="section" aria-label="Summary" columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} background="neutral-alpha-weak" border radius="m" padding="20" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" variant="display-strong-xs">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>
      <Column as="section" aria-labelledby="recent" background="neutral-alpha-weak" border radius="m" padding="20" gap="12">
        <Heading as="h2" id="recent" variant="heading-strong-m">
          Recently updated
        </Heading>
        {[...projects]
          .sort((a, b) => b.updated.localeCompare(a.updated))
          .slice(0, 3)
          .map((p) => (
            <Row key={p.key} horizontal="between" vertical="center" gap="12" wrap>
              <Row gap="12" vertical="center">
                <Tag size="s" label={p.key} />
                <Text variant="body-default-m">{p.name}</Text>
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {formatDate(p.updated)}
              </Text>
            </Row>
          ))}
      </Column>
    </>
  );
}
```

```tsx src/app/projects/page.tsx
import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function Page() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {projects.length} projects in your workspace.
        </Text>
      </Column>
      <Table
        data={{
          headers: [
            { content: "Key", key: "key" },
            { content: "Name", key: "name" },
            { content: "Status", key: "status" },
            { content: "Issues", key: "issues", align: "right" },
            { content: "Updated", key: "updated" },
          ],
          rows: projects.map((p) => [
            <Text key="k" variant="code-default-s">
              {p.key}
            </Text>,
            p.name,
            <Tag key="s" size="s" scheme={statusScheme[p.status]} label={p.status} />,
            String(p.issues),
            formatDate(p.updated),
          ]),
        }}
      />
    </>
  );
}
```

```tsx src/app/settings/client.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsClient() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <form onSubmit={onSubmit} onChange={() => setSaved(false)}>
      <Column gap="24">
        <Column background="neutral-alpha-weak" border radius="m" padding="24" gap="16" as="section" aria-labelledby="profile">
          <Heading as="h2" id="profile" variant="heading-strong-m">
            Profile
          </Heading>
          <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Role: {user.role}
          </Text>
        </Column>
        <Column background="neutral-alpha-weak" border radius="m" padding="24" gap="16" as="section" aria-labelledby="notifications">
          <Heading as="h2" id="notifications" variant="heading-strong-m">
            Notifications
          </Heading>
          <Switch
            checked={digest}
            onToggle={setDigest}
            label="Weekly digest"
            description="A Monday summary of open issues and project activity."
            ariaLabel="Weekly digest"
          />
          <Switch
            checked={mentions}
            onToggle={setMentions}
            label="Mentions"
            description="Email me when someone mentions me on an issue."
            ariaLabel="Mentions"
          />
        </Column>
        <Row gap="16" vertical="center" wrap>
          <Button type="submit" label="Save changes" />
          <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {saved ? "Settings saved." : ""}
          </Text>
        </Row>
      </Column>
    </form>
  );
}
```

```tsx src/app/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsClient } from "./client";

export default function Page() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Manage your profile and how Lumen contacts you.
        </Text>
      </Column>
      <SettingsClient />
    </>
  );
}
```
