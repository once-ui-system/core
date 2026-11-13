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
