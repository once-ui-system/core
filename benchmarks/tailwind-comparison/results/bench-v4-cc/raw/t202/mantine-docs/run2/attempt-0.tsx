```ts lib/data.ts
export type Rsvp = "yes" | "no" | "maybe" | "pending";
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type TableShape = "round" | "long";
export type RuleKind = "together" | "apart" | "near";

export interface Fixture {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
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

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface Rule {
  kind: RuleKind;
  guests: string[];
  note: string;
}

export const APP_NAME = "Seatwise";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room_m: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook" };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

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
];

export const RULES: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  { kind: "apart", guests: ["g-29", "g-30"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const GUESTS_BY_ID: Record<string, Guest> = Object.fromEntries(GUESTS.map((g) => [g.id, g]));
export const TABLES_BY_ID: Record<string, TableDef> = Object.fromEntries(TABLES.map((t) => [t.id, t]));
export const FIXTURES_BY_ID: Record<string, Fixture> = Object.fromEntries(FIXTURES.map((f) => [f.id, f]));

export const PARTIES: string[] = Array.from(new Set(GUESTS.map((g) => g.party)));
export const DIETS: string[] = Array.from(
  new Set(GUESTS.map((g) => g.diet).filter((d): d is string => d !== null)),
).sort((a, b) => a.localeCompare(b));

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  no: "Declined",
  maybe: "Maybe",
  pending: "No reply",
};

export const RSVP_COLOR: Record<Rsvp, string> = {
  yes: "teal",
  no: "gray",
  maybe: "yellow",
  pending: "orange",
};

const PARTY_COLORS: Record<string, string> = {
  Couple: "pink",
  "Bride's family": "grape",
  "Groom's family": "blue",
  "University friends": "teal",
  "Work friends": "orange",
  "Groom's football club": "cyan",
  "Plus-ones": "gray",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "gray";
}

export function partyShade(party: string): number {
  const c = partyColor(party);
  return c === "orange" || c === "cyan" || c === "teal" ? 8 : 7;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatEventDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

```ts lib/rules.ts
import {
  FIXTURES_BY_ID,
  GUESTS,
  GUESTS_BY_ID,
  RULES,
  TABLES,
  TABLES_BY_ID,
  type RuleKind,
} from "@/lib/data";

export type Seat = { table: string; seat: number } | null;
export type Placements = Record<string, Seat>;
export type SeatMap = Record<string, (string | null)[]>;
export type RuleStatus = "ok" | "broken" | "pending";

export interface RuleResult {
  id: string;
  kind: RuleKind;
  status: RuleStatus;
  headline: string;
  detail: string;
  note: string;
  guestIds: string[];
  /** Tables of the seated guests the rule is about. */
  tableIds: string[];
}

export function initialPlacements(): Placements {
  const counters: Record<string, number> = {};
  const out: Placements = {};
  for (const g of GUESTS) {
    if (g.table) {
      const seat = counters[g.table] ?? 0;
      counters[g.table] = seat + 1;
      out[g.id] = { table: g.table, seat };
    } else {
      out[g.id] = null;
    }
  }
  return out;
}

export function buildSeatMap(p: Placements): SeatMap {
  const map: SeatMap = {};
  for (const t of TABLES) map[t.id] = Array.from({ length: t.seats }, () => null);
  for (const [guestId, seat] of Object.entries(p)) {
    if (seat) {
      const row = map[seat.table];
      if (row) row[seat.seat] = guestId;
    }
  }
  return map;
}

export type PlaceResult =
  | { ok: true; next: Placements; swappedWith?: string }
  | { ok: false; reason: "full" | "same" };

export function placeGuest(p: Placements, guestId: string, tableId: string, seat?: number): PlaceResult {
  const row = buildSeatMap(p)[tableId];
  if (!row) return { ok: false, reason: "same" };
  const current = p[guestId] ?? null;
  if (seat === undefined) {
    if (current?.table === tableId) return { ok: false, reason: "same" };
    const free = row.indexOf(null);
    if (free < 0) return { ok: false, reason: "full" };
    return { ok: true, next: { ...p, [guestId]: { table: tableId, seat: free } } };
  }
  const occupant = row[seat] ?? null;
  if (occupant === guestId) return { ok: false, reason: "same" };
  const next: Placements = { ...p };
  if (occupant) next[occupant] = current;
  next[guestId] = { table: tableId, seat };
  return { ok: true, next, swappedWith: occupant ?? undefined };
}

/** Where "near" and "away" are measured: the guest's table centre against a fixture centre. */
const NEAR = { fixtureId: "f-4", maxM: 5, awayFromId: "f-1", minAwayM: 6 };

function distance(tableId: string, fixtureId: string): number {
  const t = TABLES_BY_ID[tableId];
  const f = FIXTURES_BY_ID[fixtureId];
  if (!t || !f) return Number.POSITIVE_INFINITY;
  return Math.hypot(t.x - (f.x + f.w / 2), t.y - (f.y + f.h / 2));
}

function tName(id: string): string {
  return TABLES_BY_ID[id]?.name ?? id;
}

function gName(id: string): string {
  return GUESTS_BY_ID[id]?.name ?? id;
}

export function evaluateRules(p: Placements): RuleResult[] {
  return RULES.map((rule, i): RuleResult => {
    const id = `rule-${i + 1}`;
    const seats = rule.guests.map((g) => p[g] ?? null);
    const tableIds = Array.from(new Set(seats.filter((s): s is NonNullable<Seat> => s !== null).map((s) => s.table)));
    const base = { id, kind: rule.kind, note: rule.note, guestIds: rule.guests, tableIds };
    const a = rule.guests[0] ?? "";
    const b = rule.guests[1] ?? "";
    const sa = seats[0] ?? null;
    const sb = seats[1] ?? null;

    if (rule.kind === "together") {
      if (sa && sb) {
        return sa.table === sb.table
          ? { ...base, status: "ok", headline: `${gName(a)} and ${gName(b)} sit together`, detail: `Both at ${tName(sa.table)}.` }
          : {
              ...base,
              status: "broken",
              headline: `${gName(a)} and ${gName(b)} are split`,
              detail: `${gName(a)} is at ${tName(sa.table)}, ${gName(b)} at ${tName(sb.table)}.`,
            };
      }
      const missing = [!sa ? gName(a) : null, !sb ? gName(b) : null].filter(Boolean).join(" and ");
      const anchor = sa ?? sb;
      return {
        ...base,
        status: "pending",
        headline: `Seat ${gName(a)} and ${gName(b)} together`,
        detail: anchor ? `${missing} still needs a seat, ideally at ${tName(anchor.table)}.` : `${missing} still need seats.`,
      };
    }

    if (rule.kind === "apart") {
      if (sa && sb) {
        return sa.table === sb.table
          ? {
              ...base,
              status: "broken",
              headline: `${gName(a)} and ${gName(b)} share ${tName(sa.table)}`,
              detail: "They should sit at different tables.",
            }
          : {
              ...base,
              status: "ok",
              headline: `${gName(a)} and ${gName(b)} are apart`,
              detail: `${tName(sa.table)} and ${tName(sb.table)}.`,
            };
      }
      const open = [!sa ? gName(a) : null, !sb ? gName(b) : null].filter(Boolean).join(" and ");
      return {
        ...base,
        status: "pending",
        headline: `Keep ${gName(a)} and ${gName(b)} apart`,
        detail: `${open} not seated yet.`,
      };
    }

    // near
    const seat = sa;
    if (!seat) {
      return {
        ...base,
        status: "pending",
        headline: `Seat ${gName(a)} near the garden doors`,
        detail: "Not seated yet.",
      };
    }
    const toDoor = distance(seat.table, NEAR.fixtureId);
    const toBand = distance(seat.table, NEAR.awayFromId);
    const problems: string[] = [];
    if (toDoor > NEAR.maxM) problems.push(`${toDoor.toFixed(1)} m from the garden doors (aim for ${NEAR.maxM} m or less)`);
    if (toBand < NEAR.minAwayM) problems.push(`only ${toBand.toFixed(1)} m from the band (aim for ${NEAR.minAwayM} m or more)`);
    return problems.length
      ? {
          ...base,
          status: "broken",
          headline: `${gName(a)} is not near the garden doors`,
          detail: `${tName(seat.table)} is ${problems.join(" and ")}.`,
        }
      : {
          ...base,
          status: "ok",
          headline: `${gName(a)} is near the garden doors`,
          detail: `${tName(seat.table)} is ${toDoor.toFixed(1)} m from the doors and ${toBand.toFixed(1)} m from the band.`,
        };
  });
}
```

```tsx lib/plan.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { notifications } from "@mantine/notifications";
import { GUESTS, GUESTS_BY_ID, TABLES, TABLES_BY_ID, type Guest } from "@/lib/data";
import {
  buildSeatMap,
  evaluateRules,
  initialPlacements,
  placeGuest,
  type Placements,
  type RuleResult,
  type SeatMap,
} from "@/lib/rules";

export type PanelTab = "seat" | "rules" | "table";

interface PlanApi {
  placements: Placements;
  seatMap: SeatMap;
  rules: RuleResult[];
  brokenRules: RuleResult[];
  flaggedTables: Record<string, number>;
  flaggedGuests: Set<string>;
  seatedCount: number;
  totalSeats: number;
  unseatedAttending: Guest[];
  unseatedUnconfirmed: Guest[];
  attendingCount: number;
  selectedTable: string | null;
  activeGuest: string | null;
  draggingId: string | null;
  tab: PanelTab;
  announcement: string;
  setTab: (t: PanelTab) => void;
  selectTable: (id: string | null) => void;
  setActiveGuest: (id: string | null) => void;
  setDragging: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  tapSeat: (tableId: string, seat: number) => void;
  tapTable: (tableId: string) => void;
}

const PlanContext = createContext<PlanApi | null>(null);

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [placements, setPlacements] = useState<Placements>(initialPlacements);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeGuest, setActiveGuestState] = useState<string | null>(null);
  const [draggingId, setDragging] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>("seat");
  const [announcement, setAnnouncement] = useState("");

  const seatMap = useMemo(() => buildSeatMap(placements), [placements]);
  const rules = useMemo(() => evaluateRules(placements), [placements]);
  const brokenRules = useMemo(() => rules.filter((r) => r.status === "broken"), [rules]);

  const { flaggedTables, flaggedGuests } = useMemo(() => {
    const tables: Record<string, number> = {};
    const guests = new Set<string>();
    for (const r of brokenRules) {
      for (const t of r.tableIds) tables[t] = (tables[t] ?? 0) + 1;
      for (const g of r.guestIds) guests.add(g);
    }
    return { flaggedTables: tables, flaggedGuests: guests };
  }, [brokenRules]);

  const seatedCount = useMemo(() => GUESTS.filter((g) => placements[g.id]).length, [placements]);
  const totalSeats = useMemo(() => TABLES.reduce((n, t) => n + t.seats, 0), []);
  const unseatedAttending = useMemo(
    () => GUESTS.filter((g) => g.rsvp === "yes" && !placements[g.id]),
    [placements],
  );
  const unseatedUnconfirmed = useMemo(
    () => GUESTS.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !placements[g.id]),
    [placements],
  );
  const attendingCount = useMemo(() => GUESTS.filter((g) => g.rsvp === "yes").length, []);

  const setActiveGuest = useCallback((id: string | null) => setActiveGuestState(id), []);

  const selectTable = useCallback((id: string | null) => {
    setSelectedTable(id);
    if (id) setTab("table");
  }, []);

  const place = useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = GUESTS_BY_ID[guestId];
      const table = TABLES_BY_ID[tableId];
      if (!guest || !table) return;
      const res = placeGuest(placements, guestId, tableId, seat);
      setActiveGuestState(null);
      if (!res.ok) {
        if (res.reason === "full") {
          notifications.show({
            color: "red",
            title: `${table.name} is full`,
            message: `${guest.name} was not moved. Free a seat first, or drop onto a taken seat to swap.`,
          });
          setAnnouncement(`${table.name} is full.`);
        }
        return;
      }
      setPlacements(res.next);
      setSelectedTable(tableId);
      const swapped = res.swappedWith ? GUESTS_BY_ID[res.swappedWith] : undefined;
      setAnnouncement(
        swapped
          ? `${guest.name} seated at ${table.name}, swapped with ${swapped.name}.`
          : `${guest.name} seated at ${table.name}.`,
      );
    },
    [placements],
  );

  const unseat = useCallback(
    (guestId: string) => {
      const guest = GUESTS_BY_ID[guestId];
      if (!guest || !placements[guestId]) return;
      setPlacements((p) => ({ ...p, [guestId]: null }));
      setActiveGuestState(null);
      setAnnouncement(`${guest.name} unseated.`);
    },
    [placements],
  );

  const tapSeat = useCallback(
    (tableId: string, seat: number) => {
      const occupant = seatMap[tableId]?.[seat] ?? null;
      if (activeGuest) {
        if (occupant === activeGuest) {
          setActiveGuestState(null);
          return;
        }
        place(activeGuest, tableId, seat);
        return;
      }
      selectTable(tableId);
      if (occupant) setActiveGuestState(occupant);
    },
    [activeGuest, place, seatMap, selectTable],
  );

  const tapTable = useCallback(
    (tableId: string) => {
      if (activeGuest) {
        place(activeGuest, tableId);
        return;
      }
      selectTable(tableId);
    },
    [activeGuest, place, selectTable],
  );

  const value: PlanApi = {
    placements,
    seatMap,
    rules,
    brokenRules,
    flaggedTables,
    flaggedGuests,
    seatedCount,
    totalSeats,
    unseatedAttending,
    unseatedUnconfirmed,
    attendingCount,
    selectedTable,
    activeGuest,
    draggingId,
    tab,
    announcement,
    setTab,
    selectTable,
    setActiveGuest,
    setDragging,
    place,
    unseat,
    tapSeat,
    tapTable,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/Shell.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Box, Button, Container, Group, Text, ThemeIcon } from "@mantine/core";
import { IconArmchair, IconCalendarEvent, IconLayoutGrid, IconMapPin, IconUsers } from "@tabler/icons-react";
import { APP_NAME, EVENT, PLANNER, formatEventDate, initials } from "@/lib/data";
import { PlanProvider } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Seating plan", icon: IconLayoutGrid },
  { href: "/guests", label: "Guest list", icon: IconUsers },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <PlanProvider>
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Container size="xl" py="xs">
          <Group justify="space-between" gap="sm" wrap="wrap">
            <Group gap="md" wrap="wrap">
              <Group gap={8} wrap="nowrap">
                <ThemeIcon size={34} radius="md" variant="filled" aria-hidden>
                  <IconArmchair size={20} />
                </ThemeIcon>
                <Text fw={800} size="lg" style={{ letterSpacing: "-0.02em" }}>
                  {APP_NAME}
                </Text>
              </Group>
              <Group gap={4} component="nav" aria-label="Main">
                {NAV.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      variant={active ? "light" : "subtle"}
                      color={active ? undefined : "gray"}
                      size="sm"
                      leftSection={<item.icon size={16} />}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Group>
            </Group>
            <Group gap="md" wrap="nowrap">
              <Box visibleFrom="md" style={{ textAlign: "right" }}>
                <Text size="sm" fw={600} lh={1.2}>
                  {EVENT.name}
                </Text>
                <Group gap={10} justify="flex-end" c="dimmed">
                  <Group gap={4} wrap="nowrap">
                    <IconCalendarEvent size={13} aria-hidden />
                    <Text size="xs">{formatEventDate(EVENT.date)}</Text>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    <IconMapPin size={13} aria-hidden />
                    <Text size="xs">{EVENT.venue}</Text>
                  </Group>
                </Group>
              </Box>
              <Avatar color="indigo" radius="xl" size="md" title={PLANNER.name} aria-label={`Signed in as ${PLANNER.name}`}>
                {initials(PLANNER.name)}
              </Avatar>
            </Group>
          </Group>
        </Container>
      </Box>
      <Box component="main">{children}</Box>
    </PlanProvider>
  );
}
```

```css components/room.module.css
.scroller {
  overflow-x: auto;
  border: 1px solid var(--mantine-color-default-border);
  border-radius: var(--mantine-radius-md);
  background: var(--mantine-color-body);
}

.room {
  --floor: light-dark(#fbfaf6, var(--mantine-color-dark-8));
  --grid-line: light-dark(rgba(60, 50, 30, 0.07), rgba(255, 255, 255, 0.05));
  --surface: light-dark(#ffffff, var(--mantine-color-dark-5));
  --surface-edge: light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-2));
  position: relative;
  width: 100%;
  min-width: 760px;
  aspect-ratio: 24 / 14;
  container-type: inline-size;
  background-color: var(--floor);
  background-image:
    linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
  background-size: calc(100% / 24) calc(100% / 14);
}

.fixture {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  overflow: hidden;
  text-align: center;
  font-size: max(9px, 1.4cqw);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border-radius: 6px;
  pointer-events: none;
  user-select: none;
}

.fixture[data-kind='stage'] {
  background: var(--mantine-color-violet-light);
  color: var(--mantine-color-violet-light-color);
  border: 1.5px solid var(--mantine-color-violet-light-color);
}

.fixture[data-kind='dancefloor'] {
  background-color: var(--mantine-color-blue-light);
  background-image: repeating-conic-gradient(rgba(255, 255, 255, 0.35) 0 25%, transparent 0 50%);
  background-size: 12.5% 20%;
  color: var(--mantine-color-blue-light-color);
  border: 1.5px dashed var(--mantine-color-blue-light-color);
}

.fixture[data-kind='bar'] {
  background: var(--mantine-color-orange-light);
  color: var(--mantine-color-orange-light-color);
  border: 1.5px solid var(--mantine-color-orange-light-color);
}

.fixture[data-kind='door'] {
  background: var(--mantine-color-teal-light);
  color: var(--mantine-color-teal-light-color);
  border: 1.5px solid var(--mantine-color-teal-light-color);
  border-radius: 3px;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: max(8px, 1.1cqw);
  letter-spacing: 0;
}

.wrap {
  position: absolute;
  transform: translate(-50%, -50%);
}

.surface {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  gap: 0;
  color: var(--mantine-color-text);
  background: var(--surface);
  border: 2px solid var(--surface-edge);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.14);
  cursor: pointer;
  font-family: inherit;
  line-height: 1.15;
}

.surface[data-shape='round'] {
  border-radius: 50%;
}

.surface[data-shape='long'] {
  border-radius: 10px;
}

.surface[data-selected='true'] {
  border-color: var(--mantine-primary-color-filled);
  box-shadow: 0 0 0 4px var(--mantine-primary-color-light);
}

.surface[data-flagged='true'] {
  border-color: var(--mantine-color-red-filled);
}

.surface[data-over='true'] {
  border-color: var(--mantine-color-teal-filled);
  box-shadow: 0 0 0 5px var(--mantine-color-teal-light);
}

.surface:hover {
  border-color: var(--mantine-primary-color-filled);
}

.tName {
  font-size: max(9px, 1.45cqw);
  font-weight: 700;
}

.tCount {
  font-size: max(9px, 1.25cqw);
  color: var(--mantine-color-dimmed);
  font-variant-numeric: tabular-nums;
}

.flag {
  position: absolute;
  top: -4%;
  right: -4%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: max(14px, 1.7cqw);
  height: max(14px, 1.7cqw);
  border-radius: 50%;
  background: var(--mantine-color-red-filled);
  color: #fff;
  font-size: max(9px, 1.15cqw);
  font-weight: 800;
}

.seat {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  padding: 0;
  border-radius: 50%;
  border: 2px dashed var(--mantine-color-dimmed);
  background: transparent;
  color: var(--mantine-color-dimmed);
  font-family: inherit;
  font-size: max(9px, 1.4cqw);
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: box-shadow 120ms ease, background-color 120ms ease;
}

.seat[data-state='filled'] {
  border: 2px solid rgba(255, 255, 255, 0.85);
  background: var(--seat-color);
  color: #fff;
  cursor: grab;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.seat[data-state='empty']:hover {
  border-color: var(--mantine-primary-color-filled);
  background: var(--mantine-primary-color-light);
}

.seat[data-active='true'] {
  box-shadow: 0 0 0 3px var(--mantine-primary-color-filled);
  z-index: 3;
}

.seat[data-flag='true'] {
  box-shadow: 0 0 0 2.5px var(--mantine-color-red-filled);
}

.seat[data-over='true'] {
  box-shadow: 0 0 0 3px var(--mantine-color-teal-filled);
  background-color: var(--mantine-color-teal-light);
  z-index: 3;
}

.seat[data-state='filled'][data-over='true'] {
  background-color: var(--seat-color);
}

.dot {
  position: absolute;
  right: -3%;
  bottom: -3%;
  width: 32%;
  height: 32%;
  border-radius: 50%;
  background: var(--mantine-color-yellow-5);
  border: 1.5px solid #fff;
}

.surface:focus-visible,
.seat:focus-visible {
  outline: 3px solid var(--mantine-primary-color-filled);
  outline-offset: 2px;
  z-index: 4;
}

.dropzone {
  border-radius: var(--mantine-radius-md);
  transition: background-color 120ms ease, outline-color 120ms ease;
  outline: 2px dashed transparent;
  outline-offset: 2px;
}

.dropzone[data-dragging='true'] {
  outline-color: var(--mantine-color-dimmed);
}

.dropzone[data-over='true'] {
  outline-color: var(--mantine-color-teal-filled);
  background: var(--mantine-color-teal-light);
}
```

```tsx components/Room.tsx
"use client";

import { useState, type CSSProperties, type DragEvent } from "react";
import { EVENT, FIXTURES, GUESTS_BY_ID, TABLES, initials, partyColor, partyShade, type TableDef } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import classes from "./room.module.css";

const W = EVENT.room_m.width;
const D = EVENT.room_m.depth;
const SEAT_D = 0.95;
const TABLE_R = 1.0;
const RING = 1.55;
const LONG_H = 1.0;
const LONG_PITCH = 1.2;

interface Geometry {
  w: number;
  h: number;
  surfaceW: number;
  surfaceH: number;
  seats: { cx: number; cy: number }[];
}

function geometry(t: TableDef): Geometry {
  if (t.shape === "round") {
    const size = 2 * (RING + SEAT_D / 2) + 0.1;
    const seats = Array.from({ length: t.seats }, (_, k) => {
      const a = -Math.PI / 2 + ((k + 0.5) * 2 * Math.PI) / t.seats;
      return { cx: RING * Math.cos(a), cy: RING * Math.sin(a) };
    });
    return { w: size, h: size, surfaceW: 2 * TABLE_R, surfaceH: 2 * TABLE_R, seats };
  }
  const perRow = Math.ceil(t.seats / 2);
  const tableW = perRow * LONG_PITCH;
  const rowY = LONG_H / 2 + 0.1 + SEAT_D / 2;
  const seats = Array.from({ length: t.seats }, (_, k) => {
    const top = k < perRow;
    const idx = top ? k : k - perRow;
    const count = top ? perRow : t.seats - perRow;
    return { cx: (idx - (count - 1) / 2) * LONG_PITCH, cy: top ? -rowY : rowY };
  });
  return { w: tableW + 0.6, h: 2 * rowY + SEAT_D + 0.1, surfaceW: tableW, surfaceH: LONG_H, seats };
}

const pct = (n: number) => `${n}%`;

export function Room() {
  const {
    seatMap,
    placements,
    selectedTable,
    activeGuest,
    flaggedTables,
    flaggedGuests,
    draggingId,
    place,
    setDragging,
    tapSeat,
    tapTable,
  } = usePlan();
  const [over, setOver] = useState<string | null>(null);

  const allow = (e: DragEvent) => {
    if (draggingId) e.preventDefault();
  };

  const drop = (e: DragEvent, tableId: string, seat?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = draggingId ?? e.dataTransfer.getData("text/plain");
    setOver(null);
    setDragging(null);
    if (id) place(id, tableId, seat);
  };

  return (
    <div className={classes.scroller} role="region" aria-label="Room plan, 24 by 14 metres. Scrolls sideways on narrow screens." tabIndex={0}>
      <div className={classes.room}>
        {FIXTURES.map((f) => (
          <div
            key={f.id}
            className={classes.fixture}
            data-kind={f.kind}
            style={{ left: pct((f.x / W) * 100), top: pct((f.y / D) * 100), width: pct((f.w / W) * 100), height: pct((f.h / D) * 100) }}
          >
            {f.label}
          </div>
        ))}

        {TABLES.map((t) => {
          const g = geometry(t);
          const row = seatMap[t.id] ?? [];
          const filled = row.filter(Boolean).length;
          const flagged = flaggedTables[t.id] ?? 0;
          const selected = selectedTable === t.id;
          const tableLabel = `${t.name}, ${filled} of ${t.seats} seats filled${flagged ? `, ${flagged} broken rule${flagged > 1 ? "s" : ""}` : ""}`;
          return (
            <div
              key={t.id}
              className={classes.wrap}
              style={{
                left: pct((t.x / W) * 100),
                top: pct((t.y / D) * 100),
                width: pct((g.w / W) * 100),
                aspectRatio: `${g.w} / ${g.h}`,
              }}
              onDragOver={allow}
              onDragEnter={() => draggingId && setOver(t.id)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(null);
              }}
              onDrop={(e) => drop(e, t.id)}
            >
              <button
                type="button"
                className={classes.surface}
                data-shape={t.shape}
                data-selected={selected}
                data-flagged={flagged > 0}
                data-over={over === t.id}
                aria-label={tableLabel}
                aria-pressed={selected}
                onClick={() => tapTable(t.id)}
                style={{
                  left: "50%",
                  top: "50%",
                  width: pct((g.surfaceW / g.w) * 100),
                  height: pct((g.surfaceH / g.h) * 100),
                  aspectRatio: t.shape === "round" ? "1" : undefined,
                }}
              >
                <span className={classes.tName}>{t.name}</span>
                <span className={classes.tCount}>
                  {filled}/{t.seats}
                </span>
                {flagged > 0 && (
                  <span className={classes.flag} aria-hidden>
                    !
                  </span>
                )}
              </button>

              {g.seats.map((pos, i) => {
                const guestId = row[i] ?? null;
                const guest = guestId ? GUESTS_BY_ID[guestId] : undefined;
                const key = `${t.id}:${i}`;
                const style: CSSProperties & Record<string, string | number | undefined> = {
                  left: pct((0.5 + pos.cx / g.w) * 100),
                  top: pct((0.5 + pos.cy / g.h) * 100),
                  width: pct((SEAT_D / g.w) * 100),
                };
                if (guest) style["--seat-color"] = `var(--mantine-color-${partyColor(guest.party)}-${partyShade(guest.party)})`;
                const label = guest
                  ? `${t.name}, seat ${i + 1}: ${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${activeGuest === guest.id ? ", selected" : ""}`
                  : `${t.name}, seat ${i + 1}: empty${activeGuest ? `, place ${GUESTS_BY_ID[activeGuest]?.name ?? "guest"} here` : ""}`;
                return (
                  <button
                    key={key}
                    type="button"
                    className={classes.seat}
                    style={style}
                    data-state={guest ? "filled" : "empty"}
                    data-active={guestId !== null && activeGuest === guestId}
                    data-flag={guestId !== null && flaggedGuests.has(guestId) && (flaggedTables[t.id] ?? 0) > 0}
                    data-over={over === key}
                    aria-label={label}
                    title={guest ? `${guest.name}${guest.diet ? ` (${guest.diet})` : ""}` : `Empty seat ${i + 1}`}
                    draggable={guest !== undefined}
                    onClick={() => tapSeat(t.id, i)}
                    onDragStart={(e) => {
                      if (!guestId) return;
                      e.dataTransfer.setData("text/plain", guestId);
                      e.dataTransfer.effectAllowed = "move";
                      setDragging(guestId);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOver(null);
                    }}
                    onDragOver={allow}
                    onDragEnter={(e) => {
                      if (draggingId) {
                        e.stopPropagation();
                        setOver(key);
                      }
                    }}
                    onDrop={(e) => drop(e, t.id, i)}
                  >
                    {guest ? initials(guest.name) : i + 1}
                    {guest?.diet ? <span className={classes.dot} aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Used by the panel to remember where each guest sits without re-deriving it. */
export function seatLabel(placements: Record<string, { table: string; seat: number } | null>, guestId: string): string | null {
  const p = placements[guestId];
  if (!p) return null;
  const t = TABLES.find((x) => x.id === p.table);
  return t ? `${t.name}, seat ${p.seat + 1}` : null;
}
```

```tsx components/GuestCard.tsx
"use client";

import { ActionIcon, Avatar, Badge, Box, Group, Menu, Paper, Text, UnstyledButton } from "@mantine/core";
import { IconArrowsExchange, IconGripVertical, IconUserMinus } from "@tabler/icons-react";
import { RSVP_COLOR, RSVP_LABEL, TABLES, TABLES_BY_ID, initials, partyColor, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";

export function MoveMenu({ guest }: { guest: Guest }) {
  const { placements, seatMap, place, unseat } = usePlan();
  const current = placements[guest.id];
  return (
    <Menu position="bottom-end" shadow="md" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size={36} aria-label={`Move or unseat ${guest.name}`}>
          <IconArrowsExchange size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{current ? `Move from ${TABLES_BY_ID[current.table]?.name}` : "Seat at"}</Menu.Label>
        {TABLES.map((t) => {
          const free = (seatMap[t.id] ?? []).filter((s) => s === null).length;
          const here = current?.table === t.id;
          return (
            <Menu.Item
              key={t.id}
              disabled={here || free === 0}
              onClick={() => place(guest.id, t.id)}
              rightSection={
                <Text size="xs" c="dimmed">
                  {here ? "here" : `${free} free`}
                </Text>
              }
            >
              {t.name}
            </Menu.Item>
          );
        })}
        {current && (
          <>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconUserMinus size={16} />} onClick={() => unseat(guest.id)}>
              Unseat
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export function GuestCard({ guest, showSeat }: { guest: Guest; showSeat?: string | null }) {
  const { activeGuest, setActiveGuest, setDragging } = usePlan();
  const active = activeGuest === guest.id;
  return (
    <Paper
      withBorder
      radius="md"
      p={6}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(guest.id);
      }}
      onDragEnd={() => setDragging(null)}
      style={{
        borderColor: active ? "var(--mantine-primary-color-filled)" : undefined,
        boxShadow: active ? "0 0 0 2px var(--mantine-primary-color-light)" : undefined,
      }}
    >
      <Group wrap="nowrap" gap={4}>
        <IconGripVertical size={16} color="var(--mantine-color-dimmed)" aria-hidden style={{ flexShrink: 0 }} />
        <UnstyledButton
          onClick={() => setActiveGuest(active ? null : guest.id)}
          aria-pressed={active}
          aria-label={`${active ? "Deselect" : "Pick up"} ${guest.name}`}
          style={{ flex: 1, minWidth: 0, minHeight: 40 }}
        >
          <Group wrap="nowrap" gap="xs">
            <Avatar size={32} radius="xl" color={partyColor(guest.party)} variant="filled">
              {initials(guest.name)}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {guest.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {showSeat ?? guest.party}
              </Text>
            </Box>
          </Group>
        </UnstyledButton>
        <Group gap={4} wrap="nowrap" visibleFrom="xs">
          {guest.diet && (
            <Badge size="sm" variant="light" color="yellow">
              {guest.diet}
            </Badge>
          )}
          {guest.rsvp !== "yes" && (
            <Badge size="sm" variant="light" color={RSVP_COLOR[guest.rsvp]}>
              {RSVP_LABEL[guest.rsvp]}
            </Badge>
          )}
        </Group>
        <MoveMenu guest={guest} />
      </Group>
    </Paper>
  );
}
```

```tsx components/SidePanel.tsx
"use client";

import { useState } from "react";
import { ActionIcon, Alert, Badge, Box, Button, Group, Paper, Stack, Tabs, Text, Title } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconUserMinus,
  IconX,
} from "@tabler/icons-react";
import { GUESTS_BY_ID, TABLES_BY_ID } from "@/lib/data";
import { usePlan, type PanelTab } from "@/lib/plan";
import type { RuleResult } from "@/lib/rules";
import { GuestCard, MoveMenu } from "./GuestCard";
import classes from "./room.module.css";

function ToSeat() {
  const { unseatedAttending, unseatedUnconfirmed, draggingId, unseat, placements, setDragging } = usePlan();
  const [over, setOver] = useState(false);
  const canDrop = draggingId !== null && placements[draggingId] != null;
  return (
    <Stack
      gap="md"
      className={classes.dropzone}
      data-dragging={canDrop}
      data-over={over && canDrop}
      onDragOver={(e) => {
        if (canDrop) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = draggingId ?? e.dataTransfer.getData("text/plain");
        setDragging(null);
        if (id) unseat(id);
      }}
    >
      {canDrop && (
        <Text size="sm" fw={600} ta="center" c="teal" py="xs">
          Drop here to unseat
        </Text>
      )}
      <Box>
        <Group justify="space-between" mb={6}>
          <Text fw={700} size="sm">
            Attending, no seat
          </Text>
          <Badge variant="light" color={unseatedAttending.length ? "orange" : "teal"}>
            {unseatedAttending.length}
          </Badge>
        </Group>
        <Stack gap={6} component="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {unseatedAttending.length === 0 && (
            <Text size="sm" c="dimmed" component="li">
              Everyone attending has a seat.
            </Text>
          )}
          {unseatedAttending.map((g) => (
            <li key={g.id}>
              <GuestCard guest={g} />
            </li>
          ))}
        </Stack>
      </Box>
      {unseatedUnconfirmed.length > 0 && (
        <Box>
          <Group justify="space-between" mb={2}>
            <Text fw={700} size="sm">
              Not confirmed yet
            </Text>
            <Badge variant="light" color="gray">
              {unseatedUnconfirmed.length}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mb={6}>
            Maybe or no reply. They can be pencilled in, but are not counted as attending.
          </Text>
          <Stack gap={6} component="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {unseatedUnconfirmed.map((g) => (
              <li key={g.id}>
                <GuestCard guest={g} />
              </li>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function RuleIcon({ status }: { status: RuleResult["status"] }) {
  if (status === "broken") return <IconAlertTriangle size={18} color="var(--mantine-color-red-filled)" aria-hidden />;
  if (status === "ok") return <IconCheck size={18} color="var(--mantine-color-teal-filled)" aria-hidden />;
  return <IconClock size={18} color="var(--mantine-color-dimmed)" aria-hidden />;
}

const STATUS_TEXT: Record<RuleResult["status"], string> = {
  broken: "Broken",
  ok: "Met",
  pending: "Waiting for seats",
};

const KIND_TEXT: Record<RuleResult["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

function Rules() {
  const { rules, selectTable } = usePlan();
  const order = { broken: 0, pending: 1, ok: 2 } as const;
  const sorted = [...rules].sort((a, b) => order[a.status] - order[b.status]);
  return (
    <Stack gap="xs" component="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {sorted.map((r) => (
        <li key={r.id}>
          <Paper
            withBorder
            radius="md"
            p="sm"
            style={{ borderColor: r.status === "broken" ? "var(--mantine-color-red-filled)" : undefined }}
          >
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <Box mt={2}>
                <RuleIcon status={r.status} />
              </Box>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap={6} mb={2}>
                  <Badge size="xs" variant="outline" color="gray">
                    {KIND_TEXT[r.kind]}
                  </Badge>
                  <Text size="xs" c={r.status === "broken" ? "red" : "dimmed"} fw={600}>
                    {STATUS_TEXT[r.status]}
                  </Text>
                </Group>
                <Text size="sm" fw={600}>
                  {r.headline}
                </Text>
                <Text size="sm" c="dimmed">
                  {r.detail}
                </Text>
                <Text size="xs" c="dimmed" fs="italic" mt={4}>
                  Couple&apos;s note: {r.note}
                </Text>
                {r.tableIds.length > 0 && (
                  <Group gap={6} mt={6}>
                    {r.tableIds.map((id) => (
                      <Button key={id} size="compact-xs" variant="light" color="gray" onClick={() => selectTable(id)}>
                        Show {TABLES_BY_ID[id]?.name}
                      </Button>
                    ))}
                  </Group>
                )}
              </Box>
            </Group>
          </Paper>
        </li>
      ))}
    </Stack>
  );
}

function TableDetail() {
  const { selectedTable, seatMap, rules, activeGuest, place, unseat, selectTable } = usePlan();
  const table = selectedTable ? TABLES_BY_ID[selectedTable] : undefined;
  if (!table) {
    return (
      <Text size="sm" c="dimmed" py="md" ta="center">
        Select a table on the plan to see who sits there and what they eat.
      </Text>
    );
  }
  const row = seatMap[table.id] ?? [];
  const guests = row.map((id) => (id ? GUESTS_BY_ID[id] : undefined));
  const seated = guests.filter((g): g is NonNullable<typeof g> => g !== undefined);
  const broken = rules.filter((r) => r.status === "broken" && r.tableIds.includes(table.id));
  const diets = new Map<string, number>();
  for (const g of seated) {
    const key = g.diet ?? "No dietary need";
    diets.set(key, (diets.get(key) ?? 0) + 1);
  }
  const dietList = Array.from(diets.entries()).sort((a, b) => {
    if (a[0] === "No dietary need") return 1;
    if (b[0] === "No dietary need") return -1;
    return a[0].localeCompare(b[0]);
  });
  const active = activeGuest ? GUESTS_BY_ID[activeGuest] : undefined;
  return (
    <Stack gap="sm">
      <Group justify="space-between" wrap="nowrap">
        <Box>
          <Title order={3} size="h4">
            {table.name}
          </Title>
          <Text size="sm" c="dimmed">
            {seated.length} of {table.seats} seats filled
            {row.length - seated.length > 0 ? `, ${row.length - seated.length} free` : ", full"}
          </Text>
        </Box>
        <ActionIcon variant="subtle" color="gray" size={36} aria-label="Close table details" onClick={() => selectTable(null)}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      {broken.map((r) => (
        <Alert key={r.id} color="red" variant="light" icon={<IconAlertTriangle size={18} />} p="xs" title={r.headline}>
          <Text size="xs">{r.detail}</Text>
        </Alert>
      ))}

      <Box>
        <Text fw={700} size="sm" mb={6}>
          Dietary needs
        </Text>
        {seated.length === 0 ? (
          <Text size="sm" c="dimmed">
            Nobody seated here yet.
          </Text>
        ) : (
          <Group gap={6}>
            {dietList.map(([diet, n]) => (
              <Badge
                key={diet}
                variant={diet === "No dietary need" ? "outline" : "light"}
                color={diet === "No dietary need" ? "gray" : "yellow"}
                size="md"
              >
                {n} {diet}
              </Badge>
            ))}
          </Group>
        )}
      </Box>

      <Box>
        <Text fw={700} size="sm" mb={6}>
          Seats
        </Text>
        <Stack gap={6} component="ol" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {guests.map((g, i) => (
            <li key={`${table.id}-${i}`}>
              {g ? (
                <Paper withBorder radius="md" p="xs">
                  <Group wrap="nowrap" gap="xs">
                    <Text size="xs" c="dimmed" w={18} ta="center" aria-label={`Seat ${i + 1}`}>
                      {i + 1}
                    </Text>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={600} truncate>
                        {g.name}
                      </Text>
                      <Group gap={6}>
                        <Text size="xs" c="dimmed">
                          {g.party}
                        </Text>
                        {g.diet && (
                          <Badge size="xs" variant="light" color="yellow">
                            {g.diet}
                          </Badge>
                        )}
                      </Group>
                    </Box>
                    <ActionIcon variant="subtle" color="red" size={36} aria-label={`Unseat ${g.name}`} onClick={() => unseat(g.id)}>
                      <IconUserMinus size={18} />
                    </ActionIcon>
                    <MoveMenu guest={g} />
                  </Group>
                </Paper>
              ) : (
                <Paper radius="md" p="xs" style={{ border: "1px dashed var(--mantine-color-default-border)" }}>
                  <Group wrap="nowrap" gap="xs" justify="space-between">
                    <Group gap="xs" wrap="nowrap">
                      <Text size="xs" c="dimmed" w={18} ta="center" aria-label={`Seat ${i + 1}`}>
                        {i + 1}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Empty seat
                      </Text>
                    </Group>
                    {active && (
                      <Button size="compact-sm" variant="light" onClick={() => place(active.id, table.id, i)}>
                        Seat {active.name.split(" ")[0]} here
                      </Button>
                    )}
                  </Group>
                </Paper>
              )}
            </li>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export function SidePanel() {
  const { tab, setTab, unseatedAttending, brokenRules } = usePlan();
  return (
    <Paper withBorder radius="md" p="sm">
      <Tabs value={tab} onChange={(v) => v && setTab(v as PanelTab)} keepMounted={false}>
        <Tabs.List grow mb="sm">
          <Tabs.Tab value="seat" rightSection={<Badge size="xs" circle variant="light" color="orange">{unseatedAttending.length}</Badge>}>
            To seat
          </Tabs.Tab>
          <Tabs.Tab
            value="rules"
            rightSection={
              <Badge size="xs" circle variant={brokenRules.length ? "filled" : "light"} color={brokenRules.length ? "red" : "teal"}>
                {brokenRules.length}
              </Badge>
            }
          >
            Rules
          </Tabs.Tab>
          <Tabs.Tab value="table">Table</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="seat">
          <ToSeat />
        </Tabs.Panel>
        <Tabs.Panel value="rules">
          <Rules />
        </Tabs.Panel>
        <Tabs.Panel value="table">
          <TableDetail />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
```

```tsx components/PlannerView.tsx
"use client";

import { useEffect } from "react";
import { Alert, Box, Button, Container, Grid, Group, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";
import { EVENT, GUESTS_BY_ID, PARTIES, partyColor, partyShade } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { Room } from "./Room";
import { SidePanel } from "./SidePanel";

function Stat({ label, value, hint, color }: { label: string; value: string; hint: string; color?: string }) {
  return (
    <Paper withBorder radius="md" p="sm">
      <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.04em" }}>
        {label}
      </Text>
      <Text fz={28} fw={800} lh={1.1} c={color}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">
        {hint}
      </Text>
    </Paper>
  );
}

export function PlannerView() {
  const {
    seatedCount,
    totalSeats,
    attendingCount,
    unseatedAttending,
    unseatedUnconfirmed,
    brokenRules,
    rules,
    activeGuest,
    setActiveGuest,
    unseat,
    placements,
    announcement,
    selectTable,
  } = usePlan();

  useEffect(() => {
    if (!activeGuest) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveGuest(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeGuest, setActiveGuest]);

  const active = activeGuest ? GUESTS_BY_ID[activeGuest] : undefined;
  const pendingCount = rules.filter((r) => r.status === "pending").length;

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" align="flex-end" mb="sm" gap="xs">
        <Box>
          <Title order={1} size="h2">
            Seating plan
          </Title>
          <Text size="sm" c="dimmed">
            {EVENT.venue}, {EVENT.room_m.width} × {EVENT.room_m.depth} m. Tap a guest, then a seat or table, or drag.
          </Text>
        </Box>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm" mb="sm">
        <Stat label="Seated" value={String(seatedCount)} hint={`of ${attendingCount} attending`} />
        <Stat
          label="Unseated"
          value={String(unseatedAttending.length)}
          hint={unseatedUnconfirmed.length ? `+ ${unseatedUnconfirmed.length} not confirmed` : "attending without a seat"}
          color={unseatedAttending.length ? "orange" : "teal"}
        />
        <Stat label="Free seats" value={String(totalSeats - seatedCount)} hint={`of ${totalSeats} across 7 tables`} />
        <Stat
          label="Rules"
          value={brokenRules.length ? `${brokenRules.length} broken` : "All clear"}
          hint={`${rules.length - brokenRules.length - pendingCount} met, ${pendingCount} waiting`}
          color={brokenRules.length ? "red" : "teal"}
        />
      </SimpleGrid>

      {brokenRules.length > 0 ? (
        <Alert
          mb="sm"
          color="red"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title={`${brokenRules.length} rule${brokenRules.length > 1 ? "s" : ""} broken`}
        >
          <Box component="ul" m={0} pl="md">
            {brokenRules.map((r) => (
              <li key={r.id}>
                <Text size="sm" component="span">
                  {r.headline}.{" "}
                </Text>
                {r.tableIds[0] && (
                  <Button size="compact-xs" variant="subtle" color="red" onClick={() => selectTable(r.tableIds[0] ?? null)}>
                    Show table
                  </Button>
                )}
              </li>
            ))}
          </Box>
        </Alert>
      ) : (
        <Alert mb="sm" color="teal" variant="light" icon={<IconCircleCheck size={18} />} title="No broken rules">
          {pendingCount > 0 ? `${pendingCount} rule${pendingCount > 1 ? "s" : ""} will be checked once those guests are seated.` : "Every rule of the couple is met."}
        </Alert>
      )}

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          {active && (
            <Paper
              withBorder
              radius="md"
              p="xs"
              mb="sm"
              role="status"
              style={{ borderColor: "var(--mantine-primary-color-filled)", background: "var(--mantine-primary-color-light)" }}
            >
              <Group justify="space-between" gap="xs">
                <Group gap="xs">
                  <IconInfoCircle size={18} aria-hidden />
                  <Text size="sm">
                    <b>{active.name}</b> is picked up. {placements[active.id] ? "Tap another seat to move or swap, or a table for its first free seat." : "Tap a seat, or a table for its first free seat."}
                  </Text>
                </Group>
                <Group gap={6}>
                  {placements[active.id] && (
                    <Button size="compact-sm" variant="default" onClick={() => unseat(active.id)}>
                      Unseat
                    </Button>
                  )}
                  <Button size="compact-sm" variant="filled" onClick={() => setActiveGuest(null)}>
                    Cancel
                  </Button>
                </Group>
              </Group>
            </Paper>
          )}
          <Room />
          <Group gap="md" mt="xs" component="ul" aria-label="Legend" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {PARTIES.map((p) => (
              <Group key={p} gap={6} component="li">
                <Box
                  w={12}
                  h={12}
                  aria-hidden
                  style={{ borderRadius: "50%", background: `var(--mantine-color-${partyColor(p)}-${partyShade(p)})` }}
                />
                <Text size="xs" c="dimmed">
                  {p}
                </Text>
              </Group>
            ))}
            <Group gap={6} component="li">
              <Box w={12} h={12} aria-hidden style={{ borderRadius: "50%", background: "var(--mantine-color-yellow-5)" }} />
              <Text size="xs" c="dimmed">
                Dietary need
              </Text>
            </Group>
            <Group gap={6} component="li">
              <Box w={12} h={12} aria-hidden style={{ borderRadius: "50%", boxShadow: "0 0 0 2px var(--mantine-color-red-filled)" }} />
              <Text size="xs" c="dimmed">
                Broken rule
              </Text>
            </Group>
          </Group>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <SidePanel />
        </Grid.Col>
      </Grid>

      <Box
        aria-live="polite"
        role="status"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
      >
        {announcement}
      </Box>
    </Container>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Progress,
  Select,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconCopy, IconSearch } from "@tabler/icons-react";
import {
  DIETS,
  GUESTS,
  PARTIES,
  RSVP_COLOR,
  RSVP_LABEL,
  TABLES_BY_ID,
  initials,
  partyColor,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";

const STANDARD = "Standard menu";

export function GuestsView() {
  const { placements } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [seating, setSeating] = useState<string | null>(null);
  const [mealScope, setMealScope] = useState<string>("confirmed");
  const clipboard = useClipboard({ timeout: 1800 });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      if (party && g.party !== party) return false;
      if (rsvp && g.rsvp !== rsvp) return false;
      if (diet === "none" && g.diet !== null) return false;
      if (diet && diet !== "none" && diet !== "any" && g.diet !== diet) return false;
      if (diet === "any" && g.diet === null) return false;
      if (seating === "seated" && !placements[g.id]) return false;
      if (seating === "unseated" && placements[g.id]) return false;
      return true;
    });
  }, [query, party, rsvp, diet, seating, placements]);

  const meals = useMemo(() => {
    const counted = GUESTS.filter((g) =>
      mealScope === "confirmed" ? g.rsvp === "yes" : g.rsvp === "yes" || g.rsvp === "maybe" || g.rsvp === "pending",
    );
    const map = new Map<string, number>();
    map.set(STANDARD, 0);
    for (const d of DIETS) map.set(d, 0);
    for (const g of counted) {
      const key = g.diet ?? STANDARD;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return { total: counted.length, list: Array.from(map.entries()).filter(([, n]) => n > 0) };
  }, [mealScope]);

  const mealText = [
    `Meal counts for ${mealScope === "confirmed" ? "confirmed guests" : "confirmed and undecided guests"}`,
    ...meals.list.map(([k, n]) => `${k}: ${n}`),
    `Total: ${meals.total}`,
  ].join("\n");

  const filtersActive = Boolean(query || party || rsvp || diet || seating);

  return (
    <Container size="xl" py="md">
      <Box mb="sm">
        <Title order={1} size="h2">
          Guest list
        </Title>
        <Text size="sm" c="dimmed">
          {GUESTS.length} invited. Seating here follows the plan as you change it.
        </Text>
      </Box>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
          <Paper withBorder radius="md" p="sm">
            <Stack gap="sm">
              <TextInput
                aria-label="Search guests by name"
                placeholder="Search by name"
                leftSection={<IconSearch size={16} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
              <Group gap="xs" grow align="flex-end">
                <Select
                  aria-label="Filter by party"
                  placeholder="All parties"
                  data={PARTIES}
                  value={party}
                  onChange={setParty}
                  clearable
                  style={{ minWidth: 150 }}
                />
                <Select
                  aria-label="Filter by RSVP"
                  placeholder="Any RSVP"
                  data={(Object.keys(RSVP_LABEL) as Rsvp[]).map((k) => ({ value: k, label: RSVP_LABEL[k] }))}
                  value={rsvp}
                  onChange={setRsvp}
                  clearable
                  style={{ minWidth: 130 }}
                />
                <Select
                  aria-label="Filter by diet"
                  placeholder="Any diet"
                  data={[
                    { value: "any", label: "Any dietary need" },
                    { value: "none", label: "No dietary need" },
                    ...DIETS.map((d) => ({ value: d, label: d })),
                  ]}
                  value={diet}
                  onChange={setDiet}
                  clearable
                  style={{ minWidth: 150 }}
                />
                <Select
                  aria-label="Filter by seating"
                  placeholder="Seated or not"
                  data={[
                    { value: "seated", label: "Seated" },
                    { value: "unseated", label: "Not seated" },
                  ]}
                  value={seating}
                  onChange={setSeating}
                  clearable
                  style={{ minWidth: 130 }}
                />
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed" role="status" aria-live="polite">
                  Showing {rows.length} of {GUESTS.length} guests
                </Text>
                {filtersActive && (
                  <Button
                    size="compact-sm"
                    variant="subtle"
                    onClick={() => {
                      setQuery("");
                      setParty(null);
                      setRsvp(null);
                      setDiet(null);
                      setSeating(null);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </Group>
            </Stack>

            <Table.ScrollContainer minWidth={620} mt="xs">
              <Table highlightOnHover verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Guest</Table.Th>
                    <Table.Th>Party</Table.Th>
                    <Table.Th>RSVP</Table.Th>
                    <Table.Th>Diet</Table.Th>
                    <Table.Th>Table</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((g) => {
                    const seat = placements[g.id];
                    return (
                      <Table.Tr key={g.id}>
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap">
                            <Avatar size={28} radius="xl" color={partyColor(g.party)} variant="filled">
                              {initials(g.name)}
                            </Avatar>
                            <Text size="sm" fw={600}>
                              {g.name}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{g.party}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color={RSVP_COLOR[g.rsvp]}>
                            {RSVP_LABEL[g.rsvp]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {g.diet ? (
                            <Badge variant="light" color="yellow">
                              {g.diet}
                            </Badge>
                          ) : (
                            <Text size="sm" c="dimmed">
                              None
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {seat ? (
                            <Text size="sm">
                              {TABLES_BY_ID[seat.table]?.name}
                              <Text span size="xs" c="dimmed">
                                {" "}
                                seat {seat.seat + 1}
                              </Text>
                            </Text>
                          ) : (
                            <Text size="sm" c={g.rsvp === "yes" ? "orange" : "dimmed"} fw={g.rsvp === "yes" ? 600 : 400}>
                              {g.rsvp === "no" ? "Not coming" : "Unseated"}
                            </Text>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text ta="center" c="dimmed" py="lg" size="sm">
                          No guests match these filters.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="xs" wrap="nowrap" align="flex-start">
              <Box>
                <Title order={2} size="h4">
                  Meals for the caterer
                </Title>
                <Text size="xs" c="dimmed">
                  One meal per guest, dietary needs included. Not affected by the filters.
                </Text>
              </Box>
              <Button
                size="compact-sm"
                variant="light"
                color={clipboard.copied ? "teal" : undefined}
                leftSection={clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                onClick={() => clipboard.copy(mealText)}
              >
                {clipboard.copied ? "Copied" : "Copy"}
              </Button>
            </Group>
            <SegmentedControl
              fullWidth
              size="xs"
              mb="sm"
              value={mealScope}
              onChange={setMealScope}
              aria-label="Which guests to count"
              data={[
                { value: "confirmed", label: "Confirmed" },
                { value: "all", label: "Incl. maybe and no reply" },
              ]}
            />
            <Stack gap="xs" component="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {meals.list.map(([k, n]) => (
                <li key={k}>
                  <Group justify="space-between" mb={2} wrap="nowrap">
                    <Text size="sm" fw={k === STANDARD ? 700 : 500}>
                      {k}
                    </Text>
                    <Text size="sm" fw={700} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {n}
                    </Text>
                  </Group>
                  <Progress
                    value={(n / Math.max(meals.total, 1)) * 100}
                    size="sm"
                    color={k === STANDARD ? "indigo" : "yellow"}
                    aria-label={`${k}: ${n} of ${meals.total}`}
                  />
                </li>
              ))}
            </Stack>
            <Group justify="space-between" mt="md" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
              <Text fw={700}>Total meals</Text>
              <Text fw={800} fz="lg">
                {meals.total}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
```

```tsx app/guests/page.tsx
import { GuestsView } from "@/components/GuestsView";

export default function GuestsPage() {
  return <GuestsView />;
}
```

```tsx app/page.tsx
import { PlannerView } from "@/components/PlannerView";

export default function Page() {
  return <PlannerView />;
}
```

```tsx app/layout.tsx
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Shell } from "@/components/Shell";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Seatwise: seating plans for weddings and events",
  description: "Build the seating plan for Ines & Mateo's wedding dinner and hand it to the venue and the caterer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />
            <Shell>{children}</Shell>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```ts app/theme.ts
import { createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "800" },
  primaryColor: "indigo",
  defaultRadius: "md",
});
```
