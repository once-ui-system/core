"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EVENT, PLANNER } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span aria-hidden className="grid size-8 grid-cols-2 gap-[3px] rounded-lg bg-primary p-[7px]">
              <span className="rounded-full bg-primary-foreground" />
              <span className="rounded-full bg-primary-foreground/50" />
              <span className="rounded-full bg-primary-foreground/50" />
              <span className="rounded-full bg-primary-foreground" />
            </span>
            <span className="text-base font-semibold tracking-tight">Seatwise</span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight md:block">
              <p className="text-sm font-medium">{EVENT.name}</p>
              <p className="text-xs text-muted-foreground">{EVENT.venue}</p>
            </div>
            <span
              className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold"
              title={PLANNER.name}
              role="img"
              aria-label={`Signed in as ${PLANNER.name}`}
            >
              HB
            </span>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6">
        {children}
      </main>
    </div>
  );
}
