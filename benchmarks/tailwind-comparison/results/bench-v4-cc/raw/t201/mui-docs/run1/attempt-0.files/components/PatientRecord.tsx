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
