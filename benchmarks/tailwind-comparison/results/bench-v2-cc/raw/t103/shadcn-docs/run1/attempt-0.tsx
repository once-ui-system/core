```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Lumen: 4px corners on buttons, inputs, cards and menus; small parts (menu items) 2px */
  --radius-sm: calc(var(--radius) * 0.5);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);
  --radius-3xl: var(--radius);
  --radius-4xl: var(--radius);

  /* Lumen type: sans body, monospace headings */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, monospace;
  --font-heading: ui-monospace, "SFMono-Regular", Menlo, monospace;

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

/* Light (not the default; kept so the tokens are complete) */
:root {
  --radius: 4px;
  --background: #fafaf9;
  --foreground: #1c1917;
  --card: #ffffff;
  --card-foreground: #1c1917;
  --popover: #ffffff;
  --popover-foreground: #1c1917;
  --primary: #e8590c;
  --primary-foreground: #0c0a09;
  --secondary: #f5f5f4;
  --secondary-foreground: #292524;
  --muted: #f5f5f4;
  --muted-foreground: #57534e;
  --accent: #e7e5e4;
  --accent-foreground: #1c1917;
  --destructive: #dc2626;
  --border: #d6d3d1;
  --input: #d6d3d1;
  --ring: #e8590c;
  --chart-1: #e8590c;
  --chart-2: #78716c;
  --chart-3: #a8a29e;
  --chart-4: #f59f00;
  --chart-5: #57534e;
  --sidebar: #f5f5f4;
  --sidebar-foreground: #1c1917;
  --sidebar-primary: #e8590c;
  --sidebar-primary-foreground: #0c0a09;
  --sidebar-accent: #e7e5e4;
  --sidebar-accent-foreground: #1c1917;
  --sidebar-border: #d6d3d1;
  --sidebar-ring: #e8590c;
}

/* Dark: Lumen's default, applied with class="dark" on <html> */
.dark {
  --background: #0c0a09;
  --foreground: #fafaf9;
  --card: #1c1917;
  --card-foreground: #fafaf9;
  --popover: #1c1917;
  --popover-foreground: #fafaf9;
  --primary: #e8590c;
  --primary-foreground: #0c0a09;
  --secondary: #292524;
  --secondary-foreground: #fafaf9;
  --muted: #292524;
  --muted-foreground: #a8a29e;
  --accent: #292524;
  --accent-foreground: #fafaf9;
  --destructive: #f87171;
  --border: #292524;
  --input: #44403c;
  --ring: #e8590c;
  --chart-1: #e8590c;
  --chart-2: #a8a29e;
  --chart-3: #78716c;
  --chart-4: #fbbf24;
  --chart-5: #d6d3d1;
  --sidebar: #141211;
  --sidebar-foreground: #e7e5e4;
  --sidebar-primary: #e8590c;
  --sidebar-primary-foreground: #0c0a09;
  --sidebar-accent: #292524;
  --sidebar-accent-foreground: #fafaf9;
  --sidebar-border: #292524;
  --sidebar-ring: #e8590c;
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
  [data-slot="card-title"] {
    font-family: var(--font-heading);
    letter-spacing: -0.01em;
  }
  ::selection {
    background: color-mix(in oklab, var(--primary) 35%, transparent);
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
  description: "Lumen: product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
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

export const reports = [
  { title: "Weekly issue throughput", detail: "Opened vs. closed issues across all active projects", cadence: "Every Monday" },
  { title: "Cycle time by project", detail: "Median days from first commit to release", cadence: "Every two weeks" },
  { title: "Release health", detail: "Error rate and regressions after each deploy", cadence: "After every release" },
];

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}
```

```ts lib/nav.ts
import {
  FileText,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
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

export const brandIcon = Gauge;

export function isActive(pathname: string, item: NavItem) {
  if (item.href.includes("#")) return false;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function currentCrumbs(pathname: string): { group: string; page: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item)) return { group: group.label, page: item.title };
    }
  }
  return { group: "Workspace", page: "Page" };
}
```

```tsx components/app-shell.tsx
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset id="main" className="min-w-0">
        <AppHeader />
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
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
import * as React from "react";

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
import { brandIcon as BrandIcon, isActive, navGroups } from "@/lib/nav";

const initials = user.name
  .split(" ")
  .map((part) => part[0])
  .join("");

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // Close the phone drawer after navigating.
  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" aria-label="Primary">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <BrandIcon className="size-4" aria-hidden="true" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-sm font-semibold">Lumen</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Acme Labs workspace</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="font-heading text-[11px] tracking-wider uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu aria-label={group.label}>
                {group.items.map((item) => {
                  const active = isActive(pathname, item);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground"
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

      <SidebarFooter>
        <div className="flex items-center gap-2 p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent font-heading text-xs text-sidebar-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
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
import { currentCrumbs } from "@/lib/nav";

export function AppHeader() {
  const pathname = usePathname();
  const { group, page } = currentCrumbs(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger className="size-9 md:size-7" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="font-heading">Lumen</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="hidden sm:inline-flex">
            <span>{group}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-heading font-medium">{page}</BreadcrumbPage>
          </BreadcrumbItem>
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
  Active: "bg-emerald-500",
  Paused: "bg-amber-500",
  Archived: "bg-stone-500",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className="rounded-sm">
      <span className={`size-1.5 rounded-full ${dot[status]}`} aria-hidden="true" />
      {status}
    </Badge>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleDot, FolderKanban, PauseCircle, Clock } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, reports, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];

  const cards = [
    { title: "Open issues", value: String(open), note: `${busiest.name} has the most (${busiest.issues})`, icon: CircleDot },
    { title: "Active projects", value: String(active), note: `of ${projects.length} in the workspace`, icon: FolderKanban },
    { title: "Paused", value: String(paused), note: "Mobile beta is waiting on a decision", icon: PauseCircle },
    { title: "Last update", value: formatDate(latest.updated), note: latest.name, icon: Clock },
  ];

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.email} ({user.role}). Here is where your projects stand today.
        </p>
      </div>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <card.icon className="size-4 text-primary" aria-hidden="true" />
                {card.title}
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="recent-heading">
        <Card>
          <CardHeader>
            <CardTitle id="recent-heading" className="text-base">
              Recently updated
            </CardTitle>
            <CardDescription>The three projects touched most recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {[...projects]
                .sort((a, b) => b.updated.localeCompare(a.updated))
                .slice(0, 3)
                .map((p) => (
                  <li key={p.key} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                    <span className="w-12 font-mono text-sm text-muted-foreground">{p.key}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                    <StatusBadge status={p.status} />
                    <time dateTime={p.updated} className="text-sm text-muted-foreground">
                      {formatDate(p.updated)}
                    </time>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section id="reports" aria-labelledby="reports-heading" className="scroll-mt-20">
        <Card>
          <CardHeader>
            <CardTitle id="reports-heading" className="text-base">
              Reports
            </CardTitle>
            <CardDescription>Scheduled reports for the Acme Labs workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4 md:grid-cols-3">
              {reports.map((r) => (
                <li key={r.title} className="flex flex-col gap-1 rounded-md border p-4">
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">{r.detail}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">{r.cadence}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <div>
        <Button asChild>
          <Link href="/projects">
            View all projects
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";

import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          {projects.length} projects in the Acme Labs workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All projects</CardTitle>
          <CardDescription>Status, open issues and the date of the last update.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Key</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">Issues</TableHead>
                <TableHead scope="col" className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.key}>
                  <TableCell className="font-mono text-muted-foreground">{p.key}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                  <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";

import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and how Lumen keeps you informed.</p>
      </div>
      <SettingsForm />
    </>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const notificationOptions = [
  { id: "assigned", label: "Issue assigned to me", hint: "Email when someone assigns you an issue.", defaultChecked: true },
  { id: "mentions", label: "Mentions", hint: "Email when a teammate mentions you in a comment.", defaultChecked: true },
  { id: "releases", label: "Release health alerts", hint: "Notify when error rates rise after a deploy.", defaultChecked: false },
];

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [digest, setDigest] = React.useState("weekly");
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>(
    Object.fromEntries(notificationOptions.map((o) => [o.id, o.defaultChecked])),
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>How you appear to the rest of the workspace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={user.email} readOnly autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" defaultValue={user.role} readOnly aria-describedby="role-hint" />
            <p id="role-hint" className="text-xs text-muted-foreground">
              Only another owner can change roles.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose what reaches your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {notificationOptions.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor={o.id}>{o.label}</Label>
                <p id={`${o.id}-hint`} className="text-sm text-muted-foreground">
                  {o.hint}
                </p>
              </div>
              <Switch
                id={o.id}
                aria-describedby={`${o.id}-hint`}
                checked={prefs[o.id]}
                onCheckedChange={(checked) => setPrefs((prev) => ({ ...prev, [o.id]: checked }))}
              />
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="digest">Summary email</Label>
            <Select value={digest} onValueChange={setDigest}>
              <SelectTrigger id="digest" className="w-full">
                <SelectValue placeholder="Choose a frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```
