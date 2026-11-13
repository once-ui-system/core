"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, MapPin, Users } from "lucide-react";
import { PlanProvider, usePlan } from "./PlanProvider";
import { APP, EVENT, PLANNER, formatDate, initials } from "@/lib/data";

const NAV = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

function Toast() {
  const { notice } = usePlan();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      {notice ? (
        <p
          key={notice.id}
          className={`pointer-events-auto max-w-md rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg ${
            notice.ok ? "bg-stone-900 text-white" : "bg-red-700 text-white"
          }`}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}

function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-xl bg-brand font-display text-lg font-semibold text-white"
          >
            S
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">{APP}</span>
        </Link>

        <div className="order-3 flex min-w-0 basis-full flex-col sm:order-none sm:basis-auto sm:flex-1">
          <p className="truncate text-sm font-semibold">{EVENT.name}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatDate(EVENT.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {EVENT.venue}
            </span>
          </p>
        </div>

        <nav aria-label="Main" className="ml-auto flex gap-1 rounded-xl bg-stone-100 p-1 sm:ml-0">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors ${
                  active ? "bg-white text-brand shadow-sm" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-stone-200 text-xs font-bold text-stone-700"
          >
            {initials(PLANNER.name)}
          </span>
          <span className="text-sm leading-tight">
            <span className="block font-semibold">{PLANNER.name}</span>
            <span className="block text-xs text-stone-600">Wedding planner</span>
          </span>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PlanProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        {children}
      </main>
      <Toast />
    </PlanProvider>
  );
}
