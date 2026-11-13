Now I'll write the data, shell, and pages. The shell goes in `(lumen)/layout.tsx` for `/projects` and `/settings`. For `/`, which can't live in the same group because `src/app/page.tsx` exists, I'll render the shell there with the same component.

```ts src/lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
} as const;

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

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

export type NavLeaf = { label: string; href: string };
export type NavNode = {
  key: string;
  label: string;
  icon: IconName;
  items: NavLeaf[];
};

/**
 * Navigation groups. "Overview" is the dashboard at `/`; "Reports" has no
 * page of its own yet, so it points at the dashboard's reports anchor.
 */
export const navGroups: NavNode[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/" },
      { label: "Reports", href: "/#reports" },
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

export const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/projects": "Projects",
  "/settings": "Settings",
};

export const routeGroups: Record<string, string> = {
  "/": "Analytics",
  "/projects": "Workspace",
  "/settings": "Workspace",
};

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

export const summary = {
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  activeProjects: projects.filter((p) => p.status === "Active").length,
  totalProjects: projects.length,
};

export const recentActivity = [
  { who: "Maya Okafor", what: "closed 3 issues in Customer app", when: "Today" },
  { who: "Tomás Reyes", what: "opened WEB-48 “Hero image is blurry on retina”", when: "Yesterday" },
  { who: "Priya Nair", what: "shipped Public API v1.4 release notes", when: "Oct 9" },
];
```

```tsx src/components/AppShell.tsx
"use client";

import {
  Avatar,
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
import { navGroups, product, routeGroups, routeTitles, user } from "@/lib/data";

type SideNavProps = {
  pathname: string;
  collapsed?: boolean;
};

const allHrefs = navGroups.flatMap((group) => group.items.map((item) => item.href));

function SideNav({ pathname, collapsed = false }: SideNavProps) {
  // "/#reports" shares its path with "/", so only real routes take part in
  // the current-page match; a hash link never claims the highlight.
  const routeHrefs = allHrefs.filter((href) => !href.includes("#"));
  const current = selectNavHref(pathname, routeHrefs);

  return (
    <Nav density="compact" fill padding="4" collapsed={collapsed} aria-label="Main">
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
              aria-current={item.href === current ? "page" : undefined}
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
  // The drawer is open for the path it was opened on: following a link in it
  // closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const title = routeTitles[pathname] ?? "Lumen";
  const group = routeGroups[pathname];
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group }] : []),
    { label: title },
  ];

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
        horizontal="between"
        background="page"
      >
        <Row vertical="center" gap="12" flex={1}>
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
          <Row vertical="center" gap="8">
            <Icon name="sparkle" size="s" onBackground="brand-medium" />
            <Text variant="heading-strong-s">{product.name}</Text>
          </Row>
          <Row s={{ hide: true }} paddingLeft="16">
            <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
          </Row>
        </Row>

        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: "MO" }}
          dropdown={
            <Column minWidth={14} padding="4" gap="2">
              <Column paddingX="12" paddingY="8" gap="2">
                <Text variant="label-strong-s">{user.name}</Text>
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

      {/* Breadcrumb on phones sits under the header, where there is room. */}
      <Row hide s={{ hide: false }} fillWidth paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth={collapsed ? 4 : 16}
          width={collapsed ? 4 : 16}
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
            paddingX="l"
            s={{ paddingX: "16" }}
            fillWidth
            background="surface"
          >
            <Column maxWidth="xl" fillWidth gap="m" paddingY="32" fitHeight>
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
        <Column paddingTop="64" paddingBottom="16" paddingX="8" gap="16">
          <Row gap="12" vertical="center" paddingX="8">
            <Avatar size="m" value="MO" />
            <Column>
              <Text variant="label-strong-s">{user.name}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {user.email}
              </Text>
            </Column>
          </Row>
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
}
```

```tsx src/components/DashboardView.tsx
import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, recentActivity, summary, user } from "@/lib/data";

const cards = [
  {
    label: "Open issues",
    value: String(summary.openIssues),
    note: "Across all projects",
  },
  {
    label: "Active projects",
    value: `${summary.activeProjects} of ${summary.totalProjects}`,
    note: "Paused and archived excluded",
  },
  {
    label: "Busiest project",
    value: [...projects].sort((a, b) => b.issues - a.issues)[0].name,
    note: `${[...projects].sort((a, b) => b.issues - a.issues)[0].issues} open issues`,
  },
  {
    label: "Last update",
    value: formatDate([...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0].updated),
    note: "Most recent project activity",
  },
];

export function DashboardView() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Text variant="label-default-s" onBackground="brand-medium">
          Overview
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Here is where your team stands today across {summary.totalProjects} projects.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        {cards.map((card) => (
          <Column
            key={card.label}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="8"
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Text variant="heading-strong-l">{card.value}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column id="reports" gap="16" background="surface" border radius="l" padding="24">
        <Row horizontal="between" vertical="center" gap="12" wrap>
          <Heading as="h2" variant="heading-strong-m">
            Recent activity
          </Heading>
          <Tag scheme="brand" size="s" label="Last 7 days" />
        </Row>
        <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
          {recentActivity.map((item) => (
            <Row as="li" key={item.what} gap="12" horizontal="between" vertical="start">
              <Text variant="body-default-s">
                <strong>{item.who}</strong> {item.what}
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
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

```tsx src/app/page.tsx
import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";

export const metadata = {
  title: "Overview · Lumen",
  description: "A summary of your team's projects and issues in Lumen.",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
```

```tsx src/app/(lumen)/layout.tsx
import { AppShell } from "@/components/AppShell";

export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx src/app/(lumen)/projects/page.tsx
import { ProjectsView } from "@/components/ProjectsView";

export const metadata = {
  title: "Projects · Lumen",
  description: "All projects in your Lumen workspace.",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
```

```tsx src/components/ProjectsView.tsx
import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsView() {
  return (
    <Column gap="24">
      <Column gap="8">
        <Text variant="label-default-s" onBackground="brand-medium">
          Workspace
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {projects.length} projects in Acme Labs.
        </Text>
      </Column>

      <Column
        background="surface"
        border
        radius="l"
        overflowX="auto"
        fillWidth
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "32rem",
            textAlign: "left",
          }}
        >
          <caption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            Projects in your workspace
          </caption>
          <thead>
            <tr>
              {["Key", "Name", "Status", "Issues", "Updated"].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid var(--neutral-alpha-medium)",
                    textAlign: heading === "Issues" ? "right" : "left",
                  }}
                >
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {heading}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.key}>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Text variant="code-default-s">{project.key}</Text>
                </td>
                <th scope="row" style={{ padding: "0.75rem 1rem", fontWeight: "inherit", textAlign: "left" }}>
                  <Text variant="label-strong-s">{project.name}</Text>
                </th>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Tag scheme={statusScheme[project.status]} size="s" label={project.status} />
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  <Text variant="body-default-s">{project.issues}</Text>
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Column>
    </Column>
  );
}
```

```tsx src/app/(lumen)/settings/page.tsx
import { SettingsView } from "@/components/SettingsView";

export const metadata = {
  title: "Settings · Lumen",
  description: "Manage your profile and notifications in Lumen.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
```

```tsx src/components/SettingsView.tsx
"use client";

import {
  Button,
  Column,
  Form,
  Heading,
  Input,
  Row,
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
import { user } from "@/lib/data";

export function SettingsView() {
  const { addToast } = useToast();
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <Column gap="24">
      <Column gap="8">
        <Text variant="label-default-s" onBackground="brand-medium">
          Workspace
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Signed in as {user.email} ({user.role}).
        </Text>
      </Column>

      <Tabs defaultValue="profile" orientation="vertical" gap="32" s={{ direction: "column" }}>
        <TabList aria-label="Settings sections" minWidth={14} s={{ direction: "row" }}>
          <Tab value="profile" prefixIcon="person">
            Profile
          </Tab>
          <Tab value="notifications" prefixIcon="bell">
            Notifications
          </Tab>
        </TabList>

        <TabPanel value="profile" keepMounted flex={1}>
          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" variant="heading-strong-m">
              Profile
            </Heading>
            <Form
              as="form"
              columns={{ xl: 2, s: 1 }}
              onSubmit={(event) => {
                event.preventDefault();
                addToast({ variant: "success", message: "Profile saved" });
              }}
            >
              <Input
                id="name"
                label="Display name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Row gap="12" style={{ gridColumn: "1 / -1" }}>
                <Button type="submit" label="Save changes" />
              </Row>
            </Form>
          </Column>
        </TabPanel>

        <TabPanel value="notifications" flex={1} gap="8">
          <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
            Notifications
          </Heading>
          <Setting
            label="Issue alerts"
            description="Email me when an issue assigned to me changes status."
          >
            <Switch
              checked={issueAlerts}
              onToggle={(checked) => setIssueAlerts(checked)}
              ariaLabel="Issue alerts"
            />
          </Setting>
          <Setting
            label="Weekly digest"
            description="A Monday summary of open issues and project activity."
          >
            <Switch
              checked={weeklyDigest}
              onToggle={(checked) => setWeeklyDigest(checked)}
              ariaLabel="Weekly digest"
            />
          </Setting>
        </TabPanel>
      </Tabs>
    </Column>
  );
}
```