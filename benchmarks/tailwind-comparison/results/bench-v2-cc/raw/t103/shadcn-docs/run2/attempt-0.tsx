```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-heading: ui-monospace, "SFMono-Regular", Menlo, monospace;
  /* Lumen: one 4px corner radius on buttons, inputs, cards and menus. */
  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);
  --radius-3xl: var(--radius);
  --radius-4xl: var(--radius);
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

/* Light theme: warm stone neutrals, brand #E8590C */
:root {
  --radius: 4px;
  --background: oklch(0.985 0.004 80);
  --foreground: oklch(0.2 0.01 60);
  --card: oklch(1 0.002 80);
  --card-foreground: oklch(0.2 0.01 60);
  --popover: oklch(1 0.002 80);
  --popover-foreground: oklch(0.2 0.01 60);
  --primary: oklch(0.65 0.19 43);
  --primary-foreground: oklch(0.16 0.006 60);
  --secondary: oklch(0.95 0.006 75);
  --secondary-foreground: oklch(0.25 0.01 60);
  --muted: oklch(0.95 0.006 75);
  --muted-foreground: oklch(0.48 0.012 65);
  --accent: oklch(0.94 0.008 75);
  --accent-foreground: oklch(0.22 0.01 60);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.89 0.008 75);
  --input: oklch(0.87 0.008 75);
  --ring: oklch(0.65 0.19 43);
  --chart-1: oklch(0.65 0.19 43);
  --chart-2: oklch(0.6 0.1 185);
  --chart-3: oklch(0.45 0.05 230);
  --chart-4: oklch(0.8 0.15 85);
  --chart-5: oklch(0.7 0.14 70);
  --sidebar: oklch(0.965 0.006 78);
  --sidebar-foreground: oklch(0.2 0.01 60);
  --sidebar-primary: oklch(0.65 0.19 43);
  --sidebar-primary-foreground: oklch(0.16 0.006 60);
  --sidebar-accent: oklch(0.93 0.008 75);
  --sidebar-accent-foreground: oklch(0.2 0.01 60);
  --sidebar-border: oklch(0.89 0.008 75);
  --sidebar-ring: oklch(0.65 0.19 43);
}

/* Dark theme (default): warm stone greys */
.dark {
  --background: oklch(0.165 0.006 60);
  --foreground: oklch(0.97 0.005 80);
  --card: oklch(0.205 0.007 60);
  --card-foreground: oklch(0.97 0.005 80);
  --popover: oklch(0.225 0.008 60);
  --popover-foreground: oklch(0.97 0.005 80);
  --primary: oklch(0.65 0.19 43);
  --primary-foreground: oklch(0.16 0.006 60);
  --secondary: oklch(0.27 0.008 60);
  --secondary-foreground: oklch(0.97 0.005 80);
  --muted: oklch(0.27 0.008 60);
  --muted-foreground: oklch(0.72 0.012 70);
  --accent: oklch(0.29 0.009 60);
  --accent-foreground: oklch(0.97 0.005 80);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(0.97 0.01 70 / 12%);
  --input: oklch(0.97 0.01 70 / 16%);
  --ring: oklch(0.65 0.19 43);
  --chart-1: oklch(0.65 0.19 43);
  --chart-2: oklch(0.7 0.1 185);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.65 0.15 300);
  --chart-5: oklch(0.65 0.2 20);
  --sidebar: oklch(0.185 0.007 60);
  --sidebar-foreground: oklch(0.97 0.005 80);
  --sidebar-primary: oklch(0.65 0.19 43);
  --sidebar-primary-foreground: oklch(0.16 0.006 60);
  --sidebar-accent: oklch(0.27 0.008 60);
  --sidebar-accent-foreground: oklch(0.97 0.005 80);
  --sidebar-border: oklch(0.97 0.01 70 / 12%);
  --sidebar-ring: oklch(0.65 0.19 43);
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
  [data-slot="card-title"],
  [data-slot="sidebar-group-label"] {
    font-family: var(--font-heading);
  }
  a:not([data-slot]):not([class]) {
    @apply text-primary underline-offset-4 hover:underline;
  }
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
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/nav.ts
import { BarChart3, FileText, FolderKanban, LayoutDashboard, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

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

export function crumbsFor(pathname: string): { group: string; title: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, title: item.title };
    }
  }
  return { group: "Lumen", title: "Page" };
}

export { FileText };
```

```tsx components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge } from "lucide-react";

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
import { navGroups } from "@/lib/nav";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Gauge className="size-4" aria-hidden="true" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-sm font-semibold">Lumen</span>
                  <span className="truncate text-xs text-muted-foreground">Acme Labs</span>
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
            <SidebarGroupContent>
              <SidebarMenu aria-label={group.label}>
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
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
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 overflow-hidden p-1">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="font-heading text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { crumbsFor } from "@/lib/nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { group, title } = crumbsFor(pathname);

  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1 size-8" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Lumen</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="hidden sm:inline-flex">{group}</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div id="main" tabIndex={-1} className="flex-1 p-4 outline-none md:p-6">
          <div className="mx-auto w-full max-w-5xl space-y-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export { Fragment };
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CircleDot, FolderKanban, PauseCircle } from "lucide-react";

import { PageTitle } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { title: "Open issues", value: open, note: "Across all projects", icon: CircleDot },
    { title: "Active projects", value: active, note: `${projects.length} projects in total`, icon: FolderKanban },
    { title: "Paused projects", value: paused, note: "Waiting to resume", icon: PauseCircle },
    { title: "Last activity", value: latest.key, note: `${latest.name}, ${formatDate(latest.updated)}`, icon: Activity },
  ];

  return (
    <>
      <PageTitle
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardDescription>{card.title}</CardDescription>
              <card.icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-semibold tabular-nums">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Busiest projects</CardTitle>
          <CardDescription>Projects with the most open issues.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {[...projects]
              .sort((a, b) => b.issues - a.issues)
              .slice(0, 3)
              .map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{p.key}</p>
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {p.issues} open
                  </Badge>
                </li>
              ))}
          </ul>
          <Button asChild variant="link" className="mt-3 h-auto p-0">
            <Link href="/projects">View all projects</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";

import { PageTitle } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

const variants: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export default function ProjectsPage() {
  return (
    <>
      <PageTitle title="Projects" description={`${projects.length} projects in the Acme Labs workspace.`} />
      <Card className="py-0">
        <Table>
          <caption className="sr-only">Projects with status, open issues and last update</caption>
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
            {projects.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="font-mono text-xs">{p.key}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant={variants[p.status]}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                  {formatDate(p.updated)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";

import { PageTitle } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <>
      <PageTitle title="Reports" description="Issue load by project." />
      <Card>
        <CardHeader>
          <CardTitle>Open issues by project</CardTitle>
          <CardDescription>{total} open issues in total.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {projects.map((p) => {
              const pct = total === 0 ? 0 : Math.round((p.issues / total) * 100);
              return (
                <li key={p.key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      <span className="font-mono text-xs text-muted-foreground">{p.key}</span> {p.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {p.issues} ({pct}%)
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${p.name} share of open issues`}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 w-full overflow-hidden rounded-sm bg-muted"
                  >
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [assigned, setAssigned] = useState(true);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <>
      <PageTitle title="Settings" description="Manage your profile and notifications." />
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Shown to teammates in Acme Labs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user.role} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what lands in your inbox.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="digest">Weekly digest</Label>
                <p id="digest-desc" className="text-sm text-muted-foreground">
                  A Monday summary of issue activity.
                </p>
              </div>
              <Switch id="digest" aria-describedby="digest-desc" checked={digest} onCheckedChange={setDigest} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="assigned">Assignment alerts</Label>
                <p id="assigned-desc" className="text-sm text-muted-foreground">
                  Email me when an issue is assigned to me.
                </p>
              </div>
              <Switch
                id="assigned"
                aria-describedby="assigned-desc"
                checked={assigned}
                onCheckedChange={setAssigned}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit">Save changes</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}
```
