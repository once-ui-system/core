"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Armchair, CalendarDays, LayoutGrid, Users } from "lucide-react";
import { EVENT, PLANNER, formatEventDate } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PlanProvider } from "@/components/plan-provider";

const NAV = [
  { href: "/", label: "Plan", icon: LayoutGrid },
  { href: "/guests", label: "Guests", icon: Users },
];

function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Armchair className="size-4.5" aria-hidden="true" />
          </span>
          <span className="text-base">Seatwise</span>
        </Link>

        <nav aria-label="Primary" className="ml-1 flex items-center gap-1">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <CalendarDays className="size-4" aria-hidden="true" />
            <span className="max-w-[28ch] truncate">
              {EVENT.name} · {formatEventDate(EVENT.date).replace(/^\w+ /, "")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
            >
              HB
            </span>
            <span className="sr-only sm:not-sr-only sm:text-sm sm:font-medium">{PLANNER.name}</span>
          </div>
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </div>
    </PlanProvider>
  );
}
