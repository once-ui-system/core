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
