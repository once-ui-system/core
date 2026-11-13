```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Lumen: 2px corners everywhere the design system rounds. */
  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);
  --radius-3xl: var(--radius);
  --radius-4xl: var(--radius);
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
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: #0f766e;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #1e293b;
  --muted: #f1f5f9;
  --muted-foreground: #526074;
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;
  --destructive: #b91c1c;
  --border: #e2e8f0;
  --input: #cbd5e1;
  --ring: #0f766e;
  --chart-1: #0f766e;
  --chart-2: #334155;
  --chart-3: #64748b;
  --chart-4: #94a3b8;
  --chart-5: #cbd5e1;
  --sidebar: #f8fafc;
  --sidebar-foreground: #1e293b;
  --sidebar-primary: #0f766e;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #e2e8f0;
  --sidebar-accent-foreground: #0f172a;
  --sidebar-border: #e2e8f0;
  --sidebar-ring: #0f766e;
}

.dark {
  --background: #0b1220;
  --foreground: #f1f5f9;
  --card: #111a2c;
  --card-foreground: #f1f5f9;
  --popover: #111a2c;
  --popover-foreground: #f1f5f9;
  --primary: #14b8a6;
  --primary-foreground: #042f2e;
  --secondary: #1e293b;
  --secondary-foreground: #f1f5f9;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #1e293b;
  --accent-foreground: #f1f5f9;
  --destructive: #f87171;
  --border: #1e293b;
  --input: #334155;
  --ring: #14b8a6;
  --sidebar: #0f1729;
  --sidebar-foreground: #e2e8f0;
  --sidebar-primary: #14b8a6;
  --sidebar-primary-foreground: #042f2e;
  --sidebar-accent: #1e293b;
  --sidebar-accent-foreground: #f1f5f9;
  --sidebar-border: #1e293b;
  --sidebar-ring: #14b8a6;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    font-size: 15px;
  }
  body {
    @apply bg-background font-sans text-foreground;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  [data-slot="card-title"],
  [data-slot="sheet-title"] {
    font-family: var(--font-heading);
  }
  a:not([data-slot]):not([class]) {
    @apply text-primary underline underline-offset-2;
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
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

export const product = "Lumen, a product-analytics and issue-tracking app for small software teams";

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

export type NavItem = { title: string; href: string; icon: "overview" | "reports" | "projects" | "settings" };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: "overview" },
      { title: "Reports", href: "/reports", icon: "reports" },
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

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
```

```tsx components/app-shell.tsx
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

import { navGroups, user } from "@/lib/data";
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const icons: Record<string, LucideIcon> = {
  overview: BarChart3,
  reports: FileText,
  projects: FolderKanban,
  settings: Settings,
};

function normalize(path: string) {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

function AppSidebar() {
  const pathname = normalize(usePathname());

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-base font-semibold">Lumen</span>
                  <span className="truncate text-xs text-muted-foreground">Acme Labs</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const Icon = icons[item.icon];
                  const active = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary data-[active=true]:hover:text-primary-foreground"
                      >
                        <Link href={item.href} aria-current={active ? "page" : undefined}>
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={`${user.name}, ${user.role}`}>
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="rounded-md bg-secondary text-xs font-medium">MO</AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function crumbsFor(pathname: string): { group: string; page: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, page: item.title };
    }
  }
  return { group: "Workspace", page: "Not found" };
}

function AppHeader() {
  const pathname = normalize(usePathname());
  const { group, page } = crumbsFor(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b bg-background px-3">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList className="gap-1.5 sm:gap-1.5">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink asChild>
              <Link href="/">Lumen</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="hidden sm:inline-flex">
            <span>{group}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{page}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen
      style={{ "--sidebar-width": "14rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <div className="flex-1 p-3 sm:p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

```tsx components/page-heading.tsx
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
```

```tsx components/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/data";

const variants: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={variants[status]}>{status}</Badge>;
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, projects, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { title: "Open issues", value: String(open), note: `Across ${projects.length} projects` },
    { title: "Active projects", value: String(active), note: `${projects.length - active} paused or archived` },
    { title: "Busiest project", value: "Customer app", note: "31 open issues" },
    { title: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title} className="gap-1 py-3">
            <CardHeader className="gap-0 px-3">
              <CardDescription className="text-xs">{c.title}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{c.value}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 text-xs text-muted-foreground">{c.note}</CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-3 gap-2 py-3">
        <CardHeader className="gap-0 px-3">
          <CardTitle className="text-base">Recently updated</CardTitle>
          <CardDescription className="text-xs">
            The latest changes in your workspace.{" "}
            <Link href="/projects" className="text-primary underline underline-offset-2">
              View all projects
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8">Project</TableHead>
                <TableHead className="h-8">Status</TableHead>
                <TableHead className="h-8 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...projects]
                .sort((a, b) => b.updated.localeCompare(a.updated))
                .slice(0, 3)
                .map((p) => (
                  <TableRow key={p.key}>
                    <TableCell className="p-1.5 px-2">{p.name}</TableCell>
                    <TableCell className="p-1.5 px-2">
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="p-1.5 px-2 text-right text-muted-foreground">
                      {formatDate(p.updated)}
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
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues));

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading title="Reports" description="Open issues by project." />
      <Card className="gap-2 py-3">
        <CardHeader className="gap-0 px-3">
          <CardTitle className="text-base">Open issues</CardTitle>
          <CardDescription className="text-xs">Counts as of the latest update to each project.</CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          <ul className="grid gap-2">
            {projects.map((p) => (
              <li key={p.key} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-2 text-sm">
                <span className="truncate">{p.name}</span>
                <Progress value={(p.issues / max) * 100} aria-label={`${p.name}: ${p.issues} open issues`} className="h-1.5" />
                <span className="text-right tabular-nums">{p.issues}</span>
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

import { ProjectsTable } from "@/components/projects-table";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeading title="Projects" description="Every project in the Acme Labs workspace." />
      <ProjectsTable />
    </div>
  );
}
```

```tsx components/projects-table.tsx
"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, projects } from "@/lib/data";

export function ProjectsTable() {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter((p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q));

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center gap-2 border-b p-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Filter projects"
            placeholder="Filter by name or key"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-7 text-sm"
          />
        </div>
        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          {rows.length} of {projects.length}
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="h-8">Key</TableHead>
            <TableHead className="h-8">Name</TableHead>
            <TableHead className="h-8">Status</TableHead>
            <TableHead className="h-8 text-right">Open issues</TableHead>
            <TableHead className="h-8 text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                No projects match &ldquo;{query}&rdquo;.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="py-1.5 font-mono text-xs">{p.key}</TableCell>
                <TableCell className="py-1.5 font-medium">{p.name}</TableCell>
                <TableCell className="py-1.5">
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="py-1.5 text-right tabular-nums">{p.issues}</TableCell>
                <TableCell className="py-1.5 text-right text-muted-foreground">{formatDate(p.updated)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
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
    <div className="mx-auto w-full max-w-3xl">
      <PageHeading title="Settings" description="Your profile and workspace preferences." />
      <SettingsForm />
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [timezone, setTimezone] = React.useState("europe-london");
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Card className="gap-3 py-3">
        <CardHeader className="gap-0 px-3">
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription className="text-xs">How you appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-xs">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" autoComplete="name" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-sm" autoComplete="email" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role" className="text-xs">Role</Label>
            <Input id="role" value={user.role} readOnly className="h-8 bg-muted text-sm" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="timezone" className="text-xs">Time zone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="h-8 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="europe-london">London (GMT)</SelectItem>
                <SelectItem value="america-new-york">New York (ET)</SelectItem>
                <SelectItem value="africa-lagos">Lagos (WAT)</SelectItem>
                <SelectItem value="asia-tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3 py-3">
        <CardHeader className="gap-0 px-3">
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription className="text-xs">Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-3">
          <div className="flex items-center justify-between gap-3">
            <div className="grid gap-0.5">
              <Label htmlFor="digest" className="text-sm">Weekly digest</Label>
              <p className="text-xs text-muted-foreground">A Monday summary of issues opened and closed.</p>
            </div>
            <Switch id="digest" checked={digest} onCheckedChange={setDigest} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="grid gap-0.5">
              <Label htmlFor="mentions" className="text-sm">Mentions</Label>
              <p className="text-xs text-muted-foreground">Email me when someone mentions me on an issue.</p>
            </div>
            <Switch id="mentions" checked={mentions} onCheckedChange={setMentions} />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 px-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setTimezone("europe-london");
              setDigest(true);
              setMentions(true);
            }}
          >
            Reset
          </Button>
          <Button type="submit" size="sm">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```
