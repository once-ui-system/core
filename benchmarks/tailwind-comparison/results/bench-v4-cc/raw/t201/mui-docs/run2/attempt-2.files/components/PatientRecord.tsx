"use client";

import * as React from "react";
import NextLink from "next/link";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PetsIcon from "@mui/icons-material/Pets";
import PhoneIcon from "@mui/icons-material/Phone";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { AlertChips } from "@/components/AlertChips";
import { StatusChip } from "@/components/StatusChip";
import { WeightChart } from "@/components/WeightChart";
import { srOnly, tint } from "@/components/ui";
import {
  TODAY,
  ageOn,
  appointments,
  daysBetween,
  fmtClock,
  fmtDate,
  fmtUsd,
  ownerById,
  records,
  toMinutes,
  vetById,
  type Patient,
  type Vaccination,
} from "@/lib/data";

type VaccineState = { kind: "overdue" | "soon" | "ok"; days: number };

function vaccineState(v: Vaccination): VaccineState {
  const d = daysBetween(TODAY, v.due);
  if (d < 0) return { kind: "overdue", days: -d };
  if (d <= 30) return { kind: "soon", days: d };
  return { kind: "ok", days: d };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Paper component="section" variant="outlined" aria-labelledby={id} sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Typography id={id} variant="h6" component="h2" sx={{ fontWeight: 800, mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        component="dt"
        sx={{ display: "block", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}
      >
        {label}
      </Typography>
      <Typography component="dd" sx={{ m: 0 }}>
        {children}
      </Typography>
    </Box>
  );
}

function VaccineChip({ state }: { state: VaccineState }) {
  if (state.kind === "overdue") {
    return (
      <Chip
        size="small"
        color="error"
        icon={<WarningAmberIcon />}
        label={`Overdue by ${state.days} ${state.days === 1 ? "day" : "days"}`}
        sx={{ fontWeight: 800 }}
      />
    );
  }
  if (state.kind === "soon") {
    return <Chip size="small" color="warning" icon={<ScheduleIcon />} label={`Due in ${state.days} days`} sx={{ fontWeight: 700 }} />;
  }
  return <Chip size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} label="Up to date" />;
}

const bigNumber = { fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.1 } as const;

export function PatientRecord({ patient }: { patient: Patient }) {
  const owner = ownerById(patient.owner);
  const record = records[patient.id];
  const todays = appointments.filter((a) => a.patient === patient.id && a.status !== "cancelled");
  const overdue = record ? record.vaccinations.filter((v) => vaccineState(v).kind === "overdue") : [];

  const weights = record?.weights_kg ?? [];
  const first = weights[0];
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const change = first && last ? last.kg - first.kg : 0;
  const changePct = first && last ? (change / first.kg) * 100 : 0;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button component={NextLink} href="/" startIcon={<ArrowBackIcon />} sx={{ ml: -1, minHeight: 44 }}>
          Today&apos;s schedule
        </Button>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ alignItems: { sm: "center" } }}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <PetsIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontSize: { xs: "2rem", sm: "2.5rem" }, lineHeight: 1.1 }}>
            {patient.name}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "1.05rem" }}>
            {patient.species}, {patient.breed} · {ageOn(patient.born, TODAY)} · {patient.sex}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<PhoneIcon />}
          component="a"
          href={`tel:${owner.phone.replace(/\s/g, "")}`}
          sx={{ minHeight: 48 }}
          aria-label={`Call ${owner.name} on ${owner.phone}`}
        >
          Call {owner.name.split(" ")[0]}
        </Button>
      </Stack>

      {patient.alerts.length > 0 && (
        <Alert
          severity="error"
          variant="filled"
          icon={<WarningAmberIcon fontSize="large" />}
          sx={{ alignItems: "center", "& .MuiAlert-message": { width: 1 } }}
        >
          <AlertTitle sx={{ fontWeight: 800, fontSize: "1.1rem" }}>Medical alerts for {patient.name}</AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: "1.15rem", fontWeight: 700 }}>
            {patient.alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </Box>
        </Alert>
      )}

      {overdue.length > 0 && (
        <Alert severity="warning" variant="outlined" icon={<WarningAmberIcon />} sx={{ borderWidth: 2 }}>
          <AlertTitle sx={{ fontWeight: 800 }}>
            {overdue.length} {overdue.length === 1 ? "vaccination is" : "vaccinations are"} overdue
          </AlertTitle>
          {overdue.map((v) => `${v.name} (due ${fmtDate(v.due)})`).join(", ")}. Offer to book it while the owner is here.
        </Alert>
      )}

      {todays.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: tint("primary", 7) }}>
          <Typography variant="subtitle2" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
            At the clinic today
          </Typography>
          <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {todays.map((a) => (
              <Stack key={a.id} component="li" direction="row" spacing={1.5} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 800 }}>{fmtClock(toMinutes(a.start))}</Typography>
                <Typography>{a.reason}</Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {vetById(a.vet).name} · {vetById(a.vet).room}
                </Typography>
                <StatusChip status={a.status} />
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 7fr)" },
        }}
      >
        <Stack spacing={2.5}>
          <Section id="details-title" title="Patient and owner">
            <Box component="dl" sx={{ m: 0, display: "grid", gap: 1.75, gridTemplateColumns: "1fr 1fr" }}>
              <Fact label="Species">{patient.species}</Fact>
              <Fact label="Breed">{patient.breed}</Fact>
              <Fact label="Born">{fmtDate(patient.born)}</Fact>
              <Fact label="Age">{ageOn(patient.born, TODAY)}</Fact>
              <Fact label="Sex">{patient.sex}</Fact>
              <Fact label="Patient ID">{patient.id}</Fact>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box component="dl" sx={{ m: 0, display: "grid", gap: 1.75, gridTemplateColumns: "1fr 1fr" }}>
              <Fact label="Owner">{owner.name}</Fact>
              <Fact label="Phone">
                <a href={`tel:${owner.phone.replace(/\s/g, "")}`} style={{ color: "inherit" }}>
                  {owner.phone}
                </a>
              </Fact>
            </Box>
            {patient.alerts.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, mb: 0.75 }}
                >
                  Alerts
                </Typography>
                <AlertChips alerts={patient.alerts} size="medium" />
              </>
            )}
          </Section>

          <Section id="meds-title" title="Current medications">
            {record && record.medications.length > 0 ? (
              <Stack component="ul" divider={<Divider flexItem />} spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
                {record.medications.map((m) => (
                  <Box component="li" key={m.name}>
                    <Typography sx={{ fontWeight: 700 }}>{m.name}</Typography>
                    <Typography variant="body2">{m.dose}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Since {fmtDate(m.since)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No current medications on file.</Typography>
            )}
          </Section>

          <Section id="vax-title" title="Vaccinations">
            {record ? (
              <TableContainer>
                <Table size="small" aria-labelledby="vax-title">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vaccine</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Given</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {record.vaccinations.map((v) => {
                      const state = vaccineState(v);
                      return (
                        <TableRow
                          key={v.name}
                          sx={{ bgcolor: state.kind === "overdue" ? tint("error", 10) : undefined, "&:last-child td": { borderBottom: 0 } }}
                        >
                          <TableCell component="th" scope="row" sx={{ fontWeight: 700 }}>
                            {v.name}
                          </TableCell>
                          <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{fmtDate(v.given)}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{fmtDate(v.due)}</TableCell>
                          <TableCell>
                            <VaccineChip state={state} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No vaccination history on file.</Typography>
            )}
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
              Checked against today, {fmtDate(TODAY)}.
            </Typography>
          </Section>
        </Stack>

        <Stack spacing={2.5}>
          <Section id="weight-title" title="Weight trend">
            {record && first && last ? (
              <>
                <Stack direction="row" spacing={3} useFlexGap sx={{ mb: 1, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Latest, {fmtDate(last.date)}
                    </Typography>
                    <Typography sx={bigNumber}>{last.kg.toFixed(1)} kg</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Since {fmtDate(first.date)}
                    </Typography>
                    <Typography sx={{ ...bigNumber, color: change < 0 ? "warning.main" : "text.primary" }}>
                      {change > 0 ? "+" : "−"}
                      {Math.abs(change).toFixed(1)} kg
                      <Typography component="span" sx={{ color: "text.secondary", fontSize: "1rem", fontWeight: 500 }}>
                        {" "}
                        ({Math.abs(changePct).toFixed(1)}%)
                      </Typography>
                    </Typography>
                  </Box>
                  {prev && (
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Since last visit
                      </Typography>
                      <Typography sx={bigNumber}>
                        {last.kg - prev.kg > 0 ? "+" : "−"}
                        {Math.abs(last.kg - prev.kg).toFixed(1)} kg
                      </Typography>
                    </Box>
                  )}
                </Stack>
                <WeightChart points={weights} name={patient.name} />
                <Box component="p" sx={srOnly}>
                  Weight readings: {weights.map((w) => `${fmtDate(w.date)}, ${w.kg} kilograms`).join("; ")}.
                </Box>
              </>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No weights recorded yet.</Typography>
            )}
          </Section>

          <Section id="visits-title" title="Visit history">
            {record && record.visits.length > 0 ? (
              <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
                {record.visits.map((v) => (
                  <Paper
                    component="li"
                    variant="outlined"
                    key={v.date}
                    sx={{ p: 1.75, borderLeft: 4, borderLeftColor: v.date === TODAY ? "primary.main" : "divider" }}
                  >
                    <Stack direction="row" spacing={2} useFlexGap sx={{ justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                      <Typography sx={{ fontWeight: 800 }}>
                        {fmtDate(v.date)}
                        {v.date === TODAY && <Chip size="small" color="primary" label="Today" sx={{ ml: 1, fontWeight: 700 }} />}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {vetById(v.vet).name} · {fmtUsd(v.invoice_usd)}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontWeight: 600, mt: 0.25 }}>{v.reason}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {v.notes}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No past visits on file for {patient.name}.</Typography>
            )}
          </Section>
        </Stack>
      </Box>
    </Stack>
  );
}
