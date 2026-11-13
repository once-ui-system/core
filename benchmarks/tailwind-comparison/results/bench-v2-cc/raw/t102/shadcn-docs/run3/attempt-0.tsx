```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  /* Lumen: 16px corners on buttons, inputs, cards and menus */
  --radius-sm: calc(var(--radius) * 0.75);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: calc(var(--radius) * 1.25);
  --radius-3xl: calc(var(--radius) * 1.5);
  --radius-4xl: calc(var(--radius) * 2);
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
  /* warm sand neutrals */
  --background: oklch(0.982 0.009 85);
  --foreground: oklch(0.24 0.02 60);
  --card: oklch(0.995 0.004 85);
  --card-foreground: oklch(0.24 0.02 60);
  --popover: oklch(0.995 0.004 85);
  --popover-foreground: oklch(0.24 0.02 60);
  /* brand #DB2777 */
  --primary: #db2777;
  --primary-foreground: #ffffff;
  --secondary: oklch(0.94 0.02 85);
  --secondary-foreground: oklch(0.28 0.02 60);
  --muted: oklch(0.955 0.015 85);
  --muted-foreground: oklch(0.48 0.025 65);
  --accent: oklch(0.935 0.03 80);
  --accent-foreground: oklch(0.28 0.02 60);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.89 0.02 80);
  --input: oklch(0.86 0.025 80);
  --ring: #db2777;
  --chart-1: #db2777;
  --chart-2: oklch(0.7 0.14 70);
  --chart-3: oklch(0.6 0.1 35);
  --chart-4: oklch(0.75 0.12 95);
  --chart-5: oklch(0.5 0.08 60);
  --sidebar: oklch(0.962 0.02 85);
  --sidebar-foreground: oklch(0.24 0.02 60);
  --sidebar-primary: #db2777;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: oklch(0.925 0.03 82);
  --sidebar-accent-foreground: oklch(0.24 0.02 60);
  --sidebar-border: oklch(0.88 0.025 80);
  --sidebar-ring: #db2777;
}

.dark {
  --background: oklch(0.21 0.012 65);
  --foreground: oklch(0.96 0.01 85);
  --card: oklch(0.25 0.014 65);
  --card-foreground: oklch(0.96 0.01 85);
  --popover: oklch(0.25 0.014 65);
  --popover-foreground: oklch(0.96 0.01 85);
  --primary: #db2777;
  --primary-foreground: #ffffff;
  --secondary: oklch(0.3 0.015 65);
  --secondary-foreground: oklch(0.96 0.01 85);
  --muted: oklch(0.3 0.015 65);
  --muted-foreground: oklch(0.72 0.02 75);
  --accent: oklch(0.32 0.02 65);
  --accent-foreground: oklch(0.96 0.01 85);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 16%);
  --ring: #ec4899;
  --sidebar: oklch(0.24 0.014 65);
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
  html {
    color-scheme: light;
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
    letter-spacing: -0.01em;
  }
  a:not([data-slot]) {
    @apply text-primary underline-offset-4;
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

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}
```

```tsx components/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { user } from "@/lib/data";

type NavItem = { title: string; href: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: FileText },
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

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            Lumen
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="h-9 text-xs font-semibold tracking-wider uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        size="lg"
                        tooltip={item.title}
                        isActive={active}
                        className="px-4 text-base data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary/90 data-[active=true]:hover:text-sidebar-primary-foreground [&>svg]:size-5"
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

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-10">
            <AvatarFallback className="bg-accent font-semibold text-accent-foreground">MO</AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
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

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, PanelLeft } from "lucide-react";

import { AppSidebar, navGroups } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function MenuButton() {
  const { toggleSidebar, isMobile, openMobile, state } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11"
      onClick={toggleSidebar}
      aria-label={isMobile ? "Open navigation menu" : state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={isMobile ? openMobile : state === "expanded"}
    >
      {isMobile ? <Menu className="size-5" /> : <PanelLeft className="size-5" />}
    </Button>
  );
}

function HeaderBreadcrumb() {
  const pathname = usePathname();
  let crumb: { group: string; title: string } | undefined;
  for (const group of navGroups) {
    for (const item of group.items) {
      const match = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (match) crumb = { group: group.label, title: item.title };
    }
  }
  if (!crumb) return null;
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm sm:text-base">
        <BreadcrumbItem>
          <span>{crumb.group}</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold">{crumb.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        style={{ color: "var(--primary-foreground)" }}
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset id="main" className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <MenuButton />
          <Separator orientation="vertical" className="h-6" />
          <HeaderBreadcrumb />
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Lumen",
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

```tsx app/page.tsx
import Link from "next/link";
import { ArrowRight, CircleDot, FolderKanban, PauseCircle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active");
  const notActive = projects.length - active.length;
  const byRecent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
  const latest = byRecent[0];

  const stats = [
    { label: "Open issues", value: String(openIssues), note: `Across ${projects.length} projects`, icon: CircleDot },
    { label: "Active projects", value: String(active.length), note: "Shipping right now", icon: FolderKanban },
    { label: "Paused or archived", value: String(notActive), note: "Resting for a while", icon: PauseCircle },
    { label: "Latest activity", value: formatDate(latest.updated), note: `${latest.key}: ${latest.name}`, icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {firstName}!</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Your team has {openIssues} open issues across {active.length} active projects. Here is how things look today.
        </p>
      </section>

      <section aria-label="Summary" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-4 py-7">
            <CardHeader className="gap-3 px-7">
              <div className="flex items-center justify-between gap-3">
                <CardDescription className="text-base">{stat.label}</CardDescription>
                <span className="flex size-10 items-center justify-center rounded-md bg-accent text-primary">
                  <stat.icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <CardTitle className="text-3xl leading-tight font-bold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="px-7 text-sm text-muted-foreground">{stat.note}</CardContent>
          </Card>
        ))}
      </section>

      <Card className="gap-6 py-7">
        <CardHeader className="gap-2 px-7">
          <CardTitle className="text-xl">Recently updated</CardTitle>
          <CardDescription className="text-base">The three projects your team touched most recently.</CardDescription>
        </CardHeader>
        <CardContent className="px-7">
          <ul className="divide-y">
            {byRecent.slice(0, 3).map((p) => (
              <li key={p.key} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="px-3 py-1 font-mono text-xs">
                    {p.key}
                  </Badge>
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground">Updated {formatDate(p.updated)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{p.issues} open issues</p>
              </li>
            ))}
          </ul>
          <div className="pt-4">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/projects">
                View all projects <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

```tsx app/reports/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { projects } from "@/lib/data";

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  const rows = [...projects].sort((a, b) => b.issues - a.issues);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Reports</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          See where your team&apos;s open issues are piling up, project by project.
        </p>
      </section>

      <Card className="gap-6 py-7">
        <CardHeader className="gap-2 px-7">
          <CardTitle className="text-xl">Open issues by project</CardTitle>
          <CardDescription className="text-base">{total} open issues in total.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 px-7">
          {rows.map((p) => {
            const share = total === 0 ? 0 : Math.round((p.issues / total) * 100);
            return (
              <div key={p.key} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">
                    {p.name} <span className="font-mono text-sm text-muted-foreground">({p.key})</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {p.issues} issues, {share}%
                  </span>
                </div>
                <Progress value={share} aria-label={`${p.name} share of open issues`} className="h-3" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
```

```tsx components/projects-table.tsx
"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, type Project } from "@/lib/data";

const statusVariant = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
} as const;

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const rows = projects.filter(
    (p) =>
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-md">
        <Label htmlFor="project-search" className="sr-only">
          Search projects
        </Label>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="project-search"
          type="search"
          placeholder="Search by name, key or status"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 bg-card pl-12 text-base"
        />
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="h-14 px-6">Key</TableHead>
              <TableHead className="h-14 px-6">Project</TableHead>
              <TableHead className="h-14 px-6">Status</TableHead>
              <TableHead className="h-14 px-6 text-right">Open issues</TableHead>
              <TableHead className="h-14 px-6 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="px-6 py-5 font-mono text-sm">{p.key}</TableCell>
                <TableCell className="px-6 py-5 font-semibold">{p.name}</TableCell>
                <TableCell className="px-6 py-5">
                  <Badge variant={statusVariant[p.status]} className="px-3 py-1 text-xs">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-5 text-right tabular-nums">{p.issues}</TableCell>
                <TableCell className="px-6 py-5 text-right whitespace-nowrap text-muted-foreground">
                  {formatDate(p.updated)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  No projects match &ldquo;{query}&rdquo;. Try another word.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {rows.length} of {projects.length} projects.
      </p>
    </div>
  );
}
```

```tsx app/projects/page.tsx
import { ProjectsTable } from "@/components/projects-table";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every project in your workspace, with its status and open issues.
        </p>
      </section>
      <ProjectsTable projects={projects} />
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const prefs = [
  { id: "digest", title: "Weekly digest", text: "A friendly Monday summary of what moved last week.", on: true },
  { id: "assigned", title: "Assigned to me", text: "Get an email when an issue lands on your plate.", on: true },
  { id: "mentions", title: "Mentions and replies", text: "Know when a teammate pings you in a thread.", on: false },
];

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [toggles, setToggles] = React.useState<Record<string, boolean>>(
    Object.fromEntries(prefs.map((p) => [p.id, p.on])),
  );

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Settings saved", { description: "Your changes are live." });
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-8">
      <Card className="gap-6 py-7">
        <CardHeader className="gap-2 px-7">
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription className="text-base">How you appear to teammates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 px-7 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-base">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-12 text-base" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-base">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-12 text-base" />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <span className="text-base font-medium">Role</span>
            <Badge variant="secondary" className="px-3 py-1 text-xs">{user.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-6 py-7">
        <CardHeader className="gap-2 px-7">
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription className="text-base">Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="px-7">
          <ul className="divide-y">
            {prefs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-6 py-5">
                <div>
                  <Label htmlFor={p.id} className="text-base">{p.title}</Label>
                  <p id={`${p.id}-desc`} className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                </div>
                <Switch
                  id={p.id}
                  aria-describedby={`${p.id}-desc`}
                  checked={toggles[p.id]}
                  onCheckedChange={(v) => setToggles((t) => ({ ...t, [p.id]: v }))}
                  className="h-7 w-12 [&_[data-slot=switch-thumb]]:size-6"
                />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end px-7">
          <Button type="submit" size="lg" className="h-12 px-8 text-base">
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
    <div className="flex max-w-3xl flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
        <p className="text-lg text-muted-foreground">Make Lumen feel like yours.</p>
      </section>
      <SettingsForm />
    </div>
  );
}
```
