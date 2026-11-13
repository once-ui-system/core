The alias is fine (`@/*` maps to the project root). The real issue is that my `lib/data.ts`, `lib/navigation.ts` and `components/*.tsx` files were never present in the project. Only the files in `app/` were picked up, which is why only those imports fail.

Looking back at my earlier reply, I see why. I wrote those files across several turns of prose and tool calls rather than as one final answer, so the final answer has to include every file again. I'll re-emit the whole app in a single reply.

I also re-checked the code for other strict-mode problems:
- `projects.map((project) => ...)` only failed because the import was unresolved. It will type correctly once `lib/data.ts` exists.
- `[...projects].sort(...)[0]` is typed `Project` without `noUncheckedIndexedAccess`, so it's fine.
- In `lib/data.ts`, `initials` maps over `part[0]`, which is typed `string`, so it's fine.
- `formatDate` destructures `.map(Number)` into `year, month, day`, which are `number`, so it's fine.

```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/*
  Lumen theme
  -----------
  Brand:      #DB2777 (pink) -> primary, ring, current nav item, links
  Neutrals:   warm sand
  Radius:     16px on buttons, inputs, cards, menus
  Typography: rounded headings, system body
  Density:    airy (generous spacing, large touch targets)
*/

@theme inline {
  /*
    The shadcn components pick rounded-md / rounded-lg / rounded-xl for
    buttons, inputs, selects, cards, menus and popovers. Pin all of them to
    the 16px brand radius; rounded-sm (menu items, inner details) steps down
    one notch and rounded-full stays a pill.
  */
  --radius-xs: calc(var(--radius) * 0.5);
  --radius-sm: calc(var(--radius) * 0.75);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: var(--radius);
  --radius-2xl: calc(var(--radius) * 1.5);
  --radius-3xl: calc(var(--radius) * 2);
  --radius-4xl: calc(var(--radius) * 2.5);

  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;

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

  /* Warm sand neutrals */
  --background: #fbf8f3;
  --foreground: #2e2418;
  --card: #fffdfa;
  --card-foreground: #2e2418;
  --popover: #fffdfa;
  --popover-foreground: #2e2418;

  /* Brand */
  --primary: #db2777;
  --primary-foreground: #ffffff;

  --secondary: #f1eadf;
  --secondary-foreground: #3d3022;
  --muted: #f4eee4;
  --muted-foreground: #6b5d4c;
  --accent: #fbe4ee;
  --accent-foreground: #9d174d;
  --destructive: #c62828;
  --border: #e6dccb;
  --input: #d9ccb6;
  --ring: #db2777;

  --chart-1: #db2777;
  --chart-2: #d97706;
  --chart-3: #0d9488;
  --chart-4: #7c3aed;
  --chart-5: #65a30d;

  --sidebar: #f5efe4;
  --sidebar-foreground: #2e2418;
  --sidebar-primary: #db2777;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #db2777;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #e6dccb;
  --sidebar-ring: #db2777;

  /* Airy density: shared control sizing, consumed in the base layer below */
  --control-height: 3rem;
  --control-height-sm: 2.5rem;
  --control-height-lg: 3.5rem;
  --nav-item-height: 2.75rem;
}

.dark {
  --background: #1e1812;
  --foreground: #f6efe4;
  --card: #29211a;
  --card-foreground: #f6efe4;
  --popover: #29211a;
  --popover-foreground: #f6efe4;
  --primary: #ec4899;
  --primary-foreground: #2a0a18;
  --secondary: #382e24;
  --secondary-foreground: #f6efe4;
  --muted: #382e24;
  --muted-foreground: #bfae96;
  --accent: #4a1d33;
  --accent-foreground: #fbcfe3;
  --destructive: #ef6b6b;
  --border: #433729;
  --input: #54463a;
  --ring: #ec4899;
  --sidebar: #241d16;
  --sidebar-foreground: #f6efe4;
  --sidebar-primary: #ec4899;
  --sidebar-primary-foreground: #2a0a18;
  --sidebar-accent: #ec4899;
  --sidebar-accent-foreground: #2a0a18;
  --sidebar-border: #433729;
  --sidebar-ring: #ec4899;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background font-sans text-foreground;
  }

  /* Headings and card titles use the rounded display face */
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

  /* Links carry the brand colour */
  a:not([data-slot]):not([data-sidebar]):not([class]) {
    @apply text-primary underline underline-offset-4 hover:opacity-80;
  }

  /* Visible, brand-coloured focus ring for every focusable thing */
  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }

  /*
    Airy density: larger touch targets for the shared controls. Applied here
    so every screen inherits it from the theme.
  */
  [data-slot="button"][data-size="default"] {
    min-height: var(--control-height);
    padding-inline: 1.5rem;
  }
  [data-slot="button"][data-size="sm"] {
    min-height: var(--control-height-sm);
    padding-inline: 1.125rem;
  }
  [data-slot="button"][data-size="lg"] {
    min-height: var(--control-height-lg);
    padding-inline: 2rem;
    font-size: 1rem;
  }
  [data-slot="button"][data-size="icon"] {
    width: var(--control-height);
    height: var(--control-height);
  }
  [data-slot="button"][data-size="icon-sm"] {
    width: var(--control-height-sm);
    height: var(--control-height-sm);
  }
  [data-slot="button"][data-size="icon-lg"] {
    width: var(--control-height-lg);
    height: var(--control-height-lg);
  }
  [data-slot="input"],
  [data-slot="select-trigger"][data-size="default"] {
    min-height: var(--control-height);
    padding-inline: 1rem;
  }
  [data-slot="select-item"],
  [data-slot="dropdown-menu-item"] {
    min-height: 2.75rem;
    padding-block: 0.625rem;
  }
  [data-slot="switch"][data-size="default"] {
    height: 1.75rem;
    width: 3rem;
  }
  [data-slot="switch"][data-size="default"] [data-slot="switch-thumb"] {
    width: 1.375rem;
    height: 1.375rem;
  }
  [data-slot="switch"][data-state="checked"] [data-slot="switch-thumb"] {
    transform: translateX(1.375rem);
  }
  [data-slot="switch"][data-state="unchecked"] [data-slot="switch-thumb"] {
    transform: translateX(0.125rem);
  }
  [data-slot="card"] {
    gap: 1.5rem;
    padding-block: 1.75rem;
  }
  [data-slot="card-header"],
  [data-slot="card-content"],
  [data-slot="card-footer"] {
    padding-inline: 1.75rem;
  }
  [data-slot="table-head"] {
    height: 3rem;
    padding-inline: 1rem;
  }
  [data-slot="table-cell"] {
    padding: 1rem;
  }
  [data-slot="badge"] {
    padding-inline: 0.75rem;
    padding-block: 0.25rem;
  }

  /* Sidebar navigation: roomy rows, 16px radius, brand-filled current item */
  [data-sidebar="menu-button"] {
    min-height: var(--nav-item-height);
    padding-inline: 0.875rem;
    font-size: 0.9375rem;
  }
  [data-sidebar="menu-button"][data-size="lg"] {
    min-height: 3.5rem;
  }
  [data-sidebar="menu-sub-button"] {
    min-height: 2.5rem;
    height: auto;
    padding-inline: 0.875rem;
    font-size: 0.9375rem;
  }
  [data-sidebar="group-label"] {
    height: 2.25rem;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  [data-sidebar="menu-button"]:hover:not([data-active="true"]),
  [data-sidebar="menu-sub-button"]:hover:not([data-active="true"]) {
    background-color: var(--accent);
    color: var(--accent-foreground);
  }
  [data-sidebar="menu-button"][data-active="true"],
  [data-sidebar="menu-sub-button"][data-active="true"] {
    background-color: var(--sidebar-primary);
    color: var(--sidebar-primary-foreground);
    font-weight: 600;
  }
  [data-sidebar="menu-sub-button"][data-active="true"] > svg {
    color: var(--sidebar-primary-foreground);
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Lumen",
    template: "%s · Lumen",
  },
  description:
    "Lumen is a product-analytics and issue-tracking app for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AppShell>{children}</AppShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```ts lib/data.ts
export const product = {
  name: "Lumen",
  tagline: "Analytics and issues for small software teams",
} as const;

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
```

```ts lib/navigation.ts
import {
  BarChart3Icon,
  FileBarChartIcon,
  FolderKanbanIcon,
  SettingsIcon,
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

/**
 * Overview is the dashboard at "/". Reports has no screen of its own in this
 * shell, so it links to the reports section of the dashboard and is never
 * marked current.
 */
export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: BarChart3Icon },
      { title: "Reports", href: "/#reports", icon: FileBarChartIcon },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanbanIcon },
      { title: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type Crumb = { label: string; href?: string };

export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === "/") {
    return [{ label: "Analytics", href: "/" }, { label: "Overview" }];
  }
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }];
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }];
  }
  return [{ label: "Lumen", href: "/" }];
}
```

```tsx components/app-shell.tsx
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <div
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-5 outline-none sm:p-8 lg:p-10"
        >
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
import { SparklesIcon } from "lucide-react";

import { isActivePath, navGroups } from "@/lib/navigation";
import { initials, product, user } from "@/lib/data";
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

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={product.name}>
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground group-data-[collapsible=icon]:size-8">
                  <SparklesIcon aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="font-heading text-lg font-bold">
                    {product.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Acme Labs workspace
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group) => {
          const labelId = `nav-${group.label.toLowerCase()}`;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel id={labelId}>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu aria-labelledby={labelId}>
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <SidebarMenuItem key={item.title}>
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
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Avatar className="size-10">
            <AvatarFallback className="bg-accent font-semibold text-accent-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.role}
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

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { getBreadcrumbs } from "@/lib/navigation";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppHeader() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-3 border-b bg-background/90 px-5 backdrop-blur sm:px-8 lg:px-10">
      {isMobile ? (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Open navigation menu"
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      ) : (
        <>
          <SidebarTrigger
            className="size-11"
            aria-label="Collapse or expand sidebar"
          />
          <Separator orientation="vertical" className="mx-1 h-6" />
        </>
      )}
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap text-base">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                <BreadcrumbItem className="min-w-0">
                  {last ? (
                    <BreadcrumbPage className="truncate font-heading font-semibold">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </BreadcrumbItem>
                {!last && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
```

```tsx components/page-heading.tsx
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-base text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
```

```tsx components/new-project-button.tsx
"use client";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function NewProjectButton() {
  return (
    <Button
      onClick={() =>
        toast.success("Project creation is coming soon", {
          description:
            "For now, your five existing projects are all listed below.",
        })
      }
    >
      <PlusIcon data-icon="inline-start" aria-hidden="true" />
      New project
    </Button>
  );
}
```

```tsx components/settings-form.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";

import { user } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function SettingsForm() {
  const [name, setName] = React.useState<string>(user.name);
  const [email, setEmail] = React.useState<string>(user.email);
  const [digest, setDigest] = React.useState<string>("weekly");
  const [issueAlerts, setIssueAlerts] = React.useState<boolean>(true);
  const [productNews, setProductNews] = React.useState<boolean>(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your preferences are all up to date.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription>
            How you appear to the rest of your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="settings-name">Full name</FieldLabel>
              <Input
                id="settings-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-email">Email</FieldLabel>
              <Input
                id="settings-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby="settings-email-help"
                required
              />
              <FieldDescription id="settings-email-help">
                We send sign-in links and receipts to this address.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-role">Role</FieldLabel>
              <Input id="settings-role" value={user.role} readOnly />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription>
            Choose how much Lumen taps you on the shoulder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="settings-digest">Summary email</FieldLabel>
                <Select value={digest} onValueChange={setDigest}>
                  <SelectTrigger
                    id="settings-digest"
                    className="w-full sm:w-64"
                  >
                    <SelectValue placeholder="Choose a frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="daily">Every day</SelectItem>
                      <SelectItem value="weekly">Every Monday</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="settings-issue-alerts">
                    Issue assignments
                  </FieldLabel>
                  <FieldDescription>
                    Get a note when an issue is assigned to you.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="settings-issue-alerts"
                  checked={issueAlerts}
                  onCheckedChange={setIssueAlerts}
                />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="settings-product-news">
                    Product news
                  </FieldLabel>
                  <FieldDescription>
                    Occasional updates about new Lumen features.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="settings-product-news"
                  checked={productNews}
                  onCheckedChange={setProductNews}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BugIcon,
  FolderKanbanIcon,
  PauseCircleIcon,
  TrendingUpIcon,
} from "lucide-react";

import { firstName, formatDate, projects, user } from "@/lib/data";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active");
  const paused = projects.filter((p) => p.status === "Paused");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const latest = [...projects].sort((a, b) =>
    b.updated.localeCompare(a.updated),
  )[0];

  const summary = [
    {
      title: "Open issues",
      value: openIssues,
      note: `Across ${projects.length} projects`,
      icon: BugIcon,
    },
    {
      title: "Active projects",
      value: active.length,
      note: `${projects.length - active.length} paused or archived`,
      icon: FolderKanbanIcon,
    },
    {
      title: "Paused",
      value: paused.length,
      note: paused[0] ? `${paused[0].name} is on hold` : "Nothing on hold",
      icon: PauseCircleIcon,
    },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${firstName(user.name)}!`}
        description="Here's how your team's work is shaping up today. Nice momentum, keep it going."
        action={
          <Button asChild>
            <Link href="/projects">
              View projects
              <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <section
        aria-label="Summary"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {summary.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2 text-base">
                <item.icon aria-hidden="true" className="size-5 text-primary" />
                {item.title}
              </CardDescription>
              <CardTitle className="text-4xl font-bold">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.note}
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        id="reports"
        aria-label="Reports"
        className="grid scroll-mt-28 gap-6 lg:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Where the work is piling up
            </CardTitle>
            <CardDescription>
              The project with the most open issues right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-lg font-semibold">
                  {busiest.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {busiest.key} · updated {formatDate(busiest.updated)}
                </span>
              </div>
              <Badge variant="secondary">{busiest.issues} open</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Latest activity</CardTitle>
            <CardDescription>
              The most recently updated project in your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-lg font-semibold">
                  {latest.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {latest.key} · updated {formatDate(latest.updated)}
                </span>
              </div>
              <TrendingUpIcon
                aria-hidden="true"
                className="size-6 shrink-0 text-primary"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";

import { formatDate, projects, type ProjectStatus } from "@/lib/data";
import { PageHeading } from "@/components/page-heading";
import { NewProjectButton } from "@/components/new-project-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Projects" };

const statusVariant: Record<
  ProjectStatus,
  "default" | "secondary" | "outline"
> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description="Every project your team is tracking, with open issues and when it last moved."
        action={<NewProjectButton />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All projects</CardTitle>
          <CardDescription>
            {projects.length} projects in the Acme Labs workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
              {projects.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {project.key}
                  </TableCell>
                  <TableCell className="font-semibold">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[project.status]}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {project.issues}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <time dateTime={project.updated}>
                      {formatDate(project.updated)}
                    </time>
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

import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Settings"
        description="Tune your profile and notifications. Changes only affect your own account."
      />
      <SettingsForm />
    </>
  );
}
```