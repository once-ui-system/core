A few notes from the installed sidebar:

- On mobile, `Sidebar` renders a `Sheet`, and it has no built-in menu button, so the header's `SidebarTrigger` (which toggles the mobile drawer) serves as the menu button.
- The mobile sheet needs to close after navigation; I'll call `setOpenMobile(false)` on link click.
- The sidebar state cookie is written client-side only, so no hydration issues.

Now the files:

**Data and nav config**

**Shell:** sidebar, header with breadcrumb, content wrapper.

**Pages:** all three wrap in `AppShell`.

```tsx lib/data.ts
export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const projects: Project[] = [
  {
    key: "WEB",
    name: "Marketing site",
    status: "Active",
    issues: 12,
    updated: "2026-10-12",
  },
  {
    key: "APP",
    name: "Customer app",
    status: "Active",
    issues: 31,
    updated: "2026-10-14",
  },
  {
    key: "API",
    name: "Public API",
    status: "Active",
    issues: 9,
    updated: "2026-10-09",
  },
  {
    key: "MOB",
    name: "Mobile beta",
    status: "Paused",
    issues: 4,
    updated: "2026-09-28",
  },
  {
    key: "OPS",
    name: "Internal tools",
    status: "Archived",
    issues: 0,
    updated: "2026-08-30",
  },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Deterministic, timezone-independent date formatting (avoids hydration mismatches). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const totalOpenIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeProjectCount = projects.filter(
  (p) => p.status === "Active",
).length;

export const recentActivity = [
  {
    id: "a1",
    text: "APP-214 moved to In review",
    project: "Customer app",
    when: "2 hours ago",
  },
  {
    id: "a2",
    text: "WEB-87 closed by Daniel Reyes",
    project: "Marketing site",
    when: "Yesterday",
  },
  {
    id: "a3",
    text: "API-41 assigned to you",
    project: "Public API",
    when: "Oct 9",
  },
] as const;
```

```tsx lib/navigation.ts
import {
  BarChart3,
  FileText,
  FolderKanban,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * "Overview" and "Reports" live in the Analytics group. The dashboard at `/`
 * is the Overview screen; Reports has no dedicated screen in this shell, so it
 * resolves to the dashboard route as well but is never highlighted over it.
 */
export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: BarChart3 },
      { title: "Reports", href: "/#reports", icon: FileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export interface Crumb {
  group: string;
  title: string;
}

export function getCrumb(pathname: string): Crumb {
  if (pathname.startsWith("/projects"))
    return { group: "Workspace", title: "Projects" };
  if (pathname.startsWith("/settings"))
    return { group: "Workspace", title: "Settings" };
  return { group: "Analytics", title: "Overview" };
}

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.title === "Reports") return false;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
```

```tsx components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, user } from "@/lib/data";
import { isActive, navGroups } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Sparkles className="size-4" aria-hidden="true" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Lumen</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Acme Labs workspace
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu aria-label={group.label}>
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={user.name}>
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown
                className="ml-auto size-4"
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

```tsx components/app-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCrumb } from "@/lib/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const crumb = getCrumb(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger
        className="-ml-1 size-9 md:size-7"
        aria-label="Toggle navigation menu"
      />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:inline-flex">
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Lumen
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="hidden sm:inline-flex">
            {crumb.group}
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <div
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 outline-none sm:p-6 lg:p-8"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

```tsx components/page-heading.tsx
import type { ReactNode } from "react";

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
```

```tsx app/page.tsx
import { Activity, AlertCircle, FolderKanban, Users } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  activeProjectCount,
  projects,
  recentActivity,
  totalOpenIssues,
  user,
} from "@/lib/data";

const summaries = [
  {
    title: "Open issues",
    value: String(totalOpenIssues),
    note: "Across all projects",
    icon: AlertCircle,
  },
  {
    title: "Active projects",
    value: String(activeProjectCount),
    note: `${projects.length} projects in total`,
    icon: FolderKanban,
  },
  {
    title: "Weekly active users",
    value: "1,284",
    note: "+6.2% from last week",
    icon: Users,
  },
  {
    title: "Events tracked",
    value: "48.3k",
    note: "In the last 7 days",
    icon: Activity,
  },
];

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];

  return (
    <AppShell>
      <PageHeading
        title={`Welcome back, ${firstName}`}
        description="Here is what is happening across your projects today."
      />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => (
          <Card key={item.title} className="gap-3">
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                <span>{item.title}</span>
                <item.icon className="size-4" aria-hidden="true" />
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {item.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        id="reports"
        aria-labelledby="activity-heading"
        className="mt-6 scroll-mt-20"
      >
        <Card>
          <CardHeader>
            <CardTitle id="activity-heading">Recent activity</CardTitle>
            <CardDescription>
              Latest changes to issues you follow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentActivity.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{entry.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.project}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.when}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> =
  {
    Active: "default",
    Paused: "secondary",
    Archived: "outline",
  };

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      {/* Phones: stacked cards */}
      <ul className="grid gap-3 md:hidden" aria-label="Projects">
        {projects.map((project) => (
          <li key={project.key}>
            <Card className="gap-3 py-4">
              <CardContent className="flex flex-col gap-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {project.key}
                    </p>
                  </div>
                  <Badge variant={statusVariant[project.status]}>
                    {project.status}
                  </Badge>
                </div>
                <dl className="flex justify-between text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Open issues
                    </dt>
                    <dd className="tabular-nums">{project.issues}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-xs text-muted-foreground">Updated</dt>
                    <dd>
                      <time dateTime={project.updated}>
                        {formatDate(project.updated)}
                      </time>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {/* Tablet and up: table */}
      <Card className="hidden py-2 md:block">
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Key</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Open issues</TableHead>
                <TableHead className="px-4 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="px-4 font-mono text-xs">
                    {project.key}
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[project.status]}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {project.issues}
                  </TableCell>
                  <TableCell className="px-4 text-right text-muted-foreground">
                    <time dateTime={project.updated}>
                      {formatDate(project.updated)}
                    </time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Settings"
        description="Manage your profile and how Lumen notifies you."
      />
      <SettingsForm />
    </AppShell>
  );
}
```

```tsx components/settings-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const notificationOptions = [
  {
    id: "notify-assigned",
    label: "Issue assigned to me",
    description: "Email me when someone assigns an issue to me.",
    defaultChecked: true,
  },
  {
    id: "notify-digest",
    label: "Weekly digest",
    description: "A Monday summary of activity across your projects.",
    defaultChecked: true,
  },
  {
    id: "notify-product",
    label: "Product updates",
    description: "News about new Lumen features.",
    defaultChecked: false,
  },
];

export function SettingsForm() {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your name and email are visible to teammates in the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-role">Role</Label>
            <Input id="profile-role" value={user.role} readOnly disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose which emails you receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {notificationOptions.map((option) => (
              <li
                key={option.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Label htmlFor={option.id}>{option.label}</Label>
                  <p
                    id={`${option.id}-desc`}
                    className="mt-1.5 text-sm text-muted-foreground"
                  >
                    {option.description}
                  </p>
                </div>
                <Switch
                  id={option.id}
                  defaultChecked={option.defaultChecked}
                  aria-describedby={`${option.id}-desc`}
                />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```