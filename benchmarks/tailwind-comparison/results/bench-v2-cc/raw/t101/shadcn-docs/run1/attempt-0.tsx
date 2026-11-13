```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
  /* Lumen: one 2px corner radius for every control, card and menu. */
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

/* Lumen light theme: brand teal #0F766E on cool slate neutrals. */
:root {
  --radius: 2px;
  --background: oklch(1 0 0);
  --foreground: oklch(0.208 0.042 265.755);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.208 0.042 265.755);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.208 0.042 265.755);
  --primary: #0f766e;
  --primary-foreground: oklch(0.984 0.003 247.858);
  --secondary: oklch(0.968 0.007 247.896);
  --secondary-foreground: oklch(0.279 0.041 260.031);
  --muted: oklch(0.968 0.007 247.896);
  --muted-foreground: oklch(0.446 0.043 257.281);
  --accent: oklch(0.968 0.007 247.896);
  --accent-foreground: oklch(0.208 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.929 0.013 255.508);
  --input: oklch(0.869 0.022 252.894);
  --ring: #0f766e;
  --chart-1: #0f766e;
  --chart-2: oklch(0.554 0.046 257.417);
  --chart-3: oklch(0.704 0.14 182.503);
  --chart-4: oklch(0.372 0.044 257.287);
  --chart-5: oklch(0.869 0.022 252.894);
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.208 0.042 265.755);
  --sidebar-primary: #0f766e;
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.929 0.013 255.508);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: #0f766e;
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.968 0.007 247.896);
  --card: oklch(0.208 0.042 265.755);
  --card-foreground: oklch(0.968 0.007 247.896);
  --popover: oklch(0.208 0.042 265.755);
  --popover-foreground: oklch(0.968 0.007 247.896);
  --primary: oklch(0.777 0.152 181.912);
  --primary-foreground: oklch(0.129 0.042 264.695);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.968 0.007 247.896);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.968 0.007 247.896);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.777 0.152 181.912);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.968 0.007 247.896);
  --sidebar-primary: oklch(0.777 0.152 181.912);
  --sidebar-primary-foreground: oklch(0.129 0.042 264.695);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.968 0.007 247.896);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.777 0.152 181.912);
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
  h6 {
    font-family: var(--font-serif);
    letter-spacing: -0.005em;
  }
}

/*
 * Lumen density (compact) and identity, applied once through the design
 * system's data-slot hooks so every screen follows it.
 */
[data-slot="button"][data-size="default"] {
  height: 2rem;
  padding-inline: 0.75rem;
}
[data-slot="button"][data-size="sm"] {
  height: 1.75rem;
  padding-inline: 0.625rem;
  font-size: 0.8125rem;
}
[data-slot="input"] {
  height: 2rem;
  padding-block: 0.125rem;
  font-size: 0.875rem;
  box-shadow: none;
}
[data-slot="card"] {
  gap: 0.5rem;
  padding-block: 0.75rem;
  box-shadow: none;
}
[data-slot="card-header"] {
  gap: 0.25rem;
  padding-inline: 0.75rem;
}
[data-slot="card-content"],
[data-slot="card-footer"] {
  padding-inline: 0.75rem;
}
[data-slot="card-title"] {
  font-family: var(--font-serif);
  font-size: 0.9375rem;
}
[data-slot="card-description"] {
  font-size: 0.8125rem;
}
[data-slot="table"] {
  font-size: 0.8125rem;
}
[data-slot="table-head"] {
  height: 2rem;
  padding-inline: 0.5rem;
  font-size: 0.75rem;
  color: var(--muted-foreground);
}
[data-slot="table-cell"] {
  padding: 0.375rem 0.5rem;
}
[data-slot="badge"] {
  border-radius: var(--radius);
  padding-block: 0;
  font-size: 0.6875rem;
}
[data-slot="sidebar-menu-button"][data-size="default"] {
  height: 1.75rem;
  font-size: 0.8125rem;
}
[data-slot="sidebar-menu"] {
  gap: 0.125rem;
}
[data-slot="sidebar-group"] {
  padding: 0.375rem 0.5rem;
}
[data-slot="sidebar-group-label"] {
  height: 1.5rem;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
[data-slot="label"] {
  font-size: 0.8125rem;
}

/* The current navigation item carries the brand colour. */
[data-slot="sidebar-menu-button"][data-active="true"],
[data-slot="sidebar-menu-sub-button"][data-active="true"] {
  background-color: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
}
```

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived"

export type Project = {
  key: string
  name: string
  status: ProjectStatus
  issues: number
  updated: string
}

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams"

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
}

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
]

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`))
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName
}

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
```

```tsx lib/nav.ts
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { title: string; href: string; icon: LucideIcon }
export type NavGroup = { title: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  {
    title: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    title: "Workspace",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

export function findNav(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    const item = group.items.find((entry) => entry.href === pathname)
    if (item) return { group, item }
  }
  return null
}
```

```tsx components/app-sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen } from "lucide-react"

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
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initials, user } from "@/lib/data"
import { navGroups } from "@/lib/nav"

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-8 items-center gap-2 px-1">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="size-3.5" aria-hidden="true" />
          </span>
          <span className="font-serif text-base font-semibold group-data-[collapsible=icon]:hidden">
            Lumen
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = pathname === item.href
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
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
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-1 py-1">
          <Avatar className="size-7 rounded-md">
            <AvatarFallback className="rounded-md bg-secondary text-xs font-medium">
              {initials(user.name)}
            </AvatarFallback>
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
  )
}
```

```tsx components/app-header.tsx
"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { findNav } from "@/lib/nav"

export function AppHeader() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const current = findNav(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-11 shrink-0 items-center gap-2 border-b bg-background px-3">
      <SidebarTrigger className="hidden md:inline-flex" />
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7 md:hidden"
        aria-label="Open navigation menu"
        onClick={() => setOpenMobile(true)}
      >
        <Menu aria-hidden="true" />
      </Button>
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList className="gap-1.5 text-[0.8125rem] sm:gap-1.5">
          <BreadcrumbItem>
            <span>{current?.group.title ?? "Lumen"}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{current?.item.title ?? "Page"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
```

```tsx components/app-shell.tsx
"use client"

import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset id="main" className="min-w-0">
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

```tsx components/page-header.tsx
export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <h1 className="text-xl font-semibold">{title}</h1>
      {description ? (
        <p className="text-[0.8125rem] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
```

```tsx components/status-badge.tsx
import { Badge } from "@/components/ui/badge"
import type { ProjectStatus } from "@/lib/data"

const variants = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
} as const

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={variants[status]}>{status}</Badge>
}
```

```tsx components/projects-table.tsx
"use client"

import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, projects } from "@/lib/data"

export function ProjectsTable() {
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(q) ||
        project.key.toLowerCase().includes(q) ||
        project.status.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:max-w-xs">
        <Label htmlFor="project-filter">Filter projects</Label>
        <Input
          id="project-filter"
          type="search"
          placeholder="Name, key or status"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Key</TableHead>
              <TableHead scope="col">Project</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col" className="text-right">
                Open issues
              </TableHead>
              <TableHead scope="col">Last updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((project) => (
              <TableRow key={project.key}>
                <TableCell className="font-mono text-xs">{project.key}</TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <StatusBadge status={project.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {project.issues}
                </TableCell>
                <TableCell className="tabular-nums">
                  <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No projects match &ldquo;{query}&rdquo;.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing {rows.length} of {projects.length} projects.
      </p>
    </div>
  )
}
```

```tsx components/settings-form.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { user } from "@/lib/data"

const notificationOptions = [
  {
    id: "notify-assigned",
    label: "Issues assigned to me",
    hint: "Email me when an issue is assigned to me.",
    initial: true,
  },
  {
    id: "notify-digest",
    label: "Weekly analytics digest",
    hint: "A Monday summary of events and open issues.",
    initial: true,
  },
  {
    id: "notify-status",
    label: "Project status changes",
    hint: "Tell me when a project is paused or archived.",
    initial: false,
  },
]

export function SettingsForm() {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [notify, setNotify] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notificationOptions.map((o) => [o.id, o.initial]))
  )

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success("Settings saved", {
      description: `Changes for ${name} were stored.`,
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to your team in Lumen.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="profile-role">Role</Label>
            <Input id="profile-role" value={user.role} readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose which emails Lumen sends you.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {notificationOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col">
                <Label htmlFor={option.id}>{option.label}</Label>
                <span id={`${option.id}-hint`} className="text-xs text-muted-foreground">
                  {option.hint}
                </span>
              </div>
              <Switch
                id={option.id}
                size="sm"
                aria-describedby={`${option.id}-hint`}
                checked={notify[option.id]}
                onCheckedChange={(checked) =>
                  setNotify((prev) => ({ ...prev, [option.id]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-2 pt-2">
          <Button type="submit" size="sm">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
```

```tsx app/layout.tsx
import "./globals.css"

import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: {
    default: "Lumen",
    template: "%s · Lumen",
  },
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  )
}
```

```tsx app/page.tsx
import Link from "next/link"
import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { firstName, formatDate, projects, user } from "@/lib/data"

export const metadata: Metadata = { title: "Overview" }

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const paused = projects.filter((p) => p.status === "Paused").length
  const archived = projects.filter((p) => p.status === "Archived").length
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3)

  const summary = [
    { label: "Active projects", value: active, note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Paused", value: paused, note: "waiting to resume" },
    { label: "Archived", value: archived, note: "read-only" },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName(user.name)}`}
        description={`Here is where ${projects.length} projects stand today.`}
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

      <Card>
        <CardHeader>
          <CardTitle>Recently updated</CardTitle>
          <CardDescription>The three projects touched most recently.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Project</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">
                  Open issues
                </TableHead>
                <TableHead scope="col">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="font-medium">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {project.key}
                    </span>
                    {project.name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{project.issues}</TableCell>
                  <TableCell className="tabular-nums">
                    <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardContent>
          <Button asChild variant="link" size="sm" className="h-auto px-0">
            <Link href="/projects">View all projects</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { ProjectsTable } from "@/components/projects-table"

export const metadata: Metadata = { title: "Projects" }

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project in the Acme Labs workspace, with its open issues."
      />
      <ProjectsTable />
    </>
  )
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { SettingsForm } from "@/components/settings-form"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile and notification preferences."
      />
      <SettingsForm />
    </>
  )
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { projects } from "@/lib/data"

export const metadata: Metadata = { title: "Reports" }

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0)

  return (
    <>
      <PageHeader
        title="Reports"
        description="Where the open issues sit across projects."
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Open issues by project</CardTitle>
          <CardDescription>{total} open issues in total.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3">
            {projects.map((project) => {
              const share = total === 0 ? 0 : Math.round((project.issues / total) * 100)
              return (
                <li key={project.key} className="grid gap-1">
                  <div className="flex items-baseline justify-between text-[0.8125rem]">
                    <span>
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {project.key}
                      </span>
                      {project.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {project.issues} ({share}%)
                    </span>
                  </div>
                  <Progress
                    value={share}
                    className="h-1.5"
                    aria-label={`${project.name}: ${share}% of open issues`}
                  />
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
```
