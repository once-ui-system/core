```js src/resources/once-ui.config.js
// Lumen: brand, theme and fonts live here and nowhere else.
// Fonts are system stacks (nothing is loaded from the network). Each entry only
// carries the class name that custom.css uses to set the font variables.
const lumenFonts = { variable: "lumen-fonts" };

const baseURL = "https://lumen.example";

const fonts = {
  heading: lumenFonts,
  body: lumenFonts,
  label: lumenFonts,
  code: lumenFonts,
};

const i18n = {
  locales: ["en"],
};

// Brand #0F766E, cool slate neutrals, light by default (the visitor can still
// switch), 2px corners (custom.css), compact density (scaling 90).
const style = {
  theme: "system", // stays "system" so the theme switch keeps working
  defaultTheme: "light",
  neutral: "slate",
  brand: "custom",
  brandSeed: "#0F766E",
  accent: "custom",
  accentSeed: "#0F766E",
  solid: "color",
  solidStyle: "flat",
  border: "conservative",
  surface: "filled",
  transition: "micro",
  scaling: "90",
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
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
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

/* Lumen typography: serif headings, system sans body. */
.lumen-fonts {
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* Lumen corners: 2px on buttons, inputs, cards and menus. */
:root,
[data-border] {
  --radius-xs: 2px;
  --radius-s: 2px;
  --radius-m: 2px;
  --radius-l: 2px;
  --radius-xl: 2px;
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
        accent={style.accent as Schemes | "custom"}
        neutral={style.neutral as NeutralColor}
        brandSeed={style.brandSeed}
        accentSeed={style.accentSeed}
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

import classNames from "classnames";

import { fonts, style } from "@/resources";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import type { OnceUIStyleConfig } from "@once-ui-system/core";
import { LocaleProvider, Providers } from "@/components";
import { AppShell } from "@/components/AppShell";
import { getLocale } from "@/lib/i18n/server";

export const metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

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
        <ThemeInit config={style as OnceUIStyleConfig} />
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

```ts src/lib/data.ts
import type { IconName } from "@once-ui-system/core";

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

export const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeProjects = projects.filter((p) => p.status === "Active").length;

export interface NavLeaf {
  href: string;
  label: string;
}

export interface NavSection {
  key: string;
  label: string;
  icon: IconName;
  items: NavLeaf[];
}

export const nav: NavSection[] = [
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
```

```tsx src/components/AppShell.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs,
  Column,
  Drawer,
  Heading,
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
import { nav, user } from "@/lib/data";

const allHrefs = nav.flatMap((section) => section.items.map((item) => item.href));

function normalize(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function SideNav({ pathname, collapsed }: { pathname: string; collapsed?: boolean }) {
  const current = selectNavHref(pathname, allHrefs);
  return (
    <Nav fill paddingX="8" density="compact" collapsed={collapsed} aria-label="Main">
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const rawPath = usePathname();
  const pathname = normalize(rawPath || "/");
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const section = nav.find((s) => s.items.some((item) => item.href === pathname));
  if (!section) {
    return <>{children}</>;
  }
  const page = section.items.find((item) => item.href === pathname);

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        height="56"
        fillWidth
        vertical="center"
        paddingX="16"
        gap="12"
        borderBottom
        background="surface"
      >
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="s"
            ariaLabel="Open navigation"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }} minWidth="104">
          <Heading as="span" variant="heading-strong-l">
            Lumen
          </Heading>
        </Row>
        <Row flex={1} vertical="center" minWidth="0">
          <Breadcrumbs
            aria-label="Breadcrumb"
            items={[
              { label: "Lumen", href: "/" },
              { label: section.label },
              { label: page ? page.label : "" },
            ]}
          />
        </Row>
        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: "MO", size: "s" }}
          placement="bottom-end"
          dropdown={
            <Column padding="4" gap="2" minWidth={12}>
              <Option value="profile" label={user.email} description="Signed in" disabled />
              <Option value="settings" label="Settings" href="/settings" />
              <Option value="signout" label="Sign out" />
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={18} fitHeight position="sticky" top="56" gap="8" paddingY="8">
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
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
            border
          >
            <Column
              as="main"
              id="main"
              maxWidth="xl"
              fillWidth
              gap="24"
              paddingX="24"
              paddingY="24"
              s={{ paddingX: "16" }}
              fitHeight
            >
              {children}
            </Column>
          </Row>
        </Row>
      </Row>
      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16">
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
}
```

```tsx src/app/page.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import {
  activeProjects,
  formatDate,
  projects,
  statusScheme,
  totalIssues,
  user,
} from "@/lib/data";

export const metadata = { title: "Overview" };

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Column background="surface" border radius="s" padding="16" gap="4">
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="heading-strong-xl" onBackground="neutral-strong">
        {value}
      </Text>
      <Text variant="body-default-xs" onBackground="neutral-weak">
        {note}
      </Text>
    </Column>
  );
}

export default function Page() {
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);
  const latest = recent[0];
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-xl">
          Welcome back, {firstName}
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Here is where your projects stand today.
        </Text>
      </Column>
      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12" fillWidth>
        <Stat label="Open issues" value={String(totalIssues)} note="Across all projects" />
        <Stat label="Active projects" value={String(activeProjects)} note={`of ${projects.length} in the workspace`} />
        <Stat label="Most issues" value="APP" note="Customer app, 31 open" />
        <Stat label="Last update" value={formatDate(latest.updated)} note={latest.name} />
      </Grid>
      <Column background="surface" border radius="s" padding="16" gap="12">
        <Heading as="h2" variant="heading-strong-m">
          Recently updated
        </Heading>
        <Column as="ul" margin="0" padding="0" gap="8" style={{ listStyle: "none" }}>
          {recent.map((project) => (
            <Row
              as="li"
              key={project.key}
              vertical="center"
              gap="12"
              paddingBottom="8"
              borderBottom
              wrap
            >
              <Text variant="code-default-s" onBackground="neutral-weak">
                {project.key}
              </Text>
              <Text variant="label-default-m" onBackground="neutral-strong" style={{ flex: 1 }}>
                {project.name}
              </Text>
              <Tag as="span" size="s" scheme={statusScheme[project.status]} label={project.status} />
              <Text variant="body-default-s" onBackground="neutral-weak">
                {formatDate(project.updated)}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </>
  );
}
```

```tsx src/components/ProjectsTable.tsx
"use client";

import { Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusScheme } from "@/lib/data";

export function ProjectsTable() {
  const headers = [
    { content: "Key", key: "key", sortable: true, width: "96px" },
    { content: "Name", key: "name", sortable: true },
    { content: "Status", key: "status", sortable: true },
    { content: "Open issues", key: "issues", sortable: true, align: "right" as const },
    { content: "Updated", key: "updated", sortable: true },
  ];

  const rows = projects.map((project) => [
    <Text key="key" variant="code-default-s">
      {project.key}
    </Text>,
    <Text key="name" variant="label-default-s" onBackground="neutral-strong">
      {project.name}
    </Text>,
    <Tag key="status" as="span" size="s" scheme={statusScheme[project.status]} label={project.status} />,
    <Text key="issues" variant="body-default-s">
      {project.issues}
    </Text>,
    <Text key="updated" variant="body-default-s">
      {formatDate(project.updated)}
    </Text>,
  ]);

  return (
    <Table
      data={{ headers, rows }}
      compact
      searchable
      searchPlaceholder="Search projects"
      emptyState={<Text variant="body-default-s">No projects match your search.</Text>}
    />
  );
}
```

```tsx src/app/projects/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { ProjectsTable } from "@/components/ProjectsTable";
import { projects } from "@/lib/data";

export const metadata = { title: "Projects" };

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-xl">
          Projects
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {projects.length} projects, {active} active.
        </Text>
      </Column>
      <ProjectsTable />
    </>
  );
}
```

```tsx src/app/reports/page.tsx
import { Column, Heading, Row, Text } from "@once-ui-system/core";
import { projects, totalIssues } from "@/lib/data";

export const metadata = { title: "Reports" };

export default function Page() {
  const max = Math.max(...projects.map((p) => p.issues), 1);
  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-xl">
          Reports
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Open issues by project, {totalIssues} in total.
        </Text>
      </Column>
      <Column background="surface" border radius="s" padding="16" gap="12">
        <Heading as="h2" variant="heading-strong-m">
          Open issues by project
        </Heading>
        <Column as="ul" margin="0" padding="0" gap="12" style={{ listStyle: "none" }}>
          {projects.map((project) => (
            <Row as="li" key={project.key} vertical="center" gap="12">
              <Text variant="code-default-s" onBackground="neutral-weak" style={{ width: "3rem" }}>
                {project.key}
              </Text>
              <Row fillWidth height="8" background="neutral-alpha-weak" radius="xs">
                <Row
                  height="8"
                  background="brand-solid-strong"
                  radius="xs"
                  style={{ width: `${(project.issues / max) * 100}%` }}
                />
              </Row>
              <Text variant="label-default-s" style={{ width: "2rem", textAlign: "right" }}>
                {project.issues}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </>
  );
}
```

```tsx src/components/SettingsForm.tsx
"use client";

import { useState } from "react";
import { Button, Column, Heading, Input, Row, Switch, Tag, Text } from "@once-ui-system/core";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [workspace, setWorkspace] = useState("Acme Labs");
  const [weekly, setWeekly] = useState(true);
  const [assigned, setAssigned] = useState(true);
  const [releases, setReleases] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Column gap="16" maxWidth="m">
        <Column background="surface" border radius="s" padding="16" gap="12">
          <Row vertical="center" gap="8">
            <Heading as="h2" variant="heading-strong-m">
              Profile
            </Heading>
            <Tag as="span" size="s" label={user.role} />
          </Row>
          <Input
            id="settings-name"
            label="Full name"
            size="xs"
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
            size="xs"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
          />
        </Column>
        <Column background="surface" border radius="s" padding="16" gap="12">
          <Heading as="h2" variant="heading-strong-m">
            Workspace
          </Heading>
          <Input
            id="settings-workspace"
            label="Workspace name"
            size="xs"
            value={workspace}
            onChange={(event) => {
              setWorkspace(event.target.value);
              setSaved(false);
            }}
          />
        </Column>
        <Column background="surface" border radius="s" padding="16" gap="12">
          <Heading as="h2" variant="heading-strong-m">
            Notifications
          </Heading>
          <Switch
            label="Weekly summary"
            description="A digest of issue activity every Monday."
            checked={weekly}
            onToggle={(value) => {
              setWeekly(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Assigned to me"
            description="Email when an issue is assigned to you."
            checked={assigned}
            onToggle={(value) => {
              setAssigned(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Release notes"
            description="Product updates from the Lumen team."
            checked={releases}
            onToggle={(value) => {
              setReleases(value);
              setSaved(false);
            }}
          />
        </Column>
        <Row gap="12" vertical="center">
          <Button type="submit" size="s" label="Save changes" />
          <Text role="status" aria-live="polite" variant="body-default-s" onBackground="neutral-weak">
            {saved ? "Changes saved." : ""}
          </Text>
        </Row>
      </Column>
    </form>
  );
}
```

```tsx src/app/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-xl">
          Settings
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Your profile, workspace and notification preferences.
        </Text>
      </Column>
      <SettingsForm />
    </>
  );
}
```
