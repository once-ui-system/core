```js src/resources/once-ui.config.js
import { landing } from "./seo";

const baseURL = "https://lumen.example";

// Lumen's type system. System font stacks only, so nothing is loaded from the
// network. The stacks are defined on the `.lumen-fonts` class in custom.css;
// the root layout puts that class on <html> through `fonts.*.variable`.
const heading = { variable: "lumen-fonts" };
const body = { variable: "lumen-fonts" };
const label = { variable: "lumen-fonts" };
const code = { variable: "lumen-fonts" };

const fonts = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

const i18n = {
  locales: ["en"],
};

// Lumen: dark by default, warm stone neutrals, brand #E8590C (the exact
// ramp lives in custom.css as --scheme-brand-*), 4px corners.
const style = {
  theme: "dark", // dark | light - not needed when using ThemeProvider
  neutral: "sand", // sand | gray | slate
  brand: "orange",
  accent: "orange",
  solid: "color", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "micro", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
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
    line: false
  },
};

const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "support@lumen.example",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [
  {
    name: "Email",
    icon: "email",
    link: `mailto:${schema.email}`,
  },
];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
```

```css src/resources/custom.css
:root {
  --default-border: var(--neutral-alpha-weak);
}

/* Lumen type: monospace headings, system sans body. */
.lumen-fonts {
  --font-heading: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, "SFMono-Regular", Menlo, monospace;
}

/* Lumen brand ramp, anchored on #E8590C (step 600). */
:root {
  --scheme-brand-100: #1f0a00;
  --scheme-brand-200: #3d1500;
  --scheme-brand-300: #6b2403;
  --scheme-brand-400: #94350a;
  --scheme-brand-500: #bf4709;
  --scheme-brand-600: #e8590c;
  --scheme-brand-700: #f2792f;
  --scheme-brand-800: #f79a5b;
  --scheme-brand-900: #fbb98a;
  --scheme-brand-1000: #fdd3b3;
  --scheme-brand-1100: #fee7d4;
  --scheme-brand-1200: #fff3ea;
  --scheme-brand-600-10: rgba(232, 89, 12, 0.1);
  --scheme-brand-600-30: rgba(232, 89, 12, 0.3);
  --scheme-brand-600-50: rgba(232, 89, 12, 0.5);

  --scheme-accent-100: #1f0a00;
  --scheme-accent-200: #3d1500;
  --scheme-accent-300: #6b2403;
  --scheme-accent-400: #94350a;
  --scheme-accent-500: #bf4709;
  --scheme-accent-600: #e8590c;
  --scheme-accent-700: #f2792f;
  --scheme-accent-800: #f79a5b;
  --scheme-accent-900: #fbb98a;
  --scheme-accent-1000: #fdd3b3;
  --scheme-accent-1100: #fee7d4;
  --scheme-accent-1200: #fff3ea;
  --scheme-accent-600-10: rgba(232, 89, 12, 0.1);
  --scheme-accent-600-30: rgba(232, 89, 12, 0.3);
  --scheme-accent-600-50: rgba(232, 89, 12, 0.5);
}

/* 4px corners on buttons, inputs, cards and menus. */
:root,
[data-border] {
  --radius-xs: 2px;
  --radius-s: 4px;
  --radius-m: 4px;
  --radius-l: 4px;
  --radius-xl: 4px;
}
```

```tsx src/lib/data.ts
import type { IconName } from "@once-ui-system/core";

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

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

export type NavLeaf = { label: string; href: string; icon: IconName };
export type NavGroupDef = { key: string; label: string; icon: IconName; items: NavLeaf[] };

export const navGroups: NavGroupDef[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/", icon: "home" },
      { label: "Reports", href: "/#reports", icon: "document" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "folder",
    items: [
      { label: "Projects", href: "/projects", icon: "folder" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

export const stats = {
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  active: projects.filter((p) => p.status === "Active").length,
  paused: projects.filter((p) => p.status === "Paused").length,
  lastUpdate: projects.reduce((latest, p) => (p.updated > latest ? p.updated : latest), ""),
};
```

```tsx src/components/AppShell.tsx
"use client";

import {
  Breadcrumbs,
  Column,
  Drawer,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  UserMenu,
  Icon,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups, product, user } from "@/lib/data";

const SHELL_ROUTES = ["/", "/projects", "/settings"];
const MATCH_HREFS = ["/", "/projects", "/settings"];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * The signed-in frame for /, /projects and /settings. Mounted once from the
 * root layout, so the collapsed state and open groups survive navigation.
 * Any other route (auth, the template's /app pages) renders untouched.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({ analytics: true, workspace: true });

  if (!SHELL_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  const current = selectNavHref(pathname, MATCH_HREFS);
  const menuOpen = menuPath === pathname;
  const group = navGroups.find((g) => g.items.some((i) => i.href === current));
  const page = group?.items.find((i) => i.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const renderNav = (isCollapsed: boolean) => (
    <Nav density="compact" fill paddingX="8" collapsed={isCollapsed} aria-label="Main">
      {isCollapsed
        ? navGroups.flatMap((g) =>
            g.items.map((item) => (
              <NavItem
                key={item.label}
                href={item.href}
                icon={item.icon}
                label={item.label}
                aria-label={`${g.label}: ${item.label}`}
                title={`${g.label}: ${item.label}`}
                selected={item.href === current}
              />
            )),
          )
        : navGroups.map((g) => (
            <NavGroup
              key={g.key}
              label={g.label}
              icon={g.icon}
              open={!!open[g.key]}
              onToggle={() => setOpen((state) => ({ ...state, [g.key]: !state[g.key] }))}
            >
              {g.items.map((item) => (
                <NavItem
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  selected={item.href === current}
                />
              ))}
            </NavGroup>
          ))}
    </Nav>
  );

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">{user.name}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option
        value="settings"
        label="Settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  return (
    <Column fill flex={1}>
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
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
        <Text variant="heading-strong-m" onBackground="brand-strong">
          {product.name}
        </Text>
        <Row flex={1} paddingLeft="16" s={{ paddingLeft: "0" }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ hide: true }}>
          <UserMenu
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <UserMenu placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "64" : undefined}
          minWidth={collapsed ? undefined : 16}
          maxWidth={collapsed ? undefined : 16}
          fitHeight
          position="sticky"
          top="56"
          gap="8"
        >
          {renderNav(collapsed)}
          <Row paddingX="8" horizontal={collapsed ? "center" : "end"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            />
          </Row>
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            as="main"
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
            border
          >
            <Column fillWidth maxWidth="xl" paddingX="24" paddingY="32" gap="24" fitHeight>
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

```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { baseURL, landing, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { AppShell } from '@/components/AppShell';
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
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >
      <head>
        <Schema
          as="webPage"
          baseURL={baseURL}
          title="Lumen"
          description="Product analytics and issue tracking for small software teams."
          path="/"
        />
        <ThemeInit
          config={{
            theme: style.theme,
            brand: style.brand,
            accent: style.accent,
            neutral: style.neutral,
            solid: style.solid,
            'solid-style': style.solidStyle,
            border: style.border,
            surface: style.surface,
            transition: style.transition,
            scaling: style.scaling,
            'viz-style': dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <AppShell>{children}</AppShell>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```tsx src/app/page.tsx
import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { formatDate, product, stats, user } from "@/lib/data";

const cards = [
  { label: "Open issues", value: String(stats.openIssues), note: "Across all projects" },
  { label: "Active projects", value: String(stats.active), note: `${stats.paused} paused` },
  { label: "Last activity", value: formatDate(stats.lastUpdate), note: "Customer app" },
];

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {product.tagline}. Here is where the workspace stands today.
        </Text>
      </Column>

      <Grid columns="3" s={{ columns: 1 }} m={{ columns: 1 }} gap="16" fillWidth>
        {cards.map((card) => (
          <Column
            key={card.label}
            as="section"
            aria-label={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="8"
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" variant="display-strong-s">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column id="reports" as="section" aria-labelledby="reports-title" gap="8" paddingTop="16">
        <Heading as="h2" id="reports-title" variant="heading-strong-l">
          Reports
        </Heading>
        <Row>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Weekly issue throughput and event reports are generated every Monday for each active project.
          </Text>
        </Row>
      </Column>
    </>
  );
}
```

```tsx src/app/projects/page.tsx
import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const scheme = (status: ProjectStatus) =>
  status === "Active" ? "success" : status === "Paused" ? "warning" : "neutral";

export default function ProjectsPage() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {projects.length} projects in this workspace.
        </Text>
      </Column>

      <Column fillWidth overflowX="auto">
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
              <Tag key="s" size="s" scheme={scheme(p.status)} label={p.status} />,
              String(p.issues),
              formatDate(p.updated),
            ]),
          }}
        />
      </Column>
    </>
  );
}
```

```tsx src/app/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "./SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Your profile and notification preferences.
        </Text>
      </Column>
      <SettingsForm />
    </>
  );
}
```

```tsx src/app/settings/SettingsForm.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Column maxWidth="m" gap="32">
        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="profile-title">
          <Heading as="h2" id="profile-title" variant="heading-strong-l">
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
            type="email"
            label="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Role: {user.role}
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="notify-title">
          <Heading as="h2" id="notify-title" variant="heading-strong-l">
            Notifications
          </Heading>
          <Switch
            label="Weekly report email"
            checked={weekly}
            onToggle={(value) => {
              setWeekly(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Alert me when an issue is assigned"
            checked={alerts}
            onToggle={(value) => {
              setAlerts(value);
              setSaved(false);
            }}
          />
        </Column>

        <Row gap="16" vertical="center">
          <Button type="submit" label="Save changes" />
          <Text role="status" variant="body-default-s" onBackground="neutral-weak">
            {saved ? "Settings saved." : ""}
          </Text>
        </Row>
      </Column>
    </form>
  );
}
```
