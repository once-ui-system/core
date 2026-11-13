"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Activity, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import NavList from "@/components/NavList";
import { initials, user } from "@/lib/data";
import { findNav } from "@/lib/nav";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-md font-mono text-lg font-semibold">
      <span className="grid size-8 place-items-center rounded-md bg-brand-500 text-on-brand">
        <Activity aria-hidden="true" className="size-5" />
      </span>
      <span className={compact ? "sr-only" : ""}>Lumen</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const current = findNav(pathname);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const menuButton = menuButtonRef.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
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
      menuButton?.focus();
    };
  }, [drawerOpen]);

  const iconButton =
    "inline-flex size-9 items-center justify-center rounded-md border border-line text-muted hover:bg-raised hover:text-fg";

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-brand-500 px-3 py-2 text-on-brand focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 md:flex ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className={`flex h-16 items-center border-b border-line ${collapsed ? "justify-center" : "px-4"}`}>
          <Brand compact={collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Brand />
              <button
                ref={closeRef}
                type="button"
                className={iconButton}
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavList onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6">
          <button
            ref={menuButtonRef}
            type="button"
            className={`${iconButton} md:hidden`}
            aria-label="Open navigation"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            className={`${iconButton} hidden md:inline-flex`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-5" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-5" />
            )}
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-sm text-muted">
              <li className="hidden sm:block">
                <Link href="/" className="rounded-md hover:text-fg">
                  Lumen
                </Link>
              </li>
              {current && (
                <>
                  <li aria-hidden="true" className="hidden sm:block">
                    <ChevronRight className="size-4" />
                  </li>
                  <li>{current.group.label}</li>
                  <li aria-hidden="true">
                    <ChevronRight className="size-4" />
                  </li>
                  <li aria-current="page" className="truncate font-medium text-fg">
                    {current.item.label}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">{user.role}</p>
            </div>
            <span
              role="img"
              aria-label={`Signed in as ${user.name}`}
              className="grid size-9 place-items-center rounded-md border border-line bg-raised font-mono text-xs"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
