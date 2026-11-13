```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Lumen: every radius token resolves to the single 2px brand radius. */
  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);
  --radius-3xl: var(--radius);
  --radius-4xl: var(--radius);

  /* Lumen type: serif headings, system sans body. */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-heading: Georgia, "Times New Roman", serif;

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
  --radius: 2px;
  /* Cool slate neutrals */
  --background: oklch(1 0 0);
  --foreground: oklch(0.208 0.042 265.755);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.208 0.042 265.755);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.208 0.042 265.755);
  /* Brand #0F766E */
  --primary: oklch(0.511 0.096 186.391);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.968 0.007 247.896);
  --secondary-foreground: oklch(0.208 0.042 265.755);
  --muted: oklch(0.968 0.007 247.896);
  --muted-foreground: oklch(0.446 0.043 257.281);
  --accent: oklch(0.968 0.007 247.896);
  --accent-foreground: oklch(0.208 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.929 0.013 255.508);
  --input: oklch(0.869 0.022 252.894);
  --ring: oklch(0.511 0.096 186.391);
  --chart-1: oklch(0.511 0.096 186.391);
  --chart-2: oklch(0.704 0.14 182.503);
  --chart-3: oklch(0.554 0.046 257.417);
  --chart-4: oklch(0.666 0.179 58.318);
  --chart-5: oklch(0.704 0.04 256.788);
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.208 0.042 265.755);
  --sidebar-primary: oklch(0.511 0.096 186.391);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.968 0.007 247.896);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: oklch(0.511 0.096 186.391);
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.208 0.042 265.755);
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.208 0.042 265.755);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.704 0.14 182.503);
  --primary-foreground: oklch(0.129 0.042 264.695);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.984 0.003 247.858);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.704 0.14 182.503);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.704 0.14 182.503);
  --sidebar-primary-foreground: oklch(0.129 0.042 264.695);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.704 0.14 182.503);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    color-scheme: light;
  }
  body {
    @apply bg-background text-foreground text-sm;
  }
  h1,
  h2,
  h3,
  h4,
  [data-slot="card-title"],
  [data-slot="sheet-title"],
  [data-slot="dialog-title"] {
    font-family: var(--font-heading);
  }
  h1,
  h2,
  h3,
  h4 {
    @apply tracking-tight;
  }
}

/*
 * Lumen density (compact). Unlayered on purpose: it sits above the utility
 * classes baked into the shadcn components, so every screen gets the same
 * tight rows and small controls without per-element overrides.
 */
[data-slot="button"][data-size="default"] {
  height: 2rem;
  padding-inline: 0.75rem;
}
[data-slot="button"][data-size="sm"] {
  height: 1.75rem;
  padding-inline: 0.625rem;
}
[data-slot="button"][data-size="icon"] {
  width: 2rem;
  height: 2rem;
}
[data-slot="button"][data-size="icon-sm"] {
  width: 1.75rem;
  height: 1.75rem;
}
[data-slot="input"] {
  height: 2rem;
  padding-block: 0.125rem;
}
[data-slot="card"] {
  gap: 0.75rem;
  padding-block: 0.875rem;
  box-shadow: none;
}
[data-slot="card-header"],
[data-slot="card-content"],
[data-slot="card-footer"] {
  padding-inline: 1rem;
}
[data-slot="table"] {
  font-size: 0.8125rem;
}
[data-slot="table-head"] {
  height: 2rem;
  padding-inline: 0.75rem;
}
[data-slot="table-cell"] {
  padding: 0.375rem 0.75rem;
}

/* Current navigation item uses the brand colour. */
[data-slot="sidebar-menu-button"][data-active="true"] {
  background-color: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
}
[data-slot="sidebar-menu-button"][data-active="true"]:hover {
  background-color: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
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

export const workspace = { name: "Acme Labs" };

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
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeCount = projects.filter((p) => p.status === "Active").length;
export const pausedCount = projects.filter((p) => p.status === "Paused").length;
```

```ts lib/nav.ts
import {
  ChartColumn,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: ChartColumn },
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

export const fallbackIcon = FileText;

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCurrent(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActivePath(pathname, item.href)) return { group, item };
    }
  }
  return null;
}
```

```tsx components/app-shell.tsx
"use client";

import * as React from "react";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "14rem",
          "--sidebar-width-icon": "2.75rem",
        } as React.CSSProperties
      }
    >
      <a
        href="#content"
        className="sr-only z-50 rounded-sm bg-primary px-3 py-1.5 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <div id="content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 p-4 outline-none md:p-5">
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
import { Sun } from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import { user } from "@/lib/data";
import { isActivePath, navGroups } from "@/lib/nav";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/"
          aria-label="Lumen home"
          onClick={() => setOpenMobile(false)}
          className="flex h-8 items-center gap-2 rounded-sm px-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Sun className="size-4" aria-hidden="true" />
          </span>
          <span className="font-heading text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Lumen
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label} className="py-1">
              <SidebarGroupLabel className="h-7">{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          className="h-7"
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
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-sm p-1">
          <Avatar className="size-7">
            <AvatarFallback className="bg-secondary text-xs font-medium">MO</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-xs leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-muted-foreground">
              {user.role} · {user.email}
            </span>
          </div>
        </div>
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
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { findCurrent } from "@/lib/nav";

export function AppHeader() {
  const pathname = usePathname();
  const current = findCurrent(pathname);
  const { setOpenMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-10 shrink-0 items-center gap-2 border-b bg-background px-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
        onClick={() => setOpenMobile(true)}
      >
        <Menu aria-hidden="true" />
      </Button>
      <SidebarTrigger className="hidden md:inline-flex" />
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList className="gap-1.5 text-xs sm:gap-1.5">
          <BreadcrumbItem>Lumen</BreadcrumbItem>
          {current && (
            <Fragment>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{current.group.label}</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{current.item.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </Fragment>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
```

```tsx components/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/data";

const dot: Record<ProjectStatus, string> = {
  Active: "bg-primary",
  Paused: "bg-chart-4",
  Archived: "bg-muted-foreground",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span className={`size-1.5 rounded-full ${dot[status]}`} aria-hidden="true" />
      {status}
    </Badge>
  );
}
```

```tsx components/page-heading.tsx
export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  activeCount,
  formatDate,
  pausedCount,
  projects,
  totalIssues,
  user,
  workspace,
} from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
  const summary = [
    { label: "Active projects", value: String(activeCount), note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: String(totalIssues), note: "across all projects" },
    { label: "Paused projects", value: String(pausedCount), note: "Mobile beta" },
    { label: "Last activity", value: formatDate(latest[0].updated), note: latest[0].name },
  ];

  return (
    <div>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`${workspace.name} has ${activeCount} active projects and ${totalIssues} open issues.`}
      />

      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{item.note}</CardContent>
          </Card>
        ))}
      </section>

      <Card className="mt-3">
        <CardHeader>
          <CardTitle className="text-base">Recently updated</CardTitle>
          <CardDescription>
            The latest changes across your projects.{" "}
            <Link href="/projects" className="text-primary underline underline-offset-4 hover:no-underline">
              View all projects
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {latest.slice(0, 3).map((p) => (
              <li key={p.key} className="flex items-center justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">{p.key}</span>{" "}
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={p.status} />
                  <span className="hidden w-24 text-right text-xs text-muted-foreground tabular-nums sm:inline">
                    {formatDate(p.updated)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, totalIssues } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects, ${totalIssues} open issues in total.`}
      />
      <Card>
        <CardContent className="px-0">
          <Table>
            <TableCaption className="sr-only">Projects in the Acme Labs workspace</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Key</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">
                  Open issues
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Updated
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="font-mono text-xs">{p.key}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
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

```tsx app/reports/page.tsx
import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects, totalIssues } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const rows = [...projects].sort((a, b) => b.issues - a.issues);

  return (
    <div>
      <PageHeading title="Reports" description="Where the open work sits right now." />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open issues by project</CardTitle>
          <CardDescription>
            Share of the {totalIssues} open issues in the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2.5">
            {rows.map((p) => {
              const share = totalIssues === 0 ? 0 : Math.round((p.issues / totalIssues) * 100);
              return (
                <li key={p.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[10rem_minmax(0,1fr)_6rem]">
                  <span className="truncate">
                    <span className="font-mono text-xs text-muted-foreground">{p.key}</span>{" "}
                    {p.name}
                  </span>
                  <span className="text-right text-xs text-muted-foreground tabular-nums sm:order-3">
                    {p.issues} issues · {share}%
                  </span>
                  <Progress
                    value={share}
                    aria-label={`${p.name}: ${share}% of open issues`}
                    className="col-span-2 h-1.5 sm:order-2 sm:col-span-1"
                  />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
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
import { Switch } from "@/components/ui/switch";
import { user, workspace } from "@/lib/data";

const notifications = [
  { id: "weekly", label: "Weekly summary", hint: "A Monday email with open issues per project.", on: true },
  { id: "assigned", label: "Issue assigned to me", hint: "Email me when someone assigns me an issue.", on: true },
  { id: "status", label: "Project status changes", hint: "Tell me when a project is paused or archived.", on: false },
];

export function SettingsForm() {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>How you appear to your teammates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" defaultValue={user.name} autoComplete="name" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={user.email} autoComplete="email" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" defaultValue={user.role} readOnly aria-describedby="role-hint" />
            <p id="role-hint" className="text-xs text-muted-foreground">
              Only another owner can change this.
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="workspace">Workspace name</Label>
            <Input id="workspace" name="workspace" defaultValue={workspace.name} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose which emails Lumen sends you.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-4 py-2">
                <div className="grid gap-0.5">
                  <Label htmlFor={n.id}>{n.label}</Label>
                  <p id={`${n.id}-hint`} className="text-xs text-muted-foreground">
                    {n.hint}
                  </p>
                </div>
                <Switch id={n.id} defaultChecked={n.on} aria-describedby={`${n.id}-hint`} />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div>
      <PageHeading title="Settings" description="Your profile and notification preferences." />
      <SettingsForm />
    </div>
  );
}
```
