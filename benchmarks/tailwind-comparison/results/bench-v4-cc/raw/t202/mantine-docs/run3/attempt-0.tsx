```ts lib/data.ts
export type Rsvp = "yes" | "maybe" | "pending" | "no";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface Fixture {
  id: string;
  kind: "stage" | "dancefloor" | "bar" | "door";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TableDef {
  id: string;
  name: string;
  shape: "long" | "round";
  seats: number;
  x: number;
  y: number;
  rotation?: number;
}

export interface Rule {
  kind: "together" | "apart" | "near";
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

function g(
  id: string,
  name: string,
  party: string,
  rsvp: Rsvp,
  diet: string | null,
  table: string | null,
): Guest {
  return { id, name, party, rsvp, diet, table };
}

export const GUESTS: Guest[] = [
  g("g-01", "Ines Carvalho", "Couple", "yes", null, "t-head"),
  g("g-02", "Mateo Alvarez", "Couple", "yes", "Vegetarian", "t-head"),
  g("g-03", "Rui Carvalho", "Bride's family", "yes", null, "t-head"),
  g("g-04", "Marta Carvalho", "Bride's family", "yes", "Gluten free", "t-head"),
  g("g-05", "Javier Alvarez", "Groom's family", "yes", null, "t-head"),
  g("g-06", "Lucia Alvarez", "Groom's family", "yes", null, "t-head"),
  g("g-07", "Sofia Carvalho", "Bride's family", "yes", null, "t-1"),
  g("g-08", "Tiago Carvalho", "Bride's family", "yes", null, "t-1"),
  g("g-09", "Avó Rosa Carvalho", "Bride's family", "yes", "Soft food", "t-1"),
  g("g-10", "Pedro Nunes", "Bride's family", "yes", null, "t-1"),
  g("g-11", "Ana Nunes", "Bride's family", "yes", "Vegan", "t-1"),
  g("g-12", "Carmen Alvarez", "Groom's family", "yes", null, "t-4"),
  g("g-13", "Diego Alvarez", "Groom's family", "yes", null, "t-4"),
  g("g-14", "Elena Ruiz", "Groom's family", "yes", "Nut allergy", "t-4"),
  g("g-15", "Pablo Ruiz", "Groom's family", "yes", null, "t-4"),
  g("g-16", "Isabel Ruiz", "Groom's family", "maybe", null, null),
  g("g-17", "Chloe Martin", "University friends", "yes", null, "t-2"),
  g("g-18", "Ben Okafor", "University friends", "yes", null, "t-2"),
  g("g-19", "Leila Haddad", "University friends", "yes", "Halal", "t-2"),
  g("g-20", "Omar Haddad", "University friends", "yes", "Halal", "t-2"),
  g("g-21", "Freya Lund", "University friends", "yes", "Vegetarian", null),
  g("g-22", "Jonas Lund", "University friends", "yes", null, null),
  g("g-23", "Grace Lee", "Work friends", "yes", null, "t-5"),
  g("g-24", "Marcus Webb", "Work friends", "yes", null, "t-5"),
  g("g-25", "Nadia Petrova", "Work friends", "yes", "Pescatarian", "t-5"),
  g("g-26", "Tom Fisher", "Work friends", "no", null, null),
  g("g-27", "Hana Sato", "Work friends", "yes", null, null),
  g("g-28", "Luis Ortega", "Groom's football club", "yes", null, "t-3"),
  g("g-29", "Kai Brennan", "Groom's football club", "yes", null, "t-3"),
  g("g-30", "Sean Doyle", "Groom's football club", "yes", null, "t-3"),
  g("g-31", "Ryan Doyle", "Groom's football club", "yes", null, null),
  g("g-32", "Hugo Carvalho", "Bride's family", "yes", "Children's menu", "t-1"),
  g("g-33", "Mia Carvalho", "Bride's family", "yes", "Children's menu", null),
  g("g-34", "Paula Mendes", "Bride's family", "pending", null, null),
  g("g-35", "Victor Mendes", "Bride's family", "pending", null, null),
  g("g-36", "Zoe Bennett", "Plus-ones", "yes", null, "t-2"),
  g("g-37", "Arjun Mehta", "Plus-ones", "yes", "Vegetarian", "t-5"),
  g("g-38", "Laura Svensson", "Plus-ones", "yes", null, null),
];

export const RULES: Rule[] = [
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
  },
];
```

```ts lib/plan.ts
import {
  EVENT,
  FIXTURES,
  GUESTS,
  RULES,
  TABLES,
  type Fixture,
  type Guest,
  type Rule,
  type TableDef,
} from "./data";

export interface SeatRef {
  tableId: string;
  seat: number;
}
export type SeatMap = Record<string, SeatRef>;

export const guestById: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((guest) => [guest.id, guest]),
);
export const tableById: Record<string, TableDef> = Object.fromEntries(
  TABLES.map((table) => [table.id, table]),
);

export function initialSeats(): SeatMap {
  const next: SeatMap = {};
  const counters: Record<string, number> = {};
  for (const guest of GUESTS) {
    if (!guest.table) continue;
    const n = counters[guest.table] ?? 0;
    counters[guest.table] = n + 1;
    next[guest.id] = { tableId: guest.table, seat: n };
  }
  return next;
}

export const PARTY_COLORS: Record<string, string> = {
  Couple: "grape",
  "Bride's family": "pink",
  "Groom's family": "blue",
  "University friends": "teal",
  "Work friends": "orange",
  "Groom's football club": "green",
  "Plus-ones": "gray",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "gray";
}

export function initials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function eventDateLabel(): string {
  const [y, m, d] = EVENT.date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ---------- table geometry (metres, relative to the table centre) ---------- */

export const SEAT = 0.72;

export interface SeatPos {
  x: number;
  y: number;
}
export interface Geometry {
  w: number;
  h: number;
  bodyW: number;
  bodyH: number;
  round: boolean;
  seats: SeatPos[];
}

export function geometry(table: TableDef): Geometry {
  const n = table.seats;
  if (table.shape === "round") {
    const bodyR = n >= 8 ? 0.95 : 0.8;
    const ring = bodyR + 0.5;
    const size = (ring + SEAT / 2 + 0.05) * 2;
    const seats: SeatPos[] = [];
    for (let i = 0; i < n; i += 1) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      seats.push({ x: ring * Math.cos(angle), y: ring * Math.sin(angle) });
    }
    return { w: size, h: size, bodyW: bodyR * 2, bodyH: bodyR * 2, round: true, seats };
  }
  const perSide = Math.ceil(n / 2);
  const pitch = 1.15;
  const bodyW = perSide * pitch + 0.2;
  const bodyH = 0.9;
  const offY = bodyH / 2 + SEAT / 2 + 0.08;
  const seats: SeatPos[] = [];
  for (let i = 0; i < n; i += 1) {
    const top = i < perSide;
    const j = top ? i : i - perSide;
    seats.push({
      x: -bodyW / 2 + 0.1 + pitch * (j + 0.5),
      y: top ? -offY : offY,
    });
  }
  return {
    w: bodyW + 0.3,
    h: 2 * (offY + SEAT / 2 + 0.05),
    bodyW,
    bodyH,
    round: false,
    seats,
  };
}

/* ---------- rules ---------- */

export type RuleStatus = "ok" | "broken" | "open";

export interface RuleResult {
  index: number;
  rule: Rule;
  label: string;
  names: string[];
  status: RuleStatus;
  tableIds: string[];
  message: string;
}

const NEAR_MAX_M = 4;
const BAND_MIN_M = 6;

function centre(f: Fixture) {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}
function distance(t: TableDef, f: Fixture) {
  const c = centre(f);
  return Math.hypot(t.x - c.x, t.y - c.y);
}

export function evaluateRules(seats: SeatMap): RuleResult[] {
  const door = FIXTURES.find((f) => f.kind === "door");
  const band = FIXTURES.find((f) => f.kind === "stage");

  return RULES.map((rule, index): RuleResult => {
    const people = rule.guests.map((id) => guestById[id]);
    const names = people.map((p) => p.name);
    const tables = people.map((p) => {
      const ref = seats[p.id];
      return ref ? tableById[ref.tableId] : null;
    });
    const unplaced = people.filter((_, i) => !tables[i]).map((p) => p.name);

    if (rule.kind === "near") {
      const table = tables[0];
      const label = "Seat near the garden doors";
      if (!table) {
        return {
          index,
          rule,
          label,
          names,
          status: "open",
          tableIds: [],
          message: `${names[0]} still needs a seat.`,
        };
      }
      const dDoor = door ? distance(table, door) : 0;
      const dBand = band ? distance(table, band) : Infinity;
      if (dDoor > NEAR_MAX_M) {
        return {
          index,
          rule,
          label,
          names,
          status: "broken",
          tableIds: [table.id],
          message: `${table.name} is ${dDoor.toFixed(1)} m from the garden doors (aim for ${NEAR_MAX_M} m or less).`,
        };
      }
      if (dBand < BAND_MIN_M) {
        return {
          index,
          rule,
          label,
          names,
          status: "broken",
          tableIds: [table.id],
          message: `${table.name} is only ${dBand.toFixed(1)} m from the band.`,
        };
      }
      return {
        index,
        rule,
        label,
        names,
        status: "ok",
        tableIds: [],
        message: `${table.name} is ${dDoor.toFixed(1)} m from the garden doors and ${dBand.toFixed(1)} m from the band.`,
      };
    }

    if (rule.kind === "together") {
      const label = "Keep together";
      if (unplaced.length > 0) {
        return {
          index,
          rule,
          label,
          names,
          status: "open",
          tableIds: [],
          message:
            unplaced.length === people.length
              ? "Neither has a seat yet."
              : `${unplaced.join(", ")} still needs a seat.`,
        };
      }
      const ids = tables.map((t) => (t ? t.id : ""));
      const same = ids.every((id) => id === ids[0]);
      if (same) {
        return {
          index,
          rule,
          label,
          names,
          status: "ok",
          tableIds: [],
          message: `Together at ${tables[0]?.name ?? ""}.`,
        };
      }
      return {
        index,
        rule,
        label,
        names,
        status: "broken",
        tableIds: Array.from(new Set(ids)),
        message: people.map((p, i) => `${p.name} at ${tables[i]?.name ?? ""}`).join(", ") + ".",
      };
    }

    // apart
    const label = "Keep apart";
    const placedIds = tables.filter((t): t is TableDef => t !== null).map((t) => t.id);
    const clash = placedIds.find((id, i) => placedIds.indexOf(id) !== i);
    if (clash) {
      return {
        index,
        rule,
        label,
        names,
        status: "broken",
        tableIds: [clash],
        message: `Both are at ${tableById[clash].name}.`,
      };
    }
    return {
      index,
      rule,
      label,
      names,
      status: "ok",
      tableIds: [],
      message:
        unplaced.length > 0
          ? `Not at the same table (${unplaced.join(", ")} not seated yet).`
          : "At different tables.",
    };
  });
}

/* ---------- meals for the caterer ---------- */

export const STANDARD_MEAL = "Standard menu";
const DIET_ORDER = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Halal",
  "Gluten free",
  "Nut allergy",
  "Soft food",
  "Children's menu",
];

export interface MealRow {
  meal: string;
  special: boolean;
  confirmed: number;
  unconfirmed: number;
  seated: number;
}

export function mealCounts(seats: SeatMap): MealRow[] {
  const known = new Set([STANDARD_MEAL, ...DIET_ORDER]);
  const extra = Array.from(
    new Set(GUESTS.map((x) => x.diet).filter((d): d is string => !!d && !known.has(d))),
  );
  const keys = [STANDARD_MEAL, ...DIET_ORDER, ...extra];
  return keys
    .map((meal) => {
      const list = GUESTS.filter((x) => (x.diet ?? STANDARD_MEAL) === meal);
      return {
        meal,
        special: meal !== STANDARD_MEAL,
        confirmed: list.filter((x) => x.rsvp === "yes").length,
        unconfirmed: list.filter((x) => x.rsvp === "maybe" || x.rsvp === "pending").length,
        seated: list.filter((x) => seats[x.id]).length,
      };
    })
    .filter((row) => row.confirmed + row.unconfirmed > 0);
}
```

```tsx components/PlanProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notifications } from "@mantine/notifications";
import { GUESTS, TABLES, type Guest } from "@/lib/data";
import {
  evaluateRules,
  guestById,
  initialSeats,
  tableById,
  type RuleResult,
  type SeatMap,
} from "@/lib/plan";

interface PlanContextValue {
  seats: SeatMap;
  tableSeats: Record<string, (Guest | null)[]>;
  unseated: Guest[];
  tentative: Guest[];
  stats: {
    seated: number;
    attending: number;
    unseatedAttending: number;
    capacity: number;
    free: number;
  };
  results: RuleResult[];
  flagged: Record<string, RuleResult[]>;
  selectedTableId: string | null;
  heldId: string | null;
  announcement: string;
  selectTable: (id: string | null) => void;
  hold: (id: string | null) => void;
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
}

const PlanContext = createContext<PlanContextValue | null>(null);

export function usePlan(): PlanContextValue {
  const value = useContext(PlanContext);
  if (!value) throw new Error("usePlan must be used inside PlanProvider");
  return value;
}

function byPartyThenName(a: Guest, b: Guest) {
  return a.party.localeCompare(b.party) || a.name.localeCompare(b.name);
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [seats, setSeats] = useState<SeatMap>(initialSeats);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const derived = useMemo(() => {
    const tableSeats: Record<string, (Guest | null)[]> = {};
    for (const t of TABLES) tableSeats[t.id] = Array.from({ length: t.seats }, () => null);
    for (const [gid, ref] of Object.entries(seats)) {
      const row = tableSeats[ref.tableId];
      if (row) row[ref.seat] = guestById[gid] ?? null;
    }
    const attending = GUESTS.filter((x) => x.rsvp === "yes");
    const unseated = attending.filter((x) => !seats[x.id]).sort(byPartyThenName);
    const tentative = GUESTS.filter(
      (x) => (x.rsvp === "maybe" || x.rsvp === "pending") && !seats[x.id],
    ).sort(byPartyThenName);
    const capacity = TABLES.reduce((sum, t) => sum + t.seats, 0);
    const seated = Object.keys(seats).length;
    const results = evaluateRules(seats);
    const flagged: Record<string, RuleResult[]> = {};
    for (const r of results) {
      if (r.status !== "broken") continue;
      for (const id of r.tableIds) (flagged[id] ??= []).push(r);
    }
    return {
      tableSeats,
      unseated,
      tentative,
      results,
      flagged,
      stats: {
        seated,
        attending: attending.length,
        unseatedAttending: unseated.length,
        capacity,
        free: capacity - seated,
      },
    };
  }, [seats]);

  const selectTable = useCallback((id: string | null) => setSelectedTableId(id), []);
  const hold = useCallback((id: string | null) => {
    setHeldId(id);
    if (id) {
      const guest = guestById[id];
      if (guest) setAnnouncement(`${guest.name} picked up. Choose a table or seat.`);
    }
  }, []);

  const unseat = useCallback(
    (guestId: string) => {
      const guest = guestById[guestId];
      const ref = seats[guestId];
      if (!guest || !ref) return;
      setSeats((prev) => {
        const next = { ...prev };
        delete next[guestId];
        return next;
      });
      setHeldId(null);
      setAnnouncement(`${guest.name} unseated from ${tableById[ref.tableId]?.name ?? "table"}.`);
    },
    [seats],
  );

  const place = useCallback(
    (guestId: string, tableId: string, seatIdx?: number) => {
      const guest = guestById[guestId];
      const table = tableById[tableId];
      if (!guest || !table) return;
      const cur = seats[guestId];

      const occupants = new Map<number, string>();
      for (const [gid, ref] of Object.entries(seats)) {
        if (ref.tableId === tableId) occupants.set(ref.seat, gid);
      }
      if (seatIdx !== undefined && occupants.get(seatIdx) === guestId) {
        setHeldId(null);
        return;
      }
      if (seatIdx === undefined && cur?.tableId === tableId) {
        setHeldId(null);
        setSelectedTableId(tableId);
        return;
      }

      const firstFree = (): number => {
        for (let i = 0; i < table.seats; i += 1) if (!occupants.has(i)) return i;
        return -1;
      };

      const next: SeatMap = { ...seats };
      const other = seatIdx !== undefined ? occupants.get(seatIdx) : undefined;
      let message: string;

      if (other && cur && seatIdx !== undefined) {
        next[other] = { tableId: cur.tableId, seat: cur.seat };
        next[guestId] = { tableId, seat: seatIdx };
        message = `${guest.name} and ${guestById[other]?.name ?? "guest"} swapped seats.`;
      } else {
        const target = seatIdx !== undefined && !other ? seatIdx : firstFree();
        if (target < 0) {
          notifications.show({
            color: "red",
            title: `${table.name} is full`,
            message: `All ${table.seats} seats are taken. Pick another table or unseat someone first.`,
          });
          setAnnouncement(`${table.name} is full.`);
          return;
        }
        next[guestId] = { tableId, seat: target };
        message = cur
          ? `${guest.name} moved from ${tableById[cur.tableId]?.name ?? "table"} to ${table.name}.`
          : `${guest.name} seated at ${table.name}.`;
      }

      setSeats(next);
      setHeldId(null);
      setSelectedTableId(tableId);
      setAnnouncement(message);
    },
    [seats],
  );

  const value = useMemo<PlanContextValue>(
    () => ({
      seats,
      ...derived,
      selectedTableId,
      heldId,
      announcement,
      selectTable,
      hold,
      place,
      unseat,
    }),
    [seats, derived, selectedTableId, heldId, announcement, selectTable, hold, place, unseat],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
```

```tsx components/ui.tsx
import { Badge, Box } from "@mantine/core";
import type { Rsvp } from "@/lib/data";
import { partyColor } from "@/lib/plan";

export function DietBadge({ diet }: { diet: string | null }) {
  if (!diet) return null;
  return (
    <Badge color="orange" variant="light" size="sm" radius="sm" style={{ textTransform: "none" }}>
      {diet}
    </Badge>
  );
}

const RSVP_COLOR: Record<Rsvp, string> = {
  yes: "green",
  maybe: "yellow",
  pending: "gray",
  no: "red",
};
const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <Badge color={RSVP_COLOR[rsvp]} variant="light" size="sm" style={{ textTransform: "none" }}>
      {RSVP_LABEL[rsvp]}
    </Badge>
  );
}

export function PartyDot({ party }: { party: string }) {
  const c = partyColor(party);
  return (
    <Box
      component="span"
      aria-hidden
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        flex: "none",
        background: `var(--mantine-color-${c}-3)`,
        border: `1.5px solid var(--mantine-color-${c}-7)`,
      }}
    />
  );
}
```

```tsx components/AppFrame.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Box, Button, Container, Group, Text, ThemeIcon, VisuallyHidden } from "@mantine/core";
import { IconArmchair, IconLayoutGrid, IconUsers } from "@tabler/icons-react";
import { APP_NAME, PLANNER } from "@/lib/data";
import { usePlan } from "./PlanProvider";

const NAV = [
  { href: "/", label: "Plan", icon: IconLayoutGrid },
  { href: "/guests", label: "Guests", icon: IconUsers },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { announcement } = usePlan();

  return (
    <Box mih="100dvh" style={{ background: "#f6f5f2" }}>
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--mantine-color-white)",
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Container size={1400} px="md" py={8}>
          <Group justify="space-between" wrap="wrap" gap="xs">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={34} radius="md" aria-hidden>
                <IconArmchair size={20} />
              </ThemeIcon>
              <div>
                <Text fw={700} lh={1.1}>
                  {APP_NAME}
                </Text>
                <Text size="xs" c="gray.7" lh={1.2}>
                  Seating planner
                </Text>
              </div>
            </Group>
            <Group component="nav" aria-label="Main" gap={4} wrap="nowrap">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    variant={active ? "light" : "subtle"}
                    color={active ? "fig" : "gray.8"}
                    leftSection={<Icon size={18} />}
                    size="sm"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" c="gray.8" visibleFrom="sm">
                {PLANNER.name}
              </Text>
              <Avatar color="fig" radius="xl" size={32} aria-label={PLANNER.name}>
                HB
              </Avatar>
            </Group>
          </Group>
        </Container>
      </Box>
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
      <main>{children}</main>
    </Box>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import { useMemo, useState, type CSSProperties, type DragEvent } from "react";
import { Box, Button, Group, Paper, Select, Text } from "@mantine/core";
import { IconAlertTriangle, IconUserMinus } from "@tabler/icons-react";
import { EVENT, FIXTURES, TABLES, type Fixture, type TableDef } from "@/lib/data";
import { SEAT, geometry, guestById, initials, partyColor, PARTY_COLORS } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const UNIT = 100 / EVENT.room_m.width;
const m = (metres: number) => `${(metres * UNIT).toFixed(4)}cqw`;

const CSS = `
.sw-seat{transition:box-shadow .12s ease, background-color .12s ease}
.sw-seat:hover{box-shadow:0 0 0 3px var(--mantine-color-fig-2)}
.sw-body{transition:box-shadow .12s ease, border-color .12s ease, background-color .12s ease}
.sw-body:hover{background:var(--mantine-color-fig-0)}
@media (prefers-reduced-motion: reduce){.sw-seat,.sw-body{transition:none}}
`;

function fixtureStyle(kind: Fixture["kind"]): CSSProperties {
  switch (kind) {
    case "stage":
      return {
        background: "var(--mantine-color-gray-8)",
        color: "var(--mantine-color-white)",
        borderRadius: m(0.25),
      };
    case "dancefloor":
      return {
        background:
          "repeating-conic-gradient(var(--mantine-color-fig-1) 0% 25%, var(--mantine-color-fig-0) 0% 50%) 0 0 / 1.4cqw 1.4cqw",
        color: "var(--mantine-color-fig-9)",
        border: "1.5px solid var(--mantine-color-fig-3)",
        borderRadius: m(0.2),
      };
    case "bar":
      return {
        background: "var(--mantine-color-yellow-2)",
        color: "var(--mantine-color-yellow-9)",
        border: "1.5px solid var(--mantine-color-yellow-6)",
        borderRadius: m(0.2),
      };
    case "door":
      return {
        background: "var(--mantine-color-teal-6)",
        color: "var(--mantine-color-white)",
        writingMode: "vertical-rl",
      };
  }
}

function TableView({ table }: { table: TableDef }) {
  const { tableSeats, flagged, selectedTableId, heldId, selectTable, hold, place } = usePlan();
  const geo = useMemo(() => geometry(table), [table]);
  const [over, setOver] = useState(false);

  const row = tableSeats[table.id] ?? [];
  const count = row.filter(Boolean).length;
  const issues = flagged[table.id] ?? [];
  const broken = issues.length > 0;
  const selected = selectedTableId === table.id;
  const held = heldId ? guestById[heldId] : null;
  const full = count === table.seats;

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("text/plain")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOver(true);
    }
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id && guestById[id]) place(id, table.id);
  };

  const borderColor = broken
    ? "var(--mantine-color-red-6)"
    : selected
      ? "var(--mantine-color-fig-6)"
      : over
        ? "var(--mantine-color-fig-4)"
        : "var(--mantine-color-gray-5)";
  const ring = broken
    ? "0 0 0 4px var(--mantine-color-red-1)"
    : selected
      ? "0 0 0 4px var(--mantine-color-fig-2)"
      : over
        ? "0 0 0 4px var(--mantine-color-fig-1)"
        : "none";

  const description =
    `${table.name}, ${count} of ${table.seats} seats filled` +
    (broken ? `, ${issues.length} rule${issues.length > 1 ? "s" : ""} broken` : "") +
    (held ? `. Seat ${held.name} here` : "");

  return (
    <div
      role="group"
      aria-label={table.name}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        position: "absolute",
        left: m(table.x - geo.w / 2),
        top: m(table.y - geo.h / 2),
        width: m(geo.w),
        height: m(geo.h),
        transform: table.rotation ? `rotate(${table.rotation}deg)` : undefined,
      }}
    >
      <button
        type="button"
        className="sw-body mantine-focus-auto"
        aria-pressed={selected}
        aria-label={description}
        onClick={() => (heldId ? place(heldId, table.id) : selectTable(table.id))}
        style={{
          position: "absolute",
          left: m((geo.w - geo.bodyW) / 2),
          top: m((geo.h - geo.bodyH) / 2),
          width: m(geo.bodyW),
          height: m(geo.bodyH),
          borderRadius: geo.round ? "50%" : m(0.25),
          background: over ? "var(--mantine-color-fig-0)" : "var(--mantine-color-white)",
          border: `2px solid ${borderColor}`,
          boxShadow: ring,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          color: "var(--mantine-color-gray-9)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: `max(9px, ${m(0.36)})`, lineHeight: 1.15 }}>
          {table.name}
        </span>
        <span
          style={{
            fontSize: `max(9px, ${m(0.32)})`,
            lineHeight: 1.2,
            color: full ? "var(--mantine-color-green-9)" : "var(--mantine-color-gray-7)",
            fontWeight: full ? 700 : 500,
          }}
        >
          {count}/{table.seats}
        </span>
        {broken && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -9,
              right: -9,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--mantine-color-red-6)",
              color: "white",
              display: "grid",
              placeItems: "center",
              border: "2px solid white",
            }}
          >
            <IconAlertTriangle size={13} />
          </span>
        )}
      </button>

      {geo.seats.map((pos, i) => {
        const guest = row[i] ?? null;
        const c = guest ? partyColor(guest.party) : "gray";
        const isHeld = guest !== null && guest.id === heldId;
        const label = guest
          ? `${table.name}, seat ${i + 1}: ${guest.name}${guest.diet ? `, ${guest.diet}` : ""}. ${
              isHeld ? "Picked up, press to put down" : heldId ? "Swap with picked up guest" : "Pick up to move"
            }`
          : `${table.name}, seat ${i + 1}: empty${held ? `. Seat ${held.name} here` : ""}`;
        return (
          <button
            key={i}
            type="button"
            className="sw-seat mantine-focus-auto"
            aria-label={label}
            title={guest ? guest.name : `Empty seat ${i + 1}`}
            draggable={guest !== null}
            onDragStart={(e) => {
              if (!guest) return;
              e.dataTransfer.setData("text/plain", guest.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => {
              if (guest) {
                if (isHeld) hold(null);
                else if (heldId) place(heldId, table.id, i);
                else {
                  selectTable(table.id);
                  hold(guest.id);
                }
              } else if (heldId) place(heldId, table.id, i);
              else selectTable(table.id);
            }}
            style={{
              position: "absolute",
              left: m(geo.w / 2 + pos.x - SEAT / 2),
              top: m(geo.h / 2 + pos.y - SEAT / 2),
              width: m(SEAT),
              height: m(SEAT),
              borderRadius: "50%",
              padding: 0,
              cursor: guest ? "grab" : "pointer",
              display: "grid",
              placeItems: "center",
              fontSize: `max(9px, ${m(0.3)})`,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              background: guest
                ? `var(--mantine-color-${c}-1)`
                : held
                  ? "var(--mantine-color-fig-0)"
                  : "var(--mantine-color-white)",
              color: guest ? `var(--mantine-color-${c}-9)` : "var(--mantine-color-gray-7)",
              border: guest
                ? `2px solid var(--mantine-color-${c}-6)`
                : held
                  ? "2px dashed var(--mantine-color-fig-5)"
                  : "2px dashed var(--mantine-color-gray-5)",
              boxShadow: isHeld ? "0 0 0 3px var(--mantine-color-fig-6)" : undefined,
            }}
          >
            {guest ? initials(guest.name) : <span style={{ fontWeight: 500 }}>{i + 1}</span>}
            {guest?.diet && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: "-10%",
                  right: "-10%",
                  width: "34%",
                  height: "34%",
                  borderRadius: "50%",
                  background: "var(--mantine-color-orange-6)",
                  border: "1.5px solid white",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function RoomPlan() {
  return (
    <Paper withBorder radius="lg" p="sm" shadow="xs">
      <style>{CSS}</style>
      <Box style={{ overflowX: "auto" }}>
        <Box miw={760}>
          <Box
            role="group"
            aria-label={`Room plan, ${EVENT.room_m.width} by ${EVENT.room_m.depth} metres`}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${EVENT.room_m.width} / ${EVENT.room_m.depth}`,
              containerType: "inline-size",
              overflow: "hidden",
              borderRadius: 12,
              background: "#fffdf9",
              border: "3px solid var(--mantine-color-gray-6)",
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.045) 1px, transparent 1px)",
              backgroundSize: `${m(1)} ${m(1)}`,
            }}
          >
            {FIXTURES.map((f) => (
              <div
                key={f.id}
                role="img"
                aria-label={f.label}
                style={{
                  position: "absolute",
                  left: m(f.x),
                  top: m(f.y),
                  width: m(f.w),
                  height: m(f.h),
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 600,
                  fontSize: `max(9px, ${m(0.36)})`,
                  textAlign: "center",
                  ...fixtureStyle(f.kind),
                }}
              >
                <span>{f.label}</span>
              </div>
            ))}
            {TABLES.map((t) => (
              <TableView key={t.id} table={t} />
            ))}
          </Box>
        </Box>
      </Box>
      <Group gap="md" mt="sm" wrap="wrap" align="center">
        <Text size="xs" c="gray.7">
          Drawn to scale, {EVENT.room_m.width} × {EVENT.room_m.depth} m, grid squares are 1 m.
        </Text>
        <Group gap={10} wrap="wrap" aria-label="Legend">
          {Object.keys(PARTY_COLORS).map((party) => {
            const c = partyColor(party);
            return (
              <Group key={party} gap={5} wrap="nowrap">
                <Box
                  component="span"
                  aria-hidden
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: `var(--mantine-color-${c}-1)`,
                    border: `2px solid var(--mantine-color-${c}-6)`,
                  }}
                />
                <Text size="xs" c="gray.8">
                  {party}
                </Text>
              </Group>
            );
          })}
          <Group gap={5} wrap="nowrap">
            <Box
              component="span"
              aria-hidden
              style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--mantine-color-orange-6)" }}
            />
            <Text size="xs" c="gray.8">
              Dietary need
            </Text>
          </Group>
        </Group>
      </Group>
    </Paper>
  );
}

export function HeldBanner() {
  const { heldId, seats, hold, unseat, place } = usePlan();
  const { tableSeats } = usePlan();
  if (!heldId) {
    return (
      <Text size="sm" c="gray.7">
        Drag a guest onto a table, or tap a guest and then a table or an empty seat.
      </Text>
    );
  }
  const guest = guestById[heldId];
  if (!guest) return null;
  const current = seats[heldId];
  const options = TABLES.map((t) => {
    const free = t.seats - (tableSeats[t.id] ?? []).filter(Boolean).length;
    return {
      value: t.id,
      label: `${t.name} (${free} free)`,
      disabled: free === 0 || current?.tableId === t.id,
    };
  });
  return (
    <Paper
      withBorder
      radius="md"
      p="sm"
      role="status"
      style={{ borderColor: "var(--mantine-color-fig-4)", background: "var(--mantine-color-fig-0)" }}
    >
      <Group justify="space-between" gap="sm" align="flex-end">
        <div>
          <Text fw={600} size="sm">
            {current ? "Moving" : "Seating"} {guest.name}
          </Text>
          <Text size="xs" c="gray.8">
            Tap a table or an empty seat on the plan, or choose a table.
          </Text>
        </div>
        <Group gap="xs" align="flex-end">
          <Select
            aria-label={`Move ${guest.name} to table`}
            placeholder="Choose table"
            data={options}
            value={null}
            onChange={(v) => v && place(heldId, v)}
            size="xs"
            w={190}
            allowDeselect={false}
          />
          {current && (
            <Button
              size="xs"
              variant="default"
              leftSection={<IconUserMinus size={14} />}
              onClick={() => unseat(heldId)}
            >
              Unseat
            </Button>
          )}
          <Button size="xs" variant="subtle" color="gray.8" onClick={() => hold(null)}>
            Cancel
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
```

```tsx components/PlanSidebar.tsx
"use client";

import { useState, type DragEvent } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck, IconCircleDashed, IconUserMinus } from "@tabler/icons-react";
import type { Guest } from "@/lib/data";
import { partyColor, tableById, type RuleResult } from "@/lib/plan";
import { usePlan } from "./PlanProvider";
import { DietBadge, PartyDot, RsvpBadge } from "./ui";

function GuestRow({ guest, showRsvp }: { guest: Guest; showRsvp?: boolean }) {
  const { heldId, hold, selectTable } = usePlan();
  const held = heldId === guest.id;
  const c = partyColor(guest.party);
  return (
    <UnstyledButton
      className="mantine-focus-auto"
      draggable
      aria-pressed={held}
      aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}. ${
        held ? "Picked up, press to put down" : "Press to pick up, then choose a table"
      }`}
      onDragStart={(e: DragEvent<HTMLButtonElement>) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => {
        hold(held ? null : guest.id);
        if (!held) selectTable(null);
      }}
      style={{
        display: "block",
        width: "100%",
        padding: "8px 10px",
        borderRadius: 10,
        cursor: "grab",
        background: held ? "var(--mantine-color-fig-0)" : "var(--mantine-color-white)",
        border: held ? "2px solid var(--mantine-color-fig-6)" : "1px solid var(--mantine-color-gray-3)",
        borderLeft: `5px solid var(--mantine-color-${c}-6)`,
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <div style={{ minWidth: 0 }}>
          <Text size="sm" fw={600} truncate>
            {guest.name}
          </Text>
          <Text size="xs" c="gray.7" truncate>
            {guest.party}
          </Text>
        </div>
        <Group gap={4} wrap="nowrap">
          {showRsvp && <RsvpBadge rsvp={guest.rsvp} />}
          <DietBadge diet={guest.diet} />
        </Group>
      </Group>
    </UnstyledButton>
  );
}

export function UnseatedList() {
  const { unseated, tentative, unseat, seats } = usePlan();
  const [over, setOver] = useState(false);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("text/plain")) {
      e.preventDefault();
      setOver(true);
    }
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id && seats[id]) unseat(id);
  };

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      onDragOver={onDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      style={over ? { borderColor: "var(--mantine-color-fig-5)", background: "var(--mantine-color-fig-0)" } : undefined}
    >
      <Group justify="space-between" mb="xs">
        <Title order={2} size="h5">
          Needs a seat
        </Title>
        <Badge color={unseated.length ? "orange" : "green"} variant="light" size="lg" aria-label={`${unseated.length} attending guests without a seat`}>
          {unseated.length}
        </Badge>
      </Group>
      {unseated.length === 0 ? (
        <Group gap={6}>
          <IconCircleCheck size={18} color="var(--mantine-color-green-7)" />
          <Text size="sm" c="gray.8">
            Everyone attending has a seat.
          </Text>
        </Group>
      ) : (
        <Stack gap={6} component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {unseated.map((guest) => (
            <li key={guest.id}>
              <GuestRow guest={guest} />
            </li>
          ))}
        </Stack>
      )}
      <Text size="xs" c="gray.7" mt="sm">
        Drop a seated guest here to unseat them.
      </Text>

      {tentative.length > 0 && (
        <Box mt="md">
          <Text size="xs" fw={700} tt="uppercase" c="gray.7" mb={6}>
            Not confirmed ({tentative.length})
          </Text>
          <Stack gap={6} component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tentative.map((guest) => (
              <li key={guest.id}>
                <GuestRow guest={guest} showRsvp />
              </li>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

export function TablePanel() {
  const { selectedTableId, tableSeats, flagged, heldId, hold, unseat, place, selectTable } = usePlan();

  if (!selectedTableId) {
    return (
      <Paper withBorder radius="lg" p="md">
        <Title order={2} size="h5">
          Table details
        </Title>
        <Text size="sm" c="gray.8" mt={4}>
          Select a table on the plan to see who sits there and their dietary needs.
        </Text>
      </Paper>
    );
  }
  const table = tableById[selectedTableId];
  const row = tableSeats[table.id] ?? [];
  const guests = row.filter((x): x is Guest => x !== null);
  const diets = new Map<string, number>();
  for (const guest of guests) if (guest.diet) diets.set(guest.diet, (diets.get(guest.diet) ?? 0) + 1);
  const issues = flagged[table.id] ?? [];

  return (
    <Paper withBorder radius="lg" p="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Title order={2} size="h5">
            {table.name}
          </Title>
          <Text size="sm" c="gray.8">
            {guests.length} of {table.seats} seats filled
          </Text>
        </div>
        <Button size="compact-xs" variant="subtle" color="gray.8" onClick={() => selectTable(null)}>
          Close
        </Button>
      </Group>
      <Progress
        value={(guests.length / table.seats) * 100}
        mt="xs"
        size="sm"
        aria-label={`${guests.length} of ${table.seats} seats filled`}
        color={guests.length === table.seats ? "green" : "fig"}
      />

      {issues.length > 0 && (
        <Stack gap={4} mt="sm">
          {issues.map((r) => (
            <Group key={r.index} gap={6} wrap="nowrap" align="flex-start">
              <IconAlertTriangle size={16} color="var(--mantine-color-red-7)" style={{ flex: "none", marginTop: 2 }} />
              <Text size="xs" c="red.9">
                {r.label}: {r.names.join(" & ")}. {r.message}
              </Text>
            </Group>
          ))}
        </Stack>
      )}

      <Box mt="sm">
        <Text size="xs" fw={700} tt="uppercase" c="gray.7" mb={4}>
          Dietary needs
        </Text>
        {diets.size === 0 ? (
          <Text size="sm" c="gray.8">
            None at this table.
          </Text>
        ) : (
          <Group gap={6}>
            {Array.from(diets.entries()).map(([diet, n]) => (
              <Badge key={diet} color="orange" variant="light" style={{ textTransform: "none" }}>
                {n} × {diet}
              </Badge>
            ))}
          </Group>
        )}
      </Box>

      <Stack gap={4} mt="md" component="ol" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {row.map((guest, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 0",
              borderTop: "1px solid var(--mantine-color-gray-2)",
            }}
          >
            <Text size="xs" c="gray.7" w={18} ta="right" aria-label={`Seat ${i + 1}`}>
              {i + 1}
            </Text>
            {guest ? (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <PartyDot party={guest.party} />
                    <Text size="sm" fw={600} truncate>
                      {guest.name}
                    </Text>
                  </Group>
                  <Group gap={6} mt={2} wrap="wrap">
                    <Text size="xs" c="gray.7">
                      {guest.party}
                    </Text>
                    <DietBadge diet={guest.diet} />
                  </Group>
                </div>
                <Group gap={4} wrap="nowrap">
                  <Button
                    size="compact-xs"
                    variant={heldId === guest.id ? "filled" : "default"}
                    aria-label={`${heldId === guest.id ? "Cancel moving" : "Move"} ${guest.name}`}
                    onClick={() => hold(heldId === guest.id ? null : guest.id)}
                  >
                    {heldId === guest.id ? "Moving" : "Move"}
                  </Button>
                  <Button
                    size="compact-xs"
                    variant="default"
                    aria-label={`Unseat ${guest.name}`}
                    leftSection={<IconUserMinus size={12} />}
                    onClick={() => unseat(guest.id)}
                  >
                    Unseat
                  </Button>
                </Group>
              </>
            ) : (
              <Group justify="space-between" style={{ flex: 1 }} wrap="nowrap">
                <Text size="sm" c="gray.7" fs="italic">
                  Empty seat
                </Text>
                {heldId && (
                  <Button size="compact-xs" onClick={() => place(heldId, table.id, i)} aria-label={`Seat held guest in seat ${i + 1}`}>
                    Seat here
                  </Button>
                )}
              </Group>
            )}
          </li>
        ))}
      </Stack>
    </Paper>
  );
}

function RuleIcon({ status }: { status: RuleResult["status"] }) {
  if (status === "broken") return <IconAlertTriangle size={18} color="var(--mantine-color-red-7)" aria-hidden />;
  if (status === "open") return <IconCircleDashed size={18} color="var(--mantine-color-gray-7)" aria-hidden />;
  return <IconCircleCheck size={18} color="var(--mantine-color-green-7)" aria-hidden />;
}

const STATUS_TEXT: Record<RuleResult["status"], string> = {
  broken: "Broken",
  open: "Waiting for seats",
  ok: "Kept",
};
const STATUS_ORDER: Record<RuleResult["status"], number> = { broken: 0, open: 1, ok: 2 };

export function RulesPanel() {
  const { results, selectTable } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;
  const sorted = [...results].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <Paper withBorder radius="lg" p="md">
      <Title order={2} size="h5">
        The couple&apos;s rules
      </Title>
      <Text
        size="sm"
        mt={4}
        fw={600}
        c={broken ? "red.9" : "green.9"}
        role="status"
      >
        {broken === 0
          ? "No rule is broken."
          : `${broken} rule${broken > 1 ? "s" : ""} broken.`}
        {open > 0 ? ` ${open} waiting for seats.` : ""}
      </Text>
      <Stack gap="sm" mt="sm" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sorted.map((r) => (
          <li key={r.index}>
            <Group gap={8} wrap="nowrap" align="flex-start">
              <Box mt={2} style={{ flex: "none" }}>
                <RuleIcon status={r.status} />
              </Box>
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={600}>
                  {r.label}: {r.names.join(" & ")}
                  <Text span size="xs" c={r.status === "broken" ? "red.9" : "gray.7"} fw={600}>
                    {" "}
                    · {STATUS_TEXT[r.status]}
                  </Text>
                </Text>
                <Text size="xs" c="gray.8">
                  {r.message}
                </Text>
                <Text size="xs" c="gray.7" fs="italic">
                  {r.rule.note}
                </Text>
                {r.status === "broken" && r.tableIds.length > 0 && (
                  <Group gap={4} mt={4}>
                    {r.tableIds.map((id) => (
                      <Button key={id} size="compact-xs" variant="light" color="red" onClick={() => selectTable(id)}>
                        Show {tableById[id]?.name}
                      </Button>
                    ))}
                  </Group>
                )}
              </div>
            </Group>
          </li>
        ))}
      </Stack>
    </Paper>
  );
}
```

```tsx app/page.tsx
"use client";

import { Container, Grid, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { HeldBanner, RoomPlan } from "@/components/RoomPlan";
import { RulesPanel, TablePanel, UnseatedList } from "@/components/PlanSidebar";
import { usePlan } from "@/components/PlanProvider";
import { EVENT } from "@/lib/data";
import { eventDateLabel } from "@/lib/plan";

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "warn" | "bad" | "good";
}) {
  const color =
    tone === "bad"
      ? "var(--mantine-color-red-8)"
      : tone === "warn"
        ? "var(--mantine-color-orange-8)"
        : tone === "good"
          ? "var(--mantine-color-green-8)"
          : "var(--mantine-color-gray-9)";
  return (
    <Paper withBorder radius="lg" p="sm" px="md">
      <Text size="xs" fw={700} tt="uppercase" c="gray.7">
        {label}
      </Text>
      <Text fz={28} fw={700} lh={1.2} style={{ color }}>
        {value}
      </Text>
      <Text size="xs" c="gray.7">
        {hint}
      </Text>
    </Paper>
  );
}

export default function PlanPage() {
  const { stats, results } = usePlan();
  const broken = results.filter((r) => r.status === "broken").length;
  const open = results.filter((r) => r.status === "open").length;

  return (
    <Container size={1400} px="md" py="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <div>
            <Title order={1} size="h2">
              {EVENT.name}
            </Title>
            <Text c="gray.8">
              {eventDateLabel()} · {EVENT.venue}
            </Text>
          </div>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <Stat label="Seated" value={String(stats.seated)} hint={`of ${stats.attending} attending`} />
          <Stat
            label="Needs a seat"
            value={String(stats.unseatedAttending)}
            hint="attending, unseated"
            tone={stats.unseatedAttending ? "warn" : "good"}
          />
          <Stat label="Free seats" value={String(stats.free)} hint={`of ${stats.capacity} in the room`} />
          <Stat
            label="Rules"
            value={broken === 0 ? "All kept" : `${broken} broken`}
            hint={open ? `${open} waiting for seats` : `${results.length} rules checked`}
            tone={broken ? "bad" : "good"}
          />
        </SimpleGrid>

        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="sm">
              <HeldBanner />
              <RoomPlan />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <TablePanel />
              <UnseatedList />
              <RulesPanel />
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
```

```tsx app/guests/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { DietBadge, PartyDot, RsvpBadge } from "@/components/ui";
import { usePlan } from "@/components/PlanProvider";
import { EVENT, GUESTS, TABLES, type Rsvp } from "@/lib/data";
import { mealCounts, tableById } from "@/lib/plan";

const NO_DIET = "__none";
const UNSEATED = "__unseated";

const PARTIES = Array.from(new Set(GUESTS.map((x) => x.party)));
const DIETS = Array.from(new Set(GUESTS.map((x) => x.diet).filter((d): d is string => !!d))).sort();
const RSVP_OPTIONS: { value: Rsvp; label: string }[] = [
  { value: "yes", label: "Attending" },
  { value: "maybe", label: "Maybe" },
  { value: "pending", label: "Awaiting reply" },
  { value: "no", label: "Declined" },
];

export default function GuestsPage() {
  const { seats } = usePlan();
  const [query, setQuery] = useState("");
  const [party, setParty] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [table, setTable] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter((x) => {
      if (q && !x.name.toLowerCase().includes(q)) return false;
      if (party && x.party !== party) return false;
      if (rsvp && x.rsvp !== rsvp) return false;
      if (diet === NO_DIET && x.diet) return false;
      if (diet && diet !== NO_DIET && x.diet !== diet) return false;
      const ref = seats[x.id];
      if (table === UNSEATED && ref) return false;
      if (table && table !== UNSEATED && ref?.tableId !== table) return false;
      return true;
    });
  }, [query, party, rsvp, diet, table, seats]);

  const meals = useMemo(() => mealCounts(seats), [seats]);
  const totalConfirmed = meals.reduce((s, r) => s + r.confirmed, 0);
  const totalUnconfirmed = meals.reduce((s, r) => s + r.unconfirmed, 0);
  const totalSeated = meals.reduce((s, r) => s + r.seated, 0);
  const specialConfirmed = meals.filter((r) => r.special).reduce((s, r) => s + r.confirmed, 0);

  const filtersOn = !!(query || party || rsvp || diet || table);
  const reset = () => {
    setQuery("");
    setParty(null);
    setRsvp(null);
    setDiet(null);
    setTable(null);
  };

  return (
    <Container size={1400} px="md" py="lg">
      <Stack gap="md">
        <div>
          <Title order={1} size="h2">
            Guest list
          </Title>
          <Text c="gray.8">
            {EVENT.name} · {GUESTS.length} invited, {totalConfirmed} attending
          </Text>
        </div>

        <Grid gap="md">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper withBorder radius="lg" p="md">
              <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
                <TextInput
                  label="Search"
                  placeholder="Guest name"
                  leftSection={<IconSearch size={16} />}
                  value={query}
                  onChange={(e) => setQuery(e.currentTarget.value)}
                />
                <Select
                  label="Party"
                  placeholder="All parties"
                  data={PARTIES}
                  value={party}
                  onChange={setParty}
                  clearable
                />
                <Select
                  label="RSVP"
                  placeholder="Any reply"
                  data={RSVP_OPTIONS}
                  value={rsvp}
                  onChange={setRsvp}
                  clearable
                />
                <Select
                  label="Diet"
                  placeholder="Any diet"
                  data={[{ value: NO_DIET, label: "No dietary need" }, ...DIETS.map((d) => ({ value: d, label: d }))]}
                  value={diet}
                  onChange={setDiet}
                  clearable
                />
                <Select
                  label="Table"
                  placeholder="Any table"
                  data={[
                    { value: UNSEATED, label: "Unseated" },
                    ...TABLES.map((t) => ({ value: t.id, label: t.name })),
                  ]}
                  value={table}
                  onChange={setTable}
                  clearable
                />
              </SimpleGrid>
              <Group justify="space-between" mt="sm">
                <Text size="sm" c="gray.8" role="status" aria-live="polite">
                  Showing {filtered.length} of {GUESTS.length} guests
                </Text>
                {filtersOn && (
                  <Button size="compact-sm" variant="subtle" onClick={reset}>
                    Clear filters
                  </Button>
                )}
              </Group>

              <Table.ScrollContainer minWidth={620} mt="xs">
                <Table verticalSpacing="xs" highlightOnHover>
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
                    {filtered.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={5}>
                          <Text ta="center" c="gray.8" py="md">
                            No guests match these filters.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                    {filtered.map((x) => {
                      const ref = seats[x.id];
                      return (
                        <Table.Tr key={x.id}>
                          <Table.Td>
                            <Text size="sm" fw={600}>
                              {x.name}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={6} wrap="nowrap">
                              <PartyDot party={x.party} />
                              <Text size="sm">{x.party}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <RsvpBadge rsvp={x.rsvp} />
                          </Table.Td>
                          <Table.Td>
                            {x.diet ? <DietBadge diet={x.diet} /> : <Text size="sm" c="gray.7">None</Text>}
                          </Table.Td>
                          <Table.Td>
                            {ref ? (
                              <Badge variant="light" color="fig" style={{ textTransform: "none" }}>
                                {tableById[ref.tableId]?.name} · seat {ref.seat + 1}
                              </Badge>
                            ) : (
                              <Text size="sm" c={x.rsvp === "no" ? "gray.7" : "orange.9"}>
                                {x.rsvp === "no" ? "Not coming" : "Unseated"}
                              </Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper withBorder radius="lg" p="md" style={{ position: "sticky", top: 76 }}>
              <Title order={2} size="h5">
                Meals for the caterer
              </Title>
              <Text size="sm" c="gray.8" mt={4}>
                {totalConfirmed} confirmed meals, {specialConfirmed} with a dietary need.
              </Text>
              <Table mt="sm" verticalSpacing={6} fz="sm" aria-label="Meal counts">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Meal</Table.Th>
                    <Table.Th ta="right">Confirmed</Table.Th>
                    <Table.Th ta="right">Not yet</Table.Th>
                    <Table.Th ta="right">Seated</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {meals.map((r) => (
                    <Table.Tr key={r.meal}>
                      <Table.Td>{r.meal}</Table.Td>
                      <Table.Td ta="right" fw={700}>
                        {r.confirmed}
                      </Table.Td>
                      <Table.Td ta="right">{r.unconfirmed || "–"}</Table.Td>
                      <Table.Td ta="right">{r.seated}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Th>Total</Table.Th>
                    <Table.Th ta="right">{totalConfirmed}</Table.Th>
                    <Table.Th ta="right">{totalUnconfirmed}</Table.Th>
                    <Table.Th ta="right">{totalSeated}</Table.Th>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
              <Text size="xs" c="gray.7" mt="sm">
                Confirmed counts guests who replied yes. Not yet counts maybe and awaiting reply. Declined guests are
                left out. Seated follows the plan.
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
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
import { AppFrame } from "@/components/AppFrame";
import { PlanProvider } from "@/components/PlanProvider";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: "Seatwise: Ines & Mateo's wedding dinner",
  description: "Seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <ModalsProvider>
            <Notifications />
            <PlanProvider>
              <AppFrame>{children}</AppFrame>
            </PlanProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

```ts app/theme.ts
import { createTheme, type MantineColorsTuple } from "@mantine/core";

const fig: MantineColorsTuple = [
  "#f7f2fb",
  "#ece1f5",
  "#d9c2ec",
  "#c3a0e0",
  "#b184d6",
  "#a46fcf",
  "#9a5fc8",
  "#8449ae",
  "#6f3d93",
  "#5a317a",
];

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  colors: { fig },
  primaryColor: "fig",
  primaryShade: 7,
  defaultRadius: "md",
  cursorType: "pointer",
});
```
