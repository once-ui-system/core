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
