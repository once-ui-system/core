```ts lib/data.ts
export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
}

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
}

export type ProjectStatus = "Active" | "Paused" | "Archived"

export type Project = {
  key: string
  name: string
  status: ProjectStatus
  issues: number
  updated: string
}

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
]

export type Report = {
  name: string
  cadence: string
  lastRun: string
  owner: string
}

export const reports: Report[] = [
  { name: "Weekly issue throughput", cadence: "Weekly", lastRun: "2026-10-12", owner: "Maya Okafor" },
  { name: "Active users by project", cadence: "Daily", lastRun: "2026-10-14", owner: "Maya Okafor" },
  { name: "Cycle time by label", cadence: "Monthly", lastRun: "2026-10-01", owner: "Maya Okafor" },
  { name: "Backlog age", cadence: "Weekly", lastRun: "2026-10-12", owner: "Maya Okafor" },
]

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
```

```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Lumen: 2px corners everywhere the design system rounds a surface. */
  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: var(--radius);
  --radius-3xl: var(--radius);
  --radius-4xl: var(--radius);

  /* Lumen type: serif headings, system sans body. */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
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

/* Light is the default theme. Brand #0F766E on cool slate neutrals. */
:root {
  --radius: 2px;
  --background: #f8fafc;
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
  --muted-foreground: #475569;
  --accent: #e2e8f0;
  --accent-foreground: #0f172a;
  --destructive: #b91c1c;
  --border: #e2e8f0;
  --input: #cbd5e1;
  --ring: #0f766e;
  --chart-1: #0f766e;
  --chart-2: #334155;
  --chart-3: #64748b;
  --chart-4: #14b8a6;
  --chart-5: #94a3b8;
  --sidebar: #f1f5f9;
  --sidebar-foreground: #0f172a;
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
  --card: #111a2e;
  --card-foreground: #f1f5f9;
  --popover: #111a2e;
  --popover-foreground: #f1f5f9;
  --primary: #14b8a6;
  --primary-foreground: #04201d;
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
  --chart-1: #14b8a6;
  --chart-2: #94a3b8;
  --chart-3: #64748b;
  --chart-4: #5eead4;
  --chart-5: #cbd5e1;
  --sidebar: #0f172a;
  --sidebar-foreground: #f1f5f9;
  --sidebar-primary: #14b8a6;
  --sidebar-primary-foreground: #04201d;
  --sidebar-accent: #1e293b;
  --sidebar-accent-foreground: #f1f5f9;
  --sidebar-border: #1e293b;
  --sidebar-ring: #14b8a6;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-heading);
    letter-spacing: -0.005em;
  }
  a:not([data-slot]):not([data-sidebar]) {
    @apply text-primary underline-offset-4 hover:underline;
  }
}

/*
 * Lumen density: compact. Set once here, per component slot, so every screen
 * gets tight rows and small controls. Unlayered rules win over utilities.
 */
[data-slot="card"] {
  gap: 0.625rem;
  padding-block: 0.75rem;
  box-shadow: none;
}
[data-slot="card-header"] {
  gap: 0.125rem;
  padding-inline: 0.875rem;
}
[data-slot="card-content"],
[data-slot="card-footer"] {
  padding-inline: 0.875rem;
}
[data-slot="card-title"],
[data-slot="dialog-title"],
[data-slot="sheet-title"] {
  font-family: var(--font-heading);
  font-size: 0.9375rem;
}
[data-slot="button"][data-size="default"] {
  height: 2rem;
  padding-inline: 0.75rem;
  font-size: 0.8125rem;
}
[data-slot="button"][data-size="sm"] {
  height: 1.75rem;
  padding-inline: 0.625rem;
  font-size: 0.8125rem;
}
[data-slot="button"][data-size="icon"] {
  width: 2rem;
  height: 2rem;
}
[data-slot="button"],
[data-slot="button"]:where([data-variant="outline"]) {
  box-shadow: none;
}
[data-slot="input"],
[data-slot="select-trigger"][data-size="default"] {
  height: 2rem;
  font-size: 0.8125rem;
  box-shadow: none;
}
[data-slot="table-head"] {
  height: 2rem;
  padding-inline: 0.625rem;
  font-size: 0.75rem;
  color: var(--muted-foreground);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
[data-slot="table-cell"] {
  padding: 0.375rem 0.625rem;
}
[data-slot="table"] {
  font-size: 0.8125rem;
}
[data-sidebar="menu-button"][data-size="default"] {
  height: 1.75rem;
  font-size: 0.8125rem;
}

/* Current navigation item: solid brand colour. */
[data-sidebar="menu-button"][data-active="true"],
[data-sidebar="menu-sub-button"][data-active="true"] {
  background-color: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
}
[data-sidebar="menu-button"][data-active="true"]:hover {
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
  title: { default: "Lumen", template: "%s | Lumen" },
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
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, FolderKanban, LayoutDashboard, Settings, Sun } from "lucide-react"

import { user } from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
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
  useSidebar,
} from "@/components/ui/sidebar"

type NavItem = { title: string; href: string; icon: React.ComponentType }
type NavGroup = { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
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
]

function findCrumbs(pathname: string): { group: string; title: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, title: item.title }
    }
  }
  return null
}

function isCurrent(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

function NavLinks() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <>
      {navGroups.map((group) => (
        <SidebarGroup key={group.label} className="py-1">
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isCurrent(pathname, item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

function AppSidebar() {
  return (
    <Sidebar collapsible="icon" aria-label="Main navigation">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sun className="size-4" aria-hidden="true" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="font-heading text-base font-semibold">Lumen</span>
                  <span className="truncate text-xs text-muted-foreground">Acme Labs</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavLinks />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={`${user.name}, ${user.role}`}>
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="rounded-md bg-secondary text-xs">
                  {initials(user.name)}
                </AvatarFallback>
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
  )
}

function ShellHeader() {
  const pathname = usePathname()
  const crumbs = findCrumbs(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList className="gap-1.5 sm:gap-1.5">
          {crumbs ? (
            <>
              <BreadcrumbItem>
                <span>{crumbs.group}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{crumbs.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>Lumen</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <ShellHeader />
        <div className="flex-1 p-3 sm:p-4 lg:p-5">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

```tsx components/page-heading.tsx
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 className="text-xl font-semibold leading-tight">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}
```

```tsx components/status-badge.tsx
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/lib/data"

const styles: Record<ProjectStatus, string> = {
  Active: "border-primary/30 bg-primary/10 text-primary",
  Paused: "border-border bg-secondary text-secondary-foreground",
  Archived: "border-border bg-transparent text-muted-foreground",
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-sm px-1.5 py-0", styles[status])}>
      {status}
    </Badge>
  )
}
```

```tsx app/page.tsx
import Link from "next/link"

import { formatDate, projects, user } from "@/lib/data"
import { PageHeading } from "@/components/page-heading"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active")
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const paused = projects.filter((p) => p.status === "Paused").length
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0]

  const summary = [
    { title: "Active projects", value: String(active.length), note: `of ${projects.length} in the workspace` },
    { title: "Open issues", value: String(openIssues), note: "across all projects" },
    { title: "Paused projects", value: String(paused), note: "waiting to resume" },
    { title: "Last activity", value: formatDate(latest.updated), note: `${latest.name} (${latest.key})` },
  ]

  return (
    <div>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />
      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardDescription>{item.title}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{item.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Most open issues</CardTitle>
          <CardDescription>
            Projects with work waiting. <Link href="/projects">See all projects</Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Project</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">
                  Issues
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...projects]
                .sort((a, b) => b.issues - a.issues)
                .slice(0, 3)
                .map((p) => (
                  <TableRow key={p.key}>
                    <TableCell>
                      <span className="font-medium">{p.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">{p.key}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next"

import { PageHeading } from "@/components/page-heading"
import { ProjectsTable } from "@/components/projects-table"

export const metadata: Metadata = { title: "Projects" }

export default function ProjectsPage() {
  return (
    <div>
      <PageHeading title="Projects" description="Every project in the Acme Labs workspace." />
      <ProjectsTable />
    </div>
  )
}
```

```tsx components/projects-table.tsx
"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { formatDate, projects } from "@/lib/data"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ProjectsTable() {
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const rows = projects.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || p.status.toLowerCase().includes(q)
  )

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="relative max-w-xs">
          <Label htmlFor="project-filter" className="sr-only">
            Filter projects
          </Label>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="project-filter"
            type="search"
            placeholder="Filter by name, key or status"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Table>
          <TableCaption className="sr-only">Projects with status, open issues and last update</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Key</TableHead>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="text-right">
                Issues
              </TableHead>
              <TableHead scope="col">Updated</TableHead>
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
                  <TableCell className="font-mono text-xs">{p.key}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next"

import { formatDate, reports } from "@/lib/data"
import { PageHeading } from "@/components/page-heading"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const metadata: Metadata = { title: "Reports" }

export default function ReportsPage() {
  return (
    <div>
      <PageHeading title="Reports" description="Scheduled analytics reports for the workspace." />
      <Card>
        <CardContent>
          <Table>
            <TableCaption className="sr-only">Scheduled reports</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Report</TableHead>
                <TableHead scope="col">Cadence</TableHead>
                <TableHead scope="col">Last run</TableHead>
                <TableHead scope="col">Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.cadence}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <time dateTime={r.lastRun}>{formatDate(r.lastRun)}</time>
                  </TableCell>
                  <TableCell>{r.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next"

import { PageHeading } from "@/components/page-heading"
import { SettingsForm } from "@/components/settings-form"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <div>
      <PageHeading title="Settings" description="Your profile and notification preferences." />
      <SettingsForm />
    </div>
  )
}
```

```tsx components/settings-form.tsx
"use client"

import * as React from "react"
import { toast } from "sonner"

import { projects, user } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function SettingsForm() {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [defaultProject, setDefaultProject] = React.useState("APP")
  const [weekly, setWeekly] = React.useState(true)
  const [mentions, setMentions] = React.useState(true)
  const [digest, setDigest] = React.useState(false)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success("Settings saved")
  }

  const prefs = [
    { id: "pref-weekly", label: "Weekly summary", hint: "Issue throughput every Monday.", value: weekly, set: setWeekly },
    { id: "pref-mentions", label: "Mentions", hint: "Email when someone mentions you.", value: mentions, set: setMentions },
    { id: "pref-digest", label: "Daily digest", hint: "One email with yesterday's changes.", value: digest, set: setDigest },
  ]

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Shown to teammates in assignments and comments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role} readOnly aria-describedby="role-hint" />
            <p id="role-hint" className="text-xs text-muted-foreground">
              Roles are managed by the workspace owner.
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="default-project">Default project</Label>
            <Select value={defaultProject} onValueChange={setDefaultProject}>
              <SelectTrigger id="default-project" className="w-full">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects
                  .filter((p) => p.status !== "Archived")
                  .map((p) => (
                    <SelectItem key={p.key} value={p.key}>
                      {p.name} ({p.key})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose which emails Lumen sends to {email}.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {prefs.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
              <div className="grid gap-0.5">
                <Label htmlFor={p.id}>{p.label}</Label>
                <p id={`${p.id}-hint`} className="text-xs text-muted-foreground">
                  {p.hint}
                </p>
              </div>
              <Switch id={p.id} checked={p.value} onCheckedChange={p.set} aria-describedby={`${p.id}-hint`} />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button type="reset" variant="outline" onClick={() => { setName(user.name); setEmail(user.email); setDefaultProject("APP"); setWeekly(true); setMentions(true); setDigest(false) }}>
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
```
