"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, MapPin, Users } from "lucide-react";
import { event, formatEventDate, planner } from "@/lib/data";

const NAV = [
  { href: "/", label: "Seating plan", icon: LayoutGrid },
  { href: "/guests", label: "Guest list", icon: Users },
];

export default function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur print:border-0">
      <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-brand-700">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="white" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3.6" />
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <circle
                  key={a}
                  cx={12 + 8 * Math.cos((a * Math.PI) / 180)}
                  cy={12 + 8 * Math.sin((a * Math.PI) / 180)}
                  r="1.4"
                  fill="white"
                  stroke="none"
                />
              ))}
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Seatwise</span>
        </Link>

        <nav aria-label="Main" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto print:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:flex-none ${
                  active ? "bg-brand-50 text-brand-800" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold leading-tight">{event.name}</p>
            <p className="mt-0.5 flex items-center justify-end gap-3 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatEventDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden="true" />
                {event.venue}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-stone-800 text-xs font-semibold text-white">
              HB
            </span>
            <span className="hidden text-sm font-medium lg:inline">{planner.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
