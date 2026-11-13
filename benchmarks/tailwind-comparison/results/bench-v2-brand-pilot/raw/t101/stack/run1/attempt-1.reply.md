Two fixes are needed. The reports bar now uses `brand-strong`. In the root layout, `ThemeInit` takes the whole style config through its `config` prop (as the docs' starter does), so I now pass `style` and `dataStyle` directly rather than a hand-built object with an unsupported `defaultTheme` key.

The same project has two `/` routes if `src/app/page.tsx` and a group page both exist. I kept a single `page.tsx` at the root and the group layout for the other screens.

```js src/resources/once-ui.config.js
import { landing } from "./seo";

// Used for SEO in meta tags and schema.
const baseURL = "https://lumen.example";

// Lumen sets its type in system fonts: nothing is fetched from the network.
// Once UI reads these four CSS variables; the root layout sets them on <html>.
const fonts = {
  heading: {
    variable: "--font-heading",
    stack: 'Georgia, "Times New Roman", serif',
  },
  body: {
    variable: "--font-body",
    stack: "ui-sans-serif, system-ui, sans-serif",
  },
  label: {
    variable: "--font-label",
    stack: "ui-sans-serif, system-ui, sans-serif",
  },
  code: {
    variable: "--font-code",
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
};

// The app's languages, as BCP 47 tags. The first is the default.
const i18n = {
  locales: ["en"],
};

// Lumen's brand ramp. #0F766E sits at step 500/600 in the light theme (primary
// buttons, the current nav item, links, focus rings) and is lifted for contrast
// in the dark theme.
const brandScale = {
  light: {
    100: "#042F2C",
    200: "#064E49",
    300: "#0B5F58",
    400: "#0D6B63",
    500: "#0F766E",
    600: "#0F766E",
    700: "#2FA298",
    800: "#8FD3CB",
    900: "#BDE8E3",
    1000: "#D6F2EF",
    1100: "#E9F8F6",
    1200: "#F3FBFA",
  },
  dark: {
    100: "#042F2C",
    200: "#064E49",
    300: "#0B5F58",
    400: "#0D6B63",
    500: "#0F766E",
    600: "#2DA399",
    700: "#4DB8AE",
    800: "#8FD3CB",
    900: "#BDE8E3",
    1000: "#D6F2EF",
    1100: "#E9F8F6",
    1200: "#F3FBFA",
  },
};

// Cool slate neutrals.
const neutralScale = {
  100: "#0F172A",
  200: "#1E293B",
  300: "#334155",
  400: "#475569",
  500: "#64748B",
  600: "#94A3B8",
  700: "#CBD5E1",
  800: "#E2E8F0",
  900: "#F1F5F9",
  1000: "#F8FAFC",
  1100: "#FBFCFD",
  1200: "#FFFFFF",
};

// Default customization applied to the HTML in the root layout.
const style = {
  theme: "system", // keep "system" so the theme switch works; defaultTheme picks the first visit
  defaultTheme: "light", // dark | light | system
  neutral: "slate", // sand | gray | slate
  brand: "emerald", // seed family; brandScale gives the exact colours
  accent: "emerald",
  brandScale,
  accentScale: brandScale,
  neutralScale,
  solid: "color", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "micro", // all | micro | macro
  scaling: "90", // 90 | 95 | 100 | 105 | 110: compact density
};

const dataStyle = {
  variant: "flat", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 20, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

// Schema data
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

```js src/resources/seo.js
const landing = {
  home: {
    path: "/",
    title: "Lumen: product analytics and issue tracking",
    description:
      "Lumen is a product-analytics and issue-tracking app for small software teams.",
    image: "/images/og/home.jpg",
    robots: "noindex,nofollow",
    canonical: "https://lumen.example",
    alternates: [{ href: "https://lumen.example", hrefLang: "en" }],
  },
};

const product = {
  dashboard: {
    path: "/",
    title: "Dashboard - Lumen",
    description: "Your workspace at a glance: open issues, active projects and recent changes.",
    image: "/images/og/home.jpg",
    robots: "noindex,nofollow",
    canonical: "https://lumen.example",
    alternates: [{ href: "https://lumen.example", hrefLang: "en" }],
  },
  analytics: {
    path: "/app/analytics",
    title: "Analytics - Lumen",
    description: "Analytics for Lumen.",
    image: "/images/og/home.jpg",
    robots: "noindex,nofollow",
    canonical: "https://lumen.example/app/analytics",
    alternates: [{ href: "https://lumen.example", hrefLang: "en" }],
  },
  users: {
    path: "/app/users",
    title: "Users - Lumen",
    description: "Users for Lumen.",
    image: "/images/og/home.jpg",
    robots: "noindex,nofollow",
    canonical: "https://lumen.example/app/users",
    alternates: [{ href: "https://lumen.example", hrefLang: "en" }],
  },
  settings: {
    path: "/settings",
    title: "Settings - Lumen",
    description: "Workspace, profile and notification settings for Lumen.",
    image: "/images/og/home.jpg",
    robots: "noindex,nofollow",
    canonical: "https://lumen.example/settings",
    alternates: [{ href: "https://lumen.example", hrefLang: "en" }],
  },
  projects: {
    path: "/projects",
    title: "Projects - Lumen",
    description: "Every project in your workspace, with status and open issues.",
    image: "/images/og/home.jpg",
    robots: "noindex,nofollow",
    canonical: "https://lumen.example/projects",
    alternates: [{ href: "https://lumen.example", hrefLang: "en" }],
  },
};

const auth = {
  auth: {
    path: "/auth",
    title: "Log in - Lumen",
    description: "Sign up or log in to your Lumen account.",
    image: "/images/og/home.jpg",
    robots: "noindex,nofollow",
    canonical: "https://lumen.example/auth",
    alternates: [{ href: "https://lumen.example", hrefLang: "en" }],
  },
};

const sameAs = {};

export { landing, product, auth, sameAs };
```

```css src/resources/custom.css
:root {
  --default-border: var(--neutral-alpha-weak);

  /* Lumen: a 2px corner radius on buttons, inputs, cards and menus. These are
     the design system's own radius tokens, so every component follows them. */
  --radius-xs: 2px;
  --radius-s: 2px;
  --radius-m: 2px;
  --radius-l: 2px;
  --radius-xl: 2px;

  /* Compact density: a slimmer header than the 56px default. */
  --header-height: 48px;
}

/* Focus rings use the brand colour. */
:focus-visible {
  outline-color: var(--brand-solid-strong);
}

/* Tabular figures keep columns of numbers aligned, like a ledger. */
.lumen-figures {
  font-variant-numeric: tabular-nums;
}
```

```tsx src/components/Providers.tsx
"use client";

import {
  type BorderStyle,
  DataThemeProvider,
  IconProvider,
  type NeutralColor,
  type ScalingSize,
  type Schemes,
  type SolidStyle,
  type SolidType,
  type SurfaceStyle,
  type Theme,
  ThemeProvider,
  ToastProvider,
  type TransitionStyle,
} from "@once-ui-system/core";
import type { ChartMode, ChartVariant } from "@once-ui-system/core/data";
// The Next adapters: links go through next/link and images through next/image.
import { LayoutProvider } from "@once-ui-system/core/next";
import { dataStyle, style } from "../resources/once-ui.config";
import { iconLibrary } from "../resources/icons";
import { OrgProvider } from "./OrgProvider";
import { UserProvider } from "./UserProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider
        theme={style.theme as Theme}
        defaultTheme={style.defaultTheme as Theme}
        brand={style.brand as Schemes}
        accent={style.accent as Schemes}
        neutral={style.neutral as NeutralColor}
        brandScale={style.brandScale}
        accentScale={style.accentScale}
        neutralScale={style.neutralScale}
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
            stroke: dataStyle.axis.stroke,
          }}
          tick={{
            fill: dataStyle.tick.fill,
            fontSize: dataStyle.tick.fontSize,
            line: dataStyle.tick.line,
          }}
        >
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

```tsx src/app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import { Column, Flex, Meta, Schema, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from "@/components";
import { getLocale } from "@/lib/i18n/server";
import { baseURL, dataStyle, fonts, landing, style } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    // The site-wide defaults. No canonical here: each page names its own.
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
      style={
        {
          [fonts.heading.variable]: fonts.heading.stack,
          [fonts.body.variable]: fonts.body.stack,
          [fonts.label.variable]: fonts.label.stack,
          [fonts.code.variable]: fonts.code.stack,
        } as React.CSSProperties
      }
    >
      <head>
        {/* A sync <script> is only allowed inside the document head. */}
        <Schema
          as="webPage"
          baseURL={baseURL}
          title={landing.home.title}
          description={landing.home.description}
          path={landing.home.path}
        />
        {/* Sets data-theme and the colour scheme before first paint, from the
            same config the ThemeProvider reads. */}
        {/* biome-ignore lint/suspicious/noExplicitAny: the JS config is loosely typed */}
        <ThemeInit config={style as any} dataStyle={dataStyle as any} />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              {children}
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

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

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

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-10-14" -> "14 Oct 2026". Formatted by hand so server and client agree. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeProjects = projects.filter((p) => p.status === "Active").length;
export const latestUpdate = projects.reduce(
  (latest, p) => (p.updated > latest ? p.updated : latest),
  projects[0].updated,
);
```

```ts src/lib/nav.ts
import type { IconName } from "@once-ui-system/core";

export type NavLink = { href: string; label: string };
export type NavGroupEntry = { key: string; label: string; icon: IconName; items: NavLink[] };

// Analytics: Overview (the dashboard) and Reports. Workspace: Projects and Settings.
// Every href is a real route.
export const navGroups: NavGroupEntry[] = [
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
    icon: "folder",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export const navLinks: (NavLink & { group: string })[] = navGroups.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label })),
);
```

```tsx src/components/LumenShell.tsx
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
  useHotkeys,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { user } from "@/lib/data";
import { navGroups, navLinks } from "@/lib/nav";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function LumenShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );

  // The drawer is open for the path it was opened on, so following a link in it closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useHotkeys("mod+k", () => setSearchOpen((open) => !open));

  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: "Lumen", href: "/" },
    ...(page ? [{ label: page.group }, { label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: link.group,
    shortcut: [],
    keywords: `${link.label} ${link.group}`.toLowerCase(),
    href: link.href,
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">{user.name}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Line />
      <Option
        value="settings"
        label="Settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  /** The same navigation for the sidebar (optionally collapsed) and the drawer. */
  const sideNav = (isCollapsed: boolean) => (
    <Nav fill paddingX="8" density="compact" collapsed={isCollapsed} aria-label="Main">
      {navGroups.map((group) => (
        <NavGroup
          key={group.key}
          label={group.label}
          icon={group.icon}
          defaultOpen={group.items.some((item) => item.href === current)}
        >
          {group.items.map((item) => (
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

  return (
    <Column fill flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>

      <Row as="header" height="48" fillWidth vertical="center" paddingX="12" gap="8">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="s"
            tooltip="Menu"
            ariaLabel="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="s"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row minWidth={8} s={{ minWidth: 0 }}>
          <Text as="span" variant="heading-strong-m" family="heading">
            Lumen
          </Text>
        </Row>
        <Row flex={1} s={{ hide: true }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row hide s={{ hide: false, flex: 1 }}>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {page?.label}
          </Text>
        </Row>
        <Button
          size="s"
          variant="secondary"
          prefixIcon="search"
          label="Search"
          onClick={() => setSearchOpen(true)}
        />
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
          maxWidth={collapsed ? 4 : 16}
          fitHeight
          position="sticky"
          top="48"
        >
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
            <Column maxWidth="xl" paddingX="24" paddingY="24" s={{ paddingX: "16" }} gap="20" fitHeight>
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
          {sideNav(false)}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

```tsx src/components/Dashboard.tsx
import { Column, Grid, Heading, Row, StatusIndicator, Tag, Text } from "@once-ui-system/core";
import { activeProjects, formatDate, latestUpdate, projects, totalIssues, user } from "@/lib/data";

const summary = [
  { label: "Open issues", value: String(totalIssues), note: "Across all projects" },
  { label: "Active projects", value: String(activeProjects), note: `of ${projects.length} total` },
  { label: "Last update", value: formatDate(latestUpdate), note: "Customer app" },
];

export function Dashboard() {
  return (
    <>
      <Column gap="4">
        <Text variant="label-default-s" onBackground="brand-medium">
          Overview
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="3" s={{ columns: 1 }} m={{ columns: 3 }} gap="12" fillWidth>
        {summary.map((item) => (
          <Column key={item.label} background="surface" border radius="l" padding="16" gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {item.label}
            </Text>
            <Heading as="p" variant="display-strong-s" className="lumen-figures">
              {item.value}
            </Heading>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {item.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="16" gap="8">
        <Heading as="h2" variant="heading-strong-s">
          Projects needing attention
        </Heading>
        {projects
          .filter((p) => p.status === "Active")
          .sort((a, b) => b.issues - a.issues)
          .map((p) => (
            <Row key={p.key} vertical="center" gap="12" paddingY="4" borderBottom>
              <Tag size="s">{p.key}</Tag>
              <Text variant="body-default-s" flex={1}>
                {p.name}
              </Text>
              <StatusIndicator color="success" />
              <Text variant="label-default-s" className="lumen-figures">
                {p.issues} open
              </Text>
            </Row>
          ))}
      </Column>
    </>
  );
}
```

```tsx src/app/page.tsx
import { Dashboard } from "@/components/Dashboard";
import { LumenShell } from "@/components/LumenShell";

export default function HomePage() {
  return (
    <LumenShell>
      <Dashboard />
    </LumenShell>
  );
}
```

```tsx src/app/(lumen)/layout.tsx
import { LumenShell } from "@/components/LumenShell";

export default function LumenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LumenShell>{children}</LumenShell>;
}
```

```tsx src/app/(lumen)/projects/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectsTable } from "./ProjectsTable";

export const metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <>
      <Column gap="4">
        <Text variant="label-default-s" onBackground="brand-medium">
          Workspace
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Every project in Acme Labs, with its status and open issues.
        </Text>
      </Column>
      <ProjectsTable />
    </>
  );
}
```

```tsx src/app/(lumen)/projects/ProjectsTable.tsx
"use client";

import { Row, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const scheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsTable() {
  return (
    <Table
      compact
      searchable
      searchPlaceholder="Search projects"
      data={{
        headers: [
          { content: "Key", key: "key", sortable: true, width: "12%" },
          { content: "Project", key: "name", sortable: true },
          { content: "Status", key: "status", sortable: true, width: "16%" },
          { content: "Issues", key: "issues", sortable: true, width: "12%", align: "right" },
          { content: "Updated", key: "updated", sortable: true, width: "18%", hide: { s: true } },
        ],
        rows: projects.map((p) => [
          <Text key="k" variant="code-default-s">
            {p.key}
          </Text>,
          <Text key="n" variant="body-strong-s">
            {p.name}
          </Text>,
          <Row key="s">
            <Tag size="s" scheme={scheme[p.status]}>
              {p.status}
            </Tag>
          </Row>,
          <Text key="i" variant="body-default-s" className="lumen-figures">
            {p.issues}
          </Text>,
          <Text key="u" variant="body-default-s" className="lumen-figures">
            {formatDate(p.updated)}
          </Text>,
        ]),
      }}
    />
  );
}
```

```tsx src/app/(lumen)/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <>
      <Column gap="4">
        <Text variant="label-default-s" onBackground="brand-medium">
          Workspace
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Your profile and how Lumen keeps you informed.
        </Text>
      </Column>
      <SettingsForm />
    </>
  );
}
```

```tsx src/app/(lumen)/settings/SettingsForm.tsx
"use client";

import {
  Button,
  Column,
  Form,
  Heading,
  Input,
  Row,
  Select,
  Setting,
  Switch,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [timezone, setTimezone] = useState("utc");
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <Column gap="16">
      <Column background="surface" border radius="l" padding="16" gap="16">
        <Heading as="h2" variant="heading-strong-m">
          Profile
        </Heading>
        <Form
          as="form"
          size="s"
          columns={{ xl: 2, s: 1 }}
          onSubmit={(event) => {
            event.preventDefault();
            addToast({ variant: "success", message: "Profile saved" });
          }}
        >
          <Input id="name" label="Display name" defaultValue={user.name} />
          <Input id="email" label="Email" type="email" defaultValue={user.email} />
          <Input id="role" label="Role" defaultValue={user.role} disabled />
          <Select
            id="timezone"
            label="Timezone"
            value={timezone}
            onSelect={(value) => setTimezone(value as string)}
            options={[
              { value: "utc", label: "UTC" },
              { value: "cet", label: "Central European Time" },
              { value: "est", label: "Eastern Time" },
            ]}
          />
          <Row gap="8">
            <Button type="submit" size="s">
              Save changes
            </Button>
            <Button type="reset" size="s" variant="secondary">
              Cancel
            </Button>
          </Row>
        </Form>
      </Column>

      <Column gap="8">
        <Heading as="h2" variant="heading-strong-m">
          Notifications
        </Heading>
        <Setting label="Weekly digest" description="A summary of issues opened and closed, sent on Mondays">
          <Switch checked={weekly} onToggle={setWeekly} ariaLabel="Weekly digest" />
        </Setting>
        <Setting label="Mentions" description="Email me when someone mentions me on an issue">
          <Switch checked={mentions} onToggle={setMentions} ariaLabel="Mentions" />
        </Setting>
      </Column>
    </Column>
  );
}
```

```tsx src/app/(lumen)/reports/page.tsx
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects } from "@/lib/data";

export const metadata = { title: "Reports · Lumen" };

export default function ReportsPage() {
  const byIssues = [...projects].sort((a, b) => b.issues - a.issues);
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <Column gap="4">
        <Text variant="label-default-s" onBackground="brand-medium">
          Analytics
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Reports
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Open issues per project, largest first.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="16" gap="12">
        {byIssues.map((p) => (
          <Row key={p.key} vertical="center" gap="12">
            <Tag size="s">{p.key}</Tag>
            <Column flex={1} gap="4">
              <Text variant="body-default-s">{p.name}</Text>
              <Row
                height="8"
                background="neutral-alpha-weak"
                radius="s"
                overflow="hidden"
                role="img"
                aria-label={`${p.issues} open issues`}
              >
                <Row
                  background="brand-strong"
                  height="8"
                  style={{ width: `${(p.issues / max) * 100}%` }}
                />
              </Row>
            </Column>
            <Text variant="label-default-s" className="lumen-figures">
              {p.issues}
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak" className="lumen-figures">
              {formatDate(p.updated)}
            </Text>
          </Row>
        ))}
      </Column>
    </>
  );
}
```