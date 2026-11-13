```ts lib/data.ts
export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const CLINIC_NAME = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";

export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

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
  /** Minutes after midnight at which the patient was checked in. */
  checkedInAt?: number;
}
export interface WeightPoint {
  date: string;
  kg: number;
}
export interface Vaccination {
  name: string;
  given: string;
  due: string;
}
export interface Medication {
  name: string;
  dose: string;
  since: string;
}
export interface Visit {
  date: string;
  vet: string;
  reason: string;
  notes: string;
  invoice_usd: number;
}
export interface PatientRecord {
  weights_kg: WeightPoint[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", room: "Surgery" },
];

export const owners: Owner[] = [
  { id: "o-1", name: "Daniel Kim", phone: "+1 555 0142" },
  { id: "o-2", name: "Priya Natarajan", phone: "+1 555 0178" },
  { id: "o-3", name: "Lucas Moreau", phone: "+1 555 0119" },
  { id: "o-4", name: "Grace Whitfield", phone: "+1 555 0163" },
  { id: "o-5", name: "Sam Oduya", phone: "+1 555 0190" },
  { id: "o-6", name: "Elena Rossi", phone: "+1 555 0105" },
];

export const patients: Patient[] = [
  { id: "p-101", name: "Biscuit", species: "Dog", breed: "Beagle", born: "2019-04-02", sex: "Male, neutered", owner: "o-1", alerts: [] },
  { id: "p-102", name: "Mochi", species: "Cat", breed: "Domestic shorthair", born: "2021-07-15", sex: "Female, spayed", owner: "o-2", alerts: ["Bites when restrained"] },
  { id: "p-103", name: "Pepper", species: "Dog", breed: "Border collie", born: "2016-01-20", sex: "Female, spayed", owner: "o-3", alerts: [] },
  {
    id: "p-104",
    name: "Olive",
    species: "Dog",
    breed: "Labrador retriever",
    born: "2014-09-08",
    sex: "Female, spayed",
    owner: "o-4",
    alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"],
  },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

/** When the patients already waiting arrived (minutes after midnight). */
const ARRIVED: Record<string, number> = { "a-05": 9 * 60 + 8, "a-06": 9 * 60 + 40 };

const base: Omit<Appointment, "checkedInAt">[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in" },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export const appointments: Appointment[] = base.map((a) => ({ ...a, checkedInAt: ARRIVED[a.id] }));

export const records: Record<string, PatientRecord> = {
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
      {
        date: "2026-11-12",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Creatinine 2.1 mg/dL (was 2.0). Weight down 0.6 kg. Continue benazepril, recheck in 3 months.",
        invoice_usd: 186.0,
      },
      {
        date: "2026-06-17",
        vet: "v-2",
        reason: "Kidney panel recheck",
        notes: "Stable. Appetite good. Owner reports more drinking in hot weather.",
        invoice_usd: 172.5,
      },
      {
        date: "2026-02-11",
        vet: "v-1",
        reason: "Coughing",
        notes: "Mild kennel cough. Supportive care; no antibiotics given (penicillin allergy).",
        invoice_usd: 94.0,
      },
      {
        date: "2025-11-03",
        vet: "v-2",
        reason: "Senior wellness exam",
        notes: "Grade 2 dental tartar. Dental cleaning recommended.",
        invoice_usd: 148.0,
      },
    ],
  },
};

/* ---------- lookups ---------- */

export const vetById = (id: string): Vet => vets.find((v) => v.id === id) ?? vets[0];
export const ownerById = (id: string): Owner => owners.find((o) => o.id === id) ?? owners[0];
export const patientById = (id: string): Patient | undefined => patients.find((p) => p.id === id);

/* ---------- time and date helpers ---------- */

/** The simulated clock starts here (9:50 AM on the day) and then runs forward. */
export const NOW_START = 9 * 60 + 50;
export const OPEN = 8 * 60;
export const CLOSE = 17 * 60;

export const toMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const fmtClock = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export const fmtDuration = (min: number): string => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

const dateOf = (iso: string): Date => new Date(`${iso}T00:00:00Z`);

export const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((dateOf(toIso).getTime() - dateOf(fromIso).getTime()) / 86400000);

export const fmtDate = (iso: string, style: "short" | "long" = "short"): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(style === "long" ? { weekday: "long", month: "long" } : {}),
    timeZone: "UTC",
  }).format(dateOf(iso));

export const fmtMonthYear = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).format(dateOf(iso));

export const ageOn = (born: string, today: string): string => {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let years = ty - by;
  let months = tm - bm;
  if (td < bd) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const y = years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : "";
  const mo = months > 0 ? `${months} ${months === 1 ? "month" : "months"}` : "";
  return [y, mo].filter(Boolean).join(", ") || "Newborn";
};

export const fmtUsd = (n: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

/* ---------- booking rules ---------- */

export interface Clash {
  kind: "vet" | "patient";
  appt: Appointment;
}

/** An appointment clashes when it overlaps one that is not cancelled, for the same vet or the same patient. */
export function findClash(
  list: Appointment[],
  q: { vet: string; patient: string; start: number; minutes: number },
): Clash | null {
  const end = q.start + q.minutes;
  for (const a of list) {
    if (a.status === "cancelled") continue;
    const s = toMinutes(a.start);
    const e = s + a.minutes;
    if (!(q.start < e && s < end)) continue;
    if (a.vet === q.vet) return { kind: "vet", appt: a };
    if (a.patient === q.patient) return { kind: "patient", appt: a };
  }
  return null;
}

export const roundUp15 = (min: number): number => Math.ceil(min / 15) * 15;

export function nextFreeSlot(
  list: Appointment[],
  q: { vet: string; patient: string; minutes: number },
  from: number,
): number | null {
  for (let s = roundUp15(from); s + q.minutes <= CLOSE; s += 15) {
    if (!findClash(list, { ...q, start: s })) return s;
  }
  return null;
}
```

```tsx components/ui.ts
export const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/** A translucent wash of a palette colour that follows light and dark mode. */
export const tint = (color: "error" | "warning" | "info" | "success" | "primary", percent: number): string =>
  `color-mix(in srgb, var(--mui-palette-${color}-main) ${percent}%, transparent)`;
```

```tsx components/AlertChips.tsx
"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { srOnly } from "@/components/ui";

/** Medical alerts: solid red, an icon and the words, so they read at a glance and are not colour-only. */
export function AlertChips({ alerts, size = "small" }: { alerts: string[]; size?: "small" | "medium" }) {
  if (alerts.length === 0) return null;
  return (
    <Box
      component="ul"
      role="list"
      aria-label="Medical alerts"
      sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexWrap: "wrap", gap: 0.75 }}
    >
      {alerts.map((alert) => (
        <li key={alert}>
          <Chip
            color="error"
            size={size}
            icon={<WarningAmberIcon />}
            label={
              <>
                <Box component="span" sx={srOnly}>
                  Medical alert:{" "}
                </Box>
                {alert}
              </>
            }
            sx={{
              height: "auto",
              maxWidth: "100%",
              fontWeight: 700,
              "& .MuiChip-label": { whiteSpace: "normal", py: 0.375 },
            }}
          />
        </li>
      ))}
    </Box>
  );
}
```

```tsx components/StatusChip.tsx
"use client";

import type { ReactElement } from "react";
import Chip from "@mui/material/Chip";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import type { Status } from "@/lib/data";

const META: Record<
  Status,
  { label: string; color: "default" | "info" | "primary" | "success"; variant: "filled" | "outlined"; icon: ReactElement }
> = {
  booked: { label: "Booked", color: "default", variant: "outlined", icon: <EventAvailableIcon /> },
  checked_in: { label: "Checked in", color: "info", variant: "filled", icon: <HourglassTopIcon /> },
  in_exam: { label: "In exam", color: "primary", variant: "filled", icon: <MedicalServicesIcon /> },
  done: { label: "Done", color: "success", variant: "outlined", icon: <DoneAllIcon /> },
  cancelled: { label: "Cancelled", color: "default", variant: "outlined", icon: <EventBusyIcon /> },
};

export function StatusChip({ status }: { status: Status }) {
  const m = META[status];
  return <Chip size="small" label={m.label} color={m.color} variant={m.variant} icon={m.icon} sx={{ fontWeight: 600 }} />;
}
```

```tsx components/AppShell.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { AlertChips } from "@/components/AlertChips";
import { CLINIC_NAME, USER, ownerById, patients, type Patient } from "@/lib/data";

function PatientSearch() {
  const router = useRouter();
  const [input, setInput] = React.useState("");

  return (
    <Autocomplete<Patient>
      fullWidth
      autoHighlight
      openOnFocus
      value={null}
      inputValue={input}
      options={patients}
      onInputChange={(_e, v, reason) => {
        if (reason !== "reset") setInput(v);
      }}
      onChange={(_e, patient) => {
        if (patient) {
          setInput("");
          router.push(`/patients/${patient.id}`);
        }
      }}
      getOptionLabel={(p) => p.name}
      filterOptions={(options, state) => {
        const q = state.inputValue.trim().toLowerCase();
        if (!q) return options;
        return options.filter((p) => {
          const o = ownerById(p.owner);
          return (
            p.name.toLowerCase().includes(q) ||
            o.name.toLowerCase().includes(q) ||
            o.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
          );
        });
      }}
      noOptionsText="No patient or owner matches that name"
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        const o = ownerById(p.owner);
        return (
          <li key={key} {...rest}>
            <Stack spacing={0.5} sx={{ width: 1, py: 0.5 }}>
              <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "baseline", flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {p.species}, {p.breed} · Owner {o.name}
                </Typography>
              </Stack>
              <AlertChips alerts={p.alerts} />
            </Stack>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search patient or owner"
          size="small"
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Search patient or owner by name" },
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ "& .MuiInputBase-root": { minHeight: 44 } }}
        />
      )}
    />
  );
}

function ModeToggle() {
  const { colorScheme, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const dark = mounted && colorScheme === "dark";
  return (
    <IconButton
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setMode(dark ? "light" : "dark")}
      sx={{ width: 44, height: 44 }}
    >
      {dark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <Link
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -60,
          zIndex: 2000,
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Link>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 1.25 }}>
          <Box
            sx={{
              display: "grid",
              alignItems: "center",
              columnGap: 2,
              rowGap: 1,
              gridTemplateColumns: { xs: "1fr auto", md: "auto minmax(0, 560px) 1fr" },
              gridTemplateAreas: {
                xs: '"brand tools" "search search"',
                md: '"brand search tools"',
              },
            }}
          >
            <Link
              component={NextLink}
              href="/"
              underline="none"
              color="inherit"
              aria-label="Pawpoint, today's schedule"
              sx={{ gridArea: "brand", display: "flex", alignItems: "center", gap: 1.25 }}
            >
              <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
                <PetsIcon />
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>Pawpoint</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
                  {CLINIC_NAME}
                </Typography>
              </Box>
            </Link>
            <Box sx={{ gridArea: "search" }}>
              <PatientSearch />
            </Box>
            <Stack direction="row" spacing={1} sx={{ gridArea: "tools", alignItems: "center", justifyContent: "flex-end" }}>
              <ModeToggle />
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                  RL
                </Avatar>
                <Box sx={{ display: { xs: "none", lg: "block" } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {USER.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {USER.role}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>
      <Container component="main" id="main" tabIndex={-1} maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, outline: "none" }}>
        {children}
      </Container>
    </Box>
  );
}
```

```tsx components/BookingDialog.tsx
"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AlertChips } from "@/components/AlertChips";
import {
  CLOSE,
  fmtClock,
  fmtDate,
  findClash,
  nextFreeSlot,
  ownerById,
  patientById,
  patients,
  roundUp15,
  toMinutes,
  vetById,
  vets,
  TODAY,
  type Appointment,
  type Patient,
} from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

interface Props {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  now: number;
  onBook: (a: { patient: string; vet: string; start: number; minutes: number; reason: string; urgent: boolean }) => void;
}

export function BookingDialog({ open, onClose, appointments, now, onBook }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <BookingForm onClose={onClose} appointments={appointments} now={now} onBook={onBook} />
    </Dialog>
  );
}

function BookingForm({ onClose, appointments, now, onBook }: Omit<Props, "open">) {
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [vetId, setVetId] = React.useState("");
  const [start, setStart] = React.useState<number | "">("");
  const [minutes, setMinutes] = React.useState(20);
  const [reason, setReason] = React.useState("");
  const [urgent, setUrgent] = React.useState(false);

  const firstSlot = roundUp15(now);
  const slots: number[] = [];
  for (let s = firstSlot; s < CLOSE; s += 15) slots.push(s);
  if (start !== "" && !slots.includes(start)) slots.unshift(start);

  const clashFor = (s: number) =>
    patient && vetId ? findClash(appointments, { vet: vetId, patient: patient.id, start: s, minutes }) : null;

  const clash = start !== "" ? clashFor(start) : null;
  const endsLate = start !== "" && start + minutes > CLOSE;
  const suggestion =
    clash && patient && vetId ? nextFreeSlot(appointments, { vet: vetId, patient: patient.id, minutes }, Math.max(now, firstSlot)) : null;
  const valid = !!patient && !!vetId && start !== "" && reason.trim().length > 0 && !clash && !endsLate;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !patient || start === "") return;
    onBook({ patient: patient.id, vet: vetId, start, minutes, reason: reason.trim(), urgent });
  };

  const clashText = (() => {
    if (!clash) return "";
    const other = patientById(clash.appt.patient);
    const s = toMinutes(clash.appt.start);
    const range = `${fmtClock(s)} to ${fmtClock(s + clash.appt.minutes)}`;
    if (clash.kind === "vet") {
      return `${vetById(clash.appt.vet).name} is already booked ${range} (${other?.name}, ${clash.appt.reason}).`;
    }
    return `${patient?.name} already has an appointment ${range} with ${vetById(clash.appt.vet).name}.`;
  })();

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <DialogTitle id="book-title">Book an appointment</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Autocomplete<Patient>
            value={patient}
            onChange={(_e, v) => setPatient(v)}
            options={patients}
            autoHighlight
            getOptionLabel={(p) => `${p.name} (${ownerById(p.owner).name})`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            noOptionsText="No patient or owner matches"
            renderOption={(props, p) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Stack spacing={0.5} sx={{ width: 1, py: 0.5 }}>
                    <Typography>
                      <b>{p.name}</b>{" "}
                      <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>
                        {p.species}, {p.breed} · {ownerById(p.owner).name}
                      </Typography>
                    </Typography>
                    <AlertChips alerts={p.alerts} />
                  </Stack>
                </li>
              );
            }}
            renderInput={(params) => <TextField {...params} label="Patient or owner" required />}
          />

          {patient && patient.alerts.length > 0 && (
            <Alert severity="error" variant="outlined" sx={{ "& .MuiAlert-message": { width: 1 } }}>
              <Typography variant="subtitle2" gutterBottom>
                Medical alerts for {patient.name}
              </Typography>
              <AlertChips alerts={patient.alerts} />
            </Alert>
          )}

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <TextField select required label="Vet" value={vetId} onChange={(e) => setVetId(e.target.value)}>
              {vets.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name} · {v.room}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Length" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d} minutes
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              required
              label="Start time"
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              helperText={`Today, ${fmtDate(TODAY)}. Open until ${fmtClock(CLOSE)}.`}
              error={!!clash || endsLate}
              slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 320 } } } } } }}
            >
              {slots.map((s) => {
                const busy = clashFor(s);
                return (
                  <MenuItem key={s} value={s}>
                    {fmtClock(s)}
                    {busy ? (
                      <Typography component="span" variant="caption" sx={{ color: "error.main", ml: 1 }}>
                        {busy.kind === "vet" ? "vet busy" : "patient busy"}
                      </Typography>
                    ) : null}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              required
              label="Reason for visit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Booster shot"
            />
          </Box>

          {clash && (
            <Alert
              severity="error"
              action={
                suggestion !== null ? (
                  <Button color="inherit" size="small" onClick={() => setStart(suggestion)}>
                    Use {fmtClock(suggestion)}
                  </Button>
                ) : undefined
              }
            >
              {clashText} Pick another time
              {suggestion !== null ? ` (next free: ${fmtClock(suggestion)}).` : "."}
            </Alert>
          )}
          {endsLate && !clash && (
            <Alert severity="error">This visit would end after closing time ({fmtClock(CLOSE)}). Pick an earlier start or a shorter length.</Alert>
          )}

          <FormControlLabel
            control={<Switch checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />}
            label="Urgent visit (highlight on the schedule)"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ minWidth: 96 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={!valid} sx={{ minWidth: 160 }}>
          Book appointment
        </Button>
      </DialogActions>
    </Box>
  );
}
```

```tsx components/ScheduleBoard.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import LoginIcon from "@mui/icons-material/Login";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { AlertChips } from "@/components/AlertChips";
import { BookingDialog } from "@/components/BookingDialog";
import { StatusChip } from "@/components/StatusChip";
import { tint } from "@/components/ui";
import {
  CLOSE,
  NOW_START,
  TODAY,
  appointments as seed,
  fmtClock,
  fmtDate,
  fmtDuration,
  ownerById,
  patientById,
  toMinutes,
  vetById,
  vets,
  type Appointment,
  type Patient,
} from "@/lib/data";

const LONG_WAIT = 30;

function useClock(): number {
  const [now, setNow] = React.useState(NOW_START);
  React.useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setNow(Math.min(CLOSE, NOW_START + Math.floor((Date.now() - t0) / 60000)));
    }, 10000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

const isActive = (a: Appointment) => a.status !== "done" && a.status !== "cancelled";

function PatientName({ patient, size = "1.05rem" }: { patient: Patient; size?: string }) {
  return (
    <Link
      component={NextLink}
      href={`/patients/${patient.id}`}
      color="inherit"
      underline="hover"
      sx={{ fontWeight: 700, fontSize: size, display: "inline-block", py: 0.25 }}
    >
      {patient.name}
    </Link>
  );
}

function CheckInButton({ appt, onCheckIn }: { appt: Appointment; onCheckIn: (id: string) => void }) {
  const patient = patientById(appt.patient);
  return (
    <Button
      variant="contained"
      startIcon={<LoginIcon />}
      onClick={() => onCheckIn(appt.id)}
      aria-label={`Check in ${patient?.name ?? "patient"}, ${fmtClock(toMinutes(appt.start))} appointment`}
      sx={{ minHeight: 44, whiteSpace: "nowrap" }}
    >
      Check in
    </Button>
  );
}

function AppointmentRow({
  appt,
  now,
  onCheckIn,
}: {
  appt: Appointment;
  now: number;
  onCheckIn: (id: string) => void;
}) {
  const patient = patientById(appt.patient);
  if (!patient) return null;
  const owner = ownerById(patient.owner);
  const vet = vetById(appt.vet);
  const start = toMinutes(appt.start);
  const urgent = !!appt.urgent && isActive(appt);
  const muted = appt.status === "done" || appt.status === "cancelled";
  const waited = appt.checkedInAt !== undefined ? now - appt.checkedInAt : 0;

  return (
    <Paper
      component="li"
      variant="outlined"
      sx={{
        listStyle: "none",
        display: "grid",
        gap: { xs: 1, md: 2 },
        alignItems: "start",
        p: 1.75,
        pl: 2,
        borderLeft: 6,
        borderLeftColor: urgent ? "error.main" : appt.status === "in_exam" ? "primary.main" : appt.status === "checked_in" ? "info.main" : "divider",
        bgcolor: urgent ? tint("error", 9) : "background.paper",
        gridTemplateColumns: { xs: "1fr auto", md: "108px minmax(0, 1.3fr) minmax(0, 1.2fr) minmax(0, 0.9fr) 176px" },
        gridTemplateAreas: {
          xs: '"time status" "patient patient" "reason reason" "vet vet" "action action"',
          md: '"time patient reason vet status"',
        },
      }}
    >
      <Box sx={{ gridArea: "time" }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", textDecoration: appt.status === "cancelled" ? "line-through" : "none" }}>
          {fmtClock(start)}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {fmtDuration(appt.minutes)}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "patient", minWidth: 0 }}>
        <PatientName patient={patient} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {patient.species}, {patient.breed} · {owner.name}
        </Typography>
        <Box sx={{ mt: patient.alerts.length ? 0.75 : 0 }}>
          <AlertChips alerts={patient.alerts} />
        </Box>
      </Box>

      <Box sx={{ gridArea: "reason", minWidth: 0 }}>
        {urgent && (
          <Chip
            color="error"
            size="small"
            icon={<PriorityHighIcon />}
            label="URGENT"
            sx={{ fontWeight: 800, letterSpacing: "0.04em", mb: 0.5 }}
          />
        )}
        <Typography sx={{ color: muted ? "text.secondary" : "text.primary", fontWeight: urgent ? 700 : 500 }}>
          {appt.reason}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "vet", minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {vet.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
          <MeetingRoomIcon sx={{ fontSize: 16 }} aria-hidden /> {vet.room}
        </Typography>
      </Box>

      <Stack sx={{ gridArea: "status", alignItems: { xs: "flex-end", md: "flex-start" } }} spacing={0.75}>
        <StatusChip status={appt.status} />
        {appt.status === "checked_in" && (
          <Typography variant="body2" sx={{ fontWeight: 700, color: waited >= LONG_WAIT ? "warning.main" : "text.primary" }}>
            Waiting {fmtDuration(Math.max(0, waited))}
          </Typography>
        )}
      </Stack>

      {appt.status === "booked" && (
        <Box sx={{ gridArea: { xs: "action", md: "status" }, alignSelf: { md: "end" }, mt: { md: 5.5 } }}>
          <CheckInButton appt={appt} onCheckIn={onCheckIn} />
        </Box>
      )}
    </Paper>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: string; tone?: "warning" | "error" }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.15, color: tone ? `${tone}.main` : "text.primary" }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

function WaitingPanel({ list, now, onCheckIn, upcoming }: { list: Appointment[]; now: number; onCheckIn: (id: string) => void; upcoming: Appointment[] }) {
  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" component="section" aria-labelledby="waiting-title" sx={{ p: 2 }}>
        <Stack direction="row" sx={{ mb: 1.5, alignItems: "center", justifyContent: "space-between" }}>
          <Typography id="waiting-title" variant="h6" component="h2" sx={{ fontWeight: 800 }}>
            Waiting room
          </Typography>
          <Chip label={`${list.length} waiting`} color={list.length ? "info" : "default"} size="small" sx={{ fontWeight: 700 }} />
        </Stack>
        {list.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>Nobody is waiting. Checked-in patients appear here.</Typography>
        ) : (
          <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }} aria-live="polite">
            {list.map((a, i) => {
              const p = patientById(a.patient);
              if (!p) return null;
              const vet = vetById(a.vet);
              const waited = Math.max(0, now - (a.checkedInAt ?? now));
              const long = waited >= LONG_WAIT;
              return (
                <Box
                  component="li"
                  key={a.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "28px minmax(0, 1fr) auto",
                    columnGap: 1.25,
                    alignItems: "start",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: a.urgent ? tint("error", 10) : tint("info", 8),
                  }}
                >
                  <Typography aria-label={`Number ${i + 1} in line`} sx={{ fontWeight: 800, color: "text.secondary" }}>
                    {i + 1}
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                      <PatientName patient={p} />
                      {a.urgent && <Chip size="small" color="error" label="URGENT" sx={{ fontWeight: 800 }} />}
                    </Stack>
                    <Typography variant="body2">{a.reason}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {vet.name} · {vet.room}
                    </Typography>
                    <Box sx={{ mt: p.alerts.length ? 0.75 : 0 }}>
                      <AlertChips alerts={p.alerts} />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.1, color: long ? "warning.main" : "text.primary" }}>
                      {fmtDuration(waited)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      since {fmtClock(a.checkedInAt ?? now)}
                    </Typography>
                    {long && (
                      <Typography variant="caption" sx={{ display: "block", fontWeight: 700, color: "warning.main" }}>
                        Long wait
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" component="section" aria-labelledby="next-title" sx={{ p: 2 }}>
        <Typography id="next-title" variant="h6" component="h2" sx={{ fontWeight: 800, mb: 1.5 }}>
          Arriving next
        </Typography>
        {upcoming.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>No more booked patients today.</Typography>
        ) : (
          <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {upcoming.map((a) => {
              const p = patientById(a.patient);
              if (!p) return null;
              return (
                <Box component="li" key={a.id} sx={{ display: "flex", gap: 1.5, alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {fmtClock(toMinutes(a.start))} · {vetById(a.vet).name}
                    </Typography>
                    <PatientName patient={p} size="1rem" />
                    {a.urgent && (
                      <Chip size="small" color="error" label="URGENT" sx={{ fontWeight: 800, ml: 1 }} />
                    )}
                    <Box sx={{ mt: p.alerts.length ? 0.5 : 0 }}>
                      <AlertChips alerts={p.alerts} />
                    </Box>
                  </Box>
                  <CheckInButton appt={a} onCheckIn={onCheckIn} />
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

export function ScheduleBoard() {
  const now = useClock();
  const [list, setList] = React.useState<Appointment[]>(seed);
  const [vetFilter, setVetFilter] = React.useState<string>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [snack, setSnack] = React.useState<{ message: string; undoId?: string } | null>(null);

  const checkIn = (id: string) => {
    const appt = list.find((a) => a.id === id);
    if (!appt) return;
    setList((cur) => cur.map((a) => (a.id === id ? { ...a, status: "checked_in", checkedInAt: now } : a)));
    setSnack({ message: `${patientById(appt.patient)?.name} checked in and added to the waiting room.`, undoId: id });
  };

  const undoCheckIn = (id: string) => {
    setList((cur) => cur.map((a) => (a.id === id ? { ...a, status: "booked", checkedInAt: undefined } : a)));
    setSnack(null);
  };

  const book = (b: { patient: string; vet: string; start: number; minutes: number; reason: string; urgent: boolean }) => {
    const id = `a-${String(list.length + 1).padStart(2, "0")}`;
    const h = Math.floor(b.start / 60);
    const m = b.start % 60;
    const appt: Appointment = {
      id,
      patient: b.patient,
      vet: b.vet,
      start: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      minutes: b.minutes,
      reason: b.reason,
      status: "booked",
      urgent: b.urgent || undefined,
    };
    setList((cur) => [...cur, appt]);
    setDialogOpen(false);
    setSnack({ message: `Booked ${patientById(b.patient)?.name} with ${vetById(b.vet).name} at ${fmtClock(b.start)}.` });
  };

  const sorted = React.useMemo(
    () => [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [list],
  );
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = list.filter((a) => a.status === "checked_in").sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));
  const upcoming = sorted.filter((a) => a.status === "booked").slice(0, 4);
  const count = (s: Appointment["status"]) => list.filter((a) => a.status === s).length;
  const longest = waiting.length ? Math.max(...waiting.map((a) => now - (a.checkedInAt ?? now))) : 0;
  const urgentCount = list.filter((a) => a.urgent && isActive(a)).length;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "flex-end" } }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Today&apos;s schedule
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {fmtDate(TODAY, "long")} · {fmtClock(now)} now · {list.filter((a) => a.status !== "cancelled").length} appointments across {vets.length} vets
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ minHeight: 48 }}>
          Book appointment
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        <Stat label="Waiting" value={waiting.length} hint={waiting.length ? `Longest ${fmtDuration(longest)}` : "Room is clear"} tone={longest >= LONG_WAIT ? "warning" : undefined} />
        <Stat label="In exam" value={count("in_exam")} hint="With a vet now" />
        <Stat label="Still to arrive" value={count("booked")} hint={urgentCount ? `${urgentCount} urgent` : "No urgent visits"} tone={urgentCount ? "error" : undefined} />
        <Stat label="Done today" value={count("done")} hint={`${count("cancelled")} cancelled`} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
        }}
      >
        <Box sx={{ order: { lg: 2 }, position: { lg: "sticky" }, top: { lg: 88 } }}>
          <WaitingPanel list={waiting} upcoming={upcoming} now={now} onCheckIn={checkIn} />
        </Box>

        <Box sx={{ order: { lg: 1 }, minWidth: 0 }} component="section" aria-labelledby="sched-title">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ mb: 1.5, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}
          >
            <Typography id="sched-title" variant="h6" component="h2" sx={{ fontWeight: 800 }}>
              All appointments
            </Typography>
            <Box sx={{ overflowX: "auto", pb: 0.5 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={vetFilter}
                onChange={(_e, v: string | null) => v && setVetFilter(v)}
                aria-label="Filter by vet"
                color="primary"
              >
                <ToggleButton value="all" sx={{ minHeight: 44, px: 2, textTransform: "none" }}>
                  All vets
                </ToggleButton>
                {vets.map((v) => (
                  <ToggleButton key={v.id} value={v.id} sx={{ minHeight: 44, px: 2, textTransform: "none", whiteSpace: "nowrap" }}>
                    {v.name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>

          <Box
            aria-hidden
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "108px minmax(0, 1.3fr) minmax(0, 1.2fr) minmax(0, 0.9fr) 176px",
              gap: 2,
              px: 2.75,
              pb: 0.75,
              color: "text.secondary",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>Time</span>
            <span>Patient and owner</span>
            <span>Reason</span>
            <span>Vet and room</span>
            <span>Status</span>
          </Box>

          <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {visible.map((a) => (
              <AppointmentRow key={a.id} appt={a} now={now} onCheckIn={checkIn} />
            ))}
          </Stack>
          {visible.length === 0 && <Typography sx={{ color: "text.secondary" }}>No appointments for this vet today.</Typography>}
        </Box>
      </Box>

      <BookingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} appointments={list} now={now} onBook={book} />

      <Snackbar
        open={snack !== null}
        autoHideDuration={6000}
        onClose={(_e, reason) => {
          if (reason !== "clickaway") setSnack(null);
        }}
        message={snack?.message}
        action={
          snack?.undoId ? (
            <Button color="inherit" size="small" onClick={() => undoCheckIn(snack.undoId as string)}>
              Undo
            </Button>
          ) : undefined
        }
      />
    </Stack>
  );
}
```

```tsx components/WeightChart.tsx
"use client";

import Box from "@mui/material/Box";
import { LineChart } from "@mui/x-charts/LineChart";
import { fmtDate, fmtMonthYear, type WeightPoint } from "@/lib/data";

export function WeightChart({ points, name }: { points: WeightPoint[]; name: string }) {
  const kgs = points.map((p) => p.kg);
  const min = Math.floor(Math.min(...kgs) - 1);
  const max = Math.ceil(Math.max(...kgs) + 1);
  return (
    <Box>
      <LineChart
        height={260}
        hideLegend
        grid={{ horizontal: true }}
        xAxis={[
          {
            scaleType: "point",
            data: points.map((p) => p.date),
            valueFormatter: (v: string, ctx: { location: string }) => (ctx.location === "tooltip" ? fmtDate(v) : fmtMonthYear(v)),
          },
        ]}
        yAxis={[{ min, max, width: 44, valueFormatter: (v: number) => `${v}` }]}
        series={[
          {
            data: kgs,
            label: `${name} weight`,
            color: "var(--mui-palette-primary-main)",
            showMark: true,
            valueFormatter: (v: number | null) => (v === null ? "" : `${v.toFixed(1)} kg`),
          },
        ]}
        margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
      />
    </Box>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PetsIcon from "@mui/icons-material/Pets";
import PhoneIcon from "@mui/icons-material/Phone";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { AlertChips } from "@/components/AlertChips";
import { StatusChip } from "@/components/StatusChip";
import { WeightChart } from "@/components/WeightChart";
import { srOnly, tint } from "@/components/ui";
import {
  TODAY,
  ageOn,
  appointments,
  daysBetween,
  fmtClock,
  fmtDate,
  fmtUsd,
  ownerById,
  records,
  toMinutes,
  vetById,
  type Patient,
  type Vaccination,
} from "@/lib/data";

type VaccineState = { kind: "overdue" | "soon" | "ok"; days: number };

function vaccineState(v: Vaccination): VaccineState {
  const d = daysBetween(TODAY, v.due);
  if (d < 0) return { kind: "overdue", days: -d };
  if (d <= 30) return { kind: "soon", days: d };
  return { kind: "ok", days: d };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Paper component="section" variant="outlined" aria-labelledby={id} sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Typography id={id} variant="h6" component="h2" sx={{ fontWeight: 800, mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        component="dt"
        sx={{ display: "block", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}
      >
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0 }}>
        {children}
      </Typography>
    </Box>
  );
}

function VaccineChip({ state }: { state: VaccineState }) {
  if (state.kind === "overdue") {
    return (
      <Chip
        size="small"
        color="error"
        icon={<WarningAmberIcon />}
        label={`Overdue by ${state.days} ${state.days === 1 ? "day" : "days"}`}
        sx={{ fontWeight: 800 }}
      />
    );
  }
  if (state.kind === "soon") {
    return <Chip size="small" color="warning" icon={<ScheduleIcon />} label={`Due in ${state.days} days`} sx={{ fontWeight: 700 }} />;
  }
  return <Chip size="small" color="success" variant="outlined" icon={<CheckCircleOutlineIcon />} label="Up to date" />;
}

const bigNumber = { fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.1 } as const;

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = ownerById(patient.owner);
  const record = records[patient.id];
  const todays = appointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");
  const overdue = record ? record.vaccinations.filter((v) => vaccineState(v).kind === "overdue") : [];

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const change = first && last ? last.kg - first.kg : 0;
  const changePct = first && last ? (change / first.kg) * 100 : 0;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={NextLink} href="/" startIcon={<ArrowBackIcon />} sx={{ ml: -1, minHeight: 44 }}>
          Today&apos;s schedule
        </Button>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ alignItems: { sm: "center" } }}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <PetsIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontSize: { xs: "2rem", sm: "2.5rem" }, lineHeight: 1.1 }}>
            {patient.name}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "1.05rem" }}>
            {patient.species}, {patient.breed} · {ageOn(patient.born, TODAY)} · {patient.sex}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PhoneIcon />}
          component="a"
          href={`tel:${owner.phone.replace(/\s/g, "")}`}
          sx={{ minHeight: 48 }}
          aria-label={`Call ${owner.name} on ${owner.phone}`}
        >
          Call {owner.name.split(" ")[0]}
        </Button>
      </Stack>

      {patient.alerts.length > 0 && (
        <Alert
          severity="error"
          variant="filled"
          icon={<WarningAmberIcon fontSize="large" />}
          sx={{ alignItems: "center", "& .MuiAlert-message": { width: 1 } }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: "1.1rem" }}>Medical alerts for {patient.name}</AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: "1.15rem", fontWeight: 700 }}>
            {patient.alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </Box>
        </Alert>
      )}

      {overdue.length > 0 && (
        <Alert severity="warning" variant="outlined" icon={<WarningAmberIcon />} sx={{ borderWidth: 2 }}>
          <AlertTitle sx={{ fontWeight: 800 }}>
            {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue
          </AlertTitle>
          {overdue.map((v) => `${v.name} (due ${fmtDate(v.due)})`).join(", ")}. Offer to book it while the owner is here.
        </Alert>
      )}

      {todays.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: tint("primary", 7) }}>
          <Typography variant="subtitle2" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
            At the clinic today
          </Typography>
          <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {todays.map((a) => (
              <Stack key={a.id} component="li" direction="row" spacing={1.5} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 800 }}>{fmtClock(toMinutes(a.start))}</Typography>
                <Typography>{a.reason}</Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {vetById(a.vet).name} · {vetById(a.vet).room}
                </Typography>
                <StatusChip status={a.status} />
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 7fr)" },
        }}
      >
        <Stack spacing={2.5}>
          <Section id="details-title" title="Patient and owner">
            <Box component="dl" sx={{ m: 0, display: "grid", gap: 1.75, gridTemplateColumns: "1fr 1fr" }}>
              <Fact label="Species">{patient.species}</Fact>
              <Fact label="Breed">{patient.breed}</Fact>
              <Fact label="Born">{fmtDate(patient.born)}</Fact>
              <Fact label="Age">{ageOn(patient.born, TODAY)}</Fact>
              <Fact label="Sex">{patient.sex}</Fact>
              <Fact label="Patient ID">{patient.id}</Fact>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box component="dl" sx={{ m: 0, display: "grid", gap: 1.75, gridTemplateColumns: "1fr 1fr" }}>
              <Fact label="Owner">{owner.name}</Fact>
              <Fact label="Phone">
                <a href={`tel:${owner.phone.replace(/\s/g, "")}`} style={{ color: "inherit" }}>
                  {owner.phone}
                </a>
              </Fact>
            </Box>
            {patient.alerts.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, mb: 0.75 }}
                >
                  Alerts
                </Typography>
                <AlertChips alerts={patient.alerts} size="medium" />
              </>
            )}
          </Section>

          <Section id="meds-title" title="Current medications">
            {record && record.medications.length > 0 ? (
              <Stack component="ul" divider={<Divider flexItem />} spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
                {record.medications.map((m) => (
                  <Box component="li" key={m.name}>
                    <Typography sx={{ fontWeight: 700 }}>{m.name}</Typography>
                    <Typography variant="body2">{m.dose}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Since {fmtDate(m.since)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No current medications on file.</Typography>
            )}
          </Section>

          <Section id="vax-title" title="Vaccinations">
            {record ? (
              <TableContainer>
                <Table size="small" aria-labelledby="vax-title">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vaccine</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Given</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {record.vaccinations.map((v) => {
                      const state = vaccineState(v);
                      return (
                        <TableRow
                          key={v.name}
                          sx={{ bgcolor: state.kind === "overdue" ? tint("error", 10) : undefined, "&:last-child td": { borderBottom: 0 } }}
                        >
                          <TableCell component="th" scope="row" sx={{ fontWeight: 700 }}>
                            {v.name}
                          </TableCell>
                          <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{fmtDate(v.given)}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(v.due)}</TableCell>
                          <TableCell>
                            <VaccineChip state={state} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No vaccination history on file.</Typography>
            )}
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
              Checked against today, {fmtDate(TODAY)}.
            </Typography>
          </Section>
        </Stack>

        <Stack spacing={2.5}>
          <Section id="weight-title" title="Weight trend">
            {record && first && last ? (
              <>
                <Stack direction="row" spacing={3} useFlexGap sx={{ mb: 1, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Latest, {fmtDate(last.date)}
                    </Typography>
                    <Typography sx={bigNumber}>{last.kg.toFixed(1)} kg</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Since {fmtDate(first.date)}
                    </Typography>
                    <Typography sx={{ ...bigNumber, color: change < 0 ? "warning.main" : "text.primary" }}>
                      {change > 0 ? "+" : "−"}
                      {Math.abs(change).toFixed(1)} kg
                      <Typography component="span" sx={{ color: "text.secondary", fontSize: "1rem", fontWeight: 500 }}>
                        {" "}
                        ({Math.abs(changePct).toFixed(1)}%)
                      </Typography>
                    </Typography>
                  </Box>
                  {prev && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Since last visit
                      </Typography>
                      <Typography sx={bigNumber}>
                        {last.kg - prev.kg > 0 ? "+" : "−"}
                        {Math.abs(last.kg - prev.kg).toFixed(1)} kg
                      </Typography>
                    </Box>
                  )}
                </Stack>
                <WeightChart points={weights} name={patient.name} />
                <Box component="p" sx={srOnly}>
                  Weight readings: {weights.map((w) => `${fmtDate(w.date)}, ${w.kg} kilograms`).join("; ")}.
                </Box>
              </>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No weights recorded yet.</Typography>
            )}
          </Section>

          <Section id="visits-title" title="Visit history">
            {record && record.visits.length > 0 ? (
              <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
                {record.visits.map((v) => (
                  <Paper
                    component="li"
                    variant="outlined"
                    key={v.date}
                    sx={{ p: 1.75, borderLeft: 4, borderLeftColor: v.date === TODAY ? "primary.main" : "divider" }}
                  >
                    <Stack direction="row" spacing={2} useFlexGap sx={{ justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                      <Typography sx={{ fontWeight: 800 }}>
                        {fmtDate(v.date)}
                        {v.date === TODAY && <Chip size="small" color="primary" label="Today" sx={{ ml: 1, fontWeight: 700 }} />}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {vetById(v.vet).name} · {fmtUsd(v.invoice_usd)}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontWeight: 600, mt: 0.25 }}>{v.reason}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {v.notes}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No past visits on file for {patient.name}.</Typography>
            )}
          </Section>
        </Stack>
      </Box>
    </Stack>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ScheduleBoard } from "@/components/ScheduleBoard";

export const metadata: Metadata = { title: "Today's schedule · Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <ScheduleBoard />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PatientRecord } from "@/components/PatientRecord";
import { patientById, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = patientById(id);
  return { title: patient ? `${patient.name} · Pawpoint` : "Patient not found · Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  return (
    <AppShell>
      <PatientRecord patient={patient} />
    </AppShell>
  );
}
```

```tsx app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes. Palette chosen for contrast: status and alert colours
// stay readable at counter distance in both modes. System font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0b6b66" },
        secondary: { main: "#3d4f7c" },
        info: { main: "#0b5cad" },
        success: { main: "#1b6e3c" },
        warning: { main: "#8a4b00" },
        error: { main: "#b3261e" },
        background: { default: "#f2f6f5", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#5fd3c8" },
        secondary: { main: "#a9b8e8" },
        info: { main: "#8ab8ff" },
        success: { main: "#7bd69a" },
        warning: { main: "#ffb454" },
        error: { main: "#ff8f87" },
        background: { default: "#0e1514", paper: "#162120" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default theme;
```

```tsx app/layout.tsx
import type { Metadata, Viewport } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

export const metadata: Metadata = {
  title: "Pawpoint",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```
