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
