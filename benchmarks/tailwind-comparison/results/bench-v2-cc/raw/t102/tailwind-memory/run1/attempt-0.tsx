```css app/globals.css
@import "tailwindcss";

/*
 * Lumen design tokens. Everything below is the theme: components only use
 * these tokens (bg-primary, text-ink, rounded-brand, font-heading ...).
 */
@theme {
  /* Brand: #DB2777 */
  --color-brand-50: #fdf2f8;
  --color-brand-100: #fce7f3;
  --color-brand-200: #fbcfe8;
  --color-brand-300: #f9a8d4;
  --color-brand-400: #f472b6;
  --color-brand-500: #ec4899;
  --color-brand-600: #db2777;
  --color-brand-700: #be185d;
  --color-brand-800: #9d174d;
  --color-brand-900: #831843;

  /* Warm sand neutrals */
  --color-sand-50: #fcfaf6;
  --color-sand-100: #f7f2ea;
  --color-sand-200: #ede4d4;
  --color-sand-300: #ddd0b9;
  --color-sand-400: #bfae91;
  --color-sand-500: #9a8a6e;
  --color-sand-600: #766850;
  --color-sand-700: #5a4f3d;
  --color-sand-800: #3d3528;
  --color-sand-900: #28221a;

  /* Semantic tokens */
  --color-primary: var(--color-brand-600);
  --color-primary-hover: var(--color-brand-700);
  --color-primary-soft: var(--color-brand-50);
  --color-link: var(--color-brand-700);
  --color-ring: var(--color-brand-600);
  --color-canvas: var(--color-sand-50);
  --color-surface: #ffffff;
  --color-sunken: var(--color-sand-100);
  --color-line: var(--color-sand-200);
  --color-ink: var(--color-sand-900);
  --color-muted: var(--color-sand-700);

  /* Shape: 16px on buttons, inputs, cards and menus */
  --radius-brand: 16px;

  /* Type */
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-sans: ui-sans-serif, system-ui, sans-serif;

  --shadow-soft: 0 1px 2px rgb(61 53 40 / 0.06), 0 8px 24px -8px rgb(61 53 40 / 0.12);
}

@layer base {
  html {
    color-scheme: light;
  }
  body {
    background-color: var(--color-canvas);
    color: var(--color-ink);
  }
  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-heading);
    letter-spacing: -0.01em;
  }
  a {
    text-underline-offset: 3px;
  }
  :focus-visible {
    outline: 3px solid var(--color-ring);
    outline-offset: 2px;
  }
}

@layer components {
  .btn {
    display: inline-flex;
    min-height: 3rem;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: var(--radius-brand);
    padding: 0.5rem 1.5rem;
    font-weight: 600;
    transition: background-color 150ms, color 150ms, border-color 150ms;
  }
  .btn-primary {
    background-color: var(--color-primary);
    color: #ffffff;
  }
  .btn-primary:hover {
    background-color: var(--color-primary-hover);
  }
  .btn-secondary {
    border: 1px solid var(--color-sand-300);
    background-color: var(--color-surface);
    color: var(--color-ink);
  }
  .btn-secondary:hover {
    background-color: var(--color-sunken);
  }
  .field {
    min-height: 3rem;
    width: 100%;
    border-radius: var(--radius-brand);
    border: 1px solid var(--color-sand-400);
    background-color: var(--color-surface);
    padding: 0.5rem 1rem;
    color: var(--color-ink);
  }
  .card {
    border-radius: var(--radius-brand);
    border: 1px solid var(--color-line);
    background-color: var(--color-surface);
    box-shadow: var(--shadow-soft);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
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

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
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

```ts components/nav-config.ts
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
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: ChartColumn,
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/#reports", icon: FileText },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: FolderKanban,
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const crumbs: Record<string, string[]> = {
  "/": ["Analytics", "Overview"],
  "/projects": ["Workspace", "Projects"],
  "/settings": ["Workspace", "Settings"],
};
```

```tsx components/nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { navGroups } from "./nav-config";

interface NavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function Nav({ collapsed = false, onNavigate }: NavProps) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex flex-col gap-4">
      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        const open = collapsed || !closed[group.id];
        const listId = `nav-group-${group.id}`;
        return (
          <div key={group.id} className="flex flex-col gap-1">
            {collapsed ? (
              <div className="mx-auto my-1 h-px w-8 bg-line" role="presentation" />
            ) : (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setClosed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                className="flex min-h-12 w-full items-center gap-3 rounded-brand px-4 text-sm font-semibold tracking-wide text-muted uppercase hover:bg-sunken"
              >
                <GroupIcon aria-hidden="true" className="size-5" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`}
                />
              </button>
            )}
            <ul id={listId} hidden={!open} className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const current = item.href === pathname;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`flex min-h-12 items-center gap-3 rounded-brand px-4 font-medium transition-colors ${
                        collapsed ? "justify-center" : ""
                      } ${
                        current
                          ? "bg-primary text-white"
                          : "text-ink hover:bg-sunken"
                      } ${!collapsed && "pl-6"}`}
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { initials, user } from "@/lib/data";
import { Nav } from "./nav";
import { crumbs } from "./nav-config";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex min-h-12 items-center gap-3 rounded-brand px-2"
      aria-label="Lumen home"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-brand bg-primary text-white">
        <Sparkles aria-hidden="true" className="size-5" />
      </span>
      {!compact && <span className="font-heading text-xl font-bold text-ink">Lumen</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
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
    const onResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [drawerOpen, closeDrawer]);

  const trail = crumbs[pathname] ?? ["Lumen"];

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only z-50 rounded-brand bg-primary px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-surface p-4 transition-[width] duration-200 lg:flex ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <div className={collapsed ? "flex justify-center" : ""}>
          <Brand compact={collapsed} />
        </div>
        <Nav collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-20 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="btn btn-secondary size-12 shrink-0 px-0 lg:hidden"
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="btn btn-secondary hidden size-12 shrink-0 px-0 lg:inline-flex"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-6" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-6" />
            )}
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-2 text-sm text-muted sm:text-base">
              {trail.map((label, index) => {
                const last = index === trail.length - 1;
                return (
                  <li key={label} className="flex min-w-0 items-center gap-2">
                    {index > 0 && <ChevronRight aria-hidden="true" className="size-4 shrink-0" />}
                    <span
                      aria-current={last ? "page" : undefined}
                      className={`truncate ${last ? "font-semibold text-ink" : ""}`}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="text-sm text-muted">{user.role}</p>
            </div>
            <span
              role="img"
              aria-label={`${user.name}, ${user.role}`}
              className="flex size-12 items-center justify-center rounded-full bg-brand-100 font-heading font-bold text-brand-800"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-sand-900/50"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-surface p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                ref={closeRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                className="btn btn-secondary size-12 px-0"
              >
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <Nav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
  description: "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-canvas font-sans text-ink antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import Link from "next/link";
import { ArrowRight, Bug, FolderKanban, PauseCircle } from "lucide-react";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  const cards = [
    { label: "Open issues", value: openIssues, note: "Across all projects", icon: Bug },
    { label: "Active projects", value: active, note: "Shipping right now", icon: FolderKanban },
    { label: "Paused projects", value: paused, note: "Waiting for a restart", icon: PauseCircle },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome back, {user.name.split(" ")[0]}!</h1>
        <p className="max-w-2xl text-lg text-muted">
          Here is how things look for your team today. Nice work keeping {openIssues} issues in view.
        </p>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Summary">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <li key={label} className="card flex flex-col gap-4 p-6">
            <span className="flex size-12 items-center justify-center rounded-brand bg-primary-soft text-brand-700">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="text-base font-medium text-muted">{label}</p>
              <p className="font-heading text-4xl font-bold">{value}</p>
              <p className="text-sm text-muted">{note}</p>
            </div>
          </li>
        ))}
      </ul>

      <section id="reports" aria-labelledby="reports-title" className="card scroll-mt-28 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="reports-title" className="text-2xl font-bold">
            Recently updated
          </h2>
          <Link
            href="/projects"
            className="inline-flex min-h-12 items-center gap-2 rounded-brand px-2 font-semibold text-link underline"
          >
            All projects <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {recent.map((p) => (
            <li key={p.key} className="flex flex-wrap items-center justify-between gap-2 py-4">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-muted">
                  {p.key} &middot; {p.issues} open {p.issues === 1 ? "issue" : "issues"}
                </p>
              </div>
              <time dateTime={p.updated} className="text-muted">
                {formatDate(p.updated)}
              </time>
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
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

const badge: Record<ProjectStatus, string> = {
  Active: "bg-brand-100 text-brand-900",
  Paused: "bg-sand-200 text-sand-900",
  Archived: "bg-sunken text-muted ring-1 ring-line",
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badge[status]}`}>
      {status}
    </span>
  );
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Projects</h1>
        <p className="text-lg text-muted">
          {projects.length} projects in your workspace, from the marketing site to internal tools.
        </p>
      </div>

      {/* Phones: cards */}
      <ul className="flex flex-col gap-4 md:hidden">
        {projects.map((p) => (
          <li key={p.key} className="card flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{p.name}</p>
                <p className="text-sm text-muted">{p.key}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-muted">
              {p.issues} open {p.issues === 1 ? "issue" : "issues"} &middot; updated{" "}
              <time dateTime={p.updated}>{formatDate(p.updated)}</time>
            </p>
          </li>
        ))}
      </ul>

      {/* Larger screens: table */}
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-left">
          <caption className="sr-only">Projects in the workspace</caption>
          <thead className="bg-sunken text-sm text-muted">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Project</th>
              <th scope="col" className="px-6 py-4 font-semibold">Key</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-6 py-4 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((p) => (
              <tr key={p.key}>
                <th scope="row" className="px-6 py-5 font-semibold">{p.name}</th>
                <td className="px-6 py-5 font-mono text-sm text-muted">{p.key}</td>
                <td className="px-6 py-5"><StatusBadge status={p.status} /></td>
                <td className="px-6 py-5 text-right tabular-nums">{p.issues}</td>
                <td className="px-6 py-5 text-muted">
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

```tsx components/settings-form.tsx
"use client";

import { useId, useState } from "react";
import { user } from "@/lib/data";

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p id={`${id}-label`} className="font-semibold">{label}</p>
        <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-sand-400"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1 left-1 size-6 rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <section aria-labelledby="profile-title" className="card flex flex-col gap-6 p-6 sm:p-8">
        <h2 id="profile-title" className="text-2xl font-bold">Profile</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold">Full name</label>
          <input
            id="name"
            className="field"
            value={name}
            autoComplete="name"
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-semibold">Email</label>
          <input
            id="email"
            type="email"
            className="field"
            value={email}
            autoComplete="email"
            onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="role" className="font-semibold">Role</label>
          <input id="role" className="field bg-sunken" value={user.role} readOnly aria-describedby="role-hint" />
          <p id="role-hint" className="text-sm text-muted">Only another owner can change your role.</p>
        </div>
      </section>

      <section aria-labelledby="notify-title" className="card p-6 sm:p-8">
        <h2 id="notify-title" className="text-2xl font-bold">Notifications</h2>
        <div className="mt-2 divide-y divide-line">
          <Toggle
            label="Weekly summary"
            hint="A friendly recap of issues and activity every Monday."
            checked={weekly}
            onChange={(v) => { setWeekly(v); setSaved(false); }}
          />
          <Toggle
            label="Mentions"
            hint="Email me when a teammate mentions me on an issue."
            checked={mentions}
            onChange={(v) => { setMentions(v); setSaved(false); }}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary">Save changes</button>
        <p role="status" className="font-medium text-muted">
          {saved ? "Saved. Looking good!" : ""}
        </p>
      </div>
    </form>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Settings</h1>
        <p className="text-lg text-muted">
          Keep your profile and notifications just the way you like them.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
```
