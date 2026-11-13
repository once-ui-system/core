```js src/resources/once-ui.config.js
import { landing } from "./seo";

// IMPORTANT: Replace with your own domain address - it's used for SEO in meta tags and schema
const baseURL = "https://stack.once-ui.com";

// Fonts are system stacks, set once as CSS variables in src/resources/custom.css
// (headings: ui-rounded / SF Pro Rounded, body: ui-sans-serif). Nothing loads from the network.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

const i18n = {
  locales: ["en"],
};

// Lumen's brand: #DB2777 as the 600 step of the brand scale, warm sand neutrals,
// 16px corners (see custom.css), light by default, airy density.
const brandScale = {
  100: "#500724",
  200: "#6b0f35",
  300: "#831843",
  400: "#9d174d",
  500: "#be185d",
  600: "#db2777",
  700: "#ec4899",
  800: "#f472b6",
  900: "#f9a8d4",
  1000: "#fbcfe8",
  1100: "#fce7f3",
  1200: "#fdf2f8",
  "600-15": "rgba(219,39,119,0.15)",
  "600-30": "rgba(219,39,119,0.3)",
  "600-50": "rgba(219,39,119,0.5)",
};

const style = {
  theme: "system", // stays "system" so the theme switch works
  defaultTheme: "light", // what a first visit sees
  neutral: "sand", // sand | gray | slate
  brand: "custom", // exact colours come from brandScale
  accent: "orange",
  solid: "color", // solid buttons use the brand colour
  solidStyle: "flat",
  border: "rounded",
  surface: "filled",
  transition: "all",
  scaling: "105", // airy: a little larger everywhere
  brandScale,
};

const dataStyle = {
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
};

const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
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

/* Lumen typography: set once, every component reads these variables. */
:root,
html {
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
}

/* Lumen corners: 16px on buttons, inputs, cards and menus. */
:root,
html:root[data-border],
[data-border] {
  --radius-xs: 8px;
  --radius-s: 12px;
  --radius-m: 16px;
  --radius-l: 16px;
  --radius-xl: 20px;
}
```

```tsx src/components/Providers.tsx
"use client";

import { type ComponentProps } from "react";
import { type BorderStyle, DataThemeProvider, IconProvider, type NeutralColor, type ScalingSize, type SolidStyle, type SolidType, type SurfaceStyle, type Theme, ThemeProvider, ToastProvider, type TransitionStyle } from "@once-ui-system/core";
import type { ChartMode, ChartVariant } from "@once-ui-system/core/data";
// The Next adapters: links go through next/link and images through next/image.
import { LayoutProvider } from "@once-ui-system/core/next";
import { style, dataStyle } from "../resources/once-ui.config";
import { iconLibrary } from "../resources/icons";
import { UserProvider } from "./UserProvider";
import { OrgProvider } from "./OrgProvider";

type ThemeProps = ComponentProps<typeof ThemeProvider>;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider
        theme={style.theme as Theme}
        defaultTheme={style.defaultTheme as Theme}
        brand={style.brand as ThemeProps["brand"]}
        brandScale={style.brandScale as ThemeProps["brandScale"]}
        accent={style.accent as ThemeProps["accent"]}
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

import { baseURL, landing, style } from "@/resources";
import { Meta, Schema, Column, Flex, ThemeInit, type OnceUIStyleConfig } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { LumenFrame } from '@/components/LumenFrame';
import { getLocale } from '@/lib/i18n/server';

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    // The site-wide defaults. No canonical here: each page names its own, and
    // a default would point every page that doesn't at the landing page.
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
        {/* A sync <script> is only allowed inside the document head; React 19.2
            refuses one rendered as a bare child of <html>. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        <ThemeInit config={style as unknown as OnceUIStyleConfig} />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <LumenFrame>{children}</LumenFrame>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```ts src/lib/data.ts
import type { IconName } from "@once-ui-system/core";

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

export type NavLeaf = { label: string; href: string; icon: IconName };
export type NavSection = { key: string; label: string; icon: IconName; items: NavLeaf[] };

export const nav: NavSection[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/", icon: "home" },
      { label: "Reports", href: "/reports", icon: "trend" },
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

/** Dates are fixed to UTC so server and browser render the same text. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
```

```tsx src/components/LumenFrame.tsx
"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs,
  Column,
  Drawer,
  DropdownWrapper,
  Icon,
  IconButton,
  Line,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  SmartLink,
  Text,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { nav, user } from "@/lib/data";

const SHELL_ROUTES = nav.flatMap((section) => section.items.map((item) => item.href));
const allHrefs = SHELL_ROUTES;

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, allHrefs);

  if (collapsed) {
    return (
      <Column as="nav" aria-label="Main" horizontal="center" gap="12" paddingY="16">
        {nav.map((section, index) => (
          <Column key={section.key} horizontal="center" gap="8">
            {index > 0 && <Line width="32" />}
            {section.items.map((item) => {
              const name = `${section.label}: ${item.label}`;
              return (
                <IconButton
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  size="l"
                  variant={item.href === current ? "primary" : "ghost"}
                  tooltip={name}
                  tooltipPosition="right"
                  ariaLabel={name}
                />
              );
            })}
          </Column>
        ))}
      </Column>
    );
  }

  return (
    <Nav fill paddingX="8" paddingY="16" density="spacious" aria-label="Main">
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

export function LumenFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const menuOpen = menuPath === pathname;

  if (!SHELL_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  const section = nav.find((s) => s.items.some((item) => item.href === pathname));
  const leaf = section?.items.find((item) => item.href === pathname);
  const crumbs = [
    { label: section?.label ?? "Lumen" },
    { label: leaf?.label ?? "" },
  ];

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            ariaLabel="Open navigation menu"
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
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <SmartLink href="/">
          <Row vertical="center" gap="8">
            <Icon name="sparkle" onBackground="brand-strong" />
            <Text variant="heading-strong-l" family="heading">
              Lumen
            </Text>
          </Row>
        </SmartLink>
        <Row flex={1} paddingLeft="16" vertical="center" overflow="hidden">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <DropdownWrapper
          placement="bottom-end"
          trigger={<IconButton icon="person" variant="tertiary" ariaLabel="Account menu" tooltip="Account" />}
          dropdown={
            <Column minWidth={16} padding="4" gap="2">
              <Column paddingX="12" paddingY="8" gap="4">
                <Text variant="label-strong-m">{user.name}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {user.email} · {user.role}
                </Text>
              </Column>
              <Line />
              <Option value="profile" label="Profile" href="/settings" />
              <Option value="settings" label="Settings" href="/settings" />
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "72" : 16}
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
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="32" paddingY="40" fitHeight>
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

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Column background="page" border radius="l" padding="24" gap="8">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Heading as="p" variant="display-strong-s">
        {value}
      </Heading>
      <Text variant="body-default-s" onBackground="neutral-weak">
        {hint}
      </Text>
    </Column>
  );
}

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Here is how your teams are doing today. Nice work keeping things moving.
        </Text>
      </Column>

      <Grid columns={4} m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        <Stat label="Open issues" value={String(openIssues)} hint={`Across ${projects.length} projects`} />
        <Stat label="Active projects" value={String(active.length)} hint="Currently being worked on" />
        <Stat label="Busiest project" value={busiest.key} hint={`${busiest.name}, ${busiest.issues} issues`} />
        <Stat label="Last updated" value={formatDate(latest.updated)} hint={latest.name} />
      </Grid>

      <Column gap="16">
        <Heading as="h2" variant="heading-strong-xl">
          Recent activity
        </Heading>
        <Column background="page" border radius="l" padding="8">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row key={p.key} paddingX="16" paddingY="16" gap="16" vertical="center" wrap>
                <Tag size="s" label={p.key} />
                <Column flex={1} minWidth={12} gap="4">
                  <Text variant="label-strong-m">{p.name}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {p.issues} open issues
                  </Text>
                </Column>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Updated {formatDate(p.updated)}
                </Text>
              </Row>
            ))}
        </Column>
      </Column>
    </>
  );
}
```

```tsx src/app/projects/page.tsx
import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import { Table } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function ProjectsPage() {
  const rows = projects.map((p) => [
    <Tag key={`${p.key}-key`} size="s" label={p.key} />,
    <Text key={`${p.key}-name`} variant="label-strong-m">
      {p.name}
    </Text>,
    <Tag key={`${p.key}-status`} size="s" scheme={statusScheme[p.status]} label={p.status} />,
    <Text key={`${p.key}-issues`} variant="body-default-m">
      {p.issues}
    </Text>,
    <Text key={`${p.key}-updated`} variant="body-default-m">
      {formatDate(p.updated)}
    </Text>,
  ]);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Projects
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {projects.length} projects in your workspace.
        </Text>
      </Column>
      <Column fillWidth overflowX="auto">
        <Table
          data={{
            headers: [
              { content: "Key", key: "key" },
              { content: "Name", key: "name" },
              { content: "Status", key: "status" },
              { content: "Open issues", key: "issues" },
              { content: "Last updated", key: "updated" },
            ],
            rows,
          }}
        />
      </Column>
    </>
  );
}
```

```tsx src/app/reports/page.tsx
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Reports
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Where your open issues sit right now.
        </Text>
      </Column>
      <Column background="page" border radius="l" padding="8">
        {projects.map((p) => (
          <Row key={p.key} paddingX="16" paddingY="16" gap="16" vertical="center" horizontal="between">
            <Text variant="label-strong-m">{p.name}</Text>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {p.issues} of {total} open issues
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
import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Switch,
  Tag,
  Text,
  useTheme,
} from "@once-ui-system/core";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Settings
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Manage your profile and how Lumen keeps you in the loop.
        </Text>
      </Column>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Column gap="32" maxWidth="m">
          <Column background="page" border radius="l" padding="24" gap="24">
            <Row horizontal="between" vertical="center" gap="16" wrap>
              <Heading as="h2" variant="heading-strong-xl">
                Profile
              </Heading>
              <Tag size="m" scheme="brand" label={user.role} />
            </Row>
            <Input
              id="name"
              label="Full name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSaved(false);
              }}
            />
          </Column>

          <Column background="page" border radius="l" padding="24" gap="24">
            <Heading as="h2" variant="heading-strong-xl">
              Notifications
            </Heading>
            <Switch
              label="Weekly digest"
              description="A friendly summary of progress every Monday."
              ariaLabel="Weekly digest"
              checked={digest}
              onToggle={(value) => {
                setDigest(value);
                setSaved(false);
              }}
            />
            <Switch
              label="Mentions"
              description="Tell me when a teammate mentions me on an issue."
              ariaLabel="Mentions"
              checked={mentions}
              onToggle={(value) => {
                setMentions(value);
                setSaved(false);
              }}
            />
          </Column>

          <Column background="page" border radius="l" padding="24" gap="16">
            <Heading as="h2" variant="heading-strong-xl">
              Appearance
            </Heading>
            <SegmentedControl
              buttons={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System", value: "system" },
              ]}
              value={theme}
              onChange={(value) => setTheme(value as "light" | "dark" | "system")}
            />
          </Column>

          <Row gap="16" vertical="center" wrap>
            <Button type="submit" label="Save changes" />
            <Text role="status" aria-live="polite" variant="body-default-m" onBackground="neutral-weak">
              {saved ? "Saved. Looking good!" : ""}
            </Text>
          </Row>
        </Column>
      </form>
    </>
  );
}
```
