"use client";

import AccessTime from "@mui/icons-material/AccessTime";
import Add from "@mui/icons-material/Add";
import Login from "@mui/icons-material/Login";
import MeetingRoomOutlined from "@mui/icons-material/MeetingRoomOutlined";
import PlayArrow from "@mui/icons-material/PlayArrow";
import PriorityHigh from "@mui/icons-material/PriorityHigh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import * as React from "react";
import AlertChips, { errorTint } from "@/components/AlertChips";
import BookingDialog from "@/components/BookingDialog";
import StatusChip from "@/components/StatusChip";
import {
  APPOINTMENTS,
  CHECKED_IN_AT,
  START_NOW,
  TODAY,
  VETS,
  fmtClock,
  fmtDate,
  fmtDuration,
  mustPatient,
  ownerOf,
  toMinutes,
  vetOf,
  type Appointment,
} from "@/lib/data";

const LONG_WAIT = 30;

function initialArrivals(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, t] of Object.entries(CHECKED_IN_AT)) out[id] = toMinutes(t);
  return out;
}

export default function Schedule() {
  const [appts, setAppts] = React.useState<Appointment[]>(APPOINTMENTS);
  const [arrivals, setArrivals] = React.useState<Record<string, number>>(initialArrivals);
  const [now, setNow] = React.useState(START_NOW);
  const [filter, setFilter] = React.useState("all");
  const [bookOpen, setBookOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => setNow(START_NOW + Math.floor((Date.now() - t0) / 60000)), 10000);
    return () => window.clearInterval(id);
  }, []);

  const sorted = React.useMemo(
    () => [...appts].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [appts],
  );
  const visible = filter === "all" ? sorted : sorted.filter((a) => a.vet === filter);
  const waiting = appts
    .filter((a) => a.status === "checked_in")
    .sort((a, b) => (arrivals[a.id] ?? now) - (arrivals[b.id] ?? now));
  const count = (s: Appointment["status"]) => appts.filter((a) => a.status === s).length;
  const urgent = sorted.filter((a) => a.urgent && (a.status === "booked" || a.status === "checked_in"));

  const checkIn = (a: Appointment) => {
    setAppts((list) => list.map((x) => (x.id === a.id ? { ...x, status: "checked_in" } : x)));
    setArrivals((m) => ({ ...m, [a.id]: now }));
    const p = mustPatient(a.patient);
    setToast(`${p.name} is checked in and on the waiting list${p.alerts.length ? `. Alert: ${p.alerts.join("; ")}` : ""}`);
  };
  const startExam = (a: Appointment) => {
    setAppts((list) => list.map((x) => (x.id === a.id ? { ...x, status: "in_exam" } : x)));
    setToast(`${mustPatient(a.patient).name} sent to ${vetOf(a.vet).room}`);
  };
  const book = (draft: Omit<Appointment, "id" | "status">) => {
    const id = `a-${String(appts.length + 1).padStart(2, "0")}`;
    setAppts((list) => [...list, { ...draft, id, status: "booked" }]);
    setBookOpen(false);
    setToast(`Booked ${mustPatient(draft.patient).name} with ${vetOf(draft.vet).name} at ${fmtClock(toMinutes(draft.start))}`);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 2.5 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Today&apos;s schedule
          </Typography>
          <Typography color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            {fmtDate(TODAY)} · <AccessTime fontSize="small" /> It is {fmtClock(now)} · {appts.filter((a) => a.status !== "cancelled").length} appointments, 3 vets
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<Add />} onClick={() => setBookOpen(true)} sx={{ minHeight: 48 }}>
          Book appointment
        </Button>
      </Stack>

      <Grid container spacing={1.5} sx={{ mb: 2.5 }} component="ul" aria-label="Clinic status" style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 20 }}>
        {[
          { label: "Waiting now", value: waiting.length, tone: "warning.main" },
          { label: "In exam", value: count("in_exam"), tone: "info.main" },
          { label: "Still to arrive", value: count("booked"), tone: "text.primary" },
          { label: "Done today", value: count("done"), tone: "success.main" },
        ].map((s) => (
          <Grid key={s.label} component="li" size={{ xs: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%", borderLeft: 5, borderLeftColor: s.tone }}>
              <Typography variant="h4" component="p" sx={{ lineHeight: 1 }}>
                {s.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {urgent.map((a) => {
        const p = mustPatient(a.patient);
        return (
          <Alert key={a.id} severity="error" icon={<PriorityHigh />} sx={{ mb: 2, fontWeight: 600, border: 1, borderColor: "error.main" }}>
            Urgent visit: {p.name} ({ownerOf(p).name}) at {fmtClock(toMinutes(a.start))} with {vetOf(a.vet).name}. {a.reason}.
          </Alert>
        );
      })}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }} sx={{ order: { xs: 0, lg: 1 } }}>
          <Paper variant="outlined" sx={{ p: 2, position: { lg: "sticky" }, top: { lg: 96 } }} component="section" aria-labelledby="waiting-title">
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="h6" component="h2" id="waiting-title">
                Waiting list
              </Typography>
              <Chip size="small" color={waiting.length ? "warning" : "default"} label={`${waiting.length} waiting`} />
            </Stack>
            {waiting.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                Nobody is waiting. Check patients in from the schedule as they arrive.
              </Typography>
            ) : (
              <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
                {waiting.map((a, i) => {
                  const p = mustPatient(a.patient);
                  const v = vetOf(a.vet);
                  const mins = Math.max(0, now - (arrivals[a.id] ?? now));
                  const long = mins >= LONG_WAIT;
                  return (
                    <Paper
                      key={a.id}
                      component="li"
                      variant="outlined"
                      sx={{ p: 1.5, borderColor: long ? "warning.main" : "divider", borderWidth: long ? 2 : 1 }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                        <Typography variant="h5" component="span" sx={{ minWidth: 24, color: "text.secondary" }} aria-label={`Position ${i + 1}`}>
                          {i + 1}
                        </Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Link component={NextLink} href={`/patients/${p.id}`} underline="hover" color="inherit" sx={{ fontWeight: 700, fontSize: 18 }}>
                            {p.name}
                          </Link>
                          <Typography variant="body2" color="text.secondary">
                            {ownerOf(p).name} · {a.reason}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {v.name} · {v.room} · booked {fmtClock(toMinutes(a.start))}
                          </Typography>
                          <Box sx={{ my: 0.75 }}>
                            <AlertChips alerts={p.alerts} />
                          </Box>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                            <Chip
                              size="small"
                              color={long ? "warning" : "default"}
                              variant={long ? "filled" : "outlined"}
                              icon={<AccessTime />}
                              label={`Waiting ${fmtDuration(mins)} (since ${fmtClock(arrivals[a.id] ?? now)})`}
                            />
                            <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={() => startExam(a)} aria-label={`Send ${p.name} to ${v.room}`}>
                              Send to exam
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }} sx={{ order: { xs: 1, lg: 0 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 1.5, alignItems: { sm: "center" }, justifyContent: "space-between" }}>
            <Typography variant="h6" component="h2">
              All appointments
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={filter}
              onChange={(_, v: string | null) => {
                if (v) setFilter(v);
              }}
              aria-label="Filter by vet"
              sx={{ "& .MuiToggleButton-root": { minHeight: 40, px: 2 } }}
            >
              <ToggleButton value="all">All vets</ToggleButton>
              {VETS.map((v) => (
                <ToggleButton key={v.id} value={v.id}>
                  {v.name.split(" ").slice(-1)[0]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
          <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0 }}>
            {visible.map((a) => (
              <ScheduleRow key={a.id} appt={a} onCheckIn={checkIn} onStartExam={startExam} />
            ))}
            {visible.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 3 }}>
                No appointments for this vet.
              </Typography>
            )}
          </Stack>
        </Grid>
      </Grid>

      {bookOpen && <BookingDialog open now={now} appointments={appts} onClose={() => setBookOpen(false)} onBook={book} />}

      <Snackbar
        open={toast !== null}
        autoHideDuration={6000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(null)} sx={{ width: "100%" }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function ScheduleRow({
  appt,
  onCheckIn,
  onStartExam,
}: {
  appt: Appointment;
  onCheckIn: (a: Appointment) => void;
  onStartExam: (a: Appointment) => void;
}) {
  const p = mustPatient(appt.patient);
  const v = vetOf(appt.vet);
  const start = toMinutes(appt.start);
  const cancelled = appt.status === "cancelled";
  const done = appt.status === "done";
  const urgent = Boolean(appt.urgent) && !cancelled && !done;
  return (
    <Paper
      component="li"
      variant="outlined"
      sx={{
        display: "grid",
        gap: { xs: 1, md: 2 },
        p: { xs: 1.5, md: 2 },
        alignItems: "center",
        gridTemplateColumns: { xs: "78px minmax(0,1fr)", md: "100px minmax(0,1fr) 150px 200px" },
        gridTemplateAreas: { xs: '"time main" "time meta" "action action"', md: '"time main meta action"' },
        opacity: cancelled ? 0.65 : done ? 0.85 : 1,
        borderLeft: urgent ? 6 : 1,
        borderLeftColor: urgent ? "error.main" : "divider",
        bgcolor: urgent ? errorTint(9) : "background.paper",
        ...(urgent ? { borderColor: "error.main" } : {}),
      }}
    >
      <Box sx={{ gridArea: "time" }}>
        <Typography fontWeight={700} sx={{ textDecoration: cancelled ? "line-through" : "none", fontVariantNumeric: "tabular-nums" }}>
          {fmtClock(start)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {appt.minutes} min
        </Typography>
      </Box>
      <Box sx={{ gridArea: "main", minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
          <Link component={NextLink} href={`/patients/${p.id}`} underline="hover" color="inherit" sx={{ fontWeight: 700, fontSize: 18 }}>
            {p.name}
          </Link>
          {urgent && <Chip size="small" color="error" icon={<PriorityHigh />} label="URGENT" sx={{ fontWeight: 800 }} />}
          <Typography variant="body2" color="text.secondary">
            {p.species} · {ownerOf(p).name}
          </Typography>
        </Stack>
        <Typography sx={{ textDecoration: cancelled ? "line-through" : "none" }}>{appt.reason}</Typography>
        {p.alerts.length > 0 && (
          <Box sx={{ mt: 0.75 }}>
            <AlertChips alerts={p.alerts} />
          </Box>
        )}
      </Box>
      <Box sx={{ gridArea: "meta" }}>
        <Typography variant="body2" fontWeight={600}>
          {v.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <MeetingRoomOutlined fontSize="inherit" /> {v.room}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ gridArea: "action", alignItems: "center", justifyContent: { xs: "space-between", md: "flex-end" }, flexWrap: "wrap", rowGap: 1 }}
      >
        <StatusChip status={appt.status} />
        {appt.status === "booked" && (
          <Button variant="contained" startIcon={<Login />} onClick={() => onCheckIn(appt)} aria-label={`Check in ${p.name}`} sx={{ minHeight: 44 }}>
            Check in
          </Button>
        )}
        {appt.status === "checked_in" && (
          <Button variant="outlined" startIcon={<PlayArrow />} onClick={() => onStartExam(appt)} aria-label={`Send ${p.name} to ${v.room}`} sx={{ minHeight: 44 }}>
            Send to exam
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
