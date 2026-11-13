```css app/globals.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-floor: var(--floor);
  --color-wall: var(--wall);
  --color-ok: var(--ok);
}

:root {
  --radius: 0.625rem;
  --background: oklch(0.982 0.005 88);
  --foreground: oklch(0.21 0.02 60);
  --card: oklch(0.998 0.002 88);
  --card-foreground: oklch(0.21 0.02 60);
  --popover: oklch(0.998 0.002 88);
  --popover-foreground: oklch(0.21 0.02 60);
  --primary: oklch(0.36 0.07 165);
  --primary-foreground: oklch(0.985 0.01 100);
  --secondary: oklch(0.953 0.01 88);
  --secondary-foreground: oklch(0.28 0.03 60);
  --muted: oklch(0.953 0.01 88);
  --muted-foreground: oklch(0.47 0.02 70);
  --accent: oklch(0.94 0.025 160);
  --accent-foreground: oklch(0.28 0.06 165);
  --destructive: oklch(0.52 0.21 27);
  --border: oklch(0.893 0.012 85);
  --input: oklch(0.87 0.012 85);
  --ring: oklch(0.55 0.09 165);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  --floor: oklch(0.968 0.014 90);
  --wall: oklch(0.45 0.03 70);
  --ok: oklch(0.45 0.11 155);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
  --floor: oklch(0.25 0.01 90);
  --wall: oklch(0.7 0.02 70);
  --ok: oklch(0.75 0.14 155);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]) {
    cursor: pointer;
  }
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next"
import { GuestList } from "@/components/seatwise/guest-list"

export const metadata: Metadata = {
  title: "Guest list | Seatwise",
  description: "Search and filter the guest list, see each guest's table and the meal counts for the caterer.",
}

export default function GuestsPage() {
  return <GuestList />
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/seatwise/app-header";
import { PlanProvider } from "@/components/seatwise/plan-provider";

export const metadata: Metadata = {
  title: "Seatwise | Ines & Mateo's wedding dinner",
  description: "Seating plan and guest list for Ines & Mateo's wedding dinner at The Orangery, Hollin Hall.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <PlanProvider>
          <div className="flex min-h-dvh flex-col">
            <AppHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
          </div>
        </PlanProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
"use client"

import * as React from "react"
import { FloorPlan } from "@/components/seatwise/floor-plan"
import { RuleSummary } from "@/components/seatwise/rules-view"
import { SidePanel, type SideTab } from "@/components/seatwise/side-panel"
import { Stats } from "@/components/seatwise/stats"
import { EVENT } from "@/lib/data"
import { formatDate } from "@/lib/seating"

export default function PlanPage() {
  const [tab, setTab] = React.useState<SideTab>("seat")

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Seating plan</h1>
        <p className="text-sm text-muted-foreground">
          {EVENT.name} · {formatDate(EVENT.date)} · {EVENT.venue}
        </p>
      </div>

      <Stats />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_410px]">
        <div className="flex min-w-0 flex-col gap-4">
          <RuleSummary onOpenRules={() => setTab("rules")} />
          <FloorPlan />
        </div>
        <aside className="min-w-0 lg:sticky lg:top-[72px] lg:max-h-[calc(100dvh-88px)] lg:self-start lg:overflow-y-auto">
          <SidePanel tab={tab} onTabChange={setTab} />
        </aside>
      </div>
    </div>
  )
}
```

```tsx components/seatwise/app-header.tsx
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
```

```tsx components/seatwise/floor-plan.tsx
"use client"

import * as React from "react"
import { TriangleAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EVENT, FIXTURES, TABLES, type Fixture, type TableDef } from "@/lib/data"
import {
  GUEST_BY_ID,
  LONG_H,
  LONG_W,
  PARTIES,
  ROUND_D,
  SEAT_D,
  SEAT_RING,
  initials,
  partyDotStyle,
  partyStyle,
} from "@/lib/seating"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-provider"

const m = (n: number) => `calc(var(--m) * ${n})`

function onActivate(fn: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      fn()
    }
  }
}

function FixtureShape({ f }: { f: Fixture }) {
  const base: React.CSSProperties = {
    left: m(f.x),
    top: m(f.y),
    width: m(f.w),
    height: m(f.h),
    fontSize: f.kind === "door" ? "max(8px, calc(var(--m) * 0.26))" : "max(9px, calc(var(--m) * 0.32))",
  }
  if (f.kind === "door") {
    return (
      <div
        style={{ ...base, writingMode: "vertical-rl" }}
        className="absolute grid place-items-center rounded-r-sm bg-primary font-semibold tracking-wider whitespace-nowrap text-primary-foreground uppercase"
        title={f.label}
      >
        {f.label}
      </div>
    )
  }
  const look: Record<Exclude<Fixture["kind"], "door">, string> = {
    stage: "rounded-md bg-foreground/85 text-background",
    dancefloor:
      "rounded-md border border-dashed border-primary/40 bg-accent text-accent-foreground [background-image:repeating-linear-gradient(45deg,transparent_0,transparent_9px,oklch(0.36_0.07_165/0.06)_9px,oklch(0.36_0.07_165/0.06)_18px)]",
    bar: "rounded-md bg-[oklch(0.42_0.06_55)] text-white",
  }
  return (
    <div
      style={base}
      className={cn("absolute grid place-items-center text-center font-semibold tracking-wider uppercase", look[f.kind])}
    >
      {f.label}
    </div>
  )
}

interface SeatProps {
  table: TableDef
  index: number
  cx: number
  cy: number
}

function Seat({ table, index, cx, cy }: SeatProps) {
  const { seats, armed, setArmed, dragging, setDragging, place, selectTable } = usePlan()
  const [over, setOver] = React.useState(false)
  const gid = seats[table.id][index]
  const guest = gid ? GUEST_BY_ID[gid] : null
  const isArmed = guest && armed === guest.id
  const targeting = Boolean(armed || dragging)

  function activate() {
    if (armed) {
      if (place(armed, table.id, index)) setArmed(null)
      return
    }
    selectTable(table.id)
  }

  const label = guest
    ? `${table.name}, seat ${index + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}`
    : `${table.name}, seat ${index + 1}: empty`

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      data-initials={guest ? initials(guest.name) : undefined}
      title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : "Empty seat"}
      draggable={Boolean(guest)}
      onDragStart={(e) => {
        if (!guest) return
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        setDragging(guest.id)
      }}
      onDragEnd={() => setDragging(null)}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        if (!over) setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || dragging
        setDragging(null)
        if (id) place(id, table.id, index)
      }}
      onClick={(e) => {
        e.stopPropagation()
        activate()
      }}
      onKeyDown={onActivate(activate)}
      style={{
        left: m(cx - SEAT_D / 2),
        top: m(cy - SEAT_D / 2),
        width: m(SEAT_D),
        height: m(SEAT_D),
        fontSize: "max(9px, calc(var(--m) * 0.34))",
        ...(guest ? partyStyle(guest.party) : undefined),
      }}
      className={cn(
        "absolute grid place-items-center rounded-full border-[1.5px] leading-none after:content-[attr(data-initials)] font-semibold outline-none transition-[transform,box-shadow] select-none focus-visible:ring-[3px] focus-visible:ring-ring",
        guest
          ? "cursor-grab shadow-xs hover:scale-110 active:cursor-grabbing"
          : "border-dashed border-muted-foreground/50 bg-background/70 hover:bg-accent",
        !guest && targeting && "border-solid border-primary bg-accent",
        over && "scale-125 ring-2 ring-primary",
        isArmed && "ring-2 ring-primary ring-offset-2 ring-offset-floor"
      )}
    >
      {guest?.diet ? (
        <span
          aria-hidden
          className="absolute -top-[8%] -right-[8%] size-[34%] rounded-full border border-white bg-amber-500"
        />
      ) : null}
    </div>
  )
}

function TableShape({ table }: { table: TableDef }) {
  const { counts, brokenTables, selectedTable, selectTable, armed, setArmed, dragging, setDragging, place } = usePlan()
  const [over, setOver] = React.useState(false)
  const filled = counts.perTable[table.id].filled
  const full = filled >= table.seats
  const broken = brokenTables.has(table.id)
  const selected = selectedTable === table.id
  const targeting = Boolean(armed || dragging)
  const long = table.shape === "long"

  const W = long ? LONG_W + 0.8 : 4
  const H = long ? LONG_H + 1.2 : 4
  const left = long ? table.x - 0.4 : table.x - 2
  const top = long ? table.y - 1 : table.y - 2

  const seatCenters = Array.from({ length: table.seats }, (_, i) => {
    if (long) {
      const step = LONG_W / table.seats
      return { x: 0.4 + step * (i + 0.5), y: 0.45 }
    }
    const a = (-90 + (360 * i) / table.seats) * (Math.PI / 180)
    return { x: W / 2 + SEAT_RING * Math.cos(a), y: H / 2 + SEAT_RING * Math.sin(a) }
  })

  function activate() {
    if (armed) {
      if (place(armed, table.id)) setArmed(null)
      return
    }
    selectTable(table.id)
  }

  const bodyStyle: React.CSSProperties = long
    ? { left: m(0.4), top: m(1), width: m(LONG_W), height: m(LONG_H) }
    : { left: m(W / 2 - ROUND_D / 2), top: m(H / 2 - ROUND_D / 2), width: m(ROUND_D), height: m(ROUND_D) }

  return (
    <div
      role="group"
      aria-label={`${table.name}, ${filled} of ${table.seats} seats taken${broken ? ", a rule is broken here" : ""}`}
      style={{
        left: m(left),
        top: m(top),
        width: m(W),
        height: m(H),
        transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined,
      }}
      className="absolute"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        if (!over) setOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const id = e.dataTransfer.getData("text/plain") || dragging
        setDragging(null)
        if (id) place(id, table.id)
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={activate}
        onKeyDown={onActivate(activate)}
        style={{ ...bodyStyle, fontSize: "max(10px, calc(var(--m) * 0.36))" }}
        className={cn(
          "absolute flex flex-col items-center justify-center border bg-card text-center leading-tight shadow-sm outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring",
          long ? "rounded-md" : "rounded-full",
          selected && "ring-[3px] ring-primary",
          broken && "border-destructive bg-destructive/5 ring-2 ring-destructive/60",
          selected && broken && "ring-primary",
          targeting && !full && "border-primary border-dashed bg-accent",
          targeting && full && "opacity-60",
          over && !full && "ring-[3px] ring-primary",
          over && full && "ring-[3px] ring-destructive"
        )}
      >
        <span className="font-semibold">{table.name}</span>
        <span className={cn("tabular-nums", full ? "text-ok font-medium" : "text-muted-foreground")}>
          {filled}/{table.seats}
          <span className="sr-only"> seats taken</span>
        </span>
        {broken ? (
          <TriangleAlert
            aria-hidden
            className="absolute -top-[6%] -right-[4%] size-[22%] rounded-full bg-background p-[3%] text-destructive"
          />
        ) : null}
      </div>
      {seatCenters.map((c, i) => (
        <Seat key={i} table={table} index={i} cx={c.x} cy={c.y} />
      ))}
    </div>
  )
}

export function FloorPlan() {
  const { armed, setArmed } = usePlan()
  const armedGuest = armed ? GUEST_BY_ID[armed] : null
  const { width, depth } = EVENT.room_m

  return (
    <section aria-labelledby="plan-title" className="rounded-xl border bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pt-3.5 pb-2 sm:px-5">
        <div>
          <h2 id="plan-title" className="text-base font-semibold tracking-tight">
            Room plan
          </h2>
          <p className="text-xs text-muted-foreground">
            {EVENT.venue} · {width} × {depth} m, drawn to scale
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Drag a guest onto a seat, or tap a guest, then a seat or table.</p>
      </div>

      <div aria-live="polite" className="px-4 sm:px-5">
        {armedGuest ? (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-accent px-3 py-2 text-sm text-accent-foreground">
            <span>
              Placing <strong>{armedGuest.name}</strong>: tap an empty seat or a table.
            </span>
            <Button size="xs" variant="outline" onClick={() => setArmed(null)}>
              <X /> Cancel
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto px-2 pb-2 sm:px-3">
        <div className="min-w-[660px] [container-type:inline-size]">
          <div
            className="relative aspect-[24/14] overflow-hidden rounded-lg border-2 border-wall/60 bg-floor"
            style={{
              backgroundImage:
                "linear-gradient(to right, oklch(0.5 0.02 80 / 0.09) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.5 0.02 80 / 0.09) 1px, transparent 1px)",
              backgroundSize: `calc(100% / ${width}) calc(100% / ${depth})`,
            }}
          >
            <div className="absolute inset-0" style={{ ["--m" as string]: "calc(100cqw / 24)" }}>
              {FIXTURES.map((f) => (
                <FixtureShape key={f.id} f={f} />
              ))}
              {TABLES.map((t) => (
                <TableShape key={t.id} table={t} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
        {PARTIES.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={partyDotStyle(p)} aria-hidden />
            {p}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-500" aria-hidden />
          Dietary need
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-dashed border-muted-foreground" aria-hidden />
          Empty seat
        </span>
      </div>
    </section>
  )
}
```

```tsx components/seatwise/guest-bits.tsx
"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Guest, Rsvp } from "@/lib/data"
import { RSVP_LABEL, initials, partyStyle } from "@/lib/seating"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-provider"

export function GuestAvatar({ guest, className }: { guest: Guest; className?: string }) {
  return (
    <span
      aria-hidden
      style={partyStyle(guest.party)}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] text-[11px] leading-none font-semibold",
        className
      )}
    >
      {initials(guest.name)}
    </span>
  )
}

export function DietBadge({ diet, className }: { diet: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100", className)}
    >
      {diet}
    </Badge>
  )
}

const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "border-emerald-300 bg-emerald-50 text-emerald-900",
  maybe: "border-sky-300 bg-sky-50 text-sky-900",
  pending: "border-slate-300 bg-slate-50 text-slate-800",
  no: "border-rose-300 bg-rose-50 text-rose-900",
}

export function RsvpBadge({ rsvp, className }: { rsvp: Rsvp; className?: string }) {
  return (
    <Badge variant="outline" className={cn(RSVP_STYLE[rsvp], className)}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  )
}

/** A guest without a seat: tap to pick them up, or drag them onto the plan. */
export function GuestRow({ guest }: { guest: Guest }) {
  const { armed, setArmed, setDragging } = usePlan()
  const isArmed = armed === guest.id
  const toggle = () => setArmed(isArmed ? null : guest.id)
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isArmed}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        setDragging(guest.id)
      }}
      onDragEnd={() => setDragging(null)}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          toggle()
        }
      }}
      className={cn(
        "flex cursor-grab items-center gap-2.5 rounded-lg border bg-card px-2 py-2 text-left outline-none transition-colors select-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing",
        isArmed && "border-primary bg-accent ring-2 ring-primary"
      )}
    >
      <GripVertical aria-hidden className="size-4 shrink-0 text-muted-foreground/60" />
      <GuestAvatar guest={guest} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{guest.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{guest.party}</span>
      </span>
      {guest.diet ? <DietBadge diet={guest.diet} /> : null}
      {guest.rsvp !== "yes" ? <RsvpBadge rsvp={guest.rsvp} /> : null}
    </div>
  )
}
```

```tsx components/seatwise/guest-list.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { Copy, Search, Utensils } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GUESTS, TABLES } from "@/lib/data"
import { DIETS, DIET_NONE, PARTIES, RSVP_LABEL, TABLE_BY_ID, partyDotStyle } from "@/lib/seating"
import { cn } from "@/lib/utils"
import { DietBadge, GuestAvatar, RsvpBadge } from "./guest-bits"
import { usePlan } from "./plan-provider"

const ALL = "all"
const NO_DIET = "__none"
const UNSEATED = "__unseated"

function mealOf(diet: string | null) {
  return diet ?? DIET_NONE
}

function MealCounts({ diet, onPick }: { diet: string; onPick: (d: string) => void }) {
  const meals = [DIET_NONE, ...DIETS]
  const rows = meals.map((meal) => {
    const confirmed = GUESTS.filter((g) => g.rsvp === "yes" && mealOf(g.diet) === meal).length
    const awaiting = GUESTS.filter(
      (g) => (g.rsvp === "maybe" || g.rsvp === "pending") && mealOf(g.diet) === meal
    ).length
    return { meal, confirmed, awaiting }
  })
  const totals = rows.reduce(
    (a, r) => ({ confirmed: a.confirmed + r.confirmed, awaiting: a.awaiting + r.awaiting }),
    { confirmed: 0, awaiting: 0 }
  )
  const declined = GUESTS.filter((g) => g.rsvp === "no").length

  function copy() {
    const text = [
      "Meals for Ines & Mateo's wedding dinner (attending guests)",
      ...rows.filter((r) => r.confirmed || r.awaiting).map(
        (r) => `${r.meal}: ${r.confirmed}${r.awaiting ? ` (+${r.awaiting} awaiting reply)` : ""}`
      ),
      `Total: ${totals.confirmed}`,
    ].join("\n")
    try {
      void navigator.clipboard.writeText(text).then(
        () => toast.success("Meal counts copied for the caterer."),
        () => toast.error("Could not copy. Select the table and copy it instead.")
      )
    } catch {
      toast.error("Could not copy. Select the table and copy it instead.")
    }
  }

  return (
    <section aria-labelledby="meals-title" className="rounded-xl border bg-card shadow-xs">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div>
          <h2 id="meals-title" className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Utensils aria-hidden className="size-4 text-muted-foreground" /> Meals for the caterer
          </h2>
          <p className="text-xs text-muted-foreground">Attending guests. Select a meal to filter the list.</p>
        </div>
        <Button size="sm" variant="outline" onClick={copy}>
          <Copy /> Copy
        </Button>
      </div>
      <div className="px-2 pt-2 pb-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meal</TableHead>
              <TableHead className="text-right">Attending</TableHead>
              <TableHead className="text-right">Awaiting</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const key = r.meal === DIET_NONE ? NO_DIET : r.meal
              const active = diet === key
              return (
                <TableRow key={r.meal} data-state={active ? "selected" : undefined}>
                  <TableCell className="p-0">
                    <button
                      type="button"
                      onClick={() => onPick(active ? ALL : key)}
                      aria-pressed={active}
                      className="w-full rounded-sm px-2 py-2 text-left text-sm outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      {r.meal}
                    </button>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{r.confirmed}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">{r.awaiting || "–"}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total meals</TableCell>
              <TableCell className="text-right tabular-nums">{totals.confirmed}</TableCell>
              <TableCell className="text-right tabular-nums">{totals.awaiting}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <p className="px-2 pt-2 text-xs text-muted-foreground">
          Awaiting is guests who answered maybe or have not replied. {declined} declined and are not counted.
        </p>
      </div>
    </section>
  )
}

function SeatSelect({ guestId }: { guestId: string }) {
  const { placement, counts, place, unseat } = usePlan()
  const guest = GUESTS.find((g) => g.id === guestId)!
  const current = placement[guestId]?.table ?? UNSEATED
  if (guest.rsvp === "no") return <span className="text-sm text-muted-foreground">Not coming</span>
  return (
    <Select
      value={current}
      onValueChange={(v) => {
        if (v === UNSEATED) unseat(guestId)
        else place(guestId, v)
      }}
    >
      <SelectTrigger size="sm" className="w-[140px]" aria-label={`Table for ${guest.name}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSEATED}>Unseated</SelectItem>
        {TABLES.map((t) => {
          const full = counts.perTable[t.id].filled >= t.seats && current !== t.id
          return (
            <SelectItem key={t.id} value={t.id} disabled={full}>
              {t.name}
              {full ? " (full)" : ""}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export function GuestList() {
  const { placement, counts } = usePlan()
  const [q, setQ] = React.useState("")
  const [party, setParty] = React.useState(ALL)
  const [rsvp, setRsvp] = React.useState(ALL)
  const [diet, setDiet] = React.useState(ALL)
  const [seating, setSeating] = React.useState(ALL)

  const filtered = GUESTS.filter((g) => {
    if (q && !g.name.toLowerCase().includes(q.trim().toLowerCase())) return false
    if (party !== ALL && g.party !== party) return false
    if (rsvp !== ALL && g.rsvp !== rsvp) return false
    if (diet === NO_DIET && g.diet) return false
    if (diet !== ALL && diet !== NO_DIET && g.diet !== diet) return false
    if (seating === "seated" && !placement[g.id]) return false
    if (seating === "unseated" && placement[g.id]) return false
    return true
  })
  const filtering = q !== "" || party !== ALL || rsvp !== ALL || diet !== ALL || seating !== ALL

  function reset() {
    setQ("")
    setParty(ALL)
    setRsvp(ALL)
    setDiet(ALL)
    setSeating(ALL)
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Guest list</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {GUESTS.length} invited · {counts.attending} attending · {counts.seated} seated ·{" "}
            {counts.unseated.length} attending without a seat
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Back to the plan</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start">
        <MealCounts diet={diet} onPick={setDiet} />

        <section aria-labelledby="guests-title" className="rounded-xl border bg-card shadow-xs">
          <h2 id="guests-title" className="sr-only">
            Guests
          </h2>
          <form
            role="search"
            aria-label="Filter guests"
            onSubmit={(e) => e.preventDefault()}
            className="grid gap-2 border-b p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]"
          >
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name"
                aria-label="Search guests by name"
                className="pl-8"
              />
            </div>
            <Filter
              label="party"
              all="All parties"
              value={party}
              onChange={setParty}
              options={PARTIES.map((p): [string, string] => [p, p])}
            />
            <Filter
              label="RSVP"
              all="All RSVPs"
              value={rsvp}
              onChange={setRsvp}
              options={(["yes", "maybe", "pending", "no"] as const).map((r): [string, string] => [r, RSVP_LABEL[r]])}
            />
            <Filter
              label="diet"
              all="All diets"
              value={diet}
              onChange={setDiet}
              options={[[NO_DIET, DIET_NONE], ...DIETS.map((d): [string, string] => [d, d])]}
            />
            <Filter
              label="seating"
              all="All seating"
              value={seating}
              onChange={setSeating}
              options={[
                ["seated", "Seated"],
                ["unseated", "Unseated"],
              ]}
            />
          </form>

          <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
            <p aria-live="polite">
              Showing {filtered.length} of {GUESTS.length} guests
            </p>
            {filtering ? (
              <Button variant="link" size="xs" className="h-auto px-0" onClick={reset}>
                Clear filters
              </Button>
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Guest</TableHead>
                <TableHead className="hidden sm:table-cell">RSVP</TableHead>
                <TableHead className="hidden sm:table-cell">Diet</TableHead>
                <TableHead className="pr-4">Table</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No guests match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((g) => {
                  const ref = placement[g.id]
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <GuestAvatar guest={g} />
                          <div className="min-w-0">
                            <p className="font-medium">{g.name}</p>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="size-2 rounded-full" style={partyDotStyle(g.party)} aria-hidden />
                              {g.party}
                            </p>
                            <p className="mt-1 flex flex-wrap gap-1 sm:hidden">
                              <RsvpBadge rsvp={g.rsvp} />
                              {g.diet ? <DietBadge diet={g.diet} /> : null}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <RsvpBadge rsvp={g.rsvp} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {g.diet ? <DietBadge diet={g.diet} /> : <span className="text-muted-foreground">None</span>}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex flex-col items-start gap-1">
                          {ref ? (
                            <span className={cn("text-xs text-muted-foreground")}>
                              {TABLE_BY_ID[ref.table].name}, seat {ref.seat + 1}
                            </span>
                          ) : null}
                          <SeatSelect guestId={g.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  )
}

function Filter({
  label,
  all,
  value,
  onChange,
  options,
}: {
  label: string
  all: string
  value: string
  onChange: (v: string) => void
  options: ReadonlyArray<readonly [string, string]>
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full" aria-label={`Filter by ${label}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{all}</SelectItem>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

```tsx components/seatwise/plan-provider.tsx
"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  GUEST_BY_ID,
  TABLE_BY_ID,
  computeCounts,
  evaluateRules,
  initialPlacement,
  seatsByTable,
  type Counts,
  type Placement,
  type RuleResult,
} from "@/lib/seating"

interface PlanApi {
  placement: Placement
  seats: Record<string, (string | null)[]>
  counts: Counts
  rules: RuleResult[]
  brokenTables: Set<string>
  selectedTable: string | null
  selectTable: (id: string | null) => void
  armed: string | null
  setArmed: (id: string | null) => void
  dragging: string | null
  setDragging: (id: string | null) => void
  place: (guestId: string, tableId: string, seat?: number) => boolean
  unseat: (guestId: string) => void
}

const PlanContext = React.createContext<PlanApi | null>(null)

export function usePlan(): PlanApi {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

function firstName(name: string) {
  return name.split(" ")[0]
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [placement, setPlacement] = React.useState<Placement>(initialPlacement)
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [armed, setArmed] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)

  const seats = React.useMemo(() => seatsByTable(placement), [placement])
  const counts = React.useMemo(() => computeCounts(placement), [placement])
  const rules = React.useMemo(() => evaluateRules(placement), [placement])
  const brokenTables = React.useMemo(() => {
    const s = new Set<string>()
    for (const r of rules) if (r.status === "broken") r.tableIds.forEach((t) => s.add(t))
    return s
  }, [rules])

  const commit = React.useCallback(
    (next: Placement, message: string) => {
      const before = new Set(rules.filter((r) => r.status === "broken").map((r) => r.id))
      setPlacement(next)
      toast.success(message)
      const newlyBroken = evaluateRules(next).filter((r) => r.status === "broken" && !before.has(r.id))
      for (const r of newlyBroken) toast.warning(`Rule broken: ${r.title}`, { description: r.detail })
    },
    [rules]
  )

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = GUEST_BY_ID[guestId]
      const table = TABLE_BY_ID[tableId]
      if (!guest || !table) return false
      if (guest.rsvp === "no") {
        toast.error(`${guest.name} has declined and cannot be seated.`)
        return false
      }
      const row = seats[tableId]
      const current = placement[guestId]
      let target = seat
      if (target === undefined) {
        if (current?.table === tableId) {
          toast.message(`${firstName(guest.name)} is already at ${table.name}.`)
          return false
        }
        target = row.indexOf(null)
        if (target < 0) {
          toast.error(`${table.name} is full.`, { description: "Drop on a taken seat to swap, or pick another table." })
          return false
        }
      }
      const occupant = row[target]
      if (occupant === guestId) return false
      if (occupant) {
        if (!current) {
          toast.error(`That seat is taken by ${GUEST_BY_ID[occupant].name}.`, {
            description: "Pick an empty seat, or unseat them first.",
          })
          return false
        }
        const next: Placement = {
          ...placement,
          [guestId]: { table: tableId, seat: target },
          [occupant]: current,
        }
        commit(next, `Swapped ${firstName(guest.name)} and ${firstName(GUEST_BY_ID[occupant].name)}.`)
        return true
      }
      const next: Placement = { ...placement, [guestId]: { table: tableId, seat: target } }
      commit(
        next,
        current
          ? `Moved ${firstName(guest.name)} to ${table.name}.`
          : `Seated ${firstName(guest.name)} at ${table.name}.`
      )
      return true
    },
    [placement, seats, commit]
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = GUEST_BY_ID[guestId]
      if (!guest || !placement[guestId]) return
      commit({ ...placement, [guestId]: null }, `${guest.name} is unseated.`)
    },
    [placement, commit]
  )

  const value = React.useMemo<PlanApi>(
    () => ({
      placement,
      seats,
      counts,
      rules,
      brokenTables,
      selectedTable,
      selectTable: setSelectedTable,
      armed,
      setArmed,
      dragging,
      setDragging,
      place,
      unseat,
    }),
    [placement, seats, counts, rules, brokenTables, selectedTable, armed, dragging, place, unseat]
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
```

```tsx components/seatwise/rules-view.tsx
"use client"

import { CircleCheck, CircleDashed, Info, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TABLE_BY_ID, type RuleResult, type RuleStatus } from "@/lib/seating"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-provider"

const KIND_LABEL: Record<RuleResult["kind"], string> = {
  together: "Together",
  apart: "Apart",
  near: "Near",
}

function StatusIcon({ status }: { status: RuleStatus }) {
  if (status === "broken") return <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
  if (status === "ok") return <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-ok" />
  return <CircleDashed aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
}

const STATUS_TEXT: Record<RuleStatus, string> = {
  broken: "Broken",
  ok: "Kept",
  open: "To do",
}

export function RulesList() {
  const { rules, selectTable } = usePlan()
  return (
    <ul className="flex flex-col gap-2">
      {rules.map((r) => (
        <li
          key={r.id}
          className={cn(
            "rounded-lg border bg-card p-3",
            r.status === "broken" && "border-destructive/40 bg-destructive/5"
          )}
        >
          <div className="flex gap-2.5">
            <StatusIcon status={r.status} />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">
                <span className="sr-only">{STATUS_TEXT[r.status]}. </span>
                {r.title}
              </p>
              <p className="mt-0.5 text-muted-foreground">{r.detail}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {KIND_LABEL[r.kind]} · {r.note}
              </p>
              {r.review ? (
                <p className="mt-1.5 flex gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                  <Info aria-hidden className="mt-px size-3.5 shrink-0" />
                  {r.review}
                </p>
              ) : null}
              {r.tableIds.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.tableIds.map((id) => (
                    <Button key={id} size="xs" variant="outline" onClick={() => selectTable(id)}>
                      {TABLE_BY_ID[id].name}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Short summary shown above the plan. */
export function RuleSummary({ onOpenRules }: { onOpenRules: () => void }) {
  const { rules } = usePlan()
  const broken = rules.filter((r) => r.status === "broken")
  const open = rules.filter((r) => r.status === "open").length
  const kept = rules.filter((r) => r.status === "ok").length

  return (
    <section
      aria-label="Couple's rules"
      className={cn(
        "rounded-xl border px-4 py-3",
        broken.length ? "border-destructive/40 bg-destructive/5" : "bg-card"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {broken.length ? (
            <TriangleAlert aria-hidden className="size-4 text-destructive" />
          ) : (
            <CircleCheck aria-hidden className="size-4 text-ok" />
          )}
          {broken.length
            ? `${broken.length} ${broken.length === 1 ? "rule is" : "rules are"} broken`
            : "No rules broken"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {kept} kept · {open} still to place · {rules.length} rules
        </p>
      </div>
      {broken.length ? (
        <ul className="mt-2 flex flex-col gap-1.5 text-sm">
          {broken.map((r) => (
            <li key={r.id}>
              <span className="font-medium">{r.title}.</span>{" "}
              <span className="text-muted-foreground">{r.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <Button variant="link" size="xs" className="mt-1 h-auto px-0" onClick={onOpenRules}>
        See all rules
      </Button>
    </section>
  )
}
```

```tsx components/seatwise/side-panel.tsx
"use client"

import * as React from "react"
import { ArrowLeft, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TABLES } from "@/lib/data"
import { TABLE_BY_ID } from "@/lib/seating"
import { useMedia } from "@/lib/use-media"
import { cn } from "@/lib/utils"
import { GuestRow } from "./guest-bits"
import { usePlan } from "./plan-provider"
import { RulesList } from "./rules-view"
import { TablePanel } from "./table-panel"

export type SideTab = "seat" | "tables" | "rules"

function TablesOverview() {
  const { counts, brokenTables, selectTable, selectedTable } = usePlan()
  return (
    <ul className="flex flex-col gap-1.5">
      {TABLES.map((t) => {
        const { filled, seats } = counts.perTable[t.id]
        const broken = brokenTables.has(t.id)
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => selectTable(t.id)}
              aria-pressed={selectedTable === t.id}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                broken && "border-destructive/40"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {t.name}
                  {broken ? (
                    <>
                      <TriangleAlert aria-hidden className="size-3.5 text-destructive" />
                      <span className="sr-only">Rule broken</span>
                    </>
                  ) : null}
                </span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span
                    className={cn("block h-full rounded-full", filled === seats ? "bg-ok" : "bg-primary/70")}
                    style={{ width: `${(filled / seats) * 100}%` }}
                  />
                </span>
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {filled}/{seats}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function SidePanel({ tab, onTabChange }: { tab: SideTab; onTabChange: (t: SideTab) => void }) {
  const { counts, rules, selectedTable, selectTable } = usePlan()
  const desktop = useMedia("(min-width: 1024px)")
  const brokenCount = rules.filter((r) => r.status === "broken").length
  const toSeat = counts.unseated.length

  React.useEffect(() => {
    if (selectedTable && desktop) onTabChange("tables")
  }, [selectedTable, desktop, onTabChange])

  return (
    <>
      <section aria-label="Guests, tables and rules" className="rounded-xl border bg-card shadow-xs">
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as SideTab)} className="gap-0">
          <div className="border-b p-2.5">
            <TabsList className="w-full [&_[data-slot=tabs-trigger]]:text-foreground/80">
              <TabsTrigger value="seat">
                To seat
                <span className="rounded-full bg-primary px-1.5 text-[11px] leading-5 text-primary-foreground tabular-nums">
                  {toSeat}
                </span>
              </TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="rules">
                Rules
                {brokenCount ? (
                  <span className="rounded-full bg-destructive px-1.5 text-[11px] leading-5 text-white tabular-nums">
                    {brokenCount}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="seat" className="p-3">
            <h3 className="text-sm font-semibold">Attending, no seat yet</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              {toSeat} {toSeat === 1 ? "guest" : "guests"} to place. Drag onto the plan, or tap a name then a seat.
            </p>
            {counts.unseated.length ? (
              <ul className="flex flex-col gap-1.5">
                {counts.unseated.map((g) => (
                  <li key={g.id}>
                    <GuestRow guest={g} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Everyone attending has a seat.
              </p>
            )}
            {counts.unconfirmed.length ? (
              <>
                <h3 className="mt-4 text-sm font-semibold">Not confirmed</h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  Maybe or no reply yet. You can hold a seat for them.
                </p>
                <ul className="flex flex-col gap-1.5">
                  {counts.unconfirmed.map((g) => (
                    <li key={g.id}>
                      <GuestRow guest={g} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="tables" className="p-3">
            {desktop && selectedTable ? (
              <div>
                <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => selectTable(null)}>
                  <ArrowLeft /> All tables
                </Button>
                <TablePanel tableId={selectedTable} />
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs text-muted-foreground">Choose a table to see its guests and diets.</p>
                <TablesOverview />
              </>
            )}
          </TabsContent>

          <TabsContent value="rules" className="p-3">
            <RulesList />
          </TabsContent>
        </Tabs>
      </section>

      <Sheet open={!desktop && selectedTable !== null} onOpenChange={(o) => !o && selectTable(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b pr-12">
            <SheetTitle>{selectedTable ? TABLE_BY_ID[selectedTable].name : "Table"}</SheetTitle>
            <SheetDescription>Guests at this table and their dietary needs.</SheetDescription>
          </SheetHeader>
          <div className="p-4">{selectedTable ? <TablePanel tableId={selectedTable} /> : null}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
```

```tsx components/seatwise/stats.tsx
"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { usePlan } from "./plan-provider"

function Tile({
  label,
  value,
  sub,
  tone,
  children,
}: {
  label: string
  value: React.ReactNode
  sub: React.ReactNode
  tone?: "alert"
  children?: React.ReactNode
}) {
  return (
    <div className={cn("rounded-xl border bg-card px-4 py-2.5 shadow-xs", tone === "alert" && "border-destructive/40 bg-destructive/5")}>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("text-xl font-semibold tracking-tight tabular-nums", tone === "alert" && "text-destructive")}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
      {children}
    </div>
  )
}

export function Stats() {
  const { counts, rules } = usePlan()
  const broken = rules.filter((r) => r.status === "broken").length
  const seatedAttending = counts.attending - counts.unseated.length
  const pct = counts.attending ? Math.round((seatedAttending / counts.attending) * 100) : 0

  return (
    <section aria-label="Seating counts" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        label="Seated"
        value={counts.seated}
        sub={`${seatedAttending} of ${counts.attending} attending guests`}
      >
        <Progress value={pct} aria-label="Attending guests seated" className="mt-2 h-1.5" />
      </Tile>
      <Tile
        label="Unseated"
        value={counts.unseated.length}
        sub={`attending, plus ${counts.unconfirmed.length} not confirmed`}
      />
      <Tile label="Free seats" value={counts.free} sub={`of ${counts.capacity} across 7 tables`} />
      <Tile
        label="Rules broken"
        value={broken}
        sub={`of ${rules.length} rules from the couple`}
        tone={broken ? "alert" : undefined}
      />
    </section>
  )
}
```

```tsx components/seatwise/table-panel.tsx
"use client"

import { TriangleAlert, Utensils, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TABLES } from "@/lib/data"
import { GUEST_BY_ID, TABLE_BY_ID } from "@/lib/seating"
import { cn } from "@/lib/utils"
import { DietBadge, GuestAvatar } from "./guest-bits"
import { usePlan } from "./plan-provider"

export function TablePanel({ tableId }: { tableId: string }) {
  const { seats, counts, rules, armed, setArmed, place, unseat } = usePlan()
  const table = TABLE_BY_ID[tableId]
  const row = seats[tableId]
  const { filled } = counts.perTable[tableId]
  const guests = row.flatMap((gid) => (gid ? [GUEST_BY_ID[gid]] : []))
  const free = table.seats - filled
  const broken = rules.filter((r) => r.status === "broken" && r.tableIds.includes(tableId))

  const diets = new Map<string, string[]>()
  for (const g of guests) {
    if (!g.diet) continue
    diets.set(g.diet, [...(diets.get(g.diet) ?? []), g.name])
  }
  const others = TABLES.filter((t) => t.id !== tableId && counts.perTable[t.id].filled < t.seats)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{table.name}</h3>
          <p className="text-sm text-muted-foreground tabular-nums">
            {filled} of {table.seats} seats filled · {free} free
          </p>
        </div>
        {armed && free > 0 ? (
          <Button
            size="sm"
            onClick={() => {
              if (place(armed, tableId)) setArmed(null)
            }}
          >
            Seat {GUEST_BY_ID[armed].name.split(" ")[0]} here
          </Button>
        ) : null}
      </div>

      {broken.length ? (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-destructive">
            <TriangleAlert aria-hidden className="size-4" /> Broken here
          </p>
          <ul className="mt-1 flex flex-col gap-1">
            {broken.map((r) => (
              <li key={r.id}>
                <span className="font-medium">{r.title}.</span>{" "}
                <span className="text-muted-foreground">{r.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <section aria-label="Dietary needs at this table" className="rounded-lg bg-muted/60 p-3">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <Utensils aria-hidden className="size-3.5" /> Dietary needs
        </h4>
        {diets.size === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">None at this table.</p>
        ) : (
          <ul className="mt-1.5 flex flex-col gap-1 text-sm">
            {[...diets.entries()].map(([diet, names]) => (
              <li key={diet} className="flex items-baseline gap-2">
                <DietBadge diet={diet} />
                <span className="text-muted-foreground">{names.join(", ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label={`Seats at ${table.name}`}>
        <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Seats</h4>
        <ol className="flex flex-col gap-1.5">
          {row.map((gid, i) => {
            const g = gid ? GUEST_BY_ID[gid] : null
            return (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-2 py-1.5",
                  g ? "bg-card" : "border-dashed bg-transparent"
                )}
              >
                <span className="w-4 shrink-0 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                {g ? (
                  <>
                    <GuestAvatar guest={g} className="size-7 text-[10px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{g.name}</span>
                      <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        {g.party}
                        {g.diet ? <DietBadge diet={g.diet} className="px-1.5 py-0 text-[11px]" /> : null}
                      </span>
                    </span>
                    <Select value="" onValueChange={(v) => place(g.id, v)}>
                      <SelectTrigger size="sm" className="w-[88px] px-2 text-xs" aria-label={`Move ${g.name} to another table`}>
                        <SelectValue placeholder="Move to" />
                      </SelectTrigger>
                      <SelectContent>
                        {others.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} ({t.seats - counts.perTable[t.id].filled} free)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Unseat ${g.name}`}
                      title="Unseat"
                      onClick={() => unseat(g.id)}
                    >
                      <X />
                    </Button>
                  </>
                ) : (
                  <span className="flex-1 py-1 text-sm text-muted-foreground">Empty seat</span>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no"

export interface Fixture {
  id: string
  kind: "stage" | "dancefloor" | "bar" | "door"
  label: string
  x: number
  y: number
  w: number
  h: number
}

export interface TableDef {
  id: string
  name: string
  shape: "round" | "long"
  seats: number
  x: number
  y: number
  rotation?: number
}

export interface Guest {
  id: string
  name: string
  party: string
  rsvp: Rsvp
  diet: string | null
  table: string | null
}

export interface Rule {
  kind: "together" | "apart" | "near"
  guests: string[]
  note: string
  /** A point the planner should confirm with the couple. */
  review?: string
}

export const APP_NAME = "Seatwise"

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
}

export const PLANNER = { name: "Hannah Brook" }

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
]

export const TABLES: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
]

export const GUESTS: Guest[] = [
  { id: "g-01", name: "Ines Carvalho", party: "Couple", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-02", name: "Mateo Alvarez", party: "Couple", rsvp: "yes", diet: "Vegetarian", table: "t-head" },
  { id: "g-03", name: "Rui Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-04", name: "Marta Carvalho", party: "Bride's family", rsvp: "yes", diet: "Gluten free", table: "t-head" },
  { id: "g-05", name: "Javier Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-06", name: "Lucia Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-head" },
  { id: "g-07", name: "Sofia Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-08", name: "Tiago Carvalho", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-09", name: "Avó Rosa Carvalho", party: "Bride's family", rsvp: "yes", diet: "Soft food", table: "t-1" },
  { id: "g-10", name: "Pedro Nunes", party: "Bride's family", rsvp: "yes", diet: null, table: "t-1" },
  { id: "g-11", name: "Ana Nunes", party: "Bride's family", rsvp: "yes", diet: "Vegan", table: "t-1" },
  { id: "g-12", name: "Carmen Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-13", name: "Diego Alvarez", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-14", name: "Elena Ruiz", party: "Groom's family", rsvp: "yes", diet: "Nut allergy", table: "t-4" },
  { id: "g-15", name: "Pablo Ruiz", party: "Groom's family", rsvp: "yes", diet: null, table: "t-4" },
  { id: "g-16", name: "Isabel Ruiz", party: "Groom's family", rsvp: "maybe", diet: null, table: null },
  { id: "g-17", name: "Chloe Martin", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-18", name: "Ben Okafor", party: "University friends", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-19", name: "Leila Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-20", name: "Omar Haddad", party: "University friends", rsvp: "yes", diet: "Halal", table: "t-2" },
  { id: "g-21", name: "Freya Lund", party: "University friends", rsvp: "yes", diet: "Vegetarian", table: null },
  { id: "g-22", name: "Jonas Lund", party: "University friends", rsvp: "yes", diet: null, table: null },
  { id: "g-23", name: "Grace Lee", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-24", name: "Marcus Webb", party: "Work friends", rsvp: "yes", diet: null, table: "t-5" },
  { id: "g-25", name: "Nadia Petrova", party: "Work friends", rsvp: "yes", diet: "Pescatarian", table: "t-5" },
  { id: "g-26", name: "Tom Fisher", party: "Work friends", rsvp: "no", diet: null, table: null },
  { id: "g-27", name: "Hana Sato", party: "Work friends", rsvp: "yes", diet: null, table: null },
  { id: "g-28", name: "Luis Ortega", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-29", name: "Kai Brennan", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-30", name: "Sean Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: "t-3" },
  { id: "g-31", name: "Ryan Doyle", party: "Groom's football club", rsvp: "yes", diet: null, table: null },
  { id: "g-32", name: "Hugo Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: "t-1" },
  { id: "g-33", name: "Mia Carvalho", party: "Bride's family", rsvp: "yes", diet: "Children's menu", table: null },
  { id: "g-34", name: "Paula Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-35", name: "Victor Mendes", party: "Bride's family", rsvp: "pending", diet: null, table: null },
  { id: "g-36", name: "Zoe Bennett", party: "Plus-ones", rsvp: "yes", diet: null, table: "t-2" },
  { id: "g-37", name: "Arjun Mehta", party: "Plus-ones", rsvp: "yes", diet: "Vegetarian", table: "t-5" },
  { id: "g-38", name: "Laura Svensson", party: "Plus-ones", rsvp: "yes", diet: null, table: null },
]

export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
    review:
      "The note names Sean and Ryan Doyle, but this rule is set on Kai Brennan and Sean Doyle. Worth confirming with the couple.",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
]
```

```ts lib/seating.ts
import type { CSSProperties } from "react"
import {
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  type Guest,
  type Rsvp,
  type TableDef,
} from "./data"

export const GUEST_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((g) => [g.id, g])
)
export const TABLE_BY_ID: Record<string, TableDef> = Object.fromEntries(
  TABLES.map((t) => [t.id, t])
)

export const DIET_NONE = "Standard menu"

/* ---------- geometry (metres) ---------- */

export const LONG_W = 8
export const LONG_H = 1.1
export const ROUND_D = 1.8
export const SEAT_D = 0.9
export const SEAT_RING = 1.4

export function tableCenter(t: TableDef): { x: number; y: number } {
  return t.shape === "long"
    ? { x: t.x + LONG_W / 2, y: t.y + LONG_H / 2 }
    : { x: t.x, y: t.y }
}

function fixtureCenter(kind: string): { x: number; y: number } {
  const f = FIXTURES.find((fx) => fx.kind === kind)
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2 } : { x: 0, y: 0 }
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/* ---------- placement ---------- */

export interface SeatRef {
  table: string
  seat: number
}
export type Placement = Record<string, SeatRef | null>

export function initialPlacement(): Placement {
  const next: Placement = {}
  const used: Record<string, number> = {}
  for (const g of GUESTS) {
    if (g.table) {
      const i = used[g.table] ?? 0
      used[g.table] = i + 1
      next[g.id] = { table: g.table, seat: i }
    } else {
      next[g.id] = null
    }
  }
  return next
}

/** For every table, one entry per seat: a guest id or null for an empty seat. */
export function seatsByTable(p: Placement): Record<string, (string | null)[]> {
  const out: Record<string, (string | null)[]> = {}
  for (const t of TABLES) out[t.id] = Array.from({ length: t.seats }, () => null)
  for (const [gid, ref] of Object.entries(p)) {
    if (ref) out[ref.table][ref.seat] = gid
  }
  return out
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open"

export interface RuleResult {
  id: string
  kind: "together" | "apart" | "near"
  status: RuleStatus
  title: string
  note: string
  detail: string
  tableIds: string[]
  review?: string
}

const NEAR_DOORS_MAX_M = 6
const FROM_BAND_MIN_M = 7

function tableName(id: string) {
  return TABLE_BY_ID[id]?.name ?? id
}

export function evaluateRules(p: Placement): RuleResult[] {
  return RULES.map((rule, i): RuleResult => {
    const id = `rule-${i}`
    const gs = rule.guests.map((gid) => GUEST_BY_ID[gid])
    const names = gs.map((g) => g.name)
    const refs = rule.guests.map((gid) => p[gid])
    const seatedTables = refs.flatMap((r) => (r ? [r.table] : []))
    const base = { id, kind: rule.kind, note: rule.note, review: rule.review }

    if (rule.kind === "together") {
      const title = `Keep together: ${names.join(" & ")}`
      if (refs.some((r) => !r)) {
        const waiting = gs.filter((_, k) => !refs[k]).map((g) => g.name)
        return {
          ...base,
          title,
          status: "open",
          detail: `Waiting for a seat: ${waiting.join(", ")}.`,
          tableIds: seatedTables,
        }
      }
      const same = refs.every((r) => r && r.table === refs[0]?.table)
      return {
        ...base,
        title,
        status: same ? "ok" : "broken",
        detail: same
          ? `Both at ${tableName(seatedTables[0])}.`
          : refs.map((r, k) => `${gs[k].name} is at ${tableName(r!.table)}`).join("; ") + ".",
        tableIds: [...new Set(seatedTables)],
      }
    }

    if (rule.kind === "apart") {
      const title = `Keep apart: ${names.join(" & ")}`
      if (refs.some((r) => !r)) {
        const placed = gs
          .map((g, k) => (refs[k] ? `${g.name} is at ${tableName(refs[k]!.table)}` : `${g.name} has no seat yet`))
          .join("; ")
        return { ...base, title, status: "ok", detail: `${placed}. Nothing to clash yet.`, tableIds: [] }
      }
      const clash = refs[0]!.table === refs[1]!.table
      return {
        ...base,
        title,
        status: clash ? "broken" : "ok",
        detail: clash
          ? `Both are at ${tableName(refs[0]!.table)}.`
          : `${gs[0].name} at ${tableName(refs[0]!.table)}, ${gs[1].name} at ${tableName(refs[1]!.table)}.`,
        tableIds: clash ? [refs[0]!.table] : [],
      }
    }

    // near
    const title = `Near the garden doors: ${names[0]}`
    const ref = refs[0]
    if (!ref) {
      return {
        ...base,
        title,
        status: "open",
        detail: `${names[0]} needs a seat within ${NEAR_DOORS_MAX_M} m of the garden doors and at least ${FROM_BAND_MIN_M} m from the band.`,
        tableIds: [],
      }
    }
    const c = tableCenter(TABLE_BY_ID[ref.table])
    const toDoors = dist(c, fixtureCenter("door"))
    const toBand = dist(c, fixtureCenter("stage"))
    const ok = toDoors <= NEAR_DOORS_MAX_M && toBand >= FROM_BAND_MIN_M
    const metrics = `${tableName(ref.table)} is ${toDoors.toFixed(1)} m from the garden doors and ${toBand.toFixed(1)} m from the band`
    return {
      ...base,
      title,
      status: ok ? "ok" : "broken",
      detail: ok
        ? `${metrics}.`
        : `${metrics}. Aim for under ${NEAR_DOORS_MAX_M} m from the doors and ${FROM_BAND_MIN_M} m or more from the band.`,
      tableIds: [ref.table],
    }
  })
}

/* ---------- counts ---------- */

export interface Counts {
  seated: number
  attending: number
  unseated: Guest[]
  unconfirmed: Guest[]
  declined: number
  capacity: number
  free: number
  perTable: Record<string, { filled: number; seats: number }>
}

export function computeCounts(p: Placement): Counts {
  const seatMap = seatsByTable(p)
  const perTable: Counts["perTable"] = {}
  let seated = 0
  let capacity = 0
  for (const t of TABLES) {
    const filled = seatMap[t.id].filter(Boolean).length
    perTable[t.id] = { filled, seats: t.seats }
    seated += filled
    capacity += t.seats
  }
  return {
    seated,
    attending: GUESTS.filter((g) => g.rsvp === "yes").length,
    unseated: GUESTS.filter((g) => g.rsvp === "yes" && !p[g.id]),
    unconfirmed: GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !p[g.id]),
    declined: GUESTS.filter((g) => g.rsvp === "no").length,
    capacity,
    free: capacity - seated,
    perTable,
  }
}

/* ---------- display helpers ---------- */

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
}

const PARTY_HUE: Record<string, number> = {
  Couple: 25,
  "Bride's family": 345,
  "Groom's family": 255,
  "University friends": 150,
  "Work friends": 85,
  "Groom's football club": 200,
  "Plus-ones": 305,
}

export const PARTIES = Array.from(new Set(GUESTS.map((g) => g.party)))

export function partyHue(party: string): number {
  return PARTY_HUE[party] ?? 0
}

export function partyStyle(party: string): CSSProperties {
  const h = partyHue(party)
  return {
    backgroundColor: `oklch(0.93 0.055 ${h})`,
    borderColor: `oklch(0.58 0.12 ${h})`,
    color: `oklch(0.3 0.08 ${h})`,
  }
}

export function partyDotStyle(party: string): CSSProperties {
  return { backgroundColor: `oklch(0.62 0.14 ${partyHue(party)})` }
}

export const DIETS = Array.from(
  new Set(GUESTS.flatMap((g) => (g.diet ? [g.diet] : [])))
).sort((a, b) => a.localeCompare(b))

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)
}
```

```ts lib/use-media.ts
"use client"

import * as React from "react"

/** True when the media query matches. False on the server and on first paint. */
export function useMedia(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
```

