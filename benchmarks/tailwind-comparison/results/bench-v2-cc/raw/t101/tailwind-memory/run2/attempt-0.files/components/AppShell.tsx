"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { findCrumbs } from "@/lib/nav";
import { initials, user } from "@/lib/data";

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-sm" aria-label="Lumen home">
      <span
        aria-hidden="true"
        className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-brand font-serif text-sm font-bold text-white"
      >
        L
      </span>
      {!compact && <span className="font-serif text-base font-semibold text-ink">Lumen</span>}
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
  const wasOpen = useRef(false);

  const crumbs = findCrumbs(pathname);

  // Close the drawer after navigating.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Drawer behaviour: focus, Escape, focus trap, scroll lock, focus return.
  useEffect(() => {
    if (drawerOpen) {
      wasOpen.current = true;
      closeButtonRef.current?.focus();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const onKeyDown = (event: KeyboardEvent) => {
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
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      menuButtonRef.current?.focus();
    }
    return undefined;
  }, [drawerOpen]);

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-brand px-3 py-1.5 text-white focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface md:flex ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        <div
          className={`flex h-11 items-center border-b border-line ${
            collapsed ? "justify-center" : "px-3"
          }`}
        >
          <Brand compact={collapsed} />
        </div>
        <Sidebar collapsed={collapsed} />
        <div className={`border-t border-line p-2 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 items-center gap-2.5 rounded-sm px-2 text-sm font-medium text-ink-muted hover:bg-slate-100 hover:text-ink"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <>
                <PanelLeftClose aria-hidden="true" className="size-4" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col border-r border-line bg-surface shadow-lg"
          >
            <div className="flex h-11 items-center justify-between border-b border-line px-3">
              <Brand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="flex size-8 items-center justify-center rounded-sm text-ink-muted hover:bg-slate-100 hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-11 items-center gap-2 border-b border-line bg-surface px-3 sm:px-5">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav"
            className="flex size-8 items-center justify-center rounded-sm text-ink-muted hover:bg-slate-100 hover:text-ink md:hidden"
          >
            <Menu aria-hidden="true" className="size-4" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-sm text-ink-subtle">
              <li className="shrink-0">
                <Link href="/" className="rounded-sm hover:text-ink hover:underline">
                  Lumen
                </Link>
              </li>
              {crumbs && (
                <>
                  <li aria-hidden="true" className="shrink-0">
                    /
                  </li>
                  <li className="hidden shrink-0 sm:block">{crumbs.group}</li>
                  <li aria-hidden="true" className="hidden shrink-0 sm:block">
                    /
                  </li>
                  <li aria-current="page" className="truncate font-medium text-ink">
                    {crumbs.item}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-xs font-medium text-ink">{user.name}</p>
              <p className="text-xs text-ink-subtle">{user.role}</p>
            </div>
            <span
              role="img"
              aria-label={`${user.name}, ${user.role}`}
              className="flex size-7 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-ink"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" className="flex-1 px-3 py-4 sm:px-5">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
