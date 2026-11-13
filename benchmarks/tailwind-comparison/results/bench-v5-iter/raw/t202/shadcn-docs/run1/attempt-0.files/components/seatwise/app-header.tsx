"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDaysIcon, LayoutDashboardIcon, MapPinIcon, UsersIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { event, planner } from "@/lib/data"
import { formatEventDate } from "@/lib/plan"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "Plan", icon: LayoutDashboardIcon },
  { href: "/guests", label: "Guests", icon: UsersIcon },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 px-3 sm:gap-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-primary font-serif text-lg leading-none text-primary-foreground"
          >
            S
          </span>
          <span className="font-serif text-xl tracking-tight">Seatwise</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <Icon aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden min-w-0 items-center gap-4 text-sm lg:flex">
          <div className="min-w-0 text-right leading-tight">
            <p className="truncate font-medium">{event.name}</p>
            <p className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDaysIcon className="size-3" aria-hidden />
                {formatEventDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3" aria-hidden />
                {event.venue}
              </span>
            </p>
          </div>
        </div>
        <Avatar className="ml-auto size-8 lg:ml-0" title={planner.name}>
          <AvatarFallback className="bg-accent text-xs font-medium">HB</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
