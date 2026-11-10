```js src/resources/once-ui.config.js
// Lumen's brand lives here: colours, radius-free style switches and fonts.
// The theme provider (src/components/Providers.tsx) and the pre-paint
// ThemeInit script (src/app/layout.tsx) both read this one object.

const baseURL = "https://lumen.example";

// System font stacks: nothing is loaded from the network. The stacks
// themselves are set once as the --font-* tokens in src/resources/custom.css.
const fonts = {
  heading: {
    variable: "--font-heading",
    style: { fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif' },
  },
  body: {
    variable: "--font-body",
    style: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  },
  label: {
    variable: "--font-label",
    style: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  },
  code: {
    variable: "--font-code",
    style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  },
};

const i18n = {
  locales: ["en"],
};

/** @type {import("@once-ui-system/core").OnceUIStyleConfig} */
const style = {
  theme: "system", // stays "system" so the visitor can switch
  defaultTheme: "light", // a first visit starts light
  neutral: "sand", // warm sand neutrals
  brand: "custom", // generated from brandSeed
  brandSeed: "#DB2777", // Lumen pink: primary buttons, current nav item, links, focus rings
  accent: "pink",
  solid: "color", // solid surfaces (primary buttons) use the brand colour
  solidStyle: "flat",
  border: "rounded", // radius is pinned to 16px in custom.css
  surface: "filled",
  transition: "all",
  scaling: "105", // airy: everything a little larger
};

const dataStyle = {
  variant: "gradient", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
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
  description: "Lumen is a product-analytics and issue-tracking app for small software teams.",
  email: "hello@lumen.example",
};

/** @type {{ name: string; icon: import("@once-ui-system/core").IconName; link: string }[]} */
const social = [];

export { baseURL, fonts, i18n, style, schema, social, dataStyle };
```

```css src/resources/custom.css
:root {
  --default-border: var(--neutral-alpha-weak);
}

/* Lumen fonts: rounded headings, plain system body. */
:root:root {
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* Lumen corner radius: 16px on buttons, inputs, cards and menus. */
:root:root,
html[data-border] {
  --radius-s: 0.75rem;
  --radius-m: 1rem;
  --radius-l: 1rem;
  --radius-xl: 1.5rem;
}
```

```tsx src/components/Providers.tsx
"use client";

import { type BorderStyle, DataThemeProvider, IconProvider, type NeutralColor, type ScalingSize, type Schemes, type SolidStyle, type SolidType, type SurfaceStyle, type Theme, ThemeProvider, ToastProvider, type TransitionStyle } from "@once-ui-system/core";
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
        theme={style.theme as Theme}
        defaultTheme={style.defaultTheme as Theme}
        brand={style.brand as Schemes | "custom"}
        brandSeed={style.brandSeed}
        accent={style.accent as Schemes}
        neutral={style.neutral as NeutralColor}
        solid={style.solid as SolidType}
        solidStyle={style.solidStyle as SolidStyle}
        border={style.border as BorderStyle}
        surface={style.surface as SurfaceStyle}
        transition={style.transition as TransitionStyle}
        scaling={style.scaling as ScalingSize}
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

import { baseURL, schema, style, dataStyle } from "@/resources";
import { Meta, Schema, Column, Flex, ThemeInit, type OnceUIStyleConfig } from "@once-ui-system/core";
import type { ChartMode } from "@once-ui-system/core/data";
import { LocaleProvider, Providers } from '@/components';
import { AppFrame } from '@/components/AppShell';
import { getLocale } from '@/lib/i18n/server';

const title = "Lumen: product analytics and issue tracking";
const description = schema.description;

export async function generateMetadata() {
  return Meta.generate({
    title,
    description,
    baseURL: baseURL,
    image: "/api/og/generate?title=Lumen",
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
        {/* A sync <script> is only allowed inside the document head; React 19.2
            refuses one rendered as a bare child of <html>. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={title}
          description={description}
          path="/"
        />
        <ThemeInit
          config={style as OnceUIStyleConfig}
          dataStyle={{ mode: dataStyle.mode as ChartMode }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              {/* The Lumen shell frames /, /projects and /settings once; every
                  other route renders as it always did. */}
              <AppFrame>{children}</AppFrame>
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

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

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

export const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

/** Fixed locale and time zone, so the server and the browser print the same text. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
```

```tsx src/components/AppShell.tsx
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
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
  type IconName,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { user } from "@/lib/data";

type NavLeaf = { label: string; href: string };
type NavGroupData = { label: string; icon: IconName; items: NavLeaf[] };

const nav: NavGroupData[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/" },
      // Reports is the section of the dashboard that lists the latest activity.
      { label: "Reports", href: "/#reports" },
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

// Only real routes take part in the current-page match.
const routeHrefs = nav.flatMap((group) =>
  group.items.map((item) => item.href).filter((href) => !href.includes("#")),
);

const trail: Record<string, { group: string; page: string }> = {
  "/": { group: "Analytics", page: "Overview" },
  "/projects": { group: "Workspace", page: "Projects" },
  "/settings": { group: "Workspace", page: "Settings" },
};

function SideNav({ pathname, collapsed }: { pathname: string; collapsed?: boolean }) {
  const current = selectNavHref(pathname, routeHrefs);
  return (
    <Nav fill padding="8" density="spacious" collapsed={collapsed} aria-label="Main">
      {nav.map((group) => (
        <NavGroup key={group.label} label={group.label} icon={group.icon} defaultOpen>
          {group.items.map((item) => (
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
}

function Account({ compact }: { compact?: boolean }) {
  const dropdown = (
    <Column fillWidth padding="4" gap="2" minWidth={14}>
      <Text variant="body-default-s" onBackground="neutral-weak" paddingX="12" paddingY="8">
        {user.email}
      </Text>
      <Option
        value="settings"
        label="Settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );
  return compact ? (
    <UserMenu avatarProps={{ value: user.name.charAt(0) }} dropdown={dropdown} />
  ) : (
    <UserMenu
      name={user.name}
      subline={user.role}
      avatarProps={{ value: user.name.charAt(0) }}
      dropdown={dropdown}
    />
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const closeMenu = () => setMenuPath(null);

  const page = trail[pathname] ?? trail["/"];
  const crumbs = [
    { label: "Lumen", href: "/" },
    { label: page.group },
    { label: page.page },
  ];

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        minHeight="56"
        paddingX="16"
        gap="12"
        vertical="center"
        position="sticky"
        top="0"
        background="page"
        zIndex={1}
      >
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="l"
            ariaLabel="Open menu"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            size="l"
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row gap="8" vertical="center" s={{ hide: true }}>
          <Icon name="sparkle" onBackground="brand-strong" />
          <Text variant="heading-strong-m" family="heading">
            Lumen
          </Text>
        </Row>
        <Row flex={1} paddingLeft="8" vertical="center">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ hide: true }}>
          <Account />
        </Row>
        <Row hide s={{ hide: false }}>
          <Account compact />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={18} minWidth={collapsed ? undefined : 16} fitHeight position="sticky" top="56">
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
          >
            <Column
              as="main"
              id="main"
              fillWidth
              maxWidth="xl"
              gap="32"
              paddingY="40"
              paddingX="24"
              s={{ paddingX: "16", paddingY: "24" }}
              fitHeight
            >
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer open={menuOpen} onClose={closeMenu} side="left" size="s" title="Menu" flush>
        <Column
          paddingTop="64"
          paddingBottom="16"
          onClick={(event) => {
            // A link inside the nav (the Reports anchor stays on the same path) closes the drawer.
            if ((event.target as HTMLElement).closest("a")) closeMenu();
          }}
        >
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
}

/** Frames the three Lumen screens with the shell; any other route is left alone. */
function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (!(pathname in trail)) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}

export { AppFrame, AppShell };
```

```tsx src/app/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusScheme, user } from "@/lib/data";

export default function Page() {
  const openIssues = projects.reduce((sum, project) => sum + project.issues, 0);
  const active = projects.filter((project) => project.status === "Active");
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
  const firstName = user.name.split(" ")[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: `of ${projects.length} in your workspace` },
    { label: "Busiest project", value: busiest.name, note: `${busiest.issues} open issues` },
  ];

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Here is how your team is doing today. Nice work keeping things moving.
        </Text>
      </Column>

      <Grid columns="3" m={{ columns: 2 }} s={{ columns: 1 }} gap="24">
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="l" padding="24" gap="8">
            <Text variant="label-default-m" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" variant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" id="reports" gap="16" aria-labelledby="reports-title">
        <Heading as="h2" id="reports-title" variant="heading-strong-l">
          Reports: latest activity
        </Heading>
        <Column background="surface" border radius="l" padding="8">
          {latest.map((project) => (
            <Row
              key={project.key}
              paddingX="16"
              paddingY="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
            >
              <Row gap="12" vertical="center">
                <Tag label={project.key} />
                <Text variant="label-strong-m">{project.name}</Text>
              </Row>
              <Row gap="16" vertical="center">
                <Tag scheme={statusScheme[project.status]} label={project.status} />
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Updated {formatDate(project.updated)}
                </Text>
              </Row>
            </Row>
          ))}
        </Column>
      </Column>
    </>
  );
}
```

```tsx src/app/projects/page.tsx
import { Column, Heading, Row, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusScheme } from "@/lib/data";

export default function Page() {
  const headers = [
    { content: "Key", key: "key" },
    { content: "Project", key: "name" },
    { content: "Status", key: "status" },
    { content: "Open issues", key: "issues", align: "right" as const },
    { content: "Last updated", key: "updated" },
  ];

  const rows = projects.map((project) => [
    <Text key="key" variant="label-strong-s">
      {project.key}
    </Text>,
    <Text key="name" variant="body-default-m">
      {project.name}
    </Text>,
    <Tag key="status" scheme={statusScheme[project.status]} label={project.status} />,
    <Text key="issues" variant="body-default-m">
      {project.issues}
    </Text>,
    <Text key="updated" variant="body-default-s" onBackground="neutral-weak">
      {formatDate(project.updated)}
    </Text>,
  ]);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Projects
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {projects.length} projects in your workspace, from the marketing site to the mobile beta.
        </Text>
      </Column>
      <Row fillWidth overflowX="auto" background="surface" border radius="l">
        <Table data={{ headers, rows }} searchable searchPlaceholder="Search projects" />
      </Row>
    </>
  );
}
```

```tsx src/app/settings/page.tsx
"use client";

import { Button, Column, Heading, Input, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export default function Page() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Settings
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Make Lumen yours: your details and the updates you like to get.
        </Text>
      </Column>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Column gap="24" maxWidth="m">
          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" variant="heading-strong-l">
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
            <Text variant="body-default-s" onBackground="neutral-weak">
              Your role in this workspace: {user.role}
            </Text>
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" variant="heading-strong-l">
              Notifications
            </Heading>
            <Switch
              label="Weekly summary"
              description="A friendly recap of what your team shipped, every Monday."
              checked={weekly}
              onToggle={(value) => {
                setWeekly(value);
                setSaved(false);
              }}
            />
            <Switch
              label="Mentions"
              description="Hear about it when a teammate mentions you on an issue."
              checked={mentions}
              onToggle={(value) => {
                setMentions(value);
                setSaved(false);
              }}
            />
            <Switch
              label="Product news"
              description="New features and tips from the Lumen team."
              checked={releases}
              onToggle={(value) => {
                setReleases(value);
                setSaved(false);
              }}
            />
          </Column>

          <Column gap="12" horizontal="start">
            <Button type="submit" size="l" label="Save changes" />
            <Text role="status" aria-live="polite" variant="body-default-s" onBackground="success-strong">
              {saved ? "Saved. Your settings are up to date." : ""}
            </Text>
          </Column>
        </Column>
      </form>
    </>
  );
}
```
