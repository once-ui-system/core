```css app/globals.css
@import "tailwindcss";

/* Lumen design tokens: every screen reads these, nothing is styled one-off. */
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

  /* Neutrals: warm sand */
  --color-sand-50: #faf7f2;
  --color-sand-100: #f4efe6;
  --color-sand-200: #e9e1d2;
  --color-sand-300: #d9cdb7;
  --color-sand-400: #b9aa8f;
  --color-sand-500: #8f8068;
  --color-sand-600: #6f6350;
  --color-sand-700: #544a3b;
  --color-sand-800: #3a3329;
  --color-sand-900: #26211a;

  /* Corner radius: 16px on buttons, inputs, cards and menus */
  --radius-ui: 16px;

  /* Fonts */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;

  --shadow-card: 0 1px 2px rgb(58 51 41 / 0.06), 0 8px 24px rgb(58 51 41 / 0.06);
}

@layer base {
  :root {
    color-scheme: light;
  }

  body {
    background-color: var(--color-sand-50);
    color: var(--color-sand-900);
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-heading);
    letter-spacing: -0.01em;
  }

  a {
    color: var(--color-brand-700);
  }

  /* Brand focus ring for every interactive element */
  :focus-visible {
    outline: 3px solid var(--color-brand-600);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
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

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return formatter.format(new Date(`${iso}T00:00:00Z`));
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
import {
  Activity,
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
  icon: LucideIcon;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    icon: Activity,
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "Workspace",
    icon: FolderKanban,
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function breadcrumbFor(pathname: string): string[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return [group.label, item.label];
    }
  }
  return ["Lumen"];
}
```

```tsx components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { isActive, navGroups } from "@/lib/nav";

export function Nav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex flex-col gap-4">
      {navGroups.map((group) => {
        const groupId = `nav-group-${group.label.toLowerCase()}`;
        const isClosed = !collapsed && closed[group.label];
        return (
          <div key={group.label} role="group" aria-labelledby={groupId}>
            {collapsed ? (
              <div
                id={groupId}
                className="mx-auto mb-2 h-px w-8 bg-sand-200"
                role="presentation"
              >
                <span className="sr-only">{group.label}</span>
              </div>
            ) : (
              <button
                type="button"
                id={groupId}
                aria-expanded={!isClosed}
                aria-controls={`${groupId}-list`}
                onClick={() => setClosed((c) => ({ ...c, [group.label]: !c[group.label] }))}
                className="flex min-h-11 w-full items-center justify-between rounded-ui px-4 text-xs font-bold uppercase tracking-widest text-sand-600 hover:bg-sand-100"
              >
                {group.label}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${isClosed ? "-rotate-90" : ""}`}
                />
              </button>
            )}
            <ul
              id={`${groupId}-list`}
              hidden={isClosed}
              className="mt-1 flex flex-col gap-1"
            >
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={`flex min-h-12 items-center gap-3 rounded-ui px-4 text-base font-semibold transition-colors ${
                        collapsed ? "justify-center px-0" : ""
                      } ${
                        active
                          ? "bg-brand-600 text-white shadow-card"
                          : "text-sand-800 hover:bg-sand-100"
                      }`}
                      style={active ? { color: "#fff" } : undefined}
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
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

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Sparkles, X } from "lucide-react";
import { Nav } from "@/components/Nav";
import { initials, user } from "@/lib/data";
import { breadcrumbFor } from "@/lib/nav";

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/"
      className="flex min-h-12 items-center gap-3 rounded-ui px-2 font-[family-name:var(--font-heading)] text-xl font-bold"
      style={{ color: "var(--color-sand-900)" }}
      aria-label="Lumen home"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-ui bg-brand-600 text-white">
        <Sparkles aria-hidden="true" className="size-5" />
      </span>
      <span className={collapsed ? "sr-only" : ""}>Lumen</span>
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

  const crumbs = breadcrumbFor(pathname);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Drawer: focus management, Escape, focus trap and scroll lock.
  useEffect(() => {
    if (!drawerOpen) return;
    const trigger = menuButtonRef.current;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
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
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-ui focus:bg-white focus:px-5 focus:py-3 focus:font-semibold"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 border-r border-sand-200 bg-white px-4 py-6 transition-[width] duration-200 lg:flex ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <Brand collapsed={collapsed} />
        <div className="flex-1 overflow-y-auto">
          <Nav collapsed={collapsed} />
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-pressed={collapsed}
          className={`flex min-h-12 items-center gap-3 rounded-ui px-4 text-base font-semibold text-sand-700 hover:bg-sand-100 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" className="size-5" />
          ) : (
            <PanelLeftClose aria-hidden="true" className="size-5" />
          )}
          <span className={collapsed ? "sr-only" : ""}>
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-sand-900/50"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col gap-6 overflow-y-auto bg-white px-4 py-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <Brand collapsed={false} />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex size-12 items-center justify-center rounded-ui text-sand-800 hover:bg-sand-100"
              >
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <Nav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-20 items-center gap-3 border-b border-sand-200 bg-sand-50/90 px-4 backdrop-blur sm:px-8">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="flex size-12 items-center justify-center rounded-ui border border-sand-200 bg-white text-sand-800 hover:bg-sand-100 lg:hidden"
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-sand-600">
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <li key={crumb} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRight aria-hidden="true" className="size-4 text-sand-400" />
                    )}
                    <span
                      aria-current={last ? "page" : undefined}
                      className={last ? "font-semibold text-sand-900" : ""}
                    >
                      {crumb}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-sand-900">{user.name}</p>
              <p className="text-xs text-sand-600">{user.role}</p>
            </div>
            <span
              className="flex size-12 items-center justify-center rounded-full bg-brand-100 font-[family-name:var(--font-heading)] font-bold text-brand-800"
              role="img"
              aria-label={`${user.name}, ${user.role}`}
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
```

```tsx components/ui.tsx
import type { ReactNode } from "react";

export function PageHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 sm:mb-10">
      <h1 className="text-3xl font-bold text-sand-900 sm:text-4xl">{title}</h1>
      {children && <p className="mt-3 max-w-2xl text-lg text-sand-700">{children}</p>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-ui border border-sand-200 bg-white p-6 shadow-card sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-900",
  Paused: "bg-amber-100 text-amber-900",
  Archived: "bg-sand-200 text-sand-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
        statusStyles[status] ?? statusStyles.Archived
      }`}
    >
      {status}
    </span>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: { default: "Lumen", template: "%s | Lumen" },
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
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
import { CircleDot, FolderKanban, PauseCircle, Rocket } from "lucide-react";
import { Card, PageHeading } from "@/components/ui";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: totalIssues, hint: "Across all projects", icon: CircleDot },
    { label: "Active projects", value: active, hint: "Shipping this month", icon: Rocket },
    { label: "Paused projects", value: paused, hint: "Waiting for a restart", icon: PauseCircle },
    {
      label: "Latest update",
      value: latest.key,
      hint: `${latest.name}, ${formatDate(latest.updated)}`,
      icon: FolderKanban,
    },
  ];

  return (
    <>
      <PageHeading title={`Welcome back, ${user.name.split(" ")[0]}!`}>
        Here is how your team is doing today. Nice work keeping things moving.
      </PageHeading>

      <section aria-label="Summary" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-base font-semibold text-sand-700">{label}</h2>
              <span className="flex size-11 items-center justify-center rounded-ui bg-brand-50 text-brand-700">
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>
            <p className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-sand-900">
              {value}
            </p>
            <p className="mt-2 text-sm text-sand-600">{hint}</p>
          </Card>
        ))}
      </section>

      <p className="mt-10 text-lg text-sand-700">
        Want the full picture?{" "}
        <Link href="/projects" className="font-semibold underline underline-offset-4">
          Browse all projects
        </Link>
        .
      </p>
    </>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";
import { Card, PageHeading, StatusBadge } from "@/components/ui";
import { formatDate, projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeading title="Projects">
        Everything your team is building, with its open issues and latest activity.
      </PageHeading>

      {/* Table on larger screens */}
      <Card className="hidden overflow-x-auto !p-0 md:block">
        <table className="w-full text-left">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="border-b border-sand-200 text-sm text-sand-600">
            <tr>
              <th scope="col" className="px-8 py-5 font-semibold">Project</th>
              <th scope="col" className="px-4 py-5 font-semibold">Status</th>
              <th scope="col" className="px-4 py-5 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-8 py-5 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {projects.map((p) => (
              <tr key={p.key} className="hover:bg-sand-50">
                <th scope="row" className="px-8 py-5 font-semibold text-sand-900">
                  {p.name}
                  <span className="ml-3 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-bold tracking-wide text-sand-700">
                    {p.key}
                  </span>
                </th>
                <td className="px-4 py-5"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-5 text-right tabular-nums text-sand-800">{p.issues}</td>
                <td className="px-8 py-5 text-sand-700">
                  <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Cards on phones */}
      <ul className="grid gap-4 md:hidden">
        {projects.map((p) => (
          <li key={p.key}>
            <Card className="!p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-sand-900">{p.name}</h2>
                  <p className="text-sm font-semibold tracking-wide text-sand-600">{p.key}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-sand-600">Open issues</dt>
                  <dd className="mt-1 text-base font-semibold text-sand-900">{p.issues}</dd>
                </div>
                <div>
                  <dt className="text-sand-600">Updated</dt>
                  <dd className="mt-1 text-base font-semibold text-sand-900">
                    <time dateTime={p.updated}>{formatDate(p.updated)}</time>
                  </dd>
                </div>
              </dl>
            </Card>
          </li>
        ))}
      </ul>
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
      <PageHeading title="Reports">Open issues by project, at a glance.</PageHeading>
      <Card>
        <ul className="flex flex-col gap-6">
          {projects.map((p) => (
            <li key={p.key}>
              <div className="mb-2 flex justify-between text-base font-semibold text-sand-900">
                <span>{p.name}</span>
                <span className="tabular-nums">{p.issues}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-sand-100">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${(p.issues / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";
import { PageHeading } from "@/components/ui";
import { SettingsForm } from "@/components/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeading title="Settings">Update your profile and choose what Lumen tells you about.</PageHeading>
      <SettingsForm />
    </>
  );
}
```

```tsx components/SettingsForm.tsx
"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui";
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
    <div className="flex min-h-14 items-center justify-between gap-6">
      <div>
        <p id={`${id}-label`} className="font-semibold text-sand-900">{label}</p>
        <p id={`${id}-desc`} className="text-sm text-sand-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand-600" : "bg-sand-300"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

const inputClass =
  "mt-2 min-h-12 w-full rounded-ui border border-sand-300 bg-white px-4 text-base text-sand-900 placeholder:text-sand-500";

export function SettingsForm() {
  const nameId = useId();
  const emailId = useId();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="grid max-w-3xl gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Card>
        <h2 className="text-xl font-bold">Profile</h2>
        <div className="mt-6 grid gap-6">
          <div>
            <label htmlFor={nameId} className="font-semibold text-sand-900">Full name</label>
            <input
              id={nameId}
              value={name}
              autoComplete="name"
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={emailId} className="font-semibold text-sand-900">Email</label>
            <input
              id={emailId}
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <p className="text-sm text-sand-600">Your role in this workspace: {user.role}</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Notifications</h2>
        <div className="mt-4 grid gap-4">
          <Switch
            label="Weekly digest"
            description="A friendly summary of what moved across your projects."
            checked={digest}
            onChange={(v) => {
              setDigest(v);
              setSaved(false);
            }}
          />
          <Switch
            label="Mentions"
            description="Tell me when a teammate mentions me on an issue."
            checked={mentions}
            onChange={(v) => {
              setMentions(v);
              setSaved(false);
            }}
          />
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="min-h-12 rounded-ui bg-brand-600 px-8 text-base font-semibold text-white shadow-card transition-colors hover:bg-brand-700"
        >
          Save changes
        </button>
        <p role="status" aria-live="polite" className="font-semibold text-sand-700">
          {saved ? "Saved. Looking good!" : ""}
        </p>
      </div>
    </form>
  );
}
```
