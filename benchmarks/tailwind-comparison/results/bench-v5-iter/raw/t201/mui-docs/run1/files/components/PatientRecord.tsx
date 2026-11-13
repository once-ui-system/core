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
