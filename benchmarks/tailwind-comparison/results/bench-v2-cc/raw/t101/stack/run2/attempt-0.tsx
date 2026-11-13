```js src/resources/once-ui.config.js
import { landing } from "./seo";

const baseURL = "https://lumen.example";

// Lumen uses the system font stacks (no network fonts). The stacks themselves
// are set once as the --font-* tokens in src/resources/custom.css.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

const i18n = {
  locales: ["en"],
};

// Lumen's theme, read by ThemeInit and ThemeProvider (see src/resources/theme.ts).
const style = {
  theme: "system", // stays "system" so the theme switch works
  defaultTheme: "light", // the theme a visitor starts on
  neutral: "slate", // cool slate grey
  brand: "custom", // exact brand colour from brandSeed / brandScale
  brandSeed: "#0F766E",
  brandScale: { 600: "#0F766E" },
  accent: "cyan",
  solid: "color", // primary buttons and the current nav item use the brand colour
  solidStyle: "flat",
  border: "sharp", // the squarest corner radius
  surface: "filled",
  transition: "micro",
  scaling: "95", // compact density
  pageBackground: { light: "#F1F5F9", dark: "#0B1220" },
  surfaceBackground: { light: "#FFFFFF", dark: "#111A2B" },
};

const dataStyle = {
  variant: "flat", // flat | gradient | outline
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

```ts src/resources/theme.ts
import type {
  BorderStyle,
  NeutralColor,
  ScalingSize,
  Schemes,
  SolidStyle,
  SolidType,
  SurfaceStyle,
  Theme,
  TransitionStyle,
} from "@once-ui-system/core";
import { style } from "./once-ui.config";

/**
 * Lumen's theme in one place: ThemeInit (server, in the root layout) and
 * ThemeProvider (client, in Providers) both read it, so every screen follows it.
 */
export const themeProps = {
  theme: style.theme as Theme,
  defaultTheme: style.defaultTheme as Theme,
  brand: style.brand as Schemes | "custom",
  accent: style.accent as Schemes | "custom",
  neutral: style.neutral as NeutralColor,
  solid: style.solid as SolidType,
  solidStyle: style.solidStyle as SolidStyle,
  border: style.border as BorderStyle,
  surface: style.surface as SurfaceStyle,
  transition: style.transition as TransitionStyle,
  scaling: style.scaling as ScalingSize,
  brandSeed: style.brandSeed,
  brandScale: style.brandScale,
  pageBackground: style.pageBackground,
  surfaceBackground: style.surfaceBackground,
};
```

```css src/resources/custom.css
:root {
  --default-border: var(--neutral-alpha-weak);

  /* Lumen type: serif headings, system sans body. No network fonts. */
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

```tsx src/components/Providers.tsx
"use client";

import { type BorderStyle, DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import type { ChartMode, ChartVariant } from "@once-ui-system/core/data";
// The Next adapters: links go through next/link and images through next/image.
import { LayoutProvider } from "@once-ui-system/core/next";
import { dataStyle } from "../resources/once-ui.config";
import { themeProps } from "../resources/theme";
import { iconLibrary } from "../resources/icons";
import { UserProvider } from "./UserProvider";
import { OrgProvider } from "./OrgProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider {...themeProps} border={themeProps.border as BorderStyle}>
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

import type { Metadata } from "next";
import { dataStyle } from "@/resources";
import { themeProps } from "@/resources/theme";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { AppFrame, LocaleProvider, Providers } from "@/components";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <Flex suppressHydrationWarning data-scroll-behavior="smooth" as="html" lang={locale} fillWidth>
      <head>
        <ThemeInit
          config={{
            ...themeProps,
            "solid-style": themeProps.solidStyle,
            "viz-style": dataStyle.variant,
          }}
        />
      </head>
      <LocaleProvider locale={locale}>
        <Providers>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            <Column fillWidth horizontal="center" flex={1}>
              <AppFrame>{children}</AppFrame>
            </Column>
          </Column>
        </Providers>
      </LocaleProvider>
    </Flex>
  );
}
```

```ts src/components/index.ts
export * from "./LocaleProvider";
export * from "./Providers";
export * from "./UserProvider";
export * from "./OrgProvider";
export * from "./AppFrame";
```

```ts src/lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "A product-analytics and issue-tracking app for small software teams",
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

export type NavLeaf = { label: string; href: string; icon: IconName };
export type NavSection = { key: string; label: string; icon: IconName; items: NavLeaf[] };

export const navSections: NavSection[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "trend",
    items: [
      { label: "Overview", href: "/", icon: "barChart" },
      { label: "Reports", href: "/reports", icon: "document" },
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-14" -> "14 Oct 2026", with no locale so server and client agree. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
```

```tsx src/components/AppFrame.tsx
"use client";

import {
  Avatar,
  Breadcrumbs,
  Column,
  Drawer,
  Heading,
  Icon,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navSections, product, user } from "@/lib/data";

const allHrefs = navSections.flatMap((section) => section.items.map((item) => item.href));

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, allHrefs);
  const [open, setOpen] = useState<Record<string, boolean>>({ analytics: true, workspace: true });

  return (
    <Nav density="compact" collapsed={collapsed} expandedWidth={14} aria-label="Main">
      {navSections.map((section) => (
        <NavGroup
          key={section.key}
          label={section.label}
          icon={section.icon}
          open={open[section.key]}
          onToggle={() => setOpen((state) => ({ ...state, [section.key]: !state[section.key] }))}
        >
          {section.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              selected={item.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

function Shell({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const section = navSections.find((s) => s.items.some((i) => i.href === pathname));
  const leaf = section?.items.find((i) => i.href === pathname);
  const crumbs = [{ label: section?.label ?? "" }, { label: leaf?.label ?? "" }];

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
            ariaLabel="Open navigation menu"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row vertical="center" gap="8" s={{ hide: true }}>
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Heading as="span" variant="heading-strong-m">
            {product.name}
          </Heading>
        </Row>
        <Row s={{ hide: true }} vertical="center" paddingLeft="16">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row hide s={{ hide: false }} flex={1} vertical="center">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} s={{ hide: true }} />
        <Row s={{ hide: true }}>
          <UserMenu
            name={user.name}
            subline={user.email}
            avatarProps={{ value: "MO" }}
            placement="bottom-end"
            dropdown={
              <Column minWidth={14} padding="4">
                <Option value="account" label={user.name} description={`${user.email} · ${user.role}`} disabled />
              </Column>
            }
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <Avatar value="MO" size="s" />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column as="aside" s={{ hide: true }} fitHeight position="sticky" top="56" paddingBottom="8" gap="4">
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
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="m" overflow="hidden">
          <Row height="below-header" overflowY="auto" topRadius="m" horizontal="center" fillWidth background="surface">
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="16" paddingX="16" paddingY="24" fitHeight>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16" paddingX="8">
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}

/** Mounts the signed-in shell once for the Lumen screens; other routes render as they are. */
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (!allHrefs.includes(pathname)) return <>{children}</>;
  return <Shell pathname={pathname}>{children}</Shell>;
}
```

```tsx src/app/page.tsx
import { Button, Column, Grid, Heading, Line, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const active = projects.filter((p) => p.status === "Active");
  const paused = projects.filter((p) => p.status === "Paused");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const busiest = [...projects].sort((a, b) => b.issues - a.issues).slice(0, 3);

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active.length), note: active.map((p) => p.key).join(", ") },
    { label: "Paused projects", value: String(paused.length), note: paused.map((p) => p.name).join(", ") },
    { label: "Last update", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-l">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {openIssues} open issues across {active.length} active projects.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="12">
        {cards.map((card) => (
          <Column key={card.label} as="section" aria-label={card.label} background="page" border radius="m" padding="16" gap="4">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Text as="p" variant="heading-strong-xl">
              {card.value}
            </Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column as="section" aria-labelledby="busiest" gap="8">
        <Row horizontal="between" vertical="center">
          <Heading as="h2" id="busiest" variant="heading-strong-s">
            Most open issues
          </Heading>
          <Button href="/projects" variant="tertiary" size="s" label="All projects" suffixIcon="arrowRight" />
        </Row>
        <Column background="page" border radius="m">
          {busiest.map((project, index) => (
            <Column key={project.key} fillWidth>
              {index > 0 && <Line />}
              <Row paddingX="16" paddingY="8" gap="12" vertical="center">
                <Tag size="s" label={project.key} />
                <Text variant="body-default-s" flex={1}>
                  {project.name}
                </Text>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {project.issues} open
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
import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function ProjectsPage() {
  const headers = [
    { content: "Key", key: "key", sortable: true },
    { content: "Project", key: "name", sortable: true },
    { content: "Status", key: "status" },
    { content: "Issues", key: "issues", sortable: true, align: "right" as const },
    { content: "Updated", key: "updated", sortable: true },
  ];

  const rows = projects.map((p) => [
    p.key,
    p.name,
    <Tag key={`${p.key}-status`} size="s" scheme={statusScheme[p.status]} label={p.status} />,
    String(p.issues),
    formatDate(p.updated),
  ]);

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-l">
          Projects
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>
      <Column fillWidth overflowX="auto">
        <Table data={{ headers, rows }} compact searchable searchPlaceholder="Search projects" />
      </Column>
    </>
  );
}

import { Table } from "@once-ui-system/core";
```

```tsx src/app/reports/page.tsx
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  const total = projects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-l">
          Reports
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Open issues by project, {total} in total.
        </Text>
      </Column>
      <Column background="page" border radius="m" padding="16" gap="12" as="section" aria-label="Open issues by project">
        {projects.map((p) => (
          <Row key={p.key} gap="12" vertical="center">
            <Row width="40">
              <Tag size="s" label={p.key} />
            </Row>
            <Row flex={1} height="8" background="neutral-alpha-weak" radius="xs" aria-hidden="true">
              <Row height="8" background="brand-strong" radius="xs" style={{ width: `${(p.issues / max) * 100}%` }} />
            </Row>
            <Row width="40" horizontal="end">
              <Text variant="label-default-s">{p.issues}</Text>
            </Row>
          </Row>
        ))}
      </Column>
    </>
  );
}
```

```tsx src/app/settings/page.tsx
"use client";

import { Button, Column, Heading, Input, Line, Row, SegmentedControl, Switch, Tag, Text, useTheme } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

const notificationOptions = [
  { id: "digest", label: "Weekly digest", note: "A Monday summary of issues opened and closed." },
  { id: "assigned", label: "Issue assigned to me", note: "Email when someone assigns you an issue." },
  { id: "status", label: "Project status changes", note: "Email when a project is paused or archived." },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const [notify, setNotify] = useState<Record<string, boolean>>({ digest: true, assigned: true, status: false });

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-l">
          Settings
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Your profile, notifications and appearance.
        </Text>
      </Column>

      <Column as="section" aria-labelledby="profile" background="page" border radius="m" padding="16" gap="12">
        <Row gap="8" vertical="center">
          <Heading as="h2" id="profile" variant="heading-strong-s">
            Profile
          </Heading>
          <Tag size="s" label={user.role} />
        </Row>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <Column gap="12" maxWidth="m">
            <Input
              id="settings-name"
              label="Full name"
              size="xs"
              value={name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
            <Input
              id="settings-email"
              label="Email"
              type="email"
              size="xs"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(event.target.value);
                setSaved(false);
              }}
            />
            <Row gap="12" vertical="center">
              <Button type="submit" size="s" label="Save changes" />
              <Text role="status" variant="body-default-s" onBackground="neutral-weak">
                {saved ? "Saved." : ""}
              </Text>
            </Row>
          </Column>
        </form>
      </Column>

      <Column as="section" aria-labelledby="notifications" background="page" border radius="m" padding="16" gap="12">
        <Heading as="h2" id="notifications" variant="heading-strong-s">
          Notifications
        </Heading>
        {notificationOptions.map((option, index) => (
          <Column key={option.id} gap="12">
            {index > 0 && <Line />}
            <Row horizontal="between" vertical="center" gap="16">
              <Column gap="2">
                <Text variant="label-strong-s">{option.label}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {option.note}
                </Text>
              </Column>
              <Switch
                ariaLabel={option.label}
                checked={notify[option.id]}
                onToggle={(checked: boolean) => setNotify((state) => ({ ...state, [option.id]: checked }))}
              />
            </Row>
          </Column>
        ))}
      </Column>

      <Column as="section" aria-labelledby="appearance" background="page" border radius="m" padding="16" gap="12">
        <Heading as="h2" id="appearance" variant="heading-strong-s">
          Appearance
        </Heading>
        <Column maxWidth="s">
          <SegmentedControl
            compact
            value={theme}
            onChange={(value: string) => setTheme(value as "light" | "dark" | "system")}
            buttons={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </Column>
      </Column>
    </>
  );
}
```
