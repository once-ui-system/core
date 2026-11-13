I'm confident in the API now. The Table `rows` shape is a generic `T[]` with `columns[].key` and optional `cell`, so I'll pass objects.

One CSS concern is the 16px radius. The package's radius tokens (`--radius-*`) aren't documented anywhere I can read, so I'll override the tokens most likely to exist (`--radius-s` to `--radius-xl`) in `fonts.css`, scoped to `:root`. This is token-level theming rather than per-element styling.

**`lib/once-ui.config.ts`**

```ts
import { defineConfig } from "@once-ui-system/core/config";

export const { style, dataStyle } = defineConfig({
  style: {
    theme: "system",
    defaultTheme: "light",
    neutral: "sand",
    brand: "pink",
    accent: "pink",
    solid: "color",
    solidStyle: "flat",
    border: "rounded",
    surface: "filled",
    transition: "all",
    density: "spacious",
    brandSeed: "#DB2777",
    brandScale: {
      light: {
        100: "#FFF1F7",
        200: "#FFE0EE",
        300: "#FDC2DC",
        400: "#F891BF",
        500: "#EE5A9C",
        600: "#DB2777",
        700: "#BE1C65",
        800: "#9D1854",
        900: "#7F1746",
        1000: "#5F1035",
        1100: "#430B25",
        1200: "#2B0718",
      },
      dark: {
        100: "#2B0718",
        200: "#430B25",
        300: "#5F1035",
        400: "#7F1746",
        500: "#9D1854",
        600: "#DB2777",
        700: "#EE5A9C",
        800: "#F891BF",
        900: "#FDC2DC",
        1000: "#FFE0EE",
        1100: "#FFF1F7",
        1200: "#FFF8FB",
      },
    },
  },
  dataStyle: {
    variant: "gradient",
    mode: "categorical",
    height: 24,
    axis: { stroke: "var(--neutral-alpha-weak)" },
    tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
  },
});
```

**`app/providers.tsx`**

```tsx
"use client";

// Standard Once UI provider stack with the Lumen theme config applied.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { dataStyle, style } from "../lib/once-ui.config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider {...style}>
      <LayoutProvider>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
```

**`app/fonts.css`**

```css
/* Lumen typography and shape, set once at the token level.
   System font stacks only: nothing is fetched from the network. */
:root {
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;

  /* 16px corners on buttons, inputs, cards and menus. */
  --radius-s: 0.75rem;
  --radius-m: 1rem;
  --radius-l: 1rem;
  --radius-xl: 1.25rem;
}
```

**`app/layout.tsx`**

```tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { Providers } from "./providers";
import { dataStyle, style } from "../lib/once-ui.config";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Paints the theme, brand scale and density before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>{children}</Providers>
      </Column>
    </Flex>
  );
}
```

**`lib/data.ts`**

```ts
import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
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

export type NavLink = { href: string; label: string; icon?: IconName };
export type NavGroupDef = { label: string; icon: IconName; items: NavLink[] };

// Group children carry no icon (the group's rail shows hierarchy); the collapsed
// sidebar uses `railIcon` to keep each child reachable as an icon.
export const navGroups: NavGroupDef[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview", icon: "home" },
      { href: "/reports", label: "Reports", icon: "newspaper" },
    ],
  },
  {
    label: "Workspace",
    icon: "organization",
    items: [
      { href: "/projects", label: "Projects", icon: "folder" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];
```

The brief names "Reports" but only three routes are required (`/`, `/projects`, `/settings`), and a link to a missing page would 404. I'll point "Reports" at `/` as an anchor so every nav item resolves to a real route:

**`lib/data.ts`** (final)

```ts
import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
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

export type NavLink = { id: string; href: string; label: string; icon: IconName };
export type NavGroupDef = { label: string; icon: IconName; items: NavLink[] };

// "Overview" is the dashboard at "/"; "Reports" shares that screen's route with a
// hash so it resolves to a real page while only three routes exist.
export const navGroups: NavGroupDef[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { id: "overview", href: "/", label: "Overview", icon: "home" },
      { id: "reports", href: "/#reports", label: "Reports", icon: "newspaper" },
    ],
  },
  {
    label: "Workspace",
    icon: "organization",
    items: [
      { id: "projects", href: "/projects", label: "Projects", icon: "folder" },
      { id: "settings", href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const navLinks: NavLink[] = navGroups.flatMap((group) => group.items);

export const summary = [
  { label: "Open issues", value: "56", note: "across 4 live projects", icon: "flag" },
  { label: "Active projects", value: "3", note: "1 paused, 1 archived", icon: "folder" },
  { label: "Resolved this week", value: "18", note: "6 more than last week", icon: "check" },
  { label: "Team members", value: "7", note: "2 invites waiting", icon: "people" },
] as const satisfies readonly {
  label: string;
  value: string;
  note: string;
  icon: IconName;
}[];

export const recentActivity = [
  { who: "Maya Okafor", what: "closed 3 issues in", where: "Customer app", when: "2 hours ago" },
  { who: "Tomás Reyes", what: "opened a new issue in", where: "Public API", when: "Yesterday" },
  { who: "Priya Nair", what: "shipped a release of", where: "Marketing site", when: "2 days ago" },
];
```

`Reports` at `/#reports` and `Overview` at `/` would both match `/` for highlighting, since `selectNavHref` works on paths. To keep the highlight unambiguous, I'll match by `id` inside the shell: the current item is the route match, and `Reports` is never selected on its own.

**`components/AppShell.tsx`**

```tsx
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
  Kbd,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  ThemeSwitcher,
  User,
  VisuallyHidden,
  selectNavHref,
  useHotkeys,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups, navLinks, product, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Routes that exist. "Reports" shares the dashboard route, so it never wins the highlight.
const routeLinks = navLinks.filter((link) => !link.href.includes("#"));

type SideNavProps = {
  current: string | null;
  collapsed: boolean;
};

function SideNav({ current, collapsed }: SideNavProps) {
  if (collapsed) {
    // Icon rail: every item stays reachable, named by aria-label and a tooltip.
    return (
      <Nav fill paddingX="8" aria-label="Main" gap="4">
        {navGroups.map((group) => (
          <Column key={group.label} gap="4" role="group" aria-label={group.label}>
            {group.items.map((link) => (
              <NavItem
                key={link.id}
                href={link.href}
                icon={link.icon}
                label={<VisuallyHidden>{`${group.label}: ${link.label}`}</VisuallyHidden>}
                aria-label={`${group.label}: ${link.label}`}
                title={`${group.label} · ${link.label}`}
                selected={link.href === current}
                horizontal="center"
              />
            ))}
          </Column>
        ))}
      </Nav>
    );
  }

  return (
    <Nav fill paddingX="8" aria-label="Main">
      {navGroups.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          icon={group.icon}
          defaultOpen
        >
          {group.items.map((link) => (
            <NavItem
              key={link.id}
              href={link.href}
              label={link.label}
              selected={link.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

/**
 * The signed-in frame, mounted once in app/(app)/layout.tsx. Only the content
 * pane scrolls; the header and sidebar stay put. Below `s` the sidebar is
 * replaced by a menu button that opens the same nav in a left Drawer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    routeLinks.map((link) => link.href),
  );

  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  useHotkeys("mod+k", () => setSearchOpen((open) => !open), { allowWhileTyping: true });

  const group = navGroups.find((g) => g.items.some((l) => l.href === current));
  const page = routeLinks.find((l) => l.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = routeLinks.map((link) => ({
    id: link.id,
    name: link.label,
    section: "Go to",
    keywords: link.label.toLowerCase(),
    href: link.href,
    icon: link.icon,
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="8" gap="4" minWidth="14rem">
      <Column paddingX="12" paddingY="8" gap="2">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  return (
    <Column fill flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>

      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        {/* Phones: menu button opens the drawer. */}
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>

        {/* Desktop: collapse toggle, then the brand. */}
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row vertical="center" gap="8">
          <Icon name="sparkle" onBackground="brand-strong" />
          <Text textVariant="heading-strong-m" family="heading">
            {product.name}
          </Text>
        </Row>

        <Row flex={1} paddingLeft="16" s={{ hide: true }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} hide s={{ hide: false }} />

        <Button
          size="s"
          variant="secondary"
          prefixIcon="search"
          label="Search"
          onClick={() => setSearchOpen(true)}
        />
        <Row s={{ hide: true }}>
          <Kbd keys="mod+k" />
        </Row>
        <ThemeSwitcher collapsed direction="column" />
        <Row s={{ hide: true }}>
          <User
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <User placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "5rem" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          transition="macro-short"
        >
          <SideNav current={current} collapsed={collapsed} />
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
            <Column maxWidth="xl" paddingX="24" paddingY="40" fitHeight>
              {/* Phones show the trail inside the page, since the header has no room. */}
              <Row hide s={{ hide: false }} paddingBottom="16">
                <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
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
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16">
          <SideNav current={current} collapsed={false} />
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

**`app/(app)/layout.tsx`**

```tsx
import { AppShell } from "../../components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

**`app/page.tsx`** is the one allowed root page and has to be the dashboard. A route group `(app)` can't also own `/`, so the dashboard has to live at `app/page.tsx`, outside the group. Instead of duplicating the shell, I'll put the layout at a nested level that covers every route by mounting the shell in `app/layout.tsx`'s children via a wrapper in the root layout. I'll mount `AppShell` inside the root layout and skip the route group:

**`app/layout.tsx`** (final)

```tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { Providers } from "./providers";
import { AppShell } from "../components/AppShell";
import { dataStyle, style } from "../lib/once-ui.config";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Paints the theme, brand scale and density before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          {/* Mounted once: open groups and collapsed state survive navigation. */}
          <AppShell>{children}</AppShell>
        </Providers>
      </Column>
    </Flex>
  );
}
```

That makes the `(app)` group unnecessary, so I'm dropping `app/(app)/layout.tsx`.

**`components/PageHeader.tsx`**

```tsx
import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Column gap="12">
      <Text textVariant="label-default-s" onBackground="brand-medium">
        {eyebrow}
      </Text>
      <Heading as="h1" textVariant="display-strong-s">
        {title}
      </Heading>
      <Text textVariant="body-default-l" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  );
}
```

**`app/page.tsx`**

```tsx
import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { PageHeader } from "../components/PageHeader";
import { recentActivity, summary, user } from "../lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];

  return (
    <Column gap="40">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}!`}
        description="Your team closed 18 issues this week. Here is how things look across your projects."
      />

      <Grid columns="4" l={{ columns: 2 }} s={{ columns: 1 }} gap="20" as="section" aria-label="Summary">
        {summary.map((card) => (
          <Column
            key={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
          >
            <Row horizontal="between" vertical="center">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
              <Row
                center
                width="40"
                height="40"
                radius="m"
                background="brand-alpha-weak"
                onBackground="brand-strong"
              >
                <Icon name={card.icon} onBackground="brand-strong" />
              </Row>
            </Row>
            <Heading as="p" textVariant="display-strong-m">
              {card.value}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column id="reports" gap="20" as="section" aria-labelledby="activity-title">
        <Heading as="h2" id="activity-title" textVariant="heading-strong-l">
          Recent activity
        </Heading>
        <Column background="surface" border radius="l" padding="8">
          {recentActivity.map((item, index) => (
            <Row
              key={`${item.who}-${item.when}`}
              paddingX="16"
              paddingY="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
              borderTop={index > 0}
            >
              <Text textVariant="body-default-m">
                <Text as="span" textVariant="label-strong-m">
                  {item.who}
                </Text>{" "}
                {item.what}{" "}
                <Text as="span" textVariant="label-strong-m" onBackground="brand-strong">
                  {item.where}
                </Text>
              </Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {item.when}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
```

**`app/projects/page.tsx`**

```tsx
"use client";

import { Button, Column, Row, SegmentedControl, Table, Tag, Text, type Tone } from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { type Project, type ProjectStatus, projects } from "../../lib/data";

// Status is spelled out in the tag text, so colour never carries it alone.
const statusTone: Record<ProjectStatus, Tone> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

type Filter = "all" | ProjectStatus;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = projects.filter((project) => filter === "all" || project.status === filter);

  return (
    <Column gap="32">
      <Row
        fillWidth
        horizontal="between"
        vertical="end"
        gap="16"
        s={{ direction: "column", horizontal: "start", vertical: "start" }}
      >
        <PageHeader
          eyebrow="Workspace"
          title="Projects"
          description="Everything your team is building, and how many issues are open."
        />
        <Button prefixIcon="plus" label="New project" />
      </Row>

      <SegmentedControl
        fillWidth={false}
        aria-label="Filter projects by status"
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        buttons={[
          { value: "all", label: "All" },
          { value: "Active", label: "Active" },
          { value: "Paused", label: "Paused" },
          { value: "Archived", label: "Archived" },
        ]}
      />

      <Table<Project>
        aria-label="Projects"
        searchable
        searchPlaceholder="Search projects"
        getRowId={(row) => row.key}
        rows={visible}
        columns={[
          {
            key: "name",
            header: "Project",
            sortable: true,
            cell: (row) => (
              <Column gap="4">
                <Text textVariant="label-strong-m">{row.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {row.key}
                </Text>
              </Column>
            ),
          },
          {
            key: "status",
            header: "Status",
            sortable: true,
            cell: (row) => (
              <Tag size="s" tone={statusTone[row.status]}>
                {row.status}
              </Tag>
            ),
          },
          {
            key: "issues",
            header: "Open issues",
            sortable: true,
            align: "right",
            sort: (a, b) => a.issues - b.issues,
          },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            align: "right",
            cell: (row) => formatDate(row.updated),
          },
        ]}
        emptyState={
          <Column center gap="12" padding="32">
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              No projects match this filter yet.
            </Text>
            <Button size="s" variant="secondary" onClick={() => setFilter("all")}>
              Show all projects
            </Button>
          </Column>
        }
      />
    </Column>
  );
}
```

**`app/settings/page.tsx`**

```tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Form,
  Heading,
  Input,
  Row,
  Select,
  Setting,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [timezone, setTimezone] = useState("wat");
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestDay, setDigestDay] = useState("monday");
  const [releases, setReleases] = useState(false);

  return (
    <Column gap="40">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Make Lumen feel like yours: your profile, and how we keep you in the loop."
      />

      <Tabs defaultValue="profile" orientation="vertical" gap="32" s={{ direction: "column" }}>
        <TabList aria-label="Settings sections" minWidth="14rem" s={{ direction: "row" }}>
          <Tab value="profile" size="l" prefixIcon="person">
            Profile
          </Tab>
          <Tab value="notifications" size="l" prefixIcon="bell">
            Notifications
          </Tab>
        </TabList>

        <TabPanel value="profile" keepMounted flex={1}>
          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" textVariant="heading-strong-l">
              Your profile
            </Heading>
            <Row gap="16" vertical="center">
              <Avatar size="l" value="MO" />
              <Column gap="4">
                <Text textVariant="label-strong-m">{user.name}</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {user.role} of Acme Labs
                </Text>
              </Column>
            </Row>
            <Form
              as="form"
              columns={{ xl: 2, s: 1 }}
              onSubmit={(event) => {
                event.preventDefault();
                addToast({ tone: "success", message: "Profile saved. Looking good!" });
              }}
            >
              <Input id="name" label="Display name" value={name} onValueChange={setName} />
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
              />
              <Select
                id="timezone"
                label="Timezone"
                value={timezone}
                onValueChange={(value) => setTimezone(value as string)}
                options={[
                  { value: "wat", label: "West Africa Time (Lagos)" },
                  { value: "cet", label: "Central European Time" },
                  { value: "est", label: "Eastern Time" },
                ]}
              />
              <Row gap="12" style={{ gridColumn: "1 / -1" }}>
                <Button type="submit" label="Save changes" />
                <Button
                  type="button"
                  variant="secondary"
                  label="Reset"
                  onClick={() => {
                    setName(user.name);
                    setEmail(user.email);
                  }}
                />
              </Row>
            </Form>
          </Column>
        </TabPanel>

        <TabPanel value="notifications" flex={1} gap="8">
          <Heading as="h2" textVariant="heading-strong-l" marginBottom="8">
            Notifications
          </Heading>
          <Setting label="Mentions" description="Tell me when a teammate mentions me">
            <Switch
              checked={mentions}
              onCheckedChange={setMentions}
              aria-label="Mention notifications"
            />
          </Setting>
          <Setting
            label="Weekly digest"
            info="A friendly summary of what your team shipped."
            control={
              <Switch checked={digest} onCheckedChange={setDigest} aria-label="Weekly digest" />
            }
            open={digest}
          >
            <Setting label="Send on" description="Day of the week">
              <Select
                id="digest-day"
                label="Day"
                value={digestDay}
                onValueChange={(value) => setDigestDay(value as string)}
                options={[
                  { value: "monday", label: "Monday" },
                  { value: "friday", label: "Friday" },
                ]}
              />
            </Setting>
          </Setting>
          <Setting label="Product releases" description="News when Lumen ships something new">
            <Switch
              checked={releases}
              onCheckedChange={setReleases}
              aria-label="Product release news"
            />
          </Setting>
        </TabPanel>
      </Tabs>
    </Column>
  );
}
```

I'm sending the files as final.

```ts lib/once-ui.config.ts
import { defineConfig } from "@once-ui-system/core/config";

export const { style, dataStyle } = defineConfig({
  style: {
    theme: "system",
    defaultTheme: "light",
    neutral: "sand",
    brand: "pink",
    accent: "pink",
    solid: "color",
    solidStyle: "flat",
    border: "rounded",
    surface: "filled",
    transition: "all",
    density: "spacious",
    brandSeed: "#DB2777",
    brandScale: {
      light: {
        100: "#FFF1F7",
        200: "#FFE0EE",
        300: "#FDC2DC",
        400: "#F891BF",
        500: "#EE5A9C",
        600: "#DB2777",
        700: "#BE1C65",
        800: "#9D1854",
        900: "#7F1746",
        1000: "#5F1035",
        1100: "#430B25",
        1200: "#2B0718",
      },
      dark: {
        100: "#2B0718",
        200: "#430B25",
        300: "#5F1035",
        400: "#7F1746",
        500: "#9D1854",
        600: "#DB2777",
        700: "#EE5A9C",
        800: "#F891BF",
        900: "#FDC2DC",
        1000: "#FFE0EE",
        1100: "#FFF1F7",
        1200: "#FFF8FB",
      },
    },
  },
  dataStyle: {
    variant: "gradient",
    mode: "categorical",
    height: 24,
    axis: { stroke: "var(--neutral-alpha-weak)" },
    tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
  },
});
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack with the Lumen theme config applied.
import { DataThemeProvider, IconProvider, ThemeProvider, ToastProvider } from "@once-ui-system/core";
import { LayoutProvider } from "@once-ui-system/core/next";
import { dataStyle, style } from "../lib/once-ui.config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider {...style}>
      <LayoutProvider>
        <DataThemeProvider {...dataStyle}>
          <ToastProvider>
            <IconProvider>{children}</IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
```

```css app/fonts.css
/* Lumen typography and shape, set once at the token level.
   System font stacks only: nothing is fetched from the network. */
:root {
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;

  /* 16px corners on buttons, inputs, cards and menus. */
  --radius-s: 0.75rem;
  --radius-m: 1rem;
  --radius-l: 1rem;
  --radius-xl: 1.25rem;
}
```

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { Providers } from "./providers";
import { AppShell } from "../components/AppShell";
import { dataStyle, style } from "../lib/once-ui.config";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Paints the theme, brand scale and density before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          {/* Mounted once: open groups and collapsed state survive navigation. */}
          <AppShell>{children}</AppShell>
        </Providers>
      </Column>
    </Flex>
  );
}
```

```ts lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
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

export type NavLink = { id: string; href: string; label: string; icon: IconName };
export type NavGroupDef = { label: string; icon: IconName; items: NavLink[] };

// "Overview" is the dashboard at "/"; "Reports" shares that screen's route with a
// hash so it resolves to a real page while only three routes exist.
export const navGroups: NavGroupDef[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { id: "overview", href: "/", label: "Overview", icon: "home" },
      { id: "reports", href: "/#reports", label: "Reports", icon: "newspaper" },
    ],
  },
  {
    label: "Workspace",
    icon: "organization",
    items: [
      { id: "projects", href: "/projects", label: "Projects", icon: "folder" },
      { id: "settings", href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const navLinks: NavLink[] = navGroups.flatMap((group) => group.items);

export const summary = [
  { label: "Open issues", value: "56", note: "across 4 live projects", icon: "flag" },
  { label: "Active projects", value: "3", note: "1 paused, 1 archived", icon: "folder" },
  { label: "Resolved this week", value: "18", note: "6 more than last week", icon: "check" },
  { label: "Team members", value: "7", note: "2 invites waiting", icon: "people" },
] as const satisfies readonly {
  label: string;
  value: string;
  note: string;
  icon: IconName;
}[];

export const recentActivity = [
  { who: "Maya Okafor", what: "closed 3 issues in", where: "Customer app", when: "2 hours ago" },
  { who: "Tomás Reyes", what: "opened a new issue in", where: "Public API", when: "Yesterday" },
  { who: "Priya Nair", what: "shipped a release of", where: "Marketing site", when: "2 days ago" },
];
```

```tsx components/AppShell.tsx
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
  Kbd,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  ThemeSwitcher,
  User,
  VisuallyHidden,
  selectNavHref,
  useHotkeys,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups, navLinks, product, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Routes that exist. "Reports" shares the dashboard route, so it never wins the highlight.
const routeLinks = navLinks.filter((link) => !link.href.includes("#"));

type SideNavProps = {
  current: string | null;
  collapsed: boolean;
};

function SideNav({ current, collapsed }: SideNavProps) {
  if (collapsed) {
    // Icon rail: every item stays reachable, named by aria-label and a tooltip.
    return (
      <Nav fill paddingX="8" aria-label="Main" gap="4">
        {navGroups.map((group) => (
          <Column key={group.label} gap="4" role="group" aria-label={group.label}>
            {group.items.map((link) => (
              <NavItem
                key={link.id}
                href={link.href}
                icon={link.icon}
                label={<VisuallyHidden>{`${group.label}: ${link.label}`}</VisuallyHidden>}
                aria-label={`${group.label}: ${link.label}`}
                title={`${group.label} · ${link.label}`}
                selected={link.href === current}
              />
            ))}
          </Column>
        ))}
      </Nav>
    );
  }

  return (
    <Nav fill paddingX="8" aria-label="Main">
      {navGroups.map((group) => (
        <NavGroup key={group.label} label={group.label} icon={group.icon} defaultOpen>
          {group.items.map((link) => (
            <NavItem
              key={link.id}
              href={link.href}
              label={link.label}
              selected={link.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

/**
 * The signed-in frame, mounted once in app/layout.tsx. Only the content pane
 * scrolls; the header and sidebar stay put. Below `s` the sidebar is replaced
 * by a menu button that opens the same nav in a left Drawer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    routeLinks.map((link) => link.href),
  );

  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  useHotkeys("mod+k", () => setSearchOpen((open) => !open), { allowWhileTyping: true });

  const group = navGroups.find((g) => g.items.some((l) => l.href === current));
  const page = routeLinks.find((l) => l.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = routeLinks.map((link) => ({
    id: link.id,
    name: link.label,
    section: "Go to",
    keywords: link.label.toLowerCase(),
    href: link.href,
    icon: link.icon,
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="8" gap="4" minWidth="14rem">
      <Column paddingX="12" paddingY="8" gap="2">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  return (
    <Column fill flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>

      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        {/* Phones: menu button opens the drawer. */}
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>

        {/* Desktop: collapse toggle, then the brand. */}
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row vertical="center" gap="8">
          <Icon name="sparkle" onBackground="brand-strong" />
          <Text textVariant="heading-strong-m" family="heading">
            {product.name}
          </Text>
        </Row>

        <Row flex={1} paddingLeft="16" s={{ hide: true }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} hide s={{ hide: false }} />

        <Button
          size="s"
          variant="secondary"
          prefixIcon="search"
          label="Search"
          onClick={() => setSearchOpen(true)}
        />
        <Row s={{ hide: true }}>
          <Kbd keys="mod+k" />
        </Row>
        <ThemeSwitcher collapsed direction="column" />
        <Row s={{ hide: true }}>
          <User
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <User placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "5rem" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          transition="macro-short"
        >
          <SideNav current={current} collapsed={collapsed} />
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
            <Column maxWidth="xl" paddingX="24" paddingY="40" fitHeight>
              {/* Phones show the trail inside the page, since the header has no room. */}
              <Row hide s={{ hide: false }} paddingBottom="16">
                <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
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
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16">
          <SideNav current={current} collapsed={false} />
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

```tsx components/PageHeader.tsx
import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Column gap="12">
      <Text textVariant="label-default-s" onBackground="brand-medium">
        {eyebrow}
      </Text>
      <Heading as="h1" textVariant="display-strong-s">
        {title}
      </Heading>
      <Text textVariant="body-default-l" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { PageHeader } from "../components/PageHeader";
import { recentActivity, summary, user } from "../lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];

  return (
    <Column gap="40">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}!`}
        description="Your team closed 18 issues this week. Here is how things look across your projects."
      />

      <Grid
        as="section"
        aria-label="Summary"
        columns="4"
        l={{ columns: 2 }}
        s={{ columns: 1 }}
        gap="20"
      >
        {summary.map((card) => (
          <Column key={card.label} background="surface" border radius="l" padding="24" gap="16">
            <Row horizontal="between" vertical="center">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
              <Row center width="40" height="40" radius="m" background="brand-alpha-weak">
                <Icon name={card.icon} onBackground="brand-strong" />
              </Row>
            </Row>
            <Heading as="p" textVariant="display-strong-m">
              {card.value}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column id="reports" as="section" aria-labelledby="activity-title" gap="20">
        <Heading as="h2" id="activity-title" textVariant="heading-strong-l">
          Recent activity
        </Heading>
        <Column background="surface" border radius="l" padding="8">
          {recentActivity.map((item, index) => (
            <Row
              key={`${item.who}-${item.when}`}
              paddingX="16"
              paddingY="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
              borderTop={index > 0}
            >
              <Text as="p" textVariant="body-default-m">
                <Text as="span" textVariant="label-strong-m">
                  {item.who}
                </Text>{" "}
                {item.what}{" "}
                <Text as="span" textVariant="label-strong-m" onBackground="brand-strong">
                  {item.where}
                </Text>
              </Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {item.when}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx app/projects/page.tsx
"use client";

import {
  Button,
  Column,
  Row,
  SegmentedControl,
  Table,
  Tag,
  Text,
  type Tone,
} from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { type Project, type ProjectStatus, projects } from "../../lib/data";

// Status is spelled out in the tag text, so colour never carries it alone.
const statusTone: Record<ProjectStatus, Tone> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

type Filter = "all" | ProjectStatus;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = projects.filter((project) => filter === "all" || project.status === filter);

  return (
    <Column gap="32">
      <Row
        fillWidth
        horizontal="between"
        vertical="end"
        gap="16"
        s={{ direction: "column", horizontal: "start", vertical: "start" }}
      >
        <PageHeader
          eyebrow="Workspace"
          title="Projects"
          description="Everything your team is building, and how many issues are open."
        />
        <Button prefixIcon="plus" label="New project" />
      </Row>

      <SegmentedControl
        fillWidth={false}
        aria-label="Filter projects by status"
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        buttons={[
          { value: "all", label: "All" },
          { value: "Active", label: "Active" },
          { value: "Paused", label: "Paused" },
          { value: "Archived", label: "Archived" },
        ]}
      />

      <Table<Project>
        aria-label="Projects"
        searchable
        searchPlaceholder="Search projects"
        getRowId={(row) => row.key}
        rows={visible}
        columns={[
          {
            key: "name",
            header: "Project",
            sortable: true,
            sort: (a, b) => a.name.localeCompare(b.name),
            cell: (row) => (
              <Column gap="4">
                <Text textVariant="label-strong-m">{row.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {row.key}
                </Text>
              </Column>
            ),
          },
          {
            key: "status",
            header: "Status",
            sortable: true,
            sort: (a, b) => a.status.localeCompare(b.status),
            cell: (row) => (
              <Tag size="s" tone={statusTone[row.status]}>
                {row.status}
              </Tag>
            ),
          },
          {
            key: "issues",
            header: "Open issues",
            sortable: true,
            align: "right",
            sort: (a, b) => a.issues - b.issues,
            cell: (row) => String(row.issues),
          },
          {
            key: "updated",
            header: "Updated",
            sortable: true,
            align: "right",
            sort: (a, b) => a.updated.localeCompare(b.updated),
            cell: (row) => formatDate(row.updated),
          },
        ]}
        emptyState={
          <Column center gap="12" padding="32">
            <Text textVariant="body-default-m" onBackground="neutral-weak">
              No projects match this filter yet.
            </Text>
            <Button size="s" variant="secondary" onClick={() => setFilter("all")}>
              Show all projects
            </Button>
          </Column>
        }
      />
    </Column>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Form,
  Heading,
  Input,
  Row,
  Select,
  Setting,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [timezone, setTimezone] = useState("wat");
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestDay, setDigestDay] = useState("monday");
  const [releases, setReleases] = useState(false);

  return (
    <Column gap="40">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Make Lumen feel like yours: your profile, and how we keep you in the loop."
      />

      <Tabs defaultValue="profile" orientation="vertical" gap="32" s={{ direction: "column" }}>
        <TabList aria-label="Settings sections" minWidth="14rem" s={{ direction: "row" }}>
          <Tab value="profile" size="l" prefixIcon="person">
            Profile
          </Tab>
          <Tab value="notifications" size="l" prefixIcon="bell">
            Notifications
          </Tab>
        </TabList>

        <TabPanel value="profile" keepMounted flex={1}>
          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" textVariant="heading-strong-l">
              Your profile
            </Heading>
            <Row gap="16" vertical="center">
              <Avatar size="l" value="MO" />
              <Column gap="4">
                <Text textVariant="label-strong-m">{user.name}</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {user.role} of Acme Labs
                </Text>
              </Column>
            </Row>
            <Form
              as="form"
              columns={{ xl: 2, s: 1 }}
              onSubmit={(event) => {
                event.preventDefault();
                addToast({ tone: "success", message: "Profile saved. Looking good!" });
              }}
            >
              <Input id="name" label="Display name" value={name} onValueChange={setName} />
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
              />
              <Select
                id="timezone"
                label="Timezone"
                value={timezone}
                onValueChange={(value) => setTimezone(value as string)}
                options={[
                  { value: "wat", label: "West Africa Time (Lagos)" },
                  { value: "cet", label: "Central European Time" },
                  { value: "est", label: "Eastern Time" },
                ]}
              />
              <Row gap="12" style={{ gridColumn: "1 / -1" }}>
                <Button type="submit" label="Save changes" />
                <Button
                  type="button"
                  variant="secondary"
                  label="Reset"
                  onClick={() => {
                    setName(user.name);
                    setEmail(user.email);
                  }}
                />
              </Row>
            </Form>
          </Column>
        </TabPanel>

        <TabPanel value="notifications" flex={1} gap="8">
          <Heading as="h2" textVariant="heading-strong-l" marginBottom="8">
            Notifications
          </Heading>
          <Setting label="Mentions" description="Tell me when a teammate mentions me">
            <Switch
              checked={mentions}
              onCheckedChange={setMentions}
              aria-label="Mention notifications"
            />
          </Setting>
          <Setting
            label="Weekly digest"
            info="A friendly summary of what your team shipped."
            control={
              <Switch checked={digest} onCheckedChange={setDigest} aria-label="Weekly digest" />
            }
            open={digest}
          >
            <Setting label="Send on" description="Day of the week">
              <Select
                id="digest-day"
                label="Day"
                value={digestDay}
                onValueChange={(value) => setDigestDay(value as string)}
                options={[
                  { value: "monday", label: "Monday" },
                  { value: "friday", label: "Friday" },
                ]}
              />
            </Setting>
          </Setting>
          <Setting label="Product releases" description="News when Lumen ships something new">
            <Switch
              checked={releases}
              onCheckedChange={setReleases}
              aria-label="Product release news"
            />
          </Setting>
        </TabPanel>
      </Tabs>
    </Column>
  );
}
```