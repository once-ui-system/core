```css app/globals.css
@import "tailwindcss";

/*
 * Lumen design tokens. Every screen reads these through utilities
 * (bg-brand, text-muted, rounded-ui, font-mono ...), so the brand lives here only.
 * Dark is the default theme.
 */
@theme {
  /* Brand: #E8590C */
  --color-brand: #e8590c;
  --color-brand-hover: #ff6f26;
  --color-brand-strong: #c2480a;
  --color-on-brand: #1c1917;

  /* Warm stone neutrals */
  --color-canvas: #0c0a09;
  --color-surface: #1c1917;
  --color-raised: #292524;
  --color-line: #44403c;
  --color-line-strong: #78716c;
  --color-fg: #fafaf9;
  --color-muted: #a8a29e;

  /* Type */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, monospace;

  /* 4px corners on buttons, inputs, cards and menus */
  --radius-ui: 4px;
}

@layer base {
  :root {
    color-scheme: dark;
  }

  html {
    background-color: var(--color-canvas);
  }

  body {
    background-color: var(--color-canvas);
    color: var(--color-fg);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-mono);
    letter-spacing: -0.01em;
  }

  a {
    text-underline-offset: 3px;
  }

  :focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
  }

  ::selection {
    background-color: var(--color-brand);
    color: var(--color-on-brand);
  }
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas font-sans text-fg antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
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

export const workspaceName = "Acme Labs";

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function summarize() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  return { openIssues, active, paused, latest, total: projects.length };
}
```

```ts lib/nav.ts
import {
  FileText,
  FolderKanban,
  Gauge,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: Gauge },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function findNav(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      const match = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (match) return { group, item };
    }
  }
  return null;
}
```

```tsx components/ui.tsx
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { ProjectStatus } from "@/lib/data";

export const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-ui bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

export const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-ui border border-line-strong bg-transparent px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-raised disabled:cursor-not-allowed disabled:opacity-50";

export const inputClasses =
  "block w-full rounded-ui border border-line-strong bg-canvas px-3 py-2 text-sm text-fg placeholder:text-muted read-only:text-muted";

export const linkClasses = "text-brand underline hover:text-brand-hover";

export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={`rounded-ui border border-line bg-surface p-5 ${className}`}
      {...props}
    />
  );
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        {description ? <p className="mt-1 max-w-prose text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const statusStyles: Record<ProjectStatus, string> = {
  Active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Paused: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Archived: "border-line-strong bg-raised text-muted",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-ui border px-2 py-0.5 font-mono text-xs ${statusStyles[status]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
```

```tsx components/sidebar-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navGroups } from "@/lib/nav";

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-4">
      <ul className="flex flex-col gap-5">
        {navGroups.map((group, index) => {
          const headingId = `nav-group-${group.label.toLowerCase()}${collapsed ? "-c" : ""}`;
          return (
            <li key={group.label}>
              {collapsed ? (
                index > 0 ? <hr aria-hidden="true" className="mx-2 mb-3 border-line" /> : null
              ) : (
                <p
                  id={headingId}
                  className="mb-2 px-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {group.label}
                </p>
              )}
              <ul aria-label={collapsed ? group.label : undefined} aria-labelledby={collapsed ? undefined : headingId} className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 rounded-ui border-l-2 px-3 py-2 text-sm transition-colors ${
                          collapsed ? "justify-center" : ""
                        } ${
                          active
                            ? "border-brand bg-brand/15 font-semibold text-brand"
                            : "border-transparent text-muted hover:bg-raised hover:text-fg"
                        }`}
                      >
                        <Icon aria-hidden="true" className="size-5 shrink-0" />
                        <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronRight, ChevronsLeft, ChevronsRight, Menu, Terminal, X } from "lucide-react";

import { SidebarNav } from "@/components/sidebar-nav";
import { initials, user } from "@/lib/data";
import { findNav } from "@/lib/nav";

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 rounded-ui px-1 ${collapsed ? "justify-center" : ""}`}
      aria-label="Lumen home"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-ui bg-brand text-on-brand">
        <Terminal aria-hidden="true" className="size-4" />
      </span>
      {collapsed ? null : <span className="font-mono text-lg font-semibold tracking-tight">Lumen</span>}
    </Link>
  );
}

function UserBadge({ showDetails }: { showDetails: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-ui border border-line-strong bg-raised font-mono text-xs font-semibold"
      >
        {initials(user.name)}
      </span>
      {showDetails ? (
        <span className="min-w-0 text-sm">
          <span className="block truncate font-medium">{user.name}</span>
          <span className="block truncate text-xs text-muted">{user.role}</span>
        </span>
      ) : (
        <span className="sr-only">
          {user.name}, {user.role}
        </span>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Lock scroll, focus the close button and close when the viewport becomes desktop-sized.
  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      query.removeEventListener("change", onChange);
    };
  }, [drawerOpen]);

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const current = findNav(pathname);

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-ui focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-brand"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 motion-reduce:transition-none lg:flex ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className={`flex h-14 items-center border-b border-line ${collapsed ? "justify-center px-2" : "px-4"}`}>
          <Brand collapsed={collapsed} />
        </div>
        <SidebarNav collapsed={collapsed} />
        <div className="border-t border-line p-2">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center gap-3 rounded-ui px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-fg ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight aria-hidden="true" className="size-5" />
            ) : (
              <>
                <ChevronsLeft aria-hidden="true" className="size-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
        <div className={`border-t border-line p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <UserBadge showDetails={!collapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-black/70" onClick={closeDrawer} />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onKeyDown={onPanelKeyDown}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface"
          >
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <Brand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-ui text-muted hover:bg-raised hover:text-fg"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            <div className="border-t border-line p-3">
              <UserBadge showDetails />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="flex size-9 items-center justify-center rounded-ui border border-line-strong text-fg hover:bg-raised lg:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm">
              <li className="hidden shrink-0 sm:block">
                <Link href="/" className="font-mono text-muted hover:text-fg">
                  Lumen
                </Link>
              </li>
              {current ? (
                <>
                  <li aria-hidden="true" className="hidden shrink-0 text-muted sm:block">
                    <ChevronRight className="size-4" />
                  </li>
                  <li className="shrink-0 font-mono text-muted">{current.group.label}</li>
                  <li aria-hidden="true" className="shrink-0 text-muted">
                    <ChevronRight className="size-4" />
                  </li>
                  <li aria-current="page" className="truncate font-mono font-semibold text-fg">
                    {current.item.label}
                  </li>
                </>
              ) : (
                <li aria-current="page" className="font-mono font-semibold text-fg">
                  Not found
                </li>
              )}
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted md:inline">{user.email}</span>
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-ui border border-line-strong bg-raised font-mono text-xs font-semibold"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 focus:outline-none sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, PageHeading, StatusBadge, linkClasses } from "@/components/ui";
import { formatDate, projects, summarize, user } from "@/lib/data";

export default function DashboardPage() {
  const s = summarize();
  const firstName = user.name.split(" ")[0];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  const cards = [
    { label: "Open issues", value: String(s.openIssues), note: `across ${s.total} projects` },
    { label: "Active projects", value: String(s.active), note: "shipping this month" },
    { label: "Paused projects", value: String(s.paused), note: "waiting on a decision" },
    { label: "Last update", value: formatDate(s.latest.updated), note: `${s.latest.key}: ${s.latest.name}` },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome back, ${firstName}`}
        description="Here is where your workspace stands today."
      />

      <section aria-label="Summary">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <li key={card.label}>
              <Card className="h-full">
                <p className="text-sm text-muted">{card.label}</p>
                <p className="mt-2 font-mono text-3xl font-semibold text-fg">{card.value}</p>
                <p className="mt-1 text-sm text-muted">{card.note}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <Card className="mt-6" aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className={`inline-flex items-center gap-1 text-sm ${linkClasses}`}>
            All projects
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recent.map((p) => (
            <li key={p.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <span className="w-12 font-mono text-sm font-semibold text-brand">{p.key}</span>
              <span className="min-w-0 flex-1 text-sm">{p.name}</span>
              <StatusBadge status={p.status} />
              <span className="w-24 text-right text-sm text-muted">{formatDate(p.updated)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
```

```tsx components/projects-table.tsx
"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { StatusBadge, inputClasses } from "@/components/ui";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

type Filter = "All" | ProjectStatus;

export function ProjectsTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Filter>("All");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)),
    );
  }, [query, status]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or key"
            className={`${inputClasses} pl-9`}
          />
        </div>
        <div className="sm:w-48">
          <label htmlFor="project-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="project-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Filter)}
            className={inputClasses}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-ui border border-line bg-surface">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Projects in the Acme Labs workspace</caption>
          <thead className="border-b border-line bg-raised text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-mono font-semibold">Key</th>
              <th scope="col" className="px-4 py-3 font-mono font-semibold">Name</th>
              <th scope="col" className="px-4 py-3 font-mono font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-mono font-semibold">Issues</th>
              <th scope="col" className="px-4 py-3 text-right font-mono font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No projects match your filters.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.key} className="hover:bg-raised/60">
                  <th scope="row" className="px-4 py-3 font-mono font-semibold text-brand">{p.key}</th>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right font-mono">{p.issues}</td>
                  <td className="px-4 py-3 text-right text-muted">{formatDate(p.updated)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p role="status" className="mt-3 text-sm text-muted">
        Showing {rows.length} of {projects.length} projects
      </p>
    </div>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";

import { PageHeading } from "@/components/ui";
import { ProjectsTable } from "@/components/projects-table";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeading title="Projects" description="Every project in the workspace, with its open issues and last activity." />
      <ProjectsTable />
    </>
  );
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";

import { Card, PageHeading } from "@/components/ui";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <PageHeading title="Reports" description="Open issues per project, from the latest sync." />
      <Card aria-labelledby="issues-heading">
        <h2 id="issues-heading" className="mb-4 text-lg font-semibold">
          Open issues by project
        </h2>
        <ul className="flex flex-col gap-4">
          {projects.map((p) => (
            <li key={p.key} className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[3rem_10rem_1fr_2.5rem]">
              <span className="font-mono text-sm font-semibold text-brand">{p.key}</span>
              <span className="hidden text-sm sm:block">{p.name}</span>
              <span aria-hidden="true" className="h-3 overflow-hidden rounded-ui bg-raised">
                <span className="block h-full bg-brand" style={{ width: `${(p.issues / max) * 100}%` }} />
              </span>
              <span className="text-right font-mono text-sm">
                {p.issues}
                <span className="sr-only"> open issues in {p.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
```

```tsx components/settings-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";

import { Card, buttonPrimary, inputClasses } from "@/components/ui";
import { user, workspaceName } from "@/lib/data";

function Switch({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p id={`${id}-label`} className="text-sm font-medium">
          {label}
        </p>
        <p id={`${id}-desc`} className="text-sm text-muted">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-ui border transition-colors ${
          checked ? "border-brand bg-brand" : "border-line-strong bg-raised"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 size-4.5 rounded-[2px] transition-all motion-reduce:transition-none ${
            checked ? "left-[1.375rem] bg-on-brand" : "left-0.5 bg-muted"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [workspace, setWorkspace] = useState(workspaceName);
  const [digest, setDigest] = useState(true);
  const [assigned, setAssigned] = useState(true);
  const [releases, setReleases] = useState(false);
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  function touch<T>(setter: (value: T) => void) {
    return (value: T) => {
      setSaved(false);
      setter(value);
    };
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="mb-4 text-lg font-semibold">
          Profile
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => touch(setName)(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input id="email" name="email" type="email" value={user.email} readOnly aria-describedby="email-help" className={inputClasses} />
            <p id="email-help" className="mt-1.5 text-xs text-muted">
              Contact an owner to change the sign-in email.
            </p>
          </div>
          <div>
            <label htmlFor="workspace" className="mb-1.5 block text-sm font-medium">
              Workspace name
            </label>
            <input
              id="workspace"
              name="workspace"
              value={workspace}
              onChange={(e) => touch(setWorkspace)(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
              Role
            </label>
            <input id="role" name="role" value={user.role} readOnly className={inputClasses} />
          </div>
        </div>
      </Card>

      <Card aria-labelledby="notify-heading">
        <h2 id="notify-heading" className="text-lg font-semibold">
          Notifications
        </h2>
        <div className="mt-2 divide-y divide-line">
          <Switch
            id="digest"
            label="Weekly digest"
            description="A Monday summary of open issues and project activity."
            checked={digest}
            onChange={touch(setDigest)}
          />
          <Switch
            id="assigned"
            label="Issue assigned to me"
            description="Email me when someone assigns an issue to me."
            checked={assigned}
            onChange={touch(setAssigned)}
          />
          <Switch
            id="releases"
            label="Product updates"
            description="Occasional notes about new Lumen features."
            checked={releases}
            onChange={touch(setReleases)}
          />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <button type="submit" className={buttonPrimary}>
          Save changes
        </button>
        <p role="status" className="flex items-center gap-1.5 text-sm text-muted">
          {saved ? (
            <>
              <Check aria-hidden="true" className="size-4 text-emerald-300" />
              Settings saved
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";

import { PageHeading } from "@/components/ui";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeading title="Settings" description="Manage your profile and how Lumen contacts you." />
      <div className="max-w-3xl">
        <SettingsForm />
      </div>
    </>
  );
}
```
