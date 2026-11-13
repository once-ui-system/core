```tsx app/page.tsx
import AppShell from "@/components/AppShell";
import Schedule from "@/components/Schedule";

export default function Page() {
  return (
    <AppShell>
      <Schedule />
    </AppShell>
  );
}
```

```tsx app/patients/[id]/page.tsx
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import PatientRecord from "@/components/PatientRecord";
import { patientById, patients } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = patientById(id);
  if (!patient) notFound();
  return (
    <AppShell>
      <PatientRecord patientId={patient.id} />
    </AppShell>
  );
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes; system font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0f6b6b" },
        secondary: { main: "#4a5a8a" },
        error: { main: "#c62828" },
        warning: { main: "#b45309" },
        background: { default: "#f3f6f6", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#4fc3c3" },
        secondary: { main: "#9db0ee" },
        error: { main: "#ff8a80" },
        warning: { main: "#ffb74d" },
        background: { default: "#0e1516", paper: "#162022" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h2: { fontSize: "1.25rem", fontWeight: 700 },
    h3: { fontSize: "1.05rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 44, borderRadius: 10 } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { minHeight: 44, textTransform: "none", fontWeight: 600 } },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
```

```tsx components/AlertChips.tsx
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

export default function AlertChips({
  alerts,
  size = "small",
}: {
  alerts: string[];
  size?: "small" | "medium";
}) {
  if (alerts.length === 0) return null;
  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ flexWrap: "wrap", gap: 0.5 }}
      role="group"
      aria-label={`Medical alerts: ${alerts.join("; ")}`}
    >
      {alerts.map((a) => (
        <Chip
          key={a}
          size={size}
          color="error"
          icon={<ReportProblemIcon />}
          label={a}
          sx={{ fontWeight: 700, height: "auto", "& .MuiChip-label": { whiteSpace: "normal", py: 0.25 } }}
        />
      ))}
    </Stack>
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
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PatientSearch from "./PatientSearch";
import { CLINIC, CLINIC_FULL, USER } from "@/lib/data";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { mode, systemMode, setMode } = useColorScheme();
  const effective = mode === "system" ? systemMode : mode;
  return (
    <Box sx={{ minHeight: "100vh" }}>
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
          p: 1.5,
          borderRadius: 1,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: 1, borderColor: "divider" }}
      >
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 3 }, py: 1.25 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 1.5, md: 3 } }}>
            <Box
              component={Link}
              href="/"
              sx={{ display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none", minHeight: 44 }}
            >
              <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
                <PetsIcon />
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: "1.15rem" }}>{CLINIC}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  {CLINIC_FULL}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ order: { xs: 3, md: 0 }, flex: { xs: "1 1 100%", md: "1 1 auto" }, display: "flex", justifyContent: { md: "center" } }}>
              <PatientSearch />
            </Box>
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton
                aria-label={effective === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setMode(effective === "dark" ? "light" : "dark")}
              >
                {effective === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {USER.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {USER.role}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "secondary.main", width: 40, height: 40 }} aria-label={USER.name}>
                RL
              </Avatar>
            </Box>
          </Box>
        </Container>
      </AppBar>
      <Container component="main" id="main" maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        {children}
      </Container>
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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AlertChips from "./AlertChips";
import {
  Appointment,
  endTime,
  findClash,
  fmtLongToday,
  fmtTime,
  ownerById,
  patientById,
  patients,
  toMin,
  vets,
} from "@/lib/data";

const SLOTS: string[] = [];
for (let m = 8 * 60; m <= 16 * 60 + 45; m += 15) SLOTS.push(fmtTime(m));
const DURATIONS = [15, 20, 30, 45, 60, 90];

export type NewBooking = { patient: string; vet: string; start: string; minutes: number; reason: string };

export default function BookDialog({
  open,
  onClose,
  appointments,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onBook: (b: NewBooking) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [patient, setPatient] = useState("");
  const [vet, setVet] = useState("v-1");
  const [start, setStart] = useState("12:00");
  const [minutes, setMinutes] = useState(20);
  const [reason, setReason] = useState("Follow-up visit");

  const clash = useMemo(() => findClash(appointments, vet, start, minutes), [appointments, vet, start, minutes]);
  const selected = patient ? patientById(patient) : undefined;
  const clashPatient = clash ? patientById(clash.patient) : undefined;
  const clashVet = vets.find((v) => v.id === vet);
  const canSave = Boolean(patient) && !clash && reason.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onBook({ patient, vet, start, minutes, reason: reason.trim() });
    setPatient("");
    setReason("Follow-up visit");
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <DialogTitle id="book-title" sx={{ fontWeight: 800 }}>
        Book an appointment
        <Typography variant="body2" color="text.secondary">
          {fmtLongToday()}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="book-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          sx={{ display: "grid", gap: 2, pt: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}
        >
          <TextField
            select
            required
            label="Patient"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            sx={{ gridColumn: "1 / -1" }}
          >
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id} sx={{ minHeight: 48, gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  {p.name} ({p.species}) · {ownerById(p.owner)?.name}
                </Box>
                {p.alerts.length > 0 && <ReportProblemIcon color="error" fontSize="small" titleAccess="Has medical alerts" />}
              </MenuItem>
            ))}
          </TextField>
          {selected && selected.alerts.length > 0 && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <AlertChips alerts={selected.alerts} />
            </Box>
          )}
          <TextField select label="Vet" value={vet} onChange={(e) => setVet(e.target.value)} sx={{ gridColumn: "1 / -1" }}>
            {vets.map((v) => (
              <MenuItem key={v.id} value={v.id} sx={{ minHeight: 48 }}>
                {v.name} · {v.room}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Time" value={start} onChange={(e) => setStart(e.target.value)} error={Boolean(clash)}>
            {SLOTS.map((s) => {
              const taken = findClash(appointments, vet, s, minutes);
              return (
                <MenuItem key={s} value={s} disabled={Boolean(taken)} sx={{ minHeight: 44 }}>
                  {s}
                  {taken ? " (taken)" : ""}
                </MenuItem>
              );
            })}
          </TextField>
          <TextField select label="Length" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {DURATIONS.map((d) => (
              <MenuItem key={d} value={d} sx={{ minHeight: 44 }}>
                {d} min
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Reason for visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            sx={{ gridColumn: "1 / -1" }}
          />
          <Box sx={{ gridColumn: "1 / -1" }} aria-live="polite">
            {clash ? (
              <Alert severity="error">
                {clashVet?.name} already has {clashPatient?.name} ({clash.reason}) from {clash.start} to {endTime(clash)}.
                Pick another time or vet.
              </Alert>
            ) : (
              <Alert severity="success" variant="outlined">
                {clashVet?.name} is free {start}–{fmtTime(toMin(start) + minutes)}.
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form="book-form" variant="contained" disabled={!canSave}>
          Book appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import Link from "next/link";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AlertChips from "./AlertChips";
import {
  TODAY,
  ageLabel,
  daysBetween,
  fmtDate,
  fmtShortDate,
  ownerById,
  patientById,
  records,
  usd,
  vetById,
} from "@/lib/data";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Paper component="section" variant="outlined" aria-labelledby={id} sx={{ p: { xs: 2, md: 2.5 } }}>
      <Typography id={id} component="h2" variant="h2" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{children}</Typography>
    </Box>
  );
}

export default function PatientRecord({ patientId }: { patientId: string }) {
  const p = patientById(patientId)!;
  const owner = ownerById(p.owner);
  const rec = records[p.id];

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <Box
        component={Link}
        href="/"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, color: "primary.main", fontWeight: 600, minHeight: 44, width: "fit-content", textDecoration: "none" }}
      >
        <ArrowBackIcon fontSize="small" /> Today&rsquo;s schedule
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 1.5, mb: 2 }}>
          <Typography component="h1" variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.4rem" } }}>
            {p.name}
          </Typography>
          <Typography color="text.secondary">
            {p.breed} · {p.species} · Patient {p.id}
          </Typography>
        </Box>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
          <Fact label="Age">
            {ageLabel(p.born)} (born {fmtDate(p.born)})
          </Fact>
          <Fact label="Sex">{p.sex}</Fact>
          <Fact label="Owner">{owner?.name}</Fact>
          <Fact label="Phone">
            <Box component="a" href={`tel:${owner?.phone.replace(/\s/g, "")}`} sx={{ color: "primary.main" }}>
              {owner?.phone}
            </Box>
          </Fact>
        </Box>
        {rec && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current weight <strong>{rec.weights_kg[rec.weights_kg.length - 1].kg} kg</strong> as of {fmtDate(rec.weights_kg[rec.weights_kg.length - 1].date)}
            </Typography>
          </Box>
        )}
      </Paper>

      {p.alerts.length > 0 && (
        <Alert
          severity="error"
          variant="filled"
          icon={<ReportProblemIcon fontSize="large" />}
          sx={{ alignItems: "center", "& .MuiAlert-message": { width: "100%" }, border: 2, borderColor: "error.dark" }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: "1.1rem" }}>Medical alerts: read before treating</AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: "1.1rem", fontWeight: 700 }}>
            {p.alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </Box>
        </Alert>
      )}

      {!rec ? (
        <Section id="norec-h" title="Clinical record">
          <Typography color="text.secondary">No weights, vaccinations or visit notes are loaded for {p.name} in this demo.</Typography>
        </Section>
      ) : (
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1.25fr) minmax(0,1fr)" }, alignItems: "start" }}>
          <Box sx={{ display: "grid", gap: 2.5 }}>
            <Section id="weight-h" title="Weight trend">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Down {(rec.weights_kg[0].kg - rec.weights_kg[rec.weights_kg.length - 1].kg).toFixed(1)} kg since {fmtDate(rec.weights_kg[0].date)}, a steady loss at every visit.
              </Typography>
              <Box role="img" aria-label={`Weight in kg at each visit: ${rec.weights_kg.map((w) => `${fmtDate(w.date)} ${w.kg}`).join(", ")}`}>
                <LineChart
                  height={280}
                  hideLegend
                  xAxis={[{ scaleType: "point", data: rec.weights_kg.map((w) => w.date), valueFormatter: (v: string) => fmtShortDate(v) }]}
                  yAxis={[{ min: 27, max: 33, label: "kg" }]}
                  series={[
                    {
                      data: rec.weights_kg.map((w) => w.kg),
                      label: "Weight (kg)",
                      showMark: true,
                      valueFormatter: (v: number | null) => (v === null ? "" : `${v} kg`),
                    },
                  ]}
                />
              </Box>
            </Section>

            <Section id="visits-h" title="Visit history">
              <Box component="ol" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1.5 }}>
                {rec.visits.map((v) => (
                  <Box component="li" key={v.date} sx={{ pl: 1.5, borderLeft: 3, borderColor: "primary.main" }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "baseline" }}>
                      <Typography sx={{ fontWeight: 800 }}>{fmtDate(v.date)}</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{v.reason}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: "auto" } }}>
                        {vetById(v.vet)?.name} · {usd(v.invoice_usd)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 0.25 }}>
                      {v.notes}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Section>
          </Box>

          <Box sx={{ display: "grid", gap: 2.5 }}>
            <Section id="vax-h" title="Vaccinations">
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1 }}>
                {rec.vaccinations.map((v) => {
                  const diff = daysBetween(TODAY, v.due);
                  const overdue = diff < 0;
                  const soon = !overdue && diff <= 30;
                  return (
                    <Box
                      component="li"
                      key={v.name}
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 1,
                        p: 1.25,
                        borderRadius: 2,
                        border: overdue ? 2 : 1,
                        borderColor: overdue ? "error.main" : "divider",
                        bgcolor: overdue ? "color-mix(in srgb, var(--mui-palette-error-main) 10%, var(--mui-palette-background-paper))" : "transparent",
                      }}
                    >
                      <Box sx={{ flex: "1 1 140px" }}>
                        <Typography sx={{ fontWeight: 800 }}>{v.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Given {fmtDate(v.given)} · due {fmtDate(v.due)}
                        </Typography>
                      </Box>
                      {overdue ? (
                        <Chip color="error" icon={<EventBusyIcon />} label={`Overdue ${-diff} days`} sx={{ fontWeight: 800 }} />
                      ) : soon ? (
                        <Chip color="warning" icon={<ScheduleIcon />} label={`Due in ${diff} days`} sx={{ fontWeight: 700 }} />
                      ) : (
                        <Chip color="success" variant="outlined" icon={<CheckCircleIcon />} label="Up to date" />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Section>

            <Section id="meds-h" title="Current medications">
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1 }}>
                {rec.medications.map((m) => (
                  <Box component="li" key={m.name}>
                    <Typography sx={{ fontWeight: 800 }}>{m.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {m.dose} · since {fmtDate(m.since)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 1.5 }}>
                <AlertChips alerts={p.alerts.filter((a) => /allergy/i.test(a))} />
              </Box>
            </Section>
          </Box>
        </Box>
      )}
    </Box>
  );
}
```

```tsx components/PatientSearch.tsx
"use client";

import { useRouter } from "next/navigation";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Patient, ownerById, patients } from "@/lib/data";

export default function PatientSearch() {
  const router = useRouter();
  return (
    <Autocomplete<Patient>
      options={patients}
      value={null}
      blurOnSelect
      clearOnBlur
      handleHomeEndKeys
      getOptionLabel={(p) => p.name}
      filterOptions={(opts, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return opts;
        return opts.filter(
          (p) => p.name.toLowerCase().includes(q) || (ownerById(p.owner)?.name.toLowerCase().includes(q) ?? false),
        );
      }}
      noOptionsText="No patient or owner matches"
      onChange={(_, p) => {
        if (p) router.push(`/patients/${p.id}`);
      }}
      sx={{ width: "100%", maxWidth: 480 }}
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest} sx={{ gap: 1.5, minHeight: 52 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>
                {p.name}{" "}
                <Typography component="span" variant="body2" color="text.secondary">
                  {p.species}, {p.breed}
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Owner: {ownerById(p.owner)?.name}
              </Typography>
            </Box>
            {p.alerts.length > 0 && (
              <ReportProblemIcon color="error" titleAccess={`Medical alert: ${p.alerts.join("; ")}`} />
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Find a patient or owner"
          size="small"
          slotProps={{
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
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper", minHeight: 44 } }}
        />
      )}
    />
  );
}
```

```tsx components/Schedule.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AlertChips from "./AlertChips";
import BookDialog, { NewBooking } from "./BookDialog";
import {
  Appointment,
  STATUS_LABEL,
  Status,
  endTime,
  fmtLongToday,
  fmtTime,
  initialAppointments,
  ownerById,
  patientById,
  toMin,
  vetById,
  vets,
} from "@/lib/data";

// The desk clock starts at the time the day's data was captured and then ticks with the wall clock.
const START_NOW = 9 * 60 + 52;

const statusChip = (s: Status) => {
  switch (s) {
    case "checked_in":
      return { color: "warning" as const, variant: "filled" as const };
    case "in_exam":
      return { color: "primary" as const, variant: "filled" as const };
    case "done":
      return { color: "success" as const, variant: "filled" as const };
    case "cancelled":
      return { color: "default" as const, variant: "outlined" as const };
    default:
      return { color: "default" as const, variant: "filled" as const };
  }
};

function StatusChip({ status }: { status: Status }) {
  const c = statusChip(status);
  return <Chip size="small" label={STATUS_LABEL[status]} color={c.color} variant={c.variant} sx={{ fontWeight: 700 }} />;
}

function Row({ a, onCheckIn }: { a: Appointment; onCheckIn: (id: string) => void }) {
  const p = patientById(a.patient)!;
  const owner = ownerById(p.owner);
  const vet = vetById(a.vet);
  const muted = a.status === "done" || a.status === "cancelled";
  return (
    <Paper
      component="li"
      variant="outlined"
      sx={{
        listStyle: "none",
        display: "grid",
        gridTemplateColumns: { xs: "64px 1fr", md: "84px 1fr auto" },
        gap: { xs: 1, md: 2 },
        alignItems: "start",
        p: 1.5,
        pl: 1.5,
        borderLeft: 6,
        borderLeftColor: a.urgent && !muted ? "error.main" : a.status === "in_exam" ? "primary.main" : a.status === "checked_in" ? "warning.main" : "divider",
        bgcolor: a.urgent && !muted ? "color-mix(in srgb, var(--mui-palette-error-main) 9%, var(--mui-palette-background-paper))" : muted ? "action.hover" : "background.paper",
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", fontVariantNumeric: "tabular-nums" }}>{a.start}</Typography>
        <Typography variant="caption" color="text.secondary">
          to {endTime(a)}
        </Typography>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
          <Typography
            component={Link}
            href={`/patients/${p.id}`}
            sx={{ fontWeight: 800, fontSize: "1.05rem", color: "text.primary", textDecorationColor: "var(--mui-palette-divider)", textUnderlineOffset: 3 }}
          >
            {p.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {p.species} · {owner?.name}
          </Typography>
          <StatusChip status={a.status} />
          {a.urgent && (
            <Chip size="small" color="error" icon={<PriorityHighIcon />} label="Urgent" sx={{ fontWeight: 800 }} />
          )}
        </Box>
        <Typography sx={{ mt: 0.25, textDecoration: a.status === "cancelled" ? "line-through" : "none" }}>{a.reason}</Typography>
        <Typography variant="body2" color="text.secondary">
          {vet?.name} · {vet?.room} · {a.minutes} min
        </Typography>
        {p.alerts.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <AlertChips alerts={p.alerts} />
          </Box>
        )}
      </Box>
      {a.status === "booked" && (
        <Box sx={{ gridColumn: { xs: "1 / -1", md: "auto" }, alignSelf: "center" }}>
          <Button
            variant="contained"
            startIcon={<HowToRegIcon />}
            onClick={() => onCheckIn(a.id)}
            fullWidth
            aria-label={`Check in ${p.name}`}
            sx={{ minWidth: 140 }}
          >
            Check in
          </Button>
        </Box>
      )}
    </Paper>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, px: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1, color: tone ?? "text.primary" }}>{value}</Typography>
    </Paper>
  );
}

export default function Schedule() {
  const [appts, setAppts] = useState<Appointment[]>(initialAppointments);
  const [now, setNow] = useState(START_NOW);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const checkIn = (id: string) => {
    const a = appts.find((x) => x.id === id);
    if (!a) return;
    setAppts((list) => list.map((x) => (x.id === id ? { ...x, status: "checked_in", checkedInAt: now } : x)));
    setToast(`${patientById(a.patient)?.name} is checked in and waiting for ${vetById(a.vet)?.name}.`);
  };

  const book = (b: NewBooking) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { id, status: "booked", ...b }]);
    setOpen(false);
    setToast(`Booked ${patientById(b.patient)?.name} with ${vetById(b.vet)?.name} at ${b.start}.`);
  };

  const sorted = useMemo(
    () => [...appts].sort((x, y) => toMin(x.start) - toMin(y.start) || x.vet.localeCompare(y.vet)),
    [appts],
  );
  const shown = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((x, y) => (x.checkedInAt ?? 0) - (y.checkedInAt ?? 0));
  const inExam = appts.filter((a) => a.status === "in_exam");
  const count = (s: Status) => appts.filter((a) => a.status === s).length;

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Box>
          <Typography component="h1" variant="h1">
            Today&rsquo;s schedule
          </Typography>
          <Typography color="text.secondary">
            {fmtLongToday()} · desk time {fmtTime(now)}
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Book appointment
        </Button>
      </Box>

      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, mb: 3 }}>
        <Stat label="Waiting now" value={waiting.length} tone="var(--mui-palette-warning-main)" />
        <Stat label="In exam" value={inExam.length} tone="var(--mui-palette-primary-main)" />
        <Stat label="Still to arrive" value={count("booked")} />
        <Stat label="Done" value={count("done")} tone="var(--mui-palette-success-main)" />
      </Box>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 380px" }, alignItems: "start" }}>
        <Box component="section" aria-labelledby="sched-h" sx={{ order: { xs: 2, lg: 1 } }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 1.5 }}>
            <Typography id="sched-h" component="h2" variant="h2">
              All appointments ({shown.length})
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={vetFilter}
              onChange={(_, v: string | null) => v && setVetFilter(v)}
              aria-label="Filter by vet"
              sx={{ flexWrap: "wrap" }}
            >
              <ToggleButton value="all">All vets</ToggleButton>
              {vets.map((v) => (
                <ToggleButton key={v.id} value={v.id}>
                  {v.name.replace("Dr. ", "").split(" ")[0]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Box component="ul" sx={{ m: 0, p: 0, display: "grid", gap: 1.25 }}>
            {shown.map((a) => (
              <Row key={a.id} a={a} onCheckIn={checkIn} />
            ))}
          </Box>
        </Box>

        <Box sx={{ order: { xs: 1, lg: 2 }, display: "grid", gap: 2, position: { lg: "sticky" }, top: { lg: 96 } }}>
          <Paper component="section" aria-labelledby="wait-h" variant="outlined" sx={{ p: 2 }}>
            <Typography id="wait-h" component="h2" variant="h2" sx={{ mb: 1.5 }}>
              Waiting room ({waiting.length})
            </Typography>
            {waiting.length === 0 ? (
              <Typography color="text.secondary">Nobody is waiting.</Typography>
            ) : (
              <Box component="ol" sx={{ m: 0, p: 0, display: "grid", gap: 1.25, listStyle: "none" }} aria-live="polite">
                {waiting.map((a, i) => {
                  const p = patientById(a.patient)!;
                  const mins = Math.max(0, now - (a.checkedInAt ?? now));
                  const long = mins >= 30;
                  return (
                    <Box
                      component="li"
                      key={a.id}
                      sx={{ p: 1.25, borderRadius: 2, border: 1, borderColor: long ? "warning.main" : "divider" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        {i === 0 && <Chip size="small" color="primary" label="Next up" sx={{ fontWeight: 800 }} />}
                        <Typography component={Link} href={`/patients/${p.id}`} sx={{ fontWeight: 800, color: "text.primary" }}>
                          {p.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                          waiting{" "}
                          <Box component="strong" sx={{ color: long ? "warning.main" : "text.primary", fontSize: "1.05rem" }}>
                            {mins} min
                          </Box>
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {ownerById(p.owner)?.name} · {a.reason}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Checked in {fmtTime(a.checkedInAt ?? now)} · sees {vetById(a.vet)?.name} ({vetById(a.vet)?.room}) at {a.start}
                      </Typography>
                      {p.alerts.length > 0 && (
                        <Box sx={{ mt: 0.75 }}>
                          <AlertChips alerts={p.alerts} />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          <Paper component="section" aria-labelledby="exam-h" variant="outlined" sx={{ p: 2 }}>
            <Typography id="exam-h" component="h2" variant="h2" sx={{ mb: 1.5 }}>
              In exam ({inExam.length})
            </Typography>
            <Box component="ul" sx={{ m: 0, p: 0, display: "grid", gap: 1, listStyle: "none" }}>
              {inExam.map((a) => {
                const p = patientById(a.patient)!;
                return (
                  <Box component="li" key={a.id}>
                    <Typography component="span" sx={{ fontWeight: 700 }}>
                      {p.name}
                    </Typography>{" "}
                    <Typography component="span" variant="body2" color="text.secondary">
                      with {vetById(a.vet)?.name} · {vetById(a.vet)?.room}
                    </Typography>
                    {p.alerts.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        <AlertChips alerts={p.alerts} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      </Box>

      <BookDialog open={open} onClose={() => setOpen(false)} appointments={appts} onBook={book} />
      <Snackbar open={toast !== null} autoHideDuration={5000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setToast(null)} role="status">
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
```

```ts lib/data.ts
export const CLINIC = "Pawpoint";
export const CLINIC_FULL = "Hillside Veterinary Clinic";
export const TODAY = "2026-11-12";
export const USER = { name: "Rosa Lindqvist", role: "Receptionist" };

export type Vet = { id: string; name: string; room: string };
export type Owner = { id: string; name: string; phone: string };
export type Patient = {
  id: string;
  name: string;
  species: string;
  breed: string;
  born: string;
  sex: string;
  owner: string;
  alerts: string[];
};
export type Status = "booked" | "checked_in" | "in_exam" | "done" | "cancelled";
export type Appointment = {
  id: string;
  patient: string;
  vet: string;
  start: string;
  minutes: number;
  reason: string;
  status: Status;
  urgent?: boolean;
  /** minutes since midnight at which the patient was checked in */
  checkedInAt?: number;
};

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

export const initialAppointments: Appointment[] = [
  { id: "a-01", patient: "p-101", vet: "v-1", start: "08:30", minutes: 20, reason: "Annual vaccination", status: "done" },
  { id: "a-02", patient: "p-104", vet: "v-2", start: "08:30", minutes: 30, reason: "Kidney panel recheck", status: "done" },
  { id: "a-03", patient: "p-108", vet: "v-3", start: "08:00", minutes: 120, reason: "Soft palate surgery", status: "in_exam" },
  { id: "a-04", patient: "p-102", vet: "v-1", start: "09:00", minutes: 30, reason: "Limping, left hind leg", status: "in_exam" },
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: 9 * 60 + 20 },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: 9 * 60 + 41 },
  { id: "a-07", patient: "p-103", vet: "v-2", start: "10:00", minutes: 30, reason: "Senior wellness exam", status: "booked" },
  { id: "a-08", patient: "p-106", vet: "v-1", start: "10:30", minutes: 20, reason: "Not eating since yesterday", status: "booked", urgent: true },
  { id: "a-09", patient: "p-104", vet: "v-3", start: "11:00", minutes: 45, reason: "Dental cleaning", status: "booked" },
  { id: "a-10", patient: "p-101", vet: "v-2", start: "11:30", minutes: 20, reason: "Ear infection follow-up", status: "booked" },
  { id: "a-11", patient: "p-107", vet: "v-1", start: "13:30", minutes: 30, reason: "Dental check", status: "booked" },
  { id: "a-12", patient: "p-103", vet: "v-3", start: "14:00", minutes: 60, reason: "Lump removal", status: "cancelled" },
  { id: "a-13", patient: "p-102", vet: "v-2", start: "15:00", minutes: 20, reason: "X-ray results", status: "booked" },
];

export type WeightPoint = { date: string; kg: number };
export type Vaccination = { name: string; given: string; due: string };
export type Medication = { name: string; dose: string; since: string };
export type Visit = { date: string; vet: string; reason: string; notes: string; invoice_usd: number };
export type PatientRecordData = {
  weights_kg: WeightPoint[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
};

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

/* ---------- helpers ---------- */

export const patientById = (id: string) => patients.find((p) => p.id === id);
export const ownerById = (id: string) => owners.find((o) => o.id === id);
export const vetById = (id: string) => vets.find((v) => v.id === id);

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fmtTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const endTime = (a: { start: string; minutes: number }) => fmtTime(toMin(a.start) + a.minutes);

/** Finds an active booking of the same vet that overlaps the proposed slot. */
export function findClash(
  appointments: Appointment[],
  vet: string,
  start: string,
  minutes: number,
): Appointment | undefined {
  const s = toMin(start);
  const e = s + minutes;
  return appointments.find(
    (a) => a.vet === vet && a.status !== "cancelled" && toMin(a.start) < e && s < toMin(a.start) + a.minutes,
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
};

export function fmtDate(iso: string, withYear = true) {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]}${withYear ? ` ${y}` : ""}`;
}
export function fmtShortDate(iso: string) {
  const { y, m } = parts(iso);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}
export function fmtLongToday() {
  const { y, m, d } = parts(TODAY);
  const wd = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${wd} ${d} ${MONTHS[m - 1]} ${y}`;
}

const dayNumber = (iso: string) => {
  const { y, m, d } = parts(iso);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};
export const daysBetween = (from: string, to: string) => dayNumber(to) - dayNumber(from);

export function ageLabel(born: string, today = TODAY) {
  const b = parts(born);
  const t = parts(today);
  let years = t.y - b.y;
  if (t.m < b.m || (t.m === b.m && t.d < b.d)) years -= 1;
  if (years < 1) {
    const months = (t.y - b.y) * 12 + (t.m - b.m) - (t.d < b.d ? 1 : 0);
    return `${months} mo`;
  }
  return `${years} yr`;
}

export const usd = (n: number) => `$${n.toFixed(2)}`;

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};
```

