Now I'll write the files.

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

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

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export type NavItem = {
  title: string;
  /** Route to navigate to. Items without an href are not available yet. */
  href?: string;
  icon: "overview" | "reports" | "projects" | "settings";
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

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

export type Crumb = { label: string; href?: string };

export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }];
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }];
  }
  return [{ label: "Analytics" }, { label: "Overview" }];
}
```

```tsx components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  FolderKanban,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, navGroups, projects, user, type NavItem } from "@/lib/data";

const icons: Record<NavItem["icon"], LucideIcon> = {
  overview: BarChart3,
  reports: FileText,
  projects: FolderKanban,
  settings: Settings,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const activeProjects = projects.filter((p) => p.status === "Active").length;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Sparkles className="size-4" aria-hidden="true" />
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
        <nav aria-label="Main" className="flex flex-col gap-2">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = icons[item.icon];
                    const href = item.href;
                    if (!href) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            disabled
                            aria-disabled="true"
                            tooltip={`${item.title} (coming soon)`}
                          >
                            <Icon aria-hidden="true" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                          <SidebarMenuBadge>Soon</SidebarMenuBadge>
                        </SidebarMenuItem>
                      );
                    }
                    const active = isActive(pathname, href);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                        >
                          <Link
                            href={href}
                            aria-current={active ? "page" : undefined}
                            onClick={() => setOpenMobile(false)}
                          >
                            <Icon aria-hidden="true" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.icon === "projects" ? (
                          <SidebarMenuBadge>{activeProjects}</SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={user.name} asChild>
              <Link href="/settings" onClick={() => setOpenMobile(false)}>
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

```tsx components/app-shell.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getBreadcrumbs } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset id="main-content" tabIndex={-1} className="min-w-0 outline-none">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1 size-8" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label}>
                    <BreadcrumbItem className={last ? undefined : "hidden sm:inline-flex"}>
                      {last ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                    </BreadcrumbItem>
                    {last ? null : (
                      <BreadcrumbSeparator className="hidden sm:block" />
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

The mobile menu button is `SidebarTrigger`, which on phones toggles the drawer (a Sheet). Its accessible label is "Toggle Sidebar", which is fine.

Next, the dashboard content and page.

```tsx components/dashboard.tsx
import { AlertCircle, FolderKanban, Pause, Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export function Dashboard() {
  const firstName = user.name.split(" ")[0];
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  const stats = [
    {
      title: "Open issues",
      value: totalIssues,
      note: "Across all projects",
      icon: AlertCircle,
    },
    {
      title: "Active projects",
      value: active,
      note: "Currently in progress",
      icon: Activity,
    },
    {
      title: "Paused projects",
      value: paused,
      note: "Waiting to resume",
      icon: Pause,
    },
    {
      title: "Total projects",
      value: projects.length,
      note: "Including archived",
      icon: FolderKanban,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here is what is happening across your workspace today.
        </p>
      </div>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="gap-3 py-5">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardDescription>{stat.title}</CardDescription>
              <stat.icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recently updated</CardTitle>
          <CardDescription>The projects your team touched most recently.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {recent.map((project) => (
              <li
                key={project.key}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium">
                    {project.key}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(project.updated)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {project.issues} {project.issues === 1 ? "issue" : "issues"}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
```

```tsx app/(app)/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/(app)/projects/page.tsx
import type { Metadata } from "next";

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

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          {projects.length} projects in the Acme Labs workspace.
        </p>
      </div>

      <Card className="py-2">
        <CardContent className="px-2 sm:px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Issues</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="font-mono text-xs font-medium">
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
                  <TableCell className="text-right text-muted-foreground">
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
    </div>
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

import * as React from "react";
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = React.useState<string>(user.name);
  const [email, setEmail] = React.useState<string>(user.email);
  const [weekly, setWeekly] = React.useState(true);
  const [assigned, setAssigned] = React.useState(true);
  const [releases, setReleases] = React.useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your profile and notification preferences were updated.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This information is visible to your teammates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FieldDescription>
                We send account and billing notices to this address.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <div>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="weekly">Weekly digest</FieldLabel>
                <FieldDescription>
                  A Monday summary of issues opened and closed.
                </FieldDescription>
              </FieldContent>
              <Switch id="weekly" checked={weekly} onCheckedChange={setWeekly} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="assigned">Issue assignments</FieldLabel>
                <FieldDescription>
                  Get an email when an issue is assigned to you.
                </FieldDescription>
              </FieldContent>
              <Switch id="assigned" checked={assigned} onCheckedChange={setAssigned} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="releases">Release announcements</FieldLabel>
                <FieldDescription>
                  Product news and new Lumen features.
                </FieldDescription>
              </FieldContent>
              <Switch id="releases" checked={releases} onCheckedChange={setReleases} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```