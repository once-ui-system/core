```js src/resources/once-ui.config.js
import { landing } from "./seo";

// IMPORTANT: Replace with your own domain address - it's used for SEO in meta tags and schema
const baseURL = "https://lumen.example.com";

// Fonts are system stacks (nothing is loaded from the network). The families
// are set as tokens in custom.css: headings in ui-monospace, body in ui-sans-serif.
const fonts = {
  heading: { variable: "" },
  body: { variable: "" },
  label: { variable: "" },
  code: { variable: "" },
};

const i18n = {
  locales: ["en"],
};

// Lumen brand ramp: #E8590C sits at step 600 in both themes.
const brandRamp = {
  dark: {
    100: "#2a1004",
    200: "#4a1c06",
    300: "#7a2e08",
    400: "#a8410a",
    500: "#cf500b",
    600: "#e8590c",
    700: "#f27a3a",
    800: "#f79b66",
    900: "#fbb892",
    1000: "#fdd0b8",
    1100: "#fee4d4",
    1200: "#fff1e8",
    "600-15": "rgba(232,89,12,0.15)",
    "600-30": "rgba(232,89,12,0.3)",
    "600-50": "rgba(232,89,12,0.5)",
  },
  light: {
    100: "#fff1e8",
    200: "#fee4d4",
    300: "#fdd0b8",
    400: "#fbb892",
    500: "#f79b66",
    600: "#e8590c",
    700: "#cf500b",
    800: "#a8410a",
    900: "#7a2e08",
    1000: "#4a1c06",
    1100: "#2a1004",
    1200: "#1a0a02",
    "600-15": "rgba(232,89,12,0.15)",
    "600-30": "rgba(232,89,12,0.3)",
    "600-50": "rgba(232,89,12,0.5)",
  },
};

// default customization applied to the HTML in the main layout.tsx
const style = {
  theme: "dark", // dark | light | system
  neutral: "sand", // warm stone grey
  brand: "custom",
  accent: "custom",
  brandScale: brandRamp,
  accentScale: brandRamp,
  solid: "color", // brand-coloured primary buttons
  solidStyle: "flat",
  border: "conservative",
  surface: "filled",
  transition: "micro",
  scaling: "100",
};

const dataStyle = {
  variant: "flat", // flat | gradient | outline
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

// default schema data
const schema = {
  logo: "",
  type: "Organization",
  name: "Lumen",
  description: landing.home.description,
  email: "support@lumen.example.com",
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

/* Lumen typography: mono headings, system sans body. */
:root,
html {
  --font-heading: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-display: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, "SFMono-Regular", Menlo, monospace;
}

/* Lumen corner radius: 4px on buttons, inputs, cards and menus. */
:root,
html,
html[data-border],
[data-border] {
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
}
```

```tsx src/components/Providers.tsx
"use client";

import type { ComponentProps } from "react";
import { type BorderStyle, DataThemeProvider, IconProvider, type NeutralColor, type ScalingSize, type Schemes, type SolidStyle, type SolidType, type SurfaceStyle, type Theme, ThemeProvider, ToastProvider, type TransitionStyle } from "@once-ui-system/core";
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
        defaultTheme={style.theme as Theme}
        brand={style.brand as Schemes}
        accent={style.accent as Schemes}
        neutral={style.neutral as NeutralColor}
        brandScale={style.brandScale as ThemeProps["brandScale"]}
        accentScale={style.accentScale as ThemeProps["accentScale"]}
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

import classNames from "classnames";
import type { ComponentProps } from "react";
import type { ChartMode } from "@once-ui-system/core/data";

import { baseURL, landing, fonts, style, dataStyle } from "@/resources";
import { Meta, Schema,  Column, Flex, ThemeInit } from "@once-ui-system/core";
import { LocaleProvider, Providers } from '@/components';
import { AppShell } from '@/components/AppShell';
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
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
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
        <ThemeInit
          config={
            {
              theme: style.theme,
              brand: style.brand,
              accent: style.accent,
              neutral: style.neutral,
              brandScale: style.brandScale,
              accentScale: style.accentScale,
              solid: style.solid,
              solidStyle: style.solidStyle,
              border: style.border,
              surface: style.surface,
              transition: style.transition,
              scaling: style.scaling,
            } as ComponentProps<typeof ThemeInit>["config"]
          }
          dataStyle={{ mode: dataStyle.mode as ChartMode }}
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-12" -> "12 Oct 2026", fixed so server and client agree. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export interface NavItemData {
  label: string;
  href: string;
  icon: IconName;
}

export interface NavGroupData {
  key: string;
  label: string;
  icon: IconName;
  items: NavItemData[];
}

export const nav: NavGroupData[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/", icon: "grid" },
      { label: "Reports", href: "/reports", icon: "document" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "folder",
    items: [
      { label: "Projects", href: "/projects", icon: "organization" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export const shellRoutes = ["/", "/projects", "/settings", "/reports"];
```

```tsx src/components/AppShell.tsx
"use client";

import {
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
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, shellRoutes, user } from "@/lib/data";

const hrefs = nav.flatMap((group) => group.items.map((item) => item.href));

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, hrefs);
  return (
    <Nav
      density="compact"
      fill
      overflowY="auto"
      padding="4"
      aria-label="Main"
      collapsed={collapsed}
    >
      {nav.map((group) => (
        <NavGroup key={group.key} label={group.label} icon={group.icon} defaultOpen>
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={collapsed ? item.icon : undefined}
              selected={item.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

function crumbsFor(pathname: string) {
  for (const group of nav) {
    const item = group.items.find((entry) => entry.href === pathname);
    if (item) return [{ label: group.label }, { label: item.label }];
  }
  return [{ label: "Lumen" }];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const raw = usePathname() ?? "/";
  const pathname = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);

  if (!shellRoutes.includes(pathname)) return <>{children}</>;

  const menuOpen = menuPath === pathname;
  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("");

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
        horizontal="between"
        paddingX="16"
        gap="8"
        background="page"
        position="sticky"
        top="0"
        zIndex={1}
      >
        <Row vertical="center" gap="8" flex={1}>
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
          <Text
            as="span"
            variant="heading-strong-m"
            onBackground="brand-strong"
            style={{ letterSpacing: "0.04em" }}
          >
            LUMEN
          </Text>
          <Row s={{ hide: true }} marginLeft="16">
            <Line vert height="16" />
          </Row>
          <Row s={{ hide: true }} marginLeft="8">
            <Breadcrumbs items={crumbsFor(pathname)} aria-label="Breadcrumb" />
          </Row>
        </Row>
        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: initials }}
          dropdown={
            <Column minWidth={14} padding="4" gap="2">
              <Column paddingX="12" paddingY="8">
                <Text variant="label-strong-s">{user.name}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {user.email}
                </Text>
              </Column>
              <Line />
              <Option
                value="settings"
                label="Settings"
                href="/settings"
                prefix={<Icon name="settings" size="xs" onBackground="neutral-weak" />}
              />
              <Option
                value="projects"
                label="Projects"
                href="/projects"
                prefix={<Icon name="folder" size="xs" onBackground="neutral-weak" />}
              />
            </Column>
          }
        />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth={collapsed ? 4.5 : 16}
          minWidth={collapsed ? 4.5 : 16}
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
            background="surface"
            paddingX="l"
            s={{ paddingX: "16" }}
          >
            <Column as="main" id="main" fillWidth maxWidth="xl" gap="24" paddingY="32" fitHeight>
              <Row hide s={{ hide: false }}>
                <Breadcrumbs items={crumbsFor(pathname)} aria-label="Breadcrumb" />
              </Row>
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
        title="Navigation menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16" paddingX="8">
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
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const cards = [
    { label: "Open issues", value: String(open), note: "across all projects" },
    { label: "Active projects", value: String(active), note: `of ${projects.length} in the workspace` },
    { label: "Paused", value: String(projects.filter((p) => p.status === "Paused").length), note: "Mobile beta" },
    { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Here is how your workspace looks today.
        </Text>
      </Column>

      <Grid columns="4" l={{ columns: "2" }} s={{ columns: "1" }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} background="neutral-alpha-weak" border radius="m" padding="20" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" variant="heading-strong-l">
              {card.value}
            </Heading>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column gap="12">
        <Heading as="h2" variant="heading-strong-m">
          Recently updated
        </Heading>
        <Column border radius="m" background="surface">
          {recent.map((p, i) => (
            <Row
              key={p.key}
              horizontal="between"
              vertical="center"
              padding="16"
              gap="12"
              wrap
              borderTop={i === 0 ? undefined : true}
            >
              <Row gap="12" vertical="center">
                <Tag size="s" label={p.key} />
                <Text variant="label-strong-m">{p.name}</Text>
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {p.issues} open issues, updated {formatDate(p.updated)}
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
import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const scheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
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
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>
      <Column fillWidth overflowX="auto">
        <Table
          data={{
            headers: [
              { content: "Key", key: "key" },
              { content: "Name", key: "name" },
              { content: "Status", key: "status" },
              { content: "Open issues", key: "issues", align: "right" },
              { content: "Updated", key: "updated", hide: { xs: true } },
            ],
            rows: projects.map((p) => [
              <Text key="k" variant="code-default-s">{p.key}</Text>,
              <Text key="n" variant="label-strong-s">{p.name}</Text>,
              <Tag key="s" size="s" scheme={scheme[p.status]} label={p.status} />,
              <Text key="i" variant="body-default-s">{p.issues}</Text>,
              <Text key="u" variant="body-default-s">{formatDate(p.updated)}</Text>,
            ]),
          }}
        />
      </Column>
    </>
  );
}
```

```tsx src/app/reports/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { projects } from "@/lib/data";

export default function Page() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Reports
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          The workspace holds {total} open issues across {projects.length} projects.
        </Text>
      </Column>
      <Column background="neutral-alpha-weak" border radius="m" padding="20" gap="8">
        <Heading as="h2" variant="heading-strong-s">
          Weekly digest
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Customer app carries the most open issues (31). Reports will appear here once a week of data is collected.
        </Text>
      </Column>
    </>
  );
}
```

```tsx src/app/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import { SettingsForm } from "./SettingsForm";

export default function Page() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Manage your profile and notifications.
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
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Column maxWidth="m" gap="24">
        <Column background="neutral-alpha-weak" border radius="m" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-s">
            Profile
          </Heading>
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
            label="Email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
          />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Role: {user.role}
          </Text>
        </Column>

        <Column background="neutral-alpha-weak" border radius="m" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-s">
            Notifications
          </Heading>
          <Switch
            label="Weekly digest"
            description="A summary of open issues every Monday."
            checked={digest}
            onToggle={(value) => {
              setDigest(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Mentions"
            description="Email me when someone mentions me in an issue."
            checked={mentions}
            onToggle={(value) => {
              setMentions(value);
              setSaved(false);
            }}
          />
        </Column>

        <Row gap="12" vertical="center">
          <Button type="submit" label="Save changes" />
          <Text role="status" variant="body-default-s" onBackground="success-strong">
            {saved ? "Changes saved." : ""}
          </Text>
        </Row>
      </Column>
    </form>
  );
}
```
