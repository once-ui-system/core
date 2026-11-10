"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { initials, user } from "@/lib/data";
import { Nav } from "./nav";
import { crumbs } from "./nav-config";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex min-h-12 items-center gap-3 rounded-brand px-2"
      aria-label="Lumen home"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-brand bg-primary text-white">
        <Sparkles aria-hidden="true" className="size-5" />
      </span>
      {!compact && <span className="font-heading text-xl font-bold text-ink">Lumen</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
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
    const onResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [drawerOpen, closeDrawer]);

  const trail = crumbs[pathname] ?? ["Lumen"];

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only z-50 rounded-brand bg-primary px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-surface p-4 transition-[width] duration-200 lg:flex ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <div className={collapsed ? "flex justify-center" : ""}>
          <Brand compact={collapsed} />
        </div>
        <Nav collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-20 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="btn btn-secondary size-12 shrink-0 px-0 lg:hidden"
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="btn btn-secondary hidden size-12 shrink-0 px-0 lg:inline-flex"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-6" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-6" />
            )}
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-2 text-sm text-muted sm:text-base">
              {trail.map((label, index) => {
                const last = index === trail.length - 1;
                return (
                  <li key={label} className="flex min-w-0 items-center gap-2">
                    {index > 0 && <ChevronRight aria-hidden="true" className="size-4 shrink-0" />}
                    <span
                      aria-current={last ? "page" : undefined}
                      className={`truncate ${last ? "font-semibold text-ink" : ""}`}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="text-sm text-muted">{user.role}</p>
            </div>
            <span
              role="img"
              aria-label={`${user.name}, ${user.role}`}
              className="flex size-12 items-center justify-center rounded-full bg-brand-100 font-heading font-bold text-brand-800"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-sand-900/50"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-surface p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                ref={closeRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                className="btn btn-secondary size-12 px-0"
              >
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <Nav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
