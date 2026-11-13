```ts lib/data.ts
export const product = "Lumen";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type NavIconName = "overview" | "reports" | "projects" | "settings";

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
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

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}
```

The "Reports" link points to `/reports`, which isn't a required route. I'll add a small `/reports` page so the link doesn't 404.

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  FileText,
  FolderKanban,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { navGroups, product, user } from "@/lib/data";
import type { NavIconName } from "@/lib/data";

const icons: Record<NavIconName, typeof BarChart3> = {
  overview: BarChart3,
  reports: FileText,
  projects: FolderKanban,
  settings: Settings,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function findCurrent(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group, item };
    }
  }
  return null;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NavList({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-5">
        {navGroups.map((group) => {
          const headingId = `nav-group-${group.label.toLowerCase()}`;
          return (
            <li key={group.label}>
              <h2
                id={headingId}
                className={
                  collapsed
                    ? "sr-only"
                    : "px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500"
                }
              >
                {group.label}
              </h2>
              {collapsed && <div aria-hidden="true" className="mx-2 mb-2 h-px bg-slate-200" />}
              <ul aria-labelledby={headingId} className="space-y-1">
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
                        className={[
                          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors",
                          "focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1",
                          collapsed ? "justify-center" : "",
                          active
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                        ].join(" ")}
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

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`flex h-16 items-center gap-2.5 border-b border-slate-200 px-4 ${collapsed ? "justify-center" : ""}`}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Sparkles aria-hidden="true" className="size-4" />
      </span>
      <span className={collapsed ? "sr-only" : "text-lg font-semibold tracking-tight text-slate-900"}>
        {product}
      </span>
    </div>
  );
}

function UserCard({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`flex items-center gap-3 border-t border-slate-200 p-4 ${collapsed ? "justify-center" : ""}`}>
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
      >
        {initials(user.name)}
      </span>
      <div className={collapsed ? "sr-only" : "min-w-0"}>
        <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const current = findCurrent(pathname);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Drawer: Escape to close, focus management, focus trap, scroll lock.
  useEffect(() => {
    if (!drawerOpen) return;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  // Close drawer if viewport grows to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    function onChange(e: MediaQueryListEvent) {
      if (e.matches) setDrawerOpen(false);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-indigo-600"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        ].join(" ")}
      >
        <Brand collapsed={collapsed} />
        <NavList pathname={pathname} collapsed={collapsed} />
        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={[
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-5 shrink-0" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-5 shrink-0" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
        <UserCard collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-900/50"
            onClick={closeDrawer}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200 pl-4 pr-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Sparkles aria-hidden="true" className="size-4" />
                </span>
                <span className="text-lg font-semibold tracking-tight">{product}</span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="flex size-10 items-center justify-center rounded-lg text-slate-600 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <NavList pathname={pathname} collapsed={false} onNavigate={() => setDrawerOpen(false)} />
            <UserCard collapsed={false} />
          </div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${collapsed ? "md:pl-[4.5rem]" : "md:pl-64"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="-ml-2 flex size-10 items-center justify-center rounded-lg text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-600 md:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1.5 text-sm">
              <li className="hidden text-slate-500 sm:block">{product}</li>
              {current && (
                <>
                  <li aria-hidden="true" className="hidden text-slate-400 sm:block">
                    <ChevronRight className="size-4" />
                  </li>
                  <li className="truncate text-slate-500">{current.group.label}</li>
                  <li aria-hidden="true" className="text-slate-400">
                    <ChevronRight className="size-4" />
                  </li>
                  <li aria-current="page" className="truncate font-medium text-slate-900">
                    {current.item.label}
                  </li>
                </>
              )}
            </ol>
          </nav>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-8 outline-none sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```tsx components/page-heading.tsx
import type { ReactNode } from "react";

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {children}
    </div>
  );
}
```

```tsx components/status-badge.tsx
import type { ProjectStatus } from "@/lib/data";

const styles: Record<ProjectStatus, string> = {
  Active: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  Paused: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Archived: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

const dots: Record<ProjectStatus, string> = {
  Active: "bg-emerald-500",
  Paused: "bg-amber-500",
  Archived: "bg-slate-400",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}
```

```tsx app/page.tsx
import { Activity, AlertCircle, FolderKanban, PauseCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, projects, user } from "@/lib/data";
import Link from "next/link";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = [...projects].sort((a, b) => b.issues - a.issues)[0];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  const cards = [
    { label: "Open issues", value: openIssues, hint: `Across ${projects.length} projects`, Icon: AlertCircle },
    { label: "Active projects", value: active, hint: "Currently in development", Icon: FolderKanban },
    { label: "Paused projects", value: paused, hint: "Waiting on a decision", Icon: PauseCircle },
    { label: "Busiest project", value: busiest.key, hint: `${busiest.name}, ${busiest.issues} open`, Icon: Activity },
  ];

  return (
    <AppShell>
      <PageHeading
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's what's happening across your workspace today."
      />

      <section aria-label="Summary">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, hint, Icon }) => (
            <li key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-600">{label}</h2>
                <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{hint}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="recent-heading" className="text-base font-semibold text-slate-900">
            Recently updated
          </h2>
          <Link
            href="/projects"
            className="rounded text-sm font-medium text-indigo-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            View all projects
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recent.map((p) => (
            <li key={p.key} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  <span className="mr-2 font-mono text-xs text-slate-500">{p.key}</span>
                  {p.name}
                </p>
                <p className="text-xs text-slate-500">
                  Updated <time dateTime={p.updated}>{formatDate(p.updated)}</time> · {p.issues} open issues
                </p>
              </div>
              <StatusBadge status={p.status} />
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeading
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      {/* Table on larger screens */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Projects in your workspace</caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Project</th>
              <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-5 py-3 font-semibold">Last updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p) => (
              <tr key={p.key} className="hover:bg-slate-50">
                <th scope="row" className="px-5 py-3 font-medium text-slate-900">
                  <span className="mr-2 inline-block w-10 font-mono text-xs text-slate-500">{p.key}</span>
                  {p.name}
                </th>
                <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-700">{p.issues}</td>
                <td className="px-5 py-3 text-slate-600">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards on phones */}
      <ul className="space-y-3 sm:hidden">
        {projects.map((p) => (
          <li key={p.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-slate-500">{p.key}</p>
                <h2 className="truncate text-base font-medium text-slate-900">{p.name}</h2>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <dl className="mt-3 flex gap-6 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Open issues</dt>
                <dd className="tabular-nums text-slate-800">{p.issues}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Updated</dt>
                <dd className="text-slate-800">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
```

```tsx app/reports/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Reports · Lumen" };

export default function ReportsPage() {
  const total = projects.reduce((s, p) => s + p.issues, 0);
  const max = Math.max(...projects.map((p) => p.issues), 1);

  return (
    <AppShell>
      <PageHeading title="Reports" description="Open issues by project." />
      <section
        aria-labelledby="issues-heading"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id="issues-heading" className="text-base font-semibold text-slate-900">
          Open issues ({total} total)
        </h2>
        <ul className="mt-4 space-y-4">
          {projects.map((p) => (
            <li key={p.key}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-slate-800">
                  <span className="mr-2 font-mono text-xs text-slate-500">{p.key}</span>
                  {p.name}
                </span>
                <span className="tabular-nums text-slate-600">{p.issues}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${(p.issues / max) * 100}%` }}
                />
              </div>
              <p className="sr-only">Last updated {formatDate(p.updated)}</p>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";
import { user } from "@/lib/data";

export const metadata: Metadata = { title: "Settings · Lumen" };

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeading title="Settings" description="Manage your profile and notification preferences." />
      <SettingsForm name={user.name} email={user.email} role={user.role} />
    </AppShell>
  );
}
```

```tsx components/settings-form.tsx
"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";

interface Props {
  name: string;
  email: string;
  role: string;
}

export function SettingsForm({ name, email, role }: Props) {
  const uid = useId();
  const [fullName, setFullName] = useState(name);
  const [emailValue, setEmailValue] = useState(email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(true);
  }

  const inputClass =
    "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/30";

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <section
        aria-labelledby={`${uid}-profile`}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 id={`${uid}-profile`} className="text-base font-semibold text-slate-900">
          Profile
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-name`} className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id={`${uid}-name`}
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-email`} className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              autoComplete="email"
              value={emailValue}
              onChange={(e) => {
                setEmailValue(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-role`} className="text-sm font-medium text-slate-700">
              Role
            </label>
            <input
              id={`${uid}-role`}
              type="text"
              value={role}
              readOnly
              aria-describedby={`${uid}-role-help`}
              className={`${inputClass} bg-slate-50 text-slate-600`}
            />
            <p id={`${uid}-role-help`} className="mt-1 text-xs text-slate-500">
              Only workspace owners can change roles.
            </p>
          </div>
        </div>
      </section>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <legend className="px-1 text-base font-semibold text-slate-900">Notifications</legend>
        <div className="mt-2 space-y-3">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={weekly}
              onChange={(e) => {
                setWeekly(e.target.checked);
                setSaved(false);
              }}
              className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">Weekly summary</span>
              <span className="block text-sm text-slate-500">
                A Monday email with issue activity across your projects.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={mentions}
              onChange={(e) => {
                setMentions(e.target.checked);
                setSaved(false);
              }}
              className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600"
            />
            <span>
              <span className="block text-sm font-medium text-slate-800">Mentions and assignments</span>
              <span className="block text-sm text-slate-500">
                Get notified when someone mentions you or assigns you an issue.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          Save changes
        </button>
        <p role="status" aria-live="polite" className="text-sm text-emerald-700">
          {saved ? "Settings saved." : ""}
        </p>
      </div>
    </form>
  );
}
```