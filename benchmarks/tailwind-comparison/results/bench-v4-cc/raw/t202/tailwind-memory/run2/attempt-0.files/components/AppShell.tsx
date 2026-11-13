"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, LayoutGrid, Users } from "lucide-react";
import { event, planner } from "@/lib/data";

const NAV = [
  { href: "/", label: "Seating plan", icon: LayoutGrid },
  { href: "/guests", label: "Guest list", icon: Users },
];

const dateLabel = new Date(`${event.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-card/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-800 text-brand-50 shadow-sm">
              <Armchair className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">Seatwise</span>
          </Link>

          <div className="order-3 w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
            <p className="truncate text-sm font-medium">{event.name}</p>
            <p className="truncate text-xs text-muted">
              {dateLabel} · {event.venue}
            </p>
          </div>

          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                    active ? "bg-brand-800 text-white" : "text-ink/75 hover:bg-brand-50"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-2 sm:ml-0 md:flex">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-accent-100 text-sm font-semibold text-accent-800"
            >
              HB
            </span>
            <span className="text-sm">
              <span className="block font-medium leading-tight">{planner.name}</span>
              <span className="block text-xs leading-tight text-muted">Wedding planner</span>
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
