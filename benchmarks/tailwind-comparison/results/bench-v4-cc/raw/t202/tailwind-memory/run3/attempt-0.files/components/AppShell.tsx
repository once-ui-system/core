"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, MapPin, TriangleAlert, Undo2, Users, X, Armchair } from "lucide-react";
import type { ReactNode } from "react";

import { APP, EVENT, PLANNER } from "@/lib/data";
import { usePlan } from "./PlanProvider";

const LINKS = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

const dateLabel = new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const plan = usePlan();
  const { notice } = plan;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>
      <header className="bg-stone-900 text-stone-100 print:hidden">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-lg pr-2 text-base font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-amber-400 text-stone-900">
              <Armchair className="size-5" aria-hidden="true" />
            </span>
            {APP.name}
          </Link>
          <nav aria-label="Primary" className="ml-1 flex gap-1">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${
                    active ? "bg-stone-100 text-stone-900" : "text-stone-300 hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-sm text-stone-300 sm:inline">{PLANNER.name}</span>
            <span
              className="grid size-9 place-items-center rounded-full bg-stone-700 text-xs font-semibold text-stone-100"
              aria-hidden="true"
            >
              HB
            </span>
          </div>
        </div>
      </header>

      <div className="border-b border-stone-200 bg-white print:border-0">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2.5 text-sm sm:px-6">
          <p className="font-semibold text-stone-900">{EVENT.name}</p>
          <p className="flex items-center gap-1.5 text-stone-600">
            <CalendarDays className="size-4 text-stone-400" aria-hidden="true" />
            <time dateTime={EVENT.date}>{dateLabel}</time>
          </p>
          <p className="flex items-center gap-1.5 text-stone-600">
            <MapPin className="size-4 text-stone-400" aria-hidden="true" />
            {EVENT.venue}
          </p>
        </div>
      </div>

      <main id="main" className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-6">
        {children}
      </main>

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden"
      >
        {notice && (
          <div
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-xl ${
              notice.tone === "warn" ? "bg-red-700 text-white" : "bg-stone-900 text-white"
            }`}
          >
            {notice.tone === "warn" && <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />}
            <span className="min-w-0 flex-1">{notice.text}</span>
            {notice.tone === "info" && plan.canUndo && (
              <button
                type="button"
                onClick={plan.undo}
                className="flex min-h-9 items-center gap-1 rounded-lg px-2 font-medium text-amber-300 hover:bg-white/10"
              >
                <Undo2 className="size-4" aria-hidden="true" />
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={plan.dismissNotice}
              aria-label="Dismiss message"
              className="grid size-9 place-items-center rounded-lg hover:bg-white/10"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
