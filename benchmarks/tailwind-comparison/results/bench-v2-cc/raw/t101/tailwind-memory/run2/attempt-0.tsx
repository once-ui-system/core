```css app/globals.css
@import "tailwindcss";

/* Lumen design tokens: every screen reads colours, type and radius from here. */
@theme {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;

  /* Brand #0F766E */
  --color-brand: #0f766e;
  --color-brand-hover: #115e59;
  --color-brand-soft: #e6f4f2;
  --color-brand-ink: #134e4a;

  /* Cool slate neutrals */
  --color-canvas: #f8fafc;
  --color-surface: #ffffff;
  --color-line: #e2e8f0;
  --color-line-strong: #cbd5e1;
  --color-ink: #0f172a;
  --color-ink-muted: #475569;
  --color-ink-subtle: #64748b;

  /* 2px corners on buttons, inputs, cards and menus */
  --radius-xs: 2px;
  --radius-sm: 2px;
  --radius-md: 2px;
  --radius-lg: 2px;
  --radius-xl: 2px;
  --radius-2xl: 2px;

  /* Compact density */
  --text-xs: 0.75rem;
  --text-xs--line-height: 1rem;
  --text-sm: 0.8125rem;
  --text-sm--line-height: 1.125rem;
  --text-base: 0.875rem;
  --text-base--line-height: 1.25rem;
}

@layer base {
  html {
    color-scheme: light;
  }

  body {
    background-color: var(--color-canvas);
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    line-height: 1.125rem;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-serif);
    color: var(--color-ink);
    letter-spacing: -0.005em;
  }

  a {
    text-underline-offset: 2px;
  }

  :focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 2px;
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

/** Deterministic "12 Oct 2026" from an ISO date, identical on server and client. */
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

```tsx lib/nav.ts
import type { LucideIcon } from "lucide-react";
import { FileText, Folder, LayoutDashboard, Settings } from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: Folder },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function findCrumbs(pathname: string): { group: string; item: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, item: item.label };
    }
  }
  return null;
}
```

```tsx components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { navGroups } from "@/lib/nav";

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-2 py-3">
      <ul className="flex flex-col gap-3">
        {navGroups.map((group) => {
          const isOpen = collapsed || !closed[group.label];
          const listId = `nav-group-${group.label.toLowerCase()}`;
          return (
            <li key={group.label}>
              {collapsed ? (
                <div className="mx-2 mb-1 border-t border-line" role="presentation" />
              ) : (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={listId}
                  onClick={() =>
                    setClosed((prev) => ({ ...prev, [group.label]: !prev[group.label] }))
                  }
                  className="mb-1 flex w-full items-center justify-between rounded-sm px-2 py-1 text-xs font-semibold uppercase tracking-wider text-ink-subtle hover:text-ink"
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-3.5 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                </button>
              )}
              <ul id={listId} hidden={!isOpen} className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`flex h-8 items-center gap-2.5 rounded-sm px-2 text-sm font-medium ${
                          collapsed ? "justify-center" : ""
                        } ${
                          active
                            ? "bg-brand text-white"
                            : "text-ink-muted hover:bg-slate-100 hover:text-ink"
                        }`}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
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

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { findCrumbs } from "@/lib/nav";
import { initials, user } from "@/lib/data";

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-sm" aria-label="Lumen home">
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-brand font-serif text-sm font-bold text-white"
      >
        L
      </span>
      {!compact && <span className="font-serif text-base font-semibold text-ink">Lumen</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const crumbs = findCrumbs(pathname);

  // Close the drawer after navigating.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Drawer behaviour: focus, Escape, focus trap, scroll lock, focus return.
  useEffect(() => {
    if (drawerOpen) {
      wasOpen.current = true;
      closeButtonRef.current?.focus();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setDrawerOpen(false);
          return;
        }
        if (event.key !== "Tab" || !drawerRef.current) return;
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
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
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      menuButtonRef.current?.focus();
    }
    return undefined;
  }, [drawerOpen]);

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-brand px-3 py-1.5 text-white focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface md:flex ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        <div
          className={`flex h-11 items-center border-b border-line ${
            collapsed ? "justify-center" : "px-3"
          }`}
        >
          <Brand compact={collapsed} />
        </div>
        <Sidebar collapsed={collapsed} />
        <div className={`border-t border-line p-2 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 items-center gap-2.5 rounded-sm px-2 text-sm font-medium text-ink-muted hover:bg-slate-100 hover:text-ink"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <>
                <PanelLeftClose aria-hidden="true" className="size-4" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col border-r border-line bg-surface shadow-lg"
          >
            <div className="flex h-11 items-center justify-between border-b border-line px-3">
              <Brand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="flex size-8 items-center justify-center rounded-sm text-ink-muted hover:bg-slate-100 hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-11 items-center gap-2 border-b border-line bg-surface px-3 sm:px-5">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav"
            className="flex size-8 items-center justify-center rounded-sm text-ink-muted hover:bg-slate-100 hover:text-ink md:hidden"
          >
            <Menu aria-hidden="true" className="size-4" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-sm text-ink-subtle">
              <li className="shrink-0">
                <Link href="/" className="rounded-sm hover:text-ink hover:underline">
                  Lumen
                </Link>
              </li>
              {crumbs && (
                <>
                  <li aria-hidden="true" className="shrink-0">
                    /
                  </li>
                  <li className="hidden shrink-0 sm:block">{crumbs.group}</li>
                  <li aria-hidden="true" className="hidden shrink-0 sm:block">
                    /
                  </li>
                  <li aria-current="page" className="truncate font-medium text-ink">
                    {crumbs.item}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-xs font-medium text-ink">{user.name}</p>
              <p className="text-xs text-ink-subtle">{user.role}</p>
            </div>
            <span
              role="img"
              aria-label={`${user.name}, ${user.role}`}
              className="flex size-7 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-ink"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" className="flex-1 px-3 py-4 sm:px-5">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

```tsx components/PageTitle.tsx
export function PageTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="font-serif text-xl font-semibold">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}
```

```tsx components/StatusBadge.tsx
import type { ProjectStatus } from "@/lib/data";

const styles: Record<ProjectStatus, string> = {
  Active: "bg-brand-soft text-brand-ink ring-brand/30",
  Paused: "bg-amber-50 text-amber-800 ring-amber-600/30",
  Archived: "bg-slate-100 text-slate-600 ring-slate-400/40",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, projects, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Active projects", value: active, note: `of ${projects.length} in the workspace` },
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Paused projects", value: paused, note: "waiting on a decision" },
    { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];

  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <>
      <PageTitle
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where the workspace stands today."
      />

      <section aria-label="Summary">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <li
              key={card.label}
              className="rounded-sm border border-line bg-surface px-3 py-2.5"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
                {card.label}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">{card.value}</p>
              <p className="mt-0.5 text-xs text-ink-subtle">{card.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 id="recent-heading" className="font-serif text-base font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className="text-sm font-medium text-brand hover:underline">
            All projects
          </Link>
        </div>
        <ul className="divide-y divide-line rounded-sm border border-line bg-surface">
          {recent.map((project) => (
            <li key={project.key} className="flex items-center gap-3 px-3 py-2">
              <span className="w-10 shrink-0 font-mono text-xs font-semibold text-ink-muted">
                {project.key}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{project.name}</span>
              <StatusBadge status={project.status} />
              <span className="hidden w-24 shrink-0 text-right text-xs text-ink-subtle sm:block">
                {formatDate(project.updated)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageTitle
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <div className="overflow-x-auto rounded-sm border border-line bg-surface">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="border-b border-line bg-slate-50 text-xs uppercase tracking-wider text-ink-subtle">
            <tr>
              <th scope="col" className="px-3 py-1.5 font-semibold">
                Key
              </th>
              <th scope="col" className="px-3 py-1.5 font-semibold">
                Name
              </th>
              <th scope="col" className="px-3 py-1.5 font-semibold">
                Status
              </th>
              <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                Issues
              </th>
              <th scope="col" className="px-3 py-1.5 text-right font-semibold">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((project) => (
              <tr key={project.key} className="hover:bg-slate-50">
                <td className="px-3 py-1.5 font-mono text-xs font-semibold text-ink-muted">
                  {project.key}
                </td>
                <th scope="row" className="px-3 py-1.5 font-medium">
                  {project.name}
                </th>
                <td className="px-3 py-1.5">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">{project.issues}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right text-ink-muted">
                  <time dateTime={project.updated}>{formatDate(project.updated)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <PageTitle title="Reports" description="Open issues per project." />
      <section
        aria-label="Open issues by project"
        className="rounded-sm border border-line bg-surface p-3"
      >
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.key} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm">{project.name}</span>
              <div className="h-2 flex-1 rounded-sm bg-slate-100" aria-hidden="true">
                <div
                  className="h-2 rounded-sm bg-brand"
                  style={{ width: `${(project.issues / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm tabular-nums">
                {project.issues}
                <span className="sr-only"> open issues</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { user } from "@/lib/data";

const inputClass =
  "h-8 w-full rounded-sm border border-line-strong bg-surface px-2 text-sm text-ink placeholder:text-ink-subtle disabled:bg-slate-100 disabled:text-ink-subtle";

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [assigned, setAssigned] = useState(true);
  const [status, setStatus] = useState("");

  return (
    <>
      <PageTitle title="Settings" description="Your profile and notification preferences." />

      <form
        className="flex max-w-xl flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus("Settings saved.");
        }}
      >
        <fieldset className="rounded-sm border border-line bg-surface p-3">
          <legend className="px-1 font-serif text-base font-semibold">Profile</legend>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-ink-muted">
                Full name
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setStatus("");
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("");
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-xs font-medium text-ink-muted">
                Role
              </label>
              <input id="role" value={user.role} disabled className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-sm border border-line bg-surface p-3">
          <legend className="px-1 font-serif text-base font-semibold">Notifications</legend>
          <div className="mt-1 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={weekly}
                onChange={(e) => {
                  setWeekly(e.target.checked);
                  setStatus("");
                }}
                className="size-4 rounded-sm accent-brand"
              />
              Weekly summary of project activity
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={assigned}
                onChange={(e) => {
                  setAssigned(e.target.checked);
                  setStatus("");
                }}
                className="size-4 rounded-sm accent-brand"
              />
              Email me when an issue is assigned to me
            </label>
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="h-8 rounded-sm bg-brand px-3 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Save changes
          </button>
          <p role="status" aria-live="polite" className="text-sm text-brand">
            {status}
          </p>
        </div>
      </form>
    </>
  );
}
```
