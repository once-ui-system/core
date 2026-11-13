```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import { ClinicProvider } from "@/lib/clinic-store";
import theme from "./theme";

export const metadata: Metadata = {
  title: "Pawpoint | Front desk",
  description: "Front-desk and records software for Hillside Veterinary Clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ClinicProvider>{children}</ClinicProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

```tsx app/page.tsx
import AppShell from "@/components/AppShell";
import ScheduleView from "@/components/ScheduleView";

export default function Page() {
  return (
    <AppShell>
      <ScheduleView />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import { notFound } from "next/navigation";
import PatientRecord from "@/components/PatientRecord";
import { patients } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!patients.some((p) => p.id === id)) notFound();
  return <PatientRecord id={id} />;
}
```

```tsx app/patients/p-104/page.tsx
import PatientRecord from "@/components/PatientRecord";

export default function Page() {
  return <PatientRecord id="p-104" />;
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes. System font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0e6b66" },
        secondary: { main: "#3b5bdb" },
        info: { main: "#0b62a0" },
        error: { main: "#c62828" },
        warning: { main: "#8f3d06" },
        success: { main: "#2e7d32" },
        background: { default: "#f3f6f5", paper: "#ffffff" },
        divider: "#dbe3e1",
      },
    },
    dark: {
      palette: {
        primary: { main: "#4fd1c5" },
        secondary: { main: "#8ea2ff" },
        error: { main: "#ff7b72" },
        warning: { main: "#f2b25c" },
        success: { main: "#6fcf7a" },
        background: { default: "#0f1716", paper: "#17211f" },
        divider: "#2a3835",
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 750, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.125rem", fontWeight: 700 },
    h3: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 650 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40, borderRadius: 10 } },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 40, minHeight: 40 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 650 } } },
  },
});

export default theme;
```

```tsx components/AlertBadges.tsx
"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

/** Soft background tint that follows the active color scheme. */
export const tint = (token: string, pct = 12) =>
  `color-mix(in srgb, var(--mui-palette-${token}-main) ${pct}%, transparent)`;

/**
 * Medical alerts. Solid red, icon plus the full text, so they are never
 * confused with status chips and never rely on color alone.
 */
export default function AlertBadges({
  alerts,
  size = "small",
  patientName,
}: {
  alerts: string[];
  size?: "small" | "medium";
  patientName?: string;
}) {
  if (alerts.length === 0) return null;
  return (
    <Box
      component="ul"
      aria-label={patientName ? `Medical alerts for ${patientName}` : "Medical alerts"}
      sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, listStyle: "none", m: 0, p: 0 }}
    >
      {alerts.map((a) => (
        <li key={a}>
          <Chip
            color="error"
            size={size}
            icon={<ReportProblemIcon />}
            label={a}
            sx={{ height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: size === "small" ? 0.25 : 0.5 }, fontWeight: 700 }}
          />
        </li>
      ))}
    </Box>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PatientSearch from "./PatientSearch";
import { useClinic } from "@/lib/clinic-store";
import { CLINIC, CLINIC_SITE, TODAY, USER, formatDate, fromMin } from "@/lib/data";

function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const effective = mode === "system" ? systemMode : mode;
  if (!effective) return <Box sx={{ width: 40, height: 40 }} />;
  const next = effective === "dark" ? "light" : "dark";
  return (
    <Tooltip title={`Switch to ${next} mode`}>
      <IconButton aria-label={`Switch to ${next} mode`} onClick={() => setMode(next)}>
        {effective === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { now } = useClinic();
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
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 2,
          py: 1,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: { xs: 1.5, md: 3 }, flexWrap: { xs: "wrap", md: "nowrap" }, py: { xs: 1, md: 0 }, minHeight: { md: 68 } }}>
          <Box component={Link} href="/" sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none", order: 1 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: "primary.main", color: "primary.contrastText", display: "grid", placeItems: "center" }}>
              <PetsIcon />
            </Box>
            <Box>
              <Typography component="span" sx={{ display: "block", fontWeight: 800, lineHeight: 1.1, fontSize: "1.1rem" }}>
                {CLINIC}
              </Typography>
              <Typography component="span" variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
                {CLINIC_SITE}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: { md: 1 }, maxWidth: { md: 520 }, width: { xs: "100%", md: "auto" }, order: { xs: 4, md: 2 } }}>
            <PatientSearch />
          </Box>
          <Box sx={{ flex: 1, order: 3, display: { md: "none" } }} />
          <Box sx={{ ml: { md: "auto" }, order: 3, textAlign: "right", display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {fromMin(now)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(TODAY, false)}
            </Typography>
          </Box>
          <Box sx={{ order: 3 }}>
            <ThemeToggle />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, order: 3 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "secondary.main", fontSize: "0.9rem" }} aria-hidden>
              RL
            </Avatar>
            <Box sx={{ display: { xs: "none", lg: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {USER.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {USER.role}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" id="main" maxWidth="xl" tabIndex={-1} sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 }, outline: "none" }}>
        {children}
      </Container>
    </Box>
  );
}
```

```tsx components/AppointmentRow.tsx
"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import LoginIcon from "@mui/icons-material/HowToReg";
import MedicalIcon from "@mui/icons-material/MedicalServices";
import DoneIcon from "@mui/icons-material/Done";
import AlertBadges, { tint } from "./AlertBadges";
import StatusChip from "./StatusChip";
import { endTime, ownerById, patientById, vetById, type Appointment, type Status } from "@/lib/data";

interface Props {
  appt: Appointment;
  highlighted?: boolean;
  onCheckIn: (a: Appointment) => void;
  onStatus: (a: Appointment, s: Status) => void;
}

export default function AppointmentRow({ appt, highlighted, onCheckIn, onStatus }: Props) {
  const patient = patientById(appt.patient);
  const owner = ownerById(patient.owner);
  const vet = vetById(appt.vet);
  const inactive = appt.status === "done" || appt.status === "cancelled";
  const live = !inactive;

  return (
    <Box
      component="li"
      data-appointment={appt.id}
      sx={{
        display: "grid",
        alignItems: "center",
        gap: { xs: 1, md: 2 },
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        borderLeft: 4,
        borderLeftColor: appt.urgent && live ? "error.main" : "transparent",
        bgcolor: highlighted ? tint("primary", 14) : appt.urgent && live ? tint("error", 8) : "transparent",
        transition: "background-color .4s",
        gridTemplateColumns: { xs: "1fr auto", md: "104px minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.3fr) 118px 128px" },
        gridTemplateAreas: {
          xs: `"time status" "patient patient" "reason reason" "owner action"`,
          md: `"time patient owner reason status action"`,
        },
        "&:last-of-type": { borderBottom: 0 },
      }}
    >
      <Box sx={{ gridArea: "time", opacity: inactive ? 0.75 : 1 }}>
        <Typography sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", fontSize: "1.05rem", lineHeight: 1.2 }}>
          {appt.start}
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75, fontWeight: 500 }}>
            to {endTime(appt)}
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {vet.short} · {vet.room}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "patient", minWidth: 0, opacity: appt.status === "cancelled" ? 0.6 : 1 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography
            component={Link}
            href={`/patients/${patient.id}`}
            sx={{ fontWeight: 750, color: "text.primary", textDecorationColor: "var(--mui-palette-divider)", "&:hover": { color: "primary.main" } }}
          >
            {patient.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {patient.species}, {patient.breed}
          </Typography>
        </Box>
        {patient.alerts.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <AlertBadges alerts={patient.alerts} patientName={patient.name} />
          </Box>
        )}
      </Box>

      <Box sx={{ gridArea: "owner", minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {owner.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>
          {owner.phone}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "reason", minWidth: 0, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        {appt.urgent && (
          <Chip size="small" color="error" icon={<PriorityHighIcon />} label="Urgent" sx={{ fontWeight: 800 }} />
        )}
        <Typography variant="body2" sx={{ textDecoration: appt.status === "cancelled" ? "line-through" : "none" }}>
          {appt.reason}
        </Typography>
        {highlighted && <Chip size="small" color="primary" label="Just booked" />}
      </Box>

      <Box sx={{ gridArea: "status", justifySelf: { xs: "end", md: "start" } }}>
        <StatusChip status={appt.status} />
      </Box>

      <Box sx={{ gridArea: "action", justifySelf: "end", width: { md: "100%" } }}>
        {appt.status === "booked" && (
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={() => onCheckIn(appt)}
            aria-label={`Check in ${patient.name}`}
            sx={{ minHeight: 44, px: 2 }}
          >
            Check in
          </Button>
        )}
        {appt.status === "checked_in" && (
          <Button variant="outlined" size="small" fullWidth startIcon={<MedicalIcon />} onClick={() => onStatus(appt, "in_exam")} aria-label={`To exam: ${patient.name}`} sx={{ minHeight: 44 }}>
            To exam
          </Button>
        )}
        {appt.status === "in_exam" && (
          <Button variant="outlined" size="small" fullWidth startIcon={<DoneIcon />} onClick={() => onStatus(appt, "done")} aria-label={`Mark done: ${patient.name}`} sx={{ minHeight: 44 }}>
            Mark done
          </Button>
        )}
      </Box>
    </Box>
  );
}
```

```tsx components/BookDialog.tsx
"use client";

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AlertBadges from "./AlertBadges";
import { conflictMessage, useClinic } from "@/lib/clinic-store";
import { DAY_END, DAY_START, findConflict, fromMin, ownerById, patientById, patients, toMin, vets, type Appointment } from "@/lib/data";

const DURATIONS = [15, 20, 30, 45, 60, 90];
const SLOTS: string[] = [];
for (let m = DAY_START; m < DAY_END; m += 15) SLOTS.push(fromMin(m));

function firstFreeSlot(appts: Appointment[], vet: string, minutes: number, from: number): string {
  const startAt = Math.ceil(from / 15) * 15;
  for (const s of SLOTS) {
    const m = toMin(s);
    if (m >= startAt && m + minutes <= DAY_END && !findConflict(appts, vet, m, minutes)) return s;
  }
  return SLOTS.find((s) => !findConflict(appts, vet, toMin(s), minutes)) ?? SLOTS[0];
}

function BookForm({ onClose, onBooked }: { onClose: () => void; onBooked: (a: Appointment) => void }) {
  const { appointments, now, book } = useClinic();
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState(vets[0].id);
  const [minutes, setMinutes] = useState(20);
  const [start, setStart] = useState(() => firstFreeSlot(appointments, vets[0].id, 20, now));
  const [reason, setReason] = useState("Follow-up");
  const [urgent, setUrgent] = useState(false);
  const [touched, setTouched] = useState(false);

  const taken = useMemo(() => {
    const set = new Set<string>();
    for (const s of SLOTS) {
      const m = toMin(s);
      if (m + minutes > DAY_END || findConflict(appointments, vet, m, minutes)) set.add(s);
    }
    return set;
  }, [appointments, vet, minutes]);

  const clash = conflictMessage(appointments, vet, start, minutes);
  const selected = patient ? patientById(patient) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!patient || clash) return;
    const res = book({ patient, vet, start, minutes, reason, urgent });
    if (res.ok) onBooked(res.appointment);
  };

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: "contents" }}>
      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            select
            required
            label="Patient"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            error={touched && !patient}
            helperText={touched && !patient ? "Pick the patient to book." : " "}
            fullWidth
            sx={{ "& .MuiFormHelperText-root": { mt: 0.5 } }}
          >
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} ({p.species}) · {ownerById(p.owner).name}
              </MenuItem>
            ))}
          </TextField>

          {selected && selected.alerts.length > 0 && (
            <Alert severity="error" variant="outlined" icon={false} sx={{ borderWidth: 2, fontWeight: 600 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 800 }}>
                Medical alerts for {selected.name}
              </Typography>
              <AlertBadges alerts={selected.alerts} patientName={selected.name} />
            </Alert>
          )}

          <TextField select required label="Vet" value={vet} onChange={(e) => setVet(e.target.value)} fullWidth>
            {vets.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name} · {v.room}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField select required label="Time" value={start} onChange={(e) => setStart(e.target.value)} fullWidth slotProps={{ select: { MenuProps: { slotProps: { paper: { style: { maxHeight: 360 } } } } } }}>
              {SLOTS.map((s) => (
                <MenuItem key={s} value={s} disabled={taken.has(s) && s !== start}>
                  {s}
                  {taken.has(s) ? "  (not free)" : ""}
                </MenuItem>
              ))}
            </TextField>
            <TextField select required label="Length" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} fullWidth>
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d} minutes
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {clash && (
            <Alert severity="error" role="alert">
              {clash}
            </Alert>
          )}

          <TextField label="Reason for visit" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth />
          <FormControlLabel control={<Checkbox checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />} label="Urgent visit" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ minHeight: 44 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={Boolean(clash)} sx={{ minHeight: 44, px: 3 }}>
          Book appointment
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function BookDialog({ open, onClose, onBooked }: { open: boolean; onClose: () => void; onBooked: (a: Appointment) => void }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <DialogTitle id="book-title" sx={{ fontWeight: 800 }}>
        Book an appointment
      </DialogTitle>
      <BookForm onClose={onClose} onBooked={onBooked} />
    </Dialog>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneIcon from "@mui/icons-material/Phone";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import HistoryIcon from "@mui/icons-material/History";
import EventIcon from "@mui/icons-material/EventOutlined";
import AlertBadges, { tint } from "./AlertBadges";
import AppShell from "./AppShell";
import StatusChip from "./StatusChip";
import WeightChart from "./WeightChart";
import { sortAppointments, useClinic } from "@/lib/clinic-store";
import { TODAY, ageText, daysBetween, endTime, formatDate, money, ownerById, patientById, records, vetById } from "@/lib/data";

function Section({ id, icon, title, children, aside }: { id: string; icon: React.ReactNode; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby={id} sx={{ p: { xs: 2, md: 2.5 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box sx={{ color: "primary.main", display: "flex" }} aria-hidden>
          {icon}
        </Box>
        <Typography id={id} component="h2" variant="h2" sx={{ flex: 1 }}>
          {title}
        </Typography>
        {aside}
      </Box>
      {children}
    </Paper>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <Typography component="div" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
}

export default function PatientRecord({ id }: { id: string }) {
  const { appointments } = useClinic();
  const patient = patientById(id);
  const owner = ownerById(patient.owner);
  const record = records[id];
  const todays = sortAppointments(appointments.filter((a) => a.patient === id));

  const vaccinations = (record?.vaccinations ?? []).map((v) => {
    const days = daysBetween(TODAY, v.due);
    return { ...v, days, overdue: days < 0, soon: days >= 0 && days <= 60 };
  });
  const overdue = vaccinations.filter((v) => v.overdue);
  const lastWeight = record?.weights_kg[record.weights_kg.length - 1];

  return (
    <AppShell>
      <Button component={Link} href="/" startIcon={<ArrowBackIcon />} color="inherit" sx={{ mb: 1.5, ml: -1, minHeight: 44 }}>
        Back to today&apos;s schedule
      </Button>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 2.5, borderColor: patient.alerts.length ? "error.main" : "divider", borderWidth: patient.alerts.length ? 2 : 1 }}>
        <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", alignItems: "flex-start" }}>
          <Box sx={{ flex: "1 1 280px", minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
              <Typography component="h1" variant="h1">
                {patient.name}
              </Typography>
              <Typography color="text.secondary">
                {patient.species} · {patient.breed}
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))" }, gap: 2, mt: 2 }}>
              <Fact label="Age">{ageText(patient.born, TODAY)}</Fact>
              <Fact label="Born">{formatDate(patient.born)}</Fact>
              <Fact label="Sex">{patient.sex}</Fact>
              {lastWeight && <Fact label="Weight today">{lastWeight.kg.toFixed(1)} kg</Fact>}
              <Fact label="Patient ID">{patient.id.toUpperCase()}</Fact>
            </Box>
          </Box>
          <Box sx={{ flex: "0 1 280px", minWidth: 220, p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Owner
            </Typography>
            <Typography sx={{ fontWeight: 750, fontSize: "1.1rem" }}>{owner.name}</Typography>
            <Button component="a" href={`tel:${owner.phone.replace(/\s/g, "")}`} variant="outlined" startIcon={<PhoneIcon />} sx={{ mt: 1, minHeight: 44 }}>
              {owner.phone}
            </Button>
          </Box>
        </Box>

        {(patient.alerts.length > 0 || overdue.length > 0) && (
          <Box sx={{ mt: 2.5 }}>
            {patient.alerts.length > 0 && (
              <Alert
                severity="error"
                variant="filled"
                role="region"
                aria-label="Medical alerts"
                icon={<ReportProblemIcon fontSize="large" />}
                sx={{ alignItems: "center", "& .MuiAlert-message": { width: "100%" }, border: 0 }}
              >
                <Typography component="h2" sx={{ fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.75 }}>
                  Medical alerts
                </Typography>
                <Box component="ul" aria-label={`Medical alerts for ${patient.name}`} sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {patient.alerts.map((a) => (
                    <Box component="li" key={a} sx={{ fontWeight: 800, fontSize: "1.15rem", bgcolor: "rgba(255,255,255,0.18)", px: 1.5, py: 0.5, borderRadius: 2 }}>
                      {a}
                    </Box>
                  ))}
                </Box>
              </Alert>
            )}
            {overdue.length > 0 && (
              <Alert severity="warning" variant="outlined" sx={{ mt: 1.5, fontWeight: 600 }}>
                {overdue.length} vaccination{overdue.length > 1 ? "s" : ""} overdue: {overdue.map((v) => v.name).join(", ")}.
              </Alert>
            )}
          </Box>
        )}
      </Paper>

      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,3fr) minmax(0,2fr)" }, alignItems: "start" }}>
        <Box sx={{ display: "grid", gap: 2.5, minWidth: 0 }}>
          {todays.length > 0 && (
            <Section id="today-title" icon={<EventIcon />} title="On today's schedule">
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
                {todays.map((a) => (
                  <Box component="li" key={a.id} sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", p: 1.25, borderRadius: 2, bgcolor: a.urgent ? tint("error", 10) : "action.hover" }}>
                    <Typography sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                      {a.start} to {endTime(a)}
                    </Typography>
                    <Typography sx={{ flex: 1, minWidth: 160 }}>
                      {a.reason} <Typography component="span" color="text.secondary">· {vetById(a.vet).name}, {vetById(a.vet).room}</Typography>
                    </Typography>
                    <StatusChip status={a.status} />
                  </Box>
                ))}
              </Box>
            </Section>
          )}

          {record ? (
            <>
              <Section id="weight-title" icon={<MonitorWeightIcon />} title="Weight trend">
                <WeightChart points={record.weights_kg} />
              </Section>

              <Section id="visits-title" icon={<HistoryIcon />} title="Visit history">
                <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {record.visits.map((v, i) => (
                    <Box component="li" key={v.date} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "130px 1fr" }, gap: { xs: 0.5, sm: 2 }, py: 1.75, borderTop: i === 0 ? 0 : 1, borderColor: "divider" }}>
                      <Box>
                        <Typography sx={{ fontWeight: 750 }}>{formatDate(v.date)}</Typography>
                        {v.date === TODAY && <Chip size="small" color="primary" label="Today" />}
                      </Box>
                      <Box>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "baseline" }}>
                          <Typography sx={{ fontWeight: 700 }}>{v.reason}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {vetById(v.vet).name} · {money(v.invoice_usd)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {v.notes}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Section>
            </>
          ) : (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography component="h2" variant="h2">
                No detailed record in this demo
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Weights, vaccinations, medications and visit notes for {patient.name} are not loaded yet.
              </Typography>
            </Paper>
          )}
        </Box>

        {record && (
          <Box sx={{ display: "grid", gap: 2.5, minWidth: 0 }}>
            <Section id="vacc-title" icon={<VaccinesIcon />} title="Vaccinations" aside={overdue.length > 0 ? <Chip size="small" color="error" label={`${overdue.length} overdue`} /> : undefined}>
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                {vaccinations.map((v, i) => (
                  <Box
                    component="li"
                    key={v.name}
                    sx={{ display: "flex", gap: 1.5, alignItems: "center", py: 1.25, px: v.overdue ? 1.25 : 0, mx: v.overdue ? -1.25 : 0, borderTop: i === 0 ? 0 : 1, borderColor: "divider", bgcolor: v.overdue ? tint("error", 10) : "transparent", borderRadius: v.overdue ? 1.5 : 0 }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700 }}>{v.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Given {formatDate(v.given)} · due {formatDate(v.due)}
                      </Typography>
                    </Box>
                    {v.overdue ? (
                      <Chip size="small" color="error" icon={<ReportProblemIcon />} label={`Overdue ${-v.days} days`} />
                    ) : v.soon ? (
                      <Chip size="small" color="warning" label={`Due in ${v.days} days`} />
                    ) : (
                      <Chip size="small" color="success" variant="outlined" label="Up to date" />
                    )}
                  </Box>
                ))}
              </Box>
            </Section>

            <Section id="meds-title" icon={<MedicationIcon />} title="Current medications">
              <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                {record.medications.map((m, i) => (
                  <Box component="li" key={m.name} sx={{ py: 1.25, borderTop: i === 0 ? 0 : 1, borderColor: "divider" }}>
                    <Typography sx={{ fontWeight: 700 }}>{m.name}</Typography>
                    <Typography variant="body2">{m.dose}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Since {formatDate(m.since)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {patient.alerts.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <AlertBadges alerts={patient.alerts} patientName={patient.name} />
                </Box>
              )}
            </Section>
          </Box>
        )}
      </Box>
    </AppShell>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { ownerById, patients, type Patient } from "@/lib/data";

export default function PatientSearch() {
  const router = useRouter();
  return (
    <Autocomplete<Patient>
      options={patients}
      value={null}
      autoHighlight
      blurOnSelect
      clearOnBlur
      handleHomeEndKeys
      noOptionsText="No patient or owner with that name"
      getOptionLabel={(p) => `${p.name} (${ownerById(p.owner).name})`}
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return opts;
        return opts.filter((p) => p.name.toLowerCase().includes(q) || ownerById(p.owner).name.toLowerCase().includes(q));
      }}
      onChange={(_, p) => {
        if (p) router.push(`/patients/${p.id}`);
      }}
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest} sx={{ display: "flex", gap: 1.5, alignItems: "center", py: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {p.species} · {p.breed} · {ownerById(p.owner).name}
              </Typography>
            </Box>
            {p.alerts.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "error.main" }}>
                <ReportProblemIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {p.alerts.length === 1 ? "1 alert" : `${p.alerts.length} alerts`}
                </Typography>
              </Box>
            )}
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

```tsx components/ScheduleView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import AppointmentRow from "./AppointmentRow";
import BookDialog from "./BookDialog";
import WaitingList from "./WaitingList";
import { sortAppointments, useClinic } from "@/lib/clinic-store";
import { TODAY, formatDayLong, patientById, toMin, vetById, vets, type Appointment, type Status } from "@/lib/data";

function Stat({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: "warning" | "info" | "primary" }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, borderTop: 3, borderTopColor: accent ? `${accent}.main` : "divider" }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {hint}
      </Typography>
    </Paper>
  );
}

export default function ScheduleView() {
  const { appointments, now, checkIn, setStatus } = useClinic();
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [bookOpen, setBookOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    if (!highlight) return;
    const t = window.setTimeout(() => setHighlight(null), 8000);
    return () => window.clearTimeout(t);
  }, [highlight]);

  const sorted = useMemo(() => sortAppointments(appointments), [appointments]);
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);

  const waiting = appointments.filter((a) => a.status === "checked_in");
  const inExam = appointments.filter((a) => a.status === "in_exam");
  const booked = sorted.filter((a) => a.status === "booked");
  const longest = waiting.reduce((m, a) => Math.max(m, Math.floor(now - (a.checkedInAt ?? now))), 0);
  const next = booked[0];
  const urgentBooked = booked.filter((a) => a.urgent).length;

  const onCheckIn = (a: Appointment) => {
    checkIn(a.id);
    setMessage(`${patientById(a.patient).name} is checked in and on the waiting list.`);
  };
  const onStatus = (a: Appointment, s: Status) => {
    setStatus(a.id, s);
    setMessage(`${patientById(a.patient).name}: ${s === "in_exam" ? "sent to exam" : "marked done"}.`);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, flexWrap: "wrap", mb: 2.5 }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {formatDayLong(TODAY)}
          </Typography>
          <Typography component="h1" variant="h1">
            Today&apos;s schedule
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setBookOpen(true)} sx={{ minHeight: 48, px: 3 }}>
          Book appointment
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" }, gap: 1.5, mb: 2.5 }}>
        <Stat label="Waiting" value={String(waiting.length)} hint={waiting.length ? `longest ${longest} min` : "nobody waiting"} accent="warning" />
        <Stat label="In exam" value={String(inExam.length)} hint={inExam.length ? inExam.map((a) => patientById(a.patient).name).join(", ") : "none right now"} accent="info" />
        <Stat label="Still to arrive" value={String(booked.length)} hint={urgentBooked ? `${urgentBooked} urgent` : "no urgent visits"} />
        <Stat label="Next booked" value={next ? next.start : "None"} hint={next ? `${patientById(next.patient).name} · ${vetById(next.vet).short}` : "all seen"} accent="primary" />
      </Box>

      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1fr) 380px" }, alignItems: "start" }}>
        <Box sx={{ order: { xs: 2, lg: 1 }, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 1.5 }}>
            <Typography component="h2" variant="h2" sx={{ flex: 1 }}>
              All appointments
              <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                {visible.length}
              </Typography>
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={vetFilter}
              onChange={(_, v: string | null) => v && setVetFilter(v)}
              aria-label="Filter by vet"
              sx={{ flexWrap: "wrap", "& .MuiToggleButton": { minHeight: 40, textTransform: "none", px: 1.75 } }}
            >
              <ToggleButton value="all">All vets</ToggleButton>
              {vets.map((v) => (
                <ToggleButton key={v.id} value={v.id}>
                  {v.short}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Box
              aria-hidden
              sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "104px minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.3fr) 118px 128px", gap: 2, px: 2, py: 1, pl: "20px", bgcolor: "action.hover", borderBottom: 1, borderColor: "divider", color: "text.secondary" }}
            >
              {["Time / vet", "Patient", "Owner", "Reason", "Status", ""].map((h, i) => (
                <Typography key={i} variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </Typography>
              ))}
            </Box>
            <Box component="ul" aria-label="Appointments today" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {visible.map((a) => (
                <AppointmentRow key={a.id} appt={a} highlighted={highlight === a.id} onCheckIn={onCheckIn} onStatus={onStatus} />
              ))}
            </Box>
            {visible.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 3 }}>
                No appointments for this vet today.
              </Typography>
            )}
          </Paper>
        </Box>

        <Box sx={{ order: { xs: 1, lg: 2 }, position: { lg: "sticky" }, top: { lg: 88 } }}>
          <WaitingList appointments={appointments} now={now} />
        </Box>
      </Box>

      <BookDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={(a) => {
          setBookOpen(false);
          setHighlight(a.id);
          setVetFilter("all");
          setMessage(`Booked ${patientById(a.patient).name} with ${vetById(a.vet).name} at ${a.start}.`);
        }}
      />
      <Snackbar open={message !== null} autoHideDuration={5000} onClose={(_, r) => r !== "clickaway" && setMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setMessage(null)} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
```

```tsx components/StatusChip.tsx
"use client";

import Chip from "@mui/material/Chip";
import EventIcon from "@mui/icons-material/EventOutlined";
import HourglassIcon from "@mui/icons-material/HourglassTop";
import MedicalIcon from "@mui/icons-material/MedicalServices";
import DoneIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import { STATUS_LABEL, type Status } from "@/lib/data";

const config: Record<Status, { color: "default" | "warning" | "info" | "success"; variant: "filled" | "outlined"; icon: React.ReactElement }> = {
  booked: { color: "default", variant: "outlined", icon: <EventIcon /> },
  checked_in: { color: "warning", variant: "filled", icon: <HourglassIcon /> },
  in_exam: { color: "info", variant: "filled", icon: <MedicalIcon /> },
  done: { color: "success", variant: "outlined", icon: <DoneIcon /> },
  cancelled: { color: "default", variant: "outlined", icon: <CancelIcon /> },
};

export default function StatusChip({ status }: { status: Status }) {
  const c = config[status];
  return (
    <Chip
      size="small"
      color={c.color}
      variant={c.variant}
      icon={c.icon}
      label={STATUS_LABEL[status]}
      sx={status === "cancelled" ? { textDecoration: "line-through" } : undefined}
    />
  );
}
```

```tsx components/WaitingList.tsx
"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TimerIcon from "@mui/icons-material/Timer";
import AlertBadges, { tint } from "./AlertBadges";
import { fromMin, patientById, vetById, type Appointment } from "@/lib/data";

export default function WaitingList({ appointments, now }: { appointments: Appointment[]; now: number }) {
  const waiting = appointments
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));

  return (
    <Paper variant="outlined" component="section" aria-labelledby="waiting-title" sx={{ overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography id="waiting-title" component="h2" variant="h2" sx={{ flex: 1 }}>
          Waiting room
        </Typography>
        <Chip color={waiting.length ? "warning" : "default"} label={`${waiting.length} waiting`} size="small" />
      </Box>
      <Box aria-live="polite" sx={{ m: 0 }}>
        {waiting.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            Nobody is waiting. Checked-in patients appear here with their wait time.
          </Typography>
        ) : (
          <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {waiting.map((a, i) => {
              const p = patientById(a.patient);
              const vet = vetById(a.vet);
              const mins = Math.max(0, Math.floor(now - (a.checkedInAt ?? now)));
              const long = mins >= 25;
              return (
                <Box
                  component="li"
                  key={a.id}
                  data-waiting={a.id}
                  sx={{ display: "flex", gap: 1.5, px: 2, py: 1.5, borderBottom: i < waiting.length - 1 ? 1 : 0, borderColor: "divider", bgcolor: long ? tint("warning", 10) : "transparent" }}
                >
                  <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "action.selected", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }} aria-hidden>
                    {i + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography component={Link} href={`/patients/${p.id}`} sx={{ fontWeight: 750, color: "text.primary" }}>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.reason} · {vet.short}, {vet.room}
                    </Typography>
                    {p.alerts.length > 0 && (
                      <Box sx={{ mt: 0.75 }}>
                        <AlertBadges alerts={p.alerts} patientName={p.name} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end", fontWeight: 800, color: long ? "warning.main" : "text.primary", fontVariantNumeric: "tabular-nums" }}>
                      <TimerIcon fontSize="small" aria-hidden />
                      {mins} min
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      since {fromMin(a.checkedInAt ?? now)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
```

```tsx components/WeightChart.tsx
"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import { formatDate } from "@/lib/data";

export default function WeightChart({ points }: { points: { date: string; kg: number }[] }) {
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.kg - first.kg;
  const pct = (delta / first.kg) * 100;
  const labels = points.map((p) => formatDate(p.date, false));
  const lo = Math.floor(Math.min(...points.map((p) => p.kg)) - 1);
  const hi = Math.ceil(Math.max(...points.map((p) => p.kg)) + 1);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>{last.kg.toFixed(1)} kg</Typography>
        <Typography sx={{ color: "warning.main", fontWeight: 700 }}>
          {delta.toFixed(1)} kg ({pct.toFixed(0)}%) since {formatDate(first.date)}
        </Typography>
      </Box>
      <Box role="img" aria-label={`Weight over ${points.length} visits: ${points.map((p) => `${formatDate(p.date)} ${p.kg} kg`).join(", ")}.`} sx={{ mt: 1 }}>
        <LineChart
          height={240}
          xAxis={[{ scaleType: "point", data: labels }]}
          yAxis={[{ min: lo, max: hi, width: 44, valueFormatter: (v: number | null) => (v == null ? "" : `${v}`) }]}
          series={[{ data: points.map((p) => p.kg), label: "Weight (kg)", color: "var(--mui-palette-primary-main)", valueFormatter: (v) => (v == null ? "" : `${v.toFixed(1)} kg`) }]}
          grid={{ horizontal: true }}
          hideLegend
          margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
        />
      </Box>
    </Box>
  );
}
```

```tsx lib/clinic-store.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  CLOCK_START,
  DAY_END,
  DAY_START,
  findConflict,
  fromMin,
  initialAppointments,
  patientById,
  toMin,
  vetById,
  type Appointment,
  type Status,
} from "./data";

export interface BookingInput {
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  urgent: boolean;
}
export type BookResult = { ok: true; appointment: Appointment } | { ok: false; error: string };

interface ClinicState {
  appointments: Appointment[];
  /** Simulated clock, whole minutes since midnight. */
  now: number;
  setStatus: (id: string, status: Status) => void;
  checkIn: (id: string) => void;
  book: (input: BookingInput) => BookResult;
}

const ClinicContext = createContext<ClinicState | null>(null);

export function conflictMessage(appts: Appointment[], vet: string, start: string, minutes: number): string | null {
  const s = toMin(start);
  if (s < DAY_START || s + minutes > DAY_END) return "That time is outside clinic hours (08:00 to 17:00).";
  const c = findConflict(appts, vet, s, minutes);
  if (!c) return null;
  const end = fromMin(toMin(c.start) + c.minutes);
  return `${vetById(vet).name} already has ${patientById(c.patient).name} at ${c.start} to ${end}. Pick another time or vet.`;
}

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(CLOCK_START);

  useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setNow(CLOCK_START + Math.floor((Date.now() - t0) / 60000));
    }, 10000);
    return () => window.clearInterval(id);
  }, []);

  const setStatus = useCallback((id: string, status: Status) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const checkIn = useCallback(
    (id: string) => {
      setAppointments((list) =>
        list.map((a) => (a.id === id && a.status === "booked" ? { ...a, status: "checked_in", checkedInAt: now } : a)),
      );
    },
    [now],
  );

  const book = useCallback(
    (input: BookingInput): BookResult => {
      const error = conflictMessage(appointments, input.vet, input.start, input.minutes);
      if (error) return { ok: false, error };
      const appointment: Appointment = {
        id: `a-${String(appointments.length + 1).padStart(2, "0")}`,
        patient: input.patient,
        vet: input.vet,
        start: input.start,
        minutes: input.minutes,
        reason: input.reason.trim() || "Follow-up",
        status: "booked",
        urgent: input.urgent || undefined,
      };
      setAppointments((list) => [...list, appointment]);
      return { ok: true, appointment };
    },
    [appointments],
  );

  const value = useMemo(() => ({ appointments, now, setStatus, checkIn, book }), [appointments, now, setStatus, checkIn, book]);
  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicState {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside ClinicProvider");
  return ctx;
}

export function sortAppointments(list: Appointment[]): Appointment[] {
  return [...list].sort((a, b) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet));
}
```

```ts lib/data.ts
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";

export interface Vet {
  id: string;
  name: string;
  short: string;
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
  /** Minutes since midnight at which the patient was checked in. */
  checkedInAt?: number;
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

export const CLINIC = "Pawpoint";
export const CLINIC_LONG = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const CLINIC_SITE = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

export const vets: Vet[] = [
  { id: "v-1", name: "Dr. Amara Osei", short: "Dr. Osei", room: "Exam 1" },
  { id: "v-2", name: "Dr. Tomás Reyes", short: "Dr. Reyes", room: "Exam 2" },
  { id: "v-3", name: "Dr. Helen Park", short: "Dr. Park", room: "Surgery" },
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

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 20 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 40 },
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

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

/** The simulated clock starts here (minutes since midnight): 09:50 on TODAY. */
export const CLOCK_START = 9 * 60 + 50;

export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;

export function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
export function fromMin(m: number): string {
  const v = Math.floor(m);
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}
export function endTime(a: { start: string; minutes: number }): string {
  return fromMin(toMin(a.start) + a.minutes);
}

export const patientById = (id: string): Patient => {
  const p = patients.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown patient ${id}`);
  return p;
};
export const ownerById = (id: string): Owner => {
  const o = owners.find((x) => x.id === id);
  if (!o) throw new Error(`Unknown owner ${id}`);
  return o;
};
export const vetById = (id: string): Vet => {
  const v = vets.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown vet ${id}`);
  return v;
};

/** First live (not cancelled) appointment of the vet that overlaps [startMin, startMin + minutes). */
export function findConflict(
  appts: Appointment[],
  vet: string,
  startMin: number,
  minutes: number,
): Appointment | undefined {
  const end = startMin + minutes;
  return appts.find((a) => {
    if (a.vet !== vet || a.status === "cancelled") return false;
    const s = toMin(a.start);
    return startMin < s + a.minutes && s < end;
  });
}

const utc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((utc(toIso) - utc(fromIso)) / 86400000);
}
export function formatDate(iso: string, withYear = true): string {
  return new Date(utc(iso)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}
export function formatDayLong(iso: string): string {
  return new Date(utc(iso)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
export function ageText(born: string, today: string): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
}
export function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
```

