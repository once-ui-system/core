export type Rsvp = "yes" | "no" | "maybe" | "pending";

export type Guest = {
  id: string;
  name: string;
  party: string;
  rsvp: Rsvp;
  diet: string | null;
  table: string | null;
};

export type TableShape = "round" | "long";

export type TableDef = {
  id: string;
  name: string;
  shape: TableShape;
  seats: number;
  x: number;
  y: number;
  rotation?: number;
};

export type FixtureKind = "stage" | "dancefloor" | "bar" | "door";

export type Fixture = {
  id: string;
  kind: FixtureKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type RuleKind = "together" | "apart" | "near";

export type Rule = {
  kind: RuleKind;
  guests: string[];
  note: string;
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

export const tables: TableDef[] = [
  { id: "t-head", name: "Top table", shape: "long", seats: 8, x: 8, y: 8.2, rotation: 0 },
  { id: "t-1", name: "Table 1", shape: "round", seats: 8, x: 3, y: 2.5 },
  { id: "t-2", name: "Table 2", shape: "round", seats: 8, x: 3, y: 7 },
  { id: "t-3", name: "Table 3", shape: "round", seats: 8, x: 3, y: 11.5 },
  { id: "t-4", name: "Table 4", shape: "round", seats: 8, x: 19, y: 2.5 },
  { id: "t-5", name: "Table 5", shape: "round", seats: 8, x: 19, y: 7 },
  { id: "t-6", name: "Table 6", shape: "round", seats: 6, x: 12, y: 12 },
];

type G = [string, string, string, Rsvp, string | null, string | null];

const guestRows: G[] = [
  ["g-01", "Ines Carvalho", "Couple", "yes", null, "t-head"],
  ["g-02", "Mateo Alvarez", "Couple", "yes", "Vegetarian", "t-head"],
  ["g-03", "Rui Carvalho", "Bride's family", "yes", null, "t-head"],
  ["g-04", "Marta Carvalho", "Bride's family", "yes", "Gluten free", "t-head"],
  ["g-05", "Javier Alvarez", "Groom's family", "yes", null, "t-head"],
  ["g-06", "Lucia Alvarez", "Groom's family", "yes", null, "t-head"],
  ["g-07", "Sofia Carvalho", "Bride's family", "yes", null, "t-1"],
  ["g-08", "Tiago Carvalho", "Bride's family", "yes", null, "t-1"],
  ["g-09", "Avó Rosa Carvalho", "Bride's family", "yes", "Soft food", "t-1"],
  ["g-10", "Pedro Nunes", "Bride's family", "yes", null, "t-1"],
  ["g-11", "Ana Nunes", "Bride's family", "yes", "Vegan", "t-1"],
  ["g-12", "Carmen Alvarez", "Groom's family", "yes", null, "t-4"],
  ["g-13", "Diego Alvarez", "Groom's family", "yes", null, "t-4"],
  ["g-14", "Elena Ruiz", "Groom's family", "yes", "Nut allergy", "t-4"],
  ["g-15", "Pablo Ruiz", "Groom's family", "yes", null, "t-4"],
  ["g-16", "Isabel Ruiz", "Groom's family", "maybe", null, null],
  ["g-17", "Chloe Martin", "University friends", "yes", null, "t-2"],
  ["g-18", "Ben Okafor", "University friends", "yes", null, "t-2"],
  ["g-19", "Leila Haddad", "University friends", "yes", "Halal", "t-2"],
  ["g-20", "Omar Haddad", "University friends", "yes", "Halal", "t-2"],
  ["g-21", "Freya Lund", "University friends", "yes", "Vegetarian", null],
  ["g-22", "Jonas Lund", "University friends", "yes", null, null],
  ["g-23", "Grace Lee", "Work friends", "yes", null, "t-5"],
  ["g-24", "Marcus Webb", "Work friends", "yes", null, "t-5"],
  ["g-25", "Nadia Petrova", "Work friends", "yes", "Pescatarian", "t-5"],
  ["g-26", "Tom Fisher", "Work friends", "no", null, null],
  ["g-27", "Hana Sato", "Work friends", "yes", null, null],
  ["g-28", "Luis Ortega", "Groom's football club", "yes", null, "t-3"],
  ["g-29", "Kai Brennan", "Groom's football club", "yes", null, "t-3"],
  ["g-30", "Sean Doyle", "Groom's football club", "yes", null, "t-3"],
  ["g-31", "Ryan Doyle", "Groom's football club", "yes", null, null],
  ["g-32", "Hugo Carvalho", "Bride's family", "yes", "Children's menu", "t-1"],
  ["g-33", "Mia Carvalho", "Bride's family", "yes", "Children's menu", null],
  ["g-34", "Paula Mendes", "Bride's family", "pending", null, null],
  ["g-35", "Victor Mendes", "Bride's family", "pending", null, null],
  ["g-36", "Zoe Bennett", "Plus-ones", "yes", null, "t-2"],
  ["g-37", "Arjun Mehta", "Plus-ones", "yes", "Vegetarian", "t-5"],
  ["g-38", "Laura Svensson", "Plus-ones", "yes", null, null],
];

export const guests: Guest[] = guestRows.map(([id, name, party, rsvp, diet, table]) => ({
  id,
  name,
  party,
  rsvp,
  diet,
  table,
}));

export const rules: Rule[] = [
  { kind: "together", guests: ["g-21", "g-22"], note: "Couple" },
  { kind: "together", guests: ["g-32", "g-33"], note: "Siblings, under 10" },
  {
    kind: "apart",
    guests: ["g-29", "g-30"],
    note: "Brothers Sean and Ryan Doyle are not speaking",
  },
  { kind: "apart", guests: ["g-12", "g-34"], note: "Ask the couple: old family dispute" },
  {
    kind: "near",
    guests: ["g-09"],
    note: "Avó Rosa uses a wheelchair: seat near the garden doors, away from the band",
  },
];

export const rsvpLabel: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const STANDARD_MEAL = "Standard menu";

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
