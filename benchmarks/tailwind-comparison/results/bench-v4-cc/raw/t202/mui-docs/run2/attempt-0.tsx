```ts lib/data.ts
export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";
export type Fixture = { id: string; kind: FixtureKind; label: string; x: number; y: number; w: number; h: number };
export type TableShape = "long" | "round";
export type Table = { id: string; name: string; shape: TableShape; seats: number; x: number; y: number; rotation?: number };
export type Rsvp = "yes" | "maybe" | "no" | "pending";
export type Guest = { id: string; name: string; party: string; rsvp: Rsvp; diet: string | null; table: string | null };
export type RuleKind = "together" | "apart" | "near";
export type Rule = {
  kind: RuleKind;
  guests: string[];
  note: string;
  /** near rules: fixture the guest should be close to, and the largest distance (m) that counts as near */
  toward?: string;
  maxDistance?: number;
  /** near rules: fixture the guest should be away from, and the smallest distance (m) that counts as away */
  awayFrom?: string;
  minAway?: number;
};

export const app = "Seatwise, a seating planner for wedding and event planners";

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

export const tables: Table[] = [
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
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  // The note names Sean and Ryan Doyle, so the rule follows their ids (g-30, g-31).
  { kind: "apart", guests: ["g-30", "g-31"], note: "Brothers Sean and Ryan Doyle are not speaking" },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    toward: "f-4",
    maxDistance: 5,
    awayFrom: "f-1",
    minAway: 8,
  },
];

export const tableById: Record<string, Table> = Object.fromEntries(tables.map((t) => [t.id, t]));
export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const fixtureById: Record<string, Fixture> = Object.fromEntries(fixtures.map((f) => [f.id, f]));

export const parties: string[] = Array.from(new Set(guests.map((g) => g.party)));
export const diets: string[] = Array.from(
  new Set(guests.map((g) => g.diet).filter((d): d is string => d !== null)),
);
export const STANDARD_MEAL = "Standard menu";

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

const PARTY_COLORS: Record<string, string> = {
  Couple: "#b0364f",
  "Bride's family": "#2f6f8f",
  "Groom's family": "#6b4a9e",
  "University friends": "#1f7a5c",
  "Work friends": "#a0621a",
  "Groom's football club": "#3b5bb5",
  "Plus-ones": "#5f6b76",
};

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "#5f6b76";
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
import { fixtureById, guestById, rules, tableById, type Fixture, type Rule, type Table } from "@/lib/data";

export type SeatRef = { tableId: string; seat: number };
export type Assignment = Record<string, SeatRef | null>;
export type RuleStatus = "ok" | "broken" | "pending";
export type RuleResult = {
  id: string;
  rule: Rule;
  label: string;
  subject: string;
  note: string;
  detail: string;
  status: RuleStatus;
  tableIds: string[];
  guestIds: string[];
};

export const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

/** Guest ids by seat index for one table (null = empty seat). */
export function seatsFor(assign: Assignment, tableId: string, count: number): (string | null)[] {
  const out = new Array<string | null>(count).fill(null);
  for (const [gid, ref] of Object.entries(assign)) {
    if (ref && ref.tableId === tableId && ref.seat < count) out[ref.seat] = gid;
  }
  return out;
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function distance(table: Table, fixture: Fixture): number {
  const fx = fixture.x + fixture.w / 2;
  const fy = fixture.y + fixture.h / 2;
  return Math.hypot(table.x - fx, table.y - fy);
}

export function evaluateRules(assign: Assignment): RuleResult[] {
  return rules.map((rule, index): RuleResult => {
    const people = rule.guests.map((gid) => guestById[gid]);
    const subject = joinNames(people.map((p) => p.name));
    const where = rule.guests.map((gid) => assign[gid]?.tableId ?? null);
    const seatedTables = Array.from(new Set(where.filter((t): t is string => t !== null)));
    const base = {
      id: `rule-${index}`,
      rule,
      label: RULE_LABEL[rule.kind],
      subject,
      note: rule.note,
    };

    if (rule.kind === "together") {
      if (seatedTables.length > 1) {
        return {
          ...base,
          status: "broken",
          detail: people
            .map((p, i) => (where[i] ? `${p.name} is at ${tableById[where[i] as string].name}` : `${p.name} is not seated`))
            .join("; ") + ".",
          tableIds: seatedTables,
          guestIds: rule.guests.filter((gid) => assign[gid]),
        };
      }
      if (where.includes(null)) {
        return {
          ...base,
          status: "pending",
          detail: "Not all of them are seated yet.",
          tableIds: seatedTables,
          guestIds: [],
        };
      }
      return {
        ...base,
        status: "ok",
        detail: `Together at ${tableById[seatedTables[0]].name}.`,
        tableIds: seatedTables,
        guestIds: [],
      };
    }

    if (rule.kind === "apart") {
      const counts: Record<string, string[]> = {};
      rule.guests.forEach((gid, i) => {
        const t = where[i];
        if (t) (counts[t] ??= []).push(gid);
      });
      const clash = Object.entries(counts).filter(([, ids]) => ids.length > 1);
      if (clash.length > 0) {
        return {
          ...base,
          status: "broken",
          detail: `Both are at ${tableById[clash[0][0]].name}.`,
          tableIds: clash.map(([t]) => t),
          guestIds: clash.flatMap(([, ids]) => ids),
        };
      }
      return {
        ...base,
        status: "ok",
        detail: seatedTables.length < rule.guests.length ? "Not at the same table so far." : "At different tables.",
        tableIds: [],
        guestIds: [],
      };
    }

    // near
    const gid = rule.guests[0];
    const ref = assign[gid];
    if (!ref) {
      return { ...base, status: "pending", detail: "Not seated yet.", tableIds: [], guestIds: [] };
    }
    const table = tableById[ref.tableId];
    const toward = rule.toward ? fixtureById[rule.toward] : undefined;
    const away = rule.awayFrom ? fixtureById[rule.awayFrom] : undefined;
    const issues: string[] = [];
    const facts: string[] = [];
    if (toward) {
      const d = distance(table, toward);
      facts.push(`${d.toFixed(1)} m from the ${toward.label.toLowerCase()}`);
      if (rule.maxDistance !== undefined && d > rule.maxDistance) {
        issues.push(`too far from the ${toward.label.toLowerCase()} (${d.toFixed(1)} m, aim for ${rule.maxDistance} m or less)`);
      }
    }
    if (away) {
      const d = distance(table, away);
      facts.push(`${d.toFixed(1)} m from the ${away.label.toLowerCase()}`);
      if (rule.minAway !== undefined && d < rule.minAway) {
        issues.push(`too close to the ${away.label.toLowerCase()} (${d.toFixed(1)} m, aim for ${rule.minAway} m or more)`);
      }
    }
    if (issues.length > 0) {
      return {
        ...base,
        status: "broken",
        detail: `${table.name} is ${issues.join(" and ")}.`,
        tableIds: [table.id],
        guestIds: [gid],
      };
    }
    return {
      ...base,
      status: "ok",
      detail: `${table.name} is ${facts.join(" and ")}.`,
      tableIds: [table.id],
      guestIds: [],
    };
  });
}
```

```tsx lib/plan.tsx
"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { guestById, guests, tableById, tables, type Guest } from "@/lib/data";
import { evaluateRules, seatsFor, type Assignment, type RuleResult } from "@/lib/rules";

type Notice = { key: number; text: string; undo?: Assignment };

export type PlanStats = {
  attending: number;
  seated: number;
  capacity: number;
  freeSeats: number;
  toSeat: number;
  awaiting: number;
  declined: number;
};

type PlanContextValue = {
  assign: Assignment;
  occupants: (tableId: string) => (Guest | null)[];
  filled: (tableId: string) => number;
  stats: PlanStats;
  unseatedAttending: Guest[];
  unseatedUnconfirmed: Guest[];
  place: (guestId: string, tableId: string, seat?: number) => void;
  unseat: (guestId: string) => void;
  heldId: string | null;
  pick: (guestId: string) => void;
  clearHeld: () => void;
  selectedTableId: string | null;
  selectTable: (tableId: string | null) => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  rules: RuleResult[];
  tableFlags: Record<string, RuleResult[]>;
  guestFlags: Record<string, RuleResult[]>;
};

const PlanContext = React.createContext<PlanContextValue | null>(null);

function initialAssignment(): Assignment {
  const a: Assignment = {};
  const next: Record<string, number> = {};
  for (const g of guests) {
    if (g.table) {
      const seat = next[g.table] ?? 0;
      next[g.table] = seat + 1;
      a[g.id] = { tableId: g.table, seat };
    } else {
      a[g.id] = null;
    }
  }
  return a;
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [assign, setAssign] = React.useState<Assignment>(initialAssignment);
  const [heldId, setHeldId] = React.useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>("t-1");
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeldId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const say = React.useCallback((text: string, undo?: Assignment) => {
    setNotice({ key: Date.now(), text, undo });
  }, []);

  const occupants = React.useCallback(
    (tableId: string) =>
      seatsFor(assign, tableId, tableById[tableId].seats).map((id) => (id ? guestById[id] : null)),
    [assign],
  );

  const filled = React.useCallback(
    (tableId: string) => seatsFor(assign, tableId, tableById[tableId].seats).filter(Boolean).length,
    [assign],
  );

  const place = React.useCallback(
    (guestId: string, tableId: string, seat?: number) => {
      const guest = guestById[guestId];
      const table = tableById[tableId];
      if (!guest || !table) return;
      if (guest.rsvp === "no") {
        say(`${guest.name} has declined, so they cannot be seated.`);
        return;
      }
      const cur = assign[guestId];
      if (cur && cur.tableId === tableId && (seat === undefined || seat === cur.seat)) {
        setHeldId(null);
        return;
      }
      const occ = seatsFor(assign, tableId, table.seats);
      const next: Assignment = { ...assign };
      let target = seat;
      if (target !== undefined && occ[target] && occ[target] !== guestId) {
        const otherId = occ[target] as string;
        if (cur) {
          next[otherId] = cur;
          next[guestId] = { tableId, seat: target };
          setAssign(next);
          setHeldId(null);
          setSelectedTableId(tableId);
          say(`Swapped ${guest.name} and ${guestById[otherId].name}.`, assign);
          return;
        }
        target = undefined;
      }
      if (target === undefined) {
        const free = occ.findIndex((o) => o === null);
        if (free < 0) {
          say(`${table.name} is full (${table.seats} of ${table.seats} seats).`);
          return;
        }
        target = free;
      }
      next[guestId] = { tableId, seat: target };
      setAssign(next);
      setHeldId(null);
      setSelectedTableId(tableId);
      say(
        cur
          ? `Moved ${guest.name} from ${tableById[cur.tableId].name} to ${table.name}.`
          : `Seated ${guest.name} at ${table.name}.`,
        assign,
      );
    },
    [assign, say],
  );

  const unseat = React.useCallback(
    (guestId: string) => {
      if (!assign[guestId]) {
        setHeldId(null);
        return;
      }
      setAssign({ ...assign, [guestId]: null });
      setHeldId(null);
      say(`Unseated ${guestById[guestId].name}.`, assign);
    },
    [assign, say],
  );

  const pick = React.useCallback(
    (guestId: string) => {
      const g = guestById[guestId];
      if (g.rsvp === "no") {
        say(`${g.name} has declined, so they cannot be seated.`);
        return;
      }
      setHeldId((prev) => (prev === guestId ? null : guestId));
    },
    [say],
  );

  const stats = React.useMemo<PlanStats>(() => {
    const capacity = tables.reduce((n, t) => n + t.seats, 0);
    const seated = guests.filter((g) => assign[g.id]).length;
    return {
      attending: guests.filter((g) => g.rsvp === "yes").length,
      seated,
      capacity,
      freeSeats: capacity - seated,
      toSeat: guests.filter((g) => g.rsvp === "yes" && !assign[g.id]).length,
      awaiting: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id]).length,
      declined: guests.filter((g) => g.rsvp === "no").length,
    };
  }, [assign]);

  const unseatedAttending = React.useMemo(
    () => guests.filter((g) => g.rsvp === "yes" && !assign[g.id]),
    [assign],
  );
  const unseatedUnconfirmed = React.useMemo(
    () => guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && !assign[g.id]),
    [assign],
  );

  const rules = React.useMemo(() => evaluateRules(assign), [assign]);
  const { tableFlags, guestFlags } = React.useMemo(() => {
    const tf: Record<string, RuleResult[]> = {};
    const gf: Record<string, RuleResult[]> = {};
    for (const r of rules) {
      if (r.status !== "broken") continue;
      for (const t of r.tableIds) (tf[t] ??= []).push(r);
      for (const g of r.guestIds) (gf[g] ??= []).push(r);
    }
    return { tableFlags: tf, guestFlags: gf };
  }, [rules]);

  const value = React.useMemo<PlanContextValue>(
    () => ({
      assign,
      occupants,
      filled,
      stats,
      unseatedAttending,
      unseatedUnconfirmed,
      place,
      unseat,
      heldId,
      pick,
      clearHeld: () => setHeldId(null),
      selectedTableId,
      selectTable: setSelectedTableId,
      dragId,
      setDragId,
      rules,
      tableFlags,
      guestFlags,
    }),
    [assign, occupants, filled, stats, unseatedAttending, unseatedUnconfirmed, place, unseat, heldId, pick, selectedTableId, dragId, rules, tableFlags, guestFlags],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      <Snackbar
        key={notice?.key}
        open={notice !== null}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setNotice(null);
        }}
        message={notice?.text}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        action={
          notice?.undo ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                if (notice.undo) setAssign(notice.undo);
                setNotice(null);
              }}
            >
              Undo
            </Button>
          ) : undefined
        }
      />
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
```

```ts lib/ui.ts
/** A translucent tint of a theme colour variable, e.g. tint("primary-main", 12). */
export function tint(token: string, percent: number): string {
  return `color-mix(in srgb, var(--mui-palette-${token}) ${percent}%, transparent)`;
}
```

```tsx components/AppShell.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PeopleIcon from "@mui/icons-material/People";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { initials, planner } from "@/lib/data";
import { tint } from "@/lib/ui";

const NAV = [
  { href: "/", label: "Plan", icon: <EventSeatIcon fontSize="small" /> },
  { href: "/guests", label: "Guests", icon: <PeopleIcon fontSize="small" /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { colorScheme, setMode } = useColorScheme();

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: -9999,
          top: 8,
          zIndex: 2000,
          bgcolor: "background.paper",
          color: "text.primary",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { left: 8 },
        }}
      >
        Skip to content
      </Box>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          displayPrint: "none",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1, sm: 3 }}
          sx={{ px: { xs: 1.5, md: 3 }, minHeight: 60 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              aria-hidden
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <EventSeatIcon fontSize="small" />
            </Box>
            <Typography component="span" variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Seatwise
            </Typography>
          </Stack>
          <Box component="nav" aria-label="Main">
            <Stack direction="row" spacing={0.5}>
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Button
                    key={item.href}
                    component={NextLink}
                    href={item.href}
                    startIcon={item.icon}
                    aria-current={active ? "page" : undefined}
                    color={active ? "primary" : "inherit"}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      bgcolor: active ? tint("primary-main", 12) : "transparent",
                      color: active ? "primary.main" : "text.secondary",
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>
          <Box sx={{ flex: 1 }} />
          <IconButton
            aria-label="Toggle light and dark mode"
            onClick={() => setMode(colorScheme === "dark" ? "light" : "dark")}
            sx={{ width: 44, height: 44 }}
          >
            <Brightness4Icon />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "secondary.main", color: "#fff" }}>
              {initials(planner.name)}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {planner.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wedding planner
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Box component="main" id="main" sx={{ flex: 1, px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Box>
  );
}
```

```tsx components/GuestRow.tsx
"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { initials, partyColor, tableById, type Guest } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";
import type { SxProps, Theme } from "@mui/material/styles";

type Props = {
  guest: Guest;
  actions?: React.ReactNode;
  showTable?: boolean;
  sx?: SxProps<Theme>;
};

export default function GuestRow({ guest, actions, showTable = false, sx }: Props) {
  const plan = usePlan();
  const held = plan.heldId === guest.id;
  const flagged = (plan.guestFlags[guest.id] ?? []).length > 0;
  const seat = plan.assign[guest.id];
  const canMove = guest.rsvp !== "no";

  return (
    <Box
      draggable={canMove}
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", guest.id);
        e.dataTransfer.effectAllowed = "move";
        plan.setDragId(guest.id);
      }}
      onDragEnd={() => plan.setDragId(null)}
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          borderRadius: 2,
          border: 1,
          borderColor: held ? "primary.main" : "divider",
          bgcolor: held ? tint("primary-main", 12) : "background.paper",
          outline: held ? "2px solid var(--mui-palette-primary-main)" : "none",
          cursor: canMove ? "grab" : "default",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <ButtonBase
        onClick={() => plan.pick(guest.id)}
        aria-pressed={held}
        aria-label={`${guest.name}, ${guest.party}${guest.diet ? `, ${guest.diet}` : ""}${
          seat ? `, at ${tableById[seat.tableId].name}` : ", not seated"
        }. ${held ? "Selected to move" : "Select to move"}`}
        sx={{
          flex: 1,
          minWidth: 0,
          justifyContent: "flex-start",
          textAlign: "left",
          gap: 1.25,
          p: 1,
          minHeight: 48,
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: partyColor(guest.party), color: "#fff" }}>
          {initials(guest.name)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {guest.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {guest.party}
            {showTable && seat ? ` · ${tableById[seat.tableId].name}` : ""}
          </Typography>
        </Box>
      </ButtonBase>
      {guest.diet ? <Chip size="small" label={guest.diet} variant="outlined" sx={{ flexShrink: 0 }} /> : null}
      {flagged ? (
        <WarningAmberIcon color="error" fontSize="small" titleAccess="A seating rule is broken for this guest" />
      ) : null}
      {actions}
      {actions ? null : <Box sx={{ width: 4 }} />}
    </Box>
  );
}
```

```tsx components/RoomPlan.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  event,
  fixtures,
  guestById,
  initials,
  parties,
  partyColor,
  tables,
  type Fixture,
  type Guest,
  type Table,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";

const W = event.room_m.width;
const H = event.room_m.depth;
const SEAT = 1.0;

type Geometry = { w: number; h: number; body: { w: number; h: number }; seats: { x: number; y: number }[] };

function geometry(table: Table): Geometry {
  if (table.shape === "round") {
    const R = 1.5;
    const w = 2 * (R + SEAT / 2);
    const seats = Array.from({ length: table.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / table.seats;
      return { x: R * Math.cos(a), y: R * Math.sin(a) };
    });
    return { w, h: w, body: { w: 1.7, h: 1.7 }, seats };
  }
  const top = Math.ceil(table.seats / 2);
  const bottom = table.seats - top;
  const width = 4.6;
  const offset = 1.1;
  const row = (count: number, y: number) =>
    Array.from({ length: count }, (_, k) => ({ x: -width / 2 + ((k + 0.5) * width) / count, y }));
  return {
    w: width + 0.2,
    h: 2 * (offset + SEAT / 2),
    body: { w: width, h: 1.0 },
    seats: [...row(top, -offset), ...row(bottom, offset)],
  };
}

const pctX = (v: number) => `${(v / W) * 100}%`;
const pctY = (v: number) => `${(v / H) * 100}%`;
const labelFont = "max(9px, 1.3cqw)";

function FixtureBox({ fixture }: { fixture: Fixture }) {
  const common = {
    position: "absolute" as const,
    left: pctX(fixture.x),
    top: pctY(fixture.y),
    width: pctX(fixture.w),
    height: pctY(fixture.h),
    pointerEvents: "none" as const,
  };
  if (fixture.kind === "door") {
    return (
      <Box sx={{ ...common, bgcolor: "secondary.main", borderRadius: 0.5 }}>
        <Typography
          component="span"
          sx={{
            position: "absolute",
            left: "130%",
            top: 0,
            height: "100%",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: labelFont,
            fontWeight: 600,
            color: "text.secondary",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {fixture.label}
        </Typography>
      </Box>
    );
  }
  const styles: Record<Exclude<Fixture["kind"], "door">, Record<string, unknown>> = {
    stage: { bgcolor: "#2b3440", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" },
    dancefloor: {
      backgroundImage: `repeating-conic-gradient(${tint("primary-main", 20)} 0 25%, ${tint("primary-main", 7)} 0 50%)`,
      backgroundSize: `${(2 / fixture.w) * 100}% ${(2 / fixture.h) * 100}%`,
      color: "text.primary",
      border: "1px solid var(--mui-palette-divider)",
    },
    bar: { bgcolor: tint("secondary-main", 28), color: "text.primary", border: "1px solid var(--mui-palette-divider)" },
  };
  return (
    <Box
      sx={{
        ...common,
        ...styles[fixture.kind],
        borderRadius: 1,
        display: "grid",
        placeItems: "center",
        fontSize: labelFont,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {fixture.label}
    </Box>
  );
}

function TableGroup({ table }: { table: Table }) {
  const plan = usePlan();
  const [over, setOver] = React.useState(false);
  const geo = React.useMemo(() => geometry(table), [table]);
  const occ = plan.occupants(table.id);
  const count = occ.filter(Boolean).length;
  const flags = plan.tableFlags[table.id] ?? [];
  const selected = plan.selectedTableId === table.id;
  const round = table.shape === "round";
  const dragging = plan.dragId !== null;

  const onSeat = (index: number, guest: Guest | null) => {
    if (plan.heldId) {
      if (guest && guest.id === plan.heldId) {
        plan.pick(guest.id);
        return;
      }
      plan.place(plan.heldId, table.id, index);
      return;
    }
    plan.selectTable(table.id);
    if (guest) plan.pick(guest.id);
  };

  const onBody = () => {
    if (plan.heldId) {
      plan.place(plan.heldId, table.id);
      return;
    }
    plan.selectTable(table.id);
  };

  return (
    <Box
      onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
        if (!plan.dragId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!over) setOver(true);
      }}
      onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
        setOver(false);
        plan.setDragId(null);
        if (id) plan.place(id, table.id);
      }}
      sx={{
        position: "absolute",
        left: pctX(table.x - geo.w / 2),
        top: pctY(table.y - geo.h / 2),
        width: pctX(geo.w),
        height: pctY(geo.h),
        borderRadius: round ? "50%" : 4,
        bgcolor: over ? tint("primary-main", 18) : selected ? tint("primary-main", 8) : "transparent",
        outline: over
          ? "2px dashed var(--mui-palette-primary-main)"
          : dragging
            ? "1px dashed var(--mui-palette-divider)"
            : "none",
      }}
    >
      <ButtonBase
        onClick={onBody}
        aria-pressed={selected}
        aria-label={`${table.name}, ${count} of ${table.seats} seats filled${
          flags.length ? `, ${flags.length} rule${flags.length > 1 ? "s" : ""} broken` : ""
        }`}
        sx={{
          position: "absolute",
          left: `${((1 - geo.body.w / geo.w) / 2) * 100}%`,
          top: `${((1 - geo.body.h / geo.h) / 2) * 100}%`,
          width: `${(geo.body.w / geo.w) * 100}%`,
          height: `${(geo.body.h / geo.h) * 100}%`,
          borderRadius: round ? "50%" : 2,
          bgcolor: "background.paper",
          border: selected ? "3px solid" : "2px solid",
          borderColor: flags.length ? "error.main" : selected ? "primary.main" : "text.disabled",
          flexDirection: "column",
          lineHeight: 1.15,
          textAlign: "center",
          "&:hover": { bgcolor: tint("primary-main", 10) },
        }}
      >
        <Box component="span" sx={{ fontSize: "max(9px, 1.25cqw)", fontWeight: 800 }}>
          {table.name}
        </Box>
        <Box component="span" sx={{ fontSize: "max(9px, 1.15cqw)", color: "text.secondary" }}>
          {count}/{table.seats}
        </Box>
        {flags.length ? (
          <WarningAmberIcon
            color="error"
            titleAccess="Rule broken"
            sx={{ position: "absolute", top: "-12%", right: round ? "2%" : "-1%", fontSize: "max(14px, 1.7cqw)", bgcolor: "background.paper", borderRadius: "50%" }}
          />
        ) : null}
      </ButtonBase>

      {geo.seats.map((pos, i) => {
        const guest = occ[i];
        const held = guest !== null && plan.heldId === guest.id;
        const flagged = guest !== null && (plan.guestFlags[guest.id] ?? []).length > 0;
        const label = guest
          ? `${guest.name}, ${table.name} seat ${i + 1}${guest.diet ? `, ${guest.diet}` : ""}${flagged ? ", rule broken" : ""}`
          : `${table.name} seat ${i + 1}, empty`;
        return (
          <Box
            key={i}
            draggable={guest !== null}
            onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
              if (!guest) return;
              e.dataTransfer.setData("text/plain", guest.id);
              e.dataTransfer.effectAllowed = "move";
              plan.setDragId(guest.id);
            }}
            onDragEnd={() => plan.setDragId(null)}
            onDrop={(e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
              setOver(false);
              plan.setDragId(null);
              if (id) plan.place(id, table.id, i);
            }}
            sx={{
              position: "absolute",
              left: `${((pos.x + geo.w / 2 - SEAT / 2) / geo.w) * 100}%`,
              top: `${((pos.y + geo.h / 2 - SEAT / 2) / geo.h) * 100}%`,
              width: `${(SEAT / geo.w) * 100}%`,
              height: `${(SEAT / geo.h) * 100}%`,
              cursor: guest ? "grab" : "pointer",
            }}
          >
            <ButtonBase
              onClick={() => onSeat(i, guest)}
              aria-label={label}
              aria-pressed={guest ? held : undefined}
              title={guest ? `${guest.name} (${guest.party})${guest.diet ? ` · ${guest.diet}` : ""}` : `${table.name}, seat ${i + 1}: empty`}
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                fontSize: "max(9px, 1.3cqw)",
                fontWeight: 700,
                color: "#fff",
                bgcolor: guest ? partyColor(guest.party) : plan.heldId ? tint("primary-main", 10) : "background.paper",
                border: guest ? "2px solid var(--mui-palette-background-paper)" : "2px dashed",
                borderColor: guest ? undefined : plan.heldId ? "primary.main" : "text.disabled",
                boxShadow: flagged ? "0 0 0 3px var(--mui-palette-error-main)" : "none",
                outline: held ? "3px solid var(--mui-palette-primary-main)" : "none",
                outlineOffset: 2,
                "&:hover": guest ? { filter: "brightness(1.12)" } : { bgcolor: tint("primary-main", 18) },
              }}
            >
              {guest ? initials(guest.name) : null}
              {guest?.diet ? (
                <Box
                  component="span"
                  aria-hidden
                  sx={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: "32%",
                    height: "32%",
                    borderRadius: "50%",
                    bgcolor: "#f2b84b",
                    border: "1.5px solid #2b3440",
                  }}
                />
              ) : null}
            </ButtonBase>
          </Box>
        );
      })}
    </Box>
  );
}

function HeldBanner() {
  const plan = usePlan();
  if (!plan.heldId) return null;
  const guest = guestById[plan.heldId];
  const seated = plan.assign[guest.id] !== null;
  return (
    <Paper
      role="status"
      variant="outlined"
      sx={{
        mb: 1.5,
        p: 1.25,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1,
        borderColor: "primary.main",
        bgcolor: tint("primary-main", 10),
      }}
    >
      <Typography variant="body2" sx={{ flex: "1 1 220px" }}>
        <strong>{guest.name}</strong> is selected. Tap an empty seat or a table to {seated ? "move them" : "seat them"}.
      </Typography>
      {seated ? (
        <Button size="small" variant="outlined" onClick={() => plan.unseat(guest.id)} sx={{ minHeight: 40 }}>
          Unseat
        </Button>
      ) : null}
      <Button size="small" onClick={plan.clearHeld} sx={{ minHeight: 40 }}>
        Cancel
      </Button>
    </Paper>
  );
}

export default function RoomPlan() {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack direction="row" flexWrap="wrap" alignItems="baseline" justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
        <Typography variant="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
          Room plan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {event.venue} · {W} × {H} m
        </Typography>
      </Stack>
      <HeldBanner />
      <Box sx={{ overflowX: "auto", pb: 0.5 }}>
        <Box
          role="group"
          aria-label={`Room plan of ${event.venue}, drawn to scale`}
          sx={{
            position: "relative",
            width: "100%",
            minWidth: 800,
            aspectRatio: `${W} / ${H}`,
            containerType: "inline-size",
            border: "3px solid",
            borderColor: "text.secondary",
            borderRadius: 2,
            bgcolor: "background.default",
            backgroundImage: `linear-gradient(to right, ${tint("text-primary", 6)} 1px, transparent 1px), linear-gradient(to bottom, ${tint("text-primary", 6)} 1px, transparent 1px)`,
            backgroundSize: `${100 / W}% ${100 / H}%`,
            boxSizing: "border-box",
          }}
        >
          {fixtures.map((f) => (
            <FixtureBox key={f.id} fixture={f} />
          ))}
          {tables.map((t) => (
            <TableGroup key={t.id} table={t} />
          ))}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              right: "1.5%",
              top: pctY(0.35),
              width: pctX(5),
              borderTop: "2px solid",
              borderLeft: "2px solid",
              borderRight: "2px solid",
              borderColor: "text.secondary",
              height: 6,
              color: "text.secondary",
              fontSize: labelFont,
              textAlign: "center",
              pt: 0.5,
            }}
          >
            5 m
          </Box>
        </Box>
      </Box>
      <Stack direction="row" flexWrap="wrap" gap={{ xs: 1, sm: 2 }} sx={{ mt: 1.5 }} aria-label="Legend" component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {parties.map((p) => (
          <Stack component="li" key={p} direction="row" alignItems="center" spacing={0.75}>
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: partyColor(p) }} />
            <Typography variant="caption" color="text.secondary">
              {p}
            </Typography>
          </Stack>
        ))}
        <Stack component="li" direction="row" alignItems="center" spacing={0.75}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#f2b84b", border: "1.5px solid #2b3440" }} />
          <Typography variant="caption" color="text.secondary">
            Dietary need
          </Typography>
        </Stack>
        <Stack component="li" direction="row" alignItems="center" spacing={0.75}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", border: "2px dashed", borderColor: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">
            Empty seat
          </Typography>
        </Stack>
        <Stack component="li" direction="row" alignItems="center" spacing={0.75}>
          <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "50%", boxShadow: "0 0 0 2px var(--mui-palette-error-main)" }} />
          <Typography variant="caption" color="text.secondary">
            Rule broken
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
```

```tsx components/StatTiles.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { usePlan } from "@/lib/plan";

function Tile({
  label,
  value,
  caption,
  color,
  progress,
}: {
  label: string;
  value: React.ReactNode;
  caption: string;
  color?: string;
  progress?: number;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75 }}>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4, display: "block" }}>
        {label}
      </Typography>
      <Typography component="div" sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15, color: color ?? "text.primary" }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {caption}
      </Typography>
      {progress !== undefined ? (
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label="Seats filled"
          sx={{ mt: 1, height: 6, borderRadius: 3 }}
        />
      ) : null}
    </Paper>
  );
}

export default function StatTiles() {
  const { stats, rules } = usePlan();
  const broken = rules.filter((r) => r.status === "broken").length;
  const waiting = rules.filter((r) => r.status === "pending").length;
  return (
    <Box
      role="group"
      aria-label="Seating counts"
      aria-live="polite"
      sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" } }}
    >
      <Tile
        label="Seated"
        value={stats.seated}
        caption={`of ${stats.capacity} seats, ${stats.freeSeats} free`}
        progress={(stats.seated / stats.capacity) * 100}
      />
      <Tile
        label="To seat"
        value={stats.toSeat}
        caption={`of ${stats.attending} attending guests`}
        color={stats.toSeat > 0 ? "var(--mui-palette-warning-main)" : "var(--mui-palette-success-main)"}
      />
      <Tile label="Awaiting reply" value={stats.awaiting} caption="maybe or pending, not seated" />
      <Tile
        label="Couple's rules"
        value={broken === 0 ? "All met" : `${broken} broken`}
        caption={waiting > 0 ? `${waiting} waiting on seating` : "every rule checked"}
        color={broken > 0 ? "var(--mui-palette-error-main)" : "var(--mui-palette-success-main)"}
      />
    </Box>
  );
}
```

```tsx components/UnseatedList.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";
import GuestRow from "@/components/GuestRow";

export default function UnseatedList({ variant }: { variant: "list" | "strip" }) {
  const plan = usePlan();
  const [over, setOver] = React.useState(false);
  const canDrop = plan.dragId !== null && plan.assign[plan.dragId] !== null;
  const strip = variant === "strip";

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Guests without a seat"
      onDragOver={(e: React.DragEvent<HTMLElement>) => {
        if (!canDrop) return;
        e.preventDefault();
        if (!over) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setOver(false);
        const id = plan.dragId ?? e.dataTransfer.getData("text/plain");
        plan.setDragId(null);
        if (id) plan.unseat(id);
      }}
      sx={{
        p: 1.5,
        outline: over ? "2px dashed var(--mui-palette-primary-main)" : "none",
        bgcolor: over ? tint("primary-main", 10) : "background.paper",
      }}
    >
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
          Needs a seat ({plan.unseatedAttending.length})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {canDrop ? "Drop here to unseat" : "Tap or drag a guest"}
        </Typography>
      </Stack>

      {plan.unseatedAttending.length === 0 ? (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1, color: "success.main" }}>
          <CheckCircleIcon fontSize="small" />
          <Typography variant="body2">Everyone attending has a seat.</Typography>
        </Stack>
      ) : (
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            p: 0,
            display: "flex",
            flexDirection: strip ? "row" : "column",
            gap: 1,
            overflowX: strip ? "auto" : "visible",
            pb: strip ? 0.5 : 0,
          }}
        >
          {plan.unseatedAttending.map((g) => (
            <li key={g.id} style={strip ? { flex: "0 0 auto", minWidth: 230 } : undefined}>
              <GuestRow guest={g} />
            </li>
          ))}
        </Box>
      )}

      {plan.unseatedUnconfirmed.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Not confirmed yet ({plan.unseatedUnconfirmed.length})
          </Typography>
          <Box
            component="ul"
            sx={{
              listStyle: "none",
              m: 0,
              mt: 0.5,
              p: 0,
              display: "flex",
              flexDirection: strip ? "row" : "column",
              gap: 1,
              overflowX: strip ? "auto" : "visible",
              pb: strip ? 0.5 : 0,
            }}
          >
            {plan.unseatedUnconfirmed.map((g) => (
              <li key={g.id} style={strip ? { flex: "0 0 auto", minWidth: 230 } : undefined}>
                <GuestRow guest={g} />
              </li>
            ))}
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
}
```

```tsx components/TablePanel.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { guestById, initials, partyColor, tableById, tables } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";
import { Avatar } from "@mui/material";

export default function TablePanel() {
  const plan = usePlan();
  const table = plan.selectedTableId ? tableById[plan.selectedTableId] : null;
  const occ = table ? plan.occupants(table.id) : [];
  const seated = occ.filter((g) => g !== null);
  const diets: Record<string, number> = {};
  for (const g of seated) if (g && g.diet) diets[g.diet] = (diets[g.diet] ?? 0) + 1;
  const flags = table ? (plan.tableFlags[table.id] ?? []) : [];

  return (
    <Paper variant="outlined" component="section" aria-label="Selected table" sx={{ p: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
        <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
          Table details
        </Typography>
        <TextField
          select
          size="small"
          label="Table"
          value={plan.selectedTableId ?? ""}
          onChange={(e) => plan.selectTable(e.target.value || null)}
          sx={{ minWidth: 170 }}
        >
          {tables.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name} ({plan.filled(t.id)}/{t.seats})
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {!table ? (
        <Typography variant="body2" color="text.secondary">
          Select a table on the plan to see who sits there and what they eat.
        </Typography>
      ) : (
        <>
          <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Chip label={`${seated.length} of ${table.seats} seats filled`} size="small" color={seated.length === table.seats ? "success" : "default"} />
            {Object.keys(diets).length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                No dietary needs recorded
              </Typography>
            ) : (
              Object.entries(diets).map(([d, n]) => <Chip key={d} size="small" variant="outlined" label={`${d} × ${n}`} />)
            )}
          </Stack>

          {flags.map((r) => (
            <Stack key={r.id} direction="row" spacing={1} sx={{ mb: 1, p: 1, borderRadius: 1.5, bgcolor: tint("error-main", 10) }}>
              <WarningAmberIcon color="error" fontSize="small" />
              <Typography variant="body2">
                <strong>{r.label}:</strong> {r.subject}. {r.detail}
              </Typography>
            </Stack>
          ))}

          <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 0.75 }}>
            {occ.map((g, i) => (
              <Box
                component="li"
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 0.75,
                  borderRadius: 1.5,
                  border: 1,
                  borderStyle: g ? "solid" : "dashed",
                  borderColor: g && plan.heldId === g.id ? "primary.main" : "divider",
                  minHeight: 52,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ width: 18, textAlign: "right" }}>
                  {i + 1}
                </Typography>
                {g ? (
                  <>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: partyColor(g.party), color: "#fff" }}>
                      {initials(g.name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {g.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {g.party}
                        {g.rsvp !== "yes" ? ` · ${g.rsvp === "maybe" ? "maybe" : "reply pending"}` : ""}
                      </Typography>
                    </Box>
                    {g.diet ? <Chip size="small" label={g.diet} color="warning" variant="outlined" /> : null}
                    {(plan.guestFlags[g.id] ?? []).length > 0 ? (
                      <WarningAmberIcon color="error" fontSize="small" titleAccess="Rule broken" />
                    ) : null}
                    <IconButton
                      size="small"
                      aria-label={`Move ${g.name} to another table`}
                      title="Pick up to move"
                      onClick={() => plan.pick(g.id)}
                      sx={{ width: 40, height: 40 }}
                    >
                      <OpenWithIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`Unseat ${g.name}`}
                      title="Unseat"
                      onClick={() => plan.unseat(g.id)}
                      sx={{ width: 40, height: 40 }}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Empty seat
                    </Typography>
                    {plan.heldId ? (
                      <Button size="small" onClick={() => plan.place(plan.heldId as string, table.id, i)} sx={{ minHeight: 40 }}>
                        Seat {guestById[plan.heldId].name.split(" ")[0]} here
                      </Button>
                    ) : null}
                  </>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
}
```

```tsx components/RulesPanel.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { usePlan } from "@/lib/plan";
import { tint } from "@/lib/ui";
import type { RuleStatus } from "@/lib/rules";

const ORDER: Record<RuleStatus, number> = { broken: 0, pending: 1, ok: 2 };
const STATUS_LABEL: Record<RuleStatus, string> = { broken: "Broken", pending: "Waiting", ok: "Met" };

export default function RulesPanel() {
  const plan = usePlan();
  const sorted = [...plan.rules].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const broken = plan.rules.filter((r) => r.status === "broken").length;

  return (
    <Paper variant="outlined" component="section" aria-label="The couple's rules" sx={{ p: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
          The couple&apos;s rules
        </Typography>
        <Chip
          size="small"
          color={broken > 0 ? "error" : "success"}
          label={broken > 0 ? `${broken} broken` : "All met"}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" role="status" sx={{ mb: 1.25 }}>
        {broken > 0
          ? `${broken} rule${broken > 1 ? "s are" : " is"} broken. The tables involved are marked on the plan.`
          : "No rule is broken with the current seating."}
      </Typography>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
        {sorted.map((r) => {
          const color = r.status === "broken" ? "error" : r.status === "pending" ? "warning" : "success";
          const Icon = r.status === "broken" ? WarningAmberIcon : r.status === "pending" ? HourglassEmptyIcon : CheckCircleIcon;
          const target = r.tableIds[0];
          return (
            <li key={r.id}>
              <ButtonBase
                disabled={!target}
                onClick={() => target && plan.selectTable(target)}
                aria-label={`${r.label}: ${r.subject}. ${STATUS_LABEL[r.status]}. ${r.detail}`}
                sx={{
                  width: "100%",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  gap: 1.25,
                  p: 1.25,
                  borderRadius: 2,
                  border: 1,
                  borderColor: r.status === "broken" ? "error.main" : "divider",
                  bgcolor: r.status === "broken" ? tint("error-main", 8) : "transparent",
                  "&.Mui-disabled": { opacity: 1 },
                }}
              >
                <Icon color={color} fontSize="small" sx={{ mt: 0.25 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {r.label}: {r.subject}
                  </Typography>
                  <Typography variant="body2">{r.detail}</Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    {r.note}
                  </Typography>
                </Box>
                <Chip size="small" variant="outlined" color={color} label={STATUS_LABEL[r.status]} sx={{ ml: "auto", flexShrink: 0 }} />
              </ButtonBase>
            </li>
          );
        })}
      </Box>
    </Paper>
  );
}
```

```tsx components/PlanView.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { event, formatEventDate } from "@/lib/data";
import RoomPlan from "@/components/RoomPlan";
import RulesPanel from "@/components/RulesPanel";
import StatTiles from "@/components/StatTiles";
import TablePanel from "@/components/TablePanel";
import UnseatedList from "@/components/UnseatedList";

export default function PlanView() {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h1" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, letterSpacing: "-0.02em" }}>
          Seating plan
        </Typography>
        <Typography color="text.secondary">
          {event.name} · {formatEventDate(event.date)} · {event.venue}
        </Typography>
      </Box>
      <StatTiles />
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
          alignItems: "start",
        }}
      >
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            <UnseatedList variant="strip" />
          </Box>
          <RoomPlan />
          <RulesPanel />
        </Stack>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <UnseatedList variant="list" />
          </Box>
          <TablePanel />
        </Stack>
      </Box>
    </Stack>
  );
}
```

```tsx components/GuestsView.tsx
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import {
  RSVP_LABEL,
  STANDARD_MEAL,
  diets,
  event,
  formatEventDate,
  guests,
  parties,
  partyColor,
  tableById,
  tables,
  type Rsvp,
} from "@/lib/data";
import { usePlan } from "@/lib/plan";

const RSVP_COLOR: Record<Rsvp, "success" | "warning" | "default" | "error"> = {
  yes: "success",
  maybe: "warning",
  pending: "default",
  no: "error",
};

export default function GuestsView() {
  const plan = usePlan();
  const [query, setQuery] = React.useState("");
  const [party, setParty] = React.useState("all");
  const [rsvp, setRsvp] = React.useState("all");
  const [diet, setDiet] = React.useState("all");
  const [seating, setSeating] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q) && !g.party.toLowerCase().includes(q)) return false;
      if (party !== "all" && g.party !== party) return false;
      if (rsvp !== "all" && g.rsvp !== rsvp) return false;
      if (diet === "any" && !g.diet) return false;
      if (diet === "none" && g.diet) return false;
      if (diet !== "all" && diet !== "any" && diet !== "none" && g.diet !== diet) return false;
      const seated = plan.assign[g.id] !== null;
      if (seating === "seated" && !seated) return false;
      if (seating === "unseated" && seated) return false;
      return true;
    });
  }, [query, party, rsvp, diet, seating, plan.assign]);

  const filtersActive = query !== "" || party !== "all" || rsvp !== "all" || diet !== "all" || seating !== "all";
  const reset = () => {
    setQuery("");
    setParty("all");
    setRsvp("all");
    setDiet("all");
    setSeating("all");
  };

  const meals = React.useMemo(() => {
    const names = [STANDARD_MEAL, ...diets];
    return names.map((meal) => {
      const match = (d: string | null) => (meal === STANDARD_MEAL ? d === null : d === meal);
      return {
        meal,
        attending: guests.filter((g) => g.rsvp === "yes" && match(g.diet)).length,
        unconfirmed: guests.filter((g) => (g.rsvp === "maybe" || g.rsvp === "pending") && match(g.diet)).length,
      };
    });
  }, []);
  const totalAttending = meals.reduce((n, m) => n + m.attending, 0);
  const totalUnconfirmed = meals.reduce((n, m) => n + m.unconfirmed, 0);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" flexWrap="wrap" justifyContent="space-between" alignItems="flex-end" gap={1.5}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Guest list
          </Typography>
          <Typography color="text.secondary">
            {event.name} · {formatEventDate(event.date)} · {guests.length} invited, {totalAttending} attending
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ minHeight: 44, displayPrint: "none" }}>
          Print for the caterer
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 400px" },
          alignItems: "start",
        }}
      >
        <Paper variant="outlined" sx={{ minWidth: 0 }}>
          <Box
            sx={{
              p: 1.5,
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr 1fr", md: "2fr 1fr 1fr 1fr 1fr" },
              displayPrint: "none",
            }}
          >
            <TextField
              type="search"
              size="small"
              label="Search guests"
              placeholder="Name or party"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField select size="small" label="Party" value={party} onChange={(e) => setParty(e.target.value)}>
              <MenuItem value="all">All parties</MenuItem>
              {parties.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="RSVP" value={rsvp} onChange={(e) => setRsvp(e.target.value)}>
              <MenuItem value="all">Any RSVP</MenuItem>
              {(Object.keys(RSVP_LABEL) as Rsvp[]).map((r) => (
                <MenuItem key={r} value={r}>
                  {RSVP_LABEL[r]}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
              <MenuItem value="all">Any diet</MenuItem>
              <MenuItem value="any">Has a dietary need</MenuItem>
              <MenuItem value="none">No dietary need</MenuItem>
              {diets.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Seating" value={seating} onChange={(e) => setSeating(e.target.value)}>
              <MenuItem value="all">Seated or not</MenuItem>
              <MenuItem value="seated">Seated</MenuItem>
              <MenuItem value="unseated">Not seated</MenuItem>
            </TextField>
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 1.5, pb: 1, minHeight: 36 }}
          >
            <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">
              Showing {filtered.length} of {guests.length} guests
            </Typography>
            {filtersActive ? (
              <Button size="small" onClick={reset} sx={{ displayPrint: "none" }}>
                Clear filters
              </Button>
            ) : null}
          </Stack>
          <TableContainer sx={{ borderTop: 1, borderColor: "divider" }}>
            <Table size="small" aria-label="Guest list">
              <TableHead>
                <TableRow>
                  <TableCell>Guest</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Party</TableCell>
                  <TableCell>RSVP</TableCell>
                  <TableCell>Meal</TableCell>
                  <TableCell>Table</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((g) => {
                  const ref = plan.assign[g.id];
                  return (
                    <TableRow key={g.id} hover>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: partyColor(g.party), flexShrink: 0 }} />
                          <Box>
                            {g.name}
                            <Typography variant="caption" color="text.secondary" component="div" sx={{ display: { xs: "block", sm: "none" }, fontWeight: 400 }}>
                              {g.party}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{g.party}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" color={RSVP_COLOR[g.rsvp]} label={RSVP_LABEL[g.rsvp]} />
                      </TableCell>
                      <TableCell>
                        {g.diet ? <Chip size="small" color="warning" variant="outlined" label={g.diet} /> : <Typography variant="body2" color="text.secondary">{STANDARD_MEAL}</Typography>}
                      </TableCell>
                      <TableCell>
                        {ref ? (
                          <Typography variant="body2">
                            {tableById[ref.tableId].name}
                            <Typography component="span" variant="caption" color="text.secondary">
                              {" "}
                              · seat {ref.seat + 1}
                            </Typography>
                          </Typography>
                        ) : g.rsvp === "no" ? (
                          <Typography variant="body2" color="text.secondary">
                            Not needed
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                            Not seated
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                      No guests match these filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Paper variant="outlined" component="section" aria-label="Meal counts for the caterer" sx={{ p: 1.5 }}>
            <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700 }}>
              Meals for the caterer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Attending guests only. Maybe and pending replies are counted apart.
            </Typography>
            <TableContainer>
              <Table size="small" aria-label="Meal counts">
                <TableHead>
                  <TableRow>
                    <TableCell>Meal</TableCell>
                    <TableCell align="right">Attending</TableCell>
                    <TableCell align="right">Unconfirmed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {meals.map((m) => (
                    <TableRow key={m.meal}>
                      <TableCell component="th" scope="row">
                        {m.meal}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {m.attending}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.secondary" }}>
                        {m.unconfirmed}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 800, borderBottom: 0 }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, borderBottom: 0 }}>
                      {totalAttending}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", borderBottom: 0 }}>
                      {totalUnconfirmed}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper variant="outlined" component="section" aria-label="Dietary needs by table" sx={{ p: 1.5 }}>
            <Typography variant="h2" sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}>
              Dietary needs by table
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
              {tables.map((t) => {
                const seated = plan.occupants(t.id).filter((g) => g !== null);
                const needs: Record<string, number> = {};
                for (const g of seated) if (g && g.diet) needs[g.diet] = (needs[g.diet] ?? 0) + 1;
                return (
                  <Box component="li" key={t.id} sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 84 }}>
                      {t.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 52 }}>
                      {seated.length} guests
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {Object.keys(needs).length === 0
                        ? "No dietary needs"
                        : Object.entries(needs)
                            .map(([d, n]) => `${d} × ${n}`)
                            .join(", ")}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import PlanView from "@/components/PlanView";

export const metadata: Metadata = { title: "Seating plan" };

export default function Page() {
  return <PlanView />;
}
```

```tsx app/guests/page.tsx
import type { Metadata } from "next";
import GuestsView from "@/components/GuestsView";

export const metadata: Metadata = { title: "Guest list" };

export default function Page() {
  return <GuestsView />;
}
```

```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import AppShell from "@/components/AppShell";
import { PlanProvider } from "@/lib/plan";
import theme from "./theme";

export const metadata: Metadata = {
  title: { default: "Seatwise", template: "%s · Seatwise" },
  description: "Seatwise, a seating planner for wedding and event planners.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <PlanProvider>
              <AppShell>{children}</AppShell>
            </PlanProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes, system font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2f5d50" },
        secondary: { main: "#b4532a" },
        background: { default: "#f5f3ee", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#8fc3ae" },
        secondary: { main: "#e29a73" },
        background: { default: "#111619", paper: "#1a2125" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
```
