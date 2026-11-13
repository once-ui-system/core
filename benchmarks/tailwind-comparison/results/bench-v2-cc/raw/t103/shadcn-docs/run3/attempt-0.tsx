```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Lumen: 4px corners everywhere the design system rounds a box. */
  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);
  --radius-3xl: var(--radius);
  --radius-4xl: var(--radius);
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, monospace;
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

/* Light variant: warm stone neutrals, brand #E8590C. */
:root {
  --radius: 4px;
  --background: oklch(0.985 0.001 106.4);
  --foreground: oklch(0.147 0.004 49.25);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.147 0.004 49.25);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.147 0.004 49.25);
  --primary: oklch(0.649 0.196 43);
  --primary-foreground: oklch(0.147 0.004 49.25);
  --secondary: oklch(0.97 0.001 106.4);
  --secondary-foreground: oklch(0.216 0.006 56.04);
  --muted: oklch(0.97 0.001 106.4);
  --muted-foreground: oklch(0.47 0.012 58);
  --accent: oklch(0.953 0.004 56);
  --accent-foreground: oklch(0.216 0.006 56.04);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.923 0.003 48.72);
  --input: oklch(0.869 0.005 56.37);
  --ring: oklch(0.649 0.196 43);
  --chart-1: oklch(0.649 0.196 43);
  --chart-2: oklch(0.553 0.013 58.07);
  --chart-3: oklch(0.444 0.011 73.64);
  --chart-4: oklch(0.75 0.15 70);
  --chart-5: oklch(0.709 0.01 56.26);
  --sidebar: oklch(0.97 0.001 106.4);
  --sidebar-foreground: oklch(0.147 0.004 49.25);
  --sidebar-primary: oklch(0.649 0.196 43);
  --sidebar-primary-foreground: oklch(0.147 0.004 49.25);
  --sidebar-accent: oklch(0.923 0.003 48.72);
  --sidebar-accent-foreground: oklch(0.216 0.006 56.04);
  --sidebar-border: oklch(0.923 0.003 48.72);
  --sidebar-ring: oklch(0.649 0.196 43);
}

/* Default theme: dark (the root layout sets the `dark` class). */
.dark {
  --background: oklch(0.147 0.004 49.25);
  --foreground: oklch(0.985 0.001 106.4);
  --card: oklch(0.2 0.005 56);
  --card-foreground: oklch(0.985 0.001 106.4);
  --popover: oklch(0.216 0.006 56.04);
  --popover-foreground: oklch(0.985 0.001 106.4);
  --primary: oklch(0.649 0.196 43);
  --primary-foreground: oklch(0.147 0.004 49.25);
  --secondary: oklch(0.268 0.007 34.3);
  --secondary-foreground: oklch(0.985 0.001 106.4);
  --muted: oklch(0.268 0.007 34.3);
  --muted-foreground: oklch(0.709 0.01 56.26);
  --accent: oklch(0.268 0.007 34.3);
  --accent-foreground: oklch(0.985 0.001 106.4);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(0.985 0.001 106.4 / 12%);
  --input: oklch(0.985 0.001 106.4 / 16%);
  --ring: oklch(0.649 0.196 43);
  --chart-1: oklch(0.649 0.196 43);
  --chart-2: oklch(0.709 0.01 56.26);
  --chart-3: oklch(0.553 0.013 58.07);
  --chart-4: oklch(0.78 0.15 75);
  --chart-5: oklch(0.444 0.011 73.64);
  --sidebar: oklch(0.175 0.005 52);
  --sidebar-foreground: oklch(0.97 0.001 106.4);
  --sidebar-primary: oklch(0.649 0.196 43);
  --sidebar-primary-foreground: oklch(0.147 0.004 49.25);
  --sidebar-accent: oklch(0.268 0.007 34.3);
  --sidebar-accent-foreground: oklch(0.985 0.001 106.4);
  --sidebar-border: oklch(0.985 0.001 106.4 / 10%);
  --sidebar-ring: oklch(0.649 0.196 43);
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
    font-family: var(--font-mono);
    letter-spacing: -0.01em;
  }
  a:not([data-slot]):not([class]) {
    color: var(--primary);
    text-underline-offset: 4px;
  }
  a:not([data-slot]):not([class]):hover {
    text-decoration: underline;
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
    <html lang="en" className="dark" suppressHydrationWarning>
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

export const product = "Lumen";

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

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

export const brandIcon = FileText;

export function findNav(pathname: string): { group: string; title: string } | null {
  for (const group of navGroups) {
    const item = group.items.find((entry) => entry.href === pathname);
    if (item) return { group: group.label, title: item.title };
  }
  return null;
}
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Zap } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
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
import { initials, product, user } from "@/lib/data";
import { findNav, navGroups } from "@/lib/nav";

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" aria-label="Main">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={product}>
              <Link href="/">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Zap className="size-4" aria-hidden="true" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-mono text-sm font-semibold">{product}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Acme Labs</span>
                </span>
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
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={user.name}>
              <Link href="/settings">
                <Avatar className="size-8 rounded-md">
                  <AvatarFallback className="rounded-md bg-sidebar-accent font-mono text-xs">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
                </span>
                <ChevronsUpDown className="ml-auto size-4" aria-hidden="true" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function AppHeader() {
  const pathname = usePathname();
  const current = findNav(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger className="-ml-1 size-9 md:size-7" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      {current ? (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span>{current.group}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col gap-6 p-4 outline-none md:p-6">
          {children}
        </div>
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
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

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const variant = status === "Active" ? "default" : status === "Paused" ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="rounded-sm">
      {status}
    </Badge>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import { Activity, Bug, FolderKanban, GitCommitHorizontal } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    {
      label: "Active projects",
      value: `${active.length} of ${projects.length}`,
      note: "1 paused, 1 archived",
      icon: FolderKanban,
    },
    {
      label: "Open issues",
      value: String(openIssues),
      note: "Across all projects",
      icon: Bug,
    },
    {
      label: "Busiest project",
      value: busiest.key,
      note: `${busiest.name}, ${busiest.issues} open issues`,
      icon: Activity,
    },
    {
      label: "Last activity",
      value: formatDate(latest.updated),
      note: `${latest.name} (${latest.key})`,
      icon: GitCommitHorizontal,
    },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          Workspace summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.label} className="gap-3">
              <CardHeader>
                <CardDescription className="flex items-center justify-between gap-2">
                  <span>{card.label}</span>
                  <card.icon className="size-4" aria-hidden="true" />
                </CardDescription>
                <CardTitle className="text-2xl tabular-nums">{card.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="active-heading">
        <Card>
          <CardHeader>
            <CardTitle id="active-heading">Active work</CardTitle>
            <CardDescription>
              Projects with open issues.{" "}
              <Link href="/projects" className="text-primary underline-offset-4 hover:underline">
                View all projects
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {projects
                .filter((p) => p.issues > 0)
                .map((p) => (
                  <li key={p.key} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">{p.key}</span>
                      <span className="truncate text-sm">{p.name}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {p.issues} issues
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </>
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
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />
      <Card className="py-2">
        <CardContent className="px-2 sm:px-4">
          <Table>
            <caption className="sr-only">Projects in the workspace</caption>
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
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                  <TableCell className="text-right whitespace-nowrap text-muted-foreground">
                    {formatDate(p.updated)}
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

```tsx app/reports/page.tsx
import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <>
      <PageHeading title="Reports" description="Where open issues are concentrated." />
      <Card>
        <CardHeader>
          <CardTitle>Open issues by project</CardTitle>
          <CardDescription>{total} open issues in total.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-4">
            {projects.map((p) => {
              const share = total === 0 ? 0 : Math.round((p.issues / total) * 100);
              return (
                <li key={p.key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="font-mono text-xs text-muted-foreground">{p.key}</span>{" "}
                      {p.name}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {p.issues} ({share}%)
                    </span>
                  </div>
                  <Progress value={share} aria-label={`${p.name}: ${share}% of open issues`} />
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

```tsx components/settings-form.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const notificationOptions = [
  { id: "digest", label: "Weekly digest", hint: "A summary of issues opened and closed each Monday." },
  { id: "assigned", label: "Issue assigned to me", hint: "Email me when someone assigns me an issue." },
  { id: "mentions", label: "Mentions", hint: "Email me when I am mentioned in a comment." },
];

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    digest: true,
    assigned: true,
    mentions: false,
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
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
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" value={user.role} readOnly aria-describedby="role-hint" />
            <p id="role-hint" className="text-sm text-muted-foreground">
              Roles are managed by the workspace owner.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {notificationOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <Label htmlFor={option.id}>{option.label}</Label>
                <p id={`${option.id}-hint`} className="text-sm text-muted-foreground">
                  {option.hint}
                </p>
              </div>
              <Switch
                id={option.id}
                aria-describedby={`${option.id}-hint`}
                checked={prefs[option.id]}
                onCheckedChange={(checked) => setPrefs((prev) => ({ ...prev, [option.id]: checked }))}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
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
    <>
      <PageHeading title="Settings" description="Manage your profile and notifications." />
      <SettingsForm />
    </>
  );
}
```
