```css app/globals.css
@import "tailwindcss";

/* Lumen design tokens: every screen reads colour, radius and type from here. */
@theme {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;

  /* Brand: #0F766E is brand-700 (primary buttons, current nav item, links, focus rings). */
  --color-brand-50: #f0fdfa;
  --color-brand-100: #ccfbf1;
  --color-brand-200: #99f6e4;
  --color-brand-300: #5eead4;
  --color-brand-400: #2dd4bf;
  --color-brand-500: #14b8a6;
  --color-brand-600: #0d9488;
  --color-brand-700: #0f766e;
  --color-brand-800: #115e59;
  --color-brand-900: #134e4a;

  /* Cool slate neutrals. */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;

  /* 2px corners on buttons, inputs, cards and menus. */
  --radius-xs: 2px;
  --radius-sm: 2px;
  --radius-md: 2px;
  --radius-lg: 2px;
  --radius-xl: 2px;
  --radius-2xl: 2px;

  /* Compact density. */
  --text-xs: 0.75rem;
  --text-xs--line-height: 1rem;
  --text-sm: 0.8125rem;
  --text-sm--line-height: 1.125rem;
}

@layer base {
  :root {
    color-scheme: light;
  }

  body {
    background-color: var(--color-slate-50);
    color: var(--color-slate-800);
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-serif);
    color: var(--color-slate-900);
    letter-spacing: -0.005em;
  }

  a {
    color: var(--color-brand-700);
  }

  :focus-visible {
    outline: 2px solid var(--color-brand-700);
    outline-offset: 2px;
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

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export interface Report {
  name: string;
  description: string;
  cadence: string;
  lastRun: string;
}

export const reports: Report[] = [
  {
    name: "Issue throughput",
    description: "Issues opened and closed per project, by week.",
    cadence: "Weekly",
    lastRun: "2026-10-13",
  },
  {
    name: "Open issues by project",
    description: "Open issue count for every active and paused project.",
    cadence: "Daily",
    lastRun: "2026-10-14",
  },
  {
    name: "Team activity",
    description: "Comments, status changes and assignments per member.",
    cadence: "Monthly",
    lastRun: "2026-10-01",
  },
];

/** Dates are fixed ISO strings; format in UTC so server and client agree. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
```

```ts lib/nav.ts
import {
  ChartColumn,
  FileText,
  FolderKanban,
  LayoutDashboard,
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
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/reports", icon: ChartColumn },
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

export const brandIcon = FileText;

export function findCurrent(pathname: string): { group: NavGroup; item: NavItem } | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === path) return { group, item };
    }
  }
  return null;
}
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronsLeft, ChevronsRight, Menu, X } from "lucide-react";
import { initials, user } from "@/lib/data";
import { brandIcon as BrandIcon, findCurrent, navGroups } from "@/lib/nav";

function NavList({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const current = findCurrent(pathname);
  return (
    <nav aria-label="Main" className="flex flex-col gap-3 px-2 py-3">
      {navGroups.map((group, gi) => (
        <div
          key={group.label}
          role="group"
          aria-labelledby={`nav-group-${gi}`}
          className={collapsed && gi > 0 ? "border-t border-slate-200 pt-3" : undefined}
        >
          <h2
            id={`nav-group-${gi}`}
            className={
              collapsed
                ? "sr-only"
                : "mb-1 px-2 font-sans text-xs font-semibold uppercase tracking-wide text-slate-500"
            }
          >
            {group.label}
          </h2>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = current?.item.href === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`flex h-8 items-center gap-2 rounded-md px-2 text-sm font-medium no-underline ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active
                        ? "bg-brand-700 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex h-12 items-center gap-2 border-b border-slate-200 px-3 text-slate-900 no-underline ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-700 text-white">
        <BrandIcon aria-hidden="true" className="size-3.5" />
      </span>
      <span className={collapsed ? "sr-only" : "font-serif text-base font-semibold"}>Lumen</span>
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

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    closeButtonRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  const current = findCurrent(pathname);

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-1.5 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white md:flex ${
          collapsed ? "w-12" : "w-56"
        }`}
      >
        <Brand collapsed={collapsed} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavList pathname={pathname} collapsed={collapsed} />
        </div>
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={`flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight aria-hidden="true" className="size-4" />
            ) : (
              <>
                <ChevronsLeft aria-hidden="true" className="size-4" />
                <span>Collapse</span>
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
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col bg-white shadow-lg"
          >
            <div className="flex h-12 items-center justify-between border-b border-slate-200 pr-2">
              <Brand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close navigation"
                className="flex size-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <NavList pathname={pathname} collapsed={false} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:px-4">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="flex size-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden"
          >
            <Menu aria-hidden="true" className="size-4" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 truncate text-sm text-slate-500">
              <li>
                <Link href="/">Lumen</Link>
              </li>
              {current && (
                <>
                  <li aria-hidden="true">/</li>
                  <li className="hidden sm:block">{current.group.label}</li>
                  <li aria-hidden="true" className="hidden sm:block">
                    /
                  </li>
                  <li aria-current="page" className="truncate font-medium text-slate-900">
                    {current.item.label}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-md bg-slate-200 text-xs font-semibold text-slate-700"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" className="flex-1 px-3 py-4 sm:px-6 sm:py-5">
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
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Lumen",
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

```tsx app/page.tsx
import Link from "next/link";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects
    .filter((p) => p.status !== "Archived")
    .reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: "Across active and paused projects" },
    { label: "Active projects", value: String(active), note: `${paused} paused, ${projects.length - active - paused} archived` },
    { label: "Last activity", value: latest.key, note: `${latest.name}, ${formatDate(latest.updated)}` },
  ];

  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-0.5 text-slate-600">Here is where your projects stand today.</p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label} className="rounded-md border border-slate-200 bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-0.5 text-xs text-slate-600">{card.note}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-heading" className="rounded-md border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
          <h2 id="recent-heading" className="text-base font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className="text-sm font-medium underline-offset-2 hover:underline">
            All projects
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recent.map((p) => (
            <li key={p.key} className="flex items-center justify-between gap-3 px-3 py-1.5">
              <span className="min-w-0 truncate">
                <span className="mr-2 font-mono text-xs text-slate-500">{p.key}</span>
                {p.name}
              </span>
              <span className="shrink-0 text-xs text-slate-500">{formatDate(p.updated)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

```tsx app/projects/page.tsx
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusStyles: Record<ProjectStatus, string> = {
  Active: "border-brand-200 bg-brand-50 text-brand-800",
  Paused: "border-slate-300 bg-slate-100 text-slate-700",
  Archived: "border-slate-200 bg-white text-slate-500",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Projects</h1>
        <p className="mt-0.5 text-slate-600">{projects.length} projects in this workspace.</p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white">
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="w-16 px-3 py-1.5 font-medium">
                Key
              </th>
              <th scope="col" className="px-3 py-1.5 font-medium">
                Name
              </th>
              <th scope="col" className="w-24 px-3 py-1.5 font-medium">
                Status
              </th>
              <th scope="col" className="w-16 px-3 py-1.5 text-right font-medium">
                Issues
              </th>
              <th scope="col" className="hidden w-32 px-3 py-1.5 font-medium sm:table-cell">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.key} className="hover:bg-slate-50">
                <td className="px-3 py-1.5 font-mono text-xs text-slate-600">{p.key}</td>
                <td className="truncate px-3 py-1.5 font-medium text-slate-900">{p.name}</td>
                <td className="px-3 py-1.5">
                  <span
                    className={`inline-block rounded-md border px-1.5 text-xs font-medium ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">{p.issues}</td>
                <td className="hidden px-3 py-1.5 text-slate-600 sm:table-cell">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

```tsx app/reports/page.tsx
import { formatDate, reports } from "@/lib/data";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="mt-0.5 text-slate-600">Scheduled summaries of your workspace.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <li key={r.name} className="rounded-md border border-slate-200 bg-white p-3">
            <h2 className="text-base font-semibold">{r.name}</h2>
            <p className="mt-1 text-slate-600">{r.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              {r.cadence} · last run <time dateTime={r.lastRun}>{formatDate(r.lastRun)}</time>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { useState } from "react";
import { user } from "@/lib/data";

const inputClass =
  "h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500";

export default function SettingsPage() {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-0.5 text-slate-600">Your profile and notification preferences.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
        className="max-w-xl space-y-4"
      >
        <section aria-labelledby="profile-heading" className="rounded-md border border-slate-200 bg-white p-3">
          <h2 id="profile-heading" className="mb-3 text-base font-semibold">
            Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-slate-700">
                Full name
              </label>
              <input
                id="name"
                className={inputClass}
                value={name}
                autoComplete="name"
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={inputClass}
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-xs font-medium text-slate-700">
                Role
              </label>
              <input id="role" className={inputClass} value={user.role} disabled readOnly />
            </div>
          </div>
        </section>

        <section aria-labelledby="notify-heading" className="rounded-md border border-slate-200 bg-white p-3">
          <h2 id="notify-heading" className="mb-3 text-base font-semibold">
            Notifications
          </h2>
          <ul className="space-y-2">
            {[
              { id: "digest", label: "Weekly digest email", value: digest, set: setDigest },
              { id: "alerts", label: "Alert when an issue is assigned to me", value: alerts, set: setAlerts },
            ].map((opt) => (
              <li key={opt.id} className="flex items-center justify-between gap-3">
                <span id={`${opt.id}-label`}>{opt.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={opt.value}
                  aria-labelledby={`${opt.id}-label`}
                  onClick={() => {
                    opt.set(!opt.value);
                    setSaved(false);
                  }}
                  className={`relative h-5 w-9 shrink-0 rounded-md border ${
                    opt.value ? "border-brand-700 bg-brand-700" : "border-slate-300 bg-slate-200"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-0.5 size-3.5 rounded-xs bg-white ${
                      opt.value ? "left-[1.125rem]" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="h-8 rounded-md bg-brand-700 px-3 text-sm font-medium text-white hover:bg-brand-800"
          >
            Save changes
          </button>
          <p role="status" className="text-sm text-slate-600">
            {saved ? "Settings saved." : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
```
