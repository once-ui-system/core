"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, LayoutGrid, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANNER, initials } from "@/lib/data";
import { usePlan } from "@/components/plan-provider";

const NAV = [
  { href: "/", label: "Seating plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const plan = usePlan();
  const open = plan.unseatedAttending.length;

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-4 py-2 sm:gap-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Armchair className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight">Seatwise</span>
          </Link>
          <nav aria-label="Main" className="ml-1 flex items-center gap-1 sm:ml-4">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className={cn(href === "/" && "hidden sm:inline")}>{label}</span>
                  <span className={cn(href === "/" && "sm:hidden", "hidden")}>{href === "/" ? "Plan" : ""}</span>
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span
              className={cn(
                "hidden rounded-full px-2.5 py-1 text-xs font-medium tabular-nums md:inline-block",
                open > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900",
              )}
            >
              {open > 0 ? `${open} guests need a seat` : "Everyone seated"}
            </span>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
              >
                {initials(PLANNER.name)}
              </span>
              <span className="hidden text-sm font-medium lg:inline">{PLANNER.name}</span>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
