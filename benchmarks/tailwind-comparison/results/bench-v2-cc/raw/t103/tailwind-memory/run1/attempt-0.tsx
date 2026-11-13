```css app/globals.css
@import "tailwindcss";

@theme {
  /* Brand: #E8590C */
  --color-brand-300: #f7b58a;
  --color-brand-400: #f2873f;
  --color-brand-500: #e8590c;
  --color-brand-600: #c2480a;
  --color-brand-700: #9a3a08;

  /* Warm stone neutrals, named by role (dark is the default theme) */
  --color-canvas: #0c0a09;
  --color-surface: #1c1917;
  --color-raised: #292524;
  --color-line: #44403c;
  --color-fg: #fafaf9;
  --color-muted: #a8a29e;
  --color-on-brand: #0c0a09;

  /* 4px corner radius everywhere */
  --radius-xs: 4px;
  --radius-sm: 4px;
  --radius-md: 4px;
  --radius-lg: 4px;
  --radius-xl: 4px;
  --radius-2xl: 4px;

  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, monospace;
}

@layer base {
  html {
    color-scheme: dark;
    background-color: var(--color-canvas);
  }

  body {
    background-color: var(--color-canvas);
    color: var(--color-fg);
    font-family: var(--font-sans);
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
    outline: 2px solid var(--color-brand-500);
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

export interface User {
  name: string;
  email: string;
  role: string;
}

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user: User = {
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

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const summary = {
  activeProjects: projects.filter((p) => p.status === "Active").length,
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  pausedProjects: projects.filter((p) => p.status === "Paused").length,
  archivedProjects: projects.filter((p) => p.status === "Archived").length,
};
```

```ts lib/nav.ts
import {
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
  id: string;
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    id: "workspace",
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
      if (item.href === pathname) return { group, item };
    }
  }
  return null;
}
```

```tsx components/StatusBadge.tsx
import type { ProjectStatus } from "@/lib/data";

const tones: Record<ProjectStatus, string> = {
  Active: "border-emerald-700 bg-emerald-950 text-emerald-300",
  Paused: "border-amber-700 bg-amber-950 text-amber-300",
  Archived: "border-line bg-raised text-muted",
};

const dots: Record<ProjectStatus, string> = {
  Active: "bg-emerald-400",
  Paused: "bg-amber-400",
  Archived: "bg-stone-500",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs ${tones[status]}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}
```

```tsx components/NavList.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { navGroups } from "@/lib/nav";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export default function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Primary">
      <ul className="flex flex-col gap-4">
        {navGroups.map((group, index) => {
          const isClosed = !collapsed && closed[group.id] === true;
          const listId = `nav-group-${group.id}`;
          return (
            <li key={group.id}>
              {collapsed ? (
                index > 0 && <hr className="mb-4 border-line" aria-hidden="true" />
              ) : (
                <button
                  type="button"
                  aria-expanded={!isClosed}
                  aria-controls={listId}
                  onClick={() => setClosed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                  className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-fg"
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-4 transition-transform ${isClosed ? "-rotate-90" : ""}`}
                  />
                </button>
              )}
              <ul id={listId} hidden={isClosed} aria-label={group.label} className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                          collapsed ? "justify-center" : ""
                        } ${
                          active
                            ? "border-brand-500 bg-brand-500/15 text-brand-300"
                            : "border-transparent text-muted hover:bg-raised hover:text-fg"
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
import { Activity, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import NavList from "@/components/NavList";
import { initials, user } from "@/lib/data";
import { findNav } from "@/lib/nav";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-md font-mono text-lg font-semibold">
      <span className="grid size-8 place-items-center rounded-md bg-brand-500 text-on-brand">
        <Activity aria-hidden="true" className="size-5" />
      </span>
      <span className={compact ? "sr-only" : ""}>Lumen</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const current = findNav(pathname);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const menuButton = menuButtonRef.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
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
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [drawerOpen]);

  const iconButton =
    "inline-flex size-9 items-center justify-center rounded-md border border-line text-muted hover:bg-raised hover:text-fg";

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-brand-500 px-3 py-2 text-on-brand focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 md:flex ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className={`flex h-16 items-center border-b border-line ${collapsed ? "justify-center" : "px-4"}`}>
          <Brand compact={collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Brand />
              <button
                ref={closeRef}
                type="button"
                className={iconButton}
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavList onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6">
          <button
            ref={menuButtonRef}
            type="button"
            className={`${iconButton} md:hidden`}
            aria-label="Open navigation"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            className={`${iconButton} hidden md:inline-flex`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-5" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-5" />
            )}
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-sm text-muted">
              <li className="hidden sm:block">
                <Link href="/" className="rounded-md hover:text-fg">
                  Lumen
                </Link>
              </li>
              {current && (
                <>
                  <li aria-hidden="true" className="hidden sm:block">
                    <ChevronRight className="size-4" />
                  </li>
                  <li>{current.group.label}</li>
                  <li aria-hidden="true">
                    <ChevronRight className="size-4" />
                  </li>
                  <li aria-current="page" className="truncate font-medium text-fg">
                    {current.item.label}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">{user.role}</p>
            </div>
            <span
              role="img"
              aria-label={`Signed in as ${user.name}`}
              className="grid size-9 place-items-center rounded-md border border-line bg-raised font-mono text-xs"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```tsx components/PageHeading.tsx
export default function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
    </div>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import { useId, useState } from "react";
import { user } from "@/lib/data";

interface Toggles {
  digest: boolean;
  assigned: boolean;
  regressions: boolean;
}

const toggleLabels: { id: keyof Toggles; label: string; hint: string }[] = [
  { id: "digest", label: "Weekly digest", hint: "A Monday summary of open issues and usage trends." },
  { id: "assigned", label: "Issue assignments", hint: "Email me when an issue is assigned to me." },
  { id: "regressions", label: "Regression alerts", hint: "Notify me when an error rate rises after a release." },
];

const inputClass =
  "mt-1.5 block w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-fg placeholder:text-muted disabled:cursor-not-allowed disabled:text-muted";

export default function SettingsForm() {
  const baseId = useId();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [toggles, setToggles] = useState<Toggles>({ digest: true, assigned: true, regressions: false });
  const [saved, setSaved] = useState(false);

  function flip(id: keyof Toggles) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <section aria-labelledby={`${baseId}-profile`} className="rounded-md border border-line bg-surface p-5 sm:p-6">
        <h2 id={`${baseId}-profile`} className="text-lg font-semibold">
          Profile
        </h2>
        <p className="mt-1 text-sm text-muted">How you appear to your team in Lumen.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${baseId}-name`} className="text-sm font-medium">
              Full name
            </label>
            <input
              id={`${baseId}-name`}
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
            <label htmlFor={`${baseId}-email`} className="text-sm font-medium">
              Email
            </label>
            <input
              id={`${baseId}-email`}
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
            <label htmlFor={`${baseId}-role`} className="text-sm font-medium">
              Role
            </label>
            <input id={`${baseId}-role`} className={inputClass} value={user.role} disabled readOnly />
          </div>
        </div>
      </section>

      <section aria-labelledby={`${baseId}-notify`} className="rounded-md border border-line bg-surface p-5 sm:p-6">
        <h2 id={`${baseId}-notify`} className="text-lg font-semibold">
          Notifications
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {toggleLabels.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p id={`${baseId}-${t.id}`} className="text-sm font-medium">
                  {t.label}
                </p>
                <p id={`${baseId}-${t.id}-hint`} className="text-sm text-muted">
                  {t.hint}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={toggles[t.id]}
                aria-labelledby={`${baseId}-${t.id}`}
                aria-describedby={`${baseId}-${t.id}-hint`}
                onClick={() => flip(t.id)}
                className={`relative h-6 w-11 shrink-0 rounded-md border transition-colors ${
                  toggles[t.id] ? "border-brand-500 bg-brand-500" : "border-line bg-raised"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0.5 size-4.5 rounded-sm transition-all ${
                    toggles[t.id] ? "left-5.5 bg-on-brand" : "left-0.5 bg-muted"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-on-brand hover:bg-brand-400"
        >
          Save changes
        </button>
        <p role="status" className="text-sm text-muted">
          {saved ? "Settings saved." : ""}
        </p>
      </div>
    </form>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s · Lumen" },
  description: "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas font-sans text-fg antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, projects, summary, user } from "@/lib/data";

export const metadata: Metadata = { title: "Overview" };

const cards = [
  { label: "Active projects", value: summary.activeProjects, note: "Shipping this quarter" },
  { label: "Open issues", value: summary.openIssues, note: "Across all projects" },
  { label: "Paused projects", value: summary.pausedProjects, note: "Waiting on a decision" },
  { label: "Archived projects", value: summary.archivedProjects, note: "Read-only history" },
];

export default function DashboardPage() {
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where your workspace stands today."
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label} className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-sm font-medium text-muted">{card.label}</h2>
            <p className="mt-2 font-mono text-4xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.note}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent" className="mt-10 rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="recent" className="text-lg font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className="text-sm text-brand-400 underline hover:text-brand-300">
            View all projects
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recent.map((project) => (
            <li key={project.key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="rounded-md border border-line bg-raised px-2 py-0.5 font-mono text-xs">
                  {project.key}
                </span>
                <span className="font-medium">{project.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted">
                <StatusBadge status={project.status} />
                <span>{formatDate(project.updated)}</span>
              </div>
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
import PageHeading from "@/components/PageHeading";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="border-b border-line bg-raised font-mono text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Key
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Issues
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((project) => (
              <tr key={project.key} className="hover:bg-raised/60">
                <td className="px-4 py-3 font-mono">{project.key}</td>
                <th scope="row" className="px-4 py-3 font-medium">
                  {project.name}
                </th>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-right font-mono">{project.issues}</td>
                <td className="px-4 py-3 text-muted">
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
import PageHeading from "@/components/PageHeading";
import { projects, summary } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <>
      <PageHeading
        title="Reports"
        description={`${summary.openIssues} open issues, broken down by project.`}
      />

      <section aria-labelledby="by-project" className="rounded-md border border-line bg-surface p-5 sm:p-6">
        <h2 id="by-project" className="text-lg font-semibold">
          Open issues by project
        </h2>
        <ul className="mt-5 space-y-4">
          {projects.map((project) => (
            <li key={project.key} className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_2.5rem]">
              <span className="truncate">
                <span className="font-mono">{project.key}</span>
                <span className="hidden text-muted sm:inline"> {project.name}</span>
              </span>
              <span aria-hidden="true" className="h-3 rounded-sm bg-raised">
                <span
                  className="block h-3 rounded-sm bg-brand-500"
                  style={{ width: `${(project.issues / max) * 100}%` }}
                />
              </span>
              <span className="text-right font-mono">{project.issues}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import SettingsForm from "@/components/SettingsForm";

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
