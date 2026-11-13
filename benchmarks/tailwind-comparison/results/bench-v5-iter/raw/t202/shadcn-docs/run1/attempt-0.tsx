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
  --color-room: var(--room);
  --color-room-line: var(--room-line);
  --color-gold: var(--gold);
  --color-warn: var(--warn);
  --color-ok: var(--ok);
  --font-serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
}

:root {
  --radius: 0.625rem;
  --background: oklch(0.982 0.005 88);
  --foreground: oklch(0.22 0.02 165);
  --card: oklch(0.996 0.003 90);
  --card-foreground: oklch(0.22 0.02 165);
  --popover: oklch(0.996 0.003 90);
  --popover-foreground: oklch(0.22 0.02 165);
  --primary: oklch(0.36 0.06 165);
  --primary-foreground: oklch(0.98 0.01 90);
  --secondary: oklch(0.953 0.01 90);
  --secondary-foreground: oklch(0.27 0.03 165);
  --muted: oklch(0.953 0.01 90);
  --muted-foreground: oklch(0.47 0.015 120);
  --accent: oklch(0.93 0.035 88);
  --accent-foreground: oklch(0.3 0.04 80);
  --destructive: oklch(0.5 0.21 27);
  --border: oklch(0.905 0.01 90);
  --input: oklch(0.88 0.01 90);
  --ring: oklch(0.58 0.08 165);
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
  --room: oklch(0.965 0.012 88);
  --room-line: oklch(0.72 0.03 90);
  --gold: oklch(0.72 0.12 85);
  --warn: oklch(0.54 0.21 27);
  --ok: oklch(0.5 0.12 155);
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
  --room: oklch(0.22 0 0);
  --room-line: oklch(0.5 0 0);
  --gold: oklch(0.78 0.12 85);
  --warn: oklch(0.704 0.191 22.216);
  --ok: oklch(0.72 0.14 155);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button:not(:disabled),
  [role="button"] {
    cursor: pointer;
  }
}

@media print {
  body {
    background: white;
  }
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next"
import { GuestsView } from "@/components/seatwise/guests-view"

export const metadata: Metadata = { title: "Guest list" }

export default function Page() {
  return <GuestsView />
}
```

```tsx app/layout.tsx
import "./globals.css"

import type { Metadata, Viewport } from "next"
import { AppHeader } from "@/components/seatwise/app-header"
import { PlanProvider } from "@/components/seatwise/plan-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s | Seatwise" },
  description: "Seating plans for wedding and event planners.",
}

export const viewport: Viewport = { width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <PlanProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            Skip to content
          </a>
          <AppHeader />
          <main id="main">{children}</main>
        </PlanProvider>
        <Toaster />
      </body>
    </html>
  )
}
```

```tsx app/page.tsx
import type { Metadata } from "next"
import { PlanView } from "@/components/seatwise/plan-view"

export const metadata: Metadata = { title: "Seating plan" }

export default function Page() {
  return <PlanView />
}
```

```tsx components/seatwise/app-header.tsx
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
```

```tsx components/seatwise/floor-plan.tsx
"use client"

import * as React from "react"

import { event, fixtures, tables, type Fixture, type Guest, type TableDef } from "@/lib/data"
import {
  LONG_H,
  LONG_W,
  SEAT_R,
  initials,
  partyColor,
  seatPositions,
  tableRadius,
} from "@/lib/plan"

export interface FloorPlanProps {
  seatMap: Record<string, (Guest | null)[]>
  selectedTable: string | null
  heldGuest: string | null
  dragging: string | null
  brokenTables: Set<string>
  brokenGuests: Set<string>
  onTableClick: (tableId: string) => void
  onSeatClick: (tableId: string, seat: number) => void
  onDropGuest: (guestId: string, tableId: string, seat?: number) => void
}

interface Over {
  table: string
  seat?: number
}

const TEXT = "var(--foreground)"
const MUTED = "var(--muted-foreground)"

export function FloorPlan(props: FloorPlanProps) {
  const { seatMap, selectedTable, heldGuest, dragging, brokenTables, brokenGuests } = props
  const [over, setOver] = React.useState<Over | null>(null)
  const activeOver = dragging ? over : null
  const placing = heldGuest !== null || dragging !== null
  const { width, depth } = event.room_m

  return (
    <svg
      viewBox={`-0.5 -0.5 ${width + 1} ${depth + 1}`}
      className="block h-auto w-full select-none"
      role="group"
      aria-label={`Floor plan of ${event.venue}, ${width} by ${depth} metres, drawn to scale`}
    >
      <defs>
        <pattern id="dance-checker" width="1" height="1" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="oklch(0.93 0.05 88)" />
          <rect width="0.5" height="0.5" fill="oklch(0.89 0.07 85)" />
          <rect x="0.5" y="0.5" width="0.5" height="0.5" fill="oklch(0.89 0.07 85)" />
        </pattern>
        <pattern id="floor-boards" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H1" stroke="var(--room-line)" strokeOpacity="0.12" strokeWidth="0.02" />
        </pattern>
      </defs>

      {/* room */}
      <rect x={0} y={0} width={width} height={depth} rx={0.2} fill="var(--room)" />
      <rect x={0} y={0} width={width} height={depth} rx={0.2} fill="url(#floor-boards)" />
      <rect x={0} y={0} width={width} height={depth} rx={0.2} fill="none" stroke="var(--room-line)" strokeWidth={0.12} />

      {/* scale */}
      <g aria-hidden transform={`translate(${width - 5.2} ${depth + 0.2})`}>
        <path d="M0 0H2M0 -0.12V0.12M2 -0.12V0.12" stroke={MUTED} strokeWidth={0.04} fill="none" />
        <text x={2.2} y={0.12} fontSize={0.3} fill={MUTED}>
          2 m
        </text>
      </g>

      {fixtures.map((f) => (
        <FixtureShape key={f.id} f={f} />
      ))}

      {tables.map((t) => (
        <TableShape
          key={t.id}
          t={t}
          seats={seatMap[t.id]}
          selected={selectedTable === t.id}
          broken={brokenTables.has(t.id)}
          heldGuest={heldGuest}
          placing={placing}
          brokenGuests={brokenGuests}
          over={activeOver?.table === t.id ? activeOver : null}
          setOver={setOver}
          onTableClick={props.onTableClick}
          onSeatClick={props.onSeatClick}
          onDropGuest={props.onDropGuest}
        />
      ))}
    </svg>
  )
}

function FixtureShape({ f }: { f: Fixture }) {
  const cx = f.x + f.w / 2
  const cy = f.y + f.h / 2
  if (f.kind === "door") {
    return (
      <g aria-label={f.label} role="img">
        <rect x={f.x - 0.02} y={f.y} width={f.w + 0.04} height={f.h} fill="var(--card)" stroke="var(--room-line)" strokeWidth={0.05} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M${f.x - 0.02} ${f.y + (i + 0.5) * (f.h / 5)}H${f.x + f.w + 0.02}`}
            stroke="var(--ok)"
            strokeWidth={0.06}
          />
        ))}
        <text
          x={f.x + f.w + 0.42}
          y={cy}
          fontSize={0.34}
          fill={MUTED}
          textAnchor="middle"
          transform={`rotate(-90 ${f.x + f.w + 0.42} ${cy})`}
        >
          {f.label}
        </text>
      </g>
    )
  }
  if (f.kind === "stage") {
    return (
      <g role="img" aria-label={f.label}>
        <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.15} fill="var(--primary)" />
        <rect x={f.x + 0.15} y={f.y + 0.15} width={f.w - 0.3} height={f.h - 0.3} rx={0.1} fill="none" stroke="var(--primary-foreground)" strokeOpacity={0.35} strokeWidth={0.04} />
        <text x={cx} y={cy + 0.17} fontSize={0.5} textAnchor="middle" fill="var(--primary-foreground)" fontFamily="var(--font-serif)">
          {f.label}
        </text>
      </g>
    )
  }
  if (f.kind === "dancefloor") {
    return (
      <g role="img" aria-label={f.label}>
        <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.1} fill="url(#dance-checker)" stroke="var(--gold)" strokeWidth={0.06} />
        <text x={cx} y={cy + 0.17} fontSize={0.5} textAnchor="middle" fill="oklch(0.4 0.06 80)" fontFamily="var(--font-serif)" fontStyle="italic">
          {f.label}
        </text>
      </g>
    )
  }
  return (
    <g role="img" aria-label={f.label}>
      <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={0.2} fill="var(--accent)" stroke="var(--gold)" strokeWidth={0.06} />
      <text x={cx} y={cy + 0.17} fontSize={0.5} textAnchor="middle" fill="var(--accent-foreground)" fontFamily="var(--font-serif)">
        {f.label}
      </text>
    </g>
  )
}

interface TableShapeProps {
  t: TableDef
  seats: (Guest | null)[]
  selected: boolean
  broken: boolean
  heldGuest: string | null
  placing: boolean
  brokenGuests: Set<string>
  over: Over | null
  setOver: (o: Over | null) => void
  onTableClick: (tableId: string) => void
  onSeatClick: (tableId: string, seat: number) => void
  onDropGuest: (guestId: string, tableId: string, seat?: number) => void
}

function TableShape(p: TableShapeProps) {
  const { t, seats, selected, broken, heldGuest, placing, brokenGuests, over } = p
  const filled = seats.filter(Boolean).length
  const full = filled === t.seats
  const positions = seatPositions(t)
  const r = tableRadius(t)
  const status = [
    `${filled} of ${t.seats} seats filled`,
    broken ? "breaks a rule" : null,
    selected ? "selected" : null,
  ]
    .filter(Boolean)
    .join(", ")

  const dropHandlers = (seat?: number) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = "move"
      if (over?.table !== t.id || over.seat !== seat) p.setOver({ table: t.id, seat })
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      p.setOver(null)
      const id = e.dataTransfer.getData("text/plain")
      if (id) p.onDropGuest(id, t.id, seat)
    },
  })

  const bodyOver = over !== null && over.seat === undefined
  const outline = broken ? "var(--warn)" : selected ? "var(--primary)" : "var(--room-line)"
  const cx = t.x
  const cy = t.y

  return (
    <g
      onDragOver={dropHandlers().onDragOver}
      onDrop={dropHandlers().onDrop}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) p.setOver(null)
      }}
    >
      {/* halo for selection and drop target */}
      {(selected || bodyOver) &&
        (t.shape === "round" ? (
          <circle cx={cx} cy={cy} r={r + SEAT_R * 2 + 0.55} fill={bodyOver ? "var(--primary)" : "var(--gold)"} fillOpacity={bodyOver ? 0.16 : 0.18} />
        ) : (
          <rect
            x={cx - LONG_W / 2 - 0.4}
            y={cy - LONG_H / 2 - 0.4}
            width={LONG_W + 0.8}
            height={LONG_H + SEAT_R * 2 + 1}
            rx={0.5}
            fill={bodyOver ? "var(--primary)" : "var(--gold)"}
            fillOpacity={bodyOver ? 0.16 : 0.18}
          />
        ))}

      {/* table body */}
      <g
        role="button"
        tabIndex={0}
        aria-label={`${t.name}, ${status}`}
        aria-pressed={selected}
        onClick={() => p.onTableClick(t.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            p.onTableClick(t.id)
          }
        }}
        className="outline-none [&:focus-visible_.table-body]:stroke-[var(--ring)] [&:focus-visible_.table-body]:[stroke-width:0.18px]"
      >
        {t.shape === "round" ? (
          <circle
            className="table-body"
            cx={cx}
            cy={cy}
            r={r}
            fill="var(--card)"
            stroke={outline}
            strokeWidth={broken || selected ? 0.14 : 0.07}
          />
        ) : (
          <rect
            className="table-body"
            x={cx - LONG_W / 2}
            y={cy - LONG_H / 2}
            width={LONG_W}
            height={LONG_H}
            rx={0.2}
            fill="var(--card)"
            stroke={outline}
            strokeWidth={broken || selected ? 0.14 : 0.07}
          />
        )}
      </g>
      <g aria-hidden pointerEvents="none">
        {t.shape === "round" ? (
          <>
            <text x={cx} y={cy - 0.02} fontSize={0.34} fontWeight={600} textAnchor="middle" fill={TEXT}>
              {t.name}
            </text>
            <text x={cx} y={cy + 0.36} fontSize={0.3} textAnchor="middle" fill={full ? "var(--ok)" : MUTED} fontWeight={full ? 600 : 400}>
              {filled}/{t.seats}
            </text>
          </>
        ) : (
          <text x={cx} y={cy + 0.12} fontSize={0.34} fontWeight={600} textAnchor="middle" fill={TEXT}>
            {t.name} · {filled}/{t.seats}
          </text>
        )}
      </g>

      {/* seats */}
      {positions.map((pos, i) => {
        const g = seats[i]
        const isHeld = g !== null && g.id === heldGuest
        const isBroken = g !== null && brokenGuests.has(g.id)
        const seatOver = over?.seat === i
        const label = g
          ? `${t.name}, seat ${i + 1}: ${g.name}${g.diet ? `, ${g.diet}` : ""}${isBroken ? ", breaks a rule" : ""}`
          : `${t.name}, seat ${i + 1}: empty`
        return (
          <React.Fragment key={i}>
          <g
            role="button"
            tabIndex={-1}
            aria-label={label}
            aria-pressed={isHeld}
            onClick={() => p.onSeatClick(t.id, i)}
            {...dropHandlers(i)}
          >
            <title>{g ? `${g.name}${g.diet ? ` · ${g.diet}` : ""}` : `Seat ${i + 1} · empty`}</title>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={SEAT_R}
              fill={g ? partyColor(g.party) : placing ? "var(--card)" : "var(--room)"}
              stroke={
                seatOver
                  ? "var(--primary)"
                  : isHeld
                    ? "var(--gold)"
                    : isBroken
                      ? "var(--warn)"
                      : g
                        ? partyColor(g.party, 0.6, 0.1)
                        : placing
                          ? "var(--primary)"
                          : "var(--room-line)"
              }
              strokeWidth={seatOver || isHeld || isBroken ? 0.12 : 0.05}
              strokeDasharray={g ? undefined : "0.12 0.1"}
            />
            {g?.diet && (
              <circle cx={pos.x + SEAT_R * 0.75} cy={pos.y - SEAT_R * 0.75} r={0.1} fill="var(--primary)" stroke="var(--card)" strokeWidth={0.03} />
            )}
          </g>
          <g aria-hidden pointerEvents="none">
            {g ? (
              <text x={pos.x} y={pos.y + 0.11} fontSize={0.3} fontWeight={700} textAnchor="middle" fill="oklch(0.25 0.03 165)">
                {initials(g.name)}
              </text>
            ) : placing ? (
              <text x={pos.x} y={pos.y + 0.12} fontSize={0.4} textAnchor="middle" fill="var(--primary)">
                +
              </text>
            ) : null}
          </g>
          </React.Fragment>
        )
      })}

      {/* rule flag */}
      {broken && (
        <g aria-hidden>
          <circle cx={t.shape === "round" ? cx + r * 0.72 : cx + LONG_W / 2 - 0.1} cy={t.shape === "round" ? cy - r * 0.72 : cy - LONG_H / 2} r={0.26} fill="var(--warn)" stroke="var(--card)" strokeWidth={0.05} />
          <text x={t.shape === "round" ? cx + r * 0.72 : cx + LONG_W / 2 - 0.1} y={(t.shape === "round" ? cy - r * 0.72 : cy - LONG_H / 2) + 0.12} fontSize={0.36} fontWeight={800} textAnchor="middle" fill="white">
            !
          </text>
        </g>
      )}
    </g>
  )
}
```

```tsx components/seatwise/guest-row.tsx
"use client"

import { EllipsisIcon, GripVerticalIcon, TriangleAlertIcon, UserMinusIcon } from "lucide-react"

import { usePlan } from "@/components/seatwise/plan-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { tables, type Guest } from "@/lib/data"
import { partyColor } from "@/lib/plan"
import { cn } from "@/lib/utils"

interface GuestRowProps {
  guest: Guest
  held: boolean
  flagged?: boolean
  seatNumber?: number
  showParty?: boolean
  onHold: (id: string) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
}

export function GuestRow({ guest, held, flagged, seatNumber, showParty = true, onHold, onDragStart, onDragEnd }: GuestRowProps) {
  const { placements, seatMap, place, unseat } = usePlan()
  const current = placements[guest.id]?.table

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id)
        e.dataTransfer.effectAllowed = "move"
        onDragStart(guest.id)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-1 rounded-lg border bg-card pr-1 pl-1 transition-colors",
        held ? "border-primary bg-accent ring-2 ring-primary/30" : "hover:bg-secondary/60",
        flagged && !held && "border-destructive/50",
      )}
    >
      <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
      <button
        type="button"
        onClick={() => onHold(guest.id)}
        aria-pressed={held}
        className="flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-md py-1.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-semibold text-[oklch(0.25_0.03_165)]"
          style={{ background: partyColor(guest.party) }}
        >
          {seatNumber ?? guest.name.replace(/^Avó\s+/, "")[0]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm leading-tight font-medium">
            <span className="truncate">{guest.name}</span>
            {flagged && <TriangleAlertIcon className="size-3.5 shrink-0 text-destructive" aria-label="Breaks a rule" />}
          </span>
          {showParty && <span className="block truncate text-xs text-muted-foreground">{guest.party}</span>}
        </span>
        {guest.diet && (
          <Badge variant="outline" className="shrink-0 bg-background">
            {guest.diet}
          </Badge>
        )}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Seat or move ${guest.name}`}>
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{current ? "Move to" : "Seat at"}</DropdownMenuLabel>
          {tables.map((t) => {
            const free = seatMap[t.id].filter((s) => s === null).length
            return (
              <DropdownMenuItem key={t.id} disabled={t.id === current || free === 0} onSelect={() => place(guest.id, t.id)}>
                <span className="flex-1">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.id === current ? "here" : free === 0 ? "full" : `${free} free`}</span>
              </DropdownMenuItem>
            )
          })}
          {current && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => unseat(guest.id)}>
                <UserMinusIcon />
                Unseat
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
```

```tsx components/seatwise/guests-view.tsx
"use client"

import * as React from "react"
import { toast } from "sonner"
import { CopyIcon, PrinterIcon, SearchIcon, UtensilsIcon, XIcon } from "lucide-react"

import { usePlan } from "@/components/seatwise/plan-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { event, guests, type Rsvp } from "@/lib/data"
import { DIETS, PARTIES, RSVP_LABEL, STANDARD_MEAL, mealCounts, mealOf, partyColor, tableById } from "@/lib/plan"
import { cn } from "@/lib/utils"

const RSVP_DOT: Record<Rsvp, string> = {
  yes: "bg-ok",
  maybe: "bg-gold",
  pending: "bg-muted-foreground/50",
  no: "bg-destructive",
}

const RSVP_SHORT: Record<Rsvp, string> = { yes: "Yes", maybe: "Maybe", pending: "Pending", no: "No" }

export function GuestsView() {
  const { placements, totals } = usePlan()
  const [query, setQuery] = React.useState("")
  const [party, setParty] = React.useState("all")
  const [rsvp, setRsvp] = React.useState("all")
  const [diet, setDiet] = React.useState("all")

  const meals = React.useMemo(() => mealCounts(), [])
  const confirmedTotal = meals.reduce((n, m) => n + m.confirmed, 0)
  const awaitingTotal = meals.reduce((n, m) => n + m.awaiting, 0)

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return guests
      .filter((g) => {
        if (party !== "all" && g.party !== party) return false
        if (rsvp !== "all" && g.rsvp !== rsvp) return false
        if (diet === "needs" && !g.diet) return false
        if (diet === "none" && g.diet) return false
        if (diet !== "all" && diet !== "needs" && diet !== "none" && g.diet !== diet) return false
        if (q) {
          const tableName = placements[g.id] ? tableById[placements[g.id].table].name : "no seat"
          const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${tableName}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name, "en"))
  }, [query, party, rsvp, diet, placements])

  const filtered = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all"
  const clear = () => {
    setQuery("")
    setParty("all")
    setRsvp("all")
    setDiet("all")
  }

  const copyMeals = async () => {
    const lines = [
      `${event.name} · ${event.venue}`,
      `Meal counts (attending: ${confirmedTotal}${awaitingTotal ? `, awaiting reply: ${awaitingTotal}` : ""})`,
      ...meals.map((m) => `${m.meal}: ${m.confirmed}${m.awaiting ? ` (+${m.awaiting} awaiting)` : ""}`),
    ]
    try {
      await navigator.clipboard.writeText(lines.join("\n"))
      toast.success("Meal counts copied")
    } catch {
      toast.error("Could not copy. Use Print instead.")
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-3 py-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">Guest list</h1>
          <p className="text-sm text-muted-foreground">
            {guests.length} invited · {totals.attending} attending · {totals.seated} seated · {totals.unseated} attending without a seat
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label="Guests" className="min-w-0 space-y-3 print:hidden">
          <Card className="gap-0 py-0">
            <CardContent className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_repeat(3,auto)]">
              <InputGroup className="sm:col-span-2 xl:col-span-1">
                <InputGroupInput
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, party, diet or table"
                  aria-label="Search guests"
                />
                <InputGroupAddon>
                  <SearchIcon aria-hidden />
                </InputGroupAddon>
              </InputGroup>

              <Select value={party} onValueChange={setParty}>
                <SelectTrigger className="w-full xl:w-48" aria-label="Filter by party">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All parties</SelectItem>
                  {PARTIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={rsvp} onValueChange={setRsvp}>
                <SelectTrigger className="w-full xl:w-44" aria-label="Filter by RSVP">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any RSVP</SelectItem>
                  {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {RSVP_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={diet} onValueChange={setDiet}>
                <SelectTrigger className="w-full xl:w-48" aria-label="Filter by diet">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any diet</SelectItem>
                  <SelectItem value="needs">Any dietary need</SelectItem>
                  <SelectItem value="none">{STANDARD_MEAL}</SelectItem>
                  {DIETS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex min-h-8 items-center justify-between px-1 text-sm text-muted-foreground" aria-live="polite">
            <span>
              Showing {rows.length} of {guests.length} guests
            </span>
            {filtered && (
              <Button variant="ghost" size="sm" onClick={clear}>
                <XIcon /> Clear filters
              </Button>
            )}
          </div>

          <Card className="gap-0 overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead className="hidden sm:table-cell">Diet</TableHead>
                  <TableHead className="pr-3 sm:pr-4">Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((g) => {
                  const p = placements[g.id]
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2.5">
                          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: partyColor(g.party, 0.78, 0.11) }} />
                          <div className="min-w-0">
                            <div className="font-medium">{g.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{g.party}</div>
                            {g.diet && <div className="text-xs text-muted-foreground sm:hidden">{g.diet}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{g.party}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap">
                          <span aria-hidden className={cn("size-2 rounded-full", RSVP_DOT[g.rsvp])} />
                          <span className="sm:hidden">{RSVP_SHORT[g.rsvp]}</span>
                          <span className="hidden sm:inline">{RSVP_LABEL[g.rsvp]}</span>
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {g.diet ? <Badge variant="outline">{g.diet}</Badge> : <span className="text-muted-foreground">{STANDARD_MEAL}</span>}
                      </TableCell>
                      <TableCell className="pr-3 sm:pr-4">
                        {p ? (
                          <Badge variant="secondary">{tableById[p.table].name}</Badge>
                        ) : g.rsvp === "no" ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <Badge variant="outline" className="border-gold/60 bg-accent text-accent-foreground">
                            No seat
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <Empty className="p-10">
                <EmptyHeader>
                  <EmptyTitle>No guests match</EmptyTitle>
                  <EmptyDescription>Try a different search or clear the filters.</EmptyDescription>
                </EmptyHeader>
                <Button variant="outline" size="sm" onClick={clear}>
                  Clear filters
                </Button>
              </Empty>
            )}
          </Card>
        </section>

        <aside aria-label="Meal counts for the caterer" className="print:col-span-2">
          <Card className="gap-3 py-4 lg:sticky lg:top-[4.5rem]">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <UtensilsIcon className="size-4" aria-hidden /> Meals for the caterer
              </CardTitle>
              <CardDescription>
                {event.name}, {event.venue}. Confirmed guests only; replies still open are shown separately.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-2">Meal</TableHead>
                    <TableHead className="text-right">Attending</TableHead>
                    <TableHead className="pr-2 text-right">Awaiting</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meals.map((m) => {
                    const value = m.meal === STANDARD_MEAL ? "none" : m.meal
                    const active = diet === value
                    return (
                      <TableRow key={m.meal} data-state={active ? "selected" : undefined}>
                        <TableCell className="p-0">
                          <button
                            type="button"
                            aria-pressed={active}
                            title="Show these guests in the list"
                            onClick={() => setDiet(active ? "all" : value)}
                            className="w-full rounded-md py-2 pl-2 text-left font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 print:no-underline"
                          >
                            {m.meal}
                          </button>
                        </TableCell>
                        <TableCell className="text-right text-base font-semibold tabular-nums">{m.confirmed}</TableCell>
                        <TableCell className="pr-2 text-right tabular-nums text-muted-foreground">{m.awaiting || "-"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="pl-2 font-semibold">Total meals</TableCell>
                    <TableCell className="text-right text-base font-semibold tabular-nums">{confirmedTotal}</TableCell>
                    <TableCell className="pr-2 text-right tabular-nums text-muted-foreground">{awaitingTotal}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              <p className="mt-3 px-2 text-xs text-muted-foreground">
                {guests.filter((g) => g.rsvp === "no").length} declined, not counted.
              </p>
            </CardContent>
            <div className="flex gap-2 px-4 print:hidden">
              <Button variant="outline" size="sm" className="flex-1" onClick={copyMeals}>
                <CopyIcon /> Copy
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
                <PrinterIcon /> Print
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
```

```tsx components/seatwise/plan-provider.tsx
"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  buildSeatMap,
  evaluateRules,
  initialPlacements,
  placeGuest,
  totals as computeTotals,
  unseatGuest,
  type MoveResult,
  type Placements,
  type RuleResult,
  type Totals,
} from "@/lib/plan"
import type { Guest } from "@/lib/data"

interface State {
  placements: Placements
  history: Placements[]
}

interface PlanContextValue {
  placements: Placements
  seatMap: Record<string, (Guest | null)[]>
  results: RuleResult[]
  totals: Totals
  canUndo: boolean
  place: (guestId: string, tableId: string, seat?: number) => boolean
  unseat: (guestId: string) => void
  undo: () => void
  reset: () => void
}

const PlanContext = React.createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider")
  return ctx
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(() => ({ placements: initialPlacements(), history: [] }))

  const undo = React.useCallback(() => {
    setState((s) => {
      if (!s.history.length) return s
      return { placements: s.history[s.history.length - 1], history: s.history.slice(0, -1) }
    })
  }, [])

  const commit = React.useCallback(
    (res: MoveResult) => {
      if (!res.ok) {
        if (res.message) toast.error(res.message)
        return false
      }
      setState((s) => ({ placements: res.placements, history: [...s.history.slice(-29), s.placements] }))
      toast.success(res.message, { action: { label: "Undo", onClick: undo } })
      return true
    },
    [undo],
  )

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number) => commit(placeGuest(state.placements, guestId, tableId, seat)),
    [commit, state.placements],
  )

  const unseat = React.useCallback(
    (guestId: string) => {
      commit(unseatGuest(state.placements, guestId))
    },
    [commit, state.placements],
  )

  const reset = React.useCallback(() => {
    setState((s) => ({ placements: initialPlacements(), history: [...s.history.slice(-29), s.placements] }))
    toast.success("Plan reset to the starting arrangement", { action: { label: "Undo", onClick: undo } })
  }, [undo])

  const value = React.useMemo<PlanContextValue>(
    () => ({
      placements: state.placements,
      seatMap: buildSeatMap(state.placements),
      results: evaluateRules(state.placements),
      totals: computeTotals(state.placements),
      canUndo: state.history.length > 0,
      place,
      unseat,
      undo,
      reset,
    }),
    [state, place, unseat, undo, reset],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}
```

```tsx components/seatwise/plan-sidebar.tsx
"use client"

import * as React from "react"
import { ArrowLeftIcon, CircleCheckIcon, TriangleAlertIcon, UtensilsIcon } from "lucide-react"

import { GuestRow } from "@/components/seatwise/guest-row"
import { usePlan } from "@/components/seatwise/plan-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { guests, tables } from "@/lib/data"
import { RSVP_LABEL, partyColor, tableById } from "@/lib/plan"
import { cn } from "@/lib/utils"

export type SidebarTab = "seat" | "table"

interface Props {
  tab: SidebarTab
  onTabChange: (t: SidebarTab) => void
  selectedTable: string | null
  onSelectTable: (id: string | null) => void
  heldGuest: string | null
  onHold: (id: string) => void
  dragging: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  brokenGuests: Set<string>
  brokenTables: Set<string>
}

export function PlanSidebar(p: Props) {
  const { placements, totals, unseat, seatMap, place } = usePlan()
  const [dropActive, setDropActive] = React.useState(false)

  const unseated = guests.filter((g) => g.rsvp === "yes" && !placements[g.id])
  const awaiting = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !placements[g.id])

  const rowProps = {
    onHold: p.onHold,
    onDragStart: p.onDragStart,
    onDragEnd: () => {
      setDropActive(false)
      p.onDragEnd()
    },
  }

  return (
    <Tabs value={p.tab} onValueChange={(v) => p.onTabChange(v as SidebarTab)} className="h-full min-h-0 gap-3">
      <TabsList className="grid w-full grid-cols-2 [&_[role=tab]:not([data-state=active])]:text-muted-foreground">
        <TabsTrigger value="seat">
          To seat
          <Badge variant={unseated.length ? "default" : "secondary"} className="h-5 min-w-5 px-1.5">
            {unseated.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="table">
          {p.selectedTable ? tableById[p.selectedTable].name : "Tables"}
        </TabsTrigger>
      </TabsList>

      {/* ---------- guests without a seat ---------- */}
      <TabsContent
        value="seat"
        className={cn(
          "min-h-0 rounded-xl transition-colors",
          dropActive && "bg-primary/5 ring-2 ring-primary/40 ring-dashed",
        )}
        onDragOver={(e) => {
          if (!p.dragging || !placements[p.dragging]) return
          e.preventDefault()
          setDropActive(true)
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropActive(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDropActive(false)
          const id = e.dataTransfer.getData("text/plain")
          if (id && placements[id]) unseat(id)
        }}
      >
        <ScrollArea className="h-[min(26rem,55dvh)] lg:h-[calc(100dvh-17.5rem)]">
          <div className="space-y-4 pr-3">
            <section aria-labelledby="unseated-h">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 id="unseated-h" className="text-sm font-semibold">
                  Attending, no seat
                </h2>
                <span className="text-xs text-muted-foreground">{totals.freeSeats} seats free</span>
              </div>
              {unseated.length ? (
                <ul className="space-y-1.5">
                  {unseated.map((g) => (
                    <GuestRow
                      key={g.id}
                      guest={g}
                      held={p.heldGuest === g.id}
                      flagged={p.brokenGuests.has(g.id)}
                      {...rowProps}
                    />
                  ))}
                </ul>
              ) : (
                <Empty className="border border-dashed p-6">
                  <EmptyHeader>
                    <EmptyTitle className="flex items-center gap-2 text-base">
                      <CircleCheckIcon className="size-4 text-ok" aria-hidden /> Everyone attending has a seat
                    </EmptyTitle>
                    <EmptyDescription>Drag a guest here to unseat them.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </section>

            {awaiting.length > 0 && (
              <section aria-labelledby="awaiting-h">
                <Separator className="mb-3" />
                <h2 id="awaiting-h" className="text-sm font-semibold">
                  Not confirmed yet
                </h2>
                <p className="mb-2 text-xs text-muted-foreground">You can hold seats for them, but they have not said yes.</p>
                <ul className="space-y-1.5">
                  {awaiting.map((g) => (
                    <GuestRow
                      key={g.id}
                      guest={g}
                      held={p.heldGuest === g.id}
                      flagged={p.brokenGuests.has(g.id)}
                      {...rowProps}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* ---------- tables ---------- */}
      <TabsContent value="table" className="min-h-0">
        <ScrollArea className="h-[min(30rem,60dvh)] lg:h-[calc(100dvh-17.5rem)]">
          <div className="pr-3">
            {p.selectedTable ? (
              <TableDetail {...p} tableId={p.selectedTable} rowProps={rowProps} />
            ) : (
              <ul className="space-y-1.5">
                {tables.map((t) => {
                  const filled = seatMap[t.id].filter(Boolean).length
                  const broken = p.brokenTables.has(t.id)
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (p.heldGuest) {
                            place(p.heldGuest, t.id)
                            p.onHold(p.heldGuest)
                          }
                          p.onSelectTable(t.id)
                        }}
                        className={cn(
                          "flex min-h-14 w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left outline-none transition-colors hover:bg-secondary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          broken && "border-destructive/50",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-medium">
                            {t.name}
                            {broken && <TriangleAlertIcon className="size-3.5 text-destructive" aria-label="Breaks a rule" />}
                          </span>
                          <Progress value={(filled / t.seats) * 100} className="mt-1.5 h-1.5" aria-label={`${t.name} filled`} />
                        </span>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {filled}/{t.seats}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}

function TableDetail(
  p: Props & {
    tableId: string
    rowProps: { onHold: (id: string) => void; onDragStart: (id: string) => void; onDragEnd: () => void }
  },
) {
  const { seatMap, results, place } = usePlan()
  const t = tableById[p.tableId]
  const seats = seatMap[t.id]
  const filled = seats.filter(Boolean).length
  const issues = results.filter((r) => r.status === "broken" && r.tables.includes(t.id))

  const diets = new Map<string, number>()
  for (const g of seats) if (g?.diet) diets.set(g.diet, (diets.get(g.diet) ?? 0) + 1)

  return (
    <div className="space-y-4">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-1" onClick={() => p.onSelectTable(null)}>
          <ArrowLeftIcon /> All tables
        </Button>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl">{t.name}</h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {filled} of {t.seats} seats · {t.seats - filled} free
          </span>
        </div>
        <Progress value={(filled / t.seats) * 100} className="mt-2 h-1.5" aria-label={`${t.name} filled`} />
      </div>

      {issues.map((r) => (
        <Alert key={r.index} variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Rule broken</AlertTitle>
          <AlertDescription>
            {r.message}
            <span className="mt-1 block text-xs opacity-80">{r.rule.note}</span>
          </AlertDescription>
        </Alert>
      ))}

      <section aria-labelledby="seated-h">
        <h3 id="seated-h" className="mb-2 text-sm font-semibold">
          Seats
        </h3>
        <ol className="space-y-1.5">
          {seats.map((g, i) =>
            g ? (
              <GuestRow
                key={g.id}
                guest={g}
                seatNumber={i + 1}
                held={p.heldGuest === g.id}
                flagged={p.brokenGuests.has(g.id)}
                {...p.rowProps}
              />
            ) : (
              <li key={`empty-${i}`}>
                <button
                  type="button"
                  disabled={!p.heldGuest}
                  onClick={() => {
                    if (p.heldGuest && place(p.heldGuest, t.id, i)) p.onHold(p.heldGuest)
                  }}
                  className="flex min-h-12 w-full items-center gap-2.5 rounded-lg border border-dashed px-3 text-left text-sm text-muted-foreground outline-none enabled:hover:border-primary enabled:hover:bg-primary/5 enabled:hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default"
                >
                  <span aria-hidden className="grid size-7 place-items-center rounded-full border border-dashed text-[0.65rem]">
                    {i + 1}
                  </span>
                  Empty seat{p.heldGuest ? ": place held guest here" : ""}
                </button>
              </li>
            ),
          )}
        </ol>
      </section>

      <section aria-labelledby="diet-h">
        <h3 id="diet-h" className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <UtensilsIcon className="size-3.5" aria-hidden /> Dietary needs
        </h3>
        {diets.size ? (
          <ul className="space-y-1.5">
            {seats
              .filter((g) => g?.diet)
              .map((g) => (
                <li key={g!.id} className="flex items-center justify-between gap-2 rounded-md bg-secondary/60 px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: partyColor(g!.party, 0.7, 0.12) }} />
                    <span className="truncate">{g!.name}</span>
                  </span>
                  <Badge variant="outline" className="bg-background">
                    {g!.diet}
                  </Badge>
                </li>
              ))}
          </ul>
        ) : (
          <p className="rounded-md bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
            No dietary needs at this table. {filled ? "All standard menu." : ""}
          </p>
        )}
        {filled > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {Array.from(
              seats
                .filter((g) => g)
                .reduce((m, g) => m.set(RSVP_LABEL[g!.rsvp], (m.get(RSVP_LABEL[g!.rsvp]) ?? 0) + 1), new Map<string, number>()),
            )
              .map(([k, v]) => `${v} ${k.toLowerCase()}`)
              .join(" · ")}
          </p>
        )}
      </section>
    </div>
  )
}
```

```tsx components/seatwise/plan-view.tsx
"use client"

import * as React from "react"
import { HandIcon, RotateCcwIcon, Undo2Icon, XIcon } from "lucide-react"

import { FloorPlan } from "@/components/seatwise/floor-plan"
import { PlanSidebar, type SidebarTab } from "@/components/seatwise/plan-sidebar"
import { usePlan } from "@/components/seatwise/plan-provider"
import { RulesPanel } from "@/components/seatwise/rules-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { event } from "@/lib/data"
import { PARTIES, guestById, partyColor } from "@/lib/plan"
import { cn } from "@/lib/utils"

export function PlanView() {
  const { placements, seatMap, results, totals, place, canUndo, undo, reset } = usePlan()
  const [selected, setSelected] = React.useState<string | null>(null)
  const [held, setHeld] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [tab, setTab] = React.useState<SidebarTab>("seat")

  React.useEffect(() => {
    const clear = () => setDragging(null)
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeld(null)
    }
    window.addEventListener("dragend", clear)
    window.addEventListener("drop", clear)
    window.addEventListener("keydown", esc)
    return () => {
      window.removeEventListener("dragend", clear)
      window.removeEventListener("drop", clear)
      window.removeEventListener("keydown", esc)
    }
  }, [])

  const { brokenTables, brokenGuests } = React.useMemo(() => {
    const bt = new Set<string>()
    const bg = new Set<string>()
    for (const r of results) {
      if (r.status !== "broken") continue
      r.tables.forEach((t) => bt.add(t))
      r.guests.forEach((g) => bg.add(g))
    }
    return { brokenTables: bt, brokenGuests: bg }
  }, [results])

  const select = (id: string | null) => {
    setSelected(id)
    if (id) setTab("table")
  }

  const toggleHold = (id: string) => setHeld((h) => (h === id ? null : id))

  const handleTable = (tableId: string) => {
    if (held) {
      if (placements[held]?.table === tableId) {
        setHeld(null)
        select(tableId)
        return
      }
      if (place(held, tableId)) {
        setHeld(null)
        setSelected(tableId)
      }
      return
    }
    select(tableId)
  }

  const handleSeat = (tableId: string, seat: number) => {
    const occupant = seatMap[tableId][seat]
    if (held) {
      if (occupant?.id === held) {
        setHeld(null)
        return
      }
      if (place(held, tableId, seat)) {
        setHeld(null)
        setSelected(tableId)
      }
      return
    }
    if (occupant) setHeld(occupant.id)
    select(tableId)
  }

  const handleDrop = (guestId: string, tableId: string, seat?: number) => {
    setDragging(null)
    setHeld(null)
    if (place(guestId, tableId, seat)) setSelected(tableId)
  }

  const heldGuest = held ? guestById[held] : null
  const stats = [
    { label: "Seated", value: totals.seated, hint: `of ${totals.seats} seats` },
    { label: "Unseated", value: totals.unseated, hint: totals.awaiting ? `attending, +${totals.awaiting} unconfirmed` : "attending", warn: totals.unseated > 0 },
    { label: "Free seats", value: totals.freeSeats, hint: `${totals.attending} attending` },
    {
      label: "Rules broken",
      value: results.filter((r) => r.status === "broken").length,
      hint: `of ${results.length} rules`,
      alert: results.some((r) => r.status === "broken"),
    },
  ]

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-3 py-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">Seating plan</h1>
          <p className="text-sm text-muted-foreground">
            {event.name} · {event.venue}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4" aria-label="Seating counts">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-xl border bg-card px-4 py-3",
              s.alert && "border-destructive/40 bg-destructive/5",
            )}
          >
            <dt className="text-xs font-medium text-muted-foreground">{s.label}</dt>
            <dd className="flex items-baseline gap-2">
              <span className={cn("font-serif text-3xl leading-none tabular-nums", s.alert && "text-destructive")}>{s.value}</span>
              <span className="truncate text-xs text-muted-foreground">{s.hint}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="gap-0 overflow-hidden py-0 lg:col-start-1">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <CardTitle className="text-sm font-semibold">
              Room plan <span className="font-normal text-muted-foreground">· {event.room_m.width} × {event.room_m.depth} m</span>
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
                <Undo2Icon /> Undo
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcwIcon /> Reset
              </Button>
            </div>
          </CardHeader>

          <div
            role="status"
            className={cn(
              "flex min-h-11 items-center gap-2 border-b px-4 py-2 text-sm",
              heldGuest ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            {heldGuest ? (
              <>
                <HandIcon className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">
                  Placing <strong className="font-semibold">{heldGuest.name}</strong>. Tap a table or an empty seat.
                </span>
                <Button size="xs" variant="outline" onClick={() => setHeld(null)}>
                  <XIcon /> Cancel
                </Button>
              </>
            ) : (
              <span>Drag a guest onto a table, or tap a guest and then a table. Tap a table to see who sits there.</span>
            )}
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[700px] p-3 sm:p-4">
                <FloorPlan
                  seatMap={seatMap}
                  selectedTable={selected}
                  heldGuest={held}
                  dragging={dragging}
                  brokenTables={brokenTables}
                  brokenGuests={brokenGuests}
                  onTableClick={handleTable}
                  onSeatClick={handleSeat}
                  onDropGuest={handleDrop}
                />
              </div>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t px-4 py-3 text-xs text-muted-foreground" aria-label="Guest groups">
              {PARTIES.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span aria-hidden className="size-3 rounded-full border" style={{ background: partyColor(p), borderColor: partyColor(p, 0.6, 0.1) }} />
                  {p}
                </li>
              ))}
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="size-3 rounded-full border border-dashed border-muted-foreground" />
                Empty seat
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-full bg-primary" />
                Dietary need
              </li>
            </ul>
          </CardContent>
        </Card>

        <aside aria-label="Guests and tables" className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Card className="gap-0 py-0 lg:sticky lg:top-[4.5rem]">
            <CardContent className="p-3">
              <PlanSidebar
                tab={tab}
                onTabChange={setTab}
                selectedTable={selected}
                onSelectTable={select}
                heldGuest={held}
                onHold={toggleHold}
                dragging={dragging}
                onDragStart={setDragging}
                onDragEnd={() => setDragging(null)}
                brokenGuests={brokenGuests}
                brokenTables={brokenTables}
              />
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-start-1">
          <RulesPanel onFocusTable={select} />
        </div>
      </div>
    </div>
  )
}
```

```tsx components/seatwise/rules-panel.tsx
"use client"

import { CircleCheckIcon, ClockIcon, TriangleAlertIcon } from "lucide-react"

import { usePlan } from "@/components/seatwise/plan-provider"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { guestById, ruleKindLabel, type RuleResult } from "@/lib/plan"
import { cn } from "@/lib/utils"

const STATUS = {
  ok: { icon: CircleCheckIcon, label: "Kept", className: "text-ok" },
  broken: { icon: TriangleAlertIcon, label: "Broken", className: "text-destructive" },
  open: { icon: ClockIcon, label: "Waiting", className: "text-muted-foreground" },
} as const

export function RulesPanel({ onFocusTable }: { onFocusTable: (tableId: string) => void }) {
  const { results, placements } = usePlan()
  const broken = results.filter((r) => r.status === "broken")
  const kept = results.filter((r) => r.status === "ok").length
  const open = results.filter((r) => r.status === "open").length

  const focus = (r: RuleResult) => {
    const target = r.tables[0] ?? r.rule.guests.map((id) => placements[id]?.table).find(Boolean)
    if (target) onFocusTable(target)
  }

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="font-serif text-lg">The couple&apos;s rules</CardTitle>
        <CardDescription aria-live="polite">
          {broken.length ? (
            <span className="font-medium text-destructive">
              {broken.length} of {results.length} broken
            </span>
          ) : (
            <span className="font-medium text-ok">No rule broken</span>
          )}
          {` · ${kept} kept · ${open} waiting on a seat`}
        </CardDescription>
        <CardAction>
          <Badge variant={broken.length ? "destructive" : "secondary"}>
            {broken.length ? `${broken.length} to fix` : "All clear"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <ul className="grid gap-2 md:grid-cols-2">
          {results.map((r) => {
            const s = STATUS[r.status]
            const Icon = s.icon
            const canFocus = r.tables.length > 0 || r.rule.guests.some((id) => placements[id])
            return (
              <li key={r.index}>
                <button
                  type="button"
                  disabled={!canFocus}
                  onClick={() => focus(r)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 enabled:hover:bg-secondary/60 disabled:cursor-default",
                    r.status === "broken" && "border-destructive/50 bg-destructive/5",
                  )}
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", s.className)} aria-hidden />
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="flex flex-wrap items-center gap-x-2">
                      <span className="font-medium">{ruleKindLabel(r.rule.kind)}</span>
                      <span className={cn("text-xs font-medium", s.className)}>{s.label}</span>
                    </span>
                    <span className="block text-muted-foreground">{r.rule.guests.map((id) => guestById[id]?.name).join(" & ")}</span>
                    <span className="mt-1 block">{r.message}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{r.rule.note}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
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
  shape: "long" | "round"
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

export type Rule =
  | { kind: "together"; guests: string[]; note: string }
  | { kind: "apart"; guests: string[]; note: string }
  | {
      kind: "near"
      guests: string[]
      note: string
      /** Fixture kind the guest should be close to, and the limit in metres. */
      target: Fixture["kind"]
      within: number
      /** Fixture kind the guest should be away from, and the minimum distance in metres. */
      avoid: Fixture["kind"]
      awayBy: number
    }

export const app = "Seatwise"

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
}

export const planner = { name: "Hannah Brook" }

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
]

export const tables: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
]

export const guests: Guest[] = [
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

export const rules: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  {
    kind: "apart",
    guests: ["g-12", "g-34"],
    note: "Ask the couple: old family dispute",
  },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    target: "door",
    within: 4,
    avoid: "stage",
    awayBy: 6,
  },
]
```

```ts lib/plan.ts
import {
  fixtures,
  guests,
  rules,
  tables,
  type Fixture,
  type Guest,
  type Rsvp,
  type Rule,
  type TableDef,
} from "@/lib/data"

/** guest id -> where they sit. Guests without an entry have no seat. */
export type Placements = Record<string, { table: string; seat: number }>

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]))
export const tableById: Record<string, TableDef> = Object.fromEntries(tables.map((t) => [t.id, t]))

/* ---------- seating state ---------- */

const HEAD_SEAT_ORDER = [3, 4, 2, 5, 1, 6, 0, 7]

export function initialPlacements(): Placements {
  const out: Placements = {}
  const used: Record<string, number> = {}
  for (const g of guests) {
    if (!g.table) continue
    const t = tableById[g.table]
    const n = used[t.id] ?? 0
    used[t.id] = n + 1
    out[g.id] = { table: t.id, seat: t.shape === "long" ? (HEAD_SEAT_ORDER[n] ?? n) : n }
  }
  return out
}

/** Seat-by-seat view of every table. */
export function buildSeatMap(placements: Placements): Record<string, (Guest | null)[]> {
  const map: Record<string, (Guest | null)[]> = {}
  for (const t of tables) map[t.id] = Array.from({ length: t.seats }, () => null)
  for (const [gid, p] of Object.entries(placements)) {
    const g = guestById[gid]
    if (g && map[p.table]) map[p.table][p.seat] = g
  }
  return map
}

export function canBeSeated(g: Guest): boolean {
  return g.rsvp !== "no"
}

export interface Totals {
  attending: number
  seated: number
  unseated: number
  awaiting: number
  declined: number
  seats: number
  freeSeats: number
}

export function totals(placements: Placements): Totals {
  const seated = Object.keys(placements).length
  const attending = guests.filter((g) => g.rsvp === "yes").length
  const seats = tables.reduce((n, t) => n + t.seats, 0)
  const seatedAttending = guests.filter((g) => g.rsvp === "yes" && placements[g.id]).length
  return {
    attending,
    seated,
    unseated: attending - seatedAttending,
    awaiting: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !placements[g.id]).length,
    declined: guests.filter((g) => g.rsvp === "no").length,
    seats,
    freeSeats: seats - seated,
  }
}

/* ---------- labels ---------- */

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
}

export const STANDARD_MEAL = "Standard menu"

export function mealOf(g: Guest): string {
  return g.diet ?? STANDARD_MEAL
}

export const PARTIES = Array.from(new Set(guests.map((g) => g.party)))
export const DIETS = Array.from(new Set(guests.map((g) => g.diet).filter((d): d is string => !!d))).sort()

const PARTY_HUE: Record<string, number> = {
  Couple: 85,
  "Bride's family": 15,
  "Groom's family": 250,
  "University friends": 155,
  "Work friends": 305,
  "Groom's football club": 55,
  "Plus-ones": 200,
}

export function partyColor(party: string, lightness = 0.86, chroma = 0.09): string {
  return `oklch(${lightness} ${chroma} ${PARTY_HUE[party] ?? 0})`
}

export function initials(name: string): string {
  const parts = name.replace(/^Avó\s+/, "").split(" ").filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

export function formatEventDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

/* ---------- geometry (metres) ---------- */

export interface Point {
  x: number
  y: number
}

const TABLE_R = (t: TableDef) => (t.seats <= 6 ? 0.8 : 0.95)
export const SEAT_R = 0.36
export const LONG_W = 6.4
export const LONG_H = 0.9
export const SEAT_PITCH = 0.78

export function tableRadius(t: TableDef): number {
  return TABLE_R(t)
}

/** Centre of every seat around a table, in room metres. */
export function seatPositions(t: TableDef): Point[] {
  if (t.shape === "long") {
    const first = t.x - ((t.seats - 1) * SEAT_PITCH) / 2
    return Array.from({ length: t.seats }, (_, i) => ({
      x: first + i * SEAT_PITCH,
      y: t.y + LONG_H / 2 + SEAT_R + 0.12,
    }))
  }
  const r = TABLE_R(t) + SEAT_R + 0.14
  return Array.from({ length: t.seats }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats
    return { x: t.x + r * Math.cos(a), y: t.y + r * Math.sin(a) }
  })
}

function centre(f: Fixture): Point {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 }
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function fixtureOfKind(kind: Fixture["kind"]): Fixture | undefined {
  return fixtures.find((f) => f.kind === kind)
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open"

export interface RuleResult {
  index: number
  rule: Rule
  status: RuleStatus
  /** One-line explanation of the current state. */
  message: string
  /** Tables to flag. Only filled for broken rules. */
  tables: string[]
  /** Guests whose seats to flag. Only filled for broken rules. */
  guests: string[]
}

const KIND_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
}

export function ruleKindLabel(kind: Rule["kind"]): string {
  return KIND_LABEL[kind]
}

export function evaluateRules(placements: Placements): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const names = rule.guests.map((id) => guestById[id]?.name ?? id)
    const seatedIds = rule.guests.filter((id) => placements[id])
    const missing = rule.guests.filter((id) => !placements[id]).map((id) => guestById[id]?.name ?? id)
    const tableName = (id: string) => tableById[id]?.name ?? id

    if (rule.kind === "together") {
      if (missing.length) {
        return { index, rule, status: "open", message: `Not placed yet: ${missing.join(", ")}`, tables: [], guests: [] }
      }
      const at = Array.from(new Set(rule.guests.map((id) => placements[id].table)))
      if (at.length === 1) {
        return { index, rule, status: "ok", message: `Together at ${tableName(at[0])}`, tables: [], guests: [] }
      }
      return {
        index,
        rule,
        status: "broken",
        message: `${names.join(" and ")} are split across ${at.map(tableName).join(" and ")}`,
        tables: at,
        guests: rule.guests,
      }
    }

    if (rule.kind === "apart") {
      const at = seatedIds.map((id) => placements[id].table)
      const clash = at.length === rule.guests.length && new Set(at).size < at.length
      if (clash) {
        return {
          index,
          rule,
          status: "broken",
          message: `${names.join(" and ")} are both at ${tableName(at[0])}`,
          tables: [at[0]],
          guests: rule.guests,
        }
      }
      if (missing.length) {
        return { index, rule, status: "open", message: `Not placed yet: ${missing.join(", ")}`, tables: [], guests: [] }
      }
      return { index, rule, status: "ok", message: `Apart: ${at.map(tableName).join(" and ")}`, tables: [], guests: [] }
    }

    // near
    const gid = rule.guests[0]
    const p = placements[gid]
    if (!p) {
      return { index, rule, status: "open", message: `Not placed yet: ${names[0]}`, tables: [], guests: [] }
    }
    const t = tableById[p.table]
    const target = fixtureOfKind(rule.target)
    const avoid = fixtureOfKind(rule.avoid)
    const dTarget = target ? distance(t, centre(target)) : 0
    const dAvoid = avoid ? distance(t, centre(avoid)) : Infinity
    const targetLabel = target?.label.toLowerCase() ?? "the target"
    const avoidLabel = avoid?.label.toLowerCase() ?? "the band"
    if (dTarget > rule.within) {
      return {
        index,
        rule,
        status: "broken",
        message: `${t.name} is ${dTarget.toFixed(1)} m from the ${targetLabel} (aim for ${rule.within} m or less)`,
        tables: [t.id],
        guests: [gid],
      }
    }
    if (dAvoid < rule.awayBy) {
      return {
        index,
        rule,
        status: "broken",
        message: `${t.name} is only ${dAvoid.toFixed(1)} m from the ${avoidLabel} (aim for ${rule.awayBy} m or more)`,
        tables: [t.id],
        guests: [gid],
      }
    }
    return {
      index,
      rule,
      status: "ok",
      message: `${t.name} is ${dTarget.toFixed(1)} m from the ${targetLabel} and ${dAvoid.toFixed(0)} m from the ${avoidLabel}`,
      tables: [],
      guests: [],
    }
  })
}

/* ---------- moving guests ---------- */

export interface MoveResult {
  ok: boolean
  placements: Placements
  message: string
}

/** Seat a guest at a table (first free seat, or a given seat; swaps if the seat holds someone and the guest is seated). */
export function placeGuest(placements: Placements, guestId: string, tableId: string, seat?: number): MoveResult {
  const g = guestById[guestId]
  const t = tableById[tableId]
  if (!g || !t) return { ok: false, placements, message: "Unknown guest or table" }
  if (!canBeSeated(g)) return { ok: false, placements, message: `${g.name} has declined` }

  const map = buildSeatMap(placements)
  const current = placements[guestId]

  if (seat === undefined) {
    if (current?.table === tableId) return { ok: false, placements, message: `${g.name} is already at ${t.name}` }
    const free = map[tableId].findIndex((s) => s === null)
    if (free === -1) return { ok: false, placements, message: `${t.name} is full` }
    return {
      ok: true,
      placements: { ...placements, [guestId]: { table: tableId, seat: free } },
      message: current ? `${g.name} moved to ${t.name}` : `${g.name} seated at ${t.name}`,
    }
  }

  const occupant = map[tableId][seat]
  if (occupant?.id === guestId) return { ok: false, placements, message: "" }
  if (occupant) {
    if (!current) return { ok: false, placements, message: `That seat is taken by ${occupant.name}` }
    return {
      ok: true,
      placements: { ...placements, [guestId]: { table: tableId, seat }, [occupant.id]: current },
      message: `${g.name} and ${occupant.name} swapped seats`,
    }
  }
  return {
    ok: true,
    placements: { ...placements, [guestId]: { table: tableId, seat } },
    message: current ? `${g.name} moved to ${t.name}` : `${g.name} seated at ${t.name}`,
  }
}

export function unseatGuest(placements: Placements, guestId: string): MoveResult {
  const g = guestById[guestId]
  if (!g || !placements[guestId]) return { ok: false, placements, message: "" }
  const next = { ...placements }
  delete next[guestId]
  return { ok: true, placements: next, message: `${g.name} unseated` }
}

/* ---------- meals ---------- */

export interface MealRow {
  meal: string
  confirmed: number
  awaiting: number
}

export function mealCounts(): MealRow[] {
  const rows = new Map<string, MealRow>()
  const get = (meal: string) => {
    let r = rows.get(meal)
    if (!r) {
      r = { meal, confirmed: 0, awaiting: 0 }
      rows.set(meal, r)
    }
    return r
  }
  get(STANDARD_MEAL)
  for (const d of DIETS) get(d)
  for (const g of guests) {
    if (g.rsvp === "yes") get(mealOf(g)).confirmed += 1
    else if (g.rsvp !== "no") get(mealOf(g)).awaiting += 1
  }
  return Array.from(rows.values())
}
```

