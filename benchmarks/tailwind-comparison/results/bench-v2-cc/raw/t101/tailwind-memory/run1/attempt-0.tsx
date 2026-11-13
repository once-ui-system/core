```css app/globals.css
@import "tailwindcss";

/* Lumen design tokens: every screen reads these, no per-element overrides. */
@theme {
  /* Brand */
  --color-brand-50: #f0fdfa;
  --color-brand-100: #ccfbf1;
  --color-brand-600: #0f766e;
  --color-brand-700: #0d625b;
  --color-brand-800: #0a4f49;
  --color-primary: var(--color-brand-600);
  --color-primary-hover: var(--color-brand-700);
  --color-primary-soft: var(--color-brand-50);
  --color-primary-contrast: #ffffff;

  /* Cool slate neutrals (surface, text, borders) */
  --color-surface: #ffffff;
  --color-canvas: #f8fafc;
  --color-line: #e2e8f0;
  --color-line-strong: #cbd5e1;
  --color-ink: #0f172a;
  --color-ink-soft: #475569;
  --color-ink-faint: #64748b;

  /* 2px corners everywhere */
  --radius-xs: 2px;
  --radius-sm: 2px;
  --radius-md: 2px;
  --radius-lg: 2px;
  --radius-xl: 2px;
  --radius-2xl: 2px;

  /* Type */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;

  /* Compact density */
  --spacing: 0.22rem;
  --text-xs: 0.75rem;
  --text-xs--line-height: 1rem;
  --text-sm: 0.8125rem;
  --text-sm--line-height: 1.125rem;
  --text-base: 0.875rem;
  --text-base--line-height: 1.25rem;
  --text-lg: 1rem;
  --text-lg--line-height: 1.375rem;
  --text-xl: 1.125rem;
  --text-xl--line-height: 1.5rem;
  --text-2xl: 1.375rem;
  --text-2xl--line-height: 1.75rem;
}

@layer base {
  :root {
    color-scheme: light;
  }

  html {
    font-size: 16px;
  }

  body {
    background-color: var(--color-canvas);
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-serif);
    color: var(--color-ink);
    font-weight: 600;
    letter-spacing: -0.005em;
  }

  a {
    color: var(--color-primary);
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  ::selection {
    background-color: var(--color-brand-100);
  }
}

@layer components {
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    height: 1.875rem;
    padding: 0 0.75rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-line-strong);
    background-color: var(--color-surface);
    color: var(--color-ink);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
  }
  .btn:hover {
    background-color: var(--color-canvas);
  }
  .btn-primary {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-primary-contrast);
  }
  .btn-primary:hover {
    background-color: var(--color-primary-hover);
  }

  .field {
    height: 1.875rem;
    width: 100%;
    padding: 0 0.5rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-line-strong);
    background-color: var(--color-surface);
    color: var(--color-ink);
    font-size: var(--text-sm);
  }

  .card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-line);
    background-color: var(--color-surface);
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

export interface NavItem {
  label: string;
  href: string;
  icon: "overview" | "reports" | "projects" | "settings";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: "overview" },
      { label: "Reports", href: "/reports", icon: "reports" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic date formatting (same on server and client). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
```

```tsx components/StatusBadge.tsx
import type { ProjectStatus } from "@/lib/data";

const styles: Record<ProjectStatus, string> = {
  Active: "border-brand-600/30 bg-primary-soft text-brand-800",
  Paused: "border-amber-300 bg-amber-50 text-amber-900",
  Archived: "border-line-strong bg-canvas text-ink-soft",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-px text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
```

```tsx components/Shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ChevronRight,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from "lucide-react";
import { navGroups, user, type NavGroup, type NavItem } from "@/lib/data";

const icons = {
  overview: LayoutDashboard,
  reports: FileText,
  projects: FolderKanban,
  settings: Settings,
} as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function findCurrent(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group, item };
    }
  }
  return null;
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-sm px-1 text-ink no-underline"
      aria-label="Lumen home"
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary font-serif text-sm font-semibold text-primary-contrast"
      >
        L
      </span>
      {!collapsed && <span className="font-serif text-lg font-semibold text-ink">Lumen</span>}
    </Link>
  );
}

function NavList({
  pathname,
  collapsed,
  onNavigate,
  idPrefix,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
  idPrefix: string;
}) {
  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-2 py-3">
      <ul className="flex flex-col gap-4">
        {navGroups.map((group) => {
          const labelId = `${idPrefix}-${group.label.toLowerCase()}`;
          return (
            <li key={group.label}>
              {collapsed ? (
                <div className="mx-2 mb-1 border-t border-line" role="presentation" />
              ) : (
                <p
                  id={labelId}
                  className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-ink-faint"
                >
                  {group.label}
                </p>
              )}
              <ul aria-labelledby={collapsed ? undefined : labelId} aria-label={collapsed ? group.label : undefined} className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = icons[item.icon];
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        className={`flex h-8 items-center gap-2 rounded-sm px-2 text-sm font-medium no-underline ${
                          collapsed ? "justify-center" : ""
                        } ${
                          active
                            ? "bg-primary text-primary-contrast"
                            : "text-ink-soft hover:bg-line/60 hover:text-ink"
                        }`}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
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

function UserBlock({ collapsed }: { collapsed?: boolean }) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <div className={`flex items-center gap-2 border-t border-line p-3 ${collapsed ? "justify-center" : ""}`}>
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-line text-xs font-semibold text-ink-soft"
      >
        {initials}
      </span>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{user.name}</p>
          <p className="truncate text-xs text-ink-faint">{user.role}</p>
        </div>
      )}
      {collapsed && <span className="sr-only">{user.name}, {user.role}</span>}
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const current = findCurrent(pathname);

  // Close the drawer after navigating.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Drawer: focus management, Escape, focus trap, scroll lock.
  useEffect(() => {
    if (!drawerOpen) return;
    const trigger = menuButtonRef.current;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
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
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-3 focus:py-1.5 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-150 md:flex ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        <div className={`flex h-12 items-center border-b border-line px-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          <Brand collapsed={collapsed} />
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              aria-expanded={true}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-faint hover:bg-line/60 hover:text-ink"
            >
              <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <div className="flex justify-center border-b border-line py-1.5">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              aria-expanded={false}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-ink-faint hover:bg-line/60 hover:text-ink"
            >
              <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}
        <NavList pathname={pathname} collapsed={collapsed} idPrefix="side" />
        <UserBlock collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col border-r border-line bg-surface shadow-lg"
          >
            <div className="flex h-12 items-center justify-between border-b border-line px-2">
              <Brand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-sm text-ink-soft hover:bg-line/60"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <NavList
              pathname={pathname}
              collapsed={false}
              idPrefix="drawer"
              onNavigate={() => setDrawerOpen(false)}
            />
            <UserBlock />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-line bg-surface px-3 sm:px-5">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-ink-soft hover:bg-line/60 md:hidden"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1 text-sm text-ink-faint">
              <li className="hidden sm:block">Lumen</li>
              <li aria-hidden="true" className="hidden sm:block">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              {current ? (
                <>
                  <li>{current.group.label}</li>
                  <li aria-hidden="true">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </li>
                  <li aria-current="page" className="truncate font-medium text-ink">
                    {current.item.label}
                  </li>
                </>
              ) : (
                <li aria-current="page" className="font-medium text-ink">
                  Not found
                </li>
              )}
            </ol>
          </nav>

          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Activity aria-hidden="true" className="h-4 w-4 text-primary" />
            <span className="text-xs text-ink-faint">{user.email}</span>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-3 py-5 sm:px-5 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "Lumen",
  description: "Product analytics and issue tracking for small software teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "currently in progress" },
    { label: "Paused projects", value: String(paused), note: "waiting to resume" },
    { label: "Last update", value: formatDate(latest.updated), note: latest.name },
  ];

  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          Here is where your workspace stands today.
        </p>
      </div>

      <section aria-label="Summary">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <li key={c.label} className="card p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{c.label}</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-ink">{c.value}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="card">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <h2 id="recent-heading" className="text-lg">
            Recently updated
          </h2>
          <Link href="/projects" className="text-sm font-medium underline-offset-2 hover:underline">
            All projects
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recent.map((p) => (
            <li key={p.key} className="flex items-center gap-3 px-3 py-2">
              <span className="w-10 shrink-0 font-mono text-xs font-semibold text-ink-soft">{p.key}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{p.name}</span>
              <StatusBadge status={p.status} />
              <span className="hidden text-xs text-ink-faint sm:inline">{formatDate(p.updated)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects | Lumen" };

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Projects</h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          {projects.length} projects in the Acme Labs workspace.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead>
            <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-faint">
              <th scope="col" className="px-3 py-1.5 font-semibold">Key</th>
              <th scope="col" className="px-3 py-1.5 font-semibold">Name</th>
              <th scope="col" className="px-3 py-1.5 font-semibold">Status</th>
              <th scope="col" className="px-3 py-1.5 text-right font-semibold">Issues</th>
              <th scope="col" className="px-3 py-1.5 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((p) => (
              <tr key={p.key} className="hover:bg-canvas">
                <td className="px-3 py-1.5 font-mono text-xs font-semibold text-ink-soft">{p.key}</td>
                <th scope="row" className="px-3 py-1.5 font-medium text-ink">{p.name}</th>
                <td className="px-3 py-1.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">{p.issues}</td>
                <td className="px-3 py-1.5 tabular-nums text-ink-soft">
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
import type { Metadata } from "next";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports | Lumen" };

export default function ReportsPage() {
  const total = projects.reduce((sum, p) => sum + p.issues, 0);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Reports</h1>
        <p className="mt-0.5 text-sm text-ink-soft">Open issues by project.</p>
      </div>
      <div className="card p-3">
        <ul className="flex flex-col gap-2">
          {projects.map((p) => {
            const pct = total === 0 ? 0 : Math.round((p.issues / total) * 100);
            return (
              <li key={p.key} className="grid grid-cols-[3rem_1fr_4.5rem] items-center gap-3 text-sm">
                <span className="font-mono text-xs font-semibold text-ink-soft">{p.key}</span>
                <div className="h-2 rounded-sm bg-line" aria-hidden="true">
                  <div className="h-2 rounded-sm bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-right tabular-nums text-ink-soft">
                  {p.issues} ({pct}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
```

```tsx app/settings/page.tsx
"use client";

import { useState } from "react";
import { user } from "@/lib/data";

function Switch({
  checked,
  onChange,
  labelId,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelId: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-sm border transition-colors ${
        checked ? "border-primary bg-primary" : "border-line-strong bg-line"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-xs bg-white transition-[left] ${
          checked ? "left-[1.1rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Settings</h1>
        <p className="mt-0.5 text-sm text-ink-soft">Your profile and notification preferences.</p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <section aria-labelledby="profile-heading" className="card">
          <h2 id="profile-heading" className="border-b border-line px-3 py-2 text-lg">
            Profile
          </h2>
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs font-medium text-ink-soft">
                Full name
              </label>
              <input
                id="name"
                className="field"
                value={name}
                autoComplete="name"
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-medium text-ink-soft">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field"
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-xs font-medium text-ink-soft">
                Role
              </label>
              <input id="role" className="field bg-canvas text-ink-soft" value={user.role} readOnly />
            </div>
          </div>
        </section>

        <section aria-labelledby="notif-heading" className="card">
          <h2 id="notif-heading" className="border-b border-line px-3 py-2 text-lg">
            Notifications
          </h2>
          <ul className="divide-y divide-line">
            {[
              { id: "n-weekly", label: "Weekly analytics summary", hint: "Sent every Monday morning.", value: weekly, set: setWeekly },
              { id: "n-mentions", label: "Mentions and assignments", hint: "When someone assigns you an issue or mentions you.", value: mentions, set: setMentions },
              { id: "n-digest", label: "Daily issue digest", hint: "A short list of what changed overnight.", value: digest, set: setDigest },
            ].map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p id={row.id} className="text-sm font-medium text-ink">
                    {row.label}
                  </p>
                  <p className="text-xs text-ink-faint">{row.hint}</p>
                </div>
                <Switch
                  checked={row.value}
                  labelId={row.id}
                  onChange={(v) => {
                    row.set(v);
                    setSaved(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
          <p role="status" className="text-sm text-ink-soft">
            {saved ? "Settings saved." : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
```
