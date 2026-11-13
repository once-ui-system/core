Nothing else claims `/`. Since `src/app/page.tsx` already exists at `/`, I'll make that file the dashboard and put `/projects` and `/settings` under a `(lumen)` group. To share one layout across all three without a conflict, I'll make the shell a single client component (`AppShell`) mounted by the group layout for `/projects` and `/settings`, and by the root page for `/`. To keep the shell mounted once across navigations, I'll instead place all three pages under the group, and turn the root page into a thin re-export of the group's dashboard component, so only one layout owns the shell.

The simplest robust structure is a root-level shell in `src/app/layout.tsx`'s child. I'll keep the root layout untouched and make `src/app/page.tsx` render the dashboard inside `AppShell`, while `(lumen)/layout.tsx` renders `AppShell` for the other two screens.

Now I'll write the files.

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

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
} as const;

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type NavLeaf = { label: string; href: string };
export type NavGroupDef = { key: string; label: string; icon: IconName; items: NavLeaf[] };

/**
 * "Overview" is the dashboard at `/`; "Reports" has no screen of its own in
 * this build, so it points at the projects list where issue counts live.
 */
export const navGroups: NavGroupDef[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/" },
      { label: "Reports", href: "/projects?view=reports" },
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

export const crumbs: Record<string, { section: string; page: string }> = {
  "/": { section: "Analytics", page: "Overview" },
  "/projects": { section: "Workspace", page: "Projects" },
  "/settings": { section: "Workspace", page: "Settings" },
};

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

export function summary() {
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  return { active, openIssues, total: projects.length, latest };
}
```

```tsx src/components/AppShell.tsx
"use client";

import {
  Avatar,
  Column,
  Drawer,
  IconButton,
  Line,
  Logo,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  UserMenu,
  VisuallyHidden,
  Breadcrumbs,
  Icon,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { crumbs, navGroups, product, user } from "@/lib/data";

function normalize(pathname: string): string {
  if (pathname.startsWith("/projects")) return "/projects";
  if (pathname.startsWith("/settings")) return "/settings";
  return "/";
}

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  // Match on plain paths: the Reports entry carries a query string that
  // would never prefix a pathname.
  const hrefs = navGroups.flatMap((g) => g.items.map((i) => i.href.split("?")[0]));
  const current = selectNavHref(pathname, hrefs);
  const route = normalize(pathname);

  return (
    <Nav
      fill
      density="compact"
      collapsed={collapsed}
      aria-label="Main"
      paddingX="8"
      overflowY="auto"
    >
      {navGroups.map((group) => {
        const holdsCurrent = group.items.some((i) => i.href.split("?")[0] === current);
        return (
          <NavGroup
            key={group.key}
            label={group.label}
            icon={group.icon}
            defaultOpen={holdsCurrent}
          >
            {group.items.map((item) => {
              const path = item.href.split("?")[0];
              // "Reports" shares the /projects path with "Projects"; only the
              // plain-path entry is the highlighted one.
              const selected = path === current && path === route && !item.href.includes("?");
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  selected={selected}
                  aria-current={selected ? "page" : undefined}
                />
              );
            })}
          </NavGroup>
        );
      })}
    </Nav>
  );
}

function Account() {
  return (
    <UserMenu
      name={user.name}
      subline={user.role}
      avatarProps={{ value: user.name.charAt(0) }}
      dropdown={
        <Column minWidth={14} padding="4" gap="2">
          <Column paddingX="12" paddingY="8" gap="2">
            <Text variant="label-default-s">{user.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {user.email}
            </Text>
          </Column>
          <Line marginY="4" />
          <Option
            value="settings"
            label="Settings"
            href="/settings"
            prefix={<Icon name="settings" size="xs" onBackground="neutral-weak" />}
          />
        </Column>
      }
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const crumb = crumbs[normalize(pathname)];

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
        horizontal="between"
        background="page"
        position="sticky"
        top="0"
        zIndex={1}
      >
        <Row gap="12" vertical="center">
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
          <Row gap="8" vertical="center">
            <Icon name="sparkle" size="s" onBackground="brand-medium" />
            <Text variant="heading-strong-s">{product.name}</Text>
          </Row>
          <Row s={{ hide: true }} paddingLeft="16">
            <Breadcrumbs
              aria-label="Breadcrumb"
              items={[{ label: crumb.section }, { label: crumb.page }]}
            />
          </Row>
        </Row>
        <Account />
      </Row>

      <Row hide s={{ hide: false }} fillWidth paddingX="16" paddingBottom="8">
        <Breadcrumbs
          aria-label="Breadcrumb"
          items={[{ label: crumb.section }, { label: crumb.page }]}
        />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth={collapsed ? 5 : 18}
          minWidth={collapsed ? 5 : 18}
          fitHeight
          position="sticky"
          top="56"
          gap="8"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
          <Row paddingX="8" paddingBottom="16" horizontal={collapsed ? "center" : "start"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            />
          </Row>
        </Column>

        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            paddingX="l"
            s={{ paddingX: "16" }}
            fillWidth
            background="surface"
          >
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="m" paddingY="32" fitHeight>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16" fillWidth>
          <Row paddingX="16" paddingBottom="12" gap="12" vertical="center">
            <Avatar size="s" value={user.name.charAt(0)} />
            <Column>
              <Text variant="label-default-s">{user.name}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {user.email}
              </Text>
            </Column>
          </Row>
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}
```

```tsx src/components/Dashboard.tsx
import { Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { formatDate, product, projects, summary, user } from "@/lib/data";

type Card = { label: string; value: string; note: string; icon: IconName };

export function Dashboard() {
  const s = summary();
  const cards: Card[] = [
    { label: "Active projects", value: String(s.active), note: `of ${s.total} in the workspace`, icon: "folder" },
    { label: "Open issues", value: String(s.openIssues), note: "across all projects", icon: "checkbox" },
    {
      label: "Last updated",
      value: s.latest.key,
      note: `${s.latest.name}, ${formatDate(s.latest.updated)}`,
      icon: "time",
    },
  ];
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {product.tagline}. Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="3" s={{ columns: 1 }} m={{ columns: 2 }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} as="section" aria-label={card.label} background="surface" border radius="l" padding="24" gap="12">
            <Row gap="8" vertical="center" onBackground="neutral-weak">
              <Icon name={card.icon} size="s" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
            </Row>
            <Heading as="p" variant="display-strong-s">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="12">
        <Row gap="12" vertical="center" wrap>
          <Heading as="h2" variant="heading-strong-m">
            Needs attention
          </Heading>
          <Tag scheme="warning" size="s" label={`${busiest.issues} open`} />
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {busiest.name} ({busiest.key}) has the most open issues. Last activity on{" "}
          {formatDate(busiest.updated)}.
        </Text>
      </Column>
    </Column>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard · Lumen",
  description: "A summary of your Lumen workspace.",
};

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
```

```tsx src/components/ProjectsList.tsx
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const scheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsList() {
  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>

      <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
        {projects.map((project) => (
          <Row
            as="li"
            key={project.key}
            background="surface"
            border
            radius="l"
            padding="16"
            gap="16"
            vertical="center"
            horizontal="between"
            wrap
          >
            <Row gap="16" vertical="center">
              <Row
                background="neutral-alpha-weak"
                radius="m"
                width="48"
                height="48"
                center
                textVariant="label-strong-s"
                aria-hidden="true"
              >
                {project.key}
              </Row>
              <Column gap="4">
                <Text variant="heading-strong-s">{project.name}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Updated {formatDate(project.updated)}
                </Text>
              </Column>
            </Row>
            <Row gap="16" vertical="center">
              <Text variant="body-default-s" onBackground="neutral-weak">
                {project.issues} {project.issues === 1 ? "issue" : "issues"}
              </Text>
              <Tag scheme={scheme[project.status]} size="m" label={project.status} />
            </Row>
          </Row>
        ))}
      </Column>
    </Column>
  );
}
```

```tsx src/app/(lumen)/projects/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ProjectsList } from "@/components/ProjectsList";

export const metadata: Metadata = {
  title: "Projects · Lumen",
  description: "Every project in your Lumen workspace.",
};

export default function Page() {
  return (
    <AppShell>
      <ProjectsList />
    </AppShell>
  );
}
```

```tsx src/components/SettingsPanel.tsx
"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsPanel() {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Manage your profile and how Lumen keeps you informed. Your role is {user.role}.
        </Text>
      </Column>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Column gap="24">
          <Column background="surface" border radius="l" padding="24" gap="16">
            <Heading as="h2" variant="heading-strong-m">
              Profile
            </Heading>
            <Input
              id="settings-name"
              label="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
            <Input
              id="settings-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
            />
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="16">
            <Heading as="h2" variant="heading-strong-m">
              Notifications
            </Heading>
            <Row horizontal="between" vertical="center" gap="16">
              <Column gap="4">
                <Text variant="label-default-m" id="label-digest">
                  Weekly digest
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  A Monday summary of issues opened and closed.
                </Text>
              </Column>
              <Switch
                aria-labelledby="label-digest"
                checked={digest}
                onToggle={() => {
                  setDigest((v) => !v);
                  setSaved(false);
                }}
              />
            </Row>
            <Row horizontal="between" vertical="center" gap="16">
              <Column gap="4">
                <Text variant="label-default-m" id="label-mentions">
                  Mentions
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Email me when someone mentions me on an issue.
                </Text>
              </Column>
              <Switch
                aria-labelledby="label-mentions"
                checked={mentions}
                onToggle={() => {
                  setMentions((v) => !v);
                  setSaved(false);
                }}
              />
            </Row>
          </Column>

          <Row gap="16" vertical="center">
            <Button type="submit" label="Save changes" />
            <Text variant="body-default-s" onBackground="success-medium" role="status" aria-live="polite">
              {saved ? "Changes saved" : ""}
            </Text>
          </Row>
        </Column>
      </form>
    </Column>
  );
}
```

```tsx src/app/(lumen)/settings/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SettingsPanel } from "@/components/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings · Lumen",
  description: "Profile and notification settings for your Lumen account.",
};

export default function Page() {
  return (
    <AppShell>
      <SettingsPanel />
    </AppShell>
  );
}
```