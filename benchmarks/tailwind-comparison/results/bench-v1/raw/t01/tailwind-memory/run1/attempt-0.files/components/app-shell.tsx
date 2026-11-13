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
