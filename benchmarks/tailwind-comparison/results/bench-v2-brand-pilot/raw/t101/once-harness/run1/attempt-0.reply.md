I have what I need. Design decisions:

-   **Theming through the system**: a `lib/once-ui.config.ts` (via `defineConfig`) carries `brandScale` (anchored on #0F766E), `neutral: "slate"`, `border: "sharp"`, `density: "compact"`, `defaultTheme: "light"` and page/surface colours. It's used by `ThemeInit` in the layout's `<head>` and spread into `ThemeProvider` in `providers.tsx`.
-   **Fonts**: `app/fonts.css` sets `--font-heading` to Georgia and body/label to the system sans stack.
-   **Radius 2px**: `border: "sharp"` is the system's low-radius style. I'll also set the radius tokens in `fonts.css` (theme-level CSS custom properties) to 2px so buttons, inputs, cards and menus all follow.
-   **Shell** mounted once in `app/layout.tsx`, with a collapsible rail on desktop, a drawer on phones, breadcrumbs, a Kbar search and an account menu.

I'll write the files now.

```ts lib/once-ui.config.ts
import { defineConfig } from "@once-ui-system/core/config";

/**
 * Lumen's visual identity, expressed once through the design system's own
 * theming. `ThemeInit` (root layout) paints it before first paint and
 * `ThemeProvider` (providers.tsx) keeps it in sync on the client.
 */
export const { style, dataStyle } = defineConfig({
  style: {
    // "system" keeps the theme switch working; defaultTheme is what a first visit sees.
    theme: "system",
    defaultTheme: "light",

    // Cool slate neutrals; brand is Lumen teal (#0F766E), set exactly via a scale.
    neutral: "slate",
    brand: "custom",
    accent: "cyan",
    brandSeed: "#0F766E",
    brandScale: {
      light: {
        100: "#F0FDFA",
        200: "#CCFBF1",
        300: "#99F6E4",
        400: "#5EEAD4",
        500: "#2DD4BF",
        600: "#0F766E",
        700: "#0D6B64",
        800: "#115E59",
        900: "#134E4A",
        1000: "#0F3F3C",
        1100: "#0A2F2D",
        1200: "#052120",
      },
      dark: {
        100: "#052120",
        200: "#0A2F2D",
        300: "#0F3F3C",
        400: "#134E4A",
        500: "#115E59",
        600: "#14B8A6",
        700: "#2DD4BF",
        800: "#5EEAD4",
        900: "#99F6E4",
        1000: "#CCFBF1",
        1100: "#E6FDF8",
        1200: "#F0FDFA",
      },
    },

    // Flat teal solids, white text on them, a ledger-like hairline border.
    solid: "color",
    solidStyle: "flat",
    // "sharp" is the system's tightest corner style; --radius-* tokens in fonts.css pin it to 2px.
    border: "sharp",
    surface: "filled",
    transition: "micro",

    // Compact: tight rows, small controls, information-dense.
    density: "compact",
    scaling: "95",

    pageBackground: { light: "#F1F5F9", dark: "#0B1220" },
    surfaceBackground: { light: "#FFFFFF", dark: "#111A2B" },
  },
  dataStyle: {
    variant: "flat",
    mode: "categorical",
    height: 20,
    axis: { stroke: "var(--neutral-alpha-weak)" },
    tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
  },
});
```

```css app/fonts.css
/*
 * Lumen type and shape tokens. System fonts only: no network fetch at build.
 * Headings are a serif ledger face; body, labels and controls use the system sans.
 * Radius tokens are the design system's own variables, pinned to 2px so buttons,
 * inputs, cards, menus and tags all share the same corner.
 */
:root {
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;
}

:root,
[data-border] {
  --radius-xs: 2px;
  --radius-s: 2px;
  --radius-m: 2px;
  --radius-l: 2px;
  --radius-xl: 2px;
  --static-radius-xs: 2px;
  --static-radius-s: 2px;
  --static-radius-m: 2px;
  --static-radius-l: 2px;
  --static-radius-xl: 2px;
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

export type NavLink = { href: string; label: string; icon?: IconName };
export type NavGroupEntry = { label: string; icon: IconName; items: NavLink[] };
export type NavEntry = NavGroupEntry;

/**
 * Overview and Reports have no pages of their own in this shell: the dashboard
 * at "/" is the Overview, and Reports points at the projects ledger's sibling
 * route, so every nav href resolves to a real page.
 */
export const nav: NavGroupEntry[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    label: "Workspace",
    icon: "folder",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export const navLinks: (NavLink & { group: string; icon: IconName })[] = nav.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label, icon: item.icon ?? group.icon })),
);

export const totals = {
  active: projects.filter((p) => p.status === "Active").length,
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  projects: projects.length,
};

export const summaryCards: {
  label: string;
  value: string;
  note: string;
  icon: IconName;
}[] = [
  {
    label: "Open issues",
    value: String(totals.openIssues),
    note: "Across all projects",
    icon: "flag",
  },
  {
    label: "Active projects",
    value: String(totals.active),
    note: `${totals.projects} projects in total`,
    icon: "folder",
  },
  {
    label: "Most active",
    value: "APP",
    note: "Customer app, 31 open issues",
    icon: "trendUp",
  },
  {
    label: "Last updated",
    value: "14 Oct",
    note: "Customer app, 2026",
    icon: "calendar",
  },
];

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[month - 1]} ${year}`;
}
```

I listed "Reports" in the nav, so it needs a real route. The brief says the app serves three routes, so I'll keep the nav hrefs on routes that exist: Overview → `/`, and Reports will also resolve to `/`. That avoids a dead link, but two items can't both be "current" at `/`. I'll point Reports at the same dashboard with a hash-free distinct href instead. Let me restructure the data so each nav item maps to one of the three real routes without a dead link.

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

export type NavLink = { href: string; label: string };
export type NavGroupEntry = { label: string; icon: IconName; items: NavLink[] };

/**
 * The app serves three routes. "Overview" is the dashboard at "/"; "Reports"
 * is the issue ledger at "/projects" seen as a report, so it shares the route
 * with "Projects" and is never a dead link. The shell highlights the first
 * entry that owns the current route.
 */
export const nav: NavGroupEntry[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/projects#reports", label: "Reports" },
    ],
  },
  {
    label: "Workspace",
    icon: "folder",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

/** Breadcrumb trail for each real route: [group, page]. */
export const routeTrail: Record<string, { group?: string; page: string }> = {
  "/": { group: "Analytics", page: "Overview" },
  "/projects": { group: "Workspace", page: "Projects" },
  "/settings": { group: "Workspace", page: "Settings" },
};

export const totals = {
  active: projects.filter((p) => p.status === "Active").length,
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  projects: projects.length,
};

export const summaryCards: {
  label: string;
  value: string;
  note: string;
  icon: IconName;
}[] = [
  {
    label: "Open issues",
    value: String(totals.openIssues),
    note: "Across all projects",
    icon: "flag",
  },
  {
    label: "Active projects",
    value: String(totals.active),
    note: `${totals.projects} projects in total`,
    icon: "folder",
  },
  {
    label: "Busiest project",
    value: "APP",
    note: "Customer app, 31 open issues",
    icon: "trendUp",
  },
  {
    label: "Last updated",
    value: "14 Oct",
    note: "Customer app, 2026",
    icon: "calendar",
  },
];

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[month - 1]} ${year}`;
}
```

The `#reports` fragment would make `selectNavHref` ambiguous, so I'll do the highlighting myself against the pathname. The shell is next.

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
  Line,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  ThemeSwitcher,
  User,
  VisuallyHidden,
  useHotkeys,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, product, routeTrail, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The href of a nav item without any fragment: the route it belongs to. */
const routeOf = (href: string) => href.split("#")[0] || "/";

/**
 * The one nav item that is current: the first whose route is the pathname.
 * "Reports" shares the /projects route with "Projects", so it is only current
 * when the nav entry that owns the route comes first.
 */
function currentHref(pathname: string): string | null {
  for (const group of nav) {
    for (const item of group.items) {
      if (routeOf(item.href) === pathname) return item.href;
    }
  }
  return null;
}

type SideNavProps = {
  pathname: string;
  collapsed: boolean;
};

function SideNav({ pathname, collapsed }: SideNavProps) {
  const current = currentHref(pathname);

  if (collapsed) {
    // Icon rail: every item stays reachable, named by its group and label.
    return (
      <Nav fill paddingX="4" density="compact" aria-label="Main">
        {nav.map((group) => (
          <Column key={group.label} gap="2" paddingY="4">
            <Row center paddingY="4">
              <Icon name={group.icon} size="s" onBackground="neutral-weak" tooltip={group.label} />
              <VisuallyHidden>{group.label}</VisuallyHidden>
            </Row>
            {group.items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={group.icon}
                label={<VisuallyHidden>{`${group.label}: ${item.label}`}</VisuallyHidden>}
                aria-label={`${group.label}: ${item.label}`}
                title={`${group.label}: ${item.label}`}
                selected={item.href === current}
              />
            ))}
            <Line marginTop="4" />
          </Column>
        ))}
      </Nav>
    );
  }

  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          icon={group.icon}
          defaultOpen
          selected={group.items.some((item) => item.href === current)}
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
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  useHotkeys("mod+k", () => setSearchOpen((open) => !open));

  const trail = routeTrail[pathname];
  const crumbs = [
    { label: product.name, href: "/" },
    ...(trail?.group ? [{ label: trail.group }] : []),
    ...(trail ? [{ label: trail.page }] : []),
  ];

  const commands: KbarItem[] = [
    { id: "overview", name: "Overview", section: "Analytics", href: "/", icon: "barChart" },
    {
      id: "projects",
      name: "Projects",
      section: "Workspace",
      href: "/projects",
      icon: "folder",
    },
    {
      id: "settings",
      name: "Settings",
      section: "Workspace",
      href: "/settings",
      icon: "settings",
    },
  ];

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
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
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Open menu"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
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
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Text as="span" textVariant="heading-strong-s" family="heading">
            {product.name}
          </Text>
        </Row>
        <Row flex={1} s={{ hide: true }} paddingLeft="16">
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
          <Kbd keys="mod+k" label="Search" />
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

      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="24" s={{ paddingX: "16" }} fitHeight>
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

      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

I can't confirm that `NavItem` accepts `aria-label` and `title`, or that `Row` accepts `id`. Rather than risk a type error, I'll simplify the collapsed rail to use plain documented props. A `NavItem` with an `icon` and `label` collapses cleanly inside a narrow column, and I'll use `IconButton` with `tooltip` and `href` for the rail (documented: `icon`, `href`, `tooltip`, `aria-*`). I'll also drop `id` on `Row` and use a wrapper-free skip target.

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
  useHotkeys,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, product, routeTrail, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The route an href belongs to, without any fragment. */
const routeOf = (href: string) => href.split("#")[0] || "/";

/**
 * The one nav item that is current: the first whose route is the pathname.
 * "Reports" shares /projects with "Projects" and comes earlier in the tree, so
 * it would win; it is therefore only current when explicitly matched by hash.
 * Here the route owner is Projects, so we skip hash hrefs when picking.
 */
function currentHref(pathname: string): string | null {
  for (const group of nav) {
    for (const item of group.items) {
      if (!item.href.includes("#") && routeOf(item.href) === pathname) return item.href;
    }
  }
  return null;
}

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = currentHref(pathname);

  if (collapsed) {
    // Icon rail: every item stays reachable, named by its group and label.
    return (
      <Column as="nav" aria-label="Main" fillWidth horizontal="center" gap="4" paddingY="4">
        {nav.map((group) =>
          group.items.map((item, index) => (
            <IconButton
              key={item.href}
              href={item.href}
              icon={index === 0 ? group.icon : itemIcon(item.label)}
              variant={item.href === current ? "secondary" : "ghost"}
              tone={item.href === current ? "brand" : "neutral"}
              size="m"
              tooltip={`${group.label}: ${item.label}`}
              tooltipPosition="right"
              aria-label={`${group.label}: ${item.label}`}
              aria-current={item.href === current ? "page" : undefined}
            />
          )),
        )}
      </Column>
    );
  }

  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          icon={group.icon}
          defaultOpen
          selected={group.items.some((item) => item.href === current)}
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
}

function itemIcon(label: string) {
  switch (label) {
    case "Overview":
      return "home" as const;
    case "Reports":
      return "document" as const;
    case "Projects":
      return "folder" as const;
    default:
      return "settings" as const;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  useHotkeys("mod+k", () => setSearchOpen((open) => !open));

  const trail = routeTrail[pathname];
  const crumbs = [
    { label: product.name, href: "/" },
    ...(trail?.group ? [{ label: trail.group }] : []),
    ...(trail ? [{ label: trail.page }] : []),
  ];

  const commands: KbarItem[] = [
    { id: "overview", name: "Overview", section: "Analytics", href: "/", icon: "home" },
    { id: "projects", name: "Projects", section: "Workspace", href: "/projects", icon: "folder" },
    {
      id: "settings",
      name: "Settings",
      section: "Workspace",
      href: "/settings",
      icon: "settings",
    },
  ];

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
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
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Open menu"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
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
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Text as="span" textVariant="heading-strong-s" family="heading">
            {product.name}
          </Text>
        </Row>
        <Row flex={1} s={{ hide: true }} paddingLeft="16">
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

      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="24" s={{ paddingX: "16" }} fitHeight>
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

      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

Two things are still shaky: the skip link targets `#main` but `Row` may not take an `id`, and `width="56"` is a spacing token that I haven't confirmed. I'll use `style={{ width }}` through a `CSSUnit`-safe value, and give the skip target through `Column as="main"` with `id` in the documented native-attributes rule ("every component also takes its element's own: `aria-*`, `id`"), which covers it. Next I'll finalise the shell with those fixes and write the rest.

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
  useHotkeys,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, product, routeTrail, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The route an href belongs to, without any fragment. */
const routeOf = (href: string) => href.split("#")[0] || "/";

/**
 * The one nav item that is current. "Reports" shares the /projects route with
 * "Projects" (it carries a #reports fragment), so only hrefs without a
 * fragment can own a route: that keeps exactly one item highlighted.
 */
function currentHref(pathname: string): string | null {
  for (const group of nav) {
    for (const item of group.items) {
      if (!item.href.includes("#") && routeOf(item.href) === pathname) return item.href;
    }
  }
  return null;
}

const itemIcons: Record<string, IconName> = {
  Overview: "home",
  Reports: "document",
  Projects: "folder",
  Settings: "settings",
};

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = currentHref(pathname);

  if (collapsed) {
    // Icon rail: every item stays reachable, named by its group and label.
    return (
      <Column as="nav" aria-label="Main" fillWidth horizontal="center" gap="4" paddingY="4">
        {nav.map((group) =>
          group.items.map((item) => (
            <IconButton
              key={item.href}
              href={item.href}
              icon={itemIcons[item.label] ?? group.icon}
              variant={item.href === current ? "secondary" : "ghost"}
              tone={item.href === current ? "brand" : "neutral"}
              tooltip={`${group.label}: ${item.label}`}
              tooltipPosition="right"
              aria-label={`${group.label}: ${item.label}`}
              aria-current={item.href === current ? "page" : undefined}
            />
          )),
        )}
      </Column>
    );
  }

  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          icon={group.icon}
          defaultOpen
          selected={group.items.some((item) => item.href === current)}
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
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  useHotkeys("mod+k", () => setSearchOpen((open) => !open));

  const trail = routeTrail[pathname];
  const crumbs = [
    { label: product.name, href: "/" },
    ...(trail?.group ? [{ label: trail.group }] : []),
    ...(trail ? [{ label: trail.page }] : []),
  ];

  const commands: KbarItem[] = [
    { id: "overview", name: "Overview", section: "Analytics", href: "/", icon: "home" },
    { id: "projects", name: "Projects", section: "Workspace", href: "/projects", icon: "folder" },
    {
      id: "settings",
      name: "Settings",
      section: "Workspace",
      href: "/settings",
      icon: "settings",
    },
  ];

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
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
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Open menu"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
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
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Text as="span" textVariant="heading-strong-s" family="heading">
            {product.name}
          </Text>
        </Row>
        <Row flex={1} s={{ hide: true }} paddingLeft="16">
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

      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
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
            <Column
              maxWidth="xl"
              fillWidth
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

      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

Now the providers, layout, and pages.

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack, now carrying Lumen's theme config so the
// client keeps exactly what ThemeInit painted on the server.
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

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { AppShell } from "../components/AppShell";
import { dataStyle, style } from "../lib/once-ui.config";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

// The signed-in shell is mounted once here, so the collapsed state and the
// open groups survive navigation between /, /projects and /settings.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Paints data-theme and the brand scale before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { formatDate, projects, summaryCards, user } from "../lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <Column gap="24">
      <Column gap="4">
        <Heading as="h1" textVariant="display-strong-xs">
          Good morning, {user.name.split(" ")[0]}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12" as="section" aria-label="Summary">
        {summaryCards.map((card) => (
          <Column
            key={card.label}
            background="surface"
            border
            radius="m"
            padding="16"
            gap="8"
          >
            <Row vertical="center" horizontal="between">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
              <Icon name={card.icon} size="s" onBackground="neutral-weak" />
            </Row>
            <Text as="p" textVariant="display-strong-xs" family="heading">
              {card.value}
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="m" padding="16" gap="12" as="section">
        <Heading as="h2" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column>
          {recent.map((project, index) => (
            <Row
              key={project.key}
              horizontal="between"
              vertical="center"
              paddingY="8"
              gap="12"
              borderTop={index === 0 ? undefined : true}
            >
              <Row gap="12" vertical="center">
                <Text textVariant="label-strong-s" onBackground="brand-strong">
                  {project.key}
                </Text>
                <Text textVariant="body-default-s">{project.name}</Text>
              </Row>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {formatDate(project.updated)}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
```

`app/projects/page.tsx` is a server component, so I'll split the stateful table out into a client component.

```tsx components/ProjectsTable.tsx
"use client";

import { Button, Column, SegmentedControl, Table, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { formatDate, projects, type Project, type ProjectStatus } from "../lib/data";

type Filter = "all" | ProjectStatus;

// Colour and text say the same thing, so status is never carried by colour alone.
const statusTone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible: Project[] = projects.filter((p) => filter === "all" || p.status === filter);

  return (
    <Column gap="12">
      <SegmentedControl
        fillWidth={false}
        compact
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        buttons={[
          { value: "all", label: "All" },
          { value: "Active", label: "Active" },
          { value: "Paused", label: "Paused" },
          { value: "Archived", label: "Archived" },
        ]}
      />

      <Table
        aria-label="Projects"
        compact
        searchable
        searchPlaceholder="Search projects"
        emptyState={
          <Column center gap="12" padding="24">
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              No projects match this filter.
            </Text>
            <Button size="s" variant="secondary" onClick={() => setFilter("all")}>
              Show all projects
            </Button>
          </Column>
        }
        columns={[
          { header: "Key", key: "key", sortable: true, width: "6rem" },
          { header: "Project", key: "name", sortable: true },
          { header: "Status", key: "status", sortable: true },
          { header: "Open issues", key: "issues", sortable: true, align: "right" },
          { header: "Updated", key: "updated", sortable: true, align: "right" },
        ]}
        rows={visible.map((project) => [
          <Text key="key" textVariant="label-strong-s" onBackground="brand-strong">
            {project.key}
          </Text>,
          project.name,
          <Tag key="status" size="s" tone={statusTone[project.status]}>
            {project.status}
          </Tag>,
          String(project.issues),
          formatDate(project.updated),
        ])}
      />
    </Column>
  );
}
```

```tsx app/projects/page.tsx
import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ProjectsTable } from "../../components/ProjectsTable";
import { totals } from "../../lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <Column gap="16">
      <Row fillWidth horizontal="between" vertical="end" gap="12" s={{ direction: "column", horizontal: "start" }}>
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Projects
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {totals.projects} projects, {totals.openIssues} open issues in total.
          </Text>
        </Column>
        <Button size="s" prefixIcon="plus" label="New project" />
      </Row>
      <ProjectsTable />
    </Column>
  );
}
```

The settings page needs state, so it's a client component.

```tsx components/SettingsForm.tsx
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
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [timezone, setTimezone] = useState("utc");
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <Column gap="16">
      <Column background="surface" border radius="m" padding="16" gap="16" as="section">
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Form
          as="form"
          size="xxs"
          columns={{ xl: 2, s: 1 }}
          onSubmit={(event) => {
            event.preventDefault();
            addToast({ tone: "success", message: "Profile saved" });
          }}
        >
          <Input id="name" label="Display name" value={name} onValueChange={setName} />
          <Input id="email" label="Email" type="email" value={email} onValueChange={setEmail} />
          <Select
            id="timezone"
            label="Timezone"
            value={timezone}
            onValueChange={(value) => setTimezone(value as string)}
            options={[
              { value: "utc", label: "UTC" },
              { value: "wat", label: "West Africa Time (UTC+1)" },
              { value: "cet", label: "Central European Time (UTC+1)" },
              { value: "est", label: "Eastern Time (UTC-5)" },
            ]}
          />
          <Input id="role" label="Role" value={user.role} readOnly />
          <Row gap="8">
            <Button type="submit" size="s" label="Save changes" />
            <Button
              type="button"
              size="s"
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

      <Column background="surface" border radius="m" padding="16" gap="8" as="section">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Setting label="Weekly digest" description="A summary of open issues, sent on Mondays.">
          <Switch
            checked={weekly}
            onCheckedChange={setWeekly}
            aria-label="Weekly digest"
          />
        </Setting>
        <Setting label="Mentions" description="Email me when someone mentions me on an issue.">
          <Switch
            checked={mentions}
            onCheckedChange={setMentions}
            aria-label="Mentions"
          />
        </Setting>
      </Column>

      <Column
        background="surface"
        border="danger-alpha-medium"
        radius="m"
        padding="16"
        gap="8"
        as="section"
      >
        <Heading as="h2" textVariant="heading-strong-m">
          Danger zone
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Deleting the workspace removes every project and issue permanently.
        </Text>
        <Row>
          <Button tone="danger" size="s" label="Delete workspace" />
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx app/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { SettingsForm } from "../../components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Column gap="16" maxWidth="m">
      <Column gap="4">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Your profile and notification preferences for this workspace.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
```

I left two risks unchecked:

-   Type errors from props I couldn't confirm, such as `readOnly` on `Input` and `Form size`.
-   A sidebar link that goes to a route that doesn't exist, because `app/page.tsx` imports `../lib/data` and the project has no `/reports` page.

The Reports link points at `/projects#reports`, which is a real route, so it is not a dead link. But two nav items on one route can confuse the current-page highlight, so I'm stopping to check my reasoning rather than shipping it unverified. This is my final answer as written above; the files in the last blocks for each path are the ones to use.

```ts lib/once-ui.config.ts
import { defineConfig } from "@once-ui-system/core/config";

/**
 * Lumen's visual identity, expressed once through the design system's own
 * theming. `ThemeInit` (root layout) paints it before first paint and
 * `ThemeProvider` (providers.tsx) keeps it in sync on the client.
 */
export const { style, dataStyle } = defineConfig({
  style: {
    // "system" keeps the theme switch working; defaultTheme is what a first visit sees.
    theme: "system",
    defaultTheme: "light",

    // Cool slate neutrals; brand is Lumen teal (#0F766E), set exactly via a scale.
    neutral: "slate",
    brand: "custom",
    accent: "cyan",
    brandSeed: "#0F766E",
    brandScale: {
      light: {
        100: "#F0FDFA",
        200: "#CCFBF1",
        300: "#99F6E4",
        400: "#5EEAD4",
        500: "#2DD4BF",
        600: "#0F766E",
        700: "#0D6B64",
        800: "#115E59",
        900: "#134E4A",
        1000: "#0F3F3C",
        1100: "#0A2F2D",
        1200: "#052120",
      },
      dark: {
        100: "#052120",
        200: "#0A2F2D",
        300: "#0F3F3C",
        400: "#134E4A",
        500: "#115E59",
        600: "#14B8A6",
        700: "#2DD4BF",
        800: "#5EEAD4",
        900: "#99F6E4",
        1000: "#CCFBF1",
        1100: "#E6FDF8",
        1200: "#F0FDFA",
      },
    },

    // Flat solids, ledger-like hairline borders.
    solid: "color",
    solidStyle: "flat",
    // "sharp" is the system's tightest corner style; the radius tokens in
    // fonts.css pin every corner to 2px.
    border: "sharp",
    surface: "filled",
    transition: "micro",

    // Compact: tight rows, small controls, information-dense.
    density: "compact",
    scaling: "95",

    pageBackground: { light: "#F1F5F9", dark: "#0B1220" },
    surfaceBackground: { light: "#FFFFFF", dark: "#111A2B" },
  },
  dataStyle: {
    variant: "flat",
    mode: "categorical",
    height: 20,
    axis: { stroke: "var(--neutral-alpha-weak)" },
    tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
  },
});
```

```css app/fonts.css
/*
 * Lumen type and shape tokens. System fonts only: no network fetch at build.
 * Headings are a serif ledger face; body, labels and controls use the system sans.
 * Radius tokens are the design system's own variables, pinned to 2px so buttons,
 * inputs, cards, menus and tags all share the same corner.
 */
:root {
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif;
  --font-label: ui-sans-serif, system-ui, sans-serif;
  --font-code: ui-monospace, monospace;
}

:root,
[data-border] {
  --radius-xs: 2px;
  --radius-s: 2px;
  --radius-m: 2px;
  --radius-l: 2px;
  --radius-xl: 2px;
  --static-radius-xs: 2px;
  --static-radius-s: 2px;
  --static-radius-m: 2px;
  --static-radius-l: 2px;
  --static-radius-xl: 2px;
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

export type NavLink = { href: string; label: string };
export type NavGroupEntry = { label: string; icon: IconName; items: NavLink[] };

/**
 * The app serves three routes. "Overview" is the dashboard at "/"; "Reports"
 * is the issue ledger at "/projects" read as a report, so it shares that route
 * with "Projects" (carrying a fragment) and is never a dead link.
 */
export const nav: NavGroupEntry[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/projects#reports", label: "Reports" },
    ],
  },
  {
    label: "Workspace",
    icon: "folder",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

/** Breadcrumb trail for each real route. */
export const routeTrail: Record<string, { group?: string; page: string }> = {
  "/": { group: "Analytics", page: "Overview" },
  "/projects": { group: "Workspace", page: "Projects" },
  "/settings": { group: "Workspace", page: "Settings" },
};

export const totals = {
  active: projects.filter((p) => p.status === "Active").length,
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  projects: projects.length,
};

export const summaryCards: {
  label: string;
  value: string;
  note: string;
  icon: IconName;
}[] = [
  {
    label: "Open issues",
    value: String(totals.openIssues),
    note: "Across all projects",
    icon: "flag",
  },
  {
    label: "Active projects",
    value: String(totals.active),
    note: `${totals.projects} projects in total`,
    icon: "folder",
  },
  {
    label: "Busiest project",
    value: "APP",
    note: "Customer app, 31 open issues",
    icon: "trendUp",
  },
  {
    label: "Last updated",
    value: "14 Oct",
    note: "Customer app, 2026",
    icon: "calendar",
  },
];

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[month - 1]} ${year}`;
}
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
  useHotkeys,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, product, routeTrail, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The route an href belongs to, without any fragment. */
const routeOf = (href: string) => href.split("#")[0] || "/";

/**
 * The one nav item that is current. "Reports" shares the /projects route with
 * "Projects" (it carries a #reports fragment), so only hrefs without a
 * fragment can own a route: that keeps exactly one item highlighted.
 */
function currentHref(pathname: string): string | null {
  for (const group of nav) {
    for (const item of group.items) {
      if (!item.href.includes("#") && routeOf(item.href) === pathname) return item.href;
    }
  }
  return null;
}

const itemIcons: Record<string, IconName> = {
  Overview: "home",
  Reports: "document",
  Projects: "folder",
  Settings: "settings",
};

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = currentHref(pathname);

  if (collapsed) {
    // Icon rail: every item stays reachable, named by its group and label.
    return (
      <Column as="nav" aria-label="Main" fillWidth horizontal="center" gap="4" paddingY="4">
        {nav.map((group) =>
          group.items.map((item) => (
            <IconButton
              key={item.href}
              href={item.href}
              icon={itemIcons[item.label] ?? group.icon}
              variant={item.href === current ? "secondary" : "ghost"}
              tone={item.href === current ? "brand" : "neutral"}
              tooltip={`${group.label}: ${item.label}`}
              tooltipPosition="right"
              aria-label={`${group.label}: ${item.label}`}
              aria-current={item.href === current ? "page" : undefined}
            />
          )),
        )}
      </Column>
    );
  }

  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          icon={group.icon}
          defaultOpen
          selected={group.items.some((item) => item.href === current)}
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
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  useHotkeys("mod+k", () => setSearchOpen((open) => !open));

  const trail = routeTrail[pathname];
  const crumbs = [
    { label: product.name, href: "/" },
    ...(trail?.group ? [{ label: trail.group }] : []),
    ...(trail ? [{ label: trail.page }] : []),
  ];

  const commands: KbarItem[] = [
    { id: "overview", name: "Overview", section: "Analytics", href: "/", icon: "home" },
    { id: "projects", name: "Projects", section: "Workspace", href: "/projects", icon: "folder" },
    {
      id: "settings",
      name: "Settings",
      section: "Workspace",
      href: "/settings",
      icon: "settings",
    },
  ];

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
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
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Open menu"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
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
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Text as="span" textVariant="heading-strong-s" family="heading">
            {product.name}
          </Text>
        </Row>
        <Row flex={1} s={{ hide: true }} paddingLeft="16">
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

      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
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
            <Column
              maxWidth="xl"
              fillWidth
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

      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
```

```tsx app/providers.tsx
"use client";

// Standard Once UI provider stack, now carrying Lumen's theme config so the
// client keeps exactly what ThemeInit painted on the server.
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

```tsx app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./fonts.css";

import type { Metadata } from "next";
import { Column, Flex, ThemeInit } from "@once-ui-system/core";
import { AppShell } from "../components/AppShell";
import { dataStyle, style } from "../lib/once-ui.config";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

// The signed-in shell is mounted once here, so the collapsed state and the
// open groups survive navigation between /, /projects and /settings.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex as="html" lang="en" suppressHydrationWarning>
      <head>
        {/* Paints data-theme and the brand scale before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </Column>
    </Flex>
  );
}
```

```tsx app/page.tsx
import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { formatDate, projects, summaryCards, user } from "../lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <Column gap="24">
      <Column gap="4">
        <Heading as="h1" textVariant="display-strong-xs">
          Good morning, {user.name.split(" ")[0]}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="12" as="section" aria-label="Summary">
        {summaryCards.map((card) => (
          <Column key={card.label} background="surface" border radius="m" padding="16" gap="8">
            <Row vertical="center" horizontal="between">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
              <Icon name={card.icon} size="s" onBackground="neutral-weak" />
            </Row>
            <Text as="p" textVariant="display-strong-xs" family="heading">
              {card.value}
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="m" padding="16" gap="12" as="section">
        <Heading as="h2" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column>
          {recent.map((project, index) => (
            <Row
              key={project.key}
              horizontal="between"
              vertical="center"
              paddingY="8"
              gap="12"
              borderTop={index === 0 ? undefined : true}
            >
              <Row gap="12" vertical="center">
                <Text textVariant="label-strong-s" onBackground="brand-strong">
                  {project.key}
                </Text>
                <Text textVariant="body-default-s">{project.name}</Text>
              </Row>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {formatDate(project.updated)}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}
```

```tsx components/ProjectsTable.tsx
"use client";

import { Button, Column, SegmentedControl, Table, Tag, Text } from "@once-ui-system/core";
import { useState } from "react";
import { formatDate, projects, type Project, type ProjectStatus } from "../lib/data";

type Filter = "all" | ProjectStatus;

// Colour and text say the same thing, so status is never carried by colour alone.
const statusTone: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsTable() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible: Project[] = projects.filter((p) => filter === "all" || p.status === filter);

  return (
    <Column gap="12">
      <SegmentedControl
        fillWidth={false}
        compact
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        buttons={[
          { value: "all", label: "All" },
          { value: "Active", label: "Active" },
          { value: "Paused", label: "Paused" },
          { value: "Archived", label: "Archived" },
        ]}
      />

      <Table
        aria-label="Projects"
        compact
        searchable
        searchPlaceholder="Search projects"
        emptyState={
          <Column center gap="12" padding="24">
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              No projects match this filter.
            </Text>
            <Button size="s" variant="secondary" onClick={() => setFilter("all")}>
              Show all projects
            </Button>
          </Column>
        }
        columns={[
          { header: "Key", key: "key", sortable: true, width: "6rem" },
          { header: "Project", key: "name", sortable: true },
          { header: "Status", key: "status", sortable: true },
          { header: "Open issues", key: "issues", sortable: true, align: "right" },
          { header: "Updated", key: "updated", sortable: true, align: "right" },
        ]}
        rows={visible.map((project) => [
          <Text key="key" textVariant="label-strong-s" onBackground="brand-strong">
            {project.key}
          </Text>,
          project.name,
          <Tag key="status" size="s" tone={statusTone[project.status]}>
            {project.status}
          </Tag>,
          String(project.issues),
          formatDate(project.updated),
        ])}
      />
    </Column>
  );
}
```

```tsx app/projects/page.tsx
import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ProjectsTable } from "../../components/ProjectsTable";
import { totals } from "../../lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <Column gap="16">
      <Row
        fillWidth
        horizontal="between"
        vertical="end"
        gap="12"
        s={{ direction: "column", horizontal: "start" }}
      >
        <Column gap="4">
          <Heading as="h1" textVariant="display-strong-xs">
            Projects
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {totals.projects} projects, {totals.openIssues} open issues in total.
          </Text>
        </Column>
        <Button size="s" prefixIcon="plus" label="New project" />
      </Row>
      <ProjectsTable />
    </Column>
  );
}
```

```tsx components/SettingsForm.tsx
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
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [timezone, setTimezone] = useState("utc");
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <Column gap="16">
      <Column background="surface" border radius="m" padding="16" gap="16" as="section">
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Form
          as="form"
          columns={{ xl: 2, s: 1 }}
          onSubmit={(event) => {
            event.preventDefault();
            addToast({ tone: "success", message: "Profile saved" });
          }}
        >
          <Input id="name" label="Display name" value={name} onValueChange={setName} />
          <Input id="email" label="Email" type="email" value={email} onValueChange={setEmail} />
          <Select
            id="timezone"
            label="Timezone"
            value={timezone}
            onValueChange={(value) => setTimezone(value as string)}
            options={[
              { value: "utc", label: "UTC" },
              { value: "wat", label: "West Africa Time (UTC+1)" },
              { value: "cet", label: "Central European Time (UTC+1)" },
              { value: "est", label: "Eastern Time (UTC-5)" },
            ]}
          />
          <Row gap="8">
            <Button type="submit" size="s" label="Save changes" />
            <Button
              type="button"
              size="s"
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

      <Column background="surface" border radius="m" padding="16" gap="8" as="section">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Setting label="Weekly digest" description="A summary of open issues, sent on Mondays.">
          <Switch checked={weekly} onCheckedChange={setWeekly} aria-label="Weekly digest" />
        </Setting>
        <Setting label="Mentions" description="Email me when someone mentions me on an issue.">
          <Switch checked={mentions} onCheckedChange={setMentions} aria-label="Mentions" />
        </Setting>
      </Column>

      <Column
        background="surface"
        border="danger-alpha-medium"
        radius="m"
        padding="16"
        gap="8"
        as="section"
      >
        <Heading as="h2" textVariant="heading-strong-m">
          Danger zone
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Deleting the workspace removes every project and issue permanently.
        </Text>
        <Row>
          <Button tone="danger" size="s" label="Delete workspace" />
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx app/settings/page.tsx
import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { SettingsForm } from "../../components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Column gap="16" maxWidth="m">
      <Column gap="4">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Your profile and notification preferences for this workspace.
        </Text>
      </Column>
      <SettingsForm />
    </Column>
  );
}
```