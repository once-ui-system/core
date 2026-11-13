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
