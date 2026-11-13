"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DoneIcon from "@mui/icons-material/Done";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import {
  CHECKED_IN_AT,
  NOW_START,
  TODAY,
  appointments,
  fmtDate,
  fmtTime,
  ownerById,
  patientById,
  toMin,
  vetById,
  vets,
  type Appointment,
} from "@/lib/data";
import BookDialog from "./BookDialog";
import { PatientAlerts, StatusChip, tint, visuallyHidden } from "./ui";

type Row = Appointment & { checkedInAt?: number };

const initialRows: Row[] = appointments.map((a) => ({ ...a, checkedInAt: CHECKED_IN_AT[a.id] }));

const byTime = (a: Row, b: Row) => toMin(a.start) - toMin(b.start) || a.vet.localeCompare(b.vet);

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, px: 2 }}>
      <Typography variant="h1" component="p" sx={{ lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function ScheduleView() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [now, setNow] = useState(NOW_START);
  const [vetFilter, setVetFilter] = useState("all");
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => [...rows].sort(byTime), [rows]);
  const visible = sorted.filter((r) => vetFilter === "all" || r.vet === vetFilter);
  const waiting = rows
    .filter((r) => r.status === "checked_in")
    .sort((a, b) => (a.checkedInAt ?? toMin(a.start)) - (b.checkedInAt ?? toMin(b.start)));
  const nextBooked = sorted.find((r) => r.status === "booked");
  const count = (s: Row["status"]) => rows.filter((r) => r.status === s).length;

  function advance(row: Row) {
    const name = patientById(row.patient)?.name ?? "Patient";
    const next =
      row.status === "booked" ? "checked_in" : row.status === "checked_in" ? "in_exam" : row.status === "in_exam" ? "done" : null;
    if (!next) return;
    setRows((rs) =>
      rs.map((r) => (r.id === row.id ? { ...r, status: next, checkedInAt: next === "checked_in" ? now : r.checkedInAt } : r)),
    );
    setToast(
      next === "checked_in"
        ? `${name} is checked in and on the waiting list.`
        : next === "in_exam"
          ? `${name} has gone in to ${vetById(row.vet)?.room ?? "the exam room"}.`
          : `${name}'s visit is marked done.`,
    );
  }

  function actionFor(row: Row) {
    const name = patientById(row.patient)?.name ?? "patient";
    if (row.status === "booked")
      return (
        <Button variant="contained" size="large" startIcon={<HowToRegIcon />} onClick={() => advance(row)} aria-label={`Check in ${name}`}>
          Check in
        </Button>
      );
    if (row.status === "checked_in")
      return (
        <Button variant="outlined" size="large" startIcon={<PlayArrowIcon />} onClick={() => advance(row)} aria-label={`Send ${name} to exam`}>
          Start exam
        </Button>
      );
    if (row.status === "in_exam")
      return (
        <Button variant="outlined" size="large" startIcon={<DoneIcon />} onClick={() => advance(row)} aria-label={`Mark ${name} done`}>
          Mark done
        </Button>
      );
    return null;
  }

  function renderRow(row: Row) {
    const p = patientById(row.patient);
    const o = p ? ownerById(p.owner) : undefined;
    const v = vetById(row.vet);
    const inactive = row.status === "done" || row.status === "cancelled";
    const accent = row.urgent && !inactive ? "error-main" : row.status === "in_exam" ? "primary-main" : row.status === "checked_in" ? "info-main" : "divider";
    return (
      <Paper
        component="li"
        key={row.id}
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderLeft: 6,
          borderLeftColor: `var(--mui-palette-${accent})`,
          bgcolor: row.urgent && !inactive ? tint("error-main", 8) : "background.paper",
          display: "grid",
          columnGap: 2,
          rowGap: 0.75,
          alignItems: "center",
          gridTemplateColumns: { xs: "76px 1fr", md: "92px minmax(0,1.5fr) minmax(0,1.3fr) minmax(0,1fr) 150px" },
        }}
      >
        <Box sx={{ gridColumn: { xs: 1, md: "auto" }, gridRow: { xs: "span 4", md: "auto" }, alignSelf: { xs: "start", md: "center" } }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.125rem", fontVariantNumeric: "tabular-nums", color: inactive ? "text.secondary" : "text.primary" }}>
            {fmtTime(toMin(row.start))}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.minutes} min
          </Typography>
        </Box>

        <Box sx={{ gridColumn: { xs: 2, md: "auto" }, minWidth: 0 }}>
          <Typography component="div" sx={{ fontWeight: 700, fontSize: "1.0625rem" }}>
            <Link href={`/patients/${row.patient}`} style={{ color: "inherit" }}>
              {p?.name}
            </Link>{" "}
            <Typography component="span" variant="body2" color="text.secondary">
              {p?.species}, {p?.breed}
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Owner: {o?.name}
          </Typography>
          {p && p.alerts.length > 0 && (
            <Box sx={{ mt: 0.75 }}>
              <PatientAlerts alerts={p.alerts} />
            </Box>
          )}
        </Box>

        <Box sx={{ gridColumn: { xs: 2, md: "auto" }, minWidth: 0 }}>
          <Typography sx={{ textDecoration: row.status === "cancelled" ? "line-through" : "none" }}>
            {row.urgent && (
              <Chip
                size="small"
                color="error"
                icon={<ReportProblemIcon />}
                label="Urgent"
                sx={{ mr: 1, fontWeight: 800, verticalAlign: "middle" }}
              />
            )}
            {row.reason}
          </Typography>
        </Box>

        <Box sx={{ gridColumn: { xs: 2, md: "auto" } }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {v?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {v?.room}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "row", md: "column" }}
          spacing={1}
          sx={{ gridColumn: { xs: 2, md: "auto" }, alignItems: { xs: "center", md: "flex-end" }, justifyContent: { xs: "space-between", md: "center" }, flexWrap: "wrap" }}
          useFlexGap
        >
          <StatusChip status={row.status} />
          {row.id === freshId && <Chip size="small" color="primary" label="New" />}
          {actionFor(row)}
        </Stack>
      </Paper>
    );
  }

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, mb: 2.5, gap: 1.5 }}>
        <Box>
          <Typography variant="h1" component="h1">
            Today&apos;s schedule
          </Typography>
          <Typography color="text.secondary">{fmtDate(TODAY, "long")} · desk time {fmtTime(now)}</Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setBooking(true)}>
          Book appointment
        </Button>
      </Stack>

      <Grid container spacing={1.5} sx={{ mb: 2.5 }} component="section" aria-label="Today at a glance">
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stat label="Still to arrive" value={count("booked")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stat label="Waiting" value={count("checked_in")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stat label="In exam" value={count("in_exam")} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Stat label="Done" value={count("done")} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 1, lg: 2 } }}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 112 } }}>
            <Paper variant="outlined" component="section" aria-labelledby="waiting-title" sx={{ p: 2 }}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h2" component="h2" id="waiting-title">
                  Waiting room
                </Typography>
                <Chip label={`${waiting.length} waiting`} size="small" color={waiting.length ? "primary" : "default"} />
              </Stack>
              <Box aria-live="polite">
                {waiting.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 1 }}>
                    Nobody is waiting. Check in a patient from the schedule.
                  </Typography>
                ) : (
                  <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
                    {waiting.map((w, i) => {
                      const p = patientById(w.patient);
                      const mins = Math.max(0, now - (w.checkedInAt ?? toMin(w.start)));
                      return (
                        <Box
                          component="li"
                          key={w.id}
                          sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", p: 1.25, borderRadius: 2, bgcolor: tint("info-main", 10), border: 1, borderColor: "divider" }}
                        >
                          <Typography sx={{ fontWeight: 800, width: 22, pt: 0.125 }} aria-hidden>
                            {i + 1}
                          </Typography>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700 }}>
                              <Link href={`/patients/${w.patient}`} style={{ color: "inherit" }}>
                                {p?.name}
                              </Link>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {vetById(w.vet)?.name} · {vetById(w.vet)?.room}
                            </Typography>
                            {p && p.alerts.length > 0 && (
                              <Box sx={{ mt: 0.75 }}>
                                <PatientAlerts alerts={p.alerts} />
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                              <HourglassTopIcon fontSize="small" aria-hidden />
                              {mins} min
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              since {fmtTime(w.checkedInAt ?? toMin(w.start))}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Paper>

            {nextBooked && (
              <Paper variant="outlined" component="section" aria-labelledby="next-title" sx={{ p: 2, mt: 2 }}>
                <Typography variant="h2" component="h2" id="next-title" sx={{ mb: 1 }}>
                  Next to arrive
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {patientById(nextBooked.patient)?.name} · {fmtTime(toMin(nextBooked.start))}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {nextBooked.reason} with {vetById(nextBooked.vet)?.name}
                </Typography>
                {actionFor(nextBooked)}
              </Paper>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 2, lg: 1 } }}>
          <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, mb: 1.5, flexWrap: "wrap" }} useFlexGap>
            <Typography variant="h2" component="h2" sx={{ mr: "auto" }}>
              All appointments
              <Box component="span" sx={visuallyHidden}>
                {" "}
                ({visible.length} shown)
              </Box>
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={vetFilter}
              onChange={(_e, v: string | null) => {
                if (v) setVetFilter(v);
              }}
              aria-label="Filter by vet"
            >
              <ToggleButton value="all" sx={{ px: 2, minHeight: 40 }}>
                All vets
              </ToggleButton>
              {vets.map((v) => (
                <ToggleButton key={v.id} value={v.id} aria-label={v.name} sx={{ px: 2, minHeight: 40 }}>
                  {v.name.split(" ").slice(-1)[0]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1 }}>
            {visible.map(renderRow)}
          </Box>
          {visible.length === 0 && <Typography color="text.secondary">No appointments for this vet today.</Typography>}
        </Grid>
      </Grid>

      {booking && (
        <BookDialog
          rows={rows}
          now={now}
          onClose={() => setBooking(false)}
          onBook={(a) => {
            setRows((rs) => [...rs, a]);
            setBooking(false);
            setFreshId(a.id);
            setToast(
              `Booked ${patientById(a.patient)?.name} with ${vetById(a.vet)?.name} at ${fmtTime(toMin(a.start))}.`,
            );
          }}
        />
      )}

      <Snackbar open={toast !== null} autoHideDuration={5000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setToast(null)} sx={{ width: "100%" }}>
          {toast}
        </Alert>
      </Snackbar>
    </>
  );
}
