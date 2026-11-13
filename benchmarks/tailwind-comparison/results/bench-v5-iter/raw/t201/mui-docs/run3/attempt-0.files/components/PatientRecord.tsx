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
