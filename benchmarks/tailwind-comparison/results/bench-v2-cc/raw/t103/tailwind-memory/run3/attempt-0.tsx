```css app/globals.css
@import "tailwindcss";

/* Lumen design tokens: brand, warm stone neutrals, 4px radius, type stacks.
   Dark is the default theme; the semantic tokens below drive every screen. */
:root {
  color-scheme: dark;
  --canvas: #0c0a09;
  --surface: #1c1917;
  --raised: #292524;
  --line: #44403c;
  --fg: #fafaf9;
  --muted: #a8a29e;
  --brand: #e8590c;
  --brand-hover: #f76707;
  --on-brand: #1c1917;
}

@theme {
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, monospace;

  --radius-xs: 4px;
  --radius-sm: 4px;
  --radius-md: 4px;
  --radius-lg: 4px;
  --radius-xl: 4px;
  --radius-2xl: 4px;
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-raised: var(--raised);
  --color-line: var(--line);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-on-brand: var(--on-brand);
}

@layer base {
  html {
    background: var(--canvas);
  }
  body {
    background: var(--canvas);
    color: var(--fg);
  }
  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-mono);
    letter-spacing: -0.01em;
  }
  a {
    text-underline-offset: 3px;
  }
  :focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
  ::selection {
    background: var(--brand);
    color: var(--on-brand);
  }
}

@layer components {
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: var(--radius-md);
    background: var(--brand);
    color: var(--on-brand);
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.25rem;
    cursor: pointer;
    transition: background-color 120ms;
  }
  .btn-primary:hover {
    background: var(--brand-hover);
  }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--fg);
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
    cursor: pointer;
    transition: background-color 120ms;
  }
  .btn-secondary:hover {
    background: var(--raised);
  }
  .field {
    width: 100%;
    border-radius: var(--radius-md);
    border: 1px solid var(--line);
    background: var(--canvas);
    color: var(--fg);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  .field:read-only {
    color: var(--muted);
  }
  .card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--line);
    background: var(--surface);
  }
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

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

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
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
```

```ts lib/nav.ts
export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** Route that makes this item current. Items without a route are anchors. */
  route?: string;
  icon: "overview" | "reports" | "projects" | "settings";
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
      { id: "overview", label: "Overview", href: "/", route: "/", icon: "overview" },
      { id: "reports", label: "Reports", href: "/#reports", icon: "reports" },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "projects", label: "Projects", href: "/projects", route: "/projects", icon: "projects" },
      { id: "settings", label: "Settings", href: "/settings", route: "/settings", icon: "settings" },
    ],
  },
];

export function findCurrent(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.route === pathname) return { group, item };
    }
  }
  return null;
}
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  FileText,
  Folder,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from "lucide-react";

import { initials, user } from "@/lib/data";
import { findCurrent, navGroups, type NavItem } from "@/lib/nav";

const icons = {
  overview: LayoutDashboard,
  reports: FileText,
  projects: Folder,
  settings: Settings,
} as const;

function Logo({ showText }: { showText: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-md font-mono text-base font-semibold tracking-tight"
      aria-label="Lumen home"
    >
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-md bg-brand font-mono text-sm font-bold text-on-brand"
      >
        L
      </span>
      {showText && <span>Lumen</span>}
    </Link>
  );
}

function NavList({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isCurrent = (item: NavItem) => item.route !== undefined && item.route === pathname;

  return (
    <nav aria-label="Primary" className="flex flex-col gap-5">
      {navGroups.map((group) => (
        <div key={group.id} role="group" aria-labelledby={`nav-${group.id}`}>
          <p
            id={`nav-${group.id}`}
            className={
              collapsed
                ? "sr-only"
                : "px-3 pb-1.5 font-mono text-xs font-medium uppercase tracking-wider text-muted"
            }
          >
            {group.label}
          </p>
          {collapsed && <div aria-hidden="true" className="mx-3 mb-2 border-t border-line" />}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = icons[item.icon];
              const current = isCurrent(item);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={current ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      collapsed ? "justify-center" : "",
                      current
                        ? "bg-brand text-on-brand"
                        : "text-muted hover:bg-raised hover:text-fg",
                    ].join(" ")}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
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

function Breadcrumb({ pathname }: { pathname: string }) {
  const current = findCurrent(pathname);
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
        <li className="hidden sm:block">Lumen</li>
        {current && (
          <>
            <li aria-hidden="true" className="hidden sm:block">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="hidden sm:block">{current.group.label}</li>
            <li aria-hidden="true" className="hidden sm:block">
              <ChevronRight className="size-3.5" />
            </li>
            <li aria-current="page" className="truncate font-medium text-fg">
              {current.item.label}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-on-brand focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-surface transition-[width] duration-150 md:flex",
          collapsed ? "w-16" : "w-64",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-14 shrink-0 items-center border-b border-line",
            collapsed ? "justify-center px-2" : "px-4",
          ].join(" ")}
        >
          <Logo showText={!collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto p-2 py-4">
          <NavList collapsed={collapsed} pathname={pathname} />
        </div>
        <div className="border-t border-line p-2">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={[
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-raised hover:text-fg",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4 shrink-0" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              closeDrawer();
              menuButtonRef.current?.focus();
            }}
          />
          <div
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
              <Logo showText />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => {
                  closeDrawer();
                  menuButtonRef.current?.focus();
                }}
                aria-label="Close navigation"
                className="grid size-9 place-items-center rounded-md text-muted hover:bg-raised hover:text-fg"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 py-4">
              <NavList collapsed={false} pathname={pathname} onNavigate={closeDrawer} />
            </div>
          </div>
        </div>
      )}

      <div
        className={[
          "flex min-h-dvh flex-col transition-[padding] duration-150",
          collapsed ? "md:pl-16" : "md:pl-64",
        ].join(" ")}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-canvas/95 px-4 backdrop-blur md:px-6">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface text-fg hover:bg-raised md:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <Breadcrumb pathname={pathname} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs leading-tight text-muted">{user.role}</p>
            </div>
            <span
              role="img"
              aria-label={`${user.name}, ${user.role}`}
              className="grid size-9 place-items-center rounded-md border border-line bg-raised font-mono text-xs font-semibold"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```tsx app/page.tsx
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const active = projects.filter((p) => p.status === "Active").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const busiest = projects.reduce((a, b) => (b.issues > a.issues ? b : a));
  const latest = projects.reduce((a, b) => (b.updated > a.updated ? b : a));

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "1 paused, 1 archived" },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open issues` },
    { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted">
          Here is the state of your workspace at Acme Labs.
        </p>
      </div>

      <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-4">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-mono text-3xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.note}</p>
          </div>
        ))}
      </section>

      <section id="reports" aria-labelledby="reports-heading" className="card scroll-mt-20 p-4 md:p-5">
        <h2 id="reports-heading" className="text-lg font-semibold">
          Reports
        </h2>
        <p className="mt-1 text-sm text-muted">Open issues per project, latest first.</p>
        <ul className="mt-4 flex flex-col gap-3">
          {[...projects]
            .sort((a, b) => b.issues - a.issues)
            .map((p) => (
              <li key={p.key} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="font-mono text-muted">{p.key}</span>
                <div
                  role="img"
                  aria-label={`${p.name}: ${p.issues} open issues`}
                  className="h-2 overflow-hidden rounded-sm bg-raised"
                >
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${(p.issues / busiest.issues) * 100}%` }}
                  />
                </div>
                <span className="text-right font-mono">{p.issues}</span>
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

const statusStyle: Record<ProjectStatus, string> = {
  Active: "border-brand text-brand",
  Paused: "border-line text-fg",
  Archived: "border-line text-muted",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            {projects.length} projects in the Acme Labs workspace.
          </p>
        </div>
        <button type="button" className="btn-primary self-start sm:self-auto">
          New project
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead>
            <tr className="border-b border-line font-mono text-xs uppercase tracking-wider text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Key</th>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Issues</th>
              <th scope="col" className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.key} className="border-b border-line last:border-b-0 hover:bg-raised/60">
                <td className="px-4 py-3 font-mono font-semibold">{p.key}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-medium ${statusStyle[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">{p.issues}</td>
                <td className="px-4 py-3 text-muted">
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

function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
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
        className={[
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-md border transition-colors",
          checked ? "border-brand bg-brand" : "border-line bg-raised",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "absolute top-0.5 size-4.5 rounded-sm transition-all",
            checked ? "left-[1.375rem] bg-on-brand" : "left-0.5 bg-muted",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <section aria-labelledby="profile-heading" className="card p-4 md:p-5">
        <h2 id="profile-heading" className="text-lg font-semibold">
          Profile
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              className="field"
              value={name}
              autoComplete="name"
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field"
              value={user.email}
              readOnly
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="text-xs text-muted">
              Contact your workspace owner to change the sign-in email.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <input id="role" name="role" className="field" value={user.role} readOnly />
          </div>
        </div>
      </section>

      <section aria-labelledby="notify-heading" className="card p-4 md:p-5">
        <h2 id="notify-heading" className="text-lg font-semibold">
          Notifications
        </h2>
        <div className="mt-2 divide-y divide-line">
          <Switch
            label="Weekly digest"
            description="A Monday summary of open issues and project activity."
            checked={digest}
            onChange={(value) => {
              setDigest(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Issue alerts"
            description="Email me when an issue assigned to me changes status."
            checked={alerts}
            onChange={(value) => {
              setAlerts(value);
              setSaved(false);
            }}
          />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary">
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

```tsx app/settings/page.tsx
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your profile and how Lumen contacts you.</p>
      </div>
      <SettingsForm />
    </div>
  );
}
```
