```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Lumen: 16px corners on buttons, inputs, cards and menus (md, lg, xl); sm is for small inner items. */
  --radius-sm: calc(var(--radius) * 0.75);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: calc(var(--radius) * 1.5);
  --radius-3xl: calc(var(--radius) * 2);
  --radius-4xl: calc(var(--radius) * 2.5);
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 1rem;
  /* Warm sand neutrals */
  --background: oklch(0.982 0.009 85);
  --foreground: oklch(0.26 0.025 60);
  --card: oklch(0.995 0.005 85);
  --card-foreground: oklch(0.26 0.025 60);
  --popover: oklch(0.995 0.005 85);
  --popover-foreground: oklch(0.26 0.025 60);
  /* Brand: #DB2777 */
  --primary: #db2777;
  --primary-foreground: #ffffff;
  --secondary: oklch(0.945 0.02 82);
  --secondary-foreground: oklch(0.3 0.03 60);
  --muted: oklch(0.955 0.015 84);
  --muted-foreground: oklch(0.47 0.03 65);
  --accent: oklch(0.94 0.025 82);
  --accent-foreground: oklch(0.26 0.025 60);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.89 0.02 80);
  --input: oklch(0.86 0.025 80);
  --ring: #db2777;
  --chart-1: #db2777;
  --chart-2: oklch(0.65 0.12 60);
  --chart-3: oklch(0.55 0.1 30);
  --chart-4: oklch(0.75 0.12 85);
  --chart-5: oklch(0.6 0.15 350);
  --sidebar: oklch(0.96 0.017 84);
  --sidebar-foreground: oklch(0.26 0.025 60);
  --sidebar-primary: #db2777;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: oklch(0.92 0.027 82);
  --sidebar-accent-foreground: oklch(0.26 0.025 60);
  --sidebar-border: oklch(0.89 0.02 80);
  --sidebar-ring: #db2777;
}

.dark {
  --background: oklch(0.2 0.012 65);
  --foreground: oklch(0.96 0.01 85);
  --card: oklch(0.25 0.014 65);
  --card-foreground: oklch(0.96 0.01 85);
  --popover: oklch(0.25 0.014 65);
  --popover-foreground: oklch(0.96 0.01 85);
  --primary: #db2777;
  --primary-foreground: #ffffff;
  --secondary: oklch(0.3 0.016 65);
  --secondary-foreground: oklch(0.96 0.01 85);
  --muted: oklch(0.3 0.016 65);
  --muted-foreground: oklch(0.72 0.03 75);
  --accent: oklch(0.32 0.02 65);
  --accent-foreground: oklch(0.96 0.01 85);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 16%);
  --ring: #ec4899;
  --chart-1: #ec4899;
  --chart-2: oklch(0.75 0.12 70);
  --chart-3: oklch(0.7 0.1 30);
  --chart-4: oklch(0.82 0.12 85);
  --chart-5: oklch(0.7 0.15 350);
  --sidebar: oklch(0.23 0.013 65);
  --sidebar-foreground: oklch(0.96 0.01 85);
  --sidebar-primary: #db2777;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: oklch(0.3 0.018 65);
  --sidebar-accent-foreground: oklch(0.96 0.01 85);
  --sidebar-border: oklch(1 0 0 / 12%);
  --sidebar-ring: #ec4899;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  [data-slot="card-title"] {
    font-family: var(--font-heading);
  }
}

/* Airy density: generous touch targets for every control, set once at theme level. */
[data-slot="button"][data-size="default"] {
  min-height: 2.75rem;
}
[data-slot="button"][data-size="sm"] {
  min-height: 2.5rem;
}
[data-slot="button"][data-size="lg"] {
  min-height: 3rem;
}
[data-slot="button"][data-size="icon"] {
  min-width: 2.75rem;
  min-height: 2.75rem;
}
[data-slot="input"],
[data-slot="select-trigger"] {
  min-height: 3rem;
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
```

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

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

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
```

```tsx components/app-shell.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileBarChart, FolderKanban, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { initials, user } from "@/lib/data";

type NavItem = { title: string; href: string | null; icon: LucideIcon };
type NavGroup = { label: string; icon: LucideIcon; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Analytics",
    icon: BarChart3,
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      // No Reports screen exists yet in this shell, so it is shown but not linked.
      { title: "Reports", href: null, icon: FileBarChart },
    ],
  },
  {
    label: "Workspace",
    icon: FolderKanban,
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

const activeClasses =
  "h-11 text-base data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold data-[active=true]:text-sidebar-primary-foreground hover:data-[active=true]:bg-sidebar-primary hover:data-[active=true]:text-sidebar-primary-foreground";

function findCrumbs(pathname: string): { group: string; title: string } {
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, title: item.title };
    }
  }
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.href && item.href !== "/" && pathname.startsWith(item.href)) {
        return { group: group.label, title: item.title };
      }
    }
  }
  return { group: "Analytics", title: "Overview" };
}

function NavMenu() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <>
      {NAV.map((group) => (
        <SidebarGroup key={group.label} role="group" aria-label={group.label}>
          <SidebarGroupLabel className="h-9 px-3 text-xs font-semibold tracking-wide uppercase">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon;
                if (!item.href) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={`${item.title} (coming soon)`}
                        aria-disabled="true"
                        disabled
                        className={activeClasses}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="top-3">Soon</SidebarMenuBadge>
                    </SidebarMenuItem>
                  );
                }
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={activeClasses}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = findCrumbs(pathname);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" aria-label="Main navigation">
        <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md p-1 outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-xl font-bold group-data-[collapsible=icon]:hidden">
              Lumen
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <NavMenu />
        </SidebarContent>
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
          <div className="flex items-center gap-3 rounded-md p-1">
            <Avatar className="size-10">
              <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-sm group-data-[collapsible=icon]:hidden">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset id="main-content" tabIndex={-1} className="min-w-0 outline-none">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <SidebarTrigger aria-label="Toggle navigation menu" />
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb>
            <BreadcrumbList className="text-sm sm:text-base">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Lumen</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="hidden sm:inline-flex">{crumbs.group}</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{crumbs.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 p-5 sm:p-8 md:p-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import { ArrowRight, CircleDot, FolderKanban, PauseCircle, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  const stats = [
    { label: "Active projects", value: active, note: `of ${projects.length} in your workspace`, icon: Rocket },
    { label: "Open issues", value: openIssues, note: "across all projects", icon: CircleDot },
    { label: "Paused projects", value: paused, note: "waiting to restart", icon: PauseCircle },
    { label: "Busiest project", value: "APP", note: "Customer app, 31 open issues", icon: FolderKanban },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {firstName}!</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Your team has {active} active projects and {openIssues} open issues. Here is how things look today.
        </p>
        <div>
          <Button asChild size="lg">
            <Link href="/projects">
              View projects
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section aria-label="Summary" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardDescription className="text-base">{stat.label}</CardDescription>
                <CardTitle className="text-4xl tabular-nums">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{stat.note}</CardContent>
            </Card>
          );
        })}
      </section>

      <section aria-labelledby="recent-heading">
        <Card>
          <CardHeader>
            <CardTitle id="recent-heading" className="text-xl">
              Recently updated
            </CardTitle>
            <CardDescription>The projects your team touched most lately.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recent.map((project) => (
                <li key={project.key} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-sm font-bold text-secondary-foreground">
                      {project.key}
                    </span>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.issues} open issues, updated {formatDate(project.updated)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={project.status === "Active" ? "default" : "secondary"}>{project.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
```

```tsx components/projects-list.tsx
"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

function statusVariant(status: ProjectStatus): "default" | "secondary" | "outline" {
  if (status === "Active") return "default";
  if (status === "Paused") return "secondary";
  return "outline";
}

export function ProjectsList() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");

  const filtered = projects.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      p.key.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = status === "all" || p.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="project-search">Search projects</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="project-search"
              type="search"
              placeholder="Search by name or key"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-11"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:w-48">
          <Label htmlFor="project-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="project-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        Showing {filtered.length} of {projects.length} projects
      </p>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No projects match your search. Try a different name or status.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden py-2 md:flex">
            <CardContent className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-12">Key</TableHead>
                    <TableHead className="h-12">Project</TableHead>
                    <TableHead className="h-12">Status</TableHead>
                    <TableHead className="h-12 text-right">Open issues</TableHead>
                    <TableHead className="h-12 text-right">Last updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((project) => (
                    <TableRow key={project.key}>
                      <TableCell className="py-4 font-mono text-sm font-semibold">{project.key}</TableCell>
                      <TableCell className="py-4 font-medium">{project.name}</TableCell>
                      <TableCell className="py-4">
                        <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right tabular-nums">{project.issues}</TableCell>
                      <TableCell className="py-4 text-right text-muted-foreground">
                        {formatDate(project.updated)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <ul className="flex flex-col gap-4 md:hidden">
            {filtered.map((project) => (
              <li key={project.key}>
                <Card className="gap-3 py-5">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-semibold text-muted-foreground">{project.key}</p>
                        <p className="text-lg font-semibold">{project.name}</p>
                      </div>
                      <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.issues} open issues, updated {formatDate(project.updated)}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
```

```tsx app/projects/page.tsx
import { ProjectsList } from "@/components/projects-list";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every project in your workspace, with its status and open issues.
        </p>
      </header>
      <ProjectsList />
    </div>
  );
}
```

```tsx components/settings-form.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const NOTIFICATIONS = [
  { id: "digest", title: "Weekly digest", description: "A friendly summary of your team's progress every Monday." },
  { id: "mentions", title: "Mentions and replies", description: "Get an email when a teammate mentions you." },
  { id: "status", title: "Project status changes", description: "Know when a project is paused or archived." },
];

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>({
    digest: true,
    mentions: true,
    status: false,
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", { description: "Your changes are live." });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription>How you appear to your teammates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role} readOnly aria-describedby="role-help" />
            <p id="role-help" className="text-sm text-muted-foreground">
              Only another owner can change your role.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription>Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {NOTIFICATIONS.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Separator className="my-2" />}
              <div className="flex items-center justify-between gap-4 py-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={item.id} className="text-base">
                    {item.title}
                  </Label>
                  <p id={`${item.id}-desc`} className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  id={item.id}
                  aria-describedby={`${item.id}-desc`}
                  checked={prefs[item.id]}
                  onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [item.id]: checked }))}
                  className="scale-125"
                />
              </div>
            </React.Fragment>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button type="submit" size="lg">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```

```tsx app/settings/page.tsx
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Keep your profile up to date and pick the updates you want to hear about.
        </p>
      </header>
      <SettingsForm />
    </div>
  );
}
```
