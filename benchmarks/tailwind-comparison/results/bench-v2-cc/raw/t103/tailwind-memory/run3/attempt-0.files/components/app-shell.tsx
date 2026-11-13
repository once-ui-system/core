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
