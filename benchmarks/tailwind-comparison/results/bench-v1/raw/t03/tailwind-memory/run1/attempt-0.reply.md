```ts lib/data.ts
export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export type ProjectStatus = "Active" | "Paused" | "Archived";
export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer";
export type MemberStatus = "Active" | "Invited" | "Suspended";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joined: string | null;
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

export const members: Member[] = [
  { id: "m-01", name: "Maya Okafor", email: "maya@acmelabs.io", role: "Owner", status: "Active", joined: "2024-03-02" },
  { id: "m-02", name: "Daniel Reyes", email: "daniel@acmelabs.io", role: "Admin", status: "Active", joined: "2024-05-19" },
  { id: "m-03", name: "Priya Natarajan", email: "priya@acmelabs.io", role: "Member", status: "Active", joined: "2024-11-07" },
  { id: "m-04", name: "Tomás Lindqvist", email: "tomas@acmelabs.io", role: "Member", status: "Active", joined: "2025-02-14" },
  { id: "m-05", name: "Hana Sato", email: "hana@acmelabs.io", role: "Member", status: "Invited", joined: null },
  { id: "m-06", name: "Grace Mensah", email: "grace@acmelabs.io", role: "Viewer", status: "Active", joined: "2025-06-30" },
  { id: "m-07", name: "Leo Brandt", email: "leo@acmelabs.io", role: "Member", status: "Suspended", joined: "2025-01-21" },
  { id: "m-08", name: "Ines Duarte", email: "ines@acmelabs.io", role: "Viewer", status: "Invited", joined: null },
];

/** Three most recently updated projects. */
export const recentProjects: Project[] = [...projects]
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, 3);

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}
```

```tsx components/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderKanban, LayoutDashboard, Search, Sparkles, Users } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { InviteDialog } from "@/components/invite-dialog";
import { user } from "@/lib/data";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/members", label: "Members", icon: Users },
] as const;

type Theme = "light" | "dark";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const dark = theme === "dark";
  const shortcut = isMac ? "⌘K" : "Ctrl K";

  const shellClass = useMemo(
    () =>
      dark
        ? "bg-slate-950 text-slate-100"
        : "bg-slate-50 text-slate-900",
    [dark],
  );

  return (
    <div className={`min-h-screen ${shellClass}`} data-theme={theme}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur ${
          dark ? "border-slate-800 bg-slate-950/85" : "border-slate-200 bg-white/85"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-indigo-600 text-white">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            Lumen
          </Link>

          <nav aria-label="Main" className="ml-2 hidden items-center gap-1 sm:flex">
            {nav.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? dark
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-900"
                      : dark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-haspopup="dialog"
              aria-keyshortcuts="Control+K Meta+K"
              className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                dark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Search className="size-4" aria-hidden="true" />
              <span>
                Search<span className="hidden sm:inline"> or jump to…</span>
              </span>
              <kbd
                className={`ml-1 rounded border px-1.5 py-0.5 font-sans text-xs ${
                  dark ? "border-slate-600 text-slate-400" : "border-slate-300 text-slate-500"
                }`}
              >
                {shortcut}
              </kbd>
            </button>
            <div
              className="hidden size-9 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white md:grid"
              title={`${user.name} · ${user.role}`}
              role="img"
              aria-label={`${user.name}, ${user.role}`}
            >
              MO
            </div>
          </div>
        </div>

        <nav
          aria-label="Main mobile"
          className={`flex border-t sm:hidden ${dark ? "border-slate-800" : "border-slate-200"}`}
        >
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium ${
                  active
                    ? "text-indigo-500"
                    : dark
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        dark={dark}
        onToggleTheme={toggleTheme}
        onInvite={() => setInviteOpen(true)}
      />
      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} dark={dark} />
    </div>
  );
}
```

```tsx components/command-palette.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CornerDownLeft,
  FolderKanban,
  FolderOpen,
  FolderPlus,
  LayoutDashboard,
  Moon,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { recentProjects } from "@/lib/data";

interface Command {
  id: string;
  group: "Pages" | "Actions" | "Recent";
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

const GROUPS: Command["group"][] = ["Pages", "Actions", "Recent"];

interface Props {
  open: boolean;
  onClose: () => void;
  dark: boolean;
  onToggleTheme: () => void;
  onInvite: () => void;
}

export function CommandPalette(props: Props) {
  if (!props.open) return null;
  return <PaletteInner {...props} />;
}

function PaletteInner({ onClose, dark, onToggleTheme, onInvite }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const uid = useId();
  const listId = `${uid}-list`;

  const commands = useMemo<Command[]>(
    () => [
      { id: "page-dashboard", group: "Pages", label: "Dashboard", hint: "/", icon: LayoutDashboard, run: () => router.push("/") },
      { id: "page-projects", group: "Pages", label: "Projects", hint: "/projects", icon: FolderKanban, run: () => router.push("/projects") },
      { id: "page-members", group: "Pages", label: "Members", hint: "/members", icon: Users, run: () => router.push("/members") },
      { id: "act-create", group: "Actions", label: "Create project", icon: FolderPlus, run: () => router.push("/projects") },
      { id: "act-invite", group: "Actions", label: "Invite member", icon: UserPlus, run: onInvite },
      { id: "act-theme", group: "Actions", label: "Toggle theme", icon: Moon, run: onToggleTheme },
      ...recentProjects.map<Command>((p) => ({
        id: `recent-${p.key}`,
        group: "Recent",
        label: p.name,
        hint: p.key,
        icon: FolderOpen,
        run: () => router.push("/projects"),
      })),
    ],
    [router, onInvite, onToggleTheme],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? commands.filter((c) => `${c.label} ${c.hint ?? ""}`.toLowerCase().includes(q))
      : commands;
    // Order by group so that arrow-key order matches visual order.
    return GROUPS.flatMap((g) => list.filter((c) => c.group === g));
  }, [commands, query]);

  const activeIndex = Math.min(active, Math.max(filtered.length - 1, 0));
  const activeCommand = filtered[activeIndex];

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, []);

  useEffect(() => {
    if (!activeCommand) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[id="${uid}-${activeCommand.id}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeCommand, uid]);

  function execute(cmd: Command | undefined) {
    if (!cmd) return;
    onClose();
    // Let the palette unmount (restoring focus) before running the command.
    setTimeout(cmd.run, 0);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length) setActive((activeIndex + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length) setActive((activeIndex - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(filtered.length - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(activeCommand);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // Keep focus inside the palette (single focusable control).
      e.preventDefault();
    }
  }

  const panel = dark
    ? "bg-slate-900 text-slate-100 border-slate-700"
    : "bg-white text-slate-900 border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[10vh] sm:pt-[15vh]"
      onKeyDown={onKeyDown}
    >
      <div
        className="absolute inset-0 bg-slate-950/50"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={`relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border shadow-2xl ${panel}`}
      >
        <div className={`flex items-center gap-3 border-b px-4 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <Search className={`size-4 shrink-0 ${muted}`} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeCommand ? `${uid}-${activeCommand.id}` : undefined}
            aria-label="Search commands"
            placeholder="Search pages, actions, projects…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-slate-400"
          />
          <kbd className={`hidden rounded border px-1.5 py-0.5 text-xs sm:block ${dark ? "border-slate-600" : "border-slate-300"} ${muted}`}>
            Esc
          </kbd>
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p role="status" className={`px-3 py-8 text-center text-sm ${muted}`}>
              No results for “{query}”.
            </p>
          ) : (
            GROUPS.map((group) => {
              const items = filtered.filter((c) => c.group === group);
              if (items.length === 0) return null;
              const headingId = `${uid}-${group}`;
              return (
                <div key={group} role="group" aria-labelledby={headingId} className="mb-1 last:mb-0">
                  <div id={headingId} className={`px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide ${muted}`}>
                    {group}
                  </div>
                  {items.map((cmd) => {
                    const isActive = cmd.id === activeCommand?.id;
                    const Icon = cmd.icon;
                    return (
                      <div
                        key={cmd.id}
                        id={`${uid}-${cmd.id}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => execute(cmd)}
                        onMouseMove={() => {
                          const idx = filtered.indexOf(cmd);
                          if (idx !== activeIndex) setActive(idx);
                        }}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : dark
                              ? "text-slate-200"
                              : "text-slate-800"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{cmd.label}</span>
                        {cmd.hint && (
                          <span className={`text-xs ${isActive ? "text-indigo-100" : muted}`}>{cmd.hint}</span>
                        )}
                        {isActive && <CornerDownLeft className="size-3.5 shrink-0" aria-hidden="true" />}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className={`hidden items-center gap-4 border-t px-4 py-2 text-xs sm:flex ${muted} ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
```

```tsx components/invite-dialog.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  dark: boolean;
}

export function InviteDialog(props: Props) {
  if (!props.open) return null;
  return <InviteInner {...props} />;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InviteInner({ onClose, dark }: Props) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const errorId = `${uid}-error`;
  const emailRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    emailRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "Tab" && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), a[href]",
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address, like name@company.com.");
      emailRef.current?.focus();
      return;
    }
    setError("");
    setSent(value);
  }

  const panel = dark
    ? "bg-slate-900 text-slate-100 border-slate-700"
    : "bg-white text-slate-900 border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-slate-950/50" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md rounded-xl border p-5 shadow-2xl ${panel}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              Invite member
            </h2>
            <p className={`mt-1 text-sm ${muted}`}>
              They’ll get an email with a link to join Acme Labs on Lumen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={`rounded-md p-1.5 focus-visible:outline-2 focus-visible:outline-indigo-500 ${
              dark ? "hover:bg-slate-800" : "hover:bg-slate-100"
            }`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {sent ? (
          <div className="mt-5">
            <p role="status" className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
              <span>
                Invitation sent to <strong>{sent}</strong>.
              </span>
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-5">
            <label htmlFor={`${uid}-email`} className="block text-sm font-medium">
              Email address
            </label>
            <input
              ref={emailRef}
              id={`${uid}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@acmelabs.io"
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`mt-1.5 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                dark
                  ? "border-slate-600 bg-slate-950 placeholder:text-slate-500"
                  : "border-slate-300 bg-white placeholder:text-slate-400"
              }`}
            />
            {error && (
              <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-500">
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                  dark ? "border-slate-600 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Send invite
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

```tsx components/dashboard.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, members, projects, recentProjects, user } from "@/lib/data";

export function Dashboard() {
  const openIssues = projects.reduce((n, p) => n + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pending = members.filter((m) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Active projects", value: activeProjects, note: `of ${projects.length} total` },
    { label: "Active members", value: activeMembers, note: `${pending} invites pending` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm opacity-70">
        Here’s what’s happening across your workspace. Press the search button in the header to jump anywhere.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-500/25 bg-slate-500/5 p-4">
            <dt className="text-sm opacity-70">{s.label}</dt>
            <dd className="mt-1 text-3xl font-semibold">{s.value}</dd>
            <p className="mt-1 text-xs opacity-60">{s.note}</p>
          </div>
        ))}
      </dl>

      <section aria-labelledby="recent-heading" className="mt-8">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recently updated
          </h2>
          <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:underline">
            All projects <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-500/20 rounded-xl border border-slate-500/25">
          {recentProjects.map((p) => (
            <li key={p.key} className="flex items-center gap-3 px-4 py-3">
              <span className="rounded bg-indigo-600/15 px-2 py-0.5 text-xs font-semibold text-indigo-500">
                {p.key}
              </span>
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <span className="hidden text-sm opacity-70 sm:inline">{p.issues} open issues</span>
              <span className="text-sm opacity-70">{formatDate(p.updated)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
```

```tsx app/(app)/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/(app)/projects/page.tsx
import { formatDate, projects } from "@/lib/data";

const statusStyle = {
  Active: "bg-emerald-500/15 text-emerald-600",
  Paused: "bg-amber-500/15 text-amber-600",
  Archived: "bg-slate-500/20 text-slate-500",
} as const;

export default function ProjectsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-1 text-sm opacity-70">{projects.length} projects in Acme Labs.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-500/25">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <caption className="sr-only">Projects with status, open issues and last update</caption>
          <thead className="bg-slate-500/10 text-xs uppercase tracking-wide opacity-80">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Project</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Open issues</th>
              <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/20">
            {projects.map((p) => (
              <tr key={p.key}>
                <th scope="row" className="px-4 py-3 font-medium">
                  <span className="mr-2 rounded bg-indigo-600/15 px-2 py-0.5 text-xs font-semibold text-indigo-500">
                    {p.key}
                  </span>
                  {p.name}
                </th>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{p.issues}</td>
                <td className="px-4 py-3">{formatDate(p.updated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

```tsx app/(app)/members/page.tsx
import { formatDate, members } from "@/lib/data";

const statusStyle = {
  Active: "bg-emerald-500/15 text-emerald-600",
  Invited: "bg-sky-500/15 text-sky-600",
  Suspended: "bg-red-500/15 text-red-600",
} as const;

export default function MembersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
      <p className="mt-1 text-sm opacity-70">
        {members.length} people have access to this workspace. Use the command palette to invite someone new.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-500/25">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Workspace members with role, status and join date</caption>
          <thead className="bg-slate-500/10 text-xs uppercase tracking-wide opacity-80">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Name</th>
              <th scope="col" className="px-4 py-3 font-semibold">Role</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-500/20">
            {members.map((m) => (
              <tr key={m.id}>
                <th scope="row" className="px-4 py-3 font-medium">
                  {m.name}
                  <span className="block text-xs font-normal opacity-70">{m.email}</span>
                </th>
                <td className="px-4 py-3">{m.role}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[m.status]}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(m.joined)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```