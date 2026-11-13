```tsx app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes, a calm teal brand and a strong red reserved for medical alerts.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0b6e6e" },
        error: { main: "#c62828", contrastText: "#ffffff" },
        background: { default: "#f3f6f7", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#4fd1c5" },
        error: { main: "#d32f2f", contrastText: "#ffffff" },
        background: { default: "#0e1416", paper: "#162023" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h2: { fontSize: "1.125rem", fontWeight: 700 },
    h3: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
```

```tsx lib/data.ts
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

export const clinic = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
export const user = { name: "Rosa Lindqvist", role: "Receptionist" };

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
  { id: "p-104", name: "Olive", species: "Dog", breed: "Labrador retriever", born: "2014-09-08", sex: "Female, spayed", owner: "o-4", alerts: ["Penicillin allergy", "Chronic kidney disease, stage 2"] },
  { id: "p-105", name: "Kiwi", species: "Bird", breed: "Budgerigar", born: "2023-03-11", sex: "Male", owner: "o-5", alerts: [] },
  { id: "p-106", name: "Tofu", species: "Rabbit", breed: "Holland lop", born: "2022-05-30", sex: "Female", owner: "o-6", alerts: [] },
  { id: "p-107", name: "Ziggy", species: "Cat", breed: "Maine coon", born: "2018-11-02", sex: "Male, neutered", owner: "o-2", alerts: ["Diabetic: insulin twice daily"] },
  { id: "p-108", name: "Bruno", species: "Dog", breed: "French bulldog", born: "2022-02-14", sex: "Male", owner: "o-5", alerts: ["Brachycephalic: sedation risk"] },
];

export const appointments: Appointment[] = [
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

export const records: Record<string, PatientRecordData> = {
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

/* The desk clock is simulated so the waiting list has something to count: it starts at 9:38 AM. */
export const NOW_START = 9 * 60 + 38;
/* Minutes since midnight at which the two already-waiting patients checked in. */
export const CHECKED_IN_AT: Record<string, number> = { "a-05": 9 * 60 + 10, "a-06": 9 * 60 + 30 };

export const OPEN_MIN = 8 * 60;
export const CLOSE_MIN = 17 * 60;

export const patientById = (id: string): Patient | undefined => patients.find((p) => p.id === id);
export const ownerById = (id: string): Owner | undefined => owners.find((o) => o.id === id);
export const vetById = (id: string): Vet | undefined => vets.find((v) => v.id === id);

export function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function fmtDate(iso: string, style: "short" | "long" = "short"): string {
  const opts: Intl.DateTimeFormatOptions =
    style === "long"
      ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" };
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
}

export function shortMonth(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", year: "2-digit" });
}

/** Whole days from date `a` to date `b` (both YYYY-MM-DD). */
export function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

export function ageOf(born: string, today: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years <= 0) return `${rem} mo`;
  return rem > 0 ? `${years} y ${rem} mo` : `${years} y`;
}

export const usd = (n: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

/** Returns the existing booking that overlaps the proposed one for the same vet, if any. */
export function findClash(
  rows: Appointment[],
  vet: string,
  start: number,
  minutes: number,
): Appointment | undefined {
  return rows.find(
    (r) =>
      r.vet === vet &&
      r.status !== "cancelled" &&
      toMin(r.start) < start + minutes &&
      start < toMin(r.start) + r.minutes,
  );
}
```

```tsx components/ui.tsx
"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { ReactElement } from "react";
import type { Status } from "@/lib/data";

/** A translucent tint of a theme palette token, safe in light and dark mode. */
export const tint = (token: string, pct: number): string =>
  `color-mix(in srgb, var(--mui-palette-${token}) ${pct}%, transparent)`;

export const visuallyHidden = {
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

interface AlertsProps {
  alerts: string[];
  variant?: "chips" | "banner";
  size?: "small" | "medium";
}

/** Medical alerts: solid red with a warning icon and a spoken prefix, so they are never missed. */
export function PatientAlerts({ alerts, variant = "chips", size = "small" }: AlertsProps) {
  if (alerts.length === 0) return null;

  if (variant === "banner") {
    return (
      <Alert
        severity="error"
        variant="filled"
        icon={<WarningAmberIcon fontSize="inherit" />}
        sx={{ alignItems: "flex-start", "& .MuiAlert-message": { width: "100%" } }}
      >
        <AlertTitle sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Medical alert{alerts.length > 1 ? "s" : ""}
        </AlertTitle>
        <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: "1.0625rem", fontWeight: 600 }}>
          {alerts.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </Box>
      </Alert>
    );
  }

  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: "wrap", gap: 0.75 }} role="list" aria-label="Medical alerts">
      {alerts.map((a) => (
        <Chip
          key={a}
          role="listitem"
          color="error"
          size={size}
          icon={<WarningAmberIcon />}
          label={
            <>
              <Box component="span" sx={visuallyHidden}>
                Medical alert:{" "}
              </Box>
              {a}
            </>
          }
          sx={{
            height: "auto",
            maxWidth: "100%",
            fontWeight: 700,
            "& .MuiChip-label": { display: "block", whiteSpace: "normal", py: 0.375 },
          }}
        />
      ))}
    </Stack>
  );
}

const STATUS: Record<Status, { label: string; token: string; icon: ReactElement }> = {
  booked: { label: "Booked", token: "text-secondary", icon: <ScheduleIcon /> },
  checked_in: { label: "Checked in", token: "info-main", icon: <HowToRegIcon /> },
  in_exam: { label: "In exam", token: "primary-main", icon: <MedicalServicesIcon /> },
  done: { label: "Done", token: "success-main", icon: <CheckCircleIcon /> },
  cancelled: { label: "Cancelled", token: "text-disabled", icon: <CancelIcon /> },
};

export const statusLabel = (s: Status): string => STATUS[s].label;

export function StatusChip({ status }: { status: Status }) {
  const m = STATUS[status];
  return (
    <Chip
      size="small"
      icon={m.icon}
      label={m.label}
      variant="outlined"
      sx={{
        fontWeight: 700,
        color: "text.primary",
        borderColor: `var(--mui-palette-${m.token})`,
        bgcolor: tint(m.token, 12),
        "& .MuiChip-icon": { color: `var(--mui-palette-${m.token})` },
        ...(status === "cancelled" ? { textDecoration: "line-through" } : {}),
      }}
    />
  );
}
```

```tsx components/AppShell.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ownerById, patients, user, type Patient } from "@/lib/data";
import { visuallyHidden } from "./ui";

function Search() {
  const router = useRouter();
  return (
    <Autocomplete<Patient>
      options={patients}
      value={null}
      blurOnSelect
      clearOnBlur
      handleHomeEndKeys
      getOptionLabel={(p) => p.name}
      noOptionsText="No patient or owner found"
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return opts;
        return opts.filter(
          (p) => p.name.toLowerCase().includes(q) || (ownerById(p.owner)?.name.toLowerCase().includes(q) ?? false),
        );
      }}
      onChange={(_e, p) => {
        if (p) router.push(`/patients/${p.id}`);
      }}
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {p.species}, {p.breed} · Owner {ownerById(p.owner)?.name}
              </Typography>
            </Box>
            {p.alerts.length > 0 && (
              <>
                <WarningAmberIcon color="error" aria-hidden />
                <Box component="span" sx={visuallyHidden}>
                  Has medical alerts
                </Box>
              </>
            )}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search patient or owner"
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Search patients and owners" },
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      sx={{ width: "100%" }}
    />
  );
}

function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const effective = mode === "system" ? systemMode : mode;
  return (
    <IconButton
      aria-label="Switch between light and dark appearance"
      onClick={() => setMode(effective === "dark" ? "light" : "dark")}
      sx={{ width: 44, height: 44 }}
    >
      {effective === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar
          sx={{
            maxWidth: 1280,
            width: "100%",
            mx: "auto",
            flexWrap: "wrap",
            gap: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.25 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            component={Link}
            href="/"
            aria-label="Pawpoint, today's schedule"
            sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "text.primary", textDecoration: "none", mr: { md: 2 } }}
          >
            <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
              <PetsIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: "1.25rem" }}>Pawpoint</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
                Hillside Veterinary Clinic
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: "1 1 280px", order: { xs: 3, sm: 0 }, minWidth: 0, maxWidth: { sm: 520 }, width: { xs: "100%", sm: "auto" } }}>
            <Search />
          </Box>

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
            <ModeToggle />
            <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role}
              </Typography>
            </Box>
            <Avatar aria-label={`${user.name}, ${user.role}`} sx={{ bgcolor: "secondary.main", width: 40, height: 40 }}>
              RL
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    </Box>
  );
}
```

```tsx components/BookDialog.tsx
"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  CLOSE_MIN,
  OPEN_MIN,
  TODAY,
  fmtDate,
  fmtTime,
  findClash,
  ownerById,
  patientById,
  patients,
  toMin,
  vetById,
  vets,
  type Appointment,
  type Patient,
} from "@/lib/data";
import { PatientAlerts, visuallyHidden } from "./ui";

const SLOTS = Array.from({ length: (CLOSE_MIN - OPEN_MIN) / 15 }, (_, i) => OPEN_MIN + i * 15);
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];

interface Props {
  rows: Appointment[];
  now: number;
  onClose: () => void;
  onBook: (a: Appointment) => void;
}

const minToHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default function BookDialog({ rows, now, onClose, onBook }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vetId, setVetId] = useState("");
  const [time, setTime] = useState<number | "">("");
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("");

  const clash = vetId !== "" && time !== "" ? findClash(rows, vetId, time, minutes) : undefined;
  const pastClose = time !== "" && time + minutes > CLOSE_MIN;
  const inPast = time !== "" && time < Math.floor(now / 15) * 15;
  const valid = patient !== null && vetId !== "" && time !== "" && !clash && !pastClose && !inPast;

  let problem = "";
  if (clash) {
    const cp = patientById(clash.patient);
    problem = `${vetById(vetId)?.name} already has ${cp?.name ?? "a patient"} (${clash.reason}) from ${fmtTime(toMin(clash.start))} to ${fmtTime(toMin(clash.start) + clash.minutes)}. Pick another time or vet.`;
  } else if (pastClose) {
    problem = `That visit would run past closing at ${fmtTime(CLOSE_MIN)}.`;
  } else if (inPast) {
    problem = "That time has already passed.";
  }

  function slotNote(s: number): string {
    if (s < Math.floor(now / 15) * 15) return "passed";
    if (vetId && findClash(rows, vetId, s, minutes)) return "taken";
    return "";
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || patient === null || time === "") return;
    onBook({
      id: `a-${String(rows.length + 1).padStart(2, "0")}`,
      patient: patient.id,
      vet: vetId,
      start: minToHHMM(time),
      minutes,
      reason: reason.trim() || "Follow-up visit",
      status: "booked",
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="book-title"
      slotProps={{ paper: { component: "form", onSubmit: submit, noValidate: true } }}
    >
      <DialogTitle id="book-title" sx={{ fontWeight: 800 }}>
        Book an appointment
        <Typography variant="body2" color="text.secondary" component="div">
          {fmtDate(TODAY, "long")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Autocomplete<Patient>
            options={patients}
            value={patient}
            onChange={(_e, p) => setPatient(p)}
            getOptionLabel={(p) => `${p.name} (${p.species}), ${ownerById(p.owner)?.name ?? ""}`}
            renderOption={(props, p) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.species}, {p.breed} · {ownerById(p.owner)?.name}
                    </Typography>
                  </Box>
                  {p.alerts.length > 0 && (
                    <>
                      <WarningAmberIcon color="error" aria-hidden />
                      <Box component="span" sx={visuallyHidden}>
                        Has medical alerts
                      </Box>
                    </>
                  )}
                </li>
              );
            }}
            renderInput={(params) => <TextField {...params} label="Patient" required placeholder="Search by pet or owner name" />}
          />
          {patient && patient.alerts.length > 0 && <PatientAlerts alerts={patient.alerts} variant="banner" />}

          <TextField select required label="Vet" value={vetId} onChange={(e) => setVetId(e.target.value)} id="book-vet">
            {vets.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name} · {v.room}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              required
              fullWidth
              label="Start time"
              id="book-time"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              helperText={vetId ? undefined : "Choose a vet to see free times"}
            >
              {SLOTS.map((s) => {
                const note = slotNote(s);
                return (
                  <MenuItem key={s} value={s} disabled={note !== ""}>
                    {fmtTime(s)}
                    {note && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({note})
                      </Typography>
                    )}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              select
              fullWidth
              label="Length"
              id="book-length"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d} minutes
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Reason for visit"
            id="book-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Follow-up visit"
          />

          <Box aria-live="polite">{problem && <Alert severity="error">{problem}</Alert>}</Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="large" disabled={!valid}>
          Book appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

```tsx components/ScheduleView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DoneIcon from "@mui/icons-material/Done";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import {
  CHECKED_IN_AT,
  NOW_START,
  TODAY,
  appointments,
  fmtDate,
  fmtTime,
  ownerById,
  patientById,
  toMin,
  vetById,
  vets,
  type Appointment,
} from "@/lib/data";
import BookDialog from "./BookDialog";
import { PatientAlerts, StatusChip, tint, visuallyHidden } from "./ui";

type Row = Appointment & { checkedInAt?: number };

const initialRows: Row[] = appointments.map((a) => ({ ...a, checkedInAt: CHECKED_IN_AT[a.id] }));

const byTime = (a: Row, b: Row) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet);

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, px: 2 }}>
      <Typography variant="h1" component="p" sx={{ lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function ScheduleView() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState("all");
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => [...rows].sort(byTime), [rows]);
  const visible = sorted.filter((r) => vetFilter === "all" || r.vet === vetFilter);
  const waiting = rows
    .filter((r) => r.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? toMin(a.start)) - (b.checkedInAt ?? toMin(b.start)));
  const nextBooked = sorted.find((r) => r.status === "booked");
  const count = (s: Row["status"]) => rows.filter((r) => r.status === s).length;

  function advance(row: Row) {
    const name = patientById(row.patient)?.name ?? "Patient";
    const next =
      row.status === "booked" ? "checked_in" : row.status === "checked_in" ? "in_exam" : row.status === "in_exam" ? "done" : null;
    if (!next) return;
    setRows((rs) =>
      rs.map((r) => (r.id === row.id ? { ...r, status: next, checkedInAt: next === "checked_in" ? now : r.checkedInAt } : r)),
    );
    setToast(
      next === "checked_in"
        ? `${name} is checked in and on the waiting list.`
        : next === "in_exam"
          ? `${name} has gone in to ${vetById(row.vet)?.room ?? "the exam room"}.`
          : `${name}'s visit is marked done.`,
    );
  }

  function actionFor(row: Row) {
    const name = patientById(row.patient)?.name ?? "patient";
    if (row.status === "booked")
      return (
        <Button variant="contained" size="large" startIcon={<HowToRegIcon />} onClick={() => advance(row)} aria-label={`Check in ${name}`}>
          Check in
        </Button>
      );
    if (row.status === "checked_in")
      return (
        <Button variant="outlined" size="large" startIcon={<PlayArrowIcon />} onClick={() => advance(row)} aria-label={`Send ${name} to exam`}>
          Start exam
        </Button>
      );
    if (row.status === "in_exam")
      return (
        <Button variant="outlined" size="large" startIcon={<DoneIcon />} onClick={() => advance(row)} aria-label={`Mark ${name} done`}>
          Mark done
        </Button>
      );
    return null;
  }

  function renderRow(row: Row) {
    const p = patientById(row.patient);
    const o = p ? ownerById(p.owner) : undefined;
    const v = vetById(row.vet);
    const inactive = row.status === "done" || row.status === "cancelled";
    const accent = row.urgent && !inactive ? "error-main" : row.status === "in_exam" ? "primary-main" : row.status === "checked_in" ? "info-main" : "divider";
    return (
      <Paper
        component="li"
        key={row.id}
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderLeft: 6,
          borderLeftColor: `var(--mui-palette-${accent})`,
          bgcolor: row.urgent && !inactive ? tint("error-main", 8) : "background.paper",
          display: "grid",
          columnGap: 2,
          rowGap: 0.75,
          alignItems: "center",
          gridTemplateColumns: { xs: "76px 1fr", md: "92px minmax(0,1.5fr) minmax(0,1.3fr) minmax(0,1fr) 150px" },
        }}
      >
        <Box sx={{ gridColumn: { xs: 1, md: "auto" }, gridRow: { xs: "span 4", md: "auto" }, alignSelf: { xs: "start", md: "center" } }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.125rem", fontVariantNumeric: "tabular-nums", color: inactive ? "text.secondary" : "text.primary" }}>
            {fmtTime(toMin(row.start))}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.minutes} min
          </Typography>
        </Box>

        <Box sx={{ gridColumn: { xs: 2, md: "auto" }, minWidth: 0 }}>
          <Typography component="div" sx={{ fontWeight: 700, fontSize: "1.0625rem" }}>
            <Link href={`/patients/${row.patient}`} style={{ color: "inherit" }}>
              {p?.name}
            </Link>{" "}
            <Typography component="span" variant="body2" color="text.secondary">
              {p?.species}, {p?.breed}
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Owner: {o?.name}
          </Typography>
          {p && p.alerts.length > 0 && (
            <Box sx={{ mt: 0.75 }}>
              <PatientAlerts alerts={p.alerts} />
            </Box>
          )}
        </Box>

        <Box sx={{ gridColumn: { xs: 2, md: "auto" }, minWidth: 0 }}>
          <Typography sx={{ textDecoration: row.status === "cancelled" ? "line-through" : "none" }}>
            {row.urgent && (
              <Chip
                size="small"
                color="error"
                icon={<ReportProblemIcon />}
                label="Urgent"
                sx={{ mr: 1, fontWeight: 800, verticalAlign: "middle" }}
              />
            )}
            {row.reason}
          </Typography>
        </Box>

        <Box sx={{ gridColumn: { xs: 2, md: "auto" } }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {v?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {v?.room}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "row", md: "column" }}
          spacing={1}
          sx={{ gridColumn: { xs: 2, md: "auto" }, alignItems: { xs: "center", md: "flex-end" }, justifyContent: { xs: "space-between", md: "center" }, flexWrap: "wrap" }}
          useFlexGap
        >
          <StatusChip status={row.status} />
          {row.id === freshId && <Chip size="small" color="primary" label="New" />}
          {actionFor(row)}
        </Stack>
      </Paper>
    );
  }

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, mb: 2.5, gap: 1.5 }}>
        <Box>
          <Typography variant="h1" component="h1">
            Today&apos;s schedule
          </Typography>
          <Typography color="text.secondary">{fmtDate(TODAY, "long")} · desk time {fmtTime(now)}</Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setBooking(true)}>
          Book appointment
        </Button>
      </Stack>

      <Grid container spacing={1.5} sx={{ mb: 2.5 }} component="section" aria-label="Today at a glance">
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stat label="Still to arrive" value={count("booked")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stat label="Waiting" value={count("checked_in")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stat label="In exam" value={count("in_exam")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stat label="Done" value={count("done")} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 1, lg: 2 } }}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 112 } }}>
            <Paper variant="outlined" component="section" aria-labelledby="waiting-title" sx={{ p: 2 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h2" component="h2" id="waiting-title">
                  Waiting room
                </Typography>
                <Chip label={`${waiting.length} waiting`} size="small" color={waiting.length ? "primary" : "default"} />
              </Stack>
              <Box aria-live="polite">
                {waiting.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 1 }}>
                    Nobody is waiting. Check in a patient from the schedule.
                  </Typography>
                ) : (
                  <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
                    {waiting.map((w, i) => {
                      const p = patientById(w.patient);
                      const mins = Math.max(0, now - (w.checkedInAt ?? toMin(w.start)));
                      return (
                        <Box
                          component="li"
                          key={w.id}
                          sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", p: 1.25, borderRadius: 2, bgcolor: tint("info-main", 10), border: 1, borderColor: "divider" }}
                        >
                          <Typography sx={{ fontWeight: 800, width: 22, pt: 0.125 }} aria-hidden>
                            {i + 1}
                          </Typography>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700 }}>
                              <Link href={`/patients/${w.patient}`} style={{ color: "inherit" }}>
                                {p?.name}
                              </Link>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {vetById(w.vet)?.name} · {vetById(w.vet)?.room}
                            </Typography>
                            {p && p.alerts.length > 0 && (
                              <Box sx={{ mt: 0.75 }}>
                                <PatientAlerts alerts={p.alerts} />
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                              <HourglassTopIcon fontSize="small" aria-hidden />
                              {mins} min
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              since {fmtTime(w.checkedInAt ?? toMin(w.start))}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Paper>

            {nextBooked && (
              <Paper variant="outlined" component="section" aria-labelledby="next-title" sx={{ p: 2, mt: 2 }}>
                <Typography variant="h2" component="h2" id="next-title" sx={{ mb: 1 }}>
                  Next to arrive
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {patientById(nextBooked.patient)?.name} · {fmtTime(toMin(nextBooked.start))}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {nextBooked.reason} with {vetById(nextBooked.vet)?.name}
                </Typography>
                {actionFor(nextBooked)}
              </Paper>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 2, lg: 1 } }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: "wrap" }} useFlexGap>
            <Typography variant="h2" component="h2" sx={{ mr: "auto" }}>
              All appointments
              <Box component="span" sx={visuallyHidden}>
                {" "}
                ({visible.length} shown)
              </Box>
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={vetFilter}
              onChange={(_e, v: string | null) => {
                if (v) setVetFilter(v);
              }}
              aria-label="Filter by vet"
            >
              <ToggleButton value="all" sx={{ px: 2, minHeight: 40 }}>
                All vets
              </ToggleButton>
              {vets.map((v) => (
                <ToggleButton key={v.id} value={v.id} aria-label={v.name} sx={{ px: 2, minHeight: 40 }}>
                  {v.name.split(" ").slice(-1)[0]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
            {visible.map(renderRow)}
          </Box>
          {visible.length === 0 && <Typography color="text.secondary">No appointments for this vet today.</Typography>}
        </Grid>
      </Grid>

      {booking && (
        <BookDialog
          rows={rows}
          now={now}
          onClose={() => setBooking(false)}
          onBook={(a) => {
            setRows((rs) => [...rs, a]);
            setBooking(false);
            setFreshId(a.id);
            setToast(
              `Booked ${patientById(a.patient)?.name} with ${vetById(a.vet)?.name} at ${fmtTime(toMin(a.start))}.`,
            );
          }}
        />
      )}

      <Snackbar open={toast !== null} autoHideDuration={5000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setToast(null)} sx={{ width: "100%" }}>
          {toast}
        </Alert>
      </Snackbar>
    </>
  );
}
```

```tsx components/WeightChart.tsx
"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { fmtDate, shortMonth } from "@/lib/data";

export default function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const summary = `Weight in kilograms: ${points.map((p) => `${fmtDate(p.date)}, ${p.kg}`).join("; ")}.`;
  return (
    <div role="img" aria-label={summary}>
      <LineChart
        height={260}
        hideLegend
        xAxis={[{ scaleType: "point", data: points.map((p) => shortMonth(p.date)) }]}
        yAxis={[{ min: 27, max: 33 }]}
        series={[
          {
            data: points.map((p) => p.kg),
            label: "Weight",
            showMark: true,
            valueFormatter: (v) => (v == null ? "" : `${v.toFixed(1)} kg`),
          },
        ]}
        margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
      />
    </div>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneIcon from "@mui/icons-material/Phone";
import PetsIcon from "@mui/icons-material/Pets";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import HistoryIcon from "@mui/icons-material/History";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import type { ReactNode } from "react";
import {
  TODAY,
  ageOf,
  appointments,
  dayDiff,
  fmtDate,
  fmtTime,
  ownerById,
  patientById,
  records,
  toMin,
  usd,
  vetById,
} from "@/lib/data";
import { PatientAlerts, StatusChip, tint } from "./ui";
import WeightChart from "./WeightChart";

function Section({ title, icon, children, id }: { title: string; icon: ReactNode; children: ReactNode; id: string }) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby={id} sx={{ p: { xs: 2, sm: 2.5 }, height: "100%" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5, color: "text.primary" }}>
        <Box sx={{ color: "primary.main", display: "flex" }} aria-hidden>
          {icon}
        </Box>
        <Typography variant="h2" component="h2" id={id}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }} component="div">
        {children}
      </Typography>
    </Box>
  );
}

export default function PatientRecord({ id }: { id: string }) {
  const patient = patientById(id);
  if (!patient) return null;
  const owner = ownerById(patient.owner);
  const record = records[id];
  const todays = appointments.filter((a) => a.patient === id && a.status !== "cancelled");

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const delta = first && last ? last.kg - first.kg : 0;
  const pct = first && last ? (delta / first.kg) * 100 : 0;

  return (
    <>
      <Button component={Link} href="/" startIcon={<ArrowBackIcon />} sx={{ mb: 1.5, ml: -1 }}>
        Today&apos;s schedule
      </Button>

      <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 2, alignItems: { sm: "center" }, mb: 2.5 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", color: "primary.contrastText" }} aria-hidden>
          <PetsIcon fontSize="large" />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h1" component="h1">
            {patient.name}
          </Typography>
          <Typography color="text.secondary">
            {patient.breed} · {patient.species} · {patient.sex} · {ageOf(patient.born, TODAY)}
          </Typography>
        </Box>
        {owner && (
          <Button component="a" href={`tel:${owner.phone.replace(/\s/g, "")}`} variant="outlined" size="large" startIcon={<PhoneIcon />}>
            Call {owner.name.split(" ")[0]}
          </Button>
        )}
      </Stack>

      {patient.alerts.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <PatientAlerts alerts={patient.alerts} variant="banner" />
        </Box>
      )}

      {todays.length > 0 && (
        <Alert severity="info" icon={<EventIcon />} sx={{ mb: 2.5 }}>
          On today&apos;s schedule:{" "}
          {todays.map((a, i) => (
            <span key={a.id}>
              {i > 0 && "; "}
              <strong>{a.reason}</strong> at {fmtTime(toMin(a.start))} with {vetById(a.vet)?.name} ({vetById(a.vet)?.room}), {a.status.replace("_", " ")}
            </span>
          ))}
        </Alert>
      )}

      {!record && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          No weights, vaccinations, medications or visit notes are on file for {patient.name} yet.
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Section title="Patient and owner" icon={<PetsIcon />} id="details-title">
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Fact label="Species">{patient.species}</Fact>
              <Fact label="Breed">{patient.breed}</Fact>
              <Fact label="Born">
                {fmtDate(patient.born)} ({ageOf(patient.born, TODAY)})
              </Fact>
              <Fact label="Sex">{patient.sex}</Fact>
              <Fact label="Owner">{owner?.name}</Fact>
              <Fact label="Phone">
                {owner && (
                  <a href={`tel:${owner.phone.replace(/\s/g, "")}`} style={{ color: "inherit" }}>
                    {owner.phone}
                  </a>
                )}
              </Fact>
            </Box>
            {patient.alerts.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <PatientAlerts alerts={patient.alerts} size="medium" />
              </Box>
            )}
          </Section>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Section title="Vaccinations" icon={<VaccinesIcon />} id="vax-title">
            {record ? (
              <TableContainer>
                <Table size="small" aria-label="Vaccinations">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vaccine</TableCell>
                      <TableCell>Given</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {record.vaccinations.map((v) => {
                      const overdue = dayDiff(v.due, TODAY);
                      const isOverdue = overdue > 0;
                      return (
                        <TableRow key={v.name} sx={{ bgcolor: isOverdue ? tint("error-main", 10) : undefined }}>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 700 }}>
                            {v.name}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(v.given)}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap", fontWeight: isOverdue ? 700 : 400 }}>{fmtDate(v.due)}</TableCell>
                          <TableCell>
                            {isOverdue ? (
                              <Chip
                                size="small"
                                color="error"
                                icon={<ReportProblemIcon />}
                                label={`Overdue ${overdue} day${overdue === 1 ? "" : "s"}`}
                                sx={{ fontWeight: 800 }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                variant="outlined"
                                icon={<CheckCircleIcon />}
                                label={`Current, due in ${-overdue} days`}
                                sx={{ "& .MuiChip-icon": { color: "success.main" } }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No vaccinations recorded.</Typography>
            )}
          </Section>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Section title="Current medications" icon={<MedicationIcon />} id="meds-title">
            {record && record.medications.length > 0 ? (
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.25 }}>
                {record.medications.map((m) => (
                  <Box component="li" key={m.name} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 700 }}>{m.name}</Typography>
                    <Typography variant="body2">{m.dose}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Since {fmtDate(m.since)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No current medications.</Typography>
            )}
          </Section>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Section title="Weight trend" icon={<MonitorWeightIcon />} id="weight-title">
            {last && first ? (
              <>
                <Stack direction="row" sx={{ gap: 3, mb: 1, flexWrap: "wrap" }} useFlexGap>
                  <Fact label="Latest">
                    {last.kg.toFixed(1)} kg ({fmtDate(last.date)})
                  </Fact>
                  <Fact label={`Since ${fmtDate(first.date)}`}>
                    {delta.toFixed(1)} kg ({pct.toFixed(1)}%)
                  </Fact>
                </Stack>
                <WeightChart points={weights} />
              </>
            ) : (
              <Typography color="text.secondary">No weights recorded.</Typography>
            )}
          </Section>
        </Grid>

        <Grid size={12}>
          <Section title="Visit history" icon={<HistoryIcon />} id="visits-title">
            {record && record.visits.length > 0 ? (
              <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.5 }}>
                {record.visits.map((v) => (
                  <Box
                    component="li"
                    key={v.date}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "150px 1fr auto" },
                      gap: { xs: 0.5, sm: 2 },
                      p: 1.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: v.date === TODAY ? tint("primary-main", 8) : "transparent",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{fmtDate(v.date)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {vetById(v.vet)?.name}
                      </Typography>
                      {v.date === TODAY && <Chip size="small" color="primary" label="Today" sx={{ mt: 0.5 }} />}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{v.reason}</Typography>
                      <Typography variant="body2">{v.notes}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      Invoice {usd(v.invoice_usd)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">No visits recorded.</Typography>
            )}
          </Section>
        </Grid>
      </Grid>
    </>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ScheduleView from "@/components/ScheduleView";

export const metadata: Metadata = { title: "Today's schedule | Pawpoint" };

export default function Page() {
  return (
    <AppShell>
      <ScheduleView />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import PatientRecord from "@/components/PatientRecord";
import { patients } from "@/lib/data";

export const metadata: Metadata = { title: "Patient record | Pawpoint" };

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patients.some((p) => p.id === id)) notFound();
  return (
    <AppShell>
      <PatientRecord id={id} />
    </AppShell>
  );
}
```
