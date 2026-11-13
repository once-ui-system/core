"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronRight, ChevronsLeft, ChevronsRight, Menu, Terminal, X } from "lucide-react";

import { SidebarNav } from "@/components/sidebar-nav";
import { initials, user } from "@/lib/data";
import { findNav } from "@/lib/nav";

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 rounded-ui px-1 ${collapsed ? "justify-center" : ""}`}
      aria-label="Lumen home"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-ui bg-brand text-on-brand">
        <Terminal aria-hidden="true" className="size-4" />
      </span>
      {collapsed ? null : <span className="font-mono text-lg font-semibold tracking-tight">Lumen</span>}
    </Link>
  );
}

function UserBadge({ showDetails }: { showDetails: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-ui border border-line-strong bg-raised font-mono text-xs font-semibold"
      >
        {initials(user.name)}
      </span>
      {showDetails ? (
        <span className="min-w-0 text-sm">
          <span className="block truncate font-medium">{user.name}</span>
          <span className="block truncate text-xs text-muted">{user.role}</span>
        </span>
      ) : (
        <span className="sr-only">
          {user.name}, {user.role}
        </span>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Lock scroll, focus the close button and close when the viewport becomes desktop-sized.
  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      query.removeEventListener("change", onChange);
    };
  }, [drawerOpen]);

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
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

  const current = findNav(pathname);

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-ui focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-brand"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 motion-reduce:transition-none lg:flex ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className={`flex h-14 items-center border-b border-line ${collapsed ? "justify-center px-2" : "px-4"}`}>
          <Brand collapsed={collapsed} />
        </div>
        <SidebarNav collapsed={collapsed} />
        <div className="border-t border-line p-2">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center gap-3 rounded-ui px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-fg ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight aria-hidden="true" className="size-5" />
            ) : (
              <>
                <ChevronsLeft aria-hidden="true" className="size-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
        <div className={`border-t border-line p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <UserBadge showDetails={!collapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-black/70" onClick={closeDrawer} />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onKeyDown={onPanelKeyDown}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface"
          >
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <Brand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-ui text-muted hover:bg-raised hover:text-fg"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            <div className="border-t border-line p-3">
              <UserBadge showDetails />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="flex size-9 items-center justify-center rounded-ui border border-line-strong text-fg hover:bg-raised lg:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm">
              <li className="hidden shrink-0 sm:block">
                <Link href="/" className="font-mono text-muted hover:text-fg">
                  Lumen
                </Link>
              </li>
              {current ? (
                <>
                  <li aria-hidden="true" className="hidden shrink-0 text-muted sm:block">
                    <ChevronRight className="size-4" />
                  </li>
                  <li className="shrink-0 font-mono text-muted">{current.group.label}</li>
                  <li aria-hidden="true" className="shrink-0 text-muted">
                    <ChevronRight className="size-4" />
                  </li>
                  <li aria-current="page" className="truncate font-mono font-semibold text-fg">
                    {current.item.label}
                  </li>
                </>
              ) : (
                <li aria-current="page" className="font-mono font-semibold text-fg">
                  Not found
                </li>
              )}
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted md:inline">{user.email}</span>
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-ui border border-line-strong bg-raised font-mono text-xs font-semibold"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 focus:outline-none sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
