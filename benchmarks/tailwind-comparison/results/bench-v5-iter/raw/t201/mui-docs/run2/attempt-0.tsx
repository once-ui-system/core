```tsx app/layout.tsx
import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

export const metadata: Metadata = {
  title: "Pawpoint | Hillside Veterinary Clinic front desk",
  description: "Front-desk schedule, check-in and patient records for Hillside Veterinary Clinic.",
};

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
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import PatientRecord from "@/components/PatientRecord";
import { getPatient, patients, records } from "@/lib/data";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const patient = getPatient(id);
  return { title: patient ? `${patient.name} | Pawpoint` : "Patient not found | Pawpoint" };
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();
  return (
    <AppShell>
      <PatientRecord patient={patient} record={records[patient.id]} />
    </AppShell>
  );
}
```

```ts app/theme.ts
"use client";

import { createTheme } from "@mui/material/styles";

// Pawpoint: calm teal clinic palette, large touch targets, strong red reserved for medical alerts.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0b6b6b", contrastText: "#ffffff" },
        secondary: { main: "#4b3fa3" },
        error: { main: "#b91c1c", contrastText: "#ffffff" },
        warning: { main: "#9a4a00", contrastText: "#ffffff" },
        success: { main: "#1b6e34", contrastText: "#ffffff" },
        info: { main: "#0b58a0", contrastText: "#ffffff" },
        background: { default: "#f2f5f5", paper: "#ffffff" },
        text: { primary: "#14211f", secondary: "#4a5b58" },
        divider: "#d9e2e1",
      },
    },
    dark: {
      palette: {
        primary: { main: "#4fd1c5", contrastText: "#052321" },
        secondary: { main: "#b4a9ff" },
        error: { main: "#d32f2f", contrastText: "#ffffff" },
        warning: { main: "#f5a524", contrastText: "#1d1200" },
        success: { main: "#5fd38a", contrastText: "#062012" },
        info: { main: "#7cc0ff", contrastText: "#041a30" },
        background: { default: "#0e1415", paper: "#162022" },
        text: { primary: "#e8f0ef", secondary: "#a2b4b1" },
        divider: "#2a3a3b",
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 44, borderRadius: 10 } },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

export default theme;
```

```tsx components/AlertChips.tsx
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ReportIcon from "@mui/icons-material/ReportProblem";

/** Medical alerts, always solid red with a warning icon so they cannot be missed. */
export default function AlertChips({ alerts, size = "small" }: { alerts: string[]; size?: "small" | "medium" }) {
  if (alerts.length === 0) return null;
  return (
    <Box component="ul" aria-label="Medical alerts" sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, m: 0, p: 0, listStyle: "none" }}>
      {alerts.map((a) => (
        <li key={a}>
          <Chip
            color="error"
            size={size}
            icon={<ReportIcon />}
            label={
              <>
                <Box component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                  Medical alert:{" "}
                </Box>
                {a}
              </>
            }
            sx={{ height: "auto", minHeight: size === "small" ? 26 : 32, "& .MuiChip-label": { whiteSpace: "normal", py: 0.25 }, fontWeight: 700 }}
          />
        </li>
      ))}
    </Box>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useColorScheme } from "@mui/material/styles";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ReportIcon from "@mui/icons-material/ReportProblem";
import { getOwner, patients, searchPatients, user, today, formatShortWeekday } from "@/lib/data";
import type { Patient } from "@/lib/data";

function PatientSearch() {
  const router = useRouter();
  const [input, setInput] = React.useState("");

  return (
    <Autocomplete<Patient>
      options={patients}
      value={null}
      inputValue={input}
      onInputChange={(_, v, reason) => setInput(reason === "reset" ? "" : v)}
      onChange={(_, option) => {
        if (option) router.push(`/patients/${option.id}`);
      }}
      filterOptions={(_, state) => searchPatients(state.inputValue)}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText="No patient or owner matches that name"
      blurOnSelect
      fullWidth
      slotProps={{ paper: { sx: { mt: 0.5 } } }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        const owner = getOwner(option.owner);
        return (
          <li key={key} {...rest}>
            <Stack sx={{ width: 1, py: 0.5 }} spacing={0.25}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700 }}>{option.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.species}, {option.breed}
                </Typography>
                {option.alerts.length > 0 && (
                  <ReportIcon color="error" fontSize="small" titleAccess={`Medical alert: ${option.alerts.join(", ")}`} />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Owner: {owner.name}
                {option.alerts.length > 0 && (
                  <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>
                    {" "}
                    · {option.alerts.join(" · ")}
                  </Box>
                )}
              </Typography>
            </Stack>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Search patient or owner"
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              sx: { borderRadius: 3, minHeight: 44, bgcolor: "background.default" },
            },
            htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Search patient or owner by name" },
          }}
        />
      )}
    />
  );
}

function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const resolved = mode === "system" ? systemMode : mode;
  const dark = mounted && resolved === "dark";
  return (
    <Tooltip title={dark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setMode(dark ? "light" : "dark")}>
        {dark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
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
          borderRadius: 2,
          "&:focus": { top: 8 },
        }}
      >
        Skip to content
      </Box>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "grid",
              alignItems: "center",
              gap: { xs: 1, sm: 3 },
              py: 1,
              gridTemplateColumns: { xs: "1fr auto", sm: "auto minmax(0, 1fr) auto" },
              gridTemplateAreas: { xs: '"brand actions" "search search"', sm: '"brand search actions"' },
            }}
          >
            <Box component={NextLink} href="/" sx={{ gridArea: "brand", display: "flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none" }}>
              <Avatar variant="rounded" sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 40, height: 40 }}>
                <PetsIcon />
              </Avatar>
              <Box>
                <Typography component="span" sx={{ display: "block", fontWeight: 800, fontSize: 20, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                  Pawpoint
                </Typography>
                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1.2 }}>
                  Hillside Veterinary Clinic
                </Typography>
              </Box>
            </Box>
            <Box sx={{ gridArea: "search", maxWidth: 560, width: 1, justifySelf: { sm: "center" } }}>
              <PatientSearch />
            </Box>
            <Stack direction="row" spacing={1} sx={{ gridArea: "actions", alignItems: "center", justifySelf: "end" }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", lg: "block" }, mr: 1 }}>
                {formatShortWeekday(today)}
              </Typography>
              <ModeToggle />
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", width: 36, height: 36, fontSize: 14, fontWeight: 700 }} aria-hidden>
                  RL
                </Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </AppBar>
      <Container component="main" id="main" tabIndex={-1} maxWidth="xl" sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, outline: "none" }}>
        {children}
      </Container>
    </Box>
  );
}
```

```tsx components/PatientRecord.tsx
"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import HistoryIcon from "@mui/icons-material/History";
import MedicationIcon from "@mui/icons-material/Medication";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import PetsIcon from "@mui/icons-material/Pets";
import PhoneIcon from "@mui/icons-material/Phone";
import ReportIcon from "@mui/icons-material/ReportProblem";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import WeightChart from "./WeightChart";
import {
  ageText,
  appointments,
  daysBetween,
  endTime,
  formatDate,
  formatMoney,
  formatTime,
  getOwner,
  getVet,
  statusLabel,
  today,
} from "@/lib/data";
import type { Patient, PatientRecordData, Vaccination } from "@/lib/data";

function Section({ icon, title, children, id }: { icon: React.ReactNode; title: string; children: React.ReactNode; id: string }) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby={id} sx={{ overflow: "hidden" }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", px: 2.5, py: 1.5, borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
        {icon}
        <Typography id={id} variant="h6" component="h2" sx={{ color: "text.primary" }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function vaccinationState(v: Vaccination) {
  const left = daysBetween(today, v.due);
  if (left < 0) return { kind: "overdue" as const, label: `Overdue by ${-left} ${-left === 1 ? "day" : "days"}` };
  if (left <= 30) return { kind: "soon" as const, label: `Due in ${left} ${left === 1 ? "day" : "days"}` };
  return { kind: "ok" as const, label: "Up to date" };
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <Typography color="text.secondary" sx={{ p: 2.5 }}>
      {children}
    </Typography>
  );
}

export default function PatientRecord({ patient, record }: { patient: Patient; record?: PatientRecordData }) {
  const owner = getOwner(patient.owner);
  const todays = appointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");
  const vaccinations = record?.vaccinations ?? [];
  const overdue = vaccinations.filter((v) => vaccinationState(v).kind === "overdue");
  const weights = record?.weights_kg ?? [];
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const delta = firstWeight && lastWeight ? lastWeight.kg - firstWeight.kg : 0;
  const pct = firstWeight ? (delta / firstWeight.kg) * 100 : 0;

  return (
    <Stack spacing={3}>
      <Box>
        <Button component={NextLink} href="/" startIcon={<ArrowBackIcon />} color="inherit" sx={{ ml: -1 }}>
          Today&apos;s schedule
        </Button>
      </Box>

      {/* identity */}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
            <Box
              aria-hidden
              sx={{ width: { xs: 56, md: 72 }, height: { xs: 56, md: 72 }, flexShrink: 0, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText" }}
            >
              <PetsIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 30, md: 40 }, lineHeight: 1.1 }}>
                {patient.name}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 17 }} color="text.secondary">
                {patient.breed} · {patient.species}
              </Typography>
              <Typography color="text.secondary">
                {patient.sex} · {ageText(patient.born)} old (born {formatDate(patient.born)})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Patient ID {patient.id}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ minWidth: { md: 260 } }}>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.5, display: "block" }}>
              Owner
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{owner.name}</Typography>
            <Button component="a" href={`tel:${owner.phone.replace(/\s/g, "")}`} startIcon={<PhoneIcon />} variant="outlined" sx={{ mt: 1 }}>
              {owner.phone}
            </Button>
          </Box>
        </Stack>

        {todays.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: "divider", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <EventIcon color="action" />
            <Typography sx={{ fontWeight: 700, mr: 1 }}>Today</Typography>
            {todays.map((a) => (
              <Chip
                key={a.id}
                variant="outlined"
                label={`${formatTime(a.start)} to ${formatTime(endTime(a))} · ${a.reason} · ${getVet(a.vet).name} · ${statusLabel[a.status]}`}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* medical alerts, impossible to miss */}
      {patient.alerts.length > 0 && (
        <Box
          component="section"
          aria-labelledby="alerts-title"
          sx={{ bgcolor: "error.main", color: "error.contrastText", borderRadius: 3, p: { xs: 2, md: 3 }, border: "3px solid", borderColor: "error.dark", boxShadow: "0 0 0 4px color-mix(in srgb, var(--mui-palette-error-main) 25%, transparent)" }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
            <ReportIcon sx={{ fontSize: 36 }} />
            <Typography id="alerts-title" variant="h5" component="h2" sx={{ textTransform: "uppercase", letterSpacing: ".04em" }}>
              Medical alerts
            </Typography>
          </Stack>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", md: "repeat(auto-fit, minmax(280px, 1fr))" } }}>
            {patient.alerts.map((a) => (
              <Box component="li" key={a} sx={{ bgcolor: "rgba(0,0,0,.22)", borderRadius: 2, px: 2, py: 1.25, fontSize: { xs: 18, md: 20 }, fontWeight: 800 }}>
                {a}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {overdue.length > 0 && (
        <Box
          role="status"
          sx={{ display: "flex", gap: 1.5, alignItems: "center", px: 2.5, py: 1.5, borderRadius: 3, border: 2, borderColor: "warning.main", bgcolor: "color-mix(in srgb, var(--mui-palette-warning-main) 12%, transparent)" }}
        >
          <VaccinesIcon sx={{ color: "warning.main" }} />
          <Typography sx={{ fontWeight: 700 }}>
            {overdue.length} vaccinations overdue: {overdue.map((v) => v.name).join(", ")}. Offer to book them with today&apos;s visit.
          </Typography>
        </Box>
      )}

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 7 }} sx={{ minWidth: 0 }}>
          <Stack spacing={3}>
            <Section id="weight-title" icon={<MonitorWeightIcon />} title="Weight trend">
              {weights.length === 0 ? (
                <EmptyNote>No weights recorded for {patient.name} yet.</EmptyNote>
              ) : (
                <Box sx={{ p: 2.5 }}>
                  <Stack direction="row" sx={{ alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{lastWeight.kg.toFixed(1)} kg</Typography>
                    <Typography sx={{ fontWeight: 700, color: delta < 0 ? "warning.main" : "text.secondary" }}>
                      {delta < 0 ? "Down" : "Up"} {Math.abs(delta).toFixed(1)} kg ({Math.abs(pct).toFixed(0)}%) since {formatDate(firstWeight.date)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Weighed at {weights.length} visits. Last weighed {formatDate(lastWeight.date)}.
                  </Typography>
                  <WeightChart weights={weights} />
                </Box>
              )}
            </Section>

            <Section id="visits-title" icon={<HistoryIcon />} title="Visit history">
              {!record || record.visits.length === 0 ? (
                <EmptyNote>No past visits on file for {patient.name}.</EmptyNote>
              ) : (
                <Box component="ol" sx={{ m: 0, p: 0, listStyle: "none" }}>
                  {record.visits.map((v, i) => (
                    <Box
                      component="li"
                      key={v.date}
                      sx={{ px: 2.5, py: 2, borderBottom: i < record.visits.length - 1 ? 1 : 0, borderColor: "divider", display: "grid", gap: 0.5, gridTemplateColumns: { xs: "1fr", sm: "120px 1fr" }, columnGap: 2 }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>{formatDate(v.date)}</Typography>
                        {v.date === today && <Chip size="small" color="primary" label="Today" />}
                      </Box>
                      <Box>
                        <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                          <Typography sx={{ fontWeight: 700 }}>{v.reason}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getVet(v.vet).name} · {formatMoney(v.invoice_usd)}
                          </Typography>
                        </Stack>
                        <Typography sx={{ mt: 0.5 }}>{v.notes}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Section>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <Section id="vacc-title" icon={<VaccinesIcon />} title="Vaccinations">
              {vaccinations.length === 0 ? (
                <EmptyNote>No vaccinations recorded for {patient.name} yet.</EmptyNote>
              ) : (
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
                  {vaccinations.map((v, i) => {
                    const s = vaccinationState(v);
                    return (
                      <Box
                        component="li"
                        key={v.name}
                        data-state={s.kind}
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          borderBottom: i < vaccinations.length - 1 ? 1 : 0,
                          borderColor: "divider",
                          borderLeft: 5,
                          borderLeftColor: s.kind === "overdue" ? "error.main" : "transparent",
                          bgcolor: s.kind === "overdue" ? "color-mix(in srgb, var(--mui-palette-error-main) 9%, transparent)" : "transparent",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{v.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Given {formatDate(v.given)} · due {formatDate(v.due)}
                          </Typography>
                        </Box>
                        {s.kind === "overdue" ? (
                          <Chip color="error" icon={<ReportIcon />} label={s.label} sx={{ fontWeight: 800 }} />
                        ) : s.kind === "soon" ? (
                          <Chip color="warning" label={s.label} />
                        ) : (
                          <Chip variant="outlined" color="success" label={s.label} />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Section>

            <Section id="meds-title" icon={<MedicationIcon />} title="Current medications">
              {!record || record.medications.length === 0 ? (
                <EmptyNote>No current medications for {patient.name}.</EmptyNote>
              ) : (
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
                  {record.medications.map((m, i) => (
                    <Box component="li" key={m.name} sx={{ px: 2.5, py: 1.5, borderBottom: i < record.medications.length - 1 ? 1 : 0, borderColor: "divider" }}>
                      <Typography sx={{ fontWeight: 700 }}>{m.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {m.dose} · since {formatDate(m.since)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Section>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
```

```tsx components/Schedule.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AlertChips from "./AlertChips";
import {
  appointments as seedAppointments,
  DAY_END,
  endTime,
  findClash,
  formatLongDate,
  formatTime,
  fromMinutes,
  getOwner,
  getPatient,
  getVet,
  nextFreeStart,
  nowMinutes,
  patients,
  statusLabel,
  toMinutes,
  today,
  vets,
} from "@/lib/data";
import type { Appointment, Status } from "@/lib/data";

/* ------------------------------------------------------------------ */
/* small pieces                                                        */
/* ------------------------------------------------------------------ */

function StatusChip({ status }: { status: Status }) {
  const label = statusLabel[status];
  switch (status) {
    case "booked":
      return <Chip size="small" variant="outlined" icon={<ScheduleIcon />} label={label} />;
    case "checked_in":
      return <Chip size="small" color="warning" icon={<HowToRegIcon />} label={label} />;
    case "in_exam":
      return <Chip size="small" color="primary" icon={<MedicalServicesIcon />} label={label} />;
    case "done":
      return <Chip size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} label={label} />;
    default:
      return <Chip size="small" variant="outlined" icon={<BlockIcon />} label={label} sx={{ color: "text.secondary" }} />;
  }
}

function waitText(minutes: number): string {
  if (minutes <= 0) return "Just arrived";
  return `Waiting ${minutes} min`;
}

function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: string; tone?: "warning" | "primary" }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: 1 }}>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4, display: "block" }}>
        {label}
      </Typography>
      <Typography component="p" sx={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, color: tone ? `${tone}.main` : "text.primary" }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* waiting list                                                        */
/* ------------------------------------------------------------------ */

function WaitingList({ appts, now }: { appts: Appointment[]; now: number }) {
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => toMinutes(a.checkedInAt ?? a.start) - toMinutes(b.checkedInAt ?? b.start));

  return (
    <Paper variant="outlined" component="section" aria-labelledby="waiting-title" sx={{ overflow: "hidden" }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography id="waiting-title" variant="h6" component="h2">
          Waiting room
        </Typography>
        <Chip size="small" color={waiting.length > 0 ? "warning" : "default"} label={`${waiting.length} waiting`} />
      </Stack>
      {waiting.length === 0 ? (
        <Typography color="text.secondary" sx={{ p: 2 }}>
          Nobody is waiting. Check a patient in when they arrive.
        </Typography>
      ) : (
        <Box component="ol" sx={{ m: 0, p: 0, listStyle: "none" }}>
          {waiting.map((a, i) => {
            const patient = getPatient(a.patient);
            if (!patient) return null;
            const vet = getVet(a.vet);
            const minutes = now - toMinutes(a.checkedInAt ?? a.start);
            const long = minutes >= 30;
            return (
              <Box component="li" key={a.id} sx={{ px: 2, py: 1.5, borderBottom: i < waiting.length - 1 ? 1 : 0, borderColor: "divider", display: "flex", gap: 1.5 }}>
                <Box
                  aria-hidden
                  sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 800, bgcolor: i === 0 ? "primary.main" : "action.selected", color: i === 0 ? "primary.contrastText" : "text.primary" }}
                >
                  {i + 1}
                </Box>
                <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                    <Typography component="div" sx={{ fontWeight: 700 }}>
                      <Box component={NextLink} href={`/patients/${patient.id}`} sx={{ color: "inherit" }}>
                        {patient.name}
                      </Box>{" "}
                      <Typography component="span" variant="body2" color="text.secondary">
                        {getOwner(patient.owner).name}
                      </Typography>
                    </Typography>
                    <Typography component="span" sx={{ fontWeight: 800, color: long ? "error.main" : "warning.main" }}>
                      {waitText(minutes)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {i === 0 && (
                      <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                        Up next ·{" "}
                      </Box>
                    )}
                    {a.reason} · {formatTime(a.start)} with {vet.name} ({vet.room})
                  </Typography>
                  <AlertChips alerts={patient.alerts} />
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}

/* ------------------------------------------------------------------ */
/* appointment row                                                     */
/* ------------------------------------------------------------------ */

function AppointmentRow({ a, now, highlight, onCheckIn }: { a: Appointment; now: number; highlight: boolean; onCheckIn: (a: Appointment) => void }) {
  const patient = getPatient(a.patient);
  if (!patient) return null;
  const owner = getOwner(patient.owner);
  const vet = getVet(a.vet);
  const inactive = a.status === "done" || a.status === "cancelled";
  const urgent = a.urgent && !inactive;

  return (
    <Box
      component="li"
      data-appointment={a.id}
      data-status={a.status}
      sx={{
        display: "grid",
        columnGap: 2,
        rowGap: 1,
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        borderLeft: 5,
        borderLeftColor: urgent ? "error.main" : a.status === "in_exam" ? "primary.main" : a.status === "checked_in" ? "warning.main" : "transparent",
        bgcolor: urgent
          ? "color-mix(in srgb, var(--mui-palette-error-main) 9%, transparent)"
          : highlight
            ? "color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent)"
            : inactive
              ? "action.hover"
              : "transparent",
        transition: "background-color .4s",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gridTemplateAreas: '"time status" "patient patient" "reason reason" "vet action"',
        alignItems: "center",
        "@container sched (min-width: 800px)": {
          gridTemplateColumns: "88px minmax(0, 1.5fr) minmax(0, 1.3fr) minmax(0, 1fr) 124px 128px",
          gridTemplateAreas: '"time patient reason vet status action"',
          alignItems: "start",
        },
      }}
    >
      <Box sx={{ gridArea: "time", display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap", "@container sched (min-width: 800px)": { display: "block" } }}>
        <Typography component="time" sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2, display: "block", textDecoration: a.status === "cancelled" ? "line-through" : "none" }}>
          {formatTime(a.start)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {a.minutes} min · to {formatTime(endTime(a))}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "patient", minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17, lineHeight: 1.3 }}>
          <Box component={NextLink} href={`/patients/${patient.id}`} sx={{ color: "inherit", textDecorationColor: "var(--mui-palette-divider)", textUnderlineOffset: 3 }}>
            {patient.name}
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {patient.species}, {patient.breed}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Owner: {owner.name}
        </Typography>
        {patient.alerts.length > 0 && (
          <Box sx={{ mt: 0.75 }}>
            <AlertChips alerts={patient.alerts} />
          </Box>
        )}
      </Box>

      <Box sx={{ gridArea: "reason", minWidth: 0 }}>
        {urgent && (
          <Chip size="small" color="error" variant="outlined" icon={<PriorityHighIcon />} label="Urgent" sx={{ mb: 0.5, fontWeight: 800, borderWidth: 2 }} />
        )}
        <Typography sx={{ textDecoration: a.status === "cancelled" ? "line-through" : "none", color: a.status === "cancelled" ? "text.secondary" : "text.primary" }}>{a.reason}</Typography>
      </Box>

      <Box sx={{ gridArea: "vet", minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {vet.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {vet.room}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "status", justifySelf: "end", "@container sched (min-width: 800px)": { justifySelf: "start" } }}>
        <StatusChip status={a.status} />
      </Box>

      <Box sx={{ gridArea: "action", justifySelf: "end", "@container sched (min-width: 800px)": { justifySelf: "stretch" } }}>
        {a.status === "booked" && (
          <Button variant="contained" startIcon={<HowToRegIcon />} onClick={() => onCheckIn(a)} aria-label={`Check in ${patient.name}`} sx={{ whiteSpace: "nowrap", "@container sched (min-width: 800px)": { width: 1 } }}>
            Check in
          </Button>
        )}
        {a.status === "checked_in" && (
          <Typography variant="body2" sx={{ fontWeight: 700, color: "warning.main", textAlign: "right" }}>
            {waitText(now - toMinutes(a.checkedInAt ?? a.start))}
          </Typography>
        )}
        {a.status === "in_exam" && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
            With {vet.name}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* booking dialog                                                      */
/* ------------------------------------------------------------------ */

const durations = [15, 20, 30, 45, 60];

function BookDialog({
  appts,
  now,
  defaultVet,
  onClose,
  onBook,
}: {
  appts: Appointment[];
  now: number;
  defaultVet: string;
  onClose: () => void;
  onBook: (a: Appointment) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [patientId, setPatientId] = React.useState("");
  const [vetId, setVetId] = React.useState(defaultVet);
  const [start, setStart] = React.useState(() => fromMinutes(Math.min(Math.ceil((now + 1) / 15) * 15, DAY_END - 15)));
  const [minutes, setMinutes] = React.useState(20);
  const [reason, setReason] = React.useState("Follow-up");

  const patient = getPatient(patientId);
  const ready = Boolean(patient && vetId && start && reason.trim());
  const slot = { vet: vetId, patient: patientId, start, minutes };
  const clash = ready ? findClash(appts, slot) : undefined;
  const pastClose = ready && toMinutes(start) + minutes > DAY_END;
  const suggestion = clash ? nextFreeStart(appts, slot) : undefined;
  const canSave = ready && !clash && !pastClose;

  let problem = "";
  if (clash) {
    const c = clash.appointment;
    const cp = getPatient(c.patient);
    problem =
      clash.kind === "vet"
        ? `${getVet(c.vet).name} already has ${cp?.name ?? "a patient"} from ${formatTime(c.start)} to ${formatTime(endTime(c))}.`
        : `${patient?.name} already has an appointment from ${formatTime(c.start)} to ${formatTime(endTime(c))} with ${getVet(c.vet).name}.`;
  } else if (pastClose) {
    problem = `That visit would run past closing time (${formatTime(fromMinutes(DAY_END))}).`;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onBook({ id: `a-${String(100 + appts.length + 1)}`, patient: patientId, vet: vetId, start, minutes, reason: reason.trim(), status: "booked" });
  };

  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="book-title">
      <Box component="form" onSubmit={submit} noValidate sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
        <DialogTitle id="book-title" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
          Book an appointment
          <IconButton aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              select
              required
              label="Patient"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              slotProps={{
                select: {
                  renderValue: (v) => {
                    const p = getPatient(String(v));
                    return p ? `${p.name} · ${getOwner(p.owner).name}` : "";
                  },
                },
              }}
            >
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id} sx={{ minHeight: 48 }}>
                  <Stack>
                    <Typography sx={{ fontWeight: 600 }}>
                      {p.name}{" "}
                      <Typography component="span" variant="body2" color="text.secondary">
                        {p.species}, {getOwner(p.owner).name}
                      </Typography>
                    </Typography>
                    {p.alerts.length > 0 && (
                      <Typography variant="caption" sx={{ color: "error.main", fontWeight: 700 }}>
                        Alert: {p.alerts.join(", ")}
                      </Typography>
                    )}
                  </Stack>
                </MenuItem>
              ))}
            </TextField>

            {patient && patient.alerts.length > 0 && (
              <Alert severity="error" variant="filled" icon={false} sx={{ fontWeight: 700 }}>
                Medical alert for {patient.name}: {patient.alerts.join("; ")}
              </Alert>
            )}

            <TextField select required label="Vet" value={vetId} onChange={(e) => setVetId(e.target.value)}>
              {vets.map((v) => (
                <MenuItem key={v.id} value={v.id} sx={{ minHeight: 48 }}>
                  {v.name} · {v.room}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                label="Time"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 300, min: "08:00", max: "17:00" } }}
              />
              <TextField select label="Length" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} fullWidth>
                {durations.map((d) => (
                  <MenuItem key={d} value={d} sx={{ minHeight: 48 }}>
                    {d} minutes
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField required label="Reason for visit" value={reason} onChange={(e) => setReason(e.target.value)} />

            {problem && (
              <Alert
                severity="error"
                role="alert"
                action={
                  suggestion && !pastClose ? (
                    <Button color="inherit" size="small" onClick={() => setStart(suggestion)} sx={{ whiteSpace: "nowrap" }}>
                      Use {formatTime(suggestion)}
                    </Button>
                  ) : undefined
                }
              >
                <strong>Can&apos;t book that time.</strong> {problem}
                {suggestion && !pastClose ? ` The next free time is ${formatTime(suggestion)}.` : ""}
              </Alert>
            )}
            {canSave && patient && (
              <Typography variant="body2" color="text.secondary">
                {getVet(vetId).name} is free from {formatTime(start)} to {formatTime(fromMinutes(toMinutes(start) + minutes))}.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!canSave} startIcon={<AddIcon />}>
            Book appointment
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

type Toast = { message: string; undo?: () => void };

export default function Schedule() {
  const [appts, setAppts] = React.useState<Appointment[]>(seedAppointments);
  const [now, setNow] = React.useState(nowMinutes);
  const [vetFilter, setVetFilter] = React.useState<string>("all");
  const [booking, setBooking] = React.useState(false);
  const [toast, setToast] = React.useState<Toast | null>(null);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = window.setInterval(() => setNow((n) => n + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const showToast = (t: Toast) => {
    setToast(t);
    setToastOpen(true);
  };

  const checkIn = (a: Appointment) => {
    setAppts((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: "checked_in", checkedInAt: fromMinutes(now) } : x)));
    const p = getPatient(a.patient);
    showToast({
      message: `${p?.name ?? "Patient"} is checked in and on the waiting list.`,
      undo: () => setAppts((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: "booked", checkedInAt: undefined } : x))),
    });
  };

  const book = (a: Appointment) => {
    setAppts((prev) => [...prev, a]);
    setBooking(false);
    setHighlight(a.id);
    window.setTimeout(() => setHighlight(null), 4000);
    const p = getPatient(a.patient);
    showToast({ message: `Booked ${p?.name ?? "patient"} with ${getVet(a.vet).name} at ${formatTime(a.start)}.` });
    setVetFilter("all");
  };

  const sorted = React.useMemo(
    () => [...appts].sort((x, y) => toMinutes(x.start) - toMinutes(y.start) || x.vet.localeCompare(y.vet)),
    [appts],
  );
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);

  const active = appts.filter((a) => a.status !== "cancelled");
  const count = (s: Status) => appts.filter((a) => a.status === s).length;
  const nextArrival = sorted.find((a) => a.status === "booked" && toMinutes(a.start) >= now - 15);
  const nextPatient = nextArrival ? getPatient(nextArrival.patient) : undefined;

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "flex-end" }, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" component="h1">
            Today&apos;s schedule
          </Typography>
          <Typography color="text.secondary">
            {formatLongDate(today)} · {active.length} appointments across 3 vets
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setBooking(true)}>
          Book appointment
        </Button>
      </Stack>

      <Grid container spacing={2} component="section" aria-label="Today at a glance">
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat label="Waiting" value={count("checked_in")} tone={count("checked_in") > 0 ? "warning" : undefined} hint="Checked in, not yet seen" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat label="In exam" value={count("in_exam")} tone="primary" hint="With a vet right now" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat label="Still to arrive" value={count("booked")} hint={nextPatient && nextArrival ? `Next: ${nextPatient.name} at ${formatTime(nextArrival.start)}` : "No more bookings today"} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stat label="Done" value={count("done")} hint={count("cancelled") > 0 ? `${count("cancelled")} cancelled` : undefined} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 1, lg: 2 }, position: { lg: "sticky" }, top: { lg: 112 } }}>
          <WaitingList appts={appts} now={now} />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 2, lg: 1 }, minWidth: 0 }}>
          <Paper variant="outlined" component="section" aria-labelledby="sched-title" sx={{ overflow: "hidden", containerType: "inline-size", containerName: "sched" }}>
            <Stack spacing={1.5} sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography id="sched-title" variant="h6" component="h2">
                All appointments
              </Typography>
              <Stack direction="row" role="group" aria-label="Filter by vet" sx={{ gap: 1, flexWrap: "wrap" }}>
                {[{ id: "all", label: "All vets", n: appts.length }, ...vets.map((v) => ({ id: v.id, label: `${v.name} · ${v.room}`, n: appts.filter((a) => a.vet === v.id).length }))].map((f) => (
                  <Chip
                    key={f.id}
                    label={`${f.label} (${f.n})`}
                    onClick={() => setVetFilter(f.id)}
                    color={vetFilter === f.id ? "primary" : "default"}
                    variant={vetFilter === f.id ? "filled" : "outlined"}
                    aria-pressed={vetFilter === f.id}
                    sx={{ height: 40, borderRadius: 5, px: 0.5 }}
                  />
                ))}
              </Stack>
            </Stack>
            <Box
              aria-hidden
              sx={{
                display: "none",
                px: 2,
                py: 1,
                pl: "21px",
                columnGap: 2,
                bgcolor: "action.hover",
                borderBottom: 1,
                borderColor: "divider",
                color: "text.secondary",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                "@container sched (min-width: 800px)": { display: "grid", gridTemplateColumns: "88px minmax(0, 1.5fr) minmax(0, 1.3fr) minmax(0, 1fr) 124px 128px" },
              }}
            >
              <span>Time</span>
              <span>Patient</span>
              <span>Reason</span>
              <span>Vet</span>
              <span>Status</span>
              <span />
            </Box>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", "& > li:last-of-type": { borderBottom: 0 } }}>
              {visible.map((a) => (
                <AppointmentRow key={a.id} a={a} now={now} highlight={highlight === a.id} onCheckIn={checkIn} />
              ))}
            </Box>
            {visible.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 2 }}>
                No appointments for this vet today.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {booking && <BookDialog appts={appts} now={now} defaultVet={vetFilter === "all" ? "" : vetFilter} onClose={() => setBooking(false)} onBook={book} />}

      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setToastOpen(false);
        }}
        message={toast?.message}
        action={
          toast?.undo ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                toast.undo?.();
                setToastOpen(false);
              }}
            >
              Undo
            </Button>
          ) : undefined
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Stack>
  );
}
```

```tsx components/WeightChart.tsx
"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { formatDate } from "@/lib/data";
import type { Weight } from "@/lib/data";

export default function WeightChart({ weights }: { weights: Weight[] }) {
  const dates = weights.map((w) => new Date(`${w.date}T00:00:00Z`));
  const values = weights.map((w) => w.kg);
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  return (
    <LineChart
      height={280}
      hideLegend
      grid={{ horizontal: true }}
      margin={{ left: 4, right: 16, top: 16, bottom: 8 }}
      xAxis={[
        {
          scaleType: "time",
          data: dates,
          tickMinStep: 1000 * 60 * 60 * 24 * 60,
          valueFormatter: (d: Date) => formatDate(d.toISOString().slice(0, 10)),
        },
      ]}
      yAxis={[{ min, max, width: 48, valueFormatter: (v: number | null) => (v == null ? "" : `${v} kg`) }]}
      series={[
        {
          data: values,
          label: "Weight",
          color: "var(--mui-palette-primary-main)",
          showMark: true,
          valueFormatter: (v: number | null) => (v == null ? "" : `${v.toFixed(1)} kg`),
        },
      ]}
      aria-label="Line chart of Olive's weight in kilograms at each visit, falling from 31.8 kg in May 2025 to 28.6 kg today"
    />
  );
}
```

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
  /** Time the patient was checked in (HH:MM), only for checked-in patients. */
  checkedInAt?: string;
}

export interface Weight {
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
export interface PatientRecordData {
  weights_kg: Weight[];
  vaccinations: Vaccination[];
  medications: Medication[];
  visits: Visit[];
}

export const clinic = "Pawpoint, front-desk and records software for Hillside Veterinary Clinic";
export const today = "2026-11-12";
/** The front-desk clock for the demo day, as minutes after midnight (09:52). */
export const nowMinutes = 9 * 60 + 52;

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
  { id: "a-05", patient: "p-107", vet: "v-2", start: "09:15", minutes: 20, reason: "Glucose curve", status: "checked_in", checkedInAt: "09:08" },
  { id: "a-06", patient: "p-105", vet: "v-1", start: "09:45", minutes: 20, reason: "Beak and nail trim", status: "checked_in", checkedInAt: "09:40" },
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

export const statusLabel: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

export function getPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}
export function getOwner(id: string): Owner {
  return owners.find((o) => o.id === id) ?? { id, name: "Unknown owner", phone: "" };
}
export function getVet(id: string): Vet {
  return vets.find((v) => v.id === id) ?? { id, name: "Unassigned", room: "" };
}

/* ---------- time and date helpers (no time zones: plain calendar maths) ---------- */

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function formatTime(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}
export function endTime(a: { start: string; minutes: number }): string {
  return fromMinutes(toMinutes(a.start) + a.minutes);
}

function utc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((utc(toIso) - utc(fromIso)) / 86_400_000);
}
export function formatDate(iso: string, withYear = true): string {
  return new Date(utc(iso)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}
export function formatLongDate(iso: string): string {
  return new Date(utc(iso)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
export function formatShortWeekday(iso: string): string {
  return new Date(utc(iso)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
export function ageText(born: string, onDate: string = today): string {
  const [by, bm, bd] = born.split("-").map(Number);
  const [ty, tm, td] = onDate.split("-").map(Number);
  let months = (ty - by) * 12 + (tm - bm);
  if (td < bd) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}
export function formatMoney(usd: number): string {
  return usd.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* ---------- scheduling rules ---------- */

export interface Slot {
  vet: string;
  patient: string;
  start: string;
  minutes: number;
}

/** Active (not cancelled) appointment that overlaps the slot for the same vet or the same patient. */
export function findClash(list: Appointment[], slot: Slot): { appointment: Appointment; kind: "vet" | "patient" } | undefined {
  const s = toMinutes(slot.start);
  const e = s + slot.minutes;
  for (const a of list) {
    if (a.status === "cancelled") continue;
    const as = toMinutes(a.start);
    const ae = as + a.minutes;
    if (s < ae && as < e) {
      if (a.vet === slot.vet) return { appointment: a, kind: "vet" };
      if (a.patient === slot.patient) return { appointment: a, kind: "patient" };
    }
  }
  return undefined;
}

export const DAY_START = 8 * 60;
export const DAY_END = 17 * 60;

export const timeOptions: string[] = (() => {
  const out: string[] = [];
  for (let t = DAY_START; t < DAY_END; t += 15) out.push(fromMinutes(t));
  return out;
})();

export function nextFreeStart(list: Appointment[], slot: Slot): string | undefined {
  for (let t = toMinutes(slot.start); t + slot.minutes <= DAY_END; t += 5) {
    const candidate = { ...slot, start: fromMinutes(t) };
    if (!findClash(list, candidate)) return candidate.start;
  }
  return undefined;
}

export function searchPatients(query: string): Patient[] {
  const q = query.trim().toLowerCase();
  if (!q) return patients;
  return patients.filter((p) => p.name.toLowerCase().includes(q) || getOwner(p.owner).name.toLowerCase().includes(q));
}
```

