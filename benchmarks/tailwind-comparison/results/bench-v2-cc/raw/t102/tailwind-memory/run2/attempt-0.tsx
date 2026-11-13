```css app/globals.css
@import "tailwindcss";

@theme {
  /* Brand: Lumen pink, #DB2777 at 600 */
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
  --color-sand-300: #d9cdb8;
  --color-sand-400: #b8a98d;
  --color-sand-500: #94846a;
  --color-sand-600: #756753;
  --color-sand-700: #5c5142;
  --color-sand-800: #403830;
  --color-sand-900: #2b2621;
  --color-sand-950: #1c1815;

  /* Corner radius: 16px on buttons, inputs, cards and menus */
  --radius-ui: 16px;

  /* Typography */
  --font-heading: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
  --font-sans: ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  :root {
    color-scheme: light;
  }

  html {
    background-color: var(--color-sand-50);
  }

  body {
    background-color: var(--color-sand-50);
    color: var(--color-sand-900);
    font-family: var(--font-sans);
    line-height: 1.6;
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
    outline: 3px solid var(--color-brand-600);
    outline-offset: 3px;
    border-radius: var(--radius-ui);
  }

  ::selection {
    background-color: var(--color-brand-200);
    color: var(--color-sand-950);
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

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export const statusStyles: Record<ProjectStatus, string> = {
  Active: "bg-emerald-100 text-emerald-900",
  Paused: "bg-amber-100 text-amber-900",
  Archived: "bg-sand-200 text-sand-800",
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

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/#reports", icon: FileText },
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

export function isCurrent(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function crumbsFor(pathname: string): { group: string; label: string } {
  for (const group of NAV) {
    for (const item of group.items) {
      if (isCurrent(pathname, item.href)) {
        return { group: group.label, label: item.label };
      }
    }
  }
  return { group: "Analytics", label: "Overview" };
}
```

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";
import { user } from "@/lib/data";
import { NAV, crumbsFor, isCurrent } from "@/lib/nav";

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 rounded-ui px-2 py-2 ${collapsed ? "justify-center" : ""}`}
      aria-label="Lumen home"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-ui bg-brand-600 text-white">
        <Sparkles aria-hidden="true" className="size-6" />
      </span>
      {!collapsed && (
        <span className="font-heading text-2xl font-bold text-sand-900">Lumen</span>
      )}
    </Link>
  );
}

function NavList({
  collapsed,
  onNavigate,
  idPrefix,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  idPrefix: string;
}) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label={idPrefix === "mobile" ? "Mobile" : "Main"} className="flex flex-col gap-6">
      {NAV.map((group) => {
        const groupId = `${idPrefix}-${group.label.toLowerCase()}`;
        const isClosed = !collapsed && closed[group.label];
        return (
          <div key={group.label}>
            {collapsed ? (
              <hr className="mx-3 mb-3 border-sand-200" aria-hidden="true" />
            ) : (
              <button
                type="button"
                aria-expanded={!isClosed}
                aria-controls={groupId}
                onClick={() => setClosed((c) => ({ ...c, [group.label]: !c[group.label] }))}
                className="mb-2 flex min-h-11 w-full items-center justify-between rounded-ui px-4 text-sm font-semibold uppercase tracking-wider text-sand-600 hover:bg-sand-100"
              >
                {group.label}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${isClosed ? "-rotate-90" : ""}`}
                />
              </button>
            )}
            <ul id={groupId} hidden={isClosed} className="flex flex-col gap-1">
              {group.items.map((item) => {
                const current = isCurrent(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`flex min-h-12 items-center gap-3 rounded-ui px-4 text-base font-medium transition-colors ${
                        collapsed ? "justify-center px-0" : ""
                      } ${
                        current
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-sand-800 hover:bg-sand-100"
                      }`}
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

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
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
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-sand-950/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-sand-50 p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-12 items-center justify-center rounded-ui text-sand-800 hover:bg-sand-100"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>
        <NavList collapsed={false} onNavigate={onClose} idPrefix="mobile" />
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const crumbs = crumbsFor(pathname);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only z-[60] rounded-ui bg-brand-600 px-5 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col gap-6 overflow-y-auto border-r border-sand-200 bg-white/60 p-4 transition-[width] duration-200 md:flex ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <Brand collapsed={collapsed} />
        <div className="flex-1">
          <NavList collapsed={collapsed} idPrefix="desktop" />
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex min-h-12 items-center gap-3 rounded-ui px-4 text-base font-medium text-sand-700 hover:bg-sand-100 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" className="size-5" />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" className="size-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-20 items-center gap-3 border-b border-sand-200 bg-sand-50/90 px-4 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="flex size-12 items-center justify-center rounded-ui text-sand-800 hover:bg-sand-100 md:hidden"
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-sand-600 sm:text-base">
              <li>
                <Link href="/" className="rounded-ui px-1 text-brand-700 underline">
                  Lumen
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li>{crumbs.group}</li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li aria-current="page" className="font-semibold text-sand-900">
                {crumbs.label}
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-sand-900">{user.name}</p>
              <p className="text-xs text-sand-600">{user.role}</p>
            </div>
            <span
              className="flex size-12 items-center justify-center rounded-full bg-brand-100 font-heading font-bold text-brand-800"
              role="img"
              aria-label={`${user.name}, ${user.role}`}
            >
              {initials}
            </span>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
          {children}
        </main>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata } from "next";
import AppShell from "@/components/AppShell";

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
import { ArrowRight, Bug, FolderKanban, PauseCircle, Clock } from "lucide-react";
import { formatDate, projects, user } from "@/lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const first = user.name.split(" ")[0];

  const cards = [
    { label: "Open issues", value: String(open), note: "across all projects", icon: Bug },
    { label: "Active projects", value: String(active), note: "shipping right now", icon: FolderKanban },
    { label: "Paused projects", value: String(paused), note: "waiting for their moment", icon: PauseCircle },
    { label: "Last update", value: formatDate(latest.updated), note: latest.name, icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-3xl font-bold text-sand-900 sm:text-4xl">
          Welcome back, {first}!
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-sand-700">
          Your team has {open} open issues across {active} active projects. Here is a friendly
          look at how things are going.
        </p>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <li
            key={label}
            className="flex flex-col gap-4 rounded-ui border border-sand-200 bg-white p-6 shadow-sm"
          >
            <span className="flex size-12 items-center justify-center rounded-ui bg-brand-100 text-brand-700">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-sand-600">{label}</p>
              <p className="font-heading text-3xl font-bold text-sand-900">{value}</p>
              <p className="text-sm text-sand-600">{note}</p>
            </div>
          </li>
        ))}
      </ul>

      <section
        id="reports"
        aria-labelledby="reports-heading"
        className="scroll-mt-28 rounded-ui border border-sand-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 id="reports-heading" className="font-heading text-2xl font-bold text-sand-900">
          Reports
        </h2>
        <p className="mt-2 max-w-2xl text-sand-700">
          Customer app is the busiest project this month with{" "}
          {projects.find((p) => p.key === "APP")?.issues} open issues, while Public API keeps
          things calm with {projects.find((p) => p.key === "API")?.issues}.
        </p>
        <Link
          href="/projects"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-ui bg-brand-600 px-6 text-base font-semibold text-white hover:bg-brand-700"
        >
          Browse projects
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </section>
    </div>
  );
}
```

```tsx app/projects/page.tsx
import { formatDate, projects, statusStyles } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-sand-900 sm:text-4xl">Projects</h1>
        <p className="mt-3 text-lg text-sand-700">
          {projects.length} projects in your workspace, all in one cozy place.
        </p>
      </div>

      <ul className="flex flex-col gap-4 md:hidden">
        {projects.map((p) => (
          <li
            key={p.key}
            className="flex flex-col gap-3 rounded-ui border border-sand-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-lg font-bold text-sand-900">{p.name}</p>
                <p className="text-sm font-medium text-sand-600">{p.key}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[p.status]}`}
              >
                {p.status}
              </span>
            </div>
            <p className="text-sm text-sand-700">
              {p.issues} open {p.issues === 1 ? "issue" : "issues"} · Updated{" "}
              {formatDate(p.updated)}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-ui border border-sand-200 bg-white shadow-sm md:block">
        <table className="w-full text-left">
          <caption className="sr-only">Projects in this workspace</caption>
          <thead className="bg-sand-100 text-sm text-sand-700">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Project</th>
              <th scope="col" className="px-6 py-4 font-semibold">Key</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-6 py-4 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {projects.map((p) => (
              <tr key={p.key}>
                <th scope="row" className="px-6 py-5 font-semibold text-sand-900">{p.name}</th>
                <td className="px-6 py-5 text-sand-700">{p.key}</td>
                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right tabular-nums text-sand-900">{p.issues}</td>
                <td className="px-6 py-5 text-sand-700">{formatDate(p.updated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p id={`${id}-label`} className="font-semibold text-sand-900">{label}</p>
        <p id={`${id}-desc`} className="text-sm text-sand-600">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand-600" : "bg-sand-300"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-7 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

const inputClass =
  "mt-2 block min-h-14 w-full rounded-ui border border-sand-300 bg-white px-4 text-base text-sand-900 placeholder:text-sand-500";

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-sand-900 sm:text-4xl">Settings</h1>
        <p className="mt-3 text-lg text-sand-700">
          Make Lumen feel like home for you and your team.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
        className="flex max-w-3xl flex-col gap-8"
      >
        <section
          aria-labelledby="profile-heading"
          className="rounded-ui border border-sand-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 id="profile-heading" className="font-heading text-xl font-bold text-sand-900">
            Profile
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            <div>
              <label htmlFor="name" className="font-semibold text-sand-900">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className="font-semibold text-sand-900">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="role" className="font-semibold text-sand-900">Role</label>
              <input
                id="role"
                name="role"
                type="text"
                value={user.role}
                readOnly
                className={`${inputClass} bg-sand-100 text-sand-700`}
              />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="notify-heading"
          className="rounded-ui border border-sand-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 id="notify-heading" className="font-heading text-xl font-bold text-sand-900">
            Notifications
          </h2>
          <div className="mt-2 divide-y divide-sand-200">
            <Switch
              id="digest"
              label="Weekly digest"
              description="A Monday summary of what your team shipped."
              checked={digest}
              onChange={(v) => {
                setDigest(v);
                setSaved(false);
              }}
            />
            <Switch
              id="mentions"
              label="Mentions"
              description="Get an email when someone mentions you on an issue."
              checked={mentions}
              onChange={(v) => {
                setMentions(v);
                setSaved(false);
              }}
            />
            <Switch
              id="releases"
              label="Product news"
              description="Hear about new Lumen features as they land."
              checked={releases}
              onChange={(v) => {
                setReleases(v);
                setSaved(false);
              }}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="inline-flex min-h-14 items-center rounded-ui bg-brand-600 px-8 text-base font-semibold text-white hover:bg-brand-700"
          >
            Save changes
          </button>
          <p role="status" aria-live="polite" className="text-sand-700">
            {saved ? "All saved. Nice work!" : ""}
          </p>
        </div>
      </form>
    </div>
  );
}
```
