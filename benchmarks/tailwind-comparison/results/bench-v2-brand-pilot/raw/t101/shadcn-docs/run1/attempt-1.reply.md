The listing shows my earlier files were never written to the project, so the typecheck failed on missing modules. I'm resending every file in full.

I also made three small changes to the code. Two of the three clean up the `Reports` nav item and the collapse-to-icons behaviour:

-   In collapsed mode the sidebar now renders flat icon items with tooltips, and the nested groups only render when expanded.
-   Mobile nav closes the drawer on navigation.
-   `Reports` is a real `/reports` route.

```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/*
 * Lumen design tokens.
 * Brand: #0F766E (teal). Neutrals: cool slate. Radius: 2px. Light by default.
 * Everything below is consumed by the shadcn/ui components through tokens,
 * so each screen inherits the identity without per-element styling.
 */
@theme inline {
  /* Every radius step resolves to the brand's 2px corner. */
  --radius-xs: 2px;
  --radius-sm: 2px;
  --radius-md: 2px;
  --radius-lg: 2px;
  --radius-xl: 2px;
  --radius-2xl: 2px;
  --radius-3xl: 2px;
  --radius-4xl: 2px;

  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;

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
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;

  /* Brand teal #0F766E */
  --primary: #0f766e;
  --primary-foreground: #ffffff;

  --secondary: #f1f5f9;
  --secondary-foreground: #1e293b;
  --muted: #f1f5f9;
  --muted-foreground: #526074;
  --accent: #e2e8f0;
  --accent-foreground: #0f172a;
  --destructive: #b91c1c;
  --border: #dbe2ea;
  --input: #cbd5e1;
  --ring: #0f766e;

  --chart-1: #0f766e;
  --chart-2: #475569;
  --chart-3: #0e7490;
  --chart-4: #94a3b8;
  --chart-5: #64748b;

  --sidebar: #f1f5f9;
  --sidebar-foreground: #1e293b;
  --sidebar-primary: #0f766e;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #e2e8f0;
  --sidebar-accent-foreground: #0f172a;
  --sidebar-border: #dbe2ea;
  --sidebar-ring: #0f766e;
}

.dark {
  --background: #0b1220;
  --foreground: #e2e8f0;
  --card: #111a2c;
  --card-foreground: #e2e8f0;
  --popover: #111a2c;
  --popover-foreground: #e2e8f0;
  --primary: #14b8a6;
  --primary-foreground: #04201d;
  --secondary: #1e293b;
  --secondary-foreground: #e2e8f0;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #1e293b;
  --accent-foreground: #e2e8f0;
  --destructive: #f87171;
  --border: #243044;
  --input: #2f3d55;
  --ring: #14b8a6;
  --chart-1: #14b8a6;
  --chart-2: #94a3b8;
  --chart-3: #22d3ee;
  --chart-4: #64748b;
  --chart-5: #cbd5e1;
  --sidebar: #0e1626;
  --sidebar-foreground: #e2e8f0;
  --sidebar-primary: #14b8a6;
  --sidebar-primary-foreground: #04201d;
  --sidebar-accent: #1e293b;
  --sidebar-accent-foreground: #e2e8f0;
  --sidebar-border: #243044;
  --sidebar-ring: #14b8a6;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    font-size: 14px;
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
  [data-slot="sheet-title"] {
    font-family: var(--font-serif);
    letter-spacing: -0.005em;
  }
}

/*
 * Compact density, applied to the design system's own components via their
 * data-slot hooks so every screen is tight without per-element overrides.
 */
@layer components {
  [data-slot="button"][data-size="default"] {
    height: 1.75rem;
    padding-inline: 0.75rem;
    font-size: 0.8125rem;
  }
  [data-slot="button"][data-size="sm"] {
    height: 1.5rem;
    padding-inline: 0.5rem;
    font-size: 0.75rem;
  }
  [data-slot="button"][data-size="icon"] {
    width: 1.75rem;
    height: 1.75rem;
  }
  [data-slot="input"],
  [data-slot="select-trigger"][data-size="default"] {
    height: 1.75rem;
    padding-block: 0.125rem;
    padding-inline: 0.5rem;
    font-size: 0.8125rem;
  }
  [data-slot="textarea"] {
    min-height: 3.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
  }
  [data-slot="card"] {
    gap: 0.75rem;
    padding-block: 0.75rem;
    box-shadow: none;
  }
  [data-slot="card-header"],
  [data-slot="card-content"],
  [data-slot="card-footer"] {
    padding-inline: 0.75rem;
  }
  [data-slot="card-header"] {
    gap: 0.25rem;
  }
  [data-slot="table"] {
    font-size: 0.8125rem;
  }
  [data-slot="table-head"] {
    height: 1.75rem;
    padding-inline: 0.75rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  [data-slot="table-cell"] {
    padding: 0.375rem 0.75rem;
  }
  [data-slot="badge"] {
    border-radius: var(--radius);
    padding-block: 0;
    font-size: 0.6875rem;
  }
  [data-slot="dropdown-menu-item"] {
    padding-block: 0.25rem;
    font-size: 0.8125rem;
  }
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

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
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

```tsx components/app-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  ChevronsUpDown,
  FileBarChart,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, user } from "@/lib/data";

interface NavLeaf {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: NavLeaf[];
}

const navGroups: NavGroup[] = [
  {
    title: "Analytics",
    icon: BarChart3,
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: FileBarChart },
    ],
  },
  {
    title: "Workspace",
    icon: FolderKanban,
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;

  const closeMobile = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" aria-label="Primary">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/" onClick={closeMobile}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="font-serif text-base font-semibold">Lumen</span>
                  <span className="text-xs text-muted-foreground">Acme Labs</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) =>
          collapsed ? (
            <SidebarGroup key={group.title} className="py-1">
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          tooltip={`${group.title}: ${item.title}`}
                          isActive={active}
                          className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                        >
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
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
          ) : (
            <Collapsible key={group.title} defaultOpen className="group/collapsible">
              <SidebarGroup className="py-1">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="w-full cursor-pointer hover:text-sidebar-foreground">
                    <group.icon aria-hidden="true" className="mr-1.5" />
                    {group.title}
                    <ChevronDown
                      aria-hidden="true"
                      className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                    />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenuSub className="mx-2 mt-0.5">
                      {group.items.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={active}
                              className="data-[active=true]:bg-primary data-[active=true]:font-medium data-[active=true]:text-primary-foreground data-[active=true]:[&>svg]:text-primary-foreground"
                            >
                              <Link
                                href={item.href}
                                onClick={closeMobile}
                                aria-current={active ? "page" : undefined}
                              >
                                <item.icon aria-hidden="true" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          )
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={user.name}>
                  <Avatar size="sm" className="rounded-md">
                    <AvatarFallback className="rounded-md bg-primary/10 text-xs font-medium text-primary">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                  <ChevronsUpDown aria-hidden="true" className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "top" : "right"}
                align="end"
                className="w-56"
              >
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.email} · {user.role}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" onClick={closeMobile}>
                    <Settings aria-hidden="true" /> Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

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
      <Separator
        orientation="vertical"
        className="hidden data-[orientation=vertical]:h-4 md:block"
      />
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
        <div
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-3 outline-none sm:p-4 lg:p-5"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

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
            <Input
              id="role"
              value={user.role}
              readOnly
              aria-readonly="true"
              className="bg-muted"
            />
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

      <section
        aria-label="Summary"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
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
                  <span className="w-10 font-mono text-xs text-muted-foreground">
                    {p.key}
                  </span>
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
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {p.key}
                </TableCell>
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

```tsx app/settings/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
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

```tsx app/reports/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
              <li
                key={p.key}
                className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm"
              >
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