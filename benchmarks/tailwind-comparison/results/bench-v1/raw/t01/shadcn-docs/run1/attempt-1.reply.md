The docs confirm `Settings2`, `PieChart`, `Frame`, `Map`, `BookOpen`, `Command` and `ChevronRight` work. The most plausible server-start failure is still the dashboard's server component `components/dashboard-content.tsx` importing icons and `lib/data.ts` importing lucide at module level, so I'll remove lucide from `lib/data.ts` and use only the docs-confirmed icon names everywhere.

One more risk is the "Reports" item. It has no route, so I'll make it a real link to a nested position inside the existing routes. Since only three routes exist, I'll nest "Reports" as a collapsible-free disabled item, as before. The nav also needs nested groups, so each group will be a collapsible `SidebarGroup`.

```ts lib/data.ts
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
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type NavIconName = "overview" | "reports" | "projects" | "settings";

export interface NavItem {
  title: string;
  /** Route the item links to. Items without an href are not available yet. */
  href?: string;
  icon: NavIconName;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: "overview" },
      { title: "Reports", icon: "reports" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", href: "/projects", icon: "projects" },
      { title: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export interface Crumb {
  label: string;
}

/** Breadcrumb trail for each route. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }];
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }];
  }
  return [{ label: "Analytics" }, { label: "Overview" }];
}

export function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
```

```tsx components/nav-icon.tsx
import { BookOpen, Command, Frame, PieChart, Settings2 } from "lucide-react";
import type { ComponentProps } from "react";

import type { NavIconName } from "@/lib/data";

type IconProps = ComponentProps<typeof Command>;

export function NavIcon({ name, ...props }: { name: NavIconName } & IconProps) {
  switch (name) {
    case "overview":
      return <PieChart {...props} />;
    case "reports":
      return <BookOpen {...props} />;
    case "projects":
      return <Frame {...props} />;
    case "settings":
      return <Settings2 {...props} />;
  }
}

export function BrandIcon(props: IconProps) {
  return <Command {...props} />;
}
```

```tsx components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { BrandIcon, NavIcon } from "@/components/nav-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { isRouteActive, navGroups, user } from "@/lib/data";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/" onClick={closeMobile}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <BrandIcon className="size-4" aria-hidden="true" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Lumen</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Acme Labs
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => {
          const groupActive = group.items.some(
            (item) => item.href && isRouteActive(pathname, item.href),
          );
          return (
            <Collapsible
              key={group.label}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger>
                    {group.label}
                    <ChevronRight
                      aria-hidden="true"
                      className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
                    />
                    {groupActive && <span className="sr-only">(current section)</span>}
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        if (!item.href) {
                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                disabled
                                aria-disabled="true"
                                tooltip={`${item.title} (coming soon)`}
                              >
                                <NavIcon name={item.icon} aria-hidden="true" />
                                <span>{item.title}</span>
                              </SidebarMenuButton>
                              <SidebarMenuBadge>Soon</SidebarMenuBadge>
                            </SidebarMenuItem>
                          );
                        }
                        const active = isRouteActive(pathname, item.href);
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
                                onClick={closeMobile}
                              >
                                <NavIcon name={item.icon} aria-hidden="true" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={user.name}>
              <Link href="/settings" onClick={closeMobile}>
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {user.email}
                  </span>
                </div>
              </Link>
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

import { Fragment } from "react";
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
import { getBreadcrumbs } from "@/lib/data";

export function AppHeader() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1 size-8" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <Fragment key={crumb.label}>
                <BreadcrumbItem
                  className={isLast ? undefined : "hidden sm:inline-flex"}
                >
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="hidden sm:block" />}
              </Fragment>
            );
          })}
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
          className="flex-1 p-4 outline-none md:p-6"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell";
import { DashboardContent } from "@/components/dashboard-content";

export default function Page() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}
```

```tsx components/dashboard-content.tsx
import Link from "next/link";
import { ChevronRight, Command, Frame, Map, PieChart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export function DashboardContent() {
  const active = projects.filter((p) => p.status === "Active");
  const paused = projects.filter((p) => p.status === "Paused");
  const archived = projects.filter((p) => p.status === "Archived");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  const summary = [
    {
      title: "Open issues",
      value: String(openIssues),
      hint: `Across ${projects.length} projects`,
      icon: PieChart,
    },
    {
      title: "Active projects",
      value: String(active.length),
      hint: `${paused.length} paused, ${archived.length} archived`,
      icon: Frame,
    },
    {
      title: "Busiest project",
      value: busiest.key,
      hint: `${busiest.name}, ${busiest.issues} open issues`,
      icon: Map,
    },
    {
      title: "Your role",
      value: user.role,
      hint: `Signed in as ${user.email}`,
      icon: Command,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here is what is happening across your projects today.
        </p>
      </div>

      <section
        aria-label="Summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="gap-3 py-5">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardDescription>{item.title}</CardDescription>
                <Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tabular-nums">
                  {item.value}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recently updated</CardTitle>
          <CardDescription>
            The projects your team touched most recently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recent.map((project) => (
              <li
                key={project.key}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {project.key}
                  </Badge>
                  <span className="truncate font-medium">{project.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {project.issues} open · updated {formatDate(project.updated)}
                </div>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/projects">
              View all projects
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

```tsx app/(app)/layout.tsx
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/(app)/projects/page.tsx
import type { Metadata } from "next";

import { ProjectsTable } from "@/components/projects-table";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Every project in the Acme Labs workspace and its open issues.
        </p>
      </div>
      <ProjectsTable />
    </div>
  );
}
```

```tsx components/projects-table.tsx
"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export function ProjectsTable() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Card className="gap-4 py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name, key or status"
          aria-label="Filter projects"
          className="max-w-sm"
        />

        <Table>
          <TableCaption className="sr-only">
            Projects with status, open issues and last update date
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Key</TableHead>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="text-right">
                Issues
              </TableHead>
              <TableHead scope="col" className="text-right">
                Updated
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.key}>
                <TableCell className="font-mono text-xs">{project.key}</TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[project.status]}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {project.issues}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  <time dateTime={project.updated}>
                    {formatDate(project.updated)}
                  </time>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No projects match “{query}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <p className="sr-only" role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"} shown
        </p>
      </CardContent>
    </Card>
  );
}
```

```tsx app/(app)/settings/page.tsx
import type { Metadata } from "next";

import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and how Lumen keeps you informed.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
```

```tsx components/settings-form.tsx
"use client";

import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: "assigned",
    title: "Issue assigned to me",
    description: "Get an email when a teammate assigns an issue to you.",
    defaultChecked: true,
  },
  {
    id: "digest",
    title: "Weekly analytics digest",
    description: "A Monday summary of usage trends across your projects.",
    defaultChecked: true,
  },
  {
    id: "mentions",
    title: "Mentions and comments",
    description: "Be notified when someone mentions you in a thread.",
    defaultChecked: false,
  },
];

function defaultPrefs(): Record<string, boolean> {
  return Object.fromEntries(
    notificationSettings.map((s) => [s.id, s.defaultChecked]),
  );
}

export function SettingsForm() {
  const uid = useId();
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(defaultPrefs);

  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const roleId = `${uid}-role`;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your profile and notification preferences were updated.",
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your name and email are visible to your team.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={nameId}>Full name</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor={roleId}>Role</Label>
            <div className="flex items-center gap-2">
              <Input id={roleId} value={user.role} readOnly className="max-w-xs" />
              <Badge variant="secondary">Workspace owner</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose which updates reach your inbox.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {notificationSettings.map((setting) => {
              const switchId = `${uid}-${setting.id}`;
              const descId = `${switchId}-desc`;
              return (
                <li
                  key={setting.id}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={switchId}>{setting.title}</Label>
                    <p id={descId} className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    id={switchId}
                    aria-describedby={descId}
                    checked={prefs[setting.id]}
                    onCheckedChange={(checked) =>
                      setPrefs((prev) => ({ ...prev, [setting.id]: checked }))
                    }
                  />
                </li>
              );
            })}
          </ul>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setPrefs(defaultPrefs());
            }}
          >
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```