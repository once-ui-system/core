```ts src/lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export interface Vet {
  id: string;
  name: string;
  room: string;
}
export interface Owner {
  id: string;
  name: string;
  phone: string;
}
export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
}
export interface Appointment {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  checkedInAt?: string;
}
export interface PatientRecord {
  weights_kg: { date: string; kg: number }[];
  vaccinations: { name: string; given: string; due: string }[];
  medications: { name: string; dose: string; since: string }[];
  visits: { date: string; vet: string; reason: string; notes: string; invoice_usd: number }[];
}

export const CLINIC = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
/** The demo clock: the front desk view is a snapshot of mid-morning. */
export const NOW = "09:52";

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

export const VETS: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
];

export const OWNERS: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const PATIENTS: Patient[] = [
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const APPOINTMENTS: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:10" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:41" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const RECORDS: Record<string, PatientRecord> = {
  "p-104": {
    weights_kg: [
      { date: "2025-05-14", kg: 31.8 },
      { date: "2025-08-20", kg: 31.1 },
      { date: "2025-11-03", kg: 30.4 },
      { date: "2026-02-11", kg: 29.9 },
      { date: "2026-06-17", kg: 29.2 },
      { date: "2026-11-12", kg: 28.6 },
    ],
    vaccinations: [
      { name: "Rabies", given: "2024-10-02", due: "2027-10-02" },
      { name: "DHPP", given: "2025-10-15", due: "2026-10-15" },
      { name: "Leptospirosis", given: "2025-10-15", due: "2026-10-15" },
      { name: "Bordetella", given: "2026-04-08", due: "2027-04-08" },
    ],
    medications: [
      { name: "Benazepril 5 mg", dose: "1 tablet daily", since: "2025-08-20" },
      { name: "Renal diet (dry)", dose: "2.5 cups daily", since: "2025-08-20" },
    ],
    visits: [
      { date: "2026-11-12", vet: "v-2", reason: "Kidney panel recheck", notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.", invoice_usd: 186.0 },
      { date: "2026-06-17", vet: "v-2", reason: "Kidney panel recheck", notes: "Stable. Appetite good. Owner reports more drinking in hot weather.", invoice_usd: 172.5 },
      { date: "2026-02-11", vet: "v-1", reason: "Coughing", notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).", invoice_usd: 94.0 },
      { date: "2025-11-03", vet: "v-2", reason: "Senior wellness exam", notes: "Grade 2 dental tartar. Dental cleaning recommended.", invoice_usd: 148.0 },
    ],
  },
};

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export function patientOf(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}
export function ownerOf(id: string): Owner | undefined {
  return OWNERS.find((o) => o.id === id);
}
export function vetOf(id: string): Vet | undefined {
  return VETS.find((v) => v.id === id);
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
export function toTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function endTime(start: string, minutes: number): string {
  return toTime(toMinutes(start) + minutes);
}

/** An active appointment of the same vet that overlaps the proposed slot. */
export function findClash(
  list: Appointment[],
  vetId: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMinutes(start);
  const e = s + minutes;
  return list.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled") return false;
    const as = toMinutes(a.start);
    const ae = as + a.minutes;
    return as < e && s < ae;
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m, d];
}
export function formatDate(iso: string): string {
  const [y, m, d] = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export function monthYear(iso: string): string {
  const [y, m] = parts(iso);
  return `${MONTHS[m - 1]} ${y}`;
}
export function longDate(iso: string): string {
  const [y, m, d] = parts(iso);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[wd]} ${d} ${MONTHS[m - 1]} ${y}`;
}
export function daysBetween(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = parts(fromIso);
  const [y2, m2, d2] = parts(toIso);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}
export function ageText(born: string, today: string): string {
  const [by, bm, bd] = parts(born);
  const [ty, tm, td] = parts(today);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest ? `${years} yr ${rest} mo` : `${years} yr`;
}
export function money(n: number): string {
  return `$${n.toFixed(2)}`;
}
```

```tsx src/components/pawpoint/Alerts.tsx
export function WarnIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false" className="pp-alert-icon">
      <path d="M10 2.2 19 17.8H1L10 2.2Z" fill="currentColor" />
      <path d="M10 7.6v4.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.6" r="1.1" fill="#fff" />
    </svg>
  );
}

export function AlertBadges({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
  if (alerts.length === 0) return null;
  return (
    <ul className={`pp-alerts pp-alerts-${size}`} aria-label="Medical alerts">
      {alerts.map((a) => (
        <li key={a} className="pp-alert">
          <WarnIcon />
          <span>
            <span className="pp-vh">Medical alert: </span>
            {a}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

```tsx src/components/pawpoint/PatientSearch.tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PATIENTS, ownerOf } from "@/lib/data";
import { AlertBadges } from "./Alerts";

function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function PatientSearch() {
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return PATIENTS.filter((p) => {
      const o = ownerOf(p.owner);
      return [p.name, o?.name ?? "", p.species, p.breed].some((t) => norm(t).includes(q));
    });
  }, [query]);

  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const showing = open && query.trim().length > 0;

  return (
    <div className="pp-search" ref={box} role="search">
      <label htmlFor={`${id}-q`} className="pp-vh">
        Search patients or owners
      </label>
      <svg className="pp-search-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m13 13 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        id={`${id}-q`}
        type="search"
        autoComplete="off"
        placeholder="Find a patient or owner"
        value={query}
        aria-controls={`${id}-results`}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          } else if (e.key === "Enter" && results.length > 0) {
            e.preventDefault();
            setOpen(false);
            router.push(`/patients/${results[0].id}`);
          }
        }}
      />
      <div className="pp-vh" role="status" aria-live="polite">
        {showing ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </div>
      {showing && (
        <div className="pp-results" id={`${id}-results`}>
          {results.length === 0 ? (
            <p className="pp-results-empty">No patient or owner matches “{query.trim()}”.</p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/patients/${p.id}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="pp-result-name">{p.name}</span>
                    <span className="pp-result-meta">
                      {p.species}, {p.breed} · {ownerOf(p.owner)?.name}
                    </span>
                    <AlertBadges alerts={p.alerts} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

```tsx src/components/pawpoint/Shell.tsx
import Link from "next/link";
import "./pawpoint.css";
import { CLINIC, USER } from "@/lib/data";
import PatientSearch from "./PatientSearch";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function Shell({ children, current }: { children: React.ReactNode; current: "schedule" | "patient" }) {
  return (
    <div className="pp-app">
      <a href="#main" className="pp-skip">
        Skip to content
      </a>
      <header className="pp-header">
        <div className="pp-header-in">
          <Link href="/" className="pp-brand" aria-label="Pawpoint, today's schedule">
            <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true" focusable="false">
              <rect width="32" height="32" rx="9" fill="#0f766e" />
              <ellipse cx="16" cy="20.5" rx="6" ry="5" fill="#fff" />
              <circle cx="8.8" cy="14.5" r="2.5" fill="#fff" />
              <circle cx="13" cy="9.8" r="2.5" fill="#fff" />
              <circle cx="19" cy="9.8" r="2.5" fill="#fff" />
              <circle cx="23.2" cy="14.5" r="2.5" fill="#fff" />
            </svg>
            <span className="pp-brand-text">
              <strong>Pawpoint</strong>
              <span>{CLINIC}</span>
            </span>
          </Link>
          <nav className="pp-nav" aria-label="Main">
            <Link href="/" aria-current={current === "schedule" ? "page" : undefined}>
              Schedule
            </Link>
            {current === "patient" && (
              <span className="pp-nav-here" aria-current="page">
                Patient record
              </span>
            )}
          </nav>
          <PatientSearch />
          <div className="pp-user">
            <span className="pp-avatar" aria-hidden="true">
              {initials(USER.name)}
            </span>
            <span className="pp-user-text">
              <strong>{USER.name}</strong>
              <span>{USER.role}</span>
            </span>
          </div>
        </div>
      </header>
      <main id="main" className="pp-page">
        {children}
      </main>
    </div>
  );
}
```

```tsx src/components/pawpoint/Schedule.tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  APPOINTMENTS,
  NOW,
  OWNERS,
  PATIENTS,
  STATUS_LABEL,
  TODAY,
  VETS,
  endTime,
  findClash,
  longDate,
  ownerOf,
  patientOf,
  toMinutes,
  toTime,
  vetOf,
  type Appointment,
  type Status,
} from "@/lib/data";
import { AlertBadges, WarnIcon } from "./Alerts";

const TIMES: string[] = [];
for (let m = 8 * 60; m < 18 * 60; m += 15) TIMES.push(toTime(m));
const LENGTHS = [15, 20, 30, 45, 60, 90];

function waitMinutes(a: Appointment): number {
  return Math.max(0, toMinutes(NOW) - toMinutes(a.checkedInAt ?? NOW));
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`pp-badge pp-st-${status}`}>
      <span className="pp-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [notice, setNotice] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Booking form
  const formId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [patientId, setPatientId] = useState(PATIENTS[0].id);
  const [vetId, setVetId] = useState(VETS[0].id);
  const [time, setTime] = useState("10:00");
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("Follow-up visit");
  const [error, setError] = useState("");

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const sorted = useMemo(
    () =>
      [...appts].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet),
      ),
    [appts],
  );
  const visible = sorted.filter((a) => vetFilter === "all" || a.vet === vetFilter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMinutes(a.checkedInAt ?? NOW) - toMinutes(b.checkedInAt ?? NOW));
  const inExam = appts.filter((a) => a.status === "in_exam").length;
  const toCome = appts.filter((a) => a.status === "booked").length;
  const done = appts.filter((a) => a.status === "done").length;
  const activeTotal = appts.filter((a) => a.status !== "cancelled").length;
  const longest = waiting.length ? waitMinutes(waiting[0]) : 0;
  const nextUp = sorted.find((a) => a.status === "booked");

  function setStatus(a: Appointment, status: Status) {
    setAppts((list) =>
      list.map((x) =>
        x.id === a.id ? { ...x, status, checkedInAt: status === "checked_in" ? NOW : x.checkedInAt } : x,
      ),
    );
    const p = patientOf(a.patient);
    const msg: Record<string, string> = {
      checked_in: `${p?.name} is checked in and added to the waiting list.`,
      in_exam: `${p?.name} is now in the exam room.`,
      done: `${p?.name}'s visit is marked done.`,
    };
    setNotice(msg[status] ?? "");
    setFlash(a.id);
  }

  const clash = findClash(appts, vetId, time, minutes);
  function nextFree(): string | null {
    for (let m = toMinutes(time); m + minutes <= 18 * 60; m += 15) {
      if (!findClash(appts, vetId, toTime(m), minutes)) return toTime(m);
    }
    return null;
  }

  function openDialog() {
    setError("");
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = findClash(appts, vetId, time, minutes);
    if (c) {
      const cp = patientOf(c.patient);
      setError(
        `${vetOf(vetId)?.name} is already booked ${c.start} to ${endTime(c.start, c.minutes)} (${cp?.name}, ${c.reason}).`,
      );
      return;
    }
    const id = `a-${String(appts.length + 1).padStart(2, "0")}-new`;
    setAppts((list) => [
      ...list,
      { id, patient: patientId, vet: vetId, start: time, minutes, reason: reason.trim() || "Visit", status: "booked" },
    ]);
    setNotice(`Booked ${patientOf(patientId)?.name} with ${vetOf(vetId)?.name} at ${time}.`);
    setFlash(id);
    setOpen(false);
  }

  const chosen = patientOf(patientId);
  const suggestion = clash ? nextFree() : null;

  return (
    <>
      <div className="pp-title-row">
        <div>
          <h1 className="pp-h1">Today’s schedule</h1>
          <p className="pp-sub">
            {longDate(TODAY)} · It is {NOW}
          </p>
        </div>
        <button type="button" className="pp-btn pp-btn-primary pp-btn-lg" onClick={openDialog}>
          <span aria-hidden="true">+</span> Book appointment
        </button>
      </div>

      <div className="pp-live" role="status" aria-live="polite">
        {notice && <p className="pp-notice">{notice}</p>}
      </div>

      <section className="pp-stats" aria-label="Clinic status">
        <div className="pp-stat">
          <span className="pp-stat-n">{inExam}</span>
          <span className="pp-stat-l">In exam</span>
        </div>
        <div className={`pp-stat${longest >= 30 ? " pp-stat-warn" : ""}`}>
          <span className="pp-stat-n">{waiting.length}</span>
          <span className="pp-stat-l">{waiting.length ? `Waiting, longest ${longest} min` : "Waiting"}</span>
        </div>
        <div className="pp-stat">
          <span className="pp-stat-n">{toCome}</span>
          <span className="pp-stat-l">
            Still to arrive{nextUp ? `, next ${nextUp.start}` : ""}
          </span>
        </div>
        <div className="pp-stat">
          <span className="pp-stat-n">
            {done}
            <small>/{activeTotal}</small>
          </span>
          <span className="pp-stat-l">Done today</span>
        </div>
      </section>

      <div className="pp-grid">
        <section aria-labelledby="sched-h" className="pp-card pp-sched">
          <div className="pp-card-head">
            <h2 id="sched-h" className="pp-h2">
              All appointments
            </h2>
            <div className="pp-chips" role="group" aria-label="Filter by vet">
              <button type="button" aria-pressed={vetFilter === "all"} onClick={() => setVetFilter("all")}>
                All vets
              </button>
              {VETS.map((v) => (
                <button key={v.id} type="button" aria-pressed={vetFilter === v.id} onClick={() => setVetFilter(v.id)}>
                  {v.name.replace("Dr. ", "")}
                </button>
              ))}
            </div>
          </div>
          <ul className="pp-list">
            {visible.map((a) => {
              const p = patientOf(a.patient);
              const o = p ? ownerOf(p.owner) : undefined;
              const v = vetOf(a.vet);
              if (!p) return null;
              return (
                <li
                  key={a.id}
                  className={`pp-appt pp-row-${a.status}${a.urgent ? " pp-urgent" : ""}${flash === a.id ? " pp-flash" : ""}`}
                >
                  <div className="pp-a-time">
                    <strong>{a.start}</strong>
                    <span>{a.minutes} min</span>
                  </div>
                  <div className="pp-a-main">
                    <div className="pp-a-who">
                      {a.urgent && (
                        <span className="pp-urgent-tag">
                          <WarnIcon /> Urgent
                        </span>
                      )}
                      <Link href={`/patients/${p.id}`} className="pp-pname">
                        {p.name}
                      </Link>
                      <span className="pp-muted">
                        {p.species} · {o?.name}
                      </span>
                    </div>
                    <p className="pp-a-reason">{a.reason}</p>
                    <AlertBadges alerts={p.alerts} size="sm" />
                  </div>
                  <div className="pp-a-vet">
                    <strong>{v?.name}</strong>
                    <span>{v?.room}</span>
                  </div>
                  <div className="pp-a-status">
                    <StatusBadge status={a.status} />
                    {a.status === "checked_in" && <span className="pp-muted">waiting {waitMinutes(a)} min</span>}
                  </div>
                  <div className="pp-a-act">
                    {a.status === "booked" && (
                      <button
                        type="button"
                        className="pp-btn pp-btn-primary"
                        aria-label={`Check in ${p.name}`}
                        onClick={() => setStatus(a, "checked_in")}
                      >
                        Check in
                      </button>
                    )}
                    {a.status === "checked_in" && (
                      <button
                        type="button"
                        className="pp-btn"
                        aria-label={`Send ${p.name} to exam`}
                        onClick={() => setStatus(a, "in_exam")}
                      >
                        Start exam
                      </button>
                    )}
                    {a.status === "in_exam" && (
                      <button
                        type="button"
                        className="pp-btn"
                        aria-label={`Mark ${p.name} done`}
                        onClick={() => setStatus(a, "done")}
                      >
                        Mark done
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside aria-labelledby="wait-h" className="pp-card pp-wait">
          <div className="pp-card-head">
            <h2 id="wait-h" className="pp-h2">
              Waiting room
            </h2>
            <span className="pp-count" aria-label={`${waiting.length} waiting`}>
              {waiting.length}
            </span>
          </div>
          {waiting.length === 0 ? (
            <p className="pp-empty">No one is waiting. Check in a booked patient when they arrive.</p>
          ) : (
            <ol className="pp-wait-list">
              {waiting.map((a, i) => {
                const p = patientOf(a.patient);
                const w = waitMinutes(a);
                if (!p) return null;
                return (
                  <li key={a.id} className={w >= 30 ? "pp-long" : undefined}>
                    <span className="pp-pos" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div className="pp-wait-body">
                      <div className="pp-wait-top">
                        <Link href={`/patients/${p.id}`} className="pp-pname">
                          {p.name}
                        </Link>
                        <strong className="pp-wait-time">{w} min</strong>
                      </div>
                      <span className="pp-muted">
                        {ownerOf(p.owner)?.name} · for {vetOf(a.vet)?.name}, booked {a.start}
                      </span>
                      <span className="pp-muted">Checked in {a.checkedInAt}</span>
                      <AlertBadges alerts={p.alerts} size="sm" />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>
      </div>

      <dialog
        ref={dialog}
        className="pp-dialog"
        aria-labelledby={`${formId}-t`}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false);
        }}
      >
        <form onSubmit={submit} className="pp-form">
          <div className="pp-form-head">
            <h2 id={`${formId}-t`} className="pp-h2">
              Book an appointment
            </h2>
            <button type="button" className="pp-btn pp-btn-ghost" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>
          <p className="pp-muted">{longDate(TODAY)}</p>

          <label className="pp-field">
            <span>Patient</span>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              {PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}) — {ownerOf(p.owner)?.name}
                </option>
              ))}
            </select>
          </label>
          {chosen && chosen.alerts.length > 0 && <AlertBadges alerts={chosen.alerts} size="md" />}

          <label className="pp-field">
            <span>Vet</span>
            <select value={vetId} onChange={(e) => setVetId(e.target.value)}>
              {VETS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.room}
                </option>
              ))}
            </select>
          </label>

          <div className="pp-field-row">
            <label className="pp-field">
              <span>Time</span>
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="pp-field">
              <span>Length</span>
              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {LENGTHS.map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="pp-field">
            <span>Reason</span>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>

          {clash && (
            <div className="pp-clash" role="alert">
              <WarnIcon />
              <div>
                <strong>That time clashes.</strong>{" "}
                {vetOf(vetId)?.name} has {patientOf(clash.patient)?.name} ({clash.reason}) from {clash.start} to{" "}
                {endTime(clash.start, clash.minutes)}.
                {suggestion && (
                  <>
                    {" "}
                    <button type="button" className="pp-link" onClick={() => setTime(suggestion)}>
                      Use next free time, {suggestion}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {error && !clash && (
            <p className="pp-clash" role="alert">
              {error}
            </p>
          )}

          <div className="pp-form-foot">
            <button type="button" className="pp-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="pp-btn pp-btn-primary pp-btn-lg" disabled={Boolean(clash)}>
              Book {time} with {vetOf(vetId)?.name.replace("Dr. ", "Dr ")}
            </button>
          </div>
        </form>
      </dialog>
      <span className="pp-vh">{OWNERS.length} owners on file</span>
    </>
  );
}
```

```tsx src/components/pawpoint/WeightChart.tsx
import { formatDate, monthYear } from "@/lib/data";

export default function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const W = 480;
  const H = 240;
  const pl = 40;
  const pr = 26;
  const pt = 30;
  const pb = 46;
  const times = points.map((p) => Date.parse(p.date));
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);
  const kgs = points.map((p) => p.kg);
  const lo = Math.floor(Math.min(...kgs) - 0.5);
  const hi = Math.ceil(Math.max(...kgs) + 0.5);
  const x = (t: number) => pl + ((t - t0) / (t1 - t0 || 1)) * (W - pl - pr);
  const y = (kg: number) => pt + ((hi - kg) / (hi - lo)) * (H - pt - pb);
  const grid: number[] = [];
  for (let g = lo; g <= hi; g += 1) grid.push(g);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(Date.parse(p.date)).toFixed(1)} ${y(p.kg).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const label = `Weight in kilograms from ${formatDate(first.date)} (${first.kg}) to ${formatDate(last.date)} (${last.kg})`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="pp-chart">
      {grid.map((g) => (
        <g key={g}>
          <line x1={pl} x2={W - pr} y1={y(g)} y2={y(g)} stroke="#dbe3e0" strokeWidth="1" />
          <text x={pl - 8} y={y(g) + 4} textAnchor="end" fontSize="12" fill="#55635e">
            {g}
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => {
        const cx = x(Date.parse(p.date));
        const isLast = i === points.length - 1;
        return (
          <g key={p.date}>
            <circle cx={cx} cy={y(p.kg)} r={isLast ? 6 : 4.5} fill={isLast ? "#0f766e" : "#fff"} stroke="#0f766e" strokeWidth="2.5" />
            <text x={cx} y={y(p.kg) - 12} textAnchor="middle" fontSize="13" fontWeight={isLast ? 700 : 500} fill="#14211d">
              {p.kg.toFixed(1)}
            </text>
            <text x={cx} y={H - 22} textAnchor="middle" fontSize="12" fill="#55635e">
              {monthYear(p.date).split(" ")[0]}
            </text>
            <text x={cx} y={H - 8} textAnchor="middle" fontSize="12" fill="#55635e">
              {monthYear(p.date).split(" ")[1]}
            </text>
          </g>
        );
      })}
      <text x={pl - 8} y={14} textAnchor="end" fontSize="12" fill="#55635e">
        kg
      </text>
    </svg>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import Shell from "@/components/pawpoint/Shell";
import Schedule from "@/components/pawpoint/Schedule";

export const metadata: Metadata = {
  title: "Today’s schedule · Pawpoint",
  description: "Front desk schedule for Hillside Veterinary Clinic.",
};

export default function Page() {
  return (
    <Shell current="schedule">
      <Schedule />
    </Shell>
  );
}
```

```tsx src/app/patients/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/components/pawpoint/Shell";
import WeightChart from "@/components/pawpoint/WeightChart";
import { AlertBadges, WarnIcon } from "@/components/pawpoint/Alerts";
import {
  APPOINTMENTS,
  PATIENTS,
  RECORDS,
  STATUS_LABEL,
  TODAY,
  ageText,
  daysBetween,
  formatDate,
  money,
  ownerOf,
  patientOf,
  vetOf,
} from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = patientOf(id);
  return { title: p ? `${p.name} · Pawpoint` : "Patient · Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientOf(id);
  if (!patient) notFound();
  const owner = ownerOf(patient.owner);
  const record = RECORDS[patient.id];
  const todays = APPOINTMENTS.filter((a) => a.patient === patient.id && a.status !== "cancelled");

  const vaccines = record
    ? record.vaccinations
        .map((v) => ({ ...v, days: daysBetween(TODAY, v.due) }))
        .sort((a, b) => a.days - b.days)
    : [];
  const overdue = vaccines.filter((v) => v.days < 0);

  const weights = record?.weights_kg ?? [];
  const firstW = weights[0];
  const lastW = weights[weights.length - 1];
  const change = firstW && lastW ? lastW.kg - firstW.kg : 0;
  const pct = firstW && lastW ? (change / firstW.kg) * 100 : 0;

  return (
    <Shell current="patient">
      <p className="pp-crumb">
        <Link href="/">← Back to schedule</Link>
      </p>

      <section className="pp-card pp-pt-head" aria-labelledby="pt-name">
        <div className="pp-pt-id">
          <span className="pp-pt-avatar" aria-hidden="true">
            {patient.name[0]}
          </span>
          <div>
            <h1 id="pt-name" className="pp-h1">
              {patient.name}
            </h1>
            <p className="pp-sub">
              {patient.breed} · {patient.species} · {patient.sex}
            </p>
          </div>
        </div>
        <dl className="pp-facts">
          <div>
            <dt>Age</dt>
            <dd>{ageText(patient.born, TODAY)}</dd>
          </div>
          <div>
            <dt>Born</dt>
            <dd>{formatDate(patient.born)}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{owner?.name}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {owner && (
                <a href={`tel:${owner.phone.replace(/\s/g, "")}`} className="pp-tel">
                  {owner.phone}
                </a>
              )}
            </dd>
          </div>
          <div>
            <dt>Patient ID</dt>
            <dd>{patient.id}</dd>
          </div>
        </dl>
      </section>

      {patient.alerts.length > 0 && (
        <section className="pp-alert-banner" aria-labelledby="alerts-h">
          <h2 id="alerts-h" className="pp-alert-title">
            <WarnIcon /> Medical alerts for {patient.name}
          </h2>
          <AlertBadges alerts={patient.alerts} size="lg" />
        </section>
      )}

      {todays.length > 0 && (
        <section className="pp-card" aria-labelledby="today-h">
          <h2 id="today-h" className="pp-h2">
            On today’s schedule
          </h2>
          <ul className="pp-plain">
            {todays.map((a) => (
              <li key={a.id}>
                <strong>{a.start}</strong> · {a.reason} · {vetOf(a.vet)?.name} ({vetOf(a.vet)?.room}) ·{" "}
                <span className={`pp-badge pp-st-${a.status}`}>
                  <span className="pp-dot" aria-hidden="true" />
                  {STATUS_LABEL[a.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!record && (
        <section className="pp-card">
          <h2 className="pp-h2">Clinical history</h2>
          <p className="pp-empty">No weights, vaccinations, medications or visits are on file for {patient.name} in this demo.</p>
        </section>
      )}

      {record && (
        <div className="pp-cols">
          <section className="pp-card" aria-labelledby="w-h">
            <h2 id="w-h" className="pp-h2">
              Weight trend
            </h2>
            <p className="pp-sub">
              {lastW.kg.toFixed(1)} kg now, {change < 0 ? "down" : "up"} {Math.abs(change).toFixed(1)} kg (
              {Math.abs(pct).toFixed(0)}%) since {formatDate(firstW.date)}
            </p>
            <WeightChart points={weights} />
          </section>

          <section className="pp-card" aria-labelledby="v-h">
            <h2 id="v-h" className="pp-h2">
              Vaccinations
            </h2>
            {overdue.length > 0 && (
              <p className="pp-overdue-note" role="note">
                <WarnIcon /> {overdue.length} overdue as of {formatDate(TODAY)}: {overdue.map((v) => v.name).join(", ")}
              </p>
            )}
            <ul className="pp-vax">
              {vaccines.map((v) => {
                const kind = v.days < 0 ? "over" : v.days <= 60 ? "soon" : "ok";
                return (
                  <li key={v.name} className={`pp-vax-${kind}`}>
                    <div>
                      <strong>{v.name}</strong>
                      <span className="pp-muted">
                        Given {formatDate(v.given)} · due {formatDate(v.due)}
                      </span>
                    </div>
                    <span className={`pp-tag pp-tag-${kind}`}>
                      {kind === "over" ? `Overdue ${Math.abs(v.days)} days` : kind === "soon" ? `Due in ${v.days} days` : "Up to date"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="pp-card" aria-labelledby="m-h">
            <h2 id="m-h" className="pp-h2">
              Current medications
            </h2>
            <ul className="pp-meds">
              {record.medications.map((m) => (
                <li key={m.name}>
                  <strong>{m.name}</strong>
                  <span>{m.dose}</span>
                  <span className="pp-muted">Since {formatDate(m.since)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pp-card pp-wide" aria-labelledby="h-h">
            <h2 id="h-h" className="pp-h2">
              Visit history
            </h2>
            <ol className="pp-visits">
              {record.visits.map((v) => (
                <li key={v.date}>
                  <div className="pp-visit-head">
                    <strong>{formatDate(v.date)}</strong>
                    <span>{v.reason}</span>
                    <span className="pp-muted">{vetOf(v.vet)?.name}</span>
                    <span className="pp-invoice">{money(v.invoice_usd)}</span>
                  </div>
                  <p>{v.notes}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </Shell>
  );
}
```

```css src/components/pawpoint/pawpoint.css
.pp-app {
  --bg: #f3f6f5;
  --surface: #ffffff;
  --ink: #14211d;
  --muted: #55635e;
  --line: #dbe3e0;
  --brand: #0f766e;
  --brand-dark: #0b5c56;
  --brand-soft: #e3f4f1;
  --danger: #b42318;
  --danger-bg: #fef0ee;
  --danger-line: #f4b7b0;
  --warn: #8a4b08;
  --warn-bg: #fff6e0;
  --ok: #166534;
  --ok-bg: #e8f6ec;
  --info: #1d4ed8;
  --info-bg: #eaf0ff;
  width: 100%;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body, system-ui), system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.45;
  color-scheme: light;
}
.pp-app *,
.pp-app *::before,
.pp-app *::after {
  box-sizing: border-box;
}
.pp-app p,
.pp-app ul,
.pp-app ol,
.pp-app dl,
.pp-app dd,
.pp-app h1,
.pp-app h2 {
  margin: 0;
  padding: 0;
}
.pp-app ul,
.pp-app ol {
  list-style: none;
}
.pp-app a {
  color: inherit;
}
.pp-app :focus-visible {
  outline: 3px solid #0b5c56;
  outline-offset: 2px;
  border-radius: 6px;
}
.pp-vh {
  position: absolute !important;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.pp-skip {
  position: absolute;
  left: 12px;
  top: -60px;
  background: var(--ink);
  color: #fff !important;
  padding: 10px 14px;
  border-radius: 8px;
  z-index: 100;
}
.pp-skip:focus {
  top: 10px;
}

/* Header */
.pp-header {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 20;
}
.pp-header-in {
  max-width: 1320px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
}
.pp-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.pp-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.pp-brand-text strong {
  font-size: 18px;
}
.pp-brand-text span {
  font-size: 12px;
  color: var(--muted);
}
.pp-nav {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-right: auto;
}
.pp-nav a,
.pp-nav-here {
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.pp-nav a[aria-current="page"],
.pp-nav-here {
  background: var(--brand-soft);
  color: var(--brand-dark);
}
.pp-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pp-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 14px;
}
.pp-user-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  font-size: 14px;
}
.pp-user-text span {
  color: var(--muted);
  font-size: 12px;
}

/* Search */
.pp-search {
  position: relative;
  flex: 0 1 340px;
  min-width: 220px;
}
.pp-search input {
  width: 100%;
  min-height: 46px;
  border: 1.5px solid #9fb0aa;
  border-radius: 12px;
  padding: 0 14px 0 40px;
  font: inherit;
  background: #fff;
  color: var(--ink);
}
.pp-search input::placeholder {
  color: #5f6e69;
}
.pp-search-icon {
  position: absolute;
  left: 13px;
  top: 14px;
  color: var(--muted);
  pointer-events: none;
}
.pp-results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  min-width: min(380px, calc(100vw - 32px));
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 14px 40px rgba(20, 33, 29, 0.18);
  padding: 6px;
  max-height: 70vh;
  overflow: auto;
  z-index: 30;
}
.pp-results a {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  min-height: 48px;
}
.pp-results a:hover {
  background: var(--brand-soft);
}
.pp-result-name {
  font-weight: 700;
}
.pp-result-meta {
  font-size: 14px;
  color: var(--muted);
}
.pp-results-empty {
  padding: 14px;
  color: var(--muted);
}

/* Page */
.pp-page {
  max-width: 1320px;
  margin: 0 auto;
  padding: 18px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pp-h1 {
  font-size: clamp(24px, 4vw, 32px);
  line-height: 1.15;
  font-weight: 750;
  letter-spacing: -0.01em;
}
.pp-h2 {
  font-size: 18px;
  font-weight: 700;
}
.pp-sub {
  color: var(--muted);
  margin-top: 2px;
}
.pp-muted {
  color: var(--muted);
  font-size: 14px;
}
.pp-title-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  justify-content: space-between;
}
.pp-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(20, 33, 29, 0.04);
}
.pp-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

/* Buttons */
.pp-btn {
  font: inherit;
  font-weight: 650;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1.5px solid #9fb0aa;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}
.pp-btn:hover {
  background: #eef3f1;
}
.pp-btn-primary {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}
.pp-btn-primary:hover {
  background: var(--brand-dark);
}
.pp-btn-lg {
  min-height: 50px;
  padding: 0 20px;
  font-size: 16px;
}
.pp-btn-ghost {
  border-color: transparent;
  padding: 0 12px;
}
.pp-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.pp-link {
  font: inherit;
  background: none;
  border: 0;
  padding: 4px 0;
  color: var(--brand-dark);
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  min-height: 32px;
}

/* Notice and stats */
.pp-live {
  min-height: 0;
}
.pp-notice {
  background: var(--ok-bg);
  color: var(--ok);
  border: 1px solid #b6e2c4;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 600;
}
.pp-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.pp-stat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
}
.pp-stat-n {
  font-size: 30px;
  font-weight: 750;
  line-height: 1.1;
}
.pp-stat-n small {
  font-size: 18px;
  color: var(--muted);
  font-weight: 600;
}
.pp-stat-l {
  font-size: 14px;
  color: var(--muted);
}
.pp-stat-warn {
  background: var(--warn-bg);
  border-color: #f0cf91;
}
.pp-stat-warn .pp-stat-l {
  color: var(--warn);
  font-weight: 600;
}

/* Layout grid */
.pp-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}
.pp-wait {
  order: -1;
}

/* Chips */
.pp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pp-chips button {
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1.5px solid #9fb0aa;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}
.pp-chips button[aria-pressed="true"] {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

/* Appointments */
.pp-list {
  display: flex;
  flex-direction: column;
}
.pp-appt {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  grid-template-areas:
    "time status status"
    "main main main"
    "vet vet act";
  gap: 8px 12px;
  padding: 14px 8px 14px 12px;
  border-top: 1px solid var(--line);
  border-left: 5px solid transparent;
  align-items: center;
}
.pp-a-time {
  grid-area: time;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.pp-a-time strong {
  font-size: 20px;
  font-variant-numeric: tabular-nums;
}
.pp-a-time span {
  font-size: 13px;
  color: var(--muted);
}
.pp-a-main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.pp-a-who {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
}
.pp-pname {
  font-size: 18px;
  font-weight: 750;
  text-decoration: none;
  color: var(--ink);
  border-bottom: 2px solid var(--line);
}
.pp-pname:hover {
  border-bottom-color: var(--brand);
}
.pp-a-reason {
  font-size: 16px;
}
.pp-a-vet {
  grid-area: vet;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  line-height: 1.25;
}
.pp-a-vet span {
  color: var(--muted);
}
.pp-a-status {
  grid-area: status;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.pp-a-act {
  grid-area: act;
  display: flex;
  justify-content: flex-end;
}
.pp-row-done,
.pp-row-cancelled {
  background: #f8faf9;
}
.pp-row-done .pp-a-main,
.pp-row-cancelled .pp-a-main,
.pp-row-done .pp-a-time,
.pp-row-cancelled .pp-a-time {
  opacity: 0.78;
}
.pp-row-cancelled .pp-a-reason {
  text-decoration: line-through;
}
.pp-row-in_exam {
  border-left-color: var(--info);
}
.pp-row-checked_in {
  border-left-color: var(--warn);
}
.pp-urgent {
  border-left-color: var(--danger);
  background: #fff5f3;
}
.pp-urgent-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--danger);
  color: #fff;
  font-weight: 750;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
}
.pp-urgent-tag .pp-alert-icon {
  color: #fff;
}
.pp-urgent-tag .pp-alert-icon path:first-child {
  fill: transparent;
}
.pp-flash {
  animation: pp-flash 2.2s ease-out;
}
@keyframes pp-flash {
  from {
    background: #d7f3ec;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pp-flash {
    animation: none;
  }
}

/* Badges */
.pp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.pp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.pp-st-booked {
  background: #eef1f0;
  color: #34433e;
}
.pp-st-checked_in {
  background: var(--warn-bg);
  color: var(--warn);
}
.pp-st-in_exam {
  background: var(--info-bg);
  color: var(--info);
}
.pp-st-done {
  background: var(--ok-bg);
  color: var(--ok);
}
.pp-st-cancelled {
  background: #f1eeee;
  color: #6b5b5b;
}

/* Alerts */
.pp-alerts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pp-alert {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--danger);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 4px 10px 4px 8px;
  border-radius: 8px;
  border: 1px solid #8c1a10;
}
.pp-alert-icon {
  flex: none;
  color: #fff;
}
.pp-alerts-sm .pp-alert {
  font-size: 13px;
  padding: 2px 8px 2px 6px;
}
.pp-alerts-lg .pp-alert {
  font-size: 18px;
  padding: 8px 14px 8px 10px;
  border-radius: 10px;
}
.pp-alerts-lg .pp-alert-icon {
  width: 22px;
  height: 22px;
}
.pp-alert-banner {
  background: var(--danger-bg);
  border: 2px solid var(--danger);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pp-alert-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--danger);
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 800;
}
.pp-alert-title .pp-alert-icon {
  color: var(--danger);
}
.pp-alert-title .pp-alert-icon path:nth-child(2),
.pp-alert-title .pp-alert-icon circle {
  stroke: #fff;
}

/* Waiting */
.pp-count {
  min-width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--warn-bg);
  color: var(--warn);
  font-weight: 800;
}
.pp-empty {
  color: var(--muted);
  padding: 10px 0;
}
.pp-wait-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pp-wait-list li {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
}
.pp-wait-list li.pp-long {
  border-color: #f0cf91;
  background: #fffaf0;
}
.pp-pos {
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--ink);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 14px;
}
.pp-wait-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.pp-wait-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.pp-wait-time {
  color: var(--warn);
  font-size: 18px;
  white-space: nowrap;
}

/* Dialog */
.pp-dialog {
  border: 0;
  border-radius: 18px;
  padding: 0;
  width: min(560px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  overflow: auto;
  color: var(--ink);
  background: #fff;
  font-family: var(--font-body, system-ui), system-ui, sans-serif;
}
.pp-dialog::backdrop {
  background: rgba(10, 24, 20, 0.5);
}
.pp-form {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pp-form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pp-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.pp-field > span {
  font-weight: 650;
  font-size: 14px;
}
.pp-field select,
.pp-field input {
  font: inherit;
  min-height: 48px;
  border: 1.5px solid #9fb0aa;
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  color: var(--ink);
  width: 100%;
}
.pp-field-row {
  display: flex;
  gap: 12px;
}
.pp-clash {
  display: flex;
  gap: 10px;
  background: var(--danger-bg);
  border: 1.5px solid var(--danger);
  color: #7a140c;
  padding: 10px 12px;
  border-radius: 10px;
}
.pp-clash .pp-alert-icon {
  color: var(--danger);
  margin-top: 3px;
}
.pp-form-foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

/* Patient record */
.pp-crumb a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-weight: 650;
  color: var(--brand-dark);
}
.pp-pt-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pp-pt-id {
  display: flex;
  gap: 14px;
  align-items: center;
}
.pp-pt-avatar {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: var(--brand-soft);
  color: var(--brand-dark);
  font-size: 28px;
  font-weight: 800;
  display: grid;
  place-items: center;
}
.pp-facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 16px;
}
.pp-facts dt {
  font-size: 13px;
  color: var(--muted);
}
.pp-facts dd {
  font-weight: 650;
}
.pp-tel {
  color: var(--brand-dark);
  display: inline-flex;
  align-items: center;
  min-height: 32px;
}
.pp-cols {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.pp-plain li {
  padding: 8px 0;
}
.pp-chart {
  width: 100%;
  height: auto;
  margin-top: 8px;
  display: block;
}
.pp-overdue-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 8px 0;
  background: var(--danger-bg);
  color: #7a140c;
  border: 1.5px solid var(--danger);
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 650;
}
.pp-overdue-note .pp-alert-icon {
  color: var(--danger);
  margin-top: 3px;
  flex: none;
}
.pp-vax li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid var(--line);
}
.pp-vax li > div {
  display: flex;
  flex-direction: column;
}
.pp-vax-over {
  background: linear-gradient(90deg, var(--danger-bg), transparent);
}
.pp-tag {
  font-size: 13px;
  font-weight: 750;
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
}
.pp-tag-over {
  background: var(--danger);
  color: #fff;
}
.pp-tag-soon {
  background: var(--warn-bg);
  color: var(--warn);
}
.pp-tag-ok {
  background: var(--ok-bg);
  color: var(--ok);
}
.pp-meds li {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  border-top: 1px solid var(--line);
}
.pp-visits {
  display: flex;
  flex-direction: column;
}
.pp-visits li {
  padding: 14px 0;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pp-visit-head {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  align-items: baseline;
}
.pp-invoice {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
  font-size: 14px;
}

@media (min-width: 640px) {
  .pp-stats {
    grid-template-columns: repeat(4, 1fr);
  }
  .pp-facts {
    grid-template-columns: repeat(5, auto);
    justify-content: space-between;
  }
  .pp-header-in {
    padding: 10px 24px;
  }
  .pp-page {
    padding: 22px 24px 56px;
  }
}
@media (min-width: 760px) {
  .pp-appt {
    grid-template-columns: 70px 1fr 160px 120px 120px;
    grid-template-areas: "time main vet status act";
  }
  .pp-a-status {
    align-items: flex-start;
  }
}
@media (min-width: 1100px) {
  .pp-grid {
    grid-template-columns: 1fr 340px;
  }
  .pp-wait {
    order: 0;
    position: sticky;
    top: 84px;
  }
  .pp-cols {
    grid-template-columns: 1fr 1fr;
  }
  .pp-wide {
    grid-column: 1 / -1;
  }
}
@media (max-width: 639px) {
  .pp-user-text {
    display: none;
  }
  .pp-nav {
    order: 3;
    width: 100%;
  }
  .pp-search {
    order: 4;
    flex: 1 1 100%;
  }
  .pp-user {
    margin-left: auto;
  }
  .pp-brand {
    margin-right: auto;
  }
  .pp-btn-lg {
    width: 100%;
  }
  .pp-form-foot .pp-btn {
    flex: 1 1 100%;
  }
  .pp-field-row {
    flex-direction: column;
  }
}
```
