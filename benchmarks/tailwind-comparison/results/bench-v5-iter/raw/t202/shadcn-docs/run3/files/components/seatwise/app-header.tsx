"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Armchair, CalendarDays, MapPin } from "lucide-react"
import { APP_NAME, EVENT, PLANNER } from "@/lib/data"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "Seating plan" },
  { href: "/guests", label: "Guest list" },
]

export function AppHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:gap-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Armchair className="size-4.5" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight max-[479px]:sr-only">{APP_NAME}</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap sm:px-3 font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden text-right leading-tight md:block">
            <p className="text-sm font-medium">{EVENT.name}</p>
            <p className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" aria-hidden />
                19 Jun 2027
              </span>
              <span className="hidden items-center gap-1 xl:inline-flex">
                <MapPin className="size-3" aria-hidden />
                {EVENT.venue}
              </span>
            </p>
          </div>
          <div
            className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground ring-1 ring-border"
            title={PLANNER.name}
            role="img"
            aria-label={`Signed in as ${PLANNER.name}`}
          >
            HB
          </div>
        </div>
      </div>
    </header>
  )
}
