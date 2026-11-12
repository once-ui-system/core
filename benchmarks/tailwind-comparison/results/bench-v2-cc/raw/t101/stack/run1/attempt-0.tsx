```ts src/lib/data.ts
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

export const statusScheme = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
} as const;

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
    icon: "folder",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Settings", href: "/settings" },
    ],
  },
];

export const shellPaths = nav.flatMap((section) => section.items.map((item) => item.href));
```

```tsx src/components/AppShell.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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
  SmartLink,
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { nav, shellPaths, user } from "@/lib/data";

function SideNav({ current, collapsed }: { current: string | null; collapsed?: boolean }) {
  return (
    <Nav fill paddingX="8" density="compact" collapsed={collapsed} aria-label="Main">
      {nav.map((section) => (
        <NavGroup
          key={section.key}
          label={section.label}
          icon={section.icon}
          defaultOpen={section.items.some((item) => item.href === current)}
        >
          {section.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              selected={item.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  if (!shellPaths.includes(pathname)) {
    return <>{children}</>;
  }

  const current = selectNavHref(pathname, shellPaths);
  const section = nav.find((s) => s.items.some((item) => item.href === current));
  const leaf = section?.items.find((item) => item.href === current);
  const crumbs = [
    { label: section?.label ?? "Lumen" },
    { label: leaf?.label ?? "Overview" },
  ];

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
            size="s"
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
            size="s"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <SmartLink href="/">
          <Text as="span" variant="heading-strong-m" onBackground="brand-strong">
            Lumen
          </Text>
        </SmartLink>
        <Row s={{ hide: true }} paddingLeft="16" flex={1}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row hide s={{ hide: false }} flex={1}>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {leaf?.label}
          </Text>
        </Row>
        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: "MO", size: "s" }}
          placement="bottom-end"
          dropdown={
            <Column minWidth={12} padding="4" gap="2">
              <Option value="profile" label={user.email} description="Signed in" disabled />
              <Option value="settings" label="Settings" href="/settings" />
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "64" : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav current={current} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            paddingX="16"
            background="surface"
          >
            <Column as="main" id="main" fillWidth maxWidth="xl" gap="24" paddingY="24" fitHeight>
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
          <SideNav current={current} />
        </Column>
      </Drawer>
    </Column>
  );
}
```

```tsx src/components/PageTitle.tsx
import { Column, Heading, Text } from "@once-ui-system/core";

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <Column gap="4">
      <Heading as="h1" variant="heading-strong-l">
        {title}
      </Heading>
      {description ? (
        <Text variant="body-default-s" onBackground="neutral-weak">
          {description}
        </Text>
      ) : null}
    </Column>
  );
}
```

```tsx src/app/page.tsx
import { Column, Grid, Heading, Line, Row, Tag, Text } from "@once-ui-system/core";
import { PageTitle } from "@/components/PageTitle";
import { projects, statusScheme, user } from "@/lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));

  const cards = [
    { label: "Open issues", value: String(open), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "in progress now" },
    { label: "Paused projects", value: String(paused), note: "waiting on a restart" },
    { label: "Last activity", value: latest[0].updated, note: latest[0].name },
  ];

  return (
    <>
      <PageTitle
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12">
        {cards.map((card) => (
          <Column key={card.label} background="page" border radius="m" padding="16" gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" variant="display-strong-xs">
              {card.value}
            </Heading>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>
      <Column background="page" border radius="m" padding="16" gap="8">
        <Heading as="h2" variant="heading-strong-s">
          Recently updated
        </Heading>
        <Column>
          {latest.slice(0, 4).map((project, index) => (
            <Column key={project.key} fillWidth>
              {index > 0 ? <Line /> : null}
              <Row fillWidth vertical="center" gap="12" paddingY="8" wrap>
                <Text variant="code-default-s" onBackground="neutral-weak">
                  {project.key}
                </Text>
                <Text variant="label-default-m" flex={1}>
                  {project.name}
                </Text>
                <Tag scheme={statusScheme[project.status]} size="s" label={project.status} />
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {project.updated}
                </Text>
              </Row>
            </Column>
          ))}
        </Column>
      </Column>
    </>
  );
}
```

```tsx src/app/projects/page.tsx
import { Column, Table, Tag } from "@once-ui-system/core";
import { PageTitle } from "@/components/PageTitle";
import { projects, statusScheme } from "@/lib/data";

export default function ProjectsPage() {
  const headers = [
    { content: "Key", key: "key", sortable: true, width: "96px" },
    { content: "Name", key: "name", sortable: true },
    { content: "Status", key: "status" },
    { content: "Issues", key: "issues", sortable: true, align: "right" as const },
    { content: "Updated", key: "updated", sortable: true },
  ];
  const rows = projects.map((p) => [
    p.key,
    p.name,
    <Tag key={p.key} scheme={statusScheme[p.status]} size="s" label={p.status} />,
    String(p.issues),
    p.updated,
  ]);

  return (
    <>
      <PageTitle
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />
      <Column fillWidth overflowX="auto">
        <Table data={{ headers, rows }} compact searchable searchPlaceholder="Search projects" />
      </Column>
    </>
  );
}
```

```tsx src/app/reports/page.tsx
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { PageTitle } from "@/components/PageTitle";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <PageTitle title="Reports" description="Open issues by project." />
      <Column background="page" border radius="m" padding="16" gap="12">
        <Heading as="h2" variant="heading-strong-s">
          Open issues
        </Heading>
        {projects.map((p) => (
          <Row key={p.key} vertical="center" gap="12">
            <Text variant="label-default-s" style={{ width: "8rem" }}>
              {p.name}
            </Text>
            <Row flex={1} height="8" background="neutral-alpha-weak" radius="s">
              <Row
                height="8"
                background="brand-medium"
                radius="s"
                style={{ width: `${(p.issues / max) * 100}%` }}
              />
            </Row>
            <Text variant="code-default-s" onBackground="neutral-weak">
              {p.issues}
            </Text>
          </Row>
        ))}
      </Column>
    </>
  );
}
```

```tsx src/app/settings/page.tsx
"use client";

import { useState } from "react";
import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { PageTitle } from "@/components/PageTitle";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);

  return (
    <>
      <PageTitle title="Settings" description="Your profile and notification preferences." />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addToast({ variant: "success", message: "Settings saved" });
        }}
      >
        <Column gap="16" maxWidth="m">
          <Column background="page" border radius="m" padding="16" gap="12">
            <Heading as="h2" variant="heading-strong-s">
              Profile
            </Heading>
            <Input
              id="name"
              label="Full name"
              size="xs"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              size="xs"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Text variant="body-default-s" onBackground="neutral-weak">
              Role: {user.role}
            </Text>
          </Column>
          <Column background="page" border radius="m" padding="16" gap="12">
            <Heading as="h2" variant="heading-strong-s">
              Notifications
            </Heading>
            <Switch
              label="Weekly digest"
              description="A Monday summary of issues opened and closed."
              checked={digest}
              onToggle={setDigest}
            />
            <Switch
              label="Status alerts"
              description="Tell me when a project is paused or archived."
              checked={alerts}
              onToggle={setAlerts}
            />
          </Column>
          <Row>
            <Button type="submit" size="s" label="Save changes" />
          </Row>
        </Column>
      </form>
    </>
  );
}
```

```js src/resources/once-ui.config.js
import { landing } from "./seo";

const baseURL = "https://lumen.example.com";

// Fonts are plain system stacks (set as CSS variables in custom.css): nothing is
// loaded from the network. The shape stays so the root layout can keep reading it.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

const i18n = {
  locales: ["en"],
};

/** @type {import("@once-ui-system/core").OnceUIStyleConfig} */
const style = {
  theme: "system", // stays "system" so the theme switch works
  defaultTheme: "light",
  neutral: "slate",
  brand: "custom",
  brandSeed: "#0F766E",
  accent: "custom",
  accentSeed: "#0F766E",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "sharp", // 2px corners, see custom.css
  surface: "filled",
  transition: "micro",
  scaling: "90", // compact density
};

const dataStyle = {
  variant: "flat",
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
};

const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "support@lumen.example.com",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
```

```tsx src/components/Providers.tsx
"use client";

import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import type { ChartMode, ChartVariant } from "@once-ui-system/core/data";
// The Next adapters: links go through next/link and images through next/image.
import { LayoutProvider } from "@once-ui-system/core/next";
import { style, dataStyle } from "../resources/once-ui.config";
import { iconLibrary } from "../resources/icons";
import { UserProvider } from "./UserProvider";
import { OrgProvider } from "./OrgProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider
        theme={style.theme}
        defaultTheme={style.defaultTheme}
        brand={style.brand}
        brandSeed={style.brandSeed}
        accent={style.accent}
        accentSeed={style.accentSeed}
        neutral={style.neutral}
        solid={style.solid}
        solidStyle={style.solidStyle}
        border={style.border}
        surface={style.surface}
        transition={style.transition}
        scaling={style.scaling}
      >
        <DataThemeProvider
          variant={dataStyle.variant as ChartVariant}
          mode={dataStyle.mode as ChartMode}
          height={dataStyle.height}
          axis={{
            stroke: dataStyle.axis.stroke
          }}
          tick={{
            fill: dataStyle.tick.fill,
            fontSize: dataStyle.tick.fontSize,
            line: dataStyle.tick.line
          }}
          >
          <ToastProvider>
            <IconProvider icons={iconLibrary}>
              <UserProvider>
                <OrgProvider>
                  {children}
                </OrgProvider>
              </UserProvider>
            </IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
```

```tsx src/app/layout.tsx
import '@once-ui-system/core/css/styles.css';
import '@once-ui-system/core/css/tokens.css';
import '@/resources/custom.css'

import classNames from "classnames";

import { baseURL, landing, fonts, style } from "@/resources";
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
        <ThemeInit config={style} />
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

```css src/resources/custom.css
:root {
  --default-border: var(--neutral-alpha-weak);

  /* Lumen type: Georgia headings, system sans body. No network fonts. */
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
}

/* Lumen corner radius: 2px on buttons, inputs, cards and menus. */
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
