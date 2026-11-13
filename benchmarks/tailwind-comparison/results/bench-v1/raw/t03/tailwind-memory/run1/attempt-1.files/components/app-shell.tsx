"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
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

function subscribeNoop(): () => void {
  return () => {};
}
function getIsMac(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}
function getIsMacServer(): boolean {
  return false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const isMac = useSyncExternalStore(subscribeNoop, getIsMac, getIsMacServer);

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
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openInvite = useCallback(() => setInviteOpen(true), []);
  const closeInvite = useCallback(() => setInviteOpen(false), []);

  const dark = theme === "dark";
  const shortcut = isMac ? "⌘K" : "Ctrl K";

  return (
    <div
      className={`min-h-screen ${dark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
      data-theme={theme}
    >
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
                suppressHydrationWarning
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
                  active ? "text-indigo-500" : dark ? "text-slate-400" : "text-slate-600"
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
        onClose={closePalette}
        dark={dark}
        onToggleTheme={toggleTheme}
        onInvite={openInvite}
      />
      <InviteDialog open={inviteOpen} onClose={closeInvite} dark={dark} />
    </div>
  );
}
