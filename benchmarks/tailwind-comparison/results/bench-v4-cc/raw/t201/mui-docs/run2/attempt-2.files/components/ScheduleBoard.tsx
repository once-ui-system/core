"use client";

import * as React from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import LoginIcon from "@mui/icons-material/Login";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { AlertChips } from "@/components/AlertChips";
import { BookingDialog } from "@/components/BookingDialog";
import { StatusChip } from "@/components/StatusChip";
import { tint } from "@/components/ui";
import {
  CLOSE,
  NOW_START,
  TODAY,
  appointments as seed,
  fmtClock,
  fmtDate,
  fmtDuration,
  ownerById,
  patientById,
  toMinutes,
  vetById,
  vets,
  type Appointment,
  type Patient,
} from "@/lib/data";

const LONG_WAIT = 30;

function useClock(): number {
  const [now, setNow] = React.useState(NOW_START);
  React.useEffect(() => {
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setNow(Math.min(CLOSE, NOW_START + Math.floor((Date.now() - t0) / 60000)));
    }, 10000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

const isActive = (a: Appointment) => a.status !== "done" && a.status !== "cancelled";

function PatientName({ patient, size = "1.05rem" }: { patient: Patient; size?: string }) {
  return (
    <Link
      component={NextLink}
      href={`/patients/${patient.id}`}
      color="inherit"
      underline="hover"
      sx={{ fontWeight: 700, fontSize: size, display: "inline-block", py: 0.25 }}
    >
      {patient.name}
    </Link>
  );
}

function CheckInButton({ appt, onCheckIn }: { appt: Appointment; onCheckIn: (id: string) => void }) {
  const patient = patientById(appt.patient);
  return (
    <Button
      variant="contained"
      startIcon={<LoginIcon />}
      onClick={() => onCheckIn(appt.id)}
      aria-label={`Check in ${patient?.name ?? "patient"}, ${fmtClock(toMinutes(appt.start))} appointment`}
      sx={{ minHeight: 44, whiteSpace: "nowrap" }}
    >
      Check in
    </Button>
  );
}

function AppointmentRow({
  appt,
  now,
  onCheckIn,
}: {
  appt: Appointment;
  now: number;
  onCheckIn: (id: string) => void;
}) {
  const patient = patientById(appt.patient);
  if (!patient) return null;
  const owner = ownerById(patient.owner);
  const vet = vetById(appt.vet);
  const start = toMinutes(appt.start);
  const urgent = !!appt.urgent && isActive(appt);
  const muted = appt.status === "done" || appt.status === "cancelled";
  const waited = appt.checkedInAt !== undefined ? now - appt.checkedInAt : 0;

  return (
    <Paper
      component="li"
      variant="outlined"
      sx={{
        listStyle: "none",
        display: "grid",
        gap: { xs: 1, md: 2 },
        alignItems: "start",
        p: 1.75,
        pl: 2,
        borderLeft: 6,
        borderLeftColor: urgent ? "error.main" : appt.status === "in_exam" ? "primary.main" : appt.status === "checked_in" ? "info.main" : "divider",
        bgcolor: urgent ? tint("error", 9) : "background.paper",
        gridTemplateColumns: { xs: "1fr auto", md: "108px minmax(0, 1.3fr) minmax(0, 1.2fr) minmax(0, 0.9fr) 176px" },
        gridTemplateAreas: {
          xs: '"time status" "patient patient" "reason reason" "vet vet" "action action"',
          md: '"time patient reason vet status"',
        },
      }}
    >
      <Box sx={{ gridArea: "time" }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", textDecoration: appt.status === "cancelled" ? "line-through" : "none" }}>
          {fmtClock(start)}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {fmtDuration(appt.minutes)}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "patient", minWidth: 0 }}>
        <PatientName patient={patient} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {patient.species}, {patient.breed} · {owner.name}
        </Typography>
        <Box sx={{ mt: patient.alerts.length ? 0.75 : 0 }}>
          <AlertChips alerts={patient.alerts} />
        </Box>
      </Box>

      <Box sx={{ gridArea: "reason", minWidth: 0 }}>
        {urgent && (
          <Chip
            color="error"
            size="small"
            icon={<PriorityHighIcon />}
            label="URGENT"
            sx={{ fontWeight: 800, letterSpacing: "0.04em", mb: 0.5 }}
          />
        )}
        <Typography sx={{ color: muted ? "text.secondary" : "text.primary", fontWeight: urgent ? 700 : 500 }}>
          {appt.reason}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "vet", minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {vet.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}>
          <MeetingRoomIcon sx={{ fontSize: 16 }} aria-hidden /> {vet.room}
        </Typography>
      </Box>

      <Stack sx={{ gridArea: "status", alignItems: { xs: "flex-end", md: "flex-start" } }} spacing={0.75}>
        <StatusChip status={appt.status} />
        {appt.status === "checked_in" && (
          <Typography variant="body2" sx={{ fontWeight: 700, color: waited >= LONG_WAIT ? "warning.main" : "text.primary" }}>
            Waiting {fmtDuration(Math.max(0, waited))}
          </Typography>
        )}
      </Stack>

      {appt.status === "booked" && (
        <Box sx={{ gridArea: { xs: "action", md: "status" }, alignSelf: { md: "end" }, mt: { md: 5.5 } }}>
          <CheckInButton appt={appt} onCheckIn={onCheckIn} />
        </Box>
      )}
    </Paper>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: string; tone?: "warning" | "error" }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75 }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.15, color: tone ? `${tone}.main` : "text.primary" }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

function WaitingPanel({ list, now, onCheckIn, upcoming }: { list: Appointment[]; now: number; onCheckIn: (id: string) => void; upcoming: Appointment[] }) {
  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" component="section" aria-labelledby="waiting-title" sx={{ p: 2 }}>
        <Stack direction="row" sx={{ mb: 1.5, alignItems: "center", justifyContent: "space-between" }}>
          <Typography id="waiting-title" variant="h6" component="h2" sx={{ fontWeight: 800 }}>
            Waiting room
          </Typography>
          <Chip label={`${list.length} waiting`} color={list.length ? "info" : "default"} size="small" sx={{ fontWeight: 700 }} />
        </Stack>
        {list.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>Nobody is waiting. Checked-in patients appear here.</Typography>
        ) : (
          <Stack component="ol" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }} aria-live="polite">
            {list.map((a, i) => {
              const p = patientById(a.patient);
              if (!p) return null;
              const vet = vetById(a.vet);
              const waited = Math.max(0, now - (a.checkedInAt ?? now));
              const long = waited >= LONG_WAIT;
              return (
                <Box
                  component="li"
                  key={a.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "28px minmax(0, 1fr) auto",
                    columnGap: 1.25,
                    alignItems: "start",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: a.urgent ? tint("error", 10) : tint("info", 8),
                  }}
                >
                  <Typography aria-label={`Number ${i + 1} in line`} sx={{ fontWeight: 800, color: "text.secondary" }}>
                    {i + 1}
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                      <PatientName patient={p} />
                      {a.urgent && <Chip size="small" color="error" label="URGENT" sx={{ fontWeight: 800 }} />}
                    </Stack>
                    <Typography variant="body2">{a.reason}</Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {vet.name} · {vet.room}
                    </Typography>
                    <Box sx={{ mt: p.alerts.length ? 0.75 : 0 }}>
                      <AlertChips alerts={p.alerts} />
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.1, color: long ? "warning.main" : "text.primary" }}>
                      {fmtDuration(waited)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      since {fmtClock(a.checkedInAt ?? now)}
                    </Typography>
                    {long && (
                      <Typography variant="caption" sx={{ display: "block", fontWeight: 700, color: "warning.main" }}>
                        Long wait
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" component="section" aria-labelledby="next-title" sx={{ p: 2 }}>
        <Typography id="next-title" variant="h6" component="h2" sx={{ fontWeight: 800, mb: 1.5 }}>
          Arriving next
        </Typography>
        {upcoming.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>No more booked patients today.</Typography>
        ) : (
          <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {upcoming.map((a) => {
              const p = patientById(a.patient);
              if (!p) return null;
              return (
                <Box component="li" key={a.id} sx={{ display: "flex", gap: 1.5, alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {fmtClock(toMinutes(a.start))} · {vetById(a.vet).name}
                    </Typography>
                    <PatientName patient={p} size="1rem" />
                    {a.urgent && (
                      <Chip size="small" color="error" label="URGENT" sx={{ fontWeight: 800, ml: 1 }} />
                    )}
                    <Box sx={{ mt: p.alerts.length ? 0.5 : 0 }}>
                      <AlertChips alerts={p.alerts} />
                    </Box>
                  </Box>
                  <CheckInButton appt={a} onCheckIn={onCheckIn} />
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

export function ScheduleBoard() {
  const now = useClock();
  const [list, setList] = React.useState<Appointment[]>(seed);
  const [vetFilter, setVetFilter] = React.useState<string>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [snack, setSnack] = React.useState<{ message: string; undoId?: string } | null>(null);

  const checkIn = (id: string) => {
    const appt = list.find((a) => a.id === id);
    if (!appt) return;
    setList((cur) => cur.map((a) => (a.id === id ? { ...a, status: "checked_in", checkedInAt: now } : a)));
    setSnack({ message: `${patientById(appt.patient)?.name} checked in and added to the waiting room.`, undoId: id });
  };

  const undoCheckIn = (id: string) => {
    setList((cur) => cur.map((a) => (a.id === id ? { ...a, status: "booked", checkedInAt: undefined } : a)));
    setSnack(null);
  };

  const book = (b: { patient: string; vet: string; start: number; minutes: number; reason: string; urgent: boolean }) => {
    const id = `a-${String(list.length + 1).padStart(2, "0")}`;
    const h = Math.floor(b.start / 60);
    const m = b.start % 60;
    const appt: Appointment = {
      id,
      patient: b.patient,
      vet: b.vet,
      start: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      minutes: b.minutes,
      reason: b.reason,
      status: "booked",
      urgent: b.urgent || undefined,
    };
    setList((cur) => [...cur, appt]);
    setDialogOpen(false);
    setSnack({ message: `Booked ${patientById(b.patient)?.name} with ${vetById(b.vet).name} at ${fmtClock(b.start)}.` });
  };

  const sorted = React.useMemo(
    () => [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.vet.localeCompare(b.vet)),
    [list],
  );
  const visible = vetFilter === "all" ? sorted : sorted.filter((a) => a.vet === vetFilter);
  const waiting = list.filter((a) => a.status === "checked_in").sort((a, b) => (a.checkedInAt ?? 0) - (b.checkedInAt ?? 0));
  const upcoming = sorted.filter((a) => a.status === "booked").slice(0, 4);
  const count = (s: Appointment["status"]) => list.filter((a) => a.status === s).length;
  const longest = waiting.length ? Math.max(...waiting.map((a) => now - (a.checkedInAt ?? now))) : 0;
  const urgentCount = list.filter((a) => a.urgent && isActive(a)).length;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "flex-end" } }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Today&apos;s schedule
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {fmtDate(TODAY, "long")} · {fmtClock(now)} now · {list.filter((a) => a.status !== "cancelled").length} appointments across {vets.length} vets
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ minHeight: 48 }}>
          Book appointment
        </Button>
      </Stack>

      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        <Stat label="Waiting" value={waiting.length} hint={waiting.length ? `Longest ${fmtDuration(longest)}` : "Room is clear"} tone={longest >= LONG_WAIT ? "warning" : undefined} />
        <Stat label="In exam" value={count("in_exam")} hint="With a vet now" />
        <Stat label="Still to arrive" value={count("booked")} hint={urgentCount ? `${urgentCount} urgent` : "No urgent visits"} tone={urgentCount ? "error" : undefined} />
        <Stat label="Done today" value={count("done")} hint={`${count("cancelled")} cancelled`} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          alignItems: "start",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" },
        }}
      >
        <Box sx={{ order: { lg: 2 }, position: { lg: "sticky" }, top: { lg: 88 } }}>
          <WaitingPanel list={waiting} upcoming={upcoming} now={now} onCheckIn={checkIn} />
        </Box>

        <Box sx={{ order: { lg: 1 }, minWidth: 0 }} component="section" aria-labelledby="sched-title">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ mb: 1.5, justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}
          >
            <Typography id="sched-title" variant="h6" component="h2" sx={{ fontWeight: 800 }}>
              All appointments
            </Typography>
            <Box sx={{ overflowX: "auto", pb: 0.5 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={vetFilter}
                onChange={(_e, v: string | null) => v && setVetFilter(v)}
                aria-label="Filter by vet"
                color="primary"
              >
                <ToggleButton value="all" sx={{ minHeight: 44, px: 2, textTransform: "none" }}>
                  All vets
                </ToggleButton>
                {vets.map((v) => (
                  <ToggleButton key={v.id} value={v.id} sx={{ minHeight: 44, px: 2, textTransform: "none", whiteSpace: "nowrap" }}>
                    {v.name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>

          <Box
            aria-hidden
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "108px minmax(0, 1.3fr) minmax(0, 1.2fr) minmax(0, 0.9fr) 176px",
              gap: 2,
              px: 2.75,
              pb: 0.75,
              color: "text.secondary",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>Time</span>
            <span>Patient and owner</span>
            <span>Reason</span>
            <span>Vet and room</span>
            <span>Status</span>
          </Box>

          <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {visible.map((a) => (
              <AppointmentRow key={a.id} appt={a} now={now} onCheckIn={checkIn} />
            ))}
          </Stack>
          {visible.length === 0 && <Typography sx={{ color: "text.secondary" }}>No appointments for this vet today.</Typography>}
        </Box>
      </Box>

      <BookingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} appointments={list} now={now} onBook={book} />

      <Snackbar
        open={snack !== null}
        autoHideDuration={6000}
        onClose={(_e, reason) => {
          if (reason !== "clickaway") setSnack(null);
        }}
        message={snack?.message}
        action={
          snack?.undoId ? (
            <Button color="inherit" size="small" onClick={() => undoCheckIn(snack.undoId as string)}>
              Undo
            </Button>
          ) : undefined
        }
      />
    </Stack>
  );
}
