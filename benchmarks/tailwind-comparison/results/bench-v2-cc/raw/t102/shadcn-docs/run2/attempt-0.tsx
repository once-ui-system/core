```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Lumen: every corner is 16px (buttons, inputs, cards, menus) */
  --radius-sm: 0.625rem;
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: calc(var(--radius) * 1.5);
  --radius-3xl: calc(var(--radius) * 2);
  --radius-4xl: calc(var(--radius) * 2.5);

  /* Lumen: type */
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
  --foreground: oklch(0.24 0.02 60);
  --card: oklch(0.995 0.004 85);
  --card-foreground: oklch(0.24 0.02 60);
  --popover: oklch(0.995 0.004 85);
  --popover-foreground: oklch(0.24 0.02 60);

  /* Brand #DB2777 */
  --primary: oklch(0.592 0.249 0.584);
  --primary-foreground: oklch(0.985 0.005 85);

  --secondary: oklch(0.94 0.02 85);
  --secondary-foreground: oklch(0.3 0.025 60);
  --muted: oklch(0.955 0.015 85);
  --muted-foreground: oklch(0.47 0.025 65);
  --accent: oklch(0.93 0.03 85);
  --accent-foreground: oklch(0.27 0.025 60);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.89 0.02 82);
  --input: oklch(0.84 0.025 82);
  --ring: oklch(0.592 0.249 0.584);

  --chart-1: oklch(0.592 0.249 0.584);
  --chart-2: oklch(0.72 0.15 60);
  --chart-3: oklch(0.6 0.12 190);
  --chart-4: oklch(0.7 0.17 130);
  --chart-5: oklch(0.55 0.2 300);

  --sidebar: oklch(0.962 0.02 85);
  --sidebar-foreground: oklch(0.24 0.02 60);
  --sidebar-primary: oklch(0.592 0.249 0.584);
  --sidebar-primary-foreground: oklch(0.985 0.005 85);
  --sidebar-accent: oklch(0.925 0.03 85);
  --sidebar-accent-foreground: oklch(0.27 0.025 60);
  --sidebar-border: oklch(0.88 0.022 82);
  --sidebar-ring: oklch(0.592 0.249 0.584);
}

.dark {
  --background: oklch(0.2 0.012 65);
  --foreground: oklch(0.96 0.01 85);
  --card: oklch(0.25 0.014 65);
  --card-foreground: oklch(0.96 0.01 85);
  --popover: oklch(0.25 0.014 65);
  --popover-foreground: oklch(0.96 0.01 85);
  --primary: oklch(0.68 0.22 3);
  --primary-foreground: oklch(0.18 0.02 60);
  --secondary: oklch(0.3 0.016 65);
  --secondary-foreground: oklch(0.96 0.01 85);
  --muted: oklch(0.3 0.016 65);
  --muted-foreground: oklch(0.74 0.02 80);
  --accent: oklch(0.32 0.018 65);
  --accent-foreground: oklch(0.96 0.01 85);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0.01 85 / 12%);
  --input: oklch(1 0.01 85 / 18%);
  --ring: oklch(0.68 0.22 3);
  --sidebar: oklch(0.23 0.013 65);
  --sidebar-foreground: oklch(0.96 0.01 85);
  --sidebar-primary: oklch(0.68 0.22 3);
  --sidebar-primary-foreground: oklch(0.18 0.02 60);
  --sidebar-accent: oklch(0.3 0.016 65);
  --sidebar-accent-foreground: oklch(0.96 0.01 85);
  --sidebar-border: oklch(1 0.01 85 / 12%);
  --sidebar-ring: oklch(0.68 0.22 3);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  [data-slot="card-title"],
  [data-slot="sheet-title"],
  [data-slot="dialog-title"] {
    font-family: var(--font-heading);
  }
}

/* The current navigation item carries the brand colour. */
[data-sidebar="menu-button"][data-active="true"],
[data-sidebar="menu-sub-button"][data-active="true"] {
  background-color: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
  font-weight: 600;
}
```

```ts lib/data.ts
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

export const reports = [
  {
    title: "Weekly issue flow",
    description: "Issues opened and closed across all active projects, week by week.",
    cadence: "Every Monday",
  },
  {
    title: "Project health",
    description: "Open issue counts and last activity for every project in the workspace.",
    cadence: "Every Friday",
  },
  {
    title: "Team activity",
    description: "Who shipped what this month, with a friendly shout-out for big wins.",
    cadence: "Monthly",
  },
];

export function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/nav.ts
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
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

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: BarChart3 },
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

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCurrent(pathname: string): { group: string; title: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) {
        return { group: group.label, title: item.title };
      }
    }
  }
  return { group: "Workspace", title: "Lumen" };
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import type { CSSProperties, ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
          "--sidebar-width-icon": "4.5rem",
        } as CSSProperties
      }
    >
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div id="main-content" className="mx-auto w-full max-w-6xl flex-1 p-5 sm:p-8 lg:p-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

```tsx components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { isActive, navGroups } from "@/lib/nav";
import { user } from "@/lib/data";

export function AppSidebar() {
  const pathname = usePathname();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Lumen"
              className="h-14 group-data-[collapsible=icon]:size-14!"
            >
              <Link href="/" aria-label="Lumen home">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="font-heading text-lg font-semibold">Lumen</span>
                  <span className="truncate text-xs text-muted-foreground">Acme Labs</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="gap-1 py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-3">
            <SidebarGroupLabel className="mb-1 h-9 text-xs font-semibold tracking-wide uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu aria-label={group.label}>
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="h-12 gap-3 px-3 text-base group-data-[collapsible=icon]:size-12! [&>svg]:size-5"
                      >
                        <Link href={item.href} aria-current={active ? "page" : undefined}>
                          <item.icon aria-hidden="true" />
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
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip={user.name}
              className="h-14 group-data-[collapsible=icon]:size-14!"
            >
              <Link href="/settings">
                <Avatar className="size-10 rounded-full">
                  <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </span>
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

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { findCurrent } from "@/lib/nav";

export function AppHeader() {
  const pathname = usePathname();
  const current = findCurrent(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="size-11" />
      <Separator orientation="vertical" className="h-6" />
      <Breadcrumb>
        <BreadcrumbList className="text-sm sm:gap-2.5">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="rounded-sm px-1 text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                Lumen
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{current.group}</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">{current.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
```

```tsx components/page-header.tsx
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import { ArrowRight, Bug, FolderCheck, PauseCircle, Clock } from "lucide-react";

import { PageHeader } from "@/components/page-header";
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

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const stats = [
    { label: "Open issues", value: String(open), hint: "Across all projects", icon: Bug },
    { label: "Active projects", value: String(active), hint: "Moving along nicely", icon: FolderCheck },
    { label: "Paused projects", value: String(paused), hint: "Waiting for a restart", icon: PauseCircle },
    { label: "Latest update", value: formatDate(latest.updated), hint: latest.name, icon: Clock },
  ];

  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        description="Here is how things look across your workspace today. Your team has been busy."
      >
        <Button asChild className="h-12 px-6 text-base">
          <Link href="/projects">
            View projects
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </PageHeader>

      <section aria-labelledby="summary-heading" className="mb-10">
        <h2 id="summary-heading" className="sr-only">
          Summary
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="gap-4 py-7">
              <CardHeader>
                <CardDescription className="flex items-center gap-2 text-sm font-medium">
                  <stat.icon className="size-4 text-primary" aria-hidden="true" />
                  {stat.label}
                </CardDescription>
                <CardTitle className="text-3xl font-bold tracking-tight">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{stat.hint}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <Card className="py-7">
          <CardHeader>
            <CardTitle id="recent-heading" className="text-xl">
              Recently updated
            </CardTitle>
            <CardDescription>The three projects with the freshest activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recent.map((project) => (
                <li
                  key={project.key}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
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
                  <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link
                href="/projects"
                className="font-medium text-primary underline underline-offset-4 hover:no-underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
              >
                See every project
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
```

```tsx components/projects-table.tsx
"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, type Project, type ProjectStatus } from "@/lib/data";

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) =>
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q),
  );

  return (
    <Card className="py-6">
      <CardContent className="space-y-5">
        <div className="relative max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
            className="h-12 pl-11 text-base"
          />
        </div>
        <Table>
          <caption className="sr-only">Projects in the Acme Labs workspace</caption>
          <TableHeader>
            <TableRow>
              <TableHead className="h-12">Key</TableHead>
              <TableHead className="h-12">Name</TableHead>
              <TableHead className="h-12">Status</TableHead>
              <TableHead className="h-12 text-right">Open issues</TableHead>
              <TableHead className="h-12 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No projects match &ldquo;{query}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="py-4 font-mono text-sm font-semibold">
                    {project.key}
                  </TableCell>
                  <TableCell className="py-4 font-medium">{project.name}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right tabular-nums">{project.issues}</TableCell>
                  <TableCell className="py-4 text-right whitespace-nowrap text-muted-foreground">
                    {formatDate(project.updated)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

```tsx app/projects/page.tsx
import { PageHeader } from "@/components/page-header";
import { ProjectsTable } from "@/components/projects-table";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in your workspace, with its status and how many issues are still open."
      />
      <ProjectsTable projects={projects} />
    </>
  );
}
```

```tsx app/reports/page.tsx
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Friendly summaries that land in your inbox, so nobody has to go hunting for numbers."
      />
      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <li key={report.title}>
            <Card className="h-full py-7">
              <CardHeader>
                <CardTitle className="text-xl">{report.title}</CardTitle>
                <CardDescription>{report.cadence}</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground">{report.description}</CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { projects, user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [defaultProject, setDefaultProject] = useState("APP");
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [product, setProduct] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your changes are live. Nice work, " + name.split(" ")[0] + "!",
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <Card className="py-7">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription>How your teammates see you in Lumen.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm">
              Full name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-12 text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-12 text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-sm">
              Role
            </Label>
            <Input id="role" value={user.role} readOnly className="h-12 text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="default-project" className="text-sm">
              Default project
            </Label>
            <Select value={defaultProject} onValueChange={setDefaultProject}>
              <SelectTrigger id="default-project" className="h-12 w-full text-base">
                <SelectValue placeholder="Pick a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.key} value={p.key} className="py-2.5">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="py-7">
        <CardHeader>
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription>Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {[
            { id: "weekly", label: "Weekly summary", hint: "A cheerful recap every Monday morning.", checked: weekly, set: setWeekly },
            { id: "mentions", label: "Mentions and assignments", hint: "Hear straight away when someone needs you.", checked: mentions, set: setMentions },
            { id: "product", label: "Product news", hint: "New Lumen features and tips.", checked: product, set: setProduct },
          ].map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-4">
              <div className="grid gap-1">
                <Label htmlFor={row.id} className="text-base">
                  {row.label}
                </Label>
                <p id={`${row.id}-hint`} className="text-sm text-muted-foreground">
                  {row.hint}
                </p>
              </div>
              <Switch
                id={row.id}
                checked={row.checked}
                onCheckedChange={row.set}
                aria-describedby={`${row.id}-hint`}
                className="shrink-0 scale-125"
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" className="h-12 px-8 text-base">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```

```tsx app/settings/page.tsx
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Make Lumen feel like home: update your profile and pick how we keep in touch."
      />
      <SettingsForm />
    </>
  );
}
```
