Now the shell, which I'll share between the dashboard and the other routes.

```tsx components/app-shell.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface Crumb {
  group: string;
  title: string;
}

const crumbs: Record<string, Crumb> = {
  "/": { group: "Analytics", title: "Overview" },
  "/reports": { group: "Analytics", title: "Reports" },
  "/projects": { group: "Workspace", title: "Projects" },
  "/settings": { group: "Workspace", title: "Settings" },
};

function MobileMenuButton() {
  const { setOpenMobile } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setOpenMobile(true)}
    >
      <Menu aria-hidden="true" />
      <span className="sr-only">Open navigation menu</span>
    </Button>
  );
}

function ShellHeader() {
  const pathname = usePathname();
  const crumb = crumbs[pathname] ?? { group: "Workspace", title: "Page" };

  return (
    <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <MobileMenuButton />
      <SidebarTrigger className="hidden md:inline-flex" />
      <Separator orientation="vertical" className="hidden data-[orientation=vertical]:h-4 md:block" />
      <Breadcrumb>
        <BreadcrumbList className="gap-1 text-xs sm:gap-1.5">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Lumen</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="hidden sm:inline-flex">
            <span>{crumb.group}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <ShellHeader />
        <div id="main-content" tabIndex={-1} className="flex-1 p-3 outline-none sm:p-4 lg:p-5">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

Page headings need a shared compact component:

```tsx components/page-header.tsx
import * as React from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
```

The root layout gets a `ThemeProvider` (light default) and the metadata:

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

The dashboard at `/`:

```tsx app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bug, FolderKanban, Pause } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, projects, user } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const paused = projects.filter((p) => p.status === "Paused").length;
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 3);

  const stats = [
    {
      label: "Active projects",
      value: active.length,
      note: `of ${projects.length} in the workspace`,
      icon: FolderKanban,
    },
    {
      label: "Open issues",
      value: openIssues,
      note: `${busiest.name} has the most (${busiest.issues})`,
      icon: Bug,
    },
    {
      label: "Paused",
      value: paused,
      note: "Mobile beta awaiting a release slot",
      icon: Pause,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
        actions={
          <Link href="/projects" className={cn(buttonVariants({ size: "sm" }))}>
            View projects <ArrowRight aria-hidden="true" />
          </Link>
        }
      />

      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription className="flex items-center justify-between text-xs">
                {s.label}
                <s.icon className="size-3.5" aria-hidden="true" />
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="recent-heading" className="mt-3">
        <Card>
          <CardHeader>
            <CardTitle id="recent-heading" className="text-sm">
              Recently updated
            </CardTitle>
            <CardDescription className="text-xs">
              The three projects with the latest activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recent.map((p) => (
                <li key={p.key} className="flex items-center gap-3 py-1.5 text-sm">
                  <span className="w-10 font-mono text-xs text-muted-foreground">{p.key}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <Badge variant={p.status === "Active" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                  <time
                    dateTime={p.updated}
                    className="hidden w-24 text-right text-xs text-muted-foreground tabular-nums sm:block"
                  >
                    {formatDate(p.updated)}
                  </time>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
```

The projects route has a layout wrapping it in the shell, and the page itself is a table:

```tsx app/projects/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
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

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export default function ProjectsPage() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${projects.length} projects · ${totalIssues} open issues`}
      />
      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <caption className="sr-only">Projects in the Acme Labs workspace</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
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
                <TableCell className="font-mono text-xs text-muted-foreground">{p.key}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.issues}</TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
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

Settings has client-side state for its form, so the form is its own client component:

```tsx app/settings/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx components/settings-form.tsx
"use client";

import * as React from "react";
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
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [digest, setDigest] = React.useState("weekly");
  const [issueAlerts, setIssueAlerts] = React.useState(true);
  const [releaseNotes, setReleaseNotes] = React.useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your profile and notification preferences are up to date.",
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Profile</CardTitle>
          <CardDescription className="text-xs">
            How you appear to teammates in Acme Labs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-xs">
              Full name
            </Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role" className="text-xs">
              Role
            </Label>
            <Input id="role" value={user.role} readOnly aria-readonly="true" className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notifications</CardTitle>
          <CardDescription className="text-xs">
            Choose what Lumen sends to {email || "your inbox"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-1.5 sm:max-w-xs">
            <Label htmlFor="digest" className="text-xs">
              Summary digest
            </Label>
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
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <div>
              <Label htmlFor="issue-alerts" className="text-sm">
                Issue assignments
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Email me when an issue is assigned to me.
              </p>
            </div>
            <Switch
              id="issue-alerts"
              checked={issueAlerts}
              onCheckedChange={setIssueAlerts}
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <div>
              <Label htmlFor="release-notes" className="text-sm">
                Product updates
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Occasional notes about new Lumen features.
              </p>
            </div>
            <Switch
              id="release-notes"
              checked={releaseNotes}
              onCheckedChange={setReleaseNotes}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setDigest("weekly");
              setIssueAlerts(true);
              setReleaseNotes(false);
            }}
          >
            Reset
          </Button>
          <Button type="submit" size="sm">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile and how Lumen contacts you."
      />
      <SettingsForm />
    </>
  );
}
```

Finally, the `/reports` page so the "Reports" nav item resolves to a real screen:

```tsx app/reports/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const rows = [...projects]
    .filter((p) => p.issues > 0)
    .sort((a, b) => b.issues - a.issues);
  const max = Math.max(...rows.map((p) => p.issues), 1);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Open issues by project, from the latest sync."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm">Open issues by project</CardTitle>
          <CardDescription className="text-xs">
            Projects with no open issues are omitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            {rows.map((p) => (
              <li key={p.key} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="truncate">{p.name}</span>
                <span className="h-2 bg-muted" aria-hidden="true">
                  <span
                    className="block h-2 bg-primary"
                    style={{ width: `${(p.issues / max) * 100}%` }}
                  />
                </span>
                <span className="text-right tabular-nums">{p.issues}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
```