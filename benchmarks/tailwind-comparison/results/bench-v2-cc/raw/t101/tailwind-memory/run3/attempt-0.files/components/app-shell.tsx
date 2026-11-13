"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronsLeft, ChevronsRight, Menu, X } from "lucide-react";
import { initials, user } from "@/lib/data";
import { brandIcon as BrandIcon, findCurrent, navGroups } from "@/lib/nav";

function NavList({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const current = findCurrent(pathname);
  return (
    <nav aria-label="Main" className="flex flex-col gap-3 px-2 py-3">
      {navGroups.map((group, gi) => (
        <div
          key={group.label}
          role="group"
          aria-labelledby={`nav-group-${gi}`}
          className={collapsed && gi > 0 ? "border-t border-slate-200 pt-3" : undefined}
        >
          <h2
            id={`nav-group-${gi}`}
            className={
              collapsed
                ? "sr-only"
                : "mb-1 px-2 font-sans text-xs font-semibold uppercase tracking-wide text-slate-500"
            }
          >
            {group.label}
          </h2>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = current?.item.href === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`flex h-8 items-center gap-2 rounded-md px-2 text-sm font-medium no-underline ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active
                        ? "bg-brand-700 text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
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

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex h-12 items-center gap-2 border-b border-slate-200 px-3 text-slate-900 no-underline ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-700 text-white">
        <BrandIcon aria-hidden="true" className="size-3.5" />
      </span>
      <span className={collapsed ? "sr-only" : "font-serif text-base font-semibold"}>Lumen</span>
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

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    closeButtonRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
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
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  const current = findCurrent(pathname);

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-1.5 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white md:flex ${
          collapsed ? "w-12" : "w-56"
        }`}
      >
        <Brand collapsed={collapsed} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavList pathname={pathname} collapsed={collapsed} />
        </div>
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={`flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight aria-hidden="true" className="size-4" />
            ) : (
              <>
                <ChevronsLeft aria-hidden="true" className="size-4" />
                <span>Collapse</span>
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
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col bg-white shadow-lg"
          >
            <div className="flex h-12 items-center justify-between border-b border-slate-200 pr-2">
              <Brand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close navigation"
                className="flex size-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <NavList pathname={pathname} collapsed={false} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:px-4">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="flex size-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden"
          >
            <Menu aria-hidden="true" className="size-4" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 truncate text-sm text-slate-500">
              <li>
                <Link href="/">Lumen</Link>
              </li>
              {current && (
                <>
                  <li aria-hidden="true">/</li>
                  <li className="hidden sm:block">{current.group.label}</li>
                  <li aria-hidden="true" className="hidden sm:block">
                    /
                  </li>
                  <li aria-current="page" className="truncate font-medium text-slate-900">
                    {current.item.label}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-md bg-slate-200 text-xs font-semibold text-slate-700"
            >
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main id="main" className="flex-1 px-3 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
