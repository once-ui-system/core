"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, CalendarDays, LayoutGrid, MapPin, Users } from "lucide-react";
import { EVENT, PLANNER } from "@/lib/data";
import { initials } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

const DATE = new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function Header() {
  const pathname = usePathname();
  return (
    <header className="border-b border-stone-200 bg-white print:border-0">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg pr-1">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-800 text-white">
            <Armchair size={19} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-stone-900">Seatwise</span>
        </Link>

        <nav aria-label="Main" className="order-last flex w-full gap-1 sm:order-none sm:w-auto print:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors sm:flex-none ${
                  active ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-4">
          <div className="hidden min-w-0 text-right md:block">
            <p className="truncate font-serif text-base font-semibold text-stone-900">{EVENT.name}</p>
            <p className="flex items-center justify-end gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} aria-hidden="true" />
                {DATE}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} aria-hidden="true" />
                {EVENT.venue}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2" title={`Planner: ${PLANNER.name}`}>
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-full bg-stone-800 text-xs font-semibold text-white"
            >
              {initials(PLANNER.name)}
            </span>
            <span className="hidden text-sm text-stone-700 lg:inline">{PLANNER.name}</span>
          </div>
        </div>
      </div>
      <p className="border-t border-stone-100 px-4 py-2 text-center text-xs text-stone-500 md:hidden">
        <span className="font-medium text-stone-700">{EVENT.name}</span> · {EVENT.venue}
      </p>
    </header>
  );
}
