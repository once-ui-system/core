export type Rsvp = "yes" | "no" | "maybe" | "pending";

export interface Guest {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
}

export interface Table {
  id: string;
  name: string;
  shape: "round" | "long";
  seats: number;
  x: number;
  y: number;
  rotation: number;
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

export interface Rule {
  id: string;
  kind: "together" | "apart" | "near";
  guests: string[];
  note: string;
  /** near rules: the fixture to sit close to, and how close (metres, table centre to fixture centre). */
  target?: string;
  maxFromTarget?: number;
  /** near rules: the fixture to sit away from, and how far. */
  awayFrom?: string;
  minFromAway?: number;
  /** Something Hannah should double-check in the source data. */
  caveat?: string;
}

export const APP_NAME = "Seatwise";

export const EVENT = {
  name: "Ines & Mateo's wedding dinner",
  date: "2027-06-19",
  venue: "The Orangery, Hollin Hall",
  room: { width: 24, depth: 14 },
};

export const PLANNER = { name: "Hannah Brook", initials: "HB" };

export const FIXTURES: Fixture[] = [
  { id: "f-1", kind: "stage", label: "Band", x: 10, y: 0.5, w: 4, h: 2 },
  { id: "f-2", kind: "dancefloor", label: "Dance floor", x: 8.5, y: 3, w: 7, h: 4 },
  { id: "f-3", kind: "bar", label: "Bar", x: 21, y: 10, w: 2.5, h: 3.5 },
  { id: "f-4", kind: "door", label: "Garden doors", x: 0, y: 6, w: 0.5, h: 2.5 },
];

export const TABLES: Table[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5, rotation: 0 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7, rotation: 0 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5, rotation: 0 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5, rotation: 0 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7, rotation: 0 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12, rotation: 0 },
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
  { id: "r-1", kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { id: "r-2", kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    id: "r-3",
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
    caveat:
      "The note names Sean and Ryan Doyle, but the rule lists Kai Brennan and Sean Doyle. Worth confirming which pair is meant.",
  },
  {
    id: "r-4",
    kind: "apart",
    guests: ["g-12", "g-34"],
    note: "Ask the couple: old family dispute",
  },
  {
    id: "r-5",
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
    target: "f-4",
    maxFromTarget: 4.5,
    awayFrom: "f-1",
    minFromAway: 7,
  },
];

export const RULE_LABEL: Record<Rule["kind"], string> = {
  together: "Keep together",
  apart: "Keep apart",
  near: "Seat near",
};

export const PARTY_ORDER = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
];

/** Mantine colour name per party, used for seat fills and legends. */
export const PARTY_COLOR: Record<string, string> = {
  Couple: "grape",
  "Bride's family": "cyan",
  "Groom's family": "ember",
  "University friends": "indigo",
  "Work friends": "teal",
  "Groom's football club": "pink",
  "Plus-ones": "gray",
};

export const DIET_COLOR: Record<string, string> = {
  Vegetarian: "green",
  Vegan: "teal",
  "Gluten free": "yellow",
  "Nut allergy": "red",
  Halal: "violet",
  "Soft food": "orange",
  Pescatarian: "cyan",
  "Children's menu": "pink",
};

export const STANDARD_MEAL = "Standard menu";

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "No reply yet",
  no: "Declined",
};

export const RSVP_COLOR: Record<Rsvp, string> = {
  yes: "green",
  maybe: "yellow",
  pending: "gray",
  no: "red",
};

export const GUESTS_BY_ID: Record<string, Guest> = Object.fromEntries(
  GUESTS.map((x) => [x.id, x]),
);
export const TABLES_BY_ID: Record<string, Table> = Object.fromEntries(
  TABLES.map((x) => [x.id, x]),
);
export const FIXTURES_BY_ID: Record<string, Fixture> = Object.fromEntries(
  FIXTURES.map((x) => [x.id, x]),
);

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}
