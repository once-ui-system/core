"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { event, planner } from "@/lib/data";

const nav = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

const dateLabel = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${event.date}T00:00:00Z`));

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="no-print sticky top-0 z-30 border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex max-w-[1600px] items-center gap-x-4 px-4 py-2.5 sm:gap-x-6 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3.2" />
                <circle cx="12" cy="4.2" r="1.6" fill="currentColor" stroke="none" />
                <circle cx="12" cy="19.8" r="1.6" fill="currentColor" stroke="none" />
                <circle cx="4.2" cy="12" r="1.6" fill="currentColor" stroke="none" />
                <circle cx="19.8" cy="12" r="1.6" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className="sr-only font-display text-xl font-semibold tracking-tight sm:not-sr-only">Seatwise</span>
          </Link>

          <nav aria-label="Main" className="flex items-center gap-1 rounded-lg bg-secondary p-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden min-w-0 items-center gap-5 text-sm text-muted-foreground lg:flex">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {event.venue}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
            >
              HB
            </span>
            <span className="hidden text-sm font-medium sm:inline">{planner.name}</span>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        {children}
      </main>
    </div>
  );
}
