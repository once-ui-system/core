"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";
import { user } from "@/lib/data";
import { NAV, crumbsFor, isCurrent } from "@/lib/nav";

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 rounded-ui px-2 py-2 ${collapsed ? "justify-center" : ""}`}
      aria-label="Lumen home"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-ui bg-brand-600 text-white">
        <Sparkles aria-hidden="true" className="size-6" />
      </span>
      {!collapsed && (
        <span className="font-heading text-2xl font-bold text-sand-900">Lumen</span>
      )}
    </Link>
  );
}

function NavList({
  collapsed,
  onNavigate,
  idPrefix,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  idPrefix: string;
}) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label={idPrefix === "mobile" ? "Mobile" : "Main"} className="flex flex-col gap-6">
      {NAV.map((group) => {
        const groupId = `${idPrefix}-${group.label.toLowerCase()}`;
        const isClosed = !collapsed && closed[group.label];
        return (
          <div key={group.label}>
            {collapsed ? (
              <hr className="mx-3 mb-3 border-sand-200" aria-hidden="true" />
            ) : (
              <button
                type="button"
                aria-expanded={!isClosed}
                aria-controls={groupId}
                onClick={() => setClosed((c) => ({ ...c, [group.label]: !c[group.label] }))}
                className="mb-2 flex min-h-11 w-full items-center justify-between rounded-ui px-4 text-sm font-semibold uppercase tracking-wider text-sand-600 hover:bg-sand-100"
              >
                {group.label}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${isClosed ? "-rotate-90" : ""}`}
                />
              </button>
            )}
            <ul id={groupId} hidden={isClosed} className="flex flex-col gap-1">
              {group.items.map((item) => {
                const current = isCurrent(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`flex min-h-12 items-center gap-3 rounded-ui px-4 text-base font-medium transition-colors ${
                        collapsed ? "justify-center px-0" : ""
                      } ${
                        current
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-sand-800 hover:bg-sand-100"
                      }`}
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      <span className={collapsed ? "sr-only" : ""}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
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
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-sand-950/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-sand-50 p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-12 items-center justify-center rounded-ui text-sand-800 hover:bg-sand-100"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>
        <NavList collapsed={false} onNavigate={onClose} idPrefix="mobile" />
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const crumbs = crumbsFor(pathname);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only z-[60] rounded-ui bg-brand-600 px-5 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col gap-6 overflow-y-auto border-r border-sand-200 bg-white/60 p-4 transition-[width] duration-200 md:flex ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <Brand collapsed={collapsed} />
        <div className="flex-1">
          <NavList collapsed={collapsed} idPrefix="desktop" />
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex min-h-12 items-center gap-3 rounded-ui px-4 text-base font-medium text-sand-700 hover:bg-sand-100 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" className="size-5" />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" className="size-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-20 items-center gap-3 border-b border-sand-200 bg-sand-50/90 px-4 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className="flex size-12 items-center justify-center rounded-ui text-sand-800 hover:bg-sand-100 md:hidden"
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-sand-600 sm:text-base">
              <li>
                <Link href="/" className="rounded-ui px-1 text-brand-700 underline">
                  Lumen
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li>{crumbs.group}</li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li aria-current="page" className="font-semibold text-sand-900">
                {crumbs.label}
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-sand-900">{user.name}</p>
              <p className="text-xs text-sand-600">{user.role}</p>
            </div>
            <span
              className="flex size-12 items-center justify-center rounded-full bg-brand-100 font-heading font-bold text-brand-800"
              role="img"
              aria-label={`${user.name}, ${user.role}`}
            >
              {initials}
            </span>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
          {children}
        </main>
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
