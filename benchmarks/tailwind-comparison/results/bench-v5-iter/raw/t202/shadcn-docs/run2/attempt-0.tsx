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
}

@theme inline {
  --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  --color-floor: var(--floor);
  --color-warn: var(--warn);
  --color-warn-foreground: var(--warn-foreground);
  --color-diet: var(--diet);
  --color-bar: var(--bar);
  --color-bar-edge: var(--bar-edge);
  --color-bar-ink: var(--bar-ink);
  --color-door: var(--door);
  --color-door-ink: var(--door-ink);
  --color-dance: var(--dance);
  --color-dance-alt: var(--dance-alt);
  --color-gridline: var(--gridline);
}

:root {
  --radius: 0.625rem;
  --background: oklch(0.975 0.008 85);
  --foreground: oklch(0.24 0.025 165);
  --card: oklch(0.995 0.004 85);
  --card-foreground: oklch(0.24 0.025 165);
  --popover: oklch(0.995 0.004 85);
  --popover-foreground: oklch(0.24 0.025 165);
  --primary: oklch(0.36 0.07 165);
  --primary-foreground: oklch(0.98 0.01 85);
  --secondary: oklch(0.945 0.014 85);
  --secondary-foreground: oklch(0.3 0.04 165);
  --muted: oklch(0.945 0.014 85);
  --muted-foreground: oklch(0.47 0.02 120);
  --accent: oklch(0.925 0.035 160);
  --accent-foreground: oklch(0.28 0.06 165);
  --destructive: oklch(0.52 0.2 27);
  --border: oklch(0.885 0.014 85);
  --input: oklch(0.86 0.016 85);
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
  --floor: oklch(0.955 0.018 85);
  --warn: oklch(0.93 0.07 75);
  --warn-foreground: oklch(0.38 0.09 55);
  --diet: oklch(0.72 0.17 65);
  --bar: oklch(0.9 0.05 70);
  --bar-edge: oklch(0.7 0.09 60);
  --bar-ink: oklch(0.35 0.07 55);
  --door: oklch(0.78 0.1 150);
  --door-ink: oklch(0.25 0.06 150);
  --dance: oklch(0.93 0.03 85);
  --dance-alt: oklch(0.89 0.04 85);
  --gridline: oklch(0.5 0.03 85 / 0.09);
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
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  button,
  [role="button"] {
    cursor: pointer;
  }
}

@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: white;
  }
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { GuestsView } from "@/components/guests/guests-view";

export const metadata: Metadata = { title: "Guest list · Seatwise" };

export default function GuestsPage() {
  return (
    <AppShell>
      <GuestsView />
    </AppShell>
  );
}
```

```tsx app/layout.tsx
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { PlanProvider } from "@/lib/plan-store";

export const metadata: Metadata = {
  title: "Seatwise: seating plan for Ines & Mateo",
  description: "Seating planner for wedding and event planners.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <PlanProvider>{children}</PlanProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell";
import { PlanView } from "@/components/plan/plan-view";

export default function Page() {
  return (
    <AppShell>
      <PlanView />
    </AppShell>
  );
}
```

```tsx components/app-shell.tsx
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
```

```tsx components/guests/guests-view.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Printer, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { diets, event, parties, rsvpLabel, tables, type Rsvp } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { PartyDot } from "@/components/plan/guest-chip";

const tableName = new Map(tables.map((t) => [t.id, t.name]));

const rsvpStyle: Record<Rsvp, string> = {
  yes: "border-primary/30 bg-accent text-accent-foreground",
  maybe: "border-transparent bg-warn text-warn-foreground",
  pending: "text-muted-foreground",
  no: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function GuestsView() {
  const { guests } = usePlan();
  const [q, setQ] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "none" ? g.diet !== null : diet !== "all" && g.diet !== diet) return false;
      if (needle) {
        const hay = `${g.name} ${g.party} ${g.diet ?? ""} ${g.table ? tableName.get(g.table) : "unseated"}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [guests, q, party, rsvp, diet]);

  const meals = React.useMemo(() => {
    const rows = ["Standard", ...diets].map((meal) => {
      const match = (d: string | null) => (meal === "Standard" ? d === null : d === meal);
      return {
        meal,
        confirmed: guests.filter((g) => g.rsvp === "yes" && match(g.diet)).length,
        possible: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && match(g.diet)).length,
      };
    });
    return {
      rows,
      confirmed: rows.reduce((n, r) => n + r.confirmed, 0),
      possible: rows.reduce((n, r) => n + r.possible, 0),
    };
  }, [guests]);

  const filtersActive = q !== "" || party !== "all" || rsvp !== "all" || diet !== "all";
  const reset = () => {
    setQ("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Guest list</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {event.name} · {guests.length} invited
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="no-print">
          <Printer /> Print for caterer
        </Button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Guests" className="min-w-0 space-y-3">
          <div className="no-print grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(3,11rem)]">
            <div className="relative sm:col-span-2 xl:col-span-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, party, table or diet"
                aria-label="Search guests"
                className="h-10 bg-card pl-9"
              />
            </div>
            <Select value={party} onValueChange={setParty}>
              <SelectTrigger aria-label="Filter by party" className="h-10 w-full bg-card">
                <SelectValue placeholder="Party" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All parties</SelectItem>
                {parties.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rsvp} onValueChange={setRsvp}>
              <SelectTrigger aria-label="Filter by RSVP" className="h-10 w-full bg-card">
                <SelectValue placeholder="RSVP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any RSVP</SelectItem>
                {(Object.keys(rsvpLabel) as Rsvp[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {rsvpLabel[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={diet} onValueChange={setDiet}>
              <SelectTrigger aria-label="Filter by diet" className="h-10 w-full bg-card">
                <SelectValue placeholder="Diet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any diet</SelectItem>
                <SelectItem value="none">No dietary needs</SelectItem>
                {diets.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-8 items-center justify-between gap-2 text-sm text-muted-foreground">
            <p role="status" aria-live="polite">
              Showing <span className="font-medium text-foreground tabular-nums">{filtered.length}</span> of{" "}
              {guests.length} guests
            </p>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={reset} className="no-print">
                <X /> Clear filters
              </Button>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-secondary/60">
                <TableRow>
                  <TableHead className="pl-4">Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Party</TableHead>
                  <TableHead>RSVP</TableHead>
                  <TableHead className="hidden sm:table-cell">Diet</TableHead>
                  <TableHead className="pr-4">Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No guest matches these filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="py-3 pl-4">
                      <div className="font-medium">{g.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground md:hidden">
                        <PartyDot party={g.party} />
                        {g.party}
                        {g.diet && <span className="sm:hidden">· {g.diet}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-2">
                        <PartyDot party={g.party} />
                        {g.party}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={rsvpStyle[g.rsvp]}>
                        {rsvpLabel[g.rsvp]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {g.diet ? (
                        <Badge variant="secondary" className="bg-warn text-warn-foreground">
                          {g.diet}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      {g.table ? (
                        <Link
                          href="/"
                          className="rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {tableName.get(g.table)}
                          {g.seat !== null && (
                            <span className="font-normal text-muted-foreground"> · seat {g.seat + 1}</span>
                          )}
                        </Link>
                      ) : g.rsvp === "no" ? (
                        <span className="text-muted-foreground">Not needed</span>
                      ) : (
                        <Badge variant="outline" className="border-destructive/40 text-destructive">
                          Unseated
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <aside aria-label="Meal counts" className="lg:sticky lg:top-20">
          <Card className="gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="font-display text-lg">Meals for the caterer</CardTitle>
              <CardDescription>
                {meals.confirmed} confirmed
                {meals.possible > 0 ? `, plus ${meals.possible} who may still come` : ""}. Declined guests are left
                out.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-0">Meal</TableHead>
                    <TableHead className="px-2 text-right">Confirmed</TableHead>
                    <TableHead className="px-0 text-right">Maybe</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meals.rows.map((r) => (
                    <TableRow key={r.meal}>
                      <TableCell className="px-0 py-2">
                        <button
                          type="button"
                          onClick={() => setDiet(r.meal === "Standard" ? "none" : r.meal)}
                          aria-label={`Filter the list to ${r.meal}`}
                          className={cn(
                            "no-print -mx-1 rounded-sm px-1 text-left outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          )}
                        >
                          {r.meal}
                        </button>
                      </TableCell>
                      <TableCell className="px-2 py-2 text-right font-semibold tabular-nums">{r.confirmed}</TableCell>
                      <TableCell className="px-0 py-2 text-right text-muted-foreground tabular-nums">
                        {r.possible}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-semibold hover:bg-transparent">
                    <TableCell className="px-0 py-2">Total</TableCell>
                    <TableCell className="px-2 py-2 text-right tabular-nums">{meals.confirmed}</TableCell>
                    <TableCell className="px-0 py-2 text-right text-muted-foreground tabular-nums">
                      {meals.possible}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="mt-3 text-xs text-muted-foreground">
                "Maybe" counts guests who answered maybe or have not replied. Tap a meal to filter the list.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
```

```tsx components/plan/guest-chip.tsx
"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { partyColors } from "@/lib/data";
import { usePlan, type PlacedGuest } from "@/lib/plan-store";

export function PartyDot({ party, className }: { party: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: partyColors(party).dot }}
    />
  );
}

/** A guest without a seat: tap to pick up, then tap a seat or table; or drag. */
export function GuestChip({ guest, muted = false }: { guest: PlacedGuest; muted?: boolean }) {
  const { armed, arm, setDragging } = usePlan();
  const isArmed = armed === guest.id;
  const colors = partyColors(guest.party);
  return (
    <button
      type="button"
      draggable
      aria-pressed={isArmed}
      onClick={() => arm(isArmed ? null : guest.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(guest.id);
        arm(null);
      }}
      onDragEnd={() => setDragging(null)}
      className={cn(
        "group inline-flex min-h-11 max-w-full cursor-grab touch-manipulation items-center gap-2 rounded-lg border bg-card py-1.5 pr-3 pl-1.5 text-left text-sm shadow-xs outline-none transition-[box-shadow,background-color,border-color] hover:border-foreground/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing",
        isArmed && "border-primary bg-accent ring-2 ring-primary",
        muted && "border-dashed bg-transparent",
      )}
      style={{ borderLeftColor: isArmed ? undefined : colors.edge, borderLeftWidth: 4 }}
    >
      <GripVertical className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
      <span className="min-w-0">
        <span className="block truncate font-medium leading-tight">{guest.name}</span>
        <span className="block truncate text-xs leading-tight text-muted-foreground">
          {guest.party}
          {guest.diet ? ` · ${guest.diet}` : ""}
        </span>
      </span>
    </button>
  );
}
```

```tsx components/plan/plan-view.tsx
"use client";

import * as React from "react";
import { Hand, UserMinus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { event, parties } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { PartyDot } from "./guest-chip";
import { Room } from "./room";
import { RulesPanel } from "./rules-panel";
import { StatsBar } from "./stats-bar";
import { TablePanel } from "./table-panel";
import { UnseatedStrip } from "./unseated-strip";

function ArmedBanner() {
  const { armed, arm, byId, unseat } = usePlan();
  const guest = armed ? byId.get(armed) : undefined;

  React.useEffect(() => {
    if (!armed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") arm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armed, arm]);

  return (
    <div role="status" aria-live="polite">
      {guest && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border-2 border-primary bg-accent px-3.5 py-2.5 text-sm text-accent-foreground">
          <Hand className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 basis-56">
            <strong className="font-semibold">{guest.name}</strong>{" "}
            {guest.table ? "is picked up to move." : "is picked up."} Tap a seat or a table to place them.
          </span>
          <div className="flex gap-2">
            {guest.table && (
              <Button size="sm" variant="outline" onClick={() => unseat(guest.id)}>
                <UserMinus /> Unseat
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => arm(null)}>
              <X /> Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlanView() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{event.name}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground lg:hidden">
          {event.venue} · 19 June 2027
        </p>
      </div>

      <StatsBar />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="xl:col-start-2 xl:row-start-1">
          <UnseatedStrip />
        </div>
        <section aria-label="Room plan" className="min-w-0 space-y-3 xl:col-start-1 xl:row-span-3 xl:row-start-1">
          <ArmedBanner />
          <Room />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {event.room_m.width} × {event.room_m.depth} m, drawn to scale
            </span>
            {parties.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <PartyDot party={p} /> {p}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block size-2.5 rounded-full bg-diet" />
              Dietary need
            </span>
          </div>
        </section>

        <div className="xl:col-start-2 xl:row-start-2">
          <TablePanel />
        </div>
        <div className="xl:col-start-2 xl:row-start-3">
          <RulesPanel />
        </div>
      </div>
    </div>
  );
}
```

```tsx components/plan/room.tsx
"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { event, firstName, fixtures, partyColors, tables, type Fixture, type TableDef } from "@/lib/data";
import { SEAT_D, m, tableFrame } from "@/lib/geometry";
import { usePlan, type PlacedGuest } from "@/lib/plan-store";

const FONT_S = "max(8px, calc(var(--m) * 0.235))";
const FONT_M = "max(10px, calc(var(--m) * 0.36))";

function FixtureBlock({ f }: { f: Fixture }) {
  const base: React.CSSProperties = { left: m(f.x), top: m(f.y), width: m(f.w), height: m(f.h) };
  if (f.kind === "stage") {
    return (
      <div
        role="img"
        aria-label={`${f.label}, stage`}
        className="absolute grid place-items-center rounded-md bg-foreground/90 text-background shadow-sm"
        style={base}
      >
        <span className="font-display font-semibold tracking-wide" style={{ fontSize: FONT_M }}>
          {f.label}
        </span>
      </div>
    );
  }
  if (f.kind === "dancefloor") {
    return (
      <div
        role="img"
        aria-label={f.label}
        className="absolute grid place-items-center rounded-sm border border-primary/25 bg-dance"
        style={{
          ...base,
          backgroundImage:
            "conic-gradient(var(--dance-alt) 25%, transparent 0 50%, var(--dance-alt) 0 75%, transparent 0)",
          backgroundSize: `${m(1)} ${m(1)}`,
        }}
      >
        <span
          className="rounded-sm bg-card/80 px-1.5 font-display font-medium italic text-muted-foreground"
          style={{ fontSize: FONT_M }}
        >
          {f.label}
        </span>
      </div>
    );
  }
  if (f.kind === "bar") {
    return (
      <div
        role="img"
        aria-label={f.label}
        className="absolute grid place-items-center rounded-md border-2 border-bar-edge bg-bar text-bar-ink"
        style={base}
      >
        <span className="font-display font-semibold" style={{ fontSize: FONT_M }}>
          {f.label}
        </span>
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={f.label}
      className="absolute grid place-items-center rounded-r-sm bg-door text-door-ink"
      style={base}
    >
      <span
        className="font-semibold tracking-wide whitespace-nowrap"
        style={{ fontSize: FONT_S, writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {f.label}
      </span>
    </div>
  );
}

interface SeatProps {
  table: TableDef;
  index: number;
  pos: { x: number; y: number };
  guest: PlacedGuest | null;
  flagged: boolean;
  over: string | null;
  setOver: (v: string | null) => void;
}

function Seat({ table, index, pos, guest, flagged, over, setOver }: SeatProps) {
  const { armed, arm, dragging, setDragging, place, selectTable, byId } = usePlan();
  const key = `${table.id}:${index}`;
  const holding = armed ?? dragging;
  const holder = holding ? byId.get(holding) : undefined;
  const colors = guest ? partyColors(guest.party) : null;
  const isArmed = guest !== null && armed === guest.id;
  const droppable = Boolean(holding) && !(guest && guest.id === holding);
  const canTake = droppable && (guest === null || Boolean(holder?.table));

  const label = guest
    ? `${guest.name}, seat ${index + 1} at ${table.name}${guest.diet ? `, ${guest.diet}` : ""}${
        flagged ? ", involved in a broken rule" : ""
      }`
    : `Empty seat ${index + 1} at ${table.name}`;

  const onClick = () => {
    if (armed && !(guest && guest.id === armed)) {
      place(armed, table.id, index);
      return;
    }
    selectTable(table.id);
    if (guest) arm(isArmed ? null : guest.id);
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={guest ? isArmed : undefined}
      draggable={guest !== null}
      onClick={onClick}
      onDragStart={(e) => {
        if (!guest) return;
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(guest.id);
        arm(null);
        selectTable(table.id);
      }}
      onDragEnd={() => {
        setDragging(null);
        setOver(null);
      }}
      onDragOver={(e) => {
        if (!dragging) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        if (over !== key) setOver(key);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = dragging ?? e.dataTransfer.getData("text/plain");
        setOver(null);
        if (id) place(id, table.id, index);
      }}
      className={cn(
        "absolute grid -translate-x-1/2 -translate-y-1/2 touch-manipulation place-items-center rounded-full border text-center leading-none outline-none transition-[box-shadow,transform,background-color] focus-visible:ring-[3px] focus-visible:ring-ring",
        guest
          ? "cursor-grab font-medium shadow-sm active:cursor-grabbing"
          : "border-dashed border-foreground/30 bg-card/70 text-muted-foreground",
        isArmed && "ring-[3px] ring-primary",
        flagged && "ring-2 ring-destructive",
        canTake && "hover:scale-110 hover:ring-[3px] hover:ring-primary/60",
        droppable && !guest && "border-primary/60 bg-accent/60",
        over === key && canTake && "scale-110 ring-[3px] ring-primary",
      )}
      style={{
        left: m(pos.x),
        top: m(pos.y),
        width: m(SEAT_D),
        height: m(SEAT_D),
        fontSize: FONT_S,
        ...(colors ? { backgroundColor: colors.tint, borderColor: colors.edge, color: colors.ink } : {}),
      }}
    >
      {guest ? (
        <>
          <span className="max-w-full truncate px-[3%]">{firstName(guest.name)}</span>
          {guest.diet && (
            <span
              aria-hidden
              className="absolute -top-px -right-px size-[28%] rounded-full border border-card bg-diet"
            />
          )}
        </>
      ) : (
        <span aria-hidden className="opacity-70">
          {index + 1}
        </span>
      )}
    </button>
  );
}

function TableBlock({ table, over, setOver }: { table: TableDef; over: string | null; setOver: (v: string | null) => void }) {
  const { occupancy, selectedTable, selectTable, armed, dragging, place, brokenTables, ruleResults } = usePlan();
  const frame = React.useMemo(() => tableFrame(table), [table]);
  const occ = occupancy[table.id] ?? [];
  const filled = occ.filter(Boolean).length;
  const selected = selectedTable === table.id;
  const broken = brokenTables.has(table.id);
  const full = filled >= table.seats;
  const holding = armed ?? dragging;

  const flaggedGuests = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of ruleResults) {
      if (r.status !== "broken" || !r.tables.includes(table.id)) continue;
      r.rule.guests.forEach((id) => s.add(id));
    }
    return s;
  }, [ruleResults, table.id]);

  const s = frame.surface;

  return (
    <div
      className="absolute"
      style={{ left: m(frame.left), top: m(frame.top), width: m(frame.width), height: m(frame.height) }}
      onDragOver={(e) => {
        if (!dragging) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (over !== table.id) setOver(table.id);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && over?.startsWith(table.id)) setOver(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const id = dragging ?? e.dataTransfer.getData("text/plain");
        setOver(null);
        if (id) place(id, table.id);
      }}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => {
          if (armed) place(armed, table.id);
          else selectTable(selected ? null : table.id);
        }}
        className={cn(
          "absolute flex touch-manipulation flex-col items-center justify-center border-2 text-center leading-tight shadow-sm outline-none transition-[box-shadow,background-color,border-color] focus-visible:ring-[3px] focus-visible:ring-ring",
          s.round ? "rounded-full" : "rounded-md flex-row gap-[0.6em]",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-foreground/25 bg-card text-foreground hover:border-foreground/50",
          broken && !selected && "border-destructive",
          holding && !full && "ring-[3px] ring-primary/40",
          (over === table.id) && "ring-[3px] ring-primary",
        )}
        style={{ left: m(s.x), top: m(s.y), width: m(s.w), height: m(s.h), fontSize: FONT_M }}
      >
        <span className="font-display font-semibold">{table.name}</span>
        <span
          className={cn("tabular-nums", selected ? "text-primary-foreground/85" : "text-muted-foreground")}
          style={{ fontSize: FONT_S }}
        >
          {filled}/{table.seats}
        </span>
        <span className="sr-only"> seats filled{broken ? ", a couple's rule is broken here" : ""}</span>
      </button>

      {broken && (
        <span
          role="img"
          aria-label="Broken rule on this table"
          className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-destructive text-white shadow"
          style={{
            left: m(s.round ? s.x + s.w * 0.86 : s.x + s.w - 0.2),
            top: m(s.round ? s.y + s.h * 0.14 : s.y),
            width: m(0.62),
            height: m(0.62),
          }}
        >
          <AlertTriangle className="size-[62%]" aria-hidden />
        </span>
      )}

      {frame.seats.map((pos, i) => (
        <Seat
          key={i}
          table={table}
          index={i}
          pos={pos}
          guest={occ[i] ?? null}
          flagged={Boolean(occ[i] && flaggedGuests.has(occ[i]!.id))}
          over={over}
          setOver={setOver}
        />
      ))}
    </div>
  );
}

export function Room() {
  const [over, setOver] = React.useState<string | null>(null);
  const { selectTable } = usePlan();
  const { width, depth } = event.room_m;

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-xs" tabIndex={-1}>
      <div className="@container min-w-[860px] p-2 sm:p-3">
        <div
          className="relative overflow-hidden rounded-lg border-[3px] border-foreground/35 bg-floor"
          role="group"
          aria-label={`Room plan, ${width} by ${depth} metres, drawn to scale`}
          style={
            {
              "--m": `calc((100cqw - 6px) / ${width})`,
              aspectRatio: `${width} / ${depth}`,
              backgroundImage:
                "linear-gradient(to right, var(--gridline) 1px, transparent 1px), linear-gradient(to bottom, var(--gridline) 1px, transparent 1px)",
              backgroundSize: "var(--m) var(--m)",
            } as React.CSSProperties
          }
          onClick={(e) => {
            if (e.target === e.currentTarget) selectTable(null);
          }}
        >
          {fixtures.map((f) => (
            <FixtureBlock key={f.id} f={f} />
          ))}
          {tables.map((t) => (
            <TableBlock key={t.id} table={t} over={over} setOver={setOver} />
          ))}
          <div
            aria-hidden
            className="pointer-events-none absolute flex flex-col gap-0.5 text-muted-foreground"
            style={{ left: m(5.6), top: m(13), width: m(4), fontSize: FONT_S }}
          >
            <div className="h-1.5 border-x-2 border-b-2 border-muted-foreground/70" />
            <span className="text-center">4 m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

```tsx components/plan/rules-panel.tsx
"use client";

import { AlertTriangle, CheckCircle2, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ruleKindLabel, type RuleStatus } from "@/lib/rules";
import { usePlan } from "@/lib/plan-store";
import { tables } from "@/lib/data";

const statusMeta: Record<RuleStatus, { label: string; icon: typeof CheckCircle2 }> = {
  broken: { label: "Broken", icon: AlertTriangle },
  ok: { label: "Met", icon: CheckCircle2 },
  waiting: { label: "Waiting", icon: Hourglass },
};

export function RulesPanel() {
  const { ruleResults, byId, selectTable } = usePlan();
  const broken = ruleResults.filter((r) => r.status === "broken");
  const order: RuleStatus[] = ["broken", "waiting", "ok"];
  const sorted = [...ruleResults].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="font-display text-lg">Couple's rules</CardTitle>
        <CardDescription aria-live="polite">
          {broken.length === 0
            ? "No rule is broken right now."
            : `${broken.length} broken: ${broken
                .map((r) => ruleKindLabel[r.rule.kind].toLowerCase())
                .join(", ")}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ul className="space-y-2">
          {sorted.map((r) => {
            const meta = statusMeta[r.status];
            const Icon = meta.icon;
            const names = r.rule.guests.map((id) => byId.get(id)?.name ?? id);
            return (
              <li
                key={r.rule.id}
                className={cn(
                  "rounded-lg border p-3 text-sm",
                  r.status === "broken" && "border-destructive/40 bg-destructive/[0.05]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {ruleKindLabel[r.rule.kind]}
                    </div>
                    <div className="mt-0.5 font-medium">{names.join(" & ")}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      r.status === "broken" && "border-destructive/50 bg-destructive/10 text-destructive",
                      r.status === "ok" && "border-primary/30 bg-accent text-accent-foreground",
                      r.status === "waiting" && "text-muted-foreground",
                    )}
                  >
                    <Icon aria-hidden />
                    {meta.label}
                  </Badge>
                </div>
                <p className="mt-1.5 text-muted-foreground">{r.rule.note}</p>
                <p className={cn("mt-1", r.status === "broken" && "font-medium text-destructive")}>{r.detail}</p>
                {r.status === "broken" && r.tables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.tables.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => selectTable(id)}
                        className="inline-flex min-h-8 items-center rounded-md border border-destructive/40 bg-card px-2.5 text-xs font-medium outline-none hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        Show {tables.find((t) => t.id === id)?.name}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
```

```tsx components/plan/stats-bar.tsx
"use client";

import { AlertTriangle, CheckCircle2, Clock, Armchair, UserX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-store";

function Tile({
  label,
  value,
  sub,
  icon,
  tone = "default",
  children,
}: {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  icon: React.ReactNode;
  tone?: "default" | "warn" | "ok";
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3.5 shadow-xs sm:p-4",
        tone === "warn" && "border-destructive/40 bg-destructive/[0.04]",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        <span aria-hidden className={cn(tone === "warn" && "text-destructive", tone === "ok" && "text-primary")}>
          {icon}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-2xl leading-none font-semibold tabular-nums">{value}</span>
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>
      {children}
    </div>
  );
}

export function StatsBar() {
  const { counts, ruleResults, guests } = usePlan();
  const broken = ruleResults.filter((r) => r.status === "broken").length;
  const waiting = ruleResults.filter((r) => r.status === "waiting").length;
  const maybe = guests.filter((g) => g.rsvp === "maybe").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const pct = counts.attending ? Math.min(100, Math.round(((counts.attending - counts.unseated) / counts.attending) * 100)) : 0;

  return (
    <section aria-label="Seating totals" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        label="Seated"
        value={counts.seated}
        sub={`of ${counts.attending} attending · ${counts.capacity} seats`}
        icon={<Armchair className="size-4" />}
      >
        <Progress value={pct} aria-label="Share of attending guests seated" className="mt-2.5 h-1.5" />
      </Tile>
      <Tile
        label="Unseated"
        value={counts.unseated}
        sub={counts.unseated === 0 ? "Everyone attending has a seat" : "attending, still to place"}
        icon={<UserX className="size-4" />}
        tone={counts.unseated === 0 ? "ok" : "default"}
      />
      <Tile
        label="Awaiting reply"
        value={counts.awaiting}
        sub={`${maybe} maybe · ${pending} no reply · ${counts.declined} declined`}
        icon={<Clock className="size-4" />}
      />
      <Tile
        label="Couple's rules"
        value={broken === 0 ? "All met" : `${broken} broken`}
        sub={`${ruleResults.length - broken - waiting} met · ${waiting} waiting on seating`}
        icon={broken === 0 ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
        tone={broken === 0 ? "ok" : "warn"}
      />
    </section>
  );
}
```

```tsx components/plan/table-panel.tsx
"use client";

import { MousePointerClick, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { tables } from "@/lib/data";
import { usePlan } from "@/lib/plan-store";
import { PartyDot } from "./guest-chip";

export function TablePanel() {
  const { selectedTable, occupancy, guests, place, unseat, ruleResults } = usePlan();
  const table = tables.find((t) => t.id === selectedTable);

  if (!table) {
    return (
      <Card className="gap-2 py-4">
        <CardHeader className="px-4">
          <CardTitle className="font-display text-lg">Table details</CardTitle>
          <CardDescription>
            <MousePointerClick className="mr-1.5 inline size-4 align-text-bottom" aria-hidden />
            Select a table in the room to see who sits there and what they eat.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {tables.map((t) => {
              const n = (occupancy[t.id] ?? []).filter(Boolean).length;
              return (
                <li key={t.id}>
                  <TableJump id={t.id} label={t.name} count={`${n}/${t.seats}`} />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    );
  }

  const seats = occupancy[table.id] ?? [];
  const seated = seats.filter((g): g is NonNullable<typeof g> => g !== null);
  const free = table.seats - seated.length;
  const unseatedList = guests.filter((g) => !g.table && g.rsvp !== "no");
  const dietCounts = new Map<string, number>();
  for (const g of seated) if (g.diet) dietCounts.set(g.diet, (dietCounts.get(g.diet) ?? 0) + 1);
  const noDiet = seated.filter((g) => !g.diet).length;
  const tableRules = ruleResults.filter((r) => r.status === "broken" && r.tables.includes(table.id));

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="font-display text-lg">{table.name}</CardTitle>
        <CardDescription>
          {seated.length} of {table.seats} seats filled · {free === 0 ? "full" : `${free} free`}
        </CardDescription>
        <Progress
          value={(seated.length / table.seats) * 100}
          aria-label={`${table.name} seats filled`}
          className="mt-1 h-1.5"
        />
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        {tableRules.length > 0 && (
          <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/[0.06] p-3 text-sm">
            <p className="font-medium text-destructive">Broken here</p>
            <ul className="mt-1 space-y-1">
              {tableRules.map((r) => (
                <li key={r.rule.id}>{r.detail}</li>
              ))}
            </ul>
          </div>
        )}

        {seated.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Nobody is seated here yet. Drag a guest onto the table, or pick one below.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {seats.map((g, i) =>
              g ? (
                <li key={g.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-2.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 basis-32">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <PartyDot party={g.party} />
                      <span className="truncate">{g.name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                      <span>{g.party}</span>
                      {g.diet && (
                        <Badge variant="secondary" className="bg-warn text-warn-foreground">
                          {g.diet}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <NativeSelect
                      size="sm"
                      aria-label={`Move ${g.name} to another table`}
                      value=""
                      onChange={(e) => {
                        if (e.target.value) place(g.id, e.target.value);
                      }}
                    >
                      <NativeSelectOption value="">Move to…</NativeSelectOption>
                      {tables
                        .filter((t) => t.id !== table.id)
                        .map((t) => {
                          const n = (occupancy[t.id] ?? []).filter(Boolean).length;
                          return (
                            <NativeSelectOption key={t.id} value={t.id} disabled={n >= t.seats}>
                              {t.name} ({n}/{t.seats})
                            </NativeSelectOption>
                          );
                        })}
                    </NativeSelect>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Unseat ${g.name}`}
                      title="Unseat"
                      onClick={() => unseat(g.id)}
                    >
                      <UserMinus />
                    </Button>
                  </div>
                </li>
              ) : null,
            )}
          </ul>
        )}

        {seated.length > 0 && (
          <div>
            <h3 className="text-sm font-medium">Dietary needs</h3>
            {dietCounts.size === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No dietary needs at this table.</p>
            ) : (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {[...dietCounts.entries()].map(([d, n]) => (
                  <li key={d}>
                    <Badge variant="secondary" className="bg-warn px-2.5 py-1 text-warn-foreground">
                      {d} × {n}
                    </Badge>
                  </li>
                ))}
                <li>
                  <Badge variant="outline" className="px-2.5 py-1">
                    Standard × {noDiet}
                  </Badge>
                </li>
              </ul>
            )}
          </div>
        )}

        {free > 0 && unseatedList.length > 0 && (
          <div>
            <label htmlFor="seat-here" className="text-sm font-medium">
              Seat a guest here
            </label>
            <NativeSelect
              id="seat-here"
              className="mt-1.5"
              value=""
              onChange={(e) => {
                if (e.target.value) place(e.target.value, table.id);
              }}
            >
              <NativeSelectOption value="">Choose an unseated guest…</NativeSelectOption>
              {unseatedList.map((g) => (
                <NativeSelectOption key={g.id} value={g.id}>
                  {g.name}
                  {g.rsvp !== "yes" ? " (not confirmed)" : ""}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TableJump({ id, label, count }: { id: string; label: string; count: string }) {
  const { selectTable } = usePlan();
  return (
    <button
      type="button"
      onClick={() => selectTable(id)}
      className="flex min-h-9 w-full items-center justify-between rounded-md border px-2.5 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span>{label}</span>
      <span className="text-muted-foreground tabular-nums">{count}</span>
    </button>
  );
}
```

```tsx components/plan/unseated-strip.tsx
"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-store";
import { GuestChip } from "./guest-chip";

export function UnseatedStrip() {
  const { guests, unseat, dragging, setDragging, counts } = usePlan();
  const [over, setOver] = React.useState(false);
  const attending = guests.filter((g) => g.rsvp === "yes" && !g.table);
  const awaiting = guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !g.table);
  const draggingSeated = Boolean(dragging && guests.find((g) => g.id === dragging)?.table);

  return (
    <section
      aria-labelledby="unseated-title"
      className={cn(
        "rounded-xl border bg-card p-3.5 shadow-xs transition-colors sm:p-4",
        draggingSeated && "border-dashed border-primary bg-accent/50",
        over && "ring-[3px] ring-primary",
      )}
      onDragOver={(e) => {
        if (!draggingSeated) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = dragging ?? e.dataTransfer.getData("text/plain");
        if (id) unseat(id);
        setDragging(null);
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="unseated-title" className="font-display text-lg font-semibold">
          Unseated
        </h2>
        <Badge variant="secondary" className="tabular-nums">
          {counts.unseated} attending
        </Badge>
        <p className="text-sm text-muted-foreground">
          {draggingSeated
            ? "Drop here to unseat."
            : "Tap a guest, then a seat or table. Or drag them onto the room."}
        </p>
      </div>

      {attending.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm text-accent-foreground">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Everyone who is attending has a seat.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {attending.map((g) => (
            <li key={g.id} className="max-w-full">
              <GuestChip guest={g} />
            </li>
          ))}
        </ul>
      )}

      {awaiting.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Not confirmed yet ({awaiting.length}). You can hold a seat for them.
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {awaiting.map((g) => (
              <li key={g.id} className="max-w-full">
                <GuestChip guest={g} muted />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
```

```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";
export type TableShape = "round" | "long";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type RuleKind = "together" | "apart" | "near";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface TableDef {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Fixture {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Rule {
  id: string;
  kind: RuleKind;
  guests: string[];
  note: string;
  /** For a "near" rule: the fixture to be close to, and the one to stay away from. */
  nearFixture?: string;
  awayFrom?: string;
}

export const app = "Seatwise";

export const event = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const planner = { name: "Hannah Brook" };

export const fixtures: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const tables: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

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
];

export const rules: Rule[] = [
  { id: "r-1", kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { id: "r-2", kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { id: "r-3", kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { id: "r-4", kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    id: "r-5",
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    nearFixture: "f-4",
    awayFrom: "f-1",
  },
];

/** Seats the guests had in the starting plan; the couple sit in the middle of the top table. */
export const initialSeatOverrides: Record<string, number> = {
  "g-03": 1,
  "g-04": 2,
  "g-01": 3,
  "g-02": 4,
  "g-05": 5,
  "g-06": 6,
};

export const parties = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
];

export const diets = [
  "Vegetarian",
  "Vegan",
  "Gluten free",
  "Halal",
  "Pescatarian",
  "Nut allergy",
  "Soft food",
  "Children's menu",
];

const partyHue: Record<string, { h: number; c: number }> = {
  Couple: { h: 85, c: 0.13 },
  "Bride's family": { h: 8, c: 0.11 },
  "Groom's family": { h: 250, c: 0.1 },
  "University friends": { h: 190, c: 0.09 },
  "Work friends": { h: 305, c: 0.1 },
  "Groom's football club": { h: 55, c: 0.13 },
  "Plus-ones": { h: 150, c: 0.09 },
};

export interface PartyColors {
  tint: string;
  edge: string;
  ink: string;
  dot: string;
}

export function partyColors(party: string): PartyColors {
  const { h, c } = partyHue[party] ?? { h: 260, c: 0.02 };
  return {
    tint: `oklch(0.93 ${(c * 0.45).toFixed(3)} ${h})`,
    edge: `oklch(0.62 ${c} ${h})`,
    ink: `oklch(0.27 ${(c * 0.6).toFixed(3)} ${h})`,
    dot: `oklch(0.66 ${(c * 1.3).toFixed(3)} ${h})`,
  };
}

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply",
  no: "Declined",
};

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}
```

```ts lib/geometry.ts
import type { TableDef } from "@/lib/data";

/** Diameter of a seat, in metres of floor space. */
export const SEAT_D = 0.9;

export interface TableFrame {
  /** Top-left of the frame (table plus its seats) in room metres. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** The table top, relative to the frame. */
  surface: { x: number; y: number; w: number; h: number; round: boolean };
  /** Seat centres, relative to the frame. */
  seats: { x: number; y: number }[];
  /** Centre of the table in room metres. */
  centre: { x: number; y: number };
}

const ORBIT = 1.45;
const LONG_DEPTH = 1.3;
const LONG_GAP = 0.1;

export function tableFrame(t: TableDef): TableFrame {
  if (t.shape === "long") {
    const length = t.seats;
    const seatRow = SEAT_D + LONG_GAP;
    return {
      left: t.x,
      top: t.y - seatRow,
      width: length,
      height: seatRow + LONG_DEPTH,
      surface: { x: 0, y: seatRow, w: length, h: LONG_DEPTH, round: false },
      seats: Array.from({ length: t.seats }, (_, i) => ({ x: i + 0.5, y: SEAT_D / 2 })),
      centre: { x: t.x + length / 2, y: t.y + LONG_DEPTH / 2 },
    };
  }
  const radius = t.seats > 6 ? 0.8 : 0.75;
  const ext = ORBIT + SEAT_D / 2;
  return {
    left: t.x - ext,
    top: t.y - ext,
    width: ext * 2,
    height: ext * 2,
    surface: { x: ext - radius, y: ext - radius, w: radius * 2, h: radius * 2, round: true },
    seats: Array.from({ length: t.seats }, (_, i) => {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
      return { x: ext + Math.cos(a) * ORBIT, y: ext + Math.sin(a) * ORBIT };
    }),
    centre: { x: t.x, y: t.y },
  };
}

/** A length in room metres as a CSS value (the room sets --m to one metre). */
export function m(v: number): string {
  return `calc(var(--m) * ${v})`;
}
```

```tsx lib/plan-store.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  guests as seedGuests,
  initialSeatOverrides,
  rules,
  tables,
  type Guest,
} from "@/lib/data";
import { evaluateRules, type RuleResult } from "@/lib/rules";

export interface PlacedGuest extends Guest {
  seat: number | null;
}

interface Placement {
  table: string;
  seat: number;
}

export interface Counts {
  total: number;
  attending: number;
  seated: number;
  unseated: number;
  awaiting: number;
  declined: number;
  capacity: number;
}

interface PlanContextValue {
  guests: PlacedGuest[];
  byId: Map<string, PlacedGuest>;
  /** Seat-by-seat occupants of each table. */
  occupancy: Record<string, (PlacedGuest | null)[]>;
  counts: Counts;
  ruleResults: RuleResult[];
  brokenTables: Set<string>;
  selectedTable: string | null;
  selectTable: (id: string | null) => void;
  armed: string | null;
  arm: (id: string | null) => void;
  dragging: string | null;
  setDragging: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => boolean;
  unseat: (guestId: string) => void;
}

const PlanContext = React.createContext<PlanContextValue | null>(null);

function initialPlacements(): Record<string, Placement> {
  const out: Record<string, Placement> = {};
  const next: Record<string, number> = {};
  for (const g of seedGuests) {
    if (!g.table) continue;
    const override = initialSeatOverrides[g.id];
    if (override !== undefined) {
      out[g.id] = { table: g.table, seat: override };
    }
  }
  for (const g of seedGuests) {
    if (!g.table || out[g.id]) continue;
    const taken = new Set(
      Object.values(out)
        .filter((p) => p.table === g.table)
        .map((p) => p.seat),
    );
    let s = next[g.table] ?? 0;
    while (taken.has(s)) s++;
    next[g.table] = s + 1;
    out[g.id] = { table: g.table, seat: s };
  }
  return out;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [placements, setPlacements] = React.useState<Record<string, Placement>>(initialPlacements);
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [armed, setArmed] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);

  const guests = React.useMemo<PlacedGuest[]>(
    () =>
      seedGuests.map((g) => {
        const p = placements[g.id];
        return { ...g, table: p ? p.table : null, seat: p ? p.seat : null };
      }),
    [placements],
  );

  const byId = React.useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests]);

  const occupancy = React.useMemo(() => {
    const occ: Record<string, (PlacedGuest | null)[]> = {};
    for (const t of tables) occ[t.id] = Array.from({ length: t.seats }, () => null);
    for (const g of guests) {
      if (g.table && g.seat !== null && occ[g.table]) occ[g.table][g.seat] = g;
    }
    return occ;
  }, [guests]);

  const counts = React.useMemo<Counts>(() => {
    const attendingGuests = guests.filter((g) => g.rsvp === "yes");
    return {
      total: guests.length,
      attending: attendingGuests.length,
      seated: guests.filter((g) => g.table).length,
      unseated: attendingGuests.filter((g) => !g.table).length,
      awaiting: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !g.table).length,
      declined: guests.filter((g) => g.rsvp === "no").length,
      capacity: tables.reduce((n, t) => n + t.seats, 0),
    };
  }, [guests]);

  const ruleResults = React.useMemo(() => evaluateRules(rules, guests), [guests]);

  const brokenTables = React.useMemo(() => {
    const s = new Set<string>();
    for (const r of ruleResults) if (r.status === "broken") r.tables.forEach((t) => s.add(t));
    return s;
  }, [ruleResults]);

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number): boolean => {
      const guest = byId.get(guestId);
      const table = tables.find((t) => t.id === tableId);
      if (!guest || !table) return false;
      if (guest.rsvp === "no") {
        toast.error(`${guest.name} has declined`, { description: "Declined guests are not given a seat." });
        return false;
      }
      const occ = occupancy[tableId] ?? [];
      let target = seat;
      if (target === undefined) {
        if (guest.table === tableId) {
          toast.info(`${guest.name} is already at ${table.name}`);
          return false;
        }
        target = occ.findIndex((o) => o === null);
        if (target < 0) {
          toast.error(`${table.name} is full`, { description: `All ${table.seats} seats are taken.` });
          return false;
        }
      }
      const occupant = occ[target] ?? null;
      if (occupant && occupant.id === guestId) return false;

      if (occupant) {
        if (!guest.table || guest.seat === null) {
          toast.error(`Seat ${target + 1} at ${table.name} is taken`, {
            description: `${occupant.name} is sitting there. Pick an empty seat.`,
          });
          return false;
        }
        const fromTable = guest.table;
        const fromSeat = guest.seat;
        setPlacements((prev) => ({
          ...prev,
          [guestId]: { table: tableId, seat: target },
          [occupant.id]: { table: fromTable, seat: fromSeat },
        }));
        toast.success(`Swapped ${guest.name} and ${occupant.name}`);
      } else {
        setPlacements((prev) => ({ ...prev, [guestId]: { table: tableId, seat: target } }));
        const note =
          guest.rsvp === "maybe" || guest.rsvp === "pending" ? "They have not confirmed yet." : undefined;
        toast.success(`${guest.name} seated at ${table.name}`, {
          description: note ?? `Seat ${target + 1} of ${table.seats}`,
        });
      }
      setSelectedTable(tableId);
      setArmed(null);
      setDragging(null);
      return true;
    },
    [byId, occupancy],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      const guest = byId.get(guestId);
      if (!guest || !guest.table) return;
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[guestId];
        return next;
      });
      toast(`${guest.name} unseated`, { description: "Back in the unseated list." });
      setArmed(null);
      setDragging(null);
    },
    [byId],
  );

  const value = React.useMemo<PlanContextValue>(
    () => ({
      guests,
      byId,
      occupancy,
      counts,
      ruleResults,
      brokenTables,
      selectedTable,
      selectTable: setSelectedTable,
      armed,
      arm: setArmed,
      dragging,
      setDragging,
      place,
      unseat,
    }),
    [guests, byId, occupancy, counts, ruleResults, brokenTables, selectedTable, armed, dragging, place, unseat],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```ts lib/rules.ts
import { fixtures, tables, type Guest, type Rule } from "@/lib/data";
import { tableFrame } from "@/lib/geometry";

export type RuleStatus = "ok" | "broken" | "waiting";

export interface RuleResult {
  rule: Rule;
  status: RuleStatus;
  /** One short sentence about the current state of the rule. */
  detail: string;
  /** Tables the rule is currently broken on. */
  tables: string[];
}

/** A "seat near" rule counts as met within this many metres of the fixture. */
export const NEAR_M = 4.5;
/** ...and "away from" as at least this far from the other fixture. */
export const AWAY_M = 6;

const tableCentres = new Map(tables.map((t) => [t.id, tableFrame(t).centre]));
const tableNames = new Map(tables.map((t) => [t.id, t.name]));

function fixtureCentre(id: string) {
  const f = fixtures.find((x) => x.id === id);
  return f ? { x: f.x + f.w / 2, y: f.y + f.h / 2, label: f.label } : null;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const first = (n: string) => n.split(" ")[0] ?? n;

export function evaluateRules(rules: Rule[], guests: Guest[]): RuleResult[] {
  const byId = new Map(guests.map((g) => [g.id, g]));
  return rules.map((rule): RuleResult => {
    const people = rule.guests.map((id) => byId.get(id)).filter((g): g is Guest => Boolean(g));
    const unseated = people.filter((g) => !g.table);

    if (rule.kind === "near") {
      const g = people[0];
      if (!g || !g.table) {
        return { rule, status: "waiting", detail: `${g ? first(g.name) : "Guest"} is not seated yet.`, tables: [] };
      }
      const centre = tableCentres.get(g.table);
      const near = rule.nearFixture ? fixtureCentre(rule.nearFixture) : null;
      const away = rule.awayFrom ? fixtureCentre(rule.awayFrom) : null;
      if (!centre) return { rule, status: "waiting", detail: "Table not found.", tables: [] };
      const tName = tableNames.get(g.table) ?? g.table;
      const dNear = near ? dist(centre, near) : 0;
      const dAway = away ? dist(centre, away) : Infinity;
      const problems: string[] = [];
      if (near && dNear > NEAR_M) problems.push(`${dNear.toFixed(1)} m from the ${near.label.toLowerCase()}`);
      if (away && dAway < AWAY_M) problems.push(`only ${dAway.toFixed(1)} m from the ${away.label.toLowerCase()}`);
      if (problems.length) {
        return {
          rule,
          status: "broken",
          detail: `${tName} is ${problems.join(" and ")}.`,
          tables: [g.table],
        };
      }
      return {
        rule,
        status: "ok",
        detail: `${tName} is ${dNear.toFixed(1)} m from the ${near?.label.toLowerCase() ?? "doors"}.`,
        tables: [],
      };
    }

    if (unseated.length > 0 || people.length < 2) {
      const who = unseated.map((g) => first(g.name)).join(" and ");
      return {
        rule,
        status: "waiting",
        detail: who ? `Waiting for ${who} to be seated.` : "Waiting.",
        tables: [],
      };
    }

    const [a, b] = people as [Guest, Guest];
    const same = a.table === b.table;
    const names = `${first(a.name)} and ${first(b.name)}`;
    if (rule.kind === "together") {
      if (same) return { rule, status: "ok", detail: `${names} are both at ${tableNames.get(a.table!)}.`, tables: [] };
      return {
        rule,
        status: "broken",
        detail: `${first(a.name)} is at ${tableNames.get(a.table!)}, ${first(b.name)} at ${tableNames.get(b.table!)}.`,
        tables: [a.table!, b.table!],
      };
    }
    // apart
    if (same) {
      return {
        rule,
        status: "broken",
        detail: `${names} are both at ${tableNames.get(a.table!)}.`,
        tables: [a.table!],
      };
    }
    return {
      rule,
      status: "ok",
      detail: `${first(a.name)} at ${tableNames.get(a.table!)}, ${first(b.name)} at ${tableNames.get(b.table!)}.`,
      tables: [],
    };
  });
}

export const ruleKindLabel: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};
```

