```ts lib/data.ts
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

export interface PatientRecordData {
  weights_kg: { date: string; kg: number }[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const CLINIC = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const CLINIC_NAME = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
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

/** When the patients who are already checked in arrived at the counter. */
export const CHECKED_IN_AT: Record<string, string> = {
  "a-05": "09:20",
  "a-06": "09:41",
};

/** The desk clock starts here and then ticks forward while the page is open. */
export const START_NOW = 9 * 60 + 52;

export const RECORDS: Record<string, PatientRecordData> = {
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

/** Appointment start times offered when booking, every 15 minutes. */
export const SLOT_STARTS: number[] = Array.from({ length: 36 }, (_, i) => 8 * 60 + i * 15);
export const CLOSING = 17 * 60 + 30;

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}
export function mustPatient(id: string): Patient {
  const p = getPatient(id);
  if (!p) throw new Error(`Unknown patient ${id}`);
  return p;
}
export function ownerOf(patient: Patient): Owner {
  const o = OWNERS.find((x) => x.id === patient.owner);
  if (!o) throw new Error(`Unknown owner ${patient.owner}`);
  return o;
}
export function vetOf(id: string): Vet {
  const v = VETS.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown vet ${id}`);
  return v;
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fmtClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function fmtDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function utc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((utc(toIso) - utc(fromIso)) / 86400000);
}

export function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(utc(iso)));
}

export function fmtDateShort(iso: string): string {
  const d = new Date(utc(iso));
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(d);
  return `${month} '${String(d.getUTCFullYear()).slice(2)}`;
}

export function fmtUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function ageText(born: string, today: string = TODAY): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}

/** An existing, non-cancelled booking of the same vet that overlaps the proposed time. */
export function findClash(
  appointments: Appointment[],
  vetId: string,
  startMin: number,
  minutes: number,
  ignoreId?: string,
): Appointment | undefined {
  const end = startMin + minutes;
  return appointments.find((a) => {
    if (a.vet !== vetId || a.status === "cancelled" || a.id === ignoreId) return false;
    const s = toMinutes(a.start);
    return startMin < s + a.minutes && s < end;
  });
}

/** First start time at or after `fromMin` where the vet has no clash and the visit ends before closing. */
export function nextFreeSlot(
  appointments: Appointment[],
  vetId: string,
  minutes: number,
  fromMin: number,
): number | undefined {
  return SLOT_STARTS.find(
    (s) => s >= fromMin && s + minutes <= CLOSING && !findClash(appointments, vetId, s, minutes),
  );
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// Calm teal clinic palette. Colors are picked so white (light) or near-black (dark)
// text on every filled status color keeps at least 4.5:1 contrast.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0f766e", contrastText: "#ffffff" },
        secondary: { main: "#475569" },
        error: { main: "#c62828", contrastText: "#ffffff" },
        warning: { main: "#b45309", contrastText: "#ffffff" },
        info: { main: "#0369a1", contrastText: "#ffffff" },
        success: { main: "#15803d", contrastText: "#ffffff" },
        background: { default: "#f1f5f4", paper: "#ffffff" },
        divider: "#d5dedc",
      },
    },
    dark: {
      palette: {
        primary: { main: "#2dd4bf", contrastText: "#06302b" },
        secondary: { main: "#94a3b8" },
        error: { main: "#d32f2f", contrastText: "#ffffff" },
        warning: { main: "#f59e0b", contrastText: "#1c1100" },
        info: { main: "#38bdf8", contrastText: "#04202e" },
        success: { main: "#4ade80", contrastText: "#052e13" },
        background: { default: "#0c1311", paper: "#141d1b" },
        divider: "#26332f",
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700 } },
    },
  },
});

export default theme;
```

```tsx components/AlertChips.tsx
"use client";

import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Chip from "@mui/material/Chip";

/** A translucent tint of the error color that works in light and dark mode. */
export const errorTint = (pct: number) =>
  `color-mix(in srgb, var(--mui-palette-error-main) ${pct}%, transparent)`;

interface Props {
  alerts: string[];
  size?: "small" | "medium";
}

/** Medical alerts as bold red-bordered chips. Renders nothing when there are none. */
export default function AlertChips({ alerts, size = "small" }: Props) {
  if (alerts.length === 0) return null;
  return (
    <ul
      aria-label="Medical alerts"
      style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}
    >
      {alerts.map((alert) => (
        <li key={alert}>
          <Chip
            size={size}
            icon={<WarningAmberRounded />}
            label={`Alert: ${alert}`}
            sx={{
              height: "auto",
              minHeight: size === "small" ? 24 : 32,
              maxWidth: "100%",
              color: "text.primary",
              fontWeight: 700,
              border: "1.5px solid",
              borderColor: "error.main",
              bgcolor: errorTint(14),
              "& .MuiChip-icon": { color: "error.main" },
              "& .MuiChip-label": { whiteSpace: "normal", py: 0.25 },
            }}
          />
        </li>
      ))}
    </ul>
  );
}
```

```tsx components/StatusChip.tsx
"use client";

import CancelOutlined from "@mui/icons-material/CancelOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import EventOutlined from "@mui/icons-material/EventOutlined";
import HourglassTop from "@mui/icons-material/HourglassTop";
import MedicalServicesOutlined from "@mui/icons-material/MedicalServicesOutlined";
import Chip from "@mui/material/Chip";
import { STATUS_LABEL, type Status } from "@/lib/data";

const META: Record<
  Status,
  { color: "default" | "warning" | "info" | "success"; variant: "filled" | "outlined"; icon: React.ReactElement }
> = {
  booked: { color: "default", variant: "outlined", icon: <EventOutlined /> },
  checked_in: { color: "warning", variant: "filled", icon: <HourglassTop /> },
  in_exam: { color: "info", variant: "filled", icon: <MedicalServicesOutlined /> },
  done: { color: "success", variant: "outlined", icon: <CheckCircleOutline /> },
  cancelled: { color: "default", variant: "outlined", icon: <CancelOutlined /> },
};

export default function StatusChip({ status, size = "small" }: { status: Status; size?: "small" | "medium" }) {
  const m = META[status];
  return <Chip size={size} color={m.color} variant={m.variant} icon={m.icon} label={STATUS_LABEL[status]} />;
}
```

```tsx components/PatientSearch.tsx
"use client";

import SearchIcon from "@mui/icons-material/Search";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { PATIENTS, ownerOf, type Patient } from "@/lib/data";

export default function PatientSearch() {
  const router = useRouter();
  return (
    <Autocomplete
      options={PATIENTS}
      value={null}
      blurOnSelect
      clearOnBlur
      autoHighlight
      fullWidth
      noOptionsText="No patient or owner with that name"
      getOptionLabel={(p: Patient) => p.name}
      filterOptions={(options, state) => {
        const q = state.inputValue.trim().toLowerCase();
        if (!q) return options;
        return options.filter((p) => p.name.toLowerCase().includes(q) || ownerOf(p).name.toLowerCase().includes(q));
      }}
      onChange={(_, p) => {
        if (p) router.push(`/patients/${p.id}`);
      }}
      renderOption={(props, p) => {
        const { key, ...optionProps } = props;
        const owner = ownerOf(p);
        return (
          <Box component="li" key={key} {...optionProps} sx={{ gap: 1.5, py: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {p.species}, {p.breed} · Owner {owner.name}
              </Typography>
              {p.alerts.length > 0 && (
                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700 }}>
                  <WarningAmberRounded fontSize="inherit" sx={{ color: "error.main" }} />
                  Alert: {p.alerts.join("; ")}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Search patient or owner"
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
        />
      )}
    />
  );
}
```

```tsx components/AppShell.tsx
"use client";

import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import Pets from "@mui/icons-material/Pets";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import NextLink from "next/link";
import * as React from "react";
import PatientSearch from "@/components/PatientSearch";
import { CLINIC_NAME, USER } from "@/lib/data";

function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const resolved = mode === "system" ? systemMode : mode;
  const dark = resolved === "dark";
  if (!mounted) return <Box sx={{ width: 40, height: 40 }} />;
  return (
    <Tooltip title={dark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setMode(dark ? "light" : "dark")}>
        {dark ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const initials = USER.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <Box
        component="a"
        href="#main"
        sx={{
          position: "absolute",
          left: 8,
          top: -60,
          zIndex: 2000,
          bgcolor: "background.paper",
          color: "text.primary",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to main content
      </Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar sx={{ gap: { xs: 1, md: 3 }, flexWrap: "wrap", py: { xs: 1, md: 1.25 }, px: { xs: 2, md: 3 } }}>
          <Box
            component={NextLink}
            href="/"
            aria-label="Pawpoint, today's schedule"
            sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none", mr: "auto" }}
          >
            <Avatar variant="rounded" sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
              <Pets />
            </Avatar>
            <Box>
              <Typography variant="h6" component="span" sx={{ display: "block", lineHeight: 1.1 }}>
                Pawpoint
              </Typography>
              <Typography variant="caption" sx={{ display: "block", lineHeight: 1.2, color: "text.secondary" }}>
                {CLINIC_NAME}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ order: { xs: 3, md: 0 }, width: { xs: "100%", md: 420 } }}>
            <PatientSearch />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <ModeToggle />
            <Avatar sx={{ width: 36, height: 36, bgcolor: "secondary.main", color: "background.paper", fontSize: 14 }}>{initials}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                {USER.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {USER.role}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" id="main" tabIndex={-1} sx={{ outline: "none" }}>
        {children}
      </Box>
    </Box>
  );
}
```

```tsx components/BookingDialog.tsx
"use client";

import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import AlertChips from "@/components/AlertChips";
import {
  CLOSING,
  PATIENTS,
  SLOT_STARTS,
  VETS,
  findClash,
  fmtClock,
  mustPatient,
  nextFreeSlot,
  ownerOf,
  toMinutes,
  vetOf,
  type Appointment,
} from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60];

interface Props {
  open: boolean;
  now: number;
  appointments: Appointment[];
  onClose: () => void;
  onBook: (appointment: Omit<Appointment, "id" | "status">) => void;
}

function fmtHHMM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export default function BookingDialog({ open, now, appointments, onClose, onBook }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const firstSlot = SLOT_STARTS.find((s) => s >= now) ?? SLOT_STARTS[0];

  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState(VETS[0].id);
  const [start, setStart] = React.useState(firstSlot);
  const [minutes, setMinutes] = React.useState(20);
  const [reason, setReason] = React.useState("");

  const patient = patientId ? mustPatient(patientId) : undefined;
  const vet = vetOf(vetId);
  const clash = findClash(appointments, vetId, start, minutes);
  const tooLate = start + minutes > CLOSING;
  const suggestion = clash || tooLate ? nextFreeSlot(appointments, vetId, minutes, start) : undefined;
  const canBook = Boolean(patient) && reason.trim().length > 0 && !clash && !tooLate;

  const submit = () => {
    if (!canBook) return;
    onBook({ patient: patientId, vet: vetId, start: fmtHHMM(start), minutes, reason: reason.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <DialogTitle id="book-title">Book an appointment</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            select
            required
            label="Patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            helperText={patient ? `Owner: ${ownerOf(patient).name}, ${ownerOf(patient).phone}` : "Choose who the visit is for"}
          >
            {PATIENTS.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} · {p.species}, {ownerOf(p).name}
                {p.alerts.length > 0 && <WarningAmberRounded fontSize="small" sx={{ color: "error.main", ml: 1 }} titleAccess="Has medical alerts" />}
              </MenuItem>
            ))}
          </TextField>
          {patient && patient.alerts.length > 0 && <AlertChips alerts={patient.alerts} size="medium" />}
          <TextField select required label="Vet" value={vetId} onChange={(e) => setVetId(e.target.value)}>
            {VETS.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name} · {v.room}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField select required fullWidth label="Time today" value={String(start)} onChange={(e) => setStart(Number(e.target.value))}>
              {SLOT_STARTS.map((s) => (
                <MenuItem key={s} value={String(s)}>
                  {fmtClock(s)}
                </MenuItem>
              ))}
            </TextField>
            <TextField select required fullWidth label="Length" value={String(minutes)} onChange={(e) => setMinutes(Number(e.target.value))}>
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={String(d)}>
                  {d} minutes
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            required
            label="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="For example: Ear infection follow-up"
          />
          {clash && (
            <Alert
              severity="error"
              action={
                suggestion !== undefined ? (
                  <Button color="inherit" size="small" onClick={() => setStart(suggestion)}>
                    Use {fmtClock(suggestion)}
                  </Button>
                ) : undefined
              }
            >
              {vet.name} is already booked from {fmtClock(toMinutes(clash.start))} to {fmtClock(toMinutes(clash.start) + clash.minutes)} ({mustPatient(clash.patient).name}, {clash.reason}).
              {suggestion !== undefined ? ` Next free: ${fmtClock(suggestion)}.` : " No free time left today."}
            </Alert>
          )}
          {!clash && tooLate && (
            <Alert severity="warning">The visit would end after closing time ({fmtClock(CLOSING)}). Pick an earlier time or a shorter visit.</Alert>
          )}
          {!clash && !tooLate && patient && reason.trim() && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {vet.name} is free from {fmtClock(start)} to {fmtClock(start + minutes)} in {vet.room}.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" size="large" onClick={submit} disabled={!canBook}>
          Book appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import AccessTime from "@mui/icons-material/AccessTime";
import Add from "@mui/icons-material/Add";
import Login from "@mui/icons-material/Login";
import MeetingRoomOutlined from "@mui/icons-material/MeetingRoomOutlined";
import PlayArrow from "@mui/icons-material/PlayArrow";
import PriorityHigh from "@mui/icons-material/PriorityHigh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import * as React from "react";
import AlertChips, { errorTint } from "@/components/AlertChips";
import BookingDialog from "@/components/BookingDialog";
import StatusChip from "@/components/StatusChip";
import {
  APPOINTMENTS,
  CHECKED_IN_AT,
  START_NOW,
  TODAY,
  VETS,
  fmtClock,
  fmtDate,
  fmtDuration,
  mustPatient,
  ownerOf,
  toMinutes,
  vetOf,
  type Appointment,
} from "@/lib/data";

const LONG_WAIT = 30;

function initialArrivals(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, t] of Object.entries(CHECKED_IN_AT)) out[id] = toMinutes(t);
  return out;
}

export default function Schedule() {
  const [appts, setAppts] = React.useState<Appointment[]>(APPOINTMENTS);
  const [arrivals, setArrivals] = React.useState<Record<string, number>>(initialArrivals);
  const [now, setNow] = React.useState(START_NOW);
  const [filter, setFilter] = React.useState("all");
  const [bookOpen, setBookOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => setNow(START_NOW + Math.floor((Date.now() - t0) / 60000)), 10000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = React.useMemo(
    () => [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );
  const visible = filter === "all" ? sorted : sorted.filter((a) => a.vet === filter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (arrivals[a.id] ?? now) - (arrivals[b.id] ?? now));
  const count = (s: Appointment["status"]) => appts.filter((a) => a.status === s).length;
  const urgent = sorted.filter((a) => a.urgent && (a.status === "booked" || a.status === "checked_in"));

  const checkIn = (a: Appointment) => {
    setAppts((list) => list.map((x) => (x.id === a.id ? { ...x, status: "checked_in" } : x)));
    setArrivals((m) => ({ ...m, [a.id]: now }));
    const p = mustPatient(a.patient);
    setToast(`${p.name} is checked in and on the waiting list${p.alerts.length ? `. Alert: ${p.alerts.join("; ")}` : ""}`);
  };
  const startExam = (a: Appointment) => {
    setAppts((list) => list.map((x) => (x.id === a.id ? { ...x, status: "in_exam" } : x)));
    setToast(`${mustPatient(a.patient).name} sent to ${vetOf(a.vet).room}`);
  };
  const book = (draft: Omit<Appointment, "id" | "status">) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { ...draft, id, status: "booked" }]);
    setBookOpen(false);
    setToast(`Booked ${mustPatient(draft.patient).name} with ${vetOf(draft.vet).name} at ${fmtClock(toMinutes(draft.start))}`);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 2.5 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Today&apos;s schedule
          </Typography>
          <Typography sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            {fmtDate(TODAY)} · <AccessTime fontSize="small" /> It is {fmtClock(now)} · {appts.filter((a) => a.status !== "cancelled").length} appointments, 3 vets
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<Add />} onClick={() => setBookOpen(true)} sx={{ minHeight: 48 }}>
          Book appointment
        </Button>
      </Stack>

      <Grid container spacing={1.5} sx={{ mb: 2.5, listStyle: "none", p: 0, m: 0 }} component="ul" aria-label="Clinic status">
        {[
          { label: "Waiting now", value: waiting.length, tone: "warning.main" },
          { label: "In exam", value: count("in_exam"), tone: "info.main" },
          { label: "Still to arrive", value: count("booked"), tone: "text.primary" },
          { label: "Done today", value: count("done"), tone: "success.main" },
        ].map((s) => (
          <Grid key={s.label} component="li" size={{ xs: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%", borderLeft: 5, borderLeftColor: s.tone }}>
              <Typography variant="h4" component="p" sx={{ lineHeight: 1 }}>
                {s.value}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {urgent.map((a) => {
        const p = mustPatient(a.patient);
        return (
          <Alert key={a.id} severity="error" icon={<PriorityHigh />} sx={{ mb: 2, fontWeight: 600, border: 1, borderColor: "error.main" }}>
            Urgent visit: {p.name} ({ownerOf(p).name}) at {fmtClock(toMinutes(a.start))} with {vetOf(a.vet).name}. {a.reason}.
          </Alert>
        );
      })}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 0, lg: 1 } }}>
          <Paper variant="outlined" sx={{ p: 2, position: { lg: "sticky" }, top: { lg: 96 } }} component="section" aria-labelledby="waiting-title">
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="h6" component="h2" id="waiting-title">
                Waiting list
              </Typography>
              <Chip size="small" color={waiting.length ? "warning" : "default"} label={`${waiting.length} waiting`} />
            </Stack>
            {waiting.length === 0 ? (
              <Typography sx={{ color: "text.secondary", py: 2 }}>
                Nobody is waiting. Check patients in from the schedule as they arrive.
              </Typography>
            ) : (
              <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
                {waiting.map((a, i) => {
                  const p = mustPatient(a.patient);
                  const v = vetOf(a.vet);
                  const mins = Math.max(0, now - (arrivals[a.id] ?? now));
                  const long = mins >= LONG_WAIT;
                  return (
                    <Paper
                      key={a.id}
                      component="li"
                      variant="outlined"
                      sx={{ p: 1.5, borderColor: long ? "warning.main" : "divider", borderWidth: long ? 2 : 1 }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                        <Typography variant="h5" component="span" sx={{ minWidth: 24, color: "text.secondary" }} aria-label={`Position ${i + 1}`}>
                          {i + 1}
                        </Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Link component={NextLink} href={`/patients/${p.id}`} underline="hover" color="inherit" sx={{ fontWeight: 700, fontSize: 18 }}>
                            {p.name}
                          </Link>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {ownerOf(p).name} · {a.reason}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {v.name} · {v.room} · booked {fmtClock(toMinutes(a.start))}
                          </Typography>
                          <Box sx={{ my: 0.75 }}>
                            <AlertChips alerts={p.alerts} />
                          </Box>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                            <Chip
                              size="small"
                              color={long ? "warning" : "default"}
                              variant={long ? "filled" : "outlined"}
                              icon={<AccessTime />}
                              label={`Waiting ${fmtDuration(mins)} (since ${fmtClock(arrivals[a.id] ?? now)})`}
                            />
                            <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={() => startExam(a)} aria-label={`Send ${p.name} to ${v.room}`}>
                              Send to exam
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 1, lg: 0 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 1.5, alignItems: { sm: "center" }, justifyContent: "space-between" }}>
            <Typography variant="h6" component="h2">
              All appointments
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={filter}
              onChange={(_, v: string | null) => {
                if (v) setFilter(v);
              }}
              aria-label="Filter by vet"
              sx={{ "& .MuiToggleButton-root": { minHeight: 40, px: 2 } }}
            >
              <ToggleButton value="all">All vets</ToggleButton>
              {VETS.map((v) => (
                <ToggleButton key={v.id} value={v.id}>
                  {v.name.split(" ").slice(-1)[0]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
          <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0 }}>
            {visible.map((a) => (
              <ScheduleRow key={a.id} appt={a} onCheckIn={checkIn} onStartExam={startExam} />
            ))}
            {visible.length === 0 && (
              <Typography sx={{ color: "text.secondary", py: 3 }}>
                No appointments for this vet.
              </Typography>
            )}
          </Stack>
        </Grid>
      </Grid>

      {bookOpen && <BookingDialog open now={now} appointments={appts} onClose={() => setBookOpen(false)} onBook={book} />}

      <Snackbar
        open={toast !== null}
        autoHideDuration={6000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)} sx={{ width: "100%" }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function ScheduleRow({
  appt,
  onCheckIn,
  onStartExam,
}: {
  appt: Appointment;
  onCheckIn: (a: Appointment) => void;
  onStartExam: (a: Appointment) => void;
}) {
  const p = mustPatient(appt.patient);
  const v = vetOf(appt.vet);
  const start = toMinutes(appt.start);
  const cancelled = appt.status === "cancelled";
  const done = appt.status === "done";
  const urgent = Boolean(appt.urgent) && !cancelled && !done;
  return (
    <Paper
      component="li"
      variant="outlined"
      sx={{
        display: "grid",
        gap: { xs: 1, md: 2 },
        p: { xs: 1.5, md: 2 },
        alignItems: "center",
        gridTemplateColumns: { xs: "78px minmax(0,1fr)", md: "100px minmax(0,1fr) 150px 200px" },
        gridTemplateAreas: { xs: '"time main" "time meta" "action action"', md: '"time main meta action"' },
        opacity: cancelled ? 0.65 : done ? 0.85 : 1,
        borderLeft: urgent ? 6 : 1,
        borderLeftColor: urgent ? "error.main" : "divider",
        bgcolor: urgent ? errorTint(9) : "background.paper",
        ...(urgent ? { borderColor: "error.main" } : {}),
      }}
    >
      <Box sx={{ gridArea: "time" }}>
        <Typography sx={{ fontWeight: 700, textDecoration: cancelled ? "line-through" : "none", fontVariantNumeric: "tabular-nums" }}>
          {fmtClock(start)}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {appt.minutes} min
        </Typography>
      </Box>
      <Box sx={{ gridArea: "main", minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
          <Link component={NextLink} href={`/patients/${p.id}`} underline="hover" color="inherit" sx={{ fontWeight: 700, fontSize: 18 }}>
            {p.name}
          </Link>
          {urgent && <Chip size="small" color="error" icon={<PriorityHigh />} label="URGENT" sx={{ fontWeight: 800 }} />}
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {p.species} · {ownerOf(p).name}
          </Typography>
        </Stack>
        <Typography sx={{ textDecoration: cancelled ? "line-through" : "none" }}>{appt.reason}</Typography>
        {p.alerts.length > 0 && (
          <Box sx={{ mt: 0.75 }}>
            <AlertChips alerts={p.alerts} />
          </Box>
        )}
      </Box>
      <Box sx={{ gridArea: "meta" }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {v.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
          <MeetingRoomOutlined fontSize="inherit" /> {v.room}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ gridArea: "action", alignItems: "center", justifyContent: { xs: "space-between", md: "flex-end" }, flexWrap: "wrap", rowGap: 1 }}
      >
        <StatusChip status={appt.status} />
        {appt.status === "booked" && (
          <Button variant="contained" startIcon={<Login />} onClick={() => onCheckIn(appt)} aria-label={`Check in ${p.name}`} sx={{ minHeight: 44 }}>
            Check in
          </Button>
        )}
        {appt.status === "checked_in" && (
          <Button variant="outlined" startIcon={<PlayArrow />} onClick={() => onStartExam(appt)} aria-label={`Send ${p.name} to ${v.room}`} sx={{ minHeight: 44 }}>
            Send to exam
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import ArrowBack from "@mui/icons-material/ArrowBack";
import MedicalServicesOutlined from "@mui/icons-material/MedicalServicesOutlined";
import Pets from "@mui/icons-material/Pets";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import TrendingDown from "@mui/icons-material/TrendingDown";
import TrendingUp from "@mui/icons-material/TrendingUp";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import NextLink from "next/link";
import * as React from "react";
import { errorTint } from "@/components/AlertChips";
import StatusChip from "@/components/StatusChip";
import {
  APPOINTMENTS,
  RECORDS,
  TODAY,
  ageText,
  daysBetween,
  fmtClock,
  fmtDate,
  fmtDateShort,
  fmtUsd,
  mustPatient,
  ownerOf,
  toMinutes,
  vetOf,
} from "@/lib/data";

function Section({ title, id, action, children }: { title: string; id: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby={id} sx={{ p: { xs: 2, md: 2.5 }, height: "100%" }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5, gap: 1, flexWrap: "wrap" }}>
        <Typography variant="h6" component="h2" id={id}>
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography component="div" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
}

export default function PatientRecord({ patientId }: { patientId: string }) {
  const patient = mustPatient(patientId);
  const owner = ownerOf(patient);
  const record = RECORDS[patientId];
  const todays = APPOINTMENTS.filter((a) => a.patient === patientId).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const delta = first && last ? last.kg - first.kg : 0;
  const pct = first && last ? (delta / first.kg) * 100 : 0;

  const vaccinations = (record?.vaccinations ?? []).map((v) => {
    const untilDue = daysBetween(TODAY, v.due);
    const state: "overdue" | "soon" | "ok" = untilDue < 0 ? "overdue" : untilDue <= 60 ? "soon" : "ok";
    return { ...v, untilDue, state };
  });
  const overdue = vaccinations.filter((v) => v.state === "overdue");

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
      <Button component={NextLink} href="/" startIcon={<ArrowBack />} sx={{ mb: 1.5, ml: -1 }}>
        Back to today&apos;s schedule
      </Button>

      <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <Pets fontSize="large" />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" component="h1">
            {patient.name}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {patient.breed} · {patient.species} · {ageText(patient.born)} · Patient ID {patient.id}
          </Typography>
        </Box>
      </Stack>

      {patient.alerts.length > 0 && (
        <Paper
          component="section"
          aria-label="Medical alerts"
          variant="outlined"
          sx={{ mb: 2.5, p: { xs: 2, md: 2.5 }, borderWidth: 2, borderColor: "error.main", borderLeftWidth: 10, bgcolor: errorTint(12) }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
            <WarningAmberRounded sx={{ color: "error.main" }} fontSize="large" />
            <Typography variant="h6" component="h2" sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Medical alerts
            </Typography>
          </Stack>
          <Stack component="ul" spacing={0.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
            {patient.alerts.map((a) => (
              <Typography key={a} component="li" variant="h5" sx={{ fontWeight: 800 }}>
                {a}
              </Typography>
            ))}
          </Stack>
        </Paper>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Patient and owner" id="details-title">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Fact label="Species">{patient.species}</Fact>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Fact label="Breed">{patient.breed}</Fact>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Fact label="Born">
                  {fmtDate(patient.born)} ({ageText(patient.born)})
                </Fact>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Fact label="Sex">{patient.sex}</Fact>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Fact label="Owner">{owner.name}</Fact>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Fact label="Phone">
                  <Link href={`tel:${owner.phone.replace(/\s/g, "")}`} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <PhoneOutlined fontSize="small" /> {owner.phone}
                  </Link>
                </Fact>
              </Grid>
            </Grid>
          </Section>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Today at the clinic" id="today-title">
            {todays.length === 0 ? (
              <Typography sx={{ color: "text.secondary" }}>No appointments today.</Typography>
            ) : (
              <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
                {todays.map((a) => (
                  <Stack key={a.id} component="li" direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 0.5 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {fmtClock(toMinutes(a.start))} · {a.reason}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {vetOf(a.vet).name} · {vetOf(a.vet).room} · {a.minutes} min
                      </Typography>
                    </Box>
                    <StatusChip status={a.status} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Section>
        </Grid>

        {!record && (
          <Grid size={{ xs: 12 }}>
            <Section title="Clinical record" id="norecord-title">
              <Typography sx={{ color: "text.secondary" }}>
                Weights, vaccinations, medications and visit history are not loaded for {patient.name} in this demo.
              </Typography>
            </Section>
          </Grid>
        )}

        {record && (
          <>
            <Grid size={{ xs: 12, md: 7 }}>
              <Section
                title="Weight trend"
                id="weight-title"
                action={
                  first && last ? (
                    <Chip
                      icon={delta < 0 ? <TrendingDown /> : <TrendingUp />}
                      color={delta < 0 ? "warning" : "default"}
                      label={`${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg (${pct.toFixed(1)}%) since ${fmtDate(first.date)}`}
                    />
                  ) : undefined
                }
              >
                <Typography variant="h4" component="p" sx={{ lineHeight: 1.1 }}>
                  {last?.kg.toFixed(1)} kg
                  <Typography component="span" sx={{ ml: 1, color: "text.secondary" }}>
                    on {last ? fmtDate(last.date) : ""}
                  </Typography>
                </Typography>
                <Box
                  role="img"
                  aria-label={`Line chart of weight in kilograms over ${weights.length} visits: ${weights.map((w) => `${w.kg} on ${fmtDate(w.date)}`).join(", ")}`}
                  sx={{ mt: 1 }}
                >
                  <LineChart
                    height={260}
                    hideLegend
                    grid={{ horizontal: true }}
                    xAxis={[
                      {
                        scaleType: "point",
                        data: weights.map((w) => w.date),
                        valueFormatter: (v, ctx) => (ctx.location === "tooltip" ? fmtDate(String(v)) : fmtDateShort(String(v))),
                      },
                    ]}
                    yAxis={[{ min: 27, max: 33, valueFormatter: (v: number) => `${v} kg` }]}
                    series={[
                      {
                        data: weights.map((w) => w.kg),
                        label: "Weight",
                        showMark: true,
                        valueFormatter: (v: number | null) => (v === null ? "" : `${v.toFixed(1)} kg`),
                      },
                    ]}
                  />
                </Box>
              </Section>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Section title="Current medications" id="meds-title" action={<Chip size="small" icon={<MedicalServicesOutlined />} label={`${record.medications.length} active`} />}>
                <Stack component="ul" divider={<Divider flexItem />} spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {record.medications.map((m) => (
                    <Box component="li" key={m.name}>
                      <Typography sx={{ fontWeight: 700 }}>{m.name}</Typography>
                      <Typography>{m.dose}</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Since {fmtDate(m.since)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                {patient.alerts.some((a) => /penicillin/i.test(a)) && (
                  <Typography variant="body2" sx={{ mt: 2, fontWeight: 700, display: "flex", gap: 0.75, alignItems: "center" }}>
                    <WarningAmberRounded fontSize="small" sx={{ color: "error.main" }} /> Penicillin allergy: no penicillin-class antibiotics.
                  </Typography>
                )}
              </Section>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Section
                title="Vaccinations"
                id="vax-title"
                action={
                  overdue.length > 0 ? (
                    <Chip color="error" icon={<WarningAmberRounded />} label={`${overdue.length} overdue`} sx={{ fontWeight: 800 }} />
                  ) : (
                    <Chip color="success" variant="outlined" label="All up to date" />
                  )
                }
              >
                <TableContainer>
                  <Table size="medium" aria-label={`Vaccinations for ${patient.name}, overdue ones checked against ${fmtDate(TODAY)}`}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Vaccine</TableCell>
                        <TableCell>Given</TableCell>
                        <TableCell>Due</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vaccinations.map((v) => (
                        <TableRow key={v.name} sx={v.state === "overdue" ? { bgcolor: errorTint(12), "& td, & th": { fontWeight: 700 } } : undefined}>
                          <TableCell component="th" scope="row">
                            {v.name}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(v.given)}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(v.due)}</TableCell>
                          <TableCell>
                            {v.state === "overdue" && (
                              <Chip color="error" size="small" icon={<WarningAmberRounded />} label={`Overdue by ${-v.untilDue} days`} sx={{ fontWeight: 800 }} />
                            )}
                            {v.state === "soon" && <Chip color="warning" size="small" label={`Due in ${v.untilDue} days`} />}
                            {v.state === "ok" && <Chip color="success" size="small" variant="outlined" label="Up to date" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Section>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Section title="Visit history" id="visits-title">
                <Stack component="ol" divider={<Divider flexItem />} spacing={2} sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {record.visits.map((v) => (
                    <Box component="li" key={v.date}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.25, sm: 2 }} sx={{ justifyContent: "space-between" }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          {fmtDate(v.date)} · {v.reason}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {vetOf(v.vet).name} · {fmtUsd(v.invoice_usd)}
                        </Typography>
                      </Stack>
                      <Typography sx={{ mt: 0.5 }}>{v.notes}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Section>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Schedule from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule | Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <Schedule />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import PatientRecord from "@/components/PatientRecord";
import { PATIENTS, getPatient } from "@/lib/data";

export function generateStaticParams() {
  return PATIENTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient not found | Pawpoint" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getPatient(id)) notFound();
  return (
    <AppShell>
      <PatientRecord patientId={id} />
    </AppShell>
  );
}
```
