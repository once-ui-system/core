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
